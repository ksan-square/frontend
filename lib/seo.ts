export const SITE_NAME = "こしあんスクエア";
export const SITE_LOGO_PATH = "/koshian_square_logo.png";
export const SITE_OG_IMAGE_PATH = "/ksan-square-OPG.png";
export const DEFAULT_DESCRIPTION =
    "宵越しのアンサンブルの非公式ファンコミュニティ「こしあんスクエア」。ライブ情報・セトリ・コール・歌割・Wikiをまとめて掲載。";

function trimTrailingSlash(value: string) {
    return value.endsWith("/") ? value.slice(0, -1) : value;
}

export function getSiteUrl() {
    const envUrl =
        process.env.NEXT_PUBLIC_SITE_URL ??
        process.env.SITE_URL ??
        process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL ??
        process.env.VERCEL_PROJECT_PRODUCTION_URL;

    if (!envUrl) {
        return "http://localhost:3000";
    }

    if (envUrl.startsWith("http://") || envUrl.startsWith("https://")) {
        return trimTrailingSlash(envUrl);
    }

    return `https://${trimTrailingSlash(envUrl)}`;
}

export function createMetadataBase() {
    return new URL(getSiteUrl());
}

export function buildCanonicalPath(path: string) {
    return path.startsWith("/") ? path : `/${path}`;
}

export function buildAbsoluteUrl(path: string) {
    return new URL(buildCanonicalPath(path), createMetadataBase()).toString();
}

export function stripMarkdown(value: string) {
    return value
        .replace(/```[\s\S]*?```/g, " ")
        .replace(/`([^`]+)`/g, "$1")
        .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        .replace(/^#{1,6}\s+/gm, "")
        .replace(/^\s*[-*+]\s+/gm, "")
        .replace(/^\s*\d+\.\s+/gm, "")
        .replace(/\*\*([^*]+)\*\*/g, "$1")
        .replace(/\*([^*]+)\*/g, "$1")
        .replace(/_([^_]+)_/g, "$1")
        .replace(/~~([^~]+)~~/g, "$1")
        .replace(/<[^>]+>/g, " ")
        .replace(/\[\/?member(?::[^\]]+)?\]/g, " ")
        .replace(/\[\/?call\]/g, " ")
        .replace(/\[\/?color(?::[^\]]+)?\]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

export function createDescription(value: string | null | undefined, maxLength = 120) {
    const normalized = stripMarkdown(value ?? "");

    if (!normalized) {
        return null;
    }

    if (normalized.length <= maxLength) {
        return normalized;
    }

    return `${normalized.slice(0, maxLength).trimEnd()}…`;
}

export function joinDescriptionParts(
    parts: Array<string | null | undefined>,
    fallback = DEFAULT_DESCRIPTION,
) {
    const filtered = parts
        .map((part) => part?.trim())
        .filter((part): part is string => Boolean(part));

    if (filtered.length === 0) {
        return fallback;
    }

    return filtered.join(" / ");
}
