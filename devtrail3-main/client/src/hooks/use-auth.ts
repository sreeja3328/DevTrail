import { useClerk, useUser } from "@clerk/clerk-react";
import { useState } from "react";

type AuthUser = {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  bio: string | null;
};

export function useAuth() {
  const { isLoaded, isSignedIn, user: clerkUser } = useUser();
  const { signOut } = useClerk();
  const [isUpdatingBio, setIsUpdatingBio] = useState(false);

  const bioFromMetadata =
    typeof clerkUser?.unsafeMetadata?.bio === "string"
      ? clerkUser.unsafeMetadata.bio
      : null;

  const user: AuthUser | null = clerkUser
    ? {
        id: clerkUser.id,
        email: clerkUser.primaryEmailAddress?.emailAddress ?? null,
        firstName: clerkUser.firstName ?? null,
        lastName: clerkUser.lastName ?? null,
        profileImageUrl: clerkUser.imageUrl ?? null,
        bio: bioFromMetadata,
      }
    : null;

  const logout = () => {
    void signOut({ redirectUrl: "/" });
  };

  const updateBio = async (bio: string) => {
    if (!clerkUser) return false;

    try {
      setIsUpdatingBio(true);
      await clerkUser.update({
        unsafeMetadata: {
          ...(clerkUser.unsafeMetadata ?? {}),
          bio,
        },
      });
      return true;
    } catch {
      return false;
    } finally {
      setIsUpdatingBio(false);
    }
  };

  return {
    user,
    isLoading: !isLoaded,
    isAuthenticated: isLoaded && isSignedIn,
    logout,
    updateBio,
    isUpdatingBio,
    isLoggingOut: false,
  };
}
