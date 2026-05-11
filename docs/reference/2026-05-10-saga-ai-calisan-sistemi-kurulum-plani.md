# Saga Teknoloji AI Çalışan Sistemi Kurulum Planı

Tarih: 2026-05-10  
Hazırlayan: ATLAS Core  
Kapsam: Saga Teknoloji için Agentic/Paperclip benzeri, fakat Saga operasyonuna ve ürünleşmeye uygun çok ajanlı AI çalışan sistemi.

## 1. Yönetici Kararı

Saga Teknoloji için kurulacak sistemin hedefi "130 ajanlı büyük bir vitrin" değil, satıştan teslimata kadar ölçülebilir iş çıktısı üreten bir AI çalışan işletim modeli olmalı.

Önerilen ana yaklaşım:

- Paperclip'i referans ve hızlı prototip olarak incele.
- Kalıcı sistemi Saga'ya özel kur: ATLAS Core + agent registry + görev defteri + onay kapıları + maliyet/kalite ölçümü.
- İlk 90 günde 12 çekirdek AI çalışan rolü, 5 pilot iş akışı ve 2 satılabilir hizmet paketi çıkar.
- İnsan onayını sistemin merkezine koy: müşteri iletişimi, para, sözleşme, hukuki metin, canlı deployment ve üçüncü taraf işlem insan onayı olmadan ilerlemesin.

Bu sistemin adı çalışma boyunca "Saga AI Çalışan Sistemi" olarak kullanılabilir. Ürünleşme aşamasında daha kısa bir marka adı seçilebilir.

## 2. Stratejik Amaç

Sistem iki aşamalı değer üretmeli:

1. İç operasyon katmanı: Saga'nın müşteri bulma, teklif hazırlama, analiz, teslimat, raporlama ve kalite kontrol hızını artırmak.
2. Satılabilir ürün/hizmet katmanı: KOBİ'lere ve dikey sektörlere "AI çalışanlı operasyon paketi" olarak kurulabilir hizmet sunmak.

Öncelik ayrımı:

- İç MVP: B2B CRM/pipeline ve revenue-ops iş akışı. Sebep: ölçülebilir, hızlı doğrulanır, hukuki/regülasyon riski daha yönetilebilir.
- Dış demo paketleri: turizm/otel/NightCredit çevresi ve diş/güzellik gibi yerel hizmet sektörleri. Sebep: Saga'nın mevcut bağlamı ve somut müşteri değer önerisi.

İlk başarı ölçütü, ajan sayısı değil:

- Bir işin kaç dakikada çıktığı.
- İnsan revizyon oranının ne kadar düştüğü.
- Çıktıların kabul ve doğruluk oranı.
- Lead'den teklife, tekliften teslimata dönüşüm.
- Müşteri başına AI maliyeti ve brüt marj.

## 3. Kaynak İncelemesi

Video raporundaki yaklaşım, Paperclip ve modern multi-agent dokümanlarıyla uyumlu üç fikre dayanıyor:

- Paperclip, kendisini ajan framework'ü değil, şirket/org chart/bütçe/onay/goal yönetimi yapan kontrol düzlemi olarak konumlandırıyor.
- LangGraph, uzun çalışan stateful ajan iş akışları, persistence, human-in-the-loop ve gözlemlenebilirlik için düşük seviye orkestrasyon runtime'ı olarak uygun.
- Supervisor/subagent yaklaşımı, tek büyük ajan yerine uzman çalışanları merkezi bir yönlendiriciyle koordine etmeyi öneriyor.

Planın sonucu: Saga için "kontrol paneli + ajan runtime + doğrulama katmanı" üçlüsü kurulmalı. Sadece prompt listesi veya chatbot arayüzü yeterli değil.

## 4. Ürün Prensipleri

### 4.1 İş nesnesi önce gelir

Sistem sohbet ekranı gibi başlamamalı. Her şey bir iş nesnesine bağlanmalı:

- hedef
- müşteri
- proje
- görev
- çıktı
- onay
- maliyet
- risk
- rapor

Sohbet olabilir, ama sohbetin sonucu görev, karar, belge veya onay kaydı olarak tutulmalı.

### 4.2 Mikro çalışan, net yetki

Her AI çalışanın şu alanları tanımlı olmalı:

- rol adı
- görev kapsamı
- kullanabileceği araçlar
- erişemeyeceği alanlar
- beklenen çıktı formatı
- kalite kriteri
- insan onayı gerektiren durumlar
- maliyet limiti
- test/eval örnekleri

### 4.3 Ajan değil, iş akışı satılır

Müşteriye "AI ajan kurduk" diye değil, "her hafta lead raporu, içerik planı, teklif taslağı, operasyon raporu ve kalite kontrol paketi çalışıyor" diye satılmalı.

### 4.4 Varsayılan güvenlik

Sistem müşteri verisi, sözleşme, KVKK, ödeme, e-posta gönderimi, deployment ve üçüncü taraf iletişimde insan onayı ister. Bu sınırlama ürün kalitesidir; hız kaybı değil.

## 5. Hedef Mimari

```text
Saga AI Çalışan Sistemi

1. Kontrol Paneli
   - şirketler / müşteriler / projeler
   - org chart
   - hedefler
   - görevler
   - onaylar
   - bütçe ve maliyetler
   - raporlar

2. Orkestrasyon Runtime
   - supervisor ajan
   - uzman ajan çağırma
   - workflow graph
   - paralel görevler
   - retry / timeout / pause
   - insan onayı kesmeleri

3. Agent Registry
   - rol tanımları
   - prompt / system instruction
   - tool izinleri
   - model/provider seçimi
   - maliyet limiti
   - eval setleri

4. Task Ledger
   - görev durumu
   - alt görevler
   - karar kayıtları
   - kaynaklar
   - çıktı dosyaları
   - revizyonlar
   - denetim izi

5. Hafıza ve Bilgi Katmanı
   - proje hafızası
   - müşteri profili
   - sektör bilgi tabanı
   - RAG kaynakları
   - ATLAS bilgi-beyni bağlantısı

6. Tool Gateway
   - web araştırma
   - dosya üretimi
   - CRM/pipeline
   - GitHub
   - doküman/slide/sheet
   - e-posta/takvim
   - deployment araçları

7. Güvenlik ve Onay
   - rol bazlı izin
   - tenant izolasyonu
   - secret kasası
   - PII redaksiyonu
   - insan onayı
   - audit log

8. Observability ve Evals
   - trace
   - token/maliyet
   - kalite skoru
   - ajan başarı oranı
   - workflow süreleri
   - regression evals
```

## 6. Teknoloji Seçimi

### Önerilen başlangıç yığını

- Kontrol paneli: Next.js veya mevcut Saga/NightCredit web standardına uyumlu React.
- Backend API: NestJS + Prisma + PostgreSQL veya FastAPI + SQLAlchemy + PostgreSQL. Mevcut Saga TypeScript/NestJS birikimi kullanılacaksa NestJS tercih edilmeli.
- Orkestrasyon: LangGraph veya LangGraph.js. MVP'de Python LangGraph daha hızlı araştırma/prototip sağlayabilir; TypeScript bütünlüğü istenirse LangGraph.js denenebilir.
- Job queue: Redis + BullMQ veya Temporal. İlk MVP için BullMQ yeterli; uzun çalışan kritik workflow'larda Temporal değerlendirilmeli.
- Hafıza/RAG: PostgreSQL + pgvector ile başla. Ayrı vektör veritabanı ilk aşamada şart değil.
- Artifact storage: yerel dosya sistemi ile başla, sonra S3 uyumlu storage.
- Gözlemlenebilirlik: başlangıçta local trace + tablo; ileride LangSmith, Langfuse veya OpenTelemetry uyumlu çözüm.
- Kimlik/yetki: basit kullanıcı/rol modeliyle başla; müşteri erişimi açılınca tenant izolasyonu zorunlu.

### Build vs. Paperclip kararı

| Seçenek | Artı | Eksi | Karar |
|---|---|---|---|
| Paperclip'i direkt kullanmak | Hızlı demo, org chart/görev/bütçe fikri hazır | Genç proje, Saga özel hafıza/yetki/teslimat akışları sınırlı kalabilir | Prototip için iyi |
| Paperclip fork etmek | Hızlı başlangıç + özelleştirme | Fork bakım maliyeti, mimari borç riski | 1 haftalık spike sonrası karar |
| Saga özel sistem kurmak | Tam kontrol, ATLAS entegrasyonu, ürünleşme esnekliği | İlk geliştirme maliyeti daha yüksek | Kalıcı hedef |

Öneri: 1 haftalık Paperclip spike yapılır; ama 90 günlük ana plan Saga özel kontrol düzlemi üzerine kurulur.

## 7. İlk AI Çalışan Kadrosu

İlk kadro 12 rolü geçmemeli. 130 rol hedefi ancak kalite, eval ve müşteri kullanımı oturduktan sonra anlamlı.

| Rol | Görev | İlk çıktı |
|---|---|---|
| Operasyon Orkestratörü | Talebi parçalar, doğru ajanları çağırır, işi kapatır | Görev planı + sorumlular |
| Lead Araştırmacı | Sektör/şehir/niş bazlı potansiyel müşteri bulur | Lead listesi |
| Pazar Analisti | Sektör, rakip, fırsat ve risk analizi yapar | Kısa pazar notu |
| Teklif Mimarı | Lead ve ihtiyaçtan teklif kapsamı çıkarır | Teklif taslağı |
| Satış Metni Uzmanı | Outreach, landing copy, e-posta taslakları üretir | Kampanya metni |
| SEO ve İçerik Stratejisti | Topic cluster, içerik takvimi, teknik SEO checklist hazırlar | 30 günlük plan |
| Otomasyon Mimarı | İş akışını araçlara ve entegrasyonlara böler | Otomasyon şeması |
| Full-stack Mühendis | Web/app/backend teknik plan ve kod taslağı üretir | Teknik plan veya PR taslağı |
| QA/Test Uzmanı | Kabul kriteri, test senaryosu ve riskleri çıkarır | Test matrisi |
| Güvenlik ve KVKK İnceleyici | Veri, yetki, gizlilik ve risk kontrolü yapar | Güvenlik notu |
| Müşteri Başarı Uzmanı | Haftalık durum, eğitim ve takip raporu çıkarır | Müşteri raporu |
| Finans/Maliyet Analisti | Token, işçilik, marj ve paket maliyeti izler | Maliyet raporu |

## 8. İlk 5 İş Akışı

### 8.1 Günlük Saga Briefing

Amaç: Her sabah Saga'nın satış, teslimat ve risk durumunu özetlemek.

Çıktı:

- aktif lead sayısı
- teklif bekleyenler
- teslimat riski olan işler
- bugün yapılacaklar
- onay bekleyen kararlar
- tahmini gelir ve maliyet

### 8.2 Lead -> Teklif Akışı

Amaç: Bir lead'i hızlıca teklif verilebilir hale getirmek.

Adımlar:

- lead araştırması
- şirket/niş analizi
- problem hipotezi
- çözüm paketi
- teklif kapsamı
- fiyatlandırma mantığı
- outreach metni

### 8.3 Müşteri Başlangıç Paketi

Amaç: Yeni müşteri için ilk hafta teslim edilecek operasyon paketi.

Çıktı:

- müşteri profil özeti
- ihtiyaç analizi
- hızlı kazanım listesi
- web/SEO/otomasyon kontrolü
- veri ve erişim listesi
- 30 günlük aksiyon planı

### 8.4 İçerik ve SEO Üretim Akışı

Amaç: Müşteriye düzenli organik büyüme paketi vermek.

Çıktı:

- topic cluster
- 30 günlük takvim
- 4 ana içerik taslağı
- teknik SEO checklist
- yayın ve ölçüm planı

### 8.5 Teknik Teslimat ve Kalite Akışı

Amaç: Web/app/otomasyon işlerinde plan, uygulama ve kalite kontrolü standardize etmek.

Çıktı:

- teknik tasarım
- görev listesi
- kod/otomasyon teslimatı
- test raporu
- güvenlik kontrolü
- müşteri kabul notu

## 9. Veri Modeli Taslağı

Minimum tablo/nesne seti:

- `organizations`: Saga ve müşteri organizasyonları.
- `users`: insan kullanıcılar.
- `agents`: AI çalışan tanımları.
- `agent_versions`: prompt, tool ve politika versiyonları.
- `tools`: kullanılabilir araçlar.
- `tool_permissions`: ajan/rol bazlı tool izinleri.
- `projects`: müşteri veya iç proje.
- `goals`: iş hedefleri.
- `tasks`: ana görevler.
- `subtasks`: ajanlara dağıtılan alt görevler.
- `artifacts`: rapor, belge, kod, ekran görüntüsü, çıktı dosyası.
- `approvals`: onay bekleyen işlemler.
- `runs`: workflow çalıştırma kayıtları.
- `run_events`: trace, karar, hata, tool çağrısı.
- `costs`: model/provider/token/maliyet kayıtları.
- `memories`: güvenli kısa proje hafızası.
- `sources`: kullanılan kaynaklar ve tarihleri.
- `eval_cases`: ajan ve workflow test örnekleri.

## 10. Güvenlik ve Onay Kuralları

İnsan onayı olmadan yapılmayacaklar:

- müşteri veya üçüncü tarafla Saga adına iletişim
- e-posta gönderimi
- sözleşme, hukuki veya KVKK metninin nihai kullanımı
- fiyat teklifi gönderimi
- ödeme, abonelik veya harcama
- canlı sisteme deployment
- müşteri verisini dış sisteme aktarma
- sosyal medya yayını
- private repo, credential veya secret erişimi

Teknik güvenlik gereklilikleri:

- her tool çağrısı audit log'a yazılmalı
- ajan başına tool izinleri whitelist olmalı
- müşteri verisi tenant bazında ayrılmalı
- prompt ve raw transcript müşteri raporlarına sızmamalı
- secret'lar dosyaya yazılmamalı
- maliyet hard-stop'ları olmalı
- yüksek riskli output "insan kontrolü gerekir" statüsünde kapanmalı

## 11. 90 Günlük Yol Haritası

### Faz 0 - Karar ve Tasarım (1. Hafta)

Hedef: Sistemin ürün kararını, ilk use-case'lerini ve teknik omurgasını netleştirmek.

İşler:

- Paperclip local spike: kurulum, mimari, veri modeli, izinler, maliyet kontrolü.
- Saga özel mimari ADR taslağı.
- 12 ajan rolünün ilk registry kayıtları.
- İlk 5 workflow'un kabul kriteri.
- Risk ve onay politikası.
- Pilot sektör seçimi.

Çıktı:

- teknik karar notu
- agent registry v0
- workflow katalog v0
- güvenlik/onay politikası v0

### Faz 1 - İç Operasyon MVP (2-4. Haftalar)

Hedef: Saga içinde günlük kullanılacak ilk çalışan sistemini çalıştırmak.

İşler:

- basit kontrol paneli
- agent registry CRUD
- task ledger
- workflow run kayıtları
- artifact üretimi
- manuel onay ekranı
- günlük Saga briefing
- lead -> teklif akışı
- maliyet kayıtları

İlk ajanlar:

- Operasyon Orkestratörü
- Lead Araştırmacı
- Pazar Analisti
- Teklif Mimarı
- Müşteri Başarı Uzmanı

Başarı kriteri:

- 10 lead için analiz ve teklif taslağı üretimi.
- 3 iç raporun tek tıkla çıkması.
- Her çıktıda kaynak, maliyet ve onay statüsü görünmesi.
- CRM/pipeline için en az 50 gerçek veya gerçekçi görev kaydı: lead analizi, takip önerisi, teklif taslağı, risk notu, toplantı hazırlığı.

### Faz 2 - Teslimat ve Kalite MVP (5-8. Haftalar)

Hedef: Müşteri teslimatlarını AI çalışanlarla standardize etmek.

İşler:

- müşteri başlangıç paketi workflow'u
- SEO/içerik workflow'u
- teknik teslimat workflow'u
- QA/test ajanı
- güvenlik/KVKK inceleyici
- proje hafızası
- müşteri bazlı artifact kütüphanesi
- haftalık müşteri raporu

Başarı kriteri:

- 2 pilot müşteri veya örnek müşteri senaryosu için uçtan uca paket.
- İnsan revizyon oranı %30 altına inmeye başlamalı.
- Hatalı/hassas çıktıların en az %90'ı onay kapısında yakalanmalı.

### Faz 3 - Ürünleşme ve Pilot Satış (9-12. Haftalar)

Hedef: Sistemi satılabilir hizmet paketlerine çevirmek.

İşler:

- 2 sektör paketi seçimi.
- müşteri demo ekranları.
- teklif ve onboarding şablonları.
- hizmet paketleri ve fiyatlandırma mantığı.
- pilot sözleşme/kapsam taslağı.
- support ve haftalık rapor süreci.
- ölçüm dashboard'u.

Başarı kriteri:

- 2 satılabilir paket.
- 3 pilot görüşme.
- 1 ücretli pilot hedefi.
- Her pilot için maliyet/marj hesaplanmış olmalı.

## 12. Pilot Sektör Önerisi

İlk sektörler, hızlı değer gösteren ve çok uzmanlık gerektiren alanlardan seçilmeli:

1. Diş klinikleri ve sağlık estetik merkezleri.
2. Güzellik salonları ve medikal estetik.
3. Emlak ofisleri.
4. Turizm, otel ve acente operasyonları.
5. E-ticaret markaları.

Öncelik önerisi:

- İç pilot: B2B satış ve pipeline operasyonu. Sebep: lead, teklif, takip, CRM hijyeni ve haftalık briefing metrikleri net ölçülür.
- İlk dış demo: turizm/otel/acente. Sebep: NightCredit bilgisi ve Saga'nın mevcut ürün birikimiyle stratejik bağ var.
- İkinci dış demo: diş/güzellik sektörü. Sebep: SEO, randevu, yorum yönetimi, KVKK, fiyat listesi, web, reklam ve otomasyon ihtiyacı net.

## 13. Satılabilir Paket Taslakları

### Paket 0 - Audit Sprint

Kim için: AI çalışan sistemini denemek isteyen ama hemen büyük kurulum istemeyen şirket.

Teslimatlar:

- mevcut süreç ve veri erişim analizi
- 3 otomasyon/AI çalışan fırsatı
- risk ve onay matrisi
- 30 günlük pilot SOW taslağı
- maliyet ve ROI tahmini

Gelir modeli:

- tek seferlik ücretli analiz
- önerilen başlangıç aralığı: 1.000-3.000 USD veya yerel pazara göre TL karşılığı

### Paket A - AI Başlangıç Operasyon Paketi

Kim için: dijitalleşmek isteyen küçük işletme.

Teslimatlar:

- işletme analiz raporu
- web/SEO kontrol listesi
- Google işletme profili planı
- 30 günlük içerik takvimi
- temel müşteri takip şablonları
- haftalık durum raporu

Gelir modeli:

- kurulum bedeli
- aylık raporlama ve optimizasyon bedeli
- AI kullanım maliyeti ayrı veya pakete gömülü
- önerilen pilot aralığı: 3.000-10.000 USD kurulum/pilot + 1.000-3.000 USD aylık yönetim, pazara göre daraltılmalı

### Paket B - AI Satış ve Lead Makinesi

Kim için: B2B hizmet satan ajans, danışman, yerel hizmet sağlayıcı.

Teslimatlar:

- lead araştırma
- pazar/niş analizi
- outreach metinleri
- teklif taslakları
- haftalık pipeline briefing
- CRM güncelleme raporu

Gelir modeli:

- aylık retainer
- lead/teklif adedi bazlı kota
- başarı primi opsiyonel, hukuki/finansal netlikten sonra
- yönetilen paket aralığı: 10.000-25.000 USD kurulum + 3.000-8.000 USD aylık, yalnızca kanıtlı pilot sonrası

### Paket C - AI Teslimat ve Raporlama Sistemi

Kim için: müşteriye düzenli hizmet veren ajanslar.

Teslimatlar:

- müşteri onboarding paketi
- haftalık rapor
- SEO/içerik/otomasyon planı
- kalite kontrol checklist'i
- müşteri başarı notları

Gelir modeli:

- müşteri başına aylık operasyon lisansı
- kurulum + eğitim bedeli

## 14. KPI Sistemi

İç operasyon KPI'ları:

- günlük briefing üretim süresi
- lead analiz süresi
- teklif taslağı üretim süresi
- insan revizyon oranı
- onay bekleyen iş sayısı
- AI maliyeti / çıktı
- kabul edilen çıktı oranı

Satış KPI'ları:

- haftalık bulunan lead
- nitelikli lead oranı
- gönderilen teklif
- teklif kabul oranı
- pilot görüşme sayısı
- ücretli pilot dönüşümü

Teslimat KPI'ları:

- iş akışı tamamlanma süresi
- müşteri raporu zamanında teslim oranı
- kalite kontrol hata oranı
- müşteri memnuniyet notu
- tekrar eden görev otomasyon oranı

Teknik KPI'lar:

- agent run başarı oranı
- retry oranı
- tool hata oranı
- token/maliyet sapması
- P95 workflow süresi
- eval pass rate

## 15. İlk Sprint Backlog'u

### Sprint 1 - Sistem Tasarımı ve Registry

- `agent.schema.json` tasarla.
- 12 rol için ilk kayıtları oluştur.
- 5 workflow için kabul kriteri yaz.
- onay politikası dokümanı çıkar.
- Paperclip spike raporu hazırla.

### Sprint 2 - Task Ledger ve Briefing

- görev defteri veri modeli.
- run/event/cost tabloları.
- günlük Saga briefing workflow'u.
- ilk artifact üretimi.
- manuel onay statüleri.

### Sprint 3 - Lead -> Teklif

- lead araştırma ajanı.
- pazar analizi ajanı.
- teklif mimarı.
- kaynaklı teklif taslağı.
- maliyet ve kalite skoru.

### Sprint 4 - Müşteri Paketi

- müşteri başlangıç paketi.
- SEO/içerik akışı.
- haftalık müşteri raporu.
- QA ve güvenlik kontrol adımı.

## 16. Yönetim Modeli

### Karar hakları

- Owner / Board: para, dış iletişim, sözleşme, stratejik pivot, müşteri teklif onayı.
- ATLAS Core / Operasyon Orkestratörü: planlama, görev dağıtımı, raporlama, yerel dosya üretimi.
- Güvenlik/KVKK kontrolü: riskli veri ve müşteri çıktıları için stop/go notu.
- İnsan operator: müşteri iletişimi, nihai gönderim, deployment ve satış aksiyonu.

### Haftalık ritim

- Pazartesi: pipeline ve öncelik briefing.
- Çarşamba: teslimat risk kontrolü.
- Cuma: müşteri/ürün/gelir raporu.
- Pazar: sistem iyileştirme, eval ve hafıza bakımı.

## 17. Riskler

| Risk | Etki | Önlem |
|---|---|---|
| Çok fazla ajan, düşük kalite | Sistem vitrin olur, iş üretmez | 12 rol ile başla, eval olmadan yeni rol ekleme |
| Yanlış hukuki/KVKK çıktı | Müşteri ve itibar riski | İnsan/onay + "taslak" statüsü + uzman kontrol notu |
| Maliyet patlaması | Marj düşer | ajan/model/bütçe hard-stop |
| Müşteri verisi sızıntısı | Kritik güvenlik riski | tenant izolasyonu, secret policy, PII redaksiyonu |
| Ajanların yaptığı iş izlenemez | Güven kaybı | task ledger + audit log + kaynak kaydı |
| Paperclip gibi projeye aşırı bağımlılık | Yol haritası kilitlenir | prototip olarak kullan, çekirdek modeli Saga'ya ait tut |
| İnsan onayı ihmal edilir | Hız uğruna risk büyür | onay gerektiren aksiyonları teknik olarak kilitle |

## 18. Net Öneri

Saga Teknoloji bu sistemi üç seviyede kurmalı:

1. İç OS: Saga'nın günlük pipeline, teklif, teslimat ve rapor işlerini yöneten AI çalışan katmanı.
2. Hizmet OS: müşterilere kurulan sektör paketleri ve haftalık rapor sistemi.
3. Ürün OS: zamanla çok müşterili panel, agent marketplace ve sektör şablonlarına dönüşebilecek SaaS katmanı.

İlk 30 günün ana hedefi satış veya dev SaaS değil; Saga'nın kendi operasyonunda gerçek iş çıkaran, kayıt tutan, onay isteyen ve maliyeti görünen bir çekirdek sistem olmalı. Bu çalışırsa ürünleşme organik olarak çıkar.

## 19. Destekleyici Planlar

Bu üst plan, üç paralel uzman incelemesiyle desteklenmiştir:

- `2026-05-10-saga-agentic-ai-calisan-mimari-plani.md`: control plane, execution plane, data plane, security plane, CRM entegrasyonu, veri modeli ve teknik riskler.
- `2026-05-10-saga-agentic-ai-calisan-sistemi-strateji-plani.md`: 90 günlük iş/operasyon planı, paketleme, fiyatlama, satış süreci, KPI ve pilot stratejisi.
- `2026-05-10-yapay-zeka-ajanlari-video-raporu.md`: Agentic/Paperclip videosundan çıkarılan sistem analizi ve Saga açısından ilk çıkarımlar.

Ana sentez:

- Paperclip doğrudan nihai ürün değil, spike ve benchmark kaynağı olmalı.
- Saga'nın kalıcı farkı Türkçe/KVKK duyarlı, insan onaylı, maliyet kontrollü ve sektör playbook'lu yönetilen AI çalışan sistemi olmalı.
- İlk satılabilir vaat "ajan platformu" değil, "ölçülebilir revenue/ops ve delivery çıktısı üreten AI çalışan paketi" olmalı.

## 20. Kaynaklar

- Paperclip GitHub: https://github.com/paperclipai/paperclip
- Paperclip product notes: https://github.com/paperclipai/paperclip/blob/master/doc/PRODUCT.md
- LangGraph overview: https://docs.langchain.com/oss/python/langgraph/overview
- LangChain supervisor/subagents: https://docs.langchain.com/oss/python/langchain/multi-agent/subagents-personal-assistant
- CrewAI Flows: https://docs.crewai.com/en/concepts/flows
- AutoGen Human-in-the-Loop: https://microsoft.github.io/autogen/stable/user-guide/agentchat-user-guide/tutorial/human-in-the-loop.html
