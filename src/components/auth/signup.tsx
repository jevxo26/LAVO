"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import SocialLogin from "../SocialLogin";
import { API_BASE } from "@/lib/api";
import { ArrowLeft, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

const schema = yup.object({
  fullName: yup.string().required("Name is required").min(2, "Min 2 characters"),
  phoneNumber: yup
    .string()
    .trim()
    .required("Phone Number is required")
    .matches(
      /^\+?[1-9]\d{7,14}$/, "Enter a valid phone number"),
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

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...body } = data;
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await res.json();
      if (res.ok) {
        toast.success("Account created! Please sign in.");
        router.push("/login");
      } else {
        toast.error(result.message || "Registration failed");
      }
    } catch {
      toast.error("An error occurred. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full">
      <div className="space-y-2 text-left">
        <Label htmlFor="fullName">Full Name</Label>
        <Input id="fullName" type="text" placeholder="John Doe" {...register("fullName")} aria-invalid={!!errors.fullName} />
        {errors.fullName && <p className="text-sm text-red-500">{errors.fullName.message}</p>}
      </div>

      <div className="space-y-2 text-left">
        <Label htmlFor="phoneNumber">Phone Number</Label>
        <Input
          id="phoneNumber"
          type="tel"
          inputMode="tel"
          placeholder="+8801XXXXXXXXX"
          {...register("phoneNumber")}
          aria-invalid={!!errors.phoneNumber} />
        {errors.phoneNumber && <p className="text-sm text-red-500">{errors.phoneNumber.message}</p>}
      </div>

      <div className="space-y-2 text-left">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="m@example.com" {...register("email")} aria-invalid={!!errors.email} />
        {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
      </div>

      <div className="space-y-2 text-left">
        <Label htmlFor="password">Password</Label>

        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            {...register("password")} aria-invalid={!!errors.password}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>

        {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
      </div>

      <div className="space-y-2 text-left">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <div className="relative">

          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"} placeholder="••••••••"
            {...register("confirmPassword")} aria-invalid={!!errors.confirmPassword}
          />
          <button
            type="button"
            onClick={() =>
              setShowConfirmPassword(!showConfirmPassword)
            }
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showConfirmPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
        {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <input
            id="remember"
            type="checkbox"
            required
            className="h-4 w-4 rounded border-gray-300"
          />
          <Label htmlFor="remember" className="text-sm font-normal">
            I agree to LAUNDRIX's <span className="text-blue-500 font-semibold">Terms of Service</span> and <span className="text-blue-500 font-semibold">Privacy Policy</span>
          </Label>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          "Creating account..."
        ) : (
          <>
            Create Account
            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white/80 px-2 text-slate-500 rounded-full">Or continue with</span>
        </div>
      </div>

      <SocialLogin />

      {/* <div className="text-center text-sm text-slate-500 mt-4">
        Already have an account?{" "}
        <button type="button" onClick={() => router.push("/login")} className="text-indigo-600 hover:underline font-medium">
          Sign in
        </button>
      </div> */}
    </form>
  );
}
