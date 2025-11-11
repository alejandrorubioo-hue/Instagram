"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

// Estructura del usuario
interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  telefono: string | null;
}

export default function UsuarioPage() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [nombre, setNombre] = useState<string>("");
  const [telefono, setTelefono] = useState<string>("");
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  // Validar usuario logueado y cargar datos
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        // ❌ No hay usuario logueado → redirige a login
        router.push("/login");
      } else {
        // ✅ Usuario logueado, cargamos datos
        fetchUsuario(data.user.id);
      }
    };
    checkUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  // Cargar la información del usuario logueado
  const fetchUsuario = async (userId: string) => {
    const { data, error } = await supabase
      .from("usuarios")
      .select("id, nombre, correo, telefono")
      .eq("id", userId)
      .single();
    if (error) {
      setMensaje("❌ No se encontró el usuario");
    } else if (data) {
      setUsuario(data);
      setNombre(data.nombre);
      setTelefono(data.telefono || "");
    }
    setLoading(false);
  };

  // Actualizar los datos del usuario
  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!usuario) return;
    const { error } = await supabase
      .from("usuarios")
      .update({ nombre, telefono })
      .eq("id", usuario.id);
    if (error) {
      setMensaje("❌ Error al actualizar: " + error.message);
    } else {
      setMensaje("✅ Datos actualizados correctamente");
      fetchUsuario(usuario.id);
    }
  };

  // Cerrar sesión
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) return <p className="text-center">⏳ Cargando...</p>;

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4 text-center">Mi Perfil</h1>
      {usuario ? (
        <form onSubmit={handleUpdate} className="flex flex-col gap-4">
          {/* Campo de nombre */}
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre completo"
            required
            className="border p-2 rounded"
          />
          {/* Campo de teléfono */}
          <input
            type="text"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            placeholder="Teléfono"
            className="border p-2 rounded"
          />
          {/* Campo de solo lectura (correo) */}
          <input
            type="email"
            value={usuario.correo}
            readOnly
            className="border p-2 rounded bg-gray-100 text-gray-600"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Guardar cambios
          </button>
        </form>
      ) : (
        <p className="text-center text-gray-600">{mensaje}</p>
      )}
      {/* Botón para cerrar sesión */}
      <button
        onClick={handleLogout}
        className="bg-gray-400 text-white p-2 rounded mt-4 w-full"
      >
        Cerrar sesión
      </button>
      {mensaje && (
        <p className="mt-4 text-center text-gray-700 font-medium">{mensaje}</p>
      )}
    </div>
  );
}