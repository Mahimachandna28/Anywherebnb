"""
Anywherebnb Database Seeding Script - Indianised Data and Realistic INR Pricing
Populates the SQLite database with rich, authentic Indian listings, users, amenities, reviews, and bookings.
"""
import sys
from datetime import date, datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.core.database import engine, Base, SessionLocal
from app.models import User, Listing, ListingImage, Amenity, Booking, Review, Wishlist

def seed_database():
    print("Creating all database tables...")
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()

    try:
        # Check if already seeded to allow re-seeding cleanly
        print("Clearing existing data...")
        db.query(Wishlist).delete()
        db.query(Review).delete()
        db.query(Booking).delete()
        db.query(ListingImage).delete()
        # Clear many-to-many associations
        db.execute(Base.metadata.tables["listing_amenities"].delete())
        db.query(Listing).delete()
        db.query(Amenity).delete()
        db.query(User).delete()
        db.commit()

        print("Seeding Users...")
        # 1. Authentic Indian Users (Hosts and Guests)
        priya = User(
            name="Priya Sharma",
            email="priya.sharma@example.com",
            avatar_url="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
            is_superhost=True,
            role="both",
            joined_date=datetime(2021, 4, 12, tzinfo=timezone.utc),
        )
        rohan = User(
            name="Rohan Mehta",
            email="rohan.mehta@example.com",
            avatar_url="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
            is_superhost=True,
            role="host",
            joined_date=datetime(2020, 8, 24, tzinfo=timezone.utc),
        )
        aarav = User(
            name="Aarav Patel",
            email="aarav.patel@example.com",
            avatar_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
            is_superhost=False,
            role="guest",
            joined_date=datetime(2022, 2, 10, tzinfo=timezone.utc),
        )
        ananya = User(
            name="Ananya Iyer",
            email="ananya.iyer@example.com",
            avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
            is_superhost=False,
            role="guest",
            joined_date=datetime(2023, 6, 18, tzinfo=timezone.utc),
        )

        db.add_all([priya, rohan, aarav, ananya])
        db.commit()

        print("Seeding Amenities...")
        # 2. Standard Amenities with Lucide icon keys
        amenities_data = [
            # Essentials
            ("Fast Wifi", "Wifi", "Essentials"),
            ("Fully equipped kitchen", "Utensils", "Essentials"),
            ("Dedicated workspace", "Briefcase", "Essentials"),
            ("Washer & dryer", "Shirt", "Essentials"),
            ("Air conditioning", "Wind", "Essentials"),
            ("Heating", "Flame", "Essentials"),
            ("55\" 4K TV with Netflix", "Tv", "Essentials"),
            # Features
            ("Private infinity pool", "Waves", "Features"),
            ("Heated hot tub", "Sparkles", "Features"),
            ("Free parking on premises", "Car", "Features"),
            ("EV charger", "Zap", "Features"),
            ("Outdoor BBQ grill", "Flame", "Features"),
            ("Patio or balcony", "Sun", "Features"),
            ("Waterfront access", "Anchor", "Features"),
            ("Fire pit", "Flame", "Features"),
            ("Ski-in / ski-out access", "Snowflake", "Features"),
            ("Private gym", "Dumbbell", "Features"),
            # Safety
            ("Smoke alarm", "Bell", "Safety"),
            ("Carbon monoxide alarm", "ShieldCheck", "Safety"),
            ("First aid kit", "HeartPulse", "Safety"),
        ]

        amenities_map = {}
        for name, icon, cat in amenities_data:
            amenity = Amenity(name=name, icon=icon, category=cat)
            db.add(amenity)
            amenities_map[name] = amenity
        db.commit()

        print("Seeding 16 Curated Indian Listings...")
        # 3. Authentic Indian Listings
        listings_data = [
            # 1. Goa - Candolim Beachfront
            {
                "host": rohan,
                "title": "Villa Candolim - Luxury Portuguese Coastal Estate",
                "description": "Perched steps from the golden sands of Candolim, this restored Portuguese heritage villa blends antique colonial architecture with contemporary luxury. Features an azure private pool, lush tropical gardens, sun decks, and an open-air veranda ideal for evening sea breezes.",
                "property_type": "Villa",
                "category": "Beachfront",
                "room_type": "Entire place",
                "address": "Plot 42, Aguada Siolim Road, Candolim",
                "city": "Goa",
                "state": "Goa",
                "country": "India",
                "latitude": 15.5188,
                "longitude": 73.7663,
                "price_per_night": 14500,
                "cleaning_fee": 2200,
                "service_fee_rate": 0.14,
                "max_guests": 8,
                "bedrooms": 4,
                "beds": 5,
                "bathrooms": 4.0,
                "rating": 4.97,
                "review_count": 52,
                "amenities": ["Fast Wifi", "Private infinity pool", "Free parking on premises", "Air conditioning", "Patio or balcony", "Waterfront access", "Outdoor BBQ grill"],
                "images": [
                    ("https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80", "Grand villa exterior and private pool", True),
                    ("https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80", "Sunset view over palm garden", False),
                    ("https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80", "Spacious open living lounge", False),
                    ("https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80", "Modern chef kitchen and dining", False),
                    ("https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80", "Master bedroom overlooking pool", False),
                ],
            },
            # 2. Jaipur - Amber Heritage Haveli
            {
                "host": priya,
                "title": "Haveli Amber - Royal Heritage Palace Suite",
                "description": "Immerse yourself in royal Rajasthani grandeur in this meticulously preserved 150-year-old heritage haveli. Features carved sandstone arches, traditional jharokha balconies overlooking the Aravali hills, marble courtyards, and handcrafted Shekhawati frescoes.",
                "property_type": "House",
                "category": "Trending",
                "room_type": "Entire place",
                "address": "12 Amer Road, Near Jal Mahal",
                "city": "Jaipur",
                "state": "Rajasthan",
                "country": "India",
                "latitude": 26.9664,
                "longitude": 75.8507,
                "price_per_night": 8800,
                "cleaning_fee": 1500,
                "service_fee_rate": 0.14,
                "max_guests": 5,
                "bedrooms": 2,
                "beds": 3,
                "bathrooms": 2.0,
                "rating": 4.98,
                "review_count": 68,
                "amenities": ["Fast Wifi", "Dedicated workspace", "Air conditioning", "Patio or balcony", "Free parking on premises", "Smoke alarm"],
                "images": [
                    ("https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=1200&q=80", "Carved sandstone haveli courtyard", True),
                    ("https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80", "Royal suite bedroom with Rajasthani textiles", False),
                    ("https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80", "Traditional tea lounge in courtyard", False),
                    ("https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80", "Interior garden and fountain", False),
                    ("https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80", "Marble en-suite bathroom", False),
                ],
            },
            # 3. Manali - Solang Pine Chalet
            {
                "host": rohan,
                "title": "Solang Pine Chalet - Himalayan Cedar Mountain Retreat",
                "description": "Surrounded by snow-capped peaks and towering deodar forests, this handcrafted cedar timber chalet offers ski-in/ski-out access in the Solang Valley. Features a stone fireplace, heated mountain-view hot tub, private apple orchard, and warm Himalayan pine interiors.",
                "property_type": "Cabin",
                "category": "Skiing",
                "room_type": "Entire place",
                "address": "Solang Valley Road, Old Manali",
                "city": "Manali",
                "state": "Himachal Pradesh",
                "country": "India",
                "latitude": 32.3160,
                "longitude": 77.1575,
                "price_per_night": 9500,
                "cleaning_fee": 1400,
                "service_fee_rate": 0.14,
                "max_guests": 6,
                "bedrooms": 3,
                "beds": 4,
                "bathrooms": 3.0,
                "rating": 4.96,
                "review_count": 42,
                "amenities": ["Fast Wifi", "Ski-in / ski-out access", "Heated hot tub", "Fire pit", "Free parking on premises", "Heating", "55\" 4K TV with Netflix"],
                "images": [
                    ("https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80", "Snow-covered wooden chalet at dusk", True),
                    ("https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=800&q=80", "Cozy living room with stone fireplace", False),
                    ("https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80", "Heated hot tub overlooking snow peaks", False),
                    ("https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80", "Warm timber bedroom with mountain vista", False),
                    ("https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=800&q=80", "Outdoor fire pit overlooking valley", False),
                ],
            },
            # 4. Udaipur - Lake Pichola Haveli
            {
                "host": priya,
                "title": "Pichola Waters - Lakefront Heritage Haveli & Infinity Pool",
                "description": "Directly flanking the tranquil waters of Lake Pichola, this majestic villa offers unobstructed views of the City Palace and Jag Mandir. Features an infinity pool right at the water's edge, candlelit jharokha dinners, and royal Rajasthani craftsmanship throughout.",
                "property_type": "Villa",
                "category": "Lakefront",
                "room_type": "Entire place",
                "address": "24 Lal Ghat, Lake Pichola",
                "city": "Udaipur",
                "state": "Rajasthan",
                "country": "India",
                "latitude": 24.5764,
                "longitude": 73.6835,
                "price_per_night": 16500,
                "cleaning_fee": 2500,
                "service_fee_rate": 0.14,
                "max_guests": 6,
                "bedrooms": 3,
                "beds": 3,
                "bathrooms": 3.5,
                "rating": 4.99,
                "review_count": 55,
                "amenities": ["Fast Wifi", "Private infinity pool", "Waterfront access", "Air conditioning", "Patio or balcony", "Free parking on premises", "Dedicated workspace"],
                "images": [
                    ("https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80", "Lakefront infinity pool facing City Palace", True),
                    ("https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80", "Palatial master bedroom with lake views", False),
                    ("https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80", "Rooftop terrace overlooking Lake Pichola", False),
                    ("https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80", "Heritage living hall with marble arches", False),
                    ("https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80", "Intricate sunset balcony over water", False),
                ],
            },
            # 5. Munnar / Kerala - Tea Plantation Estate
            {
                "host": rohan,
                "title": "Mist Valley - Eco Tea Plantation Bungalow",
                "description": "Nestled amid 50 acres of rolling emerald tea gardens in the misty Western Ghats. Wake up to swirling morning clouds, birdsong, and fresh Nilgiri tea. Features timber verandas, fireplace, organic orchard dining, and guided plantation walking trails.",
                "property_type": "Cottage",
                "category": "Tropical",
                "room_type": "Entire place",
                "address": "Tea Estate Road, Pothamedu",
                "city": "Munnar",
                "state": "Kerala",
                "country": "India",
                "latitude": 10.0889,
                "longitude": 77.0595,
                "price_per_night": 7200,
                "cleaning_fee": 1100,
                "service_fee_rate": 0.14,
                "max_guests": 5,
                "bedrooms": 2,
                "beds": 3,
                "bathrooms": 2.0,
                "rating": 4.95,
                "review_count": 46,
                "amenities": ["Fast Wifi", "Fire pit", "Patio or balcony", "Free parking on premises", "Fully equipped kitchen", "Smoke alarm"],
                "images": [
                    ("https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80", "Misty green tea valley estate view", True),
                    ("https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=800&q=80", "Colonial plantation living room with fireplace", False),
                    ("https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80", "Bungalow bedroom overlooking tea gardens", False),
                    ("https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80", "Morning tea veranda facing sunrise", False),
                    ("https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80", "Spacious en-suite bathroom", False),
                ],
            },
            # 6. Mumbai - Bandra Seaside Penthouse
            {
                "host": priya,
                "title": "Bandra Seaside Loft - Art Deco Terrace Penthouse",
                "description": "High above Mumbai's most vibrant coastal neighborhood, this sun-drenched Bandra West duplex offers panoramic views of the Arabian Sea. Steps away from artisan cafes and Pali Hill. Features floor-to-ceiling glass, private rooftop terrace, and curated contemporary Indian art.",
                "property_type": "Loft",
                "category": "Mansions",
                "room_type": "Entire place",
                "address": "Perry Cross Road, Bandra West",
                "city": "Mumbai",
                "state": "Maharashtra",
                "country": "India",
                "latitude": 19.0596,
                "longitude": 72.8295,
                "price_per_night": 12500,
                "cleaning_fee": 1800,
                "service_fee_rate": 0.14,
                "max_guests": 4,
                "bedrooms": 2,
                "beds": 2,
                "bathrooms": 2.5,
                "rating": 4.94,
                "review_count": 58,
                "amenities": ["Fast Wifi", "Dedicated workspace", "Air conditioning", "55\" 4K TV with Netflix", "Patio or balcony", "Free parking on premises", "EV charger"],
                "images": [
                    ("https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80", "Designer sea-facing penthouse lounge", True),
                    ("https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80", "Private rooftop deck at twilight", False),
                    ("https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80", "Modern minimalist master bedroom", False),
                    ("https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80", "Italian marble kitchen island", False),
                    ("https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80", "Arabian sea sunset from balcony", False),
                ],
            },
            # 7. Delhi - Lutyens Heritage Residence
            {
                "host": rohan,
                "title": "Lutyens Heritage Residence - Mughal Gardens & Terrace",
                "description": "An aristocratic sanctuary in the prestigious heart of New Delhi. Sprawling lawns shaded by mature neem and amaltas trees, high colonial ceilings, handcrafted teak furniture, private library, and peaceful shaded verandahs just minutes from India Gate.",
                "property_type": "Townhouse",
                "category": "Mansions",
                "room_type": "Entire place",
                "address": "Prithviraj Road, Lutyens Bungalow Zone",
                "city": "Delhi",
                "state": "Delhi",
                "country": "India",
                "latitude": 28.5983,
                "longitude": 77.2185,
                "price_per_night": 13800,
                "cleaning_fee": 2000,
                "service_fee_rate": 0.14,
                "max_guests": 6,
                "bedrooms": 3,
                "beds": 3,
                "bathrooms": 3.0,
                "rating": 4.97,
                "review_count": 39,
                "amenities": ["Fast Wifi", "Air conditioning", "Heating", "Dedicated workspace", "Free parking on premises", "Patio or balcony", "Smoke alarm"],
                "images": [
                    ("https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80", "Grand colonial bungalow facade and lawn", True),
                    ("https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80", "Stately drawing room with library", False),
                    ("https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80", "Classic four-poster bed suite", False),
                    ("https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80", "Private sunroom overlooking gardens", False),
                    ("https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80", "Spacious formal dining room", False),
                ],
            },
            # 8. Rishikesh - Ganga Bliss Sanctuary
            {
                "host": priya,
                "title": "Ganga Bliss - Sacred Riverside Yoga Sanctuary",
                "description": "Overlooking the emerald holy waters of the Ganga and forested foothills of the Himalayas in Tapovan. Enjoy sunrise yoga on the private hardwood meditation deck, tranquil river sounds, organic herbal gardens, and peaceful evening Aarti ambiance.",
                "property_type": "Guesthouse",
                "category": "Trending",
                "room_type": "Entire place",
                "address": "Badrinath Road, Tapovan",
                "city": "Rishikesh",
                "state": "Uttarakhand",
                "country": "India",
                "latitude": 30.1319,
                "longitude": 78.3247,
                "price_per_night": 5200,
                "cleaning_fee": 900,
                "service_fee_rate": 0.14,
                "max_guests": 4,
                "bedrooms": 2,
                "beds": 2,
                "bathrooms": 2.0,
                "rating": 4.98,
                "review_count": 74,
                "amenities": ["Fast Wifi", "Waterfront access", "Patio or balcony", "Air conditioning", "Dedicated workspace", "Free parking on premises"],
                "images": [
                    ("https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80", "Sacred Ganga river bend and hills", True),
                    ("https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=800&q=80", "Sunlit yoga lounge facing the river", False),
                    ("https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80", "Bohemian guest bedroom with balcony", False),
                    ("https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80", "Open-air meditation terrace", False),
                    ("https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80", "Natural stone en-suite bath", False),
                ],
            },
            # 9. Varanasi - Assi Ghat Heritage Home
            {
                "host": rohan,
                "title": "Ghat View Heritage Home - Sunrise Over Holy Ganges",
                "description": "Steeped in history right above Assi Ghat, this lovingly restored centuries-old riverside haveli offers private rooftop views of morning sunrise ceremonies, temple bells, and serene riverboats gliding past. Traditional courtyard living at its most spiritual.",
                "property_type": "House",
                "category": "Trending",
                "room_type": "Entire place",
                "address": "B1/150 Assi Ghat Road",
                "city": "Varanasi",
                "state": "Uttar Pradesh",
                "country": "India",
                "latitude": 25.2885,
                "longitude": 83.0062,
                "price_per_night": 5600,
                "cleaning_fee": 950,
                "service_fee_rate": 0.14,
                "max_guests": 4,
                "bedrooms": 2,
                "beds": 3,
                "bathrooms": 2.0,
                "rating": 4.93,
                "review_count": 61,
                "amenities": ["Fast Wifi", "Waterfront access", "Patio or balcony", "Air conditioning", "Dedicated workspace", "Smoke alarm"],
                "images": [
                    ("https://images.unsplash.com/photo-1561359313-0639aad49ca6?auto=format&fit=crop&w=1200&q=80", "Ghat steps and sunrise over the Ganges", True),
                    ("https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80", "Heritage bedroom with handloom furnishings", False),
                    ("https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80", "Rooftop terrace overlooking river rituals", False),
                    ("https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80", "Central sunlit interior courtyard", False),
                    ("https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80", "Classic stone bath and vanity", False),
                ],
            },
            # 10. Bengaluru - Indiranagar Garden Penthouse
            {
                "host": priya,
                "title": "Indiranagar Green Oasis - Contemporary Garden Penthouse",
                "description": "Tucked away on a leafy 100 Feet Road boulevard in Indiranagar, this modern architectural duplex boasts a lush private terrace garden, gigabit fiber workspace, ergonomic setup, and sleek open-concept kitchen. Steps away from Bengaluru's finest brewpubs and cafes.",
                "property_type": "Apartment",
                "category": "Trending",
                "room_type": "Entire place",
                "address": "12th Main Road, HAL 2nd Stage, Indiranagar",
                "city": "Bengaluru",
                "state": "Karnataka",
                "country": "India",
                "latitude": 12.9784,
                "longitude": 77.6408,
                "price_per_night": 6500,
                "cleaning_fee": 1100,
                "service_fee_rate": 0.14,
                "max_guests": 4,
                "bedrooms": 2,
                "beds": 2,
                "bathrooms": 2.0,
                "rating": 4.96,
                "review_count": 82,
                "amenities": ["Fast Wifi", "Dedicated workspace", "Air conditioning", "EV charger", "Patio or balcony", "55\" 4K TV with Netflix", "Free parking on premises"],
                "images": [
                    ("https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80", "Modern sunlit living room and balcony", True),
                    ("https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80", "Private terrace garden lounge", False),
                    ("https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80", "Master bedroom with green courtyard view", False),
                    ("https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80", "High-speed workstation and coffee nook", False),
                    ("https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80", "Luxury rain shower bathroom", False),
                ],
            },
            # 11. Alleppey / Kerala - Backwaters Houseboat
            {
                "host": rohan,
                "title": "Backwaters Royale - Luxury Floating Heritage Houseboat",
                "description": "Glide through the tranquil palms and lotus canals of Vembanad Lake aboard this handcrafted wooden Kettuvallam houseboat. Complete with air-conditioned glass suites, sundeck jacuzzi, private butler service, and freshly caught Karimeen dinners prepared on board.",
                "property_type": "House",
                "category": "Lakefront",
                "room_type": "Entire place",
                "address": "Finishing Point Jetty, Punnamada",
                "city": "Alleppey",
                "state": "Kerala",
                "country": "India",
                "latitude": 9.4981,
                "longitude": 76.3388,
                "price_per_night": 14000,
                "cleaning_fee": 1600,
                "service_fee_rate": 0.14,
                "max_guests": 4,
                "bedrooms": 2,
                "beds": 2,
                "bathrooms": 2.0,
                "rating": 4.99,
                "review_count": 49,
                "amenities": ["Fast Wifi", "Waterfront access", "Heated hot tub", "Air conditioning", "Patio or balcony", "Free parking on premises"],
                "images": [
                    ("https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80", "Traditional Kettuvallam houseboat on Kerala backwaters", True),
                    ("https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80", "Air-conditioned glass bedroom overlooking water", False),
                    ("https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80", "Front sundeck seating facing coconut palms", False),
                    ("https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=800&q=80", "Interior teak dining lounge", False),
                    ("https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80", "Modern en-suite bath with lake view", False),
                ],
            },
            # 12. Ooty - Nilgiri Colonial Cottage
            {
                "host": priya,
                "title": "Nilgiri Mist - British Colonial Cloudview Cottage",
                "description": "Perched on a quiet hill slope with views across the Nilgiri blue mountains, this 1920s stone cottage features high wooden ceilings, working stone hearth, English rose gardens, afternoon tea lawn, and cozy bay windows overlooking eucalyptus groves.",
                "property_type": "Cottage",
                "category": "Cabins",
                "room_type": "Entire place",
                "address": "Fern Hill Road, Nilgiris",
                "city": "Ooty",
                "state": "Tamil Nadu",
                "country": "India",
                "latitude": 11.4102,
                "longitude": 76.6950,
                "price_per_night": 7800,
                "cleaning_fee": 1200,
                "service_fee_rate": 0.14,
                "max_guests": 5,
                "bedrooms": 2,
                "beds": 3,
                "bathrooms": 2.0,
                "rating": 4.95,
                "review_count": 38,
                "amenities": ["Fast Wifi", "Fire pit", "Heating", "Patio or balcony", "Free parking on premises", "Fully equipped kitchen"],
                "images": [
                    ("https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80", "Stone cottage exterior nestled in mountain greenery", True),
                    ("https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=800&q=80", "Warm hearth and colonial reading parlour", False),
                    ("https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80", "Floral bedroom with bay window views", False),
                    ("https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80", "Manicured lawn for high tea", False),
                    ("https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=800&q=80", "Fire pit under misty night sky", False),
                ],
            },
            # 13. Pune - Sahyadri Valley Plunge Pool Villa
            {
                "host": rohan,
                "title": "Sahyadri Valley Villa - Private Plunge Pool & Deck",
                "description": "Perched on the cliff edge of the Sahyadri mountains near Lonavala, this glass-and-stone designer villa offers jaw-dropping waterfall views during the monsoons. Features a heated cantilevered plunge pool, sunken amphitheater seating, and barbecue deck.",
                "property_type": "Villa",
                "category": "Amazing pools",
                "room_type": "Entire place",
                "address": "Tungarli Lake Road, Lonavala-Pune",
                "city": "Pune",
                "state": "Maharashtra",
                "country": "India",
                "latitude": 18.7557,
                "longitude": 73.4091,
                "price_per_night": 11500,
                "cleaning_fee": 1800,
                "service_fee_rate": 0.14,
                "max_guests": 8,
                "bedrooms": 3,
                "beds": 4,
                "bathrooms": 3.5,
                "rating": 4.96,
                "review_count": 44,
                "amenities": ["Fast Wifi", "Private infinity pool", "Outdoor BBQ grill", "Air conditioning", "Patio or balcony", "Free parking on premises", "EV charger"],
                "images": [
                    ("https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80", "Cantilevered infinity pool overlooking valley", True),
                    ("https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80", "Modern villa exterior illuminated at twilight", False),
                    ("https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80", "Double-height living space with glass walls", False),
                    ("https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80", "Gourmet open kitchen and breakfast bar", False),
                    ("https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80", "Master bedroom with private plunge deck", False),
                ],
            },
            # 14. Kolkata - Colonial Alipore Manor
            {
                "host": priya,
                "title": "Colonial Manor - Grand Heritage Suite with Courtyard",
                "description": "Experience old-world Calcutta charm in the leafy neighborhood of Alipore. Soaring 18-foot ceilings, Burmese teak flooring, sprawling verandahs, antique book collections, and a quiet private courtyard garden shaded by royal palms.",
                "property_type": "Apartment",
                "category": "Mansions",
                "room_type": "Entire place",
                "address": "Burdwan Road, Alipore",
                "city": "Kolkata",
                "state": "West Bengal",
                "country": "India",
                "latitude": 22.5312,
                "longitude": 88.3283,
                "price_per_night": 5800,
                "cleaning_fee": 1000,
                "service_fee_rate": 0.14,
                "max_guests": 4,
                "bedrooms": 2,
                "beds": 2,
                "bathrooms": 2.0,
                "rating": 4.92,
                "review_count": 35,
                "amenities": ["Fast Wifi", "Air conditioning", "Dedicated workspace", "Patio or balcony", "Free parking on premises", "Smoke alarm"],
                "images": [
                    ("https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80", "Grand heritage colonial manor facade", True),
                    ("https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80", "Teak floored salon with vintage chandeliers", False),
                    ("https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80", "Colonial master bedroom with four-poster bed", False),
                    ("https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80", "Verandah tea nook with courtyard view", False),
                    ("https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80", "Vintage cast-iron clawfoot tub bathroom", False),
                ],
            },
            # 15. Chennai - Coromandel Coast Beach Villa
            {
                "host": rohan,
                "title": "Coromandel Shores - Modern Beach Villa on ECR",
                "description": "Directly facing the Bay of Bengal along Chennai's scenic East Coast Road. Features private beach access, a sparkling lap pool, breezy ocean-facing terraces, contemporary tropical architecture, and serene coconut groves for the ultimate coastal getaway.",
                "property_type": "Villa",
                "category": "Beachfront",
                "room_type": "Entire place",
                "address": "East Coast Road, Uthandi",
                "city": "Chennai",
                "state": "Tamil Nadu",
                "country": "India",
                "latitude": 12.8683,
                "longitude": 80.2458,
                "price_per_night": 11200,
                "cleaning_fee": 1700,
                "service_fee_rate": 0.14,
                "max_guests": 8,
                "bedrooms": 3,
                "beds": 4,
                "bathrooms": 3.0,
                "rating": 4.96,
                "review_count": 47,
                "amenities": ["Fast Wifi", "Private infinity pool", "Waterfront access", "Air conditioning", "Patio or balcony", "Free parking on premises", "Outdoor BBQ grill"],
                "images": [
                    ("https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80", "Contemporary beach villa and lap pool", True),
                    ("https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80", "Bay of Bengal sunset from terrace", False),
                    ("https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80", "Sun-drenched living room opening to ocean", False),
                    ("https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80", "Modern open kitchen and breakfast patio", False),
                    ("https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80", "Master bedroom with oceanfront balcony", False),
                ],
            },
            # 16. Hyderabad - Nizam's Crest Jubilee Hills Pool Villa
            {
                "host": priya,
                "title": "Nizam\'s Crest - Luxury Pool Villa in Jubilee Hills",
                "description": "Perched on a quiet hill in Hyderabad's premier enclave of Jubilee Hills. Inspired by royal Deccan elegance, this architectural villa features an illuminated outdoor pool, granite courtyard, home cinema room, and expansive city skyline vistas.",
                "property_type": "Villa",
                "category": "Amazing pools",
                "room_type": "Entire place",
                "address": "Road No. 36, Jubilee Hills",
                "city": "Hyderabad",
                "state": "Telangana",
                "country": "India",
                "latitude": 17.4319,
                "longitude": 78.4073,
                "price_per_night": 12800,
                "cleaning_fee": 1900,
                "service_fee_rate": 0.14,
                "max_guests": 8,
                "bedrooms": 4,
                "beds": 4,
                "bathrooms": 4.0,
                "rating": 4.97,
                "review_count": 51,
                "amenities": ["Fast Wifi", "Private infinity pool", "Air conditioning", "55\" 4K TV with Netflix", "Free parking on premises", "EV charger", "Dedicated workspace"],
                "images": [
                    ("https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80", "Illuminated luxury pool and terrace at dusk", True),
                    ("https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80", "Palatial villa exterior in Jubilee Hills", False),
                    ("https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80", "Royal living salon with marble flooring", False),
                    ("https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80", "Master bedroom suite with skyline view", False),
                    ("https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80", "Designer bathroom with jacuzzi tub", False),
                ],
            },
        ]

        created_listings = []
        for l_data in listings_data:
            listing = Listing(
                host_id=l_data["host"].id,
                title=l_data["title"],
                description=l_data["description"],
                property_type=l_data["property_type"],
                category=l_data["category"],
                room_type=l_data["room_type"],
                address=l_data["address"],
                city=l_data["city"],
                state=l_data["state"],
                country=l_data["country"],
                latitude=l_data["latitude"],
                longitude=l_data["longitude"],
                price_per_night=l_data["price_per_night"],
                cleaning_fee=l_data["cleaning_fee"],
                service_fee_rate=l_data["service_fee_rate"],
                max_guests=l_data["max_guests"],
                bedrooms=l_data["bedrooms"],
                beds=l_data["beds"],
                bathrooms=l_data["bathrooms"],
                rating=l_data["rating"],
                review_count=l_data["review_count"],
            )

            # Associate amenities
            for a_name in l_data["amenities"]:
                if a_name in amenities_map:
                    listing.amenities.append(amenities_map[a_name])
            
            db.add(listing)
            db.flush()  # get listing.id

            # Add images with order
            for order, (img_url, caption, is_cov) in enumerate(l_data["images"]):
                img = ListingImage(
                    listing_id=listing.id,
                    image_url=img_url,
                    caption=caption,
                    display_order=order + 1,
                    is_cover=is_cov,
                )
                db.add(img)

            created_listings.append(listing)

        db.commit()

        print("Seeding Sample Bookings to test calendar availability blocking...")
        # 4. Pre-existing bookings
        today = date.today()
        sample_bookings = [
            Booking(
                listing_id=created_listings[0].id,  # Goa Villa
                guest_id=aarav.id,
                check_in_date=today + timedelta(days=5),
                check_out_date=today + timedelta(days=9),
                total_guests=2,
                adults=2,
                nightly_rate=created_listings[0].price_per_night,
                total_nights=4,
                cleaning_fee=created_listings[0].cleaning_fee,
                service_fee=int(created_listings[0].price_per_night * 4 * 0.14),
                total_price=(created_listings[0].price_per_night * 4) + created_listings[0].cleaning_fee + int(created_listings[0].price_per_night * 4 * 0.14),
                status="confirmed",
                payment_method="UPI / GPay",
            ),
            Booking(
                listing_id=created_listings[0].id,
                guest_id=ananya.id,
                check_in_date=today + timedelta(days=15),
                check_out_date=today + timedelta(days=20),
                total_guests=4,
                adults=3,
                children=1,
                nightly_rate=created_listings[0].price_per_night,
                total_nights=5,
                cleaning_fee=created_listings[0].cleaning_fee,
                service_fee=int(created_listings[0].price_per_night * 5 * 0.14),
                total_price=(created_listings[0].price_per_night * 5) + created_listings[0].cleaning_fee + int(created_listings[0].price_per_night * 5 * 0.14),
                status="confirmed",
                payment_method="Credit Card",
            ),
            Booking(
                listing_id=created_listings[1].id,  # Jaipur Haveli
                guest_id=aarav.id,
                check_in_date=today + timedelta(days=10),
                check_out_date=today + timedelta(days=14),
                total_guests=2,
                adults=2,
                nightly_rate=created_listings[1].price_per_night,
                total_nights=4,
                cleaning_fee=created_listings[1].cleaning_fee,
                service_fee=int(created_listings[1].price_per_night * 4 * 0.14),
                total_price=(created_listings[1].price_per_night * 4) + created_listings[1].cleaning_fee + int(created_listings[1].price_per_night * 4 * 0.14),
                status="confirmed",
                payment_method="Net Banking",
            ),
        ]
        db.add_all(sample_bookings)

        print("Seeding Sample Reviews...")
        # 5. Authentic Indian Reviews
        sample_reviews = [
            Review(
                listing_id=created_listings[0].id,
                guest_id=aarav.id,
                rating=5.0,
                cleanliness=5,
                accuracy=5,
                communication=5,
                location=5,
                check_in=5,
                value=5,
                comment="Unbelievable coastal retreat! Waking up to the sea breeze in North Goa from the private pool was an experience we will never forget. Rohan was a gracious superhost.",
            ),
            Review(
                listing_id=created_listings[0].id,
                guest_id=ananya.id,
                rating=4.9,
                cleanliness=5,
                accuracy=5,
                communication=5,
                location=5,
                check_in=5,
                value=4,
                comment="The villa photos look amazing, but the place in person is even more breathtaking! Pristine, peaceful, and just minutes from Candolim beach.",
            ),
            Review(
                listing_id=created_listings[1].id,
                guest_id=aarav.id,
                rating=5.0,
                cleanliness=5,
                accuracy=5,
                communication=5,
                location=5,
                check_in=5,
                value=5,
                comment="Staying in a restored Rajasthani heritage haveli in Jaipur was magical. Intricate jharokhas, courtyards, and warm hospitality.",
            ),
            Review(
                listing_id=created_listings[2].id,
                guest_id=ananya.id,
                rating=5.0,
                cleanliness=5,
                accuracy=5,
                communication=5,
                location=5,
                check_in=5,
                value=5,
                comment="True Himalayan luxury. The pine aroma, heated cedar bedrooms, and snowcapped peaks visible from the balcony made this trip to Manali unforgettable.",
            ),
        ]
        db.add_all(sample_reviews)

        print("Seeding Wishlists...")
        # 6. Sample Wishlist items
        db.add(Wishlist(user_id=aarav.id, listing_id=created_listings[0].id))
        db.add(Wishlist(user_id=aarav.id, listing_id=created_listings[3].id))
        db.add(Wishlist(user_id=ananya.id, listing_id=created_listings[1].id))

        db.commit()
        print(" Successfully seeded database with 4 Indian users, 20 amenities, 16 Indian listings, 3 bookings, 4 reviews, and 3 wishlists!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}", file=sys.stderr)
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
