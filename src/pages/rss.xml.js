import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import company from '../data/company.json';

export async function GET(context) {
	const posts = await getCollection("posts");
	return rss({
		title: `${company.name} | Blog`,
		description: 'A feed of the latest posts from our blog.',
		site: context.site,
		items: posts.map((post) => ({
			title: post.data.title,
			pubDate: post.data.pubDate,
			description: post.data.summary,
			link: `/blog/${post.slug}`,
		  })),
		customData: `<language>en-us</language>`,
	});
}