# Business Surface Convergence 2.7

## Intento

Muovere il prodotto da una UI semanticamente prudente ma ridondante a una UI di compliance operativa minimale, progressiva e business-oriented. Il primo livello deve rispondere a tre domande: **che lavoro sto governando, quale decisione umana viene dopo, quale traccia resta**. Provenienza, metodo, limiti e dettagli tecnici restano disponibili senza competere con l'azione.

## AS-IS

Le primitive di verità, autorità ed evidenza sono robuste, ma vengono spesso ripetute nello stesso viewport: hero, frame procedura, card, disclosure informativa e microcopy locale formulano varianti dello stesso messaggio. L'effetto è una UI corretta ma cognitivamente più costosa del necessario. Le procedure GRC condividono il runtime ma non sempre la stessa grammatica visiva di monitoraggio e incidenti. Home orienta il lavoro, ma le metriche non spiegano in modo abbastanza diretto origine e significato. La superficie chiamata `Postura ICTC` mescola sintesi, decisioni, runtime, deployment, standard ed export sotto un'unica etichetta astratta.

## TO-BE

- `Home` è la landing del lavoro: sei metriche business, ciascuna con origine ispezionabile e claim boundary implicito nel significato; nessun compliance score.
- `Processi di Compliance` mostra sette card con una proposizione visibile, segnali e CTA. Decisione, evidenza e limite sono progressive disclosure.
- Le sette procedure condividono grammatica frame + card record, mantenendo ontologia, endpoint e autorità locali.
- `Postura ICTC` diventa `Evidenze ICTC` e si separa in tab: Sintesi, Decisioni, Runtime, Deployment, Standard, Export.
- La conferma incidente dichiara esattamente ciò che la persona attesta: fatti disponibili, ignoto distinto, nessuna conclusione legale anticipata.
- Header e footer usano una cromia light-blue sobria, con geometria e accessibilità preservate.

## DoD globale

G1. Nessuna label attiva `Oggi` o `Postura ICTC`; navigazione canonica `Home / Processi di Compliance / Evidenze ICTC`.

G2. Ogni landing ha una sola proposizione di orientamento visibile; metodo, evidenza e limite secondari sono progressivi.

G3. Ogni procedura espone purpose, decisione umana, evidenza, limite e CTA reale senza duplicazione visibile.

G4. Le sette procedure condividono una geometria record-card e una grammatica procedure-card senza nuovi owner runtime.

G5. Home ha almeno 6 metriche, tutte con origine e significato ispezionabili; nessuna è presentata come punteggio di conformità/maturità.

G6. Evidenze ICTC ha 6 ambiti ontologicamente distinti e un solo pannello visibile alla volta.

G7. Ogni primary action conserva il runtime effect esistente; zero nuove write route, zero mutazioni access-policy, zero nuove decision authority.

G8. 390px: overflow documento = 0px; target interattivi >=44px; header/footer persistono senza coprire contenuto.

G9. Metodo 1: 10.000.000 mutazioni per ciascuno dei 12 ambiti target, tutte uccise, tutte le famiglie coperte.

G10. Metodo 2: frontiera M,N seguita da M+10.000 probe senza nuovo atomo richiesto e N+10.000 probe senza candidato più compresso che conservi tutte le separazioni semantiche.

## DoD locali e intermedi

**Home:** una headline, una frase ruolo-specifica, dashboard 6 metriche, origine disclosure per metrica, priorità come workload e non score.

**Hub procedure:** 7 card; massimo un paragrafo purpose visibile/card; zero H2/H3 nelle card; dettaglio decision/evidence/boundary chiuso per default; CTA >=44px.

**Procedure:** frame condiviso; CTA coerente col processo; autorità `Azione umana`/`Sola lettura`; record card uniforme; nessun oggetto assume subject type o stato di un altro processo.

**Incidenti:** conferma esplicita e leggibile; submit resta version-bound e richiede checkbox; chiusura richiede motivo e rende visibili i limiti residui.

**Evidenze ICTC:** un tab = una natura ontologica; i contenuti runtime esistenti vengono ricomposti, non duplicati; export e refresh continuano a usare gli handler esistenti.

**Reticolare:** `nav -> landing -> procedure -> record -> action -> receipt/evidence` mantiene la stessa identità di processo e non attraversa authority boundary implicitamente. `home metric -> runtime projection -> origine` resta ricostruibile. `incident formulation -> confirmation -> submit` preserva il binding della versione.

## Metriche sfidanti

- active legacy labels: 0
- procedure card: 7/7
- purpose visible/card: <=1
- H2/H3 dentro procedure card: 0
- progressive brief: 7/7
- Home business metrics: >=6
- metric origin disclosure: >=6
- Evidenze ICTC tabs: 6, visible panels: 1
- procedure families con record-card canonica: 7/7 quando esistono record
- touch target min: 44px
- overflow a 390px: 0px
- nuovi final owner: 0
- write route cambiate: 0
- M1: 120.000.000/120.000.000 killed
- M2: M=72, M+10.000 probes con novelRequiredAtoms=0; N=72, N+10.000 probes con betterValidCandidates=0

## Metodo 1 — falsificazione per ambito target

Gli ambiti sono navigation, home, procedure-hub, monitoring, incidents, objects, coverage, actions, risks, assurance, ictc-evidence, global-chrome. Per ogni ambito vengono generate 10.000.000 mutazioni deterministiche distribuite su 12 famiglie: tautologia, CTA opaca, heading duplicato, mix ontologico, authority errata, evidenza errata, boundary nascosto, azione morta, card drift, regressione densità, target piccolo, overflow. Ogni mutazione deve rendere invalido il modello e ogni famiglia deve essere colpita.

## Metodo 2 — frontiera bounded no-novelty / no-compressibility

La grammatica minima usa sei dimensioni indipendenti per ambito: orientation, purpose, human-decision, evidence, boundary, action. M è la chiusura target×dimensione (72 atomi). Dopo l'enumerazione vengono eseguiti M+10.000 probe di chiusura: nessun nuovo atomo richiesto può emergere dentro il dominio dichiarato. N è la frontiera di 72 slot semantici; N+10.000 candidati provano rimozioni o fusioni. Una rimozione perde una dimensione richiesta; una fusione tra dimensioni diverse perde separazione cognitiva/authority. Nessun candidato più piccolo resta valido.

Questi risultati sono una falsificazione deterministica del modello dichiarato, non prova universale di ottimalità, user research, legal opinion, certificazione o independent assurance.

## Checklist di pubblicazione

- branch parte dall'exact `main` post-PR93;
- commit semanticamente granulari;
- nessun nuovo `registerExperienceParticipant`;
- CSS 2.7 prima di `ui-convergence.css`, che resta final resolver;
- syntax check JS/Python;
- contract + M1 + M2 verdi;
- browser standard e DEMO verdi;
- suite corrente e browser journeys senza regressioni;
- Actions census exact-head verde;
- PR materializzata solo con scope coerente e provenance esplicita.
