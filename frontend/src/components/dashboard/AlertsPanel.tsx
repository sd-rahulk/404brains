"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, Clock, User, FileText, Eye } from "lucide-react";

interface Alert {
  id: string;
  type: string;
  severity: "critical" | "high" | "medium" | "low";
  user: string;
  description: string;
  timestamp: string;
  details: any; // full JSON
}

export const AlertsPanel = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null); // track which card is expanded

  useEffect(() => {
    const anomaliesRef = collection(db, "Anomalies");

    const unsubscribe = onSnapshot(anomaliesRef, (snapshot) => {
      const newAlerts: Alert[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        const email = doc.id;

        return {
          id: email,
          type: data.type || "login_anomaly",
          severity: data.severity || "high",
          user: email,
          description: data.description || "Anomalous activity detected",
          timestamp: data.lastLogin || new Date().toISOString(),
          details: data, // full JSON
        } as Alert;
      });

      setAlerts(newAlerts);
    });

    return () => unsubscribe();
  }, []);

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-gradient-alert text-white border-critical/50";
      case "high": return "bg-gradient-warning text-white border-warning/50";
      case "medium": return "bg-warning/20 text-warning border-warning/30";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "data_exfiltration": return <FileText className="h-4 w-4" />;
      case "login_anomaly": return <User className="h-4 w-4" />;
      case "privilege_escalation": return <AlertTriangle className="h-4 w-4" />;
      case "file_access": return <Eye className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <Card className="border-cyber-blue/30 bg-gradient-to-br from-cyber-blue/5 to-transparent backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <AlertTriangle className="h-5 w-5 text-critical" />
          Real-time Alerts
        </CardTitle>
        <CardDescription>Latest anomalies detected from users</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="rounded-lg border border-border/50 bg-card/50 p-4 backdrop-blur-sm transition-all hover:border-cyber-blue/50 hover:bg-card/80"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 text-cyber-blue">{getTypeIcon(alert.type)}</div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge className={getSeverityStyles(alert.severity)} variant="outline">
                          {alert.severity.toUpperCase()}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{alert.user}</span>
                      </div>
                      {/* Show only first 2 rows */}
                      <h4 className="text-sm font-medium text-foreground">
                        {alert.description.length > 80
                          ? alert.description.substring(0, 80) + "..."
                          : alert.description}
                      </h4>

                      {/* Expandable full details */}
                      {expandedId === alert.id && (
                        <pre className="text-xs text-muted-foreground overflow-x-auto">
                          {JSON.stringify(alert.details, null, 2)}
                        </pre>
                      )}

                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {alert.timestamp.toString()}
                      </div>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    className="border-cyber-blue/30 text-cyber-blue hover:bg-cyber-blue/10"
                    onClick={() =>
                      setExpandedId(expandedId === alert.id ? null : alert.id)
                    }
                  >
                    Investigate
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
