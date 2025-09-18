import { DashboardLayout } from "@/components/DashboardLayout";
import { FileManagement } from "@/components/FileManagement";
import { StatsDashboard } from "@/components/StatsDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, Users, Activity } from "lucide-react";
import heroImage from "@/assets/it-office-hero.jpg";

const Index = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Hero Section */}
        <Card className="overflow-hidden shadow-elevated">
          <div 
            className="h-48 bg-gradient-primary bg-cover bg-center relative"
            style={{ backgroundImage: `url(${heroImage})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary/60 flex items-center justify-center">
              <div className="text-center text-white">
                <h1 className="text-3xl font-bold mb-2">Welcome back, Sarah!</h1>
                <p className="text-lg opacity-90">Manage your projects and track organizational performance</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Button className="h-16 flex flex-col items-center gap-2 bg-primary hover:bg-primary/90">
            <Plus className="h-5 w-5" />
            <span className="text-sm">New Project</span>
          </Button>
          <Button variant="outline" className="h-16 flex flex-col items-center gap-2">
            <Calendar className="h-5 w-5" />
            <span className="text-sm">Schedule Meeting</span>
          </Button>
          <Button variant="outline" className="h-16 flex flex-col items-center gap-2">
            <Users className="h-5 w-5" />
            <span className="text-sm">Team Overview</span>
          </Button>
          <Button variant="outline" className="h-16 flex flex-col items-center gap-2">
            <Activity className="h-5 w-5" />
            <span className="text-sm">View Reports</span>
          </Button>
        </div>

        {/* Statistics Dashboard */}
        <StatsDashboard />

        {/* File Management */}
        <FileManagement />
      </div>
    </DashboardLayout>
  );
};

export default Index;
