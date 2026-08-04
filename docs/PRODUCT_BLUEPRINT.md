# ICTC product blueprint — tranche astratta

## Tesi di prodotto

ICTC non è una dashboard di compliance generalista. È un'applicazione a due servizi e due ruoli.

### Servizio 1 — Monitoraggio normativo

**Input:** configurazione AI globale, job schedulati, prompt modificabili, scope, URL iniziali e contributi utente.

**Processo:** acquisizione → richiesta AI strutturata → normalizzazione ontologica → deduplicazione → catalogo candidato → consultazione umana.

**Output:** fonti candidate con tipo documentale, titolo, autorità, giurisdizione, identificatore, URL, stato, date, sintesi, relazioni, confidenza e provenienza del run.

### Servizio 2 — Incidenti

**Input:** tipo iniziale, date, fatti osservati, servizi coinvolti, impatto, indicatori, mitigazioni, contatti e allegati.

**Processo:** registrazione dei fatti → consolidamento AI → modifica umana → invio → eventuale chiusura amministrativa.

**Output:** segnalazione strutturata, bozza modificabile, promemoria temporali e cronologia delle operazioni.

## Ruoli

- **Amministratore:** configura provider e prompt globali, crea e gestisce i job, usa tutte le funzioni utente e chiude le segnalazioni inviate.
- **Utente:** consulta i risultati, contribuisce al monitoraggio, registra segnalazioni, genera e modifica la propria bozza, invia la propria segnalazione.

Non esistono reviewer, owner, analyst, tenant selector o ruoli simulati aggiuntivi nel prodotto minimo.

## Ontologia minima

### Fonte di compliance

Il modello è ispirato a ELI, senza pretendere compatibilità completa:

- `documentType`: law, legislative-decree, decree, regulation, decision, guideline, circular, standard, other;
- `title`, `authority`, `jurisdiction`, `identifier`;
- `sourceUrl`, `canonicalUri`, `language`;
- `datePublished`, `dateEffective`, `status`;
- `summary`, `relations`, `confidence`;
- `jobId`, `lastRunId`, `reviewState`.

La fonte rimane `candidate`: il modello non aggiunge applicabilità o forza giuridica.

### Segnalazione

- `kind`: event, near-miss, incident;
- `state`: draft, ready, submitted, closed;
- fatti, date, servizi, impatto, indicatori, mitigazioni, contatti e allegati;
- bozza AI distinta dai dati originali;
- formulazione finale esplicitamente inviata dall'utente;
- promemoria derivati dalla data di conoscenza, senza qualificazione automatica.

## Standard dichiaratamente ispirativi

- **ISO 37301:2021:** sistema di compliance definito, mantenuto, valutato e migliorato; ICTC ne riprende la logica di scope, obblighi, monitoraggio e prova, non la certificazione.
- **European Legislation Identifier (ELI):** identificatori e metadati strutturati per rendere le fonti legali accessibili, scambiabili e riusabili.
- **NIST SP 800-61 Rev. 3:** risposta agli incidenti integrata nella gestione del rischio, con preparazione, rilevazione, risposta, recupero e apprendimento.
- **Direttiva NIS2, articolo 23:** informazioni e scansioni temporali utili a preallarme, notifica e relazione finale; ICTC le usa come promemoria, non come decisione di obbligo.
- **Regolamento di esecuzione (UE) 2024/2690:** riferimento per requisiti metodologici e casi di significatività negli ambiti coperti.
- **Determina ACN 9 febbraio 2026:** tassonomia italiana di incidenti soggetti a segnalazione e notifica per gli enti interessati.
- **ISO/IEC 42001 e NIST AI RMF:** configurazione governata dell'AI, tracciabilità, trasparenza e gestione del rischio; ICTC conserva modello, prompt, attore e risultato ma richiede revisione umana.

## Come deve essere fatto

- due accessi principali, corrispondenti ai due risultati attesi;
- una sola configurazione AI globale e prompt visibili/modificabili;
- campi espliciti, risultati strutturati e confini dichiarati;
- contribuzione in un solo punto;
- errori leggibili e stato conservato in caso di provider non disponibile;
- file con digest, scritture atomiche e audit attribuito;
- risultati AI sempre distinguibili dai dati originali e modificabili prima dell'invio.

## Come non deve essere fatto

- nessuna “torre”, grafo o dashboard priva di un'azione utente concreta;
- nessuna tassonomia aggiunta solo per sembrare completa;
- nessuna azione “AI” che non chiami un provider configurato;
- nessun segreto API persistito nel file di stato;
- nessuna conclusione automatica su applicabilità, conformità, significatività o notifica;
- nessun percorso diverso per link, testo e documenti;
- nessun ruolo intermedio non richiesto dal caso d'uso.

## Saturazione 1..M e M+100

La simulazione astratta combina:

- 2 servizi;
- 2 ruoli;
- 4 fasi;
- 2 condizioni di input.

Risultato verificato da `v3/abstract-saturation.mjs`:

```text
M = 32
M + 100 = 132
primitive = 30
last novelty = 17
novelty after M = 0
```

Il risultato dimostra saturazione del modello dichiarato, non completezza universale del dominio normativo o degli incidenti.
