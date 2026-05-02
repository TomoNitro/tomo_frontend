"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { childrenApi } from "@/lib/api";
import { validatePin } from "@/lib/validation";

function FieldIcon({ kind }: { kind: "user" | "lock" }) {
  if (kind === "user") {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
        <path d="M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm-7 9a7 7 0 0 1 14 0H5Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
      <path d="M7 10V8a5 5 0 0 1 10 0v2h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h1Zm2 0h6V8a3 3 0 0 0-6 0v2Zm1 4a2 2 0 1 1 4 0c0 .8-.5 1.5-1.1 1.8V18h-1.8v-2.2A2 2 0 0 1 10 14Z" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden>
      <path d="M12 5c5.5 0 9.8 4.1 11 7-1.2 2.9-5.5 7-11 7S2.2 14.9 1 12c1.2-2.9 5.5-7 11-7Zm0 2C8.3 7 5.1 9.4 3.7 12 5.1 14.6 8.3 17 12 17s6.9-2.4 8.3-5C18.9 9.4 15.7 7 12 7Zm0 1.7A3.3 3.3 0 1 1 12 15a3.3 3.3 0 0 1 0-6.6Zm0 2A1.3 1.3 0 1 0 12 13a1.3 1.3 0 0 0 0-2.6Z" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden>
      <path d="m3.3 2 18.7 18.7-1.3 1.3-3.1-3.1A12 12 0 0 1 12 20C6.5 20 2.2 15.9 1 13c.5-1.2 1.6-2.6 3.1-3.8L2 7.3 3.3 6 22 24l-1.3 1.3L3.3 8Zm2.2 8.6A10 10 0 0 0 3.7 13c1.4 2.6 4.6 5 8.3 5 1.5 0 2.9-.4 4.1-1.1l-2-2A3.3 3.3 0 0 1 10.1 11l-1.8-1.8a8.8 8.8 0 0 0-2.8 1.4Zm5.9 1.8a1.3 1.3 0 0 0 1.5 1.5l-1.5-1.5ZM12 6c5.5 0 9.8 4.1 11 7-.4 1-1.3 2.1-2.5 3.2L19.1 15c.5-.6.9-1.3 1.2-2C18.9 10.4 15.7 8 12 8c-.9 0-1.8.1-2.6.4L7.8 6.8A12 12 0 0 1 12 6Zm3.2 6.9a3.3 3.3 0 0 0-4.1-4.1l4.1 4.1Z" />
    </svg>
  );
}

function InputField({
  label,
  icon,
  placeholder,
  type = "text",
  value,
  onChange,
  error,
}: {
  label: string;
  icon: "user" | "lock";
  placeholder: string;
  type?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
}) {
  const [isPinVisible, setIsPinVisible] = useState(false);
  const isPasswordField = type === "password";
  const inputType = isPasswordField && isPinVisible ? "text" : type;

  return (
    <label className="block">
      <span className="mb-2 inline-flex items-center gap-2 text-[0.84rem] font-black uppercase tracking-[0.26em] text-[#8f6519]">
        <span className="inline-flex h-5 w-5 items-center justify-center text-[#9c700d]">
          <FieldIcon kind={icon} />
        </span>
        {label}
      </span>
      <span className="relative block">
        <input
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          className={`h-14 w-full rounded-full border bg-[#f9efdb] px-5 text-[1rem] font-semibold text-[#53443b] outline-none transition placeholder:text-[#c7bdb0] ${
            error
              ? "border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/14 focus:bg-red-50"
              : "border-[#a9a2a2] focus:border-[#f0a22b] focus:bg-white focus:ring-4 focus:ring-[#f0a22b]/14"
          } ${isPasswordField ? "pr-14" : ""}`}
        />
        {isPasswordField ? (
          <button
            type="button"
            className="absolute inset-y-0 right-4 flex w-9 items-center justify-center text-[#6b584a] transition hover:text-[#f39211] focus:outline-none focus-visible:text-[#f39211] focus-visible:ring-2 focus-visible:ring-[#f0a22b]/40"
            onClick={() => setIsPinVisible((visible) => !visible)}
            aria-label={isPinVisible ? "Sembunyikan PIN" : "Lihat PIN"}
            aria-pressed={isPinVisible}
          >
            {isPinVisible ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        ) : null}
      </span>
      {error && (
        <p className="mt-2 text-[0.78rem] font-semibold text-red-600">{error}</p>
      )}
    </label>
  );
}

function CardShell({ children }: { children: React.ReactNode }) {
  return (
    <section className="relative w-full overflow-hidden rounded-[2.2rem] bg-[#fffaf0] px-6 py-8 shadow-[0_24px_30px_rgba(149,118,74,0.15)] ring-1 ring-black/5 sm:px-8 sm:py-10">
      <div className="absolute right-0 top-0 h-32 w-32 translate-x-1/2 -translate-y-1/2 rounded-full bg-[#f8e9ae]" />
      {children}
    </section>
  );
}

function PrimaryAction({ children, isLoading }: { children: React.ReactNode; isLoading?: boolean }) {
  return (
    <button
      type="submit"
      disabled={isLoading}
      className="inline-flex h-16 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-[#f59f1b] to-[#ff8128] px-8 text-[1.06rem] font-black text-white shadow-[0_18px_32px_rgba(243,133,28,0.26)] transition-transform duration-200 hover:enabled:-translate-y-0.5 disabled:opacity-60"
    >
      {isLoading ? "ENTERING..." : children}
    </button>
  );
}

export default function ChildLoginPage() {
  const router = useRouter();
  const [childName, setChildName] = useState("");
  const [childId, setChildId] = useState("");
  const [pin, setPin] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePinChange = (value: string) => {
    setPin(value);
    const error = validatePin(value);
    setErrors((prev) => ({
      ...prev,
      pin: error || "",
    }));
  };

  useEffect(() => {
    // Read selected child set by Profile picker
    try {
      const storedChildName = localStorage.getItem("selectedChildName") || localStorage.getItem("selectedUser") || "";
      const storedChildId = localStorage.getItem("selectedChildId") || "";
      if (!storedChildName || !storedChildId) {
        // If no child selected, go back to profile
        router.push("/profile");
        return;
      }
      queueMicrotask(() => {
        setChildName(storedChildName);
        setChildId(storedChildId);
      });
    } catch {
      // ignore
    }
  }, [router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatusMessage("");
    setIsSubmitting(true);

    // Validate
    const pinError = validatePin(pin);
    if (pinError) {
      setErrors({
        pin: pinError || "",
      });
      setStatusMessage("Harap periksa kembali form Anda");
      setIsSubmitting(false);
      return;
    }

    if (!childId) {
      setStatusMessage("Profile child tidak valid. Pilih profile lagi.");
      setIsSubmitting(false);
      return;
    }

    const response = await childrenApi.login(childId, pin);

    if (!response.success) {
      setErrors({
        pin: "PIN belum sesuai. Coba masukkan lagi ya.",
      });
      setStatusMessage(response.error ?? "PIN belum sesuai. Coba masukkan lagi ya.");
    } else {
      setStatusMessage("Login successful!");
      localStorage.setItem("selectedUser", childName);
      router.push("/child/dashboard");
    }

    setIsSubmitting(false);
  }

  return (
    <main className="min-h-screen px-6 py-10 sm:px-10 lg:px-14">
      <section className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
        <div className="order-2 lg:order-1">
          <div className="relative flex min-h-[22rem] w-full items-center justify-center lg:min-h-[30rem]">
            <div className="absolute left-1/2 top-1/2 h-[19rem] w-[19rem] -translate-x-1/2 -translate-y-[42%] rounded-full bg-[#ffe071]/55 blur-3xl" />

            <div className="relative h-[20rem] w-[16rem] sm:h-[22rem] sm:w-[18rem] flex items-center justify-center">
              <picture>
                <source srcSet={`/images/tomo1.png`} type="image/png" />
                <img
                  src={`/images/tomo1.png`}
                  alt="Tomo mascot"
                  className="h-[20rem] w-[16rem] sm:h-[22rem] sm:w-[18rem] object-contain"
                />
              </picture>
            </div>

            <div className="absolute left-1/2 top-[6%] w-[15rem] -translate-x-1/2 rounded-[20px] bg-white px-6 py-5 text-center shadow-[0_18px_32px_rgba(127,91,45,0.12)] sm:left-[18%] sm:translate-x-0">
              <p className="text-[0.95rem] font-black leading-6 text-[#31291f]">
                &quot;Ready for adventure?&quot;
              </p>
              <div className="absolute bottom-[-10px] left-[38%] h-5 w-5 rotate-45 bg-white" />
            </div>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <CardShell>
            <div className="relative z-10">
              <form onSubmit={handleSubmit}>
                <h1 className="max-w-md text-4xl font-black tracking-[-0.06em] text-[#f49416] sm:text-5xl">
                  Who&apos;s exploring?
                </h1>
                <p className="mt-3 text-[1.05rem] font-medium text-[#6b5649]">
                  Enter your PIN to continue.
                </p>

                <div className="mt-8 space-y-5">
                  <div>
                    <label className="mb-2 block text-[0.84rem] font-black uppercase tracking-[0.26em] text-[#8f6519]">
                      Profile
                    </label>
                    <div className="h-14 w-full rounded-full border bg-[#fffefc] px-5 py-3 text-[1rem] font-black text-[#53443b]">
                      {childName}
                    </div>
                  </div>
                  <InputField
                    label={`PIN`}
                    icon="lock"
                    placeholder="••••"
                    type="password"
                    value={pin}
                    onChange={handlePinChange}
                    error={errors.pin}
                  />
                </div>

                <div className="mt-8">
                  <PrimaryAction isLoading={isSubmitting}>
                    LET&apos;S GO!
                  </PrimaryAction>
                </div>

                {statusMessage ? (
                  <p className="mt-4 text-center text-[0.92rem] font-semibold text-[#8b5a18]">
                    {statusMessage}
                  </p>
                ) : null}

                <p className="mt-7 text-center text-[0.95rem] font-semibold text-[#6f5a4d]">
                  <Link href="/profile" className="font-black text-[#f39211]">
                    Back to Profile
                  </Link>
                </p>
              </form>
            </div>
          </CardShell>
        </div>
      </section>
    </main>
  );
}
