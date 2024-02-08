const theme = (() => {
	if(typeof localStorage !== undefined && localStorage.getItem('theme')) {
		return localStorage.getItem('theme');
	}

	const preferredTheme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';

	window.localStorage.setItem('theme', preferredTheme);

	return preferredTheme;
})();

document.documentElement.setAttribute('data-theme', theme);