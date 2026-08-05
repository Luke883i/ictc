# ICTC

**Integrated Compliance Tower Control** gestisce due soli processi:

1. **Fonti normative** — l'amministratore dichiara il risultato di sorveglianza; l'AI propone un piano; il runtime conserva intenti, versioni, run e osservazioni; una persona verifica o scarta ogni fonte candidata.
2. **Segnalazioni** — l'utente registra racconto originale, data di conoscenza e allegati; l'AI estrae fatti e gap; la persona adotta o corregge ogni proposta, salva versioni della formulazione e invia una versione identificata dal digest.

I soli ruoli applicativi sono `admin` e `user`. L'AI assiste in modo pervasivo, ma non possiede autorità di decisione o scrittura autonoma.

## Avvio

Richiede Node.js 22 o superiore.

```bash
npm ci
./ictc.sh start --no-open
```

Aprire `http://127.0.0.1:4173`.

## Provider AI

La configurazione amministrativa definisce endpoint, modello, prompt globali e nome della variabile d'ambiente contenente la chiave. La chiave non viene salvata nel runtime.

```bash
export ICTC_LLM_API_KEY='...'
```

Gli endpoint privati richiedono esplicitamente `ICTC_ALLOW_PRIVATE_AI=1`.

## Verifica

```bash
npm test
```

Il gate `1.5.0-rc.1` verifica:

- 18 invarianti di esperienza e 37 criteri Definition of Done;
- audit onto-epistemico e audit delle due user journey;
- saturazione astratta `M=88`, con 100 casi indipendenti successivi;
- saturazione del runtime reale `N=55`, con 50 casi indipendenti successivi;
- ricevute, idempotenza, conflitti, allegati, privacy, retry AI, versioni e fascicoli collegati;
- end-to-end HTTP, browser live e launcher.

I workflow separano contratto/audit, runtime, browser, launcher, sicurezza e prova post-merge.

## Confini

ICTC non determina applicabilità, conformità, significatività o obblighi di notifica. I risultati AI sono piani, estrazioni, suggerimenti e bozze da adottare o correggere. La catena hash locale dimostra coerenza interna delle registrazioni, ma non equivale a firma qualificata, marcatura temporale certificata o verità sostanziale.

Audit, benchmark e TO-BE sono documentati in `docs/`.
