"""
Anywherebnb Database Seeding Script
Populates the SQLite database with rich, realistic listings, users, amenities, reviews, and bookings.
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
        # 1. Users (Hosts and Guests)
        sarah = User(
            name="Sarah Jenkins",
            email="sarah.jenkins@example.com",
            avatar_url="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
            is_superhost=True,
            role="both",
            joined_date=datetime(2021, 4, 12, tzinfo=timezone.utc),
        )
        marco = User(
            name="Marco Rossi",
            email="marco.rossi@example.com",
            avatar_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
            is_superhost=True,
            role="host",
            joined_date=datetime(2020, 8, 24, tzinfo=timezone.utc),
        )
        alex = User(
            name="Alex Morgan",
            email="alex.morgan@example.com",
            avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
            is_superhost=False,
            role="guest",
            joined_date=datetime(2022, 2, 10, tzinfo=timezone.utc),
        )
        elena = User(
            name="Elena Rostova",
            email="elena.rostova@example.com",
            avatar_url="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
            is_superhost=False,
            role="guest",
            joined_date=datetime(2023, 6, 18, tzinfo=timezone.utc),
        )

        db.add_all([sarah, marco, alex, elena])
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

        print("Seeding 16 World-Class Listings...")
        # 3. Curated Listings data
        listings_data = [
            {
                "host": marco,
                "title": "Villa Vista - Cliffside Panoramic Paradise",
                "description": "Perched dramatically above the turquoise waters of the Mediterranean, Villa Vista offers unparalleled 180-degree views of the Amalfi Coast. Features an infinity pool carved into the rock, private citrus garden, and spacious sun-drenched terraces perfect for sunset cocktails.",
                "property_type": "Villa",
                "category": "Beachfront",
                "room_type": "Entire place",
                "address": "Via Cristoforo Colombo 45",
                "city": "Positano",
                "state": "Salerno",
                "country": "Italy",
                "latitude": 40.6281,
                "longitude": 14.4850,
                "price_per_night": 480,
                "cleaning_fee": 150,
                "service_fee_rate": 0.14,
                "max_guests": 6,
                "bedrooms": 3,
                "beds": 4,
                "bathrooms": 3.0,
                "rating": 4.97,
                "review_count": 48,
                "amenities": ["Fast Wifi", "Private infinity pool", "Free parking on premises", "Air conditioning", "Patio or balcony", "Waterfront access", "Outdoor BBQ grill"],
                "images": [
                    ("https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80", "Main cliffside terrace and pool", True),
                    ("https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80", "Exterior villa view at sunset", False),
                    ("https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80", "Open concept master living room", False),
                    ("https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80", "Chef kitchen overlooking the sea", False),
                    ("https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80", "Master bedroom with ocean balcony", False),
                ],
            },
            {
                "host": sarah,
                "title": "Zen Sanctuary - Traditional Kyoto Machiya",
                "description": "Step back in time in this meticulously restored 100-year-old Machiya townhouse in the historic Gion district. Traditional tatami mat rooms, exposed cedar beams, and an exquisite private moss garden with a handcrafted cedar hinoki soaking tub.",
                "property_type": "House",
                "category": "Trending",
                "room_type": "Entire place",
                "address": "4-chome Miyagawatsuji",
                "city": "Kyoto",
                "state": "Kansai",
                "country": "Japan",
                "latitude": 35.0037,
                "longitude": 135.7725,
                "price_per_night": 290,
                "cleaning_fee": 85,
                "service_fee_rate": 0.14,
                "max_guests": 4,
                "bedrooms": 2,
                "beds": 3,
                "bathrooms": 1.5,
                "rating": 4.99,
                "review_count": 62,
                "amenities": ["Fast Wifi", "Heated hot tub", "Dedicated workspace", "Air conditioning", "Heating", "Smoke alarm"],
                "images": [
                    ("https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80", "Historic Machiya facade in Kyoto", True),
                    ("https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80", "Private interior Japanese garden", False),
                    ("https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80", "Traditional tatami bedroom suite", False),
                    ("https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80", "Japanese tea ceremony lounge", False),
                    ("https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80", "Hinoki cedar bath with garden view", False),
                ],
            },
            {
                "host": marco,
                "title": "Summit Ridge - Luxury Aspen Ski Chalet",
                "description": "Ultra-luxe ski-in/ski-out timber chalet on Aspen Mountain. Features soaring cathedral ceilings, massive floor-to-ceiling stone fireplace, heated outdoor hot tub facing the slopes, private boot warmer room, and gourmet kitchen.",
                "property_type": "Cabin",
                "category": "Skiing",
                "room_type": "Entire place",
                "address": "720 Red Mountain Rd",
                "city": "Aspen",
                "state": "Colorado",
                "country": "United States",
                "latitude": 39.1911,
                "longitude": -106.8175,
                "price_per_night": 750,
                "cleaning_fee": 200,
                "service_fee_rate": 0.14,
                "max_guests": 8,
                "bedrooms": 4,
                "beds": 5,
                "bathrooms": 4.0,
                "rating": 4.96,
                "review_count": 35,
                "amenities": ["Fast Wifi", "Ski-in / ski-out access", "Heated hot tub", "Fire pit", "Free parking on premises", "55\" 4K TV with Netflix", "Heating"],
                "images": [
                    ("https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80", "Snow-covered chalet at twilight", True),
                    ("https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=800&q=80", "Grand living room with stone fireplace", False),
                    ("https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80", "Heated hot tub with mountain views", False),
                    ("https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80", "Modern alpine master suite", False),
                    ("https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=800&q=80", "Outdoor fire pit overlooking ski slopes", False),
                ],
            },
            {
                "host": sarah,
                "title": "Oia Sunset Cave House & Plunge Pool",
                "description": "Authentic Cycladic whitewashed cave dwelling carved directly into the high volcanic caldera cliffs of Oia. Features a heated cave plunge pool, breathtaking sunsets right from your private terrace, and handcrafted minimalist Greek architecture.",
                "property_type": "House",
                "category": "Amazing pools",
                "room_type": "Entire place",
                "address": "Caldera Walkway 12",
                "city": "Oia",
                "state": "Santorini",
                "country": "Greece",
                "latitude": 36.4618,
                "longitude": 25.3753,
                "price_per_night": 420,
                "cleaning_fee": 95,
                "service_fee_rate": 0.14,
                "max_guests": 4,
                "bedrooms": 2,
                "beds": 2,
                "bathrooms": 2.0,
                "rating": 4.98,
                "review_count": 89,
                "amenities": ["Fast Wifi", "Private infinity pool", "Heated hot tub", "Air conditioning", "Patio or balcony", "Waterfront access"],
                "images": [
                    ("https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80", "Whitewashed Oia terrace overlooking caldera", True),
                    ("https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80", "Private cave plunge pool with sea view", False),
                    ("https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80", "Minimalist Cycladic interior bedroom", False),
                    ("https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80", "Sun lounge terrace at golden hour", False),
                    ("https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80", "Nighttime illuminated plunge pool", False),
                ],
            },
            {
                "host": sarah,
                "title": "Aura Bamboo Villa - Eco Luxury in Ubud",
                "description": "An architectural masterpiece crafted entirely from sustainable blonde bamboo, nestled high above the sacred Ayung River valley. Enjoy the natural breeze, freeform private swimming pool, outdoor rain shower, and lush tropical jungle canopy.",
                "property_type": "Villa",
                "category": "Tropical",
                "room_type": "Entire place",
                "address": "Jalan Raya Sayan",
                "city": "Ubud",
                "state": "Bali",
                "country": "Indonesia",
                "latitude": -8.5069,
                "longitude": 115.2625,
                "price_per_night": 235,
                "cleaning_fee": 60,
                "service_fee_rate": 0.14,
                "max_guests": 4,
                "bedrooms": 2,
                "beds": 2,
                "bathrooms": 2.0,
                "rating": 4.95,
                "review_count": 74,
                "amenities": ["Fast Wifi", "Private infinity pool", "Free parking on premises", "Outdoor BBQ grill", "Patio or balcony", "First aid kit"],
                "images": [
                    ("https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80", "Iconic curved bamboo architecture", True),
                    ("https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80", "Jungle pool overlooking the river valley", False),
                    ("https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80", "Open-air master suite with netting", False),
                    ("https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80", "Outdoor stone soaking tub", False),
                    ("https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80", "Upper deck meditation lounge", False),
                ],
            },
            {
                "host": marco,
                "title": "Le Marais Light-Filled Designer Loft",
                "description": "Quintessential Parisian apartment in the heart of the trendy Marais. Features original herringbone parquet floors, 18th-century wrought-iron balconies overlooking classical limestone facades, curated modern art, and French espresso bar.",
                "property_type": "Apartment",
                "category": "Mansions",
                "room_type": "Entire place",
                "address": "Rue des Francs-Bourgeois",
                "city": "Paris",
                "state": "Île-de-France",
                "country": "France",
                "latitude": 48.8575,
                "longitude": 2.3622,
                "price_per_night": 310,
                "cleaning_fee": 80,
                "service_fee_rate": 0.14,
                "max_guests": 3,
                "bedrooms": 1,
                "beds": 2,
                "bathrooms": 1.0,
                "rating": 4.93,
                "review_count": 52,
                "amenities": ["Fast Wifi", "Fully equipped kitchen", "Dedicated workspace", "Heating", "Washer & dryer", "Smoke alarm"],
                "images": [
                    ("https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80", "Bright living room with Parisian balcony", True),
                    ("https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80", "Herringbone floors and fireplace", False),
                    ("https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=800&q=80", "Designer gourmet kitchen and dining", False),
                    ("https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80", "Sunlit bedroom with reading nook", False),
                    ("https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80", "Marble bathroom with rain shower", False),
                ],
            },
            {
                "host": sarah,
                "title": "Tribeca Glass Penthouse & Private Roof Deck",
                "description": "Sensational triplex penthouse in prime historic Tribeca with private key-lock elevator. Boasts 20-foot ceilings, direct skyline views of One World Trade, wraparound landscaped rooftop terrace with outdoor kitchen, and private sauna.",
                "property_type": "Loft",
                "category": "Mansions",
                "room_type": "Entire place",
                "address": "Franklin Street & Hudson St",
                "city": "New York",
                "state": "New York",
                "country": "United States",
                "latitude": 40.7195,
                "longitude": -74.0089,
                "price_per_night": 890,
                "cleaning_fee": 250,
                "service_fee_rate": 0.14,
                "max_guests": 6,
                "bedrooms": 3,
                "beds": 3,
                "bathrooms": 3.5,
                "rating": 4.98,
                "review_count": 31,
                "amenities": ["Fast Wifi", "Heated hot tub", "Private gym", "Dedicated workspace", "Air conditioning", "55\" 4K TV with Netflix", "EV charger"],
                "images": [
                    ("https://images.unsplash.com/photo-1567496898669-ee935f5f647a?auto=format&fit=crop&w=1200&q=80", "Penthouse terrace with Manhattan skyline", True),
                    ("https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80", "Grand high-ceiling living space", False),
                    ("https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80", "Modern open concept kitchen bar", False),
                    ("https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80", "Master bedroom with corner glass windows", False),
                    ("https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&w=800&q=80", "Private rooftop dining under pergolas", False),
                ],
            },
            {
                "host": marco,
                "title": "Casa Selva - Luxury Tulum Jungle Villa",
                "description": "Boho-chic luxury villa immersed in the lush tropical jungle of Aldea Zama, minutes from the white sand Caribbean beaches. Features a private swimming pool with sunbeds, rooftop stargazing lounge, concrete artisan finishes, and private chef service option.",
                "property_type": "Villa",
                "category": "Tropical",
                "room_type": "Entire place",
                "address": "Aldea Zama Mza 14",
                "city": "Tulum",
                "state": "Quintana Roo",
                "country": "Mexico",
                "latitude": 20.2114,
                "longitude": -87.4654,
                "price_per_night": 340,
                "cleaning_fee": 110,
                "service_fee_rate": 0.14,
                "max_guests": 6,
                "bedrooms": 3,
                "beds": 4,
                "bathrooms": 3.0,
                "rating": 4.96,
                "review_count": 45,
                "amenities": ["Fast Wifi", "Private infinity pool", "Free parking on premises", "Air conditioning", "Outdoor BBQ grill", "Smoke alarm"],
                "images": [
                    ("https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80", "Modern concrete villa with emerald pool", True),
                    ("https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80", "Sunken seating lounge by the pool", False),
                    ("https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80", "Minimalist bedroom with raw wood elements", False),
                    ("https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80", "Indoor-outdoor rain shower", False),
                    ("https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80", "Rooftop deck nestled in palm trees", False),
                ],
            },
            {
                "host": marco,
                "title": "Matterhorn Peak - Swiss Alpine Chalet",
                "description": "Perched on the snowy heights above car-free Zermatt, this quintessential Swiss pine chalet offers uninterrupted, majestic views of the Matterhorn. Relax by the wood-burning fireplace after a day skiing, or unwind in the outdoor Finnish sauna.",
                "property_type": "Cabin",
                "category": "Cabins",
                "room_type": "Entire place",
                "address": "Winkelmattenweg 8",
                "city": "Zermatt",
                "state": "Valais",
                "country": "Switzerland",
                "latitude": 45.9765,
                "longitude": 7.7491,
                "price_per_night": 520,
                "cleaning_fee": 140,
                "service_fee_rate": 0.14,
                "max_guests": 5,
                "bedrooms": 2,
                "beds": 3,
                "bathrooms": 2.0,
                "rating": 4.99,
                "review_count": 42,
                "amenities": ["Fast Wifi", "Ski-in / ski-out access", "Heated hot tub", "Heating", "Fire pit", "Dedicated workspace"],
                "images": [
                    ("https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=1200&q=80", "Chalet balcony framing the Matterhorn peak", True),
                    ("https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=800&q=80", "Cozy Swiss timber living area with stove", False),
                    ("https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80", "Panoramic dining area facing snow peaks", False),
                    ("https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80", "Warm master bedroom with alpine blankets", False),
                    ("https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80", "Outdoor cedar barrel sauna", False),
                ],
            },
            {
                "host": sarah,
                "title": "The Glass House - Joshua Tree Stargazer",
                "description": "Featured in Architectural Digest, this mirrored glass house reflects the mystical Mojave desert landscape. Designed for extreme stargazing with 360-degree glass walls, private outdoor stainless steel hot tub, fire pit, and electric solar power.",
                "property_type": "House",
                "category": "Tiny homes",
                "room_type": "Entire place",
                "address": "Border Ave & Highway 62",
                "city": "Joshua Tree",
                "state": "California",
                "country": "United States",
                "latitude": 34.1347,
                "longitude": -116.3131,
                "price_per_night": 395,
                "cleaning_fee": 90,
                "service_fee_rate": 0.14,
                "max_guests": 2,
                "bedrooms": 1,
                "beds": 1,
                "bathrooms": 1.0,
                "rating": 4.97,
                "review_count": 82,
                "amenities": ["Fast Wifi", "Heated hot tub", "Fire pit", "Free parking on premises", "EV charger", "Air conditioning"],
                "images": [
                    ("https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80", "Mirrored architectural cabin in the desert", True),
                    ("https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=800&q=80", "Minimalist glass interior with mountain backdrop", False),
                    ("https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=800&q=80", "Outdoor sunken fire pit at dusk", False),
                    ("https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80", "Modern soaking tub looking at Joshua trees", False),
                    ("https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&w=800&q=80", "Milky Way night sky over the house", False),
                ],
            },
            {
                "host": marco,
                "title": "Villa Serbelloni - Lake Como Waterfront Estate",
                "description": "Historic Italian lakeside manor in Bellagio with private boat dock and manicured Renaissance gardens. Unrivaled lake vistas spanning both branches of Lake Como, classical vaulted ceilings, frescoed salons, and private water taxi service.",
                "property_type": "Villa",
                "category": "Lakefront",
                "room_type": "Entire place",
                "address": "Via Roma 18",
                "city": "Bellagio",
                "state": "Como",
                "country": "Italy",
                "latitude": 45.9872,
                "longitude": 9.2625,
                "price_per_night": 680,
                "cleaning_fee": 180,
                "service_fee_rate": 0.14,
                "max_guests": 8,
                "bedrooms": 4,
                "beds": 5,
                "bathrooms": 4.5,
                "rating": 4.98,
                "review_count": 39,
                "amenities": ["Fast Wifi", "Waterfront access", "Private infinity pool", "Free parking on premises", "Patio or balcony", "Air conditioning"],
                "images": [
                    ("https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80", "Lake Como villa with private boat dock", True),
                    ("https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80", "Grand salon with lakefront arched windows", False),
                    ("https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80", "Classic Italian dining terrace", False),
                    ("https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80", "Master bedroom with wrought-iron balcony", False),
                    ("https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80", "Lakeside swimming pool surrounded by cypresses", False),
                ],
            },
            {
                "host": sarah,
                "title": "Aurora Thermal Igloo - Arctic Circle Stargazer",
                "description": "Sleep beneath the Northern Lights in this heated geodetic glass igloo in Lapland. Featuring motorized rotating beds, laser-heated glass that prevents frost, private wood-fired sauna, and snowmobile rental on-site.",
                "property_type": "Cabin",
                "category": "Cabins",
                "room_type": "Entire place",
                "address": "Tähtitie 1",
                "city": "Rovaniemi",
                "state": "Lapland",
                "country": "Finland",
                "latitude": 66.5039,
                "longitude": 25.7294,
                "price_per_night": 460,
                "cleaning_fee": 100,
                "service_fee_rate": 0.14,
                "max_guests": 2,
                "bedrooms": 1,
                "beds": 1,
                "bathrooms": 1.0,
                "rating": 4.96,
                "review_count": 58,
                "amenities": ["Fast Wifi", "Heating", "Heated hot tub", "Free parking on premises", "Smoke alarm", "First aid kit"],
                "images": [
                    ("https://images.unsplash.com/photo-1517824806704-9040b037703b?auto=format&fit=crop&w=1200&q=80", "Glass igloo under green Aurora Borealis", True),
                    ("https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80", "Interior glass dome with panoramic forest view", False),
                    ("https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=800&q=80", "Private Scandinavian timber sauna", False),
                    ("https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80", "Reindeer skin bed with starry ceiling", False),
                    ("https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80", "Snowy pine forest surrounding the dome", False),
                ],
            },
            {
                "host": sarah,
                "title": "Wailea Palms - Maui Luxury Oceanfront Villa",
                "description": "Direct oceanfront Hawaiian paradise overlooking Makena Beach and Molokini Crater. Listen to gentle Pacific waves from your infinity pool, pick fresh mangos from private groves, and enjoy whale watching from the expansive covered lanai.",
                "property_type": "Villa",
                "category": "Beachfront",
                "room_type": "Entire place",
                "address": "Makena Alanui Rd",
                "city": "Wailea",
                "state": "Hawaii",
                "country": "United States",
                "latitude": 20.6897,
                "longitude": -156.4422,
                "price_per_night": 720,
                "cleaning_fee": 220,
                "service_fee_rate": 0.14,
                "max_guests": 8,
                "bedrooms": 4,
                "beds": 4,
                "bathrooms": 4.0,
                "rating": 4.97,
                "review_count": 64,
                "amenities": ["Fast Wifi", "Private infinity pool", "Waterfront access", "Air conditioning", "Outdoor BBQ grill", "Free parking on premises", "EV charger"],
                "images": [
                    ("https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80", "Oceanfront infinity pool at sunset", True),
                    ("https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80", "Spacious open lanai with ocean views", False),
                    ("https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80", "Island modern kitchen and breakfast bar", False),
                    ("https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80", "Master bedroom opening to private beach lawn", False),
                    ("https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80", "Outdoor lava rock shower", False),
                ],
            },
            {
                "host": marco,
                "title": "Mayfair Heritage Townhouse & Private Courtyard",
                "description": "Elegant Georgian townhouse in prestigious Mayfair, steps from Hyde Park and Bond Street boutiques. Features four levels of curated British heritage design, marble fireplaces, a private wine cellar, and peaceful English garden courtyard.",
                "property_type": "House",
                "category": "Mansions",
                "room_type": "Entire place",
                "address": "Mount Street",
                "city": "London",
                "state": "Greater London",
                "country": "United Kingdom",
                "latitude": 51.5095,
                "longitude": -0.1506,
                "price_per_night": 580,
                "cleaning_fee": 160,
                "service_fee_rate": 0.14,
                "max_guests": 6,
                "bedrooms": 3,
                "beds": 4,
                "bathrooms": 3.0,
                "rating": 4.95,
                "review_count": 38,
                "amenities": ["Fast Wifi", "Fully equipped kitchen", "Dedicated workspace", "Heating", "Washer & dryer", "55\" 4K TV with Netflix"],
                "images": [
                    ("https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80", "Classic London Georgian brick facade", True),
                    ("https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80", "Drawing room with marble fireplace", False),
                    ("https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80", "Bespoke kitchen leading to garden courtyard", False),
                    ("https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80", "Master bedroom with high sash windows", False),
                    ("https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80", "Freestanding roll-top soaking tub", False),
                ],
            },
            {
                "host": sarah,
                "title": "Matakauri View - Queenstown Alpine Lodge",
                "description": "Dramatic glass-fronted modern lodge suspended above the deep blue waters of Lake Wakatipu with direct views of The Remarkables mountain range. Complete with cedar hot tub, wood-burning stone hearth, and close proximity to world-class vineyards.",
                "property_type": "Villa",
                "category": "Lakefront",
                "room_type": "Entire place",
                "address": "Ferneaux Lane",
                "city": "Queenstown",
                "state": "Otago",
                "country": "New Zealand",
                "latitude": -45.0312,
                "longitude": 168.6626,
                "price_per_night": 490,
                "cleaning_fee": 130,
                "service_fee_rate": 0.14,
                "max_guests": 6,
                "bedrooms": 3,
                "beds": 4,
                "bathrooms": 3.0,
                "rating": 4.98,
                "review_count": 47,
                "amenities": ["Fast Wifi", "Heated hot tub", "Waterfront access", "Fire pit", "Free parking on premises", "Dedicated workspace"],
                "images": [
                    ("https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=1200&q=80", "Lodge deck facing Lake Wakatipu & Remarkables", True),
                    ("https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80", "Floor-to-ceiling glass alpine living area", False),
                    ("https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80", "Panoramic master suite with private deck", False),
                    ("https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80", "Sunken cedar hot tub overlooking lake", False),
                    ("https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=800&q=80", "Outdoor fireplace and lounge area", False),
                ],
            },
            {
                "host": marco,
                "title": "Podere del Sole - Tuscan Olive Grove Estate",
                "description": "Restored 16th-century stone farmhouse surrounded by rolling hills of olive groves and vineyards outside Florence. Enjoy private wine tastings, infinity pool overlooking Chianti hills, authentic outdoor wood-fired pizza oven, and terracotta pergolas.",
                "property_type": "House",
                "category": "Countryside",
                "room_type": "Entire place",
                "address": "Strada Provinciale 12",
                "city": "Florence",
                "state": "Tuscany",
                "country": "Italy",
                "latitude": 43.7696,
                "longitude": 11.2558,
                "price_per_night": 410,
                "cleaning_fee": 120,
                "service_fee_rate": 0.14,
                "max_guests": 8,
                "bedrooms": 4,
                "beds": 5,
                "bathrooms": 3.5,
                "rating": 4.96,
                "review_count": 55,
                "amenities": ["Fast Wifi", "Private infinity pool", "Outdoor BBQ grill", "Free parking on premises", "Patio or balcony", "Air conditioning"],
                "images": [
                    ("https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?auto=format&fit=crop&w=1200&q=80", "Stone farmhouse nestled in Tuscan hills", True),
                    ("https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80", "Rustic kitchen with wood pizza oven", False),
                    ("https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80", "Infinity pool facing Chianti vineyards", False),
                    ("https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80", "Beamed ceiling master bedroom", False),
                    ("https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80", "Al fresco dining terrace at sunset", False),
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
        # 4. Pre-existing bookings (to immediately verify calendar date blocking)
        today = date.today()
        sample_bookings = [
            Booking(
                listing_id=created_listings[0].id,  # Villa Vista
                guest_id=alex.id,
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
                payment_method="Apple Pay",
            ),
            Booking(
                listing_id=created_listings[0].id,
                guest_id=elena.id,
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
                listing_id=created_listings[1].id,  # Kyoto Machiya
                guest_id=alex.id,
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
                payment_method="Credit Card",
            ),
        ]
        db.add_all(sample_bookings)

        print("Seeding Sample Reviews...")
        # 5. Realistic Reviews with 6 Airbnb sub-ratings
        sample_reviews = [
            Review(
                listing_id=created_listings[0].id,
                guest_id=alex.id,
                rating=5.0,
                cleanliness=5,
                accuracy=5,
                communication=5,
                location=5,
                check_in=5,
                value=5,
                comment="Unbelievable views! Waking up to the sunrise over Positano from the infinity pool is something we will never forget. Marco was the consummate host.",
            ),
            Review(
                listing_id=created_listings[0].id,
                guest_id=elena.id,
                rating=4.9,
                cleanliness=5,
                accuracy=5,
                communication=5,
                location=5,
                check_in=5,
                value=4,
                comment="The photos don't do it justice. Pristine, private, and breathtaking. Steps down into the town are a workout, but worth every step!",
            ),
            Review(
                listing_id=created_listings[1].id,
                guest_id=alex.id,
                rating=5.0,
                cleanliness=5,
                accuracy=5,
                communication=5,
                location=5,
                check_in=5,
                value=5,
                comment="Staying in a 100-year-old Machiya was the highlight of our Japan trip. The cedar hinoki bath smelling of wood in the evening was pure serenity.",
            ),
            Review(
                listing_id=created_listings[2].id,
                guest_id=elena.id,
                rating=5.0,
                cleanliness=5,
                accuracy=5,
                communication=5,
                location=5,
                check_in=5,
                value=5,
                comment="True ski-in/ski-out luxury. The boot warmers and outdoor hot tub after a full day in powder snow made this unforgettable.",
            ),
        ]
        db.add_all(sample_reviews)

        print("Seeding Wishlists...")
        # 6. Sample Wishlist items
        db.add(Wishlist(user_id=alex.id, listing_id=created_listings[0].id))
        db.add(Wishlist(user_id=alex.id, listing_id=created_listings[3].id))
        db.add(Wishlist(user_id=elena.id, listing_id=created_listings[1].id))

        db.commit()
        print(" Successfully seeded database with 4 users, 20 amenities, 16 listings, 3 bookings, 4 reviews, and 3 wishlists!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}", file=sys.stderr)
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
