"""
Anywherebnb Database Seeding Script - Indianised Data and Realistic INR Pricing
Populates the SQLite database with rich, authentic Indian listings, users, amenities, reviews, and bookings.
Each property has its own unique, location-accurate photography with zero mixing.
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
        print("Clearing existing data...")
        db.query(Wishlist).delete()
        db.query(Review).delete()
        db.query(Booking).delete()
        db.query(ListingImage).delete()
        db.execute(Base.metadata.tables["listing_amenities"].delete())
        db.query(Listing).delete()
        db.query(Amenity).delete()
        db.query(User).delete()
        db.commit()

        print("Seeding Users (3 Hosts + 3 Guests)...")
        # 1. Authentic Indian Users
        rahul = User(
            name="Rahul Sharma",
            email="rahul.sharma@example.com",
            avatar_url="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
            is_superhost=True,
            role="both",
            joined_date=datetime(2020, 8, 24, tzinfo=timezone.utc),
        )
        priya = User(
            name="Priya Sharma",
            email="priya.sharma@example.com",
            avatar_url="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
            is_superhost=True,
            role="both",
            joined_date=datetime(2021, 4, 12, tzinfo=timezone.utc),
        )
        arjun = User(
            name="Arjun Nair",
            email="arjun.nair@example.com",
            avatar_url="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
            is_superhost=True,
            role="both",
            joined_date=datetime(2021, 9, 15, tzinfo=timezone.utc),
        )
        aman = User(
            name="Aman Verma",
            email="aman.verma@example.com",
            avatar_url="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80",
            is_superhost=False,
            role="guest",
            joined_date=datetime(2022, 1, 15, tzinfo=timezone.utc),
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

        db.add_all([rahul, priya, arjun, aman, aarav, ananya])
        db.commit()

        print("Seeding Amenities...")
        amenities_data = [
            ("Fast Wifi", "Wifi", "Essentials"),
            ("Fully equipped kitchen", "Utensils", "Essentials"),
            ("Dedicated workspace", "Briefcase", "Essentials"),
            ("Washer & dryer", "Shirt", "Essentials"),
            ("Air conditioning", "Wind", "Essentials"),
            ("Heating", "Flame", "Essentials"),
            ("55\" 4K TV with Netflix", "Tv", "Essentials"),
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

        print("Seeding 16 Curated Indian Listings Across 3 Hosts with 80 Unique Photos...")
        listings_data = [
            # === HOST 1: RAHUL SHARMA (5 listings) ===
            # 1. Goa - Candolim Beachfront
            {
                "host": rahul,
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
                "price_per_night": 8500,
                "cleaning_fee": 1500,
                "service_fee_rate": 0.14,
                "max_guests": 8,
                "bedrooms": 4,
                "beds": 5,
                "bathrooms": 4.0,
                "rating": 4.9,
                "review_count": 52,
                "amenities": ["Fast Wifi", "Private infinity pool", "Free parking on premises", "Air conditioning", "Patio or balcony", "Waterfront access", "Outdoor BBQ grill"],
                "images": [
                    ("https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80", "Grand Portuguese villa exterior and private pool", True),
                    ("https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80", "Sunset view over palm garden", False),
                    ("https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80", "Spacious open living lounge with pool view", False),
                    ("https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800&q=80", "Tropical seaside resort grounds", False),
                    ("https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80", "Golden sands of Candolim beach at sunset", False),
                ],
            },
            # 2. Manali - Solang Pine Chalet (Mountain Cabin)
            {
                "host": rahul,
                "title": "Solang Pine Chalet - Alpine Himalayan Cedar Lodge",
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
                "price_per_night": 6200,
                "cleaning_fee": 1200,
                "service_fee_rate": 0.14,
                "max_guests": 6,
                "bedrooms": 3,
                "beds": 4,
                "bathrooms": 3.0,
                "rating": 4.8,
                "review_count": 42,
                "amenities": ["Fast Wifi", "Ski-in / ski-out access", "Heated hot tub", "Fire pit", "Free parking on premises", "Heating", "55\" 4K TV with Netflix"],
                "images": [
                    ("https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80", "Snow-covered wooden chalet at dusk", True),
                    ("https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=800&q=80", "Cozy living room with stone fireplace", False),
                    ("https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?auto=format&fit=crop&w=800&q=80", "Snowy mountain peaks and pine trees", False),
                    ("https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80", "Warm timber bedroom with mountain vista", False),
                    ("https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80", "Himalayan alpine mountain ridge", False),
                ],
            },
            # 3. Jaipur - Amber Heritage Haveli (Jaipur Heritage Home)
            {
                "host": rahul,
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
                "price_per_night": 5500,
                "cleaning_fee": 1000,
                "service_fee_rate": 0.14,
                "max_guests": 5,
                "bedrooms": 2,
                "beds": 3,
                "bathrooms": 2.0,
                "rating": 4.7,
                "review_count": 68,
                "amenities": ["Fast Wifi", "Dedicated workspace", "Air conditioning", "Patio or balcony", "Free parking on premises", "Smoke alarm"],
                "images": [
                    ("https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=1200&q=80", "Carved sandstone haveli courtyard", True),
                    ("https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80", "Royal suite bedroom with Rajasthani textiles", False),
                    ("https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80", "Traditional tea lounge in courtyard", False),
                    ("https://images.unsplash.com/photo-1609137144822-0d127918a586?auto=format&fit=crop&w=800&q=80", "Amer Fort and Rajasthani architecture", False),
                    ("https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80", "Hawa Mahal pink sandstone windows", False),
                ],
            },
            # 4. Rishikesh - Ganga Bliss Sanctuary
            {
                "host": rahul,
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
                "price_per_night": 3499,
                "cleaning_fee": 600,
                "service_fee_rate": 0.14,
                "max_guests": 4,
                "bedrooms": 2,
                "beds": 2,
                "bathrooms": 2.0,
                "rating": 4.9,
                "review_count": 74,
                "amenities": ["Fast Wifi", "Waterfront access", "Patio or balcony", "Air conditioning", "Dedicated workspace", "Free parking on premises"],
                "images": [
                    ("https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80", "Sacred Ganga river bend and hills", True),
                    ("https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=800&q=80", "Yoga and meditation deck at sunrise", False),
                    ("https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=800&q=80", "Riverside retreat pathway", False),
                    ("https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80", "Peaceful meditation space overlooking hills", False),
                    ("https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=800&q=80", "Tranquil green mountain terrace", False),
                ],
            },
            # 5. Bengaluru - Indiranagar Garden Penthouse
            {
                "host": rahul,
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
                "price_per_night": 4850,
                "cleaning_fee": 850,
                "service_fee_rate": 0.14,
                "max_guests": 4,
                "bedrooms": 2,
                "beds": 2,
                "bathrooms": 2.0,
                "rating": 4.8,
                "review_count": 82,
                "amenities": ["Fast Wifi", "Dedicated workspace", "Air conditioning", "EV charger", "Patio or balcony", "55\" 4K TV with Netflix", "Free parking on premises"],
                "images": [
                    ("https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80", "Contemporary duplex living room", True),
                    ("https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80", "Modern chef kitchen and dining bar", False),
                    ("https://images.unsplash.com/photo-1593642532744-d377ab507dc8?auto=format&fit=crop&w=800&q=80", "Gigabit tech workspace and study", False),
                    ("https://images.unsplash.com/photo-1585412727339-54e4bae3bbf9?auto=format&fit=crop&w=800&q=80", "Minimalist bedroom with city green view", False),
                    ("https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80", "Private balcony garden seating", False),
                ],
            },

            # === HOST 2: PRIYA SHARMA (5 listings) ===
            # 6. Udaipur - Lake Pichola Haveli
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
                "price_per_night": 27000,
                "cleaning_fee": 4000,
                "service_fee_rate": 0.14,
                "max_guests": 6,
                "bedrooms": 3,
                "beds": 3,
                "bathrooms": 3.5,
                "rating": 4.98,
                "review_count": 55,
                "amenities": ["Fast Wifi", "Private infinity pool", "Waterfront access", "Air conditioning", "Patio or balcony", "Free parking on premises", "Dedicated workspace"],
                "images": [
                    ("https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80", "Lakefront infinity pool facing City Palace", True),
                    ("https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80", "Palatial master bedroom with lake views", False),
                    ("https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80", "Rooftop terrace overlooking Lake Pichola", False),
                    ("https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=800&q=80", "Royal poolside arches and lantern glow", False),
                    ("https://images.unsplash.com/photo-1615874959474-d609969a20ed?auto=format&fit=crop&w=800&q=80", "Heritage carved archway and courtyard", False),
                ],
            },
            # 7. Alleppey / Kerala - Backwaters Houseboat
            {
                "host": priya,
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
                "price_per_night": 18200,
                "cleaning_fee": 2000,
                "service_fee_rate": 0.14,
                "max_guests": 4,
                "bedrooms": 2,
                "beds": 2,
                "bathrooms": 2.0,
                "rating": 4.99,
                "review_count": 49,
                "amenities": ["Fast Wifi", "Waterfront access", "Heated hot tub", "Air conditioning", "Patio or balcony", "Free parking on premises"],
                "images": [
                    ("https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80", "Traditional Kettuvallam houseboat on backwaters", True),
                    ("https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=800&q=80", "Kerala palm-fringed water canal", False),
                    ("https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80", "Front sundeck cruising Vembanad lake", False),
                    ("https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80", "Timber interior bedroom on water", False),
                    ("https://images.unsplash.com/photo-1506744038136-46273834b3d0?auto=format&fit=crop&w=800&q=80", "Serene lagoon sunset in Alleppey", False),
                ],
            },
            # 8. Munnar / Kerala - Tea Plantation Estate
            {
                "host": priya,
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
                "price_per_night": 5999,
                "cleaning_fee": 950,
                "service_fee_rate": 0.14,
                "max_guests": 5,
                "bedrooms": 2,
                "beds": 3,
                "bathrooms": 2.0,
                "rating": 4.85,
                "review_count": 46,
                "amenities": ["Fast Wifi", "Fire pit", "Patio or balcony", "Free parking on premises", "Fully equipped kitchen", "Smoke alarm"],
                "images": [
                    ("https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1200&q=80", "Rolling emerald tea garden hills in Munnar", True),
                    ("https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80", "Colonial estate verandah facing sunrise", False),
                    ("https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80", "Misty tea plantation walking path", False),
                    ("https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80", "Cozy plantation bungalow bedroom", False),
                    ("https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=800&q=80", "Evening tea veranda overlooking Western Ghats", False),
                ],
            },
            # 9. Mumbai - Bandra Seaside Penthouse
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
                "price_per_night": 17500,
                "cleaning_fee": 2500,
                "service_fee_rate": 0.14,
                "max_guests": 4,
                "bedrooms": 2,
                "beds": 2,
                "bathrooms": 2.5,
                "rating": 4.88,
                "review_count": 58,
                "amenities": ["Fast Wifi", "Dedicated workspace", "Air conditioning", "55\" 4K TV with Netflix", "Patio or balcony", "Free parking on premises", "EV charger"],
                "images": [
                    ("https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=1200&q=80", "Mumbai coastal skyline and Arabian Sea", True),
                    ("https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=800&q=80", "Luxury modern penthouse terrace", False),
                    ("https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80", "Contemporary open living space", False),
                    ("https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80", "Sea-facing master bedroom suite", False),
                    ("https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=800&q=80", "Modern designer kitchen and bar", False),
                ],
            },
            # 10. Kolkata - Colonial Alipore Manor
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
                "price_per_night": 4200,
                "cleaning_fee": 750,
                "service_fee_rate": 0.14,
                "max_guests": 4,
                "bedrooms": 2,
                "beds": 2,
                "bathrooms": 2.0,
                "rating": 4.78,
                "review_count": 35,
                "amenities": ["Fast Wifi", "Air conditioning", "Dedicated workspace", "Patio or balcony", "Free parking on premises", "Smoke alarm"],
                "images": [
                    ("https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80", "Grand colonial manor architecture", True),
                    ("https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=800&q=80", "Aristocratic living room with library", False),
                    ("https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80", "Classic four-poster colonial bed", False),
                    ("https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80", "Colonial tea verandah with cane furniture", False),
                    ("https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&w=800&q=80", "Green courtyard garden with palms", False),
                ],
            },

            # === HOST 3: ARJUN NAIR (6 listings) ===
            # 11. Delhi - Lutyens Heritage Residence
            {
                "host": arjun,
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
                "price_per_night": 23500,
                "cleaning_fee": 3500,
                "service_fee_rate": 0.14,
                "max_guests": 6,
                "bedrooms": 3,
                "beds": 3,
                "bathrooms": 3.0,
                "rating": 4.91,
                "review_count": 39,
                "amenities": ["Fast Wifi", "Air conditioning", "Heating", "Dedicated workspace", "Free parking on premises", "Patio or balcony", "Smoke alarm"],
                "images": [
                    ("https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80", "Lutyens Delhi grand white bungalow", True),
                    ("https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=800&q=80", "Stately drawing room with Persian rugs", False),
                    ("https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=800&q=80", "Sprawling lawn with mature shady trees", False),
                    ("https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80", "Aristocratic suite bedroom", False),
                    ("https://images.unsplash.com/photo-1576941089067-2de3c901e126?auto=format&fit=crop&w=800&q=80", "Private formal dining room", False),
                ],
            },
            # 12. Ooty - Nilgiri Colonial Cottage
            {
                "host": arjun,
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
                "price_per_night": 6400,
                "cleaning_fee": 1100,
                "service_fee_rate": 0.14,
                "max_guests": 5,
                "bedrooms": 2,
                "beds": 3,
                "bathrooms": 2.0,
                "rating": 4.84,
                "review_count": 38,
                "amenities": ["Fast Wifi", "Fire pit", "Heating", "Patio or balcony", "Free parking on premises", "Fully equipped kitchen"],
                "images": [
                    ("https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80", "Stone cottage in Nilgiri mountain greenery", True),
                    ("https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80", "Misty eucalyptus forest of Ooty", False),
                    ("https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80", "Rustic floral bedroom with hill view", False),
                    ("https://images.unsplash.com/photo-1549880338-65ddcdfd017b?auto=format&fit=crop&w=800&q=80", "Cozy stone hearth in hill station parlor", False),
                    ("https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80", "Afternoon high tea garden lawn", False),
                ],
            },
            # 13. Varanasi - Assi Ghat Heritage Home
            {
                "host": arjun,
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
                "price_per_night": 2850,
                "cleaning_fee": 450,
                "service_fee_rate": 0.14,
                "max_guests": 4,
                "bedrooms": 2,
                "beds": 3,
                "bathrooms": 2.0,
                "rating": 4.81,
                "review_count": 61,
                "amenities": ["Fast Wifi", "Waterfront access", "Patio or balcony", "Air conditioning", "Dedicated workspace", "Smoke alarm"],
                "images": [
                    ("https://images.unsplash.com/photo-1561359313-0639aad49ca6?auto=format&fit=crop&w=1200&q=80", "Sunrise over Varanasi ghats and holy boats", True),
                    ("https://images.unsplash.com/photo-1571536802807-30451e3955d8?auto=format&fit=crop&w=800&q=80", "Ganges river Aarti ceremony glow", False),
                    ("https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80", "Inner haveli courtyard with ancient stone", False),
                    ("https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80", "Rooftop terrace overlooking river rituals", False),
                    ("https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80", "Traditional Varanasi room with handloom fabrics", False),
                ],
            },
            # 14. Chennai - Coromandel Coast Beach Villa
            {
                "host": arjun,
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
                "price_per_night": 12800,
                "cleaning_fee": 1800,
                "service_fee_rate": 0.14,
                "max_guests": 8,
                "bedrooms": 3,
                "beds": 4,
                "bathrooms": 3.0,
                "rating": 4.87,
                "review_count": 47,
                "amenities": ["Fast Wifi", "Private infinity pool", "Waterfront access", "Air conditioning", "Patio or balcony", "Free parking on premises", "Outdoor BBQ grill"],
                "images": [
                    ("https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1200&q=80", "Modern coastal villa and pool on ECR", True),
                    ("https://images.unsplash.com/photo-1584132967334-10e028bd69f8?auto=format&fit=crop&w=800&q=80", "Bay of Bengal beachfront palm view", False),
                    ("https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80", "Sunlit airy coastal living pavilion", False),
                    ("https://images.unsplash.com/photo-1520250497591-112f2f40a3f5?auto=format&fit=crop&w=800&q=80", "Oceanfront terrace bedroom", False),
                    ("https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=800&q=80", "Tropical garden and lap pool deck", False),
                ],
            },
            # 15. Hyderabad - Nizam's Crest Jubilee Hills Pool Villa
            {
                "host": arjun,
                "title": "Nizam's Crest - Luxury Pool Villa in Jubilee Hills",
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
                "price_per_night": 14900,
                "cleaning_fee": 2200,
                "service_fee_rate": 0.14,
                "max_guests": 8,
                "bedrooms": 4,
                "beds": 4,
                "bathrooms": 4.0,
                "rating": 4.83,
                "review_count": 51,
                "amenities": ["Fast Wifi", "Private infinity pool", "Air conditioning", "55\" 4K TV with Netflix", "Free parking on premises", "EV charger", "Dedicated workspace"],
                "images": [
                    ("https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1200&q=80", "Illuminated luxury villa pool at dusk", True),
                    ("https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80", "Double-height royal salon with chandelier", False),
                    ("https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80", "Polished marble hallway and courtyard", False),
                    ("https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=800&q=80", "Master bedroom with skyline view", False),
                    ("https://images.unsplash.com/photo-1600585154526-990dced4db0f?auto=format&fit=crop&w=800&q=80", "Private cinema and entertainment lounge", False),
                ],
            },
            # 16. Pune - Sahyadri Valley Plunge Pool Villa
            {
                "host": arjun,
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
                "price_per_night": 7800,
                "cleaning_fee": 1400,
                "service_fee_rate": 0.14,
                "max_guests": 8,
                "bedrooms": 3,
                "beds": 4,
                "bathrooms": 3.5,
                "rating": 4.79,
                "review_count": 44,
                "amenities": ["Fast Wifi", "Private infinity pool", "Outdoor BBQ grill", "Air conditioning", "Patio or balcony", "Free parking on premises", "EV charger"],
                "images": [
                    ("https://images.unsplash.com/photo-1513694203232-719a280e022e?auto=format&fit=crop&w=1200&q=80", "Cantilevered cliff villa overlooking Sahyadris", True),
                    ("https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80", "Lonavala monsoon waterfall valley", False),
                    ("https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?auto=format&fit=crop&w=800&q=80", "Outdoor barbecue fire pit deck", False),
                    ("https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=800&q=80", "Glass-walled master bedroom", False),
                    ("https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&w=800&q=80", "Gourmet open kitchen and lounge", False),
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
            db.flush()

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

        print("Seeding Sample Bookings Across Multiple Hosts...")
        sample_bookings = [
            Booking(
                listing_id=created_listings[0].id,  # Rahul's Goa Villa
                guest_id=aman.id,
                check_in_date=date(2026, 9, 12),
                check_out_date=date(2026, 9, 15),
                total_guests=2,
                adults=2,
                nightly_rate=created_listings[0].price_per_night,
                total_nights=3,
                cleaning_fee=created_listings[0].cleaning_fee,
                service_fee=int(created_listings[0].price_per_night * 3 * 0.14),
                total_price=(created_listings[0].price_per_night * 3) + created_listings[0].cleaning_fee + int(created_listings[0].price_per_night * 3 * 0.14),
                status="confirmed",
                payment_method="UPI / GPay",
            ),
            Booking(
                listing_id=created_listings[1].id,  # Rahul's Manali Mountain Cabin
                guest_id=priya.id,
                check_in_date=date(2026, 9, 20),
                check_out_date=date(2026, 9, 24),
                total_guests=3,
                adults=2,
                children=1,
                nightly_rate=created_listings[1].price_per_night,
                total_nights=4,
                cleaning_fee=created_listings[1].cleaning_fee,
                service_fee=int(created_listings[1].price_per_night * 4 * 0.14),
                total_price=(created_listings[1].price_per_night * 4) + created_listings[1].cleaning_fee + int(created_listings[1].price_per_night * 4 * 0.14),
                status="confirmed",
                payment_method="Credit Card",
            ),
            Booking(
                listing_id=created_listings[5].id,  # Priya's Udaipur Lake Palace
                guest_id=aarav.id,
                check_in_date=date(2026, 9, 14),
                check_out_date=date(2026, 9, 18),
                total_guests=2,
                adults=2,
                nightly_rate=created_listings[5].price_per_night,
                total_nights=4,
                cleaning_fee=created_listings[5].cleaning_fee,
                service_fee=int(created_listings[5].price_per_night * 4 * 0.14),
                total_price=(created_listings[5].price_per_night * 4) + created_listings[5].cleaning_fee + int(created_listings[5].price_per_night * 4 * 0.14),
                status="confirmed",
                payment_method="Net Banking",
            ),
            Booking(
                listing_id=created_listings[10].id,  # Arjun's Delhi Lutyens Residence
                guest_id=ananya.id,
                check_in_date=date(2026, 9, 16),
                check_out_date=date(2026, 9, 20),
                total_guests=2,
                adults=2,
                nightly_rate=created_listings[10].price_per_night,
                total_nights=4,
                cleaning_fee=created_listings[10].cleaning_fee,
                service_fee=int(created_listings[10].price_per_night * 4 * 0.14),
                total_price=(created_listings[10].price_per_night * 4) + created_listings[10].cleaning_fee + int(created_listings[10].price_per_night * 4 * 0.14),
                status="confirmed",
                payment_method="UPI / PhonePe",
            ),
        ]
        db.add_all(sample_bookings)

        print("Seeding Sample Reviews...")
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
                comment="Unbelievable coastal retreat! Waking up to the sea breeze in North Goa from the private pool was an experience we will never forget. Rahul was a gracious superhost.",
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
            Review(
                listing_id=created_listings[2].id,
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
        ]
        db.add_all(sample_reviews)

        print("Seeding Wishlists...")
        db.add(Wishlist(user_id=aman.id, listing_id=created_listings[0].id))
        db.add(Wishlist(user_id=aarav.id, listing_id=created_listings[1].id))
        db.add(Wishlist(user_id=ananya.id, listing_id=created_listings[2].id))
        db.add(Wishlist(user_id=aarav.id, listing_id=created_listings[5].id))

        db.commit()
        print(" Successfully seeded database with 3 hosts, 3 guests, 20 amenities, 16 Indian listings, 80 unique photos, 4 bookings, 4 reviews, and 4 wishlists!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}", file=sys.stderr)
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
