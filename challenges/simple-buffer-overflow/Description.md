# Simple Buffer Overflow

## 개념

이 문제는 클래식한 스택 버퍼 오버플로우(Stack Buffer Overflow) 취약점을 학습하기 위한 기초 문제입니다. 프로그램은 사용자 입력을 안전하지 않은 방식으로 처리하며, 특정 함수를 호출하면 플래그를 얻을 수 있습니다.

## 목표

1. 바이너리를 분석하여 `win()` 함수의 주소를 찾습니다.
2. 버퍼 오버플로우를 이용하여 복귀 주소를 `win()` 함수의 주소로 덮어씁니다.
3. 프로그램이 `win()` 함수를 실행하도록 하여 플래그를 출력하게 합니다.

## 환경

```
Arch:     amd64-64-little
RELRO:    Partial RELRO
Stack:    No canary found
NX:       NX enabled
PIE:      No PIE (0x400000)
```

## 문제 파일

아래 **문제 파일**에서 `challenge.c`와 `Makefile`을 내려받아 로컬에서 빌드·분석할 수 있습니다. 원격 풀이는 **인스턴스 시작**으로 접속하세요.

```bash
make
./challenge
```

## 힌트

- `vuln()` 함수의 지역 버퍼 크기와 `win()` 주소를 먼저 확인해 보세요.
- x86-64에서는 스택 정렬 때문에 페이로드 앞에 패딩이 필요할 수 있습니다.