try {
  await import('./evidence-check.mjs');
} catch (error) {
  const message=String(error?.stack||error?.message||error).replace(/%/g,'%25').replace(/\r/g,'%0D').replace(/\n/g,'%0A');
  console.error(`::error title=evidence-check-diagnostic::${message}`);
  process.exit(1);
}
