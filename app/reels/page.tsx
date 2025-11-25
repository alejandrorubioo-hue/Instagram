"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Volume2, VolumeX } from "lucide-react";

interface Reel {
  id: string;
  imagen: string;
  descripcion: string;
  creado_en: string;
  usuario_id: string;
  usuario?: { nombre: string };
}

const UNSPLASH_DEFAULT = "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=800&q=80";

function isAllowedImageUrl(url: string) {
  try {
    const { hostname } = new URL(url);
    return (
      hostname.includes("unsplash.com") ||
      hostname.includes("randomuser.me")
    );
  } catch {
    return false;
  }
}

export default function ReelsPage() {
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedReels, setLikedReels] = useState<Set<string>>(new Set());
  const [savedReels, setSavedReels] = useState<Set<string>>(new Set());
  const [muted, setMuted] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    checkUserAndFetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkUserAndFetchData = async () => {
    const { data } = await supabase.auth.getSession();
    const user = data?.session?.user;

    if (!user) {
      router.push("/login");
      return;
    }

    setCurrentUser(user);
    await fetchReels();
    setLoading(false);
  };

  const fetchReels = async () => {
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
      .order("creado_en", { ascending: false })
      .limit(20);

    if (!error && data) {
      const reelsNormalizados = data.map((reel: any) => ({
        ...reel,
        usuario: Array.isArray(reel.usuario) ? reel.usuario[0] : reel.usuario,
      }));
      setReels(reelsNormalizados);
    }
  };

  const toggleLike = (reelId: string) => {
    if (!currentUser) return;

    setLikedReels(prev => {
      const newSet = new Set(prev);
      if (newSet.has(reelId)) {
        newSet.delete(reelId);
      } else {
        newSet.add(reelId);
      }
      return newSet;
    });
  };

  const toggleSave = (reelId: string) => {
    if (!currentUser) return;

    setSavedReels(prev => {
      const newSet = new Set(prev);
      if (newSet.has(reelId)) {
        newSet.delete(reelId);
      } else {
        newSet.add(reelId);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <p className="text-white">⏳ Cargando Reels...</p>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen">
      {/* Header */}
      <div className="sticky top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/60 to-transparent p-4">
        <div className="max-w-md mx-auto">
          <h1 className="text-white text-xl font-semibold text-center">Reels</h1>
        </div>
      </div>

      {/* Reels verticales (scroll infinito simulado) */}
      <div className="flex flex-col gap-8 py-8 max-w-md mx-auto">
        {reels.length === 0 ? (
          <div className="h-screen flex items-center justify-center">
            <p className="text-white text-center px-4">No hay reels disponibles</p>
          </div>
        ) : (
          reels.map((reel) => (
            <div
              key={reel.id}
              className="flex flex-col items-center bg-zinc-900 rounded-lg shadow-md p-4"
            >
              {/* Imagen del reel */}
              <div className="w-full aspect-square bg-black rounded-lg overflow-hidden mb-4 flex items-center justify-center">
                <img
                  src={isAllowedImageUrl(reel.imagen) ? reel.imagen : UNSPLASH_DEFAULT}
                  alt={reel.descripcion}
                  className="w-full h-full object-contain"
                  
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = UNSPLASH_DEFAULT;
                  }}
                />
              </div>

              {/* Información inferior */}
              <div className="w-full text-white">
                <p className="font-semibold text-sm mb-2">
                  @{reel.usuario?.nombre || "usuario"}
                </p>
                <p className="text-sm mb-2 line-clamp-2">
                  {reel.descripcion}
                </p>
                <div className="flex items-center gap-2">
                  <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                    <p className="text-xs">🎵 Audio original</p>
                  </div>
                </div>
              </div>

              {/* Controles laterales derechos */}
              <div className="flex flex-row gap-6 mt-4">
                {/* Like */}
                <button
                  onClick={() => toggleLike(reel.id)}
                  className="flex flex-col items-center gap-1"
                >
                  <Heart
                    className={`w-7 h-7 ${likedReels.has(reel.id) ? 'fill-red-500 text-red-500' : 'text-white'}`}
                    strokeWidth={2}
                  />
                  <span className="text-white text-xs font-semibold">
                    {likedReels.has(reel.id) ? '1' : '0'}
                  </span>
                </button>

                {/* Comentarios */}
                <button className="flex flex-col items-center gap-1">
                  <MessageCircle className="w-7 h-7 text-white" strokeWidth={2} />
                  <span className="text-white text-xs font-semibold">0</span>
                </button>

                {/* Compartir */}
                <button className="flex flex-col items-center gap-1">
                  <Send className="w-7 h-7 text-white" strokeWidth={2} />
                </button>

                {/* Guardar */}
                <button
                  onClick={() => toggleSave(reel.id)}
                  className="flex flex-col items-center gap-1"
                >
                  <Bookmark
                    className={`w-7 h-7 ${savedReels.has(reel.id) ? 'fill-white text-white' : 'text-white'}`}
                    strokeWidth={2}
                  />
                </button>

                {/* Más opciones */}
                <button className="flex flex-col items-center gap-1">
                  <MoreHorizontal className="w-7 h-7 text-white" strokeWidth={2} />
                </button>

                {/* Botón de audio (decorativo) */}
                <button
                  onClick={() => setMuted(!muted)}
                  className="bg-black/50 backdrop-blur-sm p-2 rounded-full"
                >
                  {muted ? (
                    <VolumeX className="w-5 h-5 text-white" />
                  ) : (
                    <Volume2 className="w-5 h-5 text-white" />
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}