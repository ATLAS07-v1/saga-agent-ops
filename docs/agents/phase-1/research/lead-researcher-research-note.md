# Lead Araştırmacısı - GitHub Araştırma Notu

Tarih: 2026-05-11  
Ajan: Lead Araştırmacısı  
Faz: 1  
Durum: İlk kabul notu

## Amaç

Lead Araştırmacısı, verilen firma URL'si veya firma bilgisi için kaynaklı, izlenebilir ve teklif hazırlamaya uygun araştırma artifact'i üretir.

Bu ajan dış aksiyon yapmaz; CRM yazmaz, e-posta göndermez, üçüncü kişilerle iletişim kurmaz. Sadece araştırır, kaynaklandırır, belirsizlikleri işaretler ve handoff yapar.

## İncelenen Kaynaklar

1. `kaymen99/sales-outreach-automation-langgraph`
   - Kaynak: https://github.com/kaymen99/sales-outreach-automation-langgraph
   - Faydalı pattern: LinkedIn, şirket sitesi, sosyal medya, haber ve dijital varlık araştırmasını tek research report içinde birleştirme.
   - Çıkarım: Saga araştırma çıktısı tek metin değil; firmographics, pain points, opportunity hypothesis, source list ve confidence alanları olan structured artifact olmalı.

2. `brightdata/ai-sdr-bdr-agent`
   - Kaynak: https://github.com/brightdata/ai-sdr-bdr-agent
   - Faydalı pattern: Company Discovery, Trigger Detection, Contact Research, Message Generation, Pipeline Manager ayrımı.
   - Çıkarım: Lead Araştırmacısı kendi içinde trigger, ICP fit, contact hints ve timing sinyallerini ayırmalı; ancak outreach üretimini Teklif Hazırlayıcı/Satış Stratejisti'ne bırakmalı.

3. `zubair-trabzada/ai-sales-team-claude`
   - Kaynak: https://github.com/zubair-trabzada/ai-sales-team-claude
   - Faydalı pattern: `/sales research`, `/sales qualify`, `/sales contacts`, `/sales proposal` gibi komutları ayrı yetenekler olarak ele alma.
   - Çıkarım: Lead Araştırmacısı tek başına satış ekibi değildir; şirket araştırması ve ilk qualification sinyali üretir, sonra handoff yapar.

4. `gtmagents/gtm-agents`
   - Kaynak: https://github.com/gtmagents/gtm-agents
   - Faydalı pattern: GTM işleri için tekrarlı task'ları küçük, role-based agent/skill paketlerine ayırma.
   - Çıkarım: Saga'da lead research bir workflow step'i olmalı; ajan memory'si hangi sinyallerin daha sonra onaylandığını öğrenmeli.

## Saga'ya Alınan Pattern'ler

- Kaynaklı araştırma zorunlu.
- Her iddia source confidence ile işaretlenir.
- Araştırma çıktısı teklif değil, teklif için hammadde üretir.
- Trigger sinyalleri ayrı alanlarda tutulur.
- ICP fit ve fırsat hipotezi açıkça ayrılır.
- Contact bilgileri sadece kaynak varsa ve privacy sınırına uygunsa not edilir.
- CRM write ve dış outreach insan onayı olmadan yoktur.

## Reddedilen Pattern'ler

- Otomatik CRM update: Faz 1 kapsamı değil.
- Otomatik e-posta veya LinkedIn outreach: kırmızı çizgi.
- Kaynaksız lead scoring: kabul edilmeyecek.
- Tek ajanın hem araştırma hem proposal hem outreach üretmesi: Saga organizasyon modeline aykırı.

## Memory Tasarımı

Lead Araştırmacısı şunları hatırlar:

- Saga için iyi/uygun ICP sinyalleri.
- Kullanıcı tarafından onaylanan/reddedilen araştırma pattern'leri.
- Güvenilir kaynak tipleri.
- Sektör bazlı tekrar eden problem sinyalleri.
- Yanlış çıkan veya düşük güvenli kaynak pattern'leri.

Kalıcı hafızaya yazmadan önce:

- Kaynak doğrulanmış olmalı veya insan onayı almalı.
- Kişisel veri içeren bilgi kalıcı memory'ye yazılmamalı.
- Customer/project memory, tenant sınırını aşmamalı.

## Kabul Kriterleri

- Firma adı, sektör, konum, hizmet/ürün sinyali çıkarılır.
- En az 3 kaynaklı bulgu veya açık `insufficient_sources` uyarısı üretilir.
- Pain point ve opportunity hypothesis ayrı yazılır.
- Teklif Hazırlayıcı'ya structured handoff üretir.
- Kaynak, trace, cost ve memory event kaydı için payload verir.
