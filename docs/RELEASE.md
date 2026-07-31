# Processo di release

## Precondizioni

```bash
npm ci
npm test
npm run visual
npm run git:handshake
npm run release:manifest
```

## Versionamento

Usare Semantic Versioning:

- major: modifica incompatibile di schema, API o significato epistemico;
- minor: capability retrocompatibile;
- patch: correzione retrocompatibile.

Le versioni beta mantengono il suffisso prerelease.

## Checklist

- aggiornare `CHANGELOG.md`;
- aggiornare versione in `package.json` e lockfile;
- verificare OpenAPI e JSON Schema;
- verificare migrazioni o compatibilità dati;
- generare manifest SHA-256;
- creare tag firmato quando l'infrastruttura lo consente;
- allegare note con limiti e rollback.

## Deployment futuro

La release enterprise dovrà usare artifact immutabile, staging, smoke test, approvazione, canary o blue/green e receipt di deployment.
