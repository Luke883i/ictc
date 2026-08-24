# ICTC Workspace Design System — current authority map

Questo documento descrive il **design system corrente** senza confondere owner canonici ed effetti transitori della stratigrafia runtime.

## Authority corrente

- `v3/public/design-tokens.css` possiede i token visuali condivisi: tipografia, colori, spacing, radius, elevation, motion, focus e le famiglie `--chrome-*`, `--landing-*` e `--home-action-*`.
- `v3/public/workspace-chrome-3-3.css` è il **solo owner bounded del chrome globale**: header e footer stabili. Workspace Chrome resta versione `3.3`.
- Gli owner locali 3.2/3.2.1 possiedono gerarchia e composizione delle rispettive superfici.
- `v3/public/workspace-finetuning-3-4.css` è l'**effective transitional presentation closure** attualmente caricata dopo 3.3. Corregge output visivi su chrome, landing, Home, Evidenze e catalogo processi, ma **non è un nuovo design-system owner** e non deve diventare la destinazione di nuove responsabilità.

La distinzione è intenzionale: **declared owner != effective final cascade** finché la closure 3.4 non viene assorbita e ritirata.

## Linguaggio visuale

La base canonica usa `Inter Variable`, `Inter` e system UI; superfici business chiare; testo navy; indigo come brand; teal come accento; status success/warning/danger/info separati. Il chrome usa una famiglia navy -> blue distinta dalle superfici business. Il colore non costituisce mai un verdetto di compliance.

I controlli permanenti mantengono contrasto elevato, target minimo 44 px ove applicabile, focus esplicito, supporto `forced-colors` e `prefers-reduced-motion`.

## Header e footer correnti

Il runtime corrente monta il logo canonico come SVG inline. Header e footer usano gradienti a tre stop derivati dai token condivisi. Il footer corrente rende solo `ICTC · MIT · Repository · Condizioni`: **`Candidate` è assente**. `Condizioni` punta esclusivamente a `docs/OPEN_SOURCE_TERMS.md` su GitHub; `/terms.html` non è una seconda source of truth.

## Landing e Home

Home, Processi di Compliance ed Evidenze ICTC condividono oggi una grammatica landing chiara e luminosa basata su token. La Home usa una work summary compatta con CTA allineata `Apri` + SVG `arrow-up-right`; questa presentazione non modifica routing, procedure state o write authority.

## Evidenze e catalogo processi

Evidenze ICTC mantiene il **Reticolo epistemico come prima disclosure canonica** e non duplica entry EP-01/meta. Il catalogo processi usa geometria comparabile su desktop e altezza naturale su mobile. Questi effetti sono correnti, ma le rispettive semantiche restano negli owner locali.

## Debito visuale esplicito

Il percorso corrente contiene ancora molte generazioni CSS e la closure 3.4 usa override finali, inclusi `!important`, per neutralizzare regole precedenti. Questo è **visual debt noto**, non una nuova architettura target.

Regola di convergenza:

> preservare gli invarianti visivi correnti, assorbire le regole irriducibili nei veri owner e cancellare causa + compensazione; nessun test può richiedere la sopravvivenza di una regola legacy solo per dimostrare che una closure successiva la sovrascrive.

## DoD corrente

- chrome owner canonico: `design-tokens.css` + `workspace-chrome-3-3.css`;
- effective presentation closure registrata: `workspace-finetuning-3-4.css`;
- `Candidate` nel footer corrente: `0`;
- logo raster nel header corrente: `0`;
- global navigation surfaces: `3`;
- minimum permanent-control target: `44px` ove applicabile;
- nuovi business/write owner introdotti dalla closure 3.4: `0`;
- nuovi participant C0.1 introdotti dalla closure 3.4: `0`;
- test di presentazione: devono proteggere **invarianti osservabili**, non la permanenza delle cause legacy.

## Claim boundary

I test statici e le mutation campaign del design system provano soltanto i contratti dichiarati. Non equivalgono a user study, browser session indipendenti, certificazione WCAG, parere legale, assurance di deployment o preferenza estetica umana.
