# PlanningApp
🔗 **Canlı Uygulama:** [https://www.zamanyonetimi.com/](https://www.zamanyonetimi.com/)
---

![zamanyonetimi](https://github.com/user-attachments/assets/c0019f09-5d0e-4b54-84d2-38e5b4098b86)

---

Bu proje, kullanıcıların günlük görevlerini, notlarını ve önemli günlerini yönetmelerine yardımcı olmak için tasarlanmış bir planlama uygulamasıdır. Uygulama ayrıca bir Pomodoro zamanlayıcısı ve motivasyonel alıntılar gibi üretkenlik araçları da içerir.


## Özellikler

* **Görev Yönetimi:** Kapsamlı görev oluşturma, düzenleme, silme ve detay görüntüleme. Görevler yerel depolamada (localStorage) saklanır.
* **Not Yönetimi:** Not ekleme, düzenleme, silme ve görüntüleme. Notlar yerel depolamada kalıcıdır.
* **Önemli Günler Yönetimi:** Özel ve önemli tarihleri ekleme, düzenleme ve silme. Veriler yerel depolamada tutulur.
* **Pomodoro Zamanlayıcısı:** Çalışma ve mola sürelerini yönetmek için özelleştirilebilir Pomodoro tekniği zamanlayıcısı. Sesli alarm özelliği içerir.
* **Motivasyon Yazıları:** Kullanıcılara ilham vermek için rastgele motivasyonel alıntılar gösterimi.
* **Takvim Görünümü:** Görevlerin ve önemli günlerin aylık takvim üzerinde interaktif gösterimi.
* **İlerleme Takip Widget'ı:** Tamamlanan görevlere dayalı ilerleme ve üretkenlik istatistikleri.
* **Karanlık/Aydınlık Mod Desteği:** Kullanıcı tercihine göre tema değiştirme ve bu tercihin yerel depolamada saklanması.
* **Duyarlı Tasarım:** Masaüstü, tablet ve mobil cihazlarla tam uyumlu arayüz.
* **Sayfa Geçiş Animasyonları:** Akıcı ve modern bir kullanıcı deneyimi için yumuşak sayfa geçişleri.
* **"Buy Me a Coffee" Entegrasyonu:** Geliştiriciye destek olmak için isteğe bağlı bağış popup'ı.

## Kullanılan Teknolojiler

* **Framework:** Next.js
* **Dil:** TypeScript
* **Stil:** Tailwind CSS
* **UI Kütüphaneleri:**
  * Shadcn/UI (accordion, alert-dialog, badge, button, calendar, card, vb. için)
  * Radix UI (Shadcn/UI bileşenlerinin temeli)
  * Framer Motion (Animasyonlar için)
  * Recharts (Grafikler için)
  * Sonner (Toast bildirimleri için)
  * SweetAlert2 (Alert diyalogları için)
* **Form Yönetimi:** React Hook Form, Zod (Doğrulama için)
* **Sürükle ve Bırak:** @dnd-kit
* **Takvim:** React Day Picker
* **Diğer:**
  * Lucide React (İkonlar)
  * date-fns (Tarih işlemleri)
  * uuid (Benzersiz ID üretimi)
  * clsx, tailwind-merge (CSS class birleştirme)

## Başlarken

Bu talimatlar, projenin bir kopyasını yerel makinenizde geliştirme ve test amacıyla çalıştırmanıza yardımcı olacaktır.

### Ön Gereksinimler

Projeyi çalıştırmak için sisteminizde aşağıdakilerin kurulu olması gerekir:

* Node.js (v22 veya üstü önerilir)
* npm (Node.js ile birlikte gelir ve paket yöneticisi olarak npm kullanılmıştır)

Node.js'i [nodejs.org](https://nodejs.org/) adresinden indirebilirsiniz.  
npm, Node.js kurulumu ile birlikte otomatik olarak yüklenir. `npm --version` komutunu çalıştırarak npm kurulumunu doğrulayabilirsiniz.

### Kurulum

1. Projeyi klonlayın:
    ```bash
    git clone https://github.com/soneryesilay/PlanningApp.git
    ```
    Veya proje dosyalarını bir klasöre indirin.
2. Proje kök dizinine gidin:
    ```bash
    cd PlanningApp
    ```
3. Proje kök dizininde bir terminal açın.
4. Bağımlılıkları yüklemek için aşağıdaki komutu çalıştırın:
    ```bash
    npm install
    ```

### Uygulamayı Çalıştırma

Geliştirme sunucusunu başlatmak için aşağıdaki komutu çalıştırın:

```bash
npm run dev
```
Bu komut uygulamayı http://localhost:3000 adresinde başlatacaktır. Tarayıcınızda bu adresi açarak uygulamayı görüntüleyebilirsiniz.


## Mevcut Komutlar

`package.json` dosyasında tanımlanmış olan aşağıdaki komutları kullanabilirsiniz:

*   `npm run dev`: Geliştirme modunda uygulamayı başlatır.
*   `npm run build`: Üretim için uygulamayı derler.
*   `npm run start`: Derlenmiş üretim uygulamasını başlatır.
*   `npm run lint`: Kod stilini ve olası hataları kontrol eder (ESLint).

## Lisans

Bu proje, kişisel ve eğitim amaçlı kullanım için ücretsiz olarak sunulmaktadır.  
Ticari kullanım, yeniden dağıtım, satma, hizmet olarak sunma gibi ticari faaliyetler **yasaktır.**  
Tüm hakları saklıdır.  
Ticari kullanım talepleri için geliştirici ile iletişime geçilmelidir.

© 2025 Soner Yeşilay. Tüm hakları saklıdır.

