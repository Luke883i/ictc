function directAdminPanels(grid) {
  return [...(grid?.children || [])].filter(node => node.classList.contains('admin-panel'));
}

function ownerPanel(dialog, selector) {
  const target = dialog?.querySelector(selector);
  if (!target) return { target: null, panel: null };
  const panel = target.classList.contains('admin-panel') ? target : target.closest('.admin-panel');
  return { target, panel };
}

function enforceSingleAdminSurface(dialog, selector) {
  const grid = dialog?.querySelector('.admin-grid');
  const { target, panel } = ownerPanel(dialog, selector);
  if (!grid || !target || !panel || panel.parentElement !== grid) return false;

  for (const candidate of directAdminPanels(grid)) candidate.hidden = candidate !== panel;
  panel.hidden = false;

  const disclosure = target.matches('details') ? target : panel.querySelector(':scope > .admin-disclosure');
  if (disclosure) disclosure.open = true;
  dialog.dataset.activeAdminSection = selector;
  return true;
}

export function installEnterprise2AdminNavigationFix() {
  document.addEventListener('click', event => {
    const button = event.target.closest('#adminCenter .admin-section-nav [data-admin-target]');
    if (!button) return;
    const dialog = button.closest('#adminCenter');
    queueMicrotask(() => enforceSingleAdminSurface(dialog, button.dataset.adminTarget));
  });

  document.addEventListener('ictc:rendered', () => {
    const dialog = document.querySelector('#adminCenter');
    const current = dialog?.querySelector('.admin-section-nav [aria-current="page"][data-admin-target]');
    if (dialog?.open && current) enforceSingleAdminSurface(dialog, current.dataset.adminTarget);
  });
}
