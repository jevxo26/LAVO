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
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

const schema = yup.object({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().required("Password is required"),
});

type FormData = yup.InferType<typeof schema>;

export function SignInForm() {
  const { login, isLoading, error, dismissError } = useAuth();
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  // Show backend error via toast
  useEffect(() => {
    if (error) {
      toast.error(error);
      dismissError();
    }
  }, [error, dismissError]);

  const onSubmit = async (data: FormData) => {
    const success = await login(data.email, data.password);
    if (success) toast.success("Signed in successfully!");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full">
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
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          {...register("password")}
          aria-invalid={!!errors.password}
        />
        {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
      </div>

      <div className="text-right">
        <button
          type="button"
          onClick={() => router.push("/forgot-password")}
          className="text-sm text-indigo-600 hover:underline"
        >
          Forgot password?
        </button>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Signing in..." : "Sign In"}
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

      <div className="text-center text-sm text-slate-500 mt-4">
        Don&apos;t have an account?{" "}
        <button type="button" onClick={() => router.push("/register")} className="text-indigo-600 hover:underline font-medium">
          Sign up
        </button>
      </div>
    </form>
  );
}
