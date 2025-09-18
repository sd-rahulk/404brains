import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ThreatMetrics } from "@/components/dashboard/ThreatMetrics";
import { AlertsPanel } from "@/components/dashboard/AlertsPanel";
import { AnomalyChart } from "@/components/dashboard/AnomalyChart";
import { UserActivityTimeline } from "@/components/dashboard/UserActivityTimeline";
import { RiskAnalysis } from "@/components/dashboard/RiskAnalysis";

const Index = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <DashboardHeader />
        
        {/* Key Metrics */}
        <ThreatMetrics />
        
        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          <AlertsPanel />
          <AnomalyChart />
        </div>
        
        {/* Risk Analysis */}
        <RiskAnalysis />
        
        {/* Activity Timeline */}
        <UserActivityTimeline />
      </div>
    </div>
  );
};

export default Index;
