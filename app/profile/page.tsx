"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { Menu, Settings, Grid3x3, LogOut, Edit2, X, Check, Trash2 } from "lucide-react";

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

  // Estados para el modal de eliminar
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState<Publicacion | null>(null);
  const [deleting, setDeleting] = useState(false);

  const router = useRouter();

  // Validar usuario logueado y cargar datos
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

  // Cargar información del usuario y sus publicaciones
  const fetchUsuario = async (userId: string) => {
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

  // Abrir modal de confirmación para eliminar
  const openDeleteModal = (post: Publicacion) => {
    setPostToDelete(post);
    setShowDeleteModal(true);
  };

  // Cerrar modal de eliminación
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setPostToDelete(null);
  };

  // ✅ Eliminar publicación (DELETE del CRUD)
  const handleDeletePost = async () => {
    if (!postToDelete || !usuario) return;

    setDeleting(true);

    // Eliminar la publicación (comentarios y likes se eliminan en cascada si configuraste las FK correctamente)
    const { error } = await supabase
      .from("publicaciones")
      .delete()
      .eq("id", postToDelete.id)
      .eq("usuario_id", usuario.id); // Seguridad: solo el dueño puede eliminar

    if (error) {
      setMensaje("❌ Error al eliminar: " + error.message);
      setDeleting(false);
      closeDeleteModal();
      setTimeout(() => setMensaje(null), 3000);
    } else {
      // Actualizar lista de publicaciones
      setPublicaciones(prev => prev.filter(p => p.id !== postToDelete.id));
      setMensaje("✅ Publicación eliminada correctamente");
      setDeleting(false);
      closeDeleteModal();
      setTimeout(() => setMensaje(null), 3000);
    }
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
          <div className={`mb-4 p-3 border rounded text-sm text-center ${
            mensaje.includes("❌")
              ? "bg-red-50 border-red-200 text-red-700"
              : "bg-green-50 border-green-200 text-green-700"
          }`}>
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
                className="relative aspect-square bg-gray-100 group"
              >
                <img
                  src={post.imagen}
                  alt={post.descripcion}
                  className="w-full h-full object-cover"
                />
                {/* Overlay con botón de eliminar */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={() => openDeleteModal(post)}
                    className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && postToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold mb-2">¿Eliminar publicación?</h3>
            <p className="text-sm text-gray-600 mb-6">
              Esta acción no se puede deshacer. La publicación se eliminará permanentemente.
            </p>

            {/* Vista previa de la imagen */}
            <div className="mb-6">
              <img
                src={postToDelete.imagen}
                alt={postToDelete.descripcion}
                className="w-full h-40 object-cover rounded"
              />
              {postToDelete.descripcion && (
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                  {postToDelete.descripcion}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={closeDeleteModal}
                disabled={deleting}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 rounded-lg disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeletePost}
                disabled={deleting}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Eliminando...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}