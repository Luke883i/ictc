# ICTC 1.7 Enterprise Clarity — audit visivo e cognitivo

## Intento

La release 1.7 riduce il rumore senza ridurre l'informazione. Ogni superficie deve mostrare subito una sola decisione primaria, il suo motivo e il suo effetto. Autorita, metodo, AI, evidenze, standard e limiti restano completi ma passano a dialog interni o disclosure native quando non sono necessari alla decisione corrente.

## Finding su main 1.6

1. La Home conserva una buona capsula decisionale ma mostra contemporaneamente priorita, quattro spiegazioni, metodo, stato, autorita e trust brief.
2. Monitoraggio presenta nello stesso viewport orientamento, form, guida, stato AI, piani, fonti e contributi.
3. Eventi combina spiegazione, diagramma del processo, CTA e lista fascicoli.
4. Standard Proof e completo ma apre subito una lunga pagina con architettura, flussi, dodici benchmark, glossario e limiti.
5. Admin presenta postura, azioni, utilizzo, governance e utenti nello stesso piano visivo.
6. Il router operativo e la superficie proof hanno autorita concorrente sulla visibilita; il post-merge ha falsificato la journey tastiera lasciando `proofView` nascosta.
7. L'HTML canonico contiene ancora copy precedente che viene rinominato dopo il bootstrap JavaScript.

## Principi 1.7

- summary first, detail on demand;
- una CTA primaria, azioni secondarie visivamente subordinate;
- testo che nomina funzione ed effetto;
- niente dettaglio cancellato: ogni riduzione ha un percorso di accesso interno;
- una sola autorita di routing;
- superfici piu larghe quando questo riduce altezza e scansione verticale;
- separatori e ritmo al posto di ombre decorative;
- contenuto specialistico nel punto in cui serve, non ripetuto in ogni pagina;
- stato, autorita ed evidenza non dipendono da colore o icone.

## Audit pagina per pagina

### Home

Visibile: ruolo, priorita, perche ora, esito, CTA primaria e accesso al contesto. Metodo, perche tu, come, metriche e responsabilita sono disponibili nel dialog `Il tuo contesto` e nelle disclosure di autorita e trust.

### Monitoraggio

Visibile: scopo, form della decisione primaria, stato dei piani e fonti. Le istruzioni avanzate restano chiuse; la guida e una disclosure compatta. I campi sono orizzontali su desktop e lineari su mobile.

### Eventi

Visibile: scopo, CTA `Registra evento` e fascicoli. La sequenza racconto-analisi-chiarimenti-evidenze non occupa piu il primo piano ed e spiegata nel dialog contestuale.

### Guida e prova

Visibile: definizione, capacita del ruolo, confine, postura sintetica e una CTA `Apri mappa completa`. Architettura, flussi, standard, glossario e limiti sono nel dialog interno, sempre read-only.

### Amministrazione

Visibile: postura e controlli prioritari. Utilizzo, governance e directory sono disclosure indipendenti. Nessun nuovo workflow di scrittura viene introdotto.

## Definition of Done

La DoD eseguibile e nel contratto `v3/enterprise-1-7-contract.json`. I criteri principali sono router unico, una CTA primaria, canonical copy, budget geometrici, target da 44 px, no overflow, zero write auditor, stati di recovery, M+100 senza novelty e workflow static/runtime/browser/security verdi sullo stesso commit.

## Confine

L'audit e una prova ingegneristica del repository e del runtime locale. Non sostituisce ricerca con utenti rappresentativi, test con screen reader e dispositivi reali, audit WCAG/EN 301 549, verifica del deployment o valutazione legale.
