# ICTC Enterprise 2 — revisione editoriale e densità informativa

## Scopo

Questa slice applica alla candidata Enterprise 2 un sistema editoriale terminale e reversibile. Il sistema governa vocabolario, titoli, etichette, densità, gerarchia e disclosure. Non modifica endpoint, permessi, store o autorità server-side.

La revisione non certifica conformità legale, accessibilità, sicurezza, adeguatezza organizzativa o readiness del deployment. Produce soltanto evidenze verificabili sul comportamento della UI candidata.

## Vocabolario canonico

| Codice | Nome canonico | Uso editoriale |
|---|---|---|
| `RN-01` | Monitoraggio normativo | Nome del processo e titolo della pagina. Le singole configurazioni restano “ricerche”. |
| `EC-01` | Gestione eventi e segnalazioni | Nome neutro del processo; non presume una qualificazione di conformità o incidente. |
| `EV-01` | Evidenze e controlli | Area che distingue evidenze applicative, controlli e requisiti esterni. |
| `IA-01` | Identità e accessi | Accesso federato, regole e identità locali. |
| `GA-01` | Governo dei servizi AI | Configurazione, consumo, limiti e modelli autorizzati. |

### Decisioni anti-overclaim

- Una fonte non viene più presentata come “verificata”: può essere `Da valutare`, `Accettata nel catalogo` o `Esclusa dal catalogo`.
- L’azione `Verifica fonte` diventa `Accetta nel catalogo`; la decisione resta circoscritta al catalogo ICTC.
- `Confidenza AI` diventa `Punteggio indicativo del modello`.
- `Controlli runtime` diventa `Controlli applicativi`.
- `Gap deployment` diventa `Requisiti esterni aperti`.
- `Pronto`, `Bloccato`, `Verificato` e `Bloccante` sono sostituiti da etichette che esplicitano l’ambito del controllo.
- Il titolo del documento non espone una versione candidata come release: `ICTC · Attività, evidenze e controlli`.

## Audit visivo e informativo per superficie

| Superficie | Problema as-is | Correzione runtime | Informazione iniziale | Dettaglio su richiesta |
|---|---|---|---|---|
| Shell | Titolo 1.8 incoerente con candidata 2.0; nav non canonica | Titolo neutro, brand e quattro aree canoniche | Identità, ruolo, stato, navigazione | Nessuno |
| Panoramica admin | Titolo ampio e ripetizioni | Titolo operativo, due aree, una priorità | Ruolo, due processi, stato, prossima attività | Metodo; evidenze e responsabilità |
| Panoramica user | Copy orientato al sistema | Copy orientato all’attività | Due aree e attività prioritaria | Istruzioni e limiti |
| Panoramica auditor | Prova e metodo allo stesso livello | Evidenze prima del metodo | Due processi e priorità read-only | Evidenze; metodo; autorità |
| Monitoraggio | “Ricerca”, “monitoraggio”, “job”, “novelty” mescolati | Processo `Monitoraggio normativo`; record `ricerca` | Titolo, lead, azioni, elenco | Frequenza, versione e prossima esecuzione |
| Catalogo | “Verificata” può suggerire validità sostanziale | Esito circoscritto al catalogo | Titolo, stato, autorità | Cronologia, decisioni, traccia del modello |
| Registrazione materiale | Arricchimento AI compete con originale | Originale al centro; analisi indicata come assistita | Modalità e contenuto | Stato dell’arricchimento |
| Eventi | “Evento di conformità” preclassifica il fatto | `Gestione eventi e segnalazioni` | Titolo, lead, registro e azione | Tipo, data e versioni |
| Intake evento | Copy già coerente ma dispersiva | Titolo e lead più brevi | Racconto, conoscenza, allegati | Nessuno |
| Workspace evento | Analisi, storia, promemoria e decisione simultanei | Attività corrente prima; blocchi secondari chiusi | Originale e prossimo passo | Analisi, conferme, versioni, cronologia, promemoria |
| Evidenze | “Guida e prove” ambiguo | `Evidenze, controlli e limiti` | Sintesi, ruolo, controlli e limiti | Mappa tecnica |
| Standard | Primo standard aperto e testo tecnico dominante | Tutti chiusi; sintesi italiana | Nome, famiglia e stato del mapping | Sintesi e riferimento tecnico |
| Amministrazione | “Postura”, “readiness”, ambito non sempre esplicito | Un pannello attivo e termini applicativi | Sezioni canoniche | Contenuto del pannello selezionato |
| Governo AI | “Governance” e “provider” usati senza gerarchia | `Governo AI` e campi espliciti | Ambiente, classificazione, responsabile | Budget e modelli |
| Identità | LDAP, Shibboleth e legacy nello stesso livello | `Accesso federato` distinto da `Identità locali` | Strategia e stato | Attributi, regole e prova del mapping |
| Configurazione AI | Job e policy mescolati | Provider globale separato dalla singola ricerca | Connessione e organizzazione | Istruzioni globali |

## Budget di complessità

- massimo 5 blocchi informativi iniziali per superficie;
- una sola azione primaria per contesto decisionale;
- massimo 6 parole nei titoli di pagina;
- lead entro 180 caratteri nel modello editoriale;
- riga leggibile entro 66 caratteri medi;
- target interattivi di almeno 44 CSS pixel;
- larghezza desktop massima 1180 CSS pixel;
- assurance a 320 px, 390 px e zoom 200%;
- dettaglio secondario in `details`, dialogo o sezione amministrativa selezionata.

## Regole di disclosure

1. La panoramica mostra ruolo, due aree e una priorità prima di metodo ed evidenze.
2. Le card mostrano stato, titolo e azioni prima dei metadati.
3. Il dettaglio fonte mostra identità e valutazione circoscritta prima di cronologia, decisioni e traccia del modello.
4. Il dettaglio evento mostra l’attività corrente prima di analisi, storia e promemoria.
5. L’area evidenze mostra sintesi e limiti prima della mappa tecnica.
6. L’amministrazione mostra esattamente una sezione alla volta.
7. Gli standard restano chiusi fino all’apertura esplicita.

## Verifica e saturazione

La slice è coperta da:

- `enterprise-2-editorial-check.mjs` per vocabolario, claim boundary, wiring, densità e browser projection;
- `enterprise-2-editorial-saturation.mjs` per ruoli, superfici, stato AI, dati, autorità, viewport, disclosure, densità, rete e lingua;
- `browser-enterprise-2-check.py` per undici immagini, 320 px, 390 px, zoom 200%, tastiera, focus, colori forzati e controlli senza nome.

La saturazione è bounded al modello dichiarato. `M` coincide con l’ultima primitiva editoriale nuova; i successivi 100 scenari non introducono novelty né contraddizioni. Questo non dimostra l’assenza universale di futuri difetti o di nuovi testi provenienti da dati esterni.
