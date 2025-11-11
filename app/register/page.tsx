"use client";
// 👆 Este componente se ejecuta del lado del cliente (navegador)
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

  // ⚙️ Esta función maneja el registro del usuario
  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // 👈 Evita que el formulario recargue la página

    // 🚀 1️⃣ Registrar al usuario en el sistema de autenticación de Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    // 🧩 Si hay error en la autenticación, detenemos el proceso
    if (authError) {
      setMessage("❌ Error en registro: " + authError.message);
      return;
    }

    // ⚠️ Verificamos si Supabase devolvió un ID de usuario
    const userId = authData.user?.id;
    if (!userId) {
      setMessage("⚠️ No se pudo obtener el ID del usuario.");
      return;
    }

    // 📘 2️⃣ Insertar los datos del usuario en la tabla 'usuarios'
    const { error: insertError } = await supabase
      .from("usuarios")
      .insert([
        {
          id: userId, // 🧩 Usamos el mismo ID del sistema de autenticación
          nombre,
          correo: email,
          telefono,
        },
      ]);

    // 🧩 Si hay error al insertar en la tabla
    if (insertError) {
      setMessage("⚠️ Usuario autenticado pero no guardado en la tabla: " + insertError.message);
      return;
    }

    // ✅ Si todo sale bien:
    setMessage("✅ Usuario registrado y guardado correctamente. Revisa tu correo para confirmar.");
  };

  if (loading) return <p className="text-center mt-10">Verificando sesión...</p>;

  return (
    <div className="max-w-sm mx-auto mt-10 p-6 border rounded-lg shadow">
      <h1 className="text-xl font-bold mb-4 text-center">Registro de usuario</h1>
      {/* 📋 Al enviar el formulario se ejecuta handleRegister */}
      <form onSubmit={handleRegister} className="flex flex-col gap-4">
        {/* Campo para el nombre */}
        <input
          type="text"
          placeholder="Nombre completo"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
          className="border p-2 rounded"
        />
        {/* Campo para el correo */}
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border p-2 rounded"
        />
        {/* Campo para el teléfono */}
        <input
          type="tel"
          placeholder="Teléfono"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
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
        <button type="submit" className="bg-blue-600 text-white p-2 rounded">
          Registrarse
        </button>
      </form>
      {/* 💬 Mostramos el mensaje de éxito o error */}
      {message && <p className="mt-4 text-center">{message}</p>}

      {/* 🔗 Enlace a la página de login */}
      <p className="mt-4 text-center">
        ¿Ya tienes cuenta?{" "}
        <button
          onClick={() => router.push("/login")}
          className="text-blue-600 underline"
        >
          Inicia sesión aquí
        </button>
      </p>
    </div>
  );
}