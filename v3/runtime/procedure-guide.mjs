import { processDefinition, surfaceProcessDefinitions } from './process-kernel.mjs';

const ARCHETYPE_STEPS=Object.freeze({
  'monitor-review':[
    ['preserve','Conserva l’obiettivo o la fonte originale','Nessuna inferenza sostituisce l’input originale.'],
    ['assist','Ottieni una proposta AI','Piano, metadati o rilevanza sono proposte da verificare.'],
    ['review','Verifica contesto e provenienza','Controlla fonte, versione, perimetro e limiti.'],
    ['decide','Registra la decisione umana','La decisione resta distinta dalla proposta AI.'],
    ['evidence','Conserva ricevuta e dossier','Decisione e versione diventano ricostruibili.']
  ],
  'case-workflow':[
    ['preserve','Registra i fatti disponibili','L’originale viene preservato prima dell’assistenza.'],
    ['assist','Usa l’AI per strutturare','L’AI evidenzia elementi, gap o priorità senza decidere.'],
    ['review','Completa ciò che manca','Un umano corregge, completa o rifiuta la proposta.'],
    ['decide','Conferma lo stato operativo','La transizione di autorità richiede un’azione umana.'],
    ['evidence','Produci traccia e prossimo lavoro','Receipt, decisione ed evidenze alimentano la coda.']
  ],
  'assurance-view':[
    ['scope','Dichiara il perimetro','Il denominatore e le fonti della vista restano espliciti.'],
    ['assist','Genera una proposta bounded','L’AI può mappare o redigere, non attestare.'],
    ['review','Verifica evidenze e limiti','Distingui coperto, gap, N.A., indisponibile e non valutato.'],
    ['decide','Approva solo ciò che compete all’umano','La conclusione registrata è version-bound.'],
    ['evidence','Esporta la vista autorizzata','Il dossier mantiene gli stessi limiti della lettura.']
  ],
  'registry-extension':[
    ['preserve','Registra l’oggetto e la sua fonte','ICTC conserva identità e riferimento senza diventare master esterno.'],
    ['assist','Arricchisci senza attivare','L’AI può suggerire classificazioni o collegamenti.'],
    ['review','Verifica owner, criticità e relazioni','I dati governati richiedono controllo umano.'],
    ['decide','Attiva o escludi l’oggetto','La review umana separa candidato e registro attivo.'],
    ['evidence','Collega versione, receipt e dossier','Ogni oggetto resta tracciabile nel grafo.']
  ]
});
const OVERRIDES=Object.freeze({
  monitoring:{entry:'Descrivi cosa deve essere sorvegliato oppure aggiungi una fonte/materiale.',exit:'Fonte verificata o esclusa, oppure monitoraggio governato, con versioni e ricevute.',checkpoint:'source-review'},
  incidents:{entry:'Descrivi ciò che è accaduto senza doverlo classificare.',exit:'Fascicolo inviato o chiuso con originale, formulazioni versionate e ricevute.',checkpoint:'case-review'},
  objects:{entry:'Registra un oggetto rilevante e la fonte autorevole dichiarata.',exit:'Oggetto attivo, escluso o ritirato con review e versione.',checkpoint:'object-review'},
  coverage:{entry:'Registra il requisito o elemento del perimetro dichiarato.',exit:'Mapping deciso come mapped, gap, N.A. o rejected con motivazione.',checkpoint:'mapping-review'},
  actions:{entry:'Crea lavoro da un gap, finding, rischio o decisione umana.',exit:'Azione adottata e portata a stato terminale o motivatamente annullata.',checkpoint:'action-priority-review'},
  risks:{entry:'Registra uno scenario e i fatti che lo supportano.',exit:'Rating umano versionato; solo questo entra nella heatmap consolidata.',checkpoint:'risk-rating-review'},
  assurance:{entry:'Conserva la richiesta o il questionario originale.',exit:'Risposte approvate umanamente e collegate alle evidenze disponibili.',checkpoint:'assurance-answer-approval'},
  evidence:{entry:'Apri una prova o un dossier accessibile al ruolo.',exit:'Provenienza, decisioni e limiti ricostruiti in sola lettura.',checkpoint:null}
});
function genericOverride(def){return{entry:`Avvia ${def.label} con un input previsto dal ProcessDefinition.`,exit:'Completa il ciclo con stato, limiti e prova disponibili.',checkpoint:def.decision?.checkpoint||null};}
export function procedureGuide(id){const def=processDefinition(id),specific=OVERRIDES[id]||genericOverride(def),steps=(ARCHETYPE_STEPS[def.archetype]||ARCHETYPE_STEPS['case-workflow']).map(([id,label,boundary],index)=>({index:index+1,id,label,boundary,aiRole:id==='assist'?'proposal-only':'none',humanRequired:id==='review'||id==='decide'}));return{schemaVersion:'3.0.0',authority:'runtime-procedure-guide',process:{id:def.id,code:def.code,label:def.label,archetype:def.archetype,service:def.service,kind:def.kind},entry:specific.entry,inputs:def.inputs||[],steps,checkpoint:specific.checkpoint,evidence:{receiptOnWrite:Boolean(def.evidence?.receiptRequiredOnWrite),bundle:Boolean(def.evidence?.bundle)},exit:specific.exit,claimBoundary:def.claimBoundary,authorityTopology:def.authority,limitations:['La guida descrive la procedura ICTC; non determina applicabilità legale, conformità o competenza esterna.','Le fasi AI sono assistive e non sostituiscono i checkpoint umani.']};}
export function procedureGuideIndex(actor){return surfaceProcessDefinitions().filter(def=>def.id!=='administration'||actor.role==='admin').map(def=>{const guide=procedureGuide(def.id);return{processId:def.id,processCode:def.code,label:def.label,entry:guide.entry,checkpoint:guide.checkpoint,stepCount:guide.steps.length,readOnly:def.roleModes?.[actor.role]?.mode==='read-only'};});}
