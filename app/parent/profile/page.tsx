"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authApi, childrenApi, parentApi, userApi, type ChildProfile } from "@/lib/api";
import { ChildrenPickerModal } from "@/app/auth/_components/children-picker";

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "P";
}

function getChildColor(seed: string) {
  const colors = [
    "bg-gradient-to-br from-slate-600 to-slate-800",
    "bg-gradient-to-br from-[#f59f1b] to-[#ff8128]",
    "bg-gradient-to-br from-[#cb4f0e] to-[#b0410b]",
    "bg-gradient-to-br from-[#8d7661] to-[#6f6252]",
  ];

  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }

  return colors[hash % colors.length];
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" aria-hidden>
      <path d="M10 17H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 7l5 5-5 5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 12H9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" aria-hidden>
      <path d="M4 7h16" strokeWidth="2" strokeLinecap="round" />
      <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 11v6M14 11v6" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" aria-hidden>
      <path d="M12 20h9" strokeWidth="2" strokeLinecap="round" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SaveIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" aria-hidden>
      <path d="M5 5h11l3 3v11H5z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 5v6h8V5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 19v-5h8v5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function EditProfile() {
  const router = useRouter();
  const [parentName, setParentName] = useState("");
  const [email, setEmail] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [isAddingChild, setIsAddingChild] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const storedProfile = window.localStorage.getItem("tomoParentProfile");
      const storedName = window.localStorage.getItem("tomoParentName");
      const storedEmail = window.localStorage.getItem("tomoParentEmail");
      const queryName = searchParams.get("name");
      const queryEmail = searchParams.get("email");

      let finalName = "";
      let finalEmail = "";

      if (storedProfile) {
        try {
          const parsedProfile = JSON.parse(storedProfile) as { name?: string; email?: string };
          if (typeof parsedProfile.name === "string") finalName = parsedProfile.name;
          if (typeof parsedProfile.email === "string") finalEmail = parsedProfile.email;
        } catch {
          // Ignore malformed cached profile data.
        }
      }

      if (!finalName && typeof storedName === "string") finalName = storedName;
      if (!finalEmail && typeof storedEmail === "string") finalEmail = storedEmail;
      if (!finalName && queryName) finalName = decodeURIComponent(queryName);
      if (!finalEmail && queryEmail) finalEmail = decodeURIComponent(queryEmail);

      if (finalName) setParentName(finalName);
      if (finalEmail) setEmail(finalEmail);

      const parentResponse = await parentApi.getInfo();
      if (parentResponse.success && parentResponse.data && typeof parentResponse.data === "object") {
        const parentData = parentResponse.data as Record<string, unknown>;
        const source =
          parentData.data && typeof parentData.data === "object"
            ? (parentData.data as Record<string, unknown>)
            : parentData;
        const apiName = source.username ?? source.name ?? source.fullName;
        const apiEmail = source.email;

        if (typeof apiName === "string" && apiName.trim()) {
          const trimmedName = apiName.trim();
          setParentName(trimmedName);
          window.localStorage.setItem("tomoParentName", trimmedName);
        }

        if (typeof apiEmail === "string" && apiEmail.trim()) {
          const trimmedEmail = apiEmail.trim();
          setEmail(trimmedEmail);
          window.localStorage.setItem("tomoParentEmail", trimmedEmail);
        }

        window.localStorage.setItem(
          "tomoParentProfile",
          JSON.stringify({
            name: typeof apiName === "string" ? apiName.trim() : finalName,
            email: typeof apiEmail === "string" ? apiEmail.trim() : finalEmail,
          })
        );
      }

      const childrenResponse = await childrenApi.getList();

      if (childrenResponse.success && Array.isArray(childrenResponse.data)) {
        setChildren(childrenResponse.data);
      }

      setIsLoading(false);
    };

    loadProfile();
  }, []);

  const childCards = useMemo(
    () =>
      children.map((child) => ({
        id: child.id,
        name: child.name,
        initial: getInitials(child.name),
        color: getChildColor(child.id || child.name),
      })),
    [children]
  );

  const displayName = parentName || "Parent";
  const displayEmail = email || "";

  const handleSaveChanges = async () => {
    setStatusMessage("");
    const response = await userApi.updateProfile({
      username: parentName,
      email,
    });

  const children = [
    { id: 1, name: "Leo", initial: "L", color: "bg-gradient-to-br from-slate-600 to-slate-800" },
    { id: 2, name: "Maya", initial: "M", color: "bg-gradient-to-br from-[#f59f1b] to-[#ff8128]" },
  ];

  const handleSaveChanges = () => {
    // API call to save
    setIsEditing(false);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#fffaf0] via-[#fff5e6] to-[#ffe8cc]">
      {/* Header */}
      <header className="border-b border-[#e8d4b0] bg-white/50 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-10 lg:px-14">
          <h1 className="text-2xl font-black text-[#f39211]">TOMO</h1>
          <nav className="flex items-center gap-8">
            <Link href="/parent/dashboard" className="text-sm font-semibold text-[#8d7661] hover:text-[#f39211]">
              Dashboard
            </Link>
            <Link href="/parent/generate" className="text-sm font-semibold text-[#8d7661] hover:text-[#f39211]">
              Generate
            </Link>
            <button className="h-10 w-10 rounded-full bg-gradient-to-br from-[#cb4f0e] via-[#d96c12] to-[#b0410b] flex items-center justify-center text-white font-bold">
              i
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-10 lg:px-14">
        {/* Page Title */}
        <div className="mb-12">
          <h1 className="text-4xl font-black text-[#f39211] mb-2">Edit Profile</h1>
          <p className="text-lg text-[#8d7661]">Customize your expedition experience</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Expedition Leader Section */}
          <div className="lg:col-span-2 rounded-3xl bg-white/60 backdrop-blur-sm border border-[#e8d4b0] p-8">
            <h2 className="text-2xl font-black text-[#3d3128] mb-8">Expedition Leader</h2>

            <div className="flex flex-col sm:flex-row gap-8 mb-8">
              {/* Profile Picture */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative h-32 w-32 rounded-full bg-gradient-to-br from-[#f59f1b] to-[#ff8128] shadow-lg flex items-center justify-center overflow-hidden">
                  <img src="/images/tomo3.svg" alt="Profile" className="h-full w-full object-cover" />
                  <div className="absolute bottom-2 right-2 h-8 w-8 rounded-full bg-[#f39211] border-2 border-white flex items-center justify-center text-white text-xs font-bold">
                    ✎
                  </div>
                </div>
                <button className="rounded-full bg-[#e8d4b0] px-6 py-2 font-bold text-[#3d3128] hover:bg-[#dcc4ac] transition-colors">
                  Change Photo
                </button>
              </div>

              {/* Form Fields */}
              <div className="flex-1 space-y-6">
                <p className="text-sm font-bold text-[#8d7661] uppercase tracking-wide">Update your profile photo and personal details</p>

                <div>
                  <label className="block text-sm font-bold text-[#8d7661] mb-2 uppercase">Parent Name</label>
                  <input
                    type="text"
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    disabled={!isEditing}
                    className="w-full rounded-xl bg-[#f9efdb] px-4 py-3 text-[#3d3128] font-semibold border border-[#e8d4b0] disabled:opacity-60 focus:border-[#f39211] focus:outline-none focus:ring-2 focus:ring-[#f39211]/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#8d7661] mb-2 uppercase">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={!isEditing}
                    className="w-full rounded-xl bg-[#f9efdb] px-4 py-3 text-[#3d3128] font-semibold border border-[#e8d4b0] disabled:opacity-60 focus:border-[#f39211] focus:outline-none focus:ring-2 focus:ring-[#f39211]/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#8d7661] mb-2 uppercase">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={!isEditing}
                    className="w-full rounded-xl bg-[#f9efdb] px-4 py-3 text-[#3d3128] font-semibold border border-[#e8d4b0] disabled:opacity-60 focus:border-[#f39211] focus:outline-none focus:ring-2 focus:ring-[#f39211]/20"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Young Explorers Section */}
          <div className="rounded-3xl bg-white/60 backdrop-blur-sm border border-[#e8d4b0] p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-[#3d3128]">Young Explorers</h3>
              <button className="h-8 w-8 rounded-full bg-[#f39211] text-white flex items-center justify-center font-bold hover:bg-[#ff8128] transition-colors">
                +
              </button>
            </div>

            <div className="space-y-3">
              {children.map((child) => (
                <div key={child.id} className="flex items-center justify-between rounded-xl bg-gradient-to-r from-[#fffaf0] to-[#fff5e6] p-4 border border-[#e8d4b0]">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-full ${child.color} flex items-center justify-center text-white font-bold text-sm`}>
                      {child.initial}
                    </div>
                    <span className="font-bold text-[#3d3128]">{child.name}</span>
                  </div>
                  <button className="text-red-500 hover:text-red-700 font-bold text-lg">
                    🗑️
                  </button>
                </div>
              ))}
            </div>

            {/* Additional Actions */}
            <div className="mt-8 space-y-3">
              <button className="w-full rounded-xl bg-[#f5e6d3] px-4 py-3 font-bold text-red-600 hover:bg-[#ead9c3] transition-colors flex items-center justify-center gap-2">
                <DeleteIcon />
                Delete Account
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Buttons */}
        <div className="mt-12 flex justify-end gap-4">
          <button
            onClick={() => setIsEditing(false)}
            className="rounded-full px-8 py-3 font-bold text-[#8d7661] hover:text-[#3d3128] transition-colors"
          >
            Cancel Changes
          </button>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="rounded-full bg-gradient-to-r from-[#f59f1b] to-[#ff8128] px-8 py-3 font-bold text-white shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
          >
            🔒 {isEditing ? "Save Changes" : "Edit Profile"}
          </button>
        </div>
      </div>

      {isAddingChild ? (
        <ChildrenPickerModal
          childProfiles={children}
          onChildSelect={() => undefined}
          onAddChild={async () => {
            await refreshChildren();
          }}
          defaultMode="add-child"
          onClose={() => setIsAddingChild(false)}
        />
      ) : null}
    </main>
  );
}
