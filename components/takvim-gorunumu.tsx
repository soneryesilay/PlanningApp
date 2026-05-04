"use client"

import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { tr } from "date-fns/locale"
import { format, isSameDay, differenceInDays, isSameMonth, isBefore, startOfDay, addDays, addMonths, subMonths, setMonth, setYear, getYear, getMonth } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, CalendarClock, Trash2, CalendarDays, CalendarRange, Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Home, Bell } from "lucide-react"
import type { Gorev, OnemliGun, GorevKategori } from "@/lib/types"
import GorevFormu from "@/components/gorev-formu"
import GorevDetay from "@/components/gorev-detay"
import OnemliGunFormu from "@/components/onemli-gun-formu"
import { motion, AnimatePresence } from "framer-motion"
import { useMediaQuery } from "@/hooks/use-mobile"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useProductivity } from "@/hooks/use-productivity"
import ProgressWidget from "./progress-widget"

interface TakvimGorunumuProps {
  gorevler: Gorev[]
  onemliGunler: OnemliGun[]
  onGorevEkle: (gorev: Gorev) => void
  onGorevGuncelle: (gorev: Gorev) => void
  onOnemliGunEkle: (onemliGun: OnemliGun) => void
  onOnemliGunSil: (onemliGunId: string) => void
  kategoriler: GorevKategori[]
  onKategoriEkle?: (kategori: GorevKategori) => void
}

export default function TakvimGorunumu({
  gorevler,
  onemliGunler,
  onGorevEkle,
  onGorevGuncelle,
  onOnemliGunEkle,
  onOnemliGunSil,
  kategoriler,
  onKategoriEkle,
}: TakvimGorunumuProps) {  const [secilenTarih, setSecilenTarih] = useState<Date>(new Date())
  const [takvimAyi, setTakvimAyi] = useState<Date>(new Date()) // Takvimin gösterdiği ay
  const [gorunumTipi, setGorunumTipi] = useState<"günlük" | "haftalık" | "aylık">("günlük")
  const [yeniGorevEkleniyor, setYeniGorevEkleniyor] = useState(false)
  const [yeniOnemliGunEkleniyor, setYeniOnemliGunEkleniyor] = useState(false)
  const [secilenGorev, setSecilenGorev] = useState<Gorev | null>(null)
  const [yaklaşanOnemliGunler, setYaklaşanOnemliGunler] = useState<OnemliGun[]>([])
  const [gorunumGosterilecekGorevler, setGorunumGosterilecekGorevler] = useState<Gorev[]>([])
  const [onemliGunBildirimAcik, setOnemliGunBildirimAcik] = useState(false)
  const [zilCaliniyor, setZilCaliniyor] = useState(false)
  const isMobile = useMediaQuery("(max-width: 768px)")

  // Seçilen tarih değiştiğinde takvim ayını da güncelle
  useEffect(() => {
    setTakvimAyi(secilenTarih)
  }, [secilenTarih])
  // Tüm önemli günleri tarih sırasına göre listele (sadece bugün ve gelecekteki günler)
  useEffect(() => {
    const bugun = new Date()
    bugun.setHours(0, 0, 0, 0) // Bugünün başlangıcına ayarla
    
    const tumOnemliGunler = onemliGunler
      // Önce bugün ve gelecekteki günleri filtrele
      .filter(gun => {
        const gunTarihi = new Date(gun.tarih)
        gunTarihi.setHours(0, 0, 0, 0) // Tarih başlangıcına ayarla
        
        // Bugün veya daha sonraki tarihler (manuel karşılaştırma)
        return gunTarihi.getTime() >= bugun.getTime()
      })
      .sort((a, b) => {
        const tarihA = new Date(a.tarih)
        tarihA.setHours(0, 0, 0, 0)
        const tarihB = new Date(b.tarih)
        tarihB.setHours(0, 0, 0, 0)
        
        // Aynı ayda mı kontrol et
        const aTarihiBuAyda = isSameMonth(tarihA, bugun)
        const bTarihiBuAyda = isSameMonth(tarihB, bugun)
        
        // İlk önce içinde bulunduğumuz aydaki günleri en üste getir
        if (aTarihiBuAyda && !bTarihiBuAyda) return -1
        if (!aTarihiBuAyda && bTarihiBuAyda) return 1
        
        // Aynı aydalarsa veya ikisi de bu ayda değilse tarihe göre sırala
        return tarihA.getTime() - tarihB.getTime()
      })
      // Performans için en fazla 10 adet göster
      .slice(0, 10) 

    setYaklaşanOnemliGunler(tumOnemliGunler)
  }, [onemliGunler])
  
  // Görünüm tipine göre görevleri filtrele
  useEffect(() => {
    // Arşivlenmemiş aktif görevleri al
    const aktifGorevler = gorevler.filter(gorev => !gorev.arsivlendi && gorev.tarih)
    
    switch(gorunumTipi) {
      case "günlük":
        // Seçilen günün görevlerini getir
        const gunlukFiltre = aktifGorevler.filter(gorev => {
          if (!gorev.tarih) return false;
          
          const gorevTarihi = new Date(gorev.tarih);
          gorevTarihi.setHours(0, 0, 0, 0);
          
          const secilenGun = new Date(secilenTarih);
          secilenGun.setHours(0, 0, 0, 0);
          
          return gorevTarihi.getTime() === secilenGun.getTime();
        })
        setGorunumGosterilecekGorevler(gunlukFiltre)
        break
        
      case "haftalık":
        // Seçilen günden başlayarak bir haftalık görevleri getir
        const haftaBaslangic = new Date(secilenTarih);
        haftaBaslangic.setHours(0, 0, 0, 0);
        
        const haftaBitis = new Date(haftaBaslangic);
        haftaBitis.setDate(haftaBaslangic.getDate() + 7);
        
        const haftalikFiltre = aktifGorevler.filter(gorev => {
          if (!gorev.tarih) return false;
          
          const gorevTarih = new Date(gorev.tarih);
          gorevTarih.setHours(0, 0, 0, 0);
          
          return (gorevTarih.getTime() >= haftaBaslangic.getTime() && 
                 gorevTarih.getTime() < haftaBitis.getTime());
        })
        
        setGorunumGosterilecekGorevler(haftalikFiltre)
        break
        
      case "aylık":
        // Seçilen ayın tüm görevlerini getir
        const aylikFiltre = aktifGorevler.filter(gorev => {
          if (!gorev.tarih) return false;
          
          const gorevTarih = new Date(gorev.tarih);
          return isSameMonth(gorevTarih, secilenTarih);
        })
        
        setGorunumGosterilecekGorevler(aylikFiltre)
        break
    }
  }, [gorunumTipi, secilenTarih, gorevler])

  const gunlukGorevler = gorevler.filter((gorev) => {
    if (!gorev.tarih || gorev.arsivlendi) return false;
    
    const gorevTarihi = new Date(gorev.tarih);
    gorevTarihi.setHours(0, 0, 0, 0);
    
    const secilenGun = new Date(secilenTarih);
    secilenGun.setHours(0, 0, 0, 0);
    
    return gorevTarihi.getTime() === secilenGun.getTime();
  })
    const gunlukOnemliGunler = onemliGunler.filter((gun) => {
    if (!gun.tarih || gun.arsivlendi) return false;
    
    const gunTarihi = new Date(gun.tarih);
    gunTarihi.setHours(0, 0, 0, 0);
    
    const secilenGun = new Date(secilenTarih);
    secilenGun.setHours(0, 0, 0, 0);
    
    return gunTarihi.getTime() === secilenGun.getTime();
  })

  const gorevRenkKodu = (oncelik: string) => {
    switch (oncelik) {
      case "yüksek":
        return "bg-red-500"
      case "orta":
        return "bg-yellow-500"
      case "düşük":
        return "bg-green-500"
      default:
        return "bg-blue-500"
    }
  }
  const gorevDurumRengi = (gorev: Gorev) => {
    // Geçmiş tarihli görevlerin renkli kenarını kaldır
    if (gorev.tarih) {
      const gorevTarihi = new Date(gorev.tarih);
      gorevTarihi.setHours(0, 0, 0, 0); // Görev tarihinin başlangıcı
      const bugun = new Date();
      bugun.setHours(0, 0, 0, 0); // Bugünün başlangıcı
      
      // Görev dünde veya daha önceki bir günde kalmışsa renk gösterme
      if (gorevTarihi.getTime() < bugun.getTime()) {
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
      }
    }
    
    switch (gorev.durum) {
      case "Yapılacak":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
      case "Devam Ediyor":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300"
      case "Tamamlandı":
        return "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }
  const onemliGunRengi = (onemliGun: OnemliGun) => {
    // Geçmiş tarihli önemli günlerin renkli kenarını kaldır
    if (onemliGun.tarih) {
      const gunTarihi = new Date(onemliGun.tarih);
      gunTarihi.setHours(0, 0, 0, 0); // Önemli gün tarihinin başlangıcı
      const bugun = new Date();
      bugun.setHours(0, 0, 0, 0); // Bugünün başlangıcı
      
      // Önemli gün dünde veya daha önceki bir günde kalmışsa gri renk kullan
      if (gunTarihi.getTime() < bugun.getTime()) {
        return "bg-gray-100 hover:bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
      }
    }
    
    switch (onemliGun.renk) {
      case "kirmizi":
        return "bg-red-100 hover:bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300"
      case "yesil":
        return "bg-green-100 hover:bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
      case "mavi":
        return "bg-blue-100 hover:bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
      case "mor":
        return "bg-purple-100 hover:bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300"
      case "turuncu":
        return "bg-orange-100 hover:bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300"
      default:
        return "bg-gray-100 hover:bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
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

  const handleYeniGorevEkle = (gorev: Gorev) => {
    // Görev tarihinin kontrolü form içinde yapılıyor
    // Tarihi olduğu gibi kullan, secilenTarih'i override etme
    onGorevEkle(gorev)
    setYeniGorevEkleniyor(false)
  }
  const handleYeniOnemliGunEkle = (onemliGun: OnemliGun) => {
    // Önemli gün tarihinin kontrolü form içinde yapılıyor
    // Tarihi olduğu gibi kullan, secilenTarih'i override etme
    onOnemliGunEkle(onemliGun)
    setYeniOnemliGunEkleniyor(false)
  }

  const handleGorevGuncelle = (gorev: Gorev) => {
    onGorevGuncelle(gorev)
    setSecilenGorev(null)
  }  // Takvimde önemli günleri ve görevleri farklı renklerde işaretlemek için
  const onemliGunTarihleri = onemliGunler
    .filter((gun) => {
      if (gun.arsivlendi) return false; // Arşivlenen önemli günleri filtreleme
      if (!gun.tarih) return false; // Tarihi olmayanları filtrele
      const gunTarihi = startOfDay(new Date(gun.tarih));
      const today = startOfDay(new Date());
      return gunTarihi.getTime() >= today.getTime(); // Sadece bugün ve gelecekteki önemli günleri dahil et
    })
    .map((gun) => new Date(gun.tarih))
  const gorevTarihleri = gorevler
    .filter((gorev) => gorev.tarih !== undefined && !gorev.arsivlendi)
    .map((gorev) => new Date(gorev.tarih as string))

  // Farklı modifiers tanımlıyoruz
  const takvimModifiers = {
    onemliGun: onemliGunTarihleri,
    gorev: gorevTarihleri.filter(tarih => 
      !onemliGunTarihleri.some(onemliTarih => isSameDay(onemliTarih, tarih))
    ),
    // Hem görev hem önemli gün olan tarihler için
    karisikGun: gorevTarihleri.filter(tarih => 
      onemliGunTarihleri.some(onemliTarih => isSameDay(onemliTarih, tarih))
    ),
    // Bugünü belirtmek için 
    bugun: [new Date()]
  }

  // Her görünüm tipi için ikon seçimi
  const gorunumIkonu = (tip: string) => {
    switch (tip) {
      case "günlük":
        return <CalendarIcon className="h-4 w-4 mr-1" />
      case "haftalık":
        return <CalendarRange className="h-4 w-4 mr-1" />
      case "aylık":
        return <CalendarDays className="h-4 w-4 mr-1" />
      default:
        return null
    }
  }

  // Ay ve yıl seçimi için özel navigasyon bileşenleri
  const CustomCaption = ({ displayMonth, onMonthChange }: { displayMonth: Date, onMonthChange: (date: Date) => void }) => {
    return (
      <div className="flex justify-center items-center relative w-full">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="text-sm font-medium px-2">
              {format(displayMonth, "MMMM yyyy", { locale: tr })}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2 flex gap-2">
            <Select
              value={getMonth(displayMonth).toString()}
              onValueChange={(value) => {
                const yeniTarih = setMonth(displayMonth, parseInt(value))
                setSecilenTarih(yeniTarih)
                onMonthChange(yeniTarih)
                setTakvimAyi(yeniTarih)
              }}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Ay" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }).map((_, index) => (
                  <SelectItem key={index} value={index.toString()}>
                    {format(setMonth(new Date(), index), "MMMM", { locale: tr })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={getYear(displayMonth).toString()}
              onValueChange={(value) => {
                const yeniTarih = setYear(displayMonth, parseInt(value))
                setSecilenTarih(yeniTarih)
                onMonthChange(yeniTarih)
                setTakvimAyi(yeniTarih)
              }}
            >
              <SelectTrigger className="w-24">
                <SelectValue placeholder="Yıl" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 10 }).map((_, index) => {
                  const yil = getYear(new Date()) - 5 + index
                  return (
                    <SelectItem key={index} value={yil.toString()}>
                      {yil}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </PopoverContent>
        </Popover>
      </div>
    );
  };
  
  // Yıl bazında hızlı geçiş için özel butonlar
  const CustomNavigation = ({
    onPreviousClick,
    onNextClick,
    onMonthChange,
  }: {
    onPreviousClick: () => void;
    onNextClick: () => void;
    onMonthChange: (date: Date) => void;
  }) => {
    return (
      <div className="flex justify-between items-center w-full absolute top-0 px-1">
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => {
              const yeniTarih = subMonths(takvimAyi, 12)
              setSecilenTarih(yeniTarih)
              onMonthChange(yeniTarih)
              setTakvimAyi(yeniTarih)
            }}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={onPreviousClick}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={onNextClick}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => {
              const yeniTarih = addMonths(takvimAyi, 12)
              setSecilenTarih(yeniTarih)
              onMonthChange(yeniTarih)
              setTakvimAyi(yeniTarih)
            }}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div 
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <span className="inline-block p-1 rounded-md bg-primary/10">
              <CalendarDays className="h-5 w-5 text-primary" />
            </span>
            Takvim
          </h2>
          <p className="text-muted-foreground text-sm">
            {format(secilenTarih, "d MMMM yyyy", { locale: tr })}
          </p>
        </div>

        <div className="flex items-center gap-2">          {/* Önemli Günler Bildirim Butonu */}
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-9 w-9 p-0 rounded-full relative group notification-bell-container"
                onClick={() => {
                  setZilCaliniyor(true);
                  setTimeout(() => setZilCaliniyor(false), 1000); // 1 saniye sonra animasyonu durdur
                }}              >
                <Bell className={`h-4 w-4 ${zilCaliniyor ? 'bell-animation' : ''}`} style={{transformOrigin: 'top center'}} />
                {yaklaşanOnemliGunler.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-[10px] rounded-full flex items-center justify-center text-primary-foreground">
                    {yaklaşanOnemliGunler.length}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className="w-80 p-0 overflow-hidden"
              sideOffset={5}
            >
              <div className="flex justify-between items-center p-3 border-b">
                <h4 className="font-medium flex items-center gap-1.5 text-sm">
                  <CalendarClock className="h-4 w-4 text-primary" />
                  Yaklaşan Önemli Günler
                </h4>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setYeniOnemliGunEkleniyor(true)}
                  className="h-7 rounded-full px-2 hover:bg-primary/10"
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
              
              <AnimatePresence mode="wait">
                {yaklaşanOnemliGunler.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-center py-6 text-sm text-muted-foreground p-2"
                  >
                    <p>Yaklaşan önemli gün bulunmuyor.</p>
                    <div className="mt-3">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setYeniOnemliGunEkleniyor(true)}
                        className="gap-1 border-dashed text-xs py-1 h-7"
                      >
                        <Plus className="h-3 w-3" /> Önemli Gün Ekle
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="overflow-auto" style={{ maxHeight: '250px' }}>
                    <ScrollArea className="h-auto" type="scroll">
                      <div className="p-2 pr-4">
                        <div className="space-y-2">
                          <AnimatePresence initial={false}>
                            {yaklaşanOnemliGunler.map((gun) => (
                              <motion.div
                                key={gun.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.96 }}
                                whileHover={{ scale: 1.01 }}
                                className="flex items-center justify-between text-sm p-2.5 border rounded-md dark:border-gray-800 hover:shadow-sm transition-all duration-200 mx-auto"
                              >
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`w-2 h-2 rounded-full ${
                                      gun.renk === "kirmizi"
                                        ? "bg-red-500 dark:bg-red-400"
                                        : gun.renk === "yesil"
                                          ? "bg-green-500 dark:bg-green-400"
                                          : gun.renk === "mavi"
                                            ? "bg-blue-500 dark:bg-blue-400"
                                            : gun.renk === "mor"
                                              ? "bg-purple-500 dark:bg-purple-400"
                                              : gun.renk === "turuncu"
                                                ? "bg-orange-500 dark:bg-orange-400"
                                                : "bg-gray-500 dark:bg-gray-400"
                                    }`}
                                  />
                                  <span className="font-medium truncate max-w-[150px]">{gun.baslik}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Badge className={`${onemliGunRengi(gun)} text-base`}>
                                    {getKalanGun(gun.tarih)}
                                  </Badge>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 rounded-full hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Önemli Günü Sil</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Bu önemli günü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>İptal</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => onOnemliGunSil(gun.id)}>Sil</AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </div>
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </AnimatePresence>
            </PopoverContent>
          </Popover>

          <div className="flex gap-2 bg-muted/20 p-1 rounded-lg">
            <Button
              variant={gorunumTipi === "günlük" ? "default" : "ghost"}
              onClick={() => setGorunumTipi("günlük")}
              size="sm"
              className="flex items-center gap-1"
            >
              {gorunumIkonu("günlük")}
              <span className={isMobile ? "sr-only" : ""}>Günlük</span>
            </Button>
            <Button
              variant={gorunumTipi === "haftalık" ? "default" : "ghost"}
              onClick={() => setGorunumTipi("haftalık")}
              size="sm"
              className="flex items-center gap-1"
            >
              {gorunumIkonu("haftalık")}
              <span className={isMobile ? "sr-only" : ""}>Haftalık</span>
            </Button>
            <Button
              variant={gorunumTipi === "aylık" ? "default" : "ghost"}
              onClick={() => setGorunumTipi("aylık")}
              size="sm"
              className="flex items-center gap-1"
            >
              {gorunumIkonu("aylık")}
              <span className={isMobile ? "sr-only" : ""}>Aylık</span>
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Masaüstünde grid, mobilde flex-col yapısı */}
      <div className={isMobile ? "flex flex-col space-y-4" : "grid grid-cols-1 md:grid-cols-3 gap-4"}>
        <motion.div 
          className={isMobile ? "" : "md:col-span-1"}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}        >          <Card style={{ height: "445px" }}>
            <CardHeader className="pb-2 border-b">
              <CardTitle className="text-lg flex items-center justify-between">
                <span>Tarih</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSecilenTarih(new Date())}
                  className="h-6 gap-1 flex items-center"
                >
                  <Home className="h-4.0 w-4.0 mr-1" />
                  <span className="text-base">Bu Gün</span>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 flex justify-center items-center">              <Calendar
                mode="single"
                selected={secilenTarih}
                onSelect={(date) => date && setSecilenTarih(date)}
                onDateDoubleClick={(date) => {
                  setSecilenTarih(date);
                  setYeniGorevEkleniyor(true);
                }}
                locale={tr}
                month={takvimAyi}
                onMonthChange={setTakvimAyi}                className="rounded-md mx-auto w-full sm:w-auto"
                modifiers={takvimModifiers}
                modifiersStyles={{
                  onemliGun: {
                    fontWeight: "bold",
                    border: "2px solid var(--onemli-gun-border)",
                    color: "var(--takvim-text-color)",
                    borderRadius: "50%",
                  },
                  gorev: {
                    fontWeight: "bold",
                    border: "2px solid var(--gorev-border)",
                    color: "var(--takvim-text-color)",
                    borderRadius: "50%",
                  },
                  karisikGun: {
                    fontWeight: "bold",
                    border: "2px solid var(--karisik-gun-border)",
                    color: "var(--takvim-text-color)",
                    borderRadius: "50%",
                  },
                  bugun: {
                    fontWeight: "bold",
                    border: "3px solid hsl(var(--foreground))",
                    boxShadow: "0 0 10px hsla(var(--foreground) / 0.5)",
                    backgroundColor: "hsla(var(--foreground) / 0.08)",
                    borderRadius: "100%",
                    transform: "scale(1.03)",
                    position: "relative",
                    zIndex: 5
                  },
                  selected: {
                    color: "var(--takvim-text-color)",
                    backgroundColor: "var(--background)",
                  }
                }}                classNames={{
                  day_selected: "hover:bg-background hover:text-foreground focus:bg-background focus:text-foreground",
                }}
                components={{                  Caption: ({ displayMonth, ...props }) => (
                    <div className="flex items-center justify-between py-2 px-1 relative">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 absolute left-0"
                        onClick={() => {
                          const yeniTarih = subMonths(displayMonth, 1)
                          setSecilenTarih(yeniTarih)
                          // TypeScript hatası düzeltildi: onMonthChange özelliğini tipine göre kontrol et
                          const onMonthChangeFn = (props as any).onMonthChange;
                          if (typeof onMonthChangeFn === 'function') {
                            onMonthChangeFn(yeniTarih)
                          }
                        }}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button 
                            variant="ghost" 
                            className="mx-auto text-sm font-medium px-4 hover:bg-muted/60"
                          >
                            {format(displayMonth, "MMMM yyyy", { locale: tr })}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-2 flex gap-2">
                          <Select
                            value={getMonth(displayMonth).toString()}                            onValueChange={(value) => {
                              const yeniTarih = setMonth(displayMonth, parseInt(value))
                              setSecilenTarih(yeniTarih)
                              // TypeScript hatası düzeltildi: onMonthChange özelliğini tipine göre kontrol et
                              const onMonthChangeFn = (props as any).onMonthChange;
                              if (typeof onMonthChangeFn === 'function') {
                                onMonthChangeFn(yeniTarih)
                              }
                            }}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue placeholder="Ay" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 12 }).map((_, index) => (
                                <SelectItem key={index} value={index.toString()}>
                                  {format(setMonth(new Date(), index), "MMMM", { locale: tr })}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Select
                            value={getYear(displayMonth).toString()}                            onValueChange={(value) => {
                              const yeniTarih = setYear(displayMonth, parseInt(value))
                              setSecilenTarih(yeniTarih)
                              // TypeScript hatası düzeltildi: onMonthChange özelliğini tipine göre kontrol et
                              const onMonthChangeFn = (props as any).onMonthChange;
                              if (typeof onMonthChangeFn === 'function') {
                                onMonthChangeFn(yeniTarih)
                              }
                            }}
                          >
                            <SelectTrigger className="w-24">
                              <SelectValue placeholder="Yıl" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 10 }).map((_, index) => {
                                const yil = getYear(new Date()) - 5 + index
                                return (
                                  <SelectItem key={index} value={yil.toString()}>
                                    {yil}
                                  </SelectItem>
                                )
                              })}
                            </SelectContent>
                          </Select>
                        </PopoverContent>
                      </Popover>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 absolute right-0"                        onClick={() => {
                          const yeniTarih = addMonths(displayMonth, 1)
                          setSecilenTarih(yeniTarih)
                          // TypeScript hatası düzeltildi: onMonthChange özelliğini tipine göre kontrol et
                          const onMonthChangeFn = (props as any).onMonthChange;
                          if (typeof onMonthChangeFn === 'function') {
                            onMonthChangeFn(yeniTarih)
                          }
                        }}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>                  )
                  // Nav bileşeni hata verdiği için kaldırıldı - Caption içinde navigasyon kullanılıyor
                }}
              />
            </CardContent>
          </Card>
        </motion.div>        <motion.div 
          className={isMobile ? "" : "md:col-span-2"}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card style={{ height: "440px" }}>
            <CardHeader className="pb-2 border-b">
              <div className="flex justify-between items-center">                <CardTitle className="text-lg">
                  {gorunumTipi === "günlük"
                    ? `${format(secilenTarih, "d MMMM", { locale: tr })} Planı`
                    : gorunumTipi === "haftalık"
                      ? `${format(secilenTarih, "d MMMM", { locale: tr })} - ${format(addDays(secilenTarih, 6), "d MMMM", { locale: tr })} Planı`
                      : `${format(secilenTarih, "MMMM yyyy", { locale: tr })} Planı`}
                </CardTitle>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setYeniOnemliGunEkleniyor(true)}
                    className="h-8 gap-1 border-dashed"
                  >
                    <CalendarClock className="h-3.5 w-3.5" /> 
                    <span className={isMobile ? "sr-only" : ""}>Önemli Gün</span>
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => setYeniGorevEkleniyor(true)}
                    className="h-8 gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" /> 
                    <span className={isMobile ? "sr-only" : ""}>Görev</span>
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4" style={{ height: "calc(100% - 60px)", overflow: "hidden" }}>
              <ScrollArea className="h-full" type="scroll">
                <div className="space-y-5 pr-4">
                  {/* Önemli Günler */}
                  <AnimatePresence mode="sync">
                    {gunlukOnemliGunler.length > 0 && (
                      <motion.div 
                        className="space-y-3"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        layout
                      >
                        <h4 className="text-sm font-medium flex items-center gap-1 border-b pb-1 mb-2">
                          <CalendarClock className="h-3.5 w-3.5 text-primary" />
                          Önemli Günler
                        </h4>
                        <div className="space-y-2">
                          {gunlukOnemliGunler.map((gun) => (
                            <motion.div
                              key={gun.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              whileHover={{ scale: 1.01 }}
                              transition={{ duration: 0.2 }}
                              layout
                              className="flex items-center justify-between p-3 border rounded-lg dark:border-gray-800 hover:shadow-sm transition-all duration-200"
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-2 h-full min-h-[24px] rounded-full ${
                                    gun.renk === "kirmizi"
                                      ? "bg-red-500 dark:bg-red-400"
                                      : gun.renk === "yesil"
                                        ? "bg-green-500 dark:bg-green-400"
                                        : gun.renk === "mavi"
                                          ? "bg-blue-500 dark:bg-blue-400"
                                          : gun.renk === "mor"
                                            ? "bg-purple-500 dark:bg-purple-400"
                                            : gun.renk === "turuncu"
                                              ? "bg-orange-500 dark:bg-orange-400"
                                              : "bg-gray-500 dark:bg-gray-400"
                                  }`}
                                />
                                <div>
                                  <div className="font-medium">{gun.baslik}</div>
                                  {gun.aciklama && <div className="text-sm text-muted-foreground">{gun.aciklama}</div>}
                                </div>
                              </div>
                              <Badge className={`${onemliGunRengi(gun)} text-base`}>{getKalanGun(gun.tarih)}</Badge>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Görevler */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-3"
                    layout
                  >
                    <h4 className="text-sm font-medium flex items-center gap-1 border-b pb-1 mb-2">
                      <CalendarIcon className="h-3.5 w-3.5 text-primary" />
                      {gorunumTipi === "günlük" ? "Günlük Görevler" : 
                       gorunumTipi === "haftalık" ? "Haftalık Görevler" :
                       "Aylık Görevler"}
                    </h4>
                    <AnimatePresence mode="sync">
                      {gorunumGosterilecekGorevler.length === 0 ? (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          layout
                          className="text-center py-10 text-muted-foreground"
                        >
                          {gorunumTipi === "günlük" ? 
                            "Bu gün için planlanmış görev bulunmuyor." :
                            gorunumTipi === "haftalık" ?
                            "Bu hafta için planlanmış görev bulunmuyor." :
                            "Bu ay için planlanmış görev bulunmuyor."
                          }
                          <div className="mt-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => setYeniGorevEkleniyor(true)}
                              className="gap-1 border-dashed"
                            >
                              <Plus className="h-3.5 w-3.5" /> Görev Ekle
                            </Button>
                          </div>
                        </motion.div>
                      ) : (
                        <div className="space-y-2">
                          {gorunumGosterilecekGorevler.map((gorev) => (
                            <motion.div
                              key={gorev.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              whileHover={{ scale: 1.01, x: 2 }}
                              layout
                              className="flex items-center p-3 border rounded-lg cursor-pointer hover:shadow-sm transition-all duration-200"
                              onClick={() => setSecilenGorev(gorev)}
                            >
                              <div className={`w-2 h-full min-h-[24px] rounded-full mr-3 ${gorevRenkKodu(gorev.oncelik)}`} />
                              <div className="flex-1">
                                <div className="font-medium">{gorev.baslik}</div>
                                {gorunumTipi !== "günlük" && gorev.tarih && (
                                  <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                    <CalendarIcon className="h-3 w-3" />
                                    {format(new Date(gorev.tarih), "d MMMM yyyy", { locale: tr })}
                                  </div>
                                )}
                                <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                  <Clock className="h-3 w-3" />
                                  {gorev.baslangicSaati && gorev.bitisSaati
                                    ? `${gorev.baslangicSaati} - ${gorev.bitisSaati}`
                                    : "Tüm gün"}
                                </div>
                                {gorev.aciklama && (
                                  <div className="mt-1.5 text-sm text-muted-foreground line-clamp-1">
                                    {gorev.aciklama}
                                  </div>
                                )}
                              </div>
                              <Badge className={gorevDurumRengi(gorev)}>{gorev.durum}</Badge>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Modal ve Formlar */}
      <AnimatePresence>
        {yeniGorevEkleniyor && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <GorevFormu
              onKaydet={handleYeniGorevEkle}
              onIptal={() => setYeniGorevEkleniyor(false)}
              baslangicTarihi={secilenTarih}
              kategoriler={kategoriler}
              onKategoriEkle={onKategoriEkle}
            />
          </motion.div>
        )}        {yeniOnemliGunEkleniyor && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <OnemliGunFormu 
              onKaydet={handleYeniOnemliGunEkle} 
              onIptal={() => setYeniOnemliGunEkleniyor(false)} 
              baslangicTarihi={secilenTarih}
            />
          </motion.div>
        )}

        {secilenGorev && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <GorevDetay gorev={secilenGorev} onKapat={() => setSecilenGorev(null)} onGuncelle={handleGorevGuncelle} kategoriler={kategoriler} onKategoriEkle={onKategoriEkle} />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* İlerleme Widgeti - Productivity Tracking */}
      <div className="w-full h-10 overflow-hidden">
        <ProgressWidgetContainer gorevler={gorevler} />
      </div>
    </motion.div>
  )
}

// Yardımcı bileşen - ProgressWidget için gerekli hooklarla birlikte
function ProgressWidgetContainer({ gorevler }: { gorevler: Gorev[] }) {
  const { tamamlananGorevSayisi, toplamGorevSayisi, gunlukHedef, level, streakGunSayisi, enUzunStreakGunSayisi } = useProductivity(gorevler)
  
  return (
    <ProgressWidget 
      tamamlananGorevSayisi={tamamlananGorevSayisi}
      toplamGorevSayisi={toplamGorevSayisi}
      gunlukHedef={gunlukHedef}
      level={level}
      streakGunSayisi={streakGunSayisi}
      enUzunStreakGunSayisi={enUzunStreakGunSayisi}
    />
  )
}
