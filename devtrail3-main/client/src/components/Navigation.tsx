import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Book,
  FolderGit2,
  LogOut,
  User,
  Code2,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export function Navigation() {
  const [location, navigate] = useLocation();
  const { user, logout, isLoggingOut } = useAuth();

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/journal", label: "Journal", icon: Book },
    { href: "/projects", label: "Projects", icon: FolderGit2 },
  ];

  return (
    <nav className="fixed top-0 left-0 h-full w-20 md:w-64 bg-background/90 backdrop-blur-xl border-r border-border flex flex-col z-50 transition-all duration-300">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-amber-400 flex items-center justify-center shadow-lg shadow-primary/25">
          <Code2 className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-xl hidden md:block text-gradient-primary">DevTrail</span>
      </div>

      <div className="flex-1 px-3 py-6 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href} className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
              isActive 
                ? "bg-primary/15 text-primary font-medium" 
                : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
            )}>
              <Icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", isActive && "text-primary")} />
              <span className="hidden md:block">{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-border space-y-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                "w-full flex items-center gap-3 p-2 rounded-xl transition-all cursor-pointer group text-left",
                "hover:bg-accent/60",
                location === "/profile" && "bg-primary/10"
              )}
            >
              <Avatar className="w-10 h-10 border border-border group-hover:border-primary/60 transition-colors">
                {user?.profileImageUrl && <AvatarImage src={user.profileImageUrl} />}
                <AvatarFallback className="bg-primary/20 text-primary">
                  {user?.firstName?.[0] || <User className="w-4 h-4" />}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block overflow-hidden flex-1">
                <p className="text-sm font-medium truncate text-foreground">{user?.firstName || "Developer"}</p>
                <p className="text-xs text-muted-foreground truncate">Open account menu</p>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground hidden md:block" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-64">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium truncate">
                {[user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Developer"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email || "No email available"}
              </p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/profile")} className="cursor-pointer">
              <User className="w-4 h-4 mr-2" />
              View Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => logout()}
              className="cursor-pointer text-destructive focus:text-destructive"
              disabled={isLoggingOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              {isLoggingOut ? "Signing Out..." : "Sign Out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
