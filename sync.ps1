$host.UI.RawUI.WindowTitle = "DnD Proje Senkronizasyon Araci"
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   D&D PROJESI - KOLAY SENKRONIZASYON" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Su anki Branch: $((git branch --show-current).Trim())" -ForegroundColor Magenta
Write-Host ""
Write-Host "Ne yapmak istiyorsun?"
Write-Host "1. ARKADASIMIN yaptiklarini al (Pull from Main)"
Write-Host "2. BENIM yaptiklarimi gonder (Push to Remote & Main)"
Write-Host "3. Cikis"
Write-Host ""

$choice = Read-Host "Secimin (1, 2 veya 3)"

if ($choice -eq '1') {
    Write-Host ""
    Write-Host "🔄 Guncellemeler 'main'den cekiliyor..." -ForegroundColor Yellow
    git pull origin main
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Guncellemeler basariyla alindi!" -ForegroundColor Green
    }
    else {
        Write-Host "❌ Bir hata olustu (Cakisma olabilir)." -ForegroundColor Red
    }
}
elseif ($choice -eq '2') {
    Write-Host ""
    $msg = Read-Host "📝 Yaptigin degisiklikleri anlatan kisa bir mesaj yaz"
    if ([string]::IsNullOrWhiteSpace($msg)) { 
        $msg = "Ufak duzeltmeler" 
    }
    
    Write-Host "📦 Degisiklikler paketleniyor..." -ForegroundColor Yellow
    git add .
    git commit -m "$msg"
    
    $currentBranch = (git branch --show-current).Trim()
    Write-Host "🚀 '$currentBranch' branch'ine gonderiliyor (Remote)..." -ForegroundColor Yellow
    # 1. Push to current branch remote
    git push origin HEAD
    
    Write-Host "🚀 'Main' branch'ine de gonderiliyor..." -ForegroundColor Yellow
    # 2. Push to remote main as well
    git push origin HEAD:main
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Degisikliklerin basariyla gonderildi!" -ForegroundColor Green
    }
    else {
        Write-Host "❌ Gonderirken hata olustu." -ForegroundColor Red
    }
}
elseif ($choice -eq '3') {
    Write-Host "Cikiliyor..."
}
else {
    Write-Host "❌ Gecersiz secim." -ForegroundColor Red
}

Write-Host ""
Write-Host "Pencereyi kapatmak icin Enter'a bas..."
Read-Host
