"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, doc, getDocs, getDoc } from "firebase/firestore";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, AreaChart, Area, Line, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import { TrendingUp } from "lucide-react";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-border/50 bg-card/90 p-3 backdrop-blur-sm">
        <p className="text-sm font-medium text-foreground">{`Time: ${label}`}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {`${entry.dataKey}: ${entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const AnomalyChart = () => {
  const [anomalyData, setAnomalyData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      // 1. Fetch normal users count
      const userCountDoc = await getDoc(doc(db, "counters", "userCount"));
      const normalUsersCount = userCountDoc.exists() ? userCountDoc.data().count : 0;

      // 2. Fetch monitored users count
      const monitoredDoc = await getDoc(doc(db, "counters", "monitoredUsers"));
      const monitoredUsersCount = monitoredDoc.exists() ? monitoredDoc.data().count : 0;

      // 3. Fetch anomalies collection
      const anomaliesSnap = await getDocs(collection(db, "Anomalies"));
      const anomaliesMap: Record<string, number> = {};
      anomaliesSnap.forEach(doc => {
        const data = doc.data();
        const time = data.time || "unknown";
        anomaliesMap[time] = (anomaliesMap[time] || 0) + 1;
      });

      // Prepare chart data
      const times = Object.keys(anomaliesMap).length ? Object.keys(anomaliesMap) : ["00:00"];
      const chartData = times.map(time => ({
        time,
        visits: normalUsersCount,
        monitored: monitoredUsersCount,
        anomalies: anomaliesMap[time] || 0,
        risk_score: Math.floor(((anomaliesMap[time] || 0) / (normalUsersCount || 1)) * 100),
      }));

      setAnomalyData(chartData);
    };

    fetchData();
  }, []);

  return (
    <Card className="border-cyber-blue/30 bg-gradient-to-br from-cyber-blue/5 to-transparent backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <TrendingUp className="h-5 w-5 text-cyber-blue" />
          Anomaly Detection Timeline
        </CardTitle>
        <CardDescription>Real-time monitoring of user behavior anomalies</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={anomalyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="visits"
                stroke="hsl(var(--cyber-blue))"
                fill="hsl(var(--cyber-blue)/0.2)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="monitored"
                stroke="hsl(var(--warning))"
                fill="hsl(var(--warning)/0.2)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="anomalies"
                stroke="hsl(var(--critical))"
                fill="hsl(var(--critical)/0.2)"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="risk_score"
                stroke="hsl(var(--warning))"
                strokeWidth={3}
                dot={{ r: 3 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
