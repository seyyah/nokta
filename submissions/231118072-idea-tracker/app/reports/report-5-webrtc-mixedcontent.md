# Dictated Audit Report 5: WebRTC WebView Mixed Content
**Source:** Voice Dictation via OpenAI Whisper
**Date:** 2026-06-12T17:07:00

## Transcription
"uzman arama ekranındaki webview bileşeni bazı cihazlarda bağlantı hatası veriyor ve kamera açılmıyor sanırım oda adresi güvenli olmayan protokolle yüklendiğinde mixed content engelleyici devreye giriyor oda adresinin https olmasını garantileyelim ve webview ayarlarında mixed content modunu her zaman izin ver olarak güncelleyelim"

## Extracted Issue
The WebView fails to render Jitsi WebRTC call room on some devices due to mixed content restrictions. Requires securing the ROOM_URL to https and configuring mixedContentMode.
