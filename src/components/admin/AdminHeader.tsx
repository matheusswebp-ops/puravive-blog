import Image from "next/image";
import Link from "next/link";
import AdminNav from "./AdminNav";
import LogoutButton from "./LogoutButton";

export default function AdminHeader() {
  return (
    <header className="admin-header">
      <div className="admin-header-left">
        <Link href="/admin" className="admin-header-title">
          <Image
            src="https://ierdkwezlsxkknjzokyy.supabase.co/storage/v1/object/public/covers/logo-puravive.png"
            alt="PuraVive"
            width={110}
            height={22}
            priority
          />
          <span>Admin</span>
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
