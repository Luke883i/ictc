const ICONS=Object.freeze({
  'arrow-up-right':'<path d="M7 17 17 7"/><path d="M7 7h10v10"/>',
  'chevron-left':'<path d="m15 18-6-6 6-6"/>',
  'chevron-right':'<path d="m9 18 6-6-6-6"/>',
  'info':'<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 8h.01"/>',
  'search':'<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  'sparkles':'<path d="m12 3-1.2 3.2L7.5 7.5l3.3 1.3L12 12l1.2-3.2 3.3-1.3-3.3-1.3L12 3Z"/><path d="m18.5 13-.8 2.2-2.2.8 2.2.8.8 2.2.8-2.2 2.2-.8-2.2-.8-.8-2.2Z"/><path d="m5 14-.7 1.8-1.8.7 1.8.7L5 19l.7-1.8 1.8-.7-1.8-.7L5 14Z"/>',
  'triangle-alert':'<path d="M10.3 3.8 2.4 18a2 2 0 0 0 1.8 3h15.6a2 2 0 0 0 1.8-3L13.7 3.8a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>'
});
export function uiIcon(name,className='ui-icon'){
  const body=ICONS[name];
  if(!body)throw new Error(`Unknown UI icon: ${name}`);
  return `<svg class="${className}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${body}</svg>`;
}
export const UI_ICON_NAMES=Object.freeze(Object.keys(ICONS));
