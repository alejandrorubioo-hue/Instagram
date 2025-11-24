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

  // ✅ Verificar si hay usuario logueado
  const checkUserAndFetchData = async () => {
    const { data } = await supabase.auth.getSession();
    const user = data?.session?.user;

    if (!user) {
      // ❌ No hay usuario logueado → Redirigir a login
      router.push("/login");
      return;
    }

    // ✅ Usuario logueado → Cargar datos
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
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/60 to-transparent p-4">
        <div className="max-w-md mx-auto">
          <h1 className="text-white text-xl font-semibold text-center">Reels</h1>
        </div>
      </div>

      {/* Reels verticales (scroll infinito simulado) */}
      <div className="snap-y snap-mandatory h-screen overflow-y-scroll">
        {reels.length === 0 ? (
          <div className="h-screen flex items-center justify-center">
            <p className="text-white text-center px-4">No hay reels disponibles</p>
          </div>
        ) : (
          reels.map((reel) => (
            <div
              key={reel.id}
              className="relative h-screen snap-start snap-always flex items-center justify-center"
            >
              {/* Imagen del reel (simula video) */}
              <div className="absolute inset-0">
                <img
                  src={reel.imagen}
                  alt={reel.descripcion}
                  className="w-full h-full object-cover"
                />
                {/* Overlay oscuro */}
                {/* <div className="absolute inset-0 bg-black/20"></div> */}
              </div>

              {/* Controles laterales derechos */}
              <div className="absolute right-3 bottom-24 flex flex-col gap-6 z-10">
                {/* Avatar */}
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[2px]">
                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                      <div className="w-11 h-11 rounded-full bg-gray-300 flex items-center justify-center text-sm font-semibold text-gray-700">
                        {reel.usuario?.nombre?.[0]?.toUpperCase() || "U"}
                      </div>
                    </div>
                  </div>
                </div>

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
              </div>

              {/* Información inferior */}
              <div className="absolute bottom-24 left-3 right-20 z-10">
                <div className="text-white">
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
              </div>

              {/* Botón de audio (decorativo) */}
              <button
                onClick={() => setMuted(!muted)}
                className="absolute top-20 right-3 z-10 bg-black/50 backdrop-blur-sm p-2 rounded-full"
              >
                {muted ? (
                  <VolumeX className="w-5 h-5 text-white" />
                ) : (
                  <Volume2 className="w-5 h-5 text-white" />
                )}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
  }