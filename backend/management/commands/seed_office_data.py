# coding: utf-8
"""
Seed CircleOffice, DistrictOffice, Office (upazila), and Designation
from the reference SQL file.  Idempotent — safe to run on every startup.
"""
import os
import re
from django.core.management.base import BaseCommand
from backend.models import HeadOffice, CircleOffice, DistrictOffice, Office, Designation


SQL_FILE = os.path.join(
    os.path.dirname(__file__),
    "..", "..", "..",
    "frontend", "public", "images", "eduhrm_cpy.sql",
)


def _parse_value(raw):
    raw = raw.strip()
    if raw.upper() == "NULL":
        return None
    if raw.startswith("'") and raw.endswith("'"):
        return raw[1:-1].replace("''", "'")
    try:
        return int(raw)
    except ValueError:
        return raw


def _split_values(inner):
    """Split comma-separated SQL values respecting single-quoted strings."""
    parts = []
    buf = []
    in_quote = False
    for ch in inner:
        if ch == "'" and not in_quote:
            in_quote = True
            buf.append(ch)
        elif ch == "'" and in_quote:
            in_quote = False
            buf.append(ch)
        elif ch == "," and not in_quote:
            parts.append("".join(buf))
            buf = []
        else:
            buf.append(ch)
    if buf:
        parts.append("".join(buf))
    return [_parse_value(p) for p in parts]


def _extract_row_content(line):
    """
    Given a line like  (1, 'name (with parens)', NULL, 0),
    return the content between the outermost parentheses.
    Tracks depth so nested parens in quoted strings don't confuse it.
    """
    line = line.strip()
    if not line.startswith("("):
        return None
    depth = 0
    in_quote = False
    start = None
    for i, ch in enumerate(line):
        if ch == "'" and not in_quote:
            in_quote = True
        elif ch == "'" and in_quote:
            in_quote = False
        elif not in_quote:
            if ch == "(":
                depth += 1
                if depth == 1:
                    start = i
            elif ch == ")":
                depth -= 1
                if depth == 0:
                    return line[start + 1 : i]
    return None


def _parse_inserts(sql_text, table_name):
    """Return list of dicts for all rows in INSERT INTO `table_name` VALUES."""
    pattern = re.compile(
        r"INSERT INTO `" + re.escape(table_name) + r"`\s*\(([^)]+)\)\s*VALUES\s*([\s\S]+?)(?=;\s*(?:--|CREATE|INSERT|$))",
        re.IGNORECASE,
    )
    m = pattern.search(sql_text)
    if not m:
        return []

    cols = [c.strip().strip("`") for c in m.group(1).split(",")]
    rows_text = m.group(2)

    result = []
    for line in rows_text.splitlines():
        line = line.strip()
        if not line.startswith("("):
            continue
        inner = _extract_row_content(line)
        if inner is None:
            continue
        vals = _split_values(inner)
        if len(vals) == len(cols):
            result.append(dict(zip(cols, vals)))
    return result


class Command(BaseCommand):
    help = "Seed office hierarchy and designations from eduhrm_cpy.sql (idempotent)"

    def handle(self, *args, **options):
        sql_path = os.path.normpath(SQL_FILE)
        if not os.path.exists(sql_path):
            self.stderr.write(f"SQL file not found: {sql_path}")
            return

        with open(sql_path, encoding="utf-8", errors="replace") as f:
            sql = f.read()

        # 1. HeadOffice (id=1 — all circle offices reference this)
        ho, created = HeadOffice.objects.get_or_create(
            pk=1,
            defaults={
                "officename": "প্রধান কার্যালয়, শিক্ষা প্রকৌশল অধিদপ্তর",
                "address": "১৬ আব্দুল গনি রোড, শিক্ষা ভবন (২য় ব্লক), ঢাকা।",
            },
        )
        self.stdout.write(f"  HeadOffice: {'created' if created else 'exists'}")

        # 2. CircleOffice
        if not CircleOffice.objects.exists():
            rows = _parse_inserts(sql, "circleoffice")
            objs = [
                CircleOffice(
                    id=r["id"],
                    circleofficename=r["circleofficeName"],
                    officeaddress=r.get("officeaddress"),
                    headoffice_id=r.get("headoffice_id", 1),
                    slno=r.get("slno", 0),
                )
                for r in rows
            ]
            CircleOffice.objects.bulk_create(objs, ignore_conflicts=True)
            self.stdout.write(f"  CircleOffice: inserted {len(objs)}")
        else:
            self.stdout.write(f"  CircleOffice: already seeded ({CircleOffice.objects.count()})")

        # 3. DistrictOffice
        if not DistrictOffice.objects.exists():
            rows = _parse_inserts(sql, "districtoffice")
            circle_map = {c.id: c for c in CircleOffice.objects.all()}
            objs = [
                DistrictOffice(
                    id=r["id"],
                    circleoffice=circle_map.get(r["circleoffice_id"]),
                    districtofficename=r["districtofficeName"],
                    officeaddress=r.get("officeaddress"),
                    nomanp=r.get("nomanp", 0),
                    orderno=r.get("orderno", 0),
                )
                for r in rows
                if r.get("circleoffice_id") in circle_map
            ]
            DistrictOffice.objects.bulk_create(objs, ignore_conflicts=True)
            self.stdout.write(f"  DistrictOffice: inserted {len(objs)}")
        else:
            self.stdout.write(f"  DistrictOffice: already seeded ({DistrictOffice.objects.count()})")

        # 4. Office (upazila-level)
        if not Office.objects.exists():
            rows = _parse_inserts(sql, "office")
            district_map = {d.id: d for d in DistrictOffice.objects.all()}
            objs = [
                Office(
                    id=r["id"],
                    districtoffice=district_map.get(r["districtoffice_id"]),
                    officename=r.get("OfficeName"),
                    officeaddress=r.get("officeaddress"),
                    activity=r.get("activity", 0),
                    orderno=r.get("orderno", 0),
                )
                for r in rows
            ]
            Office.objects.bulk_create(objs, ignore_conflicts=True)
            self.stdout.write(f"  Office: inserted {len(objs)}")
        else:
            self.stdout.write(f"  Office: already seeded ({Office.objects.count()})")

        # 5. Designation
        if not Designation.objects.exists():
            rows = _parse_inserts(sql, "designation")
            objs = [
                Designation(
                    id=r["id"],
                    designationname=r["DesignationName"],
                    class_field=str(r.get("class", "0")),
                    grade_id=r.get("grade_id", 0),
                    nopost=r.get("NoPost", 0),
                    desigslno=r.get("desigslno", 0),
                    officerornot_id=r.get("officerornot_id", 0),
                )
                for r in rows
            ]
            Designation.objects.bulk_create(objs, ignore_conflicts=True)
            self.stdout.write(f"  Designation: inserted {len(objs)}")
        else:
            self.stdout.write(f"  Designation: already seeded ({Designation.objects.count()})")

        self.stdout.write(self.style.SUCCESS("\nOffice data seed complete."))
