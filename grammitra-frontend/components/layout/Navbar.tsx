"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";

export default function Navbar() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const handleNavigate = (path: string) => {
    setOpen(false);
    setMobileOpen(false);
    router.push(path);
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      setUser(null);
      setOpen(false);
      setMobileOpen(false);

      router.replace("/");
      setTimeout(() => window.location.reload(), 100);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const role = user?.role?.toLowerCase();

  return (
    <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur-xl bg-black/30 border-b border-white/10 px-6 py-4 flex justify-between items-center">

      {/* LOGO */}
      <h1
        onClick={() => handleNavigate("/")}
        className="text-white font-bold text-xl cursor-pointer"
      >
        GramMitra 🌾
      </h1>

      {/* DESKTOP LINKS */}
      <div className="hidden md:flex gap-8 text-white text-sm">
        <button onClick={() => handleNavigate("/")}>Home</button>
        <button onClick={() => handleNavigate("/services")}>
          Find Workers
        </button>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-4 relative">

        {!user ? (
          <>
            <button
              onClick={() => handleNavigate("/auth/user/login")}
              className="text-white"
            >
              Login
            </button>

            <Button onClick={() => handleNavigate("/auth/user/register")}>
              Sign Up
            </Button>
          </>
        ) : (
          <>
            {/* AVATAR */}
            <div
              onClick={() => setOpen(!open)}
              className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center font-bold cursor-pointer shadow-md"
            >
              {user.name?.charAt(0)}
            </div>

            {/* 🔥 UPDATED DROPDOWN */}
            {open && (
              <div className="absolute right-0 top-14 w-64 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">

                {/* HEADER */}
                <div className="flex items-center gap-3 p-4 border-b">
                  <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold">
                    {user.name?.charAt(0)}
                  </div>

                  <div>
                    <p className="font-semibold text-gray-800">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user.phone || "Welcome back"}
                    </p>
                  </div>
                </div>

                {/* MENU */}
                <div className="flex flex-col">

                  <button
                    onClick={() => handleNavigate(`/dashboard/${role}`)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 text-gray-700"
                  >
                    📊 Dashboard
                  </button>

                  <button
                    onClick={() =>
                      handleNavigate(`/dashboard/${role}/profile`)
                    }
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 text-gray-700"
                  >
                    👤 Profile
                  </button>

                  <div className="border-t my-1"></div>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-red-500"
                  >
                    🚪 Logout
                  </button>

                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* MOBILE MENU */}
      {mobileOpen && (
        <div className="absolute top-full left-0 w-full bg-black/90 text-white flex flex-col items-center py-6 gap-4 md:hidden">

          <button onClick={() => handleNavigate("/")}>Home</button>
          <button onClick={() => handleNavigate("/services")}>
            Find Workers
          </button>

          {!user ? (
            <>
              <button onClick={() => handleNavigate("/auth/user/login")}>
                Login
              </button>
              <button onClick={() => handleNavigate("/auth/user/register")}>
                Sign Up
              </button>
            </>
          ) : (
            <>
              <button onClick={() => handleNavigate(`/dashboard/${role}`)}>
                Dashboard
              </button>
              <button
                onClick={() =>
                  handleNavigate(`/dashboard/${role}/profile`)
                }
              >
                Profile
              </button>
              <button onClick={handleLogout}>Logout</button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}