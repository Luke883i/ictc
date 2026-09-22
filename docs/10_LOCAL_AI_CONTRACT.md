# Contratto AI locale

L'assistente riceve solo la capsula deterministica evocata dalla UI. La memoria dura per la singola sessione.

Può leggere gli oggetti della capsula e un manifest read-only della propria documentazione e del codice rilevante. Non può ampliare autonomamente il contesto globale, scrivere, promuovere fonti, confermare owner o produrre stati `human-reviewed`, `human-owned` o `verified`.

Ogni risposta è `ai-proposed`, cita gli oggetti usati e dichiara i limiti.


## Confine informativo di egress

La disponibilità di rete non autorizza l'esportazione di informazioni. Prima di costruire la richiesta provider, `v3/ai.mjs` sottopone la capsula canonica a `v3/runtime/ai-information-egress.mjs`.

Le classi runtime sono `PUBLIC`, `DERIVED_EXPORTABLE`, `LOCAL_CONFIDENTIAL` e `SECRET`; una classe sconosciuta converge almeno a `LOCAL_CONFIDENTIAL`. Il compute locale può trattare materiale confidenziale; l'egress verso un endpoint esterno ammette soltanto `PUBLIC` o `DERIVED_EXPORTABLE` e richiede l'opt-in organizzativo `governance.aiExternalEgressAllowed=true`. `SECRET` è bloccato dal model compute corrente.

Questa eligibility non sostituisce la network policy: DNS, indirizzi, TLS/HTTP, redirect e SSRF restano governati da `v3/network-policy.mjs`. Il receipt di information-egress è authority-zero e non rende il risultato del provider una decisione o una prova.
