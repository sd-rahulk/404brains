import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Bell, Settings, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";

export const DashboardHeader = () => {
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastUpdate(new Date());
    }, 1500);
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-cyber shadow-glow">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">ThreatGuard AI</h1>
            <p className="text-sm text-muted-foreground">Insider Threat Detection System</p>
          </div>
        </div>
        <Badge className="bg-cyber-green/20 text-cyber-green border-cyber-green/30">
          ACTIVE MONITORING
        </Badge>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Last updated</p>
          <p className="text-sm font-medium text-foreground">
            {lastUpdate.toLocaleTimeString()}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="border-cyber-blue/30 text-cyber-blue hover:bg-cyber-blue/10"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="border-cyber-blue/30 text-cyber-blue hover:bg-cyber-blue/10 relative"
          >
            <Bell className="h-4 w-4" />
            <div className="absolute -top-1 -right-1 h-3 w-3 bg-critical rounded-full animate-pulse"></div>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="border-cyber-blue/30 text-cyber-blue hover:bg-cyber-blue/10"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};