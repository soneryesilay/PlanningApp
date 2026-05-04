export interface Gorev {
  id: string
  baslik: string
  aciklama?: string
  tarih?: string
  baslangicSaati?: string
  bitisSaati?: string
  oncelik: string
  durum: string
  kategori?: string  // Görevlerin kategorisini tutacak yeni alan
  siraNo?: number    // Görevi sıralamak için kullanılacak alan
  arsivlendi?: boolean // Görevin arşivlenip arşivlenmediğini belirtecek alan
  arsivlenmeTarihi?: string // Görevin ne zaman arşivlendiğini belirtecek alan
  otomatikSilinecek?: boolean // Arşivdeki görevlerin otomatik silinip silinmeyeceğini belirtecek alan
}

export interface GorevKategori {
  id: string
  ad: string
  renk: string
}

export interface PomodoroIstatistik {
  id: string
  gorevId: string
  gorevAdi: string
  tarih: string
  sure: number // dakika cinsinden
}

export interface OnemliGun {
  id: string
  baslik: string
  aciklama?: string
  tarih: string
  renk: string
  kategori: string
  arsivlendi?: boolean // Önemli günün arşivlenip arşivlenmediğini belirtecek alan
  arsivlenmeTarihi?: string // Önemli günün ne zaman arşivlendiğini belirtecek alan
}

export interface Not {
  id: string
  baslik: string
  icerik: string
  detay?: string // Kullanıcının ek detay girebilmesi için yeni alan
  tarih: string
  etiketler?: string[]
  ekler?: {
    tip: "resim" | "link" | "youtube"
    url: string
    aciklama?: string
    imageData?: string // base64 encoded image data
  }[]
}

export interface MotivasyonYazisi {
  id: string
  icerik: string
  tarih: string
  aktif: boolean
}

export interface Counter {
  id: string
  title: string
  description: string
  count: number
  target?: number
}
