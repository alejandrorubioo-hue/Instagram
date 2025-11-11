import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "randomuser.me",
      // agrega aquí otros dominios si usas más imágenes externas
    ],
  },
  // ...otras opciones de configuración si tienes
};

export default nextConfig;