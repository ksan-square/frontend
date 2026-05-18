import Link from "next/link";

export type BreadcrumbItem = {
    href?: string;
    label: string;
};

export default function Breadcrumbs({
    items,
}: {
    items: BreadcrumbItem[];
}) {
    return (
        <nav aria-label="パンくず" className="text-sm text-zinc-400">
            <ol className="flex flex-wrap items-center gap-2">
                <li>
                    <Link href="/" className="hover:text-fuchsia-300">
                        ホーム
                    </Link>
                </li>

                {items.map((item) => (
                    <li
                        key={`${item.href ?? "current"}-${item.label}`}
                        className="flex items-center gap-2"
                    >
                        <span className="text-zinc-600">/</span>
                        {item.href ? (
                            <Link
                                href={item.href}
                                className="hover:text-fuchsia-300"
                            >
                                {item.label}
                            </Link>
                        ) : (
                            <span
                                aria-current="page"
                                className="font-semibold text-zinc-200"
                            >
                                {item.label}
                            </span>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
}
