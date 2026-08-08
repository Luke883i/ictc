# S7 — MARKET / V1 CUTOVER

The permanent product shell is `Oggi / Processi / Prove`, with `Amministrazione` capability-scoped. Monitoring and incident surfaces remain operational workspaces opened from ProcessDefinition cards; they are not permanent product tabs. Search is role-scoped because it indexes only bootstrap-visible records. Current-view downloads use S5 export endpoints, and object evidence actions download bounded dossiers. Product identity is `ICTC Control Tower · V1 Experimental`; runtime semver remains independently `1.8.0` for lineage compatibility.

S7 also removes the hidden second navigation authority: programmatic navigation delegates to `surface-router.js`, while render only projects router state.
