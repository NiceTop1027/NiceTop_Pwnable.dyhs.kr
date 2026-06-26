CC=gcc
CFLAGS=-g -O0 -fno-stack-protector -no-pie

all: challenge

challenge: challenge.c
	$(CC) $(CFLAGS) -o challenge challenge.c

clean:
	rm -f challenge