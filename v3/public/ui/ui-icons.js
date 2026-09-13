const ICONS=Object.freeze({
  'arrow-up-right':'<path d="M7 17 17 7"/><path d="M7 7h10v10"/>',
  'chevron-left':'<path d="m15 18-6-6 6-6"/>',
  'chevron-right':'<path d="m9 18 6-6-6-6"/>',
  'info':'<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 8h.01"/>',
  'search':'<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>'
});
export function uiIcon(name,className='ui-icon'){
  const body=ICONS[name];
  if(!body)throw new Error(`Unknown UI icon: ${name}`);
  return `<svg class="${className}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${body}</svg>`;
}
export const UI_ICON_NAMES=Object.freeze(Object.keys(ICONS));
