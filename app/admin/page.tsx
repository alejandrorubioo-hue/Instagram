"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

// Tipado de usuario
interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  telefono: string | null;
}

// Tipado de publicación
interface Publicacion {
  id: string;
  imagen: string;
  descripcion: string;
  creado_en: string;
  usuario_id: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string>("");

  // Solo admin: verifica que haya usuario logueado
  useEffect(() => {
  const verificarAdmin = async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      // ❌ No hay usuario logueado → redirige a login
      router.push("/login");
    } else if (data.user.email !== "odinlowe1651@gmail.com") {
      // ❌ Usuario logueado, pero no es el autorizado
      router.push("/login");
    } else {
      // ✅ Usuario autorizado, cargamos datos
      fetchUsuarios();
      fetchPublicaciones();
    }
  };
  verificarAdmin();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [router]);

  // Trae todos los usuarios
  const fetchUsuarios = async () => {
    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .order("nombre", { ascending: true });
    if (error) {
      setMessage("❌ Error al cargar usuarios");
    } else if (data) {
      setUsuarios(data);
    }
  };

  // Trae todas las publicaciones
  const fetchPublicaciones = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("publicaciones")
      .select("*")
      .order("creado_en", { ascending: false });
    if (error) {
      setMessage("❌ Error al cargar publicaciones");
    } else if (data) {
      setPublicaciones(data);
    }
    setLoading(false);
  };

  // Actualiza nombre o teléfono de un usuario
  const actualizarUsuario = async (id: string, nombre: string, telefono: string | null) => {
    const { error } = await supabase
      .from("usuarios")
      .update({ nombre, telefono })
      .eq("id", id);
    if (error) setMessage("❌ Error al actualizar usuario: " + error.message);
    else {
      setMessage("✅ Usuario actualizado correctamente");
      fetchUsuarios();
    }
  };

  if (loading) return <p className="text-center mt-10">Cargando datos...</p>;
   

  return (
    <div className="max-w-7xl mx-auto mt-10 p-6 space-y-10">
      <h1 className="text-3xl font-bold text-center">Panel Administrativo</h1>
      {message && <p className="text-center text-green-600">{message}</p>}

      {/* Tabla de publicaciones */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Publicaciones</h2>
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">ID</th>
              <th className="border p-2">Imagen</th>
              <th className="border p-2">Descripción</th>
              <th className="border p-2">Usuario ID</th>
              <th className="border p-2">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {publicaciones.map((pub) => (
              <tr key={pub.id}>
                <td className="border p-2">{pub.id}</td>
                <td className="border p-2">
                  {pub.imagen && (
                    <img src={pub.imagen} alt="publicación" className="w-20 h-20 object-cover" />
                  )}
                </td>
                <td className="border p-2">{pub.descripcion}</td>
                <td className="border p-2">{pub.usuario_id}</td>
                <td className="border p-2">{new Date(pub.creado_en).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Tabla de usuarios */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Usuarios</h2>
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Nombre</th>
              <th className="border p-2">Correo</th>
              <th className="border p-2">Teléfono</th>
              <th className="border p-2">Acción</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((user) => (
              <tr key={user.id}>
                <td className="border p-2">
                  <input
                    type="text"
                    value={user.nombre}
                    onChange={(e) => {
                      const nuevos = usuarios.map((u) =>
                        u.id === user.id ? { ...u, nombre: e.target.value } : u
                      );
                      setUsuarios(nuevos);
                    }}
                    className="border p-1 w-full"
                  />
                </td>
                <td className="border p-2">{user.correo}</td>
                <td className="border p-2">
                  <input
                    type="text"
                    value={user.telefono ?? ""}
                    onChange={(e) => {
                      const nuevos = usuarios.map((u) =>
                        u.id === user.id ? { ...u, telefono: e.target.value } : u
                      );
                      setUsuarios(nuevos);
                    }}
                    className="border p-1 w-full"
                  />
                </td>
                <td className="border p-2">
                  <button
                    onClick={() => actualizarUsuario(user.id, user.nombre, user.telefono)}
                    className="bg-green-600 text-white px-2 py-1 rounded"
                  >
                    Guardar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}