import { Bell, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "../context/AuthContext"; // Import the auth context

export function DashboardHeader() {
  const { user } = useAuth();
  const email = user?.email || "Guest";
  const displayEmail = email.length > 10 ? email.slice(0, 10) + "..." : email;

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="flex h-16 items-center px-6 gap-4">
        <SidebarTrigger className="h-8 w-8" />

        <div className="flex-1 flex items-center gap-4">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search projects, files..." 
              className="pl-10 bg-background/50 border-border/50 focus:bg-background focus:border-primary/50 transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-primary">
              3
            </Badge>
          </Button>

          <div className="flex items-center gap-3 pl-4 border-l border-border">
            <div className="text-right">
              <p className="text-sm font-medium" title={email}>
                {displayEmail}
              </p>
              <p className="text-xs text-muted-foreground">Senior Developer</p>
            </div>
            <Avatar className="h-10 w-10 ring-2 ring-primary/10">
              <AvatarImage src="/placeholder-avatar.jpg" alt={email} />
              <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                {email.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  );
}
