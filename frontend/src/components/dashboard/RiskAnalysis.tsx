"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

// Sample graph data
const riskDistribution = [
  { name: "Low Risk", value: 65, color: "hsl(var(--cyber-green))" },
  { name: "Medium Risk", value: 22, color: "hsl(var(--warning))" },
  { name: "High Risk", value: 10, color: "hsl(var(--warning))" },
  { name: "Critical Risk", value: 3, color: "hsl(var(--critical))" }
];

const userRiskData = [
  { department: "Finance", low: 12, medium: 5, high: 2, critical: 1 },
  { department: "IT", low: 18, medium: 3, high: 1, critical: 0 },
  { department: "HR", low: 15, medium: 4, high: 1, critical: 0 },
  { department: "Sales", low: 25, medium: 8, high: 3, critical: 1 },
  { department: "Legal", low: 8, medium: 2, high: 3, critical: 1 },
];

export const RiskAnalysis = () => {
  const [topRiskyUsers, setTopRiskyUsers] = useState<{ email: string; score: number; trend: string }[]>([]);

  useEffect(() => {
    const anomaliesRef = collection(db, "Anomalies");

    const unsubscribe = onSnapshot(anomaliesRef, (snapshot) => {
      const users: { email: string; score: number; trend: string }[] = [];

      snapshot.docs.forEach((doc) => {
        const email = doc.id;
        users.push({ email, score: 75, trend: "up" }); // default score/trend
      });

      // Sort alphabetically
      users.sort((a, b) => a.email.localeCompare(b.email));
      setTopRiskyUsers(users);
    });

    return () => unsubscribe();
  }, []);

  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-critical/20";
    if (score >= 60) return "bg-warning/20";
    if (score >= 40) return "bg-warning/10";
    return "bg-cyber-green/20";
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Risk Distribution Pie Chart */}
      <Card className="border-cyber-blue/30 bg-gradient-to-br from-cyber-blue/5 to-transparent backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Risk Distribution</CardTitle>
          <CardDescription>Overall user risk assessment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={riskDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={2}>
                  {riskDistribution.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Department Risk Analysis */}
      <Card className="border-cyber-blue/30 bg-gradient-to-br from-cyber-blue/5 to-transparent backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Department Analysis</CardTitle>
          <CardDescription>Risk levels by department</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={userRiskData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="department" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="low" stackId="a" fill="hsl(var(--cyber-green))" />
                <Bar dataKey="medium" stackId="a" fill="hsl(var(--warning) / 0.7)" />
                <Bar dataKey="high" stackId="a" fill="hsl(var(--warning))" />
                <Bar dataKey="critical" stackId="a" fill="hsl(var(--critical))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* High-Risk Users Emails */}
      <Card className="border-cyber-blue/30 bg-gradient-to-br from-cyber-blue/5 to-transparent backdrop-blur-sm">
        <CardHeader>
          <CardTitle>High-Risk Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topRiskyUsers.length > 0 ? (
              topRiskyUsers.map((user, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm"
                >
                  <span className="text-sm font-medium text-foreground">{user.email}</span>
                  <Progress value={user.score} className={`h-2 mt-2 ${getProgressColor(user.score)}`} />
                  <TrendingUp className={`h-4 w-4 ml-2 text-critical rotate-0`} />
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No high-risk users detected.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
