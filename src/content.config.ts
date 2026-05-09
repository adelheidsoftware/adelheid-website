import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const postsCollection = defineCollection({
    loader: glob({ pattern: "**/*.md", base: "./src/content/posts" }),
    schema: z.object({
        title: z.string(),
        pubDate: z.date(),
        summary: z.string(),
        author: z.string(),
        authorTitle: z.string(),
        tags: z.array(z.string())
    })
});

export const collections = {
    posts: postsCollection,
};
