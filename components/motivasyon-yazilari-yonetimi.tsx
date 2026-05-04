"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from "@/components/ui/tooltip"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Plus, Edit, Trash2, MessageSquarePlus, Check, X } from "lucide-react"
import { MotivasyonYazisi } from "@/lib/types"
import { motion, AnimatePresence } from "framer-motion"
import { ScrollArea } from "@/components/ui/scroll-area"

interface MotivasyonYazilariYonetimiProps {
  motivasyonYazilari: MotivasyonYazisi[]
  onMotivasyonYazisiEkle: (yazi: MotivasyonYazisi) => void
  onMotivasyonYazisiGuncelle: (yazi: MotivasyonYazisi) => void
  onMotivasyonYazisiSil: (yaziId: string) => void
}

const YAZI_MAX_UZUNLUK = 50;

export default function MotivasyonYazilariYonetimi({
  motivasyonYazilari,
  onMotivasyonYazisiEkle,
  onMotivasyonYazisiGuncelle,
  onMotivasyonYazisiSil,
}: MotivasyonYazilariYonetimiProps) {
  const [yeniYazi, setYeniYazi] = useState("")
  const [duzenlemeModu, setDuzenlemeModu] = useState(false)
  const [duzenlenecekYazi, setDuzenlecekYazi] = useState<MotivasyonYazisi | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [animasyonluSatirlar, setAnimasyonluSatirlar] = useState<{[key: string]: boolean}>({})

  // İlk render'da tüm yazıları aktif animasyon durumu olarak işaretleyelim
  useEffect(() => {
    const satirDurumlari = motivasyonYazilari.reduce((acc, yazi) => {
      acc[yazi.id] = true;
      return acc;
    }, {} as {[key: string]: boolean});
    
    setAnimasyonluSatirlar(satirDurumlari);
  }, []);

  // Yazı ekle fonksiyonu
  const yazıEkle = () => {
    if (yeniYazi.trim() === "" || yeniYazi.length > YAZI_MAX_UZUNLUK) return

    const yeniMotivasyonYazisi: MotivasyonYazisi = {
      id: crypto.randomUUID(),
      icerik: yeniYazi,
      tarih: new Date().toISOString(),
      aktif: true
    }

    onMotivasyonYazisiEkle(yeniMotivasyonYazisi)
    setYeniYazi("")
    setIsDialogOpen(false)
    
    // Yeni yazıyı animasyonlu olarak işaretle
    setAnimasyonluSatirlar(prev => ({...prev, [yeniMotivasyonYazisi.id]: true}))
  }

  // Yazıyı düzenleme moduna al
  const duzenlemeyeBasla = (yazi: MotivasyonYazisi) => {
    setDuzenlemeModu(true)
    setDuzenlecekYazi(yazi)
    setYeniYazi(yazi.icerik)
    setIsDialogOpen(true)
  }

  // Yazıyı güncelle
  const yaziGuncelle = () => {
    if (!duzenlenecekYazi || yeniYazi.trim() === "" || yeniYazi.length > YAZI_MAX_UZUNLUK) return

    const guncelYazi: MotivasyonYazisi = {
      ...duzenlenecekYazi,
      icerik: yeniYazi,
    }

    onMotivasyonYazisiGuncelle(guncelYazi)
    setDuzenlemeModu(false)
    setDuzenlecekYazi(null)
    setYeniYazi("")
    setIsDialogOpen(false)
  }

  // Yazının aktiflik durumunu değiştir
  const aktiflikDegistir = (yazi: MotivasyonYazisi) => {
    const guncelYazi: MotivasyonYazisi = {
      ...yazi,
      aktif: !yazi.aktif,
    }
    
    onMotivasyonYazisiGuncelle(guncelYazi)
  }

  // Diyaloğu kapat ve formu sıfırla
  const dialoguKapat = () => {
    setDuzenlemeModu(false)
    setDuzenlecekYazi(null)
    setYeniYazi("")
    setIsDialogOpen(false)
  }

  // Aktif yazı sayısını hesapla
  const aktifYaziSayisi = motivasyonYazilari.filter(yazi => yazi.aktif).length

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="grid grid-cols-1 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <MessageSquarePlus className="h-5 w-5" />
                Motivasyon Yazıları
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="flex items-center gap-1">
                    <Plus className="h-4 w-4" />
                    <span>Yeni Yazı Ekle</span>
                  </Button>
                </DialogTrigger>                <DialogContent 
                  className="transition-all duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
                  onPointerDownOutside={(event) => event.preventDefault()}
                >
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <DialogHeader>
                      <DialogTitle>
                        {duzenlemeModu ? "Motivasyon Yazısını Düzenle" : "Yeni Motivasyon Yazısı Ekle"}
                      </DialogTitle>
                      <DialogDescription>
                        {duzenlemeModu
                          ? "Motivasyon yazısını değiştirerek güncelleyebilirsiniz."
                          : "Yeni bir motivasyon yazısı eklemek için aşağıdaki alanı doldurun."}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <ScrollArea
                        className="min-h-[80px] w-full rounded-md border border-input bg-background focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background"
                        type="scroll"
                      >
                        <Textarea
                          value={yeniYazi}
                          onChange={(e) => setYeniYazi(e.target.value.slice(0, YAZI_MAX_UZUNLUK))}
                          placeholder="Motivasyon yazınızı buraya girin..."
                          className="w-full resize-none border-none rounded-none bg-transparent px-3 py-2 shadow-none focus-visible:ring-0 focus-visible:outline-none min-h-[calc(80px-4px)]"
                          maxLength={YAZI_MAX_UZUNLUK}
                        />
                      </ScrollArea>
                      <div className="text-xs text-right text-muted-foreground mt-1">
                        {yeniYazi.length}/{YAZI_MAX_UZUNLUK}
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={dialoguKapat}>İptal</Button>
                      <Button onClick={duzenlemeModu ? yaziGuncelle : yazıEkle} disabled={yeniYazi.trim() === "" || yeniYazi.length > YAZI_MAX_UZUNLUK}>
                        {duzenlemeModu ? "Güncelle" : "Ekle"}
                      </Button>
                    </DialogFooter>
                  </motion.div>
                </DialogContent>
              </Dialog>
            </CardTitle>
            <CardDescription>
              Kendi motivasyon yazılarınızı ekleyin, düzenleyin ve yönetin. Aktif olan yazılar başlık altında dönüşümlü olarak gösterilir.
            </CardDescription>          </CardHeader>
          <CardContent>
            {motivasyonYazilari.length > 0 ? (
              <div className="rounded-md border overflow-hidden relative">
                <Table className="overflow-hidden">
                    <TableCaption>Toplam {motivasyonYazilari.length} yazı, {aktifYaziSayisi} aktif</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Yazı</TableHead>
                        <TableHead className="w-[100px]">Aktif</TableHead>
                        <TableHead className="w-[100px] text-right">İşlemler</TableHead>
                      </TableRow>
                    </TableHeader>                  <TableBody>
                    <AnimatePresence>
                      {motivasyonYazilari.map((yazi) => (
                        <motion.tr
                          key={yazi.id}
                          initial={{ opacity: 0 }}
                          animate={{ 
                            opacity: 1,
                            backgroundColor: yazi.aktif ? "rgba(0, 255, 0, 0.03)" : "transparent"
                          }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          className={`${yazi.aktif ? "bg-green-50 dark:bg-green-950/20" : ""} transition-colors duration-500`}
                        >                          <TableCell className="font-medium overflow-hidden">{yazi.icerik}</TableCell>
                          <TableCell className="overflow-hidden">
                            <div className="flex items-center space-x-2">
                              <motion.div
                                initial={false}
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 0.3 }}
                              >
                                <Switch
                                  id={`aktif-${yazi.id}`}
                                  checked={yazi.aktif}
                                  onCheckedChange={() => aktiflikDegistir(yazi)}
                                />
                              </motion.div>
                              <AnimatePresence mode="wait">
                                {yazi.aktif ? (
                                  <motion.div
                                    key="active"
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <Check className="h-4 w-4 text-green-500" />
                                  </motion.div>
                                ) : (
                                  <motion.div
                                    key="inactive"
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <X className="h-4 w-4 text-gray-300 dark:text-gray-600" />
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </TableCell>                          <TableCell className="text-right overflow-hidden">
                            <div className="flex justify-end gap-2">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      onClick={() => duzenlemeyeBasla(yazi)}
                                    >
                                      <Edit className="h-4 w-4" />
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
                                      onClick={() => onMotivasyonYazisiSil(yazi.id)}
                                    >
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Sil</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <MessageSquarePlus className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-muted-foreground">Henüz motivasyon yazısı eklenmemiş.</p>
                <p className="text-sm text-muted-foreground">Yazılar ekleyerek başlangıç ekranında görünen motivasyon mesajlarını kişiselleştirebilirsiniz.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setIsDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  İlk Yazınızı Ekleyin
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}