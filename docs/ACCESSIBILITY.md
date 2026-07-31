# Accessibilità

## Obiettivo

La beta usa una baseline orientata a WCAG 2.2 livello AA. Non è ancora una dichiarazione formale di conformità.

## Contratto UI

- lingua documento dichiarata;
- landmark e skip link;
- navigazione interamente da tastiera;
- focus visibile e non affidato al solo colore;
- target principali di almeno 44 CSS pixel;
- etichette associate ai campi;
- dialoghi con nome accessibile e ritorno del focus;
- stato corrente della navigazione tramite `aria-current`;
- filtri e tab tramite `aria-pressed` o `aria-selected`;
- stato operativo tramite regione `role=status`;
- rispetto di `prefers-reduced-motion` e toggle manuale;
- nessun handler inline, coerentemente con la CSP.

## Progressive disclosure

Il primo livello mostra etichetta, stato, frase e prossima azione. Il dettaglio espone produttore, limiti e receipt. Questa separazione riduce il carico cognitivo senza nascondere la provenienza.

## Audit automatico

```bash
npm run audit:a11y
```

Il validator zero-dependency verifica:

- nomi accessibili statici;
- riferimenti `aria-labelledby`;
- etichette dei campi;
- tipi espliciti dei pulsanti;
- assenza di `tabindex` positivo e handler inline;
- focus ring;
- reduced motion;
- shortcut di ricerca;
- wiring dei risultati di ricerca;
- contrasto dei principali token della palette.

L'esito machine-readable è `artifacts/accessibility-audit.json`.

## Gate manuali ancora necessari

- VoiceOver su macOS e iOS;
- NVDA su Windows;
- zoom 200% e reflow;
- orientamento mobile;
- lettura delle tabelle/provenienze;
- comportamento dei dialoghi nei browser target;
- verifica di testo e messaggi con utenti non tecnici.

## Limiti noti

L'assistente laterale è un pannello contestuale, non un dialogo modale. Nella beta non blocca il resto dell'interfaccia; il suo stato aperto/chiuso è esposto tramite `aria-expanded` e `aria-hidden`.
