"use client";

import { useState } from "react";
import { childrenApi, type ChildProfile } from "@/lib/api";
import { getChildAvatarSrc } from "@/lib/child-avatar";
import { validatePin } from "@/lib/validation";

type Mode = "picker" | "add-child" | "child-login";

interface ChildrenPickerProps {
  childProfiles: ChildProfile[];
  onChildSelect: (child: ChildProfile | "parent") => void;
  onAddChild?: (username: string, pin: string) => void;
  isLoadingChildren?: boolean;
  defaultMode?: Mode;
  onClose?: () => void;
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

function InputFieldSmall({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
  error,
}: {
  label: string;
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
    <div className="block">
      <label className="mb-2 block text-[0.84rem] font-black uppercase tracking-[0.26em] text-[#8f6519]">
        {label}
      </label>
      <div className="relative">
        <input
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          className={`h-12 w-full rounded-2xl border px-4 text-[0.9rem] font-semibold text-[#53443b] outline-none transition placeholder:text-[#c7bdb0] ${
            error
              ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/14 focus:bg-red-50"
              : "border-[#a9a2a2] bg-[#f9efdb] focus:border-[#f0a22b] focus:bg-white focus:ring-2 focus:ring-[#f0a22b]/14"
          } ${isPasswordField ? "pr-12" : ""}`}
        />
        {isPasswordField ? (
          <button
            type="button"
            className="absolute inset-y-0 right-3 flex w-8 items-center justify-center text-[#6b584a] transition hover:text-[#f39211] focus:outline-none focus-visible:text-[#f39211] focus-visible:ring-2 focus-visible:ring-[#f0a22b]/40"
            onClick={() => setIsPinVisible((visible) => !visible)}
            aria-label={isPinVisible ? "Sembunyikan PIN" : "Lihat PIN"}
            aria-pressed={isPinVisible}
          >
            {isPinVisible ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        ) : null}
      </div>
      {error && (
        <p className="mt-1 text-[0.75rem] font-semibold text-red-600">{error}</p>
      )}
    </div>
  );
}

function PrimaryButton({
  children,
  onClick,
  disabled,
  isLoading,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className="inline-flex h-14 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-[#f59f1b] to-[#ff8128] px-8 text-[1rem] font-black text-white shadow-[0_18px_32px_rgba(243,133,28,0.26)] transition-all duration-200 hover:enabled:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {isLoading ? "LOADING..." : children}
    </button>
  );
}

function SecondaryButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex h-12 w-full items-center justify-center rounded-2xl border-2 border-[#f39211] px-6 text-[0.95rem] font-black text-[#f39211] transition-all duration-200 hover:-translate-y-0.5"
    >
      {children}
    </button>
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

function ProfileCard({
  name,
  avatarSrc,
  onClick,
  isAddButton = false,
  isParent = false,
}: {
  name: string;
  avatarSrc?: string;
  onClick: () => void;
  isAddButton?: boolean;
  isParent?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`group relative flex flex-col items-center gap-4 transition-all duration-300 ${
        isAddButton ? "cursor-pointer" : "cursor-pointer"
      }`}
    >
      {/* Outer glow on hover */}
      <div
        className={`absolute -inset-4 rounded-full bg-gradient-to-r from-[#f59f1b]/20 to-[#ff8128]/20 blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100 ${
          !isAddButton ? "group-hover:from-[#f59f1b]/40 group-hover:to-[#ff8128]/40" : ""
        }`}
      />

      {/* Profile Circle */}
      <div
        className={`relative flex h-40 w-40 items-center justify-center overflow-hidden transition-all duration-300 group-hover:scale-110 ${
          isParent
            ? "bg-white/10 backdrop-blur-sm"
            : isAddButton
              ? "border-4 border-dashed border-[#dcc4ac] bg-[#f3e5d2] group-hover:border-[#f39211] group-hover:bg-[#ffe071]/30"
              : "bg-transparent"
        }`}
      >
        {isParent ? (
          <picture>
            <source srcSet="/images/tomo3.png" type="image/png" />
            <img
              src="/images/tomo3.png"
              alt="Tomo parent"
              className="h-full w-full object-cover"
            />
          </picture>
        ) : !isAddButton ? (
          <picture>
            <source srcSet={avatarSrc} type="image/png" />
            <img
              src={avatarSrc}
              alt={name}
              className="h-full w-full object-contain"
            />
          </picture>
        ) : (
          <span className="text-6xl font-light leading-none text-[#8f7b69] transition-all duration-300 group-hover:text-[#f39211] group-hover:scale-125">
            +
          </span>
        )}
      </div>

      {/* Name Label */}
      <span
        className={`text-center text-lg font-black transition-all duration-300 ${
          isAddButton
            ? "text-[#8d7661] group-hover:text-[#f39211]"
            : "text-[#3d3128] group-hover:text-[#f39211] group-hover:scale-110"
        }`}
      >
        {name}
      </span>
    </button>
  );
}

export function ChildrenPickerModal({
  childProfiles: childrenList = [],
  onChildSelect,
  onAddChild,
  defaultMode = "picker",
  onClose,
}: ChildrenPickerProps) {
  const [mode, setMode] = useState<Mode>(defaultMode);
  const [childUsername, setChildUsername] = useState("");
  const [childPin, setChildPin] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const handleAddChildClick = () => {
    setMode("add-child");
    setChildUsername("");
    setChildPin("");
    setErrors({});
    setStatusMessage("");
  };

  const handleBack = () => {
    if (onClose) {
      onClose();
      return;
    }

    setMode("picker");
    setChildUsername("");
    setChildPin("");
    setErrors({});
    setStatusMessage("");
  };

  const handlePinChange = (value: string) => {
    setChildPin(value);
    const error = validatePin(value);
    setErrors((prev) => ({
      ...prev,
      pin: error || "",
    }));
  };

  const handleAddChildSubmit = async () => {
    setStatusMessage("");
    setIsSubmitting(true);

    const pinError = validatePin(childPin);
    if (!childUsername.trim() || pinError) {
      setErrors({
        username: !childUsername.trim() ? "Username tidak boleh kosong" : "",
        pin: pinError || "",
      });
      setStatusMessage("Harap periksa kembali form Anda");
      setIsSubmitting(false);
      return;
    }

    const response = await childrenApi.register(childUsername, childPin);

    if (!response.success) {
      setStatusMessage(response.error ?? "Profil anak belum bisa ditambahkan. Silakan coba lagi.");
    } else {
      setStatusMessage("Anak berhasil ditambahkan!");
      onAddChild?.(childUsername, childPin);
      setTimeout(() => handleBack(), 1500);
    }

    setIsSubmitting(false);
  };

  if (mode === "add-child") {
    return (
      <main className="fixed inset-0 z-50 min-h-screen bg-[#fffaf0] px-6 py-10 sm:px-10 lg:px-14">
        <div className="absolute left-0 top-0 h-[32rem] w-[32rem] rounded-full bg-[#ffe071]/35 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[28rem] w-[28rem] rounded-full bg-[#f0a22b]/20 blur-3xl" />

        <section className="relative mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
          <div className="order-2 lg:order-1">
            <div className="relative flex min-h-[22rem] w-full items-center justify-center lg:min-h-[30rem]">
              <div className="absolute left-1/2 top-1/2 h-[19rem] w-[19rem] -translate-x-1/2 -translate-y-[42%] rounded-full bg-[#ffe071]/55 blur-3xl" />

              <div className="relative flex h-[20rem] w-[16rem] items-center justify-center sm:h-[22rem] sm:w-[18rem]">
                <picture>
                  <source srcSet="/images/tomo1.png" type="image/png" />
                  <img
                    src="/images/tomo1.png"
                    alt="Tomo mascot"
                    className="h-[20rem] w-[16rem] object-contain sm:h-[22rem] sm:w-[18rem]"
                  />
                </picture>
              </div>

              <div className="absolute left-1/2 top-[6%] w-[15rem] -translate-x-1/2 rounded-[20px] bg-white px-6 py-5 text-center shadow-[0_18px_32px_rgba(127,91,45,0.12)] sm:left-[18%] sm:translate-x-0">
                <p className="text-[0.95rem] font-black leading-6 text-[#31291f]">
                  &quot;Ready to add a new profile?&quot;
                </p>
                <div className="absolute bottom-[-10px] left-[38%] h-5 w-5 rotate-45 bg-white" />
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <CardShell>
              <div className="relative z-10">
                <div>
                  <h2 className="max-w-md text-4xl font-black tracking-[-0.06em] text-[#f49416] sm:text-5xl">
                    Add Profile
                  </h2>
                  <p className="mt-3 text-[1.05rem] font-medium text-[#6b5649]">
                    Enter a name and PIN for the new child profile.
                  </p>

                  <div className="mt-8 space-y-5">
                    <InputFieldSmall
                      label="Profile Name"
                      placeholder="username"
                      value={childUsername}
                      onChange={(value) => {
                        setChildUsername(value);
                        setErrors((prev) => ({
                          ...prev,
                          username: "",
                        }));
                      }}
                      error={errors.username}
                    />
                    <InputFieldSmall
                      label="PIN"
                      placeholder="1234"
                      type="password"
                      value={childPin}
                      onChange={handlePinChange}
                      error={errors.pin}
                    />
                  </div>

                  <div className="mt-8 space-y-3">
                    <PrimaryButton
                      onClick={handleAddChildSubmit}
                      isLoading={isSubmitting}
                    >
                      ADD PROFILE
                    </PrimaryButton>
                    <SecondaryButton onClick={handleBack}>CANCEL</SecondaryButton>
                  </div>

                  {statusMessage && (
                    <p className="mt-4 text-center text-[0.9rem] font-semibold text-[#8b5a18]">
                      {statusMessage}
                    </p>
                  )}
                </div>
              </div>
            </CardShell>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-[#fffaf0] via-[#fff5e6] to-[#ffe8cc] px-6 py-20 sm:px-10 lg:px-14">
      {/* Decorative elements */}
      <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-[#ffe071]/20 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-[#f0a22b]/10 blur-3xl" />

      <section className="relative mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-20 text-center">
          <h1 className="text-5xl font-black tracking-[-0.06em] text-[#f49416] sm:text-6xl lg:text-7xl">
            Who&apos;s exploring?
          </h1>
          <p className="mt-6 text-lg font-medium text-[#5f4d42] sm:text-xl">
            Select a profile to continue with Tomo
          </p>
        </div>

        {/* Profiles Grid */}
        <div className="mb-20">
          <div className="grid w-full grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-4 lg:gap-12 xl:gap-16">
            {/* Parent Avatar - Always first */}
            <div className="flex justify-center">
              <ProfileCard
                name="Parent"
                onClick={() => onChildSelect("parent")}
                isParent
              />
            </div>

            {/* Children Avatars */}
            {childrenList.map((childName: ChildProfile) => (
              <div key={childName.id} className="flex justify-center">
                <ProfileCard
                  name={childName.name}
                  avatarSrc={getChildAvatarSrc(childName.id || childName.name)}
                  onClick={() => onChildSelect(childName)}
                />
              </div>
            ))}

            {/* Add Profile Button */}
            <div className="flex justify-center">
              <ProfileCard
                name="Add Profile"
                onClick={handleAddChildClick}
                isAddButton
              />
            </div>
          </div>
        </div>

        {/* Footer Quote */}
        <div className="mt-20 text-center">
          <p className="text-[1.05rem] font-black text-[#f49416]">
            Start Your Adventure Now!
          </p>
        </div>
      </section>
    </main>
  );
}
