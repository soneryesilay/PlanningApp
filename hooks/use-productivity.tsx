"use client"

import { useState, useEffect } from "react"
import { Gorev } from "@/lib/types"
import { useLocalStorage } from "@/hooks/use-local-storage"

interface StreakData {
  lastActivityDate: string | null
  currentStreak: number
  longestStreak: number
}

export function useProductivity(gorevler: Gorev[]) {
  const [streakData, setStreakData] = useLocalStorage<StreakData>("productivity-streak", {
    lastActivityDate: null,
    currentStreak: 0,
    longestStreak: 0,
  })

  const aktifGorevler = gorevler.filter(g => !g.arsivlendi);
  const tamamlananGorevSayisi = aktifGorevler.filter(g => g.durum === "Tamamlandı").length
  const toplamGorevSayisi = aktifGorevler.length
  
  // Günlük hedef - varsayılan olarak 5, ileride kullanıcı tarafından ayarlanabilir
  const gunlukHedef = 5
  
  // Seviye hesaplaması - her 10 tamamlanan görev için 1 seviye
  const level = Math.floor(tamamlananGorevSayisi / 10) + 1
  
  // Streak hesaplaması
  useEffect(() => {
    // Bugün tarihi
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStr = today.toISOString().split('T')[0]
    
    // Son aktivite tarihi
    const lastActivityDate = streakData.lastActivityDate 
      ? new Date(streakData.lastActivityDate)
      : null
    
    // Bugün en az bir görev tamamlandı mı?
    const todayCompletedTasks = aktifGorevler.filter(g => {
      if (g.durum !== "Tamamlandı") return false
      
      // Tarih bilgisi olmayan görevleri kontrol etme
      if (!g.tarih) return false
      
      const taskDate = new Date(g.tarih)
      taskDate.setHours(0, 0, 0, 0)
      return taskDate.toISOString().split('T')[0] === todayStr
    })
    
    if (todayCompletedTasks.length > 0) {
      // Bugün görev tamamlandı
      
      // Dün tarihini kontrol et
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      yesterday.setHours(0, 0, 0, 0)
      const yesterdayStr = yesterday.toISOString().split('T')[0]
      
      if (lastActivityDate) {
        const lastDateStr = lastActivityDate.toISOString().split('T')[0]
        
        if (lastDateStr === todayStr) {
          // Bugün zaten aktivite kaydedilmiş, bir şey yapma
        } else if (lastDateStr === yesterdayStr) {
          // Dün aktivite vardı, streak'i arttır
          const newStreak = streakData.currentStreak + 1
          setStreakData({
            lastActivityDate: todayStr,
            currentStreak: newStreak,
            longestStreak: Math.max(newStreak, streakData.longestStreak)
          })
        } else {
          // Dün aktivite yoktu, streak'i sıfırla ve bugünü 1 olarak başlat
          setStreakData({
            lastActivityDate: todayStr,
            currentStreak: 1,
            longestStreak: Math.max(1, streakData.longestStreak)
          })
        }
      } else {
        // İlk kez aktivite kaydediliyor
        setStreakData({
          lastActivityDate: todayStr,
          currentStreak: 1,
          longestStreak: 1
        })
      }
    }
  }, [gorevler, streakData, setStreakData])
  
  return {
    tamamlananGorevSayisi,
    toplamGorevSayisi,
    gunlukHedef,
    level,
    streakGunSayisi: streakData.currentStreak,
    enUzunStreakGunSayisi: streakData.longestStreak
  }
}
