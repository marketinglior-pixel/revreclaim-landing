import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPost, getAllPostSlugs } from "@/lib/blog";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

type Props = { params: Promise<{ slug: string }> };

// Pre-generate all blog post pages at build time
export function generateStaticParams() {
  return getAllPostSlugs().map((slug) => ({ slug }));
}

// Dynamic metadata per post
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};

  return {
    title: `${post.title} | RevReclaim Blog`,
    description: post.description,
    alternates: {
      canonical: post.canonical ?? `https://revreclaim.com/blog/${slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://revreclaim.com/blog/${slug}`,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
      images: post.image ? [{ url: post.image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  // Article JSON-LD
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: {
      "@type": "Organization",
      name: post.author,
      url: "https://revreclaim.com",
    },
    publisher: {
      "@type": "Organization",
      name: "RevReclaim",
      url: "https://revreclaim.com",
      logo: "https://revreclaim.com/icon.svg",
    },
    mainEntityOfPage: `https://revreclaim.com/blog/${slug}`,
    ...(post.image && { image: post.image }),
  };

  return (
    <main className="min-h-screen">
      <Header />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <article className="pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="mx-auto max-w-3xl px-6">
          {/* Breadcrumb */}
          <nav className="mb-8 text-sm text-text-muted">
            <Link href="/" className="hover:text-white transition">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link href="/blog" className="hover:text-white transition">
              Blog
            </Link>
            <span className="mx-2">/</span>
            <span className="text-white">{post.title}</span>
          </nav>

          {/* Post header */}
          <header className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <time dateTime={post.date} className="text-sm text-text-muted">
                {new Date(post.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
              <span className="text-text-muted">&middot;</span>
              <span className="text-sm text-text-muted">
                {post.readingTime}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-white md:text-4xl leading-tight mb-4">
              {post.title}
            </h1>
            <p className="text-lg text-text-muted">{post.description}</p>
            <div className="flex flex-wrap gap-2 mt-4">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-brand/10 px-3 py-1 text-xs font-medium text-brand"
                >
                  {tag}
                </span>
              ))}
            </div>
          </header>

          {/* Post content */}
          <div
            className="prose prose-invert prose-green max-w-none
              prose-headings:font-bold prose-headings:text-white
              prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4
              prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
              prose-p:text-text-muted prose-p:leading-relaxed
              prose-a:text-brand prose-a:no-underline hover:prose-a:underline
              prose-strong:text-white
              prose-li:text-text-muted
              prose-code:text-brand prose-code:bg-surface prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
              prose-blockquote:border-brand prose-blockquote:text-text-muted
              prose-img:rounded-xl"
            dangerouslySetInnerHTML={{ __html: post.contentHtml }}
          />

          {/* CTA */}
          <div className="mt-16 rounded-xl border border-brand/20 bg-brand/5 p-8 text-center">
            <h3 className="text-xl font-bold text-white mb-2">
              How healthy is your billing?
            </h3>
            <p className="text-sm text-text-muted mb-6">
              Run a free scan in 60 seconds. Works with Stripe, Paddle &amp;
              Polar.
            </p>
            <Link
              href="/scan"
              className="inline-block rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-black transition-all hover:bg-brand-light hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]"
            >
              Scan My Billing &rarr;
            </Link>
          </div>

          {/* Back to blog */}
          <div className="mt-12 text-center">
            <Link
              href="/blog"
              className="text-sm text-text-muted hover:text-white transition"
            >
              &larr; Back to all posts
            </Link>
          </div>
        </div>
      </article>

      <Footer />
    </main>
  );
}
