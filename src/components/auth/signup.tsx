"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import SocialLogin from "../layout/SocialLogin";
import { API_BASE } from "@/lib/api";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

const schema = yup.object({
  fullName: yup.string().required("Name is required").min(2, "Min 2 characters"),
  phoneNumber: yup
    .string()
    .trim()
    .required("Phone Number is required")
    .matches(
      /^(\+?8801[3-9]\d{8}|01[3-9]\d{8}|\+?[0-9]{7,15})$/,
      "Enter a valid phone number (e.g. 016XXXXXXXX or +8801XXXXXXXXX)"
    ),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().required("Password is required").min(6, "Min 6 characters"),
  confirmPassword: yup
    .string()
    .required("Confirm password is required")
    .oneOf([yup.ref("password")], "Passwords must match"),
});

type FormData = yup.InferType<typeof schema>;

export function SignUpForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: yupResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      const { confirmPassword, ...body } = data;
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await res.json();

      if (res.ok && result.success !== false) {
        toast.success("Verification code sent to your phone number!");
        // Pass phone number to verification page via query param
        router.push(`/verify-login?phone=${encodeURIComponent(data.phoneNumber)}`);
      } else {
        toast.error(result.message || "Registration failed. Please try again.");
      }
    } catch {
      toast.error("An error occurred. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full">
      <div className="space-y-2 text-left">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          type="text"
          placeholder="John Doe"
          {...register("fullName")}
          aria-invalid={!!errors.fullName}
        />
        {errors.fullName && <p className="text-sm text-red-500">{errors.fullName.message}</p>}
      </div>

      <div className="space-y-2 text-left">
        <Label htmlFor="phoneNumber">Phone Number</Label>
        <Input
          id="phoneNumber"
          type="tel"
          inputMode="tel"
          placeholder="016XXXXXXXX or +8801XXXXXXXXX"
          {...register("phoneNumber")}
          aria-invalid={!!errors.phoneNumber}
        />
        {errors.phoneNumber && (
          <p className="text-sm text-red-500">{errors.phoneNumber.message}</p>
        )}
      </div>

      <div className="space-y-2 text-left">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="m@example.com"
          {...register("email")}
          aria-invalid={!!errors.email}
        />
        {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
      </div>

      <div className="space-y-2 text-left">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            {...register("password")}
            aria-invalid={!!errors.password}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
      </div>

      <div className="space-y-2 text-left">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="••••••••"
            {...register("confirmPassword")}
            aria-invalid={!!errors.confirmPassword}
          />

          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showConfirmPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
        )}
      </div>

      {/* Terms & Conditions */}
      <div className="flex items-center gap-2 text-left">
        <input
          id="terms"
          type="checkbox"
          required
          className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-primary"
        />

        <label
          htmlFor="terms"
          className="cursor-pointer text-sm text-slate-500"
        >
          I agree to the <span className="text-primary">Terms</span> & <span className="text-primary">Conditions</span> 
        </label>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          "Sending verification code..."
        ) : (
          <>
            Continue <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>

      {/* <div className="relative mb-2">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white/80 px-2 text-slate-500 rounded-full">Or continue with</span>
        </div>
      </div> */}

      <SocialLogin />
    </form>
  );
}
