const normalizePathSegments = (path) => {
    const segments = path.split('/').filter((segment) => segment !== '');
    const normalizedSegments = [];
    for (const segment of segments) {
        if (segment === '.') {
            continue;
        }
        if (segment === '..') {
            // Remove last segment for parent directory reference
            normalizedSegments.pop();
            continue;
        }
        normalizedSegments.push(segment);
    }
    return `/${normalizedSegments.join('/')}`;
};
const deriveBasePrefixes = (pathname) => {
    if (!pathname || pathname === '/') {
        return [];
    }
    const pathOnly = pathname.split(/[?#]/)[0] || '/';
    const trimmed = pathOnly.endsWith('/') ? pathOnly.slice(0, -1) : pathOnly;
    if (!trimmed || trimmed === '/') {
        return [];
    }
    const segments = trimmed.split('/').filter(Boolean);
    if (!segments.length) {
        return [];
    }
    // If the last segment looks like a file (contains a dot), treat it as such and drop it
    if (segments[segments.length - 1]?.includes('.')) {
        segments.pop();
    }
    if (!segments.length) {
        return [];
    }
    return [`/${segments.join('/')}`];
};
/**
 * Apply the same redirect validation logic used in the enhanced form handler.
 * Returns either the sanitized redirect target or the provided safe fallback.
 */
export function resolveFormRedirect({ redirectUrl, safeInternalHash, currentOrigin, currentPathname, allowedPaths = [
    '/contact-thanks/',
    '/newsletter-thanks/',
    '/contact-error/',
    '/newsletter-error/',
    '/newsletter-check-email/',
], allowedPrefixes = ['/contact-', '/newsletter-'], }) {
    const targetUrl = redirectUrl || '#';
    try {
        if (targetUrl.startsWith('//')) {
            return safeInternalHash;
        }
        const url = new URL(targetUrl, currentOrigin);
        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
            return safeInternalHash;
        }
        if (url.origin !== currentOrigin) {
            return safeInternalHash;
        }
        const hasControlChars = (str) => {
            for (let i = 0; i < str.length; i++) {
                const code = str.charCodeAt(i);
                if ((code >= 0 && code <= 31) || code === 127) {
                    return true;
                }
            }
            return false;
        };
        if (hasControlChars(url.hostname) ||
            hasControlChars(url.search) ||
            hasControlChars(url.hash)) {
            return safeInternalHash;
        }
        let decodedPathname;
        let decodedSearch;
        try {
            decodedPathname = decodeURIComponent(url.pathname);
            decodedSearch = decodeURIComponent(url.search);
        }
        catch {
            return safeInternalHash;
        }
        const hasPathTraversal = decodedPathname.includes('/../') ||
            decodedPathname.startsWith('../') ||
            decodedSearch.includes('/../') ||
            decodedSearch.startsWith('../');
        const hasNullBytes = decodedPathname.includes('\0') || decodedSearch.includes('\0');
        const hasEncodedSeparators = url.pathname.toLowerCase().includes('%2f') ||
            url.pathname.toLowerCase().includes('%5c') ||
            url.search.toLowerCase().includes('%2f') ||
            url.search.toLowerCase().includes('%5c');
        if (hasPathTraversal || hasNullBytes || hasEncodedSeparators) {
            return safeInternalHash;
        }
        const normalizedPath = normalizePathSegments(decodedPathname).toLowerCase();
        // Build allowed path/prefix sets, accounting for deployments that live under a subdirectory
        const basePrefixes = deriveBasePrefixes(currentPathname);
        const normalizedAllowedPaths = new Set();
        const normalizedAllowedPrefixes = new Set();
        const addNormalizedPath = (path) => {
            normalizedAllowedPaths.add(normalizePathSegments(path).toLowerCase());
        };
        const addNormalizedPrefix = (prefix) => {
            normalizedAllowedPrefixes.add(normalizePathSegments(prefix).toLowerCase());
        };
        for (const path of allowedPaths) {
            addNormalizedPath(path);
            for (const base of basePrefixes) {
                addNormalizedPath(`${base}${path}`);
            }
        }
        for (const prefix of allowedPrefixes) {
            addNormalizedPrefix(prefix);
            for (const base of basePrefixes) {
                addNormalizedPrefix(`${base}${prefix}`);
            }
        }
        const isAllowedPath = normalizedAllowedPaths.has(normalizedPath) ||
            Array.from(normalizedAllowedPrefixes).some((prefix) => normalizedPath.startsWith(prefix));
        if (isAllowedPath) {
            return url.href;
        }
        return safeInternalHash;
    }
    catch {
        return safeInternalHash;
    }
}
