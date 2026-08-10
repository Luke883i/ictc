function scalar(value){
  if(value==null)return'';
  if(typeof value==='string')return value;
  if(typeof value==='number'||typeof value==='boolean')return String(value);
  return JSON.stringify(value);
}

function xmlEscape(value){
  return scalar(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
}

function pdfText(value){
  return scalar(value).normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[\u2010-\u2015]/g,'-').replace(/[\u2018\u2019]/g,"'").replace(/[\u201c\u201d]/g,'"').replace(/[^\x20-\x7e]/g,'?');
}

function pdfEscape(value){
  return pdfText(value).replace(/\\/g,'\\\\').replace(/\(/g,'\\(').replace(/\)/g,'\\)');
}

function splitToken(token,width){
  const parts=[];
  for(let i=0;i<token.length;i+=width)parts.push(token.slice(i,i+width));
  return parts.length?parts:[''];
}

function wrap(value,width=92){
  const out=[];
  for(const paragraph of scalar(value).split(/\r?\n/)){
    if(!paragraph){out.push('');continue;}
    let line='';
    for(const rawWord of paragraph.split(/\s+/)){
      for(const word of splitToken(rawWord,width)){
        if(!line){line=word;continue;}
        if(line.length+1+word.length<=width){line+=` ${word}`;continue;}
        out.push(line);line=word;
      }
    }
    if(line)out.push(line);
  }
  return out;
}

export function buildEvidenceLineageDocument({bundle,graph,release='ICTC',generatedAt=new Date().toISOString(),actor=null}={}){
  if(!bundle||!graph)throw new Error('Evidence bundle and graph are required');
  const lineage=(bundle.events||[]).map(event=>({
    eventId:event.id||null,
    revision:Number(event.revision||0),
    at:event.at||null,
    action:event.action||null,
    actorId:event.actorId||null,
    role:event.role||null,
    subject:event.subject||null,
    previousHash:event.previousHash||null,
    hash:event.hash||null,
    inputSha256:event.inputSha256||null,
    resultSha256:event.resultSha256||null,
    stateSha256:event.stateSha256||null,
    semanticManifestSha256:event.metadata?.semanticManifestSha256||null,
    epistemicStepSha256:event.metadata?.epistemicStepSha256||null
  }));
  return{
    schemaVersion:'1.0.0',documentType:'ictc-evidence-lineage-receipt',product:'ICTC',release,generatedAt,
    generatedBy:actor?.id||bundle.generatedBy||null,
    generatedForRole:actor?.role||bundle.generatedForRole||null,
    authorization:'same-as-read',
    subject:{type:graph.subject?.type||bundle.type||null,id:graph.subject?.id||bundle.subject?.id||null,label:bundle.subject?.title||bundle.subject?.name||bundle.subject?.objective||bundle.subject?.originalNarrative||null},
    integrity:{
      graphSha256:graph.digest||null,
      subjectSha256:bundle.manifest?.subjectSha256||null,
      relatedSha256:bundle.manifest?.relatedSha256||null,
      eventsSha256:bundle.manifest?.eventsSha256||null,
      integrityHead:bundle.integrity?.head||bundle.manifest?.integrityHead||null,
      canonicalStateSha256:bundle.integrity?.canonicalStateSha256||bundle.manifest?.canonicalStateSha256||null,
      auditHeadStateSha256:bundle.integrity?.headStateSha256||bundle.manifest?.auditHeadStateSha256||null,
      stateBoundToAuditHead:Boolean(bundle.integrity?.stateBound??bundle.manifest?.stateBoundToAuditHead)
    },
    summary:{claims:(graph.claims||[]).length,decisions:(graph.decisionRecords||[]).length,relations:(graph.edges||[]).length,lineageEvents:lineage.length},
    lineage,
    claims:(graph.claims||[]).map(item=>({id:item.id,claimClass:item.claimClass||null,epistemicStatus:item.epistemicStatus||null,statement:item.statement||item.text||null,standardConclusion:item.standardConclusion||null,limitations:item.limitations||[]})),
    limitations:[...new Set([...(bundle.limitations||[]),...(graph.limitations||[])])],
    boundary:'This receipt records authorized ICTC lineage and integrity bindings. It does not by itself establish legal compliance, applicability, control effectiveness, evidentiary sufficiency, certification, qualified signature, trusted timestamp or non-repudiation.'
  };
}

export function evidenceMarkdown(doc){
  const lines=['# ICTC - Evidence lineage receipt','',`**Subject:** ${scalar(doc.subject.type)} / ${scalar(doc.subject.id)}`];
  if(doc.subject.label)lines.push(`**Label:** ${scalar(doc.subject.label)}`);
  lines.push(`**Generated:** ${scalar(doc.generatedAt)} by ${scalar(doc.generatedBy)} (${scalar(doc.generatedForRole)})`,`**Authorization:** ${doc.authorization}`,'','## Integrity',`- Graph SHA-256: \`${scalar(doc.integrity.graphSha256)}\``,`- Subject SHA-256: \`${scalar(doc.integrity.subjectSha256)}\``,`- Events SHA-256: \`${scalar(doc.integrity.eventsSha256)}\``,`- Audit head: \`${scalar(doc.integrity.integrityHead)}\``,`- Canonical state SHA-256: \`${scalar(doc.integrity.canonicalStateSha256)}\``,`- Bound to audit head: **${doc.integrity.stateBoundToAuditHead?'yes':'no'}**`,'','## Lineage');
  for(const event of doc.lineage){
    lines.push(`### r${event.revision} - ${scalar(event.action)}`,`- At: ${scalar(event.at)}`,`- Actor: ${scalar(event.actorId)}${event.role?` (${event.role})`:''}`,`- Event: \`${scalar(event.eventId)}\``,`- Previous: \`${scalar(event.previousHash)}\``,`- Hash: \`${scalar(event.hash)}\``,`- Input: \`${scalar(event.inputSha256)}\``,`- Result: \`${scalar(event.resultSha256)}\``,`- State: \`${scalar(event.stateSha256)}\``);
    if(event.semanticManifestSha256)lines.push(`- Semantic manifest: \`${event.semanticManifestSha256}\``);
    if(event.epistemicStepSha256)lines.push(`- Epistemic step: \`${event.epistemicStepSha256}\``);
    lines.push('');
  }
  lines.push('## Claims recorded');
  if(doc.claims.length)for(const item of doc.claims)lines.push(`- **${scalar(item.epistemicStatus||'recorded')}** ${scalar(item.statement||item.id)} - standard conclusion: ${scalar(item.standardConclusion||'not-assessed')}`);
  else lines.push('- None in the authorized graph.');
  lines.push('','## Limitations',...doc.limitations.map(item=>`- ${scalar(item)}`),'',`> ${doc.boundary}`,'');
  return lines.join('\n');
}

export function evidenceXml(doc){
  const eventXml=doc.lineage.map(event=>`    <event revision="${event.revision}"><eventId>${xmlEscape(event.eventId)}</eventId><at>${xmlEscape(event.at)}</at><action>${xmlEscape(event.action)}</action><actor id="${xmlEscape(event.actorId)}" role="${xmlEscape(event.role)}"/><subject type="${xmlEscape(event.subject?.type)}" id="${xmlEscape(event.subject?.id)}"/><previousHash>${xmlEscape(event.previousHash)}</previousHash><hash>${xmlEscape(event.hash)}</hash><inputSha256>${xmlEscape(event.inputSha256)}</inputSha256><resultSha256>${xmlEscape(event.resultSha256)}</resultSha256><stateSha256>${xmlEscape(event.stateSha256)}</stateSha256><semanticManifestSha256>${xmlEscape(event.semanticManifestSha256)}</semanticManifestSha256><epistemicStepSha256>${xmlEscape(event.epistemicStepSha256)}</epistemicStepSha256></event>`).join('\n');
  const claims=doc.claims.map(item=>`    <claim id="${xmlEscape(item.id)}" class="${xmlEscape(item.claimClass)}" status="${xmlEscape(item.epistemicStatus)}" standardConclusion="${xmlEscape(item.standardConclusion)}"><statement>${xmlEscape(item.statement)}</statement></claim>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<ictcEvidenceLineage schemaVersion="${xmlEscape(doc.schemaVersion)}" authorization="same-as-read">\n  <header product="ICTC" release="${xmlEscape(doc.release)}" generatedAt="${xmlEscape(doc.generatedAt)}" generatedBy="${xmlEscape(doc.generatedBy)}" generatedForRole="${xmlEscape(doc.generatedForRole)}"/>\n  <subject type="${xmlEscape(doc.subject.type)}" id="${xmlEscape(doc.subject.id)}"><label>${xmlEscape(doc.subject.label)}</label></subject>\n  <integrity stateBoundToAuditHead="${doc.integrity.stateBoundToAuditHead}"><graphSha256>${xmlEscape(doc.integrity.graphSha256)}</graphSha256><subjectSha256>${xmlEscape(doc.integrity.subjectSha256)}</subjectSha256><eventsSha256>${xmlEscape(doc.integrity.eventsSha256)}</eventsSha256><integrityHead>${xmlEscape(doc.integrity.integrityHead)}</integrityHead><canonicalStateSha256>${xmlEscape(doc.integrity.canonicalStateSha256)}</canonicalStateSha256></integrity>\n  <lineage>\n${eventXml}\n  </lineage>\n  <claims>\n${claims}\n  </claims>\n  <limitations>${doc.limitations.map(item=>`<limitation>${xmlEscape(item)}</limitation>`).join('')}</limitations>\n  <boundary>${xmlEscape(doc.boundary)}</boundary>\n</ictcEvidenceLineage>\n`;
}

function pdfLines(doc){
  const rows=['ICTC | EVIDENCE LINEAGE RECEIPT',`Subject: ${doc.subject.type} / ${doc.subject.id}`];
  if(doc.subject.label)rows.push(`Label: ${doc.subject.label}`);
  rows.push(`Generated: ${doc.generatedAt} | ${doc.generatedBy} | ${doc.generatedForRole}`,'','INTEGRITY',`Graph SHA-256: ${doc.integrity.graphSha256||'-'}`,`Subject SHA-256: ${doc.integrity.subjectSha256||'-'}`,`Events SHA-256: ${doc.integrity.eventsSha256||'-'}`,`Audit head: ${doc.integrity.integrityHead||'-'}`,`State bound to audit head: ${doc.integrity.stateBoundToAuditHead?'yes':'no'}`,'','LINEAGE');
  for(const event of doc.lineage){
    rows.push(`r${event.revision} | ${event.at||'-'} | ${event.action||'-'}`,`actor ${event.actorId||'-'}${event.role?` (${event.role})`:''}`,`event ${event.eventId||'-'}`,`prev ${event.previousHash||'-'}`,`hash ${event.hash||'-'}`,`input ${event.inputSha256||'-'}`,`result ${event.resultSha256||'-'}`,`state ${event.stateSha256||'-'}`);
    if(event.semanticManifestSha256)rows.push(`semantic ${event.semanticManifestSha256}`);
    if(event.epistemicStepSha256)rows.push(`epistemic ${event.epistemicStepSha256}`);
    rows.push('');
  }
  rows.push('LIMITATIONS',...doc.limitations,doc.boundary);
  return rows.flatMap(row=>wrap(pdfText(row),88));
}

export function evidencePdf(doc){
  const lines=pdfLines(doc),perPage=47,pages=[];
  for(let i=0;i<lines.length;i+=perPage)pages.push(lines.slice(i,i+perPage));
  if(!pages.length)pages.push(['ICTC | EVIDENCE LINEAGE RECEIPT']);
  const objects=[];
  const add=body=>{objects.push(body);return objects.length;};
  const catalog=add('<< /Type /Catalog /Pages 2 0 R >>');
  const pagesId=add('PAGES_PLACEHOLDER');
  const fontId=add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  const pageIds=[];
  for(let p=0;p<pages.length;p++){
    const commands=['BT','/F1 10 Tf','48 790 Td','14 TL',`(ICTC | Evidence lineage receipt | page ${p+1}/${pages.length}) Tj`,'0 -22 Td'];
    for(const line of pages[p])commands.push(`(${pdfEscape(line)}) Tj`,'T*');
    commands.push('ET');
    const stream=commands.join('\n');
    const contentId=add(`<< /Length ${Buffer.byteLength(stream,'latin1')} >>\nstream\n${stream}\nendstream`);
    const pageId=add(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${contentId} 0 R >>`);
    pageIds.push(pageId);
  }
  objects[pagesId-1]=`<< /Type /Pages /Kids [${pageIds.map(id=>`${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`;
  const chunks=[Buffer.from('%PDF-1.4\n%ICTC\n','latin1')],offsets=[0];
  let offset=chunks[0].length;
  objects.forEach((body,index)=>{offsets[index+1]=offset;const chunk=Buffer.from(`${index+1} 0 obj\n${body}\nendobj\n`,'latin1');chunks.push(chunk);offset+=chunk.length;});
  const xrefOffset=offset;
  let xref=`xref\n0 ${objects.length+1}\n0000000000 65535 f \n`;
  for(let i=1;i<=objects.length;i++)xref+=`${String(offsets[i]).padStart(10,'0')} 00000 n \n`;
  xref+=`trailer\n<< /Size ${objects.length+1} /Root ${catalog} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  chunks.push(Buffer.from(xref,'latin1'));
  return Buffer.concat(chunks);
}

export function renderEvidenceFormats(doc){
  return{md:Buffer.from(evidenceMarkdown(doc),'utf8'),xml:Buffer.from(evidenceXml(doc),'utf8'),pdf:evidencePdf(doc)};
}
