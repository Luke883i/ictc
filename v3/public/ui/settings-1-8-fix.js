const PROVIDERS=Object.freeze({
  openai:{label:'OpenAI',endpoint:'https://api.openai.com/v1/chat/completions',key:'OPENAI_API_KEY'},
  anthropic:{label:'Anthropic',endpoint:'https://api.anthropic.com/v1/messages',key:'ANTHROPIC_API_KEY'},
  deepseek:{label:'DeepSeek',endpoint:'https://api.deepseek.com/chat/completions',key:'DEEPSEEK_API_KEY'},
  custom:{label:'Personalizzato (OpenAI-compatible)',endpoint:'',key:'ICTC_LLM_API_KEY'}
});
function providerFromEndpoint(value=''){const endpoint=String(value||'').toLowerCase();if(endpoint.includes('api.openai.com'))return'openai';if(endpoint.includes('api.anthropic.com'))return'anthropic';if(endpoint.includes('api.deepseek.com'))return'deepseek';return'custom';}
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

function ensureProviderJourney(form,providerSection){
  const endpoint=form.elements.endpoint,model=form.elements.model,key=form.elements.apiKeyEnv,temperature=form.elements.temperature;
  if(!endpoint||!model||!key||!providerSection||providerSection.querySelector('[data-ai-provider]'))return;
  const selector=document.createElement('label');selector.className='ai-provider-selector';selector.innerHTML='<span class="field-label">Provider</span><select data-ai-provider aria-label="Provider AI"><option value="openai">OpenAI</option><option value="anthropic">Anthropic</option><option value="deepseek">DeepSeek</option><option value="custom">Personalizzato (OpenAI-compatible)</option></select><small class="field-hint">Scegli il servizio; endpoint e credenziale predefiniti vengono proposti da ICTC.</small>';
  providerSection.prepend(selector);
  const select=selector.querySelector('select');
  const endpointLabel=endpoint.closest('label'),temperatureLabel=temperature.closest('label');
  let advanced=providerSection.querySelector('[data-ai-provider-advanced]');
  if(!advanced){advanced=document.createElement('details');advanced.dataset.aiProviderAdvanced='';advanced.className='ai-provider-advanced';advanced.innerHTML='<summary>Impostazioni avanzate</summary><div data-ai-provider-advanced-body></div>';const body=advanced.querySelector('[data-ai-provider-advanced-body]');if(endpointLabel)body.append(endpointLabel);if(temperatureLabel)body.append(temperatureLabel);providerSection.append(advanced);}
  let status=providerSection.querySelector('[data-ai-provider-status]');
  if(!status){status=document.createElement('div');status.className='ai-provider-status';status.dataset.aiProviderStatus='untested';status.setAttribute('role','status');status.innerHTML='<span data-ai-provider-status-text>Configurazione non ancora verificata.</span><button type="button" class="secondary" data-ai-provider-test>Verifica configurazione</button>';providerSection.append(status);}
  const sync=(applyDefaults=false)=>{const id=select.value,profile=PROVIDERS[id]||PROVIDERS.custom;if(applyDefaults&&id!=='custom'){endpoint.value=profile.endpoint;if(!key.value||Object.values(PROVIDERS).some(item=>item.key===key.value))key.value=profile.key;}endpoint.required=id==='custom';endpointLabel?.toggleAttribute('data-required-field',id==='custom');advanced.open=id==='custom';status.dataset.aiProviderStatus='untested';status.querySelector('[data-ai-provider-status-text]').textContent='Configurazione modificata: verifica prima dell’uso.';providerSection.dataset.aiProvider=id;};
  select.value=providerFromEndpoint(endpoint.value);sync(false);select.addEventListener('change',()=>sync(true));for(const control of[endpoint,model,key,temperature])control.addEventListener('input',()=>{status.dataset.aiProviderStatus='untested';status.querySelector('[data-ai-provider-status-text]').textContent='Configurazione modificata: verifica prima dell’uso.';});
}

export function normalizeSettings18Structure() {
  const form = document.querySelector('#settingsForm');
  if (!form || form.dataset.settingsStructure18 === 'true') return false;

  const organization = form.elements.organizationName?.closest('section');
  const provider = form.elements.endpoint?.closest('section');
  const footer = form.querySelector(':scope > footer');
  const header = form.querySelector(':scope > header');
  if (!organization || !provider || !footer || !header) return false;
  ensureProviderJourney(form,provider);

  const body = document.createElement('div');
  body.className = 'dialog-body settings-18';
  body.append(
    section('Organizzazione e perimetro', 'Contesto usato dai processi ICTC.', 'organization', organization),
    section('Connessione al provider AI', 'Scegli OpenAI, Anthropic, DeepSeek o un endpoint compatibile.', 'provider', provider, true),
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
  if (title) title.textContent = 'Configura il servizio AI';
  const meta = document.querySelector('#settingsDialog header p:not(.eyebrow)');
  if (meta) meta.textContent = 'Scegli il provider e il modello. ICTC mantiene endpoint e parametri tecnici nel livello avanzato e verifica la connessione senza delegare decisioni.';

  form.dataset.enterprise18 = 'true';
  form.dataset.settingsStructure18 = 'true';
  return true;
}

export function syncProviderSettings18(){const form=document.querySelector('#settingsForm'),provider=form?.querySelector('[data-settings-section="provider"] .settings-field-stack');if(!form||!provider)return;ensureProviderJourney(form,provider);const select=provider.querySelector('[data-ai-provider]');if(select){select.value=providerFromEndpoint(form.elements.endpoint?.value);provider.dataset.aiProvider=select.value;}}
export function installSettings18Structure() {
  normalizeSettings18Structure();
  document.addEventListener('ictc:rendered',()=>{normalizeSettings18Structure();syncProviderSettings18();});
}
