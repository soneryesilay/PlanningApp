'use client'

import React, { useState, useEffect, createContext, useContext } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

// Create a context to expose loading state
export const LoadingContext = createContext<boolean>(true)

// Hook to access loading state from any component
export const useLoading = () => useContext(LoadingContext)

interface PageTransitionProps {
  children: React.ReactNode
}

export default function PageTransition({ children }: PageTransitionProps) {
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    console.log('PageTransition başlangıç durumu: loading =', loading)
    // Sayfa kaydırmayı engelle
    if (loading) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }

    // Kısa bir yükleme süresi - 0.8 saniye
    const timer = setTimeout(() => {
      console.log('Timer tamamlandı, loading false olarak ayarlanıyor')
      setLoading(false)
       // Loading animasyonunun görülebilmesi için yeterli süre, ama kullanıcıyı bekletmeyecek kadar kısa
        }, 800) // 800ms - profesyonel uygulamalarda yaygın kullanılan süre
    
    return () => {
      clearTimeout(timer)
      document.body.style.overflow = 'auto' // Component unmount olduğunda kaydırmayı etkinleştir
    }
  }, [loading]) // loading durumunu dependency array'e ekle
  return (
    <LoadingContext.Provider value={loading}>
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="loading"
            className="flex flex-col items-center justify-center h-screen bg-background fixed inset-0 z-50" // fixed, inset-0 ve z-50 eklendi
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >            <div className="relative flex items-center justify-center w-24 h-24">
              {/* Saat Çerçevesi - Daha dolgun görünüm için */}
              <div className="absolute w-full h-full border-4 border-primary rounded-full shadow-[0_0_10px_rgba(0,0,0,0.1)] bg-background/80"></div>              {/* İç Halkalar */}
              <div className="absolute w-[90%] h-[90%] border border-primary/30 rounded-full"></div>
              {/* Akrep */}
              <motion.div
                className="absolute w-1.5 h-7 bg-primary rounded-full shadow-sm" 
                style={{ originY: 1, top: 'calc(50% - 1.75rem)', left: 'calc(50% - 0.1875rem)', transform: 'rotate(30deg)' }}
              />              {/* Yelkovan */}
              <motion.div
                className="absolute w-1 h-9 bg-primary/80 rounded-full shadow-sm" 
                style={{ originY: 1, top: 'calc(50% - 2.25rem)', left: 'calc(50% - 0.125rem)', transform: 'rotate(180deg)' }}
                animate={{ rotate: [180, 540] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
              {/* Merkez Nokta */}
              <div className="absolute w-3 h-3 bg-primary rounded-full z-10"></div>
            </div>
            <motion.p 
              className="mt-8 text-lg font-medium text-muted-foreground"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
             Yükleniyor...
            </motion.p>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            className="page-transition"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </LoadingContext.Provider>
  )
}