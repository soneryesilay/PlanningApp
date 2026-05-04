"use client";

import Link from "next/link";
import { Coffee, Heart } from "lucide-react";
import { motion } from "framer-motion";

export function Footer() {
  return (
    <footer className="border-t py-4 px-4 md:px-6">
      <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center text-sm text-muted-foreground">
        <div className="text-xs mb-2 sm:mb-0">
          © 2025 Soner Yeşilay. Tüm hakları saklıdır.
        </div>        
        <div className="flex items-center space-x-4">
          <motion.div 
            className="relative group p-1 rounded-md"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >            <Link 
              href="https://buymeacoffee.com/soneryesilay" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center hover:text-yellow-500 transition-colors px-2 py-1 rounded-md relative z-0"
            >              
              <motion.div
                className="relative hidden sm:block"
                animate={{ 
                  rotate: [0, 10, -5, 0],
                  y: [0, -1, 0.5, 0]
                }}
                transition={{ 
                  duration: 1.8, 
                  repeat: Infinity, 
                  repeatDelay: 1.5,
                  ease: "easeInOut" 
                }}
              >
                <Coffee className="h-4 w-4 mr-1" />
              </motion.div>
              <span>Destek Ol</span>
            </Link>
            
            {/* Floating hearts on hover */}
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-yellow-500/70 pointer-events-none opacity-0 group-hover:opacity-100"
                style={{
                  right: `${5 + (i * 6)}px`,
                  top: `${0 + (i * 1)}px`,
                  zIndex: 1
                }}
                animate={{ 
                  y: [-2, -15 - (i * 3)],
                  x: [0, (i % 2 === 0 ? 5 : -5) + (Math.sin(i) * 2)],
                  opacity: [0, 0.7, 0],
                  scale: [0.5, 0.7 + (i * 0.05), 0.3],
                  rotate: [0, i % 2 === 0 ? 15 : -15]
                }}
                transition={{ 
                  duration: 1.2 + (i * 0.2), 
                  repeat: Infinity, 
                  repeatDelay: 0.2 * i,
                  delay: i * 0.2,
                  ease: "easeOut" 
                }}
              >
                <Heart size={i % 2 === 0 ? 8 : 10} />
              </motion.div>
            ))}
          </motion.div>
          <Link href="https://github.com/soneryesilay" target="_blank" rel="noopener noreferrer" className="hidden sm:flex items-center justify-center hover:text-foreground py-2 pl-2 pr-1 rounded-md relative z-10">            
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-github">
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
              <path d="M9 18c-4.51 2-5-2-7-2" />
            </svg>
            <span className="sr-only">GitHub</span>
          </Link>
          <Link href="https://linkedin.com/in/soneryesilay" target="_blank" rel="noopener noreferrer" className="hidden sm:flex items-center justify-center hover:text-foreground py-2 pl-2 pr-1 rounded-md relative z-10">            
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-linkedin">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
              <rect width="4" height="12" x="2" y="9" />
              <circle cx="4" cy="4" r="2" />
            </svg>
            <span className="sr-only">LinkedIn</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;