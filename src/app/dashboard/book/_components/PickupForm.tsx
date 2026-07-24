"use client";

import { MapPin, Calendar as CalendarIcon, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PickupFormProps {
  receiverName: string;
  receiverPhone: string;
  pickupAddress: string;
  pickupDate: string;
  pickupTimeSlot: string;
  onReceiverNameChange: (v: string) => void;
  onReceiverPhoneChange: (v: string) => void;
  onPickupAddressChange: (v: string) => void;
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
  onPickupDateChange,
  onPickupTimeSlotChange,
}: PickupFormProps) {
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
        <div className="space-y-1">
          <Label htmlFor="pickupAddress" className="text-xs font-semibold text-slate-600">Full Address</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-2.5 text-slate-300 pointer-events-none" size={13} />
            <Input
              id="pickupAddress"
              value={pickupAddress}
              onChange={(e) => onPickupAddressChange(e.target.value)}
              placeholder="House No, Road, Area Name"
              required
              className="pl-9 h-9 text-xs rounded-xl border-slate-200 focus:border-indigo-300"
            />
          </div>
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
