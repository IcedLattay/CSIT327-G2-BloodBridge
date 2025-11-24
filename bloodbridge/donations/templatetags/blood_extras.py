from django import template

register = template.Library()

@register.filter
def humanize_units(value):
    try:
        value = int(value)
    except (ValueError, TypeError):
        return value

    if value >= 1_000_000:
        return f"{value // 1_000_000}M"
    elif value >= 1_000:
        return f"{value // 1_000}k"
    else:
        return str(value)
