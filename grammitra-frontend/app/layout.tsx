import "./globals.css";
import { Toaster } from "react-hot-toast";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="relative min-h-screen antialiased selection:bg-orange-100 selection:text-orange-600">

        {/* ✅ GLOBAL BACKGROUND IMAGE */}
        <div className="fixed inset-0 -z-10">
          <img
            src="/images/village11.jpg"
            alt="background"
            className="w-full h-full object-cover"
          />
        </div>

        {/* ✅ OPTIONAL OVERLAY (for readability) */}
        <div className="fixed inset-0 bg-white/70 -z-10" />

        {/* ✅ CONTENT */}
        {children}

        {/* ✅ TOAST */}
        <Toaster position="top-right" reverseOrder={false} />
      </body>
    </html>
  );
}