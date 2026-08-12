try {
  await import('./runtime-enterprise-boundaries-check.mjs');
} catch (error) {
  const message=String(error?.stack||error?.message||error).replace(/[\r\n]+/g,' | ').slice(0,4000);
  console.error(`::error title=runtime-enterprise-boundaries-check::${message}`);
  process.exitCode=1;
}
