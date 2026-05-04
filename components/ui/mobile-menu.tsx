"use client"

import { useState, useEffect } from "react"
import { Menu, X, Coffee, Heart } from "lucide-react" // Coffee icon imported
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ModeToggle } from "@/components/mode-toggle"
import Link from "next/link" // Link imported
import { motion, AnimatePresence } from "framer-motion" // Added AnimatePresence

interface MobileMenuProps {
  activeTab: string
  setActiveTab: (value: string) => void
  navItems: {
    value: string
    label: string
    icon: React.ReactNode
  }[]
}

export function MobileMenu({ activeTab, setActiveTab, navItems }: MobileMenuProps) {
  const [open, setOpen] = useState(false)
  const [animationsReady, setAnimationsReady] = useState(false)
  
  // Delay loading of complex animations until after the menu opens
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        setAnimationsReady(true);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setAnimationsReady(false);
    }
  }, [open]);
  
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Menüyü aç</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-64 p-0" style={{ overflowY: 'auto' }}>
        <div className="flex flex-col h-full">            <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-lg font-semibold">Menü</h2>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setOpen(false)} 
              className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Kapat</span>
            </Button>
          </div>
          <div className="flex-1 overflow-auto py-2">
            <nav className="grid gap-1 px-2">
              {navItems.map((item) => (
                <Button
                  key={item.value}
                  variant={activeTab === item.value ? "secondary" : "ghost"}
                  className={cn(
                    "justify-start gap-2",
                    activeTab === item.value ? "bg-secondary/50" : ""
                  )}
                  onClick={() => {
                    setActiveTab(item.value)
                    setOpen(false)
                  }}
                >
                  {item.icon}
                  {item.label}
                </Button>
              ))}
            </nav>
          </div>          
          <div className="p-4 border-t">
            <AnimatePresence>
              {animationsReady && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="relative mb-3 overflow-hidden group"
                >
                  <Link
                    href="https://buymeacoffee.com/soneryesilay"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-full px-4 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-md font-medium text-sm shadow-md group-hover:shadow-yellow-300/20"
                    onClick={() => setOpen(false)}
                  >                
                    <div className="relative flex items-center">                      <motion.div
                        className="relative"
                        animate={{ 
                          rotate: [0, 10, -5, 0],
                          y: [0, -2, 1, 0]
                        }}
                        transition={{ 
                          duration: 1.8, 
                          repeat: Infinity, 
                          repeatDelay: 1,
                          ease: "easeInOut" 
                        }}
                      >
                        <Coffee className="h-5 w-5 mr-2.5" />
                      </motion.div>                      <span className="font-bold tracking-wide">Destek Ol</span>
                        {/* Continuous floating hearts */}
                      {[...Array(20)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute text-yellow-200/70 pointer-events-none"
                          style={{
                            right: `${15 + (i * 8)}px`,
                            top: `${3 + (i * 2)}px`,
                            zIndex: 1
                          }}
                          animate={{ 
                            y: [-2, -20 - (i * 5)],
                            x: [0, (i % 2 === 0 ? 5 : -5) + (Math.sin(i) * 3)],
                            opacity: [0, 0.7, 0],
                            scale: [0.5, 0.7 + (i * 0.08), 0.3],
                            rotate: [0, i % 2 === 0 ? 20 : -20]
                          }}
                          transition={{ 
                            duration: 1.5 + (i * 0.3), 
                            repeat: Infinity, 
                            repeatDelay: 0.2 * i,
                            delay: i * 0.3,
                            ease: "easeOut"
                          }}
                        >
                          <Heart size={i % 2 === 0 ? 10 : 12} />
                        </motion.div>
                      ))}
                    </div>
                  </Link>                  {/* Additional floating hearts outside the button */}
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={`outer-heart-${i}`}
                      className="absolute text-yellow-400/40 z-10"
                      style={{
                        left: `${10 + (i * 20)}%`,
                        top: '50%'
                      }}
                      animate={{ 
                        y: [-5, -35 - (i * 15)],
                        x: [(i % 2 === 0 ? 5 : -5) * (i+1), (i % 2 === 0 ? 15 : -15) * (i+1)],
                        opacity: [0, 0.4, 0],
                        scale: [0.3, 0.6 + (i * 0.1), 0.2],
                        rotate: [0, i % 2 === 0 ? 45 : -45]
                      }}
                      transition={{ 
                        duration: 2.5 + (i * 0.5), 
                        repeat: Infinity,
                        repeatDelay: 0.1,
                        delay: i * 0.7,
                        ease: "easeOut"
                      }}
                    >
                      <Heart size={i % 2 === 0 ? 14 : 16} fill={i % 3 === 0 ? "currentColor" : "none"} />
                    </motion.div>
                  ))}
                  
                  <motion.div 
                    className="absolute inset-0 -z-10 bg-gradient-to-r from-yellow-300/20 to-yellow-400/20 blur-xl"
                    animate={{ 
                      opacity: [0.5, 0.8, 0.5],
                      scale: [0.8, 1, 0.8] 
                    }}
                    transition={{ duration: 3, repeat: Infinity, repeatType: "mirror" }}
                  />
                  <motion.div 
                    className="absolute -inset-1 -z-20 bg-gradient-to-r from-yellow-400/10 via-yellow-300/5 to-yellow-400/10 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  />
                </motion.div>
              )}
            </AnimatePresence>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <a href="https://github.com/soneryesilay" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-github">
                    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                    <path d="M9 18c-4.51 2-5-2-7-2" />
                  </svg>
                  <span className="sr-only">GitHub</span>
                </a>
                <a href="https://linkedin.com/in/soneryesilay" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-linkedin">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect width="4" height="12" x="2" y="9" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                  <span className="sr-only">LinkedIn</span>
                </a>
              </div>              
              <div className="relative">
                <ModeToggle />
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}