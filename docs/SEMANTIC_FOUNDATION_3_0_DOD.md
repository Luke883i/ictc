# Semantic Foundation 3.0 — DoD e reticolo di stabilizzazione

Status: PR candidate
Date: 2026-08-21
Base: `main@1a6e66dca221470f6fe970750459d0172c0521d4`

## Obiettivo

Convergere i due round di audit UI/UX e semantico in una fondazione lessicale e d'azione condivisa, senza introdurre un nuovo processo business, una nuova write authority o un motore di verità alternativo. La slice rende espliciti il glossario di compliance, il significato delle azioni umane materiali, le dimensioni di rilevanza e la separazione fra norma, obbligo, applicabilità, mapping, controllo, evidenza e conclusione.

La baseline consolidata è: 528 finding visuali + 378 finding derivati dal codice = 906 finding, compressi in 21 famiglie di invarianti e 25 nodi di rifattorizzazione. Questo censimento è una closure del vocabolario audit dichiarato, non una prova che non possano emergere nuove famiglie.

## DoD globale

- G1 — esistono esattamente sette Processi di Compliance business; EP-01 resta cross-cutting.
- G2 — nessuna nuova write authority, API decisionale o checkpoint business viene introdotto dalla slice.
- G3 — un glossario condiviso distingue fonte normativa, requisito, applicabilità, mapping, controllo, azione correttiva, rischio, evidenza, decisione umana, proposta AI, approvazione interna e ricevuta.
- G4 — le azioni umane materiali dichiarano oggetto, effetto, autorità, evidenza, reversibilità e dimensioni di rilevanza.
- G5 — linguaggio prescrittivo o proto-giuridico resta bounded da fonte, autorità, giurisdizione, versione, perimetro, base e competenza; ICTC non auto-determina obblighi applicabili.
- G6 — mapping ≠ conformità/efficacia; completamento ≠ chiusura verificata; rating ≠ probabilità oggettiva; approvazione interna ≠ assurance indipendente; ricevuta/hash ≠ firma o verità esterna.
- G7 — le viste business privilegiano norme, requisiti, responsabilità, decisioni, azioni ed evidenze; gergo tecnico resta progressivo.
- G8 — il pannello amministrativo delle procedure usa il layout corrente e rende esplicito l'impatto dell'abilitazione/disabilitazione.
- G9 — i gate semantic-foundation sono membri diretti della current semantic suite.
- G10 — la PR è accettabile solo su exact-head CI verde.

## DoD intermedi

1. Fondazione: glossario, process language e human-action model importabili senza dipendenze UI.
2. Presentazione: label materiali specifiche; nessun generico `Approva`, `Valida`, `Completa` quando l'effetto è più ampio o diverso.
3. Norme: fonte, autorità, giurisdizione, versione e perimetro restano concetti separati.
4. Compliance: applicabilità, mapping, gap, controllo e conformità restano assi separati.
5. Evidenze: disponibilità, integrità tecnica, sufficienza e conclusione restano separate.
6. Azioni: ogni CTA materiale espone semantic action id e descrizione accessibile dell'effetto.
7. Amministrazione: gestione processi montata sul layout corrente, nessuna disabilitazione totale, diff comprensibile prima del commit.
8. C0.1: la fondazione prepara il DOM ma non aggiunge participant costituzionali né sostituisce il finalizer.
9. Falsificazione: check strutturale, 10M simulazioni model-level, 100k simulazioni normative/onto-epistemiche, 1M mutanti e holdout 100k.

## Metriche

| Metrica | Target |
|---|---:|
| processi business | 7 |
| nuovi processi | 0 |
| nuovi owner write | 0 |
| finding audit mappati | 906/906 |
| famiglie invarianti | 21 |
| nodi reticolo | 25 |
| termini glossario minimo | >=12 |
| azioni umane materiali | 19 |
| dimensioni rilevanza | 7 |
| campi human-action completi | 100% |
| generic action labels sui 19 checkpoint | 0 |
| simulazioni model-level | 10.000.000 |
| simulazioni normative/onto-epistemiche | 100.000 |
| mutanti | 1.000.000 |
| kill rate nel vocabolario dichiarato | 100% |
| holdout | 100.000 |
| nuove famiglie nel holdout | 0 |

## Checklist locale

- [x] glossario condiviso modellato
- [x] sette processi coperti con oggetto, domanda, evidenza e boundary
- [x] diciannove azioni umane materiali tipizzate
- [x] rilevanza legal/social/moral/organizational/operational/evidentiary/external modellata
- [x] regola proto-giuridica bounded modellata
- [x] runtime di annotazione semantica idempotente
- [x] CTA AP-01 di completamento resa esplicitamente checkpoint di verifica
- [x] EP-01 presentato in linguaggio business prima del gergo tecnico
- [x] Evidenze ICTC orientate a decisioni/evidenze/limiti
- [x] pannello procedure amministrative corretto per il layout corrente
- [x] gate strutturale aggiunto
- [x] saturation 10M + 100k normativa + 1M mutanti aggiunta
- [ ] exact-head GitHub Actions verde sulla PR materializzata

## Limiti

Le simulazioni sono model-level e bounded dal vocabolario implementato. Non sono parere legale, assurance indipendente, studio con utenti, certificazione di accessibilità, deployment assessment o prova di completezza del diritto. Le dimensioni di rilevanza orientano la review umana e non calcolano automaticamente liceità, colpa, obbligatorietà, moralità o sufficienza probatoria.
