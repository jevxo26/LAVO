import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { API_BASE } from "@/lib/api";

// ── Types ─────────────────────────────────────────────────────────────────────
export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  userType: string;
  status: string;
  isVerified: boolean;
  profileImage?: string;
  lastLogin?: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// ── Token persistence (localStorage + cookie for middleware) ──────────────────
const TOKEN_KEY = "laundrix_token";

const getStoredToken = (): string | null =>
  typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;

const persistToken = (token: string) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
};

const clearToken = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0; SameSite=Lax`;
};

// ── Async Thunks ──────────────────────────────────────────────────────────────
export const loginThunk = createAsyncThunk(
  "auth/login",
  async (creds: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(creds),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message ?? "Login failed");
      return data.data as { user: AuthUser; token: string };
    } catch {
      return rejectWithValue("Network error — check your connection");
    }
  }
);

export const socialLoginThunk = createAsyncThunk(
  "auth/socialLogin",
  async (
    payload: {
      provider: "google" | "facebook";
      credential?: string;
      accessToken?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const body =
        payload.provider === "google"
          ? { credential: payload.credential }
          : { accessToken: payload.accessToken };

      const res = await fetch(
        `${API_BASE}/auth/social-login/${payload.provider}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(body),
        }
      );
      const data = await res.json();
      if (!res.ok)
        return rejectWithValue(data.error ?? `${payload.provider} login failed`);
      return data.data as { user: AuthUser; token: string };
    } catch {
      return rejectWithValue("Network error — check your connection");
    }
  }
);

export const logoutThunk = createAsyncThunk(
  "auth/logout",
  async (_, { getState }: any) => {
    const token = (getState() as { auth: AuthState }).auth.token;
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
    } catch {
      // best-effort — always clear locally even if server call fails
    }
  }
);

export const fetchMeThunk = createAsyncThunk(
  "auth/me",
  async (_, { rejectWithValue }) => {
    const token = getStoredToken();
    if (!token) return rejectWithValue("No token");
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue("Session expired");
      return { user: data.data as AuthUser, token };
    } catch {
      return rejectWithValue("Network error");
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────
const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token: getStoredToken(),
    isAuthenticated: !!getStoredToken(),
    isLoading: false,
    error: null,
  } as AuthState,

  reducers: {
    clearError(state) {
      state.error = null;
    },
    /** Manually hydrate auth (e.g. after SSR token injection) */
    setAuth(state, action: PayloadAction<{ user: AuthUser; token: string }>) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      persistToken(action.payload.token);
    },
  },

  extraReducers: (builder) => {
    // Shared helpers
    const pending = (s: AuthState) => {
      s.isLoading = true;
      s.error = null;
    };
    const fulfilled = (
      s: AuthState,
      a: PayloadAction<{ user: AuthUser; token: string }>
    ) => {
      s.isLoading = false;
      s.user = a.payload.user;
      s.token = a.payload.token;
      s.isAuthenticated = true;
      persistToken(a.payload.token);
    };
    const rejected = (s: AuthState, a: any) => {
      s.isLoading = false;
      s.error = (a.payload as string) ?? "Something went wrong";
    };

    builder
      // login
      .addCase(loginThunk.pending, pending)
      .addCase(loginThunk.fulfilled, fulfilled)
      .addCase(loginThunk.rejected, rejected)
      // social login
      .addCase(socialLoginThunk.pending, pending)
      .addCase(socialLoginThunk.fulfilled, fulfilled)
      .addCase(socialLoginThunk.rejected, rejected)
      // fetch me (session rehydration)
      .addCase(fetchMeThunk.pending, (s) => { s.isLoading = true; })
      .addCase(fetchMeThunk.fulfilled, (s, a) => {
        fulfilled(s, a);
        if (a.payload?.token) persistToken(a.payload.token);
      })
      .addCase(fetchMeThunk.rejected, (s, a) => {
        s.isLoading = false;
        if (a.payload === "Session expired") {
          s.isAuthenticated = false;
          s.token = null;
          clearToken();
        }
      })
      // logout
      .addCase(logoutThunk.fulfilled, (s) => {
        s.user = null;
        s.token = null;
        s.isAuthenticated = false;
        clearToken();
      });
  },
});

export const { clearError, setAuth } = authSlice.actions;
export default authSlice.reducer;
