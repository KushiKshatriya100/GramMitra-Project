"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();

  const role = params?.role as string;

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      router.replace("/");
      return;
    }

    setUser(JSON.parse(storedUser));
  }, [router]);

  if (!user) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#FDF6EC] p-6">
      <h1 className="text-2xl font-bold mb-4">Profile Page</h1>

      <div className="bg-white p-4 rounded shadow-md w-full max-w-md">
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Phone:</strong> {user.phone}</p>
        <p><strong>Role:</strong> {user.role}</p>
      </div>

      {/* Role-based UI */}
      {role === "worker" && (
        <div className="mt-6 text-green-700 font-semibold">
          Worker Dashboard Access ✅
        </div>
      )}

      {role === "user" && (
        <div className="mt-6 text-blue-700 font-semibold">
          User Dashboard Access ✅
        </div>
      )}
    </div>
  );
}