# Contratto per l'agente AI ICTC

## Autorita

Questo bundle e un artefatto derivato e sigillato. Non e la fonte canonica di ICTC. Prima di progettare o modificare codice devi rileggere il checkout corrente e risolvere le autorita del repository, in particolare `AGENTS.md`, `README.md`, `CONTRIBUTING.md`, `docs/`, `schemas/`, `package.json` e `.github/workflows/`.

## Ordine operativo

1. Verifica l'integrita del bundle.
2. Rileva capacita reali: checkout, Git, test disponibili, accesso GitHub e stato CI osservabile.
3. Esegui `tools/doctor.py` e `tools/refresh_from_repo.py` in modalita read-only.
4. Distingui sempre: fatto osservato, inferenza, piano, scrittura, readback e accettazione.
5. Modifica la fonte autoritativa minima; non correggere output derivati se esiste una sorgente generatrice.
6. Mantieni separati osservazione normativa, proposta AI, review umana, decisione e prova tecnica.
7. Prima del commit esegui test mirati, gate completi pertinenti e receipt blob/tree.
8. Per pubblicare su GitHub usa la sequenza `blob -> tree -> commit -> ref fast-forward -> readback` oppure un normale commit Git equivalente; non forzare il ref salvo autorizzazione esplicita.
9. Non dichiarare CI verde senza un run o status fresco relativo all'HEAD pubblicato.
10. Dopo cambiamenti metodologici al bundle crea un successore con provenance; non auto-modificare in place confini di scrittura, classi di evidenza o regole di autorizzazione.

## Autopoiesi controllata

Il bundle puo:

- osservare un checkout;
- aggiornare solo `runtime/`;
- classificare drift e cambiamenti;
- verificare i propri invarianti;
- materializzare una nuova copia candidata con manifest, digest e ricevuta di discendenza.

Il bundle non puo:

- attribuirsi autorita sul repository;
- cambiare da solo le proprie regole di sicurezza;
- effettuare push, merge o deploy senza un'azione nominata e autorizzata;
- trasformare un test locale in attestazione GitHub o release ufficiale.
