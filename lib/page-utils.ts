export type QueryParam = string | string[] | undefined;

export function firstParam(value: QueryParam) {
    return Array.isArray(value) ? value[0] : value;
}

export function parsePageParam(value: QueryParam) {
    const page = Number(firstParam(value));

    if (!Number.isInteger(page) || page < 1) {
        return 1;
    }

    return page;
}

export function parseTrimmedParam(value: QueryParam) {
    const parsed = firstParam(value)?.trim();

    return parsed || null;
}

export function parseMonthParam(value: QueryParam) {
    const month = firstParam(value);

    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
        return null;
    }

    return month;
}

export function createPathWithQuery(
    basePath: string,
    query?: Record<string, string | number | null | undefined>,
) {
    const params = new URLSearchParams();

    for (const [key, value] of Object.entries(query ?? {})) {
        if (value !== null && value !== undefined && value !== "") {
            params.set(key, String(value));
        }
    }

    const search = params.toString();

    return search ? `${basePath}?${search}` : basePath;
}

export function getPaginationRange({
    currentPage,
    pageSize,
    totalItems,
}: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
}) {
    const rangeStart = (currentPage - 1) * pageSize;
    const rangeEnd = rangeStart + pageSize - 1;

    return {
        displayStart: totalItems === 0 ? 0 : rangeStart + 1,
        displayEnd: Math.min(rangeEnd + 1, totalItems),
    };
}
