# ICTC · UI/UX e Homeboarding, reticolo di atterraggio semantico

Baseline: `main@8c31cfd82980cbf72dbd8c397a3048bd31a7e69d`. Provenienza del corpus: pre-PR V2 sigillata (`SEAL.json`, digest manifest `f01d1d5b039dfe2d9edac330cd5e71c701f808fef9eebb1668806811bf3f5e65`), con V1 immutabile (`870d0bbab4f1af18f7004b9ea8bccca1c2fb5428023784417be9d87509eb8c72`). La pre-PR V2 non era parte della main e le sue mutazioni riguardavano un modello autonomo.

## Contratti, proprietari e invarianti

| Codici | Owner corrente | DoD operativo e falsificatore |
|---|---|---|
| UI-01–04 | `public/ui/stable-shell.js`, `public/enterprise-workspace-3-2.css` | Una sola rappresentazione CRM negli esempi, disclosure evidente, priorità in righe a larghezza fluida senza cambiare selezione o permessi. Browser + source mutants. |
| UI-05–07 | `public/ui/procedure-frame.js`, `public/ui/process-compliance-placement.js`, `public/ui/ui-icons.js`, CSS closure | Processi in una sola lista operativa; perimetro, output e handoff nella riga canonica; sette identità, icone e permessi preservati; un solo contesto per superficie. |
| UI-08–09 | `public/ui/regulatory-surface.js`, `public/regulatory-surface.css` | Dalla regola al lavoro prima delle fonti, 5 guide/17 riferimenti ulteriori a righe con dettagli nativi; contatori del contenuto emesso, fonti e limiti conservati. |
| UI-10–11 | `public/ui-convergence.css`, `public/workspace-chrome-3-3.css`, `public/a6-ux1-fixed-safe-footer.css` | CTA canoniche, focus e touch target; footer persistente con nome esteso e riserva responsive senza occlusioni. |
| HB-01–12 | `public/ui/product-copy.js`, `public/ui/stable-shell.js`, `src/runtime/onboarding-policy.mjs`, `src/server.mjs`, `src/runtime/model.mjs` | Percorso iniziale di cinque capitoli con tutte e 15 le lezioni originali; il server convalida ordine, digest e attestazione; il Store registra le ricevute; nessun progresso client attribuibile come verità; demo e legacy separati. |
| X-01–18 | `tests/verification/`, `tests/browser/`, `package.json` | Invarianti source, API, browser, accessibilità, ruoli, tenant, replay e tenuta della CI. I controlli umani E3 rimangono esterni. |

## Confini di authority

La presentazione non introduce writer business, nuovi endpoint, autorità di applicabilità o bypass normativi. `PATCH /api/profile/onboarding` resta il solo writer di accettazione via Store, con identità dell'attore e tenant risolti dal server. La lista processi riusa il catalogo autorizzato. Le guide normative non diventano decisioni automatiche. La dichiarazione di presa visione non certifica lettura integrale o comprensione.

## Proof protocol

1. Verificare la SHA di base e la riproducibilità della catena; integrare soltanto sugli owner sopra elencati.
2. Eseguire `npm run check`, i verificatori di convergenza e i browser E2E su profili e viewport rilevanti.
3. Falsificare con mutanti negativi reali (bypass di capitolo, progresso client, digest stale, chiusura dialogo, handoff policy-ineligible, overclaim normativo, occlusione footer).
4. Registrare l'esito exact-head dei workflow GitHub. Fallimenti o copertura mancante impongono HOLD; "all green" non equivale automaticamente ad assurance enterprise.
5. Preservare i due archivi V1/V2 fuori dal runtime come evidenza storica; questo documento ne registra identità, non afferma che i byte integrali siano inclusi nella PR.
