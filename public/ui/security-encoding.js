export const htmlEsc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
export function safeHref(value){try{const url=new URL(String(value??''));if(!['http:','https:'].includes(url.protocol))return'';url.hash='';return url.toString();}catch{return'';}}
export function internalReferencePanelMarkup(reference={}){
  const href=safeHref(reference.referenceUrl),link=href?`<a class="secondary" target="_blank" rel="noreferrer" href="${htmlEsc(href)}">Apri nel sistema master</a>`:'<span class="secondary" aria-disabled="true">URL master non disponibile</span>';
  return `<p class="eyebrow">Sistema master</p><h3>${htmlEsc(reference.masterSystem)} · ${htmlEsc(reference.masterId)}</h3><div class="provenance-list"><div class="provenance-row"><span class="origin-tag">Versione</span><span>${htmlEsc(reference.masterVersion)}</span></div><div class="provenance-row"><span class="origin-tag">SHA-256</span><span class="hash">${htmlEsc(reference.contentSha256)}</span></div><div class="provenance-row"><span class="origin-tag">Autorità</span><span>Documento autorevole nel sistema esterno dichiarato</span></div></div>${link}`;
}
