# ICTC Workspace Design System — current authority map

Questo documento descrive il **design system corrente** senza confondere owner canonici ed effetti transitori della stratigrafia runtime.

## Authority corrente

- `v3/public/design-tokens.css` possiede i token visuali condivisi: tipografia, colori, spacing, radius, elevation, motion, focus e le famiglie `--chrome-*`, `--landing-*` e `--home-action-*`.
- `v3/public/workspace-chrome-3-3.css` è il **solo owner bounded del chrome globale** e ora contiene integralmente l'aspetto corrente di header/footer introdotto da 3.4/3.4.1: gradienti a tre stop, geometria del brand SVG, footer grid/hit-area e responsive behavior. Workspace Chrome resta versione `3.3`.
- `v3/public/semantic-workspace-closure-3-2-1.css` possiede la geometria/visibilità corrente del catalogo Processi.
- Gli owner locali 3.2/3.2.1 possiedono gerarchia e composizione delle rispettive superfici.
- `v3/public/workspace-finetuning-3-4.css` resta l'**effective transitional presentation closure** soltanto per landing, Home summary/actions ed Evidenze non ancora assorbite. Non possiede più chrome né catalogo Processi e non deve diventare la destinazione di nuove responsabilità.

La distinzione resta intenzionale: **declared owner != effective final cascade** soltanto per le responsabilità residuali ancora presenti in 3.4.

## Linguaggio visuale

La base canonica usa `Inter Variable`, `Inter` e system UI; superfici business chiare; testo navy; indigo come brand; teal come accento; status success/warning/danger/info separati. Il chrome usa una famiglia navy -> blue distinta dalle superfici business. Il colore non costituisce mai un verdetto di compliance.

I controlli permanenti mantengono contrasto elevato, target minimo 44 px ove applicabile, focus esplicito, supporto `forced-colors` e `prefers-reduced-motion`.

## Header e footer correnti

Il runtime monta il logo canonico come SVG inline. Header e footer usano gradienti a tre stop derivati dai token condivisi. Il footer rende solo `ICTC · MIT · Repository · Condizioni`: **`Candidate` è assente**. `Condizioni` punta esclusivamente a `docs/OPEN_SOURCE_TERMS.md` su GitHub.

Tutti questi invarianti sono ora applicati da `workspace-chrome-3-3.css`; `workspace-finetuning-3-4.css` contiene **zero selettori `.stable-header`, `.stable-legal-footer`, `.stable-footer-product` o `.stable-footer-links`**.

## Landing e Home

Home, Processi di Compliance ed Evidenze ICTC condividono oggi una grammatica landing chiara e luminosa basata su token. La Home usa una work summary compatta con CTA allineata `Apri` + SVG `arrow-up-right`; queste responsabilità restano temporaneamente nel residual 3.4 e sono il prossimo target naturale di assorbimento locale.

## Evidenze e catalogo processi

Evidenze ICTC mantiene il **Reticolo epistemico come prima disclosure canonica** e non duplica entry EP-01/meta. La presentation Evidence residuale resta ancora in 3.4.

Il catalogo Processi usa geometria comparabile su desktop e altezza naturale su mobile; la sua implementazione corrente è stata assorbita in `semantic-workspace-closure-3-2-1.css`. `workspace-finetuning-3-4.css` contiene **zero selettori `#procedureHub`**.

## Debito visuale esplicito

Il percorso corrente contiene ancora molte generazioni CSS. La closure 3.4 usa override finali per landing, Home ed Evidenze, ma ha già perso due famiglie di responsabilità: **chrome** e **catalogo Processi**. Questo è un negative authority delta misurabile, non una nuova generazione.

Regola di convergenza:

> preservare gli invarianti visivi correnti, assorbire le regole irriducibili nei veri owner e cancellare causa + compensazione; nessun test può richiedere la sopravvivenza di una regola legacy solo per dimostrare che una closure successiva la sovrascrive.

## DoD corrente

- chrome owner canonico/effective: `design-tokens.css` + `workspace-chrome-3-3.css`;
- catalogue presentation owner: `semantic-workspace-closure-3-2-1.css`;
- effective residual presentation closure: `workspace-finetuning-3-4.css` solo per landing/Home/Evidence;
- stable chrome selectors nel residual 3.4: `0`;
- `#procedureHub` selectors nel residual 3.4: `0`;
- `Candidate` nel footer corrente: `0`;
- logo raster nel header corrente: `0`;
- global navigation surfaces: `3`;
- minimum permanent-control target: `44px` ove applicabile;
- nuovi business/write owner: `0`;
- nuovi participant C0.1: `0`;
- test di presentazione: proteggono **invarianti osservabili**, non la permanenza delle cause legacy.

## Claim boundary

I test statici e le mutation campaign del design system provano soltanto i contratti dichiarati. Non equivalgono a user study, browser session indipendenti, certificazione WCAG, parere legale, assurance di deployment o preferenza estetica umana.
