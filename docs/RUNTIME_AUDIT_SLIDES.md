# ICTC Runtime Audit — slide source

## 1. Intenzionalità

Verificare che i due soli processi ICTC siano completi, minimali, recuperabili e probatori. Ogni elemento deve rendere distinguibili originale, proposta AI, adozione o decisione umana e prova emessa.

## 2. Fonte autorevole

AS-IS: `main` dopo il merge della PR #12. Le modifiche descritte ma non contenute nel merge non sono assunte come stato del prodotto.

## 3. Perimetro

- Monitoraggio di fonti normative e para-normative.
- Gestione amministrativa di eventi, quasi incidenti e incidenti.
- Ruoli: `admin` e `user`.
- AI assistiva e pervasiva, mai autorità autonoma.

## 4. Lezioni dalle PR precedenti

Conservare: provenance, receipt, anti-equivalenze, una sola prossima azione, accessibilità. Scartare come ontologia primaria: Atlante, Projection Stack, persone multiple, grafi e dashboard cumulative.

## 5. Benchmark

UX media: feed, profili, filtri, alert, task e detail panel. UX emergente: Copilot, agenti e next-best-action. Invariante assorbita: agenti e suggerimenti devono essere identity-bound, scope-constrained, role-masked, audit-emitting e human-supervised.

## 6. Modello onto-epistemico

`originale → osservazione/estrazione → proposta AI → adozione o correzione → decisione → receipt → fascicolo`.

Anti-equivalenze: fonte trovata ≠ applicabile; proposta AI ≠ dato umano; hash ≠ verità; chiusura ≠ assenza di rischio.

## 7. Audit PR #13

Punti solidi: raw-before-AI, retry, versioni, motivazioni, privacy della proiezione, job CI separati. Blocker trovati: fascicolo catalogo, digest facoltativo, cleanup allegati, identità fonte fragile e tail N+50 debole.

## 8. TO-BE monitoraggio

Obiettivo preservato → piano AI versionato → revisione → attivazione → run → osservazioni append-only → decisione motivata legata al digest dell'osservazione → fascicolo.

## 9. TO-BE segnalazione

Racconto preservato → AI Lens → domanda motivata → adozione/correzione → formulazione versionata → conferma obbligatoria del digest → invio → chiusura motivata → fascicolo.

## 10. Saturazione astratta

M viene scelto online dopo una finestra senza novità; le primitive vengono congelate a M; i 100 casi successivi sono valutati solo contro lo snapshot congelato. La conclusione è bounded alle dimensioni simulate.

## 11. Saturazione runtime

N deve emergere da esiti HTTP reali. Il tail N+50 deve ripetere classi operative indipendenti: letture, scritture, errori, retry, replay, conflitti, privacy ed evidence. Un tail di sole letture non prova la journey operativa.

## 12. CI/CD

Workflow indipendenti per contratto/audit, runtime E2E, browser, launcher e sicurezza. Prova post-merge separata su `main`. Un job rosso blocca la dichiarazione di readiness.

## 13. Rischi residui

Identità locale non è autenticazione di produzione; hash locale non è firma qualificata; manca validazione con utenti reali; malware scanning, OIDC/RBAC e non ripudio restano fuori scope.

## 14. Decisione di merge

NO-GO finché: blocker corretti, test negativi presenti, tail N+50 operativo, deck e protocollo utente consegnati, tutti i workflow verdi sul nuovo HEAD.

Il deck PPTX renderizzato e validato accompagna questa sorgente come deliverable della sessione di audit.
