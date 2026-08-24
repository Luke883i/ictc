# ICTC — Product authority

Questo documento è l'autorità corrente per **identità, scopo e confini di prodotto** di Integrated Compliance Tower Control (ICTC). Il prompt originario e i documenti TO-BE restano input di lineage o roadmap: non ridefiniscono lo stato AS-IS.

## Identità

ICTC è un sistema locale di governance della conoscenza di compliance. Collega fonti, requisiti, oggetti aziendali, rischi, azioni, richieste di verifica, decisioni umane ed evidenze mantenendo espliciti versione, basis, authority e limiti del claim.

ICTC supporta assurance interna e formalizzazione della postura di compliance; non produce autonomamente applicabilità giuridica, conformità, efficacia dei controlli, autenticità di fatti esterni o assurance indipendente.

## Perimetro business

ICTC governa esattamente sette processi business:

| Codice | Processo | Oggetto governato |
|---|---|---|
| RN-01 | Monitoraggio normativo e fonti | fonti, pubblicazioni e cambiamenti da verificare |
| EC-01 | Incidenti e quasi incidenti | fatti, chiarimenti, versioni e decisioni su un evento |
| AO-01 | Inventario di sistemi e oggetti | sistemi, servizi, dati, fornitori, processi, policy e controlli |
| MC-01 | Standard e Controlli | standard, requisiti, perimetro e mapping |
| AP-01 | Azioni correttive | impegni di remediation fino alla verifica di chiusura |
| RC-01 | Rischi di compliance | scenari, valutazioni, trattamenti e riesami |
| AR-01 | Questionari e verifiche | richieste, response set, evidenze e approvazioni interne |

EP-01 è una vista trasversale sul reticolo epistemico registrato. Non è un ottavo processo e non introduce una seconda business write authority.

## Confini costituzionali

- osservato != vero nel mondo;
- proposto != deciso;
- perimetro di lavoro != applicabilità giuridica;
- mapping != conformità o efficacia;
- completato != chiuso e verificato;
- evidenza != conclusione;
- rating != probabilità oggettiva;
- approvazione interna != assurance indipendente;
- integrità software != autenticità esterna;
- CI verde != deployment assurance.

L'AI può cercare, preparare, riassumere e proporre entro i contratti runtime. I checkpoint che producono decisioni business restano umani e autorizzati.

## Authority e cambiamenti

- Il contratto epistemico è in [02_EPISTEMIC_CONTRACT.md](02_EPISTEMIC_CONTRACT.md).
- L'architettura AS-IS è in [11_ARCHITECTURE.md](11_ARCHITECTURE.md).
- Il linguaggio end-user è in [03_ENDUSER_LANGUAGE.md](03_ENDUSER_LANGUAGE.md).
- Gli owner eseguibili e documentali sono registrati in [authority-matrix.yaml](authority-matrix.yaml).
- La mappa della documentazione corrente è [START_HERE.md](START_HERE.md).

Una modifica a identità, numero dei processi, authority umana/AI o confini di claim richiede una modifica esplicita a questo documento e ai relativi falsificatori. Un DoD di slice, una PR o un documento storico non può promuoversi implicitamente a product authority.
