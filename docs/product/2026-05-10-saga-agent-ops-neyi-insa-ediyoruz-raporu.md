# Saga Agent Ops - Neyi İnşa Ediyoruz?

Tarih: 2026-05-10  
Durum: Ürün tanım ve inşa raporu  
Kapsam: Saga Teknoloji için videodaki profesyonel AI şirket mantığına benzer, fakat Saga'nın kendi hedeflerine göre tasarlanmış bağımsız ürün sistemi.

Not: Bu rapor ürün yönünü tanımlar. Resmi çalışan sayısı ve faz planı 2026-05-11'de 30 AI çalışanlı yazılım ve siber güvenlik firması modeline güncellenmiştir.

## 1. Kısa Cevap

Saga Agent Ops ile bir chatbot, prompt paketi, ATLAS kopyası veya basit otomasyon paneli inşa etmiyoruz.

İnşa edeceğimiz şey:

**Saga Teknoloji'nin içinde çalışan, departmanlara ayrılmış, görev alıp çıktı üreten, kayıt tutan, maliyet ve performans izleyen, gerektiğinde insan onayı isteyen profesyonel bir AI şirket işletim sistemi.**

Bu sistem ilk aşamada Saga'nın kendi satış, teklif, teslimat, raporlama ve müşteri operasyonlarını hızlandıracak. İkinci aşamada ise müşterilere "yönetilen AI çalışan ekibi" olarak kurulabilecek bir ürün/hizmet paketine dönüşecek.

## 2. Ana Amaç

Amaç, "çok sayıda AI ajanımız var" demek değil.

Amaç:

- Saga'nın tek kişi veya küçük ekip kapasitesini yapay zeka çalışanlarla büyütmek.
- Her işi doğru AI çalışana yönlendirmek.
- İşleri takip edilebilir görev kayıtlarına bağlamak.
- Her çıktının kaynağını, maliyetini, riskini ve onay durumunu bilmek.
- Satıştan teslimata kadar tekrar eden operasyonları sistemleştirmek.
- Daha sonra bu sistemi müşteri şirketlere yönetilen AI iş gücü paketi olarak satmak.

Yani hedef, sadece teknoloji değil; **AI destekli şirket işletim modeli** kurmak.

## 3. Video Mantığını Nasıl Yorumladık?

Videodaki ana fikir doğru:

- AI çalışanlar rol bazlı olmalı.
- Her çalışan farklı görev için tasarlanmalı.
- Bir lider/orkestratör ajan işi parçalayıp çalışanlara dağıtmalı.
- Çalışanlar birlikte çıktı üretmeli.
- Kullanıcı sadece talep vermemeli; bir şirket gibi iş akışı yönetebilmeli.

Fakat Saga için bunu birebir kopyalamayacağız.

Videodaki yaklaşımı profesyonel ürüne çevirmek için eksik olan katmanları ekleyeceğiz:

- task ledger
- onay kuyruğu
- tool izinleri
- maliyet izleme
- kaynak ve çıktı doğrulama
- müşteri/tenant ayrımı
- KVKK ve güvenlik sınırları
- eval/test sistemi
- dış aksiyonlar için insan onayı

Bu yüzden Saga Agent Ops, "AI çalışan vitrini" değil; gerçek iş üretimi ve denetim sistemi olacak.

## 4. Ürün Kimliği

Çalışma adı:

**Saga Agent Ops**

Tanım:

Saga Agent Ops, şirketlerin tekrar eden satış, operasyon, teslimat, destek ve bilgi işlerini denetlenebilir AI çalışan ekipleriyle yürütmesini sağlayan bir AI şirket kontrol düzlemidir.

İlk müşteri:

**Saga Teknoloji'nin kendisi.**

İlk ticari pozisyon:

Genel amaçlı ajan platformu değil; sektörlere ve iş akışlarına göre kurulmuş **yönetilen AI çalışan paketi**.

## 5. Ne İnşa Edilecek?

### 5.1 Task Ledger

Sistemin kalbi görev defteri olacak.

Her iş bir görev olarak kaydedilecek:

- kim başlattı
- hangi müşteri/proje için
- hangi ajanlar çalıştı
- hangi alt görevler oluştu
- hangi kaynaklar kullanıldı
- hangi araç çağrıldı
- hangi çıktı üretildi
- kaç token/maliyet harcandı
- insan onayı gerekti mi
- sonuç kabul edildi mi
- revizyon var mı

Bu olmadan sistem profesyonel AI şirket olmaz; sadece konuşan ajanlar olur.

İlk P0 veri omurgası:

- `task`
- `run`
- `step`
- `artifact`
- `approval`
- `cost_event`
- `trace_event`

### 5.2 Human Approval Queue

Sistem otonom çalışacak ama sorumsuz çalışmayacak.

İnsan onayı gerektirenler:

- müşteri veya üçüncü tarafla iletişim
- e-posta gönderimi
- sosyal medya paylaşımı
- CRM kaydı değiştirme
- fiyat teklifi gönderme
- sözleşme/hukuki/KVKK metninin nihai kullanımı
- ödeme veya harcama
- canlı deployment
- veri silme
- müşteri verisini dış sisteme aktarma

Onay kaydı sadece "evet/hayır" olmayacak:

- approve
- reject
- request changes
- block
- karar nedeni
- approver
- karar zamanı
- revizyon notu

Bu onay kuyruğu ürünün değeridir. Çünkü müşteriye güven verir.

### 5.3 Cost, Trace ve Source Sistemi

Profesyonel AI şirket için şu sorulara cevap vermemiz gerekir:

- Bu görev ne kadar sürdü?
- Hangi ajan başarılıydı?
- Hangi ajan çok maliyetli çalıştı?
- Hangi kaynak kullanıldı?
- Hangi çıktı insan tarafından kabul edildi?
- Hangi tool hatalı çalıştı?
- Hangi işte onay bekleniyor?
- Hangi görev tekrar edilebilir hale geldi?

Bunun için cost/trace P1 değil P0 kabul edilecek.

İlk kayıtlar:

- model
- token veya tahmini maliyet
- tool call
- kaynak URL/dosya
- süre
- hata
- karar noktası
- çıktı statüsü

### 5.4 Agent Registry

Her AI çalışan burada tanımlanacak.

Bir çalışanın kayıt alanları:

- rol adı
- departman
- görev kapsamı
- yapabilecekleri
- yapamayacakları
- kullanabileceği araçlar
- veri erişim sınırı
- çıktı formatı
- onay gerektiren aksiyonlar
- model/provider tercihi
- maliyet limiti
- kalite/eval kriterleri

İlk ay için çalışan sayısını düşük tutacağız. 100+ çalışan hedefi şimdilik yok.

İlk LLM worker'lar:

- Lead Araştırmacı
- Teklif Hazırlayıcı

Orkestrasyon P0'da ajan değil engine olacak: state machine, routing, policy, retry, timeout ve resume mantığını kod yönetecek. P0'da QA/Risk ve Pipeline ayrı ajan olmayacak. QA insan onay kuyruğuyla yapılacak; Pipeline ajanı ise read-only CRM kanıtlandıktan sonra P1'e alınacak.

### 5.5 AI Şirket Kontrol Paneli

Kullanıcının göreceği ana ürün yüzü burası olacak. Fakat üçüncü göz değerlendirmesine göre burada kritik bir karar var:

**İlk UI org chart vitrini değil, görev/approval/çıktı yönetimi olmalı.**

İlk panel içerikleri:

- task listesi
- approval queue
- artifact preview
- cost/trace görünümü
- çalışan rol kartları
- günlük/haftalık briefing

Sonra eklenecek görsel şirket katmanı:

- AI çalışan listesi
- departmanlar
- org chart
- çalışan rol/CV/yetenek kartları
- aktif görevler
- tamamlanan işler
- onay bekleyen aksiyonlar
- maliyetler
- çıktı dosyaları
- günlük/haftalık briefing
- müşteri veya proje bazlı çalışma alanları

Bu panel, "chat ekranı" değil; şirket yönetim paneli gibi hissettirmeli.

### 5.6 Orchestration Engine

Orchestration Engine, AI şirketin operasyon lideri gibi davranan deterministik runtime katmanıdır. P0'da LLM çağrısı yapan ayrı bir ajan değildir.

Görevi:

1. Kullanıcı talebini task'a çevirmek.
2. İşi alt görevlere bölmek.
3. Doğru çalışanları seçmek.
4. Sıralı veya paralel çalışma başlatmak.
5. Riskli aksiyonları onaya durdurmak.
6. Çıktıları birleştirmek.
7. Kalite kontrol ajanına göndermek.
8. Sonucu kullanıcıya raporlamak.

Örnek:

Kullanıcı der ki: "Bu otel zinciri için AI operasyon paketi hazırla."

Sistem şunu yapar:

- Pazar Analisti sektörü inceler.
- Lead Araştırmacı şirketi ve karar vericileri araştırır.
- Teklif Uzmanı kapsam çıkarır.
- Otomasyon Mimarı iş akışı önerir.
- Teknik Uzman uygulanabilirlik notu yazar.
- KVKK/Güvenlik İnceleyici riskleri işaretler.
- Müşteri Başarı Uzmanı haftalık rapor formatını hazırlar.
- Orkestratör hepsini tek paket haline getirir.

### 5.7 Knowledge & Memory Layer

Sistemin hafızası ikiye ayrılacak:

- kısa görev/proje hafızası
- kaynaklı bilgi tabanı

Tutulacak bilgiler:

- müşteri profili
- sektör notları
- geçmiş görevler
- önceki teklifler
- müşteri tercihleri
- kabul edilen/edilmeyen çıktılar
- playbook'lar
- kaynak dokümanlar

Kural:

Hassas veri rastgele hafızaya yazılmayacak. Hafıza güvenli, kısa, kaynaklı ve silinebilir olacak.

### 5.8 Tool Gateway

AI çalışanlar araç kullanacak ama doğrudan sınırsız erişim almayacak.

Araçlar:

- web araştırma
- dosya üretimi
- CRM okuma/yazma
- e-posta taslağı
- takvim
- GitHub
- doküman/slide/sheet
- browser automation
- veritabanı
- deployment araçları

Her tool için izin seviyesi olacak:

- read-only
- draft-only
- approval-required write
- blocked

### 5.9 Eval Sistemi

"Çıktı güzel görünüyor" KPI değildir.

İlk eval seti:

- doğru ajan seçimi
- kaynaklı araştırma
- unsafe action yakalama
- CRM write onaya düşüyor mu
- teklif taslağında uydurma var mı
- KVKK/hukuki ifadeler taslak statüsünde mi
- maliyet limiti aşıldığında görev duruyor mu
- insan red verdiğinde sistem revizyona dönebiliyor mu

## 6. İlk Sürümde Ne Yapacağız?

İlk sürümün adı:

**Internal AI Company MVP**

Bu sürümde Saga kendi içinde sistemi kullanacak.

İlk LLM worker'lar:

1. Lead Araştırmacı
2. Teklif Uzmanı

Runtime:

- Orchestration Engine: task açar, state machine çalıştırır, worker sırasını ve policy geçişlerini yönetir.

İlk iş akışları:

1. Lead -> Research -> Offer Draft -> Approval -> Weekly Report

İlk teknik bileşenler:

- monorepo scaffold
- PostgreSQL schema v0
- agent registry schema
- task ledger schema
- approval queue model
- artifact kayıt düzeni
- cost/trace event modeli
- source kayıt modeli
- tenant knowledge base v0
- hard budget caps
- agent tool registry
- minimum eval seti
- basit ledger/approval paneli

## 7. Neden İlk MVP CRM/Revenue-Ops?

Çünkü profesyonel AI şirket mantığını göstermek için en ölçülebilir başlangıç burası.

Avantajlar:

- lead sayısı ölçülür
- teklif sayısı ölçülür
- takip aksiyonu ölçülür
- zaman kazancı ölçülür
- müşteri adayından gelire geçiş izlenir
- dış aksiyonlar onay kuyruğuna bağlanabilir
- Saga'nın büyümesine doğrudan katkı verir

Ama bu, ürünün sadece CRM aracı olduğu anlamına gelmez.

CRM/revenue-ops ilk ispat alanı. Nihai ürün, AI şirket işletim sistemi.

## 8. İkinci Aşamada Ne Olacak?

İkinci aşamada sistem müşteri paketlerine dönüşecek.

İlk dış paketler:

### Audit Sprint

Müşterinin süreçleri analiz edilir, AI çalışan fırsatları çıkarılır, 30 günlük pilot kapsamı yazılır.

### 30 Günlük AI Çalışan Pilotu

Tek bir iş akışında AI çalışan ekibi kurulur:

- lead takip
- müşteri raporlama
- içerik/SEO
- operasyon takibi
- teklif hazırlama

### Managed AI Workforce

Müşteri için sürekli çalışan AI ekip kurulumu:

- haftalık rapor
- görev yönetimi
- onaylı aksiyonlar
- performans takibi
- yeni çalışan ekleme

## 9. Hedef Mimari

```text
Saga Agent Ops

Control Plane
  - organizations
  - users
  - workspaces
  - agents
  - tasks
  - approvals
  - artifacts
  - costs
  - traces

Execution Plane
  - orchestrator
  - agent runtime
  - workflow engine
  - tool gateway
  - sandbox workers

Knowledge Plane
  - project memory
  - customer context
  - sourced documents
  - retrieval logs

Safety Plane
  - role permissions
  - tool grants
  - approval rules
  - audit logs
  - cost caps
```

## 10. Stack Kararı

Başlangıç yönü:

- TypeScript monorepo
- `apps/web`: kontrol paneli
- `apps/api`: backend API
- `packages/shared`: ortak tipler ve Zod şemaları
- `packages/agent-runtime`: ajan çalışma sözleşmeleri
- PostgreSQL: ana veri kaydı
- pgvector: ilk bilgi/hafıza arama katmanı
- BullMQ veya Temporal: workflow/queue kararı prototip sonrası

İlk aşamada amaç, mükemmel altyapı değil; doğru ürün çekirdeğini hızlı kurmak.

## 11. Plan Değişti mi?

Evet, plan netleşti.

Önceki plan daha çok "CRM/revenue-ops MVP" gibi görünüyordu.

Güncel plan:

- Ürün vizyonu: profesyonel AI şirket işletim sistemi.
- İlk ispat alanı: CRM/revenue-ops.
- İlk müşteri: Saga Teknoloji.
- İlk ürün yüzü: task ledger + approval queue + artifact preview.
- İlk veri çekirdeği: task ledger + approval queue + state machine + cost/trace + agent registry.
- İlk ticari yol: Audit Sprint -> 30 günlük pilot -> Managed AI Workforce.

Yani CRM bir ürün sınırı değil; AI şirket mantığını çalıştırmak için ilk saha.

Üçüncü göz sonrası yapılan önemli değişiklik:

- Org chart ve departman görselliği P0 değil.
- Cost/trace/source P1 değil P0.
- İlk gerçek workflow tekleştirildi: Lead -> Research -> Offer Draft -> Approval -> Weekly Report.
- İlk ürün vaadi dış pazarda "AI Company OS" gibi soyut değil; "B2B satış ve operasyon işlerini ölçülebilir, onaylı, maliyet kontrollü AI çalışanlarla yürüten managed workflow sistemi" olmalı.

Opus v2 sonrası ek karar:

- Doküman aşaması kapanmalı; bir sonraki çalışma kod olmalı.
- P0 LLM worker sayısı 2: Researcher, Drafter. Orchestrator engine kodudur.
- Knowledge base, hard budget caps, tool registry ve minimum eval P0 kapsamına alındı.
- İlk 2 haftalık hedef tek demo: URL ver -> araştırma + teklif taslağı -> approval inbox -> maliyet/kaynak/süre görünür.

## 12. İlk 30 Gün Planı

### Gün 1-7

- monorepo scaffold
- PostgreSQL schema v0
- agent registry schema
- task ledger schema
- approval queue schema
- ilk 2 LLM worker rol kartı
- orchestration engine contract
- ilk task/artifact/cost/trace modelleri
- output status ve source kaydı modeli
- hard budget caps
- agent tool registry

### Gün 8-15

- Lead -> Research -> Offer Draft -> Approval -> Weekly Report prototipi
- approval queue v0
- artifact preview
- cost/trace/source kaydı
- tenant knowledge base v0
- minimum eval seti
- basit web UI: task listesi, approval inbox, artifact preview

### Gün 16-30

- 50 gerçek veya gerçekçi iç görev çalıştırma
- sonuçları ölçme
- revizyon ve kabul oranı toplama
- CRM entegrasyon hedefini seçme
- dış demo paketinin ilk taslağı

## 13. Başarı Kriterleri

İlk 30 gün sonunda:

- En az 2 AI worker rolü ve 1 orchestration engine contract tanımlı.
- En az 1 gerçek workflow uçtan uca çalışıyor.
- En az 50 görev kaydı var.
- Her görev için çıktı, kaynak, maliyet, durum ve onay statüsü tutuluyor.
- En az 10 lead araştırması üretilmiş.
- En az 5 teklif/brief taslağı üretilmiş.
- İnsan onayı gerektiren hiçbir dış aksiyon otomatik yapılmamış.
- Ürünleşebilir demo netleşmiş.

## 14. Kritik Riskler

### Risk 1: Fazla ajan, az iş

Çözüm: 100+ çalışanla başlamayacağız. Önce 5 çalışan ve 3 iş akışı.

### Risk 2: Chatbot'a düşmek

Çözüm: Her çıktı task ledger'a bağlanacak. Sohbet değil iş kaydı temel olacak.

### Risk 3: Ajanların yanlış aksiyon alması

Çözüm: Tool gateway + approval queue + blocked action list.

### Risk 4: Maliyet kontrolsüz büyür

Çözüm: task, agent ve tenant bazlı cost event ve hard cap.

### Risk 5: Müşteri verisi riski

Çözüm: tenant ayrımı, veri minimizasyonu, hassas veri politikası, audit log.

### Risk 6: Ürün çok genişler

Çözüm: İç ispat alanı CRM/revenue-ops. Dış ürünleşme ancak iç kullanım kanıtından sonra.

## 15. Sonuç

Saga Agent Ops ile inşa edeceğimiz şey:

**Saga'nın kendi içinde çalışan ve zamanla müşterilere kurulabilen profesyonel AI şirket işletim sistemi.**

Bu sistemde AI çalışanlar gerçek çalışan gibi rol, görev, araç, çıktı, sorumluluk, maliyet ve onay sınırına sahip olacak.

İlk yapılacak ürün çekirdeği:

1. Monorepo scaffold.
2. PostgreSQL schema v0.
3. Task ledger.
4. Approval queue.
5. Cost/trace/source kaydı.
6. Agent registry.
7. Tenant knowledge base.
8. Hard budget caps.
9. İlk 2 AI worker.
10. Lead -> Research -> Offer Draft -> Approval -> Weekly Report.

Bu çekirdek doğru kurulursa, sonra sektör paketleri, müşteri panelleri, CRM entegrasyonları ve managed AI workforce satış modeli bunun üzerine güvenli şekilde büyür.

## 16. Bağımsız Üçüncü Göz Notu

Üçüncü göz değerlendirmesi planı genel olarak doğru buldu, ama önceliklerde sert bir düzeltme önerdi.

Ana hüküm:

> İlk 30 gün org chart ve departman UI kazanırsa oyuncak olur; task ledger, approval, source/cost trace ve kabul edilen gerçek çıktılar kazanırsa ürün olur.

Öne çıkan eleştiriler:

- Vizyon doğru ama dış pazara "AI Company OS" diye çıkmak erken ve soyut. Müşteri OS değil, çözülmüş iş alır.
- Revenue-ops/CRM başlangıcı doğru; fakat platform kapsamı aynı anda fazla büyütülmemeli.
- Org chart tiyatrosu riski var. Departman metaforu iş üretmiyorsa sadece gösteri olur.
- Cost/trace P1 olamaz; denetlenebilirlik ürünün özü olduğu için P0 olmalı.
- Approval queue sadece "onay gerekir" olmamalı; risk seviyesi, karar nedeni, SLA ve revizyon döngüsü içermeli.
- CRM entegrasyonunu erken büyütmek riskli; ilk 30 gün CSV/manual import veya read-only yeter.
- Eval yanılsaması büyük risk. Golden task set, kabul/red rubrikleri ve unsafe action testleri gerekir.

Bu eleştiriden sonra uygulama sırası değişti:

1. Ledger + approval + cost/trace/source.
2. Tek lead-to-offer workflow.
3. 50 görevlik iç pilot.
4. Read-only CRM.
5. Org chart ve departman görselliği.

Bu sıra korunmazsa etkileyici ama kırılgan demo çıkar. Korunursa profesyonel AI şirket işletim sistemi çıkar.

## 17. Opus V2 Değerlendirmesi Sonrası Nihai Uygulama Kararı

Opus değerlendirmesi, mevcut yönü doğru buldu ama en büyük riski açıkça işaretledi: çok fazla doküman, sıfır çalışan kod.

Bu yüzden bu rapor son stratejik açıklama kabul edilmeli. Bundan sonraki iş kod ve çalışan slice olmalı.

Nihai P0:

1. Monorepo scaffold: `apps/api`, `apps/web`, `packages/shared`, `packages/agent-runtime`.
2. PostgreSQL schema v0: tenants, agents, tasks, steps, approvals, artifacts, cost events, trace events, knowledge sources.
3. Agent runtime contract: `runAgent(task, context) -> result + trace`.
4. Researcher ajanı: URL veya firma bilgisi alır, araştırma artifact'i üretir.
5. Engine -> Researcher -> Drafter zinciri.
6. Approval Gateway: approve, reject, request changes, block.
7. Cost/trace/source kaydı.
8. Basit web UI: task list, approval inbox, artifact preview.
9. Tenant knowledge base: Saga fiyatlandırma, teklif şablonu, ICP, hizmet paketleri, risk politikası.
10. Hard budget caps: görev başına token/maliyet limiti, maksimum step sayısı, günlük tenant limiti.

Kesin ertelenenler:

- Org chart UI.
- 5'ten fazla ajan.
- QA ajanı.
- Pipeline Operator ajanı.
- CRM write.
- Agent marketplace.
- Karmaşık RAG pipeline.
- Temporal/LangGraph kararı.

Sprint sonu demo hedefi:

```text
URL veya firma bilgisi gir
  -> Researcher araştırma artifact'i üretir
  -> Drafter teklif taslağı üretir
  -> Approval inbox'a düşer
  -> kullanıcı approve / reject / revise der
  -> sistem kaynak, maliyet, süre, trace ve artifact versiyonunu gösterir
```

Bu demo çalışmadan başka ürüne dokunulmayacak.
