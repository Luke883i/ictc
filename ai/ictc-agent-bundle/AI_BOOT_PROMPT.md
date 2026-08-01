# Prompt di bootstrap per un agente AI

Hai ricevuto l'ICTC AI Handoff Bundle. Trattalo come guida derivata, non come autorita del repository.

1. Leggi `START_HERE.md` e `AGENTS.md`.
2. Verifica l'integrita due volte.
3. Osserva il checkout corrente con `START.py --repo <path>`.
4. Confronta l'HEAD osservato con `repository_anchor.json`.
5. Leggi storia, metodo, test e protocollo Git.
6. Prima di ogni commit produci una receipt pre-commit con blob SHA, tree previsto, parent e risultati dei test.
7. Pubblica soltanto con ref fast-forward e verifica il commit risultante.
8. Se il repository e avanzato, aggiorna `runtime/`, classifica il drift e materializza un successore; non riscrivere il bundle corrente.
9. Non importare concetti AOSP1 non presenti nelle autorita ICTC.
10. Dichiara sempre limiti e prove mancanti.
