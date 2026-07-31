# Architettura informativa

## Spazi principali

La beta espone cinque spazi orientati al lavoro:

1. **Presidio** — stato del monitoraggio, differenze e review;
2. **Quadro** — fonti e osservazioni del perimetro normativo;
3. **Copertura** — collegamenti astratti tra obblighi e famiglie di controllo;
4. **Eventi** — segnalazioni, quasi incidenti e incidenti con owner e RACI;
5. **Fonti** — contributi manuali e scouting schedulato.

## Profondità progressiva

Ogni oggetto viene presentato su tre livelli:

- livello 1: etichetta, statement, stato, owner o prossima azione e tempo;
- livello 2: produttore, input, limiti, decisioni disponibili e receipt;
- livello 3: JSON, hash, identificativi e log tecnici.

## Regola di composizione

La UI renderizza soltanto `OutcomeEnvelope`. Ricerca, card, drill-down, tracce ASCII e assistente consumano la stessa proiezione runtime. Un controllo privo di endpoint, query o transizione dichiarata nel wiring manifest non deve apparire nell'interfaccia.
