"use client"

import { useState, useRef } from "react"
import { v4 as uuidv4 } from "uuid"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Plus, X, Link, Image, Edit } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Not } from "@/lib/types"
import { motion, AnimatePresence } from "framer-motion"
import { isValidHttpUrl } from "@/lib/utils"; // Added import

interface NotFormuProps {
  not?: Not
  onKaydet: (not: Not) => void
  onIptal: () => void
  mevcutEtiketler?: string[]
}

// Karakter sınırları için sabitler
const BASLIK_MAX_UZUNLUK = 50; // Örnek olarak güncelledim, isteğe göre ayarlanabilir
const ICERIK_MAX_UZUNLUK = 10000;
const DETAY_MAX_UZUNLUK = 5000;
const EK_ACIKLAMA_MAX_UZUNLUK = 50;
const EK_URL_MAX_UZUNLUK = 500;
const ETIKET_MAX_UZUNLUK = 35;

export default function NotFormu({ not, onKaydet, onIptal, mevcutEtiketler = [] }: NotFormuProps) {
  const [baslik, setBaslik] = useState(not?.baslik || "")
  const [icerik, setIcerik] = useState(not?.icerik || "")
  const [detay, setDetay] = useState(not?.detay || "") // Yeni DETAY alanı için state
  const [yeniEtiket, setYeniEtiket] = useState("")
  const [etiketler, setEtiketler] = useState<string[]>(not?.etiketler || [])
  const [ekler, setEkler] = useState<Not["ekler"]>(not?.ekler || [])
  const [ekTip, setEkTip] = useState<"resim" | "link" | "youtube">("resim")
  const [ekUrl, setEkUrl] = useState("")
  const [ekAciklama, setEkAciklama] = useState("")
  const [hataMesaji, setHataMesaji] = useState("")
  const [duzenlenenEkIndex, setDuzenlenenEkIndex] = useState<number | null>(null) // Düzenlenen ekin indeksi

  const etiketInputRef = useRef<HTMLInputElement>(null)
  const ekFormRef = useRef<HTMLDivElement>(null) // Ek formu için ref

  const etiketEkle = () => {
    if (yeniEtiket && !etiketler.includes(yeniEtiket)) {
      if (yeniEtiket.length > ETIKET_MAX_UZUNLUK) {
        setHataMesaji(`Etiketler en fazla ${ETIKET_MAX_UZUNLUK} karakter olabilir.`)
        return
      }
      setEtiketler([...etiketler, yeniEtiket])
      setYeniEtiket("")
      setHataMesaji("")
      etiketInputRef.current?.focus()
    }
  }

  const etiketSil = (etiket: string) => {
    setEtiketler(etiketler.filter((e) => e !== etiket))
  }
  const ekEkle = () => {
    if (ekUrl) {
      if (ekTip === "link") {
        if (!isValidHttpUrl(ekUrl)) {
          setHataMesaji("Geçersiz link URL'i. Lütfen http://, https:// veya mailto: ile başlayan bir URL girin.");
          return;
        }
        // Clear specific error message if it was set for links and validation passed
        if (hataMesaji === "Geçersiz link URL'i. Lütfen http://, https:// veya mailto: ile başlayan bir URL girin.") {
          setHataMesaji("");
        }
      } else if (ekTip === "youtube") {
        // YouTube URL kontrolü
        const { isYouTubeUrl } = require("@/lib/utils");
        if (!isValidHttpUrl(ekUrl) || !isYouTubeUrl(ekUrl)) {
          setHataMesaji("Geçersiz YouTube URL'i. Lütfen bir YouTube video linki girin.");
          return;
        }
        if (hataMesaji === "Geçersiz YouTube URL'i. Lütfen bir YouTube video linki girin.") {
          setHataMesaji("");
        }
      } else if (ekTip === "resim") {
        // Validate image URLs to ensure they are http/https URLs
        // isValidHttpUrl also allows mailto:, which is not typical for images,
        // but it effectively blocks javascript: URLs, which is the main concern.
        if (!isValidHttpUrl(ekUrl)) {
          setHataMesaji("Geçersiz resim URL'i. Lütfen http:// veya https:// ile başlayan bir URL girin.");
          return;
        }
        // Clear specific error message if it was set for images and validation passed
        if (hataMesaji === "Geçersiz resim URL'i. Lütfen http:// veya https:// ile başlayan bir URL girin.") {
          setHataMesaji("");
        }
      }

      const yeniEkItem = {
        tip: ekTip,
        url: ekUrl,
        aciklama: ekAciklama || undefined
      }

      if (duzenlenenEkIndex !== null) {
        // Eki güncelle
        const guncellenmisEkler = [...(ekler || [])]
        guncellenmisEkler[duzenlenenEkIndex] = yeniEkItem
        setEkler(guncellenmisEkler)
        setDuzenlenenEkIndex(null) // Düzenleme modunu kapat
      } else {
        // Yeni ek ekle
        setEkler([...(ekler || []), yeniEkItem])
      }
      setEkUrl("")
      setEkAciklama("")
      setEkTip("resim") // Varsayılan tipe dön
      setHataMesaji("") // Hata mesajını temizle
      // Forma scroll yap
      ekFormRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  const ekSil = (index: number) => {
    const yeniEkler = [...(ekler || [])]
    yeniEkler.splice(index, 1)
    setEkler(yeniEkler)
  }

  const ekDuzenlemeyeBasla = (index: number) => {
    const ek = ekler?.[index]
    if (ek) {
      setDuzenlenenEkIndex(index)
      setEkTip(ek.tip)
      setEkUrl(ek.url)
      setEkAciklama(ek.aciklama || "")
      // Forma scroll yap
      ekFormRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  const ekDuzenlemeyiIptalEt = () => {
    setDuzenlenenEkIndex(null)
    setEkUrl("")
    setEkAciklama("")
    setEkTip("resim")
    setHataMesaji("")
  }

  const notKaydet = () => {
    if (!baslik) {
      setHataMesaji("Not başlığı zorunludur.")
      return
    }

    const yeniNot: Not = {
      id: not?.id || uuidv4(),
      baslik,
      icerik,
      detay, // Yeni DETAY alanını kaydet
      tarih: not?.tarih || new Date().toISOString(),
      etiketler: etiketler.length > 0 ? etiketler : undefined,
      ekler: ekler && ekler.length > 0 ? ekler : undefined
    }

    onKaydet(yeniNot)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      if (yeniEtiket.length > ETIKET_MAX_UZUNLUK) {
        setHataMesaji(`Etiketler en fazla ${ETIKET_MAX_UZUNLUK} karakter olabilir.`)
        return
      }
      etiketEkle()
    }
  }

  return (
    <Dialog open={true} onOpenChange={onIptal}>
      <DialogContent 
        className="sm:max-w-[500px] md:max-w-[600px] lg:max-w-[650px] max-h-[90vh] w-full flex flex-col overflow-hidden"
        onPointerDownOutside={(event) => event.preventDefault()}
      >
        <DialogHeader className="p-4 pb-2 px-6 flex-shrink-0">
          <DialogTitle>{not ? "Notu Düzenle" : "Yeni Not Ekle"}</DialogTitle>
        </DialogHeader>

        {hataMesaji && (
          <Alert variant="destructive" className="mx-4 mb-2 flex-shrink-0">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{hataMesaji}</AlertDescription>
          </Alert>
        )}
        <ScrollArea className="w-full flex-grow min-h-0" style={{ height: "calc(70vh - 80px)" }} type="scroll">
          <div className="grid gap-4 py-4 pb-8 w-full px-6">
            <div className="grid gap-2">
              <Label htmlFor="baslik">Başlık</Label>
              <Input
                id="baslik"
                value={baslik}
                onChange={(e) => setBaslik(e.target.value.slice(0, BASLIK_MAX_UZUNLUK))}
                placeholder="Not başlığı"
                className="w-full"
                maxLength={BASLIK_MAX_UZUNLUK}
              />
              <div className="text-xs text-right text-muted-foreground">
                {baslik.length}/{BASLIK_MAX_UZUNLUK}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="icerik">İçerik</Label>
              <ScrollArea
                className="min-h-[120px] w-full rounded-md border border-input bg-background focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background"
                type="scroll"
              >
                <Textarea
                  id="icerik"
                  value={icerik}
                  onChange={(e) => setIcerik(e.target.value.slice(0, ICERIK_MAX_UZUNLUK))}
                  placeholder="Not içeriği"
                  className="w-full resize-none border-none rounded-none bg-transparent px-3 py-2 shadow-none focus-visible:ring-0 focus-visible:outline-none min-h-[calc(120px-4px)]"
                  maxLength={ICERIK_MAX_UZUNLUK}
                  style={{
                    wordBreak: "break-word",
                    overflowWrap: "break-word",
                    whiteSpace: "pre-wrap",
                    lineHeight: "1.5"
                  }}
                />
              </ScrollArea>
              <div className="text-xs text-right text-muted-foreground">
                {icerik.length}/{ICERIK_MAX_UZUNLUK}
              </div>
            </div>

            {/* Yeni DETAY alanı */}
            <div className="grid gap-2">
              <Label htmlFor="detay">Detay</Label>
              <ScrollArea
                className="min-h-[80px] w-full rounded-md border border-input bg-background focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background"
                type="scroll"
              >
                <Textarea
                  id="detay"
                  value={detay}
                  onChange={(e) => setDetay(e.target.value.slice(0, DETAY_MAX_UZUNLUK))}
                  placeholder="Ek detaylar (isteğe bağlı)"
                  className="w-full resize-none border-none rounded-none bg-transparent px-3 py-2 shadow-none focus-visible:ring-0 focus-visible:outline-none min-h-[calc(80px-4px)]"
                  maxLength={DETAY_MAX_UZUNLUK}
                  style={{
                    wordBreak: "break-word",
                    overflowWrap: "break-word",
                    whiteSpace: "pre-wrap",
                    lineHeight: "1.5"
                  }}
                />
              </ScrollArea>
              <div className="text-xs text-right text-muted-foreground">
                {detay.length}/{DETAY_MAX_UZUNLUK}
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Etiketler</Label>
              <motion.div 
                className="flex flex-wrap gap-2 mb-2"
                layout
              >
                <AnimatePresence mode="popLayout">
                  {etiketler.map((etiket) => (
                    <motion.div
                      key={etiket}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                      layout
                    >
                      <Badge className="flex items-center gap-1">
                        {etiket}
                        <motion.div
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <X 
                            className="h-3 w-3 cursor-pointer" 
                            onClick={() => etiketSil(etiket)}
                          />
                        </motion.div>
                      </Badge>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
              <div className="flex gap-2">                <div className="flex-1 relative">
                  <div className="relative">
                    <Input
                      ref={etiketInputRef}
                      value={yeniEtiket}
                      onChange={(e) => setYeniEtiket(e.target.value)}
                      placeholder="Yeni etiket (max 35 karakter)"
                      onKeyDown={handleKeyDown}
                      className="w-full"
                      maxLength={ETIKET_MAX_UZUNLUK}
                    />
                    {yeniEtiket && (
                      <div className={`absolute right-2 top-1/2 transform -translate-y-1/2 text-xs ${yeniEtiket.length > (ETIKET_MAX_UZUNLUK - 5) ? 'text-amber-500' : 'text-muted-foreground'}`}>
                        {yeniEtiket.length}/{ETIKET_MAX_UZUNLUK}
                      </div>
                    )}
                  </div>
                  <AnimatePresence>
                    {yeniEtiket && mevcutEtiketler.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-10"
                      >
                        <div className="p-2">
                          <div className="text-xs text-muted-foreground mb-1">Mevcut Etiketler</div>
                          <motion.div 
                            className="flex flex-wrap gap-1"
                            layout
                          >
                            <AnimatePresence mode="popLayout">                              {mevcutEtiketler
                                .filter(etiket => 
                                  etiket.toLowerCase().includes(yeniEtiket.toLowerCase()) && 
                                  !etiketler.includes(etiket) &&
                                  etiket.length <= ETIKET_MAX_UZUNLUK
                                )
                                .map((etiket, index) => (
                                  <motion.div
                                    key={etiket}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    transition={{ delay: index * 0.05 }}
                                    layout
                                  >                                    <Badge
                                      variant="secondary"
                                      className={`cursor-pointer hover:bg-primary/10 ${etiket.length > ETIKET_MAX_UZUNLUK ? 'opacity-50' : ''}`}
                                      onClick={() => {
                                        if (etiket.length > ETIKET_MAX_UZUNLUK) {
                                          setHataMesaji(`Etiketler en fazla ${ETIKET_MAX_UZUNLUK} karakter olabilir.`)
                                          return
                                        }
                                        setEtiketler([...etiketler, etiket])
                                        setYeniEtiket("")
                                        setHataMesaji("")
                                      }}
                                    >
                                      {etiket.length > ETIKET_MAX_UZUNLUK ? `${etiket.slice(0, ETIKET_MAX_UZUNLUK - 3)}...` : etiket}
                                    </Badge>
                                  </motion.div>
                                ))}
                            </AnimatePresence>
                          </motion.div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  tabIndex={-1}
                >
                  <Button type="button" size="sm" onClick={etiketEkle}>
                    <Plus className="h-4 w-4 mr-1" />
                    Ekle
                  </Button>
                </motion.div>
              </div>
            </div>

            {/* Ekler Bölümü */}
            <motion.div 
              className="pt-3" // Removed border-t
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Label className="mb-2 block">Ekler</Label>
              
              {/* Eklenen bağlantıların görüntülenmesi */}
              <AnimatePresence mode="popLayout">
                {ekler && ekler.length > 0 && (
                  <motion.div 
                    className="space-y-2 mb-4 w-full"
                    layout
                  >
                    {ekler.map((ek, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        layout
                        className="border rounded-md overflow-hidden w-full"
                      >
                        <div className="flex items-center p-2 w-full">
                          {/* Resim */}
                          {ek.tip === "resim" && (
                            <motion.div 
                              className="flex items-center w-full"
                              whileHover={{ scale: 1.01 }}
                            >
                              <Image className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0" />
                              <div className="overflow-hidden flex-1">
                                <span className="text-sm truncate inline-block max-w-full" style={{ maxWidth: "200px" }}>
                                  {ek.aciklama || ek.url}
                                </span>
                              </div>
                              <motion.div
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                                className="ml-1"
                              >
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 p-0"
                                  onClick={() => ekDuzenlemeyeBasla(index)}
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </Button>
                              </motion.div>
                            </motion.div>
                          )}                          {/* Link */}
                          {ek.tip === "link" && (
                            <motion.div 
                              className="flex items-center w-full"
                              whileHover={{ scale: 1.01 }}
                            >
                              <Link className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                              <div className="overflow-hidden flex-1">
                                <a 
                                  href={ek.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-600 hover:underline truncate inline-block max-w-full"
                                  style={{ maxWidth: "200px" }}
                                  title={ek.aciklama || ek.url}
                                >
                                  {ek.aciklama || ek.url}
                                </a>
                              </div>
                              <motion.div
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                                className="ml-1"
                              >
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 p-0"
                                  onClick={() => ekDuzenlemeyeBasla(index)}
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </Button>
                              </motion.div>
                            </motion.div>
                          )}
                          
                          {/* YouTube */}
                          {ek.tip === "youtube" && (
                            <motion.div 
                              className="flex items-center w-full"
                              whileHover={{ scale: 1.01 }}
                            >
                              <svg 
                                className="h-4 w-4 text-red-500 mr-2 flex-shrink-0"
                                viewBox="0 0 24 24" 
                                fill="currentColor"
                              >
                                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                              </svg>
                              <div className="overflow-hidden flex-1">
                                <a 
                                  href={ek.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-600 hover:underline truncate inline-block max-w-full"
                                  style={{ maxWidth: "200px" }}
                                  title={ek.aciklama || ek.url}
                                >
                                  {ek.aciklama || "YouTube Video"}
                                </a>
                              </div>
                              <motion.div
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                                className="ml-1"
                              >
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 p-0"
                                  onClick={() => ekDuzenlemeyeBasla(index)}
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </Button>
                              </motion.div>
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Ek Ekleme Formu */}
              <motion.div 
                ref={ekFormRef}
                className="space-y-3 w-full"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <motion.div 
                  className="flex flex-wrap gap-2"
                  layout
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    tabIndex={-1}
                  >
                    <Button 
                      type="button" 
                      variant={ekTip === "resim" ? "default" : "outline"}
                      size="sm" 
                      onClick={() => setEkTip("resim")}
                    >
                      <Image className="h-4 w-4 mr-1" /> 
                      Resim
                    </Button>
                  </motion.div>                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    tabIndex={-1}
                  >
                    <Button 
                      type="button" 
                      variant={ekTip === "link" ? "default" : "outline"}
                      size="sm" 
                      onClick={() => setEkTip("link")}
                    >
                      <Link className="h-4 w-4 mr-1" /> 
                      Link
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    tabIndex={-1}
                  >
                    <Button 
                      type="button" 
                      variant={ekTip === "youtube" ? "default" : "outline"}
                      size="sm" 
                      onClick={() => setEkTip("youtube")}
                    >
                      <svg 
                        className="h-4 w-4 mr-1"
                        viewBox="0 0 24 24" 
                        fill="currentColor"
                      >
                        <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                      </svg>
                      YouTube
                    </Button>
                  </motion.div>
                </motion.div>
                
                <motion.div
                  className="flex flex-col gap-1"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: 0.2 }}
                >
                  <Label htmlFor="ekUrl" className="text-sm">URL</Label>
                  <Input
                    id="ekUrl"
                    value={ekUrl}
                    onChange={(e) => setEkUrl(e.target.value.slice(0, EK_URL_MAX_UZUNLUK))}
                    placeholder={
                      ekTip === "resim" ? "Resim URL'i" : 
                      ekTip === "youtube" ? "YouTube Video URL'i" : "Link URL'i"
                    }
                    className="max-w-full overflow-hidden"
                    maxLength={EK_URL_MAX_UZUNLUK}
                  />
                  <div className="text-xs text-right text-muted-foreground">
                    {ekUrl.length}/{EK_URL_MAX_UZUNLUK}
                  </div>
                </motion.div>
                
                <motion.div 
                  className="flex flex-col gap-1"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: 0.3 }}
                >
                  <Label htmlFor="ekAciklama" className="text-sm">Açıklama</Label>
                  <Input
                    id="ekAciklama"
                    value={ekAciklama}
                    onChange={(e) => setEkAciklama(e.target.value.slice(0, EK_ACIKLAMA_MAX_UZUNLUK))}
                    placeholder="Açıklama (isteğe bağlı)"
                    className="max-w-full"
                    maxLength={EK_ACIKLAMA_MAX_UZUNLUK}
                  />
                  <div className="text-xs text-right text-muted-foreground">
                    {ekAciklama.length}/{EK_ACIKLAMA_MAX_UZUNLUK}
                  </div>
                </motion.div>
                
                <Button 
                  type="button" 
                  onClick={ekEkle} 
                  disabled={!ekUrl}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  {duzenlenenEkIndex !== null ? "Eki Güncelle" : "Ek Ekle"}
                </Button>
                {duzenlenenEkIndex !== null && (
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={ekDuzenlemeyiIptalEt}
                    className="ml-2"
                  >
                    İptal
                  </Button>
                )}
              </motion.div>
            </motion.div>
          </div>        
        </ScrollArea>
        
        <DialogFooter className="border-t p-6 pt-8 mt-0 px-6 flex-shrink-0">
          <div className="flex gap-2 justify-end w-full">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button variant="outline" onClick={onIptal}>
                İptal
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button onClick={notKaydet}>
                Kaydet
              </Button>
            </motion.div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}