import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import ModeToggle from "@/components/ui/mode-toggle";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChevronDown, LogOut, File, PlusCircle, User, LayoutDashboard } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // ✅ Hide navbar on authentication pages
  const authRoutes = ["/auth", "/login", "/register"];
  if (authRoutes.includes(location.pathname)) return null;

  // ✅ Fix: Retrieve name from `user_metadata`
  const userMetadata = (user as any)?.user_metadata || {}; // ✅ Fix TypeScript Error
  const userName =
    userMetadata.name || // ✅ Get name from metadata
    user?.email?.charAt(0).toUpperCase(); // ✅ Fallback: First letter of email

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-md">
      <div className="container mx-auto flex justify-between items-center p-4">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-teal-600">
          AI-Legal Docs
        </Link>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Dark Mode Toggle */}
          <ModeToggle />

          {/* My Documents Button */}
          <Button
            onClick={() => navigate("/dashboard")}
            className="bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 rounded-lg"
          >
            My Documents
          </Button>

          {/* Dashboard Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2 px-4 py-2 rounded-lg"
              >
                <LayoutDashboard className="h-5 w-5" />
                My Dashboard
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-48 shadow-lg rounded-lg bg-white dark:bg-gray-800">
              <DropdownMenuItem onClick={() => navigate("/profile")} className="hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-md">
                <User className="h-5 w-5 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/templates")} className="hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-md">
                <File className="h-5 w-5 mr-2" />
                Templates
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/create-template")} className="hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-md">
                <PlusCircle className="h-5 w-5 mr-2" />
                Create Template
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSignOut} className="text-red-600 hover:bg-red-100 dark:hover:bg-red-700 p-2 rounded-md">
                <LogOut className="h-5 w-5 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* ✅ User Avatar (With Metadata Fix) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="cursor-pointer border border-gray-300 dark:border-gray-700">
                <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white">
                  {userName}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
