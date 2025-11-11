"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Stories from "./components/Stories"; // Ajusta la ruta si es necesario

interface Publicacion {
  id: string;
  imagen: string;
  descripcion: string;
  creado_en: string;
  usuario_id: string;
  usuario?: { nombre: string };
}

export default function Home() {
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFeed = async () => {
    const { data, error } = await supabase
      .from("publicaciones")
      .select(`
        id,
        imagen,
        descripcion,
        creado_en,
        usuario_id,
        usuario:usuarios!usuario_id(nombre)
      `)
      .order("creado_en", { ascending: false });
    if (!error) {
      const publicacionesNormalizadas = (data || []).map((pub: any) => ({
        ...pub,
        usuario: Array.isArray(pub.usuario) ? pub.usuario[0] : pub.usuario,
      }));
      setPublicaciones(publicacionesNormalizadas);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  if (loading) return <p className="text-center mt-10">⏳ Cargando feed...</p>;

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-col w-full max-w-md py-8 px-2 sm:px-0">
        {/* Historias tipo Instagram */}
        <Stories />
        {publicaciones.length === 0 ? (
          <p className="text-center text-gray-600 dark:text-zinc-400 mt-10">
            No hay publicaciones aún.
          </p>
        ) : (
          publicaciones.map((pub) => (
            <div
              key={pub.id}
              className="bg-white rounded-lg shadow mb-6 border dark:bg-zinc-900 transition hover:shadow-lg"
            >
              {/* Header usuario */}
              <div className="flex items-center px-4 py-2">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-pink-500 to-yellow-400 flex items-center justify-center text-white font-bold mr-3">
                  {pub.usuario?.nombre?.[0]?.toUpperCase() || "U"}
                </div>
                <span className="font-semibold text-sm text-black dark:text-zinc-50">
                  {pub.usuario?.nombre || "Usuario"}
                </span>
              </div>
              {/* Imagen */}
              <img
                src={pub.imagen}
                alt={pub.descripcion}
                className="w-full aspect-square object-cover"
              />
              {/* Footer */}
              <div className="px-4 py-2">
                <p className="font-semibold text-sm text-black dark:text-zinc-50">{pub.descripcion}</p>
                <p className="text-xs text-gray-500 dark:text-zinc-400">{new Date(pub.creado_en).toLocaleString()}</p>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}