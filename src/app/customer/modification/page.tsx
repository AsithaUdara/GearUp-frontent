"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ModificationRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/customer/request-modification");
  }, [router]);
  return null;
}
