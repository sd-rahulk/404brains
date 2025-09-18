import { useState } from "react";
import { 
  FileText, 
  Upload, 
  Download, 
  MoreHorizontal, 
  Calendar,
  User,
  Search,
  Filter
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ProjectFile {
  id: string;
  name: string;
  type: string;
  size: string;
  lastModified: string;
  author: string;
  status: "active" | "archived" | "draft";
}

const mockFiles: ProjectFile[] = [
  {
    id: "1",
    name: "Project Alpha - Requirements.pdf",
    type: "PDF",
    size: "2.4 MB",
    lastModified: "2024-01-15",
    author: "John Smith",
    status: "active"
  },
  {
    id: "2", 
    name: "API Documentation v2.1.docx",
    type: "DOCX",
    size: "1.8 MB",
    lastModified: "2024-01-14",
    author: "Sarah Johnson",
    status: "active"
  },
  {
    id: "3",
    name: "Database Schema Design.sql",
    type: "SQL",
    size: "0.5 MB", 
    lastModified: "2024-01-12",
    author: "Mike Davis",
    status: "draft"
  },
  {
    id: "4",
    name: "Beta Testing Results.xlsx",
    type: "XLSX",
    size: "3.2 MB",
    lastModified: "2024-01-10",
    author: "Lisa Chen",
    status: "active"
  }
];

export function FileManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredFiles, setFilteredFiles] = useState(mockFiles);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-success text-white";
      case "draft": return "bg-warning text-white";
      case "archived": return "bg-muted text-muted-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getFileIcon = (type: string) => {
    return <FileText className="h-5 w-5 text-primary" />;
  };

  return (
    <Card className="shadow-card">
      <CardHeader className="bg-gradient-card rounded-t-lg">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold">Project Files</CardTitle>
          <Button className="bg-primary hover:bg-primary/90">
            <Upload className="mr-2 h-4 w-4" />
            Upload File
          </Button>
        </div>
        
        <div className="flex items-center gap-4 mt-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {filteredFiles.map((file) => (
            <div key={file.id} className="p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {getFileIcon(file.type)}
                  <div>
                    <h4 className="font-medium text-foreground">{file.name}</h4>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {file.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {file.lastModified}
                      </span>
                      <span>{file.size}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Badge className={getStatusColor(file.status)}>
                    {file.status}
                  </Badge>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem>Share</DropdownMenuItem>
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}