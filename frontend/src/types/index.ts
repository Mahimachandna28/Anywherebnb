export type UserRole = 'guest' | 'host' | 'both';

export interface User {
  id: number;
  name: string;
  email: string;
  avatar_url: string;
  is_superhost: boolean;
  role: UserRole;
  joined_date: string;
}

export interface Amenity {
  id: number;
  name: string;
  icon: string;
  category: string;
}

export interface ListingImage {
  id: number;
  listing_id: number;
  image_url: string;
  caption?: string;
  display_order: number;
  is_cover: boolean;
}

export interface Review {
  id: number;
  listing_id: number;
  guest_id: number;
  guest_name?: string;
  guest_avatar?: string;
  rating: number;
  cleanliness: number;
  accuracy: number;
  communication: number;
  location: number;
  check_in: number;
  value: number;
  comment: string;
  created_at: string;
}

export interface Listing {
  id: number;
  host_id: number;
  host?: User;
  title: string;
  description: string;
  property_type: string;
  category: string;
  room_type: string;
  address: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  price_per_night: number;
  cleaning_fee: number;
  service_fee_rate: number;
  max_guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  rating: number;
  review_count: number;
  images: ListingImage[];
  amenities: Amenity[];
  booked_dates?: string[];
  created_at: string;
}

export interface Booking {
  id: number;
  listing_id: number;
  listing?: Listing;
  guest_id: number;
  guest?: User;
  check_in_date: string;
  check_out_date: string;
  total_guests: number;
  adults: number;
  children: number;
  infants: number;
  nightly_rate: number;
  total_nights: number;
  cleaning_fee: number;
  service_fee: number;
  total_price: number;
  status: 'confirmed' | 'cancelled' | 'completed';
  payment_method: string;
  payment_status: string;
  created_at: string;
}

export interface Category {
  id: string;
  label: string;
  icon: string;
  description?: string;
}

export interface SearchFilterState {
  destination?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  propertyType?: string;
  bedrooms?: number;
  amenities?: string[];
}
