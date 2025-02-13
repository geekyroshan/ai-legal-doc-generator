import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import ModeToggle from "@/components/ui/mode-toggle"; // Dark mode toggle button
import { Menu, X, UserCircle } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const { user, signOut } = useAuth();
/*************  ✨ Codeium Command ⭐  *************/
/**
 * The navigation bar component.
 *
 * This component renders the navigation bar with links to the
 * dashboard, profile, templates, and create template pages. It also
 * includes a dark mode toggle and a sign out button.
 *
 * @returns The navigation bar element.
 */
/******  d656f2fe-fc0f-4197-8553-d1a490e813b6  *******/  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Hide navbar on /auth route
  if (location.pathname === "/auth") return null;

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

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          {/* Profile Box */}
          <Link to="/profile" className="relative flex items-center gap-2 px-4 py-2 border rounded-lg shadow-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700">
            <UserCircle className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            <span className="text-gray-800 dark:text-gray-200 font-medium">
              Profile
            </span>
          </Link>

           <Link to="/dashboard" className="text-gray-800 dark:text-gray-200 hover:text-teal-600">
           Dashboard
           </Link>

          {/* Sign Out Button */}
          <Button onClick={handleSignOut} variant="outline">
            Sign Out
          </Button>

          {/* Dark Mode Toggle */}
          <ModeToggle />
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-gray-800 dark:text-gray-200"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 shadow-md px-4 py-3 space-y-3">
          <Link to="/profile" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700">
            <UserCircle className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            <span className="text-gray-800 dark:text-gray-200">Profile</span>
          </Link>
          <Button onClick={handleSignOut} className="w-full">
            Sign Out
          </Button>
          <div className="flex justify-center">
            <ModeToggle />
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
