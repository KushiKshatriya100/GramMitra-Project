"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { sendChatMessage, ChatWorker } from "../services/chatService";
import WorkerCard from "./WorkerCard";

import { useTranslation } from "@/shared/i18n/useTranslation";

type Message = {
  sender: "user" | "bot";
  text?: string;
  intent?: string;
  workers?: ChatWorker[];
  booking?: any;
  navigatePath?: string | null;
  navigateLabel?: string | null;
  skillSlug?: string | null;
};

export default function Chatbot() {
  const { t, lang } = useTranslation();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Quick-reply suggestion chips shown when the conversation is empty —
  // helps discovery without forcing the user to think of what to type.
  const SUGGESTIONS: Array<{ labelKey: string; text: string }> = [
    { labelKey: "chat.suggest.findAc",     text: lang === "hi" ? "मुझे AC रिपेयर वाला चाहिए" : "I need an AC repair worker" },
    { labelKey: "chat.suggest.myBookings", text: lang === "hi" ? "मेरी बुकिंग दिखाओ"        : "Show my bookings" },
    { labelKey: "chat.suggest.editProfile",text: lang === "hi" ? "मेरी प्रोफ़ाइल बदलनी है"   : "Edit my profile" },
    { labelKey: "chat.suggest.about",      text: lang === "hi" ? "GramMitra क्या है?"        : "What is GramMitra?" },
  ];

  const navLabelFor = (path: string): string => {
    if (path.startsWith("/services/")) return t("chat.cta.viewAll");
    if (path.startsWith("/worker/"))   return t("chat.cta.viewWorker");
    if (path.includes("/profile/edit")) return t("chat.cta.editProfile");
    if (path.includes("/profile"))     return t("chat.cta.viewProfile");
    if (path.startsWith("/dashboard")) return t("chat.cta.openDashboard");
    if (path === "/services")          return t("chat.cta.openServices");
    if (path === "/about")             return t("chat.cta.openAbout");
    if (path === "/contact")           return t("chat.cta.openContact");
    return t("chat.cta.takeMe");
  };

  const send = async (textOverride?: string) => {
    const cleaned = (textOverride ?? input).trim();
    if (!cleaned || loading) return;

    setMessages((prev) => [...prev, { sender: "user", text: cleaned }]);
    setInput("");
    setLoading(true);

    try {
      const res = await sendChatMessage(cleaned);

      const botMsg: Message = {
        sender: "bot",
        text: res?.reply || t("chat.noResponse"),
        intent: res?.intent,
        workers:
          res?.intent === "FIND_WORKER" && Array.isArray(res?.data)
            ? (res.data as ChatWorker[])
            : undefined,
        booking: res?.intent === "CHECK_STATUS" ? res?.data : undefined,
        navigatePath: res?.navigatePath ?? null,
        skillSlug: res?.skillSlug ?? null,
      };

      if (botMsg.navigatePath) {
        botMsg.navigateLabel = navLabelFor(botMsg.navigatePath);
      }

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error("❌ CHAT ERROR:", err);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: t("chat.error") },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (path: string) => {
    setOpen(false);
    router.push(path);
  };

  return (
    <>
      {/* FLOATING BUTTON */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? t("chat.close") : t("chat.open")}
        className="
          fixed bottom-5 right-5 z-50
          bg-[var(--primary)] hover:bg-[var(--primary-hover)]
          text-white w-14 h-14 rounded-full grid place-items-center
          shadow-[var(--shadow-medium)]
          transition
        "
      >
        <span className="text-2xl leading-none" aria-hidden>💬</span>
      </button>

      {/* CHAT WINDOW */}
      {open && (
        <div
          className="
            fixed bottom-24 right-5 z-50
            w-[92vw] max-w-[380px] h-[600px] max-h-[80vh]
            bg-[var(--card)] border border-[var(--border)]
            rounded-2xl shadow-[var(--shadow-medium)]
            flex flex-col overflow-hidden
          "
        >
          {/* HEADER */}
          <div className="px-4 py-3 bg-[var(--primary)] text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span aria-hidden>🌾</span>
              <span className="font-semibold">{t("chat.title")}</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label={t("chat.close")}
              className="text-lg opacity-80 hover:opacity-100"
            >
              ✕
            </button>
          </div>

          {/* MESSAGES */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-[var(--bg)]">

            {/* EMPTY STATE + QUICK REPLIES */}
            {messages.length === 0 && (
              <div className="space-y-3">
                <div className="text-sm text-[var(--text-soft)] text-center mt-2 px-2 leading-relaxed">
                  {t("chat.welcome")}
                </div>

                <div className="flex flex-wrap gap-2 justify-center pt-1">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s.labelKey}
                      onClick={() => send(s.text)}
                      className="
                        text-xs px-3 py-1.5 rounded-full
                        bg-[var(--primary-soft)] text-[var(--primary)]
                        border border-[var(--primary)]/30
                        hover:bg-[var(--primary)] hover:text-white
                        transition
                      "
                    >
                      {s.text}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* MESSAGES */}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col ${
                  msg.sender === "user" ? "items-end" : "items-start"
                }`}
              >
                {msg.text && (
                  <div
                    className={`
                      text-sm px-3 py-2 rounded-2xl max-w-[85%]
                      whitespace-pre-wrap break-words
                      ${
                        msg.sender === "user"
                          ? "bg-[var(--primary)] text-white rounded-br-sm"
                          : "bg-[var(--card)] text-[var(--text)] border border-[var(--border)] rounded-bl-sm"
                      }
                    `}
                  >
                    {msg.text}
                  </div>
                )}

                {/* WORKER LIST (FIND_WORKER) */}
                {msg.workers && msg.workers.length > 0 && (
                  <div className="mt-3 w-full space-y-3">
                    {msg.workers.slice(0, 3).map((worker) => (
                      <WorkerCard
                        key={worker.id}
                        worker={worker as any}
                        matchedSkill={msg.skillSlug ?? undefined}
                      />
                    ))}
                  </div>
                )}

                {/* NAVIGATE CTA (any bot message with a route) */}
                {msg.sender === "bot" && msg.navigatePath && (
                  <button
                    onClick={() => handleNavigate(msg.navigatePath!)}
                    className="
                      mt-2 inline-flex items-center gap-2
                      text-xs font-semibold px-3 py-1.5 rounded-full
                      bg-[var(--primary)] text-white
                      hover:bg-[var(--primary-hover)]
                      shadow-[var(--shadow-soft)]
                      transition
                    "
                  >
                    <span>{msg.navigateLabel || t("chat.cta.takeMe")}</span>
                    <span aria-hidden>→</span>
                  </button>
                )}

                {/* BOOKING STATUS */}
                {msg.booking && (
                  <div className="mt-2 bg-[var(--card)] text-[var(--text)] border border-[var(--border)] rounded-xl p-3 text-sm shadow-[var(--shadow-soft)]">
                    <div className="font-semibold mb-1">
                      {t("chat.bookingStatus")}
                    </div>
                    <div>{msg.booking?.status || t("common.na")}</div>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="text-sm text-[var(--text-soft)] animate-pulse">
                {t("chat.typing")}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* INPUT */}
          <div className="p-3 border-t border-[var(--border)] flex gap-2 bg-[var(--card)]">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("chat.placeholder")}
              disabled={loading}
              className="
                flex-1 border border-[var(--border)] rounded-xl
                px-3 py-2 text-sm
                bg-[var(--bg)] text-[var(--text)]
                placeholder:text-[var(--text-muted)]
                outline-none
                focus:border-[var(--primary)]
              "
              onKeyDown={(e) => {
                if (e.key === "Enter" && !loading) send();
              }}
            />
            <button
              onClick={() => send()}
              disabled={loading || !input.trim()}
              className="
                bg-[var(--primary)] hover:bg-[var(--primary-hover)]
                text-white px-4 rounded-xl text-sm
                disabled:opacity-50 disabled:cursor-not-allowed
                transition
              "
            >
              {loading ? "…" : t("chat.send")}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
