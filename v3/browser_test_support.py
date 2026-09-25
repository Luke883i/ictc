"""Shared browser-test setup for governed product preconditions.

Test-only helper. It does not alter runtime behavior or create product authority.
Browser oracles unrelated to first-use onboarding may materialize an accepted
user state through the same public runtime route used by ICTC. The dedicated
A6-UX4 oracle proves the actual first-run progression and replay contract.
"""


def _settle_onboarding_dom(page, base):
    if not str(page.url).startswith(base):
        return
    if page.locator('#ictcOnboardingDialog[open]').count() > 0:
        page.reload(wait_until='networkidle')
    page.wait_for_function("()=>document.documentElement.dataset.nativeSemanticLattice==='3.2.0'&&Number(document.documentElement.dataset.experienceCycle||0)>0&&!document.querySelector('#ictcOnboardingDialog[open]')")


def ensure_onboarded(page, base, role='admin'):
    base = str(base).rstrip('/')
    headers = {'x-ictc-role': role, 'x-ictc-actor-id': f'local-{role}'}
    bootstrap = page.request.get(base + '/api/bootstrap', headers=headers)
    if not bootstrap.ok:
        raise AssertionError(f'onboarding bootstrap failed: {bootstrap.status} {bootstrap.text()[:300]}')
    payload = bootstrap.json() or {}
    onboarding = (payload.get('experience') or {}).get('onboarding') or {}
    if onboarding.get('accepted') is True:
        _settle_onboarding_dom(page, base)
        return {'prepared': False, 'accepted': True, 'source': 'bootstrap'}
    response = page.request.patch(
        base + '/api/profile/onboarding',
        headers={**headers, 'content-type': 'application/json'},
        data={'progress': 100, 'elapsedMs': 1, 'accept': True},
    )
    if not response.ok:
        raise AssertionError(f'onboarding prepare failed: {response.status} {response.text()[:300]}')
    result = ((response.json() or {}).get('result') or {})
    if result.get('accepted') is not True or result.get('readOnly') is not True:
        raise AssertionError(f'onboarding prepare not accepted: {result}')
    if str(page.url).startswith(base):
        page.reload(wait_until='networkidle')
    _settle_onboarding_dom(page, base)
    return {'prepared': True, 'accepted': True, 'source': 'profile/onboarding'}
