# Governance ICTC

Questo file è la front door di governance per contributor e maintainer. Non crea una seconda autorità tecnica: rimanda agli owner canonici del repository.

## Decision authority

- `docs/authority-matrix.yaml` assegna l'owner di ogni superficie tecnica o semantica.
- `docs/ENGINEERING_GOVERNANCE.md` definisce quando una decisione richiede ADR e quali gate ingegneristici si applicano.
- `docs/PRODUCT.md` possiede identità, scopo e confini di prodotto.
- `docs/DOCUMENTATION_STANDARD.md` possiede classificazione e regole del sistema documentale.

Quando due documenti sembrano competere, prevale l'owner dichiarato dalla authority matrix; la data più recente o la presenza in una PR non crea authority.

## Change path

1. Individua problema, authority toccata e claim boundary.
2. Modifica l'owner esistente invece di aggiungere una seconda fonte di verità.
3. Aggiungi un falsificatore eseguibile per l'invariante cambiato.
4. Apri una PR con scope, non-goal, impatto epistemico, test ed eventuali dipendenze.
5. Il merge richiede i gate previsti dalla configurazione GitHub e dal repository per la exact head corrente.

La documentazione non auto-certifica branch protection, required review o status check configurati lato GitHub. Quando questi controlli sono richiesti, la loro effettiva configurazione va osservata sul repository.

## Ruoli

Il repository mantiene deliberatamente una governance minima: maintainer/reviewer e contributor. L'ownership tecnica è path/topic based, non conferita dal titolo personale. Se il numero di maintainer cresce, `CODEOWNERS` e questa pagina devono essere aggiornati prima di assumere review segregation non esistente.

## Sicurezza e condotta

Le vulnerabilità seguono esclusivamente [SECURITY.md](SECURITY.md), non issue pubbliche. Le richieste di supporto seguono [SUPPORT.md](SUPPORT.md). La collaborazione segue [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
