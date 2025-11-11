"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

// Estructura de una publicación
interface Publicacion {
  id: string;
  imagen: string;
  descripcion: string;
  creado_en: string;
}

export default function MVPPage() {
  const [imagen, setImagen] = useState<string>("");
  const [descripcion, setDescripcion] = useState<string>("");
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  // Validar usuario logueado
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push("/login");
      } else {
        fetchPublicaciones(data.user.id);
      }
    };
    checkUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  // Cargar publicaciones del usuario actual
  const fetchPublicaciones = async (userId: string) => {
    const { data, error } = await supabase
      .from("publicaciones")
      .select("id, imagen, descripcion, creado_en")
      .eq("usuario_id", userId)
      .order("creado_en", { ascending: false });
    if (error) {
      setMensaje("❌ Error al cargar publicaciones: " + error.message);
    } else {
      setPublicaciones(data || []);
    }
    setLoading(false);
  };

  // Subir nueva publicación
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setMensaje("⚠️ Debes iniciar sesión para subir publicaciones");
      return;
    }
    const { error } = await supabase.from("publicaciones").insert([
      {
        imagen,
        descripcion,
        usuario_id: user.id,
      },
    ]);
    if (error) {
      setMensaje("❌ Error al subir publicación: " + error.message);
    } else {
      setMensaje("✅ Publicación subida correctamente");
      setImagen("");
      setDescripcion("");
      fetchPublicaciones(user.id);
    }
  };

  if (loading) return <p className="text-center">⏳ Cargando...</p>;

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 border rounded-lg shadow">
      <h1 className="text-2xl font-bold text-center mb-6">
        Subir Publicación (MVP)
      </h1>
      {/* Formulario para subir publicación */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 mb-8">
        <input
          type="text"
          placeholder="URL de imagen"
          value={imagen}
          onChange={(e) => setImagen(e.target.value)}
          required
          className="border p-2 rounded"
        />
        <textarea
          placeholder="Descripción"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          className="border p-2 rounded"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Subir Publicación
        </button>
      </form>
      {/* Mensaje de éxito o error */}
      {mensaje && <p className="text-center mb-4">{mensaje}</p>}
      {/* Listado de publicaciones */}
      <h2 className="text-xl font-semibold mb-3 text-center">
        Mis Publicaciones
      </h2>
      {publicaciones.length === 0 ? (
        <p className="text-center text-gray-600">
          No has subido publicaciones aún.
        </p>
      ) : (
        <div className="space-y-4">
          {publicaciones.map((pub) => (
            <div key={pub.id} className="border p-4 rounded shadow-sm">
              <img
                src={pub.imagen}
                alt={pub.descripcion}
                className="rounded mt-2 w-full max-w-md object-cover"
              />
              <p className="font-semibold mt-2">{pub.descripcion}</p>
              <p className="text-sm text-gray-500 mt-1">
                {new Date(pub.creado_en).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
