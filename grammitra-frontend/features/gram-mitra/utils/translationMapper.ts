"use client";

export const mapStatusKey = (status: string) => {
  switch (status) {
    case "PENDING":
      return "booking.status.pending";
    case "ACCEPTED":
      return "booking.status.accepted";
    case "REJECTED":
      return "booking.status.rejected";
    default:
      return "";
  }
};

export const mapDescriptionKey = (desc: string) => {
  const normalized = desc?.toLowerCase();

  if (normalized === "service enquiry") {
    return "booking.serviceEnquiry";
  }

  return null;
};

export const mapSkillKey = (skill: string) => {
  const normalized = skill?.toLowerCase().replace(/\s+/g, "");

  return `skills.${normalized}`;
};