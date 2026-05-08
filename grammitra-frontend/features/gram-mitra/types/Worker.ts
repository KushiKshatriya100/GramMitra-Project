export interface Worker {
  id: string;

  // 👤 Identity
  name?: string;
  gender?: string;
  age?: number;

  // 🖼️ Profile
  profileImage?: string;
  description?: string;

  // 🌍 Location
  location?: string;
  locationMap?: Record<string, string>;

  // 📍 Nearby Search
  distance?: number;

  // 📞 Contact
  phone?: string;

  // 🛠️ Skills
  skills: string[];
  skillsMap?: Record<string, string>[];

  // 💼 Work Details
  experience?: number;

  // 🔥 Wage Compatibility
  wage?: number;
  dailyWage?: number;

  availability?: boolean;

  // 🧾 Bio
  bio?: string;
  bioMap?: Record<string, string>;

  // ⭐ Metrics
  rating?: number;
  totalReviews?: number;
  jobsCompleted?: number;

  // 🛡️ Verification
  verified?: boolean;

  // 📊 Profile Status
  profileCompletion?: number;
  profileCompleted?: boolean;

  // 💰 Booking / Payment
  bookingId?: string;

  bookingStatus?:
    | "PENDING"
    | "PAID"
    | "ACCEPTED"
    | "REJECTED"
    | "COMPLETED";

  paymentStatus?:
    | "PENDING"
    | "PAID"
    | "FAILED";

  amount?: number;

  // 🔥 FUTURE SAFE OPTIONALS

  // Service visit charge
  visitCharge?: number;

  // Response time
  responseTime?: string;

  // Languages known
  languages?: string[];

  // Working hours
  availableFrom?: string;
  availableTo?: string;

  // Emergency availability
  emergencyAvailable?: boolean;

  // Portfolio / gallery
  gallery?: string[];

  // Aadhaar / KYC
  kycVerified?: boolean;
}