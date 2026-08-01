# Confine anti-contaminazione tra AOSP1 e ICTC

Il bundle AOSP1 e stato usato come precedente architetturale, non come fonte di dominio.

## Invarianti trasferite

- ingresso unico per l'agente;
- manifest, checksum e root digest;
- distinzione tra artefatto derivato e autorita del repository;
- overlay runtime mutabile e kernel non mutato in place;
- classificazione degli adattamenti;
- self-test, mutation check e successore materializzato;
- receipt e readback per ogni mutazione significativa.

## Elementi non trasferiti

- nomi, policy, decisioni o identificativi AOSP1;
- D-084 e matrici di autorita AOSP1;
- assunzioni remote-first o tool-specifiche;
- console, tassonomie, DoD o classi di prova non presenti in ICTC;
- predecessori ZIP annidati;
- vincoli di presentazione definiti per altri utenti o prodotti.

## Regola

Una struttura puo essere copiata; una semantica deve essere nuovamente derivata dalle autorita ICTC. Se un concetto non e giustificato dal repository ICTC, resta fuori dal successore.
