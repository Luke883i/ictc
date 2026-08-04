# ICTC TO-BE — UX guidata dalla prova

## Regola di prodotto

Una domanda è ammessa soltanto quando la risposta:

1. cambia il passo successivo;
2. completa una prova;
3. abilita una decisione umana.

Il runtime conserva sempre il materiale originale prima di invocare l'AI.

## Processo 1 — Fonti normative

```text
obiettivo in linguaggio naturale
→ piano AI spiegabile
→ attivazione umana
→ esecuzione automatica
→ fonte candidata con provenienza
→ verifica o scarto umano
→ fascicolo esportabile
```

Il primo passo obbligatorio è una sola domanda: **che cosa deve sorvegliare ICTC?**

L'AI traduce l'obiettivo in query, fonti prioritarie, criteri di inclusione ed esclusione. Il piano appare prima dell'attivazione e conserva digest di prompt, input e output.

Un contributo umano richiede soltanto materiale: link, testo o file. Titolo, autorità, giurisdizione e tipo documentale non vengono chiesti all'ingresso.

## Processo 2 — Segnalazioni

```text
racconto originale + data di conoscenza
→ persistenza e digest allegati
→ AI Lens: fatti, ipotesi, segnali
→ una domanda motivata alla volta
→ formulazione AI o manuale
→ confronto con l'originale
→ conferma esplicita
→ fascicolo esportabile
```

Le classificazioni non vengono chieste nel primo form. Sono richieste dopo che il racconto è stato conservato, così la proposta AI e la decisione umana restano distinguibili.

## Effetti wow funzionali

- **Plan Reveal**: il piano AI compare in quattro pannelli animati — perimetro, ricerca, inclusioni, esclusioni.
- **AI Lens**: racconto originale e interpretazione AI restano visibili fianco a fianco.
- **Question Compass**: una domanda alla volta con “Perché ora” e “Come sarà usata”.
- **Origin Diff**: la formulazione finale evidenzia le parole non presenti nel racconto originario.
- **Proof Pulse**: ogni scrittura mostra revisione e hash senza interrompere il lavoro.

Gli effetti rispettano `prefers-reduced-motion` e non aggiungono stati o decisioni fittizie.

## DoD e metriche

| Metrica | Target |
|---|---:|
| Servizi primari | 2 |
| Ruoli | 2 |
| Domande obbligatorie per creare un piano | ≤ 1 |
| Domande obbligatorie nell'intake incidente | 2 |
| Azioni primarie per contesto | ≤ 1 |
| Domande con motivazione e uso probatorio | 100% |
| Scritture con ricevuta | 100% |
| Chiamate AI con trace | 100% |
| Allegati con SHA-256 | 100% |
| Soggetti esportabili come fascicolo | 100% |
| Perdita del racconto originale | 0 |
| Leakage di funzioni amministrative | 0 |
| Nuove primitive dopo M | 0 |

## Checklist runtime

- [x] Provider AI globale e prompt modificabili.
- [x] Piano monitoraggio prima dell'attivazione.
- [x] Scheduler e run manuale.
- [x] Catalogo con provenienza e decisione umana.
- [x] Punto unico per link, testo e file.
- [x] Intake incidente minimo e failure-safe.
- [x] Domande adattive con `whyNow` ed `evidenceUse`.
- [x] Formulazione AI modificabile e conferma umana.
- [x] Ricevute hash-chain, idempotenza e conflitto ottimistico.
- [x] Fascicoli JSON esportabili.
- [x] Persistenza verificata dopo riavvio.
