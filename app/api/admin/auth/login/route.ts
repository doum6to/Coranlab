import { NextResponse } from "next/server";

import {
  adminConfigured,
  setAdminCookie,
  verifyCredentials,
} from "@/lib/admin-auth";

export async function POST(req: Request) {
  if (!adminConfigured()) {
    return NextResponse.json(
      {
        error:
          "Portail admin non configuré : définissez ADMIN_USERNAME et ADMIN_PASSWORD dans les variables d'environnement.",
      },
      { status: 500 },
    );
  }

  let username = "";
  let password = "";
  try {
    const body = await req.json();
    username = body.username ?? "";
    password = body.password ?? "";
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  if (!verifyCredentials(username, password)) {
    return NextResponse.json(
      { error: "Identifiant ou code incorrect." },
      { status: 401 },
    );
  }

  setAdminCookie();
  return NextResponse.json({ ok: true });
}
