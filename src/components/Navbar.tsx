import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import { Menu, X, LogIn, LogOut, Settings } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

const navLinks = [
  { name: "About", href: "/#about" },
  { name: "Skills", href: "/#skills" },
  { name: "Projects", href: "/my-projects", isRoute: true },
  { name: "Blog", href: "/#blog" },
  { name: "Contact", href: "/#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAdmin, login, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 24);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-40 transition-colors duration-200 ${
        scrolled
          ? "bg-white/92 backdrop-blur-md border-b border-zinc-200"
          : "bg-white/80 backdrop-blur-sm border-b border-transparent"
      }`}
    >
      <div className="container px-4 sm:px-6 mx-auto max-w-6xl">
        <div className="h-14 md:h-16 flex items-center justify-between gap-6 md:gap-8">
          {/* Zone 1: Single text element wordmark */}
          <Link
            to="/"
            className="text-xl font-bold font-display tracking-tight text-zinc-950 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-md"
          >
            PROHOR<span className="text-blue-600">.</span>
          </Link>

          {/* Zone 2: 5 concise single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Primary Navigation">
            {navLinks.map((link) =>
              link.isRoute ? (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-sm font-medium text-zinc-600 hover:text-zinc-950 transition-colors duration-150 relative group whitespace-nowrap shrink-0 py-1"
                >
                  {link.name}
                  <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-zinc-950 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-200" />
                </Link>
              ) : (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-sm font-medium text-zinc-600 hover:text-zinc-950 transition-colors duration-150 relative group whitespace-nowrap shrink-0 py-1"
                >
                  {link.name}
                  <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-zinc-950 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-200" />
                </a>
              )
            )}
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            {isAdmin && (
              <Link
                to="/admin"
                className="p-2 text-zinc-600 hover:text-blue-600 hover:bg-zinc-100 rounded-lg transition-colors whitespace-nowrap shrink-0"
                title="Admin Portal"
              >
                <Settings size={18} />
              </Link>
            )}

            {user ? (
              <div className="flex items-center gap-2.5">
                {user.photoURL && (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || "User"}
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-full border border-zinc-200 object-cover"
                  />
                )}
                <button
                  onClick={logout}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <LogOut size={15} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={login}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-zinc-950 hover:bg-blue-600 rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <LogIn size={15} />
                <span>Sign In</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-zinc-950 hover:bg-zinc-100 rounded-lg transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden bg-white border-t border-zinc-200 shadow-lg"
          >
            <div className="flex flex-col px-6 py-5 space-y-3">
              {navLinks.map((link) =>
                link.isRoute ? (
                  <Link
                    key={link.name}
                    to={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2 text-base font-medium text-zinc-700 hover:text-zinc-950 transition-colors"
                  >
                    {link.name}
                  </Link>
                ) : (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2 text-base font-medium text-zinc-700 hover:text-zinc-950 transition-colors"
                  >
                    {link.name}
                  </a>
                )
              )}

              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 text-base font-semibold text-blue-600"
                >
                  Admin Portal
                </Link>
              )}

              <div className="pt-3 border-t border-zinc-200">
                {user ? (
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2.5 text-sm font-semibold text-red-600 bg-red-50 rounded-lg text-center"
                  >
                    Sign Out
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      login();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2.5 text-sm font-semibold text-white bg-zinc-950 rounded-lg text-center"
                  >
                    Sign In with Google
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
