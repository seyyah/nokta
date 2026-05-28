# FORGE Otomatik Raporu

Bu dosya, Nokta uygulamasındaki sesli asistan döngüsünde `app/services/forge/forgeEngine.ts` tarafından otomatik olarak güncellenir. `expo-file-system` kullanılarak uygulama belge klasörüne kaydedilir.

- Rapor oluşturma: otomatik
- Kaydedildiği yol: `expo-file-system` documentDirectory içinde `FORGE.md`
- Amaç: sesli konuşmayı, Forge yanıtını ve retry/rollback döngüsünü belgeleme
