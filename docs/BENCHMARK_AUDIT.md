# Benchmark di mercato e standard

## Metodo

Il benchmark non replica copy, layout o tassonomie. Estrae invarianti ricorrenti da standard, prodotti documentati e funzionalità emergenti; ogni invariante viene poi valutata rispetto ai due soli processi ICTC.

## Standard assorbiti

| Fonte | Invariante assorbita | Adattamento ICTC |
|---|---|---|
| ISO 37301 | ciclo continuo di definizione, implementazione, valutazione, manutenzione e miglioramento del sistema di compliance | monitoraggi revisionabili, sospendibili, rieseguibili e provati |
| European Legislation Identifier | URI stabili, metadati strutturati, interoperabilità e identificazione della fonte | identificatore/URL, osservazioni versionate, origine e fascicolo collegato |
| NIST SP 800-61 Rev. 3 | incident response integrata nelle attività di rischio, dalla preparazione al recupero e miglioramento | intake minimo, cronologia, azioni, formulazione, chiusura motivata e continuità |
| NIST AI RMF | govern, map, measure, manage come funzioni continue e trasversali | scopo AI, trace, limiti, retry, adozione umana e test lungo il lifecycle |
| ISO/IEC 42001 | gestione responsabile, trasparente e affidabile dei sistemi AI | configurazione globale amministrativa, prompt tracciati, output non autoritativi |

## Prodotti documentati

| Famiglia/prodotto | UX media o tipica | Invariante utile | Cosa ICTC non copia |
|---|---|---|---|
| Thomson Reuters Regulatory Intelligence | profili personalizzati, feed filtrati, alert e API | lo scope deve ridurre il rumore prima della review | portale editoriale e dashboard enterprise |
| Compliance.ai | horizon scanning, diff, annotazioni, impatto, task, obblighi e audit evidence | ogni cambiamento deve avere origine, versione, annotazione e decisione | mapping automatico a controlli fuori scope |
| CUBE | fonti globali, profiling, ontologia, AI con esperti e integrazioni | AI specializzata + controllo umano + distribuzione contestuale | ontologia GRC estesa e copertura globale dichiarata |
| Archer Evolv | listen → decide → act → assure → learn; lineage da fonte a evidenza; agenti vincolati | identità, scopo, giustificazione, audit record ed expert supervision | agent workforce autonomo e control fabric |
| IBM OpenPages | repository normativo, mapping, owner/task e workflow di impatto | separare acquisizione, valutazione e responsabilità | suite GRC e scoring multidominio |
| OneTrust DataGuidance | tracker, confronti, Copilot, alert personalizzati e obblighi collegati a workflow | ricerca assistita, confronto e passaggio ripetibile verso evidenza | knowledge portal generalista e privacy suite |
| ServiceNow SIR / Now Assist | contesto asset/rischio, playbook, sintesi AI, azioni consigliate, closure notes e post-incident analysis | AI per comprimere contesto e proporre passi, con ruoli e supervisione | automazione autonoma di remediation e piattaforma ITSM |

## UX media

La UX media del mercato presenta dashboard, feed, filtri, profili, tabelle dense, alert, task e detail panel. È efficace per organizzazioni grandi ma tende a chiedere configurazione e tassonomie prima che l'utente veda un esito.

## UX emergente

La UX emergente aggiunge Copilot, agenti, sintesi, next best action, generazione di closure notes e workflow autonomi. La qualità cresce quando l'agente è identity-bound, scope-constrained, role-masked, audit-emitting e sottoposto a human oversight. L'autonomia senza questi vincoli è un anti-pattern per ICTC.

## Adattamento ICTC

ICTC comprime il benchmark in due superfici:

1. **Fonti normative:** obiettivo → piano AI → revisione/attivazione → osservazioni → decisione motivata → fascicolo.
2. **Segnalazioni:** originale → AI Lens → domanda motivata → adozione/correzione → versione → conferma → fascicolo.

L'effetto innovativo non è una dashboard più ricca, ma una trasformazione visibile e reversibile: l'utente vede cosa è originale, cosa ha proposto l'AI, cosa ha adottato una persona e quale prova è stata emessa.

## Fonti pubbliche

- https://www.iso.org/standard/75080.html
- https://committee.iso.org/sites/tc309/home/projects/published/iso-37301-compliance-management.html
- https://csrc.nist.gov/pubs/sp/800/61/r3/final
- https://airc.nist.gov/airmf-resources/airmf/5-sec-core/
- https://eur-lex.europa.eu/content/help/eurlex-content/eli.html?locale=it
- https://www.thomsonreuters.com/en/products-services/risk-fraud/regulatory-intelligence
- https://www.compliance.ai/
- https://www.cube.global/
- https://www.archerirm.com/
- https://www.ibm.com/products/openpages/regulatory-compliance-management
- https://www.onetrust.com/products/data-guidance/
- https://www.servicenow.com/products/security-incident-response.html
