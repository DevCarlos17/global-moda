import type { ReactNode } from "react";
import logoImg from "@/assets/globalmoda.jpg";

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-dvh flex">

      {/* Left — image panel */}
      <div className="hidden lg:block relative w-1/2 flex-shrink-0">
        <img
          src={logoImg}
          alt="Global Moda Imports"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      {/* Right — form panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 bg-white">
        <div className="w-full max-w-sm">
          {children}
        </div>

        <p className="mt-10 text-gray-300 text-xs">
          © {new Date().getFullYear()} Global Moda Imports
        </p>
      </div>

    </div>
  );
}
