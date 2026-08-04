import { createHash } from 'node:crypto';
import { mkdir, open, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  DEFAULT_PROMPTS, MAX_ATTACHMENT_BYTES, MAX_ATTACHMENTS, asString, canonicalJson,
  id, now, sha256
} from './domain.mjs';

function initialState() {
  return {
    schemaVersion: '2.0.0', revision: 0,
    settings: {
      organization: {
        name: 'Organizzazione',
        scope: 'Sicurezza delle informazioni in Italia e Unione europea',
        jurisdictions: ['Italia', 'Unione europea'], sectors: []
      },
      llm: { endpoint: '', model: '', apiKeyEnv: 'ICTC_LLM_API_KEY', temperature: 0.1 },
      prompts: structuredClone(DEFAULT_PROMPTS), updatedAt: null, updatedBy: null
    },
    missions: [], runs: [], contributions: [], catalog: [], incidents: [], audit: [], commandResults: {}
  };
}

function mergeState(parsed) {
  const base = initialState();
  return {
    ...base, ...parsed,
    settings: {
      ...base.settings, ...(parsed.settings || {}),
      organization: { ...base.settings.organization, ...(parsed.settings?.organization || {}) },
      llm: { ...base.settings.llm, ...(parsed.settings?.llm || {}) },
      prompts: { ...base.settings.prompts, ...(parsed.settings?.prompts || {}) }
    },
    commandResults: parsed.commandResults || {}
  };
}

function eventHash(event) {
  const { hash, ...unsigned } = event;
  return sha256(canonicalJson(unsigned));
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
    await mkdir(this.attachmentsPath, { recursive: true, mode: 0o700 });
    try { this.state = mergeState(JSON.parse(await readFile(this.statePath, 'utf8'))); }
    catch (error) { if (error.code !== 'ENOENT') throw error; await this.persist(); }
    const integrity = this.verifyChain();
    if (!integrity.ok) throw new Error(`Audit chain non valida alla revisione ${integrity.atRevision}`);
    return this;
  }
  snapshot() { return structuredClone(this.state); }
  verifyChain() {
    let previousHash = 'GENESIS'; let expectedRevision = 1;
    for (const event of this.state.audit) {
      if (event.revision !== expectedRevision || event.previousHash !== previousHash || event.hash !== eventHash(event)) {
        return { ok: false, atRevision: event.revision, expectedRevision, expectedPreviousHash: previousHash };
      }
      previousHash = event.hash; expectedRevision += 1;
    }
    return { ok: true, events: this.state.audit.length, head: previousHash, revision: this.state.revision };
  }
  async mutate(actor, action, subject, input, change, command = {}) {
    let envelope;
    const operation = this.queue.catch(() => {}).then(async () => {
      const commandId = asString(command.id, 200);
      if (commandId && this.state.commandResults[commandId]) {
        const replay = this.state.commandResults[commandId];
        if (replay.actorId !== actor.id || replay.action !== action) {
          throw Object.assign(new Error('Identificativo comando già usato per un’altra operazione'), { status: 409, code: 'command-id-conflict' });
        }
        envelope = structuredClone({ ...replay.envelope, replayed: true });
        return;
      }
      if (command.expectedRevision != null && Number(command.expectedRevision) !== this.state.revision) {
        throw Object.assign(new Error('I dati sono cambiati. Ricarica e verifica il nuovo stato.'), {
          status: 409, code: 'revision-conflict',
          details: { expectedRevision: Number(command.expectedRevision), actualRevision: this.state.revision }
        });
      }
      const draft = structuredClone(this.state);
      const result = await change(draft);
      draft.revision += 1;
      const previousHash = draft.audit.at(-1)?.hash || 'GENESIS';
      const event = {
        id: id('event'), revision: draft.revision, at: now(), actorId: actor.id, role: actor.role, action,
        subject: subject ? { type: asString(subject.type, 80), id: asString(subject.id, 200) } : null,
        inputSha256: sha256(input ?? null), resultSha256: sha256(result ?? null), previousHash,
        metadata: structuredClone(command.metadata || {})
      };
      event.hash = eventHash(event);
      draft.audit.push(event);
      if (draft.audit.length > 10_000) throw Object.assign(new Error('Limite audit raggiunto'), { status: 507, code: 'audit-capacity' });
      const receipt = {
        eventId: event.id, revision: event.revision, at: event.at, action: event.action, subject: event.subject,
        actorId: event.actorId, previousHash: event.previousHash, hash: event.hash,
        inputSha256: event.inputSha256, resultSha256: event.resultSha256
      };
      envelope = { result: structuredClone(result), receipt, replayed: false };
      if (commandId) {
        draft.commandResults[commandId] = { actorId: actor.id, action, envelope: structuredClone(envelope), storedAt: now() };
        const keys = Object.keys(draft.commandResults);
        if (keys.length > 500) for (const key of keys.slice(0, keys.length - 500)) delete draft.commandResults[key];
      }
      this.state = draft;
      await this.persist();
    });
    this.queue = operation.catch(() => {});
    await operation;
    return envelope;
  }
  async persist() {
    await mkdir(this.root, { recursive: true, mode: 0o700 });
    const tmp = `${this.statePath}.${process.pid}.tmp`;
    const handle = await open(tmp, 'w', 0o600);
    try { await handle.writeFile(JSON.stringify(this.state, null, 2)); await handle.sync(); }
    finally { await handle.close(); }
    await rename(tmp, this.statePath);
  }
  async saveAttachments(files = []) {
    const saved = [];
    for (const file of files.slice(0, MAX_ATTACHMENTS)) {
      const name = asString(file.name, 240) || 'allegato';
      const mime = asString(file.mime, 160) || 'application/octet-stream';
      const encoded = asString(file.dataBase64, 8_000_000).replace(/^data:[^;]+;base64,/, '');
      const buffer = Buffer.from(encoded, 'base64');
      if (!buffer.length) continue;
      if (buffer.length > MAX_ATTACHMENT_BYTES) throw Object.assign(new Error(`Allegato troppo grande: ${name}`), { status: 413, code: 'attachment-too-large' });
      const attachmentId = id('file');
      const sha = createHash('sha256').update(buffer).digest('hex');
      await writeFile(path.join(this.attachmentsPath, attachmentId), buffer, { mode: 0o600, flag: 'wx' });
      saved.push({ id: attachmentId, name, mime, bytes: buffer.length, sha256: sha, storedAt: now() });
    }
    return saved;
  }
  async attachment(idValue) {
    const attachmentId = asString(idValue, 200);
    const all = [
      ...this.state.contributions.flatMap(item => item.attachments || []),
      ...this.state.incidents.flatMap(item => item.attachments || [])
    ];
    const metadata = all.find(item => item.id === attachmentId);
    if (!metadata) return null;
    return { metadata, buffer: await readFile(path.join(this.attachmentsPath, attachmentId)) };
  }
  evidenceBundle(type, subjectId, actor) {
    const state = this.snapshot(); let subject;
    if (type === 'mission') subject = state.missions.find(item => item.id === subjectId);
    else if (type === 'catalog') subject = state.catalog.find(item => item.id === subjectId);
    else if (type === 'incident') subject = state.incidents.find(item => item.id === subjectId);
    else if (type === 'contribution') subject = state.contributions.find(item => item.id === subjectId);
    if (!subject) return null;
    if (type === 'incident' && actor.role !== 'admin' && subject.createdBy !== actor.id) return null;
    const relatedIds = new Set([subjectId]);
    if (type === 'mission') {
      for (const run of state.runs.filter(item => item.missionId === subjectId)) relatedIds.add(run.id);
      for (const item of state.catalog.filter(item => item.origin?.missionId === subjectId)) relatedIds.add(item.id);
    }
    const events = state.audit.filter(event => event.subject && relatedIds.has(event.subject.id));
    return {
      schemaVersion: '1.0.0', generatedAt: now(), generatedBy: actor.id, type, subject,
      related: type === 'mission' ? {
        runs: state.runs.filter(item => item.missionId === subjectId),
        catalog: state.catalog.filter(item => item.origin?.missionId === subjectId)
      } : null,
      events, integrity: this.verifyChain(),
      limitations: [
        'Il fascicolo dimostra le operazioni registrate dal runtime, non la verità sostanziale del contenuto.',
        'I risultati AI restano proposte o estrazioni e richiedono controllo umano.',
        'La catena hash non equivale a firma qualificata o marcatura temporale certificata.'
      ]
    };
  }
}
