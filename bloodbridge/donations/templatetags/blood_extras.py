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
    
@register.filter
def format_time_left(days_left):
    if days_left is None:
        return ""

    message = ""

    if days_left >= 30:
        months = days_left // 30

        message = f"{months} month" if months == 1 else f"{months} months"
    elif days_left >= 7:
        weeks = days_left // 7
        
        message = f"{weeks} week" if weeks == 1 else f"{weeks} weeks"
    else:
        message = f"{days_left} day" if days_left == 1 else f"{days_left} days"

    return message + " from now"