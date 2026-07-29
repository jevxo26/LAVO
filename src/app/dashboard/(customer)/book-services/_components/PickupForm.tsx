"use client";

import { MapPin, Calendar as CalendarIcon, Clock, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useRef, useState } from "react";
import { useJsApiLoader } from "@react-google-maps/api";

const GOOGLE_LIBRARIES: ("places" | "geometry")[] = ["places"];

interface PickupFormProps {
  receiverName: string;
  receiverPhone: string;
  pickupAddress: string;
  pickupDate: string;
  pickupTimeSlot: string;
  onReceiverNameChange: (v: string) => void;
  onReceiverPhoneChange: (v: string) => void;
  onPickupAddressChange: (v: string) => void;
  onPickupLatChange: (v: number | null) => void;
  onPickupLonChange: (v: number | null) => void;
  onPickupDateChange: (v: string) => void;
  onPickupTimeSlotChange: (v: string) => void;
}

export function PickupForm({
  receiverName,
  receiverPhone,
  pickupAddress,
  pickupDate,
  pickupTimeSlot,
  onReceiverNameChange,
  onReceiverPhoneChange,
  onPickupAddressChange,
  onPickupLatChange,
  onPickupLonChange,
  onPickupDateChange,
  onPickupTimeSlotChange,
}: PickupFormProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [locationConfirmed, setLocationConfirmed] = useState(false);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: GOOGLE_LIBRARIES,
  });

  useEffect(() => {
    if (!isLoaded || !inputRef.current) return;

    autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: "bd" },
      fields: ["formatted_address", "geometry", "name"],
    });

    autocompleteRef.current.addListener("place_changed", () => {
      const place = autocompleteRef.current?.getPlace();
      if (!place || !place.geometry?.location) return;

      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();

      const selectedAddress = place.formatted_address || place.name || "";

      onPickupAddressChange(selectedAddress);
      onPickupLatChange(lat);
      onPickupLonChange(lng);
      setLocationConfirmed(true);
    });


  }, [isLoaded]);


  const handleManualAddressChange = (v: string) => {
    onPickupAddressChange(v);
    // If user manually types (not from autocomplete), clear coordinates
    setLocationConfirmed(false);
    onPickupLatChange(null);
    onPickupLonChange(null);
  };

  return (
    <>
      {/* Pickup Address */}
      <div className="space-y-3 pt-2 border-t border-slate-100">
        <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
          <MapPin size={11} /> Pickup Details
        </h3>
        <div className="grid gap-2.5 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="receiverName" className="text-xs font-semibold text-slate-600">Name</Label>
            <Input
              id="receiverName"
              value={receiverName}
              onChange={(e) => onReceiverNameChange(e.target.value)}
              placeholder="Full Name"
              required
              className="h-9 text-xs rounded-xl border-slate-200 focus:border-indigo-300"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="receiverPhone" className="text-xs font-semibold text-slate-600">Phone</Label>
            <Input
              id="receiverPhone"
              value={receiverPhone}
              onChange={(e) => onReceiverPhoneChange(e.target.value)}
              placeholder="Mobile Number"
              required
              className="h-9 text-xs rounded-xl border-slate-200 focus:border-indigo-300"
            />
          </div>
        </div>

        {/* Google Places Autocomplete Address Input */}
        <div className="space-y-1">
          <Label htmlFor="pickupAddress" className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
            Full Address
            {locationConfirmed && (
              <span className="inline-flex items-center gap-1 text-emerald-600 text-[10px] font-normal">
                <CheckCircle2 size={10} />
                Location confirmed
              </span>
            )}
          </Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-2.5 text-slate-300 pointer-events-none z-10" size={13} />
            <input
              ref={inputRef}
              id="pickupAddress"
              value={pickupAddress}
              onChange={(e) => handleManualAddressChange(e.target.value)}
              placeholder="Type your address to search..."
              required
              autoComplete="off"
              className="w-full pl-9 pr-9 h-9 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:border-indigo-300 text-slate-700"
            />
            {locationConfirmed && (
              <div className="absolute right-3 top-2.5">
                <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                  <CheckCircle2 size={10} className="text-white" />
                </div>
              </div>
            )}
          </div>
          {!locationConfirmed && pickupAddress && (
            <p className="text-[10px] text-amber-600 flex items-center gap-1">
              ⚠️ Select an address from the dropdown for precise GPS location
            </p>
          )}
        </div>
      </div>

      {/* Schedule */}
      <div className="space-y-3 pt-2 border-t border-slate-100">
        <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
          <CalendarIcon size={11} /> Schedule Pickup
        </h3>
        <div className="grid gap-2.5 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="pickupDate" className="text-xs font-semibold text-slate-600">Date</Label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-2.5 text-slate-300 pointer-events-none" size={13} />
              <Input
                id="pickupDate"
                type="date"
                value={pickupDate}
                onChange={(e) => onPickupDateChange(e.target.value)}
                required
                className="pl-9 h-9 text-xs rounded-xl border-slate-200 focus:border-indigo-300"
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="pickupTimeSlot" className="text-xs font-semibold text-slate-600">Time Slot</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-2.5 text-slate-300 pointer-events-none z-10" size={13} />
              <select
                id="pickupTimeSlot"
                value={pickupTimeSlot}
                onChange={(e) => onPickupTimeSlotChange(e.target.value)}
                className="w-full pl-9 h-9 text-xs border border-slate-200 rounded-xl bg-white px-3 focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:border-indigo-300 text-slate-700"
              >
                <option value="09:00 - 12:00">Morning (9 AM – 12 PM)</option>
                <option value="12:00 - 15:00">Noon (12 PM – 3 PM)</option>
                <option value="15:00 - 18:00">Afternoon (3 PM – 6 PM)</option>
                <option value="18:00 - 21:00">Evening (6 PM – 9 PM)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
