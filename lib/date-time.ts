// @boundary ISOMORPHIC (browser-safe)
// 日時フォーマット・ラベル生成ユーティリティ。
// Server Component / Client Component 両方から安全に使える。

export function formatTime(time: string | null) {
    return time ? time.slice(0, 5) : null;
}

export function formatDateJa(date: string) {
    return new Date(date).toLocaleDateString("ja-JP");
}

export function formatDateTimeJa(date: string) {
    return new Date(date).toLocaleString("ja-JP");
}

export function getTodayInTokyo() {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Tokyo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(new Date());
}

export function formatMonthLabel(month: string) {
    const [year, monthNumber] = month.split("-");

    return `${year}年${Number(monthNumber)}月`;
}

export function getMonthKey(date: string) {
    return date.slice(0, 7);
}

export function getWeekKey(date: string) {
    const day = new Date(`${date}T00:00:00`);
    const year = day.getFullYear();
    const month = day.getMonth();
    const weekOfMonth = Math.floor((day.getDate() - 1) / 7) + 1;

    return `${year}-${String(month + 1).padStart(2, "0")}-w${weekOfMonth}`;
}

export function formatWeekLabel(date: string) {
    const day = new Date(`${date}T00:00:00`);
    const weekOfMonth = Math.floor((day.getDate() - 1) / 7) + 1;

    return `${day.getMonth() + 1}月 第${weekOfMonth}週`;
}
