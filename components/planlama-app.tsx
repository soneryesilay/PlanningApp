"use client"

import { useState, useCallback, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ModeToggle } from "@/components/mode-toggle"
import TakvimGorunumu from "@/components/takvim-gorunumu"
import GorevYonetimi from "@/components/gorev-yonetimi"
import PomodoroZamanlayici from "@/components/pomodoro-zamanlayici"
import OnemliGunlerYonetimi from "@/components/onemli-gunler-yonetimi"
import NotlarYonetimi from "@/components/notlar-yonetimi"
import CounterManagement from "@/components/counter"
import { MobileMenu } from "@/components/ui/mobile-menu"
import type { Gorev, PomodoroIstatistik, OnemliGun, Not, GorevKategori } from "@/lib/types"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { Calendar, CalendarCheck2, Clock, Sparkles, StickyNote, TrendingUp, MessageSquarePlus, PlusCircle } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-mobile"
import MotivasyonYazilariYonetimi from "./motivasyon-yazilari-yonetimi";
import { MotivasyonYazisi } from "../lib/types";
import { AnimatePresence, motion } from "framer-motion" // Framer motion import'u eklendi
import { BuyMeACoffeePopup } from "@/components/buy-me-a-coffee-popup"; // Eklendi

const USER_ACTIVITY_THRESHOLD_MS = 10 * 60 * 1000; // 10 minutes
const POPUP_SNOOZE_DURATION_MS = 3 * 24 * 60 * 60 * 1000; // 3 days

export default function PlanlamaApp() {
  const [activeTab, setActiveTab] = useState("takvim")
  const [gorevler, setGorevler] = useLocalStorage<Gorev[]>("gorevler", [])
  const [pomodoroIstatistikleri, setPomodoroIstatistikleri] = useLocalStorage<PomodoroIstatistik[]>(
    "pomodoroIstatistikleri",
    [],
  )
  const [onemliGunler, setOnemliGunler] = useLocalStorage<OnemliGun[]>("onemliGunler", [])
  const [notlar, setNotlar] = useLocalStorage<Not[]>("notlar", [])
  const [motivasyonYazilari, setMotivasyonYazilari] = useLocalStorage<MotivasyonYazisi[]>("motivasyonYazilari", []);
  // Görev kategorileri için yeni state
  const [gorevKategorileri, setGorevKategorileri] = useLocalStorage<GorevKategori[]>("gorevKategorileri", [
    { id: "varsayilan", ad: "Genel", renk: "#4f46e5" } // Varsayılan kategori
  ]);  
  const [mounted, setMounted] = useState(false)
  const [scrollPosition, setScrollPosition] = useState(0); // Scroll pozisyonunu takip etmek için state eklendi
  const [showBuyMeACoffeePopup, setShowBuyMeACoffeePopup] = useState(false); // Eklendi
  // Corrected local storage key to match the popup component
  const [dontShowBuyMeACoffeePopupAgain, setDontShowBuyMeACoffeePopupAgain] = useLocalStorage("dontShowBuyMeACoffeePopup", false);
  const [buyMeACoffeePopupLastClosedTimestamp, setBuyMeACoffeePopupLastClosedTimestamp] = useLocalStorage<number | null>("buyMeACoffeePopupLastClosedTimestamp", null);

  const isMobile = useMediaQuery("(max-width: 768px)")
  // Navigasyon öğeleri
  const navItems = [
    { value: "takvim", label: "Takvim", icon: <Calendar className="h-4 w-4" /> },
    { value: "gorevler", label: "Görevler", icon: <CalendarCheck2 className="h-4 w-4" /> },
    { value: "pomodoro", label: "Pomodoro", icon: <Clock className="h-4 w-4" /> },
    { value: "onemliGunler", label: "Önemli Günler", icon: <Sparkles className="h-4 w-4" /> },
    { value: "notlar", label: "Notlar", icon: <StickyNote className="h-4 w-4" /> },
    { value: "sayaclar", label: "Sayaçlar", icon: <PlusCircle className="h-4 w-4" /> },
    { value: "motivasyonYazilari", label: "Motivasyon", icon: <MessageSquarePlus className="h-4 w-4" /> },
  ]
  
  // Sadece kullanıcı tarafından eklenen aktif motivasyon yazıları
  const kullaniciMotivasyonYazilari = motivasyonYazilari.filter(yazi => yazi.aktif).map(yazi => yazi.icerik)
  const [currentMotivasyonIndex, setCurrentMotivasyonIndex] = useState(0)

  // Scroll pozisyonunu takip etmek için effect eklendi
  useEffect(() => {
    const handleScroll = () => {
      const position = window.scrollY;
      setScrollPosition(position);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Component mount animasyonu için
  useEffect(() => {
    // Daha düzgün bir deneyim için kısa bir gecikme
    const timer = setTimeout(() => {
      setMounted(true)
      // Use the corrected state variable for checking
    }, 100)
    
    return () => clearTimeout(timer)
  }, []) // Dependency updated to the corrected state variable
    // useEffect to decide when to show the BuyMeACoffeePopup
  useEffect(() => {
    if (!mounted) return; // Don't run if the main app isn't mounted yet
    if (dontShowBuyMeACoffeePopupAgain) return; // Never show if user has opted out permanently

    const activityTimer = setTimeout(() => {
      const now = Date.now();
      
      if (buyMeACoffeePopupLastClosedTimestamp) {
        const timeSinceLastClose = now - buyMeACoffeePopupLastClosedTimestamp;
        if (timeSinceLastClose < POPUP_SNOOZE_DURATION_MS) {
          return; // Snooze period is active (3 days)
        }
      }
      // If all checks pass, show the popup
      setShowBuyMeACoffeePopup(true);
    }, USER_ACTIVITY_THRESHOLD_MS);

    return () => clearTimeout(activityTimer);
  }, [mounted, dontShowBuyMeACoffeePopupAgain, buyMeACoffeePopupLastClosedTimestamp]);

  // Motivasyon sözlerini değiştirmek için timer - sadece yazı varsa çalışır
  useEffect(() => {
    if (kullaniciMotivasyonYazilari.length === 0) return
    
    const interval = setInterval(() => {
      setCurrentMotivasyonIndex((prevIndex) => 
        (prevIndex + 1) % kullaniciMotivasyonYazilari.length
      )
    }, 5000) // 5 saniyede bir değişecek (2 saniyeden uzatıldı)
    
    return () => clearInterval(interval)
  }, [kullaniciMotivasyonYazilari.length])

  // Memoize callback functions to prevent unnecessary re-renders
  const gorevEkle = useCallback(
    (yeniGorev: Gorev) => {
      setGorevler((prevGorevler) => [...prevGorevler, yeniGorev])
    },
    [setGorevler],
  )

  const gorevGuncelle = useCallback(
    (guncelGorev: Gorev) => {
      setGorevler((prevGorevler) => prevGorevler.map((gorev) => (gorev.id === guncelGorev.id ? guncelGorev : gorev)))
    },
    [setGorevler],
  )

  const gorevSil = useCallback(
    (gorevId: string) => {
      setGorevler((prevGorevler) => prevGorevler.filter((gorev) => gorev.id !== gorevId))
    },
    [setGorevler],
  )

  const pomodoroKaydet = useCallback(
    (pomodoro: PomodoroIstatistik) => {
      setPomodoroIstatistikleri((prev) => [...prev, pomodoro])
    },
    [setPomodoroIstatistikleri],
  )

  // Yeni: İstatistikleri silme fonksiyonu
  const pomodoroIstatistikSil = useCallback(
    (istatistikIds: string[]) => {
      setPomodoroIstatistikleri((prev) => prev.filter((istatistik) => !istatistikIds.includes(istatistik.id)))
    },
    [setPomodoroIstatistikleri],
  )

  const onemliGunEkle = useCallback(
    (yeniOnemliGun: OnemliGun) => {
      setOnemliGunler((prevOnemliGunler) => [...prevOnemliGunler, yeniOnemliGun])
    },
    [setOnemliGunler],
  )

  const onemliGunGuncelle = useCallback(
    (guncelOnemliGun: OnemliGun) => {
      setOnemliGunler((prevOnemliGunler) =>
        prevOnemliGunler.map((gun) => (gun.id === guncelOnemliGun.id ? guncelOnemliGun : gun)),
      )
    },
    [setOnemliGunler],
  )

  const onemliGunSil = useCallback(
    (onemliGunId: string) => {
      setOnemliGunler((prevOnemliGunler) => prevOnemliGunler.filter((gun) => gun.id !== onemliGunId))
    },
    [setOnemliGunler],
  )

  const notEkle = useCallback(
    (yeniNot: Not) => {
      setNotlar((prevNotlar) => [...prevNotlar, yeniNot])
    },
    [setNotlar],
  )

  const notGuncelle = useCallback(
    (guncelNot: Not) => {
      setNotlar((prevNotlar) => prevNotlar.map((not) => (not.id === guncelNot.id ? guncelNot : not)))
    },
    [setNotlar],
  )

  const notSil = useCallback(
    (notId: string) => {
      setNotlar((prevNotlar) => prevNotlar.filter((not) => not.id !== notId))
    },
    [setNotlar],
  )

  const motivasyonYazisiEkle = useCallback(
    (yeniYazi: MotivasyonYazisi) => {
      setMotivasyonYazilari((prevYazilar) => [...prevYazilar, yeniYazi]);
    },
    [setMotivasyonYazilari]
  );

  const motivasyonYazisiGuncelle = useCallback(
    (guncelYazi: MotivasyonYazisi) => {
      setMotivasyonYazilari((prevYazilar) =>
        prevYazilar.map((yazi) => (yazi.id === guncelYazi.id ? guncelYazi : yazi))
      );
    },
    [setMotivasyonYazilari]
  );

  const motivasyonYazisiSil = useCallback(
    (yaziId: string) => {
      setMotivasyonYazilari((prevYazilar) => prevYazilar.filter((yazi) => yazi.id !== yaziId));
    },
    [setMotivasyonYazilari]
  );

  // Kategori ile ilgili fonksiyonlar
  const kategoriEkle = useCallback(
    (yeniKategori: GorevKategori) => {
      setGorevKategorileri((prevKategoriler) => [...prevKategoriler, yeniKategori])
    },
    [setGorevKategorileri],
  )

  const kategoriGuncelle = useCallback(
    (guncelKategori: GorevKategori) => {
      setGorevKategorileri((prevKategoriler) => 
        prevKategoriler.map((kategori) => (kategori.id === guncelKategori.id ? guncelKategori : kategori))
      )
    },
    [setGorevKategorileri],
  )

  const kategoriSil = useCallback(
    (kategoriId: string) => {
      // Kategori silindiğinde, bu kategorideki tüm görevleri varsayılan kategoriye taşı
      setGorevler((prevGorevler) => 
        prevGorevler.map((gorev) => 
          gorev.kategori === kategoriId ? { ...gorev, kategori: "varsayilan" } : gorev
        )
      )
      
      // Kategoriyi sil
      setGorevKategorileri((prevKategoriler) => 
        prevKategoriler.filter((kategori) => kategori.id !== kategoriId)
      )
    },
    [setGorevKategorileri, setGorevler],
  )

  const handleCloseBuyMeACoffeePopup = () => { 
    setShowBuyMeACoffeePopup(false); 
    // If "don't show again" is NOT checked, set a snooze timestamp
    if (!dontShowBuyMeACoffeePopupAgain) {
      setBuyMeACoffeePopupLastClosedTimestamp(Date.now());
    }
  };

  // Header için opacity hesaplaması (100px'den sonra tam saydamlaşmaya başlasın)
  const headerOpacity = Math.max(1 - scrollPosition / 200, 0.8);
    return (
    <>
      <BuyMeACoffeePopup show={showBuyMeACoffeePopup} onClose={handleCloseBuyMeACoffeePopup} />
      <div className="container mx-auto p-3 md:p-6 space-y-6">
        <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ 
          opacity: headerOpacity,
          zIndex: 50,
          position: "sticky",
          top: 0
        }}
        className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-background/95 to-muted/85 backdrop-blur-md shadow-sm mb-4"
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-md"></div>
              <div className="relative h-12 w-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-md">
                <TrendingUp className="h-6 w-6 text-background" />
              </div>
            </div>
            
            <div className="flex flex-col">
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 text-transparent bg-clip-text">Zaman Yönetimi</h1>
              
              {kullaniciMotivasyonYazilari.length > 0 && (
                <div className="h-5 overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.p 
                      key={currentMotivasyonIndex}
                      className="text-sm italic text-muted-foreground"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.4 }}
                    >
                      {kullaniciMotivasyonYazilari[currentMotivasyonIndex]}
                    </motion.p>
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
          
          {/* Sağ tarafta: Masaüstünde karanlık mod değiştirici, mobilde hamburger menü */}
          <div className="flex items-center justify-end">            {isMobile ? (
              <MobileMenu
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                navItems={navItems}
              />            ) : (
              <motion.div 
                className="p-1.5 bg-background/50 rounded-xl backdrop-blur-sm border border-muted/20"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                transition={{ duration: 0.3 }}
              >
                <ModeToggle />
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      <Tabs 
        defaultValue="takvim" 
        value={activeTab} 
        onValueChange={setActiveTab} 
        className="w-full"
      >
        {/* Sadece masaüstü cihazlarda TabsList gösterilecek */}
        {!isMobile && (
          <TabsList className="w-full p-1 mb-6 rounded-xl bg-muted/20 backdrop-blur-sm">
            {navItems.map((item) => (
              <TabsTrigger 
                key={item.value}
                value={item.value}
                className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-md transition-all"
              >
                {item.icon}
                <span>{item.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        )}

        <div>
          <TabsContent value="takvim" className="space-y-4">
            <TakvimGorunumu
              gorevler={gorevler}
              onemliGunler={onemliGunler}
              onGorevEkle={gorevEkle}
              onGorevGuncelle={gorevGuncelle}
              onOnemliGunEkle={onemliGunEkle}
              onOnemliGunSil={onemliGunSil}
              kategoriler={gorevKategorileri}
              onKategoriEkle={kategoriEkle}
            />
          </TabsContent>

          <TabsContent value="gorevler" className="space-y-4">
            <GorevYonetimi
              gorevler={gorevler}
              onGorevEkle={gorevEkle}
              onGorevGuncelle={gorevGuncelle}
              onGorevSil={gorevSil}
              kategoriler={gorevKategorileri}
              onKategoriEkle={kategoriEkle}
              onKategoriGuncelle={kategoriGuncelle}
              onKategoriSil={kategoriSil}
            />
          </TabsContent>

          <TabsContent value="pomodoro" className="space-y-4">
            <PomodoroZamanlayici
              gorevler={gorevler}
              onPomodoroTamamlandi={pomodoroKaydet}
              istatistikler={pomodoroIstatistikleri}
              onPomodoroIstatistikSil={pomodoroIstatistikSil}
            />
          </TabsContent>

          <TabsContent value="onemliGunler" className="space-y-4">
            <OnemliGunlerYonetimi
              onemliGunler={onemliGunler}
              onOnemliGunEkle={onemliGunEkle}
              onOnemliGunGuncelle={onemliGunGuncelle}
              onOnemliGunSil={onemliGunSil}
            />
          </TabsContent>

          <TabsContent value="notlar" className="space-y-4"> {/* Corrected: Removed self-closing part here */}
            <NotlarYonetimi
              notlar={notlar}
              onNotEkle={notEkle}
              onNotGuncelle={notGuncelle}
              onNotSil={notSil}
            />
          </TabsContent>
          
          <TabsContent value="sayaclar" className="space-y-4"> {/* Corrected: Removed self-closing part here */}
            <CounterManagement />
          </TabsContent>
          
          <TabsContent value="motivasyonYazilari" className="space-y-4">
            <MotivasyonYazilariYonetimi
              motivasyonYazilari={motivasyonYazilari}
              onMotivasyonYazisiEkle={motivasyonYazisiEkle}
              onMotivasyonYazisiGuncelle={motivasyonYazisiGuncelle}
              onMotivasyonYazisiSil={motivasyonYazisiSil}
            />
          </TabsContent>
        </div>      </Tabs>
    </div>
    </>
  )
}
