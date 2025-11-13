"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, PlusSquare, Clapperboard, User } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", icon: Home, label: "Inicio" },
    { href: "/explore", icon: Search, label: "Buscar" },
    { href: "/create", icon: PlusSquare, label: "Crear" },
    { href: "/reels", icon: Clapperboard, label: "Reels" },
    { href: "/user", icon: User, label: "Perfil" }, // ✅ Cambiado de /profile a /user
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around items-center h-12 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center justify-center w-full h-full"
            >
              <Icon
                size={26}
                className={isActive ? "text-black" : "text-gray-600"}
                strokeWidth={isActive ? 2.5 : 2}
                fill={isActive && item.label === "Inicio" ? "black" : "none"}
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}