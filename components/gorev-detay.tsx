"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import type { Gorev, GorevKategori } from "@/lib/types"
import GorevFormu from "@/components/gorev-formu"

interface GorevDetayProps {
  gorev: Gorev
  onKapat: () => void
  onGuncelle: (gorev: Gorev) => void
  kategoriler: GorevKategori[]
  onKategoriEkle?: (kategori: GorevKategori) => void
}

export default function GorevDetay({ gorev, onKapat, onGuncelle, kategoriler, onKategoriEkle }: GorevDetayProps) {
  const [duzenlemeModu, setDuzenlemeModu] = useState(false)

  const oncelikRengi = (oncelik: string) => {
    switch (oncelik) {
      case "yüksek":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "orta":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "düşük":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
    }
  }

  const durumRengi = (durum: string) => {
    switch (durum) {
      case "Yapılacak":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "Devam Ediyor":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "Tamamlandı":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  // Görevin kategorisini bul
  const gorevKategori = kategoriler.find(k => k.id === gorev.kategori) || { id: 'varsayilan', ad: 'Genel', renk: '#4f46e5' };

  return (
    <>
      {duzenlemeModu ? (        <GorevFormu 
          duzenlenecekGorev={gorev} 
          onKaydet={onGuncelle} 
          onIptal={() => setDuzenlemeModu(false)} 
          kategoriler={kategoriler}
          onKategoriEkle={onKategoriEkle}
        />
      ) : (
        <Dialog open={true} onOpenChange={(open) => !open && onKapat()}>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>{gorev.baslik}</DialogTitle>
            </DialogHeader>

            <div className="py-4 space-y-4 overflow-y-auto max-h-[calc(90vh-150px)]">
              <div className="flex flex-wrap gap-2">
                <Badge className={oncelikRengi(gorev.oncelik)}>Öncelik: {gorev.oncelik}</Badge>
                <Badge className={durumRengi(gorev.durum)}>{gorev.durum}</Badge>
                <Badge 
                  style={{ backgroundColor: `${gorevKategori.renk}20`, color: gorevKategori.renk }}
                  className="border"
                >
                  <div className="flex items-center gap-1.5">
                    <div 
                      className="h-2.5 w-2.5 rounded-full" 
                      style={{ backgroundColor: gorevKategori.renk }}
                    />
                    {gorevKategori.ad}
                  </div>
                </Badge>
              </div>

              {gorev.tarih && (
                <div>
                  <p className="text-sm font-medium">Tarih:</p>
                  <p>{format(new Date(gorev.tarih), "d MMMM yyyy", { locale: tr })}</p>
                </div>
              )}

              {gorev.baslangicSaati && gorev.bitisSaati && (
                <div>
                  <p className="text-sm font-medium">Saat:</p>
                  <p>
                    {gorev.baslangicSaati} - {gorev.bitisSaati}
                  </p>
                </div>
              )}              {gorev.aciklama && (
                <div>
                  <p className="text-sm font-medium">Açıklama:</p>
                  <div className="max-h-[200px] overflow-y-auto overflow-x-hidden pr-2 custom-scrollbar">
                    <p className="break-words whitespace-pre-line" style={{ 
                      overflowWrap: "break-word", 
                      lineHeight: "1.5" 
                    }}>{gorev.aciklama}</p>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={onKapat}>
                Kapat
              </Button>
              <Button onClick={() => setDuzenlemeModu(true)}>Düzenle</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
