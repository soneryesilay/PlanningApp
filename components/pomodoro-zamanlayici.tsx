"use client"

import { useReducer, useEffect, useRef, memo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, Pause, RotateCcw, Bell, BellOff, ChevronDown, ChevronUp, Maximize, Minimize, BarChart2, Timer, Settings, CheckCircle2, Coffee, CalendarIcon, Trash2 } from "lucide-react"
import type { Gorev, PomodoroIstatistik } from "@/lib/types"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { motion, AnimatePresence, MotionProps } from "framer-motion"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"
import { useMediaQuery } from "@/hooks/use-mobile"
import { Slider } from "@/components/ui/slider"
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { Switch } from "@/components/ui/switch"
import Swal from 'sweetalert2'

// Define action types
type PomodoroAction =
  | { type: "SET_MODE"; payload: "calisma" | "kisa_mola" | "uzun_mola" }
  | { type: "SET_ACTIVE"; payload: boolean }
  | { type: "SET_REMAINING_TIME"; payload: number }
  | { type: "DECREMENT_TIME" }
  | { type: "RESET_TIMER" }
  | { type: "TOGGLE_SOUND" }
  | { type: "SET_SELECTED_TASK"; payload: string }
  | { type: "INCREMENT_COMPLETED_POMODOROS" }
  | { type: "SET_CALISMA_SURESI"; payload: number }
  | { type: "SET_KISA_MOLA_SURESI"; payload: number }
  | { type: "SET_UZUN_MOLA_SURESI"; payload: number }
  | { type: "TOGGLE_FULLSCREEN" } // Tam ekran modu
  | { type: "SET_GUNLUK_HEDEF"; payload: number } // Günlük hedef dakikasını ayarlamak için
  | { type: "TOGGLE_GUNLUK_HEDEF_VISIBILITY" } // Günlük hedef görünürlüğünü değiştirmek için
  | { type: "RESET_COMPLETED_POMODOROS" }; // Tamamlanan pomodoroları sıfırlamak için

// Define state type
interface PomodoroState {
  mode: "calisma" | "kisa_mola" | "uzun_mola"
  duration: number
  remainingTime: number
  isActive: boolean
  soundEnabled: boolean
  selectedTaskId: string
  completedPomodoros: number
  calismaSuresi: number // Dakika cinsinden çalışma süresi
  kisaMolaSuresi: number // Dakika cinsinden kısa mola süresi
  uzunMolaSuresi: number // Dakika cinsinden uzun mola süresi
  isFullscreen: boolean // Tam ekran modunu takip etmek için yeni durum
  gunlukHedef: number // Günlük hedef (dakika cinsinden)
  gunlukHedefVisible: boolean // Günlük hedef bileşeni görünürlüğü - true: göster, false: gizle
}

// Initial state
const initialState: PomodoroState = {
  mode: "calisma",
  duration: 25 * 60, // 25 minutes in seconds
  remainingTime: 25 * 60,
  isActive: false,
  soundEnabled: true,
  selectedTaskId: "",
  completedPomodoros: 0,
  calismaSuresi: 25, // Varsayılan 25 dakika
  kisaMolaSuresi: 5, // Varsayılan 5 dakika
  uzunMolaSuresi: 15, // Varsayılan 15 dakika
  gunlukHedef: 120, // Varsayılan günlük hedef 120 dakika
  isFullscreen: false, // Başlangıçta tam ekran kapalı
  gunlukHedefVisible: true // Başlangıçta günlük hedef görünür
}

// Reducer function
function pomodoroReducer(state: PomodoroState, action: PomodoroAction): PomodoroState {
  // console.log(`[Reducer] Action: ${action.type}, Mevcut completedPomodoros: ${state.completedPomodoros}`);
  let newState = { ...state }; // Her zaman state'in bir kopyasıyla başla

  switch (action.type) {
    case "SET_MODE": {
      const newMode = action.payload;
      let newDuration = newState.duration;

      if (newMode === "calisma") {
        newDuration = newState.calismaSuresi * 60;
      } else if (newMode === "kisa_mola") {
        newDuration = newState.kisaMolaSuresi * 60;
      } else if (newMode === "uzun_mola") {
        newDuration = newState.uzunMolaSuresi * 60;
      }

      newState = {
        ...newState,
        mode: newMode,
        duration: newDuration,
        remainingTime: newDuration,
        isActive: false,
      };
      break;
    }
    case "SET_ACTIVE":
      newState = {
        ...newState,
        isActive: action.payload,
      };
      break;
    case "SET_REMAINING_TIME":
      newState = {
        ...newState,
        remainingTime: action.payload,
      };
      break;
    case "DECREMENT_TIME":
      newState = {
        ...newState,
        remainingTime: Math.max(0, newState.remainingTime - 1),
      };
      break;
    case "RESET_TIMER":
      newState = {
        ...newState,
        remainingTime: newState.duration, // duration yerine newState.duration kullanılmalı
        isActive: false,
      };
      break;
    case "TOGGLE_SOUND":
      newState = {
        ...newState,
        soundEnabled: !newState.soundEnabled,
      };
      break;
    case "SET_SELECTED_TASK":
      newState = {
        ...newState,
        selectedTaskId: action.payload,
      };
      break;
    case "INCREMENT_COMPLETED_POMODOROS":
      // console.log(`[Reducer] INCREMENT_COMPLETED_POMODOROS: Artırılıyor: ${newState.completedPomodoros} -> ${newState.completedPomodoros + 1}`);
      newState = {
        ...newState,
        completedPomodoros: newState.completedPomodoros + 1,
      };
      break;
    case "SET_CALISMA_SURESI": {
      const calismaSuresi = action.payload;
      const newDuration = newState.mode === "calisma" ? calismaSuresi * 60 : newState.duration;
      newState = {
        ...newState,
        calismaSuresi,
        duration: newDuration, // duration yerine newDuration kullanılmalı
        remainingTime: newDuration, // remainingTime da güncellenmeli
        isActive: false,
      };
      break;
    }
    case "SET_KISA_MOLA_SURESI": {
      const kisaMolaSuresi = action.payload;
      const newDuration = newState.mode === "kisa_mola" ? kisaMolaSuresi * 60 : newState.duration;
      newState = {
        ...newState,
        kisaMolaSuresi,
        duration: newDuration,
        remainingTime: newDuration,
        isActive: false,
      };
      break;
    }
    case "SET_UZUN_MOLA_SURESI": {
      const uzunMolaSuresi = action.payload;
      const newDuration = newState.mode === "uzun_mola" ? uzunMolaSuresi * 60 : newState.duration;
      newState = {
        ...newState,
        uzunMolaSuresi,
        duration: newDuration,
        remainingTime: newDuration,
        isActive: false,
      };
      break;
    }
    case "TOGGLE_FULLSCREEN": {
      newState = {
        ...newState,
        isFullscreen: !newState.isFullscreen,
      };
      break;
    }
    case "SET_GUNLUK_HEDEF": {
      newState = {
        ...newState,
        gunlukHedef: action.payload,
      };
      break;
    }
    case "TOGGLE_GUNLUK_HEDEF_VISIBILITY": {
      newState = {
        ...newState,
        gunlukHedefVisible: !newState.gunlukHedefVisible,
      };
      break;
    }
    case "RESET_COMPLETED_POMODOROS":
      // console.log(`[Reducer] RESET_COMPLETED_POMODOROS: Sıfırlanıyor: ${newState.completedPomodoros} -> 0`);
      newState = {
        ...newState,
        completedPomodoros: 0,
      };
      break;
    default:
      // Bilinmeyen bir eylem türü için, state'i değiştirmeden döndür
      // console.log('[Reducer] Action default: Bilinmeyen eylem türü - completedPomodoros değiştirilmedi');
      return state; // Orijinal state'i döndür, kopyayı değil
  }
  // console.log(`[Reducer] Yeni completedPomodoros: ${newState.completedPomodoros}`);
  return newState;
}

// Overlay date selection and statistics clearing functionality to the component props
interface PomodoroZamanlayiciProps {
  gorevler: Gorev[]
  onPomodoroTamamlandi: (istatistik: PomodoroIstatistik) => void
  istatistikler: PomodoroIstatistik[]
  onPomodoroIstatistikSil: (ids: string[]) => void
}

const circularProgressClasses = {
  track: "stroke-muted-foreground/20",
  indicator: {
    calisma: "stroke-primary",
    kisa_mola: "stroke-green-500",
    uzun_mola: "stroke-blue-500",
  },
  container: "absolute inset-0",
  text: {
    container: "absolute inset-0 flex items-center justify-center flex-col",
    time: "text-5xl font-bold transition-all duration-300",
    label: "text-sm text-muted-foreground",
  }
}

// Ana bileşen için animasyon varyantları
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.4,
      ease: "easeOut"
    }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: { 
      duration: 0.3,
      ease: "easeInOut"
    }
  }
};

// Tab içerikleri için animasyon varyantları
const tabContentVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.3, ease: "easeOut" }
  },
  exit: { 
    opacity: 0, 
    x: 10,
    transition: { duration: 0.2, ease: "easeInOut" }
  }
};

// Kart bileşenleri için animasyon varyantları
const cardVariants = {
  hidden: { opacity: 0, y: 15, scale: 0.98 },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: { 
      duration: 0.4,
      ease: "easeOut"
    }
  }
};

// Zamanlayıcı çemberinin animasyonu için özel varyant
const circleTransition = {
  type: "tween",
  duration: 0.8,
  ease: "easeInOut"
};

// Use memo to prevent unnecessary re-renders
const PomodoroZamanlayici = memo(function PomodoroZamanlayici({
  gorevler,
  onPomodoroTamamlandi,
  istatistikler,
  onPomodoroIstatistikSil,
}: PomodoroZamanlayiciProps) {
  // useReducer yerine useLocalStorage kullanımı
  const [pomodoroState, setPomodoroState] = useLocalStorage<PomodoroState>("pomodoro-state", initialState);
  
  // Mevcut pomodoro sayısını gösteren console log
  // console.log(`%cGüncel Pomodoro Sayısı: ${pomodoroState.completedPomodoros}`, 'color: #22c55e; font-size: 14px; font-weight: bold');
  
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const timerCompletedRef = useRef(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [lastTimeStamp, setLastTimeStamp] = useLocalStorage<number | null>("pomodoro-last-timestamp", null);
  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  // Temporary states for settings
  const [tempCalismaSuresi, setTempCalismaSuresi] = useState(pomodoroState.calismaSuresi);
  const [tempKisaMolaSuresi, setTempKisaMolaSuresi] = useState(pomodoroState.kisaMolaSuresi);
  const [tempUzunMolaSuresi, setTempUzunMolaSuresi] = useState(pomodoroState.uzunMolaSuresi);
  const [tempGunlukHedef, setTempGunlukHedef] = useState(pomodoroState.gunlukHedef);
  
  // Settings açıldığında veya kapandığında otomatik scroll için effect
  useEffect(() => {
    if (settingsRef.current) {      if (isSettingsOpen) {
        // Populate temporary states when settings open
        setTempCalismaSuresi(pomodoroState.calismaSuresi);
        setTempKisaMolaSuresi(pomodoroState.kisaMolaSuresi);
        setTempUzunMolaSuresi(pomodoroState.uzunMolaSuresi);
        // Ayarlar açıldığında ayarlar bölümüne scroll
        setTimeout(() => {
          settingsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      } else {
        // Ayarlar kapandığında bir şey yapmıyoruz
        // Kapanma animasyonu zaten collapsible animasyonundan geliyor
        // Bu sayede daha doğal bir kapanma gerçekleşecek
      }
    }
  }, [isSettingsOpen, pomodoroState.calismaSuresi, pomodoroState.kisaMolaSuresi, pomodoroState.uzunMolaSuresi]);
  const fullscreenContainerRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const statsCardRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [activeTab, setActiveTab] = useState<string>("zamanlayici");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedStats, setSelectedStats] = useState<string[]>([]);
  const [selectedDateForFiltering, setSelectedDateForFiltering] = useState<Date | undefined>(new Date());

  // Otomatik scroll kontrolü için bir state ekleyelim
  const [allowAutoScroll, setAllowAutoScroll] = useState<boolean>(true);
  
  // Tab değişikliklerinde otomatik scrollu kontrol etmek için
  useEffect(() => {
    // Eğer tab değiştiğinde, ilk otomatik scrollu engelle
    setAllowAutoScroll(false);
    // Kısa bir süre sonra tekrar etkinleştir (tarih veya buton tıklamaları için)
    const timer = setTimeout(() => {
      setAllowAutoScroll(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [activeTab]);

  const yapilacakGorevler = gorevler.filter((g) => g.durum !== "Tamamlandı")

  // Dispatch fonksiyonu localStorage kullanarak
  const dispatch = (action: PomodoroAction) => {
    // SET_ACTIVE aksiyonu için lastTimeStamp'i sıfırla veya ayarla
    if (action.type === "SET_ACTIVE") {
      if (action.payload) {
        // Zamanlayıcı aktifleştirildiğinde şu anki zamanı kaydet
        setLastTimeStamp(Date.now());
      } else {
        // Zamanlayıcı durdurulduğunda lastTimeStamp'i sıfırla
        setLastTimeStamp(null);
      }
    }
    
    // RESET_TIMER aksiyonu için lastTimeStamp'i sıfırla
    if (action.type === "RESET_TIMER") {
      setLastTimeStamp(null);
    }
    
    setPomodoroState(currentState => pomodoroReducer(currentState, action));
  }

  // İstatistikleri silerken tamamlanan pomodoro sayacını da sıfırlayan yardımcı fonksiyon
  const handleDeleteStatsAndResetCounter = (ids: string[]) => {
    onPomodoroIstatistikSil(ids); // Orijinal silme fonksiyonunu çağır
    dispatch({ type: "RESET_COMPLETED_POMODOROS" }); // Tamamlanan pomodoroları sıfırla
  };

  // Initialize audio and check active state on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      audioRef.current = new Audio("/alarm.mp3")
      
      // Bileşen yüklendiğinde zamanlayıcının durumunu kontrol et
      if (pomodoroState.isActive && !lastTimeStamp) {
        // Eğer zamanlayıcı aktif görünüyor ama lastTimeStamp yoksa, şimdi ayarlayalım
        setLastTimeStamp(Date.now());
      } else if (!pomodoroState.isActive && lastTimeStamp) {
        // Eğer zamanlayıcı aktif değil ama lastTimeStamp varsa, temizleyelim
        setLastTimeStamp(null);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  // Global timer - her saniye çalışacak şekilde ayarlanmış interval
  useEffect(() => {
    if (pomodoroState.isActive) {
      const timer = setInterval(() => {
        setCurrentTime(Date.now());
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [pomodoroState.isActive]);
  
  // Timer effect - currentTime değiştiğinde tetiklenir ve 
  // zamanlayıcı aktifse zamanı azaltır
  useEffect(() => {
    if (pomodoroState.isActive && pomodoroState.remainingTime > 0) {
      dispatch({ type: "DECREMENT_TIME" });
      // lastTimeStamp'i sadece aktif durum değiştiğinde güncelleyeceğiz, her saniyede değil
    }
  }, [currentTime, pomodoroState.isActive]);
  
  // Tam ekran modu için etki
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && pomodoroState.isFullscreen) {
        // Kullanıcı tarayıcı kontrollerini kullanarak tam ekrandan çıktıysa durumu güncelle
        // Zamanlayıcının aktif durumunu ve modunu koruyarak sadece tam ekran durumunu değiştir
        setPomodoroState(currentState => ({
          ...currentState,
          isFullscreen: false
        }));
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [pomodoroState.isFullscreen]);

  // Tam ekran modunu açma/kapama fonksiyonu
  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement && fullscreenContainerRef.current) {
        // Tam ekrana geç
        await fullscreenContainerRef.current.requestFullscreen();
        setPomodoroState(currentState => ({
          ...currentState,
          isFullscreen: true
        }));
      } else {
        // Tam ekrandan çık
        if (document.exitFullscreen) {
          await document.exitFullscreen();
          setPomodoroState(currentState => ({
            ...currentState,
            isFullscreen: false
          }));
        }
      }
    } catch (err) {
      console.error("Tam ekran modu hatası:", err);
    }
  };
  
  // Sayfa görünürlük değişikliğini izleme
  useEffect(() => {
    if (typeof document === "undefined") return;
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // Sayfa tekrar görünür olduğunda, geçen süreyi hesaplayarak zamanlayıcıyı güncelle
        if (pomodoroState.isActive && lastTimeStamp) {
          const now = Date.now();
          const elapsedSeconds = Math.floor((now - lastTimeStamp) / 1000);
          
          if (elapsedSeconds > 0) {
            // Kalan süreyi güncelle, sıfırın altına düşmesini engelle
            const newRemainingTime = Math.max(0, pomodoroState.remainingTime - elapsedSeconds);
            
            dispatch({ type: "SET_REMAINING_TIME", payload: newRemainingTime });
            
            // Eğer süre bitmişse
            if (newRemainingTime === 0 && !timerCompletedRef.current) {
              // Timer bitti işaretini koy ve timerı durdur
              timerCompletedRef.current = true;
              dispatch({ type: "SET_ACTIVE", payload: false });
            }
          }
        }
      } 
      
      if (document.visibilityState === "hidden" && pomodoroState.isActive) {
        // Sayfa arkaplanda kaldığında son zamanı kaydet
        setLastTimeStamp(Date.now());
      }
    };

    // Görünürlük değişikliği dinleyicisini ekle
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [pomodoroState.isActive, pomodoroState.remainingTime, lastTimeStamp]);
  // Check if timer is complete - use a separate effect
  useEffect(() => {
    // Only proceed if timer has reached zero and was active
    if (pomodoroState.remainingTime === 0 && pomodoroState.isActive && !timerCompletedRef.current) {
      // Set flag to prevent multiple executions
      timerCompletedRef.current = true

      // Stop the timer
      dispatch({ type: "SET_ACTIVE", payload: false })

      // Play sound if enabled
      if (pomodoroState.soundEnabled && audioRef.current) {
        audioRef.current.play().catch((e) => console.log("Audio play error:", e))
      }

      // Show SweetAlert2 notification
      const currentMode = pomodoroState.mode;
      setTimeout(() => {
        if (currentMode === "calisma") {
          // Increment completed pomodoros
          dispatch({ type: "INCREMENT_COMPLETED_POMODOROS" })

          // Save pomodoro statistics - always save statistics regardless of task selection
          const selectedTask = pomodoroState.selectedTaskId ?
            gorevler.find((g) => g.id === pomodoroState.selectedTaskId) : null

          onPomodoroTamamlandi({
            id: Date.now().toString(),
            gorevId: pomodoroState.selectedTaskId || "none",
            gorevAdi: selectedTask?.baslik || "Görev Seçilmedi",
            tarih: new Date().toISOString(),
            sure: pomodoroState.calismaSuresi, // Kullanıcının ayarladığı çalışma süresi
          })
          
          Swal.fire({
            title: 'Çalışma Bitti!',
            text: 'Harika iş çıkardın! Şimdi ne yapmak istersin?',
            icon: 'success',
            showCancelButton: true,
            confirmButtonText: 'Kısa Molaya Başla',
            cancelButtonText: 'Uzun Molaya Başla',
            confirmButtonColor: 'var(--primary)',
            cancelButtonColor: 'var(--secondary)', // veya temanıza uygun başka bir renk
            background: 'var(--background)',
            color: 'var(--foreground)',
            allowOutsideClick: false, // Kullanıcının bir seçim yapmasını zorunlu kıl
            allowEscapeKey: false,
            ...(pomodoroState.isFullscreen && fullscreenContainerRef.current && { target: fullscreenContainerRef.current }),
          }).then((result) => {
            if (result.isConfirmed) {
              // User chose Short Break
              dispatch({ type: "SET_MODE", payload: "kisa_mola" });
            } else if (result.dismiss === Swal.DismissReason.cancel) {
              // User chose Long Break
              dispatch({ type: "SET_MODE", payload: "uzun_mola" });
            }
            // Reset flag
            timerCompletedRef.current = false
          });
        } else { // Mola bittiğinde
          Swal.fire({
            title: 'Mola Bitti!',
            text: 'Dinlenme zamanı sona erdi. Tekrar odaklanmaya hazır mısın?',
            icon: 'info',
            confirmButtonText: 'Çalışmaya Başla',
            background: 'var(--background)', // Temaya uygun arka plan
            color: 'var(--foreground)', // Temaya uygun metin rengi
            confirmButtonColor: 'var(--primary)', // Temaya uygun buton rengi
            ...(pomodoroState.isFullscreen && fullscreenContainerRef.current && { target: fullscreenContainerRef.current }),
          }).then(() => {
            // After break, go back to work mode
            dispatch({ type: "SET_MODE", payload: "calisma" })
            // Reset flag
            timerCompletedRef.current = false
          });
        }
      }, 0) // setTimeout(..., 0) yerine doğrudan çağrı yapabiliriz, ama Swal asenkron olduğu için etkileşimi bozmamak adına böyle bırakılabilir.
    } else if (pomodoroState.remainingTime > 0) {
      // Reset flag when timer is not at zero
      timerCompletedRef.current = false
    }
  }, [
    pomodoroState.remainingTime,
    pomodoroState.isActive,
    pomodoroState.mode,
    pomodoroState.soundEnabled,
    pomodoroState.selectedTaskId,
    pomodoroState.completedPomodoros,
    gorevler,
    onPomodoroTamamlandi,
  ])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const progress = (pomodoroState.remainingTime / pomodoroState.duration) * 100

  // Günlük istatistikler
  const today = new Date().toISOString().split("T")[0]
  const dailyStats = istatistikler.filter((i) => i.tarih.split("T")[0] === today)
  const totalMinutes = dailyStats.reduce((total, i) => total + i.sure, 0)

  // Görev bazlı istatistikler
  const taskStats = istatistikler.reduce(
    (acc, i) => {
      if (!acc[i.gorevId]) {
        acc[i.gorevId] = {
          gorevAdi: i.gorevAdi,
          toplamSure: 0,
          pomodoroSayisi: 0,
        }
      }
      acc[i.gorevId].toplamSure += i.sure
      acc[i.gorevId].pomodoroSayisi += 1
      return acc
    },
    {} as Record<string, { gorevAdi: string; toplamSure: number; pomodoroSayisi: number }>,
  )

  // Dairesel ilerleme çubuğu için SVG tanımları
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - (pomodoroState.remainingTime / pomodoroState.duration));

  // Mod seçimi için ikon ve metinler
  const modeIcons = {
    calisma: <Timer className="h-5 w-5" />,
    kisa_mola: <Coffee className="h-5 w-5" />,
    uzun_mola: <CheckCircle2 className="h-5 w-5" />
  };

  const modeLabels = {
    calisma: "Çalışma Modu",
    kisa_mola: "Kısa Mola",
    uzun_mola: "Uzun Mola"
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={containerVariants}
      className="w-full"
    >
      <div 
        ref={fullscreenContainerRef} 
        className={`space-y-6 ${pomodoroState.isFullscreen ? 'h-screen w-screen flex flex-col justify-center items-center bg-background p-4 md:p-8 overflow-auto' : ''}`}
      >
        {/* Tam ekran modunda her zaman görünür olacak küçültme butonu */}
        {pomodoroState.isFullscreen && (
          <motion.div 
            className="fixed top-4 right-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Button 
              variant="outline" 
              size="icon" 
              onClick={toggleFullscreen}
              className="h-10 w-10 bg-background/80 backdrop-blur-sm shadow-md"
            >
              <Minimize className="h-5 w-5" />
            </Button>
          </motion.div>
        )}
        
        {!pomodoroState.isFullscreen && (
          <motion.div 
            className="flex items-center gap-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <span className="inline-block p-1 rounded-md bg-primary/10">
                <Timer className="h-5 w-5 text-primary" />
              </span>
              Pomodoro Zamanlayıcı
            </h2>
            <Badge variant="outline" className="ml-auto">
              {pomodoroState.completedPomodoros} pomodoro tamamlandı
            </Badge>
          </motion.div>
        )}

        <motion.div>
          <Tabs 
            defaultValue="zamanlayici" 
            value={activeTab}
            onValueChange={(newTab) => {
              setActiveTab(newTab);
              if (newTab !== "zamanlayici" && isSettingsOpen) {
                setIsSettingsOpen(false);
              }
            }}
            className={pomodoroState.isFullscreen ? 'w-full max-w-lg flex flex-col items-center' : ''}
          >
            {!pomodoroState.isFullscreen && (
              <TabsList className="grid grid-cols-2 mb-6">
                <TabsTrigger 
                  value="zamanlayici" 
                  className="flex items-center gap-2"
                >
                  <Timer className="h-4 w-4" /> Zamanlayıcı
                </TabsTrigger>
                <TabsTrigger 
                  value="istatistikler" 
                  className="flex items-center gap-2"
                  onClick={() => {
                    if (isSettingsOpen) {
                      setIsSettingsOpen(false);
                    }
                  }}
                >
                  <BarChart2 className="h-4 w-4" /> İstatistikler
                </TabsTrigger>
              </TabsList>
            )}

            <div className="w-full">
              <AnimatePresence mode="wait" initial={false}>
                {activeTab === "zamanlayici" && (
                  <motion.div
                    key="zamanlayici"
                  >
                    <TabsContent value="zamanlayici" className="space-y-5 mt-0">
                      <motion.div
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        <Card className={`overflow-hidden ${pomodoroState.isFullscreen ? 'border-none shadow-none' : ''}`}>
                          <CardHeader className="pb-0">
                            <CardTitle className={`flex items-center justify-center gap-2 ${pomodoroState.isFullscreen ? 'text-3xl' : 'text-xl'}`}>
                              {modeIcons[pomodoroState.mode]}
                              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                                {modeLabels[pomodoroState.mode]}
                              </span>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="pt-8 pb-6">
                            <motion.div 
                              className="flex flex-col items-center space-y-6"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.3 }}
                            >
                              {/* Zamanlayıcı - Dairesel İlerleme Çubuğu */}
                              <div className={`relative ${pomodoroState.isFullscreen ? 'w-[70vw] h-[70vw] max-w-[350px] max-h-[350px]' : 'w-60 h-60'} mx-auto`}>
                                {/* Geri plan dairesi */}
                                <svg className="w-full h-full rotate-[-90deg]" viewBox="0 0 330 330">
                                  <circle 
                                    cx="165" 
                                    cy="165" 
                                    r={radius} 
                                    className="stroke-muted-foreground/20 fill-none"
                                    strokeWidth="12" 
                                  />
                                  <motion.circle 
                                    cx="165" 
                                    cy="165" 
                                    r={radius} 
                                    className={`fill-none ${pomodoroState.mode === "calisma" ? "stroke-primary" : pomodoroState.mode === "kisa_mola" ? "stroke-green-500" : "stroke-blue-500"}`}
                                    strokeWidth="12" 
                                    strokeDasharray={circumference}
                                    strokeLinecap="round"
                                    initial={{ strokeDashoffset: 0 }}
                                    animate={{ strokeDashoffset }}
                                    transition={circleTransition}
                                  />
                                </svg>
                                
                                {/* Süre Gösterimi */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                  <div
                                    className={`font-mono font-bold ${
                                      pomodoroState.isFullscreen 
                                        ? 'text-4xl sm:text-5xl md:text-7xl' 
                                        : 'text-3xl sm:text-4xl md:text-5xl'
                                    } transition-all duration-300`}
                                    style={{ wordSpacing: '-0.2em' }}
                                  >
                                    {formatTime(pomodoroState.remainingTime)}
                                  </div>
                                  <div className={`text-muted-foreground mt-2 ${pomodoroState.isFullscreen ? 'text-xl' : 'text-md'}`}>
                                    {pomodoroState.mode === "calisma" 
                                      ? `${pomodoroState.calismaSuresi} dakika` 
                                      : pomodoroState.mode === "kisa_mola" 
                                        ? `${pomodoroState.kisaMolaSuresi} dakika` 
                                        : `${pomodoroState.uzunMolaSuresi} dakika`}
                                  </div>
                                  
                                  {pomodoroState.selectedTaskId && pomodoroState.selectedTaskId !== "none" && (
                                    <motion.div 
                                      initial={{ opacity: 0 }} 
                                      animate={{ opacity: 1 }}
                                      transition={{ duration: 0.2 }}
                                      className="mt-3"
                                    >
                                      <Badge variant="outline" className="px-3 py-1">
                                        {yapilacakGorevler.find(g => g.id === pomodoroState.selectedTaskId)?.baslik || ""}
                                      </Badge>
                                    </motion.div>
                                  )}
                                </div>
                              </div>

                              {/* Kontroller */}
                              <div className={`flex ${isMobile ? 'flex-wrap justify-center gap-2' : 'gap-3'} ${pomodoroState.isFullscreen ? 'scale-100 mt-8' : ''}`}>
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className={isMobile ? "w-[calc(50%-4px)]" : ""}>
                                  <Button 
                                    onClick={() => dispatch({ type: "SET_ACTIVE", payload: !pomodoroState.isActive })}
                                    size={isMobile ? "default" : "lg"}
                                    variant="outline"
                                    className={`${isMobile ? "w-full" : ""} ${
                                      pomodoroState.mode === "calisma" 
                                        ? "border-muted hover:bg-primary/10" 
                                        : pomodoroState.mode === "kisa_mola" 
                                          ? "border-muted hover:bg-green-500/10" 
                                          : "border-muted hover:bg-blue-500/10"
                                    } shadow-sm hover:bg-background/80 font-medium transition-all`}
                                  >
                                    {pomodoroState.isActive ? <Pause className="h-5 w-5 mr-2" /> : <Play className="h-5 w-5 mr-2" />}
                                    {pomodoroState.isActive ? "Duraklat" : "Başlat"}
                                  </Button>
                                </motion.div>{!pomodoroState.isFullscreen && (
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className={isMobile ? "w-[calc(50%-4px)]" : ""}>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button 
                                        variant="outline" 
                                        size={isMobile ? "default" : "lg"}
                                        className={`${isMobile ? "w-full" : ""} shadow-sm hover:bg-background/80 border-muted`}
                                      >
                                        <RotateCcw className="h-5 w-5 mr-2" />
                                        Sıfırla
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Zamanlayıcıyı sıfırlamak istiyor musunuz?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Bu işlem zamanlayıcıyı başlangıç süresine döndürecektir.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>İptal</AlertDialogCancel>
                                        <AlertDialogAction 
                                          onClick={() => dispatch({ type: "RESET_TIMER" })}
                                        >
                                          Sıfırla
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </motion.div>
                              )}                                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className={isMobile ? "mt-2" : ""}>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => dispatch({ type: "TOGGLE_SOUND" })}
                                    className="h-10 w-10"
                                  >
                                    {pomodoroState.soundEnabled ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
                                  </Button>
                                </motion.div>

                                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className={isMobile ? "mt-2" : ""}>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={toggleFullscreen}
                                    className="h-10 w-10"
                                  >
                                    {pomodoroState.isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
                                  </Button>
                                </motion.div>
                              </div>

                              {!pomodoroState.isFullscreen && (
                                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                  <div>
                                    <label className="text-sm text-muted-foreground block mb-1">Mod Seçimi</label>
                                    <Select
                                      value={pomodoroState.mode}
                                      onValueChange={(value) =>
                                        dispatch({
                                          type: "SET_MODE",
                                          payload: value as "calisma" | "kisa_mola" | "uzun_mola",
                                        })
                                      }
                                    >
                                      <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Mod seçin" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="calisma" className="flex items-center gap-2">
                                          <Timer className="h-4 w-4 inline mr-1" />
                                          Çalışma ({pomodoroState.calismaSuresi} dk)
                                        </SelectItem>
                                        <SelectItem value="kisa_mola" className="flex items-center gap-2">
                                          <Coffee className="h-4 w-4 inline mr-1" />
                                          Kısa Mola ({pomodoroState.kisaMolaSuresi} dk)
                                        </SelectItem>
                                        <SelectItem value="uzun_mola" className="flex items-center gap-2">
                                          <CheckCircle2 className="h-4 w-4 inline mr-1" />
                                          Uzun Mola ({pomodoroState.uzunMolaSuresi} dk)
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div>
                                    <label className="text-sm text-muted-foreground block mb-1">Görev Seçimi</label>
                                    <Select
                                      value={pomodoroState.selectedTaskId}
                                      onValueChange={(value) => dispatch({ type: "SET_SELECTED_TASK", payload: value })}
                                    >
                                      <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Görev seçin" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="none">Görev Seçilmedi</SelectItem>
                                        {yapilacakGorevler.map((gorev) => (
                                          <SelectItem key={gorev.id} value={gorev.id}>
                                            {gorev.baslik}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              )}
                            </motion.div>
                          </CardContent>
                          {!pomodoroState.isFullscreen && (
                            <CardFooter className="pt-0 px-6 pb-6">
                              <div className="w-full">
                                <Collapsible 
                                  open={isSettingsOpen} 
                                  onOpenChange={setIsSettingsOpen} 
                                  className="border rounded-lg shadow-sm transition-all duration-300"
                                >
                                  <CollapsibleTrigger asChild>
                                    <div className="flex justify-between items-center p-3 bg-muted/20 rounded-lg cursor-pointer hover:bg-muted/30 transition-colors">
                                      <div className="flex items-center gap-2">
                                        <Settings className="h-4 w-4 text-muted-foreground" />
                                        <h4 className="text-sm font-medium">Zamanlayıcı Ayarları</h4>
                                      </div>
                                      <Button variant="ghost" size="sm" className="p-0 h-8 w-8">
                                        {isSettingsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                      </Button>
                                    </div>
                                  </CollapsibleTrigger>
                                  <CollapsibleContent className="p-4 pt-2">
                                    <div ref={settingsRef}></div>
                                    <motion.div 
                                      className="space-y-4 mt-2"
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: -10 }}
                                      transition={{ duration: 0.5, ease: "easeInOut" }}
                                    >
                                      <div className="grid grid-cols-2 gap-3 items-center">
                                        <label htmlFor="calismaSuresi" className="text-sm">
                                          Çalışma süresi (dk):
                                        </label>
                                        <input
                                          id="calismaSuresi"
                                          type="number"
                                          min="1"
                                          max="120"
                                          className="w-full p-2 border rounded"
                                          value={tempCalismaSuresi}
                                          onChange={(e) => 
                                            setTempCalismaSuresi(Math.max(1, Math.min(120, parseInt(e.target.value || pomodoroState.calismaSuresi.toString(), 10))))
                                          }
                                        />
                                      </div>
                                      <div className="grid grid-cols-2 gap-3 items-center">
                                        <label htmlFor="kisaMolaSuresi" className="text-sm">
                                          Kısa mola süresi (dk):
                                        </label>
                                        <input
                                          id="kisaMolaSuresi"
                                          type="number"
                                          min="1"
                                          max="30"
                                          className="w-full p-2 border rounded"
                                          value={tempKisaMolaSuresi}
                                          onChange={(e) => 
                                            setTempKisaMolaSuresi(Math.max(1, Math.min(30, parseInt(e.target.value || pomodoroState.kisaMolaSuresi.toString(), 10))))
                                          }
                                        />
                                      </div>
                                      <div className="grid grid-cols-2 gap-3 items-center">
                                        <label htmlFor="uzunMolaSuresi" className="text-sm">
                                          Uzun mola süresi (dk):
                                        </label>
                                        <input
                                          id="uzunMolaSuresi"
                                          type="number"
                                          min="5"
                                          max="60"
                                          className="w-full p-2 border rounded"
                                          value={tempUzunMolaSuresi}
                                          onChange={(e) => 
                                            setTempUzunMolaSuresi(Math.max(5, Math.min(60, parseInt(e.target.value || pomodoroState.uzunMolaSuresi.toString(), 10))))
                                          }
                                        />                                      </div>                                      <Button 
                                        onClick={() => {
                                          // First, save changes directly to localStorage
                                          setPomodoroState(currentState => {
                                            const newState = {
                                              ...currentState,
                                              calismaSuresi: tempCalismaSuresi,
                                              kisaMolaSuresi: tempKisaMolaSuresi,
                                              uzunMolaSuresi: tempUzunMolaSuresi
                                            };
                                            
                                            // If current mode is affected, update duration and remaining time
                                            if (currentState.mode === "calisma") {
                                              newState.duration = tempCalismaSuresi * 60;
                                              newState.remainingTime = tempCalismaSuresi * 60;
                                            } else if (currentState.mode === "kisa_mola") {
                                              newState.duration = tempKisaMolaSuresi * 60;
                                              newState.remainingTime = tempKisaMolaSuresi * 60;
                                            } else if (currentState.mode === "uzun_mola") {
                                              newState.duration = tempUzunMolaSuresi * 60;
                                              newState.remainingTime = tempUzunMolaSuresi * 60;
                                            }
                                            
                                            // If timer is active, stop it
                                            if (currentState.isActive) {
                                              newState.isActive = false;
                                              // Reset the lastTimeStamp
                                              setLastTimeStamp(null);
                                            }
                                            
                                            return newState;
                                          });
                                          
                                          setIsSettingsOpen(false); // Close settings panel
                                        }}
                                        className="w-full mt-4"
                                      >
                                        Kaydet ve Kapat
                                      </Button>
                                    </motion.div>
                                  </CollapsibleContent>
                                </Collapsible>
                              </div>
                            </CardFooter>
                          )}
                        </Card>
                      </motion.div>
                    </TabsContent>
                  </motion.div>
                )}

                {activeTab === "istatistikler" && !pomodoroState.isFullscreen && (
                  <motion.div
                    key="istatistikler"
                  >
                    <TabsContent value="istatistikler" className="space-y-5 mt-0">
                      {/* Tarih Seçimi ve İstatistik Filtreleme */}
                      <motion.div
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        <Card className="mb-4">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <CalendarIcon className="h-5 w-5 text-primary" />
                                İstatistik Tarih Seçimi
                              </div>
                              
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive" size="sm" className="h-8 px-3 gap-1">
                                    <Trash2 className="h-4 w-4" />
                                    İstatistikleri Temizle
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>İstatistikleri silmek istediğinize emin misiniz?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Bu işlem tüm istatistikleri kalıcı olarak silecektir. Bu işlem geri alınamaz.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>İptal</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => {
                                        // Tüm istatistikleri temizle ve sayacı sıfırla
                                        if (selectedStats.length === 0 || selectedStats.length === istatistikler.length) {
                                          const allIds = istatistikler.map(i => i.id);
                                          handleDeleteStatsAndResetCounter(allIds);
                                        } else {
                                          // Seçili istatistikleri temizle ve sayacı sıfırla
                                          handleDeleteStatsAndResetCounter(selectedStats);
                                        }
                                        setSelectedStats([]);
                                      }}
                                    >
                                      İstatistikleri Sil
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </CardTitle>
                          </CardHeader>
                          
                          <CardContent>
                            <div className="flex flex-col md:flex-row gap-4 items-start">
                              <div className="w-full md:w-1/2">
                                <div className="flex flex-col space-y-1.5">
                                  <label htmlFor="date" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    İstatistik Tarihi
                                  </label>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button
                                        variant="outline"
                                        className="w-full justify-start text-left font-normal"
                                      >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {selectedDateForFiltering ? (
                                          format(selectedDateForFiltering, "dd MMMM yyyy", { locale: tr })
                                        ) : (
                                          <span>Tarih seçin</span>
                                        )}
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                      <Calendar
                                        mode="single"
                                        selected={selectedDateForFiltering}
                                        onSelect={(date) => {
                                          setSelectedDateForFiltering(date);
                                          setSelectedStats([]);
                                          
                                          // Seçilen tarih için veri olup olmadığını kontrol et
                                          if (date) {
                                            const selectedDateStr = date.toISOString().split("T")[0];
                                            const hasData = istatistikler.some((i) => i.tarih.split("T")[0] === selectedDateStr);
                                            
                                            // Sadece veri varsa scroll yap
                                            if (hasData) {
                                              setTimeout(() => {
                                                if (allowAutoScroll) {
                                                  statsCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                                }
                                              }, 100);
                                            }
                                          }
                                        }}
                                        initialFocus
                                      />
                                    </PopoverContent>
                                  </Popover>
                                </div>
                              </div>
                              
                              <div className="w-full md:w-1/2 flex flex-col space-y-1.5">
                                <label className="text-sm font-medium leading-none">
                                  İşlemler
                                </label>
                                <div className="flex space-x-2">
                                  <Button 
                                    variant="outline"
                                    onClick={() => {
                                      const today = new Date();
                                      setSelectedDateForFiltering(today);
                                      
                                      // Bugün için veri olup olmadığını kontrol et
                                      const todayStr = today.toISOString().split("T")[0];
                                      const hasData = istatistikler.some((i) => i.tarih.split("T")[0] === todayStr);
                                      
                                      // Sadece veri varsa scroll yap
                                      if (hasData) {
                                        setTimeout(() => {
                                          statsCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                        }, 100);
                                      }
                                    }}
                                    className="flex-1"
                                  >
                                    Bugün
                                  </Button>
                                  <Button 
                                    variant="outline"
                                    onClick={() => {
                                      const yesterday = new Date();
                                      yesterday.setDate(yesterday.getDate() - 1);
                                      setSelectedDateForFiltering(yesterday);
                                      
                                      // Dün için veri olup olmadığını kontrol et
                                      const yesterdayStr = yesterday.toISOString().split("T")[0];
                                      const hasData = istatistikler.some((i) => i.tarih.split("T")[0] === yesterdayStr);
                                      
                                      // Sadece veri varsa scroll yap
                                      if (hasData) {
                                        setTimeout(() => {
                                          statsCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                        }, 100);
                                      }
                                    }}
                                    className="flex-1"
                                  >
                                    Dün
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>

                      <motion.div
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 0.1 }}
                      >
                        <Card>
                          <div ref={statsCardRef}></div>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                              <BarChart2 className="h-5 w-5 text-primary" />
                              Günlük İstatistikler
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {selectedDateForFiltering ? (
                                // Seçili tarihe göre filtreleme
                                (() => {
                                  const selectedDateStr = selectedDateForFiltering.toISOString().split("T")[0];
                                  const filteredStats = istatistikler.filter((i) => i.tarih.split("T")[0] === selectedDateStr);
                                  const filteredTotalMinutes = filteredStats.reduce((total, i) => total + i.sure, 0);
                                  
                                  return (
                                    <>
                                      <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-muted/20 p-4 rounded-lg text-center">
                                          <div className="text-3xl font-bold text-primary">{filteredStats.length}</div>
                                          <div className="text-sm text-muted-foreground">Tamamlanan Pomodoro</div>
                                        </div>
                                        <div className="bg-muted/20 p-4 rounded-lg text-center">
                                          <div className="text-3xl font-bold text-primary">{filteredTotalMinutes}</div>
                                          <div className="text-sm text-muted-foreground">Toplam Dakika</div>
                                        </div>
                                      </div>

                                      {/* Zaman İlerleme Çubuğu */}
                                      <div className="mt-4">
                                        <Collapsible open={pomodoroState.gunlukHedefVisible}>
                                          <CollapsibleTrigger 
                                            className="flex justify-between items-center w-full text-left mb-2 px-1 hover:bg-muted/50 rounded transition-colors"
                                          >
                                            <div className="flex items-center gap-2">
                                              <span className="text-sm font-medium">Günlük Hedef (Dakika)</span>
                                              <Badge variant="outline" className="ml-2">
                                                {pomodoroState.gunlukHedef} dk
                                              </Badge>
                                              <span className="text-xs text-muted-foreground ml-1 hidden sm:inline">(Tıklayarak {pomodoroState.gunlukHedefVisible ? 'gizle' : 'göster'})</span>
                                            </div>
                                            <div onClick={(e) => {
                                              e.stopPropagation();
                                              dispatch({ type: "TOGGLE_GUNLUK_HEDEF_VISIBILITY" });
                                            }}
                                            className="cursor-pointer hover:bg-muted/50 p-1 rounded-md transition-colors"
                                            title={`Günlük hedef ayarlarını ${pomodoroState.gunlukHedefVisible ? 'gizle' : 'göster'}`}>
                                              {pomodoroState.gunlukHedefVisible ? (
                                                <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                              ) : (
                                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                              )}
                                            </div>
                                          </CollapsibleTrigger>
                                          
                                          <CollapsibleContent className="space-y-2">
                                            <div className="text-xs text-muted-foreground text-center mb-1">
                                              Kaydırıcı üzerinde ayarınızı yapıp bırakın. İşlem bittiğinde bu bölümü gizleyebilirsiniz.
                                            </div>
                                            <Slider
                                              defaultValue={[pomodoroState.gunlukHedef]}
                                              min={10}
                                              max={300}
                                              step={5}
                                              value={[pomodoroState.gunlukHedef]}
                                              onValueChange={(value) => {
                                                dispatch({
                                                  type: "SET_GUNLUK_HEDEF",
                                                  payload: value[0]
                                                })
                                              }}
                                              className="py-2"
                                            />
                                          <div className="flex justify-between text-xs text-muted-foreground px-0.5">
                                            <span>Min: 10 dk</span>
                                            <span className="font-medium">Tamamlanan: {filteredTotalMinutes}/{pomodoroState.gunlukHedef} dk</span>
                                            <span>Max: 300 dk</span>
                                          </div>
                                          </CollapsibleContent>
                                        </Collapsible>
                                        <Progress 
                                          value={Math.min(100, (filteredTotalMinutes / pomodoroState.gunlukHedef) * 100)} 
                                          className="h-2" 
                                        />
                                        <div className="text-xs text-center mt-1 text-muted-foreground">
                                          Günlük hedefin {Math.round((filteredTotalMinutes / pomodoroState.gunlukHedef) * 100)}%'i tamamlandı
                                        </div>
                                      </div>
                                    </>
                                  )
                                })()
                              ) : (
                                <>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-muted/20 p-4 rounded-lg text-center">
                                      <div className="text-3xl font-bold text-primary">{dailyStats.length}</div>
                                      <div className="text-sm text-muted-foreground">Tamamlanan Pomodoro</div>
                                    </div>
                                    <div className="bg-muted/20 p-4 rounded-lg text-center">
                                      <div className="text-3xl font-bold text-primary">{totalMinutes}</div>
                                      <div className="text-sm text-muted-foreground">Toplam Dakika</div>
                                    </div>
                                  </div>

                                  {/* Zaman İlerleme Çubuğu */}
                                  <div className="mt-4">
                                    <Collapsible open={pomodoroState.gunlukHedefVisible}>
                                      <CollapsibleTrigger 
                                        className="flex justify-between items-center w-full text-left mb-2 px-1 hover:bg-muted/50 rounded transition-colors"
                                      >
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm font-medium">Günlük Hedef (Dakika)</span>
                                          <Badge variant="outline" className="ml-2">
                                            {pomodoroState.gunlukHedef} dk
                                          </Badge>
                                          <span className="text-xs text-muted-foreground ml-1 hidden sm:inline">(Tıklayarak {pomodoroState.gunlukHedefVisible ? 'gizle' : 'göster'})</span>
                                        </div>
                                        <div onClick={(e) => {
                                          e.stopPropagation();
                                          dispatch({ type: "TOGGLE_GUNLUK_HEDEF_VISIBILITY" });
                                        }}
                                        className="cursor-pointer hover:bg-muted/50 p-1 rounded-md transition-colors"
                                        title={`Günlük hedef ayarlarını ${pomodoroState.gunlukHedefVisible ? 'gizle' : 'göster'}`}>
                                          {pomodoroState.gunlukHedefVisible ? (
                                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                          ) : (
                                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                          )}
                                        </div>
                                      </CollapsibleTrigger>
                                      
                                      <CollapsibleContent className="space-y-2">
                                        <div className="text-xs text-muted-foreground text-center mb-1">
                                          Kaydırıcı üzerinde ayarınızı yapıp bırakın. İşlem bittiğinde bu bölümü gizleyebilirsiniz.
                                        </div>
                                        <Slider
                                        defaultValue={[pomodoroState.gunlukHedef]}
                                        min={10}
                                        max={300}
                                        step={5}
                                        value={[pomodoroState.gunlukHedef]}
                                        onValueChange={(value) => {
                                          dispatch({
                                            type: "SET_GUNLUK_HEDEF",
                                            payload: value[0]
                                          })
                                        }}
                                        className="py-2"
                                      />
                                      <div className="flex justify-between text-xs text-muted-foreground px-0.5">
                                        <span>Min: 10 dk</span>
                                        <span className="font-medium">Tamamlanan: {totalMinutes}/{pomodoroState.gunlukHedef} dk</span>
                                        <span>Max: 300 dk</span>
                                      </div>
                                      </CollapsibleContent>
                                    </Collapsible>
                                    <Progress 
                                      value={Math.min(100, (totalMinutes / pomodoroState.gunlukHedef) * 100)} 
                                      className="h-2" 
                                    />
                                    <div className="text-xs text-center mt-1 text-muted-foreground">
                                      Günlük hedefin {Math.round((totalMinutes / pomodoroState.gunlukHedef) * 100)}%'i tamamlandı
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>

                      <motion.div
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 0.2 }}
                      >
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <BarChart2 className="h-5 w-5 text-primary" />
                                Görev Bazlı İstatistikler
                              </div>                              {selectedStats.length > 0 && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button 
                                      variant="destructive" 
                                      size="sm"
                                      className="h-8 px-3 gap-1"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      Seçilenleri Sil ({selectedStats.length})
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Seçili istatistikleri silmek istediğinize emin misiniz?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Bu işlem seçili {selectedStats.length} istatistiği kalıcı olarak silecektir. Bu işlem geri alınamaz.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>İptal</AlertDialogCancel>
                                      <AlertDialogAction 
                                        onClick={() => {
                                          onPomodoroIstatistikSil(selectedStats);
                                          setSelectedStats([]);
                                        }}
                                      >
                                        Seçilenleri Sil
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            {(() => {
                              // Tarih filtreleme
                              let filteredIstatistikler = istatistikler;
                              if (selectedDateForFiltering) {
                                const selectedDateStr = selectedDateForFiltering.toISOString().split("T")[0];
                                filteredIstatistikler = istatistikler.filter((i) => i.tarih.split("T")[0] === selectedDateStr);
                              }

                              // Görev bazlı gruplama
                              const taskStatsByDate = filteredIstatistikler.reduce(
                                (acc, i) => {
                                  if (!acc[i.gorevId]) {
                                    acc[i.gorevId] = {
                                      gorevAdi: i.gorevAdi,
                                      toplamSure: 0,
                                      pomodoroSayisi: 0,
                                      istatistikler: [], // İstatistikleri burada saklayacağız
                                    }
                                  }
                                  acc[i.gorevId].toplamSure += i.sure;
                                  acc[i.gorevId].pomodoroSayisi += 1;
                                  acc[i.gorevId].istatistikler.push(i);
                                  return acc;
                                },
                                {} as Record<string, { gorevAdi: string; toplamSure: number; pomodoroSayisi: number; istatistikler: PomodoroIstatistik[] }>,
                              );

                              if (Object.keys(taskStatsByDate).length === 0) {
                                return (
                                  <div className="text-center py-8 text-muted-foreground">
                                    <div className="mb-2 opacity-60">
                                      <BarChart2 className="h-12 w-12 mx-auto" />
                                    </div>
                                    {selectedDateForFiltering 
                                      ? `${format(selectedDateForFiltering, "dd MMMM yyyy", { locale: tr })} tarihine ait istatistik bulunmuyor.` 
                                      : "Henüz pomodoro istatistiği bulunmuyor."}
                                  </div>
                                );
                              }

                              return (
                                <div className="space-y-4">
                                  {Object.values(taskStatsByDate).map((gorevStat, index) => (
                                    <motion.div
                                      key={index}
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ delay: index * 0.1 }}
                                      className="space-y-2"
                                    >
                                      <div className="flex justify-between items-center p-3 bg-muted/10 rounded-lg border border-muted">
                                        <div>
                                          <div className="font-medium">{gorevStat.gorevAdi}</div>
                                          <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                            <Timer className="h-3 w-3" />
                                            {gorevStat.toplamSure} dakika
                                          </div>
                                        </div>
                                        <Badge variant="outline">
                                          {gorevStat.pomodoroSayisi} pomodoro
                                        </Badge>
                                      </div>
                                      
                                      {/* Pomodoro detayları */}
                                      <div className="pl-2 border-l-2 border-muted ml-2">
                                        {gorevStat.istatistikler.map((istatistik, i) => {
                                          const istatistikTarih = new Date(istatistik.tarih);
                                          return (
                                            <div 
                                              key={i}
                                              className={`flex justify-between items-center p-2 rounded-md cursor-pointer hover:bg-muted/20 transition-colors ${
                                                selectedStats.includes(istatistik.id) ? 'bg-muted/30 border border-primary/30' : 'border-transparent'
                                              }`}
                                              onClick={() => {
                                                if (selectedStats.includes(istatistik.id)) {
                                                  setSelectedStats(selectedStats.filter(id => id !== istatistik.id));
                                                } else {
                                                  setSelectedStats([...selectedStats, istatistik.id]);
                                                }
                                              }}
                                            >
                                              <div className="flex items-center gap-2">
                                                <Timer className="h-3 w-3 text-muted-foreground" />
                                                <span className="text-sm">
                                                  {istatistik.sure} dk ({format(istatistikTarih, "HH:mm", { locale: tr })})
                                                </span>
                                              </div>
                                              <div className="text-xs text-muted-foreground">
                                                {format(istatistikTarih, "dd MMM yyyy", { locale: tr })}
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </motion.div>
                                  ))}
                                </div>
                              );
                            })()}
                          </CardContent>
                        </Card>
                      </motion.div>
                    </TabsContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Tabs>
        </motion.div>
      </div>
    </motion.div>
  )
})

export default PomodoroZamanlayici
