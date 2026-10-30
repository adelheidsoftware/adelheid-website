// Turns a built page's path into its public path, e.g. "/faq.html" -> "/faq" and "/index.html" -> "/"
export function getPagePath(pathname: string): string {
	const path = pathname.replace(/\.html$/, '').replace(/\/index$/, '/');
	return path.length > 1 ? path.replace(/\/+$/, '') : path;
}

export function getCanonicalURL(pathname: string): string {
	return new URL(getPagePath(pathname), import.meta.env.SITE).href;
}

export const blogPaginationSize: number = 5;
