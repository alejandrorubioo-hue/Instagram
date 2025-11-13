"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Search, Play } from "lucide-react";

interface ExplorePost {
  id: string;
  imagen: string;
  descripcion: string;
  tipo?: string;
}

export default function ExplorePage() {
  const [posts, setPosts] = useState<ExplorePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchExplorePosts = async () => {
    const { data, error } = await supabase
      .from("publicaciones")
      .select("id, imagen, descripcion")
      .order("creado_en", { ascending: false })
      .limit(30);

    if (!error && data) {
      setPosts(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchExplorePosts();
  }, []);

  const filteredPosts = posts.filter(post =>
    post.descripcion?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">⏳ Cargando...</p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Header con barra de búsqueda */}
      <div className="sticky top-0 bg-white z-40 px-3 py-2 border-b border-gray-200">
        <div className="max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-100 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:bg-gray-200"
            />
          </div>
        </div>
      </div>

      {/* Grid de publicaciones estilo Instagram */}
      <div className="max-w-md mx-auto">
        {filteredPosts.length === 0 ? (
          <p className="text-center text-gray-600 mt-10 px-4">
            No se encontraron publicaciones
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-0.5">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                className="relative aspect-square bg-gray-100 cursor-pointer hover:opacity-90 transition"
              >
                <img
                  src={post.imagen}
                  alt={post.descripcion}
                  className="w-full h-full object-cover"
                />
                {/* Icono de video si es reel (simulado) */}
                {Math.random() > 0.7 && (
                  <div className="absolute top-2 right-2">
                    <Play className="w-5 h-5 text-white drop-shadow-lg" fill="white" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}