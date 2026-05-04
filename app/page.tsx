import type { Metadata } from "next"
import PlanlamaApp from "@/components/planlama-app"

export const metadata: Metadata = {
  title: 'Pomodoro ve Ders Çalışma Uygulaması | Zaman Yönetimi Teknikleri',
  description: 'Etkili ders çalışma ve zaman yönetimi için Pomodoro tekniğini kullanın. Planlama, görev takibi ve takvim özellikleriyle verimliliğinizi artırın.',
  keywords: [
    'pomodoro uygulaması',
    'ders çalışma uygulaması',
    'zaman yönetimi',
    'pomodoro tekniği',
    'verimli ders çalışma',
    'online pomodoro',
    'ders çalışma sayacı',
    'zaman yönetimi uygulaması',
    'planlama aracı',
    'görev yönetimi',
    'sınav hazırlık uygulaması',
    'TYT hazırlık',
    'AYT hazırlık',
    'LGS hazırlık',
    'KPSS hazırlık',
    'odaklanma uygulaması',
  ],
}

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <PlanlamaApp />
    </main>
  )
}
