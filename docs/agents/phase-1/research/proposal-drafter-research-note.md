# Teklif ve Kapsam Hazırlayıcı - GitHub Araştırma Notu

Tarih: 2026-05-11  
Ajan: Teklif ve Kapsam Hazırlayıcı  
Faz: 1  
Durum: İlk kabul notu

## Amaç

Teklif ve Kapsam Hazırlayıcı, Lead Araştırmacısı'ndan gelen kaynaklı araştırmayı Saga'nın hizmet paketleri, kapasitesi, risk sınırları ve approval policy'siyle birleştirerek teklif taslağı artifact'i üretir.

Bu ajan teklif göndermez, fiyatı bağlayıcı hale getirmez, müşteriyle iletişim kurmaz. Taslak üretir ve insan onayına düşürür.

## İncelenen Kaynaklar

1. `run-llama/auto_rfp`
   - Kaynak: https://github.com/run-llama/auto_rfp
   - Faydalı pattern: RFP dokümanından soru çıkarma, knowledge base ile bağlamsal cevap üretme, multi-step analysis.
   - Çıkarım: Saga teklif taslağı, sadece güzel metin değil; müşteri ihtiyacı, kapsam, varsayımlar, teslimatlar ve kaynak knowledge base bağlantılarıyla structured olmalı.

2. `microsoft/agent-for-rfp-response-solution-accelerator`
   - Kaynak: https://github.com/microsoft/agent-for-rfp-response-solution-accelerator
   - Faydalı pattern: geçmiş teklif/RFP knowledge base'inden proposal, compliance/security section, high-level project plan ve confidence score üretme.
   - Çıkarım: Saga tekliflerinde compliance/security ve teslimat planı ayrı bölümler olmalı; güven skoru ve insan işaretleri görünmeli.

3. `zubair-trabzada/ai-sales-team-claude`
   - Kaynak: https://github.com/zubair-trabzada/ai-sales-team-claude
   - Faydalı pattern: sales proposal, meeting prep, objections, ICP ve competitor çıktılarının ayrı command/skill olarak ayrılması.
   - Çıkarım: Teklif Hazırlayıcı proposal taslağını üretir; itiraz yönetimi, satış stratejisi ve meeting prep ayrı ajanlara devredilebilir.

4. `kaymen99/sales-outreach-automation-langgraph`
   - Kaynak: https://github.com/kaymen99/sales-outreach-automation-langgraph
   - Faydalı pattern: research report'tan customized outreach report üretme ve case study/RAG ile öneriyi destekleme.
   - Çıkarım: Proposal taslağı lead research artifact'ine açıkça referans vermeli; case study veya şirket knowledge base yoksa bunu varsayım olarak belirtmeli.

## Saga'ya Alınan Pattern'ler

- Proposal taslağı structured artifact'tir.
- Research artifact olmadan teklif üretmez.
- Kapsam, kapsam dışı, varsayımlar, riskler ve sonraki adım ayrı alanlardır.
- Güvenlik/compliance etkisi ayrı bölümde görünür.
- Confidence score ve insan onayı zorunludur.
- Geçmiş onaylı tekliflerden memory/context alabilir.

## Reddedilen Pattern'ler

- Otonom teklif gönderme.
- Bağlayıcı fiyat veya sözleşme dili üretme.
- Kaynaksız başarı iddiası.
- Müşteriye doğrudan Teams/CRM/e-posta post etme.
- Hukuki/KVKK metnini nihai belge gibi sunma.

## Memory Tasarımı

Teklif Hazırlayıcı şunları hatırlar:

- Onaylanan teklif formatları.
- Revize edilen veya reddedilen kapsam pattern'leri.
- Saga'nın güncel hizmet paketleri.
- Paket bazlı varsayım ve risk şablonları.
- Kullanıcının dil/ton tercihleri.

Kalıcı hafızaya yazmadan önce:

- Teklif artifact'i insan tarafından onaylanmış olmalı veya memory write `agent_generated` olarak düşük güvenle tutulmalı.
- Fiyat/taahhüt bilgisi human-approved olmadan yüksek güvenli memory olamaz.
- Müşteri özel bilgisi tenant/project sınırını aşamaz.

## Kabul Kriterleri

- Araştırma artifact'inden açık referans kullanır.
- Kapsam, teslimatlar, varsayımlar, riskler ve sonraki adım bölümleri vardır.
- Security/compliance etkisini belirtir.
- Human approval gerektirir.
- Teklif taslağı dış gönderime hazır kabul edilmez; `needs_review` durumuyla kapanır.
