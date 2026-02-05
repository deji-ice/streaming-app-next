import Link from "next/link";
import { Facebook, Twitter, Instagram, Youtube, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Footer() {
  return (
    <footer className="bg-[#f8f9fa] dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 pt-6 sm:pt-8 lg:pt-12 pb-4 sm:pb-6">
      <div className="container mx-auto px-3 sm:px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6 lg:gap-8 mb-6 sm:mb-8 lg:mb-12">
          {/* Column 1: Logo & About */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center">
              <h2 className="font-montserrat font-bold text-base sm:text-lg lg:text-xl text-gray-900 dark:text-white">
                StreamScapeX
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm leading-relaxed">
              Your premier destination for streaming the latest movies and TV
              shows in high definition.
            </p>
            <div className="flex space-x-3 sm:space-x-4">
              <a
                href="https://twitter.com"
                aria-label="Twitter"
                className="text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors"
              >
                <Twitter
                  size={16}
                  className="w-4 h-4 sm:w-[18px] sm:h-[18px]"
                />
              </a>
              <a
                href="https://facebook.com"
                aria-label="Facebook"
                className="text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors"
              >
                <Facebook
                  size={16}
                  className="w-4 h-4 sm:w-[18px] sm:h-[18px]"
                />
              </a>
              <a
                href="https://instagram.com"
                aria-label="Instagram"
                className="text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors"
              >
                <Instagram
                  size={16}
                  className="w-4 h-4 sm:w-[18px] sm:h-[18px]"
                />
              </a>
              <a
                href="https://youtube.com"
                aria-label="YouTube"
                className="text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors"
              >
                <Youtube
                  size={16}
                  className="w-4 h-4 sm:w-[18px] sm:h-[18px]"
                />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="font-montserrat font-bold text-sm sm:text-base text-gray-900 dark:text-white">
              Quick Links
            </h3>
            {(() => {
              const quickLinks = [
                { title: "Home", href: "/" },
                { title: "Movies", href: "/movie" },
                { title: "TV Shows", href: "/series" },
                { title: "Search", href: "/search" },
              ];
              return (
                <ul className="space-y-1 sm:space-y-2">
                  {quickLinks.map((item) => (
                    <li key={item.title}>
                      <Link
                        href={item.href}
                        className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors text-xs sm:text-sm"
                      >
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              );
            })()}
          </div>

          {/* Column 3: Newsletter */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="font-montserrat font-bold text-sm sm:text-base text-gray-900 dark:text-white">
              Newsletter
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">
              Subscribe to receive updates on new releases and features.
            </p>
            <form className="flex gap-1 sm:gap-2">
              <Input
                type="email"
                placeholder="Your email"
                className="bg-white dark:bg-gray-800 text-xs sm:text-sm h-8 sm:h-9"
              />
              <Button
                type="submit"
                size="sm"
                className="whitespace-nowrap h-8 sm:h-9 text-xs sm:text-sm"
              >
                <Mail className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span>Subscribe</span>
              </Button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 dark:border-gray-800 pt-4 sm:pt-6 flex flex-col xs:flex-row justify-between items-center">
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} StreamScapeX. All rights reserved.
          </p>
        </div>
        <div className="mt-5 sm:mt-6 lg:mt-8 border-t pt-3 sm:pt-4">
          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 text-center sm:text-left">
            <strong>DISCLAIMER:</strong> This website is a personal project
            created for educational, demonstration, and portfolio purposes only.
            StreamScapeX does not host any content; it utilizes TMDB API for
            metadata and external services for streaming. No copyright
            infringement is intended.
          </p>
        </div>
      </div>
    </footer>
  );
}
