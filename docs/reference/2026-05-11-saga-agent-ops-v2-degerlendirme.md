# Saga Agent Ops: Kapsamlı Plan Değerlendirmesi v2

Tarih: 2026-05-11
Profil: `tech-lead` + `project-analyst` + `security-reviewer`
Kapsam: Önceki değerlendirme + tüm referans dokümanlar + güncel pazar araştırması + proje durumu incelemesi

---

## 1. Bu plan doğru sırada mı?

**Evet, sıra doğru. Ama ciddi bir execution gap var.**

Planın sıralaması (Ledger → Approval → Workflow → İç Pilot → CRM → Dış Paket) stratejik olarak sağlam. Ancak mevcut proje durumuna baktığımda: `apps/web` ve `apps/api` klasörleri boş, `packages/` boş, `package.json`'da henüz gerçek dependency yok. Yaklaşık 85KB dokümantasyon üretilmiş ama **sıfır satır çalışan kod** var.

> [!WARNING]
> Dokümantasyon-kod oranı tehlikeli derecede yüksek. Bu noktada bir doküman daha yazmak yerine **ilk çalışan slice'ı kurmak** öncelik olmalı.

**Düzeltilmiş sıra:**
1. Monorepo scaffold + DB schema + tek ajan çalıştırma (Hafta 1)
2. Orchestrator → Researcher → Drafter zinciri + Approval UI (Hafta 2)
3. 50 görevlik iç pilot (Hafta 3-4)
4. Read-only CRM + dış demo (Hafta 5-8)

---

## 2. Vizyon-MVP çelişkisi var mı?

**Hayır. Ama "işletim sistemi" kelimesi tuzak olabilir.**

Revenue-ops wedge stratejisi mükemmel. Tehlike: "AI şirket işletim sistemi" ifadesi ekibi "her şeyi yapmalıyız" moduna çekebilir. Bu vizyonu iç motivasyon aracı olarak tutun, ama ilk 60 günde dışarıya söylemeniz gereken:

> "Lead geldi, araştırıldı, teklif hazırlandı, onaylandı, raporlandı — her adımın kaynağı, maliyeti, onay durumu kayıtlı."

Bu cümle çalışıyorsa vizyon zaten gerçekleşmiş demektir.

---

## 3. İlk 30 günde kesinlikle inşa edilmesi gerekenler

### Zorunlu (yoksa ürün yok)

| # | Bileşen | Neden |
|---|---------|-------|
| 1 | **Monorepo scaffold** (apps/api, apps/web, packages/shared, packages/agent-runtime) | Kod yazmaya başlayabilmek için |
| 2 | **PostgreSQL schema v0** (tenants, agents, tasks, steps, approvals, artifacts, cost_events, trace_events) | Task ledger'ın temeli |
| 3 | **Agent runtime contract** — tek bir ajanı çalıştıran minimum interface | `runAgent(task, context) → result + trace` |
| 4 | **İlk çalışan ajan: Researcher** — URL alır, analiz eder, DB'ye yazar | Uçtan uca çalışma kanıtı |
| 5 | **Orchestrator → Researcher → Drafter zinciri** (BullMQ veya DB state machine) | İlk gerçek workflow |
| 6 | **Approval Gateway** — step sonucu onaya düşer, kullanıcı approve/reject/revise yapar | Ürünün farklılaştırıcı değeri |
| 7 | **Cost/Trace kaydı** — her LLM çağrısında model, token, maliyet, süre, kaynak | İlk günden P0 |
| 8 | **Basit Web UI** — Task listesi + Approval inbox + Artifact preview | İnsan etkileşim noktası |

### Kesinlikle yapılmaması gereken (ilk 30 gün)

- Org chart UI, 5'ten fazla ajan rolü, CRM write, agent marketplace, karmaşık RAG pipeline

---

## 4. P0 kapsam düzeltmeleri

### Çıkarılması gerekenler

> [!CAUTION]
> **QA/Risk Reviewer ve Pipeline Operator ajanları P0'dan çıkmalı.** Backlog'da hâlâ 5 ajan P0 listelenmiş.

- 3 ajan → 3 bağlantı. 5 ajan → 10 potansiyel bağlantı (karmaşıklık geometrik artar).
- QA ajanı sonsuz döngü riski taşır.
- Pipeline Operator'ın yapacağı iş yok — CRM henüz bağlı değil.

**P0 ajan kadrosu (3 yeterli):** Orchestrator, Researcher, Drafter. QA'yı insan yapsın.

### Eklenmesi gerekenler

> [!IMPORTANT]
> **1. Tenant Knowledge Base** — Saga'nın fiyatlandırma mantığı, önceki teklifler, müşteri tercihleri. Basit: `knowledge_sources` tablosu + dosya upload + prompt injection.
>
> **2. Hard Budget Caps** — Task run başına token/maliyet üst limiti. Aşılınca workflow otomatik durur.
>
> **3. Agent Tool Registry** — Hangi ajanın hangi tool'u kullanabileceğinin kaydı. Basit config dosyası yeter.

---

## 5. Teknik stack değerlendirmesi

### Onaylanan kararlar ✅

| Karar | Neden doğru |
|-------|------------|
| TypeScript monorepo | Saga birikimi, frontend-backend tip paylaşımı |
| PostgreSQL | Sağlam, RLS desteği, pgvector ileride |
| BullMQ ile başla | Temporal'a erken geçmek overengineering |
| pgvector'ı erteleme | İlk 30 günde basit prompt injection yeter |

### Güncel stack tavsiyesi

```
apps/web           → Next.js 15 (App Router)
apps/api           → Hono + Drizzle + PostgreSQL
packages/shared    → Zod schemas, types, constants
packages/agent-runtime → Vercel AI SDK 6, tool definitions, agent contracts

Workflow           → BullMQ (→ Temporal sonra)
LLM                → Vercel AI SDK (provider-agnostic, ToolLoopAgent, @ai-sdk/workflow)
Observability      → Langfuse (native AI SDK entegrasyonu)
Auth               → Clerk veya NextAuth (ilk aşama basit)
```

**Neden Vercel AI SDK 6?** 2026'da `ToolLoopAgent`, orchestrator-worker pattern, `@ai-sdk/workflow` (durable execution, human-in-the-loop) ve built-in observability sunuyor. TypeScript monorepo için en doğal seçim. LangGraph'a göre daha az abstraction, daha fazla kontrol.

**Neden Hono?** NestJS bu ölçek için ağır. Hono hafif, hızlı, TypeScript-first.

---

## 6. Çekirdek kavram eksikliği

Task ledger + approval queue + cost/trace **doğru üçlü**. Ama 3 kavram eksik:

**1. Company Knowledge (Şirket Hafızası):** Ajanlar Saga'nın fiyatlandırma mantığını bilmeden generic çıktı üretir. MVP çözümü: 5-10 Markdown dosyası + prompt injection.

**2. Feedback Loop:** Reject/revise edilen çıktılarda neden reddedildiği toplanıp prompt'a geri beslenmezse ajan aynı hatayı tekrarlar. `approval.rejection_reason` alanı + aylık prompt refinement.

**3. Idempotency & Resume:** Workflow ortasında çökme durumunda LLM çağrısı tekrar yapılır, maliyet ikiye katlanır. Her step'e `idempotency_key` + tamamlanan step'leri skip eden resume mantığı.

---

## 7. İlk günden alınması gereken mimari kararlar

| Karar | Neden Day 1 |
|-------|------------|
| **Tenant isolation** — Her tabloda `tenant_id` + PostgreSQL RLS | Sonradan eklemesi en pahalı karar |
| **Stateless agent runtime** — Tüm state task ledger'da, ajan kodunda mutable state yok | Scale, replay, model değişimi |
| **Provider abstraction** — LLM çağrıları provider'a bağlı değil (AI SDK bunu yapıyor) | İleride model routing |
| **Tool contract interface** — Tüm tool'lar aynı interface'i implemente etsin | Plug-and-play tool ekleme |
| **Immutable event log** — Task ledger append-only, UPDATE yerine INSERT | Audit trail, replay, debugging |
| **Cost-aware execution** — Her `generateText` çağrısının maliyeti otomatik kaydedilsin | Tenant/task/agent bazında maliyet |
| **Artifact versioning** — Revizyon sonrası eski versiyona erişim | `version` + `parent_artifact_id` |

---

## 8. En büyük 5 risk

### Risk 1: Execution Paralysis (Uygulama Felci) — ŞU ANDA GERÇEKLEŞİYOR
85KB doküman, 0 satır kod. Plan mükemmelleştirme döngüsü en büyük tehlike.
**Önlem:** Bu belgeyi son stratejik doküman kabul edin. Yarından itibaren sadece kod.

### Risk 2: Veri/Bilgi Kalitesi (Garbage In, Garbage Out)
Knowledge base yoksa ajanlar generic çıktı üretir, kabul oranı düşer, kullanıcı sistemi terk eder.
**Önlem:** Knowledge base'i P0'a ekleyin. 5 Markdown dosyası yeter.

### Risk 3: Sonsuz Döngü & Maliyet Patlaması
Ajanlar arası ping-pong veya hatalı tool çağrıları yüzlerce dolarlık maliyet.
**Önlem:** Task başına 50K token hard cap, step sayısı max 10, tenant günlük $10 limit.

### Risk 4: Kullanıcı Direnci
Vasat çıktılar → "Kendim daha iyi yazarım" → terk.
**Önlem:** İlk use case'i gerçekten acı veren işe odaklayın. %80+ kabul oranı hedefi.

### Risk 5: Platform Gravity
"Her şeyi yapalım" → hiçbiri bitmez.
**Önlem:** İlk 2 hafta TEK hedef: URL ver → araştırma + teklif → approval inbox. Bu bitene kadar başka şeye dokunmayın.

---

## 9. İlk 2 haftalık sprint planı

### Hafta 1: Engine (Backend)

| Gün | İş | Done Kriteri |
|-----|-----|-------------|
| Pzt | Monorepo scaffold (pnpm, Hono, Next.js, shared, agent-runtime) | `pnpm dev` çalışır |
| Sal | PostgreSQL schema v0 (tenants, agents, tasks, steps, approvals, artifacts, costs) | Migration çalışır |
| Çar | Agent runtime + Vercel AI SDK + Langfuse | `runAgent("research", {url})` çalışır, trace görünür |
| Per | Researcher ajanı: URL → analiz → DB | Araştırma sonucu `artifacts`'e düşer |
| Cum | Cost/trace kaydı + hard budget cap | Maliyet kaydedilir, limit aşılınca durur |

### Hafta 2: Workflow & Human Loop (Fullstack)

| Gün | İş | Done Kriteri |
|-----|-----|-------------|
| Pzt | Orchestrator → Researcher → Drafter zinciri | 3 ajan sırayla çalışır |
| Sal | Drafter ajanı: research → teklif taslağı | Teklif `artifacts`'e yazılır |
| Çar | Approval Gateway: approve/reject/revise API | Onay verilebilir |
| Per | Web UI v0: Task list + Approval inbox + Artifact preview | Tarayıcıda görünür |
| Cum | Knowledge base v0: 5 Markdown + prompt injection | Drafter Saga şablonuna uygun çıktı üretir |

**Sprint sonu demo:** URL ver → 5 dk → approval inbox'ında araştırma + teklif. Onayla veya "fiyatı düşür" de. Maliyet, kaynak, süre görünsün.

---

## 10. Acımasız eleştiri

### Zayıf 1: Planlama Tuzağı
~100KB yazılı materyal, 0 satır kod. **Startuplar plan yazarak değil, kod yazarak ölçülür.** Bu planı kapatın, yarın scaffold kurun.

### Zayıf 2: B2B Teklif Hazırlama Deterministik Değil
Fiyatlandırma, müşteri seçimi, strateji uyumu sezgi ve tacit knowledge gerektirir. Ajanlar bunu yapamaz. Knowledge base hafifletir ama çözmez. **İlk 50 görevde %70+ kabul oranı tutturamıyorsanız use case değiştirin** (örn: operasyon raporlama daha deterministik).

### Zayıf 3: Tek Kişilik Ekip
Builder = User = Product Owner olduğunda feedback loop kısalır (iyi) ama objectivity düşer (kötü). **30. günde Saga dışından 1-2 kişiye gösterin.**

### Zayıf 4: Yönetilen Hizmet Ölçeklenme Paradoksu
Her müşteri için prompt tuning, knowledge base kurulumu, onay politikası tasarımı gerekir. Lineer ölçeklenir, SaaS gibi değil. **İlk 3 pilot'ta delivery saatlerini ölçün.**

### Zayıf 5: Eval P1 Değil P0 Olmalı
Eval olmadan kalite ölçülmez. **Minimum P0 eval:** 10 golden task + rubrik + unsafe action testi. 1 günlük iş.

---

## Kritik 5 Aksiyon

| # | Aksiyon | Deadline |
|---|---------|----------|
| 1 | **Kod yazmaya başlayın.** Monorepo scaffold kurun. | Pzt 12 Mayıs |
| 2 | **Ajan sayısını 3'e düşürün.** QA ve Pipeline Operator'ı çıkarın. | Hemen |
| 3 | **Knowledge base'i P0'a ekleyin.** 5 Markdown + prompt injection. | Hafta 2 sonu |
| 4 | **Hard budget caps koyun.** Task başına 50K token, tenant günlük $10. | Hafta 1 |
| 5 | **Sprint sonu demo:** URL → araştırma + teklif → approval inbox. | 25 Mayıs |

---

*Önceki değerlendirmenin güncellenmiş ve genişletilmiş versiyonu. Tüm referans dokümanlar, proje durumu ve güncel pazar araştırması dikkate alınmıştır.*
