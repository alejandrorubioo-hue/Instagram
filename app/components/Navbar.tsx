"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user ?? null);
    };
    getUser();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <nav className="bg-white border-b shadow-sm sticky top-0 z-50 w-full">
      <div className="max-w-3xl mx-auto flex items-center justify-between px-4 py-2">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          {/* Puedes reemplazar esto por un SVG del logo de Instagram */}
          <span className="font-logo text-2xl font-bold text-pink-600 tracking-tight">Instagram</span>
        </Link>
        {/* Navegación */}
        {user && (
          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-pink-600 font-semibold transition">Inicio</Link>
            <Link href="/user" className="hover:text-pink-600 font-semibold transition">Perfil</Link>
            <Link href="/mvp" className="hover:text-pink-600 font-semibold transition">Subir</Link>
            <Link href="/admin" className="hover:text-pink-600 font-semibold transition">Admin</Link>
          </div>
        )}
      </div>
    </nav>
  );
}