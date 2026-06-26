import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { join, normalize, relative, resolve } from 'path';
import { ChallengeCategory, Difficulty } from '@prisma/client';

const SPECFILE_NAMES = ['Specfile', 'specfile'];
const LEGACY_SPEC_NAMES = ['challenge.toml', 'Challenge.toml', 'spec.toml'];

const TAG_MAP: Record<string, ChallengeCategory> = {
  pwn: 'PWN',
  pwnable: 'PWN',
  rev: 'REV',
  reversing: 'REV',
  web: 'WEB',
  crypto: 'CRYPTO',
  forensic: 'FORENSIC',
  forensics: 'FORENSIC',
  misc: 'MISC',
  osint: 'OSINT',
  cloud: 'MISC',
};

const DIFFICULTY_MAP: Record<string, Difficulty> = {
  easy: 'EASY',
  medium: 'MEDIUM',
  hard: 'HARD',
  insane: 'INSANE',
};

export type RepositorySpec = {
  title?: string;
  flag?: string;
  category?: ChallengeCategory;
  difficulty?: Difficulty;
  points?: number;
  vmEnabled: boolean;
  containerPort?: number;
  memoryMb?: number;
  diskMb?: number;
};

function parseIniSections(content: string): Map<string, Record<string, string>> {
  const sections = new Map<string, Record<string, string>>();
  let current = '';

  for (const rawLine of content.split('\n')) {
    const line = rawLine.trim();
    const sectionMatch = line.match(/^\[([^\]]+)\]$/);
    if (sectionMatch) {
      current = sectionMatch[1].toLowerCase();
      if (!sections.has(current)) sections.set(current, {});
      continue;
    }

    if (!current || !line || line.startsWith('#') || line.startsWith(';')) continue;

    const eq = line.indexOf('=');
    if (eq === -1) continue;

    const key = line.slice(0, eq).trim().toLowerCase();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    sections.get(current)![key] = value;
  }

  return sections;
}

function parsePorts(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const first = value.split(',')[0]?.trim();
  const match = first?.match(/^(\d+)\s*\/\s*tcp$/i) ?? first?.match(/^(\d+)$/);
  if (!match) return undefined;
  const port = Number.parseInt(match[1], 10);
  return port > 0 && port < 65536 ? port : undefined;
}

function resolveCategory(
  wargame: Record<string, string>,
): ChallengeCategory | undefined {
  const raw = wargame.tags ?? wargame.category ?? wargame.tag ?? '';
  const key = raw.split(/[,\s]+/).find(Boolean)?.toLowerCase();
  return key ? TAG_MAP[key] : undefined;
}

export function parseRepositorySpec(content: string): RepositorySpec {
  const sections = parseIniSections(content);
  const wargame = sections.get('wargame') ?? {};
  const vm = sections.get('vm') ?? {};

  const spec: RepositorySpec = { vmEnabled: false };

  if (wargame.title) spec.title = wargame.title;
  if (wargame.flag) spec.flag = wargame.flag;

  const category = resolveCategory(wargame);
  if (category) spec.category = category;

  const difficultyKey = (wargame.difficulty ?? '').toLowerCase();
  if (difficultyKey && DIFFICULTY_MAP[difficultyKey]) {
    spec.difficulty = DIFFICULTY_MAP[difficultyKey];
  }

  if (wargame.points) {
    const points = Number.parseInt(wargame.points, 10);
    if (Number.isFinite(points) && points > 0) spec.points = points;
  }

  const containerPort = parsePorts(vm.ports);
  if (containerPort) {
    spec.containerPort = containerPort;
    spec.vmEnabled = true;
  }

  if (vm.enabled) {
    const enabled = ['true', '1', 'yes', 'on'].includes(vm.enabled.toLowerCase());
    spec.vmEnabled = enabled;
    if (!enabled) spec.containerPort = undefined;
  }

  if (vm.memory) {
    const memory = Number.parseInt(vm.memory, 10);
    if (Number.isFinite(memory)) spec.memoryMb = memory;
  }
  if (vm.disk) {
    const disk = Number.parseInt(vm.disk, 10);
    if (Number.isFinite(disk)) spec.diskMb = disk;
  }

  if (sections.has('vm') && vm.enabled === undefined && containerPort) {
    spec.vmEnabled = true;
  }

  return spec;
}

function readSpecContent(dir: string): string | null {
  for (const name of [...SPECFILE_NAMES, ...LEGACY_SPEC_NAMES]) {
    const path = join(dir, name);
    if (existsSync(path)) return readFileSync(path, 'utf8');
  }
  return null;
}

export function readRepositorySpec(dir: string): RepositorySpec | null {
  const content = readSpecContent(dir);
  if (!content) return null;
  return parseRepositorySpec(content);
}

export function readDescriptionMd(dir: string): string | null {
  const path = join(dir, 'Description.md');
  if (!existsSync(path)) return null;
  return readFileSync(path, 'utf8').trim() || null;
}

export function validateRepository(dir: string): string[] {
  const errors: string[] = [];
  const spec = readRepositorySpec(dir);

  if (!readSpecContent(dir)) {
    errors.push('Specfile이 없습니다.');
  } else {
    if (!spec?.title) errors.push('Specfile [wargame] title이 필요합니다.');
    if (!spec?.flag) errors.push('Specfile [wargame] flag가 필요합니다.');
    if (!spec?.category) errors.push('Specfile [wargame] tags가 필요합니다.');
  }

  if (!readDescriptionMd(dir)) {
    errors.push('Description.md가 필요합니다.');
  }

  const publicDir = join(dir, 'public');
  if (!existsSync(publicDir)) {
    errors.push('public/ 폴더가 필요합니다.');
  }

  if (spec?.vmEnabled && !existsSync(join(dir, 'Dockerfile'))) {
    errors.push('원격 인스턴스 문제는 Dockerfile이 필요합니다.');
  }

  return errors;
}

export function listPublicFiles(
  dir: string,
): Array<{ path: string; size: number }> {
  const publicDir = join(dir, 'public');
  if (!existsSync(publicDir)) return [];

  const files: Array<{ path: string; size: number }> = [];

  const walk = (base: string, prefix = '') => {
    for (const entry of readdirSync(base, { withFileTypes: true })) {
      if (entry.name.startsWith('.')) continue;
      const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
      const full = join(base, entry.name);
      if (entry.isDirectory()) {
        walk(full, rel);
      } else {
        files.push({ path: rel, size: statSync(full).size });
      }
    }
  };

  walk(publicDir);
  return files.sort((a, b) => a.path.localeCompare(b.path));
}

export function resolvePublicFilePath(
  dir: string,
  relativePath: string,
): string | null {
  const publicDir = resolve(dir, 'public');
  const target = resolve(publicDir, normalize(relativePath));
  if (!target.startsWith(publicDir + '/') && target !== publicDir) return null;
  if (!existsSync(target)) return null;
  return target;
}