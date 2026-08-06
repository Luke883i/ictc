function makeSection(id, title, description, content, open = false) {
  const details = document.createElement('details');
  details.className = 'settings-section-18';
  details.dataset.settingsSection = id;
  details.open = open;
  details.innerHTML = `<summary><span><b>${title}</b><small>${description}</small></span></summary><div class="settings-section-body"></div>`;
  content.classList.add('settings-field-stack');
  details.querySelector('.settings-section-body').append(content);
  return details;
}

function normalizeAdvanced(advanced) {
  advanced.className = 'settings-section-18';
  advanced.dataset.settingsSection = 'policy';
  advanced.open = false;
  const summary = advanced.querySelector(':scope > summary');
  if (summary) summary.innerHTML = '<span><b>Policy globali e prompt tecnici</b><small>Istruzioni predefinite condivise dai processi ICTC.</small></span>';
  let body = advanced.querySelector(':scope > .settings-section-body');
  if (!body) {
    body = document.createElement('div');
    body.className = 'settings-section-body settings-policy-stack';
    const movable = [...advanced.children].filter(node => node !== summary);
    body.append(...movable);
    advanced.append(body);
  }
  return advanced;
}

export function normalizeSettings18Structure() {
  const form = document.querySelector('#settingsForm');
  if (!form || form.dataset.settingsStructure18 === 'true') return false;
  const organization = form.elements.organizationName?.closest('section');
  const provider = form.elements.endpoint?.closest('section');
  const advanced = form.elements.monitoringPlan?.closest('details');
  const legacyBody = organization?.closest('.dialog-body');
  if (!organization || !provider || !advanced || !legacyBody) return false;

  const enclosing = legacyBody.closest('details.settings-section-18');
  if (enclosing) {
    enclosing.before(legacyBody);
    enclosing.remove();
  }

  legacyBody.classList.remove('two-pane-form');
  legacyBody.classList.add('settings-18');
  legacyBody.replaceChildren(
    makeSection('organization', 'Organizzazione e perimetro', 'Contesto usato dai processi ICTC.', organization),
    makeSection('provider', 'Connessione al provider AI', 'Endpoint, modello, chiave e temperatura globali.', provider, true),
    normalizeAdvanced(advanced)
  );

  const title = document.querySelector('#settingsTitle');
  if (title) title.textContent = 'Connessione e policy del provider';
  const meta = document.querySelector('#settingsDialog header p:not(.eyebrow)');
  if (meta) meta.textContent = 'Configura il provider globale. Baseline, autorità e tipi di cambiamento appartengono ai singoli job di ricerca.';

  const boundary = form.querySelector('.settings-job-boundary');
  const footer = form.querySelector(':scope > footer');
  if (boundary && footer) footer.before(boundary);
  form.dataset.settingsStructure18 = 'true';
  return true;
}

export function installSettings18Structure() {
  document.addEventListener('ictc:rendered', normalizeSettings18Structure);
  normalizeSettings18Structure();
}
