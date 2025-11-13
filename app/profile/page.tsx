"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { Menu, Settings, Grid3x3, LogOut, Edit2, X, Check } from "lucide-react";

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

export default function ProfilePage() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [mensaje, setMensaje] = useState<string | null>(null);
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
  }, [router]);

  // Cargar información del usuario y sus publicaciones
  const fetchUsuario = async (userId: string) => {
    // Obtener datos del usuario
    const { data: userData, error: userError } = await supabase
      .from("usuarios")
      .select("id, nombre, correo, telefono")
      .eq("id", userId)
      .single();

    if (userError) {
      setMensaje("❌ No se encontró el usuario");
      setLoading(false);
      return;
    }

    if (userData) {
      setUsuario(userData);
      setNombre(userData.nombre);
      setTelefono(userData.telefono || "");

      // Obtener publicaciones del usuario
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

  // Actualizar datos del usuario
  const handleUpdate = async () => {
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

  // Cancelar edición
  const handleCancelEdit = () => {
    if (usuario) {
      setNombre(usuario.nombre);
      setTelefono(usuario.telefono || "");
    }
    setIsEditing(false);
    setMensaje(null);
  };

  // Cerrar sesión
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">⏳ Cargando perfil...</p>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">❌ No se encontró el usuario</p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 z-40 px-4 py-3">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <button onClick={handleLogout} className="p-2">
            <LogOut className="w-6 h-6" />
          </button>
          <h1 className="font-semibold text-lg">{usuario.nombre}</h1>
          <button className="p-2">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {/* Sección de perfil */}
        <div className="flex items-start gap-6 mb-6">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[2px]">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
              <div className="w-[76px] h-[76px] rounded-full bg-gray-300 flex items-center justify-center text-3xl font-semibold text-gray-700">
                {usuario.nombre?.[0]?.toUpperCase() || "U"}
              </div>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="flex-1 flex justify-around text-center">
            <div>
              <p className="font-semibold text-lg">{publicaciones.length}</p>
              <p className="text-sm text-gray-600">publicaciones</p>
            </div>
            <div>
              <p className="font-semibold text-lg">0</p>
              <p className="text-sm text-gray-600">seguidores</p>
            </div>
            <div>
              <p className="font-semibold text-lg">0</p>
              <p className="text-sm text-gray-600">seguidos</p>
            </div>
          </div>
        </div>

        {/* Información del perfil */}
        <div className="mb-4">
          {isEditing ? (
            <div className="space-y-3">
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Nombre completo"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              />
              <input
                type="text"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="Teléfono"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              />
              <input
                type="email"
                value={usuario.correo}
                readOnly
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 text-gray-600"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleUpdate}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Guardar
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg font-semibold flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="font-semibold">{usuario.nombre}</p>
              {telefono && <p className="text-sm text-gray-600">{telefono}</p>}
              <p className="text-sm text-gray-600">{usuario.correo}</p>
            </>
          )}
        </div>

        {/* Mensaje de feedback */}
        {mensaje && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-sm text-center">
            {mensaje}
          </div>
        )}

        {/* Botón editar perfil */}
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="w-full bg-gray-200 hover:bg-gray-300 text-black font-semibold py-2 rounded-lg mb-6 flex items-center justify-center gap-2"
          >
            <Edit2 className="w-4 h-4" />
            Editar perfil
          </button>
        )}

        {/* Tabs */}
        <div className="border-t border-gray-200">
          <div className="flex">
            <button className="flex-1 py-3 border-t border-black flex items-center justify-center">
              <Grid3x3 className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Grid de publicaciones */}
        {publicaciones.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-2">No hay publicaciones aún</p>
            <p className="text-sm text-gray-400">Comparte tus primeros momentos</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-0.5 mt-1">
            {publicaciones.map((post) => (
              <div
                key={post.id}
                className="relative aspect-square bg-gray-100 cursor-pointer hover:opacity-90 transition"
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
    </div>
  );
}