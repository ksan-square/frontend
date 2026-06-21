import type { MetadataRoute } from "next";
import { getPublicSitemap } from "@/lib/public-api";
import { getSiteUrl } from "@/lib/seo";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const siteUrl = getSiteUrl();
    const now = new Date();
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: `${siteUrl}/`,
            lastModified: now,
            changeFrequency: "daily",
            priority: 1,
        },
        {
            url: `${siteUrl}/songs`,
            lastModified: now,
            changeFrequency: "daily",
            priority: 0.9,
        },
        {
            url: `${siteUrl}/lives`,
            lastModified: now,
            changeFrequency: "daily",
            priority: 0.9,
        },
        {
            url: `${siteUrl}/wiki`,
            lastModified: now,
            changeFrequency: "daily",
            priority: 0.8,
        },
    ];

    const { songs, lives, wiki_pages: wikiPages } = await getPublicSitemap().catch((error) => {
        console.error("Failed to fetch sitemap entries", error);
        return { songs: [], lives: [], wiki_pages: [] };
    });

    const songPages: MetadataRoute.Sitemap = (songs ?? []).map((song) => ({
        url: `${siteUrl}/songs/${song.url}`,
        lastModified: song.updated_at ? new Date(song.updated_at) : now,
        changeFrequency: "weekly",
        priority: 0.7,
    }));

    const livePages: MetadataRoute.Sitemap = (lives ?? []).map((live) => ({
        url: `${siteUrl}/lives/${live.url}`,
        lastModified: live.updated_at ? new Date(live.updated_at) : now,
        changeFrequency: "weekly",
        priority: 0.7,
    }));

    const wikiDetailPages: MetadataRoute.Sitemap = (wikiPages ?? []).map((page) => ({
        url: `${siteUrl}/wiki/${page.url}`,
        lastModified: page.updated_at ? new Date(page.updated_at) : now,
        changeFrequency: "weekly",
        priority: 0.6,
    }));

    return [...staticPages, ...songPages, ...livePages, ...wikiDetailPages];
}
