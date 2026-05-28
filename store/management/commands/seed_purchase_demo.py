"""
Seed realistic purchase data using the 9 existing Bengali product groups from store.xlsx.
Products and groups are looked up by name; created only if absent.
Re-run safe: skips purchase heads that already exist.
"""

from datetime import date
from decimal import Decimal
from unicodedata import normalize as _nfc

from django.core.management.base import BaseCommand


def nfc(s):
    return _nfc("NFC", s)

from store.models import (
    Mfccompany,
    MonthList,
    Product,
    ProductGroup,
    PurchaseHead,
    PurchaseItem,
    Supplier,
    VoucherCode,
    YearList,
)

# ─── reference data ───────────────────────────────────────────────────────────
# Maps exactly to group names already in the DB (from store.xlsx import).
# If a group or product is absent it will be created.
GROUPS_PRODUCTS = {
    "পেপার সামগ্রী": [
        ("এ-৪ পেপার",                  380, 420, "রিম"),
        ("লিগ্যাল পেপার",              420, 460, "রিম"),
        ("এ-৩ পেপার",                  750, 820, "রিম"),
        ("ট্রেসিং পেপার রোল",          850, 940, "টি"),
        ("প্রিণ্টার পেপার রোল",         680, 750, "টি"),
        ("নোট সীট পেপার প্যাকেট",      120, 140, "টি"),
    ],
    "টয়লেটস সামগ্রী": [
        ("ফেসিয়াল টিস্যু বক্স",        90,  110, "টি"),
        ("টয়লেট টিস্যু রোল",           25,  30,  "টি"),
        ("এয়ার ফ্রেশনার",              180, 210, "টি"),
        ("এরোসল",                      220, 260, "টি"),
        ("হ্যান্ড ওয়াশ",                95,  120, "টি"),
        ("টয়লেট সাবান",                35,  45,  "টি"),
        ("ভীম লিকুইড",                  60,  75,  "টি"),
        ("জেট পাউডার",                  55,  70,  "টি"),
        ("হারপিক",                      90,  110, "টি"),
        ("গামছা",                       80,  100, "টি"),
        ("বালতি",                       120, 150, "টি"),
        ("মগ",                          45,  60,  "টি"),
        ("ডাস্টার ক্লথ",                30,  40,  "টি"),
        ("লাইজল",                       250, 290, "টি"),
        ("পাপশ",                        70,  90,  "টি"),
        ("ফ্লোর ক্লিনার/মপ",            180, 220, "টি"),
        ("টয়লেট ব্রাশ",                50,  65,  "টি"),
        ("পলিব্যাগ",                    40,  55,  "কেজি"),
    ],
    "অফিস স্টেশনারি": [
        ("স্ট্যাপলার মেশিন (২৪/৬)",     250, 300, "টি"),
        ("বড় স্ট্যাপলার মেশিন",        480, 560, "টি"),
        ("স্ট্যাপলার পিন বক্স",          30,  40,  "টি"),
        ("বড় স্ট্যাপলার পিন (২৩/২৪)",  65,  80,  "টি"),
        ("বল পেন",                      12,  15,  "টি"),
        ("সাইন পেন",                    18,  22,  "টি"),
        ("জেল পেন",                     20,  25,  "টি"),
        ("ফাইল কভার",                   15,  20,  "টি"),
        ("ফাইল বোড",                    25,  32,  "টি"),
        ("প্লাস্টি ফাইল এ-৪ সাইজ",     35,  45,  "টি"),
        ("প্লাস্টি ফাইল লিগ্যাল সাইজ",  38,  48,  "টি"),
        ("প্লাস্টিক ফোল্ডার এ-৪ সাইজ",  22,  28,  "টি"),
        ("প্লাস্টিক ফোল্ডার লিগ্যাল সাইজ", 25, 32, "টি"),
        ("ডিপার্টমেন্টাল ফোল্ডার",      45,  55,  "টি"),
        ("গার্ড ফাইল",                  120, 145, "টি"),
        ("চিঠি খাম",                    5,   7,   "টি"),
        ("এ-৪ খাম",                     8,   10,  "টি"),
        ("লিগ্যাল খাম",                 10,  13,  "টি"),
        ("এ-৩ খাম",                     15,  18,  "টি"),
        ("ফেদার (ডাস্টার)",             40,  50,  "টি"),
        ("কারসেন্ট",                    90,  110, "টি"),
        ("রেজিস্টার খাতা",              80,  100, "টি"),
        ("ব্যাটারি (AA,AAA)",            30,  38,  "টি"),
        ("কাঠ পেন্সিল",                8,   12,  "টি"),
        ("পেন্সিল কাটার",               35,  45,  "টি"),
        ("রাবার/ইরেজার",                5,   8,   "টি"),
        ("জেমস ক্লিপ বক্স",             25,  32,  "টি"),
        ("ছুরি/কাটার",                  45,  58,  "টি"),
        ("সিজার",                       55,  70,  "টি"),
        ("পিন রিমোভার",                30,  38,  "টি"),
        ("পাঞ্চ মেশিন (সিঙ্গেল)",        180, 220, "টি"),
        ("পাঞ্চ মেশিন (ডাবল)",          280, 340, "টি"),
        ("স্কেল",                       20,  28,  "টি"),
        ("গাম/আইকা/আঠা/ফেভিকল",        40,  52,  "টি"),
        ("ঝুড়ি",                        60,  78,  "টি"),
        ("ক্যালকুলেটর (সাইন্টিফিক)",    650, 780, "টি"),
        ("ক্যালকুলেটর",                280, 350, "টি"),
        ("সুতার বল",                    25,  32,  "টি"),
        ("সুতার ট্যাগ",                15,  20,  "টি"),
        ("হাইলাইটার পেন",              28,  35,  "টি"),
        ("মার্কার পেন",                22,  28,  "টি"),
        ("ফুল ঝাড়ু",                   80,  100, "টি"),
        ("ঝুল ঝাড়ু",                   60,  75,  "টি"),
        ("শলার ঝাড়ূ",                  50,  65,  "টি"),
        ("সীল প্যাড",                   60,  78,  "টি"),
        ("সীল প্যাড কালি",              35,  45,  "টি"),
        ("ফ্ল্যাগ ট্যাগ প্যাকেট",        18,  24,  "টি"),
        ("ডাস্টবিন",                    120, 150, "টি"),
        ("বান্ডিং ক্লিপ",               15,  20,  "টি"),
        ("রেক্সিন টেপ",                20,  26,  "টি"),
        ("স্কচ টেপ",                    18,  24,  "টি"),
        ("কার্টুন টেপ",                22,  28,  "টি"),
        ("মাস্কিং টেপ",                25,  32,  "টি"),
    ],
    "মুদ্রণ সামগ্রী": [
        ("লাইসেন্স বই",                150, 180, "টি"),
        ("লাইসেন্স ফরম",               80,  100, "টি"),
    ],
    "সাদা-কালো টোনার": [
        ("প্রিণ্টার টোনার ২২৬-এ",      2500, 2800, "টি"),
        ("প্রিণ্টার টোনার ৫০৫-এ",      2800, 3100, "টি"),
        ("প্রিণ্টার টোনার ৩২৬-এ",      2600, 2900, "টি"),
        ("প্রিণ্টার টোনার ৩০৮-এ",      2200, 2500, "টি"),
        ("প্রিণ্টার টোনার ৫৩-এ",       1800, 2100, "টি"),
        ("প্রিণ্টার টোনার ৯৩-এ",       1900, 2200, "টি"),
        ("প্রিণ্টার টোনার ৮৭-এ",       2000, 2300, "টি"),
        ("প্রিণ্টার টোনার ১৫১-এ",      1700, 1950, "টি"),
    ],
    # Use the exact name stored in the DB for this group
    "প্রিণ্টার কালার টোনার": [
        ("প্রিণ্টার টোনার ৭৬১২-এ",     3500, 3900, "সেট"),
        ("প্রিণ্টার টোনার L-১৮০০",     3200, 3600, "সেট"),
        ("প্রিণ্টার টোনার ৫০৮-এ",      3800, 4200, "সেট"),
        ("প্রিণ্টার টোনার J-3540 -এ",  4000, 4500, "সেট"),
        ("প্রিণ্টার টোনার TM-53৫0",    3600, 4000, "সেট"),
    ],
    "আনুষাঙ্গিক": [
        ("কীবোড",                       650, 780,  "টি"),
        ("মাউস",                        350, 420,  "টি"),
        ("মাল্টিপ্লাগ",                  280, 340,  "টি"),
        ("মাইস প্যাড",                  80,  100,  "টি"),
        ("পেনড্রাইভ",                   380, 450,  "টি"),
        ("ইউপিএস",                      3500, 4000, "টি"),
        ("হার্ড ড্রাইভ",                4500, 5200, "টি"),
        ("র‌্যাম",                   2800, 3200, "টি"),
    ],
    "সাদা-কালো ফটোকপিয়ার টোনার": [
        ("ফটোকপিয়ার টোনার ZT-৩০০৮c",  3200, 3600, "টি"),
        ("ফটোকপিয়ার টোনার T-5018c",    3500, 3900, "টি"),
        ("ফটোকপিয়ার টোনার T-2309P",    2800, 3200, "টি"),
        ("ফটোকপিয়ার টোনার T-2309C",    2900, 3300, "টি"),
        ("ফটোকপিয়ার টোনার TK-4128",    3100, 3500, "টি"),
        ("ফটোকপিয়ার টোনার T-2450D",    2700, 3100, "টি"),
        ("ফটোকপিয়ার টোনার T-2507P",    2600, 3000, "টি"),
        ("ফটোকপিয়ার টোনার NPG-51",     3300, 3800, "টি"),
        ("ফটোকপিয়ার টোনার ZT-2507C",   2800, 3200, "টি"),
        ("ফটোকপিয়ার টোনার T-2323C",    2750, 3150, "টি"),
        ("ফটোকপিয়ার টোনার T-5070P",    3000, 3400, "টি"),
        ("ফটোকপিয়ার টোনার T-2809P",    2900, 3300, "টি"),
    ],
    # Use the exact name stored in the DB for this group
    "ফটোকপিয়ার কালার টোনার": [
        ("ফটোকপিয়ার টোনার NPG-67",         4500, 5000, "সেট"),
        ("ফটোকপিয়ার টোনার NPG-88",         4800, 5400, "সেট"),
        ("ফটোকপিয়ার টোনার RICOH 1M 2010",  5200, 5800, "সেট"),
        ("প্লোটার মেশিন টোনার T-৮৩০",      6500, 7200, "টি"),
        ("প্লোটার মেশিন টোনার T-৫১০",      6000, 6700, "টি"),
        ("কার শ্যাম্পু",                    180,  220,  "টি"),
    ],
}

SUPPLIERS = [
    {"supname": "মেসার্স হক ট্রেডার্স",    "contact": "01711-100001", "address": "মতিঝিল, ঢাকা"},
    {"supname": "জাতীয় স্টেশনারি হাউস",   "contact": "01711-100002", "address": "গুলশান, ঢাকা"},
    {"supname": "বিডি টেক সলিউশনস",        "contact": "01711-100003", "address": "তেজগাঁও, ঢাকা"},
    {"supname": "ঢাকা অফিস সাপ্লাইজ",     "contact": "01711-100004", "address": "বনানী, ঢাকা"},
]

# (invoicedate, supplier_name, remark, [(product_name, qty)])
PURCHASES = [
    (date(2026, 1, 5),  "মেসার্স হক ট্রেডার্স", "জানুয়ারি পেপার ক্রয়",
        [("এ-৪ পেপার", 50), ("লিগ্যাল পেপার", 20)]),
    (date(2026, 1, 12), "বিডি টেক সলিউশনস",    "আইটি আনুষাঙ্গিক ব্যাচ-১",
        [("কীবোড", 10), ("মাউস", 10), ("পেনড্রাইভ", 20)]),
    (date(2026, 1, 20), "জাতীয় স্টেশনারি হাউস", "স্টেশনারি সামগ্রী",
        [("বল পেন", 100), ("স্ট্যাপলার মেশিন (২৪/৬)", 15), ("ফাইল কভার", 50)]),
    (date(2026, 2, 3),  "ঢাকা অফিস সাপ্লাইজ",   "ফেব্রুয়ারি পেপার অর্ডার",
        [("এ-৪ পেপার", 80), ("এ-৩ পেপার", 10)]),
    (date(2026, 2, 10), "মেসার্স হক ট্রেডার্স",  "টোনার সংগ্রহ",
        [("প্রিণ্টার টোনার ২২৬-এ", 5), ("প্রিণ্টার টোনার ৫০৫-এ", 3)]),
    (date(2026, 2, 18), "বিডি টেক সলিউশনস",     "ফটোকপিয়ার টোনার",
        [("ফটোকপিয়ার টোনার T-2309P", 4), ("ফটোকপিয়ার টোনার NPG-51", 2)]),
    (date(2026, 2, 25), "জাতীয় স্টেশনারি হাউস", "পরিষ্কার সামগ্রী",
        [("ফেসিয়াল টিস্যু বক্স", 30), ("হ্যান্ড ওয়াশ", 20), ("হারপিক", 10)]),
    (date(2026, 3, 4),  "ঢাকা অফিস সাপ্লাইজ",   "ত্রৈমাসিক স্টেশনারি",
        [("এ-৪ পেপার", 60), ("বল পেন", 150), ("রেজিস্টার খাতা", 20)]),
    (date(2026, 3, 11), "মেসার্স হক ট্রেডার্স",  "কম্পিউটার টোনার",
        [("প্রিণ্টার টোনার ৩২৬-এ", 4), ("প্রিণ্টার টোনার ৭৬১২-এ", 2)]),
    (date(2026, 3, 19), "বিডি টেক সলিউশনস",     "আইটি সরঞ্জাম",
        [("ইউপিএস", 3), ("হার্ড ড্রাইভ", 2), ("র‌্যাম", 4)]),
    (date(2026, 3, 26), "জাতীয় স্টেশনারি হাউস", "মুদ্রণ সামগ্রী",
        [("লাইসেন্স বই", 10), ("লাইসেন্স ফরম", 20)]),
    (date(2026, 4, 2),  "ঢাকা অফিস সাপ্লাইজ",   "এপ্রিল পেপার সরবরাহ",
        [("এ-৪ পেপার", 100), ("লিগ্যাল পেপার", 30)]),
    (date(2026, 4, 8),  "বিডি টেক সলিউশনস",     "আইটি আনুষাঙ্গিক ব্যাচ-২",
        [("কীবোড", 8), ("মাউস", 12), ("মাল্টিপ্লাগ", 10)]),
    (date(2026, 4, 15), "মেসার্স হক ট্রেডার্স",  "ফটোকপিয়ার রঙিন টোনার",
        [("ফটোকপিয়ার টোনার NPG-67", 2), ("ফটোকপিয়ার টোনার NPG-88", 1)]),
    (date(2026, 4, 22), "জাতীয় স্টেশনারি হাউস", "অফিস ফাইলিং সামগ্রী",
        [("ফাইল কভার", 100), ("গার্ড ফাইল", 20), ("ডিপার্টমেন্টাল ফোল্ডার", 30)]),
    (date(2026, 5, 5),  "ঢাকা অফিস সাপ্লাইজ",   "মে মাসের স্টেশনারি",
        [("এ-৪ পেপার", 70), ("বল পেন", 80), ("জেল পেন", 50)]),
    (date(2026, 5, 12), "মেসার্স হক ট্রেডার্স",  "প্রিন্টার টোনার সংগ্রহ",
        [("প্রিণ্টার টোনার ৫৩-এ", 3), ("প্রিণ্টার টোনার ৯৩-এ", 3), ("প্রিণ্টার টোনার ৮৭-এ", 2)]),
    (date(2026, 5, 18), "বিডি টেক সলিউশনস",     "কম্পিউটার আনুষাঙ্গিক",
        [("পেনড্রাইভ", 15), ("মাইস প্যাড", 20)]),
    (date(2026, 5, 22), "জাতীয় স্টেশনারি হাউস", "পরিচ্ছন্নতা সামগ্রী",
        [("ফেসিয়াল টিস্যু বক্স", 25), ("টয়লেট টিস্যু রোল", 50), ("লাইজল", 6)]),
]


class Command(BaseCommand):
    help = "Seed demo purchase data using the 9 Bengali product groups from store.xlsx"

    def handle(self, *args, **options):
        # ── voucher code ──────────────────────────────────────────────────────
        pur_vc, _ = VoucherCode.objects.get_or_create(
            shortname="PUR", defaults={"description": "Purchase"}
        )

        # ── month / year lists ────────────────────────────────────────────────
        month_names = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December",
        ]
        for m, mname in enumerate(month_names, 1):
            MonthList.objects.get_or_create(monthno=m, defaults={"monthname": mname})
        YearList.objects.get_or_create(yearnumber=2026)

        # ── mfc company (fallback for new installs) ───────────────────────────
        mfc, _ = Mfccompany.objects.get_or_create(
            companyname="বিভিন্ন", defaults={"status_id": 1}
        )

        # ── build product lookup map from DB (NFC-normalized keys) ───────────
        product_map = {nfc(p.productname): p for p in Product.objects.all()}
        self.stdout.write(f"  {len(product_map)} products indexed from DB.")

        # ── ensure groups & products exist (for fresh installs only) ──────────
        for gname, prod_list in GROUPS_PRODUCTS.items():
            group, _ = ProductGroup.objects.get_or_create(groupname=nfc(gname))
            for pname, purrate, salesrate, unit in prod_list:
                if nfc(pname) not in product_map:
                    prod = Product.objects.create(
                        productname=nfc(pname),
                        productgroup=group,
                        mfccompany=mfc,
                        unit=unit,
                        purchaserate=Decimal(purrate),
                        salesrate=Decimal(salesrate),
                        currentqty=Decimal(0),
                    )
                    product_map[nfc(pname)] = prod
                    self.stdout.write(f"  Created product: {prod.prodcode}  {prod.productname}")

        # ── suppliers ─────────────────────────────────────────────────────────
        supplier_map = {}
        for s in SUPPLIERS:
            obj, created = Supplier.objects.get_or_create(
                supname=s["supname"],
                defaults={"contact": s["contact"], "address": s["address"]},
            )
            supplier_map[s["supname"]] = obj
            if created:
                self.stdout.write(f"  Created supplier: {obj.supname}")

        # ── purchase heads + items ────────────────────────────────────────────
        month_map = {m.monthno: m for m in MonthList.objects.all()}
        year_2026 = YearList.objects.get(yearnumber=2026)
        created_heads = 0

        for inv_date, sup_name, remark, item_list in PURCHASES:
            supplier = supplier_map[sup_name]
            if PurchaseHead.objects.filter(
                invoicedate=inv_date, supplier=supplier, remark=remark
            ).exists():
                continue

            head = PurchaseHead.objects.create(
                supplier=supplier,
                vouchercode=pur_vc,
                invoicedate=inv_date,
                remark=remark,
                monthlist=month_map.get(inv_date.month),
                yearlist=year_2026,
            )
            created_heads += 1

            for pname, qty in item_list:
                if nfc(pname) not in product_map:
                    self.stdout.write(self.style.WARNING(f"  Product not found: {pname}"))
                    continue
                product = product_map[nfc(pname)]
                purrate = product.purchaserate
                PurchaseItem.objects.create(
                    purchasehead=head,
                    product=product,
                    quantity=Decimal(qty),
                    purrate=purrate,
                    purprice=Decimal(qty) * purrate,
                    salesrate=product.salesrate,
                    opnbalance=product.currentqty,
                    clbalance=product.currentqty + Decimal(qty),
                )

            self.stdout.write(
                f"  {head.invoiceno}  {inv_date}  {sup_name}  — {remark}"
            )

        self.stdout.write(
            self.style.SUCCESS(f"\nDone. {created_heads} new purchase heads created.")
        )
