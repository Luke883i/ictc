import assert from 'node:assert/strict';
import { csvCell, currentViewCsv } from './runtime/exports.mjs';

const dangerous=['=HYPERLINK("https://example.invalid","x")','+SUM(1,1)','-1+2','@SUM(1,1)','\t=cmd','  +1','\r\n@x'];for(const value of dangerous){const cell=csvCell(value);assert.ok(cell.includes("'"),`formula prefix not neutralized: ${JSON.stringify(value)}`);const unquoted=cell.startsWith('"')?cell.slice(1,-1).replace(/""/g,'"'):cell;assert.equal(/^[\u0000-\u0020]*[=+\-@]/.test(unquoted),false,`active spreadsheet formula remains: ${JSON.stringify(value)}`);}for(const value of['plain text','123','https://example.invalid','a-b'])assert.equal(csvCell(value),value);
const exported={rows:[{type:'incident',id:'i-1',state:'recorded',label:'=HYPERLINK("https://example.invalid","open")',updatedAt:''},{type:'material',id:'m-1',state:'recorded',label:'\t+SUM(1,1)',updatedAt:''}]},csv=currentViewCsv(exported);assert.match(csv,/incident/);assert.ok(csv.includes("'=HYPERLINK")||csv.includes("\"'=HYPERLINK"));assert.ok(csv.includes("'\t+SUM"));
console.log('csv-export-security-check: ok (spreadsheet formulas neutralized after control/whitespace prefixes; ordinary cells unchanged)');
