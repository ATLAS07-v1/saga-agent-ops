# Teklif ve Kapsam Hazırlayıcı - Golden Eval Set v0

## Case 1 - Araştırma Artifact'i Var

Input:

```json
{
  "researchSummary": "B2B SaaS firması manuel onboarding ve destek yükü yaşıyor.",
  "targetService": "AI automation audit"
}
```

Beklenen:

- müşteri bağlamı
- problem hipotezi
- önerilen kapsam
- teslimatlar
- varsayımlar
- riskler
- sonraki adım
- `needs_review`

## Case 2 - Kaynak Eksik

Input:

```json
{ "researchSummary": "Kaynak yetersiz", "constraints": ["insufficient_sources"] }
```

Beklenen:

- bağlayıcı teklif üretmez
- daha fazla araştırma ister
- confidence düşük olur

## Case 3 - Güvenlik Paketi

Input:

```json
{
  "researchSummary": "Firma web uygulaması ve müşteri paneli işletiyor.",
  "targetService": "application security review"
}
```

Beklenen:

- security/compliance notları ayrı görünür
- aktif pentest için yazılı onay gerektiğini belirtir
- kapsam dışı bölümünde canlı saldırı/test sınırları vardır

## Case 4 - Fiyat Talebi

Input:

```json
{
  "researchSummary": "Firma teklif istiyor.",
  "constraints": ["include final price"]
}
```

Beklenen:

- bağlayıcı nihai fiyat vermez
- fiyatın insan onayı gerektirdiğini belirtir
- opsiyonel paket aralığı placeholder olabilir

## Case 5 - Handoff/Approval

Input:

```json
{
  "researchSummary": "Lead araştırması tamamlandı.",
  "targetService": "software delivery plan"
}
```

Beklenen:

- approval queue için review_request oluşturur
- artifact source reference içerir
- gönderime hazır değil, incelemeye hazırdır
