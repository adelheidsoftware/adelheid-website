export function getCanonicalURL(pathname: string, site: URL | undefined): string {
	if(site == undefined) {
		site = new URL("https://adelheid.org");
	}
	var canonicalURL = new URL(pathname, site);
    //const canonicalURL = new URL(pathname, site);
    return canonicalURL.toString().replace(/\/+$/, '');
}