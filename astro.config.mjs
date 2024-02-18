import { defineConfig } from 'astro/config';

import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: 'https://adelheid.org',
  trailingSlash: 'never',
  redirects: {
	'/assets/images/icons/favicons/favicon.png': {
		status: 302,
		destination: '/favicon.png'
	}
  },
  build: {
    format: 'file'
  },
  integrations: [sitemap()]
});