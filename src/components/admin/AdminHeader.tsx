import Link from "next/link";
import AdminNav from "./AdminNav";
import LogoutButton from "./LogoutButton";

export default function AdminHeader() {
  return (
    <header className="admin-header">
      <div className="admin-header-left">
        <Link href="/admin" className="admin-header-title">
          Admin · PuraVive
        </Link>
        <AdminNav />
      </div>
      <nav className="admin-header-nav">
        <Link href="/" target="_blank">
          Ver blog
        </Link>
        <LogoutButton />
      </nav>
    </header>
  );
}
