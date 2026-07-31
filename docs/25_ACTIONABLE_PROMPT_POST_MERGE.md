# Prompt chiarito e reso azionabile

## Obiettivo

Valutare l'evoluzione introdotta dalle PR 1, 2 e 3, verificare il runtime corrente come lo incontra una persona, codificare i gap residui e introdurre una nuova iterazione che migliori ingresso operativo, chiarezza onto-epistemica, drill-down, test e portabilità.

## Attività

1. Audit retrospettivo di foundation, runtime audit e Living Evidence Atlas.
2. Descrizione delle superfici realmente visibili e delle relative catene runtime.
3. Audit di launcher, SOT, API, proiezioni, receipt, accessibilità e documentazione.
4. Simulazione della journey completa di arricchimento di una fonte.
5. Registro machine-readable di tutti i gap con impatto, rischio, path, test, evidenza e limite.
6. Launcher canonico con profili current, v2 e all.
7. Supporto Codespaces e dev container.
8. Guida end-user a tre lenti: orientarsi, decidere, verificare.
9. Validator per gap, UX, blob, launcher e journey end-to-end.
10. Pull request separata, revisionabile e con rollback.

## Definition of Done

- `./ictc.sh start` avvia il runtime corrente;
- v2 resta accessibile soltanto tramite profilo esplicito;
- `./ictc.sh audit` comprende suite storica e nuovi gate;
- i gap critici residui sono visibili e non trasformati in capacità simulate;
- la UI consuma il contratto epistemico e il registro gap a runtime;
- Codespaces inoltra la porta 4173 con visibilità privata;
- la CI verifica current, all, blob fixture e simulazione end-user;
- documentazione e README usano il comando canonico.
