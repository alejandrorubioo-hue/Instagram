"use client";
import Image from "next/image";

// Historias de ejemplo (puedes reemplazar por datos reales)
const stories = [
  {
    id: 1,
    nombre: "alejandro",
    avatar: "https://randomuser.me/api/portraits/men/1.jpg",
    activo: true,
  },
  {
    id: 2,
    nombre: "laura",
    avatar: "https://randomuser.me/api/portraits/women/2.jpg",
    activo: false,
  },
  {
    id: 3,
    nombre: "daniel",
    avatar: "https://randomuser.me/api/portraits/men/3.jpg",
    activo: true,
  },
  {
    id: 4,
    nombre: "sofia",
    avatar: "https://randomuser.me/api/portraits/women/4.jpg",
    activo: false,
  },
  // ...agrega más historias si quieres
];

export default function Stories() {
  return (
    <div className="w-full max-w-md mx-auto px-2 py-4">
      <div className="flex gap-4 overflow-x-auto scrollbar-hide">
        {stories.map((story) => (
          <div key={story.id} className="flex flex-col items-center min-w-[64px]">
            <div
              className={`w-16 h-16 rounded-full border-2 ${
                story.activo
                  ? "border-pink-500"
                  : "border-gray-300"
              } p-1 bg-gradient-to-tr from-pink-500 to-yellow-400`}
            >
              <Image
                src={story.avatar}
                alt={story.nombre}
                width={56}
                height={56}
                className="rounded-full object-cover w-full h-full"
              />
            </div>
            <span className="text-xs mt-1 text-gray-700">{story.nombre}</span>
          </div>
        ))}
      </div>
    </div>
  );
}