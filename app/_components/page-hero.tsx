type PageHeroProps = {
    badge: string;
    title: string;
    description?: string;
    action?: React.ReactNode;
};

export default function PageHero({ badge, title, description, action }: PageHeroProps) {
    const body = (
        <>
            <p className="inline-flex bg-white px-3 py-1 text-xs font-black uppercase text-black">{badge}</p>
            <h1 className="mt-5 text-4xl font-black text-white md:text-5xl">{title}</h1>
            {description && (
                <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-300 md:text-base">{description}</p>
            )}
        </>
    );

    return (
        <section className="relative overflow-hidden bg-black p-6 shadow-2xl shadow-black/30 ring-1 ring-white/10 md:p-8">
            <div className="editorial-rule absolute inset-x-0 top-0 h-1" />
            {action ? (
                <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                    <div>{body}</div>
                    {action}
                </div>
            ) : body}
        </section>
    );
}
