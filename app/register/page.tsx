"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

export default function RegisterPage() {
  const [nombre, setNombre] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [telefono, setTelefono] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        setLoading(false);
      } else {
        router.push("/user");
      }
    };
    checkUser();
  }, [router]);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      setMessage("❌ Error en registro: " + authError.message);
      return;
    }

    const userId = authData.user?.id;
    if (!userId) {
      setMessage("⚠️ No se pudo obtener el ID del usuario.");
      return;
    }

    const { error: insertError } = await supabase
      .from("usuarios")
      .insert([
        {
          id: userId,
          nombre,
          correo: email,
          telefono,
        },
      ]);

    if (insertError) {
      setMessage("⚠️ Usuario autenticado pero no guardado en la tabla: " + insertError.message);
      return;
    }

    setMessage("✅ Usuario registrado correctamente. Revisa tu correo para confirmar.");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-600">Verificando sesión...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        {/* Logo Instagram */}
        <div className="bg-white border border-gray-300 rounded-sm p-10 mb-3">
          <h1
            className="text-5xl text-center mb-8 font-normal"
            style={{ fontFamily: 'Billabong, cursive' }}
          >
            Instagram
          </h1>

          <p className="text-center text-gray-500 font-semibold text-base mb-6">
            Regístrate para ver fotos y videos de tus amigos.
          </p>

          <form onSubmit={handleRegister} className="flex flex-col gap-2">
            <input
              type="text"
              placeholder="Nombre completo"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              className="w-full px-2 py-2 text-xs border border-gray-300 rounded-sm bg-gray-50 focus:outline-none focus:border-gray-400"
            />

            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-2 py-2 text-xs border border-gray-300 rounded-sm bg-gray-50 focus:outline-none focus:border-gray-400"
            />

            <input
              type="tel"
              placeholder="Teléfono (opcional)"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className="w-full px-2 py-2 text-xs border border-gray-300 rounded-sm bg-gray-50 focus:outline-none focus:border-gray-400"
            />

            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-2 py-2 text-xs border border-gray-300 rounded-sm bg-gray-50 focus:outline-none focus:border-gray-400"
            />

            <button
              type="submit"
              className="w-full bg-blue-500 text-white font-semibold py-1.5 rounded-lg mt-2 hover:bg-blue-600 transition text-sm"
            >
              Registrarse
            </button>
          </form>

          {message && (
            <p className={`mt-4 text-center text-xs ${message.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </p>
          )}

          <p className="text-xs text-gray-500 text-center mt-4 leading-relaxed">
            Al registrarte, aceptas nuestras Condiciones, la Política de privacidad y la Política de cookies.
          </p>
        </div>

        {/* Enlace a Login */}
        <div className="bg-white border border-gray-300 rounded-sm p-5 text-center">
          <p className="text-sm">
            ¿Ya tienes cuenta?{" "}
            <button
              onClick={() => router.push("/login")}
              className="text-blue-500 font-semibold hover:text-blue-700"
            >
              Inicia sesión
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}