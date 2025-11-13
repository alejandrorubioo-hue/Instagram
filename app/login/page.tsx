"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState<string>("");
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

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage("Nombre de usuario o contraseña incorrectos.");
      return;
    }

    if (data.user) {
      setMessage("✓ Bienvenido");
      setTimeout(() => {
        router.push("/");
      }, 800);
    } else {
      setMessage("No se encontró el usuario.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <p className="text-gray-600">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-sm">
        {/* Logo Instagram */}
        <div className="bg-white border border-gray-300 rounded px-10 py-8 mb-3">
          <h1
            className="text-5xl text-center mb-8 font-normal"
            style={{ fontFamily: 'Billabong, cursive' }}
          >
            Instagram
          </h1>

          {/* Formulario */}
          <form onSubmit={handleLogin} className="flex flex-col gap-2">
            <input
              type="email"
              placeholder="Teléfono, usuario o correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border border-gray-300 rounded px-2 py-2 text-xs bg-gray-50 focus:outline-none focus:border-gray-400"
            />

            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border border-gray-300 rounded px-2 py-2 text-xs bg-gray-50 focus:outline-none focus:border-gray-400"
            />

            <button
              type="submit"
              className="bg-blue-500 text-white rounded py-1.5 text-sm font-semibold mt-2 hover:bg-blue-600"
            >
              Entrar
            </button>
          </form>

          {/* Mensaje de error/éxito */}
          {message && (
            <p className={`mt-4 text-center text-sm ${message.includes("✓") ? "text-green-600" : "text-red-500"}`}>
              {message}
            </p>
          )}

          {/* Divisor */}
          <div className="flex items-center my-4">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-xs text-gray-500 font-semibold">O</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Olvidaste contraseña */}
          <p className="text-center text-xs text-blue-900 cursor-pointer hover:underline">
            ¿Olvidaste tu contraseña?
          </p>
        </div>

        {/* Caja de registro */}
        <div className="bg-white border border-gray-300 rounded px-10 py-5 text-center">
          <p className="text-sm">
            ¿No tienes una cuenta?{" "}
            <button
              onClick={() => router.push("/register")}
              className="text-blue-500 font-semibold hover:underline"
            >
              Regístrate
            </button>
          </p>
        </div>

      
         
        
        
      </div>
    </div>
  );
}