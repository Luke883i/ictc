# Strategia di validazione

## Obiettivo

Dimostrare separatamente struttura, correttezza del dominio, wiring, comportamento runtime, accessibilità e operabilità della beta.

## Gate

1. **Repository contract** — file obbligatori e struttura minima;
2. **Schema validation** — contratti JSON e dati seed;
3. **Epistemic checks** — stati, produttori, input, limiti e authority;
4. **UI wiring** — ogni controllo dichiarato è collegato a un comportamento reale;
5. **Unit e domain checks** — funzioni deterministiche e invarianti;
6. **HTTP E2E** — fonti, review, scouting, eventi, owner e assistente;
7. **Runtime audit** — persistenza, readback, receipt, hash-chain e restart;
8. **Accessibility audit** — semantica, nomi accessibili, focus, tastiera, motion e contrasto di base;
9. **Documentation audit** — link locali, comandi e runbook;
10. **Visual validation** — browser reale quando disponibile, fallback dichiarato negli altri casi.

## Regola di evidenza

Un gate può essere dichiarato superato solo dal relativo validator. Un fallback statico non equivale a una prova browser-based; una baseline automatica non equivale a una certificazione WCAG; una simulazione di scouting non equivale a un'acquisizione normativa reale.

## Comando aggregato

```bash
./ictc.sh audit
```

Il comando usa una SOT temporanea per i test e non deve modificare i dati operativi dell'utente.
