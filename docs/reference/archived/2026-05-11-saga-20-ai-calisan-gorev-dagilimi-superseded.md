# Saga Agent Ops - 20 AI Çalışan Görev Dağılımı

Tarih: 2026-05-11  
Kapsam: Saga Teknoloji'nin teknoloji firması olarak kullanacağı profesyonel AI çalışan organizasyonu.

## 1. Ana Karar

Saga Agent Ops nihai işletim modelinde 20 AI çalışanla organize edilecek. Ancak bu 20 çalışan aynı anda kodlanmayacak.

Uygulama sırası:

1. P0 çekirdek: 2 LLM worker + orchestration engine.
2. İç operasyon kadrosu: 8 ajan.
3. Ürün ve teslimat kadrosu: 14 ajan.
4. Tam Saga AI şirket kadrosu: 20 ajan.

Bu yaklaşım, videodaki "AI şirket" hissini verirken sistemi oyuncak olmaktan çıkarır: her çalışanın görevi, çıktısı, yetkisi, onay sınırı ve KPI'ı olacak.

## 2. Organizasyon Şeması

```text
AI CEO / Chief of Staff
  ├─ Revenue Department
  │   ├─ Lead Researcher
  │   ├─ Market Intelligence Analyst
  │   ├─ Sales Strategist
  │   └─ Offer & Proposal Drafter
  ├─ Product & Engineering Department
  │   ├─ Product Manager
  │   ├─ Solution Architect
  │   ├─ Backend Engineer
  │   ├─ Frontend Engineer
  │   ├─ Automation Engineer
  │   └─ QA & Release Reviewer
  ├─ Delivery & Customer Operations
  │   ├─ Project Manager
  │   ├─ Customer Success Manager
  │   ├─ Reporting Analyst
  │   └─ Support & Triage Agent
  ├─ Growth & Content Department
  │   ├─ SEO Strategist
  │   ├─ Content Planner
  │   └─ Campaign Copywriter
  └─ Governance Department
      ├─ Security & KVKK Reviewer
      ├─ Finance & Cost Controller
      └─ Knowledge Curator
```

## 3. 20 AI Çalışan

### 1. AI CEO / Chief of Staff

Departman: Executive  
Ana görev: Saga'nın AI şirket operasyonunu yönetmek.

Sorumluluklar:

- Gelen işleri sınıflandırır.
- Hangi departmanın çalışacağını belirler.
- Öncelik ve risk seviyesini çıkarır.
- Günlük/haftalık briefing hazırlar.
- Onay bekleyen kararları toplar.
- İşlerin tamamlanıp tamamlanmadığını kontrol eder.

Çıktılar:

- günlük briefing
- haftalık yönetici özeti
- görev dağıtım planı
- onay listesi
- risk ve darboğaz özeti

Onay sınırı:

- Dış iletişim, fiyat, sözleşme, ödeme, deployment onaysız yapamaz.

KPI:

- görevlerin doğru departmana yönlenme oranı
- zamanında kapanan görev oranı
- onay bekleme süresi

## Revenue Department

### 2. Lead Researcher

Ana görev: Potansiyel müşteri ve firma araştırması.

Sorumluluklar:

- Firma URL'sini inceler.
- Şirketin ne yaptığını özetler.
- Karar verici ve sektör sinyali toplar.
- Problem hipotezi çıkarır.
- Kaynaklı lead research artifact'i üretir.

Çıktılar:

- lead araştırma raporu
- kaynak listesi
- problem hipotezi
- outreach için bağlam notu

KPI:

- kaynaklı araştırma oranı
- kabul edilen lead notu oranı
- eksik/uydurma bilgi oranı

### 3. Market Intelligence Analyst

Ana görev: Sektör, rakip ve pazar bağlamı üretmek.

Sorumluluklar:

- Hedef sektörün ihtiyaçlarını analiz eder.
- Rakip/alternatif çözümleri çıkarır.
- Pazar trendlerini ve riskleri özetler.
- Saga'nın teklifini pazara göre konumlandırır.

Çıktılar:

- sektör analiz notu
- rakip karşılaştırması
- fırsat/risk matrisi
- segment önerisi

KPI:

- analizlerin tekliflerde kullanılma oranı
- kaynak doğruluğu
- strateji revizyon oranı

### 4. Sales Strategist

Ana görev: Satış yaklaşımı ve görüşme stratejisi oluşturmak.

Sorumluluklar:

- Lead'e göre satış açısı belirler.
- Görüşme gündemi hazırlar.
- İtirazları ve cevapları çıkarır.
- Sonraki aksiyon önerir.

Çıktılar:

- toplantı brief'i
- satış argümanları
- itiraz-cevap listesi
- takip aksiyonları

KPI:

- görüşmeye hazırlık süresi
- satış ekibi kabul oranı
- teklif dönüşüm desteği

### 5. Offer & Proposal Drafter

Ana görev: Araştırma ve satış stratejisinden teklif taslağı üretmek.

Sorumluluklar:

- Problem hipotezini teklif kapsamına çevirir.
- Saga hizmet paketlerini doğru bağlar.
- Varsayım, kapsam dışı ve sonraki adımı yazar.
- Taslağı approval inbox'a gönderir.

Çıktılar:

- teklif taslağı
- outreach taslağı
- kapsam notu
- SOW başlangıç taslağı

KPI:

- ilk taslak kabul oranı
- revizyon sayısı
- teklif hazırlama süresi

## Product & Engineering Department

### 6. Product Manager

Ana görev: Müşteri ihtiyacını ürün/görev kapsamına çevirmek.

Sorumluluklar:

- İş problemini kullanıcı hikayelerine böler.
- MVP ve faz kapsamı çıkarır.
- Kabul kriterlerini yazar.
- Roadmap etkisini değerlendirir.

Çıktılar:

- product brief
- kullanıcı hikayeleri
- acceptance criteria
- faz planı

KPI:

- kapsam netliği
- revizyon oranı
- engineering'e devredilen işlerin tamamlanma oranı

### 7. Solution Architect

Ana görev: Teknik çözüm mimarisi çıkarmak.

Sorumluluklar:

- Sistem bileşenlerini belirler.
- Entegrasyon ve veri akışını tasarlar.
- Build/buy kararlarını not eder.
- Riskli teknik bağımlılıkları işaretler.

Çıktılar:

- çözüm mimarisi
- veri akışı
- entegrasyon planı
- teknik risk notu

KPI:

- teknik planın uygulanabilirliği
- sonradan çıkan mimari değişiklik sayısı
- risk yakalama oranı

### 8. Backend Engineer

Ana görev: API, veri modeli, servis ve entegrasyon işlerini planlamak/uygulamak.

Sorumluluklar:

- Backend görevlerini çıkarır.
- API sözleşmesi yazar.
- DB migration önerir.
- Entegrasyon ve queue işlerini planlar.

Çıktılar:

- API contract
- backend task list
- migration taslağı
- entegrasyon notu

KPI:

- backend görevlerinin tamamlanma oranı
- API revizyon sayısı
- hata/edge case yakalama

### 9. Frontend Engineer

Ana görev: Kontrol paneli ve müşteri arayüzleri için UI görevleri üretmek.

Sorumluluklar:

- Ekran akışlarını çıkarır.
- Component ve state ihtiyaçlarını belirler.
- UI metinlerini ve boş durumları yazar.
- Responsive ve erişilebilirlik risklerini işaretler.

Çıktılar:

- ekran planı
- component task list
- UI acceptance criteria
- frontend risk notu

KPI:

- UI revizyon oranı
- kabul kriteri tamlığı
- tasarım/uygulama uyumu

### 10. Automation Engineer

Ana görev: Müşteri ve iç operasyon iş akışlarını otomasyon planına çevirmek.

Sorumluluklar:

- Tekrarlayan işleri tespit eder.
- Tool ve entegrasyon akışını planlar.
- Trigger/action mantığı çıkarır.
- İnsan onayı gereken adımları işaretler.

Çıktılar:

- otomasyon akış diyagramı
- tool ihtiyaç listesi
- trigger/action planı
- onay noktaları

KPI:

- otomasyonla kazanılan süre
- manuel adım azalması
- hatalı otomasyon riski yakalama

### 11. QA & Release Reviewer

Ana görev: Teslimat kalitesini, test ve release risklerini kontrol etmek.

Sorumluluklar:

- Kabul testlerini çıkarır.
- Regression risklerini işaretler.
- Release öncesi kalite kontrol yapar.
- Eksik test ve doğrulama notu yazar.

Çıktılar:

- test planı
- release checklist
- bug/risk raporu
- kabul notu

KPI:

- release sonrası hata oranı
- test kapsamı
- yakalanan kritik risk sayısı

## Delivery & Customer Operations

### 12. Project Manager

Ana görev: Müşteri ve iç teslimat işlerini takip etmek.

Sorumluluklar:

- Görevleri tarihe ve sorumluya bağlar.
- Blokerleri ve gecikmeleri çıkarır.
- Haftalık teslimat durumunu hazırlar.
- Sonraki aksiyonları netleştirir.

Çıktılar:

- proje durum raporu
- aksiyon listesi
- risk/bloker listesi
- teslimat takvimi

KPI:

- zamanında kapanan görev oranı
- bloker çözüm süresi
- rapor düzenliliği

### 13. Customer Success Manager

Ana görev: Müşteri memnuniyeti ve devamlılığı yönetmek.

Sorumluluklar:

- Müşteri hedeflerini takip eder.
- Haftalık değer özetleri çıkarır.
- Eğitim ve onboarding notları hazırlar.
- Müşteri risklerini işaretler.

Çıktılar:

- müşteri başarı raporu
- onboarding planı
- kullanım/değer özeti
- churn risk notu

KPI:

- müşteri raporu kabul oranı
- risk erken yakalama
- tekrar satış fırsatı sayısı

### 14. Reporting Analyst

Ana görev: İş sonuçlarını raporlanabilir hale getirmek.

Sorumluluklar:

- Görev, maliyet, çıktı ve başarı verilerini toplar.
- Haftalık/aylık raporlar oluşturur.
- KPI sapmalarını açıklar.
- Executive özet üretir.

Çıktılar:

- haftalık rapor
- KPI dashboard notu
- maliyet/değer özeti
- executive summary

KPI:

- raporların zamanında çıkması
- veri eksikliği oranı
- karar destek kullanımı

### 15. Support & Triage Agent

Ana görev: Hata, müşteri talebi ve destek işlerini sınıflandırmak.

Sorumluluklar:

- Gelen talebi kategorize eder.
- Öncelik ve etki seviyesi verir.
- Doğru departmana yönlendirir.
- Bilinen çözüm önerilerini çıkarır.

Çıktılar:

- triage notu
- öncelik seviyesi
- yönlendirme kararı
- destek cevabı taslağı

KPI:

- doğru sınıflandırma oranı
- ilk yanıt süresi
- yanlış departmana yönlendirme oranı

## Growth & Content Department

### 16. SEO Strategist

Ana görev: Organik büyüme ve teknik SEO planı çıkarmak.

Sorumluluklar:

- Keyword ve topic cluster çıkarır.
- Teknik SEO checklist hazırlar.
- İçerik fırsatlarını önceliklendirir.
- Rakip SEO sinyallerini analiz eder.

Çıktılar:

- SEO strateji notu
- topic cluster
- teknik SEO checklist
- içerik fırsat listesi

KPI:

- içerik planı kabul oranı
- organik fırsat kalitesi
- teknik risk yakalama

### 17. Content Planner

Ana görev: İçerik takvimi ve yayın planı hazırlamak.

Sorumluluklar:

- 30 günlük içerik planı çıkarır.
- Pillar/supporting yapı kurar.
- İçerik brief'leri yazar.
- Yayın sırası ve hedefini belirler.

Çıktılar:

- 30 günlük içerik takvimi
- içerik brief'leri
- yayın planı
- hedef/persona notu

KPI:

- içerik brief kabul oranı
- yayın planı uygulanma oranı
- revizyon sayısı

### 18. Campaign Copywriter

Ana görev: Satış, reklam, outreach ve landing metinleri üretmek.

Sorumluluklar:

- Outreach mesajı yazar.
- Landing page copy taslağı üretir.
- Reklam metni ve CTA önerir.
- Mesaj tonunu hedef segmente göre ayarlar.

Çıktılar:

- e-posta/outreach taslağı
- landing copy
- reklam metinleri
- CTA önerileri

KPI:

- metin kabul oranı
- revizyon sayısı
- kampanya performansına katkı

## Governance Department

### 19. Security & KVKK Reviewer

Ana görev: Güvenlik, veri gizliliği ve onay risklerini kontrol etmek.

Sorumluluklar:

- Kişisel veri risklerini işaretler.
- Tool izinlerini kontrol eder.
- Dış aksiyonların onay gerektirip gerektirmediğini belirler.
- Güvenlik checklist'i üretir.

Çıktılar:

- security/KVKK risk notu
- onay gereksinimi
- veri minimizasyon önerisi
- güvenlik checklist'i

KPI:

- risk yakalama oranı
- onaysız aksiyon engelleme
- veri ihlali/uygunsuzluk sayısı

### 20. Finance & Cost Controller

Ana görev: AI maliyeti, işçilik karşılığı ve marj kontrolü yapmak.

Sorumluluklar:

- Task ve ajan maliyetlerini izler.
- Paket bazlı maliyet/marj hesaplar.
- Budget cap aşımlarını işaretler.
- Fiyatlandırma kararlarına veri sağlar.

Çıktılar:

- maliyet raporu
- marj analizi
- budget warning
- fiyatlandırma önerisi

KPI:

- maliyet görünürlüğü
- budget aşımı sayısı
- paket marj doğruluğu

### 21. Knowledge Curator

Not: Bu rol 20 kişilik sayıda Finance & Cost Controller ile aynı governance kapasitesi altında dönüşümlü görev olarak ele alınabilir. Sistem büyüdüğünde ayrı 21. rol yapılmalıdır.

Ana görev: Şirket bilgisini ve öğrenilen dersleri düzenlemek.

Sorumluluklar:

- Saga knowledge base'i günceller.
- Kabul/red nedenlerinden ders çıkarır.
- Teklif şablonlarını iyileştirir.
- Tekrar kullanılabilir playbook üretir.

Çıktılar:

- knowledge base güncellemesi
- playbook
- prompt refinement notu
- öğrenilen ders raporu

KPI:

- tekrar hata oranı azalması
- knowledge güncelliği
- ajan çıktı kalitesi etkisi

## 4. 20 Çalışanı 20'de Tutmak İçin Rol Birleşimi

Knowledge Curator önemli ama ilk 20 içinde ayrı çalışan olarak değil, governance departmanında Finance & Cost Controller'ın ikincil görevi olarak başlayacak.

Bu nedenle resmi 20 çalışan:

1. AI CEO / Chief of Staff
2. Lead Researcher
3. Market Intelligence Analyst
4. Sales Strategist
5. Offer & Proposal Drafter
6. Product Manager
7. Solution Architect
8. Backend Engineer
9. Frontend Engineer
10. Automation Engineer
11. QA & Release Reviewer
12. Project Manager
13. Customer Success Manager
14. Reporting Analyst
15. Support & Triage Agent
16. SEO Strategist
17. Content Planner
18. Campaign Copywriter
19. Security & KVKK Reviewer
20. Finance & Cost Controller / Knowledge Curator

## 5. Departmanlara Göre Günlük İş Akışı

### Lead -> Teklif Akışı

```text
AI CEO
  -> Lead Researcher
  -> Market Intelligence Analyst
  -> Sales Strategist
  -> Offer & Proposal Drafter
  -> Security & KVKK Reviewer
  -> Human Approval
```

### Müşteri Başlangıç Paketi

```text
AI CEO
  -> Product Manager
  -> Solution Architect
  -> Automation Engineer
  -> SEO Strategist
  -> Customer Success Manager
  -> Reporting Analyst
  -> Human Approval
```

### Teknik Teslimat

```text
AI CEO
  -> Product Manager
  -> Solution Architect
  -> Backend Engineer
  -> Frontend Engineer
  -> QA & Release Reviewer
  -> Security & KVKK Reviewer
  -> Human Approval
```

### İçerik ve Büyüme Paketi

```text
AI CEO
  -> Market Intelligence Analyst
  -> SEO Strategist
  -> Content Planner
  -> Campaign Copywriter
  -> Reporting Analyst
  -> Human Approval
```

### Haftalık Operasyon Raporu

```text
AI CEO
  -> Project Manager
  -> Customer Success Manager
  -> Reporting Analyst
  -> Finance & Cost Controller
  -> Human Approval
```

## 6. Yetki Seviyeleri

### Otomatik Yapabilir

- araştırma taslağı
- iç rapor taslağı
- teklif taslağı
- teknik plan taslağı
- içerik planı
- görev sınıflandırma
- maliyet analizi

### Onay Gerektirir

- müşteriye gönderilecek metin
- fiyat teklifi
- sözleşme veya SOW taslağı
- CRM kaydı değiştirme
- sosyal medya/e-posta gönderimi
- canlı deployment
- müşteri verisi dışarı aktarma

### Yasak / Bloklu

- para harcama
- sözleşme imzalama
- hukuki/tax/financial nihai tavsiye
- secrets okuma veya paylaşma
- veri silme
- kullanıcı onayı olmadan üçüncü taraf iletişim

## 7. Uygulama Fazları

### Faz 1: 2 Worker + Orchestration Engine

- Lead Researcher
- Offer & Proposal Drafter

Runtime:

- Orchestration Engine

Hedef:

- Lead -> Research -> Offer Draft -> Approval -> Weekly Report

### Faz 2: 8 Çalışan

Eklenenler:

- Market Intelligence Analyst
- Sales Strategist
- Product Manager
- Project Manager
- Finance & Cost Controller

Hedef:

- satış ve iç operasyon akışlarını çalıştırmak

### Faz 3: 14 Çalışan

Eklenenler:

- Solution Architect
- Backend Engineer
- Frontend Engineer
- Automation Engineer
- QA & Release Reviewer
- Customer Success Manager

Hedef:

- müşteri başlangıç paketi ve teknik teslimat akışlarını çalıştırmak

### Faz 4: 20 Çalışan

Eklenenler:

- Reporting Analyst
- Support & Triage Agent
- SEO Strategist
- Content Planner
- Campaign Copywriter
- Security & KVKK Reviewer

Hedef:

- profesyonel AI şirket operasyonunu tamamlamak

## 8. Sonuç

Saga için hedef 20 AI çalışanlı profesyonel teknoloji firması operasyonudur. Fakat başarı çalışan sayısından değil, bu çalışanların gerçek görev akışlarında ölçülebilir çıktı üretmesinden gelir.

Doğru sıra:

1. 2 worker + orchestration engine ile çalışan motor.
2. 8 çalışanla iç satış/operasyon.
3. 14 çalışanla ürün ve teslimat.
4. 20 çalışanla tam AI şirket modeli.

Bu model videodaki "AI çalışanlı şirket" fikrini Saga için daha profesyonel, denetlenebilir ve ürünleşebilir hale getirir.
