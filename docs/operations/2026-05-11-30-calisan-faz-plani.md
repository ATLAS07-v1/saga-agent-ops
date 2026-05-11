# Saga Agent Ops - 30 Çalışanlık Faz Planı

Tarih: 2026-05-11  
Kapsam: 2 LLM worker + orchestration engine çekirdeğinden 30 AI çalışanlı profesyonel Saga AI şirket modeline gidiş planı.

## Ana İlke

30 çalışan hedef organizasyondur, başlangıç kapsamı değildir.

Her faz ancak önceki faz gerçek görev verisiyle çalıştığında açılır. Yeni ajan eklemek için şu üç şart gerekir:

1. Mevcut ajanlar gerçek iş akışında çıktı üretmiş olmalı.
2. Yeni ajanın yapacağı iş mevcut ajanla sürdürülemeyecek kadar tekrar ediyor olmalı.
3. Yeni ajan için input, output, tool izni, onay sınırı ve eval kriteri yazılmış olmalı.
4. Yeni ajanın kendi memory scope'u, read/write policy'si ve feedback-to-memory kuralı yazılmış olmalı.
5. Yeni ajan için GitHub/open-source araştırma notu ve hibrit rol kartı hazırlanmış olmalı.

## Ajan Oluşturma Kalite Kapısı

Her çalışan şu sıra ile oluşturulur:

1. Rol ihtiyacı netleştirilir.
2. GitHub ve resmi dokümanlardan en iyi örnekler araştırılır.
3. Örneklerden kullanılabilir pattern'ler çıkarılır.
4. Saga'ya özel hibrit rol kartı yazılır.
5. Memory scope ve tool policy tanımlanır.
6. Output schema, handoff rule ve approval boundary yazılır.
7. En az 5 golden eval case hazırlanır.
8. Çalışan ortak runtime üstünde aktive edilir.

Bu kapı tamamlanmadan yeni çalışan production workflow'a alınmaz.

## Faz 0 - Proje Temeli

Süre: 2-3 gün  
Çalışan sayısı: 0 aktif ajan  
Amaç: Kod yazılabilir ürün iskeletini kurmak.

Teknik işler:

- TypeScript monorepo scaffold.
- `apps/api`.
- `apps/web`.
- `packages/shared`.
- `packages/agent-runtime`.
- PostgreSQL bağlantısı.
- İlk migration yapısı.
- Temel Zod/TypeScript şemaları.
- Per-agent memory schema v0.
- Memory read/write policy contract.
- Context pack contract.

Çıkış kriteri:

- `pnpm dev` çalışır.
- API ve web placeholder ayağa kalkar.
- DB migration çalışır.
- Agent runtime contract dosyası vardır.
- Agent memory contract dosyası vardır.

Faz 0 tamamlanmadan ajan davranışı kodlanmaz.

## Faz 1 - 2 Worker + Orchestration Engine Çekirdeği

Süre: 2 hafta  
Çalışan sayısı: 2 LLM worker + 1 runtime engine  
Amaç: Tek gerçek workflow'u uçtan uca çalıştırmak.

Aktif LLM worker'lar:

1. Lead Araştırmacısı
2. Teklif Hazırlayıcı

Runtime bileşeni:

- Orchestration Engine: task açar, state machine çalıştırır, worker'ları sıraya koyar, policy ve approval geçişlerini yönetir. P0'da LLM çağrısı yapan bir ajan değildir.

Workflow:

```text
Lead veya firma URL'si
  -> Orchestration Engine task açar
  -> Lead Araştırmacısı kaynaklı araştırma üretir
  -> Teklif Hazırlayıcı teklif taslağı üretir
  -> Approval inbox'a düşer
  -> İnsan approve / reject / revise / block der
  -> Cost, trace, source, artifact versiyonu kaydedilir
```

Teknik işler:

- task ledger v0
- approval queue v0
- cost event v0
- trace event v0
- source tracking
- artifact versioning v0
- hard budget caps
- agent tool registry
- per-agent memory profile v0
- memory event v0
- context pack v0
- tenant knowledge base v0
- minimum eval seti

Çıkış kriteri:

- En az 10 başarılı demo task.
- En az 5 teklif taslağı approval inbox'a düşmüş.
- Her task için kaynak, maliyet, süre ve status kaydedilmiş.
- Reject/revise sebebi tutulmuş.
- Ajanlar dış aksiyon yapmamış.

Bu fazın sonunda ürün hâlâ küçük görünür ama gerçek çalışır.

## Faz 2 - 8 Çalışanlı İç Satış ve Operasyon Kadrosu

Süre: 3-4 hafta  
Çalışan sayısı: 8  
Amaç: Saga'nın iç satış, teklif ve operasyon işlerini AI çalışanlarla yönetmek.

Eklenen çalışanlar:

4. Pazar İstihbarat Analisti
5. Satış Stratejisti
6. Ürün Yöneticisi
7. Proje Yöneticisi
8. Finans ve Maliyet Kontrol Uzmanı / Bilgi Küratörü

Toplam kadro:

1. AI CEO / Özel Kalem
2. Lead Araştırmacısı
3. Teklif Hazırlayıcı
4. Pazar İstihbarat Analisti
5. Satış Stratejisti
6. Ürün Yöneticisi
7. Proje Yöneticisi
8. Finans ve Maliyet Kontrol Uzmanı / Bilgi Küratörü

Yeni workflow'lar:

### Lead -> Teklif v2

```text
AI CEO / Özel Kalem
  -> Lead Araştırmacısı
  -> Pazar İstihbarat Analisti
  -> Satış Stratejisti
  -> Teklif Hazırlayıcı
  -> İnsan Onayı
```

### Haftalık Saga Operasyon Raporu

```text
AI CEO / Özel Kalem
  -> Proje Yöneticisi
  -> Finans ve Maliyet Kontrol Uzmanı
  -> İnsan Onayı
```

### Ürün Kapsam Taslağı

```text
AI CEO / Özel Kalem
  -> Ürün Yöneticisi
  -> Teklif Hazırlayıcı
  -> İnsan Onayı
```

Teknik işler:

- role-based routing
- multi-agent task plan
- weekly report artifact
- cost dashboard v0
- knowledge base update workflow
- feedback loop: rejection reason -> prompt/knowledge improvement
- 50 iç görev pilotu

Çıkış kriteri:

- 50 gerçek veya gerçekçi iç görev tamamlanmış.
- İlk taslak kabul oranı en az %60.
- Task başına maliyet görünür.
- En az 10 lead araştırması.
- En az 5 teklif taslağı.
- Haftalık operasyon raporu üretilmiş.
- Bilgi tabanı en az 5 gerçek geri bildirimle güncellenmiş.

Bu fazdan önce CRM write yapılmaz.

## Faz 3 - 14 Çalışanlı Ürün ve Teslimat Kadrosu

Süre: 4-6 hafta  
Çalışan sayısı: 14  
Amaç: Müşteri başlangıç paketi, teknik planlama ve teslimat kalite akışlarını çalıştırmak.

Eklenen çalışanlar:

9. Çözüm Mimarı
10. Backend Mühendisi
11. Frontend Mühendisi
12. Otomasyon Mühendisi
13. QA ve Yayın Kontrol Uzmanı
14. Müşteri Başarı Yöneticisi

Yeni workflow'lar:

### Müşteri Başlangıç Paketi

```text
AI CEO / Özel Kalem
  -> Pazar İstihbarat Analisti
  -> Ürün Yöneticisi
  -> Çözüm Mimarı
  -> Otomasyon Mühendisi
  -> Müşteri Başarı Yöneticisi
  -> İnsan Onayı
```

### Teknik Teslimat Planı

```text
AI CEO / Özel Kalem
  -> Ürün Yöneticisi
  -> Çözüm Mimarı
  -> Backend Mühendisi
  -> Frontend Mühendisi
  -> QA ve Yayın Kontrol Uzmanı
  -> İnsan Onayı
```

### Otomasyon Fırsat Analizi

```text
AI CEO / Özel Kalem
  -> Otomasyon Mühendisi
  -> Çözüm Mimarı
  -> Finans ve Maliyet Kontrol Uzmanı
  -> İnsan Onayı
```

Teknik işler:

- artifact templates
- technical brief schema
- QA checklist
- release checklist
- customer package template
- read-only CRM connector
- customer workspace v0
- org chart read-only view

Çıkış kriteri:

- 2 müşteri başlangıç paketi üretilmiş.
- 2 teknik çözüm planı üretilmiş.
- Read-only CRM çalışıyor.
- QA checklist gerçek çıktılar üzerinde kullanılmış.
- Müşteri rapor formatı kabul edilmiş.
- 1 dış demo hazırlanmış.

Bu fazda hâlâ otomatik e-posta, CRM write ve sözleşme gönderimi yoktur.

## Faz 4 - 20 Çalışanlı Genel Teknoloji Firması Kadrosu

Süre: 6-10 hafta  
Çalışan sayısı: 20  
Amaç: Satış, teslimat, büyüme, destek, raporlama ve temel governance departmanlarıyla genel teknoloji firması operasyonu.

Eklenen çalışanlar:

15. Raporlama Analisti
16. Destek ve Talep Sınıflandırma Uzmanı
17. SEO Stratejisti
18. İçerik Planlayıcı
19. Kampanya Metin Yazarı
20. Güvenlik ve KVKK İnceleyici

Tam kadro:

1. AI CEO / Özel Kalem
2. Lead Araştırmacısı
3. Pazar İstihbarat Analisti
4. Satış Stratejisti
5. Teklif ve Kapsam Hazırlayıcı
6. Ürün Yöneticisi
7. Çözüm Mimarı
8. Backend Mühendisi
9. Frontend Mühendisi
10. Otomasyon Mühendisi
11. QA ve Yayın Kontrol Uzmanı
12. Proje Yöneticisi
13. Müşteri Başarı Yöneticisi
14. Raporlama Analisti
15. Destek ve Talep Sınıflandırma Uzmanı
16. SEO Stratejisti
17. İçerik Planlayıcı
18. Kampanya Metin Yazarı
19. Güvenlik ve KVKK İnceleyici
20. Finans ve Maliyet Kontrol Uzmanı / Bilgi Küratörü

Yeni workflow'lar:

### İçerik ve SEO Paketi

```text
AI CEO / Özel Kalem
  -> Pazar İstihbarat Analisti
  -> SEO Stratejisti
  -> İçerik Planlayıcı
  -> Kampanya Metin Yazarı
  -> Raporlama Analisti
  -> İnsan Onayı
```

### Müşteri Destek ve Triage

```text
AI CEO / Özel Kalem
  -> Destek ve Talep Sınıflandırma Uzmanı
  -> Proje Yöneticisi
  -> ilgili teknik veya müşteri başarı ajanı
  -> İnsan Onayı
```

### Güvenlik ve KVKK Kontrolü

```text
AI CEO / Özel Kalem
  -> Güvenlik ve KVKK İnceleyici
  -> QA ve Yayın Kontrol Uzmanı
  -> İnsan Onayı
```

### Yönetici Haftalık Raporu

```text
AI CEO / Özel Kalem
  -> Raporlama Analisti
  -> Finans ve Maliyet Kontrol Uzmanı
  -> Proje Yöneticisi
  -> Müşteri Başarı Yöneticisi
  -> İnsan Onayı
```

Teknik işler:

- full org chart UI
- department views
- employee cards
- workflow templates
- sector package templates
- customer reporting dashboard
- approval analytics
- cost/margin analytics
- feedback-driven prompt refinement
- managed AI workforce demo

Çıkış kriteri:

- 20 çalışanın rol kartı, tool izni, output schema ve eval kriteri var.
- En az 5 ana workflow çalışıyor.
- En az 100 görev kaydı var.
- En az 20 approval kararı var.
- En az 2 sektör demo paketi var.
- En az 1 müşteri/pilot demo akışı hazır.
- Org chart sadece görsel değil; gerçek workflow durumlarını gösteriyor.

## Faz 5 - 30 Çalışanlı Yazılım ve Siber Güvenlik Firması Kadrosu

Süre: 6-10 hafta  
Çalışan sayısı: 30  
Amaç: Saga'nın yazılım ve siber güvenlik firması kimliğini tam kadroya eklemek.

Eklenen çalışanlar:

21. Mobil Uygulama Mühendisi
22. DevOps / Platform Mühendisi
23. Veri ve Entegrasyon Mühendisi
24. QA ve Test Otomasyon Uzmanı
25. Uygulama Güvenliği Uzmanı
26. Cloud / Altyapı Güvenliği Uzmanı
27. Pentest ve Zafiyet Analisti
28. Threat Intelligence Analisti
29. Incident Response ve Güvenlik Operasyon Uzmanı
30. Compliance ve Risk Kontrol Uzmanı

Tam 30 çalışan:

1. AI CEO / Özel Kalem
2. Lead Araştırmacısı
3. Pazar İstihbarat Analisti
4. Satış Stratejisti
5. Teklif ve Kapsam Hazırlayıcı
6. Ürün Yöneticisi
7. Çözüm Mimarı
8. Backend Mühendisi
9. Frontend Mühendisi
10. Otomasyon Mühendisi
11. QA ve Yayın Kontrol Uzmanı
12. Proje Yöneticisi
13. Müşteri Başarı Yöneticisi
14. Raporlama Analisti
15. Destek ve Talep Sınıflandırma Uzmanı
16. SEO Stratejisti
17. İçerik Planlayıcı
18. Kampanya Metin Yazarı
19. Güvenlik ve KVKK İnceleyici
20. Finans ve Maliyet Kontrol Uzmanı / Bilgi Küratörü
21. Mobil Uygulama Mühendisi
22. DevOps / Platform Mühendisi
23. Veri ve Entegrasyon Mühendisi
24. QA ve Test Otomasyon Uzmanı
25. Uygulama Güvenliği Uzmanı
26. Cloud / Altyapı Güvenliği Uzmanı
27. Pentest ve Zafiyet Analisti
28. Threat Intelligence Analisti
29. Incident Response ve Güvenlik Operasyon Uzmanı
30. Compliance ve Risk Kontrol Uzmanı

Yeni workflow'lar:

### Yazılım Projesi Teslimat Akışı

```text
AI CEO / Özel Kalem
  -> Ürün Yöneticisi
  -> Çözüm Mimarı
  -> Backend Mühendisi
  -> Frontend Mühendisi
  -> Mobil Uygulama Mühendisi (gerekiyorsa)
  -> Veri ve Entegrasyon Mühendisi
  -> DevOps / Platform Mühendisi
  -> QA ve Test Otomasyon Uzmanı
  -> Uygulama Güvenliği Uzmanı
  -> İnsan Onayı
```

### Siber Güvenlik İnceleme Akışı

```text
AI CEO / Özel Kalem
  -> Güvenlik ve KVKK İnceleyici
  -> Uygulama Güvenliği Uzmanı
  -> Cloud / Altyapı Güvenliği Uzmanı
  -> Pentest ve Zafiyet Analisti
  -> Compliance ve Risk Kontrol Uzmanı
  -> İnsan Onayı
```

### Tehdit ve Zafiyet İzleme Akışı

```text
AI CEO / Özel Kalem
  -> Threat Intelligence Analisti
  -> Pentest ve Zafiyet Analisti
  -> Cloud / Altyapı Güvenliği Uzmanı
  -> Incident Response ve Güvenlik Operasyon Uzmanı
  -> Raporlama Analisti
  -> İnsan Onayı
```

Teknik işler:

- secure SDLC workflow templates
- security review templates
- pentest scope and authorization gates
- vulnerability finding artifact schema
- incident report artifact schema
- DevOps/release workflow
- integration/data mapping workflow
- mobile delivery workflow
- security approval boundaries

Çıkış kriteri:

- 30 çalışanın rol kartı, tool izni, output schema, handoff rule ve eval kriteri var.
- En az 8 ana workflow çalışıyor.
- En az 150 görev kaydı var.
- En az 30 approval kararı var.
- En az 2 yazılım teslimat demo paketi var.
- En az 2 siber güvenlik demo paketi var.
- Aktif güvenlik testi için yazılı kapsam/onay kapısı çalışıyor.

## Faz 6 - Müşteriye Satılabilir Sistem

Süre: Faz 5 sonrası  
Amaç: İç sistemden yönetilen müşteri ürününe geçmek.

Paketler:

1. Audit Sprint
2. 30 Günlük AI Çalışan Pilotu
3. Managed AI Workforce
4. Sektör Paketleri

Gerekli ek işler:

- müşteri onboarding akışı
- müşteri tenant ayrımı
- müşteri rapor şablonları
- fiyatlandırma modeli
- pilot SOW taslağı
- müşteri veri politikası
- support/runbook
- deployment ve backup planı

Çıkış kriteri:

- Saga içinde sistem kanıtlanmış.
- En az 100 iç görev verisi var.
- En az 1 dış demo yapılmış.
- Müşteri verisi ve onay politikası hazır.
- Teklif/SOW şablonu hazır.

## Kırmızı Çizgiler

Bu işler ancak gerekli onay ve altyapıdan sonra yapılır:

- otomatik e-posta gönderimi
- CRM write
- müşteri verisini dış sisteme aktarma
- canlı deployment
- hukuki/KVKK metnini nihai belge gibi sunma
- ödeme veya harcama
- üçüncü tarafla Saga adına iletişim

## Sonuç

30 çalışanlı sistemin son hali gerçek bir teknoloji, yazılım ve siber güvenlik firması organizasyonu gibi çalışacak. Ancak doğru inşa sırası şudur:

1. Önce görev motoru.
2. Sonra satış ve teklif akışı.
3. Sonra ürün ve teslimat kadrosu.
4. Sonra büyüme, destek, raporlama ve governance.
5. Sonra yazılım ve siber güvenlik uzman kadrosu.
6. En son müşteri ürünleşmesi.

Bu sıra korunursa videodaki AI şirket fikrinin Saga'ya uygun yazılım ve siber güvenlik odaklı, profesyonel, güvenli ve satılabilir versiyonu kurulabilir.
