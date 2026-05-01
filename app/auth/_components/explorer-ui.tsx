"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { authApi } from "@/lib/api";
import {
  validateUsername,
  validateEmail,
  validatePassword,
  validateRegistration,
} from "@/lib/validation";

type SceneTone = "wave" | "register" | "login";

function FieldIcon({ kind }: { kind: "user" | "mail" | "lock" }) {
  if (kind === "user") {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
        <path d="M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm-7 9a7 7 0 0 1 14 0H5Z" />
      </svg>
    );
  }

  if (kind === "mail") {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
        <path d="M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Zm0 3.1V16h16V9.1l-8 5.2-8-5.2Zm1.4-1.1 6.6 4.3 6.6-4.3H5.4Z" />
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

function SmallMascot({ tone }: { tone: SceneTone }) {
  const caption =
    tone === "register"
      ? '"Wowie! You\'re almost ready for the big adventure!"'
      : tone === "login"
        ? '"Welcome back, Explorer! Ready for more fun?"'
        : "";

  const imageName = tone === "login" || tone === "register" ? "tomo1" : "tomo2";

  return (
    <div className="relative flex min-h-[22rem] w-full items-center justify-center lg:min-h-[30rem]">
      <div className="absolute left-1/2 top-1/2 h-[19rem] w-[19rem] -translate-x-1/2 -translate-y-[42%] rounded-full bg-[#ffe071]/55 blur-3xl" />

      <div className="relative flex h-[20rem] w-[16rem] items-center justify-center sm:h-[22rem] sm:w-[18rem]">
        <picture>
          <source srcSet={`/images/${imageName}.png`} type="image/png" />
<<<<<<< HEAD
          <img
            src={`/images/${imageName}.png`}
            alt={`Tomo mascot ${imageName}`}
            className="h-[20rem] w-[16rem] object-contain sm:h-[22rem] sm:w-[18rem]"
          />
=======
          <img src={`/images/${imageName}.png`} alt={`Tomo mascot ${imageName}`} className="h-[20rem] w-[16rem] sm:h-[22rem] sm:w-[18rem] object-contain" />
>>>>>>> dcffc85 (feat: implement child profile management and saving goals functionality)
        </picture>
      </div>

      {caption ? (
        <div className="absolute left-1/2 top-[6%] w-[15rem] -translate-x-1/2 rounded-[20px] bg-white px-6 py-5 text-center shadow-[0_18px_32px_rgba(127,91,45,0.12)] sm:left-[18%] sm:translate-x-0">
          <p className="text-[0.95rem] font-black leading-6 text-[#31291f]">
            {caption}
          </p>
          <div className="absolute bottom-[-10px] left-[38%] h-5 w-5 rotate-45 bg-white" />
        </div>
      ) : null}
    </div>
  );
}

function InputField({
  label,
  icon,
  placeholder,
  type = "text",
  helper,
  value,
  onChange,
  error,
}: {
  label: string;
  icon: "user" | "mail" | "lock";
  placeholder: string;
  type?: string;
  helper?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
}) {
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
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          className={`h-14 w-full rounded-full border bg-[#f9efdb] px-5 text-[1rem] font-semibold text-[#53443b] outline-none transition placeholder:text-[#c7bdb0] ${
            error
              ? "border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/14 focus:bg-red-50"
              : "border-[#a9a2a2] focus:border-[#f0a22b] focus:bg-white focus:ring-4 focus:ring-[#f0a22b]/14"
          }`}
        />
        {type === "password" ? (
          <span className="absolute inset-y-0 right-5 flex items-center text-[#6b584a]">
            <EyeIcon />
          </span>
        ) : null}
      </span>
      {error ? (
        <p className="mt-2 text-[0.78rem] font-semibold text-red-600">{error}</p>
      ) : helper ? (
        <p className="mt-2 text-[0.78rem] text-[#a47b31]">{helper}</p>
      ) : null}
    </label>
  );
}

function CardShell({ children }: { children: ReactNode }) {
  return (
    <section className="relative w-full overflow-hidden rounded-[2.2rem] bg-[#fffaf0] px-6 py-8 shadow-[0_24px_30px_rgba(149,118,74,0.15)] ring-1 ring-black/5 sm:px-8 sm:py-10">
      <div className="absolute right-0 top-0 h-32 w-32 translate-x-1/2 -translate-y-1/2 rounded-full bg-[#f8e9ae]" />
      {children}
    </section>
  );
}

function PrimaryAction({ children, isLoading }: { children: ReactNode; isLoading?: boolean }) {
  return (
    <button
      type="submit"
      disabled={isLoading}
      className="inline-flex h-16 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-[#f59f1b] to-[#ff8128] px-8 text-[1.06rem] font-black text-white shadow-[0_18px_32px_rgba(243,133,28,0.26)] transition-transform duration-200 hover:enabled:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {isLoading ? "SENDING..." : children}
    </button>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleUsernameChange = (value: string) => {
    setUsername(value);
    setErrors((prev) => ({
      ...prev,
      username: validateUsername(value) || "",
    }));
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setErrors((prev) => ({
      ...prev,
      email: validateEmail(value) || "",
    }));
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setErrors((prev) => ({
      ...prev,
      password: validatePassword(value) || "",
    }));
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatusMessage("");
    setIsSubmitting(true);

    const validation = validateRegistration(username, email, password);
    if (!validation.isValid) {
      const errorMap: { [key: string]: string } = {};
      validation.errors.forEach((err) => {
        errorMap[err.field] = err.message;
      });
      setErrors(errorMap);
      setStatusMessage("Harap periksa kembali form Anda");
      setIsSubmitting(false);
      return;
    }

    const response = await authApi.register(username, email, password);

    if (!response.success) {
      setStatusMessage(response.error ?? "Akun belum bisa dibuat. Silakan coba lagi.");
    } else {
      const responseData = response.data as Record<string, any> | undefined;
      const sender = responseData?.user ?? responseData?.data ?? {};
      const savedName = typeof sender.username === "string" ? sender.username.trim() : username;
      const savedEmail = typeof sender.email === "string" ? sender.email.trim() : email;

      window.localStorage.setItem("tomoParentName", savedName);
      window.localStorage.setItem("tomoParentEmail", savedEmail);
      window.localStorage.setItem(
        "tomoParentProfile",
        JSON.stringify({ name: savedName, email: savedEmail })
      );

      setStatusMessage("Registration sent successfully.");
      setUsername("");
      setEmail("");
      setPassword("");
      setErrors({});
      router.push("/profile");
    }

    setIsSubmitting(false);
  }

  return (
    <CardShell>
      <div className="relative z-10">
        <form onSubmit={handleSubmit}>
          <h1 className="max-w-md text-4xl font-black tracking-[-0.06em] text-[#f49416] sm:text-5xl">
            Join the Expedition!
          </h1>
          <p className="mt-3 text-[1.05rem] font-medium text-[#6b5649]">
            Create your parent account below.
          </p>

          <div className="mt-8 space-y-5">
            <InputField
              label="Username"
              icon="user"
              placeholder="username"
              value={username}
              onChange={handleUsernameChange}
              error={errors.username}
            />
            <InputField
              label="Parent email"
              icon="mail"
              placeholder="parent@email.com"
              value={email}
              onChange={handleEmailChange}
              error={errors.email}
            />
            <InputField
              label="Password"
              icon="lock"
              placeholder="••••••••"
              type="password"
              value={password}
              onChange={handlePasswordChange}
              error={errors.password}
            />
          </div>

          <div className="mt-8">
            <PrimaryAction isLoading={isSubmitting}>LET'S GO!</PrimaryAction>
            <PrimaryAction>
              {isSubmitting ? "SENDING..." : "LET'S GO!"}
            </PrimaryAction>
          </div>

          {statusMessage ? (
            <p className="mt-4 text-center text-[0.92rem] font-semibold text-[#8b5a18]">
              {statusMessage}
            </p>
          ) : null}

          <p className="mt-7 text-center text-[0.95rem] font-semibold text-[#6f5a4d]">
            Already exploring?{" "}
            <Link href="/auth/login" className="font-black text-[#f39211]">
              Log In Here
            </Link>
          </p>
        </form>
      </div>
    </CardShell>
  );
}

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setErrors((prev) => ({
      ...prev,
      email: validateEmail(value) || "",
    }));
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setErrors((prev) => ({
      ...prev,
      password: validatePassword(value) || "",
    }));
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatusMessage("");
    setIsSubmitting(true);

    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    if (emailError || passwordError) {
      setErrors({
        email: emailError || "",
        password: passwordError || "",
      });
      setStatusMessage("Harap periksa kembali form Anda");
      setIsSubmitting(false);
      return;
    }

    const response = await authApi.login(email, password);

    if (!response.success) {
      setErrors({
        password: "Email atau password belum sesuai.",
      });
      setStatusMessage(response.error ?? "Email atau password belum sesuai.");
    } else {
      setStatusMessage("Login successful.");
      router.push("/profile");
    }

    setIsSubmitting(false);
  }

  return (
    <CardShell>
      <div className="relative z-10">
        <form onSubmit={handleSubmit}>
          <h1 className="max-w-md text-4xl font-black tracking-[-0.06em] text-[#f49416] sm:text-5xl">
            Expedition Login
          </h1>
          <p className="mt-3 text-[1.05rem] font-medium text-[#6b5649]">
            Ready to continue your journey?
          </p>

          <div className="mt-8 space-y-5">
            <InputField
              label="Email"
              icon="mail"
              placeholder="parent@email.com"
              value={email}
              onChange={handleEmailChange}
              error={errors.email}
            />
            <InputField
              label="Password"
              icon="lock"
              placeholder="••••••••"
              type="password"
              value={password}
              onChange={handlePasswordChange}
              error={errors.password}
            />
          </div>

          <div className="mt-10">
            <PrimaryAction isLoading={isSubmitting}>LET'S GO!</PrimaryAction>
          </div>
        <div className="mt-10">
          <PrimaryAction>LET'S GO!</PrimaryAction>
        </div>

          {statusMessage ? (
            <p className="mt-4 text-center text-[0.92rem] font-semibold text-[#8b5a18]">
              {statusMessage}
            </p>
          ) : null}

          <p className="mt-7 text-center text-[0.95rem] font-semibold text-[#6f5a4d]">
            New to the team?{" "}
            <Link href="/auth/register" className="font-black text-[#f39211]">
              Join the Expedition
            </Link>
          </p>
        </form>
      </div>
    </CardShell>
  );
}

function Avatar({ label, small }: { label: string; small?: boolean }) {
  return (
    <div
      className={`relative flex items-center justify-center rounded-full bg-gradient-to-b from-[#cb4f0e] via-[#d96c12] to-[#b0410b] shadow-[0_20px_30px_rgba(144,60,13,0.2)] ${small ? "h-28 w-28" : "h-32 w-32"}`}
    >
      <div className="absolute inset-[11%] rounded-full border-[0.4rem] border-white/65 bg-[#ffb62b]">
        <div className="absolute left-[18%] top-[18%] h-[1.15rem] w-[1.15rem] rounded-full bg-[#fff0ca]" />
        <div className="absolute right-[18%] top-[18%] h-[1.15rem] w-[1.15rem] rounded-full bg-[#fff0ca]" />
        <div className="absolute left-1/2 top-[46%] h-[0.9rem] w-[0.9rem] -translate-x-1/2 rounded-full bg-[#4b2b1c]" />
      </div>
      <span className="absolute bottom-[-2.3rem] left-1/2 w-max -translate-x-1/2 text-[1.05rem] font-black text-[#3d3128]">
        {label}
      </span>
    </div>
  );
}

export function ProfilePicker() {
  return (
    <main className="min-h-screen px-6 py-14 sm:px-10 lg:px-14">
      <section className="mx-auto flex min-h-[calc(100vh-7rem)] max-w-7xl flex-col items-center justify-center text-center">
        <h1 className="max-w-3xl text-4xl font-black tracking-[-0.06em] text-[#f49416] sm:text-5xl lg:text-6xl">
          Parent Mode Active
        </h1>
        <p className="mt-4 max-w-2xl text-lg font-medium leading-8 text-[#5f4d42] sm:text-[1.15rem]">
          Story generation and dashboard are now focused on parent only.
        </p>

        <div className="mt-14 grid w-full max-w-md grid-cols-1 gap-10">
          <div className="flex flex-col items-center gap-5">
            <Link href="/parent/dashboard" className="group flex flex-col items-center gap-5">
              <Avatar label="Parent" small />
              <span className="rounded-full bg-gradient-to-r from-[#f59f1b] to-[#ff8128] px-6 py-3 text-[1rem] font-black text-white shadow-[0_12px_22px_rgba(243,133,28,0.28)] transition-transform group-hover:-translate-y-0.5">
                Go to Parent Dashboard
              </span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export function AuthSplit({
  tone,
  form,
}: {
  tone: SceneTone;
  form: ReactNode;
}) {
  return (
    <main className="min-h-screen px-6 py-10 sm:px-10 lg:px-14">
      <section className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
        <div className="order-2 lg:order-1">
          <SmallMascot tone={tone} />
        </div>
        <div className="order-1 lg:order-2">{form}</div>
      </section>
    </main>
  );
}
