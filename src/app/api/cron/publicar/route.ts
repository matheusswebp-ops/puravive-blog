import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Quem coloca o post no ar na hora marcada é a política de RLS: assim que
// published_at chega, o post agendado já aparece no blog. Esta rotina só
// acerta o status depois, pro banco e o admin não continuarem dizendo
// "agendado" para algo que já está publicado. Por isso rodar uma vez por dia
// basta — e cabe no plano gratuito da Vercel, que não permite mais que isso.
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "não autorizado" }, { status: 401 });
    }
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("publicar_agendados");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const publicados = Number(data ?? 0);
  if (publicados > 0) {
    revalidatePath("/");
    revalidatePath("/admin");
  }

  return NextResponse.json({ publicados });
}
