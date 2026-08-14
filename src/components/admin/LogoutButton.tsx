"use client";

import { logout } from "@/app/admin/actions";

export default function LogoutButton() {
  return (
    <form action={logout}>
      <button type="submit" className="admin-logout-btn">
        Sair
      </button>
    </form>
  );
}
