# Linguaggio end-user

## Scopo

ICTC usa un linguaggio aziendale di compliance che descrive **fonti, requisiti, perimetri, decisioni, responsabilita, azioni, evidenze e limiti** senza trasformare il software in un interprete autonomo della legge.

La regola primaria resta: **registrare non significa concludere**. Il testo di una norma, uno standard, un mapping, un rating, una ricevuta o una proposta AI non acquisiscono autorita ulteriore per il solo fatto di essere mostrati in UI.

## Glossario condiviso

- **Fonte normativa**: atto, documento o pubblicazione ricondotta a autorita, giurisdizione e versione osservata. Registrarla non prova autenticita, vigenza, completezza o applicabilita.
- **Standard o riferimento volontario**: riferimento tecnico, organizzativo o di buona pratica distinto dalla fonte normativa cogente.
- **Obbligo normativo**: prescrizione ricondotta a una fonte e a un contesto di applicabilita da valutare. ICTC non auto-determina che l'obbligo sia applicabile all'organizzazione.
- **Requisito di compliance**: unita di lavoro derivata o registrata per governare una prescrizione, un impegno o un criterio nel perimetro dichiarato. Non equivale da sola a obbligo giuridico applicabile.
- **Perimetro di lavoro**: ambito organizzativo o operativo scelto per l'analisi ICTC. Fuori dal perimetro di lavoro non significa giuridicamente non applicabile.
- **Decisione di applicabilita**: valutazione umana contestualizzata sul rapporto fra fonte, requisito, organizzazione, attivita e perimetro. Applicabile non significa attuato, efficace o conforme.
- **Mapping**: relazione dichiarata fra requisito e oggetti governati. Non dimostra equivalenza normativa, attuazione, efficacia o conformita.
- **Controllo**: misura organizzativa, procedurale o tecnica. Presenza e descrizione non provano operating effectiveness.
- **Azione correttiva**: impegno assegnato per trattare gap, finding, rischio o evento. Completata non significa verificata e chiusa.
- **Rischio di compliance**: scenario valutato con criteri interni, motivazione, base, trattamento e riesame. Rating e matrice non sono probabilita oggettive o qualificazioni regolatorie.
- **Evidenza**: informazione o artefatto collegato a claim, decisione o verifica. Disponibilita, integrita tecnica e sufficienza sostanziale restano distinte.
- **Decisione umana**: atto registrato da una persona autorizzata, riferito a oggetto, base, effetto e responsabilita.
- **Proposta AI**: output assistivo non vincolante; confidenza, formato valido e provenance non equivalgono a correttezza sostanziale.
- **Approvazione interna**: conferma organizzativa di una versione o di un insieme di risposte; non e assurance indipendente o certificazione.
- **Ricevuta ICTC**: traccia tecnica della mutazione; hash e receipt non equivalgono a firma qualificata, trusted timestamp o verita esterna.

Il vocabolario eseguibile corrispondente e in `v3/public/ui/semantic-foundation-model.js`; le azioni umane materiali e i relativi limiti sono in `v3/public/ui/semantic-foundation-actions.js`. Questi moduli implementano questa policy, non la sostituiscono.

## Grammatica proto-giuridica bounded

Prima di presentare una formulazione prescrittiva come rilevante per il lavoro, la vista deve mantenere separati quando disponibili: **fonte, autorita, giurisdizione, versione, perimetro, base e competenza decisionale**.

ICTC puo registrare che un testo contiene una prescrizione o che una persona ha assunto una decisione di applicabilita. Non deve trasformare automaticamente un testo normativo in obbligo applicabile, scadenza legale, dovere di notifica, responsabilita, violazione o conclusione di conformita.

## Azioni umane materiali

Una CTA che modifica uno stato o produce una decisione deve rendere ricostruibili almeno: oggetto, effetto, autorita richiesta, evidenza attesa, reversibilita e rilevanza. Le dimensioni di rilevanza correnti sono giuridico-regolatoria, sociale, etica, organizzativa, operativa, probatoria ed eventuale effetto esterno.

Queste dimensioni orientano la review umana; non calcolano automaticamente liceita, colpa, obbligatorieta, moralita, priorita regolatoria o sufficienza probatoria.

## Formulazioni consentite e vietate

Preferire formulazioni come: `osservato`, `proposta AI`, `da valutare`, `decisione di applicabilita`, `fuori dal perimetro di lavoro`, `mapping confermato`, `gap registrato`, `completamento inviato a verifica`, `approvazione interna`, `evidenza non disponibile`.

Evitare, salvo decisione umana esplicita e contestualizzata supportata dalla relativa base: `conforme`, `certificato`, `pienamente coperto`, `nessun rischio`, `fonte valida`, `incidente NIS2`, `notifica obbligatoria`, `non applicabile per legge`, `prova definitiva`.

Ogni label deve rispettare l'asse semantico effettivo e il relativo limite. Le informazioni tecniche come digest, atom, producer, raw payload e trace restano nel dettaglio progressivo e non devono sostituire il significato business dell'oggetto o della decisione.
