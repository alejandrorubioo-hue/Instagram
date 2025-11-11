"use client";
// 👆 Este componente se ejecuta del lado del cliente (navegador)
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient"; // Usa ruta relativa si el alias @ no funciona

export default function LoginPage() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Validar que solo usuarios NO logueados puedan acceder
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        // ✅ Usuario NO logueado, mostramos la página
        setLoading(false);
      } else {
        // ❌ Usuario logueado, redirige a perfil
        router.push("/user");
      }
    };
    checkUser();
  }, [router]);

  // ⚙️ Esta función se ejecuta cuando el usuario envía el formulario de login
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // 👈 Evita que el formulario recargue la página
    // 🚀 1️⃣ Autenticar usuario con Supabase (email y contraseña)
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    // 🧩 Si hay error en la autenticación, mostramos el mensaje
    if (error) {
      setMessage("❌ Error al iniciar sesión: " + error.message);
      return;
    }
    // ✅ Si el login es exitoso, guardamos el usuario en sesión
    if (data.user) {
      setMessage("✅ Bienvenido, sesión iniciada correctamente.");
      // Opcional: redirige automáticamente al perfil después de login exitoso
      setTimeout(() => {
        router.push("/user");
      }, 1000);
    } else {
      setMessage("⚠️ No se encontró el usuario. Intenta de nuevo.");
    }
  };

  if (loading) return <p className="text-center mt-10">Verificando sesión...</p>;

  return (
    <div className="max-w-sm mx-auto mt-10 p-6 border rounded-lg shadow">
      <h1 className="text-xl font-bold mb-4 text-center">Inicio de sesión</h1>
      {/* 📋 Al enviar el formulario se ejecuta handleLogin */}
      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        {/* Campo para el correo */}
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border p-2 rounded"
        />
        {/* Campo para la contraseña */}
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="border p-2 rounded"
        />
        <button type="submit" className="bg-green-600 text-white p-2 rounded">
          Iniciar sesión
        </button>
      </form>
      {/* 💬 Mostramos mensajes de éxito o error */}
      {message && <p className="mt-4 text-center">{message}</p>}

      {/* 🔗 Enlace a la página de registro */}
      <p className="mt-4 text-center">
        ¿No tienes cuenta?{" "}
        <button
          onClick={() => router.push("/register")}
          className="text-blue-600 underline"
        >
          Regístrate aquí
        </button>
      </p>
    </div>
  );
}