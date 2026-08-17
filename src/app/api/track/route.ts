import { createHash } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

const BOT = /bot|crawl|spider|slurp|bingpreview|headless|lighthouse|pingdom|curl|wget|monitor|preview/i;

// Um visitante é anônimo e vale por um dia: o sal muda à meia-noite, então o
// mesmo hash nunca atravessa dias nem dá pra voltar até a pessoa.
function visitorHash(ip: string, userAgent: string) {
  const day = new Date().toISOString().slice(0, 10);
  return createHash("sha256")
    .update(`${ip}|${userAgent}|${day}|puravive`)
    .digest("hex")
    .slice(0, 32);
}

function referrerHost(referrer: string | null, selfHost: string) {
  if (!referrer) return null;
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "");
    return host === selfHost.replace(/^www\./, "") ? null : host;
  } catch {
    return null;
  }
}

// "/" e "/sobre" não são posts; "/categoria/x" tem duas partes. Sobra o slug.
function slugFromPath(path: string) {
  const parts = path.split("/").filter(Boolean);
  if (parts.length !== 1 || parts[0] === "sobre") return null;
  return parts[0];
}

export async function POST(request: NextRequest) {
  const userAgent = request.headers.get("user-agent") ?? "";
  if (!userAgent || BOT.test(userAgent)) {
    return NextResponse.json({ ok: true, skipped: "bot" });
  }

  let path: string;
  try {
    const body = await request.json();
    path = String(body?.path || "");
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (!path.startsWith("/") || path.startsWith("/admin") || path.length > 300) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "sem-ip";

  const supabase = await createClient();

  let postId: string | null = null;
  const slug = slugFromPath(path);
  if (slug) {
    const { data } = await supabase
      .from("posts")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    postId = data?.id ?? null;
  }

  await supabase.from("page_views").insert({
    path,
    post_id: postId,
    visitor_hash: visitorHash(ip, userAgent),
    referrer_host: referrerHost(
      request.headers.get("referer"),
      request.headers.get("host") ?? ""
    ),
    device: /mobile|android|iphone|ipad/i.test(userAgent) ? "mobile" : "desktop",
  });

  return NextResponse.json({ ok: true });
}
