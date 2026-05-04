"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  Check, 
  Clock, 
  AlertTriangle, 
  Trash2, 
  Eye, 
  ArrowRight, 
  CalendarCheck2,
  FolderPlus,
  Folder,
  ChevronUp,
  ChevronDown,
  Archive,
  ArchiveRestore,
  FileArchive,
  CalendarDays, // Eklendi
  ListChecks // Eklendi
} from "lucide-react"
import type { Gorev, GorevKategori } from "@/lib/types"
import GorevFormu from "@/components/gorev-formu"
import GorevDetay from "@/components/gorev-detay"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  useDroppable,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { motion, AnimatePresence } from "framer-motion"
import { useMediaQuery } from "@/hooks/use-mobile"
import { useLocalStorage } from "@/hooks/use-local-storage"; // Eklendi
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "./ui/dropdown-menu"
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent 
} from "./ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"

interface GorevYonetimiProps {
  gorevler: Gorev[]
  onGorevEkle: (gorev: Gorev) => void
  onGorevGuncelle: (gorev: Gorev) => void
  onGorevSil: (gorevId: string) => void
  kategoriler: GorevKategori[]
  onKategoriEkle: (kategori: GorevKategori) => void
  onKategoriGuncelle: (kategori: GorevKategori) => void
  onKategoriSil: (kategoriId: string) => void
}

// Sürüklenebilir görev kartı bileşeni
function SuruklenebilirGorevKarti({
  gorev,
  onDuzenle,
  onSil,
  kategori,
  onGorevGuncelle
}: {
  gorev: Gorev
  onDuzenle: (gorev: Gorev) => void
  onSil: (gorevId: string) => void
  kategori: GorevKategori
  onGorevGuncelle?: (gorev: Gorev) => void
}) {
  const isMobile = useMediaQuery("(max-width: 768px)")
  // Butonlara tıklandığında sürükleme işlemini engellemek için kullanılacak
  const [isSuruklenebilir, setIsSuruklenebilir] = useState(!isMobile) // Mobilde varsayılan olarak sürüklemeyi devre dışı bırak
  
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: gorev.id,
    data: {
      type: "gorev",
      gorev,
    },
    disabled: !isSuruklenebilir || isMobile, // Mobilde veya butonlara tıklandığında sürüklemeyi devre dışı bırakır
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition, // Geçiş animasyonunu etkin tut
    opacity: isDragging ? 0.3 : 1, // Daha düşük opaklık ile orijinal öğe görünürlüğünü azalt
    zIndex: isDragging ? 100 : 'auto',
    touchAction: "auto", // Dokunmatik etkileşimleri engelleme
    willChange: 'transform, opacity'  // GPU hızlandırma için
  }

  const oncelikIkonu = (oncelik: string) => {
    switch (oncelik) {
      case "yüksek":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "orta":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "düşük":
        return <Check className="h-4 w-4 text-green-500" />
      default:
        return null
    }
  }

  const gorevDurumRengi = (durum: string) => {
    switch (durum) {
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
  // Kartın arkaplanını görevin durumuna ve tarihine göre ayarla
  const cardBackground = (gorev: Gorev) => {
    // Geçmiş tarihli ancak hala arşivlenmemiş görevlerin renkli kenarını kaldır
    if (gorev.tarih) {
      const gorevTarihi = new Date(gorev.tarih);
      const bugun = new Date();
      bugun.setHours(0, 0, 0, 0); // Bugünün başlangıcı
      
      // Görev dünde veya daha önceki bir günde kalmışsa renk gösterme
      if (gorevTarihi < bugun) {
        return "border-gray-200 dark:border-gray-800 hover:border-gray-300"
      }
    }
    
    // Güncel görevler için normal renklendirme
    switch (gorev.durum) {
      case "Yapılacak":
        return "border-blue-200 dark:border-blue-900/30 hover:border-blue-300"
      case "Devam Ediyor":
        return "border-yellow-200 dark:border-yellow-900/30 hover:border-yellow-300"
      case "Tamamlandı":
        return "border-green-200 dark:border-green-900/30 hover:border-green-300"
      default:
        return "border-gray-200 dark:border-gray-800 hover:border-gray-300"
    }
  }
    // Silme işlemi için AlertDialog kullanılacak
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Silme işlemini onay ile gerçekleştir
  const handleDeleteClick = (e: React.MouseEvent) => {
    // Sürükleme olayını engelle
    e.stopPropagation();
    setIsSuruklenebilir(false);
    
    // Dialog'u göster
    setShowDeleteDialog(true);
    
    // Tıklama işlemi tamamlandıktan sonra tekrar sürüklemeyi etkinleştir
    setTimeout(() => setIsSuruklenebilir(true), 100);
  }
  
  // Düzenleme butonuna tıklandığında sürüklemeyi engelle
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSuruklenebilir(false);
    onDuzenle(gorev);
    
    // Tıklama işlemi tamamlandıktan sonra tekrar sürüklemeyi etkinleştir
    setTimeout(() => setIsSuruklenebilir(true), 100);
  }
    // Manuel sıralama işlevleri kaldırıldı - otomatik sıralama kullanılacak

  // Sürüklenebilir kart içeriği
  const cardContent = (
    <CardContent className="p-4 relative">      {/* Mobil göstergeleri kaldırıldı, artık sadece butonlar gösteriliyor */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {oncelikIkonu(gorev.oncelik)}
            <div className="font-medium truncate">{gorev.baslik}</div>
          </div>

          <Badge variant="outline" className={`${gorevDurumRengi(gorev.durum)} ml-2`}>
            {gorev.durum}
          </Badge>
        </div>
        
        <div className="text-xs text-muted-foreground flex items-center">
          <Clock className="h-3 w-3 mr-1" />
          {gorev.tarih ? format(new Date(gorev.tarih), "d MMMM", { locale: tr }) : "Tarih belirtilmemiş"}
          {gorev.baslangicSaati && gorev.bitisSaati ? `, ${gorev.baslangicSaati} - ${gorev.bitisSaati}` : ""}
        </div>

        {gorev.aciklama && (
          <div className="mt-2 text-sm text-muted-foreground border-l-2 border-muted pl-2">
            {gorev.aciklama.length > 100 ? `${gorev.aciklama.substring(0, 100)}...` : gorev.aciklama}
          </div>
        )}        {/* Mobil için durum değiştirme butonları */}
        {isMobile && onGorevGuncelle && (
          <div className="flex justify-center gap-2 mt-3 pt-2 border-t">
            {gorev.durum !== "Yapılacak" && (
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 text-xs flex items-center gap-1 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/30"
                onClick={(e) => {
                  e.stopPropagation();
                  onGorevGuncelle({...gorev, durum: "Yapılacak"});
                }}
              >
                <Clock className="h-3 w-3" /> Yapılacak
              </Button>
            )}
            
            {gorev.durum !== "Devam Ediyor" && (
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 text-xs flex items-center gap-1 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900/30"
                onClick={(e) => {
                  e.stopPropagation();
                  onGorevGuncelle({...gorev, durum: "Devam Ediyor"});
                }}
              >
                <ArrowRight className="h-3 w-3" /> Devam Ediyor
              </Button>
            )}
            
            {gorev.durum !== "Tamamlandı" && (
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 text-xs flex items-center gap-1 text-green-600 dark:text-green-400 border-green-200 dark:border-green-900/30"
                onClick={(e) => {
                  e.stopPropagation();
                  onGorevGuncelle({...gorev, durum: "Tamamlandı"});
                }}
              >
                <Check className="h-3 w-3" /> Tamamlandı
              </Button>
            )}
          </div>
        )}
        
        <div className="flex justify-end gap-1 mt-2">
          {/* Düzenleme ve silme butonları - butonları burada tanımlıyoruz */}          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-full relative z-10" 
            onClick={handleEditClick}
            onMouseOver={() => !isMobile && setIsSuruklenebilir(false)}
            onMouseOut={() => !isMobile && setIsSuruklenebilir(true)}
          >
            <Eye className="h-3.5 w-3.5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-full text-destructive hover:text-destructive relative z-10" 
            onClick={handleDeleteClick}
            onMouseOver={() => !isMobile && setIsSuruklenebilir(false)}
            onMouseOut={() => !isMobile && setIsSuruklenebilir(true)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </CardContent>
  );  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      whileHover={{ scale: isDragging ? 1 : 1.01 }}
    >
      {/* Silme işlemi için onay dialogu */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Görevi silmek istiyor musunuz?</AlertDialogTitle>
            <AlertDialogDescription>
              "{gorev.baslik}" görevini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={() => onSil(gorev.id)}>
              Görevi Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog><Card
        ref={!isMobile ? setNodeRef : undefined}
        style={!isMobile ? style : {}}        className={`mb-3 hover:shadow-md transition-all duration-300 
          ${!isMobile && isSuruklenebilir ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'} 
          ${cardBackground(gorev)}
          ${isDragging ? 'ring-2 ring-primary ring-opacity-50' : ''}
        `}
        {...(!isMobile && isSuruklenebilir ? { ...attributes, ...listeners } : {})}
      >
        {cardContent}
      </Card>
    </motion.div>
  )
}

// Görev durumu sütunu bileşeni
function GorevDurumuSutunu({
  baslik,
  gorevler,
  durum,
  onDuzenle,
  onSil,
  isMobile,
  durumRengi,
  kategori,
  onGorevGuncelle,
}: {
  baslik: string
  gorevler: Gorev[]
  durum: string
  onDuzenle: (gorev: Gorev) => void
  onSil: (gorevId: string) => void
  isMobile: boolean
  durumRengi: string
  kategori: GorevKategori
  onGorevGuncelle: (gorev: Gorev) => void
}) {
  const { setNodeRef } = useDroppable({
    id: durum,
  })  // Manuel sıralama fonksiyonu kaldırıldı - otomatik sıralama kullanılacak

  return (
    <Card ref={setNodeRef} className="h-full">
      <CardHeader className={`pb-2 border-b ${durumRengi}`}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            {durum === "Yapılacak" && <Clock className="h-5 w-5 text-blue-500" />}
            {durum === "Devam Ediyor" && <ArrowRight className="h-5 w-5 text-yellow-500" />}
            {durum === "Tamamlandı" && <Check className="h-5 w-5 text-green-500" />}
            {baslik}
          </CardTitle>
          <Badge variant="outline">{gorevler.length}</Badge>
        </div>
      </CardHeader>        <div className="overflow-hidden flex-grow">        <ScrollArea className="w-full" style={{ 
          height: `${isMobile 
            ? (gorevler.length === 0 ? '120px' : '220px') 
            : '320px'}` 
          }}>
          <div className="p-3">
            <AnimatePresence>
              <SortableContext items={gorevler.map((g) => g.id)} strategy={verticalListSortingStrategy}>
                {gorevler.length === 0 ? (
                  <div className="flex items-center justify-center" style={{
                    height: isMobile ? '70px' : '250px'
                  }}>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="text-muted-foreground text-center text-lg font-medium"
                    >
                      Görev bulunamadı
                    </motion.div>
                  </div>
                ) : (
                  gorevler.map((gorev) => (
                    <SuruklenebilirGorevKarti 
                      key={gorev.id} 
                      gorev={gorev} 
                      onDuzenle={onDuzenle} 
                      onSil={onSil}
                      kategori={kategori}
                      onGorevGuncelle={onGorevGuncelle}
                    />
                  ))
                )}
              </SortableContext>
            </AnimatePresence>
          </div>
        </ScrollArea>
      </div>
      <CardFooter className={`flex justify-center p-2 border-t ${durumRengi}`}>
        <div className="text-xs text-muted-foreground">
          {isMobile ? (
            durum === "Yapılacak" ? "Görev durumunu güncellemek için butonları kullanın →" :
            durum === "Devam Ediyor" ? "← İlerlemeyi butonlarla güncelleyin →" :
            "← Tebrikler! Tamamlandı"
          ) : (
            durum === "Yapılacak" ? "Sürükleyip durumunu değiştirin →" :
            durum === "Devam Ediyor" ? "← İlerlemeyi güncelleyin →" :
            "← Tebrikler! Tamamlandı"
          )}
        </div>
      </CardFooter>
    </Card>
  )
}

// Kategori formu bileşeni
function KategoriFormu({ 
  onKaydet, 
  onIptal, 
  duzenlenecekKategori 
}: { 
  onKaydet: (kategori: GorevKategori) => void
  onIptal: () => void
  duzenlenecekKategori?: GorevKategori
}) {
  const [ad, setAd] = useState(duzenlenecekKategori?.ad || '')
  const [renk, setRenk] = useState(duzenlenecekKategori?.renk || '#4f46e5')

  const handleKaydet = () => {
    if (!ad.trim()) return

    const yeniKategori: GorevKategori = {
      id: duzenlenecekKategori?.id || Date.now().toString(),
      ad,
      renk,
    }

    onKaydet(yeniKategori)
  }

  // Önceden tanımlanmış renkler
  const renkler = [
    '#4f46e5', // İndigo
    '#0ea5e9', // Sky
    '#2dd4bf', // Teal
    '#22c55e', // Green
    '#f59e0b', // Amber
    '#f97316', // Orange
    '#ef4444', // Red
    '#ec4899', // Pink
    '#8b5cf6', // Violet
  ]

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onIptal()}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{duzenlenecekKategori ? "Kategoriyi Düzenle" : "Yeni Kategori Ekle"}</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="kategoriAdi">Kategori Adı</Label>
            <Input
              id="kategoriAdi"
              value={ad}
              onChange={(e) => setAd(e.target.value)}
              placeholder="Örn: Spor, Okul, İş..."
            />
          </div>
          
          <div className="grid gap-2">
            <Label>Renk</Label>
            <div className="flex flex-wrap gap-2">
              {renkler.map((r) => (
                <button
                  key={r}
                  type="button"
                  className={`h-6 w-6 rounded-full transition-all ${renk === r ? 'ring-2 ring-offset-2 ring-primary' : 'opacity-70 hover:opacity-100'}`}
                  style={{ backgroundColor: r }}
                  onClick={() => setRenk(r)}
                />
              ))}
              <label>
                <input
                  type="color"
                  value={renk}
                  onChange={(e) => setRenk(e.target.value)}
                  className="sr-only"
                />
                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-gray-200 to-gray-400 dark:from-gray-700 dark:to-gray-900 cursor-pointer flex items-center justify-center">
                  <span className="text-xs">+</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onIptal}>
            İptal
          </Button>
          <Button onClick={handleKaydet} disabled={!ad.trim()}>
            Kaydet
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function GorevYonetimi({ 
  gorevler, 
  onGorevEkle, 
  onGorevGuncelle, 
  onGorevSil,
  kategoriler,
  onKategoriEkle,
  onKategoriGuncelle,
  onKategoriSil
}: GorevYonetimiProps) {
  const [yeniGorevEkleniyor, setYeniGorevEkleniyor] = useState(false)
  const [secilenGorev, setSecilenGorev] = useState<Gorev | null>(null)
  const [aktifSuruklenenGorev, setAktifSuruklenenGorev] = useState<Gorev | null>(null)
  const [aktifKategoriId, setAktifKategoriId] = useState<string>("hepsi")
  const [yeniKategoriEkleniyor, setYeniKategoriEkleniyor] = useState(false)
  const [duzenlenecekKategori, setDuzenlenecekKategori] = useState<GorevKategori | undefined>(undefined)
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [aktifTab, setAktifTab] = useLocalStorage<"gorevler" | "arsiv" | "bugun">("gorevYonetimiAktifTab", "gorevler"); // Değiştirildi

  // Görevleri tarih ve önceliğe göre sıralama fonksiyonu
  const autoSortTasks = (tasks: Gorev[]) => {
    return [...tasks].sort((a, b) => {
      // 1. Önce tarihe göre sırala (tarihi olmayanlar en sona)
      const aDate = a.tarih ? new Date(a.tarih).getTime() : Number.MAX_SAFE_INTEGER;
      const bDate = b.tarih ? new Date(b.tarih).getTime() : Number.MAX_SAFE_INTEGER;
      
      if (aDate !== bDate) {
        return aDate - bDate; // Küçük tarihler (daha yakın) önce gelsin
      }
      
      // 2. Aynı tarihliler için önceliğe göre sırala
      const oncelikPuani: {[key: string]: number} = {
        "yüksek": 1,
        "orta": 2,
        "düşük": 3
      };
      
      const aPuan = oncelikPuani[a.oncelik] || 999;
      const bPuan = oncelikPuani[b.oncelik] || 999;
      
      return aPuan - bPuan; // Yüksek öncelik başta olsun
    });
  };
  // Seçilen kategoriye göre görevleri filtrele ve kategori değişikliğini izle
  const filtrelenmisTumGorevler = aktifKategoriId === "hepsi" 
    ? gorevler 
    : gorevler.filter((gorev) => {
        // Kategori ID'si geçersiz ise veya boş ise filtrele
        if (!aktifKategoriId) return false;
        // Kategori ID'si geçerliyse filtrele
        return gorev.kategori === aktifKategoriId;
      })

  // Arşivlenme durumuna göre görevleri filtrele
  const aktifGorevler = filtrelenmisTumGorevler.filter(gorev => !gorev.arsivlendi)
  const arsivlenmisGorevler = filtrelenmisTumGorevler.filter(gorev => gorev.arsivlendi)

  // Görevleri durumlarına göre filtrele ve tarih/önceliğe göre otomatik sırala
  const yapilacakGorevler = autoSortTasks(aktifGorevler.filter((gorev) => gorev.durum === "Yapılacak"))
  const devamEdenGorevler = autoSortTasks(aktifGorevler.filter((gorev) => gorev.durum === "Devam Ediyor"))
  const tamamlananGorevler = autoSortTasks(aktifGorevler.filter((gorev) => gorev.durum === "Tamamlandı"))

  // Bugünün görevleri için filtreleme
  const bugununTarihi = new Date();
  bugununTarihi.setHours(0, 0, 0, 0);

  const bugununAktifGorevleri = aktifGorevler.filter(gorev => {
    if (!gorev.tarih) return false;
    const gorevTarihi = new Date(gorev.tarih);
    gorevTarihi.setHours(0, 0, 0, 0);
    return gorevTarihi.getTime() === bugununTarihi.getTime();
  });

  const yapilacakBugun = autoSortTasks(bugununAktifGorevleri.filter(g => g.durum === "Yapılacak"));
  const devamEdenBugun = autoSortTasks(bugununAktifGorevleri.filter(g => g.durum === "Devam Ediyor"));
  const tamamlananBugun = autoSortTasks(bugununAktifGorevleri.filter(g => g.durum === "Tamamlandı"));
  
  // Aktif kategoriyi bul ve geçerli kategori olduğundan emin ol
  const aktifKategori = aktifKategoriId === "hepsi" 
    ? { id: "hepsi", ad: "Tüm Görevler", renk: "#6b7280" } 
    : kategoriler.find((k) => k.id === aktifKategoriId) || 
      // Eğer kategori bulunamazsa (silinmişse) varsayılan kategoriye veya tüm görevlere geç
      kategoriler.find(k => k.id === "varsayilan") || { id: "varsayilan", ad: "Genel", renk: "#4f46e5" }// Sürükle-bırak sensörleri - basitçe yeniden yapılandırıldı  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Basit ve doğrudan çalışması için temel ayarlar
      activationConstraint: isMobile ? {
        delay: 250,        // Daha uzun basma süresi
        distance: 5,       // Az bir hareket gereksin
        tolerance: 5,      // Az bir tolerans
      } : undefined,
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleYeniGorevEkle = (gorev: Gorev) => {
    // Eğer aktif kategori "hepsi" değilse, yeni görev oluşturulduğunda aktif kategoriyi ata
    const yeniGorev = {
      ...gorev,
      kategori: aktifKategoriId === "hepsi" ? (gorev.kategori || "varsayilan") : aktifKategoriId
    }
    
    onGorevEkle(yeniGorev)
    setYeniGorevEkleniyor(false)
  }

  const handleGorevGuncelle = (gorev: Gorev) => {
    onGorevGuncelle(gorev)
    setSecilenGorev(null)
  }

  const handleKategoriEkle = (kategori: GorevKategori) => {
    onKategoriEkle(kategori)
    setYeniKategoriEkleniyor(false)
    // Yeni eklenen kategoriye geçiş yap
    setAktifKategoriId(kategori.id)
  }

  const handleKategoriGuncelle = (kategori: GorevKategori) => {
    onKategoriGuncelle(kategori)
    setDuzenlenecekKategori(undefined)
  }
  // Otomatik arşivleme ve silme kontrolü
  useEffect(() => {
    // Zamanı geçmiş ve yapılmamış görevleri arşivle
    const bugun = new Date();
    bugun.setHours(0, 0, 0, 0); // Bugünün başlangıcı (saat 00:00)
      // 1. Zamanı geçmiş görevleri arşivle (günü geçen görevleri arşive düşür)
    const zamaniGecmisGorevler = gorevler.filter(gorev => {
      // Arşivlenmemiş, tarihi olan ve Tamamlandı durumunda OLMAYAN görevleri kontrol et
      if (!gorev.arsivlendi && gorev.tarih && gorev.durum !== "Tamamlandı") {
        const gorevTarihi = new Date(gorev.tarih);
        gorevTarihi.setHours(23, 59, 59, 999); // Görev tarihinin sonu (saat 23:59:59)
        return gorevTarihi < bugun; // Görev tarihi bugünden önceyse (günü geçti)
      }
      return false;
    });
    
    // 2. Tamamlanmış ve 1 günden eski görevleri arşivle
    const tamamlanmisEskiGorevler = gorevler.filter(gorev => {
      if (!gorev.arsivlendi && gorev.durum === "Tamamlandı") {
        // Tamamlanma tarihi olmadığı için, son güncelleme tarihini bilemiyoruz.
        // Pratik bir çözüm olarak, tarih varsa kontrol ediyoruz.
        if (gorev.tarih) {
          const gorevTarihi = new Date(gorev.tarih);
          const birGunOnce = new Date();
          birGunOnce.setDate(birGunOnce.getDate() - 1);
          return gorevTarihi < birGunOnce;
        }
        // Tarih yoksa, şimdilik arşivleme
        return false;
      }
      return false;
    });
    
    // Tespit edilen görevleri arşivle
    const arsivlenecekGorevler = [...zamaniGecmisGorevler, ...tamamlanmisEskiGorevler];
    
    arsivlenecekGorevler.forEach(gorev => {
      if (!gorev.arsivlendi) {
        onGorevGuncelle({
          ...gorev,
          arsivlendi: true,
          arsivlenmeTarihi: new Date().toISOString(),
          otomatikSilinecek: true // Varsayılan olarak otomatik silinecek
        });
      }
    });
    
    // 3. Arşivlenen ve 7 günden eski görevleri otomatik sil
    const yediGunOnce = new Date();
    yediGunOnce.setDate(yediGunOnce.getDate() - 7); // 7 gün öncesi
    
    const silinecekGorevler = gorevler.filter(gorev => {
      if (gorev.arsivlendi && gorev.arsivlenmeTarihi && gorev.otomatikSilinecek !== false) {
        const arsivlemeTarihi = new Date(gorev.arsivlenmeTarihi);
        return arsivlemeTarihi < yediGunOnce; // Arşivleme tarihi 7 günden eskiyse
      }
      return false;
    });
    
    // Tespit edilen görevleri sil
    silinecekGorevler.forEach(gorev => {
      onGorevSil(gorev.id);
    });
  }, [gorevler, onGorevGuncelle, onGorevSil]);

  // Sürükleme başladığında
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const activeData = active.data.current
    if (activeData?.type === "gorev") {
      setAktifSuruklenenGorev(activeData.gorev)
    }
  }

  // Sürükleme bittiğinde
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || !active) return;

    const activeId = active.id.toString();
    const overId = over.id.toString();

    // 1. Aktif görevi bul
    const activeGorev = gorevler.find(g => g.id === activeId);
    
    if (!activeGorev) return;
    
    // 2. DURUM DEĞİŞTİRME: Hedef bir durum kategorisi ise (Yapılacak, Devam Ediyor, Tamamlandı)
    if (["Yapılacak", "Devam Ediyor", "Tamamlandı"].includes(overId)) {
      // Eğer görev zaten bu durumdaysa bir şey yapma
      if (activeGorev.durum === overId) {
        setAktifSuruklenenGorev(null);
        return;
      }
      
      // Görevin durumunu değiştir ve o durumdaki görevlerin altına ekle
      const updatedGorev = {
        ...activeGorev,
        durum: overId,
      };
      
      onGorevGuncelle(updatedGorev);
      setAktifSuruklenenGorev(null);
      return;
    }
    
    // 3. GÖREV ÜZERİNE BIRAKMA: Görev başka bir görev üzerine bırakıldıysa
    const overGorev = gorevler.find(g => g.id === overId);
    
    if (overGorev) {
      // 3.1 FARKLI DURUM: Hedef görevin durumu farklıysa, durumu değiştir ve o durumdaki görevlerin altına ekle
      if (activeGorev.durum !== overGorev.durum) {
        const updatedGorev = {
          ...activeGorev,
          durum: overGorev.durum,
        };
        
        onGorevGuncelle(updatedGorev);
        
        // Bir süre bekleyip sonra tekrar bir durum güncelleme işlemi gerçekleştir
        // Bu, görevin önce durum değiştirip sonra sıralama yapması için gerekli
        setTimeout(() => {
          const durumdakiGorevler = 
            overGorev.durum === "Yapılacak" ? yapilacakGorevler : 
            overGorev.durum === "Devam Ediyor" ? devamEdenGorevler : 
            tamamlananGorevler;
          
          // Hedef listenin son elemanını bul (eğer hedef bir görevse, o göreve konumlandır)
          const targetIndex = durumdakiGorevler.findIndex(g => g.id === overId);
          
          if (targetIndex !== -1) {
            // Yeni bir diziyi kopyala ve güncel görevi doğru konuma ekle
            const yeniListe = [...durumdakiGorevler];
              // Yeni sıralanmış listeyi oluştur ve güncelle
            onGorevGuncelle({
              ...updatedGorev,
              siraNo: targetIndex + 1, // Hedef görevin hemen altına ekle
            });
          }
        }, 100);
      }      // 3.2 AYNI DURUM: Manuel sıralamayı geçip otomatik sıralama kullanıyoruz
      // Eğer aynı sütunda taşıma yapıldıysa, herhangi bir manuel değişiklik yapmayacağız
      // Görevler zaten tarih ve önceliğe göre otomatik sıralanacak
      else {
        // Taşıma olayını kabul etmiyoruz, otomatik sıralama devam edecek
        console.log("Aynı sütunda sürükleme yapıldı - otomatik sıralama kullanıldığı için işlem yapılmıyor.");
        
        // Eğer gerekirse burada kullanıcıya bir bildirim gösterilebilir
        // Örnek: toast("Görevler tarih ve önceliğe göre otomatik sıralanır");
      }
    }

    setAktifSuruklenenGorev(null);
  }

  // Her durum için kendi rengini ata
  const durumRengi = (durum: string) => {
    switch (durum) {
      case "Yapılacak":
        return "border-blue-100 dark:border-blue-900/20"
      case "Devam Ediyor":
        return "border-yellow-100 dark:border-yellow-900/20"
      case "Tamamlandı":
        return "border-green-100 dark:border-green-900/20"
      default:
        return ""
    }
  }

  const oncelikIkonu = (oncelik: string) => {
    switch (oncelik) {
      case "yüksek":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "orta":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "düşük":
        return <Check className="h-4 w-4 text-green-500" />
      default:
        return null
    }
  }

  const gorevDurumRengi = (durum: string) => {
    switch (durum) {
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
  
  // Kategori yönetimi menüsü
  const KategoriMenusu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="gap-2 px-3 border-dashed"
        >
          <Folder className="h-4 w-4" />
          <span>Kategoriler</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="p-2">
          <div className="font-medium mb-1">Kategori Yönetimi</div>
          <div className="flex flex-col gap-1">            <div 
              className="flex items-center border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md justify-start h-8 px-2 cursor-pointer" 
              onClick={() => setYeniKategoriEkleniyor(true)}
              role="button"
              tabIndex={0}
            >
              <FolderPlus className="h-4 w-4 mr-2" /> Yeni Kategori Ekle
            </div>
              <div className="border-t my-2" />
              {kategoriler.map((kategori) => (
              <div
                key={kategori.id}
                className={`flex items-center justify-start h-8 px-2 rounded-md cursor-pointer ${
                  aktifKategoriId === kategori.id 
                  ? 'bg-secondary text-secondary-foreground font-medium' 
                  : 'hover:bg-accent hover:text-accent-foreground'
                }`}
                onClick={() => setAktifKategoriId(kategori.id)}
                role="button"
                tabIndex={0}
              >
                <div 
                  className="h-3 w-3 rounded-full mr-2"
                  style={{ backgroundColor: kategori.renk }}
                />
                <span>{kategori.ad}</span>
                
                {kategori.id !== 'varsayilan' && (  
                  <div className="ml-auto flex gap-1">                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 opacity-70 hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDuzenlenecekKategori(kategori);
                      }}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                      <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 text-destructive opacity-70 hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Kategoriyi silmek istiyor musunuz?</AlertDialogTitle>
                          <AlertDialogDescription>
                            "{kategori.ad}" kategorisini silmek istediğinizden emin misiniz? Bu kategorideki görevler "Genel" kategorisine taşınacaktır.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>İptal</AlertDialogCancel>                          <AlertDialogAction 
                            onClick={() => {
                              onKategoriSil(kategori.id);
                              // Eğer silinecek kategori aktifse veya "varsayilan" kategorisi görünümündeyken
                              // diğer bir kategoriyi siliyorsak, filtreleri güncelle
                              if (aktifKategoriId === kategori.id || aktifKategoriId === "varsayilan") {
                                // Önce geçiş yapılacak kategori ID'sini belirliyoruz
                                const yeniKategoriId = aktifKategoriId === kategori.id ? "hepsi" : aktifKategoriId;
                                
                                // Kategoriler ve görüntüyü güncelle
                                setTimeout(() => {
                                  setAktifKategoriId(""); // Önce kategoriyi sıfırla
                                  setTimeout(() => {
                                    setAktifKategoriId(yeniKategoriId); // Sonra kategoriyi yeniden ayarla
                                  }, 10);
                                }, 10);
                              }
                            }}
                          >
                            Kategoriyi Sil
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </div>
            ))}
            
            <div className="border-t my-2" />
              <div
              className={`flex items-center justify-start h-8 px-2 rounded-md cursor-pointer ${
                aktifKategoriId === "hepsi" 
                ? 'bg-secondary text-secondary-foreground font-medium' 
                : 'hover:bg-accent hover:text-accent-foreground'
              }`}
              onClick={() => setAktifKategoriId("hepsi")}
              role="button"
              tabIndex={0}
            >
              <div className="h-3 w-3 rounded-full mr-2 bg-gray-500" />
              <span>Tüm Görevler</span>
            </div>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="space-y-6">
      <motion.div 
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <span className="inline-block p-1 rounded-md bg-primary/10">
              <CalendarCheck2 className="h-5 w-5 text-primary" />
            </span>
            Görev Yönetimi
          </h2>
          <div className="flex items-center gap-1 mt-1">
            <p className="text-muted-foreground text-sm">
              {aktifTab === "arsiv" 
                ? "Arşivlenmiş görevlerinizi görüntülüyorsunuz" 
                : aktifTab === "bugun"
                  ? aktifKategoriId === "hepsi"
                    ? "Bugünün tüm görevlerini görüntülüyorsunuz"
                    : `Bugünün "${aktifKategori.ad}" kategorisindeki görevlerini görüntülüyorsunuz`
                  : aktifKategoriId === "hepsi" 
                    ? "Tüm görevlerinizi görüntülüyorsunuz" 
                    : `"${aktifKategori.ad}" kategorisındaki görevleri görüntülüyorsunuz`}
            </p>
            
            {aktifKategoriId !== "hepsi" && aktifTab !== "arsiv" && (
              <Button 
                variant="link" 
                size="sm" 
                className="h-auto p-0 text-xs"
                onClick={() => setAktifKategoriId("hepsi")}
              >
                (Tümünü göster)
              </Button>
            )}
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto"> {/* Değişiklik burada */}
          {aktifTab !== "bugun" && aktifTab !== "arsiv" && (
            <Button onClick={() => setAktifTab("bugun")} variant="outline" className="gap-1 w-full sm:w-auto"> {/* Değişiklik burada */}
              <CalendarDays className="h-4 w-4" /> 
              <span className="sm:hidden">Bugünün Görevleri</span>
              <span className="hidden sm:inline">Bugünün Görevleri</span>
            </Button>
          )}
          {aktifTab === "bugun" && (
            <Button onClick={() => setAktifTab("gorevler")} variant="outline" className="gap-1 w-full sm:w-auto"> {/* Değişiklik burada */}
              <ListChecks className="h-4 w-4" /> 
              <span className="sm:hidden">Tüm Görevler</span>
              <span className="hidden sm:inline">Tüm Görevler</span>
            </Button>
          )}
          
          <Button
            variant="outline"
            className="gap-1 w-full sm:w-auto" /* Değişiklik burada */
            onClick={() => {
              if (aktifTab === "arsiv") {
                setAktifTab("gorevler"); 
              } else {
                setAktifTab("arsiv");
              }
            }}
          >
            {aktifTab === "arsiv" ? (
              <>
                <ArchiveRestore className="h-4 w-4 transition-all" /> Görevlere Dön
              </>
            ) : (
              <>
                <Archive className="h-4 w-4" /> Arşiv
              </>
            )}
          </Button>
          
          {aktifTab !== "arsiv" && (
            <>
              <KategoriMenusu />
              
              <Button onClick={() => setYeniGorevEkleniyor(true)} className="gap-1 w-full sm:w-auto"> {/* Değişiklik burada */}
                <Plus className="h-4 w-4" /> 
                <span className="sm:hidden">Yeni</span>
                <span className="hidden sm:inline">Yeni Görev</span>
              </Button>
            </>
          )}
        </div>
      </motion.div>
      
      {/* Kategori sekmeleri (mobil için) */}
      {isMobile && aktifTab !== "arsiv" && (
        <Tabs value={aktifKategoriId} onValueChange={setAktifKategoriId} className="pb-2">
          <TabsList className="bg-muted/50 overflow-x-auto w-full flex-wrap p-1">
            <TabsTrigger value="hepsi" className="text-xs">Tümü</TabsTrigger>
            
            {kategoriler.map((kat) => (
              <TabsTrigger key={kat.id} value={kat.id} className="text-xs">
                <div className="flex items-center gap-1.5">
                  <div 
                    className="h-2 w-2 rounded-full" 
                    style={{ backgroundColor: kat.renk }}
                  />
                  {kat.ad}
                </div>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}        
        {/* Bilgilendirme kutusu */}
      {isMobile && aktifTab !== "arsiv" && (
        <motion.div 
          className="mb-4 p-4 bg-muted/40 rounded-lg border border-primary/10"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >          
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 rounded-full p-1.5 mt-0.5">
                <div className="flex items-center justify-center">
                  <ArrowRight className="h-3.5 w-3.5 text-primary" />
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Durum Değişikliği</h4>
                <p className="text-xs text-muted-foreground">
                  Görev durumunu değiştirmek için kart altındaki durum değiştirme butonlarını kullanabilirsiniz.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 rounded-full p-1.5 mt-0.5">
                <div className="flex items-center justify-center">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Otomatik Sıralama</h4>
                <p className="text-xs text-muted-foreground">
                  Görevler öncelikle yakın tarihe, sonra yüksek önceliğe göre otomatik sıralanır.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 rounded-full p-1.5 mt-0.5">
                <div className="flex items-center justify-center">
                  <Archive className="h-3.5 w-3.5 text-primary" />
                </div>
              </div>              <div>
                <h4 className="text-sm font-medium mb-1">Otomatik Arşivleme ve Silme</h4>
                <p className="text-xs text-muted-foreground">
                  Zamanı geçmiş görevler ve tamamlanalı 1 gün olmuş görevler otomatik arşivlenir.
                  Arşivlenen görevler 7 gün sonra otomatik olarak silinir.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}{aktifTab === "gorevler" ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          // Mobilde DnD'yi tamamen devre dışı bırakılmıyor, ancak sürüklenebilir öğeler devre dışı 
          // bırakıldığı için etkili bir şekilde kullanılamaz hale geliyor
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <GorevDurumuSutunu
                baslik="Yapılacak"
                gorevler={yapilacakGorevler}
                durum="Yapılacak"
                onDuzenle={setSecilenGorev}
                onSil={onGorevSil}
                onGorevGuncelle={onGorevGuncelle}
                isMobile={isMobile}
                durumRengi={durumRengi("Yapılacak")}
                kategori={aktifKategori}
              />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <GorevDurumuSutunu
                baslik="Devam Ediyor"
                gorevler={devamEdenGorevler}
                durum="Devam Ediyor"
                onDuzenle={setSecilenGorev}
                onSil={onGorevSil}
                onGorevGuncelle={onGorevGuncelle}
                isMobile={isMobile}
                durumRengi={durumRengi("Devam Ediyor")}
                kategori={aktifKategori}
              />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <GorevDurumuSutunu
                baslik="Tamamlandı"
                gorevler={tamamlananGorevler}
                durum="Tamamlandı"
                onDuzenle={setSecilenGorev}
                onSil={onGorevSil}
                onGorevGuncelle={onGorevGuncelle}
                isMobile={isMobile}
                durumRengi={durumRengi("Tamamlandı")}
                kategori={aktifKategori}
              />
            </motion.div>
          </div>        
          {/* Sürükleme sırasında görünen overlay */}
          <DragOverlay 
            dropAnimation={{
              duration: 200,
              easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
            }}
            adjustScale={false}
            modifiers={isMobile ? [
              ({transform}) => {
                const adjustedY = transform.y - 120;
                return {
                  ...transform,
                  y: adjustedY,
                  scaleX: 0.9,
                  scaleY: 0.9
                };
              }
            ] : undefined}
          >
            {aktifSuruklenenGorev && (
              <motion.div 
                initial={{ scale: 1 }}
                animate={{ scale: 1.02 }}
                transition={{ duration: 0.15 }}
                style={{ 
                  width: "100%", 
                  maxWidth: "100%", 
                  touchAction: "none",
                  pointerEvents: "none"
                }}
              >
                <Card className="w-full max-w-md shadow-xl border-2 border-primary/30 bg-card/95 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {oncelikIkonu(aktifSuruklenenGorev.oncelik)}
                        <div>
                          <div className="font-medium">{aktifSuruklenenGorev.baslik}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {aktifSuruklenenGorev.tarih
                              ? format(new Date(aktifSuruklenenGorev.tarih), "d MMMM", { locale: tr })
                              : "Tarih belirtilmemiş"}
                            {aktifSuruklenenGorev.baslangicSaati && aktifSuruklenenGorev.bitisSaati 
                              ? `, ${aktifSuruklenenGorev.baslangicSaati} - ${aktifSuruklenenGorev.bitisSaati}` 
                              : ""}
                          </div>
                        </div>
                      </div>
                      <Badge className={gorevDurumRengi(aktifSuruklenenGorev.durum)}>{aktifSuruklenenGorev.durum}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </DragOverlay>
        </DndContext>
      ) : aktifTab === "bugun" ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <GorevDurumuSutunu
                baslik="Yapılacak (Bugün)"
                gorevler={yapilacakBugun}
                durum="Yapılacak"
                onDuzenle={setSecilenGorev}
                onSil={onGorevSil}
                onGorevGuncelle={onGorevGuncelle}
                isMobile={isMobile}
                durumRengi={durumRengi("Yapılacak")}
                kategori={aktifKategori}
              />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <GorevDurumuSutunu
                baslik="Devam Ediyor (Bugün)"
                gorevler={devamEdenBugun}
                durum="Devam Ediyor"
                onDuzenle={setSecilenGorev}
                onSil={onGorevSil}
                onGorevGuncelle={onGorevGuncelle}
                isMobile={isMobile}
                durumRengi={durumRengi("Devam Ediyor")}
                kategori={aktifKategori}
              />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <GorevDurumuSutunu
                baslik="Tamamlandı (Bugün)"
                gorevler={tamamlananBugun}
                durum="Tamamlandı"
                onDuzenle={setSecilenGorev}
                onSil={onGorevSil}
                onGorevGuncelle={onGorevGuncelle}
                isMobile={isMobile}
                durumRengi={durumRengi("Tamamlandı")}
                kategori={aktifKategori}
              />
            </motion.div>
          </div>        
          <DragOverlay 
            dropAnimation={{
              duration: 200,
              easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
            }}
            adjustScale={false}
            modifiers={isMobile ? [
              ({transform}) => {
                const adjustedY = transform.y - 120;
                return {
                  ...transform,
                  y: adjustedY,
                  scaleX: 0.9,
                  scaleY: 0.9
                };
              }
            ] : undefined}
          >
            {aktifSuruklenenGorev && (
              <motion.div 
                initial={{ scale: 1 }}
                animate={{ scale: 1.02 }}
                transition={{ duration: 0.15 }}
                style={{ 
                  width: "100%", 
                  maxWidth: "100%", 
                  touchAction: "none",
                  pointerEvents: "none"
                }}
              >
                <Card className="w-full max-w-md shadow-xl border-2 border-primary/30 bg-card/95 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {oncelikIkonu(aktifSuruklenenGorev.oncelik)}
                        <div>
                          <div className="font-medium">{aktifSuruklenenGorev.baslik}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {aktifSuruklenenGorev.tarih
                              ? format(new Date(aktifSuruklenenGorev.tarih), "d MMMM", { locale: tr })
                              : "Tarih belirtilmemiş"}
                            {aktifSuruklenenGorev.baslangicSaati && aktifSuruklenenGorev.bitisSaati 
                              ? `, ${aktifSuruklenenGorev.baslangicSaati} - ${aktifSuruklenenGorev.bitisSaati}` 
                              : ""}
                          </div>
                        </div>
                      </div>
                      <Badge className={gorevDurumRengi(aktifSuruklenenGorev.durum)}>{aktifSuruklenenGorev.durum}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </DragOverlay>
        </DndContext>
      ) : (
        // Arşiv görünümü
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border border-muted-foreground/20">
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileArchive className="h-5 w-5 text-muted-foreground" />
                  Arşivlenmiş Görevler
                </CardTitle>
                <Badge variant="outline">{arsivlenmisGorevler.length}</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {arsivlenmisGorevler.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Archive className="h-10 w-10 text-muted-foreground/50 mx-auto mb-2" />
                  <p>Arşivlenmiş görev bulunmuyor.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {autoSortTasks(arsivlenmisGorevler).map((gorev) => (
                    <Card key={gorev.id} className="border-dashed border-muted-foreground/30 hover:border-muted-foreground/50 transition-all">
                      <CardContent className="p-4">
                        <div className="flex flex-col gap-3">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                              {oncelikIkonu(gorev.oncelik)}
                              <div>
                                <div className="font-medium">{gorev.baslik}</div>
                                <div className="text-xs text-muted-foreground">
                                  {gorev.arsivlenmeTarihi ? (
                                    <>
                                      <span className="font-medium">Arşivlenme: </span>
                                      {format(new Date(gorev.arsivlenmeTarihi), "d MMMM yyyy", { locale: tr })}
                                    </>
                                  ) : "Arşivlenme tarihi bilinmiyor"}
                                </div>
                              </div>
                            </div>
                            <Badge className={gorevDurumRengi(gorev.durum)}>{gorev.durum}</Badge>
                          </div>
                          
                          {gorev.tarih && (
                            <div className="text-xs flex items-center gap-2 border-t pt-2 text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>Tarih: {format(new Date(gorev.tarih), "d MMMM yyyy", { locale: tr })}</span>
                              {gorev.baslangicSaati && gorev.bitisSaati && (
                                <span>Saat: {gorev.baslangicSaati} - {gorev.bitisSaati}</span>
                              )}
                            </div>
                          )}
                          
                          {gorev.aciklama && (
                            <div className="text-sm border-l-2 border-muted pl-2 text-muted-foreground">
                              {gorev.aciklama}
                            </div>
                          )}
                            <div className="flex items-center justify-between mt-2 border-t pt-2">
                            <div className="flex items-center">
                              <label className="text-xs flex items-center gap-1.5 cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  className="h-3 w-3 rounded border-gray-300"
                                  checked={gorev.otomatikSilinecek !== false} 
                                  onChange={(e) => {
                                    onGorevGuncelle({
                                      ...gorev,
                                      otomatikSilinecek: e.target.checked
                                    });
                                  }}
                                />
                                <span className="text-muted-foreground">7 gün sonra otomatik sil</span>
                              </label>
                            </div>
                            <div className="flex gap-2">                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="gap-1 text-xs"
                                onClick={() => {
                                  // Görevin tarihi var ve geçmiş tarih ise, bugüne güncelle
                                  let guncelTarih = gorev.tarih;
                                  
                                  if (gorev.tarih) {
                                    const gorevTarihi = new Date(gorev.tarih);
                                    const bugun = new Date();
                                    bugun.setHours(0, 0, 0, 0); // Bugünün başlangıcı
                                    
                                    // Görev tarihi bugünden önceyse (geçmiş tarih) tarihi güncelle
                                    if (gorevTarihi < bugun) {
                                      guncelTarih = bugun.toISOString();
                                    }
                                  }
                                  
                                  onGorevGuncelle({
                                    ...gorev,
                                    arsivlendi: false,
                                    arsivlenmeTarihi: undefined,
                                    tarih: guncelTarih
                                  });
                                }}
                              >
                                <ArchiveRestore className="h-3.5 w-3.5" />
                                Arşivden Çıkar
                              </Button>
                                <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="gap-1 text-xs text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Sil
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Görevi silmek istiyor musunuz?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      "{gorev.baslik}" görevini tamamen silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>İptal</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => {
                                        onGorevSil(gorev.id);
                                      }}
                                    >
                                      Görevi Sil
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>            <CardFooter className="border-t p-4 flex flex-col items-center">
              <p className="text-sm text-muted-foreground mb-1">
                Görevleri arşivden çıkarmak için "Arşivden Çıkar" butonunu kullanabilirsiniz.
              </p>
              <p className="text-xs text-muted-foreground mb-1">
                Geçmiş tarihli görevler arşivden çıkarıldığında, tarihi otomatik olarak bugüne ayarlanır.
              </p>
              <p className="text-xs text-muted-foreground">
                Arşivlenen görevler varsayılan olarak 7 gün sonra otomatik silinir. Otomatik silmeyi kapatabilirsiniz.
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      )}

      {/* Modal ve Formlar */}
      <AnimatePresence>
        {yeniGorevEkleniyor && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >            <GorevFormu 
              onKaydet={handleYeniGorevEkle} 
              onIptal={() => setYeniGorevEkleniyor(false)}
              kategoriler={kategoriler}
              onKategoriEkle={handleKategoriEkle}
            />
          </motion.div>
        )}

        {secilenGorev && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >            <GorevDetay 
              gorev={secilenGorev} 
              onKapat={() => setSecilenGorev(null)} 
              onGuncelle={handleGorevGuncelle}
              kategoriler={kategoriler}
              onKategoriEkle={handleKategoriEkle}
            />
          </motion.div>
        )}

        {yeniKategoriEkleniyor && (
          <KategoriFormu 
            onKaydet={handleKategoriEkle} 
            onIptal={() => setYeniKategoriEkleniyor(false)} 
          />
        )}

        {duzenlenecekKategori && (
          <KategoriFormu 
            duzenlenecekKategori={duzenlenecekKategori} 
            onKaydet={handleKategoriGuncelle} 
            onIptal={() => setDuzenlenecekKategori(undefined)} 
          />
        )}
      </AnimatePresence>
    </div>
  )
}
