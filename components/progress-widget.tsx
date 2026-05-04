import { useState, useEffect, ChangeEvent } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronUp, Gift, Zap, Award, Leaf, X, Medal, Trophy, Star, TrendingUp, Settings, Save } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { toast } from "@/components/ui/use-toast"

type GrowthTheme = "plant" | "character" | "galaxy" | "mountain" | "ocean"

const growthStagesMap = {
  plant: [
    { name: "Tohum", emoji: "🌱", threshold: 0 },
    { name: "Filiz", emoji: "🌿", threshold: 25 },
    { name: "Bitki", emoji: "🌵", threshold: 50 },
    { name: "Çiçek", emoji: "🌸", threshold: 75 },
    { name: "Ağaç", emoji: "🌳", threshold: 100 },
  ],
  character: [
    { name: "Çaylak", emoji: "👶", threshold: 0 },
    { name: "Öğrenci", emoji: "🧒", threshold: 25 },
    { name: "Yetenek", emoji: "👦", threshold: 50 },
    { name: "Uzman", emoji: "👨‍🎓", threshold: 75 },
    { name: "Üstat", emoji: "🧙‍♂️", threshold: 100 },
  ],
  galaxy: [
    { name: "Meteor", emoji: "☄️", threshold: 0 },
    { name: "Ay", emoji: "🌙", threshold: 25 },
    { name: "Gezegen", emoji: "🪐", threshold: 50 },
    { name: "Yıldız", emoji: "⭐", threshold: 75 },
    { name: "Galaksi", emoji: "🌌", threshold: 100 },
  ],
  mountain: [
    { name: "Kamp", emoji: "⛺", threshold: 0 },
    { name: "Patika", emoji: "🥾", threshold: 25 },
    { name: "Tepe", emoji: "⛰️", threshold: 50 },
    { name: "Dağ", emoji: "🏔️", threshold: 75 },
    { name: "Zirve", emoji: "🏆", threshold: 100 },
  ],
  ocean: [
    { name: "Damla", emoji: "💧", threshold: 0 },
    { name: "Dalga", emoji: "🌊", threshold: 25 },
    { name: "Deniz", emoji: "🐬", threshold: 50 },
    { name: "Mercan", emoji: "🐠", threshold: 75 },
    { name: "Okyanus", emoji: "🐋", threshold: 100 },
  ]
}

const motivasyonMesajlari = [
  "Bugün küçük bir adım, yarın büyük bir değişim!",
  "Her tamamlanan görev seni hedeflerine yaklaştırıyor.",
  "Planlı hareket etmek, başarıya giden yoldur.",
  "Kendini geliştirmeye devam et, gelişim seninle!",
  "Bugün dünden daha iyisin, yarın da bugünden daha iyi olacaksın!",
  "Her görev, başarıya giden yolda bir adımdır.",
  "Zorluklar seni sadece daha güçlü yapar.",
  "Planlamak, hayal etmek ve gerçekleştirmek - başarının anahtarları!",
  "Küçük ilerlemeler büyük sonuçlara götürür.",
  "İlerlemenin en iyi yolu durmadan devam etmektir."
]

interface ProgressWidgetProps {
  tamamlananGorevSayisi: number
  toplamGorevSayisi: number
  gunlukHedef?: number
  level?: number
  streakGunSayisi?: number
  enUzunStreakGunSayisi?: number
}

export default function ProgressWidget({
  tamamlananGorevSayisi = 0,
  toplamGorevSayisi = 0,
  gunlukHedef: propGunlukHedef = 5,
  level = 1,
  streakGunSayisi = 0,
  enUzunStreakGunSayisi = 0
}: ProgressWidgetProps) {
  const [acik, setAcik] = useState(false)
  const [motivasyonMesaji, setMotivasyonMesaji] = useState("")
  const [seciliTema, setSeciliTema] = useLocalStorage<GrowthTheme>("progress-widget-theme", "plant")
  const [gunlukHedef, setGunlukHedef] = useLocalStorage<number>("gunluk-hedef", propGunlukHedef)
  const [hedefDuzenlemeModu, setHedefDuzenlemeModu] = useState(false)
  const [hedefInput, setHedefInput] = useState(String(gunlukHedef))
    // Progress hesaplama
  const progressPercentage = toplamGorevSayisi > 0 
    ? Math.min(Math.round((tamamlananGorevSayisi / gunlukHedef) * 100), 100)
    : 0
    
  // Hedef input değerini kontrol et ve güncelle
  const handleHedefInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Sadece rakam kontrolü
    if (!/^\d*$/.test(value)) return;
    
    // Boş input ya da sıfır değilse değeri güncelle
    setHedefInput(value);
  }
  
  // Hedefi kaydet
  const kaydetGunlukHedef = () => {
    const yeniHedef = parseInt(hedefInput, 10);
    
    // Geçerlilik kontrolü: 1-9999 arası
    if (isNaN(yeniHedef) || yeniHedef < 1 || yeniHedef > 9999) {
      toast({
        title: "Geçersiz hedef",
        description: "Lütfen 1 ile 9999 arasında bir değer girin.",
        variant: "destructive"
      });
      setHedefInput(gunlukHedef.toString());
      return;
    }
    
    setGunlukHedef(yeniHedef);
    setHedefDuzenlemeModu(false);
    toast({
      title: "Hedef güncellendi",
      description: `Günlük hedefiniz ${yeniHedef} görev olarak ayarlandı.`
    });
  }
    
  // Büyüme aşamasını belirle
  const growthStages = growthStagesMap[seciliTema]
  const currentGrowthStage = growthStages.reduce((prev, current) => {
    return progressPercentage >= current.threshold ? current : prev
  }, growthStages[0])
  
  // Arkaplan rengi - ilerlemeye göre ve seçilen temaya göre değişim
  const getBackgroundStyle = () => {
    const themeColors = {
      plant: {
        low: "from-blue-50/30 to-green-50/20 dark:from-blue-900/10 dark:to-green-900/5",
        medium: "from-green-50/30 to-emerald-50/20 dark:from-green-900/10 dark:to-emerald-900/5",
        high: "from-emerald-50/30 to-yellow-50/20 dark:from-emerald-900/10 dark:to-yellow-900/5",
        complete: "from-yellow-50/30 to-orange-50/20 dark:from-yellow-900/10 dark:to-orange-900/5"
      },
      character: {
        low: "from-blue-50/30 to-indigo-50/20 dark:from-blue-900/10 dark:to-indigo-900/5",
        medium: "from-indigo-50/30 to-violet-50/20 dark:from-indigo-900/10 dark:to-violet-900/5",
        high: "from-violet-50/30 to-purple-50/20 dark:from-violet-900/10 dark:to-purple-900/5",
        complete: "from-purple-50/30 to-pink-50/20 dark:from-purple-900/10 dark:to-pink-900/5"
      },
      galaxy: {
        low: "from-slate-50/30 to-blue-50/20 dark:from-slate-900/10 dark:to-blue-900/5",
        medium: "from-blue-50/30 to-violet-50/20 dark:from-blue-900/10 dark:to-violet-900/5",
        high: "from-violet-50/30 to-fuchsia-50/20 dark:from-violet-900/10 dark:to-fuchsia-900/5",
        complete: "from-fuchsia-50/30 to-rose-50/20 dark:from-fuchsia-900/10 dark:to-rose-900/5"
      },
      mountain: {
        low: "from-stone-50/30 to-amber-50/20 dark:from-stone-900/10 dark:to-amber-900/5",
        medium: "from-amber-50/30 to-orange-50/20 dark:from-amber-900/10 dark:to-orange-900/5",
        high: "from-orange-50/30 to-red-50/20 dark:from-orange-900/10 dark:to-red-900/5",
        complete: "from-red-50/30 to-rose-50/20 dark:from-red-900/10 dark:to-rose-900/5"
      },
      ocean: {
        low: "from-cyan-50/30 to-blue-50/20 dark:from-cyan-900/10 dark:to-blue-900/5",
        medium: "from-blue-50/30 to-indigo-50/20 dark:from-blue-900/10 dark:to-indigo-900/5",
        high: "from-indigo-50/30 to-violet-50/20 dark:from-indigo-900/10 dark:to-violet-900/5",
        complete: "from-violet-50/30 to-purple-50/20 dark:from-violet-900/10 dark:to-purple-900/5"
      }
    }
    
    const colors = themeColors[seciliTema]
    if (progressPercentage < 25) return colors.low
    if (progressPercentage < 50) return colors.medium
    if (progressPercentage < 75) return colors.high
    return colors.complete
  }
  
  // Sayfa açıldığında/kapandığında kaydırma çubuğu oluşmasını önle
  useEffect(() => {
    // Doküman yüksekliğine müdahale etmek yerine, widget'in açılıp kapanması 
    // transitionEnd event'i ile daha güvenli bir şekilde yönetiliyor
    const handleResize = () => {
      // Sayfa yeniden boyutlandığında da widget'in doğru çalışmasını sağla
      window.dispatchEvent(new Event('resize'));
    };
    
    if (acik) {
      window.addEventListener('resize', handleResize);
    }
    
    // Temizlik fonksiyonu
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [acik]);
    // Rastgele motivasyon mesajı seç
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * motivasyonMesajlari.length)
    setMotivasyonMesaji(motivasyonMesajlari[randomIndex])
  }, [tamamlananGorevSayisi]) // Tamamlanan görev sayısı değiştiğinde yeni mesaj göster
  
  // Günlük hedef değiştiğinde input değerini güncelle
  useEffect(() => {
    setHedefInput(String(gunlukHedef))
  }, [gunlukHedef])
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 overflow-hidden pointer-events-none">
      <motion.div
        layout
        className="flex flex-col items-center overflow-hidden w-full pointer-events-auto"
        animate={{ 
          y: acik ? 0 : "calc(100% - 40px)", 
          height: acik ? 'auto' : "40px"
        }}
        transition={{ 
          type: "tween", 
          duration: 0.25,
          height: { duration: 0.25 }
        }}
        onAnimationComplete={() => {
          // Animasyon tamamlandığında, sayfa yeniden boyutlandırma eventi tetikle
          // Bu, tarayıcının kaydırma çubuğunu doğru şekilde ayarlamasını sağlar
          window.dispatchEvent(new Event('resize'));
        }}
      >
        {/* Tab handle - her zaman görünen kısım */}        <div 
          className="relative z-10 cursor-pointer flex items-center justify-center px-6 py-2 rounded-t-xl bg-background border-0 shadow-md w-auto mx-auto"
          onClick={() => setAcik(!acik)}
        >
          <div className="flex items-center gap-2">
            <div className="relative">
              <span className="text-xl">{currentGrowthStage.emoji}</span>
              {progressPercentage >= 100 && (
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
              )}
            </div>
            <Badge variant="outline" className="text-xs font-semibold gap-1">
              <Leaf className="h-3 w-3 text-primary" />
              {progressPercentage}%
            </Badge>
            <motion.div 
              animate={{ rotate: acik ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            </motion.div>
          </div>
        </div>
        
        {/* Genişletilmiş widget */}
        <AnimatePresence initial={false} mode="wait">
          {acik && (
            <motion.div
              className="w-full overflow-hidden"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >              <Card className={`relative border-0 rounded-b-none bg-gradient-to-br ${getBackgroundStyle()}`} style={{ overflow: "hidden" }}>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="absolute right-2 top-2 h-6 w-6 rounded-full hover:bg-background/50"
                  onClick={() => setAcik(false)}
                >
                  <X className="h-3 w-3" />
                </Button>
                
                <div className="max-w-screen-lg mx-auto p-4 grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                  {/* Sol bölüm - Avatar/Bitki */}
                  <div className="flex flex-col items-center justify-center p-4">
                    <motion.div 
                      className="flex flex-col items-center"
                      whileHover={{ scale: 1.05 }}
                    >
                      <span className="text-6xl mb-2">{currentGrowthStage.emoji}</span>
                      <Badge variant="secondary" className="mb-1 text-sm">
                        {currentGrowthStage.name}
                      </Badge>
                      <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Award className="h-3 w-3" /> Seviye {level}
                      </div>
                      
                      {/* Tema seçimi */}
                      <div className="mt-4 flex flex-wrap justify-center gap-2">
                        {(Object.keys(growthStagesMap) as GrowthTheme[]).map((tema) => (
                          <Button
                            key={tema}
                            size="sm"
                            variant={seciliTema === tema ? "default" : "outline"}
                            className="h-8 px-2 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSeciliTema(tema);
                            }}
                          >
                            <span className="mr-1">{growthStagesMap[tema][4].emoji}</span>
                            {tema === "plant" ? "Bitki" : 
                             tema === "character" ? "Karakter" : 
                             tema === "galaxy" ? "Galaksi" : 
                             tema === "mountain" ? "Dağ" : "Okyanus"}
                          </Button>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                  
                  {/* Orta bölüm - İlerleme */}
                  <div className="flex flex-col justify-center space-y-4 md:col-span-2">                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Günlük İlerleme</span>
                      <div className="flex items-center gap-2">                        {hedefDuzenlemeModu ? (
                          <div className="flex items-center gap-1">
                            <Input 
                              type="text"
                              value={hedefInput}
                              onChange={handleHedefInputChange}
                              className="w-16 h-7 text-xs py-1 px-2"
                              placeholder="1-9999"
                              maxLength={4}
                              aria-label="Günlük hedef"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  kaydetGunlukHedef();
                                }
                                if (e.key === 'Escape') {
                                  setHedefDuzenlemeModu(false);
                                  setHedefInput(gunlukHedef.toString());
                                }
                              }}
                            />
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={kaydetGunlukHedef}
                                  >
                                    <Save className="h-3 w-3" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Hedefi kaydet</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        ) : (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  className="h-6 px-2 text-xs font-semibold border border-dashed border-muted-foreground/50 hover:border-primary/50 transition-colors"
                                  onClick={() => setHedefDuzenlemeModu(true)}
                                >
                                  {tamamlananGorevSayisi}/{gunlukHedef} Görev
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Günlük hedefi değiştirmek için tıklayın</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </div>
                    
                    <Progress value={progressPercentage} className="h-2" />
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1 p-2 bg-background/40 rounded-md border border-muted">
                        <div className="text-xs text-muted-foreground">Günlük Streak</div>
                        <div className="flex items-center gap-1.5">
                          <Zap className="h-4 w-4 text-yellow-500" />
                          <span className="font-semibold">{streakGunSayisi} Gün</span>
                        </div>
                        {enUzunStreakGunSayisi > 0 && (
                          <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <Trophy className="h-3 w-3 text-amber-500" />
                            <span>En yüksek: {enUzunStreakGunSayisi} gün</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col gap-1 p-2 bg-background/40 rounded-md border border-muted">
                        <div className="text-xs text-muted-foreground">Toplam Puan</div>
                        <div className="flex items-center gap-1.5">
                          <Star className="h-4 w-4 text-purple-500" />
                          <span className="font-semibold">{Math.floor(tamamlananGorevSayisi / 5) * 10} Puan</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <TrendingUp className="h-3 w-3 text-green-500" />
                          <span>Tamamlanan: {tamamlananGorevSayisi}</span>
                        </div>
                      </div>
                    </div>
                    
                    <motion.div
                      className="text-sm text-center px-4 py-2 mt-2 rounded-md bg-background/60 border border-muted"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      key={motivasyonMesaji}
                    >
                      {motivasyonMesaji}
                    </motion.div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
