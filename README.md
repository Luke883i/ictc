# ICTC

**Integrated Compliance Tower Control** svolge due sole funzioni:

1. configura monitoraggi AI per censire norme, decreti, regolamenti, determine, delibere, linee guida, circolari e standard entro uno scope dichiarato;
2. raccoglie e accompagna segnalazioni di eventi, quasi incidenti e possibili incidenti fino a una formulazione amministrativa verificata dall'utente.

## Avvio

Richiede Node.js 22 o superiore.

```bash
./ictc.sh start --no-open
```

Apri `http://127.0.0.1:4173`.

```bash
./ictc.sh status
./ictc.sh stop
npm test
```

## Primo utilizzo

1. entra come **Amministratore** nella modalità locale;
2. configura endpoint compatibile OpenAI, modello, nome della variabile d'ambiente contenente la chiave e i due prompt globali;
3. crea un monitoraggio indicando scope, tipi documentali, autorità, fonti iniziali e frequenza;
4. gli utenti consultano il catalogo e aggiungono link, testo o documenti da un unico form;
5. gli utenti registrano eventi o quasi incidenti, generano una bozza AI, la modificano e la inviano.

La chiave API non viene salvata nel database. Esempio:

```bash
export ICTC_LLM_API_KEY='...'
```

## Confini

ICTC produce **candidati e bozze**. Non determina applicabilità normativa, conformità, significatività dell'incidente o obblighi di notifica. I promemoria 24 ore, 72 ore e un mese sono supporti operativi derivati dalla data inserita.

Architettura, riferimenti e saturazione sono documentati in:

- `docs/PRODUCT_BLUEPRINT.md`
- `docs/RUNTIME_E2E.md`
- `docs/REFERENCES.md`
