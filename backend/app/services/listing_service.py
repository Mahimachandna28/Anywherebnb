import math
from datetime import date
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from app.models import Listing, Booking, Amenity

# Canonical Indian locality, landmark, and neighbourhood mappings to cities/states
LOCATION_ALIASES: dict[str, str] = {
    # Delhi & NCR
    "connaught place": "Delhi",
    "cp": "Delhi",
    "hauz khas": "Delhi",
    "lutyens": "Delhi",
    "new delhi": "Delhi",
    "delhi": "Delhi",
    "ncr": "Delhi",
    "noida": "Delhi",
    "gurgaon": "Delhi",
    "gurugram": "Delhi",
    "saket": "Delhi",
    "india gate": "Delhi",
    "prithviraj road": "Delhi",

    # Mumbai & MMR
    "bandra": "Mumbai",
    "bandra west": "Mumbai",
    "perry cross": "Mumbai",
    "juhu": "Mumbai",
    "colaba": "Mumbai",
    "andheri": "Mumbai",
    "marine drive": "Mumbai",
    "nariman point": "Mumbai",
    "mumbai": "Mumbai",
    "bombay": "Mumbai",
    "thane": "Mumbai",
    "navi mumbai": "Mumbai",

    # Goa
    "goa": "Goa",
    "candolim": "Goa",
    "calangute": "Goa",
    "baga": "Goa",
    "anjuna": "Goa",
    "vagator": "Goa",
    "panaji": "Goa",
    "panjim": "Goa",
    "north goa": "Goa",
    "south goa": "Goa",
    "siolim": "Goa",
    "aguada": "Goa",

    # Jaipur & Rajasthan
    "jaipur": "Jaipur",
    "amer": "Jaipur",
    "amber": "Jaipur",
    "hawa mahal": "Jaipur",
    "jal mahal": "Jaipur",
    "pink city": "Jaipur",
    "rajasthan": "Rajasthan",

    # Manali & Himachal Pradesh
    "manali": "Manali",
    "old manali": "Manali",
    "solang": "Manali",
    "solang valley": "Manali",
    "kullu": "Manali",
    "kasol": "Manali",
    "rohtang": "Manali",
    "himachal": "Himachal Pradesh",
    "himachal pradesh": "Himachal Pradesh",

    # Udaipur
    "udaipur": "Udaipur",
    "lake pichola": "Udaipur",
    "pichola": "Udaipur",
    "lal ghat": "Udaipur",
    "fateh sagar": "Udaipur",
    "city palace": "Udaipur",

    # Rishikesh & Uttarakhand
    "rishikesh": "Rishikesh",
    "tapovan": "Rishikesh",
    "laxman jhula": "Rishikesh",
    "ram jhula": "Rishikesh",
    "ganga": "Rishikesh",
    "haridwar": "Rishikesh",
    "uttarakhand": "Uttarakhand",

    # Varanasi & UP
    "varanasi": "Varanasi",
    "kashi": "Varanasi",
    "banaras": "Varanasi",
    "benares": "Varanasi",
    "assi ghat": "Varanasi",
    "dashashwamedh": "Varanasi",
    "uttar pradesh": "Uttar Pradesh",

    # Bengaluru & Karnataka
    "bengaluru": "Bengaluru",
    "bangalore": "Bengaluru",
    "indiranagar": "Bengaluru",
    "koramangala": "Bengaluru",
    "whitefield": "Bengaluru",
    "mg road": "Bengaluru",
    "karnataka": "Karnataka",

    # Alleppey & Kerala
    "alleppey": "Alleppey",
    "alappuzha": "Alleppey",
    "vembanad": "Alleppey",
    "punnamada": "Alleppey",
    "backwaters": "Alleppey",
    "kerala": "Kerala",
    "kochi": "Alleppey",
    "cochin": "Alleppey",

    # Munnar
    "munnar": "Munnar",
    "pothamedu": "Munnar",
    "idukki": "Munnar",

    # Ooty & Nilgiris
    "ooty": "Ooty",
    "nilgiri": "Ooty",
    "nilgiris": "Ooty",
    "fern hill": "Ooty",
    "coonoor": "Ooty",
    "tamil nadu": "Tamil Nadu",

    # Pune & Maharashtra
    "pune": "Pune",
    "lonavala": "Pune",
    "khandala": "Pune",
    "koregaon park": "Pune",
    "tungarli": "Pune",
    "sahyadri": "Pune",
    "mahabaleshwar": "Pune",

    # Kolkata & West Bengal
    "kolkata": "Kolkata",
    "calcutta": "Kolkata",
    "alipore": "Kolkata",
    "park street": "Kolkata",
    "west bengal": "West Bengal",

    # Chennai
    "chennai": "Chennai",
    "madras": "Chennai",
    "ecr": "Chennai",
    "east coast road": "Chennai",
    "uthandi": "Chennai",
    "besant nagar": "Chennai",

    # Hyderabad & Telangana
    "hyderabad": "Hyderabad",
    "jubilee hills": "Hyderabad",
    "banjara hills": "Hyderabad",
    "hitec city": "Hyderabad",
    "gachibowli": "Hyderabad",
    "telangana": "Telangana",
}

# Approximate coordinates for Indian cities to compute proximity fallbacks
CITY_COORDINATES: dict[str, tuple[float, float]] = {
    "delhi": (28.6139, 77.2090),
    "noida": (28.5355, 77.3910),
    "gurgaon": (28.4595, 77.0266),
    "agra": (27.1767, 78.0081),
    "jaipur": (26.9124, 75.7873),
    "chandigarh": (30.7333, 76.7794),
    "shimla": (31.1048, 77.1734),
    "manali": (32.2432, 77.1892),
    "dharamshala": (32.2190, 76.3234),
    "rishikesh": (30.1319, 78.3247),
    "dehradun": (30.3165, 78.0322),
    "haridwar": (29.9457, 78.1642),
    "udaipur": (24.5854, 73.6806),
    "jodhpur": (26.2389, 73.0243),
    "mumbai": (19.0760, 72.8777),
    "pune": (18.5204, 73.8567),
    "lonavala": (18.7557, 73.4091),
    "alibaug": (18.6584, 72.8773),
    "goa": (15.5188, 73.7663),
    "bengaluru": (12.9716, 77.5946),
    "mysore": (12.2958, 76.6394),
    "chennai": (13.0827, 80.2707),
    "pondicherry": (11.9416, 79.8083),
    "hyderabad": (17.3850, 78.4867),
    "kolkata": (22.5726, 88.3639),
    "varanasi": (25.3176, 82.9739),
    "lucknow": (26.8467, 80.9462),
    "alleppey": (9.4981, 76.3388),
    "munnar": (10.0889, 77.0595),
    "kochi": (9.9312, 76.2673),
    "ooty": (11.4102, 76.6950),
    "kodaikanal": (10.2381, 77.4892),
}

STOP_WORDS = {"india", "in", "the", "and", "near", "road", "state", "city", "west", "north", "south", "east", "valley"}

def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Computes great-circle distance between two geographic points in kilometers."""
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def search_listings(
    db: Session,
    destination: str | None = None,
    category: str | None = None,
    property_type: str | None = None,
    min_price: int | None = None,
    max_price: int | None = None,
    guests: int | None = None,
    bedrooms: int | None = None,
    bathrooms: float | None = None,
    amenity_ids: list[int] | None = None,
    check_in: date | None = None,
    check_out: date | None = None,
    skip: int = 0,
    limit: int = 50,
) -> tuple[list[Listing], int, bool, str | None, str | None]:
    """
    Builds a flexible SQLAlchemy query filtering listings by destination,
    category, price range, guest/bed counts, amenities, and date availability.
    Includes smart Indian locality alias expansion and geographical proximity fallback.
    Returns (listings, total_count, is_nearby, search_location, message).
    """
    base_query = db.query(Listing)

    # 1. Category filter
    if category and category.strip() and category.lower() != "all":
        base_query = base_query.filter(Listing.category.ilike(category.strip()))

    # 2. Property type filter
    if property_type and property_type.strip() and property_type.lower() != "any":
        base_query = base_query.filter(Listing.property_type.ilike(property_type.strip()))

    # 3. Price range
    if min_price is not None:
        base_query = base_query.filter(Listing.price_per_night >= min_price)
    if max_price is not None:
        base_query = base_query.filter(Listing.price_per_night <= max_price)

    # 4. Capacities
    if guests is not None and guests > 0:
        base_query = base_query.filter(Listing.max_guests >= guests)
    if bedrooms is not None and bedrooms > 0:
        base_query = base_query.filter(Listing.bedrooms >= bedrooms)
    if bathrooms is not None and bathrooms > 0:
        base_query = base_query.filter(Listing.bathrooms >= bathrooms)

    # 5. Specific Amenities filter
    if amenity_ids:
        for a_id in amenity_ids:
            base_query = base_query.filter(Listing.amenities.any(Amenity.id == a_id))

    # 6. Date availability filter
    if check_in and check_out and check_in < check_out:
        conflict_subquery = (
            db.query(Booking.listing_id)
            .filter(
                Booking.status == "confirmed",
                Booking.check_in_date < check_out,
                Booking.check_out_date > check_in,
            )
            .subquery()
        )
        base_query = base_query.filter(Listing.id.not_in(conflict_subquery))

    is_nearby = False
    search_location: str | None = None
    message: str | None = None

    # 7. Destination Search
    if destination and destination.strip():
        raw_dest = destination.strip()
        cleaned_dest = raw_dest.lower()

        # Check for direct alias or mapped city/region
        mapped_target = LOCATION_ALIASES.get(cleaned_dest)
        if not mapped_target:
            # Check if any key in LOCATION_ALIASES is a substring of cleaned_dest
            for alias_key, alias_city in LOCATION_ALIASES.items():
                if alias_key in cleaned_dest:
                    mapped_target = alias_city
                    break

        # Priority 1: Full phrase search + mapped alias match
        priority_conditions = []
        term = f"%{raw_dest}%"
        priority_conditions.append(Listing.city.ilike(term))
        priority_conditions.append(Listing.address.ilike(term))
        priority_conditions.append(Listing.title.ilike(term))
        priority_conditions.append(Listing.state.ilike(term))

        if mapped_target:
            target_term = f"%{mapped_target}%"
            priority_conditions.append(Listing.city.ilike(target_term))
            priority_conditions.append(Listing.state.ilike(target_term))
            priority_conditions.append(Listing.address.ilike(target_term))

        dest_query = base_query.filter(or_(*priority_conditions))
        total_count = dest_query.count()

        if total_count > 0:
            listings = dest_query.order_by(Listing.rating.desc(), Listing.id.asc()).offset(skip).limit(limit).all()
            return listings, total_count, False, None, None

        # Priority 2: Distinctive token matching (e.g. for composite queries like "Goa, India")
        tokens = [t.strip() for t in raw_dest.replace(",", " ").split() if t.strip() and t.lower() not in STOP_WORDS]
        if tokens:
            token_conditions = []
            for token in tokens:
                if len(token) >= 3:
                    tok_term = f"%{token}%"
                    token_conditions.append(
                        or_(
                            Listing.city.ilike(tok_term),
                            Listing.state.ilike(tok_term),
                            Listing.address.ilike(tok_term),
                            Listing.title.ilike(tok_term),
                        )
                    )
            if token_conditions:
                # Require all tokens to match
                dest_query2 = base_query.filter(and_(*token_conditions))
                total_count2 = dest_query2.count()
                if total_count2 > 0:
                    listings = dest_query2.order_by(Listing.rating.desc(), Listing.id.asc()).offset(skip).limit(limit).all()
                    return listings, total_count2, False, None, None

        # Priority 3: Proximity Fallback (when exact & token searches yield 0 results)
        target_coords: tuple[float, float] | None = None
        for city_key, coords in CITY_COORDINATES.items():
            if city_key in cleaned_dest or (mapped_target and city_key == mapped_target.lower()):
                target_coords = coords
                break

        all_candidate_listings = base_query.all()
        if all_candidate_listings:
            if target_coords:
                t_lat, t_lon = target_coords
                sorted_by_dist = sorted(
                    all_candidate_listings,
                    key=lambda l: haversine_km(t_lat, t_lon, l.latitude or 0, l.longitude or 0)
                )
                nearby_list = sorted_by_dist[:limit]
                is_nearby = True
                search_location = raw_dest
                message = f"Showing stays near {raw_dest}"
                return nearby_list, len(nearby_list), is_nearby, search_location, message
            else:
                is_nearby = True
                search_location = raw_dest
                message = f"No exact stays in '{raw_dest}'. Showing popular stays across India"
                fallback_list = all_candidate_listings[:limit]
                return fallback_list, len(fallback_list), is_nearby, search_location, message

    # No destination filter applied
    total_count = base_query.count()
    listings = base_query.order_by(Listing.rating.desc(), Listing.id.asc()).offset(skip).limit(limit).all()
    return listings, total_count, False, None, None
