import Breadcrumbs from "@/app/_components/breadcrumbs";
import type { LegalDocument } from "@/lib/legal-content";

export default function LegalDocumentPage({
    document,
    breadcrumbLabel,
}: {
    document: LegalDocument;
    breadcrumbLabel: string;
}) {
    return (
        <main className="mx-auto max-w-4xl space-y-8">
            <Breadcrumbs items={[{ label: breadcrumbLabel }]} />

            <section className="relative overflow-hidden bg-black p-6 shadow-2xl shadow-black/30 ring-1 ring-white/10 md:p-8">
                <div className="editorial-rule absolute inset-x-0 top-0 h-1" />
                <div className="space-y-4">
                    <p className="inline-flex bg-white px-3 py-1 text-xs font-black uppercase text-black">
                        Legal
                    </p>
                    <div className="space-y-2">
                        <h1 className="text-3xl font-black text-white md:text-5xl">
                            {document.title}
                        </h1>
                        <p className="text-sm text-zinc-400 md:text-base">
                            最終更新日：{document.updatedAt}
                        </p>
                    </div>
                </div>
            </section>

            <article className="space-y-8 bg-[#111113] p-6 shadow-xl shadow-black/20 ring-1 ring-white/10 md:p-8">
                <div className="space-y-5 text-sm leading-8 text-zinc-200 md:text-base">
                    {document.intro.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                    ))}
                </div>

                {document.sections.map((section) => (
                    <section key={section.heading} className="space-y-4 border-t border-white/8 pt-6 first:border-t-0 first:pt-0">
                        <h2 className="text-xl font-black text-white md:text-2xl">
                            {section.heading}
                        </h2>

                        {section.paragraphs?.map((paragraph) => (
                            <p
                                key={paragraph}
                                className="text-sm leading-8 text-zinc-200 md:text-base"
                            >
                                {paragraph}
                            </p>
                        ))}

                        {section.orderedList ? (
                            <ol className="space-y-3 pl-6 text-sm leading-8 text-zinc-200 md:text-base">
                                {section.orderedList.map((item) => (
                                    <li key={item} className="list-decimal">
                                        {item}
                                    </li>
                                ))}
                            </ol>
                        ) : null}

                        {section.unorderedList ? (
                            <ul className="space-y-3 pl-6 text-sm leading-8 text-zinc-200 md:text-base">
                                {section.unorderedList.map((item) => (
                                    <li key={item} className="list-disc">
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        ) : null}
                    </section>
                ))}

                {document.contactEmail ? (
                    <section className="border-t border-white/8 pt-6">
                        <a
                            href={`mailto:${document.contactEmail}`}
                            className="inline-flex rounded-sm bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-zinc-100"
                        >
                            {document.contactEmail}
                        </a>
                    </section>
                ) : null}
            </article>
        </main>
    );
}
