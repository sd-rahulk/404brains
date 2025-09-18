"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, AlertTriangle, Users, Activity } from "lucide-react";
import { useState, useEffect } from "react";
import { doc, onSnapshot, updateDoc, increment, collection, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  icon: React.ReactNode;
  variant?: "default" | "warning" | "critical" | "success";
}

const MetricCard = ({ title, value, change, trend, icon, variant = "default" }: MetricCardProps) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "warning":
        return "border-warning/30 bg-gradient-to-br from-warning/5 to-transparent";
      case "critical":
        return "border-critical/30 bg-gradient-to-br from-critical/5 to-transparent shadow-alert/20";
      case "success":
        return "border-cyber-green/30 bg-gradient-to-br from-cyber-green/5 to-transparent";
      default:
        return "border-cyber-blue/30 bg-gradient-to-br from-cyber-blue/5 to-transparent";
    }
  };

  const getTrendColor = () => {
    if (variant === "critical") return "text-critical";
    if (variant === "warning") return "text-warning";
    return trend === "up" ? "text-critical" : trend === "down" ? "text-cyber-green" : "text-muted-foreground";
  };


  return (
    <Card className={`${getVariantStyles()} backdrop-blur-sm transition-all duration-300 hover:scale-105`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="text-cyber-blue">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        <p className={`text-xs ${getTrendColor()}`}>
           from last hour
        </p>
      </CardContent>
    </Card>
  );
};

export const ThreatMetrics = () => {
  const [activityCount, setActivityCount] = useState(0);

useEffect(() => {
  const activityRef = collection(db, "userActivities");

  const unsubscribeActivity = onSnapshot(activityRef, (snapshot) => {
    let totalEvents = 0;

    snapshot.forEach(doc => {
      const data = doc.data();
      // Sum meaningful fields for events
      const userEvents = (data.login_count || 0) 
                       + (data.files_downloaded || 0) 
                       + (data.failed_login || 0);
      totalEvents += userEvents;
    });

    setActivityCount(totalEvents);
  });

  return () => unsubscribeActivity();
}, []);

  const [userCount, setUserCount] = useState(0);
  const [monitoredUsers, setMonitoredUsers] = useState(0);
  const [anomalies, setAnomalies] = useState(0);

  useEffect(() => {
    const userCountRef = doc(db, "counters", "userCount");
    const monitoredRef = doc(db, "counters", "monitoredUsers");

    // Increment user visits on page load
    updateDoc(userCountRef, { count: increment(1) }).catch(console.error);

    // Listen to user visits count
    const unsubscribeUserCount = onSnapshot(userCountRef, (docSnap) => {
      setUserCount(docSnap.exists() ? docSnap.data().count || 0 : 0);
    });

    // Listen to monitored users count
    const unsubscribeMonitored = onSnapshot(monitoredRef, (docSnap) => {
      setMonitoredUsers(docSnap.exists() ? docSnap.data().count || 0 : 0);
    });

    // Listen to anomalies collection
    const anomaliesCol = collection(db, "Anomalies");
    const unsubscribeAnomalies = onSnapshot(anomaliesCol, (snapshot) => {
      setAnomalies(snapshot.size); // count of anomaly documents
    });

    return () => {
      unsubscribeUserCount();
      unsubscribeMonitored();
      unsubscribeAnomalies();
    };
  }, []);

  // Compute security score dynamically
  const securityScore = monitoredUsers > 0
    ? Math.max(0, Math.floor(100 - (anomalies / monitoredUsers) * 100))
    : 100;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Users Visited"
        value={userCount.toString()}
        change=""
        trend="up"
        variant="critical"
        icon={<AlertTriangle className="h-4 w-4" />}
      />
      <MetricCard
        title="Monitored Users"
        value={monitoredUsers.toString()}
        change=""
        trend="up"
        variant="default"
        icon={<Users className="h-4 w-4" />}
      />
      <MetricCard
        title="Security Score"
        value={`${securityScore}%`}
        change={anomalies > 0 ? `-${Math.floor((anomalies / monitoredUsers) * 100)}%` : "0%"}
        trend={securityScore < 50 ? "down" : "up"}
        variant="warning"
        icon={<Shield className="h-4 w-4" />}
      />
      <MetricCard
  title="Activity Events"
  value={activityCount.toString()}
  change="+12%" // optional, you can calculate % change if you want
  trend="up"
  variant="success"
  icon={<Activity className="h-4 w-4" />}
/>

    </div>
  );
};
