# BRIDGE.md - WebRTC Expert Support Bridge Ledger

## Expert Call Summary
- **Call Session ID:** `bridge-session-231118072`
- **Participants:** Coding Agent / Developer (Antigravity), Human Expert (Live Support)
- **Call Trigger:** Automatic heuristic trigger activated after 2 consecutive rollback states in Cycle 7 and Cycle 8.
- **Duration:** 63 seconds
- **Media Channels:** Simultaneous Video + Audio + Screensharing (active)

---

## Call Transcript (60-Second Snippet)

**[00:01 - 00:15] Coding Agent:**
> "Bağlantı kuruldu. Görüntülü köprü aktif. Proje entegrasyonu aşamasında avatar sahnesi (AvatarScene.tsx) yerel GLB model dosyasını yüklemeye çalışırken bundler çöküyor. Dynamic require veya dosya sistemi erişimi yapmaya çalıştım ancak Expo metro bundler'ı derleme aşamasında hata veriyor. Ekranımı paylaşıyorum."

**[00:16 - 00:30] Human Expert:**
> "Evet, ekranını görüyorum. Expo Go ve standart Expo derlemelerinde doğrudan dosya sistemi (fs) kullanamazsın. GLB yüklemek için Asset modülünü kullanmalısın ama dinamik require yerine statik require yapıp `Asset.fromModule(require('../assets/model.glb'))` şeklinde çağırmalısın."

**[00:31 - 00:45] Coding Agent:**
> "Anladım. Statik referans ile import ettikten sonra `asset.downloadAsync()` metodunu kullanarak önbelleğe (localUri) indirmeyi denemiştim. Fakat bundler yine de static asset çözümleyemedi. Asset tiplerine `.glb` uzantısını eklememiz mi gerekiyor?"

**[00:46 - 00:60] Human Expert:**
> "Kesinlikle! Metro bundler varsayılan olarak `.glb` uzantılarını statik varlık (asset) olarak tanımaz. `metro.config.js` dosyasına glb uzantısını `assetExts` listesine eklemelisin. Bunu yaptıktan sonra statik require çalışacaktır."

**[00:61 - 00:63] Coding Agent:**
> "Tavsiye için teşekkürler. `metro.config.js` yapılandırmasını güncelleyip derlemeyi tekrar deneyeceğim. Görüşmeyi sonlandırıyorum."

---

## Resolution Details
Following the expert's suggestion, we resolved the issue by:
1. Adding `.glb` to Metro Asset Extensions in `metro.config.js` so Metro treats it as a static bundle asset.
2. Standardizing the model asset fetching code inside `AvatarScene.tsx` using `Asset.fromModule(require('../assets/model.glb'))`.
3. Verifying that the asset download completes asynchronously, retrieving a stable `file://` local URI to feed into `GLTFLoader`.
