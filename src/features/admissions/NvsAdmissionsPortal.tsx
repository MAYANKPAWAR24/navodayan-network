import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { NVS_GUIDES } from "@/config/nvsLinks";

export function NvsAdmissionsPortal() {
  return (
    <div className="space-y-5">
      <section className="rounded-3xl border border-slate-200/80 bg-gradient-to-r from-navy-950 via-navy-900 to-blue-900 p-6 text-white shadow-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-400">NVS Admissions & Exam Portal</p>
            <h1 className="mt-2 text-2xl font-black tracking-tight md:text-3xl">Built by Navodayans, For Navodayans — One Campus, One Bond, Forever.</h1>
          </div>
          <Link href="/admissions" className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-900 transition hover:bg-amber-400">Open full portal <ArrowUpRight className="h-3.5 w-3.5" /></Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {NVS_GUIDES.map((guide) => (
          <article key={guide.id} className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <span className="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-700">{guide.badge}</span>
            <h2 className="mt-4 text-xl font-black text-slate-900">{guide.title}</h2>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">{guide.description}</p>
            <ul className="mt-4 space-y-2 text-xs text-slate-600">
              {guide.bullets.slice(0, 3).map((bullet) => (
                <li key={bullet} className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-navy-700" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
            <Link href={guide.href} target="_blank" className="mt-5 inline-flex rounded-xl bg-navy-800 px-3 py-2 text-[11px] font-bold text-white transition hover:bg-navy-900">{guide.actionLabel} ↗</Link>
          </article>
        ))}
      </section>
    </div>
  );
}
