# ICTC Reborn 3.0 — Definition of Done

## Home decisionale

- La Home ha tre sole regioni di primo livello: decisione, metodo, stato.
- La decisione mostra una sola CTA primaria.
- Sono visibili ruolo, priorità, perché ora, perché tu, come ed esito atteso.
- Ruolo AI, checkpoint umano ed evidenza sono disponibili nella stessa capsula tramite disclosure compatta.
- I percorsi Monitoraggio ed Eventi non sono duplicati in un pannello separato dalla navigazione.

## Human in the loop

- Ogni testo distingue originale, proposta AI, decisione umana ed evidenza.
- L'AI non è descritta come decisore, revisore, certificatore o fonte di verità.
- Ogni CTA di scrittura indica implicitamente o esplicitamente il checkpoint umano successivo.
- In assenza o degrado AI, originali, decisioni manuali ed evidenze restano disponibili quando il runtime lo consente.

## Ontologia e linguaggio

- Home, Monitoraggio, Eventi, Fonti, Materiali, Evidenze, Configurazione AI e Amministrazione sono i termini primari.
- Materiale, Fonte ed Evidenza non sono sinonimi.
- Eventi è il nome della superficie; incidente è una possibile classificazione interna, non il nome della sezione.
- Gli stati descrivono condizioni osservate o decisioni registrate e non conclusioni legali.

## Densità e composizione

- Nessuna hero Home supera 360 px di altezza nel viewport desktop di riferimento.
- Il titolo Home usa al massimo 3.4 rem e 18 caratteri medi per riga.
- Nessuna ombra è necessaria per distinguere le regioni principali.
- Il ritmo usa 4/8/12/16/24/32 px.
- La prima viewport desktop contiene CTA, spiegazioni essenziali, metodo e stato.
- Su mobile la CTA precede il dettaglio e la journey resta ordinata e scorrevole.
- Target minimi: 44 px, 48 px per pointer coarse.

## Completezza informativa

La capsula risponde ad almeno otto domande:

1. Cosa devo fare?
2. Perché adesso?
3. Perché spetta a me?
4. Come procedo?
5. Quale risultato ottengo?
6. Cosa farà l'AI?
7. Cosa devo confermare io?
8. Quale evidenza rimane?

## Metriche

- `primaryActionsPerHome = 1`
- `decisionQuestionsAnswered >= 8`
- `topLevelHomeRegions = 3`
- `duplicateOperationalRoutePanels = 0`
- `roleCoverage = 3`
- `aiStatesCovered = 3`
- `failureStatesCovered >= 4`
- `browserRoleJourneys = 3`
- `writeAuthorityLeakage = 0`
- `forbiddenLegalClaims = 0`
- `MPlus100Novelty = 0`

## Assurance

- Contratto statico Reborn 3.0 verde.
- Saturazione 1..M con set di primitive congelato.
- Cento scenari successivi a M introducono zero novità nel modello dichiarato.
- Browser product journey verifica la capsula per amministratore e utente.
- Browser auditor verifica sola lettura, provenienza, limiti ed evidenze.
- CI pubblica artifact contract, runtime e browser per lo stesso commit.

## Confine

La DoD certifica repository e selected runtime behavior. Non certifica deployment, accessibilità umana completa, conformità normativa, completezza delle fonti o verità sostanziale dei contenuti.
