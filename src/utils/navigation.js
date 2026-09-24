/**
 * Utility functions for clean path-based routing in Latha Jewellery Works
 */

/**
 * Maps category slug or DB category to canonical route path
 */
export function getCategoryRoute(slug) {
  if (!slug || slug === 'all') return '/collections';
  const norm = slug.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (norm === 'chain' || norm === 'chains' || norm === 'chainsnecklaces' || norm === 'necklaces') {
    return '/collections/chains-necklaces';
  }
  if (norm === 'bangles' || norm === 'bangle' || norm === 'banglesbracelets' || norm === 'bracelets') {
    return '/collections/bangles-bracelets';
  }
  if (norm === 'kammal' || norm === 'earring' || norm === 'earrings') {
    return '/collections/kammal';
  }
  if (norm === 'kolus' || norm === 'anklet' || norm === 'anklets') {
    return '/collections/kolus';
  }
  if (norm === 'rings' || norm === 'ring') {
    return '/collections/rings';
  }
  return `/collections/${slug}`;
}

/**
 * Matches database category object for a given route slug
 */
export function matchCategoryByRouteSlug(routeSlug, categories) {
  if (!routeSlug || routeSlug === 'all') return null;
  const targetNorm = (routeSlug || '').toLowerCase().replace(/[^a-z0-9]/g, '');

  return (categories || []).find((c) => {
    const catSlugNorm = (c.slug || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    if (catSlugNorm === targetNorm) return true;
    if (catSlugNorm === 'chain' && (targetNorm.includes('chain') || targetNorm.includes('necklace'))) return true;
    if (catSlugNorm === 'bangles' && (targetNorm.includes('bangle') || targetNorm.includes('bracelet'))) return true;
    if (catSlugNorm === 'kammal' && (targetNorm.includes('kammal') || targetNorm.includes('earring'))) return true;
    if (catSlugNorm === 'kolus' && (targetNorm.includes('kolu') || targetNorm.includes('anklet'))) return true;
    if (catSlugNorm === 'rings' && targetNorm.includes('ring')) return true;
    return false;
  });
}

/**
 * Ensures root home route exists in history stack so pressing back never exits the website unexpectedly
 */
export function ensureHomeHistoryRoot() {
  if (typeof window === 'undefined') return;
  const path = window.location.pathname || '';
  const hash = window.location.hash || '';
  const search = window.location.search || '';

  // Do NOT tamper with history state on admin routes or when recovery/auth tokens are present
  if (
    path.startsWith('/admin') ||
    hash.includes('access_token') ||
    hash.includes('type=recovery') ||
    search.includes('type=recovery') ||
    search.includes('code=')
  ) {
    return;
  }

  const currentPath = path + search + hash;
  if (currentPath !== '/' && !window.history.state?.hasHomeRoot) {
    try {
      window.history.replaceState({ hasHomeRoot: true, page: 'home' }, '', '/');
      window.history.pushState({ hasHomeRoot: true, page: currentPath }, '', currentPath);
    } catch (e) {}
  }
}

/**
 * Programmatic SPA navigation using standard HTML5 History API
 */
export function navigateTo(path, e) {
  if (e) {
    // Allow opening link in new tab with Cmd/Ctrl/Shift/Middle click
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || (e.button && e.button !== 0)) {
      return;
    }
    e.preventDefault();
  }

  if (window.location.pathname !== path || window.location.hash !== '') {
    window.history.pushState({ hasHomeRoot: true, page: path }, '', path);
    window.dispatchEvent(new Event('locationchange'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

/**
 * Safely close any sub-page or category page and return to Home without exiting the website
 */
export function closeCurrentPageToHome(e) {
  navigateTo('/', e);
}
