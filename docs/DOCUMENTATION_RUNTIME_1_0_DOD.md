# Documentation Runtime 1.0 — Definition of Done

## Intent

Rendere il sistema documentale ICTC una superficie operativa verificabile: un contributor deve poter passare da repository a product truth, authority, owner, test e percorso di review senza ricostruire la cronologia delle PR o interpretare la data dei documenti.

Questa slice è stacked su Native Semantic Lattice 3.2 e **non** modifica UI, runtime business, C0.1, process registry, persistenza o business write authority.

## Invarianti

1. `docs/START_HERE.md` è l'entrypoint documentale canonico; README resta la front door del repository.
2. `docs/PRODUCT.md` è l'unica product-intent authority. `00_PROMPT_CLARIFICATION.md` è source-input, non AS-IS.
3. `docs/documentation-manifest.json` registra lifecycle, mode, authority topic e assi di versione senza sostituire gli owner sostanziali.
4. Ogni authority topic registrato è univoco; lineage, roadmap, source-input e generated evidence non possono diventare authority current per implicazione.
5. Tutte le authority documentali current/policy/operating sono raggiungibili dall'entrypoint entro due link locali.
6. I contributor path pubblici separano defect, supporto e security disclosure; il bug form non invita alla pubblicazione di vulnerabilità.
7. Il PR template richiede affected authority, claim boundary, non-goal, rail corrente, test e rischio residuo.
8. `npm test` include `docs:check` nella rail semantic current.
9. La documentazione distingue product 1.8.0, UI composition 3.2, journey 2.2, constitution C0.1 e documentation runtime 1.0.
10. CI/model saturation restano bounded software evidence e non attestano branch protection, private vulnerability reporting o deployment assurance.

## Gate

```bash
npm run docs:check
npm run docs:saturation
npm test
npm run release:check
```

`docs:check` verifica file, manifest, unicità delle authority, product truth, front-door reachability, community routing, PR contract, package wiring e assenza dei drift current noti.

`docs:saturation` esegue una campagna deterministica su failure family documentali. Il numero di trial misura copertura del vocabolario modellato, non studi indipendenti con contributor reali.

## Non-goal

- nessuna modifica a `v3/public/`, `v3/runtime/`, C0.1 o alla composizione 3.2;
- nessuna nuova legal/compliance conclusion;
- nessuna attestazione che GitHub Private Vulnerability Reporting o branch protection siano abilitati: sono acceptance esterne osservabili solo lato repository settings;
- nessun tentativo di rendere tutti i documenti storici current.

## Merge dependency

Questa slice assume come base l'head di PR #99 (`agent/native-semantic-lattice-3-2`). Finché #99 non è in `main`, la PR documentale resta stacked per evitare duplicazione del diff 3.2. Dopo il merge della #99 può essere retargettata a `main` mantenendo invariato il proprio diff semantico.
