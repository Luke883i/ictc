# ICTC V4 Experimental · Enterprise Nexus — Release Seal

## Il prodotto, in una frase
ICTC Enterprise Nexus è un sistema operativo di compliance aziendale: quando entri vedi subito i processi di compliance gestiti, scegli quello che ti serve, segui un workflow comprensibile e specifico, usi l'AI solo se vuoi e lasci una traccia verificabile di input, decisioni, attività e prove.

## Cosa vede una persona quando apre ICTC
La navigazione business resta volutamente corta:

- **Oggi** — il lavoro prioritario e i checkpoint umani ancora aperti.
- **Processi** — i processi aziendali di compliance gestiti da ICTC, con accesso diretto al workflow.
- **Prove** — evidenze, receipt, decisioni, relazioni, trace e limiti ricostruibili.

L'amministrazione resta un control plane privilegiato e non diventa una quarta area business permanente.

In alto nella home il **Compliance Nexus** mostra immediatamente i sette processi aziendali. L'ingresso “descrivi cosa devi fare” resta disponibile come scorciatoia, ma non è necessario conoscere, usare o configurare l'AI per aprire un processo.

## I sette processi aziendali

### RN-01 — Monitoraggio normativo
**Serve a:** sorvegliare fonti, cambiamenti e riferimenti interni rilevanti per il perimetro dichiarato.

**Ingresso tipico:** obiettivo di monitoraggio, fonti note, URL, riferimento interno oppure fonte osservata manualmente.

**Workflow:** definisci perimetro → piano manuale o proposta AI → verifica umana → attivazione → osservazioni/fonti → verifica fonte → valutazione umana di impatto → eventuale remediation.

**Chi decide:** l'umano decide piano operativo, verifica fonte e impatto. L'AI può proporre piano e discovery.

**Esito:** fonte verificata/esclusa e, quando rilevante, impatto e lavoro successivo collegati.

**Prova:** versioni fonte, decisioni, receipt, trace e dossier.

### EC-01 — Eventi e segnalazioni
**Serve a:** preservare ciò che è accaduto e accompagnare la persona verso un fascicolo completo e verificabile.

**Ingresso tipico:** racconto originale, momento di conoscenza, log, screenshot o documenti.

**Workflow:** preserva originale → analisi manuale o AI → chiarimenti motivati → formulazione → conferma umana → submission/closure → collegamenti a oggetti, rischi e remediation.

**Chi decide:** l'umano conferma fatti, formulazione e stato. ICTC non decide obblighi di notifica.

**Esito:** fascicolo versionato, inviato o chiuso, con remediation collegate quando necessarie.

**Prova:** originale, allegati, risposte, formulazioni, decisioni, receipt e dossier.

### AO-01 — Inventario oggetti rilevanti
**Serve a:** governare l'inventario di sistemi, applicazioni, dispositivi, dati, fornitori, contratti, policy, controlli e altri oggetti rilevanti.

**Ingresso tipico:** tipo, nome, criticità, responsabile e fonte autorevole dichiarata.

**Workflow:** candidato → review umana → attivo/escluso → relazioni → review di freschezza → eventuale ritiro.

**Chi decide:** l'umano decide quali candidati entrano nel registro governato.

**Esito:** inventario dichiarato, versionato e collegabile agli altri processi.

**Prova:** versione oggetto, review, relazioni, receipt e dossier.

### MC-01 — Controlli, mapping e copertura dichiarata
**Serve a:** collegare requisiti e standard al perimetro dichiarato e distinguere copertura, gap, N.A. e irrisolti.

**Ingresso tipico:** requisito, controllo o riferimento da ISO 27001, NIST, DORA, NIS2 o altro framework dichiarato.

**Workflow:** requisito → proposta di mapping manuale o AI → decisione umana → mapped/gap/N.A./rejected → remediation se gap → riesame.

**Chi decide:** l'umano decide il mapping. La percentuale riguarda solo il declared universe registrato.

**Esito:** vista di copertura bounded, gap espliciti e azioni collegate.

**Prova:** requisito, mapping, decisione, evidence refs, receipt e dossier.

### AP-01 — Action Plan e remediation
**Serve a:** trasformare gap, rischi, finding, eventi e decisioni in lavoro assegnato e verificabile.

**Ingresso tipico:** origine, titolo, responsabile, scadenza, descrizione e proposta di priorità.

**Workflow:** proposta → adozione umana di priorità/owner → esecuzione → ready-for-review → verifica distinta con evidenze → closed oppure rework.

**Chi decide:** priorità operativa e chiusura sono atti umani. “Completato” non equivale a “verificato”.

**Esito:** remediation chiusa solo dopo verifica motivata ed evidence-backed.

**Prova:** origine, adozione, aggiornamenti, verifica, evidence refs, receipt e dossier.

### RC-01 — Rischi di compliance
**Serve a:** governare scenari di rischio e visualizzare una heatmap manageriale basata solo su valutazioni umane.

**Ingresso tipico:** scenario, oggetti/controlli/azioni collegati e fatti disponibili.

**Workflow:** scenario → eventuale proposta AI → rating umano inerente → controlli → rating umano residuo → trattamento mitigate/accept/avoid/transfer → eventuale remediation → monitoraggio.

**Chi decide:** l'umano assegna rating e trattamento. L'AI non entra nella heatmap consolidata finché non esiste un rating umano.

**Esito:** portafoglio rischi con base del rating esplicita e trattamento tracciato.

**Prova:** scenario, rating, trattamento, relazioni, receipt e dossier.

### AR-01 — Assurance e autovalutazione
**Serve a:** gestire questionari, richieste cliente e autovalutazioni senza confondere una bozza con una risposta approvata.

**Ingresso tipico:** richiesta/questionario originale e origine.

**Workflow:** preserva richiesta → bozza manuale o AI → review → risposta umana approvata → evidence refs → dossier.

**Chi decide:** la persona approva le risposte. Una bozza AI non è una attestazione.

**Esito:** risposta approvata, bounded e collegata alle evidenze disponibili.

**Prova:** richiesta originale, draft, digest, approvazione, evidence refs, receipt e dossier.

## Il ruolo dell'AI
Il controllo **AI assistita ON/OFF** cambia l'assistenza, non il prodotto.

Con AI **OFF**:
- tutti e sette i processi restano visibili e direttamente apribili;
- gli ingressi automatici di monitoraggio ed eventi seguono il percorso manuale senza chiamare il provider;
- mapping, rischio, action plan e assurance mantengono i percorsi manuali;
- KPI, heatmap, work queue, decisioni ed evidenze continuano a funzionare.

Con AI **ON**:
- ICTC può suggerire piani, mapping, rating, priorità, draft e letture;
- ogni output è marcato come proposta/assistenza;
- la proposta non diventa decisione, KPI, heatmap o approvazione senza checkpoint umano quando previsto.

## Profilazione
- **Amministratore** — configura, valida, assegna e registra decisioni organizzative autorizzate.
- **Utente** — contribuisce, registra eventi/materiale e porta avanti il lavoro consentito o assegnato.
- **Auditor** — consulta, ricostruisce e scarica prove; non riceve affordance di scrittura.

Le esportazioni, i dossier e i trace applicano la stessa autorizzazione della lettura.

## Metriche di accettazione V4
- processi business visibili: **7/7**;
- processi direttamente apribili senza routing: **7/7**;
- workflow business utilizzabili con AI OFF: **7/7**;
- mandatory AI call nei passaggi business: **0**;
- decision authority umana nei checkpoint organizzativi: **100%**;
- write receipt coverage: **100%**;
- supporto dossier sui soggetti canonici: **100%**;
- AI-only risk contribution alla heatmap: **0**;
- mutazione KPI da insight AI: **0**;
- permanent business navigation: **3** aree;
- auditor write affordances: **0**;
- processi nascosti dietro il routing AI: **0**;
- synthetic ProcessDefinition core edits: **0**;
- saturazione profili: **>= 1.000**;
- saturazione linguaggio/routing: **>= 10.000** casi;
- saturazione stati: **>= 100.000** scenari;
- novelty tail: **>= 100** scenari dopo M con **0** nuove classi di finding.

## Definition of Done globale
La candidate è V4 DONE solo se, sullo stesso exact head:

- [ ] S0 contratto, metriche e claim boundary sono machine-checkable.
- [ ] S1 Compliance Process Landscape espone 7/7 processi e Prove come support surface, senza nuova business authority.
- [ ] S2 RN/EC/AO/MC/AP/RC/AR restano utilizzabili con AI OFF e AI ON; AI non è requisito di transizione.
- [ ] S3 source→impact→action, mapping gap→action e incident→object/risk/action sono ricostruibili.
- [ ] S4 risk inherent→residual→treatment→action e action execution→verification→closed sono distinti e tracciati.
- [ ] S5 Evidence & Trace Explorer ricostruisce originale, AI, decisioni, epistemica, relazioni, audit/receipt e limiti.
- [ ] S6 Home è business-first, profilo e AI mode sono chiari, input URL/testo/file/riferimento sono reali, search copre le famiglie visibili e ogni momento operativo spiega perché/dopo/prova.
- [ ] S7 profile saturation >=1000, routing saturation >=10000, state saturation >=100000 e M+100 hanno zero nuova classe di finding.
- [ ] V1/V2/V3 regression rails restano verdi sotto la nuova edition.
- [ ] V4 semantic/runtime/browser rail è verde.
- [ ] shell resta Oggi / Processi / Prove e una sola active UI composition resta authority.
- [ ] runtime package/version resta 1.8.0.
- [ ] PR resta draft e `main` non viene modificato finché una persona non autorizza il merge.

## Claim boundary
**V4 Experimental · Enterprise Nexus ready to use** significa una baseline sperimentale end-to-end, AI-optional, business-navigabile e tracciabile per operazioni di compliance nel perimetro ICTC dichiarato.

Non significa conformità legale, certificazione, opinione di un assessor esterno, completezza normativa universale, completezza dell'inventario reale, production hardening, alta disponibilità, disaster recovery o attestazione di accessibilità. Questi restano rail di readiness separati.
