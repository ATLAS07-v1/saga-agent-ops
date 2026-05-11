# North Star: Saga Teknoloji AI Şirketi

Tarih: 2026-05-11

## Asıl Hedef

Saga Agent Ops'un asıl hedefi, tek bir lead/teklif otomasyonu yapmak değildir.

Asıl hedef:

**Saga Teknoloji'nin 30 çalışanlı AI versiyonunu kurmak.**

Bu sistemde:

- Her AI çalışanın kendi rolü, sorumluluğu ve skilleri olacak.
- Her AI çalışanın kendine ait yönetilen hafızası olacak.
- Her AI çalışanın kullanabileceği araçlar ve erişemeyeceği alanlar olacak.
- Bir orkestrasyon katmanı gelen işi anlayıp doğru çalışanlara dağıtacak.
- AI çalışanlar birbirlerine kontrollü şekilde iş devredebilecek, soru sorabilecek ve çıktılarını paylaşabilecek.
- İşler gerçek şirket süreci gibi task, step, artifact, approval, feedback ve rapor halinde ilerleyecek.
- İş bitince sonuç kullanıcıya veya owner'a gelecek.
- Dış aksiyon, müşteri iletişimi, fiyat teklifi, CRM write, deployment ve hassas işlemler insan onayı olmadan yapılmayacak.

## Ne İnşa Ediyoruz?

Bir "AI çalışanlı teknoloji firması işletim sistemi" inşa ediyoruz.

Temel parçalar:

1. Şirket organizasyonu.
2. 30 AI çalışan rolü.
3. Orkestrasyon motoru.
4. Ajanlar arası iletişim ve handoff sistemi.
5. Task ledger.
6. Approval queue.
7. Artifact ve çıktı yönetimi.
8. Cost/source/trace kaydı.
9. Knowledge base ve şirket hafızası.
10. Çalışan bazlı hafıza sistemi.
11. Skill/tool registry.
12. Eval ve kalite sistemi.
13. Departman ve iş akışı görünümü.

## Lead/Teklif Akışı Nedir?

Lead -> Research -> Offer Draft -> Approval akışı ürünün kendisi değildir.

Bu sadece ilk doğrulama senaryosudur.

Bu senaryo ile şunu kanıtlarız:

- Orkestrasyon katmanı iş açabiliyor mu?
- Doğru çalışanı seçebiliyor mu?
- Çalışanlar çıktı üretebiliyor mu?
- Çıktı diğer çalışana aktarılabiliyor mu?
- İş onaya düşebiliyor mu?
- Kaynak, maliyet, trace, artifact ve karar kaydı tutuluyor mu?

Bu çalışırsa aynı motor sonra teknik teslimat, müşteri raporu, ürün planı, destek, SEO, güvenlik ve maliyet kontrolü gibi şirket işlerine genişletilir.

## Çalışan Sözleşmesi

Her çalışan şu sözleşmeyle tanımlanır:

- rol adı
- departman
- görev kapsamı
- skill listesi
- kullanabileceği tool'lar
- erişebileceği bilgi kaynakları
- input schema
- output schema
- handoff yapabileceği roller
- hangi durumda onay isteyeceği
- hangi durumda işi bloke edeceği
- KPI ve eval kriteri
- prompt/persona versiyonu
- memory scope
- memory read/write policy
- GitHub/open-source araştırma notu

## Orkestrasyon Mantığı

Orkestrasyon iki katmandan oluşur:

### 1. Orchestration Engine

Deterministik işletim katmanı:

- task açar
- state machine çalıştırır
- worker sırasını yönetir
- retry/timeout uygular
- budget cap uygular
- approval kurallarını uygular
- trace ve event kaydı tutar

### 2. AI CEO / Özel Kalem

Faz ilerledikçe eklenecek yönetici ajan:

- işi yorumlar
- hangi departmanların çalışacağını önerir
- öncelik ve risk belirler
- iş bittiğinde yönetici özeti üretir
- açık kararları kullanıcıya getirir

P0'da engine önce gelir. AI CEO / Özel Kalem daha sonra engine'in üstünde akıllı planlama katmanı olarak eklenir.

## Ajanlar Arası İletişim

Gerçek şirket hissi için ajanların doğrudan kontrolsüz sohbet etmesi değil, kontrollü iletişim kurması gerekir.

İlk iletişim modeli:

- `handoff`: bir ajan çıktısını başka ajana devreder.
- `request_clarification`: bir ajan başka ajandan eksik bilgi ister.
- `review_request`: bir ajan kendi çıktısını kontrol için gönderir.
- `blocker`: ajan ilerlemek için insan veya başka ajan kararı gerektiğini bildirir.
- `summary`: ajan iş sonunda kısa durum mesajı verir.

Her mesaj task ledger'a kaydedilir. Böylece "kim kime ne söyledi" izlenir.

## 30 Çalışanlık Hedef Organizasyon

Tam sistemde resmi kadro:

1. AI CEO / Özel Kalem
2. Lead Araştırmacısı
3. Pazar İstihbarat Analisti
4. Satış Stratejisti
5. Teklif ve Kapsam Hazırlayıcı
6. Ürün Yöneticisi
7. Çözüm Mimarı
8. Backend Mühendisi
9. Frontend Mühendisi
10. Raporlama Analisti
11. Backend Mühendisi
12. Frontend Mühendisi
13. Mobil Uygulama Mühendisi
14. DevOps / Platform Mühendisi
15. Veri ve Entegrasyon Mühendisi
16. QA ve Test Otomasyon Uzmanı
17. Güvenlik ve KVKK İnceleyici
18. Uygulama Güvenliği Uzmanı
19. Cloud / Altyapı Güvenliği Uzmanı
20. Pentest ve Zafiyet Analisti
21. Threat Intelligence Analisti
22. Incident Response ve Güvenlik Operasyon Uzmanı
23. Otomasyon Mühendisi
24. SEO Stratejisti
25. İçerik Planlayıcı
26. Kampanya Metin Yazarı
27. Destek ve Talep Sınıflandırma Uzmanı
28. Finans ve Maliyet Kontrol Uzmanı
29. Bilgi Küratörü / Knowledge Manager
30. Compliance ve Risk Kontrol Uzmanı

## Başarı Kriteri

Başarı şu değildir:

- ekranda 30 çalışan görünmesi
- çok fazla prompt yazılması
- demo etkisi

Başarı şudur:

- kullanıcı bir iş verir
- sistem işi anlar
- doğru çalışanları seçer
- çalışanlar birbirine devrederek işi tamamlar
- sonuç onaya veya kullanıcıya gelir
- tüm süreç kayıtlıdır
- maliyet, kaynak, trace ve kalite görünürdür
- sistem aynı işi tekrar çalıştırabilir ve öğrenebilir

## Son Karar

İnşa edeceğimiz ürün:

**Saga Teknoloji'nin profesyonel 30 çalışanlı AI şirket işletim sistemi.**

İlk lead/teklif akışı sadece motoru kanıtlayan ilk doğrulama senaryosudur. Ürün vizyonu bundan çok daha geniştir.
