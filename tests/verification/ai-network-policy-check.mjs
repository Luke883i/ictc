import './ai-network-policy-base-check.mjs';
import { runAiProviderP3bContractCheck } from './ai-provider-p3b-contract-check.mjs';
const provider=runAiProviderP3bContractCheck();
console.log(JSON.stringify({ok:true,suite:'ai-network-policy-check+provider-p3b',networkPolicy:true,provider}));
