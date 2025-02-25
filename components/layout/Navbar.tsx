"use client";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Sun, Moon, Search, User } from "lucide-react";
import { useState } from "react";
import { SearchModal } from "./SearchModal";

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center">
            <span className="font-montserrat font-bold text-xl">StreamScape</span>
          </Link>

          <div className="flex items-center gap-4">
            <button
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>

            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 hover:bg-accent rounded-md"
            >
              <Search className="w-5 h-5" />
            </button>

            <Link
              href="/profile"
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
            >
              <User className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </nav>
  );
}
