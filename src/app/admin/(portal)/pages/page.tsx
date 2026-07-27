import { listManagedPages } from "@/lib/data/store";

export default async function AdminPagesPage() {
  const pages = await listManagedPages();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.28em] text-white/42">Content</p>
        <h1 className="text-display mt-3 text-5xl">Managed pages</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-white/58">
          These brand and utility pages are already backed by the shared repository layer, so the admin portal can inspect their current publication state safely.
        </p>
      </div>

      <div className="grid gap-4">
        {pages.map((page) => (
          <div key={page.id} className="rounded-[1.5rem] border border-white/10 bg-[#111213] p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-lg font-medium text-white">{page.title}</p>
                <p className="mt-1 text-sm text-white/52">/{page.slug}</p>
              </div>
              <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.22em] text-white/52">
                {page.status}
              </span>
            </div>
            <p className="mt-4 line-clamp-3 text-sm leading-7 text-white/62">{page.heroHeading}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
