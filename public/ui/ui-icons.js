const ICONS=Object.freeze({
  'arrow-up-right':'<path d="M7 17 17 7"/><path d="M7 7h10v10"/>',
  'chevron-left':'<path d="m15 18-6-6 6-6"/>',
  'chevron-right':'<path d="m9 18 6-6-6-6"/>',
  'info':'<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 8h.01"/>',
  'search':'<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  'sparkles':'<path d="m12 3-1.2 3.2L7.5 7.5l3.3 1.3L12 12l1.2-3.2 3.3-1.3-3.3-1.3L12 3Z"/><path d="m18.5 13-.8 2.2-2.2.8 2.2.8.8 2.2.8-2.2 2.2-.8-2.2-.8-.8-2.2Z"/><path d="m5 14-.7 1.8-1.8.7 1.8.7L5 19l.7-1.8 1.8-.7-1.8-.7L5 14Z"/>',
  'badge-check':'<path d="M8 3h8l5 5v8l-5 5H8l-5-5V8z"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
  'circle-half':'<circle cx="12" cy="12" r="9"/><path d="M12 3v18"/><path d="M12 3a9 9 0 0 1 0 18z"/>',
  'wrench':'<path d="M14.7 6.3a5 5 0 0 0-6.4 6.4L3.7 17.3a2.1 2.1 0 0 0 3 3l4.6-4.6a5 5 0 0 0 6.4-6.4L14 13l-3-3z"/>',
  'circle-slash':'<circle cx="12" cy="12" r="9"/><path d="m5.65 5.65 12.7 12.7"/>',
  'book-open-check':'<path d="M12 7v14"/><path d="M3 18V5a2 2 0 0 1 2-2h4a3 3 0 0 1 3 3 3 3 0 0 1 3-3h4a2 2 0 0 1 2 2v6"/><path d="M3 18a2 2 0 0 1 2-2h4a3 3 0 0 1 3 3"/><path d="m16 18 2 2 4-4"/>',
  'siren':'<path d="M5 16h14l-1-7a6 6 0 0 0-12 0z"/><path d="M3 20h18M12 2v2M3.5 5.5 5 7M20.5 5.5 19 7"/>',
  'boxes':'<path d="m12 2 5 3v6l-5 3-5-3V5z"/><path d="m7 5 5 3 5-3M12 8v6"/><path d="m7 12 5 3v6l-5 3-5-3v-6zM7 15l5 3 5-3M12 18v3"/>',
  'layers-3':'<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5"/>',
  'list-todo':'<rect x="3" y="4" width="6" height="6" rx="1"/><path d="m4 7 2 2 2-3M13 7h8M3 17h6M13 17h8M3 21h6"/>',
  'shield-alert':'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="M12 8v5M12 17h.01"/>',
  'clipboard-check':'<rect x="5" y="4" width="14" height="18" rx="2"/><rect x="9" y="2" width="6" height="4" rx="1"/><path d="m9 14 2 2 4-4"/>',
  'triangle-alert':'<path d="M10.3 3.8 2.4 18a2 2 0 0 0 1.8 3h15.6a2 2 0 0 0 1.8-3L13.7 3.8a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>'
});
export function uiIcon(name,className='ui-icon'){
  const body=ICONS[name];
  if(!body)throw new Error(`Unknown UI icon: ${name}`);
  return `<svg class="${className}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${body}</svg>`;
}
export const UI_ICON_NAMES=Object.freeze(Object.keys(ICONS));

// Single presentation mapping; process identity and availability remain in procedureRegistry.
export const PROCESS_ICON_BY_CODE=Object.freeze({'RN-01':'book-open-check','EC-01':'siren','AO-01':'boxes','MC-01':'layers-3','AP-01':'list-todo','RC-01':'shield-alert','AR-01':'clipboard-check'});
export const processIcon=code=>PROCESS_ICON_BY_CODE[code]||'info';
