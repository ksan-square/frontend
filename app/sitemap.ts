import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo";
import { supabase } from "@/lib/supabase";

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

    const [{ data: songs }, { data: lives }, { data: wikiPages }] = await Promise.all([
        supabase
            .from("songs")
            .select("slug,updated_at")
            .eq("is_delete", false),
        supabase
            .from("lives")
            .select("id,updated_at")
            .eq("is_delete", false),
        supabase
            .from("wiki_pages")
            .select("slug,updated_at")
            .eq("is_delete", false)
            .eq("is_published", true),
    ]);

    const songPages: MetadataRoute.Sitemap = (songs ?? []).map((song) => ({
        url: `${siteUrl}/songs/${song.slug}`,
        lastModified: song.updated_at ? new Date(song.updated_at) : now,
        changeFrequency: "weekly",
        priority: 0.7,
    }));

    const livePages: MetadataRoute.Sitemap = (lives ?? []).map((live) => ({
        url: `${siteUrl}/lives/${live.id}`,
        lastModified: live.updated_at ? new Date(live.updated_at) : now,
        changeFrequency: "weekly",
        priority: 0.7,
    }));

    const wikiDetailPages: MetadataRoute.Sitemap = (wikiPages ?? []).map((page) => ({
        url: `${siteUrl}/wiki/${page.slug}`,
        lastModified: page.updated_at ? new Date(page.updated_at) : now,
        changeFrequency: "weekly",
        priority: 0.6,
    }));

    return [...staticPages, ...songPages, ...livePages, ...wikiDetailPages];
}
