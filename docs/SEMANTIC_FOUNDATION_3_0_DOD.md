# Semantic Foundation 3.0 — DoD e reticolo di stabilizzazione

Status: PR candidate — refined after exact-head falsification
Date: 2026-08-21
Base: `main@1a6e66dca221470f6fe970750459d0172c0521d4`
PR: `#97`

## Obiettivo

Convergere i due round di audit UI/UX e semantico in una fondazione lessicale e d'azione condivisa, senza introdurre un nuovo processo business, una nuova write authority o un motore di verita alternativo. La slice rende espliciti il glossario di compliance, il significato delle azioni umane materiali, le dimensioni di rilevanza e la separazione fra norma, obbligo, applicabilita, perimetro di lavoro, mapping, controllo, evidenza e conclusione.

La baseline consolidata e: 528 finding visuali + 378 finding derivati dal codice = 906 finding, compressi in 21 famiglie di invarianti e 25 nodi di rifattorizzazione. La PR **mappa l'intero corpus alla fondazione**, ma chiude in questa slice le cause lessicali, semantiche, CTA/action-meaning e il P0 amministrativo; non dichiara che 906 layout o stati browser siano stati individualmente ridisegnati.

## Finding emersi dalla review della PR

- la prima saturation dichiarava i mutanti uccisi con un booleano costante e correlava azioni a boundary procedurali casuali: sostituita con operatori e detector effettivi;
- le CTA AP-01 generate dal presentation owner non erano raggiunte dai selettori iniziali: i binding coprono sia il substrate sia i controlli `data-uiux-action-quick` finali;
- mapping, gap e fuori-perimetro condividono dialog ma non significato: il binding segue il valore decisionale selezionato;
- le annotazioni potevano precedere il presentation owner ed essere perse: sono ora applicate dall'annotation participant C0.1 esistente, senza nuovo participant;
- il pannello policy processi usava una baseline di stato non necessariamente uguale alla policy caricata e veniva montato fuori dalla singola vista Admin: ora il diff usa l'esatto payload caricato e il pannello appartiene alla vista Stato;
- il documento end-user language era troppo corto per fungere da authority della nuova fondazione: glossario e grammatica bounded sono ora espliciti.

## DoD globale

- G1 — esistono esattamente sette Processi di Compliance business; EP-01 resta cross-cutting.
- G2 — nessuna nuova write authority, API decisionale o checkpoint business viene introdotto dalla slice.
- G3 — il glossario condiviso distingue fonte normativa, standard, obbligo normativo, requisito, perimetro di lavoro, applicabilita, mapping, controllo, azione correttiva, rischio, evidenza, decisione umana, proposta AI, approvazione interna e ricevuta.
- G4 — le 19 azioni umane materiali dichiarano procedura, oggetto, effetto, autorita, evidenza, reversibilita, boundary e dimensioni di rilevanza.
- G5 — linguaggio prescrittivo o proto-giuridico resta bounded da fonte, autorita, giurisdizione, versione, perimetro, base e competenza; ICTC non auto-determina obblighi applicabili, scadenze, notifiche o conclusioni legali.
- G6 — mapping != conformita/efficacia; perimetro di lavoro != non-applicabilita giuridica; completamento != chiusura verificata; rating != probabilita oggettiva; approvazione interna != assurance indipendente; ricevuta/hash != firma o verita esterna.
- G7 — le viste business privilegiano norme, requisiti, responsabilita, decisioni, azioni ed evidenze; gergo tecnico resta progressivo.
- G8 — il pannello amministrativo delle procedure usa la vista corrente, confronta l'esatta policy caricata, blocca no-op e disabilitazione totale e richiede conferma solo per un diff reale.
- G9 — semantic action metadata converge nell'annotation participant C0.1 esistente; decision-presentation resta esclusiva e non nasce un sesto participant.
- G10 — i gate semantic-foundation sono membri diretti della current semantic suite e nominati dal topology check.
- G11 — la PR e accettabile solo su exact-head CI verde.

## DoD intermedi e locali

1. Fondazione: glossario, process language e human-action model importabili senza dipendenze di write authority.
2. Presentazione: nessun generico `Approva`, `Valida`, `Completa` nel contratto delle 19 azioni quando l'effetto reale e piu specifico.
3. Norme: fonte normativa, standard, obbligo, requisito, applicabilita e perimetro di lavoro restano concetti separati.
4. Compliance: applicabilita, mapping, gap, controllo e conformita restano assi separati.
5. Evidenze: disponibilita, integrita tecnica, sufficienza e conclusione restano separate.
6. Azioni: ogni azione materiale dispone di binding runtime; le decisioni condizionali si legano al valore selezionato.
7. Amministrazione: policy caricata = baseline del diff; nessun write no-op; nessuna disabilitazione totale.
8. C0.1: semantic foundation prepara il linguaggio; l'annotation participant gia costituzionale applica i metadata dopo presentation.
9. Falsificazione: check strutturale, 10M simulazioni model-level, 100k normative/onto-epistemiche, 1M mutanti baseline, **100k mutanti aggiuntivi**, holdout 100k.
10. Autorita documentale: `docs/03_ENDUSER_LANGUAGE.md`, authority matrix e moduli runtime raccontano la stessa separazione semantica.

## Metriche

| Metrica | Target / evidenza locale refined |
|---|---:|
| processi business | 7 |
| nuovi processi | 0 |
| nuovi owner write | 0 |
| finding audit ricondotti al reticolo | 906/906 |
| famiglie invarianti | 21 |
| nodi reticolo | 25 |
| termini glossario | 15 |
| azioni umane materiali | 19 |
| binding azioni | 19/19 |
| dimensioni rilevanza | 7 |
| campi human-action completi | 100% |
| simulazioni model-level | 10.000.000 |
| simulazioni normative/onto-epistemiche | 100.000 |
| mutanti baseline | 1.000.000 |
| mutanti aggiuntivi review | 100.000 |
| mutanti totali | 1.100.000 |
| kill rate nel vocabolario dichiarato | 100% |
| holdout | 100.000 |
| nuove famiglie nel holdout | 0 |

## Evidenza di falsificazione refined

Seed deterministico: `3028062525` (`0xb47c913d`).

Esecuzione locale del modello refined:

```json
{"ok":true,"seed":3028062525,"simulations":10000000,"normativeOntoEpistemicSimulations":100000,"baseMutants":1000000,"additionalMutants":100000,"totalMutants":1100000,"totalKilled":1100000,"killRate":1,"mutationFamilies":21,"holdout":100000,"holdoutKilled":100000,"novelFamilies":0,"signature":3904210957}
```

Questa e bounded evidence sul vocabolario dichiarato. Non e parere legale, studio utenti, assurance indipendente, accessibilita certificata o prova di completezza del diritto o dei fault possibili.

## Checklist

- [x] glossario condiviso modellato e ampliato a 15 termini
- [x] sette processi coperti con oggetto, domanda, evidenza e boundary
- [x] diciannove azioni umane materiali tipizzate e bounded
- [x] 19/19 action binding runtime modellati
- [x] rilevanza legal/social/moral/organizational/operational/evidentiary/external modellata
- [x] regola proto-giuridica bounded modellata
- [x] scope di lavoro separato da non-applicabilita giuridica
- [x] invio incidente interno separato da notifica esterna
- [x] disponibilita processo ICTC separata dagli obblighi organizzativi
- [x] action metadata spostati nell'annotation participant C0.1 esistente
- [x] CTA AP-01 finali raggiunte dal binding
- [x] pannello procedure amministrative corretto per vista, baseline e no-op
- [x] gate strutturale aggiunto
- [x] 10M simulazioni + 100k normative + 1.1M mutanti + 100k holdout eseguiti nel modello refined
- [x] authority linguistica riallineata
- [ ] exact-head GitHub Actions verde sulla PR materializzata
