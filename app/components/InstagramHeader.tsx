"use client";
import { Heart, MessageCircle } from "lucide-react";
import Link from "next/link";

export default function InstagramHeader() {
  return (
    <header className="sticky top-0 bg-white border-b border-gray-200 z-40 px-4 py-2.5">
      <div className="flex items-center justify-between max-w-md mx-auto">
        {/* Logo Instagram */}
        <Link href="/" className="flex items-center">
          <h1
            className="text-3xl font-normal"
            style={{ fontFamily: 'Billabong, cursive' }}
          >
            Instagram
          </h1>
          <svg className="w-3 h-3 ml-1.5 -mt-1" fill="currentColor" viewBox="0 0 20 20">
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
          </svg>
        </Link>

        {/* Iconos derecha */}
        <div className="flex items-center gap-5">
          {/* Notificaciones con badge */}
          <Link href="/notifications" className="relative">
            <Heart className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
              2
            </span>
          </Link>

          {/* Mensajes */}
          <Link href="/messages">
            <MessageCircle className="w-6 h-6" />
          </Link>
        </div>
      </div>
    </header>
  );
}
