# DevOps e CI/CD

Ogni PR esegue contract, schemi, label, invarianti epistemiche, wiring, test di dominio, ASCII export ed E2E. Workflow separati eseguono visual validation e CodeQL/dependency review.

Il futuro deployment usa artifact immutabile, staging, smoke test, migrazione dry-run, approvazione, canary o blue/green, verifica post-deploy e receipt di deployment.

`main` non deve ricevere merge con gate rossi o modifiche non revisionate a schema, API, auth o AI authority.
