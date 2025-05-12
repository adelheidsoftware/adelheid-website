import { defineConfig } from 'astro/config';

import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: 'https://adelheid.org',
  trailingSlash: 'never',
  scopedStyleStrategy: 'attribute',
  redirects: {
	'/assets/images/icons/favicons/favicon.png': {
		status: 301,
		destination: '/favicon.png'
	},
	'/posts/[...slug]': {
		status: 301,
		destination: '/blog/[...slug]'
	},
    'privacy-policy': {
        status: 301,
        destination:  'privacy'
    },
	'/software': {
		status: 301,
		destination: '/projects'
	}
  },
  build: {
    format: 'file'
  },
  integrations: [sitemap()]
});