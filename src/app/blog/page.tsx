import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function BlogIndex() {
  const posts = getAllPosts();

  return (
    <main className="min-h-screen">
      <Header />

      <section className="pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="mx-auto max-w-4xl px-6">
          {/* Header */}
          <div className="mb-4 text-center text-sm font-semibold uppercase tracking-wider text-brand">
            Blog
          </div>
          <h1 className="mb-4 text-center text-4xl font-bold text-white md:text-5xl">
            SaaS Billing Insights
          </h1>
          <p className="mb-16 text-center text-lg text-text-muted max-w-2xl mx-auto">
            Practical guides to finding and fixing revenue leaks in your Stripe,
            Paddle, and Polar billing.
          </p>

          {/* Posts grid */}
          {posts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-text-muted text-lg mb-4">
                First post coming soon.
              </p>
              <Link
                href="/scan"
                className="inline-block rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-black transition-all hover:bg-brand-light"
              >
                Run a Free Scan While You Wait &rarr;
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              {posts.map((post) => (
                <article
                  key={post.slug}
                  className="group rounded-xl border border-border bg-surface/60 p-6 transition-all hover:border-brand/30 hover:bg-surface/80"
                >
                  <Link href={`/blog/${post.slug}`}>
                    <div className="flex items-center gap-3 mb-3">
                      <time
                        dateTime={post.date}
                        className="text-xs text-text-muted"
                      >
                        {new Date(post.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </time>
                      <span className="text-xs text-text-muted">&middot;</span>
                      <span className="text-xs text-text-muted">
                        {post.readingTime}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2 group-hover:text-brand transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-sm text-text-muted leading-relaxed mb-4">
                      {post.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-brand/10 px-3 py-1 text-xs font-medium text-brand"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
