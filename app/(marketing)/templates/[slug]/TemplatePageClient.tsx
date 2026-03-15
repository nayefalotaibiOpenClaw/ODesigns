"use client";

import React, { useMemo } from "react";
import Link from "@/lib/i18n/LocaleLink";
import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import FloatingNav from "@/app/components/FloatingNav";
import { useLocale } from "@/lib/i18n/context";
import { ArrowRight, Sparkles, Lightbulb } from "lucide-react";
import FeaturedPostPreview from "@/features/posts/shared/FeaturedPostPreview";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function TemplatePageClient({ slug }: { slug: string }) {
  const { dir, t, locale } = useLocale();
  const dbLanguage = locale === "ar" ? "ar" as const : "en" as const;
  const template = useQuery(api.blogs.getBySlugAndType, {
    slug,
    type: "template",
    language: dbLanguage,
  });

  // Fetch featured posts from Convex (social category for 1:1 showcase)
  const allFeatured = useQuery(api.featuredPosts.list, { category: "social" });
  const showcasePosts = useMemo(() => shuffle(allFeatured ?? []), [allFeatured]);

  if (template === undefined) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
      </div>
    );
  }

  if (!template) return null;

  // Extract sections by type
  const examples = (template.sections || []).filter(s => s.sectionType === "example");
  const tips = (template.sections || []).filter(s => s.sectionType === "tip");

  return (
    <div
      dir={dir}
      className="min-h-screen bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-white font-sans overflow-x-hidden"
    >
      <FloatingNav />

      {/* Hero */}
      <section className="pt-36 pb-12 px-6 relative">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-4 py-1.5 text-xs font-bold text-slate-500 dark:text-neutral-400 bg-slate-100 dark:bg-neutral-800 rounded-full mb-6 uppercase tracking-wider"
          >
            {t("templates.title")}
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-tight mb-6"
          >
            {template.heroTitle}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg sm:text-xl text-slate-500 dark:text-neutral-400 max-w-2xl mx-auto mb-12"
          >
            {template.heroSubtitle}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:bg-slate-800 dark:hover:bg-neutral-200 transition-colors text-lg"
            >
              {t("templates.startCreatingFree")}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Scrolling post carousel — two rows, opposite directions */}
      {showcasePosts.length > 0 && (
        <section className="py-16 overflow-hidden space-y-6">
          <motion.div
            initial={{ x: 0 }}
            animate={{ x: "-50%" }}
            transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
            className="flex gap-6 px-6"
          >
            {[...showcasePosts, ...showcasePosts].map((item, i) => (
              <div key={`top-${item._id}-${i}`} style={{ minWidth: 240 }}>
                <FeaturedPostPreview code={item.componentCode} theme={item.theme} size={240} />
              </div>
            ))}
          </motion.div>
          <motion.div
            initial={{ x: "-50%" }}
            animate={{ x: 0 }}
            transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
            className="flex gap-6 px-6"
          >
            {[...showcasePosts.slice().reverse(), ...showcasePosts.slice().reverse()].map(
              (item, i) => (
                <div key={`bot-${item._id}-${i}`} style={{ minWidth: 240 }}>
                  <FeaturedPostPreview code={item.componentCode} theme={item.theme} size={240} />
                </div>
              )
            )}
          </motion.div>
        </section>
      )}

      {/* Examples — Dark cards grid */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl md:text-7xl font-black text-center mb-6"
          >
            {t("templates.whatYouCanCreate")}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center text-slate-500 dark:text-neutral-400 text-lg mb-16 max-w-2xl mx-auto"
          >
            {t("templates.whatYouCanCreateDesc")}
          </motion.p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {examples.map((example, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-black rounded-[2rem] p-10 text-white group hover:bg-neutral-900 transition-colors"
              >
                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-6 group-hover:bg-white/20 transition-colors">
                  <span className="text-3xl font-black">{i + 1}</span>
                </div>
                <h3 className="text-2xl font-black mb-4 leading-tight">
                  {example.title}
                </h3>
                <p className="text-slate-400 leading-relaxed text-lg">
                  {example.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tips — Split layout with posts */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-16 items-start">
            {/* Post showcase column */}
            {showcasePosts.length >= 4 && (
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="flex-1 hidden lg:block sticky top-32"
              >
                <div className="grid grid-cols-2 gap-4 -rotate-3">
                  {showcasePosts.slice(0, 4).map((item) => (
                    <FeaturedPostPreview key={item._id} code={item.componentCode} theme={item.theme} size={220} />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Tips list */}
            <div className="flex-1 space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <Lightbulb className="w-7 h-7 text-slate-400" />
                <h2 className="text-4xl md:text-5xl font-black">{t("templates.designTips")}</h2>
              </div>
              <p className="text-slate-500 dark:text-neutral-400 text-lg mb-8">
                {t("templates.designTipsDesc")}
              </p>
              {tips.map((tip, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-5 p-8 rounded-2xl border border-slate-100 dark:border-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-900 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-900 dark:bg-white flex items-center justify-center shrink-0 mt-1">
                    <span className="text-sm font-black text-white dark:text-slate-900">
                      {i + 1}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2">{tip.title}</h3>
                    <p className="text-slate-500 dark:text-neutral-400 leading-relaxed">
                      {tip.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA — Full width dark section with background post collage */}
      <section className="py-32 px-6 bg-black text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none">
          <div className="absolute inset-0 grid grid-cols-3 md:grid-cols-5 gap-3 p-4 rotate-6 scale-125 origin-center">
            {showcasePosts.map((item) => (
              <div key={item._id} className="aspect-square">
                <FeaturedPostPreview code={item.componentCode} theme={item.theme} size={250} />
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Sparkles className="w-10 h-10 mx-auto mb-8" />
            <h2 className="text-4xl md:text-6xl font-black mb-6">
              {template.ctaTitle}
            </h2>
            <p className="text-xl text-slate-400 mb-12 max-w-xl mx-auto">
              {template.ctaSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-white text-slate-900 font-bold rounded-xl hover:bg-neutral-200 transition-colors text-lg"
              >
                {t("templates.getStartedFree")}
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center gap-2 px-10 py-5 border border-white/20 text-white font-bold rounded-xl hover:bg-white/5 transition-colors text-lg"
              >
                {t("templates.viewPricing")}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Other Templates */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h3 className="text-sm font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider mb-6 text-center">
            {t("templates.moreTemplates")}
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { slug: "instagram-product-showcase", label: "Product Showcase" },
              { slug: "restaurant-social-media", label: "Restaurant Posts" },
              { slug: "app-store-screenshots", label: "App Store Graphics" },
              { slug: "social-media-carousel", label: "Carousel Posts" },
              { slug: "brand-announcement-posts", label: "Announcements" },
            ]
              .filter((tp) => tp.slug !== slug)
              .map((tp) => (
                <Link
                  key={tp.slug}
                  href={`/templates/${tp.slug}`}
                  className="px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-neutral-400 bg-slate-100 dark:bg-neutral-800 rounded-full hover:bg-slate-200 dark:hover:bg-neutral-700 transition-colors"
                >
                  {tp.label}
                </Link>
              ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-slate-100 dark:border-neutral-800 bg-white dark:bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8 text-slate-400 font-bold text-sm">
          <div />
          <div className="flex gap-8">
            <a href="#" className="hover:text-slate-900 dark:hover:text-white">
              {t("footer.twitter")}
            </a>
            <a href="#" className="hover:text-slate-900 dark:hover:text-white">
              {t("footer.linkedin")}
            </a>
            <a href="/terms" className="hover:text-slate-900 dark:hover:text-white">
              {t("footer.termsOfService")}
            </a>
            <a href="/privacy" className="hover:text-slate-900 dark:hover:text-white">
              {t("footer.privacyPolicy")}
            </a>
          </div>
          <p>&copy; {new Date().getFullYear()} {t("footer.copyright")}</p>
        </div>
      </footer>
    </div>
  );
}
