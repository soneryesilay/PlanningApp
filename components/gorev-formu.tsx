"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { AlertCircle, CalendarIcon, Plus } from "lucide-react"
import { format, isBefore, startOfDay } from "date-fns"
import { tr } from "date-fns/locale"
import type { Gorev, GorevKategori } from "@/lib/types"
import { Alert, AlertDescription } from "./ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"

interface GorevFormuProps {
  onKaydet: (gorev: Gorev) => void
  onIptal: () => void
  baslangicTarihi?: Date
  duzenlenecekGorev?: Gorev
  kategoriler?: GorevKategori[]
  onKategoriEkle?: (kategori: GorevKategori) => void
}

// Kategori formu bileşeni
function KategoriFormu({ 
  onKaydet, 
  onIptal,
  acik
}: { 
  onKaydet: (kategori: GorevKategori) => void
  onIptal: () => void
  acik: boolean
}) {
  const [ad, setAd] = useState('')
  const [renk, setRenk] = useState('#4f46e5')
  const KATEGORI_MAX_UZUNLUK = 15

  const handleKaydet = () => {
    if (!ad.trim()) return
    
    const yeniKategori: GorevKategori = {
      id: Date.now().toString(),
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
    <Dialog open={acik} onOpenChange={(open) => !open && onIptal()}>
      <DialogContent 
        className="sm:max-w-[400px] w-[95vw] flex flex-col overflow-hidden"
        onPointerDownOutside={(event) => event.preventDefault()}
      >
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Yeni Kategori Ekle</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="w-full flex-grow min-h-0" type="scroll">
          <div className="grid gap-4 py-4 px-4">
            <div className="grid gap-2">
              <Label htmlFor="kategoriAdi">
                Kategori Adı
              </Label>
              <Input
                id="kategoriAdi"
                value={ad}
                onChange={(e) => {
                  setAd(e.target.value.slice(0, KATEGORI_MAX_UZUNLUK));
                }}
                placeholder="Örn: Spor, Okul, İş..."
                maxLength={KATEGORI_MAX_UZUNLUK}
              />
              <div className="text-xs text-right text-muted-foreground">
                {ad.length}/{KATEGORI_MAX_UZUNLUK}
              </div>
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
        </ScrollArea>

        <DialogFooter className="flex-shrink-0 pt-2">
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

const BASLIK_MAX_UZUNLUK = 20
const ACIKLAMA_MAX_UZUNLUK = 100

export default function GorevFormu({ onKaydet, onIptal, baslangicTarihi, duzenlenecekGorev, kategoriler = [], onKategoriEkle }: GorevFormuProps) {
  const [baslik, setBaslik] = useState(duzenlenecekGorev?.baslik || "")
  const [aciklama, setAciklama] = useState(duzenlenecekGorev?.aciklama || "")
  const [tarih, setTarih] = useState<Date | undefined>(
    duzenlenecekGorev?.tarih ? new Date(duzenlenecekGorev.tarih) : baslangicTarihi || undefined,
  )
  const [baslangicSaati, setBaslangicSaati] = useState(duzenlenecekGorev?.baslangicSaati || "")
  const [bitisSaati, setBitisSaati] = useState(duzenlenecekGorev?.bitisSaati || "")
  const [oncelik, setOncelik] = useState(duzenlenecekGorev?.oncelik || "orta")
  const [durum, setDurum] = useState(duzenlenecekGorev?.durum || "Yapılacak")
  const [kategori, setKategori] = useState(duzenlenecekGorev?.kategori || "varsayilan")
  const [hataMesaji, setHataMesaji] = useState<string | null>(null)
  const [kategoriFormuAcik, setKategoriFormuAcik] = useState(false)

  // Geçmiş tarih kontrolü için fonksiyon
  const tarihKontrol = (date: Date | undefined) => {
    if (date && isBefore(startOfDay(date), startOfDay(new Date()))) {
      setHataMesaji("Geçmiş tarihe görev eklenemez! Lütfen bugün veya gelecek bir tarih seçin.")
      return false
    }
    setHataMesaji(null)
    return true
  }

  // Tarih değiştiğinde kontrol et
  const handleTarihDegisim = (date: Date | undefined) => {
    setTarih(date)
    if (date) {
      tarihKontrol(date)
    } else {
      setHataMesaji(null)
    }
  }

  // Başlık değiştiğinde uzunluk kontrolü
  const handleBaslikDegisim = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBaslik(e.target.value.slice(0, BASLIK_MAX_UZUNLUK))
  }

  // Açıklama değiştiğinde uzunluk kontrolü
  const handleAciklamaDegisim = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAciklama(e.target.value.slice(0, ACIKLAMA_MAX_UZUNLUK))
  }

  const handleKaydet = () => {
    if (!baslik.trim()) {
      setHataMesaji("Görev başlığı boş olamaz!")
      return
    }

    // Tarih seçilmişse geçmiş tarih kontrolü yap
    if (tarih && !tarihKontrol(tarih)) {
      return
    }

    const yeniGorev: Gorev = {
      id: duzenlenecekGorev?.id || Date.now().toString(),
      baslik,
      aciklama,
      tarih: tarih ? tarih.toISOString() : undefined,
      baslangicSaati,
      bitisSaati,
      oncelik,
      durum,
      kategori,
    }

    onKaydet(yeniGorev)
  }

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onIptal()}>
      <DialogContent 
        className="sm:max-w-[500px] w-[95vw] max-h-[90vh] flex flex-col overflow-hidden"
        onPointerDownOutside={(event) => event.preventDefault()}
      >
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>{duzenlenecekGorev ? "Görevi Düzenle" : "Yeni Görev Ekle"}</DialogTitle>
        </DialogHeader>

        {hataMesaji && (
          <Alert variant="destructive" className="mb-4 flex-shrink-0">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{hataMesaji}</AlertDescription>
          </Alert>
        )}

        <ScrollArea className="w-full flex-grow min-h-0" style={{ height: "calc(70vh - 80px)" }} type="scroll">
          <div className="grid gap-4 py-4 px-4">
            <div className="grid gap-2">
              <Label htmlFor="baslik">
                Başlık
              </Label>
              <Input 
                id="baslik" 
                value={baslik} 
                onChange={handleBaslikDegisim} 
                placeholder="Görev başlığı" 
                maxLength={BASLIK_MAX_UZUNLUK}
              />
              <div className="text-xs text-right text-muted-foreground">
                {baslik.length}/{BASLIK_MAX_UZUNLUK}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="aciklama">
                Açıklama
              </Label>
              <ScrollArea
                className="min-h-[80px] w-full rounded-md border border-input bg-background focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background"
                type="scroll"
              >
                <Textarea
                  id="aciklama"
                  value={aciklama}
                  onChange={handleAciklamaDegisim}
                  placeholder="Görev açıklaması"
                  className="w-full resize-none border-none rounded-none bg-transparent px-3 py-2 shadow-none focus-visible:ring-0 focus-visible:outline-none min-h-[calc(80px-4px)]"
                  maxLength={ACIKLAMA_MAX_UZUNLUK}
                />
              </ScrollArea>
              <div className="text-xs text-right text-muted-foreground">
                {aciklama.length}/{ACIKLAMA_MAX_UZUNLUK}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="kategori">Kategori</Label>
              <Select value={kategori} onValueChange={setKategori}>
                <SelectTrigger id="kategori">
                  <SelectValue placeholder="Kategori seçin" />
                </SelectTrigger>
                <SelectContent>
                  {kategoriler.map((kat) => (
                    <SelectItem key={kat.id} value={kat.id}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="h-3 w-3 rounded-full" 
                          style={{ backgroundColor: kat.renk }}
                        />
                        {kat.ad}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="link" onClick={() => setKategoriFormuAcik(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Yeni Kategori Ekle
              </Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Tarih</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      className={`justify-start text-left font-normal ${hataMesaji && tarih ? 'border-red-500' : ''}`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {tarih ? format(tarih, "d MMMM yyyy", { locale: tr }) : "Tarih seçin"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar 
                      mode="single" 
                      selected={tarih} 
                      onSelect={handleTarihDegisim} 
                      locale={tr}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="oncelik">Öncelik</Label>
                <Select value={oncelik} onValueChange={setOncelik}>
                  <SelectTrigger id="oncelik">
                    <SelectValue placeholder="Öncelik seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="düşük">Düşük</SelectItem>
                    <SelectItem value="orta">Orta</SelectItem>
                    <SelectItem value="yüksek">Yüksek</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>          
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="baslangicSaati">Başlangıç Saati</Label>
                <Input
                  id="baslangicSaati"
                  type="time"
                  value={baslangicSaati}
                  onChange={(e) => setBaslangicSaati(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="bitisSaati">Bitiş Saati</Label>
                <Input id="bitisSaati" type="time" value={bitisSaati} onChange={(e) => setBitisSaati(e.target.value)} />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="durum">Durum</Label>
              <Select value={durum} onValueChange={setDurum}>
                <SelectTrigger id="durum">
                  <SelectValue placeholder="Durum seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Yapılacak">Yapılacak</SelectItem>
                  <SelectItem value="Devam Ediyor">Devam Ediyor</SelectItem>
                  <SelectItem value="Tamamlandı">Tamamlandı</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="flex-shrink-0 border-t pt-4">
          <Button variant="outline" onClick={onIptal}>
            İptal
          </Button>
          <Button onClick={handleKaydet}>Kaydet</Button>
        </DialogFooter>
      </DialogContent>
      <KategoriFormu
        acik={kategoriFormuAcik}
        onKaydet={(yeniKategori) => {
          onKategoriEkle?.(yeniKategori)
          setKategoriFormuAcik(false)
          setKategori(yeniKategori.id)
        }}
        onIptal={() => setKategoriFormuAcik(false)}
      />
    </Dialog>
  )
}