/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  rewrites: async () => {
    return [
      {
        source: "/api/predict",
        destination:
          process.env.NODE_ENV === "development"
            ? "http://127.0.0.1:5328/api/predict"
            : "/api/predict",
      },
    ];
  },
};

export default nextConfig;
