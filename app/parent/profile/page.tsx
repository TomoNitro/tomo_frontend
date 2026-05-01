"use client";

import { useState } from "react";
import Link from "next/link";

export default function EditProfile() {
  const [parentName, setParentName] = useState("John Doe");
  const [email, setEmail] = useState("johndoe@email.com");
  const [phone, setPhone] = useState("(+62) 123-4567");
  const [isEditing, setIsEditing] = useState(false);

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
              <button className="w-full rounded-xl bg-[#e8d4b0] px-4 py-3 font-bold text-[#3d3128] hover:bg-[#dcc4ac] transition-colors flex items-center justify-center gap-2">
                🔐 Change Password
              </button>
              <button className="w-full rounded-xl bg-[#f5e6d3] px-4 py-3 font-bold text-red-600 hover:bg-[#ead9c3] transition-colors flex items-center justify-center gap-2">
                🗑️ Delete Account
              </button>
              {/* Last updated info */}
              <p className="text-center text-xs text-[#8d7661] mt-4">
                Last updated: 45 days ago
              </p>
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
    </main>
  );
}
