import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, FileText, LogIn, Shield, Database, Download } from "lucide-react";

interface ActivityEvent {
  id: string;
  user: string;
  action: string;
  type: "login" | "file_access" | "admin_action" | "data_transfer" | "system_access";
  timestamp: string;
  details: string;
  risk_level: "low" | "medium" | "high" | "critical";
  location?: string;
}

const mockActivities: ActivityEvent[] = [
  {
    id: "1",
    user: "john.doe@company.com",
    action: "Downloaded sensitive files",
    type: "data_transfer",
    timestamp: "14:32:45",
    details: "Financial_Reports_Q3.xlsx (2.3MB)",
    risk_level: "critical",
    location: "New York, NY"
  },
  {
    id: "2",
    user: "sarah.johnson@company.com",
    action: "Failed admin login",
    type: "admin_action",
    timestamp: "14:28:12",
    details: "Multiple authentication failures",
    risk_level: "high",
    location: "London, UK"
  },
  {
    id: "3",
    user: "mike.wilson@company.com",
    action: "Accessed customer database",
    type: "system_access",
    timestamp: "14:25:33",
    details: "Customer_Data table - 450 records viewed",
    risk_level: "medium",
    location: "San Francisco, CA"
  },
  {
    id: "4",
    user: "emma.brown@company.com",
    action: "Login from new device",
    type: "login",
    timestamp: "14:22:18",
    details: "Windows 11 - Chrome browser",
    risk_level: "medium",
    location: "Toronto, ON"
  },
  {
    id: "5",
    user: "david.taylor@company.com",
    action: "File sharing violation",
    type: "file_access",
    timestamp: "14:19:45",
    details: "Attempted to share restricted document",
    risk_level: "high",
    location: "Chicago, IL"
  },
  {
    id: "6",
    user: "lisa.garcia@company.com",
    action: "Normal system access",
    type: "system_access",
    timestamp: "14:17:22",
    details: "CRM dashboard login",
    risk_level: "low",
    location: "Austin, TX"
  }
];

const getActivityIcon = (type: string) => {
  switch (type) {
    case "login":
      return <LogIn className="h-4 w-4" />;
    case "file_access":
      return <FileText className="h-4 w-4" />;
    case "admin_action":
      return <Shield className="h-4 w-4" />;
    case "data_transfer":
      return <Download className="h-4 w-4" />;
    case "system_access":
      return <Database className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

const getRiskBadgeStyles = (risk: string) => {
  switch (risk) {
    case "critical":
      return "bg-gradient-alert text-white border-critical/50";
    case "high":
      return "bg-gradient-warning text-white border-warning/50";
    case "medium":
      return "bg-warning/20 text-warning border-warning/30";
    default:
      return "bg-cyber-green/20 text-cyber-green border-cyber-green/30";
  }
};

const getTimelineColor = (risk: string) => {
  switch (risk) {
    case "critical":
      return "border-critical bg-critical";
    case "high":
      return "border-warning bg-warning";
    case "medium":
      return "border-warning/60 bg-warning/60";
    default:
      return "border-cyber-green bg-cyber-green";
  }
};

export const UserActivityTimeline = () => {
  return (
    <Card className="border-cyber-blue/30 bg-gradient-to-br from-cyber-blue/5 to-transparent backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Clock className="h-5 w-5 text-cyber-blue" />
          User Activity Timeline
        </CardTitle>
        <CardDescription>Recent user actions and security events</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-px bg-border"></div>
            
            <div className="space-y-4">
              {mockActivities.map((activity, index) => (
                <div key={activity.id} className="relative flex gap-4">
                  {/* Timeline dot */}
                  <div className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 ${getTimelineColor(activity.risk_level)}`}>
                    <div className="h-2 w-2 rounded-full bg-background"></div>
                  </div>
                  
                  {/* Event content */}
                  <div className="flex-1 rounded-lg border border-border/50 bg-card/50 p-4 backdrop-blur-sm">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="mt-1 text-cyber-blue">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={getRiskBadgeStyles(activity.risk_level)} variant="outline">
                              {activity.risk_level.toUpperCase()}
                            </Badge>
                            <span className="text-sm font-medium text-foreground">{activity.timestamp}</span>
                          </div>
                          <h4 className="text-sm font-medium text-foreground mb-1">{activity.action}</h4>
                          <p className="text-xs text-muted-foreground mb-1">{activity.user}</p>
                          <p className="text-xs text-muted-foreground">{activity.details}</p>
                          {activity.location && (
                            <p className="text-xs text-cyber-blue mt-1">{activity.location}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};