function section(title, description, id, content, open = false) {
  const details = document.createElement('details');
  details.className = 'settings-section-18';
  details.dataset.settingsSection = id;
  details.open = open;
  details.innerHTML = `<summary><span><b>${title}</b><small>${description}</small></span></summary><div class="settings-section-body"></div>`;
  content.classList.add('settings-field-stack');
  details.querySelector('.settings-section-body').append(content);
  return details;
}

function policySection(form) {
  const details = document.createElement('details');
  details.className = 'settings-section-18';
  details.dataset.settingsSection = 'policy';
  details.innerHTML = '<summary><span><b>Policy globali e prompt tecnici</b><small>Istruzioni predefinite condivise dai processi ICTC.</small></span></summary><div class="settings-section-body settings-policy-stack"></div>';
  const body = details.querySelector('.settings-section-body');
  for (const name of ['monitoringPlan', 'complianceDiscovery', 'contributionEnrichment', 'incidentAnalysis', 'incidentDraft']) {
    const label = form.elements[name]?.closest('label');
    if (label) body.append(label);
  }
  return details;
}

export function normalizeSettings18Structure() {
  const form = document.querySelector('#settingsForm');
  if (!form || form.dataset.settingsStructure18 === 'true') return false;

  const organization = form.elements.organizationName?.closest('section');
  const provider = form.elements.endpoint?.closest('section');
  const footer = form.querySelector(':scope > footer');
  const header = form.querySelector(':scope > header');
  if (!organization || !provider || !footer || !header) return false;

  const body = document.createElement('div');
  body.className = 'dialog-body settings-18';
  body.append(
    section('Organizzazione e perimetro', 'Contesto usato dai processi ICTC.', 'organization', organization),
    section('Connessione al provider AI', 'Endpoint, modello, chiave e temperatura globali.', 'provider', provider, true),
    policySection(form)
  );

  const boundary = document.createElement('p');
  boundary.className = 'settings-job-boundary';
  boundary.textContent = 'La configurazione del singolo job — modalità, baseline, giurisdizioni, autorità e tipi di cambiamento — si gestisce in Ricerca normativa.';
  body.append(boundary);

  for (const node of [...form.children]) {
    if (node !== header && node !== footer) node.remove();
  }
  footer.before(body);

  const title = document.querySelector('#settingsTitle');
  if (title) title.textContent = 'Connessione e policy del provider';
  const meta = document.querySelector('#settingsDialog header p:not(.eyebrow)');
  if (meta) meta.textContent = 'Configura il provider globale. Baseline, autorità e tipi di cambiamento appartengono ai singoli job di ricerca.';

  form.dataset.settingsStructure18 = 'true';
  return true;
}

export function installSettings18Structure() {
  normalizeSettings18Structure();
  document.addEventListener('ictc:rendered', normalizeSettings18Structure);
}
