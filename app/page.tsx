"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, X } from "lucide-react";

interface Usuario {
  nombre: string;
}

interface Post {
  id: string;
  imagen: string;
  descripcion: string;
  creado_en: string;
  usuario_id: string;
  usuario: Usuario | Usuario[];
}

interface Comentario {
  id: string;
  texto: string;
  creado_en: string;
  usuario: Usuario | Usuario[];
}

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const router = useRouter();

  // Estados para likes
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});

  // Estados para comentarios
  const [showComments, setShowComments] = useState<string | null>(null);
  const [comentarios, setComentarios] = useState<Record<string, Comentario[]>>({});
  const [nuevoComentario, setNuevoComentario] = useState("");
  const [comentarioCounts, setComentarioCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    checkUserAndFetchData();
  }, []);

  // ✅ Verificar si hay usuario logueado
  const checkUserAndFetchData = async () => {
    const { data } = await supabase.auth.getUser();

    if (!data.user) {
      // ❌ No hay usuario logueado → Redirigir a login
      router.push("/login");
      return;
    }

    // ✅ Usuario logueado → Cargar datos
    setCurrentUser(data.user);
    fetchUserLikes(data.user.id);
    await fetchPosts();
    setLoading(false);
  };

  const fetchPosts = async () => {
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

    if (!error && data) {
      setPosts(data as Post[]);
      // Obtener conteos de likes y comentarios
      data.forEach(post => {
        fetchLikeCount(post.id);
        fetchComentarioCount(post.id);
      });
    }
  };

  const fetchUserLikes = async (userId: string) => {
    const { data } = await supabase
      .from("likes")
      .select("publicacion_id")
      .eq("usuario_id", userId);

    if (data) {
      setLikedPosts(new Set(data.map(like => like.publicacion_id)));
    }
  };

  const fetchLikeCount = async (postId: string) => {
    const { count } = await supabase
      .from("likes")
      .select("*", { count: "exact", head: true })
      .eq("publicacion_id", postId);

    setLikeCounts(prev => ({ ...prev, [postId]: count || 0 }));
  };

  const fetchComentarioCount = async (postId: string) => {
    const { count } = await supabase
      .from("comentarios")
      .select("*", { count: "exact", head: true })
      .eq("publicacion_id", postId);

    setComentarioCounts(prev => ({ ...prev, [postId]: count || 0 }));
  };

  const toggleLike = async (postId: string) => {
    if (!currentUser) return;

    const isLiked = likedPosts.has(postId);

    if (isLiked) {
      await supabase
        .from("likes")
        .delete()
        .eq("usuario_id", currentUser.id)
        .eq("publicacion_id", postId);

      setLikedPosts(prev => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
      setLikeCounts(prev => ({ ...prev, [postId]: (prev[postId] || 1) - 1 }));
    } else {
      await supabase
        .from("likes")
        .insert({ usuario_id: currentUser.id, publicacion_id: postId });

      setLikedPosts(prev => new Set(prev).add(postId));
      setLikeCounts(prev => ({ ...prev, [postId]: (prev[postId] || 0) + 1 }));
    }
  };

  const fetchComentarios = async (postId: string) => {
    const { data } = await supabase
      .from("comentarios")
      .select(`
        id,
        texto,
        creado_en,
        usuario:usuarios!usuario_id(nombre)
      `)
      .eq("publicacion_id", postId)
      .order("creado_en", { ascending: true });

    if (data) {
      setComentarios(prev => ({ ...prev, [postId]: data as Comentario[] }));
    }
  };

  const agregarComentario = async (postId: string) => {
    if (!currentUser || !nuevoComentario.trim()) return;

    const { error } = await supabase
      .from("comentarios")
      .insert({
        usuario_id: currentUser.id,
        publicacion_id: postId,
        texto: nuevoComentario.trim()
      });

    if (!error) {
      setNuevoComentario("");
      fetchComentarios(postId);
      fetchComentarioCount(postId);
    }
  };

  const abrirComentarios = (postId: string) => {
    setShowComments(postId);
    fetchComentarios(postId);
  };

  const getNombreUsuario = (usuario: Usuario | Usuario[] | undefined): string => {
    if (!usuario) return "Usuario";
    if (Array.isArray(usuario)) return usuario[0]?.nombre || "Usuario";
    return usuario.nombre || "Usuario";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">⏳ Cargando...</p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pb-16">
      <link href="https://fonts.googleapis.com/css2?family=Lobster+Two:wght@700&display=swap" rel="stylesheet" />

      {/* Header */}
      <div className="sticky top-0 bg-white z-40 px-4 py-3 border-b border-gray-200">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold" style={{ fontFamily: "'Lobster Two', cursive" }}>
            Instagram
          </h1>
          <div className="flex gap-4">
            <Heart className="w-6 h-6" />
            <Send className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Posts */}
      <div className="max-w-md mx-auto">
        {posts.length === 0 ? (
          <p className="text-center text-gray-600 mt-10 px-4">
            No hay publicaciones aún
          </p>
        ) : (
          posts.map((post) => {
            const nombreUsuario = getNombreUsuario(post.usuario);
            return (
              <div key={post.id} className="border-b border-gray-200 mb-2">
                {/* Header del post */}
                <div className="flex items-center justify-between px-4 py-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-tr from-yellow-400 to-pink-600 rounded-full p-0.5">
                      <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                        <span className="text-xs font-semibold">
                          {nombreUsuario.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <span className="font-semibold text-sm">
                      {nombreUsuario}
                    </span>
                  </div>
                  <MoreHorizontal className="w-5 h-5" />
                </div>

                {/* Imagen */}
                <img
                  src={post.imagen}
                  alt={post.descripcion}
                  className="w-full aspect-square object-cover"
                />

                {/* Acciones */}
                <div className="px-4 py-2">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex gap-4">
                      <button onClick={() => toggleLike(post.id)}>
                        <Heart
                          className={`w-6 h-6 ${
                            likedPosts.has(post.id)
                              ? "fill-red-500 text-red-500"
                              : "text-black"
                          }`}
                        />
                      </button>
                      <button onClick={() => abrirComentarios(post.id)}>
                        <MessageCircle className="w-6 h-6" />
                      </button>
                      <Send className="w-6 h-6" />
                    </div>
                    <Bookmark className="w-6 h-6" />
                  </div>

                  {/* Contador de likes */}
                  {likeCounts[post.id] > 0 && (
                    <p className="font-semibold text-sm mb-1">
                      {likeCounts[post.id]} {likeCounts[post.id] === 1 ? "me gusta" : "me gusta"}
                    </p>
                  )}

                  {/* Descripción */}
                  <p className="text-sm">
                    <span className="font-semibold mr-2">
                      {nombreUsuario}
                    </span>
                    {post.descripcion}
                  </p>

                  {/* Ver comentarios */}
                  {comentarioCounts[post.id] > 0 && (
                    <button
                      onClick={() => abrirComentarios(post.id)}
                      className="text-gray-500 text-sm mt-1"
                    >
                      Ver los {comentarioCounts[post.id]} comentarios
                    </button>
                  )}

                  {/* Fecha */}
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(post.creado_en).toLocaleDateString("es-ES")}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal de Comentarios */}
      {showComments && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full sm:max-w-md sm:rounded-t-2xl rounded-t-2xl max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">Comentarios</h3>
              <button onClick={() => setShowComments(null)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Lista de comentarios */}
            <div className="flex-1 overflow-y-auto p-4">
              {comentarios[showComments]?.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  Aún no hay comentarios
                </p>
              ) : (
                comentarios[showComments]?.map((comentario) => {
                  const nombreComentario = getNombreUsuario(comentario.usuario);
                  return (
                    <div key={comentario.id} className="mb-4">
                      <div className="flex gap-2">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-semibold">
                            {nombreComentario.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm">
                            <span className="font-semibold mr-2">
                              {nombreComentario}
                            </span>
                            {comentario.texto}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(comentario.creado_en).toLocaleDateString("es-ES")}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input para nuevo comentario */}
            {currentUser && (
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Agregar un comentario..."
                    value={nuevoComentario}
                    onChange={(e) => setNuevoComentario(e.target.value)}
                    className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:border-gray-400"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        agregarComentario(showComments);
                      }
                    }}
                  />
                  <button
                    onClick={() => agregarComentario(showComments)}
                    disabled={!nuevoComentario.trim()}
                    className="text-blue-500 font-semibold text-sm disabled:text-blue-300"
                  >
                    Publicar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}