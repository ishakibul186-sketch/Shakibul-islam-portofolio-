import React, { useState } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  FolderGit2, 
  FileText, 
  PlusCircle, 
  LogOut, 
  Home, 
  ChevronRight, 
  Menu, 
  ChevronLeft,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Inbox,
  Send
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function AdminLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/admin" },
    { name: "Contact Messages", icon: Inbox, path: "/admin/messages" },
    { name: "Email Management", icon: Send, path: "/admin/email-management" },
    { name: "My Projects", icon: FolderGit2, path: "/admin/projects" },
    { name: "Latest Articles", icon: FileText, path: "/admin/articles" },
    { name: "Add Article", icon: PlusCircle, path: "/admin/articles/add" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans antialiased">
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-slate-900/40 z-40 md:hidden backdrop-blur-xs"
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed md:sticky top-0 h-screen bg-white border-r border-slate-200 z-50 flex flex-col transition-all duration-300 shadow-sm ${
          collapsed ? "w-20" : "w-64"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Sidebar Header */}
        <div className="h-16 px-4 border-b border-slate-100 flex items-center justify-between">
          {!collapsed ? (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200 shrink-0">
                <ShieldCheck size={20} />
              </div>
              <div className="leading-tight">
                <span className="font-bold text-slate-900 text-base tracking-tight font-display">
                  Admin<span className="text-indigo-600">Portal</span>
                </span>
                <span className="block text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                  Management
                </span>
              </div>
            </div>
          ) : (
            <div className="w-9 h-9 mx-auto rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
              <ShieldCheck size={20} />
            </div>
          )}

          {/* Toggle sidebar button (Desktop) */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors ml-auto"
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {!collapsed && (
            <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Navigation
            </p>
          )}

          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path !== "/admin" && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                title={collapsed ? item.name : undefined}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700 font-semibold shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                } ${collapsed ? "justify-center px-2" : ""}`}
              >
                <item.icon 
                  size={20} 
                  className={`shrink-0 transition-colors ${
                    isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"
                  }`} 
                />
                {!collapsed && (
                  <>
                    <span className="truncate">{item.name}</span>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 ml-auto" />
                    )}
                  </>
                )}
              </Link>
            );
          })}

          <div className="pt-4 mt-4 border-t border-slate-100">
            {!collapsed && (
              <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Quick Actions
              </p>
            )}

            <Link
              to="/my-projects"
              target="_blank"
              title={collapsed ? "View Public Projects" : undefined}
              className={`flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/50 transition-colors ${
                collapsed ? "justify-center px-2" : ""
              }`}
            >
              <ExternalLink size={18} className="text-slate-400 shrink-0" />
              {!collapsed && <span>Live Projects Page</span>}
            </Link>

            <Link
              to="/"
              target="_blank"
              title={collapsed ? "View Portfolio" : undefined}
              className={`flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/50 transition-colors ${
                collapsed ? "justify-center px-2" : ""
              }`}
            >
              <Home size={18} className="text-slate-400 shrink-0" />
              {!collapsed && <span>Main Portfolio</span>}
            </Link>
          </div>
        </nav>

        {/* User profile & Logout footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          <div className={`flex items-center gap-3 p-2 rounded-xl bg-white border border-slate-200/80 mb-2 shadow-2xs ${
            collapsed ? "justify-center p-1.5" : ""
          }`}>
            <img
              src={user?.photoURL || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"}
              alt={user?.displayName || "Admin"}
              className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0"
            />
            {!collapsed && (
              <div className="overflow-hidden min-w-0">
                <p className="text-xs font-bold text-slate-800 truncate">
                  {user?.displayName || "Administrator"}
                </p>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[10px] text-slate-500 font-medium truncate">
                    Verified Admin
                  </span>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              logout();
              navigate("/");
            }}
            title={collapsed ? "Sign Out" : undefined}
            className={`flex items-center gap-2.5 px-3 py-2 w-full text-left text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors ${
              collapsed ? "justify-center px-2" : ""
            }`}
          >
            <LogOut size={16} className="shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <Menu size={20} />
            </button>
            <div>
              <h1 className="text-base md:text-lg font-bold text-slate-900">
                Admin Control Center
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block">
                White UI Management Workspace
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium border border-indigo-100">
              <Sparkles size={14} className="text-indigo-600" />
              <span>Realtime Synced</span>
            </div>

            <Link
              to="/"
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <Home size={14} />
              <span>Visit Site</span>
            </Link>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 md:p-8 bg-white overflow-x-hidden">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
