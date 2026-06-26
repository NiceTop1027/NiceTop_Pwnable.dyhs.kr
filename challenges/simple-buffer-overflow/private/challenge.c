#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>

void win(void) {
    char flag[128];
    FILE *f = fopen("flag.txt", "r");
    if (!f) {
        puts("[win] flag file not found");
        return;
    }
    if (fgets(flag, sizeof(flag), f)) {
        printf("FLAG: %s", flag);
    }
    fclose(f);
}

void vuln(void) {
    char buf[64];
    puts("Welcome to Simple Overflow!");
    printf("Tell me your name: ");
    fflush(stdout);
    read(0, buf, 0x200);
    printf("Nice to meet you, %s\n", buf);
}

int main(void) {
    setvbuf(stdout, NULL, _IONBF, 0);
    setvbuf(stdin, NULL, _IONBF, 0);
    vuln();
    puts("Goodbye!");
    return 0;
}