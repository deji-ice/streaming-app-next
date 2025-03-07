import Link from "next/link";
import { Facebook, Twitter, Instagram, Youtube, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Footer() {
  return (
    <footer className="bg-[#f8f9fa] dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 pt-12 pb-6">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Column 1: Logo & About */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="relative w-10 h-10">
              <h2 className="font-montserrat font-bold text-xl text-gray-900 dark:text-white">
                StreamScape
              </h2>
              </div>
             
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              Your premier destination for streaming the latest movies and TV shows in high definition.
            </p>
            <div className="flex space-x-4">
              <a href="https://twitter.com" aria-label="Twitter" className="text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors">
                <Twitter size={18} />
              </a>
              <a href="https://facebook.com" aria-label="Facebook" className="text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors">
                <Facebook size={18} />
              </a>
              <a href="https://instagram.com" aria-label="Instagram" className="text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors">
                <Instagram size={18} />
              </a>
              <a href="https://youtube.com" aria-label="YouTube" className="text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors">
                <Youtube size={18} />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-4">
            <h3 className="font-montserrat font-bold text-gray-900 dark:text-white">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {["Home", "Movies", "TV Shows", "New Releases", "Popular"].map((item) => (
                <li key={item}>
                  <Link 
                    href={`/${item.toLowerCase().replace(/\s+/g, '-')}`}
                    className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors text-sm"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Help & Support */}
          <div className="space-y-4">
            <h3 className="font-montserrat font-bold text-gray-900 dark:text-white">
              Support
            </h3>
            <ul className="space-y-2">
              {[
                ["About Us", "/about"],
                ["Contact", "/contact"],
                ["FAQ", "/faq"],
                ["Terms of Service", "/terms"],
                ["Privacy Policy", "/privacy"]
              ].map(([label, href]) => (
                <li key={label}>
                  <Link 
                    href={href}
                    className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors text-sm"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div className="space-y-4">
            <h3 className="font-montserrat font-bold text-gray-900 dark:text-white">
              Newsletter
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Subscribe to receive updates on new releases and features.
            </p>
            <form className="flex gap-2">
              <Input
                type="email"
                placeholder="Your email"
                className="bg-white dark:bg-gray-800"
              />
              <Button type="submit" size="sm" className="whitespace-nowrap">
                <Mail className="h-4 w-4 mr-1" />
                <span>Subscribe</span>
              </Button>
            </form>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-gray-200 dark:border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} StreamScape. All rights reserved.
          </p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link 
              href="/cookie-policy"
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
              Cookie Policy
            </Link>
            <Link 
              href="/dmca"
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
              DMCA
            </Link>
            <Link 
              href="/sitemap"
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}