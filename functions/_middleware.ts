// Rewrites the social-preview meta tags for per-idea deep links (/?idea=<slug>) so a shared
// link previews THAT idea's title + hook. Social crawlers don't run JS, so we inject the tags
// server-side here. Everything that isn't an idea-deep-link document passes straight through.
interface Idea { slug: string; title: string; hook?: string }

const setContent = (val: string) => ({
  element(el: { setAttribute: (a: string, v: string) => void }) { el.setAttribute("content", val); },
});

export const onRequest = async ({ request, next }: { request: Request; next: () => Promise<Response> }) => {
  const url = new URL(request.url);
  const isDoc = url.pathname === "/" || url.pathname === "/index.html";
  const slug = url.searchParams.get("idea");
  if (!isDoc || !slug) return next(); // only the idea-deep-link document; skip assets/api/etc.

  const res = await next();
  if (!(res.headers.get("content-type") || "").includes("text/html")) return res;

  let idea: Idea | undefined;
  try {
    const data = await fetch(new URL("/data/ideas.json", url.origin).toString()).then((r) => r.json()) as { ideas: Idea[] };
    idea = (data.ideas || []).find((i) => i.slug === slug);
  } catch { /* fall back to default meta */ }
  if (!idea) return res;

  const title = `${idea.title} — Divvy`;
  const desc = idea.hook || "An idea from Divvy's idea cloud.";
  const pageUrl = `${url.origin}/?idea=${encodeURIComponent(slug)}`;

  return new HTMLRewriter()
    .on('meta[property="og:title"]', setContent(title))
    .on('meta[name="twitter:title"]', setContent(title))
    .on('meta[property="og:description"]', setContent(desc))
    .on('meta[name="twitter:description"]', setContent(desc))
    .on('meta[property="og:url"]', setContent(pageUrl))
    .on("title", { element(el: { setInnerContent: (v: string) => void }) { el.setInnerContent(title); } })
    .transform(res);
};
