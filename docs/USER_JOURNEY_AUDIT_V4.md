# User journey e audit onto-epistemico

## Journey: una persona riceve una nuova determina e non sa che cosa farne

### 1. Entrata

La persona avvia ICTC con `./ictc.sh start`. Il profilo corrente è v3 e lo status dichiara porta, processo e SOT. Non deve conoscere la storia delle versioni.

**Compressione:** un solo ingresso operativo. **Rischio:** confondere dati v2 e v3. **Controllo:** profilo e runtime isolati e visibili.

### 2. Orientamento

La persona apre Oggi e sceglie “Aggiungere nuova conoscenza”. La lente `Orientarmi` mostra oggetto, stato e prossima azione. `Decidere` aggiunge input e limiti; `Verificare` aggiunge produttore e receipt.

### 3. Acquisizione

La persona inserisce link oppure file e una nota. Prima della conferma la UI spiega che sta creando una fonte candidata.

```text
input umano -> blob o locator locale -> checksum -> proposta di metadati -> candidate -> receipt
```

Non equivale a fonte autorevole, applicabilità o perimetro completo.

### 4. Proposta AI

L'AI può proporre ecosistema, temi e sintesi. La label resta `Proposta AI`. L'assenza dell'AI non impedisce l'acquisizione deterministica. Non equivale a review, decisione o verifica.

### 5. Review

Una persona include o esclude la fonte. Prima della scelta vede input, proposta, limiti e conseguenza della transizione. Il write gate richiede conferma umana, persistenza, readback e receipt. Non equivale a obbligo applicabile o conformità.

### 6. Uso successivo

Il job di scouting può confrontare versioni e creare un finding. La materialità resta indeterminata fino a una review distinta.

### 7. Audit

La lente `Verificare` risale da una card a produttore, input, relazione, evento e receipt. Il registro dei gap mostra le capacità non implementate.

## Audit della chiarezza

| Passo | Domanda minima | Campo indispensabile | Errore da evitare |
|---|---|---|---|
| Entrata | Quale runtime sto usando? | profilo + porta + SOT | usare dati di un altro profilo |
| Orientamento | Che cosa richiede attenzione? | stato + prossima azione | mostrare tutto subito |
| Acquisizione | Che cosa sto creando? | `candidate` | chiamarla fonte valida |
| Proposta AI | Chi lo sta dicendo? | produttore AI | confonderla con review |
| Review | Che cosa cambia dopo il click? | before/after + limiti | successo generico |
| Audit | Come lo sappiamo? | input + receipt | usare il solo colore |

## Miglioramento reiterativo

Ridurre decisioni simultanee senza eliminare limiti; mostrare il produttore prima delle scelte ad alto impatto; mostrare `non disponibile` invece di inferire; separare fatto, proposta, review, decisione e verifica; validare con utenti reali comprensione, tempo al compito e capacità di spiegare il limite.
