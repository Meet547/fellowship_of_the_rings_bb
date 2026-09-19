"use client";

import { useEffect, useState } from "react";
import { fetchUserAttributes, getCurrentUser } from "aws-amplify/auth";
import { configureAmplify } from "@/lib/amplify";

export type UserProfile = {
  name: string;
  email: string;
  /** Single uppercase initial for avatars — never an empty span. */
  initial: string;
};

/**
 * Reads the signed-in user's profile from Cognito.
 * Falls back to the Cognito username, then to safe defaults — the UI never
 * hardcodes a specific person's name.
 */
export function useUserProfile(): UserProfile {
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    email: "",
    initial: "U",
  });

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        configureAmplify();
        const attrs = await fetchUserAttributes();
        if (!active) return;
        const name = attrs.name || attrs.email?.split("@")[0] || "";
        const email = attrs.email ?? "";
        setProfile({
          name,
          email,
          initial: (name.trim()[0] ?? "U").toUpperCase(),
        });
      } catch {
        try {
          const user = await getCurrentUser();
          if (!active) return;
          setProfile({
            name: user.username,
            email: "",
            initial: (user.username.trim()[0] ?? "U").toUpperCase(),
          });
        } catch {
          /* no session — keep the neutral defaults */
        }
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, []);

  return profile;
}