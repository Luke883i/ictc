import http from 'node:http';

const host = '127.0.0.1';
const port = Number(process.env.ICTC_MOCK_MONITOR_PORT || 4899);
let version = 1;
let requests = { source: 0, ai: 0 };
const send = (res, status, body, type = 'application/json; charset=utf-8') => { res.writeHead(status, { 'content-type': type, 'cache-control': 'no-store' }); res.end(type.includes('json') ? JSON.stringify(body) : body); };
const read = async req => { let raw = ''; for await (const chunk of req) raw += chunk; return raw ? JSON.parse(raw) : {}; };
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (req.method === 'GET' && url.pathname === '/source') { requests.source += 1; return send(res, 200, `Documento normativo sintetico. Versione ${version}. Requisito osservato ${version}.`, 'text/plain; charset=utf-8'); }
  if (req.method === 'POST' && url.pathname === '/toggle') { version += 1; return send(res, 200, { ok: true, version }); }
  if (req.method === 'GET' && url.pathname === '/status') return send(res, 200, { ok: true, version, requests });
  if (req.method === 'POST' && url.pathname === '/v1/chat/completions') {
    requests.ai += 1; const body = await read(req); const prompt = body?.messages?.map(item => item.content).join('\n') || '';
    const comparison = prompt.includes('changed') ? 'changed' : prompt.includes('baseline-created') ? 'baseline-created' : 'unchanged';
    const content = JSON.stringify({ summary: comparison === 'changed' ? `La versione ${version} contiene una variazione da qualificare.` : `Baseline ${version} registrata senza decisioni automatiche.`, reviewQuestion: 'La variazione è rilevante nel contesto locale?', limitations: ['Sintesi prodotta da un provider di test.', 'Review umana obbligatoria.'] });
    return send(res, 200, { id: 'mock-response', choices: [{ message: { role: 'assistant', content } }] });
  }
  return send(res, 404, { error: 'not found' });
});
server.listen(port, host, () => console.log(`mock-monitoring-provider http://${host}:${port}`));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(() => process.exit(0)));
