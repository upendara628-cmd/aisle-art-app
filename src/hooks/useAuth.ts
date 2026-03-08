import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const adminCheckRef = useRef<string | null>(null);

  useEffect(() => {
    const checkAdmin = async (userId: string) => {
      if (adminCheckRef.current === userId) return;
      adminCheckRef.current = userId;
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();
      setIsAdmin(!!data);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        setLoading(false);

        if (currentUser) {
          checkAdmin(currentUser.id);
        } else {
          setIsAdmin(false);
          adminCheckRef.current = null;
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        checkAdmin(currentUser.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    adminCheckRef.current = null;
    await supabase.auth.signOut();
  };

  return { user, loading, isAdmin, signOut };
};
