"use client";

const items = [
  "PWNABLE",
  "BUFFER OVERFLOW",
  "ROP",
  "SHELLCODE",
  "HEAP EXPLOITATION",
  "KERNEL PWN",
  "CTF",
  "REVERSE ENGINEERING",
  "CRYPTO",
  "FORENSICS",
];

export function MarqueeSection() {
  return (
    <section className="overflow-hidden border-y border-white/5 bg-slate-950 py-6">
      <div className="marquee-track flex gap-12">
        {[...items, ...items].map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="shrink-0 font-mono text-sm tracking-[0.2em] text-slate-600"
          >
            {item}
            <span className="mx-12 text-cyan-500/40">◆</span>
          </span>
        ))}
      </div>
    </section>
  );
}