# Metodo di sviluppo ICTC

## Ciclo fondamentale

```text
intento -> autorita -> preimage -> patch minima -> test mirato -> gate pertinenti
-> blob receipt -> tree -> commit -> ref fast-forward -> readback -> CI fresca
```

## 1. Intento e confini

Definisci obiettivo, non-obiettivi, path consentiti, falsificatore, rollback e criteri di accettazione. Una richiesta ampia viene scomposta in cambiamenti piccoli e verificabili.

## 2. Autorita e preimage

Prima di scrivere:

- risolvi branch e HEAD correnti;
- leggi le fonti autoritative del dominio interessato;
- acquisisci il blob SHA del file da modificare;
- verifica che il parent non sia cambiato prima della pubblicazione.

La documentazione derivata non deve prevalere su schema, runtime, manifest o workflow canonico.

## 3. Patch minima

Correggi la causa, non il sintomo. Mantieni il diff piccolo e semanticamente coerente. Quando il failure e nel test, non indebolire il prodotto: rendi il test compatibile con i guardrail reali.

Esempi osservati:

- import ES module mancante: aggiunta del solo simbolo `$$` all'import;
- CSP `script-src 'self'`: sostituzione di `wait_for_function` stringa con un locator DOM, senza introdurre `unsafe-eval`.

## 4. Prove stratificate

Ogni patch parte dal test piu vicino al failure e risale verso i gate completi:

1. sintassi o import linkage;
2. test unitario/contratto;
3. audit statico;
4. runtime con scritture e readback;
5. browser reale;
6. release check;
7. CI sul commit pubblicato.

Un livello verde non implica gli altri.

## 5. Ricevuta pre-commit

La receipt deve contenere:

- parent HEAD;
- branch e worktree state;
- path staged;
- blob SHA Git calcolati e confrontati con l'index;
- tree SHA previsto;
- test eseguiti con return code;
- path consentiti e violazioni;
- timestamp e limiti.

`tools/precommit_receipt.py` produce questa prova senza creare un commit.

## 6. Pubblicazione GitHub

Con API Git/GitHub:

1. crea i blob esatti;
2. crea un tree basato sul tree del parent;
3. crea il commit con parent esplicito;
4. aggiorna il ref con `force=false`;
5. recupera il commit e verifica diff, file e messaggio;
6. recupera PR/branch e verifica il nuovo HEAD;
7. osserva status/check del nuovo commit.

Con Git locale, il normale `git commit` e `git push` e equivalente se parent, scope e readback sono verificati.

## 7. Chiusura epistemica

Una patch e chiusa soltanto quando sono distinti:

- **implementato**: il codice e scritto;
- **testato localmente**: prove riproducibili disponibili;
- **pubblicato**: commit e ref verificati;
- **CI osservata**: check relativo a quell'HEAD;
- **accettato**: merge/release o decisione umana.
