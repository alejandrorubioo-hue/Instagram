"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { Menu, Settings, Grid3x3, LogOut, X } from "lucide-react";

interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  telefono: string | null;
}

interface Publicacion {
  id: string;
  imagen: string;
  descripcion: string;
}

export default function UsuarioPage() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [nombre, setNombre] = useState<string>("");
  const [telefono, setTelefono] = useState<string>("");
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push("/login");
      } else {
        fetchUsuario(data.user.id);
      }
    };
    checkUser();
  }, [router]);

  const fetchUsuario = async (userId: string) => {
    const { data: userData, error: userError } = await supabase
      .from("usuarios")
      .select("id, nombre, correo, telefono")
      .eq("id", userId)
      .single();

    if (userError) {
      setMensaje("❌ No se encontró el usuario");
    } else if (userData) {
      setUsuario(userData);
      setNombre(userData.nombre);
      setTelefono(userData.telefono || "");

      // Cargar publicaciones del usuario
      const { data: postsData } = await supabase
        .from("publicaciones")
        .select("id, imagen, descripcion")
        .eq("usuario_id", userId)
        .order("creado_en", { ascending: false });

      if (postsData) {
        setPublicaciones(postsData);
      }
    }
    setLoading(false);
  };

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
      setIsEditing(false);
      setTimeout(() => setMensaje(null), 3000);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <p className="text-gray-600">⏳ Cargando...</p>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <p className="text-gray-600">{mensaje}</p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pb-16">
      {/* Header */}
      <div className="sticky top-0 bg-white z-40 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LogOut className="w-5 h-5 text-gray-700" />
          <h1 className="text-lg font-semibold">{usuario.nombre}</h1>
        </div>
        <div className="flex items-center gap-4">
          <Settings className="w-6 h-6 text-gray-700 cursor-pointer" />
          <Menu className="w-6 h-6 text-gray-700 cursor-pointer" />
        </div>
      </div>

      {/* Profile Info */}
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Stats & Profile Picture */}
        <div className="flex items-center gap-6 mb-6">
          {/* Profile Picture */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 p-0.5">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
              <div className="w-[72px] h-[72px] rounded-full bg-gray-300 flex items-center justify-center text-2xl font-bold text-white">
                {usuario.nombre.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-1 justify-around text-center">
            <div>
              <p className="font-semibold text-sm">{publicaciones.length}</p>
              <p className="text-xs text-gray-600">publicaciones</p>
            </div>
            <div>
              <p className="font-semibold text-sm">0</p>
              <p className="text-xs text-gray-600">seguidores</p>
            </div>
            <div>
              <p className="font-semibold text-sm">0</p>
              <p className="text-xs text-gray-600">seguidos</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="mb-4">
          <p className="font-semibold text-sm">{usuario.nombre}</p>
          <p className="text-sm text-gray-600">{usuario.correo}</p>
          {usuario.telefono && (
            <p className="text-sm text-gray-600">📱 {usuario.telefono}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setIsEditing(true)}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-black text-sm font-semibold py-1.5 rounded-lg transition"
          >
            Editar perfil
          </button>
          <button
            onClick={handleLogout}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-black text-sm font-semibold py-1.5 rounded-lg transition flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
        </div>

        {/* Success Message */}
        {mensaje && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-center">
            <p className="text-sm text-green-700">{mensaje}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="border-t border-gray-200">
          <div className="flex justify-around py-3">
            <Grid3x3 className="w-6 h-6 text-black" />
          </div>
        </div>

        {/* Posts Grid */}
        {publicaciones.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500 text-sm">No hay publicaciones aún</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1">
            {publicaciones.map((post) => (
              <div
                key={post.id}
                className="aspect-square bg-gray-100 cursor-pointer hover:opacity-90 transition"
              >
                <img
                  src={post.imagen}
                  alt={post.descripcion}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Editar perfil</h2>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setNombre(usuario.nombre);
                  setTelefono(usuario.telefono || "");
                }}
                className="text-gray-500 hover:text-gray-700 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleUpdate} className="p-5">
              <div className="space-y-5">
                {/* Nombre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Nombre completo"
                    required
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>

                {/* Teléfono */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="text"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="Número de teléfono"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>

                {/* Correo (Read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Correo
                  </label>
                  <input
                    type="email"
                    value={usuario.correo}
                    readOnly
                    className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full mt-6 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2.5 rounded-xl transition flex items-center justify-center gap-2"
              >
                ✓ Guardar cambios
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}