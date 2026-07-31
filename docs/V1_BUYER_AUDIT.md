# ICTC v1 — audit da potenziale acquirente

## Sintesi

ICTC v1 è acquistabile come **motore locale di decision evidence e audit trail epistemico**, non come suite GRC enterprise completa. Il suo vantaggio competitivo è la disciplina con cui separa dato osservato, proposta, review, decisione e prova di persistenza.

## C-level

### Cosa vede

- decisioni che richiedono attenzione;
- conseguenza locale e prossima azione;
- catena verificabile della decisione;
- limiti espliciti, senza punteggio sintetico di conformità.

### Valore differenziale

Riduce il costo di ricostruire “chi ha deciso cosa, su quali input e con quale evidenza”. Il valore non è una promessa di conformità, ma un tempo inferiore per orientamento, review e audit.

### Resistenza

“È un'altra dashboard.”

### Mitigazione

Le metriche v1 misurano journey completate, receipt con readback, integrità dopo restart e tempo di readiness. Il ROI commerciale resta da misurare con processi e utenti reali.

## Auditor

### Cosa vede

- OutcomeEnvelope con produttore, input e limiti;
- ActionFrame e DecisionCheckpoint;
- ledger sanitizzato;
- receipt e hash-chain;
- scope ed esclusioni della release.

### Valore differenziale

La UI rende visibile la differenza tra integrità tecnica e verità sostanziale. Una receipt prova una registrazione locale, non completezza, applicabilità o conformità.

### Resistenza

“La hash-chain potrebbe essere sovrainterpretata come prova di correttezza o completezza.”

### Mitigazione

Il contratto epistemico, le anti-equivalenze e `/api/release` mantengono separati i claim. Lo scouting reale e la governance del perimetro restano fuori scope.

## CTO

### Cosa vede

- runtime Node.js 22 senza dipendenze esterne;
- launcher, Codespaces e rollback v2;
- safe-bind fail-closed;
- upload binari disabilitati;
- readiness machine-readable;
- test di restart e SOT isolata.

### Valore differenziale

La vertical slice è piccola, ispezionabile e portabile. Le regole di dominio sono deterministiche e l'AI non possiede write authority.

### Resistenza

“Il prototipo locale può diventare shadow IT o essere esposto come servizio enterprise.”

### Mitigazione

Il bind non-loopback fallisce senza riconoscimento esplicito; gli upload binari falliscono senza override; la release dichiara `stable-local-single-user` e mantiene aperti i gap enterprise.

## Rischi residui

1. Identità e autorizzazione forti assenti.
2. Scansione malware e quarantena assenti.
3. Scouting istituzionale e scheduler reali assenti.
4. Dati e ledger locali senza HA, backup governato o multi-tenancy.
5. Chiarezza validata da simulatori e controlli, non ancora da una ricerca utenti sufficiente.

## Decisione di acquisto suggerita

- **Sì** per pilot locale, design partnership, audit trail dimostrativo e valutazione del modello epistemico.
- **No, non ancora** per produzione multiutente, dati non fidati, monitoraggio normativo autonomo o attestazioni di conformità.
