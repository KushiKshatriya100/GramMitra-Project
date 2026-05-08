"use client";

import { useEffect, useRef, useState } from "react";

import { sendChatMessage } from "../services/chatService";

import WorkerCard from "./WorkerCard";

import { useTranslation } from "@/shared/i18n/useTranslation";

type Worker = {
  id: string;
  profileImage?: string;
  gender?: string;
  age?: number;
  location?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  skills?: string[];
  experience?: number;
  wage?: number;
  availability?: boolean;
  bio?: string;
  rating?: number;
  totalReviews?: number;
  jobsCompleted?: number;
  profileCompletion?: number;
  profileCompleted?: boolean;
};

type Message = {
  sender: "user" | "bot";
  text?: string;
  workers?: Worker[];
  intent?: string;
  booking?: any;
};

export default function Chatbot() {

  const { t } = useTranslation();

  const [open, setOpen] = useState(false);

  const [input, setInput] = useState("");

  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState<Message[]>([]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // ✅ AUTO SCROLL
  useEffect(() => {

    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });

  }, [messages]);

  // ✅ SEND MESSAGE
  const sendMessage = async () => {

    const cleanedMessage = input.trim();

    if (!cleanedMessage || loading) {
      return;
    }

    // ✅ ADD USER MESSAGE
    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text: cleanedMessage,
      },
    ]);

    setInput("");

    setLoading(true);

    try {

      const res = await sendChatMessage(cleanedMessage);

      console.log("🤖 CHAT RESPONSE:", res);

      const botMessage: Message = {
        sender: "bot",
        text: res?.reply || t("chat.noResponse"),
        intent: res?.intent,
      };

      // ✅ WORKER RESULTS
      if (
        res?.intent === "FIND_WORKER" &&
        Array.isArray(res?.data)
      ) {

        botMessage.workers = res.data;
      }

      // ✅ BOOKING DATA
      if (res?.intent === "CHECK_STATUS") {

        botMessage.booking = res?.data;
      }

      // ✅ ADD BOT MESSAGE
      setMessages((prev) => [
        ...prev,
        botMessage,
      ]);

    } catch (err) {

      console.error("❌ CHAT ERROR:", err);

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: t("chat.error"),
        },
      ]);

    } finally {

      setLoading(false);
    }
  };

  return (
    <>

      {/* 🔵 FLOATING BUTTON */}
      <button
        onClick={() => setOpen(!open)}
        className="
          fixed
          bottom-5
          right-5
          bg-[var(--primary)]
          text-white
          px-4
          py-3
          rounded-full
          shadow-lg
          z-50
        "
      >
        💬
      </button>

      {/* 🧠 CHAT WINDOW */}
      {open && (

        <div
          className="
            fixed
            bottom-20
            right-5
            w-[360px]
            h-[550px]
            bg-[var(--card)]
            border
            border-[var(--border)]
            rounded-2xl
            shadow-2xl
            flex
            flex-col
            overflow-hidden
            z-50
          "
        >

          {/* HEADER */}
          <div
            className="
              p-4
              bg-[var(--primary)]
              text-white
              font-semibold
              flex
              items-center
              justify-between
            "
          >

            <span>
              {t("chat.title")}
            </span>

            <button
              onClick={() => setOpen(false)}
              className="text-sm opacity-80 hover:opacity-100"
            >
              ✕
            </button>

          </div>

          {/* MESSAGES */}
          <div
            className="
              flex-1
              overflow-y-auto
              p-3
              space-y-3
              bg-[var(--background)]
            "
          >

            {/* EMPTY STATE */}
            {messages.length === 0 && (

              <div
                className="
                  text-sm
                  text-[var(--text-soft)]
                  text-center
                  mt-10
                  px-4
                "
              >
                {t("chat.welcome")}
              </div>
            )}

            {/* CHAT MESSAGES */}
            {messages.map((msg, i) => (

              <div
                key={i}
                className={`
                  flex
                  flex-col
                  ${
                    msg.sender === "user"
                      ? "items-end"
                      : "items-start"
                  }
                `}
              >

                {/* TEXT MESSAGE */}
                {msg.text && (

                  <div
                    className={`
                      text-sm
                      px-3
                      py-2
                      rounded-2xl
                      max-w-[85%]
                      whitespace-pre-wrap
                      break-words
                      ${
                        msg.sender === "user"
                          ? "bg-[var(--primary)] text-white"
                          : "bg-gray-200 text-black"
                      }
                    `}
                  >
                    {msg.text}
                  </div>
                )}

                {/* 👷 WORKERS */}
                {msg.workers &&
                  msg.workers.length > 0 && (

                  <div className="mt-3 w-full space-y-3">

                    {msg.workers.map((worker) => (

                      <WorkerCard
                        key={worker.id}
                        worker={worker}
                      />
                    ))}

                  </div>
                )}

                {/* 📊 BOOKING STATUS */}
                {msg.booking && (

                  <div
                    className="
                      mt-2
                      bg-white
                      border
                      border-[var(--border)]
                      rounded-xl
                      p-3
                      text-sm
                      shadow-sm
                    "
                  >

                    <div className="font-semibold mb-1">
                      {t("chat.bookingStatus")}
                    </div>

                    <div>
                      {msg.booking?.status || t("common.na")}
                    </div>

                  </div>
                )}

              </div>
            ))}

            {/* ⏳ LOADING */}
            {loading && (

              <div
                className="
                  text-sm
                  text-[var(--text-soft)]
                  animate-pulse
                "
              >
                {t("chat.typing")}
              </div>
            )}

            <div ref={messagesEndRef} />

          </div>

          {/* INPUT */}
          <div
            className="
              p-3
              border-t
              border-[var(--border)]
              flex
              gap-2
              bg-[var(--card)]
            "
          >

            <input
              value={input}

              onChange={(e) =>
                setInput(e.target.value)
              }

              placeholder={t("chat.placeholder")}

              disabled={loading}

              className="
                flex-1
                border
                border-[var(--border)]
                rounded-xl
                px-3
                py-2
                text-sm
                bg-[var(--background)]
                outline-none
              "

              onKeyDown={(e) => {

                if (
                  e.key === "Enter" &&
                  !loading
                ) {

                  sendMessage();
                }
              }}
            />

            <button
              onClick={sendMessage}

              disabled={loading}

              className="
                bg-[var(--primary)]
                text-white
                px-4
                rounded-xl
                text-sm
                disabled:opacity-50
              "
            >
              {loading
                ? "..."
                : t("chat.send")}
            </button>

          </div>

        </div>
      )}
    </>
  );
}