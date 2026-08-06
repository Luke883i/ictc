# ICTC 1.6 Standard Proof — audit olistico e Definition of Done

## Scopo e confine

Questo audit valuta `main` dopo la PR 22 come prodotto software, ambiente operativo e superficie di assurance. Il giudizio copre design system, accessibilita tecnica, compattezza, completezza, etichette, ontologia, Admin, onboarding, gradevolezza e capacita di produrre un effetto “wow” utile. Non costituisce parere legale, certificazione di standard, valutazione completa con tecnologie assistive o certificazione del deployment.

La release candidata e **1.6.0 Standard Proof**. “Standard proof” significa: per ogni promessa mostrare **pratica, evidenza e limite**.

## Metodo

La valutazione combina:

1. lettura del runtime, dei contratti, dei CSS, delle journey e dei controlli;
2. simulazioni mentali per nuovo utente, operatore, amministratore, auditor e tecnico;
3. falsificazione dei casi vuoto, carico, errore, conflitto, rete lenta, AI degradata, ruolo negato, mobile, tastiera, zoom 200% e lettura lineare;
4. confronto con benchmark di accessibilita, human-centred design, compliance management, cybersecurity governance, secure development, AI governance, servizi pubblici digitali, human factors e reliability engineering;
5. saturazione M → M+100 e compressione semantica N → N+100.

## Baseline osservata su 1.4

### Design system

La base 1.4 dispone di token nominali (`--color-*`, spazi, raggi, focus), ma `styles-base.css` reintroduce un secondo insieme di alias e valori (`--ink`, `--accent`, `--line`, ombre e raggi). Il risultato visivo e generalmente gradevole, ma due vocabolari cromatici convivono e i moduli Admin e operativi possono ricevere priorita diverse dalla cascata.

**Esito baseline:** coerente a livello di componenti, non ancora convergente a livello di token.

### Accessibilita

Punti forti:

- HTML nativo, skip link, landmark e dialog;
- testo associato agli stati, non solo colore;
- journey role-aware e least privilege visibile;
- supporto `prefers-reduced-motion`;
- CTA principale da 44 px nella Home 1.4.

Gap:

- il focus globale usa `outline:none` e box-shadow, meno robusto in forced colors;
- alcuni pulsanti secondari e azioni Admin non garantiscono 44 px;
- il dialog Admin ha `min-height:680px`, sfidante su viewport bassi e zoom;
- non esiste una prova browser dedicata a reflow, forced colors e onboarding lineare;
- nessuna claim di conformita puo sostituire test umani con screen reader, ingrandimento e dispositivi reali.

### Compattezza e densita

La Home 1.4 e ben compressa. Le aree operative conservano pero hero ampie, gradienti decorativi, card con ombre e spazi verticali non sempre proporzionati al compito. L’Admin presenta cinque pannelli nello stesso livello visivo e richiede un alto costo di scansione iniziale.

### Completezza

ICTC descrive bene il prossimo passo, l’autorita e il confine AI/uomo. Manca tuttavia una superficie unica che spieghi:

- cosa e ICTC e cosa non e;
- la sua architettura tecnica;
- come il dato attraversa i workflow;
- la differenza fra materiale, fonte, evidenza, fascicolo, receipt e trace AI;
- quali standard ispirano il prodotto;
- quali pratiche sono osservabili nel repository;
- quali controlli dipendono da deployment e organizzazione.

### Chiarezza delle label

La PR 22 ha corretto importanti collisioni fra Materiale, Fonte ed Evidenza. Restano termini specialistici distribuiti in viste diverse: readiness, attestazione, trace, receipt, capability, blocker. Senza glossario, il nuovo utente deve dedurne il significato dal contesto.

### Gradevolezza, bellezza e wow

Il baseline 1.4 e pulito e moderno, ma parte del “wow” deriva da gradienti, ombre e grande scala tipografica. Per un prodotto di governance il wow piu credibile e **epistemico**: vedere in un colpo d’occhio architettura, responsabilita, stato, prova e limite. La candidata 1.6 sostituisce decorazione non informativa con una rail architetturale, una postura leggibile e riferimenti verificabili.

## Rubrica euristica

I punteggi sono una valutazione progettuale ripetibile, non una misura scientifica o una certificazione.

| Dimensione | 1.4 as-is | Target 1.6 | Motivo principale |
|---|---:|---:|---|
| Coerenza design system | 5.8/10 | 8.8/10 | risoluzione finale degli alias sui token canonici |
| Accessibilita tecnica | 7.0/10 | 8.3/10 | outline robusto, 44 px, reflow, forced colors, stati espliciti |
| Compattezza | 6.8/10 | 8.5/10 | hero e Admin compressi senza nascondere il contenuto essenziale |
| Completezza esplicativa | 5.9/10 | 9.1/10 | nuova area Guida e prova per tutti i ruoli |
| Chiarezza etichette | 7.8/10 | 9.0/10 | glossario canonico e label funzione/effetto |
| Gradevolezza | 7.4/10 | 8.6/10 | ritmo, gerarchia, contrasto e continuita piu sobri |
| Wow utile | 6.5/10 | 8.4/10 | trasparenza verificabile invece di sola teatralita visiva |

## Simulazioni mentali

### Nuovo utente

Domande: dove sono, cosa posso fare, cosa rimane, cosa decide l’AI, cosa non certifica ICTC? La nuova area deve rispondere in tre blocchi visibili prima di richiedere espansioni.

### Operatore

Scenario: registra un fatto con AI non configurata e rete intermittente. L’originale deve restare distinguibile, l’errore deve essere esplicito e la label non deve chiedere una classificazione prematura.

### Amministratore

Scenario: apre Admin su laptop piccolo al 200%. Deve distinguere controlli runtime verificabili nel processo da gap di deployment esterni, senza un sesto workflow di scrittura. L’arricchimento e quindi un solo pannello read-only “Postura e confini”.

### Auditor

Scenario: runtime vuoto o molto denso. Deve ricostruire ruolo, architettura, catena, standard e limiti senza vedere azioni di scrittura e senza interpretare “allineato” come “certificato”.

### Tecnico

Scenario: deve capire rapidamente stack e confini. La guida mostra otto strati: esperienza, autorita, API, dominio, AI, store, evidenza e deployment. Non introduce una seconda fonte di verita.

## Benchmark limitrofi e standard

### Accessibilita e interazione

- **WCAG 2.2**: focus visibile, target, navigazione coerente, identificazione coerente, aiuto prevedibile e reflow. Riferimento: <https://www.w3.org/TR/WCAG22/>.
- **WAI-ARIA APG**: semantica nativa e comportamento prevedibile per disclosure e dialog. Riferimento: <https://www.w3.org/WAI/ARIA/apg/>.
- **EN 301 549** e **Direttiva (UE) 2019/882**: benchmark europei di accessibilita ICT e contesto di mercato. ICTC mantiene la validazione come evidenza esterna, non claim automatica.

### Human-centred design e human factors

- **ISO 9241-210:2019**: progettazione iterativa basata su utenti, compiti e contesto. Riferimento: <https://www.iso.org/standard/77520.html>.
- **NASA Human Integration Design Handbook** e **FAA Human Factors Design Standard**: salienza, leggibilita, etichette non ambigue, continuita e gestione del carico cognitivo in sistemi ad alta responsabilita.

### Compliance, governance e secure development

- **ISO 37301:2021**: governance, proporzionalita, trasparenza e miglioramento continuo del compliance management system. Riferimento: <https://www.iso.org/standard/75080.html>.
- **NIST CSF 2.0**: outcome di Govern, Identify, Protect, Detect, Respond e Recover. Riferimento: <https://www.nist.gov/publications/nist-cybersecurity-framework-csf-20>.
- **NIST SSDF 1.1 / SP 800-218**: pratiche di sviluppo sicuro e prove di release. Riferimento: <https://csrc.nist.gov/pubs/sp/800/218/final>.

### AI e trasparenza

- **Regolamento (UE) 2024/1689**: trasparenza, supervisione umana, traceability e confini di responsabilita. Riferimento: <https://eur-lex.europa.eu/eli/reg/2024/1689/oj>.
- Le linee guida della Commissione sull’Articolo 50 sono contesto corrente per la trasparenza; ICTC continua a non determinare classificazione o obblighi legali.

### Discipline adiacenti

- **GOV.UK Design System** e **USWDS**: plain language, right action, componenti prevedibili, progressive disclosure e accessibilita come baseline.
- **Site Reliability Engineering**: stato azionabile, separazione sintomo/causa, fallimento esplicito, recovery e semplicita operativa.

## Slice runtime candidata

1. **Contratto 1.6** — personas, benchmark, architettura, glossario, invarianti, metriche e confine.
2. **Saturazione e compressione** — M/M+100 per scenari e N/N+100 per primitive semantiche.
3. **Proiezione runtime read-only** — endpoint `/api/standard-proof`, derivato da contratto, attore autorizzato, readiness e integrita.
4. **Guida e prova** — quarta area di supporto, non terzo servizio operativo, con loading/error/retry.
5. **Convergenza visuale** — alias finali sui token canonici, focus outline, 44 px, forced colors, reduced motion e layout compatto.
6. **Admin minimo** — un pannello read-only con release, controlli runtime, gap deployment e catena.
7. **Certificazione di release** — static, runtime, browser, security e regressioni storiche sullo stesso commit.

## Saturazione M → M+100

Lo spazio dichiarato combina ruolo, journey, esperienza, viewport, input, condizione visiva, stato AI, stato dati, rete, evidenza, autorita e urgenza:

`3 × 5 × 3 × 3 × 3 × 3 × 3 × 4 × 3 × 3 × 2 × 3 = 787.320` scenari.

- stabilita: 128 scenari;
- **M = 787.448**;
- falsificazione: 100 probe;
- **M+100 = 787.548**;
- novelty attesa: **0**.

La saturazione e logica e limitata al modello dichiarato.

## Compressione N → N+100

Il mining parte da 153 termini fra primitive canoniche e alias. Ventinove alias vengono ricondotti a primitive esistenti.

- **N = 124** primitive canoniche;
- **N+100 = 224**;
- novelty attesa: **0**.

La compressione evita sinonimi concorrenti e mantiene il lessico ottimale nel repository.

## Definition of Done

- [ ] release `1.6.0` propagata a runtime, package, lock, claims e documentazione;
- [ ] quattro aree top-level, ma solo due servizi operativi canonici;
- [ ] introduzione role-aware per admin, user e auditor;
- [ ] architettura, flussi, standard, glossario, prova e limiti in una vista;
- [ ] ogni mapping contiene principio, pratica ICTC, evidence path e limitation;
- [ ] nessuna label “certificato”, “conforme” o equivalente senza evidenza esterna;
- [ ] un solo pannello Admin aggiuntivo e nessun nuovo workflow di scrittura;
- [ ] alias visuali risolti sui token canonici;
- [ ] focus visibile con outline, 44 px e forced-colors baseline;
- [ ] reflow mobile/zoom senza overflow orizzontale del documento;
- [ ] loading, errore e retry espliciti;
- [ ] endpoint proof read-only e senza segreti per tutti i ruoli;
- [ ] zero azioni di scrittura auditor;
- [ ] zero novelty a M+100 e N+100;
- [ ] CI, security, runtime e browser verdi sullo stesso commit.

## Limiti residui obbligatori

Restano esterni: ricerca con utenti rappresentativi, audit WCAG/EN 301 549 completo, screen reader multipli, conformita EAA, IdP, TLS, storage durevole, restore, scanner malware, osservabilita, SLO, valutazione legale e operating effectiveness dell’organizzazione.
