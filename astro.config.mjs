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
    '/privacy-policy': {
        status: 301,
        destination: '/privacy'
    },
	'/software': {
		status: 301,
		destination: '/projects'
	}
  },
  build: {
    format: 'file'
  },
  integrations: [sitemap({
    // Old post URLs that only redirect to /blog (see src/pages/posts/[...slug].astro)
    filter: (page) => !new URL(page).pathname.startsWith('/posts/')
  })]
});