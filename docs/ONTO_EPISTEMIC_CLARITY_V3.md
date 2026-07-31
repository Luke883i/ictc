# Chiarezza onto-epistemica v3

## Ontologia minima

- `SourceRecord`: riferimento o file candidato/attivo;
- `ScoutJob`: configurazione di osservazione;
- `Finding`: differenza osservata;
- `RegulatoryChangeStory`: valutazione aziendale della differenza;
- `ControlFamily`: copertura interna astratta;
- `Matter`: segnalazione, quasi incidente o incidente percepito;
- `Receipt`: prova tecnica di persistenza e readback;
- `OutcomeEnvelope`: confine tra dominio e UI;
- `SemanticEdge`: relazione dichiarata tra oggetti;
- `JourneyScene`: istruzione di navigazione, non fatto di dominio.

## Separazioni obbligatorie

- fonte presente ≠ fonte applicabile;
- differenza osservata ≠ cambiamento materiale;
- proposta AI ≠ decisione;
- decisione aziendale ≠ certezza legale universale;
- mapping al controllo ≠ controllo efficace;
- integrità hash ≠ verità del contenuto;
- chiusura del caso ≠ assenza di rischio residuo.

## Label end-user

Consentite: osservato, da valutare, proposta AI, review registrata, responsabilità confermata, mappato, evidenza disponibile, non implementato.

Vietate senza una decisione umana esplicita e contestualizzata: conforme, certificato, nessun rischio, pienamente coperto, obbligo certo, incidente NIS2 certo, notifica obbligatoria.

## Regola UI

Ogni oggetto deve esporre statement, stato, produttore, input, almeno un limite e una prossima azione o la spiegazione dell’assenza di azione. Ogni elemento visibile consuma l’esito di una catena runtime.
