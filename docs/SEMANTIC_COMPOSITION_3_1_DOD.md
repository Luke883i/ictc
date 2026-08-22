# Semantic Composition 3.1 — DoD

## Obiettivo

Portare ICTC da una UI corretta ma esplicativa a una UI **task-first, business-compliance-first e cognitivamente parsimoniosa**. La slice non cambia le business write authority: cambia cosa merita spazio, in quale ordine, con quale linguaggio e con quale progressive disclosure.

## Coverage

La compressione è obbligatoria su **tutte le superfici**: Home, Processi di Compliance, RN-01, EC-01, AO-01, MC-01, AP-01, RC-01, AR-01, Evidenze ICTC, EP-01, Admin, Configurazione AI e dialoghi. Primitive e invarianti sono comuni; gli adapter restano specifici alla natura della superficie.

## DoD globali

1. Home non contiene dashboard numeriche autonome: mostra lavoro che richiede intervento.
2. Ogni landing ha una sola identità canonica e al massimo una frase iniziale di sostanza.
3. Il lavoro operativo inizia nel primo viewport desktop; spiegazioni tecniche/metodologiche non lo precedono.
4. Ogni testo iniziale descrive almeno un oggetto, un'azione, una decisione, una condizione, un effetto o un'evidenza.
5. Fonte, obbligo, requisito, perimetro, applicabilità, mapping, controllo, evidenza, rischio, azione e decisione restano distinti.
6. Le metriche sono secondarie salvo quando modificano attenzione o decisione.
7. Comparable records usano liste/righe prima di card wall.
8. Boundary, metodo, trace, hash, raw, producer, digest e dettagli tecnici sono progressivi di default.
9. Un solo information-composition owner; primitive strutturali e bridge storici non riscrivono copy business.
10. C0.1 resta finalizzatore costituzionale e decision-presentation resta esclusiva.
11. Tutte le superfici sono coperte da gate statici e browser; 320/390 px non introducono overflow orizzontale.
12. Il sistema documentale espone un percorso canonico prodotto → authority → architettura → epistemica → UI → test/release.

## DoD locali

- **Home**: `Attività di compliance`; massimo 5 righe di attenzione; niente `homePulse` visibile; severity prima del volume.
- **Processi**: sette righe compatte; codice, nome, sostanza e azione; nessun KPI wall o mini-manuale.
- **Procedure**: header compatto + CTA; lista di lavoro prima di decision context, KPI, matrice o trace.
- **Evidenze**: decisioni/evidenze prima; sintesi tecnica e metodo in disclosure.
- **EP-01**: relazioni e ricerca prima; summary tecnico/compressione numerica non visibili di default.
- **Admin**: azioni richieste prima; metriche e controlli tecnici secondari/progressivi.
- **Dialoghi**: un solo paragrafo introduttivo visibile; opzioni avanzate/tecniche chiuse.

## Metriche

- Operational Reach: 100% delle landing business.
- Narrative Before Work: <=2 frasi.
- Redundancy Ratio: <5% nel livello iniziale.
- Technical Leakage: 0 token tecnici non necessari nel livello iniziale.
- Abstract Copy Rate: 0 nelle intestazioni/purpose correnti.
- Decision Distance: <=1 interazione per lavoro già esistente.
- Canonical Vocabulary Coverage: 100% dei concetti principali.
- Identity Consistency: 100% col registry canonico.
- Mutation Kill Rate: 100% sulle famiglie dichiarate.
- Holdout: 0 nuove famiglie nelle ultime 100.000 mutazioni di ogni campagna.

## Campagne di falsificazione

`v3/semantic-composition-3-1-saturation.mjs` esegue quattro campagne deterministiche da 10.000.000 trial ciascuna: tecnica, semantica, UI/UX-gerarchia e documentazione. Totale: **40.000.000** mutazioni modellate. Ogni campagna usa un holdout finale di 100.000 trial.

Famiglie tecniche: owner duplicati, rewrite post-finalizer, ordine instabile, lavoro sotto fold, selector drift, dialog overflow, write leak per ruolo, deep-link identity drift, reinserimento async di rumore, scroll owner multipli.

Famiglie semantiche: copy astratto, fonte=obbligo, scope=applicabilità, mapping=conformità, completato=chiuso, rating=probabilità, approvazione interna=assurance, proposta AI=decisione, valore marketing-only.

Famiglie UI/UX: dashboard numerica Home, lavoro sotto fold, identità/intros/CTA multiple, technical default open, narrative wall, card wall, boundary ripetuti, empty state non azionabile, metriche senza decisione, mobile clipping.

Famiglie documentali: start path mancante, authority duplicate, storico promosso a current, owner/test/release/DoD/architecture non collegati, generated artifact hand-edited, naming non classificato.

Evidenza locale deterministica della campagna raffinata:

```json
{"ok":true,"profile":"semantic-composition-3.1","totalTrials":40000000,"totalMutations":40000000,"totalKilled":40000000,"killRate":1,"holdoutPerCampaign":100000,"newHoldoutFamilies":0,"signature":1058086099}
```

## Limiti dell'evidenza

La saturation è falsificazione deterministica del vocabolario dichiarato. Non è studio con utenti, parere legale, certificazione di accessibilità, assurance indipendente o prova di sicurezza del deployment. Browser journeys ed exact-head CI restano gate separati.
