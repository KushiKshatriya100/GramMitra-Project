/** @type {import('next').NextConfig} */

// Same backend URL the axios client points at. Whatever origin we list in
// connect-src MUST include the API so the SPA can talk to Spring; if this
// list and NEXT_PUBLIC_API_URL ever drift, the browser will silently
// block fetches with a CSP violation. Keep them in sync.
const apiOrigin = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// Third-party origins the SPA fetches directly from the browser. Each entry
// MUST be explicitly allow-listed in connect-src — without this, the browser
// drops the request with a CSP violation before it ever leaves the page.
//   - nominatim.openstreetmap.org : reverse-geocoding for worker location
//     labels (see shared/geo/reverseGeocode.ts).
//   - {api,checkout,lumberjack}.razorpay.com : Razorpay Checkout SDK fires
//     XHRs to api.razorpay.com (orders, payments) and lumberjack.razorpay.com
//     (analytics) once the modal opens.
const externalApis = [
  "https://nominatim.openstreetmap.org",
  "https://api.razorpay.com",
  "https://checkout.razorpay.com",
  "https://lumberjack.razorpay.com",
];

// Razorpay Checkout SDK is loaded dynamically from this origin
// (see BookingCard.tsx#loadRazorpay). Listed separately because it
// needs script-src + frame-src as well as connect-src.
const razorpayScriptOrigin = "https://checkout.razorpay.com";

// Origins allowed as iframe sources. Razorpay opens its payment modal in
// an iframe served from these origins; without listing them in frame-src
// the modal renders as a blank box.
const frameSrcOrigins = [
  "https://api.razorpay.com",
  "https://checkout.razorpay.com",
];

const isDev = process.env.NODE_ENV !== "production";

// Content-Security-Policy.
//
// The goal is to make XSS substantially harder even if a stored-XSS sink
// slips into the codebase: an attacker who manages to inject <script> can
// neither load remote code nor exfiltrate to a third-party origin.
//
// Notes:
//   - 'unsafe-inline' on script-src is unavoidable today: Next.js 14 emits
//     small inline bootstrap scripts during hydration. Tightening this to
//     a per-request nonce requires custom middleware; deferred until the
//     framework supports it without rewriting the document pipeline.
//   - 'unsafe-eval' is added ONLY in dev — Next's react-refresh / HMR
//     runtime injects module updates via eval(). Production bundles do
//     not need eval and must not be granted it.
//   - frame-ancestors 'none' disables clickjacking (replaces X-Frame-Options).
//   - object-src 'none' kills the Flash/PDF plugin exfiltration vector.
//   - form-action 'self' prevents a successful XSS from POSTing the
//     session blob to an attacker-controlled URL.
//   - connect-src includes ws:/wss: in dev so the HMR websocket from Next
//     can reach the browser; production drops them.
const scriptSrc = isDev
  ? `script-src 'self' 'unsafe-inline' 'unsafe-eval' ${razorpayScriptOrigin}`
  : `script-src 'self' 'unsafe-inline' ${razorpayScriptOrigin}`;

const connectSrc = isDev
  ? `connect-src 'self' ${apiOrigin} ${externalApis.join(" ")} ws: wss:`
  : `connect-src 'self' ${apiOrigin} ${externalApis.join(" ")}`;

const csp = [
  "default-src 'self'",
  scriptSrc,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  connectSrc,
  // frame-ancestors 'none' protects US from being framed (clickjacking).
  // frame-src whitelists who WE may frame — needed for Razorpay's modal.
  "frame-ancestors 'none'",
  `frame-src 'self' ${frameSrcOrigins.join(" ")}`,
  // form-action allows Razorpay's checkout to POST the payment result
  // back through its own origin. Without this, the in-modal form submit
  // is blocked even though the script + frame were allowed.
  `form-action 'self' ${frameSrcOrigins.join(" ")}`,
  "base-uri 'self'",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
];

const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

module.exports = nextConfig;
