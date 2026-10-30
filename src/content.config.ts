import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

// Post dates are written in local time with no UTC offset (e.g. 2026-07-04T20:00:00), next to the timezone they
// were written in. YAML reads offset-free dates as UTC, so shift them by that timezone's offset on that date.
// This handles DST automatically.
function fromLocalTime(date: Date, timeZone: string): Date {
    const offsetMinutesAt = (instant: Date): number => {
        const offset = new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: "longOffset" })
            .formatToParts(instant)
            .find((part) => part.type === "timeZoneName")?.value ?? ""; // e.g. "GMT-04:00"
        const match = offset.match(/GMT([+-])(\d{2}):(\d{2})/);
        return match ? (match[1] === "-" ? -1 : 1) * (Number(match[2]) * 60 + Number(match[3])) : 0;
    };

    const guess = new Date(date.getTime() - offsetMinutesAt(date) * 60_000);
    // Re-check the offset at the corrected time, in case the first guess landed across a DST change
    return new Date(date.getTime() - offsetMinutesAt(guess) * 60_000);
}

function isValidTimeZone(timeZone: string): boolean {
    try {
        new Intl.DateTimeFormat("en-US", { timeZone });
        return true;
    } catch {
        return false;
    }
}

const postsCollection = defineCollection({
    loader: glob({ pattern: "**/*.md", base: "./src/content/posts" }),
    schema: z.object({
        title: z.string(),
        pubDate: z.date(),
        // A timezone name like "America/New_York". Avoid abbreviations like "EST", which ignore DST.
        timeZone: z.string().refine(isValidTimeZone, { message: "Must be a timezone name, e.g. \"America/New_York\"" }),
        summary: z.string(),
        author: z.string(),
        authorTitle: z.string(),
        tags: z.array(z.string()),
        draft: z.boolean().optional()
    }).transform((data) => ({ ...data, pubDate: fromLocalTime(data.pubDate, data.timeZone) }))
});

export const collections = {
    posts: postsCollection,
};
