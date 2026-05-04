"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { LayoutGroup } from "framer-motion"
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Tag, 
  Paperclip, 
  ExternalLink, 
  Image as ImageIcon, 
  File, 
  Eye, 
  RefreshCw,
  Trash,
  ArchiveRestore,
  StickyNote,
  Filter
} from "lucide-react"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import NotFormu from "@/components/not-formu"
import NotGoruntulemeFormu from "@/components/not-goruntuleme-formu"
import type { Not } from "@/lib/types"
import { motion, AnimatePresence } from "framer-motion"
import { useMediaQuery } from "@/hooks/use-mobile"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface NotlarYonetimiProps {
  notlar: Not[]
  onNotEkle: (not: Not) => void
  onNotGuncelle: (not: Not) => void
  onNotSil: (notId: string) => void
}

export default function NotlarYonetimi({
  notlar,
  onNotEkle,
  onNotGuncelle,
  onNotSil,
}: NotlarYonetimiProps) {
  const [aramaMetni, setAramaMetni] = useState("")
  const [seciliEtiket, setSeciliEtiket] = useState<string | null>(null)
  const [formAcik, setFormAcik] = useState(false)
  const [duzenlenecekNot, setDuzenlenecekNot] = useState<Not | undefined>()
  const [gorunumModu, setGorunumModu] = useState<"kart" | "liste" | "copKutusu">("kart")
  const [detayGoruntulenenNot, setDetayGoruntulenenNot] = useState<Not | null>(null)
  const [silinenNotlar, setSilinenNotlar] = useState<Not[]>([])
  const [copKutusuAcik, setCopKutusuAcik] = useState(false)
  const [isTagMenuOpen, setIsTagMenuOpen] = useState(false)
  const [etiketler, setEtiketler] = useState<string[]>([])
  const [aramaTipi, setAramaTipi] = useState<"metin" | "etiket">("metin")
  const isMobile = useMediaQuery("(max-width: 768px)")

  // Mobil cihazlarda otomatik olarak liste görünümünü kullan
  useEffect(() => {
    if (isMobile && gorunumModu === "kart") {
      setGorunumModu("liste");
    }
  }, [isMobile]);

  // Tüm etiketleri çıkart
  useEffect(() => {
    const tumEtiketler = Array.from(
      new Set(
        notlar
          .flatMap((not) => not.etiketler || [])
          .filter(Boolean)
      )
    );
    setEtiketler(tumEtiketler);
  }, [notlar]);

  // Filtreleme fonksiyonu
  const filtreleNotlar = () => {
    if (gorunumModu === "copKutusu") {
      return silinenNotlar.filter((not) => {
        const arananMetinUyuyor =
          aramaMetni === "" ||
          not.baslik.toLowerCase().includes(aramaMetni.toLowerCase()) ||
          not.icerik.toLowerCase().includes(aramaMetni.toLowerCase()) ||
          (not.etiketler && not.etiketler.some(etiket => etiket.toLowerCase().includes(aramaMetni.toLowerCase())))
        
        return arananMetinUyuyor
      })
    }
    
    return notlar.filter((not) => {
      const arananMetinUyuyor =
        aramaMetni === "" ||
        not.baslik.toLowerCase().includes(aramaMetni.toLowerCase()) ||
        not.icerik.toLowerCase().includes(aramaMetni.toLowerCase()) ||
        (not.etiketler && not.etiketler.some(etiket => etiket.toLowerCase().includes(aramaMetni.toLowerCase())))

      const etiketUyuyor = 
        seciliEtiket === null || 
        (not.etiketler && not.etiketler.includes(seciliEtiket))

      return arananMetinUyuyor && etiketUyuyor
    })
  }

  const filtrelenmisNotlar = filtreleNotlar()

  const notEkleTamamla = (not: Not) => {
    if (duzenlenecekNot) {
      onNotGuncelle(not)
    } else {
      onNotEkle(not)
    }
    setFormAcik(false)
    setDuzenlenecekNot(undefined)
  }

  const notFormunuKapat = () => {
    setFormAcik(false)
    setDuzenlenecekNot(undefined)
  }

  const notDuzenle = (not: Not) => {
    setDuzenlenecekNot(not)
    setFormAcik(true)
  }

  const notDetayiniGoster = (not: Not) => {
    setDetayGoruntulenenNot(not)
  }

  const notDetayiniKapat = () => {
    setDetayGoruntulenenNot(null)
  }

  // Not içeriğini kısaltma fonksiyonu
  const kisaltIcerik = (icerik: string, limit = 100) => {
    // Eğer içerik yoksa boş string döndür
    if (!icerik) return ""
    
    // İçeriği belirli bir uzunlukta kes
    if (icerik.length <= limit) return icerik
    return icerik.substring(0, limit) + "..."
  }
  
  // Not silme işlemi - çöp kutusuna taşı
  const notuCopKutusunaTasi = (notId: string) => {
    const silinecekNot = notlar.find(not => not.id === notId)
    if (silinecekNot) {
      setSilinenNotlar([...silinenNotlar, silinecekNot])
      onNotSil(notId)
    }
  }
  
  // Notu geri getir
  const notuGeriGetir = (not: Not) => {
    onNotEkle(not)
    setSilinenNotlar(silinenNotlar.filter(n => n.id !== not.id))
  }
  
  // Notu kalıcı olarak sil
  const notuKaliciSil = (notId: string) => {
    setSilinenNotlar(silinenNotlar.filter(not => not.id !== notId))
  }
  
  // Çöp kutusunu boşalt
  const copKutusunuBosalt = () => {
    setSilinenNotlar([])
  }

  // Etiket rengini belirle - stabil ve tekrar eden renkler için
  const getEtiketRengi = (etiket: string) => {
    // Basit bir hash fonksiyonu
    const hash = etiket
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // Renk paleti
    const renkler = [
      "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
      "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
      "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
      "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
      "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
      "bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300",
      "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300",
      "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300"
    ];
    
    // Hash'e göre renk seç
    return renkler[hash % renkler.length];
  };  // Kart animasyon çeşitleri - Sadece opacity ile yumuşak geçiş
  const cardVariants = {
    hidden: { opacity: 0 },
    visible: (i: number) => ({
      opacity: 1,
      transition: {
        delay: i * 0.02,
        duration: 0.25,
        ease: "easeInOut"
      }
    }),
    removed: { 
      opacity: 0, 
      transition: { 
        duration: 0.2, 
        ease: "easeOut" 
      } 
    }
  };

  return (
    <div className="space-y-6">
      <motion.div 
        className="flex items-center gap-2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <span className="inline-block p-1 rounded-md bg-primary/10">
            <StickyNote className="h-5 w-5 text-primary" />
          </span>
          Notlar
        </h2>
        <Badge variant="outline" className="ml-auto">
          {notlar.length} not
        </Badge>
      </motion.div>

      <motion.div 
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <div className="flex-1 w-full relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Notlarda ara..."
            value={aramaMetni}
            onChange={(e) => setAramaMetni(e.target.value)}
            className="pl-10 pr-10"
          />
          {gorunumModu !== "copKutusu" && (
            <DropdownMenu open={isTagMenuOpen} onOpenChange={setIsTagMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
                >
                  <Filter className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {etiketler.length > 0 ? (
                  etiketler.map(etiket => (
                    <DropdownMenuItem 
                      key={etiket}
                      onClick={() => {
                        setSeciliEtiket(etiket === seciliEtiket ? null : etiket);
                        setIsTagMenuOpen(false);
                      }}
                      className={`flex items-center gap-2 ${seciliEtiket === etiket ? 'bg-muted' : ''}`}
                    >
                      <Badge variant="secondary" className={getEtiketRengi(etiket)}>
                        <Tag className="h-3 w-3 mr-1" />
                        {etiket}
                      </Badge>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem disabled>Etiket bulunamadı</DropdownMenuItem>
                )}
                {seciliEtiket && (
                  <DropdownMenuItem
                    onClick={() => {
                      setSeciliEtiket(null);
                      setIsTagMenuOpen(false);
                    }}
                    className="border-t mt-2 pt-2 text-primary font-medium"
                  >
                    Filtre Temizle
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2 items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: 0.3 }}
          >
            <Tabs value={gorunumModu} onValueChange={(value) => setGorunumModu(value as "kart" | "liste" | "copKutusu")} className="hidden md:block">
              <TabsList className="bg-muted/50 p-0.5 backdrop-blur-sm">
                {!isMobile && <TabsTrigger value="kart" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Kart Görünümü</TabsTrigger>}
                <TabsTrigger value="liste" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Liste Görünümü</TabsTrigger>
                <TabsTrigger value="copKutusu" className="flex items-center gap-1 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  <Trash className="h-4 w-4" />
                  <span>Çöp Kutusu {silinenNotlar.length > 0 && <Badge variant="secondary" className="ml-1">{silinenNotlar.length}</Badge>}</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </motion.div>            <AnimatePresence mode="wait" initial={false}>
            {gorunumModu !== "copKutusu" ? (
            <motion.div
              key="yeniNot"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ 
                duration: 0.2,
                ease: "easeInOut"
              }}
              whileHover={{ 
                scale: 1.05,
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.95 }}
            >
              <Button onClick={() => setFormAcik(true)} className="shadow-sm">
                <Plus className="h-4 w-4 mr-1" />
                Yeni Not
              </Button>
            </motion.div>
            ) : silinenNotlar.length > 0 && (
            <motion.div
              key="copKutusu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ 
                duration: 0.3, 
                ease: "easeInOut"
              }}
              whileHover={{ 
                scale: 1.05,
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.95 }}
            >
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-1" />
                    Çöp Kutusunu Boşalt
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Çöp kutusunu boşaltmak istiyor musunuz?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Bu işlem çöp kutusundaki tüm notları kalıcı olarak silecektir. Bu işlem geri alınamaz.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>İptal</AlertDialogCancel>
                    <AlertDialogAction onClick={copKutusunuBosalt}>
                      Çöp Kutusunu Boşalt
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Mobil Ekran için Görünüm Seçenekleri */}
      <div className="md:hidden">
        <Tabs value={gorunumModu} onValueChange={(value) => setGorunumModu(value as "kart" | "liste" | "copKutusu")}>
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="liste" className="flex items-center justify-center gap-1">
              <File className="h-4 w-4" />
              <span>Liste</span>
            </TabsTrigger>
            <TabsTrigger value="copKutusu" className="flex items-center justify-center gap-1">
              <Trash className="h-4 w-4" />
              <Badge variant="secondary">{silinenNotlar.length}</Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Etiket listesi - Mobil için etiketler dropdown yapıldı */}
      {gorunumModu !== "copKutusu" && etiketler.length > 0 && !isMobile && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-2 p-1">
              <Button
                variant={seciliEtiket === null ? "default" : "outline"}
                size="sm"
                className={seciliEtiket === null ? "shadow-sm" : ""}
                onClick={() => setSeciliEtiket(null)}
              >
                Tümü
              </Button>
              {etiketler.map((etiket) => (
                <Button
                  key={etiket}
                  variant={seciliEtiket === etiket ? "default" : "outline"}
                  size="sm"
                  className={`${seciliEtiket === etiket ? "shadow-sm" : ""} ${getEtiketRengi(etiket).includes('dark:bg') ? '' : getEtiketRengi(etiket)}`}
                  onClick={() => setSeciliEtiket(etiket === seciliEtiket ? null : etiket)}
                >
                  <Tag className="h-3.5 w-3.5 mr-1" />
                  {etiket}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </motion.div>
      )}
      {/* Seçilmiş etiket göstergesi */}
      {seciliEtiket !== null && gorunumModu !== "copKutusu" && (
        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground">Filtre:</div>
          <Badge variant="secondary" className={getEtiketRengi(seciliEtiket)}>
            <Tag className="h-3 w-3 mr-1" />
            {seciliEtiket}
          </Badge>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0 rounded-full hover:bg-muted/50"
            onClick={() => setSeciliEtiket(null)}
          >
            <Trash className="h-3 w-3" />
          </Button>
        </div>
      )}
      {/* Tüm görünüm modları için tek AnimatePresence kullanarak daha akıcı geçiş sağlıyoruz */}
      <AnimatePresence mode="wait" initial={true}>
        {gorunumModu === "copKutusu" && (
          <motion.div
            key="copKutusu"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
          >
            <div className="space-y-2">
              {filtrelenmisNotlar.length === 0 ? (
                <Card className="flex flex-col items-center justify-center p-12 text-center bg-muted/10">
                  <div className="text-muted-foreground">
                    <Trash className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p className="mb-2">Çöp kutusu boş</p>
                  </div>
                </Card>
              ) : (
                <div className="space-y-2">
                  {filtrelenmisNotlar.map((not) => (
                    <Card key={not.id} className="overflow-hidden hover:shadow-md transition-shadow duration-300">
                      <div className="p-4 flex justify-between items-start">
                        <div 
                          className="flex-grow cursor-pointer"
                          onClick={() => notDetayiniGoster(not)}
                        >
                          <h3 className="font-medium">{not.baslik}</h3>
                          <div className="text-sm text-muted-foreground mb-2">
                            {format(new Date(not.tarih), "d MMMM yyyy", { locale: tr })}
                          </div>
                          <p className="text-sm break-words whitespace-pre-line" style={{ 
                            overflowWrap: "break-word", 
                            lineHeight: "1.5" 
                          }}>
                            {kisaltIcerik(not.icerik, 150)}
                          </p>
                          
                          <div className="flex flex-wrap gap-3 mt-3 items-center">
                            {not.etiketler && not.etiketler.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {not.etiketler.map((etiket) => (
                                  <Badge 
                                    key={etiket} 
                                    variant="outline" 
                                    className={`text-xs ${getEtiketRengi(etiket)}`}
                                  >
                                    {etiket}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            
                            {not.ekler && not.ekler.length > 0 && (
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Paperclip className="h-3.5 w-3.5" />
                                <span>{not.ekler.length} ek</span>
                                
                                {not.ekler.slice(0, 3).map((ek, idx) => (
                                  <a
                                    key={idx}
                                    href={ek.url}
                                    target="_blank"
                                    rel="noopener noreferrer" 
                                    className="inline-flex items-center"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {ek.tip === "resim" && (
                                      ek.imageData ? (
                                        <div className="w-6 h-6 rounded overflow-hidden">
                                          <img src={ek.imageData} alt={ek.aciklama || "Resim"} className="w-full h-full object-cover" />
                                        </div>
                                      ) : (
                                        <div className="w-6 h-6 rounded overflow-hidden">
                                          <img 
                                            src={ek.url} 
                                            alt={ek.aciklama || "Resim"} 
                                            className="w-full h-full object-cover" 
                                            onError={(e) => {
                                              (e.target as HTMLImageElement).style.display = 'none';
                                              (e.target as HTMLImageElement).parentElement!.innerHTML = `<span class="h-3.5 w-3.5 text-blue-500 flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg></span>`;
                                            }}
                                          />
                                        </div>
                                      )
                                    )}
                                    {ek.tip === "link" && <ExternalLink className="h-3.5 w-3.5 text-green-500" />}
                                    {ek.tip === "youtube" && (
                                      <svg 
                                        className="h-3.5 w-3.5 text-red-500"
                                        viewBox="0 0 24 24" 
                                        fill="currentColor"
                                      >
                                        <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                                      </svg>
                                    )}
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => notDetayiniGoster(not)}
                            className="h-8 w-8 rounded-full"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => notuGeriGetir(not)}
                            className="h-8 w-8 rounded-full text-green-600"
                          >
                            <ArchiveRestore className="h-3.5 w-3.5" />
                          </Button>                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 rounded-full text-red-600"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Notu kalıcı olarak silmek istiyor musunuz?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Bu işlem notu kalıcı olarak silecektir ve geri alınamaz.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>İptal</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => notuKaliciSil(not.id)}
                                >
                                  Kalıcı Sil
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
        {gorunumModu === "kart" && (
          <motion.div
            key="kart"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" key={`kart-items-wrapper-${seciliEtiket || 'all'}`}>
              {filtrelenmisNotlar.map((not) => (
                <motion.div
                  key={not.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.3,
                    delay: 0.1 + (filtrelenmisNotlar.indexOf(not) * 0.05)
                  }}
                  whileHover={{ 
                    scale: 1.03, 
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
                    transition: { duration: 0.2 }
                  }}
                >
                  <Card
                    className="overflow-hidden flex flex-col h-full shadow-sm transition-all duration-300 border-t-4"
                    style={{ borderTopColor: `var(--${not.etiketler && not.etiketler.length > 0 ? getEtiketRengi(not.etiketler[0]).includes('blue') ? 'blue' : getEtiketRengi(not.etiketler[0]).includes('green') ? 'green' : getEtiketRengi(not.etiketler[0]).includes('amber') ? 'amber' : getEtiketRengi(not.etiketler[0]).includes('red') ? 'red' : getEtiketRengi(not.etiketler[0]).includes('purple') ? 'purple' : getEtiketRengi(not.etiketler[0]).includes('pink') ? 'pink' : 'primary' : 'muted'})` }}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg line-clamp-2">{not.baslik}</CardTitle>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(not.tarih), "d MMMM yyyy", { locale: tr })}
                      </div>
                    </CardHeader>
                    <CardContent 
                      className="pb-4 flex-grow cursor-pointer"
                      onClick={() => notDetayiniGoster(not)}
                    >
                      <p className="text-sm break-words whitespace-pre-line line-clamp-4" style={{ 
                        overflowWrap: "break-word", 
                        lineHeight: "1.5" 
                      }}>
                        {not.icerik}
                      </p>
                      
                      <div className="flex flex-wrap gap-3 mt-3 items-center">
                        {not.etiketler && not.etiketler.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {not.etiketler.map((etiket) => (
                              <Badge 
                                key={etiket} 
                                variant="outline" 
                                className={`text-xs ${getEtiketRengi(etiket)}`}
                              >
                                {etiket}
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        {not.ekler && not.ekler.length > 0 && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Paperclip className="h-3.5 w-3.5" />
                            <span>{not.ekler.length} ek</span>
                            
                            {not.ekler.slice(0, 3).map((ek, idx) => (
                              <a
                                key={idx}
                                href={ek.url}
                                target="_blank"
                                rel="noopener noreferrer" 
                                className="inline-flex items-center"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {ek.tip === "resim" && (
                                  ek.imageData ? (
                                    <div className="w-6 h-6 rounded overflow-hidden">
                                      <img src={ek.imageData} alt={ek.aciklama || "Resim"} className="w-full h-full object-cover" />
                                    </div>
                                  ) : (
                                    <div className="w-6 h-6 rounded overflow-hidden">
                                      <img 
                                        src={ek.url} 
                                        alt={ek.aciklama || "Resim"} 
                                        className="w-full h-full object-cover" 
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).style.display = 'none';
                                          (e.target as HTMLImageElement).parentElement!.innerHTML = `<span class="h-3.5 w-3.5 text-blue-500 flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg></span>`;
                                        }}
                                      />
                                    </div>
                                  )
                                )}
                                {ek.tip === "link" && <ExternalLink className="h-3.5 w-3.5 text-green-500" />}
                                {ek.tip === "youtube" && (
                                  <svg 
                                    className="h-3.5 w-3.5 text-red-500"
                                    viewBox="0 0 24 24" 
                                    fill="currentColor"
                                  >
                                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                                  </svg>
                                )}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="pt-1 border-t flex justify-end gap-1 py-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => notDetayiniGoster(not)}
                        className="h-7 w-7 rounded-full"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => notDuzenle(not)}
                        className="h-7 w-7 rounded-full"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => notuCopKutusunaTasi(not.id)}
                        className="h-7 w-7 rounded-full text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
        {gorunumModu === "liste" && (
          <motion.div
            key="liste"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
          >
            <div className="space-y-2" key={`liste-items-wrapper-${seciliEtiket || 'all'}`}>
              {filtrelenmisNotlar.map((not) => (
                <motion.div
                  key={not.id}
                  whileHover={{ 
                    scale: 1.01, 
                    translateY: -2,
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
                    transition: { duration: 0.2 }
                  }}
                >
                  <Card
                    className="overflow-hidden transition-all duration-300"
                    style={{ borderLeft: `3px solid var(--${not.etiketler && not.etiketler.length > 0 ? getEtiketRengi(not.etiketler[0]).includes('blue') ? 'blue' : getEtiketRengi(not.etiketler[0]).includes('green') ? 'green' : getEtiketRengi(not.etiketler[0]).includes('amber') ? 'amber' : getEtiketRengi(not.etiketler[0]).includes('red') ? 'red' : getEtiketRengi(not.etiketler[0]).includes('purple') ? 'purple' : getEtiketRengi(not.etiketler[0]).includes('pink') ? 'pink' : 'primary' : 'muted'})` }}
                  >
                    <div className="p-4 flex justify-between items-start">
                      <div 
                        className="flex-grow cursor-pointer"
                        onClick={() => notDetayiniGoster(not)}
                      >
                        <h3 className="font-medium">{not.baslik}</h3>
                        <div className="text-sm text-muted-foreground mb-2">
                          {format(new Date(not.tarih), "d MMMM yyyy", { locale: tr })}
                        </div>
                        <p className="text-sm break-words whitespace-pre-line" style={{ 
                          overflowWrap: "break-word", 
                          lineHeight: "1.5" 
                        }}>
                          {kisaltIcerik(not.icerik, 150)}
                        </p>
                        
                        <div className="flex flex-wrap gap-3 mt-3 items-center">
                          {not.etiketler && not.etiketler.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {not.etiketler.map((etiket) => (
                                <Badge 
                                  key={etiket} 
                                  variant="outline" 
                                  className={`text-xs ${getEtiketRengi(etiket)}`}
                                >
                                  {etiket}
                                </Badge>
                              ))}
                            </div>
                          )}
                          
                          {not.ekler && not.ekler.length > 0 && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Paperclip className="h-3.5 w-3.5" />
                              <span>{not.ekler.length} ek</span>
                              
                              {not.ekler.slice(0, 3).map((ek, idx) => (
                                <a
                                  key={idx}
                                  href={ek.url}
                                  target="_blank"
                                  rel="noopener noreferrer" 
                                  className="inline-flex items-center"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {ek.tip === "resim" && (
                                    ek.imageData ? (
                                      <div className="w-6 h-6 rounded overflow-hidden">
                                        <img src={ek.imageData} alt={ek.aciklama || "Resim"} className="w-full h-full object-cover" />
                                      </div>
                                    ) : (
                                      <div className="w-6 h-6 rounded overflow-hidden">
                                        <img 
                                          src={ek.url} 
                                          alt={ek.aciklama || "Resim"} 
                                          className="w-full h-full object-cover" 
                                          onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                            (e.target as HTMLImageElement).parentElement!.innerHTML = `<span class="h-3.5 w-3.5 text-blue-500 flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg></span>`;
                                          }}
                                        />
                                      </div>
                                    )
                                  )}
                                  {ek.tip === "link" && <ExternalLink className="h-3.5 w-3.5 text-green-500" />}
                                  {ek.tip === "youtube" && (
                                    <svg 
                                      className="h-3.5 w-3.5 text-red-500"
                                      viewBox="0 0 24 24" 
                                      fill="currentColor"
                                    >
                                      <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                                    </svg>
                                  )}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => notDetayiniGoster(not)}
                          className="h-8 w-8 rounded-full"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => notDuzenle(not)}
                          className="h-8 w-8 rounded-full"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => notuCopKutusunaTasi(not.id)}
                          className="h-8 w-8 rounded-full text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {formAcik && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <NotFormu
            not={duzenlenecekNot}
            onKaydet={notEkleTamamla}
            onIptal={notFormunuKapat}
          />
        </motion.div>
      )}

      {detayGoruntulenenNot && (
        <NotGoruntulemeFormu
          detayGoruntulenenNot={detayGoruntulenenNot}
          gorunumModu={gorunumModu}
          onNotDetayiniKapat={notDetayiniKapat}
          onGetEtiketRengi={getEtiketRengi}
          onNotuGeriGetir={notuGeriGetir}
          onNotuKaliciSil={notuKaliciSil}
          onNotDuzenle={notDuzenle}
          onNotuCopKutusunaTasi={notuCopKutusunaTasi}
        />
      )}
    </div>
  )
}