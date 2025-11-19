import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ProgressBar } from "@/components/art-gallery/ProgressBar";
import {
  Calendar,
  Clock,
  Zap,
  Target,
  ArrowRight,
  Home,
  Heart,
  MessageCircle,
  Upload,
  Users,
  Eye,
  Palette
} from "lucide-react";

export default function CountdownPage() {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [progress, setProgress] = useState(0);
  const [currentArtIndex, setCurrentArtIndex] = useState(0);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [artLikes, setArtLikes] = useState<Record<number, number>>({});
  const [artComments, setArtComments] = useState<Record<number, number>>({});

  // GTA 6 Release Date: November 19, 2026, 12:00 AM EST (5:00 AM UTC)
  const releaseDate = new Date('2026-11-19T05:00:00Z');

  // GTA 6 Announcement Date: January 1, 2024 (for progress calculation)
  const announcementDate = new Date('2024-01-01T00:00:00Z');

  // Community artwork data - using local images from public/fan-art/
  const communityArt = [
    {
      id: 1,
      title: "Vice City Sunset",
      artist: "@GTAFan247",
      image: "/fan-art/GTA 6 Map.png",
      likes: 1247,
      comments: 89
    },
    {
      id: 2,
      title: "Tommy Vercetti Returns",
      artist: "@ViceCityLegend",
      image: "/fan-art/GTA 6 Pic.heic",
      likes: 892,
      comments: 67
    },
    {
      id: 3,
      title: "Ocean Drive Dreams",
      artist: "@MiamiArtist",
      image: "/fan-art/IMG_0085.png",
      likes: 756,
      comments: 45
    },
    {
      id: 4,
      title: "GTA 6 Concept Art",
      artist: "@GameDesigner",
      image: "/fan-art/IMG_0995.png",
      likes: 634,
      comments: 32
    },
    {
      id: 5,
      title: "Vice City Nights",
      artist: "@NightOwl",
      image: "/fan-art/IMG_1182.png",
      likes: 523,
      comments: 28
    },
    {
      id: 6,
      title: "Palm Trees Vice City",
      artist: "@Community",
      image: "/fan-art/IMG_4137.png",
      likes: 445,
      comments: 23
    },
    {
      id: 7,
      title: "Vice City Skyline",
      artist: "@FanArt",
      image: "/fan-art/IMG_4138.jpeg",
      likes: 389,
      comments: 19
    },
    {
      id: 8,
      title: "GTA VI Logo Neon",
      artist: "@LogoDesigner",
      image: "/fan-art/IMG_4139.jpeg",
      likes: 567,
      comments: 34
    },
    {
      id: 9,
      title: "Lucia Character Art",
      artist: "@CharacterArtist",
      image: "/fan-art/IMG_4141.jpeg",
      likes: 723,
      comments: 41
    },
    {
      id: 10,
      title: "Vice City Map Art",
      artist: "@MapArtist",
      image: "/fan-art/gta6-custom-cover.png",
      likes: 298,
      comments: 15
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const difference = releaseDate.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }

      // Calculate progress percentage
      const totalTime = releaseDate.getTime() - announcementDate.getTime();
      const elapsedTime = now.getTime() - announcementDate.getTime();
      const progressPercent = Math.min(100, Math.max(0, (elapsedTime / totalTime) * 100));
      setProgress(progressPercent);
    }, 1000);

    // Auto-rotate artwork every 3 seconds
    const artTimer = setInterval(() => {
      setCurrentArtIndex((prev) => (prev + 1) % communityArt.length);
    }, 3000);

    return () => {
      clearInterval(timer);
      clearInterval(artTimer);
    };
  }, []);

  const handleLike = (artId: number) => {
    setArtLikes(prev => ({
      ...prev,
      [artId]: (prev[artId] || communityArt.find(art => art.id === artId)?.likes || 0) + 1
    }));
  };

  const handleComment = (artId: number) => {
    setArtComments(prev => ({
      ...prev,
      [artId]: (prev[artId] || communityArt.find(art => art.id === artId)?.comments || 0) + 1
    }));
  };

  const features = [
    {
      icon: "🏙️",
      title: "VICE CITY RETURNS",
      description: "The iconic city of Vice City is back with enhanced graphics and new districts"
    },
    {
      icon: "🚗",
      title: "NEXT-GEN VEHICLES",
      description: "Over 100+ vehicles including classics and brand new rides"
    },
    {
      icon: "🎮",
      title: "OPEN WORLD EXPLORATION",
      description: "Explore every inch of Vice City with unprecedented freedom"
    },
    {
      icon: "🎵",
      title: "VIBE RADIO STATIONS",
      description: "Curated soundtrack featuring Miami's hottest tracks"
    },
    {
      icon: "💰",
      title: "REAL ESTATE EMPIRE",
      description: "Build your property portfolio across Vice City"
    },
    {
      icon: "🔫",
      title: "MISSION SYSTEM",
      description: "Experience the story of Tommy Vercetti like never before"
    }
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-gta font-black text-transparent bg-gradient-neon bg-clip-text mb-4">
            GTA 6 COUNTDOWN
          </h1>
          <div className="flex items-center justify-center gap-2 text-vice-cyan text-xl mb-8">
            <Calendar className="w-6 h-6" />
            <span>DECEMBER 10, 2025</span>
          </div>
        </div>

        {/* Countdown Timer */}
        <Card className="mission-card mb-12">
          <CardHeader>
            <CardTitle className="text-center text-3xl font-gta text-vice-pink">
              🚀 LAUNCH COUNTDOWN
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-6 text-center">
              <div className="space-y-2">
                <div className="text-6xl font-gta text-vice-cyan font-black">
                  {timeLeft.days.toString().padStart(2, '0')}
                </div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider">DAYS</div>
              </div>
              <div className="space-y-2">
                <div className="text-6xl font-gta text-vice-orange font-black">
                  {timeLeft.hours.toString().padStart(2, '0')}
                </div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider">HOURS</div>
              </div>
              <div className="space-y-2">
                <div className="text-6xl font-gta text-vice-yellow font-black">
                  {timeLeft.minutes.toString().padStart(2, '0')}
                </div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider">MINUTES</div>
              </div>
              <div className="space-y-2">
                <div className="text-6xl font-gta text-vice-pink font-black">
                  {timeLeft.seconds.toString().padStart(2, '0')}
                </div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider">SECONDS</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Community Art Gallery */}
        <Card className="mission-card mb-12">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-gta text-vice-orange">
              🎨 COMMUNITY ART GALLERY
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <div className="aspect-video bg-muted/20 rounded-lg overflow-hidden mb-4">
                <img
                  src={communityArt[currentArtIndex].image}
                  alt={communityArt[currentArtIndex].title}
                  className="w-full h-full object-cover transition-opacity duration-500"
                />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-gta text-vice-cyan mb-1">
                  "{communityArt[currentArtIndex].title}"
                </h3>
                <p className="text-vice-pink mb-4">by {communityArt[currentArtIndex].artist}</p>
                <div className="flex items-center justify-center gap-6 mb-4">
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-vice-pink" />
                    <span className="text-sm">
                      {artLikes[currentArtIndex] || communityArt[currentArtIndex].likes} likes
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-vice-cyan" />
                    <span className="text-sm">
                      {artComments[currentArtIndex] || communityArt[currentArtIndex].comments} comments
                    </span>
                  </div>
                </div>
                <div className="flex justify-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleLike(communityArt[currentArtIndex].id)}
                    className="border-vice-pink text-vice-pink hover:bg-vice-pink hover:text-white"
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    LIKE
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleComment(communityArt[currentArtIndex].id)}
                    className="border-vice-cyan text-vice-cyan hover:bg-vice-cyan hover:text-white"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    COMMENT
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card key={index} className="mission-card hover:scale-105 transition-transform duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-vice-cyan">
                  <span className="text-2xl">{feature.icon}</span>
                  <span className="font-gta text-sm">{feature.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Upload Art Modal */}
        <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
          <DialogTrigger asChild>
            <Button variant="neon-orange" size="lg" className="mb-8">
              <Upload className="mr-2 w-5 h-5" />
              📤 UPLOAD YOUR ART
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center font-gta text-vice-orange">
                📤 UPLOAD FAN ART
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-vice-cyan rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 mx-auto mb-4 text-vice-cyan opacity-50" />
                <p className="text-sm text-muted-foreground">Drag & Drop Image Here</p>
                <p className="text-xs text-muted-foreground">or click to browse</p>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" placeholder="Your artwork title..." />
                </div>

                <div>
                  <Label htmlFor="artist">Your Name</Label>
                  <Input id="artist" placeholder="@username" />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" placeholder="Tell us about your artwork..." />
                </div>

                <div>
                  <Label htmlFor="tags">Tags</Label>
                  <Input id="tags" placeholder="GTA6, ViceCity, + Add more" />
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="neon-cyan" className="flex-1">
                  🚀 UPLOAD
                </Button>
                <Button variant="outline" onClick={() => setUploadModalOpen(false)} className="flex-1">
                  ❌ CANCEL
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Community Stats */}
        <Card className="mission-card mb-8">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-gta text-vice-purple">
              📊 COMMUNITY STATS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Palette className="w-6 h-6 text-vice-orange" />
                  <span className="text-3xl font-gta text-vice-orange">4,782</span>
                </div>
                <div className="text-sm text-muted-foreground">ARTWORKS SUBMITTED</div>
              </div>
              <div>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Users className="w-6 h-6 text-vice-cyan" />
                  <span className="text-3xl font-gta text-vice-cyan">23,456</span>
                </div>
                <div className="text-sm text-muted-foreground">MEMBERS</div>
              </div>
              <div>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Eye className="w-6 h-6 text-vice-pink" />
                  <span className="text-3xl font-gta text-vice-pink">1.2M</span>
                </div>
                <div className="text-sm text-muted-foreground">TOTAL VIEWS</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="mission-card mb-8">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-gta text-vice-green">
              💼 WHILE YOU WAIT...
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <p className="text-vice-cyan text-lg">
              Want to build your real estate empire in the real world?
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
              <Button
                variant="neon-pink"
                size="lg"
                className="text-lg px-8"
                onClick={() => navigate("/mission-briefing")}
              >
                🏢 ENTER THE REAL ESTATE HEIST →
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="text-lg px-8 border-vice-cyan text-vice-cyan hover:bg-vice-cyan hover:text-background"
                onClick={() => window.open('https://t.me/gta6realestate', '_blank')}
              >
                🎮 JOIN TELEGRAM COMMUNITY
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Fun Facts */}
        <Card className="mission-card">
          <CardHeader>
            <CardTitle className="text-vice-orange font-gta">🎮 GTA 6 FACTS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="border-vice-cyan text-vice-cyan">⏱️</Badge>
                  <span className="text-sm">Longest development cycle in gaming history</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="border-vice-orange text-vice-orange">🎨</Badge>
                  <span className="text-sm">Over 100GB of game assets</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="border-vice-yellow text-vice-yellow">🌆</Badge>
                  <span className="text-sm">Vice City is 2x larger than GTA 5's Los Santos</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="border-vice-pink text-vice-pink">🎵</Badge>
                  <span className="text-sm">Licensed soundtrack with 80+ tracks</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="border-vice-green text-vice-green">🚗</Badge>
                  <span className="text-sm">Over 100 vehicles including boats and helicopters</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="border-vice-purple text-vice-purple">🏠</Badge>
                  <span className="text-sm">Interactive real estate system</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
