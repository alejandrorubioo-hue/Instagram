"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import Link from "next/link";

export default function ClientMenu() {
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
    <nav className="bg-gray-100 p-4 flex gap-4 justify-center">
      <Link href="/mvp" className="text-blue-600 font-semibold hover:underline">
        MVP
      </Link>
      <Link href="/user" className="text-blue-600 font-semibold hover:underline">
        Usuario
      </Link>
      <Link href="/admin" className="text-blue-600 font-semibold hover:underline">
        Admin
      </Link>
    </nav>
  );
}