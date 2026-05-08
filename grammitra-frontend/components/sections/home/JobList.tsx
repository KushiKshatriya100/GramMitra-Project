"use client";

import { useEffect, useState } from "react";
import Loader from "@/components/ui/Loader";
import { useTranslation } from "@/shared/i18n/useTranslation";
import api from "@/lib/api";

type Job = {
  id: string;
  workerId: string;
  employerId: string;
  status: string;
  createdAt?: string;
};

export default function JobList({ role }: { role: "worker" | "employer" }) {
  const { t, lang } = useTranslation();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);

        const endpoint =
          role === "worker" ? "/jobs/worker" : "/jobs/employer";

        const res = await api.get(endpoint);
        setJobs(res.data || []);
      } catch (err) {
        console.error("Job fetch error:", err);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [role]);

  if (!lang) return null;

  if (loading) return <Loader />;

  if (jobs.length === 0) {
    return (
      <p className="text-center text-gray-500">
        {t("jobs.noJobs")}
      </p>
    );
  }

  return (
    <div className="grid gap-4">
      {jobs.map((job) => (
        <div
          key={job.id}
          className="card-base flex justify-between items-center"
        >
          <div>
            <p className="font-semibold">
              {t("jobs.job")} #{job.id.slice(-5)}
            </p>

            <p className="text-sm text-gray-500">
              {t("jobs.status")}:{" "}
              <span className="font-medium">
                {job.status}
              </span>
            </p>
          </div>

          <div className="text-sm text-gray-400">
            {job.createdAt
              ? new Date(job.createdAt).toLocaleDateString()
              : ""}
          </div>
        </div>
      ))}
    </div>
  );
}