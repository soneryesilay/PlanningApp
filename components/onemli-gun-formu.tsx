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
import { AlertCircle, CalendarIcon } from "lucide-react"
import { format, isBefore, startOfDay } from "date-fns"
import { tr } from "date-fns/locale"
import type { OnemliGun } from "@/lib/types"
import { Alert, AlertDescription } from "./ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"

interface OnemliGunFormuProps {
  onemliGun?: OnemliGun
  onKaydet: (onemliGun: OnemliGun) => void
  onIptal: () => void
  baslangicTarihi?: Date
}

const BASLIK_MAX_UZUNLUK = 50;
const ACIKLAMA_MAX_UZUNLUK = 200;

export default function OnemliGunFormu({ onemliGun, onKaydet, onIptal, baslangicTarihi }: OnemliGunFormuProps) {
  const [baslik, setBaslik] = useState(onemliGun?.baslik || "")
  const [aciklama, setAciklama] = useState(onemliGun?.aciklama || "")
  const [tarih, setTarih] = useState<Date | undefined>(onemliGun?.tarih ? new Date(onemliGun.tarih) : baslangicTarihi || undefined)
  const [renk, setRenk] = useState(onemliGun?.renk || "mavi")
  const [kategori, setKategori] = useState(onemliGun?.kategori || "genel")
  const [hataMesaji, setHataMesaji] = useState<string | null>(null)

  // Geçmiş tarih kontrolü için fonksiyon
  const tarihKontrol = (date: Date | undefined) => {
    if (date && isBefore(startOfDay(date), startOfDay(new Date()))) {
      setHataMesaji("Geçmiş tarihe önemli gün eklenemez! Lütfen bugün veya gelecek bir tarih seçin.")
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

  const handleKaydet = () => {
    if (!baslik.trim()) {
      setHataMesaji("Başlık boş olamaz!")
      return
    }

    if (!tarih) {
      setHataMesaji("Tarih seçmelisiniz!")
      return
    }

    // Geçmiş tarih kontrolü
    if (!tarihKontrol(tarih)) {
      return
    }

    const yeniOnemliGun: OnemliGun = {
      id: onemliGun?.id || Date.now().toString(),
      baslik,
      aciklama,
      tarih: tarih.toISOString(),
      renk,
      kategori,
    }

    onKaydet(yeniOnemliGun)
  }

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onIptal()}>
      <DialogContent 
        className="sm:max-w-[500px]"
        onPointerDownOutside={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{onemliGun ? "Önemli Günü Düzenle" : "Yeni Önemli Gün Ekle"}</DialogTitle>
        </DialogHeader>

        {hataMesaji && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{hataMesaji}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="baslik">Başlık</Label>
            <Input
              id="baslik"
              value={baslik}
              onChange={(e) => setBaslik(e.target.value.slice(0, BASLIK_MAX_UZUNLUK))}
              placeholder="Örn: Sınav, Doğum Günü, Proje Teslimi"
              maxLength={BASLIK_MAX_UZUNLUK}
            />
            <div className="text-xs text-right text-muted-foreground">
              {baslik.length}/{BASLIK_MAX_UZUNLUK}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="aciklama">Açıklama (İsteğe Bağlı)</Label>
            <ScrollArea
              className="min-h-[80px] w-full rounded-md border border-input bg-background focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background"
              type="scroll"
            >
              <Textarea
                id="aciklama"
                value={aciklama}
                onChange={(e) => setAciklama(e.target.value.slice(0, ACIKLAMA_MAX_UZUNLUK))}
                placeholder="Detaylar..."
                className="w-full resize-none border-none rounded-none bg-transparent px-3 py-2 shadow-none focus-visible:ring-0 focus-visible:outline-none min-h-[calc(80px-4px)]"
                maxLength={ACIKLAMA_MAX_UZUNLUK}
              />
            </ScrollArea>
            <div className="text-xs text-right text-muted-foreground">
              {aciklama.length}/{ACIKLAMA_MAX_UZUNLUK}
            </div>
          </div>

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
                  disabled={(date) => isBefore(date, startOfDay(new Date()))}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="renk">Renk</Label>
              <Select value={renk} onValueChange={setRenk}>
                <SelectTrigger id="renk">
                  <SelectValue placeholder="Renk seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kirmizi">Kırmızı</SelectItem>
                  <SelectItem value="yesil">Yeşil</SelectItem>
                  <SelectItem value="mavi">Mavi</SelectItem>
                  <SelectItem value="mor">Mor</SelectItem>
                  <SelectItem value="turuncu">Turuncu</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="kategori">Kategori</Label>
              <Select value={kategori} onValueChange={setKategori}>
                <SelectTrigger id="kategori">
                  <SelectValue placeholder="Kategori seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="genel">Genel</SelectItem>
                  <SelectItem value="okul">Okul</SelectItem>
                  <SelectItem value="is">İş</SelectItem>
                  <SelectItem value="kisisel">Kişisel</SelectItem>
                  <SelectItem value="etkinlik">Etkinlik</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onIptal}>
            İptal
          </Button>
          <Button onClick={handleKaydet}>Kaydet</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
