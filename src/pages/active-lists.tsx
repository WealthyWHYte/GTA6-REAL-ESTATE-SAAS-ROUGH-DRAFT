import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ArrowLeft,
  FileText,
  TrendingUp,
  Settings,
  Search,
  Upload
} from "lucide-react";

interface PropertyList {
  id: string;
  name: string;
  uploadDate: string;
  propertyCount: number;
  status: 'processing' | 'complete';
  processedCount: number;
  market: string;
}

export default function ActiveListsPage() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("uploadDate");

  const propertyLists: PropertyList[] = [
    {
      id: "1",
      name: "MIAMI_BEACH_Q1_2025",
      uploadDate: "2025-01-15",
      propertyCount: 1247,
      status: 'processing',
      processedCount: 523,
      market: "Miami Beach, FL"
    },
    {
      id: "2",
      name: "FORT_LAUDERDALE_Q1_2025",
      uploadDate: "2025-01-14",
      propertyCount: 847,
      status: 'complete',
      processedCount: 847,
      market: "Fort Lauderdale, FL"
    },
    {
      id: "3",
      name: "BOCA_RATON_Q1_2025",
      uploadDate: "2025-01-13",
      propertyCount: 623,
      status: 'complete',
      processedCount: 623,
      market: "Boca Raton, FL"
    },
    {
      id: "4",
      name: "MIAMI_DOWNTOWN_Q1_2025",
      uploadDate: "2025-01-12",
      propertyCount: 892,
      status: 'processing',
      processedCount: 734,
      market: "Miami Downtown, FL"
    }
  ];

  const filteredLists = propertyLists.filter(list =>
    list.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    list.market.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedLists = [...filteredLists].sort((a, b) => {
    switch (sortBy) {
      case 'uploadDate':
        return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
      case 'propertyCount':
        return b.propertyCount - a.propertyCount;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  const getStatusBadge = (status: string, processedCount: number, totalCount: number) => {
    if (status === 'complete') {
      return <Badge variant="outline" className="border-vice-green text-vice-green">✅ COMPLETE</Badge>;
    }
    const percentage = Math.round((processedCount / totalCount) * 100);
    return (
      <Badge variant="outline" className="border-vice-orange text-vice-orange">
        ⚙️ PROCESSING ({percentage}%)
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(-1)}
              className="border-vice-cyan text-vice-cyan hover:bg-vice-cyan hover:text-background"
            >
              <ArrowLeft className="mr-2 w-4 h-4" />
              BACK
            </Button>
            <div>
              <h1 className="text-4xl font-gta font-black text-transparent bg-gradient-neon bg-clip-text">
                ACTIVE PROPERTY LISTS
              </h1>
              <p className="text-vice-cyan font-body">Manage and monitor your uploaded property datasets</p>
            </div>
          </div>
          <Button variant="neon-cyan" onClick={() => navigate("/upload")}>
            <Upload className="mr-2 w-4 h-4" />
            UPLOAD NEW LIST
          </Button>
        </div>

        {/* Filters and Search */}
        <Card className="mission-card mb-6">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2 flex-1 min-w-64">
                <Search className="w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search lists..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Sort by:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="uploadDate">Upload Date</SelectItem>
                    <SelectItem value="propertyCount">Property Count</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lists Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {sortedLists.map((list) => (
            <Card key={list.id} className="mission-card">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="font-gta text-vice-cyan text-lg">{list.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{list.market}</p>
                  </div>
                  {getStatusBadge(list.status, list.processedCount, list.propertyCount)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Uploaded</div>
                      <div className="font-medium">{list.uploadDate}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Properties</div>
                      <div className="font-medium text-vice-orange">{list.propertyCount.toLocaleString()}</div>
                    </div>
                  </div>

                  {list.status === 'processing' && (
                    <div>
                      <div className="text-sm text-muted-foreground mb-2">
                        Processing: {list.processedCount} / {list.propertyCount}
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-vice-cyan h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(list.processedCount / list.propertyCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-vice-cyan text-vice-cyan"
                      onClick={() => navigate(`/heist-mission/${list.id}`)}
                    >
                      <FileText className="mr-2 w-4 h-4" />
                      VIEW PROPERTIES
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 border-vice-orange text-vice-orange">
                      <TrendingUp className="mr-2 w-4 h-4" />
                      ANALYTICS
                    </Button>
                    <Button variant="outline" size="sm" className="border-vice-yellow text-vice-yellow">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Summary Stats */}
        <Card className="mission-card mt-6">
          <CardHeader>
            <CardTitle className="font-gta text-vice-pink">SUMMARY</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-gta text-vice-cyan mb-1">
                  {propertyLists.length}
                </div>
                <div className="text-sm text-muted-foreground">TOTAL LISTS</div>
              </div>
              <div>
                <div className="text-2xl font-gta text-vice-green mb-1">
                  {propertyLists.reduce((sum, list) => sum + list.propertyCount, 0).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">TOTAL PROPERTIES</div>
              </div>
              <div>
                <div className="text-2xl font-gta text-vice-orange mb-1">
                  {propertyLists.filter(list => list.status === 'complete').length}
                </div>
                <div className="text-sm text-muted-foreground">COMPLETED</div>
              </div>
              <div>
                <div className="text-2xl font-gta text-vice-yellow mb-1">
                  {propertyLists.filter(list => list.status === 'processing').length}
                </div>
                <div className="text-sm text-muted-foreground">PROCESSING</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
