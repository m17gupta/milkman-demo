import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  ArrowRight,
  Droplets,
  Leaf,
  ShieldCheck,
  Clock,
  Sparkles,
  Sun,
  Truck,
  Heart,
  Star,
  Users,
  LayoutDashboard,
  UserCircle,
} from "lucide-react";

type LocaleHomePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function LocaleHomePage({ params }: LocaleHomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale });

  const features = [
    {
      icon: Droplets,
      title: "Farm-Fresh Daily",
      desc: "Pure, unadulterated milk sourced directly from local dairy farms every morning at dawn.",
      color: "emerald",
    },
    {
      icon: Clock,
      title: "6 AM Guaranteed",
      desc: "Your milk arrives before sunrise, rain or shine. Never miss your morning chai again.",
      color: "blue",
    },
    {
      icon: ShieldCheck,
      title: "Quality Assured",
      desc: "Every batch is tested for purity. We maintain strict cold-chain from farm to your doorstep.",
      color: "amber",
    },
    {
      icon: Leaf,
      title: "100% Natural",
      desc: "No preservatives, no additives. Just pure, fresh milk the way nature intended.",
      color: "green",
    },
    {
      icon: Truck,
      title: "Smart Delivery",
      desc: "Pause, skip, or adjust your delivery anytime. Full control at your fingertips.",
      color: "indigo",
    },
    {
      icon: Heart,
      title: "Community Trust",
      desc: "Serving 500+ families across Kharar. Join the fastest-growing dairy community.",
      color: "rose",
    },
  ];

  const testimonials = [
    {
      name: "Priya Sharma",
      role: "Sector 15, Kharar",
      text: "Switching to Dairy was the best decision. The milk is so fresh and creamy — my family loves it!",
      rating: 5,
    },
    {
      name: "Rajesh Kumar",
      role: "Phase 2, Landra",
      text: "I love that I can pause deliveries when we're out of town. The app makes it so easy to manage.",
      rating: 5,
    },
    {
      name: "Anita Verma",
      role: "Gilco Valley",
      text: "6 AM delivery like clockwork. The quality is consistently excellent. Highly recommend!",
      rating: 5,
    },
  ];

  const stats = [
    { value: "500+", label: "Happy Families", icon: Users },
    { value: "6 AM", label: "Daily Delivery", icon: Sun },
    { value: "98%", label: "On-Time Rate", icon: Star },
    { value: "3 Yrs", label: "Serving Kharar", icon: Sparkles },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-emerald-50/30 to-white overflow-hidden">
      {/* ===== HERO ===== */}
      <section className="relative min-h-[90vh] flex items-center">
        {/* Decorative background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-emerald-100/40 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-amber-100/30 blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-[300px] h-[300px] rounded-full bg-emerald-50/50 blur-2xl" />

          {/* Floating milk drops */}
          <div className="absolute top-[15%] left-[8%] w-3 h-3 rounded-full bg-emerald-200/40 animate-float-slow" />
          <div className="absolute top-[25%] right-[12%] w-2 h-2 rounded-full bg-amber-200/40 animate-float-slower" />
          <div className="absolute bottom-[30%] left-[20%] w-4 h-4 rounded-full bg-emerald-200/30 animate-float" />
          <div className="absolute bottom-[20%] right-[25%] w-2.5 h-2.5 rounded-full bg-amber-200/30 animate-float-slow" style={{ animationDelay: "1.5s" }} />
        </div>

        <div className="relative mx-auto max-w-[1200px] px-6 lg:px-8 w-full py-20">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-20">
            {/* Left: Content */}
            <div className="flex-1 text-center lg:text-left space-y-8 max-w-xl">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-semibold animate-fade-in">
                <Sparkles className="h-4 w-4" />
                <span>Trusted by 500+ families in Kharar</span>
              </div>

              {/* Title */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 leading-[1.1] tracking-tight animate-fade-in" style={{ animationDelay: "0.1s" }}>
                Fresh milk,{" "}
                <span className="bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">
                  delivered to your home
                </span>{" "}
                every morning
              </h1>

              {/* Subtitle */}
              <p className="text-lg sm:text-xl text-gray-500 leading-relaxed max-w-lg mx-auto lg:mx-0 animate-fade-in" style={{ animationDelay: "0.2s" }}>
                {t("landing.heroSubtitle")}
              </p>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row gap-4 items-center lg:items-start animate-fade-in" style={{ animationDelay: "0.3s" }}>
                <a
                  href="#options"
                  className="group inline-flex items-center gap-3 h-14 px-8 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold text-base shadow-lg shadow-emerald-200/50 hover:shadow-xl hover:shadow-emerald-300/50 hover:-translate-y-0.5 transition-all duration-300"
                >
                  {t("landing.startNow")}
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </a>
                <a
                  href="#features"
                  className="group inline-flex items-center gap-2 h-14 px-8 rounded-2xl bg-white border-2 border-gray-100 text-gray-700 font-semibold text-base hover:border-emerald-200 hover:text-emerald-600 hover:shadow-lg transition-all duration-300"
                >
                  <Heart className="h-5 w-5 text-rose-400" />
                  See how it works
                </a>
              </div>

              {/* Trust bar */}
              <div className="flex flex-wrap items-center gap-6 pt-4 animate-fade-in" style={{ animationDelay: "0.4s" }}>
                {[
                  { icon: ShieldCheck, text: "Quality tested" },
                  { icon: Leaf, text: "100% natural" },
                  { icon: Truck, text: "Doorstep delivery" },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-2 text-sm text-gray-400 font-medium">
                    <item.icon className="h-4 w-4 text-emerald-500" />
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Hero Image */}
            <div className="flex-1 flex items-center justify-center animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <div className="relative">
                {/* Glow behind bottle */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-200/30 via-amber-100/20 to-emerald-200/30 blur-3xl scale-150 animate-pulse-slow" />

                {/* Main image */}
                <div className="relative z-10 w-72 h-72 sm:w-80 sm:h-80 lg:w-96 lg:h-96 animate-float">
                  <img
                    src="/milk-hero.png"
                    alt="Fresh Premium Milk"
                    className="w-full h-full object-contain drop-shadow-2xl"
                  />
                </div>

                {/* Floating badges */}
                <div className="absolute -top-4 -right-4 z-20 bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-lg border border-gray-100 animate-fade-in" style={{ animationDelay: "0.6s" }}>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-gray-700">Fresh Today</span>
                  </div>
                </div>

                <div className="absolute -bottom-2 -left-6 z-20 bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-lg border border-gray-100 animate-fade-in" style={{ animationDelay: "0.8s" }}>
                  <div className="flex items-center gap-2">
                    <Droplets className="h-4 w-4 text-emerald-500" />
                    <span className="text-xs font-bold text-gray-700">Pure & Natural</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom wave divider */}
        <div className="absolute bottom-0 left-0 right-0 leading-none pointer-events-none">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path d="M0 60L60 70C120 80 240 100 360 105C480 110 600 100 720 85C840 70 960 50 1080 45C1200 40 1320 50 1380 55L1440 60V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ===== STATS BAR ===== */}
      <section className="relative -mt-1 bg-white py-12 lg:py-16">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-10">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className="text-center space-y-2 animate-fade-in"
                style={{ animationDelay: `${i * 0.1 + 0.3}s` }}
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto mb-2">
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className="text-3xl lg:text-4xl font-black text-gray-900">{stat.value}</div>
                <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" className="py-20 lg:py-28 bg-gradient-to-b from-white to-emerald-50/20">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-semibold">
              <Sparkles className="h-4 w-4" />
              Why Dairy?
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight">
              Freshness you can{" "}
              <span className="bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">
                taste
              </span>
            </h2>
            <p className="text-lg text-gray-500">
              Everything we do is designed to bring you the freshest, most natural milk — every single day.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className="group relative bg-white rounded-3xl p-6 lg:p-8 border border-gray-100 hover:border-emerald-200 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 animate-fade-in"
                style={{ animationDelay: `${i * 0.08 + 0.2}s` }}
              >
                {/* Hover gradient overlay */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-50/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                <div className="relative z-10 space-y-4">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl group-hover:scale-110 transition-transform duration-300"
                    style={{
                      background: feature.color === "emerald" ? "#ecfdf5" :
                        feature.color === "blue" ? "#eff6ff" :
                        feature.color === "amber" ? "#fffbeb" :
                        feature.color === "green" ? "#f0fdf4" :
                        feature.color === "indigo" ? "#eef2ff" : "#fff1f2",
                      color: feature.color === "emerald" ? "#059669" :
                        feature.color === "blue" ? "#2563eb" :
                        feature.color === "amber" ? "#d97706" :
                        feature.color === "green" ? "#16a34a" :
                        feature.color === "indigo" ? "#4f46e5" : "#e11d48",
                    }}
                  >
                    <feature.icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{feature.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
                </div>

                {/* Corner accent */}
                <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden rounded-tr-3xl pointer-events-none">
                  <div className="absolute -top-8 -right-8 w-16 h-16 bg-emerald-50/50 rotate-45" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-100 text-amber-700 text-sm font-semibold">
              <Heart className="h-4 w-4" />
              Real Stories
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight">
              Loved by{" "}
              <span className="bg-gradient-to-r from-amber-500 to-amber-400 bg-clip-text text-transparent">
                Kharar
              </span>{" "}
              families
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {testimonials.map((item, i) => (
              <div
                key={item.name}
                className="relative bg-gradient-to-b from-white to-emerald-50/20 rounded-3xl p-6 lg:p-8 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-500 animate-fade-in"
                style={{ animationDelay: `${i * 0.12 + 0.2}s` }}
              >
                {/* Quote mark */}
                <div className="text-5xl font-serif text-emerald-200 absolute top-4 right-6 leading-none">&ldquo;</div>

                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: item.rating }).map((_, j) => (
                    <Star key={j} className="h-5 w-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <p className="text-gray-600 leading-relaxed mb-6 relative z-10">
                  &ldquo;{item.text}&rdquo;
                </p>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                    {item.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-sm">{item.name}</div>
                    <div className="text-xs text-gray-400 font-medium">{item.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== ROLE CARDS / CTA ===== */}
      <section id="options" className="py-20 lg:py-28 bg-gradient-to-b from-emerald-50/20 via-white to-white">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4 animate-fade-in">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-semibold">
              <Users className="h-4 w-4" />
              Get Started
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight">
              Choose your{" "}
              <span className="bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">
                portal
              </span>
            </h2>
            <p className="text-lg text-gray-500">{t("landing.description")}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Customer Card */}
            <Link
              href={`/${locale}/customer/dashboard`}
              className="group relative bg-white rounded-3xl p-8 lg:p-10 border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden animate-fade-in"
              style={{ animationDelay: "0.2s" }}
            >
              {/* Hover gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-200/50 group-hover:scale-110 transition-transform duration-300">
                    <UserCircle className="h-8 w-8" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-emerald-600 uppercase tracking-wider">For You</div>
                    <h3 className="text-2xl font-black text-gray-900">{t("landing.customerView")}</h3>
                  </div>
                </div>

                <p className="text-gray-500 leading-relaxed mb-8">
                  {t("landing.customerDesc")}
                </p>

                <div className="flex items-center gap-2 text-emerald-600 font-bold group-hover:gap-3 transition-all duration-300">
                  <span>Open Dashboard</span>
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>

              {/* Corner decor */}
              <div className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full bg-emerald-50/30 group-hover:scale-150 transition-transform duration-700" />
            </Link>

            {/* Admin Card */}
            <Link
              href={`/${locale}/admin/dashboard`}
              className="group relative bg-white rounded-3xl p-8 lg:p-10 border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden animate-fade-in"
              style={{ animationDelay: "0.3s" }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-50/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-lg shadow-amber-200/50 group-hover:scale-110 transition-transform duration-300">
                    <LayoutDashboard className="h-8 w-8" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-amber-600 uppercase tracking-wider">For Business</div>
                    <h3 className="text-2xl font-black text-gray-900">{t("landing.openAdmin")}</h3>
                  </div>
                </div>

                <p className="text-gray-500 leading-relaxed mb-8">
                  {t("landing.adminDesc")}
                </p>

                <div className="flex items-center gap-2 text-amber-600 font-bold group-hover:gap-3 transition-all duration-300">
                  <span>Open Panel</span>
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>

              <div className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full bg-amber-50/30 group-hover:scale-150 transition-transform duration-700" />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-gray-900 text-gray-400 py-16 lg:py-20">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <Droplets className="h-5 w-5 text-emerald-400" />
                </div>
                <span className="text-white font-bold text-lg">Dairy</span>
              </div>
              <p className="text-sm leading-relaxed">
                Fresh milk, delivered every morning. Pure, natural, and trusted by families across Kharar.
              </p>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h4 className="text-white font-bold text-sm uppercase tracking-wider">Quick Links</h4>
              <div className="space-y-3">
                <Link href="/" className="block text-sm hover:text-white transition-colors">Home</Link>
                <Link href="#features" className="block text-sm hover:text-white transition-colors">Features</Link>
                <Link href="#options" className="block text-sm hover:text-white transition-colors">Get Started</Link>
              </div>
            </div>

            {/* Support */}
            <div className="space-y-4">
              <h4 className="text-white font-bold text-sm uppercase tracking-wider">Support</h4>
              <div className="space-y-3">
                <a href="tel:+919876543210" className="block text-sm hover:text-white transition-colors">+91 98765 43210</a>
                <a href="mailto:hello@dairy.local" className="block text-sm hover:text-white transition-colors">hello@dairy.local</a>
                <p className="text-sm">Kharar, Punjab</p>
              </div>
            </div>

            {/* Trust */}
            <div className="space-y-4">
              <h4 className="text-white font-bold text-sm uppercase tracking-wider">Why Dairy?</h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span>Quality tested milk</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-emerald-400" />
                  <span>6 AM doorstep delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <Leaf className="h-4 w-4 text-emerald-400" />
                  <span>100% natural, no additives</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>{t("landing.copyright")}</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
