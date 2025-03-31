import { createContext, useContext, useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthUser } from "@/types/auth";
import { useToast } from "@/components/ui/use-toast";

type AuthContextType = {
  user: AuthUser | null;
  session: Session | null;
  sessionChecked: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionChecked, setSessionChecked] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // ✅ Fetch user profile from Supabase
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Unexpected error in fetchProfile:", error);
      return null;
    }
  };

  // ✅ Initialize authentication state & Fix Login Flash Issue
  useEffect(() => {
    const initializeAuth = async () => {
      console.log("Initializing authentication...");

      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Error retrieving session:", error);
          setLoading(false);
          setSessionChecked(true);
          return;
        }

        if (!data?.session) {
          console.warn("No session found.");
          setUser(null);
          setLoading(false);
          setSessionChecked(true);
          return;
        }

        console.log("Session retrieved:", data.session);
        setSession(data.session);

        // ✅ Fetch and set user profile
        const profile = await fetchProfile(data.session.user.id);
        setUser({
          id: data.session.user.id,
          email: data.session.user.email ?? "",
          full_name: profile?.full_name ?? "Unnamed",
          avatar_url: profile?.avatar_url ?? "",
          bio: profile?.bio ?? "",
        });

        console.log("User profile set:", profile);
      } catch (error) {
        console.error("Error during session initialization:", error);
      } finally {
        setLoading(false);
        setSessionChecked(true);
      }
    };

    initializeAuth();

    // ✅ Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Auth state changed:", session);
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id).then((profile) => {
          setUser({
            id: session.user.id,
            email: session.user.email ?? "",
            full_name: profile?.full_name ?? "Unnamed",
            avatar_url: profile?.avatar_url ?? "",
            bio: profile?.bio ?? "",
          });
        });
      } else {
        setUser(null);
      }
      setLoading(false);
      setSessionChecked(true);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // ✅ Sign up new user
  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name: fullName }, // ✅ Store full name in metadata
        },
      });

      if (error) throw error;

      if (data.user) {
        toast({
          title: "Success!",
          description: "Check your email to verify your account.",
        });
        navigate("/");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  // ✅ Sign in existing user
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // ✅ Redirect user back to where they were before login
      navigate(location.pathname !== "/auth" ? location.pathname : "/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  // ✅ Sign out user
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/auth");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, sessionChecked, signIn, signUp, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
