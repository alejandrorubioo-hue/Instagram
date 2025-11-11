"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function Sidebar() {
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

  if (!user) return null;

  return (
    <aside className="hidden lg:flex flex-col gap-4 w-60 min-h-screen px-4 py-8 bg-white border-r shadow-sm fixed left-0 top-0 z-40">
      <div className="mb-8">
        <span className="font-logo text-2xl font-bold text-pink-600 tracking-tight">Instagram</span>
      </div>
      <nav className="flex flex-col gap-4">
        <Link href="/" className="font-semibold hover:text-pink-600 transition">Inicio</Link>
        <Link href="/user" className="font-semibold hover:text-pink-600 transition">Perfil</Link>
        <Link href="/mvp" className="font-semibold hover:text-pink-600 transition">Subir</Link>
        <Link href="/admin" className="font-semibold hover:text-pink-600 transition">Admin</Link>
      </nav>
      <div className="mt-auto text-xs text-gray-400">
        Sesión: {user.email}
      </div>
    </aside>
  );
}