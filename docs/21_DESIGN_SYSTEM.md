# ICTC Workspace Chrome Design System 3.3

Questo documento canonizza il contratto visuale del **chrome globale** ICTC: header principale, controlli permanenti e footer principale. Non possiede semantica business, lifecycle delle procedure, decision authority o C0.1; tali authority restano negli owner correnti 3.2/3.2.1.

## Prompt operativo consolidato

Rifinire header e footer senza introdurre un nuovo presentation owner: usare token condivisi, preservare le tre superfici canoniche e i controlli esistenti, ridurre rumore e drift cromatico, mantenere target accessibili e responsive, e fare del repository GitHub l'unica destinazione del link `Condizioni` nel footer corrente.

## Linguaggio visuale

Il chrome usa una direzione **deep navy → blue**, con superfici di controllo bianche e stato attivo indigo. Teal, amber, success e danger restano accenti semantici secondari e non costituiscono mai un verdetto di compliance. Le business surfaces rimangono chiare e separate dal chrome.

La tipografia canonica è `Inter Variable`, poi `Inter`, quindi la system UI stack; nessun font file è necessario al runtime. Il monospace resta riservato a digest, identificatori tecnici e codice.

## Token authority

`v3/public/design-tokens.css` è l'unico owner dei valori cromatici e tipografici condivisi. Il chrome consuma esclusivamente la famiglia `--chrome-*`: header, footer, testo su fondo scuro, control surface, active state, focus e shadow. `v3/public/workspace-chrome-3-3.css` applica quei token, è caricato dal workspace owner dopo la closure 3.2.1 ed è ora il **solo owner canonico ed effettivo** dell'intero stable chrome corrente.

Non duplicare literal cromatici del chrome in nuovi fogli. Un nuovo colore richiede prima un token con ruolo dichiarato.

## Header

L'header conserva la composizione corrente: brand, tre superfici `Home / Processi di Compliance / Evidenze ICTC`, comando `Vai a…`, contesto DEMO quando presente, profilo/ruolo e stato runtime. La rifattorizzazione è visuale: nessun elemento assume nuova authority.

Regole: controlli chiari ad alto contrasto sul fondo navy-blue; active state espresso da forma, contrasto e colore; target interattivi almeno 44 px; focus sempre visibile; a larghezze ridotte si comprime il dettaglio, non si elimina la navigazione canonica. Il logo canonico è montato come SVG inline e la relativa geometria appartiene a `workspace-chrome-3-3.css`.

## Footer

Il footer resta persistente, compatto e non decisionale. Copy canonica corrente: `ICTC · MIT · Repository · Condizioni`; **`Candidate` è assente**. `MIT` e `Repository` puntano a GitHub; `Condizioni` punta esclusivamente a `docs/OPEN_SOURCE_TERMS.md` su GitHub. La route locale `/terms.html` può sopravvivere come compatibilità storica, ma non è una destinazione del footer corrente e non è una seconda source of truth.

La presentation corrente del footer — gradiente a tre stop, grid compatta, hit-area dei link, hover/focus, responsive behavior, forced-colors e reduced-motion — è applicata integralmente dal chrome owner 3.3.

## Effective presentation closure 3.4

Il Workspace Chrome resta versione e authority **3.3**. Il runtime corrente carica inoltre `v3/public/workspace-finetuning-3-4.css` dopo il chrome come **effective transitional presentation closure**, ma il suo scope è ora residuale: landing continuity, Home summary/actions ed Evidence presentation.

Il chrome globale è stato assorbito in `workspace-chrome-3-3.css`; il catalogo Processi è stato assorbito in `semantic-workspace-closure-3-2-1.css`. Di conseguenza `workspace-finetuning-3-4.css` contiene **zero selettori `.stable-header`, `.stable-legal-footer`, `.stable-footer-product`, `.stable-footer-links` e zero selettori `#procedureHub`**.

La 3.4 resta registrata come AS-IS e come debito di convergenza, non come nuovo design-system owner permanente. Il target è assorbire gli invarianti osservabili residuali nei rispettivi owner canonici e ritirare il final resolver. I test di presentation closure devono proteggere l'output osservabile e non richiedere la sopravvivenza di una causa legacy esclusivamente per dimostrare che una regola successiva la sovrascrive.

## DoD minimo

- un solo owner token: `design-tokens.css`;
- un solo owner canonico/effettivo del chrome 3.3: `workspace-chrome-3-3.css`;
- tre sole superfici globali canoniche;
- target header/footer >= 44 px ove applicabile, focus visibile, forced-colors e reduced-motion gestiti;
- zero `href="/terms.html"` nel footer corrente;
- `Condizioni` -> GitHub `docs/OPEN_SOURCE_TERMS.md` con `noopener noreferrer`;
- `Candidate` assente dal footer corrente;
- stable chrome selectors nel residual 3.4: `0`;
- `#procedureHub` selectors nel residual 3.4: `0`;
- presentation del catalogo Processi posseduta da `semantic-workspace-closure-3-2-1.css`;
- zero nuovi participant C0.1, endpoint, write authority o stati business;
- campagna bounded: **10.000/10.000** mutazioni source-string deterministiche uccise su 20 failure family dichiarate.

## Metriche e checklist

| Metrica | Target |
|---|---:|
| Global navigation items | 3 |
| Chrome token owner | 1 |
| Chrome visual owner | 1 |
| Stable chrome selectors in 3.4 | 0 |
| `#procedureHub` selectors in 3.4 | 0 |
| Minimum permanent-control target | 44 px |
| Local terms links in current footer | 0 |
| `Candidate` in current footer | 0 |
| New business/write authorities | 0 |
| New C0.1 participants | 0 |
| Source-string mutations killed | 10.000/10.000 |
| Failure-family coverage | 20/20 |

Checklist di review: token prima dei literal; nessun copy business riscritto; nessuna collisione con Semantic Workspace Closure 3.2.1; header leggibile da desktop a mobile; footer persistente e non sovrapposto al lavoro; active/focus percepibili anche senza affidarsi al solo colore; forced-colors e reduced-motion non degradano comprensione; link legali senza superfici duplicate; responsabilità assorbite non ricompaiono nel final resolver; eventuali closure successive non diventano nuovi owner per inerzia di cascade.

## Falsificazione e claim boundary

`v3/workspace-chrome-3-3-saturation.mjs` esegue **10.000 source-string mutation executions** deterministiche sul contratto statico corrente, distribuite uniformemente su 20 failure family: token header/footer, font fallback, scope/versione, consumo palette header/footer, target size, responsive 900/640, forced-colors, reduced-motion, active state, focus, marker shell, terms authority, sicurezza del link esterno, bootstrap owner, current rail, contratto documentale e bounded scope. Ogni famiglia riceve 500 mutazioni; 10.000/10.000 devono essere rilevate.

Il kill-rate vale soltanto per questo vocabolario dichiarato. Non equivale a 10.000 browser session, code mutation indipendenti compilati/eseguiti, preferenze di 10.000 utenti, certificazione WCAG, parere legale o assurance del deployment.
