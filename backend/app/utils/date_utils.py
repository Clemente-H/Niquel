from datetime import date, datetime, time, timedelta
from typing import Optional, Tuple


def get_date_range(year: int, month: Optional[int] = None) -> Tuple[date, date]:
    """
    Get the start and end date for a year or month.

    Args:
        year: The year
        month: Optional month (1-12)

    Returns:
        Tuple[date, date]: Start and end date of the period
    """
    if month:
        # Calculate start and end date for a specific month
        start_date = date(year, month, 1)

        # For end date, get first day of next month and subtract one day
        if month == 12:
            end_date = date(year + 1, 1, 1) - timedelta(days=1)
        else:
            end_date = date(year, month + 1, 1) - timedelta(days=1)
    else:
        # Calculate start and end date for a year
        start_date = date(year, 1, 1)
        end_date = date(year, 12, 31)

    return start_date, end_date


def get_current_period() -> Tuple[date, date]:
    """
    Get the start and end date for the current month.

    Returns:
        Tuple[date, date]: Start and end date of the current month
    """
    today = date.today()
    return get_date_range(today.year, today.month)


def format_date(date_obj: date) -> str:
    """
    Format a date object as an ISO string (YYYY-MM-DD).

    Args:
        date_obj: The date to format

    Returns:
        str: Formatted date string
    """
    return date_obj.isoformat()


def format_time(time_obj: time) -> str:
    """
    Format a time object as an ISO string (HH:MM:SS).

    Args:
        time_obj: The time to format

    Returns:
        str: Formatted time string
    """
    return time_obj.isoformat()


def format_datetime(dt: datetime) -> str:
    """
    Format a datetime object as an ISO string.

    Args:
        dt: The datetime to format

    Returns:
        str: Formatted datetime string
    """
    return dt.isoformat()


def parse_date(date_str: str) -> date:
    """
    Parse a date string in ISO format (YYYY-MM-DD).

    Args:
        date_str: The date string to parse

    Returns:
        date: Parsed date object
    """
    return date.fromisoformat(date_str)


def parse_time(time_str: str) -> time:
    """
    Parse a time string in ISO format (HH:MM:SS).

    Args:
        time_str: The time string to parse

    Returns:
        time: Parsed time object
    """
    return time.fromisoformat(time_str)


def date_range_to_period_name(start_date: date, end_date: date) -> str:
    """
    Generate a period name from a date range.

    Args:
        start_date: Start date
        end_date: End date

    Returns:
        str: Period name
    """
    # If same month and year
    if start_date.year == end_date.year and start_date.month == end_date.month:
        return f"{start_date.strftime('%B %Y')}"

    # If same year but different months
    if start_date.year == end_date.year:
        return f"{start_date.strftime('%B')} - {end_date.strftime('%B %Y')}"

    # Different years
    return f"{start_date.strftime('%B %Y')} - {end_date.strftime('%B %Y')}"
