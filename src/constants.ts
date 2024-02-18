export function getCanonicalURL(pathname: string): string {
	var canonicalURL = new URL(pathname, import.meta.env.SITE);
	var result = canonicalURL.href.replace(/\/+$/, '');
	if(result.includes('.html')) {
		result = result.substring(0, result.lastIndexOf('.')) || result;
	}

    return result;
}

export const blogPaginationSize: number = 5;