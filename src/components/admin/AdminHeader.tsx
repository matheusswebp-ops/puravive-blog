import Link from "next/link";
import LogoutButton from "./LogoutButton";

export default function AdminHeader() {
  return (
    <header className="admin-header">
      <Link href="/admin" className="admin-header-title">
        Admin · PuraVive
      </Link>
      <nav className="admin-header-nav">
        <Link href="/" target="_blank">
          Ver blog
        </Link>
        <LogoutButton />
      </nav>
    </header>
  );
}
