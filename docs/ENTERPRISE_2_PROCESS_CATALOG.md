# ICTC Enterprise 2 — catalogo dei processi e regole di rappresentazione

## Scopo

Questo catalogo assegna un nome aziendalistico e un codice stabile alle aree operative esposte dalla UI. I codici identificano processi applicativi, non persone, record, certificazioni o obblighi legali. Servono a orientare utenti, auditor, consulenti e responsabili di controllo senza sostituire le evidenze di dettaglio.

## Catalogo canonico

| Codice | Nome del processo | Scopo operativo | Evidenze osservabili | Limite dichiarato |
|---|---|---|---|---|
| `RN-01` | Monitoraggio normativo | Configurare o consultare ricerche, piani, esecuzioni, fonti e decisioni. | Piano versionato, stato, prossima esecuzione, fonti candidate, receipt ed esportazione della prova. | Non attesta completezza, vigenza o applicabilità della normativa. |
| `EC-01` | Gestione eventi di conformità | Registrare fatti, raccogliere chiarimenti, governare versioni, invii e chiusure. | Originale, allegati, domande, risposte, formulazioni, decisioni, versioni e receipt. | Non determina automaticamente obblighi, responsabilità o qualificazioni giuridiche. |
| `EV-01` | Evidenze e verifiche | Consultare controlli applicativi, limiti, provenienza e stato delle prove. | Stato dei controlli, azioni richieste, versioni, digest, limiti e artefatti macchina. | Non costituisce certificazione o approvazione di un’autorità esterna. |
| `IA-01` | Identità e accessi | Configurare accesso federato, mapping di ruolo e identità locali ammesse. | Strategia attiva, regole, simulazione del mapping, utenti locali e receipt amministrative. | Non conserva password LDAP né sostituisce la sicurezza del proxy o dell’Identity Provider. |
| `GA-01` | Governo dei servizi AI | Governare ambiente, classificazione, modelli autorizzati, consumo e soglie. | Configurazione, utilizzo per scopo, budget, modelli consentiti e receipt. | Non trasferisce all’AI autorità decisionale o responsabilità organizzativa. |

## Gerarchia di navigazione

1. La panoramica presenta `RN-01` ed `EC-01` come due domini operativi distinti.
2. `EV-01`, `IA-01` e `GA-01` sono domini di governo e verifica raggiungibili dalla guida o dall’amministrazione.
3. Il codice precede il nome soltanto nei marker di processo e nella navigazione amministrativa; titoli e call to action restano in linguaggio naturale.
4. I codici non sostituiscono gli identificativi dei singoli record, che restano propri del backend.

## Progressive disclosure per ruolo

- **Utente:** il metodo precede la prova; copy orientato alla registrazione di fatti e al contributo.
- **Amministratore:** il metodo precede la prova; copy orientato a checkpoint, responsabilità e controlli.
- **Auditor:** la prova precede il metodo; copy orientato a origine, versioni, accesso e limiti. I disclosure restano chiusi all’ingresso per evitare saturazione visiva.

Lo stato aperto o chiuso scelto dall’utente viene preservato durante il rendering della stessa sessione. La UI non apre automaticamente blocchi estesi quando cambia ruolo o superficie.

## Invarianti falsificabili

1. Nessuna superficie finale mostra `Processo 1`, `Processo 2` o equivalenti generici.
2. Ogni dominio operativo espone il proprio codice e nome almeno nel marker di pagina o di area.
3. La selezione di una sezione amministrativa mostra esattamente un `.admin-panel` diretto.
4. Il codice visualizzato corrisponde al dominio del pannello selezionato.
5. I titoli delle azioni descrivono un effetto umano osservabile e non una capacità AI sovrastimata.
6. `RN-01`, `EC-01`, `EV-01`, `IA-01` e `GA-01` restano distinti; nessuna compressione li fonde senza perdita di autorità, evidenza o finalità.

## Claim boundary

Il catalogo migliora orientamento, composizione e ispezionabilità. Non dimostra da solo adeguatezza organizzativa, conformità normativa, accessibilità certificata, certificazione ISO o approvazione di Garante, ACN o altra autorità.
