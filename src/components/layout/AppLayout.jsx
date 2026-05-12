import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useParticipant } from '@/lib/ParticipantContext';
import {
  LayoutDashboard, Search, FileText, Route, ClipboardList,
  BookOpen, User, LogOut, Briefcase, Menu, X, AlertTriangle
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/job-search', label: 'Job Search', icon: Search },
  { path: '/job-tracker', label: 'Job Tracker', icon: ClipboardList },
  { path: '/resume-builder', label: 'Resume Builder', icon: FileText },
  { path: '/career-path', label: 'Career Path', icon: Route },
  { path: '/resources', label: 'Resources', icon: BookOpen },
  { path: '/profile', label: 'My Profile', icon: User },
];

export default function AppLayout() {
  const { participant, isGuest, logout } = useParticipant();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 left-0 z-30 bg-sidebar text-sidebar-foreground">
        <div className="p-6 border-b border-sidebar-border">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sidebar-primary/20 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-sidebar-primary" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-lg">Job Lab</h1>
              <p className="text-xs text-sidebar-foreground/60">Career Resource Centre</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <Link key={item.path} to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                location.pathname === item.path
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}>
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          {isGuest && (
            <div className="mb-3 p-2 rounded-lg bg-accent/10 flex items-center gap-2 text-xs text-accent">
              <AlertTriangle className="w-3 h-3" /> Guest session
            </div>
          )}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-sidebar-primary/20 flex items-center justify-center text-sm font-semibold text-sidebar-primary">
              {participant?.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{participant?.name}</p>
              <p className="text-xs text-sidebar-foreground/50 truncate">{participant?.email}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start text-sidebar-foreground/60 hover:text-sidebar-foreground" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-30 bg-card border-b h-14 flex items-center px-4">
        <button onClick={() => setMobileOpen(true)} className="p-2 -ml-2">
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 ml-3">
          <Briefcase className="w-5 h-5 text-primary" />
          <span className="font-heading font-bold">Job Lab</span>
        </div>
        {isGuest && <Badge variant="outline" className="ml-auto text-xs border-accent text-accent">Guest</Badge>}
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 bg-sidebar text-sidebar-foreground flex flex-col">
            <div className="p-4 flex items-center justify-between border-b border-sidebar-border">
              <span className="font-heading font-bold">Job Lab</span>
              <button onClick={() => setMobileOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <nav className="flex-1 p-4 space-y-1">
              {navItems.map(item => (
                <Link key={item.path} to={item.path} onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                    location.pathname === item.path
                      ? "bg-sidebar-accent text-sidebar-primary"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50"
                  )}>
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="p-4 border-t border-sidebar-border">
              <p className="text-sm font-medium">{participant?.name}</p>
              <Button variant="ghost" size="sm" className="w-full justify-start mt-2 text-sidebar-foreground/60" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" /> Sign Out
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 pt-14 lg:pt-0">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}