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


## C2 — delivery provenance

La pipeline canonica parte dall'**exact candidate** checkout e produce, nello stesso job, archivio candidato, **CycloneDX** SBOM, manifest di provenance e digest degli input/output.

La firma/attestazione usa **GitHub OIDC** e **Sigstore** in modalità keyless tramite action pin immutabili. Il workflow crea sia build provenance sia SBOM attestation e deve completare `gh attestation verify --repo` prima di emettere il receipt C2.

Il subject firmato è l'archivio `git archive` dell'esatto SHA candidato; `package.json`, `package-lock.json`, tree SHA, archivio, SBOM e provenance manifest sono digest-bound nel receipt.

**merge non equivale a release**: merge, release/deployment, review indipendente, Enterprise Candidate ed Enterprise Ready restano transizioni distinte. La PR #216 ha mantenuto F-06/C2 `in-remediation` sul candidate; dopo exact-head CI, merge, verifica post-merge e POST-216 ACT, F-06/C2 è repository-terminal E2. Questa terminalità non modifica i rail E3/E4.
