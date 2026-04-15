import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/sections/home/Hero";
import Services from "@/components/sections/home/Services";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <Hero
        title="Connecting Villages to Opportunities"
        subtitle="Find trusted workers near you — simple, fast, reliable"
        backgroundImage="/images/village11.jpg" // ✅ FIXED
        />


      <Services />
    </div>
  );
}