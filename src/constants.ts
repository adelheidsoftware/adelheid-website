export function getCanonicalURL(pathname: string, site: URL | undefined): string {
	if(site == undefined) {
		site = new URL("https://adelheid.org");
	}
	var canonicalURL = new URL(pathname, site);
	var result = canonicalURL.toString().replace(/\/+$/, '');
	if(result.includes('.html')) {
		result = result.substring(0, result.lastIndexOf('.')) || result;
	}

    return result;
}