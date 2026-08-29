def _auto_invoiceno(model_class, prefix):
    from datetime import date as _date
    today = _date.today()
    full_prefix = f"{prefix}-{today.strftime('%Y%m%d')}-"
    last = (
        model_class.objects.filter(invoiceno__startswith=full_prefix)
        .order_by("-invoiceno").first()
    )
    seq = 1
    if last:
        try:
            seq = int(last.invoiceno.split("-")[-1]) + 1
        except ValueError:
            seq = 1
    return f"{full_prefix}{seq:03d}"
