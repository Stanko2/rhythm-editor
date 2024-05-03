# AlgoRYTMUS

## Návod na spustenie

Server funguje iba na Linuxe, resp. cez WSL 

1. Nainštalujem potrebné veci na spustenie:
    - [Bun](https://bun.sh)
    - [Redis](https://redis.io/docs/latest/operate/oss_and_stack/install/install-redis/)
      - Možno bude potrebné redis manuálne spustiť: `systemctl start redis`
      
2. Nainštalujem potrebné knižnice

```bash
bun install
```

3. Načítam si userov z `users.json`

```bash
bun run index.ts loadUsers
```

4. Spustím server

```bash
bun run index.ts
```

Ak všetko fungovalo uvidím editor na http://localhost:3000