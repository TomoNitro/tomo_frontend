"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { childrenApi, type ChildProfile } from "@/lib/api";
import { ChildrenPickerModal } from "@/app/auth/_components/children-picker";

export default function ProfilePickerPage() {
  const router = useRouter();
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshChildren = useCallback(async () => {
    const response = await childrenApi.getList();
    if (response.success && Array.isArray(response.data)) {
      setChildren(response.data);
    }
    setIsLoading(false);
  }, []);

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

  const handleChildSelect = (child: ChildProfile | "parent") => {
    // Store selected user in localStorage or session
    if (child === "parent") {
      localStorage.setItem("selectedUser", "parent");
      router.push("/parent/dashboard");
    } else {
      localStorage.setItem("selectedUser", child.name);
      localStorage.setItem("selectedChildId", child.id);
      localStorage.setItem("selectedChildName", child.name);
      router.push("/child/login");
    }
  };

  return (
    <ChildrenPickerModal
      childProfiles={children}
      onChildSelect={handleChildSelect}
      onAddChild={refreshChildren}
      isLoadingChildren={isLoading}
    />
  );
}
