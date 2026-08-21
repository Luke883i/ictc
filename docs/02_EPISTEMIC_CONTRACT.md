# Contratto epistemico ICTC

## Principio

**Registrare non significa concludere.** ICTC conserva l'identità di produttore, base, trasformazione, stato epistemico, limite e decisione invece di comprimerli in un unico status.

```text
input/basis
  → producer/executor
  → esito tipizzato
  → SubjectVersion / EpistemicStep
  → checkpoint umano se richiesto
  → decisione version-bound
  → evidence/receipt/limitation
  → ReviewNeed quando cambia la base
```

## Non-equivalenze obbligatorie

- observed ≠ true;
- proposed ≠ decided;
- evidence ≠ conclusion;
- mapping ≠ compliance/effectiveness;
- completed ≠ verified closed;
- risk rating ≠ objective probability;
- internal approval ≠ independent assurance;
- working registry ≠ completeness of the world;
- software integrity ≠ external authenticity.

## Famiglie

Le famiglie epistemiche (`observed`, `proposed`, `derived`, `decided`, `attested`) descrivono operazioni registrate. Non sono livelli ordinali di verità. `metadata.epistemicEffects` è il contratto forward per le write; compatibility inference non può essere usata per attribuire a un'AI autorità umana.

## UI boundary

La formulazione storica “ogni elemento è un OutcomeEnvelope” indica un **confine di autorità**, non l'obbligo che ogni read object serializzi lo stesso schema.

- la UI non renderizza entità raw della persistenza;
- le letture consumano canonical projections role/scope/revision-bound con authority e limitation;
- le scritture restituiscono OutcomeEnvelope/receipt;
- dopo una write il client legge nuovamente le projection canoniche;
- una projection o un export non diventano una SOT indipendente.

## Evidenza esterna

Un URL può essere registrato come dichiarato/osservato. Per essere `usable` come EvidenceRef decisionale deve identificare la base con `observedVersion` o digest. Il timestamp di osservazione da solo non rende stabile il contenuto. Version-bound non significa autentico, vigente o sufficiente.

## ReviewNeed

Una decisione resta legata alla basis/versione su cui è stata presa. Se la basis interna cambia, ICTC apre ReviewNeed; non corregge retroattivamente la decisione. Il nuovo stato umano richiede una nuova azione autorizzata.

## AI

L'AI può proporre, estrarre, classificare o derivare entro policy. Non può trasformare autonomamente output in human-reviewed/approved/verified/closed. Confidence, schema validation e provenance non sono verità sostanziale.
