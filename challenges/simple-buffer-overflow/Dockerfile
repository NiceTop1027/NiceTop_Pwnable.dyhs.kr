FROM ubuntu:22.04

RUN apt-get update && apt-get install -y \
    gcc \
    build-essential \
    socat \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY private/challenge.c challenge.c
COPY private/Makefile Makefile
COPY deploy/flag flag.txt

RUN make && chmod 755 challenge

EXPOSE 9999

CMD socat TCP-LISTEN:9999,reuseaddr,fork EXEC:/app/challenge,stderr,pty,setsid,sigint,sane