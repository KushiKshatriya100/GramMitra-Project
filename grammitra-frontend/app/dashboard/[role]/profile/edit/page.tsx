"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import {
  getMyProfile,
  updateProfile,
} from "@/features/gram-mitra/services/workerService";
import { SKILLS } from "@/features/gram-mitra/utils/skills";
import { mapSkillKey } from "@/features/gram-mitra/utils/translationMapper";
import { useTranslation } from "@/shared/i18n/useTranslation";
import toast from "react-hot-toast";

export default function EditWorkerProfile() {
  const router = useRouter();
  const { t, lang } = useTranslation();

  const [form, setForm] = useState<any>({
    profileImage: "",
    gender: "",
    age: "",
    location: "",
    latitude: 0,
    longitude: 0,
    phone: "",
    skills: [],
    experience: "",
    wage: "",
    availability: false,
    bio: "",
  });

  const [loading, setLoading] = useState(true);
  const [locLoading, setLocLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    const fetchProfile = async () => {
      try {
        const data = await getMyProfile();

        if (data && mounted) {
          setForm({
            ...(data || {}),
            phone: data.phone || "",
            skills: data.skills || [],
            bio: data.bio || "",
            gender: data.gender || "",
            location: data.location || "",
            age: data.age || "",
            experience: data.experience || "",
            wage: data.wage || "",
            availability: Boolean(data.availability),
          });
        }
      } catch {
        toast.error(t("profile.loadFailed"));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchProfile();

    return () => {
      mounted = false;
    };
  }, [lang]);

  const handleChange = (key: string, value: any) => {
    setForm((prev: any) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleImageUpload = (file: File) => {
    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      setForm((prev: any) => ({
        ...prev,
        profileImage: reader.result,
      }));
    };

    reader.readAsDataURL(file);
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error(
        t("profile.locationUnsupported") ||
          "Location not supported"
      );
      return;
    }

    setLocLoading(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;

        setForm((prev: any) => ({
          ...prev,
          latitude,
          longitude,
          location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
        }));

        toast.success(
          t("profile.locationCaptured") ||
            "Location captured"
        );

        setLocLoading(false);
      },
      () => {
        toast.error(
          t("profile.locationFailed") ||
            "Failed to get location"
        );

        setLocLoading(false);
      }
    );
  };

  const removeSkill = (skill: string) => {
    setForm((prev: any) => ({
      ...prev,
      skills: prev.skills.filter(
        (s: string) => s !== skill
      ),
    }));
  };

  const handleSubmit = async () => {
    if (!form.location || form.skills.length === 0) {
      toast.error(t("profile.fillRequired"));
      return;
    }

    const payload = {
      ...form,

      phone: form.phone?.trim() || "",

      age: Number(form.age) || 0,

      experience:
        Number(form.experience) || 0,

      wage: Number(form.wage) || 0,

      latitude:
        Number(form.latitude) || 0,

      longitude:
        Number(form.longitude) || 0,
    };

    console.log(
      "🚀 Sending worker data:",
      payload
    );

    try {
      await updateProfile(payload);

      toast.success(t("profile.updated"));

      router.push(
        "/dashboard/worker/profile"
      );
    } catch {
      toast.error(t("profile.updateFailed"));
    }
  };

  const getSkillLabel = (
    skill: string
  ) => {
    return t(mapSkillKey(skill));
  };

  if (!lang || loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)]">
        <Navbar />

        <div className="pt-32 text-center text-[var(--text-soft)]">
          {t("common.loading")}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 pt-24 pb-14">

        {/* HEADER */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-[var(--text)]">
            {t("profile.editTitle")}
          </h1>

          <p className="text-[var(--text-soft)] mt-3 text-sm md:text-base">
            {t("profile.editSubtitle") ||
              "Keep your profile updated to get better work opportunities"}
          </p>
        </div>

        {/* CARD */}
        <div
          className="
            bg-[var(--card)]
            border border-[var(--border)]
            rounded-3xl
            shadow-xl
            backdrop-blur-md
            p-8 md:p-10
            space-y-8
          "
        >

          {/* IMAGE */}
          <div className="flex flex-col items-center gap-5">

            <div
              className="
                w-32 h-32
                rounded-full
                overflow-hidden
                border-4 border-white
                shadow-lg
                bg-[var(--bg-soft)]
              "
            >
              {form.profileImage ? (
                <img
                  src={form.profileImage}
                  alt="profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="
                    w-full h-full
                    flex items-center justify-center
                    text-sm
                    text-[var(--text-soft)]
                  "
                >
                  {t("profile.noImage")}
                </div>
              )}
            </div>

            <input
              type="file"
              accept="image/*"
              className="
                text-sm
                file:mr-4
                file:py-2
                file:px-4
                file:rounded-full
                file:border-0
                file:text-sm
                file:font-medium
                file:bg-[var(--primary)]
                file:text-white
                hover:file:opacity-90
                cursor-pointer
              "
              onChange={(e) =>
                e.target.files &&
                handleImageUpload(
                  e.target.files[0]
                )
              }
            />
          </div>

          {/* FORM GRID */}
          <div className="grid md:grid-cols-2 gap-6">

            {/* PHONE */}
            <div>
              <label
                className="
                  text-sm
                  font-semibold
                  text-[var(--text)]
                "
              >
                {t("profile.phone") ||
                  "Phone Number"}
              </label>

              <input
                type="tel"
                value={form.phone}
                onChange={(e) =>
                  handleChange(
                    "phone",
                    e.target.value
                  )
                }
                className="input-primary mt-2"
                placeholder="+91XXXXXXXXXX"
              />
            </div>

            {/* LOCATION */}
            <div>
              <label
                className="
                  text-sm
                  font-semibold
                  text-[var(--text)]
                "
              >
                {t("profile.location")}
              </label>

              <input
                value={form.location}
                onChange={(e) =>
                  handleChange(
                    "location",
                    e.target.value
                  )
                }
                className="input-primary mt-2"
                placeholder={
                  t(
                    "profile.enterLocation"
                  ) ||
                  "Enter your location"
                }
              />

              <button
                onClick={handleGetLocation}
                className="
                  text-xs
                  mt-2
                  text-[var(--primary)]
                  hover:underline
                  font-medium
                "
                type="button"
              >
                {locLoading
                  ? t("common.loading") ||
                    "Getting..."
                  : "📍 Use my location"}
              </button>
            </div>

            {/* GENDER */}
            <div>
              <label
                className="
                  text-sm
                  font-semibold
                  text-[var(--text)]
                "
              >
                {t("profile.gender")}
              </label>

              <select
                value={form.gender}
                onChange={(e) =>
                  handleChange(
                    "gender",
                    e.target.value
                  )
                }
                className="input-primary mt-2"
              >
                <option value="">
                  {t("profile.select")}
                </option>

                <option value="male">
                  {t("profile.male")}
                </option>

                <option value="female">
                  {t("profile.female")}
                </option>
              </select>
            </div>

            {/* AGE */}
            <div>
              <label
                className="
                  text-sm
                  font-semibold
                  text-[var(--text)]
                "
              >
                {t("profile.age") ||
                  "Age"}
              </label>

              <input
                type="number"
                value={form.age}
                onChange={(e) =>
                  handleChange(
                    "age",
                    e.target.value
                  )
                }
                className="input-primary mt-2"
                placeholder={
                  t(
                    "profile.enterAge"
                  ) || "Enter age"
                }
              />
            </div>

            {/* EXPERIENCE */}
            <div>
              <label
                className="
                  text-sm
                  font-semibold
                  text-[var(--text)]
                "
              >
                {t(
                  "profile.experience"
                ) || "Experience"}
              </label>

              <input
                type="number"
                value={form.experience}
                onChange={(e) =>
                  handleChange(
                    "experience",
                    e.target.value
                  )
                }
                className="input-primary mt-2"
                placeholder={
                  t(
                    "profile.enterExperience"
                  ) ||
                  "Years of experience"
                }
              />
            </div>

            {/* WAGE */}
            <div>
              <label
                className="
                  text-sm
                  font-semibold
                  text-[var(--text)]
                "
              >
                {t("profile.wage") ||
                  "Daily Wage"}
              </label>

              <input
                type="number"
                value={form.wage}
                onChange={(e) =>
                  handleChange(
                    "wage",
                    e.target.value
                  )
                }
                className="input-primary mt-2"
                placeholder={
                  t(
                    "profile.enterWage"
                  ) ||
                  "Enter daily wage"
                }
              />
            </div>
          </div>

          {/* AVAILABILITY */}
          <div
            className="
              flex items-center gap-3
              bg-[var(--bg-soft)]
              px-4 py-4
              rounded-2xl
              border border-[var(--border)]
            "
          >
            <input
              type="checkbox"
              checked={form.availability}
              onChange={(e) =>
                handleChange(
                  "availability",
                  e.target.checked
                )
              }
              className="w-4 h-4"
            />

            <span className="text-sm font-medium text-[var(--text)]">
              {t("profile.available")}
            </span>
          </div>

          {/* SKILLS */}
          <div>
            <label
              className="
                text-sm
                font-semibold
                text-[var(--text)]
              "
            >
              {t("profile.skills") ||
                "Skills"}
            </label>

            <select
              className="input-primary mt-2"
              onChange={(e) => {
                const skillKey =
                  e.target.value;

                if (
                  skillKey &&
                  !form.skills.includes(
                    skillKey
                  )
                ) {
                  setForm((prev: any) => ({
                    ...prev,
                    skills: [
                      ...prev.skills,
                      skillKey,
                    ],
                  }));
                }
              }}
            >
              <option value="">
                {t(
                  "profile.selectSkill"
                )}
              </option>

              {SKILLS.map((s) => (
                <option
                  key={s}
                  value={s}
                >
                  {getSkillLabel(s)}
                </option>
              ))}
            </select>

            <div className="flex flex-wrap gap-3 mt-4">

              {form.skills.length ===
                0 && (
                <p className="text-sm text-[var(--text-soft)]">
                  {t(
                    "profile.noSkillsSelected"
                  ) ||
                    "No skills selected yet"}
                </p>
              )}

              {form.skills.map(
                (
                  s: string,
                  i: number
                ) => (
                  <span
                    key={i}
                    className="
                      flex items-center gap-2
                      px-4 py-2
                      rounded-full
                      bg-[var(--primary-light)]
                      text-[var(--primary)]
                      text-sm
                      font-medium
                      border border-[var(--primary-border)]
                    "
                  >
                    {getSkillLabel(s)}

                    <button
                      type="button"
                      onClick={() =>
                        removeSkill(s)
                      }
                      className="
                        text-xs
                        hover:text-red-500
                        transition
                      "
                    >
                      ✕
                    </button>
                  </span>
                )
              )}
            </div>
          </div>

          {/* BIO */}
          <div>
            <label
              className="
                text-sm
                font-semibold
                text-[var(--text)]
              "
            >
              {t("profile.bio") ||
                "Bio"}
            </label>

            <textarea
              value={form.bio}
              onChange={(e) =>
                handleChange(
                  "bio",
                  e.target.value
                )
              }
              className="
                input-primary
                mt-2
                min-h-[140px]
                resize-none
              "
              rows={5}
              placeholder={
                t(
                  "profile.bioPlaceholder"
                ) ||
                "Tell people about your experience and skills"
              }
            />
          </div>

          {/* SAVE BUTTON */}
          <Button
            onClick={handleSubmit}
            className="
              w-full
              mt-2
              py-3
              text-base
              font-semibold
              rounded-2xl
              shadow-md
            "
          >
            {t("profile.save")}
          </Button>
        </div>
      </div>
    </div>
  );
}