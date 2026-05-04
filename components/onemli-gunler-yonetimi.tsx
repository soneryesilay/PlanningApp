"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  Edit, 
  Trash2, 
  Calendar, 
  Gift, 
  CalendarDays,
  Calendar as CalendarIcon,
  CakeSlice,
  Heart,
  Award,
  PartyPopper,
  AlertCircle,
  Sparkles
} from "lucide-react"
import { format, differenceInDays, isSameMonth, isBefore, isAfter, addDays } from "date-fns"
import { tr } from "date-fns/locale"
import type { OnemliGun } from "@/lib/types"
import OnemliGunFormu from "@/components/onemli-gun-formu"
import { motion, AnimatePresence } from "framer-motion"
import { useMediaQuery } from "@/hooks/use-mobile"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface OnemliGunlerYonetimiProps {
  onemliGunler: OnemliGun[]
  onOnemliGunEkle: (onemliGun: OnemliGun) => void
  onOnemliGunGuncelle: (onemliGun: OnemliGun) => void
  onOnemliGunSil: (onemliGunId: string) => void
}

export default function OnemliGunlerYonetimi({
  onemliGunler,
  onOnemliGunEkle,
  onOnemliGunGuncelle,
  onOnemliGunSil,
}: OnemliGunlerYonetimiProps) {
  const [yeniOnemliGunEkleniyor, setYeniOnemliGunEkleniyor] = useState(false)
  const [duzenlenecekOnemliGun, setDuzenlenecekOnemliGun] = useState<OnemliGun | null>(null)
  const [filtrelemeTipi, setFiltrelemeTipi] = useState<"tumu" | "yaklasan" | "gecmis">("tumu")
  const [detayGoruntulenenOnemliGun, setDetayGoruntulenenOnemliGun] = useState<OnemliGun | null>(null)
  const [silmeDialogAcik, setSilmeDialogAcik] = useState(false)
  const [silinecekOnemliGunId, setSilinecekOnemliGunId] = useState<string | null>(null)
  
  const isMobile = useMediaQuery("(max-width: 768px)")

  // Otomatik arşivleme kontrolü - geçmiş önemli günler için
  useEffect(() => {
    const bugun = new Date();
    bugun.setHours(0, 0, 0, 0); // Bugünün başlangıcı (saat 00:00)
    
    // Zamanı geçmiş önemli günleri bul ve arşivle (arşivlenmemiş olanları)
    const zamaniGecmisOnemliGunler = onemliGunler.filter(gun => {
      // Arşivlenmemiş ve tarihi olan önemli günleri kontrol et
      if (!gun.arsivlendi && gun.tarih) {
        const gunTarihi = new Date(gun.tarih);
        gunTarihi.setHours(23, 59, 59, 999); // Günün sonu (saat 23:59:59)
        return gunTarihi < bugun; // Önemli gün tarihi bugünden önceyse (günü geçti)
      }
      return false;
    });
    
    // Tespit edilen önemli günleri arşivle
    zamaniGecmisOnemliGunler.forEach(gun => {
      if (!gun.arsivlendi) {
        onOnemliGunGuncelle({
          ...gun,
          arsivlendi: true,
          arsivlenmeTarihi: new Date().toISOString()
        });
      }
    });
  }, [onemliGunler, onOnemliGunGuncelle]);

  // Otomatik silme kontrolü - 7 günden eski arşivlenmiş önemli günler için
  useEffect(() => {
    const yediGunOnce = new Date();
    yediGunOnce.setDate(yediGunOnce.getDate() - 7);
    yediGunOnce.setHours(0, 0, 0, 0);

    const silinecekOnemliGunler = onemliGunler.filter(gun => {
      return gun.arsivlendi && gun.arsivlenmeTarihi && new Date(gun.arsivlenmeTarihi) < yediGunOnce;
    });

    if (silinecekOnemliGunler.length > 0) {
      silinecekOnemliGunler.forEach(gun => {
        onOnemliGunSil(gun.id);
      });
    }
  }, [onemliGunler, onOnemliGunSil]);
  
  // İkon seçimini otomatikleştir
  const getIkon = (onemliGun: OnemliGun) => {
    const baslik = onemliGun.baslik.toLowerCase();
    if (baslik.includes("doğum")) return <CakeSlice className="h-5 w-5" />;
    if (baslik.includes("evlilik") || baslik.includes("yıldönümü") || baslik.includes("yıl dönümü")) return <Heart className="h-5 w-5" />;
    if (baslik.includes("mezuniyet") || baslik.includes("başarı")) return <Award className="h-5 w-5" />;
    if (baslik.includes("parti") || baslik.includes("kutlama")) return <PartyPopper className="h-5 w-5" />;
    if (baslik.includes("son")) return <AlertCircle className="h-5 w-5" />;
    if (baslik.includes("tatil")) return <CalendarDays className="h-5 w-5" />;
    if (baslik.includes("hediye") || baslik.includes("armağan")) return <Gift className="h-5 w-5" />;
    return <CalendarIcon className="h-5 w-5" />;
  };

  const handleYeniOnemliGunEkle = (onemliGun: OnemliGun) => {
    onOnemliGunEkle(onemliGun)
    setYeniOnemliGunEkleniyor(false)
  }

  const handleOnemliGunGuncelle = (onemliGun: OnemliGun) => {
    onOnemliGunGuncelle(onemliGun)
    setDuzenlenecekOnemliGun(null)
  }

  const getKalanGun = (tarih: string) => {
    const bugun = new Date()
    bugun.setHours(0, 0, 0, 0) // Bugünün başlangıcına ayarla
    const hedefTarih = new Date(tarih)
    hedefTarih.setHours(0, 0, 0, 0) // Hedef tarihin başlangıcına ayarla
    
    // Milisaniye cinsinden farkı hesapla ve gün sayısına çevir
    const farkMs = hedefTarih.getTime() - bugun.getTime()
    const gunFarki = Math.floor(farkMs / (1000 * 60 * 60 * 24))

    if (gunFarki < 0) {
      return `${Math.abs(gunFarki)} gün önce`
    } else if (gunFarki === 0) {
      return "Bugün"
    } else if (gunFarki === 1) {
      return "Yarın"
    } else {
      return `${gunFarki} gün kaldı`
    }
  }
  
  // Yaklaşan tarih için stil
  const getKalanGunStili = (tarih: string) => {
    const bugun = new Date()
    bugun.setHours(0, 0, 0, 0) // Bugünün başlangıcına ayarla
    const hedefTarih = new Date(tarih)
    hedefTarih.setHours(0, 0, 0, 0) // Hedef tarihin başlangıcına ayarla
    
    // Milisaniye cinsinden farkı hesapla ve gün sayısına çevir
    const farkMs = hedefTarih.getTime() - bugun.getTime()
    const gunFarki = Math.floor(farkMs / (1000 * 60 * 60 * 24))
    
    if (gunFarki < 0) return "text-gray-600 dark:text-gray-400"; // Geçmiş
    if (gunFarki === 0) return "text-green-600 dark:text-green-400 font-bold"; // Bugün
    if (gunFarki <= 7) return "text-amber-600 dark:text-amber-400 font-bold"; // Yaklaşan (bir hafta)
    if (gunFarki <= 30) return "text-blue-600 dark:text-blue-400"; // Yakında (bir ay)
    return "text-gray-600 dark:text-gray-400"; // Uzak tarih
  }

  const getRenkStili = (onemliGun: OnemliGun) => {
    // Geçmiş tarihli önemli günlerin renkli kenarını kaldır
    if (onemliGun.tarih) {
      const gunTarihi = new Date(onemliGun.tarih);
      gunTarihi.setHours(0, 0, 0, 0); // Önemli gün tarihinin başlangıcı
      const bugun = new Date();
      bugun.setHours(0, 0, 0, 0); // Bugünün başlangıcı
      
      // Önemli gün dünde veya daha önceki bir günde kalmışsa gri renk kullan
      if (gunTarihi.getTime() < bugun.getTime()) {
        return "bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300";
      }
    }
    
    switch (onemliGun.renk) {
      case "kirmizi":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
      case "yesil":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
      case "mavi":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
      case "mor":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
      case "turuncu":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300"
    }
  }
  
  // İkon arkaplanı için renk
  const getIkonRenkStili = (onemliGun: OnemliGun) => {
    // Geçmiş tarihli önemli günlerin ikon rengini gri yap
    if (onemliGun.tarih) {
      const gunTarihi = new Date(onemliGun.tarih);
      gunTarihi.setHours(0, 0, 0, 0); // Önemli gün tarihinin başlangıcı
      const bugun = new Date();
      bugun.setHours(0, 0, 0, 0); // Bugünün başlangıcı
      
      // Önemli gün dünde veya daha önceki bir günde kalmışsa gri renk kullan
      if (gunTarihi.getTime() < bugun.getTime()) {
        return "bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-300";
      }
    }
    
    switch (onemliGun.renk) {
      case "kirmizi":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
      case "yesil":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
      case "mavi":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
      case "mor":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
      case "turuncu":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-300"
    }
  }

  // Günleri filtrele
  const filtrelenmisOnemliGunler = onemliGunler.filter(gun => {
    // Önce arşivlenmiş olanları filtrele - yalnızca geçmiş görünümünde göster
    if (gun.arsivlendi && filtrelemeTipi !== "gecmis") return false;
    
    const bugun = new Date();
    bugun.setHours(0, 0, 0, 0); // Bugünün başlangıcına ayarla
    const gunTarihi = new Date(gun.tarih);
    gunTarihi.setHours(0, 0, 0, 0); // Hedef tarihin başlangıcına ayarla
    
    // Milisaniye cinsinden farkı hesapla
    const farkMs = gunTarihi.getTime() - bugun.getTime();
    const gunFarki = Math.floor(farkMs / (1000 * 60 * 60 * 24));
    
    if (filtrelemeTipi === "tumu") return true;
    if (filtrelemeTipi === "yaklasan") return gunFarki >= 0; // Bugün ve sonrası
    if (filtrelemeTipi === "gecmis") return gunFarki < 0; // Önceki günler
    return true;
  });

  // Aya göre ve tarih sırasına göre sıralama
  const siraliOnemliGunler = [...filtrelenmisOnemliGunler].sort((a, b) => {
    const bugun = new Date()
    bugun.setHours(0, 0, 0, 0) // Bugünün başlangıcına ayarla
    const tarihA = new Date(a.tarih)
    tarihA.setHours(0, 0, 0, 0) // Tarih A'nın başlangıcına ayarla
    const tarihB = new Date(b.tarih)
    tarihB.setHours(0, 0, 0, 0) // Tarih B'nin başlangıcına ayarla
    
    if (filtrelemeTipi === "gecmis") {
      // Geçmiş günler için - en yeniden en eskiye
      return tarihB.getTime() - tarihA.getTime();
    } 
    
    // Yaklaşan günler için - en yakın tarihten uzağa
    const farkMsA = tarihA.getTime() - bugun.getTime();
    const farkMsB = tarihB.getTime() - bugun.getTime();
    const kalanGunA = Math.floor(farkMsA / (1000 * 60 * 60 * 24));
    const kalanGunB = Math.floor(farkMsB / (1000 * 60 * 60 * 24));
    
    // Önce bugünkü olaylar
    if (kalanGunA === 0 && kalanGunB !== 0) return -1;
    if (kalanGunA !== 0 && kalanGunB === 0) return 1;
    
    // Geçmiş ve gelecek olayları ayrı değerlendir
    const aGecmis = kalanGunA < 0;
    const bGecmis = kalanGunB < 0;
    
    if (!aGecmis && bGecmis) return -1;  // Gelecek olaylar önce
    if (aGecmis && !bGecmis) return 1;   // Geçmiş olaylar sonra
    
    if (aGecmis && bGecmis) {
      // İkisi de geçmiş - en yakın geçmişi üstte göster
      return Math.abs(kalanGunA) - Math.abs(kalanGunB);
    } else {
      // İkisi de gelecek - en yakın geleceği üstte göster
      return kalanGunA - kalanGunB;
    }
  })

  // Silme işlemi
  const handleOnemliGunSil = () => {
    if (silinecekOnemliGunId) {
      onOnemliGunSil(silinecekOnemliGunId);
      setSilmeDialogAcik(false);
      setSilinecekOnemliGunId(null);
    }
  };

  // Önemli günü görüntüleme
  const handleOnemliGunGoruntule = (onemliGun: OnemliGun) => {
    setDetayGoruntulenenOnemliGun(onemliGun);
  };

  // Kart animasyon varyantları
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (index: number) => ({ 
      opacity: 1, 
      y: 0,
      transition: { 
        delay: index * 0.1,
        duration: 0.3,
        ease: "easeOut" 
      }
    }),
    removed: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } }
  };

  return (
    <div className="space-y-6">
      <motion.div 
        className="flex items-center gap-2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <span className="inline-block p-1 rounded-md bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </span>
          Önemli Günler
        </h2>
        <Badge variant="outline" className="ml-auto">
          {onemliGunler.length} önemli gün
        </Badge>
      </motion.div>

      <motion.div 
        className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Tabs 
          value={filtrelemeTipi} 
          onValueChange={(v) => setFiltrelemeTipi(v as "tumu" | "yaklasan" | "gecmis")}
          className="w-full md:w-auto"
        >
          <TabsList className="grid w-full md:w-auto grid-cols-3">
            <TabsTrigger value="tumu" className="text-xs md:text-sm">
              Tümü ({onemliGunler.filter(g => !g.arsivlendi).length})
            </TabsTrigger>
            <TabsTrigger value="yaklasan" className="text-xs md:text-sm">
              Yaklaşan ({onemliGunler.filter(g => {
                // Arşivlenmiş günleri yaklaşan sayısına dahil etme
                if (g.arsivlendi) return false;
                
                const bugun = new Date();
                bugun.setHours(0, 0, 0, 0);
                const gunTarihi = new Date(g.tarih);
                gunTarihi.setHours(0, 0, 0, 0);
                const farkMs = gunTarihi.getTime() - bugun.getTime();
                const gunFarki = Math.floor(farkMs / (1000 * 60 * 60 * 24));
                return gunFarki >= 0;
              }).length})
            </TabsTrigger>
            <TabsTrigger value="gecmis" className="text-xs md:text-sm">
              Geçmiş ({onemliGunler.filter(g => {
                const bugun = new Date();
                bugun.setHours(0, 0, 0, 0);
                const gunTarihi = new Date(g.tarih);
                gunTarihi.setHours(0, 0, 0, 0);
                const farkMs = gunTarihi.getTime() - bugun.getTime();
                const gunFarki = Math.floor(farkMs / (1000 * 60 * 60 * 24));
                return gunFarki < 0; // Geçmiş filtrelemede arşiv durumunu dikkate almıyoruz, tümünü gösteriyoruz
              }).length})
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <AnimatePresence>
          {filtrelemeTipi !== "gecmis" && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                onClick={() => setYeniOnemliGunEkleniyor(true)}
                className="shadow-sm"
              >
                <Plus className="h-4 w-4 mr-1" /> Yeni Önemli Gün
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="min-h-[200px]">
        <AnimatePresence mode="wait">
          {siraliOnemliGunler.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center py-12 px-4 bg-muted/20 rounded-lg"
            >
              <div className="flex flex-col items-center justify-center text-muted-foreground">
                <CalendarDays className="h-12 w-12 mb-3 opacity-40" />
                <p className="text-lg mb-4">
                  {filtrelemeTipi === "gecmis"
                    ? "Geçmiş önemli gün bulunmuyor."
                    : "Henüz önemli gün eklenmemiş."}
                </p>
                {filtrelemeTipi === "gecmis" && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Geçmiş önemli günler 7 gün sonra otomatik olarak silinir.
                  </p>
                )}
                {filtrelemeTipi !== "gecmis" && (
                  <Button 
                    onClick={() => setYeniOnemliGunEkleniyor(true)}
                    variant="outline"
                    className="mt-4"
                  >
                    <Plus className="h-4 w-4 mr-2" /> İlk Önemli Günü Ekle
                  </Button>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              className="space-y-3"
              key="list"
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0 }}
            >
              <AnimatePresence>
                {siraliOnemliGunler.map((onemliGun, index) => {
                  const kalanGunBilgisi = getKalanGun(onemliGun.tarih);
                  const bugun = new Date();
                  bugun.setHours(0, 0, 0, 0); // Bugünün başlangıcına ayarla
                  const gunTarihi = new Date(onemliGun.tarih);
                  gunTarihi.setHours(0, 0, 0, 0); // Hedef tarihin başlangıcına ayarla
                  
                  // Milisaniye cinsinden farkı hesapla ve gün sayısına çevir
                  const farkMs = gunTarihi.getTime() - bugun.getTime();
                  const kalanGun = Math.floor(farkMs / (1000 * 60 * 60 * 24));
                  const gecmis = kalanGun < 0;
                  
                  return (
                    <motion.div
                      key={onemliGun.id}
                      custom={index}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      exit="removed"
                      layout
                    >
                      <Card 
                        className={`hover:shadow-md transition-all duration-300 ${
                          kalanGun === 0 ? "border-green-400 dark:border-green-800" : 
                          kalanGun > 0 && kalanGun <= 7 ? "border-amber-300 dark:border-amber-800" : ""
                        }`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div 
                              className="flex items-center gap-3 flex-1 cursor-pointer"
                              onClick={() => handleOnemliGunGoruntule(onemliGun)}
                            >
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center ${getIkonRenkStili(onemliGun)}`}
                              >
                                {getIkon(onemliGun)}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-lg truncate">{onemliGun.baslik}</div>
                                <div className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {format(new Date(onemliGun.tarih), "d MMMM yyyy", { locale: tr })}
                                  <span className={`ml-2 ${getKalanGunStili(onemliGun.tarih)}`}>
                                    • {kalanGunBilgisi}
                                  </span>
                                </div>
                                {onemliGun.aciklama && (
                                  <div className="text-sm mt-1 text-muted-foreground line-clamp-1">
                                    {onemliGun.aciklama}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-col items-end gap-2">
                              <Badge className={getRenkStili(onemliGun)}>
                                {gecmis ? "Geçmiş" : kalanGun === 0 ? "Bugün" : "Yaklaşan"}
                              </Badge>
                              
                              <div className="flex gap-1">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={() => setDuzenlenecekOnemliGun(onemliGun)}
                                        className="h-8 w-8 rounded-full"
                                      >
                                        <Edit className="h-3.5 w-3.5" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Düzenle</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>

                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button 
                                        variant="ghost" 
                                        size="icon"
                                        className="h-8 w-8 rounded-full text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20"
                                        onClick={() => {
                                          setSilinecekOnemliGunId(onemliGun.id);
                                          setSilmeDialogAcik(true);
                                        }}
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Sil</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {yeniOnemliGunEkleniyor && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <OnemliGunFormu onKaydet={handleYeniOnemliGunEkle} onIptal={() => setYeniOnemliGunEkleniyor(false)} />
          </motion.div>
        )}

        {duzenlenecekOnemliGun && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <OnemliGunFormu
              onemliGun={duzenlenecekOnemliGun}
              onKaydet={handleOnemliGunGuncelle}
              onIptal={() => setDuzenlenecekOnemliGun(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Önemli Gün Detay Diyaloğu */}
      <Dialog open={!!detayGoruntulenenOnemliGun} onOpenChange={(open) => {
        if (!open) setDetayGoruntulenenOnemliGun(null);
      }}>
        <DialogContent className="sm:max-w-md">
          {detayGoruntulenenOnemliGun && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getIkonRenkStili(detayGoruntulenenOnemliGun)}`}>
                    {getIkon(detayGoruntulenenOnemliGun)}
                  </div>
                  <span>{detayGoruntulenenOnemliGun.baslik}</span>
                </DialogTitle>
                <DialogDescription>
                  <span className="flex items-center mt-2">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{format(new Date(detayGoruntulenenOnemliGun.tarih), "d MMMM yyyy, EEEE", { locale: tr })}</span>
                  </span>
                  <Badge 
                    className={`${getRenkStili(detayGoruntulenenOnemliGun)} w-fit mt-3`}
                  >
                    {getKalanGun(detayGoruntulenenOnemliGun.tarih)}
                  </Badge>
                </DialogDescription>
              </DialogHeader>
              
              {detayGoruntulenenOnemliGun.aciklama && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-1">Açıklama</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {detayGoruntulenenOnemliGun.aciklama}
                  </p>
                </div>
              )}
              
              <DialogFooter className="mt-4 gap-2">
                <Button
                  variant="outline"
                  onClick={() => setDetayGoruntulenenOnemliGun(null)}
                >
                  Kapat
                </Button>
                <Button
                  onClick={() => {
                    setDetayGoruntulenenOnemliGun(null);
                    setDuzenlenecekOnemliGun(detayGoruntulenenOnemliGun);
                  }}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Düzenle
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Silme Onay Diyaloğu */}
      <Dialog open={silmeDialogAcik} onOpenChange={setSilmeDialogAcik}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Önemli Günü Sil</DialogTitle>
            <DialogDescription>
              Bu önemli günü silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 mt-4">
            <Button variant="outline" onClick={() => setSilmeDialogAcik(false)}>
              Vazgeç
            </Button>
            <Button variant="destructive" onClick={handleOnemliGunSil}>
              <Trash2 className="h-4 w-4 mr-1" />
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
