# ICTC AI Handoff Bundle — ingresso unico

Questo bundle rende un agente AI capace di orientarsi nel repository `Luke883i/ictc`, ricostruire il metodo di sviluppo, verificare lo stato corrente e produrre un successore aggiornato senza riscrivere silenziosamente il proprio nucleo.

## Avvio obbligatorio

1. Leggi `AGENTS.md`.
2. Verifica due volte il bundle:

```bash
python3 tools/verify_integrity.py .
python3 tools/verify_integrity.py .
```

3. Se hai un checkout ICTC, osserva il repository senza modificarlo:

```bash
python3 START.py --repo /percorso/al/checkout/ictc
```

4. Leggi, nell'ordine:
   - `runtime/USER_CARD.txt`;
   - `repository_anchor.json`;
   - `history/DEVELOPMENT_HISTORY.md`;
   - `method/DEVELOPMENT_METHOD.md`;
   - `method/TEST_AND_CONTROL_MATRIX.md`;
   - `method/GIT_OBJECT_PROTOCOL.md`.
5. Prima di una modifica genera una receipt pre-commit:

```bash
python3 tools/precommit_receipt.py . --repo /percorso/ictc --run quick
```

6. Dopo una nuova osservazione, non mutare questo bundle in place. Materializza un successore:

```bash
python3 tools/materialize_successor.py . --target /tmp/ictc-ai-bundle-next
```

Il repository e sempre l'autorita. Il bundle conserva metodo, prove, limiti e genealogia, ma non promuove da solo una release e non dichiara verde una CI non osservata.
