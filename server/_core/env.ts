const resolvedAppId =
  process.env.VITE_APP_ID?.trim() ||
  process.env.APP_ID?.trim() ||
  "nc-tax-deed-local-app";

if (!process.env.VITE_APP_ID?.trim() && !process.env.APP_ID?.trim()) {
  console.warn(
    "[ENV] VITE_APP_ID is not set, falling back to 'nc-tax-deed-local-app'. Set VITE_APP_ID for production deployments."
  );
}

export const ENV = {
  appId: resolvedAppId,
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
};
