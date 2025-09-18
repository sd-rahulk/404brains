import { TrendingUp, Users, Calendar, Activity } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const stats = [
  {
    title: "Active Projects",
    value: "12",
    change: "+2.1%",
    description: "vs last month",
    icon: Activity,
    color: "text-primary"
  },
  {
    title: "Team Members",
    value: "48",
    change: "+5.2%", 
    description: "vs last quarter",
    icon: Users,
    color: "text-success"
  },
  {
    title: "Completed Tasks",
    value: "284",
    change: "+12.3%",
    description: "this month",
    icon: Calendar,
    color: "text-info"
  },
  {
    title: "Performance Score",
    value: "94%",
    change: "+3.1%",
    description: "organization avg",
    icon: TrendingUp,
    color: "text-warning"
  }
];

const projectProgress = [
  { name: "Project Alpha", progress: 85, status: "On Track" },
  { name: "Beta Release", progress: 62, status: "In Progress" },
  { name: "Security Audit", progress: 94, status: "Almost Done" },
  { name: "Mobile App", progress: 34, status: "Starting" }
];

export function StatsDashboard() {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="shadow-card hover:shadow-elevated transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <span className="text-success font-medium">{stat.change}</span>
                <span className="ml-1">{stat.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Project Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-card">
          <CardHeader className="bg-gradient-card rounded-t-lg">
            <CardTitle>Project Progress</CardTitle>
            <CardDescription>Current status of active projects</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {projectProgress.map((project, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{project.name}</span>
                  <span className="text-sm text-muted-foreground">{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-2" />
                <div className="text-xs text-muted-foreground">{project.status}</div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="bg-gradient-card rounded-t-lg">
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates and milestones</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">API Documentation updated</p>
                  <p className="text-xs text-muted-foreground">Sarah Johnson • 2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-success rounded-full mt-2"></div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Security audit completed</p>
                  <p className="text-xs text-muted-foreground">Mike Davis • 1 day ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-warning rounded-full mt-2"></div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">New team member onboarded</p>
                  <p className="text-xs text-muted-foreground">Lisa Chen • 2 days ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-info rounded-full mt-2"></div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Beta testing phase started</p>
                  <p className="text-xs text-muted-foreground">John Smith • 3 days ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}