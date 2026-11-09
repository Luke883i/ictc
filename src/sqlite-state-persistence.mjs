import { DatabaseSync } from 'node:sqlite';
import { mkdir, readFile, rename } from 'node:fs/promises';
import path from 'node:path';
import { sha256 } from './domain.mjs';
import { buildEpistemicStep, semanticManifestSha256, verifyEpistemicStep } from './runtime/epistemic-step.mjs';

export const SUBJECT_VERSION_WORKING_SET_LIMIT=5000;
export const COMMAND_RESULT_SNAPSHOT_CACHE_LIMIT=500;

function snapshotPayload(state){const copy=structuredClone(state||{});delete copy.audit;delete copy.subjectVersions;delete copy.epistemicSteps;return copy;}
function parseJson(value,fallback=null){try{return value==null?fallback:JSON.parse(value);}catch{return fallback;}}
function fail(code,message,details={}){throw Object.assign(new Error(message),{code,details});}

export class SqliteStatePersistence {
  constructor(root){this.root=root;this.dbPath=path.join(root,'state.sqlite');this.legacyPath=path.join(root,'state.json');this.db=null;}

  async init(){
    await mkdir(this.root,{recursive:true,mode:0o700});
    this.db=new DatabaseSync(this.dbPath);
    this.db.exec(`PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL; PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS snapshot (id INTEGER PRIMARY KEY CHECK(id=1), revision INTEGER NOT NULL, payload TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS audit (revision INTEGER PRIMARY KEY, hash TEXT NOT NULL UNIQUE, event_json TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS subject_payload (sha256 TEXT PRIMARY KEY, schema_version TEXT NOT NULL, canonicalization_version TEXT NOT NULL, payload_json TEXT, payload_bytes INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS subject_version (id TEXT PRIMARY KEY, revision INTEGER, subject_type TEXT NOT NULL, subject_id TEXT NOT NULL, procedure_id TEXT, predecessor_id TEXT, payload_sha256 TEXT NOT NULL, created_at TEXT NOT NULL, created_by TEXT, action TEXT, source_authority TEXT, semantic_schema_version TEXT NOT NULL, canonicalization_version TEXT NOT NULL, digest_bindings_json TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS subject_version_subject_idx ON subject_version(subject_type,subject_id,revision,id);
CREATE TABLE IF NOT EXISTS epistemic_step (revision INTEGER PRIMARY KEY, event_id TEXT NOT NULL UNIQUE, step_sha256 TEXT NOT NULL UNIQUE, transaction_at TEXT NOT NULL, payload_json TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS command_result (id TEXT PRIMARY KEY, actor_id TEXT NOT NULL, action TEXT NOT NULL, envelope_json TEXT NOT NULL, stored_at TEXT NOT NULL);`);
    return this;
  }

  hasSnapshot(){return Boolean(this.db.prepare('SELECT 1 AS ok FROM snapshot WHERE id=1').get());}

  _versionRows(limit=null){
    if(limit!=null){
      const rows=this.db.prepare(`SELECT sv.*,sp.payload_json FROM subject_version sv LEFT JOIN subject_payload sp ON sp.sha256=sv.payload_sha256 ORDER BY COALESCE(sv.revision,0) DESC,sv.id DESC LIMIT ?`).all(Number(limit));
      return rows.reverse();
    }
    return this.db.prepare(`SELECT sv.*,sp.payload_json FROM subject_version sv LEFT JOIN subject_payload sp ON sp.sha256=sv.payload_sha256 ORDER BY COALESCE(sv.revision,0),sv.id`).all();
  }

  _materializeVersion(row){
    const payload=parseJson(row.payload_json,null);
    if(sha256(payload)!==row.payload_sha256)fail('semantic-payload-digest-mismatch','Payload semantico non coincide con il digest dichiarato',{subjectVersionId:row.id,payloadSha256:row.payload_sha256});
    return{schemaVersion:'2.0.0',id:row.id,revision:row.revision==null?null:Number(row.revision),procedureId:row.procedure_id,subject:{type:row.subject_type,id:row.subject_id},predecessorId:row.predecessor_id||null,payloadSha256:row.payload_sha256,digestBindings:parseJson(row.digest_bindings_json,[])||[],payload,createdAt:row.created_at,createdBy:row.created_by||'system',action:row.action||null,sourceAuthority:row.source_authority||null,semanticSchemaVersion:row.semantic_schema_version,canonicalizationVersion:row.canonicalization_version,materializationMode:'append-storage'};
  }

  _verifySemanticHistory(state){
    const versions=this._versionRows().map(row=>this._materializeVersion(row)),steps=this.db.prepare('SELECT revision,event_id,step_sha256,payload_json FROM epistemic_step ORDER BY revision').all(),stepByRevision=new Map();
    for(const row of steps){
      const step=parseJson(row.payload_json,null);
      if(!step||step.stepSha256!==row.step_sha256||step.eventId!==row.event_id||Number(step.revision)!==Number(row.revision)||!verifyEpistemicStep(step))fail('epistemic-step-digest-mismatch','EpistemicStep non coincide con il digest persistito',{revision:row.revision,eventId:row.event_id});
      stepByRevision.set(Number(row.revision),step);
    }
    const byRevision=new Map();
    for(const version of versions){const key=Number(version.revision);if(!byRevision.has(key))byRevision.set(key,[]);byRevision.get(key).push(version);}
    for(const event of state.audit||[]){
      const expected=event?.metadata?.semanticManifestSha256;if(!expected)continue;
      const reviews=(state.reviewNeeds||[]).filter(item=>Number(item.openedRevision)===Number(event.revision)),actual=semanticManifestSha256(byRevision.get(Number(event.revision))||[],reviews);
      if(actual!==expected)fail('semantic-manifest-mismatch','Manifest semantico non coincide con il binding dell’evento audit',{revision:event.revision,eventId:event.id,expected,actual});
      const step=stepByRevision.get(Number(event.revision));
      if(!step)fail('epistemic-step-missing','Evento audit semanticamente vincolato senza EpistemicStep',{revision:event.revision,eventId:event.id});
      const expectedStepSha=event?.metadata?.epistemicStepSha256,expectedStepSchema=event?.metadata?.epistemicStepSchemaVersion;
      if(expectedStepSha&&step.stepSha256!==expectedStepSha)fail('epistemic-step-audit-binding-mismatch','EpistemicStep non coincide con il digest legato alla catena audit',{revision:event.revision,eventId:event.id,expected:expectedStepSha,actual:step.stepSha256});
      if(expectedStepSchema&&step.schemaVersion!==expectedStepSchema)fail('epistemic-step-schema-binding-mismatch','Schema EpistemicStep non coincide con la versione legata alla catena audit',{revision:event.revision,eventId:event.id,expected:expectedStepSchema,actual:step.schemaVersion});
    }
    return{versions:versions.length,steps:steps.length,boundEvents:(state.audit||[]).filter(event=>event?.metadata?.semanticManifestSha256).length,stepBoundEvents:(state.audit||[]).filter(event=>event?.metadata?.epistemicStepSha256).length};
  }

  load({verifySemanticHistory=true}={}){
    const row=this.db.prepare('SELECT revision,payload FROM snapshot WHERE id=1').get();if(!row)return null;
    const state=JSON.parse(row.payload);
    state.audit=this.db.prepare('SELECT event_json FROM audit ORDER BY revision').all().map(r=>JSON.parse(r.event_json));
    state.subjectVersions=this._versionRows(SUBJECT_VERSION_WORKING_SET_LIMIT).map(row=>this._materializeVersion(row));
    if(Number(row.revision)!==Number(state.revision))fail('sqlite-revision-mismatch','Revision snapshot SQLite incoerente',{snapshotRevision:row.revision,stateRevision:state.revision});
    if(verifySemanticHistory)this._verifySemanticHistory(state);
    return state;
  }

  latestSubjectVersion(subject){if(!subject?.type||!subject?.id)return null;const row=this.db.prepare(`SELECT sv.*,sp.payload_json FROM subject_version sv LEFT JOIN subject_payload sp ON sp.sha256=sv.payload_sha256 WHERE sv.subject_type=? AND sv.subject_id=? ORDER BY COALESCE(sv.revision,0) DESC,sv.id DESC LIMIT 1`).get(String(subject.type),String(subject.id));return row?this._materializeVersion(row):null;}

  findSubjectVersion(value){
    const s=String(value||'').toLowerCase();if(!s)return null;
    const exact=this.db.prepare(`SELECT sv.*,sp.payload_json FROM subject_version sv LEFT JOIN subject_payload sp ON sp.sha256=sv.payload_sha256 WHERE lower(sv.id)=? OR lower(sv.payload_sha256)=? ORDER BY COALESCE(sv.revision,0) DESC LIMIT 1`).get(s,s);
    if(exact)return this._materializeVersion(exact);
    if(!/^[a-f0-9]{64}$/.test(s))return null;
    const candidates=this.db.prepare(`SELECT sv.*,sp.payload_json FROM subject_version sv LEFT JOIN subject_payload sp ON sp.sha256=sv.payload_sha256 WHERE lower(sv.digest_bindings_json) LIKE ? ORDER BY COALESCE(sv.revision,0) DESC LIMIT 64`).all(`%${s}%`);
    for(const row of candidates){const version=this._materializeVersion(row);if((version.digestBindings||[]).some(binding=>String(binding?.sha256||'').toLowerCase()===s))return version;}
    return null;
  }

  findCommandResult(value){
    const commandId=String(value||'').trim();if(!commandId)return null;
    const row=this.db.prepare('SELECT id,actor_id,action,envelope_json,stored_at FROM command_result WHERE id=?').get(commandId);if(!row)return null;
    const envelope=parseJson(row.envelope_json,null);
    if(!envelope||typeof envelope!=='object')fail('sqlite-command-result-corrupt','Command result persistito non materializzabile',{commandId});
    return{id:row.id,actorId:row.actor_id,action:row.action,envelope,storedAt:row.stored_at,materializationMode:'durable-command-ledger'};
  }

  commandResultCount(){return Number(this.db.prepare('SELECT count(*) c FROM command_result').get().c||0);}

  _persistCommandResults(records={}){
    const select=this.db.prepare('SELECT actor_id,action,envelope_json FROM command_result WHERE id=?');
    const insert=this.db.prepare('INSERT INTO command_result(id,actor_id,action,envelope_json,stored_at) VALUES(?,?,?,?,?)');
    for(const [commandId,record] of Object.entries(records||{})){
      if(!commandId||!record?.actorId||!record?.action||!record?.envelope)fail('sqlite-command-result-invalid','Command result candidato incompleto',{commandId});
      const existing=select.get(commandId);
      if(existing){
        const existingEnvelope=parseJson(existing.envelope_json,null);
        if(existing.actor_id!==String(record.actorId)||existing.action!==String(record.action)||sha256(existingEnvelope)!==sha256(record.envelope))fail('sqlite-command-result-conflict','Command id persistito associato a un risultato differente',{commandId,actorId:record.actorId,action:record.action});
        continue;
      }
      insert.run(commandId,String(record.actorId),String(record.action),JSON.stringify(record.envelope),String(record.storedAt||new Date().toISOString()));
    }
  }

  _meta(key){return this.db.prepare('SELECT value FROM meta WHERE key=?').get(key)?.value||null;}
  _setMeta(key,value){this.db.prepare('INSERT INTO meta(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').run(key,String(value));}

  _insertVersion(record){
    const payloadJson=JSON.stringify(record.payload??null),payloadBytes=Buffer.byteLength(payloadJson),actualSha=sha256(record.payload??null);
    if(actualSha!==record.payloadSha256)fail('semantic-payload-digest-mismatch','SubjectVersion candidata non coincide con il proprio payloadSha256',{subjectVersionId:record.id,expected:record.payloadSha256,actual:actualSha});
    this.db.prepare('INSERT OR IGNORE INTO subject_payload(sha256,schema_version,canonicalization_version,payload_json,payload_bytes) VALUES(?,?,?,?,?)').run(record.payloadSha256,record.semanticSchemaVersion||'1.0.0',record.canonicalizationVersion||'legacy-v1',payloadJson,payloadBytes);
    this.db.prepare(`INSERT OR IGNORE INTO subject_version(id,revision,subject_type,subject_id,procedure_id,predecessor_id,payload_sha256,created_at,created_by,action,source_authority,semantic_schema_version,canonicalization_version,digest_bindings_json) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(record.id,record.revision??null,record.subject?.type||'unknown',record.subject?.id||'unknown',record.procedureId||null,record.predecessorId||null,record.payloadSha256,record.createdAt||new Date().toISOString(),record.createdBy||null,record.action||null,record.sourceAuthority||null,record.semanticSchemaVersion||'1.0.0',record.canonicalizationVersion||'legacy-v1',JSON.stringify(record.digestBindings||[]));
  }

  _migrateLegacyVersions(state){if(this._meta('semantic-history-v1')==='migrated')return;for(const record of state.subjectVersions||[])this._insertVersion({...record,revision:record.revision??null,semanticSchemaVersion:record.semanticSchemaVersion||'legacy-1.0.0',canonicalizationVersion:record.canonicalizationVersion||'legacy-result-v1'});this._setMeta('semantic-history-v1','migrated');}

  semanticHistoryCounts(){return{payloads:Number(this.db.prepare('SELECT count(*) c FROM subject_payload').get().c),versions:Number(this.db.prepare('SELECT count(*) c FROM subject_version').get().c),steps:Number(this.db.prepare('SELECT count(*) c FROM epistemic_step').get().c),boundEvents:Number(this.db.prepare("SELECT count(*) c FROM audit WHERE event_json LIKE '%semanticManifestSha256%'").get().c),stepBoundEvents:Number(this.db.prepare("SELECT count(*) c FROM audit WHERE event_json LIKE '%epistemicStepSha256%'").get().c),commandResults:this.commandResultCount(),workingSetLimit:SUBJECT_VERSION_WORKING_SET_LIMIT,commandSnapshotCacheLimit:COMMAND_RESULT_SNAPSHOT_CACHE_LIMIT};}

  save(state){
    const audit=Array.isArray(state.audit)?state.audit:[],revision=Number(state.revision||0),payload=JSON.stringify(snapshotPayload(state));
    const head=this.db.prepare('SELECT revision,hash FROM audit ORDER BY revision DESC LIMIT 1').get(),persistedCount=Number(head?.revision||0);
    if(persistedCount>audit.length)fail('sqlite-ledger-ahead','Ledger SQLite avanti rispetto allo stato candidato');
    if(persistedCount&&audit[persistedCount-1]?.hash!==head.hash)fail('sqlite-ledger-head-mismatch','HEAD audit candidato non coincide con il ledger SQLite');
    const insertAudit=this.db.prepare('INSERT INTO audit(revision,hash,event_json) VALUES(?,?,?)'),upsertSnapshot=this.db.prepare('INSERT INTO snapshot(id,revision,payload) VALUES(1,?,?) ON CONFLICT(id) DO UPDATE SET revision=excluded.revision,payload=excluded.payload');
    this.db.exec('BEGIN IMMEDIATE');
    try{
      this._migrateLegacyVersions(state);
      for(let i=persistedCount;i<audit.length;i++){
        const event=audit[i];
        if(Number(event.revision)!==i+1)fail('sqlite-ledger-sequence','Sequenza audit candidata non contigua',{revision:event.revision,expected:i+1});
        const versions=[];
        for(let j=(state.subjectVersions||[]).length-1;j>=0;j--){const item=state.subjectVersions[j];if(Number(item.revision)===Number(event.revision))versions.unshift(item);else if(item.revision!=null&&Number(item.revision)<Number(event.revision))break;}
        for(const version of versions)this._insertVersion(version);
        const reviews=(state.reviewNeeds||[]).filter(item=>Number(item.openedRevision)===Number(event.revision)),expectedManifest=event?.metadata?.semanticManifestSha256;
        if(expectedManifest){const actualManifest=semanticManifestSha256(versions,reviews);if(actualManifest!==expectedManifest)fail('semantic-manifest-mismatch','Manifest semantico candidato non coincide con il binding audit',{revision:event.revision,expected:expectedManifest,actual:actualManifest});}
        const step=buildEpistemicStep(event,versions,reviews);
        if(!verifyEpistemicStep(step))fail('epistemic-step-digest-mismatch','EpistemicStep candidato non verificabile',{revision:event.revision});
        if(event?.metadata?.epistemicStepSha256&&step.stepSha256!==event.metadata.epistemicStepSha256)fail('epistemic-step-audit-binding-mismatch','EpistemicStep candidato non coincide con il digest legato all’audit',{revision:event.revision,eventId:event.id,expected:event.metadata.epistemicStepSha256,actual:step.stepSha256});
        if(event?.metadata?.epistemicStepSchemaVersion&&step.schemaVersion!==event.metadata.epistemicStepSchemaVersion)fail('epistemic-step-schema-binding-mismatch','Schema EpistemicStep candidato non coincide con il binding audit',{revision:event.revision,eventId:event.id,expected:event.metadata.epistemicStepSchemaVersion,actual:step.schemaVersion});
        this.db.prepare('INSERT OR IGNORE INTO epistemic_step(revision,event_id,step_sha256,transaction_at,payload_json) VALUES(?,?,?,?,?)').run(event.revision,event.id,step.stepSha256,event.at,JSON.stringify(step));
        insertAudit.run(event.revision,event.hash,JSON.stringify(event));
      }
      this._persistCommandResults(state.commandResults||{});
      upsertSnapshot.run(revision,payload);
      this.db.exec('COMMIT');
    }catch(error){try{this.db.exec('ROLLBACK');}catch{}throw error;}
    const persisted=this.load({verifySemanticHistory:false});
    if(!persisted||Number(persisted.revision)!==revision||persisted.audit.length!==audit.length)fail('sqlite-readback-mismatch','Readback SQLite non coincide con la revisione candidata');
    return persisted;
  }

  epistemicSteps({fromRevision=1,toRevision=Number.MAX_SAFE_INTEGER}={}){const rows=this.db.prepare('SELECT payload_json FROM epistemic_step WHERE revision>=? AND revision<=? ORDER BY revision').all(Number(fromRevision),Number(toRevision));return rows.map(row=>{const step=parseJson(row.payload_json,null);if(!verifyEpistemicStep(step))fail('epistemic-step-digest-mismatch','EpistemicStep non verificabile durante la lettura');return step;});}

  async importLegacyIfPresent(){if(this.hasSnapshot())return{imported:false,state:this.load()};let text;try{text=await readFile(this.legacyPath,'utf8');}catch(error){if(error.code==='ENOENT')return{imported:false,state:null};throw error;}const state=JSON.parse(text);this.save(state);const archived=path.join(this.root,'state.legacy-imported.json');await rename(this.legacyPath,archived);this._setMeta('legacy-import','state.legacy-imported.json');return{imported:true,state:this.load(),archived};}

  close(){try{this.db?.close();}catch{}this.db=null;}
}

export { snapshotPayload };
