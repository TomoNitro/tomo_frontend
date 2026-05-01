"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { childrenApi } from "@/lib/api";
import { ChildrenPickerModal } from "@/app/auth/_components/children-picker";

export default function ProfilePickerPage() {
  const router = useRouter();
  const [children, setChildren] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadChildren = async () => {
      const response = await childrenApi.getList();
      if (response.success && Array.isArray(response.data)) {
        setChildren(response.data);
      }
      setIsLoading(false);
    };

    loadChildren();
  }, []);

  const handleChildSelect = (childName: string) => {
    // Store selected user in localStorage or session
    if (childName === "parent") {
      localStorage.setItem("selectedUser", "parent");
      router.push("/parent/dashboard");
    } else {
      localStorage.setItem("selectedUser", childName);
      router.push("/child/login");
    }
  };

  const handleAddChild = (username: string, _pin: string) => {
    setChildren((prev) => [...prev, username]);
  };

  return (
    <ChildrenPickerModal
      children={children}
      onChildSelect={handleChildSelect}
      onAddChild={handleAddChild}
      isLoadingChildren={isLoading}
    />
  );
}
