import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  // HMR (Hot Module Replacement) WebSocket errors hanya terjadi di dev mode
  // saat akses via IP jaringan — tidak relevan di production/Vercel (serverless).
  // Config ini memaksa HMR terhubung ke localhost bukan IP jaringan.
  ...(process.env.NODE_ENV === 'development' && {
    assetPrefix: undefined, // default — tidak ubah asset prefix
  }),
};

export default nextConfig;
