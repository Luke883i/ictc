# TO-BE runtime 1.5.0-rc.1

## Definition of Done sfidante

- due servizi e due ruoli, senza ontologie concorrenti;
- intento/racconto/materiale persistiti prima dell'AI;
- retry AI per planning, arricchimento e analisi;
- suggerimenti AI mai sufficienti senza adozione umana;
- ragione obbligatoria per decisioni che cambiano stato probatorio;
- osservazioni fonte append-only;
- formulazioni versionate e submit legato al digest;
- proiezione least privilege;
- allegati ripuliti quando una write fallisce;
- receipt su ogni write e trace su ogni AI success;
- fascicoli con manifest e oggetti correlati;
- restart, idempotenza e conflitti verificati;
- saturazione astratta `M+100` e runtime `N+50` non circolari;
- CI separata per contratto, runtime, browser, sicurezza e post-merge evidence.

## Metriche attese

| Metrica | Target |
|---|---:|
| originali preservati prima dell'AI | 100% |
| suggerimenti AI adottati/corretti esplicitamente | 100% |
| chiamate AI riuscite con trace | 100% |
| scritture con receipt | 100% |
| decisioni critiche con motivazione | 100% |
| formulazioni inviate già versionate | 100% |
| leakage di prompt/endpoint/materiale privato nella vista utente | 0 |
| nuove primitive dopo M | 0 |
| nuove primitive osservate dopo N | 0 |
| workflow CI indipendenti | almeno 4 |

## Risultati di saturazione

I valori sono generati dagli artifact della suite e non devono essere copiati manualmente nella release note.
