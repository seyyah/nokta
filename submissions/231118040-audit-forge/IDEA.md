# IDEA - Nokta Audit Forge

Nokta Audit Forge, musterinin gelistirici gibi davrandigi kapali bir dongu kurar. Musteri kod yazmaz;
uygulamada gordugu UX aksakligini `nokta-audit` ile yakalar, sari kutuyla isaretler ve notunu Markdown
rapor olarak cikarir. Bu rapor dogrudan Codex gibi bir coding agent'a verilir. Agent raporu okur,
ilgili ekran kodunu bulur, minimal hipotez kurar, fix uygular, test eder ve ratchet gecerse commit
atar.

## Problem

Mobil uygulamalarda UX hatasini yakalamak ile gelistiricinin onu onarmasi arasinda fazla surtunme var.
Ekran goruntusu ayri, not ayri, issue ayri ve kod degisikligi ayri yerde yasiyor. Bu kopukluk hem
rapor kalitesini hem de agent'in dogru dosyayi bulma ihtimalini dusuruyor.

## Deger onerisi

Audit widget raporu tek artifact haline getirir: ekran adi, burn-in gorsel kanit, not, koordinat ve
zaman. Forge ledger ise bu artifact'in nasil onarima donustugunu izler. Boylece "musteri yakalar,
agent onarir, insan review eder" akisi kanitlanabilir hale gelir.

## Kullanici akisi

1. Tester Capture, Reports veya Forge ekraninda sorun gorur.
2. FAB'a dokunur, screenshot alir.
3. Sari kutuyla problemli alani isaretler.
4. Kisa not yazar.
5. Markdown raporu export eder.
6. Rapor Codex'e input olur.
7. Codex 15 dakikalik forge cycle calistirir.
8. Basarili cycle commit olur; riskli hipotez rollback loglanir.

## Anti-slop baglantisi

Nokta'nin anti-slop felsefesi, belirsiz "AI halleder" iddiasi yerine kanitli ve dar kapsamli dongu
kurmayi gerektirir. Bu submission, buyuk bir platform iddiasi yerine tek primitive'i kanitlar:
drop-in audit widget raporu, minimal agent fix'i ve FORGE ledger. Her cycle kucuk tutulur; rollback
silinmez, ogrenme olarak loglanir.

## Acik inovasyon baglantisi

Musteri, QA veya beta kullanici yalnizca sikayet eden kisi degil, gelistirme dongusunun input ureten
parcasidir. Raporlar insan tarafindan okunabilir, agent tarafindan islenebilir ve git history ile
denetlenebilir. Bu da kapali SaaS bug platformu yerine dosya tabanli, paylasilabilir ve agent-ready
bir inovasyon akisi kurar.
