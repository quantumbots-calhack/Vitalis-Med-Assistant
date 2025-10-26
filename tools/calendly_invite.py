"""
Calendly availability tool that fetches available time slots from a doctor's Calendly.
Returns time options that can be presented to patients for booking.
"""
import os
import json
import requests
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Optional
from dotenv import load_dotenv
from smolagents import tool
import chromadb

# Load environment variables
load_dotenv()


def get_calendly_event_type_uri(calendly_api_token: str, event_slug: str) -> Optional[str]:
    """
    Get the full event type URI from Calendly.
    
    Args:
        calendly_api_token: Calendly API token
        event_slug: The event type slug (e.g., "30min", "consultation")
    
    Returns:
        The event type URI or None if not found
    """
    try:
        # Get current user info to get the organization URI
        headers = {
            'Authorization': f'Bearer {calendly_api_token}',
            'Content-Type': 'application/json'
        }
        
        user_response = requests.get(
            'https://api.calendly.com/users/me',
            headers=headers
        )
        user_response.raise_for_status()
        user_data = user_response.json()
        user_uri = user_data['resource']['uri']
        
        # Get event types for this user
        event_types_response = requests.get(
            'https://api.calendly.com/event_types',
            headers=headers,
            params={'user': user_uri}
        )
        event_types_response.raise_for_status()
        event_types = event_types_response.json()
        
        # Find the matching event type
        for event_type in event_types['collection']:
            if event_slug in event_type['slug']:
                return event_type['uri']
        
        return None
        
    except Exception as e:
        print(f"Error getting event type URI: {e}")
        return None


@tool
def get_available_times(
    event_type_slug: str,
    days_ahead: int = 7,
    calendly_api_token: Optional[str] = None,
) -> str:
    """
    Fetch available time slots from a Calendly event type.
    
    Args:
        event_type_slug: The Calendly event type slug (e.g., "30min", "consultation")
        days_ahead: Number of days ahead to check for availability (default: 7)
        calendly_api_token: Calendly API token (if None, reads from env)
    
    Returns:
        A formatted, human-readable string suitable for direct output by the agent.

    Example:
        >>> text = get_available_times("30min", days_ahead=7)
        >>> print(text)
        Available appointments for 30min
        Date range: 2025-10-25 to 2025-11-01
        Total available slots: 10

        Saturday, 2025-10-25:
          • 09:00 AM
          • 10:00 AM
    """
    try:
        # Get API token from environment if not provided
        if not calendly_api_token:
            calendly_api_token = os.getenv('CALENDLY_API_TOKEN')
        
        if not calendly_api_token:
            error_result = {
                'status': 'error',
                'error': 'Missing Calendly API token',
                'message': 'Please set CALENDLY_API_TOKEN in .env file'
            }
            return format_available_times(error_result)
        
        # Set up headers
        headers = {
            'Authorization': f'Bearer {calendly_api_token}',
            'Content-Type': 'application/json'
        }
        
        # Get the event type URI
        event_type_uri = get_calendly_event_type_uri(calendly_api_token, event_type_slug)
        
        if not event_type_uri:
            error_result = {
                'status': 'error',
                'error': 'Event type not found',
                'message': f'Could not find event type with slug: {event_type_slug}'
            }
            return format_available_times(error_result)
        
        # Calculate date range - add buffer to ensure it's in the future
        # Calendly requires start_time to be in the future with some buffer
        start_time = datetime.now(timezone.utc) + timedelta(minutes=5)
        end_time = start_time + timedelta(days=days_ahead)
        
        # Format for API (ISO 8601 format)
        start_time_str = start_time.strftime('%Y-%m-%dT%H:%M:%S.000Z')
        end_time_str = end_time.strftime('%Y-%m-%dT%H:%M:%S.000Z')
        
        # Fetch available times from Calendly API
        response = requests.get(
            'https://api.calendly.com/event_type_available_times',
            headers=headers,
            params={
                'event_type': event_type_uri,
                'start_time': start_time_str,
                'end_time': end_time_str
            }
        )
        response.raise_for_status()
        data = response.json()
        
        # Organize available times by date
        available_slots = {}
        
        for slot in data.get('collection', []):
            start_time_obj = datetime.fromisoformat(slot['start_time'].replace('Z', '+00:00'))
            date_key = start_time_obj.strftime('%Y-%m-%d')
            day_of_week = start_time_obj.strftime('%A')
            time_str = start_time_obj.strftime('%I:%M %p')
            
            if date_key not in available_slots:
                available_slots[date_key] = {
                    'date': date_key,
                    'day_of_week': day_of_week,
                    'times': []
                }
            
            # Get the scheduling URL (construct from event type URI and time)
            booking_url = slot.get('scheduling_url', f"https://calendly.com/book/{event_type_slug}")
            
            available_slots[date_key]['times'].append({
                'time': time_str,
                'start_time': slot['start_time'],
                'booking_url': booking_url
            })
        
        # Convert to list and sort by date
        slots_list = sorted(available_slots.values(), key=lambda x: x['date'])
        
        # Calculate total slots
        total_slots = sum(len(day['times']) for day in slots_list)
        
        availability_result = {
            'status': 'success',
            'event_type': event_type_slug,
            'date_range': {
                'start': start_time.strftime('%Y-%m-%d'),
                'end': end_time.strftime('%Y-%m-%d')
            },
            'available_slots': slots_list,
            'total_slots': total_slots
        }
        return format_available_times(availability_result)

    except requests.exceptions.HTTPError as e:
        error_result = {
            'status': 'error',
            'error': f'HTTP Error: {e.response.status_code}',
            'message': f'Failed to fetch availability: {e.response.text}'
        }
        return format_available_times(error_result)
    except Exception as e:
        error_result = {
            'status': 'error',
            'error': str(e),
            'message': f'Failed to fetch availability: {str(e)}'
        }
        return format_available_times(error_result)


def format_booking_result(booking_data: Dict) -> str:
    """
    Format the booking result into a readable string.
    
    Args:
        booking_data: The result from book_appointment()
    
    Returns:
        Formatted string of booking information
    """
    if booking_data.get('status') != 'success':
        msg = booking_data.get('message') or booking_data.get('error') or 'Unknown error'
        return f"Error: {msg}"
    
    # Format success message without emojis, nicely spaced
    lines = []
    lines.append("Your appointment booking link has been generated!\n")
    lines.append(f"Patient: {booking_data.get('invitee_name')}")
    lines.append(f"Email: {booking_data.get('invitee_email')}")
    lines.append(f"Time: {booking_data.get('start_time')}\n")
    lines.append(f"Booking URL:")
    lines.append(f"{booking_data.get('booking_url')}")
    
    return '\n'.join(lines)


def format_available_times(availability_data: Dict) -> str:
    """
    Format the availability data into a readable string.
    
    Args:
        availability_data: The result from get_available_times()
    
    Returns:
        Formatted string of available times
    """
    if availability_data.get('status') != 'success':
        # Keep error message short and human-readable
        msg = availability_data.get('message') or availability_data.get('error') or 'Unknown error'
        return f"Error: {msg}"

    # Header
    lines = []
    lines.append(f"Available appointments for {availability_data.get('event_type')}")
    lines.append(f"Date range: {availability_data['date_range'].get('start')} to {availability_data['date_range'].get('end')}")
    lines.append(f"Total available slots: {availability_data.get('total_slots')}\n")

    if availability_data.get('total_slots', 0) == 0:
        lines.append("No available time slots found in this date range.")
        return '\n'.join(lines)

    # For each day, compress the list of times into a single-line summary
    for day in availability_data.get('available_slots', []):
        date = day.get('date')
        dow = day.get('day_of_week')
        times = [t.get('time') for t in day.get('times', []) if t.get('time')]

        if not times:
            continue

        # Parse times (e.g., '09:00 AM') to determine range
        # times are already formatted strings; assume they sort lexicographically by 12-hour time when padded
        # We'll take first and last after sorting by a 24-hour key
        def to_24hour(tstr):
            try:
                return datetime.strptime(tstr, '%I:%M %p')
            except Exception:
                return datetime.min

        sorted_times = sorted(times, key=to_24hour)
        first = sorted_times[0]
        last = sorted_times[-1]
        count = len(sorted_times)

        if count == 1:
            summary = f"{dow}, {date}: {first}"
        else:
            summary = f"{dow}, {date}: {first} - {last} ({count} slots)"

        lines.append(summary)

    return '\n'.join(lines)


def book_appointment(
    event_uri: str,
    start_time: str,
    patient_name: str,
    patient_email: str,
    additional_notes: Optional[str] = None,
    calendly_api_token: Optional[str] = None
) -> Dict:
    """
    Generate a pre-filled booking URL for a specific time slot.
    
    NOTE: Calendly API doesn't support direct booking via API for security reasons.
    Instead, this generates a URL that pre-fills the booking form with patient info.
    The patient (or your system) needs to visit this URL to complete the booking.
    
    Args:
        event_uri: The event type URI (get from get_calendly_event_type_uri)
        start_time: ISO 8601 formatted start time (e.g., '2025-10-25T09:00:00Z')
        patient_name: Full name of the patient booking the appointment
        patient_email: Email address of the patient
        additional_notes: Optional notes or reason for visit
        calendly_api_token: Calendly API token (if None, reads from env)
    
    Returns:
        Dictionary with pre-filled booking URL
    
    Example:
        >>> result = book_appointment(
        ...     event_uri="https://api.calendly.com/event_types/XXXXXXXX",
        ...     start_time="2025-10-25T09:00:00Z",
        ...     patient_name="John Doe",
        ...     patient_email="john@example.com",
        ...     additional_notes="Annual checkup"
        ... )
    """
    try:
        import urllib.parse
        
        # Extract event type ID from URI
        # URI format: https://api.calendly.com/event_types/XXXXXXXX
        event_type_id = event_uri.split('/')[-1]
        
        # Get API token to fetch event details
        if not calendly_api_token:
            calendly_api_token = os.getenv('CALENDLY_API_TOKEN')
        
        if not calendly_api_token:
            return {
                'status': 'error',
                'error': 'Missing Calendly API token',
                'message': 'Please set CALENDLY_API_TOKEN in .env file'
            }
        
        # Set up headers
        headers = {
            'Authorization': f'Bearer {calendly_api_token}',
            'Content-Type': 'application/json'
        }
        
        # Get event type details to build the booking URL
        response = requests.get(
            f'https://api.calendly.com/event_types/{event_type_id}',
            headers=headers
        )
        response.raise_for_status()
        event_data = response.json()
        
        # Extract the scheduling URL
        scheduling_url = event_data['resource'].get('scheduling_url')
        
        if not scheduling_url:
            return {
                'status': 'error',
                'error': 'No scheduling URL found',
                'message': 'Could not find scheduling URL for this event type'
            }
        
        # Build pre-filled URL with query parameters
        params = {
            'name': patient_name,
            'email': patient_email,
            'a1': start_time  # Pre-select the time slot
        }
        
        if additional_notes:
            params['notes'] = additional_notes
        
        # Encode parameters
        query_string = urllib.parse.urlencode(params)
        booking_url = f"{scheduling_url}?{query_string}"
        
        return {
            'status': 'success',
            'booking_url': booking_url,
            'scheduling_url': scheduling_url,
            'start_time': start_time,
            'invitee_name': patient_name,
            'invitee_email': patient_email,
            'message': f'Booking URL generated for {patient_name}. Patient needs to visit this URL to complete booking.',
            'instructions': 'Send this URL to the patient or redirect them to complete the booking.'
        }
        
    except requests.exceptions.HTTPError as e:
        error_detail = e.response.text if hasattr(e.response, 'text') else str(e)
        return {
            'status': 'error',
            'error': f'HTTP Error: {e.response.status_code}',
            'message': f'Failed to generate booking URL: {error_detail}'
        }
    except Exception as e:
        return {
            'status': 'error',
            'error': str(e),
            'message': f'Failed to generate booking URL: {str(e)}'
        }


@tool
def book_appointment_simplified(
    event_type_slug: str,
    date: str,
    time: str,
    patient_id: str,
    additional_notes: Optional[str] = None,
    calendly_api_token: Optional[str] = None
) -> str:
    """
    Simplified booking function - book by event slug, date, and time.
    Automatically retrieves patient name and email from stored profile.
    This is a wrapper around book_appointment that handles the complexity.
    
    Args:
        event_type_slug: The Calendly event type slug (e.g., "30min")
        date: Date in YYYY-MM-DD format (e.g., "2025-10-25")
        time: Time in HH:MM format, 24-hour (e.g., "09:00" for 9 AM)
        patient_id: Unique patient identifier to retrieve name and email from profile
        additional_notes: Optional notes or reason for visit
        calendly_api_token: Calendly API token (if None, reads from env)
    
    Returns:
        A formatted, human-readable string suitable for direct output by the agent.
    
    Example:
        >>> result = book_appointment_simplified(
        ...     event_type_slug="30min",
        ...     date="2025-10-25",
        ...     time="09:00",
        ...     patient_id="patient_12345",
        ...     additional_notes="Annual checkup"
        ... )
    """
    try:
        # First, retrieve patient profile to get name and email
        try:
            chroma_client = chromadb.CloudClient(
                tenant=os.getenv("CHROMA_TENANT"),
                database=os.getenv("CHROMA_DATABASE"),
                api_key=os.getenv("CHROMA_API_KEY")
            )
            health_collection = chroma_client.get_or_create_collection("health_history")
            profile_id = f"{patient_id}_profile"
            results = health_collection.get(ids=[profile_id], where={"type": "patient_profile"})
            
            if not results['documents'] or len(results['documents']) == 0:
                return "Error: Unable to retrieve your profile information. Please ensure you have completed the onboarding process by filling out your basic and medical information first."
            
            profile_data = json.loads(results['documents'][0])
            patient_name = profile_data.get('full_name')
            patient_email = profile_data.get('email')
            
            if not patient_name or not patient_email:
                return "Error: Your profile is missing required information (name or email). Please update your profile in the onboarding section."
                
        except Exception as e:
            return f"Error: Failed to retrieve patient profile - {str(e)}"
        
        # Get API token
        if not calendly_api_token:
            calendly_api_token = os.getenv('CALENDLY_API_TOKEN')
        
        if not calendly_api_token:
            return "Error: Missing Calendly API token. Please set CALENDLY_API_TOKEN in .env file"
        
        # Get the event type URI
        event_uri = get_calendly_event_type_uri(calendly_api_token, event_type_slug)
        
        if not event_uri:
            return f"Error: Could not find event type with slug: {event_type_slug}"
        
        # Construct ISO 8601 timestamp
        start_time_str = f"{date}T{time}:00Z"
        
        # Book the appointment
        result = book_appointment(
            event_uri=event_uri,
            start_time=start_time_str,
            patient_name=patient_name,
            patient_email=patient_email,
            additional_notes=additional_notes,
            calendly_api_token=calendly_api_token
        )
        
        # Format the result as a readable string
        return format_booking_result(result)
        
    except Exception as e:
        return f"Error: Failed to book appointment - {str(e)}"


# Example usage (for testing)
if __name__ == "__main__":
    # Fetch available times for a 30-minute consultation
    print("Fetching available times from Calendly...\n")
    
    availability = get_available_times(
        event_type_slug="30min",
        days_ahead=7
    )

    # Display formatted results. get_available_times() returns a human-readable string.
    print(availability)
