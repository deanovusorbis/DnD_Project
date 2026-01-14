# D&D Project - Experiential Learning Platform

Bu proje, D&D 5E kurallarını deneysel olarak öğretmeyi amaçlayan interaktif bir web uygulamasıdır.

## Kurulum (Nasıl Çalıştırılır?)

Bu projeyi bilgisayarınızda çalıştırmak için aşağıdaki adımları izleyin:

### 1. Gereksinimler
Bilgisayarınızda **Node.js** yüklü olmalıdır.
- Yüklü değilse [nodejs.org](https://nodejs.org/) adresinden "LTS" sürümünü indirip kurun.

### 2. İndirme ve Hazırlık
1. İndirdiğiniz **ZIP** dosyasını bir klasöre çıkartın.
2. Klasörün içine girin.
3. Klasörde boş bir yere **Shift + Sağ Tık** yapın ve "PowerShell penceresini buradan aç" veya "Terminalde aç" seçeneğine tıklayın.
   - Alternatif: VS Code kullanıyorsanız klasörü VS Code ile açıp `Ctrl + é` (veya `Ctrl + ~`) ile terminali açabilirsiniz.

### 3. Yükleme
Terminal ekranına şu komutu yazıp **Enter**'a basın:
```powershell
npm install
```

### 4. Başlatma
Yükleme bittikten sonra projeyi başlatmak için şu komutu yazın:
```powershell
npm run dev
```

## Sık Karşılaşılan Hatalar

### "npm : The term 'npm' is not recognized..." Hatası
Bu hata, bilgisayarınızda **Node.js** yüklü değil demektir.
1. [Bu linke tıklayın (nodejs.org)](https://nodejs.org/)
2. Ortadaki yeşil **"LTS"** butonuna basıp indirin.
3. İndirilen dosyayı kurun (Next > Next diyerek).
4. **Önemli:** Kurulum bittikten sonra açık olan terminali kapatıp **yeni bir terminal** açmanız gerekir.

### "npm : File ... cannot be loaded because running scripts is disabled" Hatası
Bu, Windows'un güvenlik ayarıyla ilgilidir. Çözmek için terminale şu komutu yapıştırıp Enter'a basın (çıkan soruya 'A' veya 'Y' deyip onaylayın):
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```
Sonra tekrar `npm install` yazın.

### "bash" Hatası
Komutun başındaki `bash` veya `powershell` yazılarını kopyalamayın. Sadece `npm install` gibi kodu yazın.

Terminalde şöyle bir yazı göreceksiniz:
`  ➜  Local:   http://localhost:5173/`

Bu linke (http://localhost:5173/) tarayıcınızdan gidin. Proje çalışıyor olacak! 🎉

## Proje Hakkında
- **Dil:** Türkçe (Standart D&D terimleri korunarak veya parantez içinde belirtilerek).
- **Veri:** 5E 2024 kuralları temel alınmıştır.
- **İçerik:** Karakter yaratma, envanter yönetimi, büyüler ve daha fazlası.
