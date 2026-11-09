const profiles = Object.freeze({
  admin: Object.freeze({
    label: 'Amministratore',
    mode: 'read-write',
    modeLabel: 'Lettura e scrittura',
    can: [
      'Configurare provider AI, ambiente e governance.',
      'Creare, approvare, attivare, sospendere ed eseguire monitoraggi.',
      'Verificare o escludere fonti con motivazione.',
      'Gestire identità e consultare o chiudere tutti gli eventi.'
    ],
    cannot: [
      'Delegare all’AI approvazioni, applicabilità o obblighi di notifica.',
      'Trasformare materiale grezzo in fonte verificata senza decisione registrata.'
    ],
    effects: [
      'Può cambiare configurazione, identità e stato operativo.',
      'Ogni scrittura deve produrre receipt, actor, revisione e audit event.'
    ],
    evidence: [
      'Configurazioni e versioni.',
      'Decisioni motivate e receipt.',
      'Trace AI separate dalle decisioni umane.'
    ]
  }),
  user: Object.freeze({
    label: 'Utente',
    mode: 'contribute',
    modeLabel: 'Lettura e contributo',
    can: [
      'Consultare monitoraggi, fonti ed eventi accessibili.',
      'Aggiungere materiale originale senza classificarlo.',
      'Registrare, completare e inviare i propri eventi.'
    ],
    cannot: [
      'Configurare l’AI o l’ambiente.',
      'Verificare fonti, gestire identità o chiudere eventi di altri utenti.'
    ],
    effects: [
      'Può creare materiale e fascicoli propri.',
      'Non può attribuire validità, applicabilità o stato verificato.'
    ],
    evidence: [
      'Originali e allegati con digest.',
      'Risposte, versioni, conferme e receipt dei propri flussi.'
    ]
  }),
  auditor: Object.freeze({
    label: 'Auditor',
    mode: 'read-only',
    modeLabel: 'Sola lettura',
    can: [
      'Consultare monitoraggi, catalogo, tutti gli eventi e uso AI.',
      'Verificare integrità, provenienza, versioni, decisioni e limiti.',
      'Scaricare evidenze usando la propria identità attiva.'
    ],
    cannot: [
      'Creare, modificare, approvare, inviare o chiudere record.',
      'Configurare AI, ambiente, governance o identità.'
    ],
    effects: [
      'Le operazioni di consultazione non cambiano lo stato del runtime.',
      'L’export attesta operazioni registrate, non verità o conformità sostanziale.'
    ],
    evidence: [
      'Actor, timestamp, versioni, receipt e catena di integrità.',
      'Limiti espliciti su completezza, deployment e giudizio legale.'
    ]
  })
});

export function accessProfileFor(actor) {
  const profile = profiles[actor.role] || profiles.user;
  return {
    role: actor.role,
    label: profile.label,
    actorId: actor.id,
    identityMode: actor.identityMode || 'local',
    identityStrategy: actor.identityStrategy || actor.identityMode || 'local',
    identityProvider: actor.identityProvider || null,
    matchedBy: actor.matchedBy || null,
    mode: profile.mode,
    modeLabel: profile.modeLabel,
    capabilities: [...new Set(actor.permissions || [])].sort(),
    can: [...profile.can],
    cannot: [...profile.cannot],
    effects: [...profile.effects],
    evidence: [...profile.evidence],
    authoritySource: 'server-issued'
  };
}
