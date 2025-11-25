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
              {/* Imagen de Unsplash para depuración */}
              <img
                src="https://images.unsplash.com/photo-1518717758536-85ae29035b6d"
                alt="Test"
                className="w-full h-full object-contain"
                style={{ background: "red" }}
                onError={() => console.log("Error cargando imagen")}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
