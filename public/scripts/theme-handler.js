// Runs before the page renders so the right theme shows without a flash.
// Uses the visitor's choice from the theme toggle if they made one, otherwise follows their system setting (including changes while the page is open).
(() => {
	const storageKey = 'theme'; // Must match ThemeToggle.astro
	const systemLight = window.matchMedia('(prefers-color-scheme: light)');

	const getChosenTheme = () => {
		try {
			const theme = localStorage.getItem(storageKey);
			return theme === 'light' || theme === 'dark' ? theme : null;
		} catch {
			return null; // Storage can be blocked by browser privacy settings
		}
	};

	const applyTheme = () => {
		document.documentElement.setAttribute('data-theme', getChosenTheme() ?? (systemLight.matches ? 'light' : 'dark'));
	};

	applyTheme();
	systemLight.addEventListener('change', applyTheme);
})();
