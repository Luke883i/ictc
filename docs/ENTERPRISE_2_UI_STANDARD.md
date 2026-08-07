# ICTC Enterprise 2 — Surface Standard 1

## Perimetro

Questa slice nasce da un audit visivo delle evidenze renderizzate della PR #27 e introduce un'unica grammatica terminale per layout, densità, dialoghi, metriche, disclosure e vocabolario controllato. È un layer di presentazione: non aggiunge endpoint, capability, permessi, stati backend o conclusioni legali.

## Finding visuali osservati

1. **Metriche disaccoppiate.** Nelle card di Panoramica il numero e la relativa label potevano andare su righe diverse, rendendo ambiguo se `4` appartenesse a “fonti da verificare” o all'indicatore precedente.
2. **Chrome dei dialoghi incoerente.** Nel menu di configurazione del monitoraggio il pulsante di chiusura cadeva sotto il titolo invece di restare nell'angolo superiore destro; nel governo AI il controllo di chiusura risultava visivamente troppo alto.
3. **Footer mobile ingombrante.** A 320 px il footer della configurazione AI impilava due pulsanti a tutta larghezza e sottraeva una quota eccessiva del viewport al contenuto del form.
4. **Stepper mobile troppo verticale.** Tre passaggi impilati consumavano spazio prima che l'utente raggiungesse i campi operativi.
5. **Box-in-box.** Settings, monitoraggio e amministrazione accumulavano bordi di dialogo, pannello, gruppo e campo; la gerarchia dipendeva più dai rettangoli che dal contenuto.
6. **Proof disclosure non contenuta.** La riga “Accessibility · WCAG 2.2” poteva perdere il proprio contenitore, con triangolo e indicatore separati alle estremità della pagina.
7. **Tagline mobile rumorosa.** A 320 px il sottotitolo del brand si spezzava su più righe accanto ai controlli di ruolo.
8. **Vocabolario controllato incompleto.** Il valore tecnico `internal` restava visibile nel select di classificazione, mentre il resto della UI era localizzato.
9. **Placeholder percepito come prodotto.** Il testo `Descrizione.` compariva nella sintesi delle evidenze e dava l'impressione di contenuto incompleto pubblicato.
10. **Rischio di contaminazione amministrativa.** La composizione di test mostrava contenuti di identità sotto il governo AI; il layer terminale riafferma l'invariante di un solo pannello amministrativo diretto visibile.

## Standard unico

`ictc-surface-standard-1` applica le stesse regole a tutte le 22 superfici modellate.

### Layout

- larghezza pagina operativa massima: `1180px`;
- linea editoriale: massimo `68ch` per testo esplicativo;
- target interattivo di progetto: almeno `44px`;
- dialoghi ordinari: massimo `880px`, dialoghi complessi: massimo `960px`;
- chrome dei dialoghi: **header / unico body scrollabile / footer**;
- pulsante di chiusura: `44 × 44px`, sempre nel blocco header;
- profondità visibile dei bordi: massimo 2 livelli;
- una sola azione primaria prominente per contesto;
- una sola sezione di configurazione aperta;
- a 320 px lo stepper resta una riga di tre passaggi e non diventa una pila verticale;
- numero e label di una metrica sono un singolo oggetto DOM e visuale.

### Progressive disclosure

L'informazione necessaria per decidere o completare il task resta visibile. Metodo, dettaglio tecnico, standard, istruzioni facoltative e configurazioni secondarie restano in `details/summary`. Le disclosure non possono nascondere un'azione primaria o un campo necessario.

### Lessico

- nomi oggetto per titoli e campi;
- verbi espliciti per azioni;
- valori tecnici localizzati nella presentazione senza alterare il valore persistito;
- `Uso interno`, `Riservato`, `Limitato` per la classificazione visibile;
- `Scarica evidenza`, non “prova” quando si scarica un artefatto tecnico;
- nessuna label può trasformare una fonte candidata in fonte giuridicamente verificata;
- nessuna fase, badge o ricevuta può dichiarare conformità, applicabilità o certificazione;
- placeholder editoriali (`Descrizione.`, `TBD`, `TODO`) non sono contenuto finale e vengono soppressi.

## Copertura delle superfici

Il modello copre: Panoramica; monitoraggio; configurazione ricerca; revisione piano; elenco e dettaglio fonti; contributo; registro eventi; intake e workspace evento; evidenze e dettaglio evidenze; configurazione AI; sei aree amministrative; accesso federato; identità locali; ricevute; stati vuoti/errore/caricamento.

Ogni superficie è collegata nel file `enterprise-2-ui-standard-model.json` alle obbligazioni standard applicabili e ai relativi witness runtime/test.

## Standard di riferimento

- **WCAG 2.2**: 1.3.1, 1.4.10, 1.4.11, 2.4.3, 2.4.6, 2.5.8, 3.2.4, 3.3.2.
- **WAI-ARIA Authoring Practices Guide**: Accordion e Modal Dialog.
- **HTML Living Standard**: `details/summary`, `dialog`, `label` e controlli form nativi.
- **GOV.UK Design System**: layout small-screen-first, Details e question-page form guidance.
- **ICTC Surface Standard 1**: dieci invarianti interni che rendono verificabili densità, vocabolario, chrome e progressive disclosure.

Questi riferimenti sono criteri progettuali e di test. La slice **non dichiara conformità WCAG**, certificazione, validazione con un campione rappresentativo di utenti o production readiness.

## Saturazione tripla

### Asse M — novità

Le primitive di novità sono enumerate una volta sola tra superfici, componenti, layout, lessico, accessibilità e stati.

- `M = 102`
- conferma `M + 100 = 202`
- nuove primitive nella coda: `0`

### Asse N — contraddizioni

Le contraddizioni modellate comprendono associazioni spezzate, chrome incoerente, pannelli amministrativi simultanei, label divergenti, stati AI incoerenti, overflow e conflitti tra testo e colore.

- `N = 50`
- conferma `N + 100 = 150`
- nuove contraddizioni nella coda: `0`

### Asse Z — obbligazioni standard

Le 26 obbligazioni derivano dagli standard esterni e dagli invarianti ICTC. Una obbligazione è coperta soltanto se ha almeno una superficie applicabile e almeno un witness runtime/test.

- `Z = 26`
- conferma `Z + 100 = 126`
- obbligazioni senza copertura a Z: `0`
- nuove obbligazioni non coperte nella coda: `0`

La convergenza è bounded al modello dichiarato e non prova l'assenza universale di futuri difetti.

## Definition of Done

La slice è Done quando tutte le seguenti condizioni sono vere e falsificabili:

1. tutte le 22 superfici hanno una mappatura standard;
2. tutte le obbligazioni standard applicabili hanno witness;
3. metriche numero/label sono atomiche;
4. ogni dialogo usa header/body/footer coerenti;
5. il close resta nel header ed è almeno 44 × 44 px;
6. il footer non oscura i campi ed evita stacking non necessario a 320 px;
7. profondità border visibile <= 2;
8. una sola sezione di configurazione è aperta;
9. lo stepper resta compatto a 320 px;
10. la tagline del brand è soppressa sui viewport stretti;
11. i proof-standard sono contenitori completi;
12. nessun `Descrizione.`/`TBD`/`TODO` è reso come contenuto finale;
13. la classificazione visibile è localizzata;
14. un solo pannello amministrativo diretto è visibile;
15. nessun overflow a 320/390/zoom 200 nel browser contract;
16. forced colors e reduced motion mantengono operabilità;
17. M+100 ha novelty zero;
18. N+100 ha contraddizioni zero;
19. Z+100 ha standard non coperti zero;
20. il layer terminale non chiama API né modifica l'autorità server-side;
21. il browser server-backed sul medesimo HEAD deve passare prima della promozione della PR.

## Falsificazione

La slice fallisce se un test trova, per esempio, un numero separato dalla propria label, un close fuori dal header, due pannelli admin diretti visibili, `internal` mostrato all'utente, placeholder editoriale visibile, overflow orizzontale o una obbligazione standard priva di witness.
