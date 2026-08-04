import http from 'node:http';
import { fileURLToPath } from 'node:url';
async function readJson(request) { const chunks = []; for await (const chunk of request) chunks.push(chunk); return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'); }
function json(response, body) { const payload = JSON.stringify(body); response.writeHead(200, {'content-type':'application/json','content-length':Buffer.byteLength(payload)}); response.end(payload); }
export function createMockAIProvider() {
  return http.createServer(async (request, response) => {
    if (request.method !== 'POST') { response.writeHead(404); response.end(); return; }
    const body = await readJson(request); const user = JSON.parse(body.messages?.find(item => item.role === 'user')?.content || '{}');
    const result = user.task === 'incident-draft' ? {
      summary: `Segnalazione ${user.incident.kind}: ${user.incident.facts}`, chronology: [user.incident.detectedAt || user.incident.awarenessAt, user.incident.awarenessAt],
      affectedServices: user.incident.affectedServices, impact: user.incident.impact || 'Impatto da completare', indicators: user.incident.indicators,
      mitigations: user.incident.mitigations, rootCause: 'Da determinare mediante analisi tecnica', openQuestions: ['Confermare perimetro e durata','Verificare eventuali obblighi applicabili'],
      notificationData: { maliciousSuspected:user.incident.maliciousSuspected, crossBorder:user.incident.crossBorder }
    } : { items: [
      { documentType:'directive', title:'Direttiva (UE) 2022/2555', authority:'Parlamento europeo e Consiglio', jurisdiction:'Unione europea', identifier:'2022/2555', sourceUrl:'https://eur-lex.europa.eu/eli/dir/2022/2555/oj', canonicalUri:'http://data.europa.eu/eli/dir/2022/2555/oj', status:'in force', datePublished:'2022-12-27', dateEffective:'2023-01-16', language:'it', summary:'Misure per un livello comune elevato di cibersicurezza.', confidence:0.98, relations:[] },
      { documentType:'delibera', title:'Tassonomia ACN degli incidenti informatici', authority:'Agenzia per la cybersicurezza nazionale', jurisdiction:'Italia', identifier:'Determina 9 febbraio 2026', sourceUrl:'https://www.gazzettaufficiale.it/eli/id/2026/02/17/26A00713/sg', status:'published', datePublished:'2026-02-17', dateEffective:'2026-02-17', language:'it', summary:'Tassonomia di riferimento per segnalazioni e notifiche.', confidence:0.94, relations:['Legge 90/2024'] }
    ] };
    json(response, { choices:[{message:{content:JSON.stringify(result)}}] });
  });
}
if (process.argv[1] === fileURLToPath(import.meta.url)) { const port = Number(process.env.PORT || 4899); createMockAIProvider().listen(port, '127.0.0.1', () => console.log(`mock AI on ${port}`)); }
