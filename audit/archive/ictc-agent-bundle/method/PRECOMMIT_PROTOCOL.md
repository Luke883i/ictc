# Protocollo pre-commit

1. Assicurati che l'HEAD iniziale sia noto.
2. Stagia esclusivamente i path intenzionali.
3. Esegui `tools/precommit_receipt.py` con la classe di test adeguata.
4. Rifiuta la receipt se:
   - non esistono modifiche staged;
   - un path esce dallo scope consentito;
   - il blob calcolato non coincide con l'index;
   - un test fallisce;
   - l'HEAD cambia durante i test.
5. Confronta il tree previsto con il tree effettivamente pubblicato.
6. Conserva la receipt tra gli artefatti della lavorazione, non come prova di accettazione finale.

Esempi:

```bash
python3 tools/precommit_receipt.py . --repo /path/ictc --run quick
python3 tools/precommit_receipt.py . --repo /path/ictc --run full --allow v3 --allow docs
```

`--compare-git-write-tree` scrive soltanto l'oggetto tree nel database Git per confrontarlo; non crea commit e non aggiorna ref.
