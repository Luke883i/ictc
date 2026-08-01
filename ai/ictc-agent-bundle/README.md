# ICTC AI Handoff Bundle v1

Bundle standalone, autoesplicativo, autoinstallante e autopoietico per agenti AI che lavorano su ICTC.

## Cosa contiene

- stato di partenza e arrivo osservato;
- cronologia dello sviluppo e della PR #8;
- metodo proof-oriented usato per analisi, patch, test e pubblicazione GitHub;
- matrice di test, controlli e limiti;
- protocollo pre-commit per blob e tree Git;
- strumenti read-only per doctor e refresh;
- materializzazione di un successore senza mutazione in place;
- manifest SHA-256, root digest e self-test senza dipendenze esterne.

## Uso rapido

```bash
python3 INSTALL.py --target /tmp/ictc-ai-bundle
cd /tmp/ictc-ai-bundle
python3 tools/verify_integrity.py .
python3 START.py --repo /path/to/ictc
```

## Confine

Il bundle descrive ICTC 1.0.0 nello scope locale single-user osservato al merge della PR #8. Non certifica conformita, completezza normativa, sicurezza enterprise o stato CI non osservato.
