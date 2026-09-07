"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Plus,
  Trash2,
  Image as ImageIcon,
  Sparkles,
  MapPin,
  Users,
  Bed,
  Bath,
  Home,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Listing, Amenity } from "@/types";
import { fetchApi } from "@/lib/api";
import { formatCurrency } from "@/lib/formatters";
import { useToast } from "@/context/ToastContext";
import { cn } from "@/lib/utils";

interface ListingWizardFormProps {
  initialData?: Listing;
  isEditing?: boolean;
}

const PROPERTY_TYPES = [
  "House",
  "Apartment",
  "Villa",
  "Cabin",
  "Guesthouse",
  "Loft",
  "Cottage",
  "Townhouse",
];

const ROOM_TYPES = [
  { id: "Entire place", label: "Entire place", desc: "Guests have the whole place to themselves." },
  { id: "Private room", label: "Private room", desc: "Guests have their own room in a house, plus access to shared spaces." },
  { id: "Shared room", label: "Shared room", desc: "Guests sleep in a room or common area that may be shared with others." },
];

const CATEGORIES = [
  "Beachfront",
  "Cabins",
  "Amazing pools",
  "Mansions",
  "Lakefront",
  "Tiny homes",
  "Countryside",
  "Skiing",
  "Tropical",
  "Trending",
];

// Curated photo bundles for 1-click photo population
const SAMPLE_PHOTO_PRESETS = [
  {
    name: "Luxury Goa Beach Villa",
    photos: [
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    name: "Cozy Manali Mountain Chalet",
    photos: [
      "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    name: "Heritage Udaipur Lake Palace",
    photos: [
      "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
    ],
  },
];

const STEPS = [
  { id: 1, title: "Property Type" },
  { id: 2, title: "Location" },
  { id: 3, title: "Details" },
  { id: 4, title: "Capacity & Pricing" },
  { id: 5, title: "Amenities" },
  { id: 6, title: "Photos" },
];

export function ListingWizardForm({
  initialData,
  isEditing = false,
}: ListingWizardFormProps) {
  const router = useRouter();
  const toast = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [availableAmenities, setAvailableAmenities] = useState<Amenity[]>([]);

  // Form Fields
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [propertyType, setPropertyType] = useState(initialData?.property_type || "House");
  const [category, setCategory] = useState(initialData?.category || "Beachfront");
  const [roomType, setRoomType] = useState(initialData?.room_type || "Entire place");

  // Location
  const [address, setAddress] = useState(initialData?.address || "");
  const [city, setCity] = useState(initialData?.city || "");
  const [state, setState] = useState(initialData?.state || "");
  const [country, setCountry] = useState(initialData?.country || "India");

  // Capacity & Pricing
  const [pricePerNight, setPricePerNight] = useState<number>(
    initialData?.price_per_night || 4500
  );
  const [cleaningFee, setCleaningFee] = useState<number>(
    initialData?.cleaning_fee || 800
  );
  const [maxGuests, setMaxGuests] = useState<number>(initialData?.max_guests || 4);
  const [bedrooms, setBedrooms] = useState<number>(initialData?.bedrooms || 2);
  const [beds, setBeds] = useState<number>(initialData?.beds || 2);
  const [bathrooms, setBathrooms] = useState<number>(initialData?.bathrooms || 1.5);

  // Amenities
  const [selectedAmenityIds, setSelectedAmenityIds] = useState<number[]>(
    initialData?.amenities?.map((a) => a.id) || [1, 2, 6, 7]
  );

  // Photos
  const [imageUrls, setImageUrls] = useState<string[]>(
    initialData?.images?.map((img) => img.image_url) || [
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
    ]
  );
  const [newImageUrl, setNewImageUrl] = useState("");

  useEffect(() => {
    async function loadAmenities() {
      try {
        const data = await fetchApi<Amenity[]>("/amenities");
        setAvailableAmenities(data);
      } catch (err) {
        console.error("Failed to load amenities:", err);
      }
    }
    loadAmenities();
  }, []);

  // Validation per step
  const validateCurrentStep = (): boolean => {
    setGeneralError(null);
    if (currentStep === 1) {
      if (!propertyType || !category || !roomType) {
        setGeneralError("Please select property type, category, and room type.");
        return false;
      }
    } else if (currentStep === 2) {
      if (!address.trim() || !city.trim() || !country.trim()) {
        setGeneralError("Please provide address, city, and country.");
        return false;
      }
    } else if (currentStep === 3) {
      if (title.trim().length < 3) {
        setGeneralError("Title must be at least 3 characters long.");
        return false;
      }
      if (description.trim().length < 10) {
        setGeneralError("Description must be at least 10 characters long.");
        return false;
      }
    } else if (currentStep === 4) {
      if (pricePerNight <= 0) {
        setGeneralError("Price per night must be greater than ₹0.");
        return false;
      }
      if (maxGuests <= 0 || beds <= 0 || bathrooms <= 0) {
        setGeneralError("Guest capacity, beds, and bathrooms must be at least 1.");
        return false;
      }
    } else if (currentStep === 6) {
      if (imageUrls.length === 0) {
        setGeneralError("Please provide at least 1 photo for your listing.");
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(STEPS.length, prev + 1));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    setGeneralError(null);
    setCurrentStep((prev) => Math.max(1, prev - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleAmenity = (id: number) => {
    setSelectedAmenityIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAddCustomImage = () => {
    if (!newImageUrl.trim()) return;
    if (!newImageUrl.startsWith("http://") && !newImageUrl.startsWith("https://")) {
      setGeneralError("Please enter a valid HTTP or HTTPS image URL.");
      return;
    }
    setImageUrls((prev) => [...prev, newImageUrl.trim()]);
    setNewImageUrl("");
    setGeneralError(null);
  };

  const handleRemoveImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleApplyPhotoPreset = (photos: string[]) => {
    setImageUrls(photos);
    setGeneralError(null);
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;

    setIsSubmitting(true);
    setGeneralError(null);

    const payload = {
      title: title.trim(),
      description: description.trim(),
      property_type: propertyType,
      category: category,
      room_type: roomType,
      address: address.trim(),
      city: city.trim(),
      state: state.trim() || undefined,
      country: country.trim(),
      price_per_night: pricePerNight,
      cleaning_fee: cleaningFee,
      max_guests: maxGuests,
      bedrooms: bedrooms,
      beds: beds,
      bathrooms: bathrooms,
      amenity_ids: selectedAmenityIds,
      image_urls: imageUrls,
    };

    try {
      if (isEditing && initialData) {
        await fetchApi<Listing>(`/listings/${initialData.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        toast.success("Listing updated successfully!");
      } else {
        await fetchApi<Listing>("/listings", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success("Listing published successfully! Your property is live.");
      }

      // Redirect back to host dashboard
      router.push("/host");
    } catch (err: any) {
      console.error("Failed to save listing:", err);
      const errMsg =
        err.message || "Failed to save listing. Please verify all inputs and try again.";
      setGeneralError(errMsg);
      toast.error(errMsg);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50/50 pb-28">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-neutral-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/host"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-700 hover:text-neutral-900 transition"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Exit to Host Dashboard</span>
          </Link>

          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            {isEditing ? "Edit Listing" : "Listing Creator Wizard"}
          </span>
        </div>

        {/* Stepper Progress Bar */}
        <div className="w-full bg-neutral-100 h-1.5">
          <div
            className="bg-neutral-900 h-1.5 transition-all duration-300 ease-out"
            style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
          />
        </div>
      </header>

      {/* Main Form Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-8">
        {/* Step Indicator */}
        <div className="mb-6 flex items-center justify-between text-xs text-neutral-500 font-medium">
          <span>
            Step {currentStep} of {STEPS.length} ·{" "}
            <strong className="text-neutral-900">
              {STEPS[currentStep - 1].title}
            </strong>
          </span>
          <span>{Math.round((currentStep / STEPS.length) * 100)}% Complete</span>
        </div>

        {/* General Error Banner */}
        {generalError && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 animate-in fade-in">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
            <div className="text-sm">
              <p className="font-semibold">Action required</p>
              <p className="mt-0.5">{generalError}</p>
            </div>
          </div>
        )}

        <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-10 shadow-sm space-y-8">
          {/* STEP 1: Property Type, Category, Room Type */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h2 className="text-2xl font-bold text-neutral-900">
                  What kind of place will you host?
                </h2>
                <p className="text-sm text-neutral-500 mt-1">
                  Choose the property setup that best describes your accommodation.
                </p>
              </div>

              {/* Room Type */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                  Room Type
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {ROOM_TYPES.map((rt) => (
                    <button
                      key={rt.id}
                      type="button"
                      onClick={() => setRoomType(rt.id)}
                      className={cn(
                        "p-4 rounded-2xl border text-left flex items-start justify-between transition-all",
                        roomType === rt.id
                          ? "border-neutral-900 bg-neutral-50 ring-2 ring-neutral-900 shadow-sm"
                          : "border-neutral-200 hover:border-neutral-400"
                      )}
                    >
                      <div>
                        <p className="font-bold text-sm text-neutral-900">{rt.label}</p>
                        <p className="text-xs text-neutral-500 mt-0.5">{rt.desc}</p>
                      </div>
                      {roomType === rt.id && (
                        <Check className="w-5 h-5 text-neutral-900 shrink-0 mt-0.5" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Property Type Grid */}
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                  Property Structure
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {PROPERTY_TYPES.map((pt) => (
                    <button
                      key={pt}
                      type="button"
                      onClick={() => setPropertyType(pt)}
                      className={cn(
                        "p-3.5 rounded-xl border text-center text-xs font-semibold transition flex flex-col items-center gap-1.5",
                        propertyType === pt
                          ? "border-neutral-900 bg-neutral-900 text-white shadow-sm"
                          : "border-neutral-200 text-neutral-700 hover:border-neutral-400 bg-white"
                      )}
                    >
                      <Home className="w-4 h-4" />
                      <span>{pt}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Picker */}
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                  Featured Category
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={cn(
                        "p-3 rounded-xl border text-xs font-semibold transition text-center truncate",
                        category === cat
                          ? "border-airbnb-rose bg-rose-50 text-airbnb-rose ring-1 ring-airbnb-rose"
                          : "border-neutral-200 text-neutral-600 hover:border-neutral-400 bg-white"
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Location & Address */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h2 className="text-2xl font-bold text-neutral-900">
                  Where is your place located?
                </h2>
                <p className="text-sm text-neutral-500 mt-1">
                  Guests will only get your exact address after they confirm a booking.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Plot 42, Aguada Siolim Road"
                    className="w-full px-4 py-3 rounded-xl border border-neutral-300 text-sm font-medium text-neutral-900 focus:outline-none focus:border-neutral-900"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Candolim"
                      className="w-full px-4 py-3 rounded-xl border border-neutral-300 text-sm font-medium text-neutral-900 focus:outline-none focus:border-neutral-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      State / Region
                    </label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="e.g. Goa"
                      className="w-full px-4 py-3 rounded-xl border border-neutral-300 text-sm font-medium text-neutral-900 focus:outline-none focus:border-neutral-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Country *
                  </label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="e.g. India"
                    className="w-full px-4 py-3 rounded-xl border border-neutral-300 text-sm font-medium text-neutral-900 focus:outline-none focus:border-neutral-900"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Title & Description */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h2 className="text-2xl font-bold text-neutral-900">
                  Give your property a title and description
                </h2>
                <p className="text-sm text-neutral-500 mt-1">
                  Short, evocative titles and detailed descriptions work best.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-neutral-700">
                      Listing Title *
                    </label>
                    <span className="text-[11px] text-neutral-400">
                      {title.length}/200 characters
                    </span>
                  </div>
                  <input
                    type="text"
                    maxLength={200}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Luxury Beachfront Villa with Private Pool in North Goa"
                    className="w-full px-4 py-3 rounded-xl border border-neutral-300 text-sm font-medium text-neutral-900 focus:outline-none focus:border-neutral-900"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-neutral-700">
                      Full Description *
                    </label>
                    <span className="text-[11px] text-neutral-400">
                      {description.length} characters
                    </span>
                  </div>
                  <textarea
                    rows={6}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Share what makes your place special, such as scenic views, custom amenities, and neighborhood highlights..."
                    className="w-full px-4 py-3 rounded-xl border border-neutral-300 text-sm font-medium text-neutral-900 focus:outline-none focus:border-neutral-900 leading-relaxed"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Capacity & Pricing */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h2 className="text-2xl font-bold text-neutral-900">
                  Set your guest capacity and pricing
                </h2>
                <p className="text-sm text-neutral-500 mt-1">
                  Define accommodation limits and your standard nightly rate.
                </p>
              </div>

              {/* Counter Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-6 border-b border-neutral-200">
                <div className="p-4 rounded-2xl border border-neutral-200 text-center space-y-2">
                  <span className="text-xs text-neutral-500 font-semibold block">
                    Max Guests
                  </span>
                  <div className="flex items-center justify-center gap-3">
                    <button
                      type="button"
                      disabled={maxGuests <= 1}
                      onClick={() => setMaxGuests((p) => Math.max(1, p - 1))}
                      className="w-8 h-8 rounded-full border border-neutral-300 hover:border-neutral-900 disabled:opacity-30 font-bold"
                    >
                      -
                    </button>
                    <span className="text-base font-bold text-neutral-900 w-4">
                      {maxGuests}
                    </span>
                    <button
                      type="button"
                      onClick={() => setMaxGuests((p) => p + 1)}
                      className="w-8 h-8 rounded-full border border-neutral-300 hover:border-neutral-900 font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-neutral-200 text-center space-y-2">
                  <span className="text-xs text-neutral-500 font-semibold block">
                    Bedrooms
                  </span>
                  <div className="flex items-center justify-center gap-3">
                    <button
                      type="button"
                      disabled={bedrooms <= 0}
                      onClick={() => setBedrooms((p) => Math.max(0, p - 1))}
                      className="w-8 h-8 rounded-full border border-neutral-300 hover:border-neutral-900 disabled:opacity-30 font-bold"
                    >
                      -
                    </button>
                    <span className="text-base font-bold text-neutral-900 w-4">
                      {bedrooms}
                    </span>
                    <button
                      type="button"
                      onClick={() => setBedrooms((p) => p + 1)}
                      className="w-8 h-8 rounded-full border border-neutral-300 hover:border-neutral-900 font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-neutral-200 text-center space-y-2">
                  <span className="text-xs text-neutral-500 font-semibold block">
                    Beds
                  </span>
                  <div className="flex items-center justify-center gap-3">
                    <button
                      type="button"
                      disabled={beds <= 1}
                      onClick={() => setBeds((p) => Math.max(1, p - 1))}
                      className="w-8 h-8 rounded-full border border-neutral-300 hover:border-neutral-900 disabled:opacity-30 font-bold"
                    >
                      -
                    </button>
                    <span className="text-base font-bold text-neutral-900 w-4">
                      {beds}
                    </span>
                    <button
                      type="button"
                      onClick={() => setBeds((p) => p + 1)}
                      className="w-8 h-8 rounded-full border border-neutral-300 hover:border-neutral-900 font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-neutral-200 text-center space-y-2">
                  <span className="text-xs text-neutral-500 font-semibold block">
                    Bathrooms
                  </span>
                  <div className="flex items-center justify-center gap-3">
                    <button
                      type="button"
                      disabled={bathrooms <= 0.5}
                      onClick={() => setBathrooms((p) => Math.max(0.5, p - 0.5))}
                      className="w-8 h-8 rounded-full border border-neutral-300 hover:border-neutral-900 disabled:opacity-30 font-bold"
                    >
                      -
                    </button>
                    <span className="text-base font-bold text-neutral-900 w-8">
                      {bathrooms}
                    </span>
                    <button
                      type="button"
                      onClick={() => setBathrooms((p) => p + 0.5)}
                      className="w-8 h-8 rounded-full border border-neutral-300 hover:border-neutral-900 font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Pricing Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Nightly Base Rate (₹ INR) *
                  </label>
                  <div className="relative">
                    <span className="text-xs font-bold text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2">₹</span>
                    <input
                      type="number"
                      min={1}
                      value={pricePerNight}
                      onChange={(e) => setPricePerNight(Number(e.target.value))}
                      className="w-full pl-9 pr-4 py-3 rounded-xl border border-neutral-300 text-sm font-bold text-neutral-900 focus:outline-none focus:border-neutral-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Cleaning Fee (₹ INR)
                  </label>
                  <div className="relative">
                    <span className="text-xs font-bold text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2">₹</span>
                    <input
                      type="number"
                      min={0}
                      value={cleaningFee}
                      onChange={(e) => setCleaningFee(Number(e.target.value))}
                      className="w-full pl-9 pr-4 py-3 rounded-xl border border-neutral-300 text-sm font-bold text-neutral-900 focus:outline-none focus:border-neutral-900"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Amenities */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h2 className="text-2xl font-bold text-neutral-900">
                  Select available amenities
                </h2>
                <p className="text-sm text-neutral-500 mt-1">
                  Properties with popular amenities attract more bookings and higher ratings.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {availableAmenities.map((amenity) => {
                  const isSelected = selectedAmenityIds.includes(amenity.id);
                  return (
                    <button
                      key={amenity.id}
                      type="button"
                      onClick={() => toggleAmenity(amenity.id)}
                      className={cn(
                        "p-3.5 rounded-2xl border text-left flex items-center justify-between transition",
                        isSelected
                          ? "border-neutral-900 bg-neutral-50 ring-1 ring-neutral-900 shadow-sm"
                          : "border-neutral-200 hover:border-neutral-400 bg-white"
                      )}
                    >
                      <span className="text-xs sm:text-sm font-semibold text-neutral-900">
                        {amenity.name}
                      </span>
                      {isSelected && (
                        <Check className="w-4 h-4 text-neutral-900 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 6: Photos & Gallery */}
          {currentStep === 6 && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h2 className="text-2xl font-bold text-neutral-900">
                  Add photos of your property
                </h2>
                <p className="text-sm text-neutral-500 mt-1">
                  Airbnb listings with 5 or more photos look best in the photo collage.
                </p>
              </div>

              {/* 1-Click Sample Presets */}
              <div className="p-4 bg-rose-50/70 border border-rose-100 rounded-2xl space-y-2.5">
                <div className="flex items-center gap-2 text-airbnb-rose text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  <span>Quick Presets: Populate 5 High-Res Photos in 1 Click</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {SAMPLE_PHOTO_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => handleApplyPhotoPreset(preset.photos)}
                      className="px-3 py-1.5 rounded-xl bg-white border border-rose-200 text-xs font-semibold text-neutral-800 hover:border-airbnb-rose hover:text-airbnb-rose shadow-sm transition"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Add Custom Image URL */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-neutral-700">
                  Add image by URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-300 text-sm font-medium text-neutral-900 focus:outline-none focus:border-neutral-900"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomImage}
                    className="px-4 py-2.5 bg-neutral-900 text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-black transition flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              {/* Photo Preview Grid */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center text-xs font-semibold text-neutral-600">
                  <span>Current Photos ({imageUrls.length})</span>
                  {imageUrls.length >= 5 ? (
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Collage Ready (5+ photos)</span>
                    </span>
                  ) : (
                    <span className="text-amber-600">
                      Add {5 - imageUrls.length} more for optimal 5-photo collage
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {imageUrls.map((url, index) => (
                    <div
                      key={index}
                      className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-100 group"
                    >
                      <Image
                        src={url}
                        alt={`Photo ${index + 1}`}
                        fill
                        sizes="240px"
                        className="object-cover"
                      />
                      {index === 0 && (
                        <div className="absolute top-2 left-2 bg-neutral-900 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md shadow">
                          Cover Photo
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition hover:bg-black"
                        title="Remove photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Navigation Bar */}
        <div className="mt-8 flex items-center justify-between">
          <button
            type="button"
            disabled={currentStep === 1}
            onClick={handleBack}
            className="px-5 py-2.5 rounded-xl border border-neutral-300 font-semibold text-sm text-neutral-800 hover:bg-neutral-100 disabled:opacity-30 transition flex items-center gap-1.5"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          {currentStep < STEPS.length ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl bg-neutral-900 hover:bg-black text-white font-semibold text-sm transition shadow flex items-center gap-1.5"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#E61E4D] via-[#E31C5F] to-[#D70466] hover:opacity-95 text-white font-bold text-sm transition shadow-lg flex items-center gap-2 disabled:opacity-50 active:scale-95"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Publishing...</span>
                </>
              ) : (
                <span>{isEditing ? "Save Changes" : "Publish Listing"}</span>
              )}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
