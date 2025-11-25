"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

interface Reel {
  id: string;
  imagen: string;
  descripcion: string;
}

export default function ReelsPage() {
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
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

    await fetchReels();
    setLoading(false);
  };

  const fetchReels = async () => {
    const { data, error } = await supabase
      .from("publicaciones")
      .select("id, imagen, descripcion")
      .order("creado_en", { ascending: false })
      .limit(20);

    if (!error && data) {
      setReels(data);
    }
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
      <div className="snap-y snap-mandatory h-screen overflow-y-scroll">
        {reels.length === 0 ? (
          <div className="h-screen flex items-center justify-center">
            <p className="text-white text-center px-4">No hay reels disponibles</p>
          </div>
        ) : (
          reels.map((reel) => (
            <div
              key={reel.id}
              className="flex items-center justify-center h-screen bg-black snap-start"
            >
              <img
                src={reel.imagen}
                alt={reel.descripcion}
                className="w-full h-full object-contain"
                style={{ background: "red" }}
                onError={() => console.log("Error cargando imagen:", reel.imagen)}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}