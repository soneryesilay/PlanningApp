"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import {
  Tag,
  ExternalLink,
  Image as ImageIcon,
  Edit,
  Trash2,
  ArchiveRestore,
} from "lucide-react"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import type { Not } from "@/lib/types"
import { motion } from "framer-motion"
import { getYouTubeVideoId } from "@/lib/utils"

interface NotGoruntulemeFormuProps {
  detayGoruntulenenNot: Not | null
  gorunumModu: "kart" | "liste" | "copKutusu"
  onNotDetayiniKapat: () => void
  onGetEtiketRengi: (etiket: string) => string
  onNotuGeriGetir: (not: Not) => void
  onNotuKaliciSil: (notId: string) => void
  onNotDuzenle: (not: Not) => void
  onNotuCopKutusunaTasi: (notId: string) => void
}

export default function NotGoruntulemeFormu({
  detayGoruntulenenNot,
  gorunumModu,
  onNotDetayiniKapat,
  onGetEtiketRengi,
  onNotuGeriGetir,
  onNotuKaliciSil,
  onNotDuzenle,
  onNotuCopKutusunaTasi,
}: NotGoruntulemeFormuProps) {
  if (!detayGoruntulenenNot) {
    return null
  }

  return (
    <Dialog open={!!detayGoruntulenenNot} onOpenChange={onNotDetayiniKapat}>
      <DialogContent
        className="sm:max-w-md md:max-w-xl lg:max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
        onPointerDownOutside={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{detayGoruntulenenNot.baslik}</DialogTitle>
          <div className="text-sm text-muted-foreground">
            {format(new Date(detayGoruntulenenNot.tarih), "d MMMM yyyy", {
              locale: tr,
            })}
          </div>

          {detayGoruntulenenNot.etiketler &&
            detayGoruntulenenNot.etiketler.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {detayGoruntulenenNot.etiketler.map((etiket) => (
                  <Badge
                    key={etiket}
                    className={onGetEtiketRengi(etiket)}
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {etiket}
                  </Badge>
                ))}
              </div>
            )}
        </DialogHeader>

        <ScrollArea className="w-full flex-grow min-h-0" style={{ height: "calc(70vh - 80px)" }} type="scroll">

          <div className="py-4 space-y-4">
            {/* Not İçeriği */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">İçerik</h4>
              <div className="p-4 border rounded-md bg-muted/5">
                <div
                  className="whitespace-pre-wrap"
                  style={{
                    wordBreak: "break-word",
                    overflowWrap: "break-word",
                    whiteSpace: "pre-wrap",
                    lineHeight: "1.7",
                    maxWidth: "100%",
                  }}
                >
                  {detayGoruntulenenNot.icerik}
                </div>
              </div>
            </div>

            {/* Ekler */}
            {detayGoruntulenenNot.ekler &&
              detayGoruntulenenNot.ekler.length > 0 && (
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h4 className="text-sm font-medium">
                    Ekler ({detayGoruntulenenNot.ekler.length})
                  </h4>
                  <div className="space-y-4">
                    {detayGoruntulenenNot.ekler.map((ek, index) => (
                      <motion.div
                        key={index}
                        className="border rounded-md overflow-hidden shadow-sm"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * (index + 1) }}
                        whileHover={{ scale: 1.01 }}
                      >
                        {ek.tip === "resim" && (
                          <div className="space-y-2">
                            <div className="p-2 flex items-center justify-between border-b">
                              <div className="flex items-center gap-2">
                                <ImageIcon className="h-4 w-4 text-blue-500" />
                                <span className="text-sm font-medium">
                                  {ek.aciklama || "Resim"}
                                </span>
                              </div>
                              <a
                                href={ek.imageData || ek.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:underline"
                              >
                                <ExternalLink className="h-3.5 w-3.5 inline" />{" "}
                                Yeni sekmede aç
                              </a>
                            </div>

                            <div className="flex justify-center p-4 bg-gray-50 dark:bg-gray-900">
                              {ek.imageData ? (
                                <img
                                  src={ek.imageData}
                                  alt={ek.aciklama || "Resim"}
                                  className="max-w-full object-contain rounded-md"
                                  style={{ maxHeight: "360px" }}
                                />
                              ) : (
                                <img
                                  src={ek.url}
                                  alt={ek.aciklama || "Resim"}
                                  className="max-w-full object-contain rounded-md"
                                  style={{ maxHeight: "360px" }}
                                  onError={(e) => {
                                    (
                                      e.target as HTMLImageElement
                                    ).style.display = "none"
                                    const parent = (
                                      e.target as HTMLElement
                                    ).parentElement
                                    if (parent) {
                                      parent.innerHTML = 
                                          `<div class="p-2 text-center">
                                            <p class="text-sm text-muted-foreground mb-2">Görsel yüklenemedi</p>
                                            <a href="${ek.url}" target="_blank" rel="noopener noreferrer" class="text-sm text-blue-600 hover:underline">
                                              ${ek.url}
                                            </a>
                                          </div>`
                                    }
                                  }}
                                />
                              )}
                            </div>
                          </div>
                        )}
                        {ek.tip === "link" && (
                          <div className="p-3 flex items-center gap-2">
                            <ExternalLink className="h-4 w-4 text-green-500" />
                            <a
                              href={ek.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline"
                            >
                              {ek.aciklama || ek.url}
                            </a>
                          </div>
                        )}
                        {ek.tip === "youtube" && (
                          <div className="space-y-2">
                            <div className="p-2 flex items-center justify-between border-b">
                              <div className="flex items-center gap-2">
                                <svg
                                  className="h-4 w-4 text-red-500"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                >
                                  <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                                </svg>
                                <span className="text-sm font-medium">
                                  {ek.aciklama || "YouTube Video"}
                                </span>
                              </div>
                              <a
                                href={ek.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:underline"
                              >
                                <ExternalLink className="h-3.5 w-3.5 inline" />{" "}
                                YouTube'da izle
                              </a>
                            </div>

                            <div className="p-2 bg-gray-50 dark:bg-gray-900 flex justify-center">
                              {(() => {
                                const videoId = getYouTubeVideoId(ek.url)

                                if (videoId) {
                                  return (
                                    <div className="w-full aspect-video">
                                      <iframe
                                        src={`https://www.youtube.com/embed/${videoId}`}
                                        title={
                                          ek.aciklama || "YouTube video"
                                        }
                                        className="w-full h-full rounded-md"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                      ></iframe>
                                    </div>
                                  )
                                } else {
                                  return (
                                    <div className="p-4 text-center">
                                      <p className="text-sm text-red-500 mb-2">
                                        Geçersiz YouTube URL'i
                                      </p>
                                      <a
                                        href={ek.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-blue-600 hover:underline"
                                      >
                                        {ek.url}
                                      </a>
                                    </div>
                                  )
                                }
                              })()}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
          </div>
        </ScrollArea>

        <DialogFooter className="flex justify-between border-t pt-4 mt-4">
          <div className="flex gap-2">
            {/* Kapat butonu buraya eklenebilir, isteğe bağlı */}
          </div>
          <div className="flex gap-2">
            {gorunumModu === "copKutusu" ? (
              <>
                <Button
                  variant="default"
                  onClick={() => {
                    onNotDetayiniKapat()
                    if (detayGoruntulenenNot) {
                      onNotuGeriGetir(detayGoruntulenenNot)
                    }
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <ArchiveRestore className="h-4 w-4 mr-2" />
                  Geri Getir
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Kalıcı Sil
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Notu kalıcı olarak silmek istiyor musunuz?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Bu işlem notu kalıcı olarak silecektir ve geri
                        alınamaz.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>İptal</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          if (detayGoruntulenenNot) {
                            onNotuKaliciSil(detayGoruntulenenNot.id)
                          }
                          onNotDetayiniKapat()
                        }}
                      >
                        Kalıcı Sil
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            ) : (
              <>
                <Button
                  variant="default"
                  onClick={() => {
                    onNotDetayiniKapat()
                    if (detayGoruntulenenNot) {
                      onNotDuzenle(detayGoruntulenenNot)
                    }
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Düzenle
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (detayGoruntulenenNot) {
                      onNotuCopKutusunaTasi(detayGoruntulenenNot.id)
                    }
                    onNotDetayiniKapat()
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Sil
                </Button>
              </>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 