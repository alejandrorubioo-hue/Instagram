"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { ArrowLeft, Image as ImageIcon, X } from "lucide-react";

export default function CreatePage() {
  const [usuario, setUsuario] = useState<any>(null);
  const [imagen, setImagen] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [previsualizacion, setPrevisualizacion] = useState("");
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  // Verificar autenticación
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push("/login");
      } else {
        setUsuario(data.user);
        setLoading(false);
      }
    };
    checkUser();
  }, [router]);

  // Manejar URL de imagen
  const handleImagenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setImagen(url);
    setPrevisualizacion(url);
  };

  // Crear publicación
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!imagen || !descripcion) {
      setMensaje("❌ Por favor completa todos los campos");
      return;
    }

    setUploading(true);

    const { error } = await supabase
      .from("publicaciones")
      .insert([
        {
          usuario_id: usuario.id,
          imagen,
          descripcion,
        },
      ]);

    setUploading(false);

    if (error) {
      setMensaje("❌ Error al crear publicación: " + error.message);
    } else {
      setMensaje("✅ Publicación creada exitosamente");
      setTimeout(() => {
        router.push("/");
      }, 1500);
    }
  };

  // Limpiar formulario
  const handleClear = () => {
    setImagen("");
    setDescripcion("");
    setPrevisualizacion("");
    setMensaje(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">⏳ Cargando...</p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 z-40 px-4 py-3">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <button
            onClick={() => router.push("/")}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold">Nueva publicación</h1>
          <button
            onClick={handleClear}
            className="p-2 hover:bg-gray-100 rounded-full transition"
            disabled={!imagen && !descripcion}
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Formulario */}
      <div className="max-w-md mx-auto p-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Previsualización de imagen */}
          {previsualizacion ? (
            <div className="w-full aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={previsualizacion}
                alt="Previsualización"
                className="w-full h-full object-cover"
                onError={() => {
                  setPrevisualizacion("");
                  setMensaje("❌ URL de imagen no válida");
                }}
              />
            </div>
          ) : (
            <div className="w-full aspect-square bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-2">
              <ImageIcon className="w-12 h-12 text-gray-400" />
              <p className="text-sm text-gray-500">Ingresa URL de imagen</p>
            </div>
          )}

          {/* URL de imagen */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL de la imagen
            </label>
            <input
              type="url"
              placeholder="https://ejemplo.com/imagen.jpg"
              value={imagen}
              onChange={handleImagenChange}
              required
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              placeholder="Escribe una descripción..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              required
              rows={4}
              maxLength={500}
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <p className="text-xs text-gray-500 mt-1 text-right">
              {descripcion.length}/500
            </p>
          </div>

          {/* Botón de publicar */}
          <button
            type="submit"
            disabled={uploading || !imagen || !descripcion}
            className={`w-full py-3 rounded-lg font-semibold text-white transition ${
              uploading || !imagen || !descripcion
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {uploading ? "Publicando..." : "Publicar"}
          </button>
        </form>

        {/* Mensaje de estado */}
        {mensaje && (
          <div
            className={`mt-4 p-3 rounded-lg text-center ${
              mensaje.includes("✅")
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {mensaje}
          </div>
        )}
      </div>
    </div>
  );
}