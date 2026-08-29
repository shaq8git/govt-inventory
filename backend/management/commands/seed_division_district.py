from django.core.management.base import BaseCommand
from backend.models import Division, District


DIVISIONS = [
    (1, 'cht', 'চট্টগ্রাম'),
    (2, 'raj', 'রাজশাহী'),
    (3, 'khl', 'খুলনা'),
    (4, 'bsl', 'বরিশাল'),
    (5, 'slt', 'সিলেট'),
    (6, 'dhk', 'ঢাকা'),
    (7, 'rnp', 'রংপুর'),
    (8, 'mys', 'ময়মনসিংহ'),
]

# (district_id, division_id, district_name)
DISTRICTS = [
    (1,  1, 'কুমিল্লা'),
    (2,  1, 'ফেনী'),
    (3,  1, 'ব্রাহ্মণবাড়িয়া'),
    (4,  1, 'রাঙ্গামাটি'),
    (5,  1, 'নোয়াখালী'),
    (6,  1, 'চাঁদপুর'),
    (7,  1, 'লক্ষ্মীপুর'),
    (8,  1, 'চট্টগ্রাম'),
    (9,  1, 'কক্সবাজার'),
    (10, 1, 'খাগড়াছড়ি'),
    (11, 1, 'বান্দরবান'),
    (12, 2, 'সিরাজগঞ্জ'),
    (13, 2, 'পাবনা'),
    (14, 2, 'বগুড়া'),
    (15, 2, 'রাজশাহী'),
    (16, 2, 'নাটোর'),
    (17, 2, 'জয়পুরহাট'),
    (18, 2, 'চাঁপাইনবাবগঞ্জ'),
    (19, 2, 'নওগাঁ'),
    (20, 3, 'যশোর'),
    (21, 3, 'সাতক্ষীরা'),
    (22, 3, 'মেহেরপুর'),
    (23, 3, 'নড়াইল'),
    (24, 3, 'চুয়াডাঙ্গা'),
    (25, 3, 'কুষ্টিয়া'),
    (26, 3, 'মাগুরা'),
    (27, 3, 'খুলনা'),
    (28, 3, 'বাগেরহাট'),
    (29, 3, 'ঝিনাইদহ'),
    (30, 4, 'ঝালকাঠি'),
    (31, 4, 'পটুয়াখালী'),
    (32, 4, 'পিরোজপুর'),
    (33, 4, 'বরিশাল'),
    (34, 4, 'ভোলা'),
    (35, 4, 'বরগুনা'),
    (36, 5, 'সিলেট'),
    (37, 5, 'মৌলভীবাজার'),
    (38, 5, 'হবিগঞ্জ'),
    (39, 5, 'সুনামগঞ্জ'),
    (40, 6, 'নরসিংদী'),
    (41, 6, 'গাজীপুর'),
    (42, 6, 'শরীয়তপুর'),
    (43, 6, 'নারায়ণগঞ্জ'),
    (44, 6, 'টাঙ্গাইল'),
    (45, 6, 'কিশোরগঞ্জ'),
    (46, 6, 'মানিকগঞ্জ'),
    (47, 6, 'ঢাকা'),
    (48, 6, 'মুন্সিগঞ্জ'),
    (49, 6, 'রাজবাড়ী'),
    (50, 6, 'মাদারীপুর'),
    (51, 6, 'গোপালগঞ্জ'),
    (52, 6, 'ফরিদপুর'),
    (53, 7, 'পঞ্চগড়'),
    (54, 7, 'দিনাজপুর'),
    (55, 7, 'লালমনিরহাট'),
    (56, 7, 'নীলফামারী'),
    (57, 7, 'গাইবান্ধা'),
    (58, 7, 'ঠাকুরগাঁও'),
    (59, 7, 'রংপুর'),
    (60, 7, 'কুড়িগ্রাম'),
    (61, 8, 'শেরপুর'),
    (62, 8, 'ময়মনসিংহ'),
    (63, 8, 'জামালপুর'),
    (64, 8, 'নেত্রকোণা'),
]


class Command(BaseCommand):
    help = "Seed division and district tables from SQL data"

    def handle(self, *args, **options):
        self._seed_divisions()
        self._seed_districts()

    def _seed_divisions(self):
        created = 0
        for pk, divcode, name in DIVISIONS:
            _, made = Division.objects.update_or_create(
                id=pk,
                defaults={"divcode": divcode, "divisionname": name},
            )
            if made:
                created += 1
        self.stdout.write(self.style.SUCCESS(
            f"Division: {created} created, {len(DIVISIONS) - created} already existed"
        ))

    def _seed_districts(self):
        created = 0
        for pk, division_id, name in DISTRICTS:
            division = Division.objects.get(id=division_id)
            _, made = District.objects.update_or_create(
                id=pk,
                defaults={"division": division, "districtname": name},
            )
            if made:
                created += 1
        self.stdout.write(self.style.SUCCESS(
            f"District: {created} created, {len(DISTRICTS) - created} already existed"
        ))
