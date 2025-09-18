import { useState } from "react";
import { 
  FileText, 
  Upload, 
  Download, 
  MoreHorizontal, 
  Calendar,
  User,
  Search,
  Filter,
  Grid3X3,
  List,
  CheckSquare,
  Archive,
  Share2,
  Eye,
  Folder,
  File
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { doc, increment, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

interface ProjectFile {
  id: string;
  name: string;
  type: string;
  size: string;
  lastModified: string;
  author: string;
  status: "active" | "archived" | "draft";
  category: string;
  isFolder?: boolean;
  downloadCount?: number;
}

const mockFiles: ProjectFile[] = [
  {
    id: "1",
    name: "Project Documentation",
    type: "Folder",
    size: "15 files",
    lastModified: "2024-01-15",
    author: "John Smith",
    status: "active",
    category: "Documentation",
    isFolder: true
  },
  {
    id: "2",
    name: "API Specifications v3.2.pdf",
    type: "PDF",
    size: "2.4 MB",
    lastModified: "2024-01-15",
    author: "Sarah Johnson",
    status: "active",
    category: "Documentation",
    downloadCount: 47
  },
  {
    id: "3", 
    name: "Database_Schema_Final.sql",
    type: "SQL",
    size: "1.8 MB",
    lastModified: "2024-01-14",
    author: "Mike Davis",
    status: "active",
    category: "Database",
    downloadCount: 23
  },
  {
    id: "4",
    name: "UI_Mockups_2024.sketch",
    type: "SKETCH",
    size: "12.5 MB",
    lastModified: "2024-01-12",
    author: "Lisa Chen",
    status: "draft",
    category: "Design",
    downloadCount: 31
  },
  {
    id: "5",
    name: "Test_Results_Q1.xlsx",
    type: "XLSX",
    size: "3.2 MB",
    lastModified: "2024-01-10",
    author: "Alex Wilson",
    status: "active",
    category: "Testing",
    downloadCount: 15
  },
  {
    id: "6",
    name: "Security_Audit_Report.docx",
    type: "DOCX",
    size: "4.1 MB",
    lastModified: "2024-01-08",
    author: "Emma Taylor",
    status: "active",
    category: "Security",
    downloadCount: 62
  },
  {
    id: "7",
    name: "Code_Review_Guidelines.md",
    type: "MD",
    size: "0.5 MB",
    lastModified: "2024-01-05",
    author: "David Brown",
    status: "active",
    category: "Development",
    downloadCount: 38
  },
  {
    id: "8",
    name: "Performance_Metrics.json",
    type: "JSON",
    size: "1.2 MB",
    lastModified: "2024-01-03",
    author: "Rachel Green",
    status: "archived",
    category: "Analytics",
    downloadCount: 19
  }
];

const ProjectFiles = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortBy, setSortBy] = useState("name");

  const categories = ["all", "Documentation", "Database", "Design", "Testing", "Security", "Development", "Analytics"];

  const filteredFiles = mockFiles.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || file.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-success text-white";
      case "draft": return "bg-warning text-white";
      case "archived": return "bg-muted text-muted-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getFileIcon = (type: string, isFolder?: boolean) => {
    if (isFolder) return <Folder className="h-5 w-5 text-primary" />;
    return <File className="h-5 w-5 text-muted-foreground" />;
  };

  const handleSelectAll = () => {
    if (selectedFiles.length === filteredFiles.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(filteredFiles.map(file => file.id));
    }
  };

  const handleFileSelect = (fileId: string) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };
  const handleDownload = async (file: ProjectFile) => {
  try {
    // 1. Dummy download
    const blob = new Blob([`Dummy content of ${file.name}`], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    // 2. Convert file size to bytes
    let sizeInBytes = 0;
    if (file.size.includes("MB")) {
      sizeInBytes = parseFloat(file.size.replace(" MB", "")) * 1024 * 1024;
    } else if (file.size.includes("KB")) {
      sizeInBytes = parseFloat(file.size.replace(" KB", "")) * 1024;
    } else {
      sizeInBytes = parseFloat(file.size); // assume already in bytes
    }

    // 3. Update centralized user activity
    const email = auth.currentUser?.email || "unknown";
    const userActivityRef = doc(db, "userActivities", email);

    await setDoc(
      userActivityRef,
      {
        email,
        lastDownload: new Date(),
        files_downloaded: increment(1),
        totalDownloadedBytes: increment(sizeInBytes),
      },
      { merge: true } // merge to keep other stats intact
    );

    // 4. Optional: also increment download count per file
    const fileRef = doc(db, "projectFiles", file.id);
    await updateDoc(fileRef, { downloadCount: increment(1) });

    console.log(`Downloaded ${file.name}, ${sizeInBytes} bytes added to centralized stats.`);

  } catch (err) {
    console.error("Download failed:", err);
  }
};


  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Project Files</h1>
            <p className="text-muted-foreground">Manage and download your project documents</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90">
            <Upload className="mr-2 h-4 w-4" />
            Upload Files
          </Button>
        </div>

        {/* Filters and Controls */}
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-4 w-full lg:w-auto">
                <div className="relative flex-1 lg:w-80">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search files and folders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border shadow-lg z-50">
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category === "all" ? "All Categories" : category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border shadow-lg z-50">
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="size">Size</SelectItem>
                    <SelectItem value="downloads">Downloads</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setViewMode(viewMode === "list" ? "grid" : "list")}
                >
                  {viewMode === "list" ? <Grid3X3 className="h-4 w-4" /> : <List className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedFiles.length > 0 && (
          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
                </span>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download Selected
                  </Button>
                  <Button variant="outline" size="sm">
                    <Archive className="mr-2 h-4 w-4" />
                    Create ZIP
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Files Display */}
        <Card className="shadow-card">
          <CardHeader className="bg-gradient-card rounded-t-lg">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold">Documents & Files</CardTitle>
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedFiles.length === filteredFiles.length && filteredFiles.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm text-muted-foreground">Select All</span>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {filteredFiles.map((file) => (
                <div key={file.id} className="p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <Checkbox
                      checked={selectedFiles.includes(file.id)}
                      onCheckedChange={() => handleFileSelect(file.id)}
                    />
                    
                    <div className="flex items-center gap-4 flex-1">
                      {getFileIcon(file.type, file.isFolder)}
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground flex items-center gap-2">
                          {file.name}
                          {file.isFolder && <Badge variant="secondary" className="text-xs">Folder</Badge>}
                        </h4>
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
                          {file.downloadCount && (
                            <span className="flex items-center gap-1">
                              <Download className="h-3 w-3" />
                              {file.downloadCount} downloads
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(file.status)} variant="secondary">
                        {file.status}
                      </Badge>
                      
                      <Badge variant="outline" className="text-xs">
                        {file.category}
                      </Badge>
                      
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
  variant="ghost"
  size="sm"
  onClick={() => handleDownload(file)}
>
  <Download className="h-4 w-4" />
</Button>

                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-popover border border-border shadow-lg z-50">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              Preview
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Share2 className="mr-2 h-4 w-4" />
                              Share Link
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              Move to Folder
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Download Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">Most Downloaded</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Security Audit Report</span>
                  <span className="text-sm font-medium">62 downloads</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">API Specifications</span>
                  <span className="text-sm font-medium">47 downloads</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Code Guidelines</span>
                  <span className="text-sm font-medium">38 downloads</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">Recent Uploads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm">
                  <div className="font-medium">API Specifications v3.2</div>
                  <div className="text-muted-foreground">2 hours ago</div>
                </div>
                <div className="text-sm">
                  <div className="font-medium">Database Schema</div>
                  <div className="text-muted-foreground">1 day ago</div>
                </div>
                <div className="text-sm">
                  <div className="font-medium">UI Mockups</div>
                  <div className="text-muted-foreground">3 days ago</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">Storage Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Used</span>
                  <span className="text-sm font-medium">2.4 GB</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Available</span>
                  <span className="text-sm font-medium">7.6 GB</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '24%' }}></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProjectFiles;