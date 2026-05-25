# اختبارات Playwright للنظام المحاسبي SmartERP

مشروع اختبارات آلية بلغة JavaScript باستخدام Playwright 1.58.2.

## التثبيت

```powershell
cd C:\Users\Maram\playwright-tests
npm install
npx playwright install chromium   # متصفح Chromium فقط (مساحة القرص منخفضة)
```

تأكدي أن ملف `.env` موجود ويحتوي على بيانات الدخول (محلي فقط، لا يُرفع على git).

## تشغيل الاختبارات

```powershell
npx playwright test                 # كل الاختبارات
npx playwright test tc-001          # اختبار واحد فقط (TC-001)
npx playwright test --headed        # مع إظهار المتصفح
npx playwright test auth.setup      # تأكيد تسجيل الدخول فقط
```

## اكتشاف المحددات (Selectors) — مهم

شاشة "قيد يدوي" غير مكتشفة بعد. لذلك المحددات في `pages/ManualJournalPage.js` مؤقتة (TODO).

استخدمي **codegen** لتسجيل الخطوات واستخراج المحددات الحقيقية:

```powershell
npx playwright codegen https://acc.devsub.smartlifesys.online
```

1. سجّلي الدخول داخل النافذة بـ test_maram2 / test_maram2 / 12345678.
2. انقري حتى تصلي لشاشة "قيد يدوي".
3. انسخي المحددات المسجلة وحدّثي `pages/ManualJournalPage.js`.

## التقرير

```powershell
npx playwright show-report
```

## ملاحظة على نطاق الأتمتة

من أصل 55 حالة اختبار، **10 حالات غير مناسبة لـ Playwright** ويجب اختبارها يدوياً أو بأدوات متخصصة:

- اختبارات الأداء (Performance / Load) — استخدمي k6 أو JMeter
- ظروف السباق (Race Conditions) المتزامنة
- حقن SQL (SQL Injection) — استخدمي OWASP ZAP أو Burp
- اختبار السفر عبر الزمن للسنة المالية (Fiscal Year time travel)
- اختبارات أمنية على مستوى قاعدة البيانات
- اختبارات تكامل بين خدمات backend متعددة بدون UI
- اختبارات النسخ الاحتياطي والاستعادة
- اختبارات استهلاك الذاكرة طويلة الأمد
- اختبارات الفشل في الشبكة على مستوى المنفذ
- اختبارات التوافق مع أنظمة تشغيل متعددة (تحتاج بيئات حقيقية)

الـ 45 حالة الباقية مناسبة لـ Playwright.

## بنية المشروع

```
playwright-tests/
  package.json
  playwright.config.js
  .env / .env.example
  pages/          ← Page Object Model
  tests/
    auth.setup.js ← تسجيل دخول مرة واحدة، حفظ الجلسة
    reference-number/tc-001.spec.js
  fixtures/auth.json (يُولَّد تلقائياً)
```
