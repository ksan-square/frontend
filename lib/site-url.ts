function trimTrailingSlash(value: string) {
    return value.endsWith("/") ? value.slice(0, -1) : value;
}

export function getClientSiteUrl() {
    const envUrl = process.env.NEXT_PUBLIC_SITE_URL;

    if (envUrl) {
        if (envUrl.startsWith("http://") || envUrl.startsWith("https://")) {
            return trimTrailingSlash(envUrl);
        }

        return `https://${trimTrailingSlash(envUrl)}`;
    }

    if (typeof window !== "undefined") {
        return trimTrailingSlash(window.location.origin);
    }

    return "http://localhost:3000";
}
