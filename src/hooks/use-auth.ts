import { useState, useEffect } from "react";

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);

  // Placeholder user object
  const user = null;
  const isAuthenticated = false;

  // Dummy functions to avoid errors elsewhere
  const signIn = async () => { };
  const signOut = async () => { };

  // You can add any other non-Convex logic if needed

  return {
    isLoading,
    isAuthenticated,
    user,
    signIn,
    signOut,
  };
}
