import { createContext, useContext, useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { AuthUser } from "@/types/auth";
import { useToast } from "@/components/ui/use-toast";

type AuthContextType = {
  user: AuthUser | null;
  session: Session | null;
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
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch profile from Supabase
  const fetchProfile = async (userId: string) => {
    console.log("Attempting to fetch profile for user ID:", userId);
  
    const fetchTimeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Profile fetch timed out!")), 2000)
    );
  
    try {
      const fetchProfilePromise = supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
  
        const result = await Promise.race([fetchProfilePromise, fetchTimeout]);

      const { data, error } = result as { data: any; error: any };
  
      if (error) {
        console.error("Error fetching profile from Supabase:", error);
        return null;
      }
  
      if (!data) {
        console.warn("Profile fetch returned no data.");
        return null;
      }
  
      console.log("Profile data retrieved:", data);
      return data;
    } catch (error) {
      console.error("Unexpected error in fetchProfile:", error);
      return null;
    }
  };
  

  // Create a new profile in Supabase
  const createProfile = async (userId: string, fullName: string) => {
    try {
      const { error } = await supabase.from("profiles").insert({
        id: userId,
        full_name: fullName,
      });

      if (error) throw error;
    } catch (error) {
      console.error("Error creating profile:", error);
      throw error;
    }
  };

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = async () => {
      console.log("Attempting to retrieve session from Supabase...");
    
      try {
        const { data, error } = await supabase.auth.getSession();
    
        if (error) {
          console.error("Error retrieving session:", error);
          setLoading(false);
          return;
        }
    
        if (!data.session) {
          console.warn("No session found on refresh. User might be logged out.");
          setUser(null);
          setLoading(false);
          return;
        }
    
        console.log("Session successfully retrieved on refresh:", data.session);
        setSession(data.session);
    
        // Render the app immediately after session is restored
        setUser({
          id: data.session.user.id,
          email: data.session.user.email ?? "",
          full_name: "Loading...",  // Placeholder while fetching profile
          avatar_url: "",
          bio: "",
        });
    
        // Fetch the profile in the background
        fetchProfile(data.session.user.id).then((profile) => {
          if (profile) {
            setUser((prevUser) => ({
              ...prevUser,
              full_name: profile.full_name ?? "Unnamed",
              avatar_url: profile.avatar_url ?? "",
              bio: profile.bio ?? "",
            }));
          }
        });
      } catch (error) {
        console.error("Error during session initialization:", error);
      } finally {
        setLoading(false);  // Ensure loading stops immediately after session check
      }
    };
    
  
    initializeAuth();
    
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log("Auth state changed:", session);
      setSession(session);
  
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        if (profile) {
          setUser({
            id: session.user.id,
            email: session.user.email ?? "",
            full_name: profile.full_name ?? "Unnamed",
            avatar_url: profile.avatar_url ?? "",
            bio: profile.bio ?? "",
          });
        } else {
          setUser({
            id: session.user.id,
            email: session.user.email ?? "",
            full_name: "Unnamed",
            avatar_url: "",
            bio: "",
          });
        }
      } else {
        setUser(null);
      }
  
      setLoading(false);  // Ensure loading is stopped after auth change
    });
  
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // Sign up a new user
  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        await createProfile(data.user.id, fullName);
        toast({
          title: "Success!",
          description: "Please check your email to verify your account.",
        });
        navigate("/");
      }
    } catch (error: any) {
      console.error("Sign up error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
      throw error;
    }
  };

  // Sign in an existing user
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      navigate("/");
    } catch (error: any) {
      console.error("Sign in error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
      throw error;
    }
  };

  // Sign out the user
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
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, signIn, signUp, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
