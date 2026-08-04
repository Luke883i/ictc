import { createHash } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { DEFAULT_COMPLIANCE_PROMPT, DEFAULT_INCIDENT_PROMPT, MAX_ATTACHMENT_BYTES, asString, id, now } from './domain.mjs';

function initialState() {
  return {
    schemaVersion: '1.0.0', revision: 0,
    settings: {
      organization: { name: 'Organizzazione', scope: 'Sicurezza delle informazioni in Italia e Unione europea' },
      llm: { endpoint: '', model: '', apiKeyEnv: 'ICTC_LLM_API_KEY', temperature: 0.1 },
      prompts: { complianceDiscovery: DEFAULT_COMPLIANCE_PROMPT, incidentDraft: DEFAULT_INCIDENT_PROMPT },
      updatedAt: null, updatedBy: null
    },
    jobs: [], contributions: [], complianceItems: [], incidents: [], audit: []
  };
}

export class Store {
  constructor(root) {
    this.root = root;
    this.statePath = path.join(root, 'state.json');
    this.attachmentsPath = path.join(root, 'attachments');
    this.queue = Promise.resolve();
    this.state = initialState();
  }
  async init() {
    await mkdir(this.attachmentsPath, { recursive: true });
    try {
      const parsed = JSON.parse(await readFile(this.statePath, 'utf8'));
      this.state = { ...initialState(), ...parsed, settings: { ...initialState().settings, ...(parsed.settings || {}), llm: { ...initialState().settings.llm, ...(parsed.settings?.llm || {}) }, prompts: { ...initialState().settings.prompts, ...(parsed.settings?.prompts || {}) } } };
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      await this.persist();
    }
    return this;
  }
  snapshot() { return structuredClone(this.state); }
  async mutate(actor, action, change) {
    let result;
    const operation = this.queue.catch(() => {}).then(async () => {
      const draft = structuredClone(this.state);
      result = await change(draft);
      draft.revision += 1;
      draft.audit.push({ id: id('audit'), at: now(), actorId: actor.id, role: actor.role, action, revision: draft.revision });
      if (draft.audit.length > 2_000) draft.audit.splice(0, draft.audit.length - 2_000);
      this.state = draft;
      await this.persist();
    });
    this.queue = operation.catch(() => {});
    await operation;
    return result;
  }
  async persist() {
    await mkdir(this.root, { recursive: true });
    const tmp = `${this.statePath}.tmp`;
    await writeFile(tmp, JSON.stringify(this.state, null, 2));
    await rename(tmp, this.statePath);
  }
  async saveAttachments(files = []) {
    const saved = [];
    for (const file of files.slice(0, 10)) {
      const name = asString(file.name, 240) || 'allegato';
      const mime = asString(file.mime, 160) || 'application/octet-stream';
      const raw = asString(file.dataBase64, 8_000_000).replace(/^data:[^;]+;base64,/, '');
      const buffer = Buffer.from(raw, 'base64');
      if (!buffer.length) continue;
      if (buffer.length > MAX_ATTACHMENT_BYTES) throw Object.assign(new Error(`Allegato troppo grande: ${name}`), { status: 413, code: 'attachment-too-large' });
      const sha256 = createHash('sha256').update(buffer).digest('hex');
      const attachmentId = id('file');
      await writeFile(path.join(this.attachmentsPath, attachmentId), buffer, { mode: 0o600 });
      saved.push({ id: attachmentId, name, mime, bytes: buffer.length, sha256, storedAt: now() });
    }
    return saved;
  }
}
