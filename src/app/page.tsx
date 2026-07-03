import Link from "next/link";
import { ArrowRight, Droplets, IndianRupee, LayoutDashboard, Users } from "lucide-react";

const highlights = [
  {
    title: "Daily Delivery Tracking",
    description: "Mark delivered, skipped, or paused milk supply in a tap-friendly workflow.",
    icon: Droplets,
  },
  {
    title: "Customer Records",
    description: "Keep names, addresses, quantities, prices, and notes in one simple admin panel.",
    icon: Users,
  },
  {
    title: "Billing In INR",
    description: "Track monthly totals, payments, and due amounts with Indian rupee formatting.",
    icon: IndianRupee,
  },
];

export default function Home() {
  return (
    <main className="public-shell">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="public-panel rounded-[28px] px-5 py-4 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
                Milkman
              </p>
              <h1 className="mt-1 text-xl font-semibold sm:text-2xl">
                Lightweight milk delivery management
              </h1>
            </div>              <Link
              href="/en/admin/dashboard"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-strong"
            >
              Open Admin
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/en/customer/dashboard"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-primary"
            >
              Open Customer
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </header>

        <section className="grid flex-1 gap-6 py-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="public-panel rounded-[32px] p-6 sm:p-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-surface-muted px-3 py-1 text-sm font-medium text-muted">
              <LayoutDashboard className="h-4 w-4" />
              Admin-first, mobile-ready, bilingual
            </div>
            <h2 className="mt-6 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
              Built for milk sellers who need speed every morning.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg">
              Manage customers, daily milk quantities, delivery status, and billing
              from a responsive Next.js dashboard designed for phone-first use.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {highlights.map(({ title, description, icon: Icon }) => (
                <article key={title} className="public-muted-card rounded-3xl p-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
                </article>
              ))}
            </div>
          </div>

          <aside className="flex flex-col gap-6">
            <div className="public-panel rounded-[32px] p-6">
              <p className="text-sm font-semibold text-primary">Quick Routes</p>
              <div className="mt-4 grid gap-3">
                <Link
                  href="/en/admin/dashboard"
                  className="rounded-2xl border border-border bg-white px-4 py-3 text-sm font-medium transition hover:border-primary"
                >
                  Admin dashboard
                </Link>
                <Link
                  href="/hi/customer/dashboard"
                  className="rounded-2xl border border-border bg-white px-4 py-3 text-sm font-medium transition hover:border-primary"
                >
                  Customer dashboard
                </Link>
                <Link
                  href="/en/login"
                  className="rounded-2xl border border-border bg-white px-4 py-3 text-sm font-medium transition hover:border-primary"
                >
                  Login
                </Link>
              </div>
            </div>

            <div className="public-panel rounded-[32px] p-6">
              <p className="text-sm font-semibold text-primary">Starter Status</p>
              <ul className="mt-4 space-y-3 text-sm text-muted">
                <li>Responsive admin shell prepared</li>
                <li>Hindi and English message files added</li>
                <li>MongoDB connection helper and models included</li>
                <li>Customer and admin skeleton pages ready</li>
              </ul>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
