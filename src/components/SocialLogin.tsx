"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import FacebookLogin from "@greatsumini/react-facebook-login";
import { useAppDispatch } from "@/store/store";
import { socialLoginThunk } from "@/store/slices/authSlice";

export default function SocialLogin() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleSocialResult = async (
    thunkResult: Awaited<ReturnType<typeof dispatch>>
  ) => {
    if (socialLoginThunk.fulfilled.match(thunkResult)) {
      toast.success("Signed in successfully!");
      router.push("/dashboard");
    } else {
      const msg = (thunkResult.payload as string) ?? "Social login failed";
      toast.error(msg);
    }
  };

  const handleGoogle = async (credentialResponse: { credential?: string }) => {
    if (!credentialResponse.credential) {
      toast.error("Google login failed — no credential received");
      return;
    }
    const result = await dispatch(
      socialLoginThunk({ provider: "google", credential: credentialResponse.credential })
    );
    handleSocialResult(result);
  };

  const handleFacebook = async (response: { accessToken?: string }) => {
    if (!response.accessToken) {
      toast.error("Facebook login failed — no access token received");
      return;
    }
    const result = await dispatch(
      socialLoginThunk({ provider: "facebook", accessToken: response.accessToken })
    );
    handleSocialResult(result);
  };

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";
  const facebookAppId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID ?? "";

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* ── Google ─────────────────────────────────────────────────────────── */}
      {googleClientId ? (
        <GoogleOAuthProvider clientId={googleClientId}>
          <div className="flex justify-center w-full">
            <GoogleLogin
              onSuccess={handleGoogle}
              onError={() => toast.error("Google login failed")}
              useOneTap={false}
              width="100%"
            />
          </div>
        </GoogleOAuthProvider>
      ) : (
        <p className="text-xs text-center text-amber-600 bg-amber-50 rounded-md p-2">
          Add <code>NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> to enable Google login
        </p>
      )}

      {/* ── Facebook ───────────────────────────────────────────────────────── */}
      {facebookAppId ? (
        <FacebookLogin
          appId={facebookAppId}
          autoLoad={false}
          fields="name,email,picture"
          onSuccess={handleFacebook}
          onFail={() => toast.error("Facebook login failed")}
          render={(renderProps: { onClick: () => void; isDisabled?: boolean }) => (
            <button
              type="button"
              onClick={renderProps.onClick}
              disabled={renderProps.isDisabled}
              className="w-full flex items-center justify-center gap-2 bg-[#1877F2] text-white rounded-md hover:bg-[#166FE5] transition-colors shadow-sm font-medium h-10 px-4 disabled:opacity-60"
            >
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
              </svg>
              Continue with Facebook
            </button>
          )}
        />
      ) : (
        <p className="text-xs text-center text-amber-600 bg-amber-50 rounded-md p-2">
          Add <code>NEXT_PUBLIC_FACEBOOK_APP_ID</code> to enable Facebook login
        </p>
      )}
    </div>
  );
}
