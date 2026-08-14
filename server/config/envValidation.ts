/**
 * Validates required environment variables on server startup.
 * Throws a clear error if critical variables are missing in production.
 */
export function validateEnvironmentVariables(): void {
  const requiredEnvVars = [
    "DATABASE_URL",
    "JWT_SECRET",
  ];

  const missing: string[] = [];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  if (missing.length > 0) {
    console.error("❌ CRITICAL: Missing required environment variables:");
    missing.forEach((v) => console.error(`   - ${v}`));

    if (process.env.NODE_ENV === "production") {
      throw new Error(`Server failed to start due to missing environment variables: ${missing.join(", ")}`);
    } else {
      console.warn("⚠️ Warning: Continuing in development mode with missing env variables.");
    }
  } else {
    console.log("✅ Environment variables validated successfully.");
  }
}
