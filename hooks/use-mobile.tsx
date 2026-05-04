"use client"

import { useState, useEffect } from "react"

// Breakpoint'i 1280px'e yükseltiyoruz (daha geniş tablet boyutlarını da kapsayacak şekilde)
const MOBILE_BREAKPOINT = 1280

export function useIsMobile() {
  return useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
}

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)
  
  useEffect(() => {
    const media = window.matchMedia(query)
    
    // İlk yükleme durumunu ayarla
    if (media.matches !== matches) {
      setMatches(media.matches)
    }
    
    // Ekran boyutu değişimlerini dinle
    const listener = () => {
      setMatches(media.matches)
    }
    
    // Listener'ı ekle
    media.addEventListener("change", listener)
    
    // Component kaldırıldığında listener'ı temizle
    return () => {
      media.removeEventListener("change", listener)
    }
  }, [matches, query])
  
  return matches
}
