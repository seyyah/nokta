# Avatar kurulumu (211118068)

1. https://avaturn.me adresinde **kendi yüzünle** scan yap.
2. `.glb` export indir.
3. Dosyayı şu iki yere koy:
   - `submissions/211118068-audit-forge/avatar.glb` (teslim zorunluluğu)
   - `submissions/211118068-audit-forge/app/assets/models/avatar.glb` (uygulama runtime)

```powershell
Copy-Item "..\avatar.glb" "app\assets\models\avatar.glb"
```

4. Uygulamayı yeniden başlat (`npx expo start -c`).

## Kafa + omuz (önerilen — daha hızlı yüklenir)

Tam vücut GLB (~14 MB) Expo Go’da yavaş olabilir. Avaturn’da export alırken:

- **Crop / bust** veya sadece **head + shoulders** seçeneği varsa onu kullan
- Yoksa Blender / https://gltf.report ile modeli **boyun hizasından kes**; dosyayı `app/avatar.glb` olarak kaydet (hedef &lt; 5 MB)

Uygulama kamerası zaten yüze zoom yapar; küçük dosya = daha az “Hazırlık başarısız” riski.

## 3D çalışmıyorsa

1. Telefon ve PC **aynı hotspot/Wi‑Fi** (mobil veri + kampüs Wi‑Fi birbirini görmez)
2. İnternet açık (model-viewer script bir kez indirilir)
3. Studio’da **3D tekrar dene**

Generic/stock head model **kabul edilmez** — hocanın şartı.
