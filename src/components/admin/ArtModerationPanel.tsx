import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useArtGallery } from '../../hooks/useArtGallery';
import { useTelegramBot } from '../../hooks/useTelegramBot';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  XCircle, 
  Star, 
  Eye, 
  Heart, 
  Clock, 
  User, 
  Calendar,
  ExternalLink,
  RefreshCw
} from 'lucide-react';

interface ArtSubmission {
  id: string;
  file_url?: string;
  title: string;
  artist_name: string;
  description?: string;
  email?: string;
  telegram_handle?: string;
  source: 'user' | 'scraped' | 'admin';
  approved: boolean;
  featured: boolean;
  view_count: number;
  likes: number;
  created_at: string;
  platform?: string;
  origin_url?: string;
}

export const ArtModerationPanel = () => {
  const { approvedArt, pendingArt, stats, loading, refreshData } = useArtGallery();
  const { notifyAdmin } = useTelegramBot();
  const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending');
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Refresh data when component mounts
    refreshData();
  }, [refreshData]);

  const handleApprove = async (art: ArtSubmission) => {
    if (processingIds.has(art.id)) return;
    
    setProcessingIds(prev => new Set(prev).add(art.id));
    
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/admin/approve', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ id: art.id })
      // });
      
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Notify user via Telegram
      await notifyAdmin('approval_needed', {
        action: 'approved',
        artId: art.id,
        title: art.title,
        artist: art.artist_name
      });
      
      // Refresh data
      refreshData();
      
    } catch (error) {
      console.error('Error approving art:', error);
      alert('Failed to approve art. Please try again.');
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(art.id);
        return next;
      });
    }
  };

  const handleReject = async (art: ArtSubmission, reason?: string) => {
    if (processingIds.has(art.id)) return;
    
    if (!confirm(`Are you sure you want to reject "${art.title}" by ${art.artist_name}? This action cannot be undone.`)) {
      return;
    }
    
    setProcessingIds(prev => new Set(prev).add(art.id));
    
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/admin/reject', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ id: art.id, reason })
      // });
      
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Notify about rejection
      await notifyAdmin('system_alert', {
        action: 'rejected',
        artId: art.id,
        title: art.title,
        artist: art.artist_name,
        reason
      });
      
      // Refresh data
      refreshData();
      
    } catch (error) {
      console.error('Error rejecting art:', error);
      alert('Failed to reject art. Please try again.');
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(art.id);
        return next;
      });
    }
  };

  const handleToggleFeatured = async (art: ArtSubmission) => {
    if (processingIds.has(art.id)) return;
    
    setProcessingIds(prev => new Set(prev).add(art.id));
    
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/admin/toggle-featured', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ id: art.id })
      // });
      
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Refresh data
      refreshData();
      
    } catch (error) {
      console.error('Error toggling featured status:', error);
      alert('Failed to update featured status. Please try again.');
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(art.id);
        return next;
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white">Loading moderation panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-purple-400">Art Moderation Panel</h1>
            <p className="text-gray-400 mt-1">Manage GTA VI Art Gallery submissions</p>
          </div>
          <div className="flex gap-4">
            <Button 
              onClick={refreshData}
              variant="outline" 
              className="border-purple-500 text-purple-400"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" asChild>
              <a href="/">← Back to Gallery</a>
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatsCard title="Total Submissions" value={stats.total} color="purple" />
          <StatsCard title="Approved" value={stats.approved} color="green" />
          <StatsCard title="Pending Review" value={stats.pending} color="yellow" />
          <StatsCard title="Featured" value={stats.featured} color="pink" />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'pending' | 'approved')}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Pending Review ({pendingArt.length})
            </TabsTrigger>
            <TabsTrigger value="approved" className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Approved ({approvedArt.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingArt.map((art) => (
                <ArtModerationCard
                  key={art.id}
                  art={art}
                  isPending={true}
                  isProcessing={processingIds.has(art.id)}
                  onApprove={() => handleApprove(art)}
                  onReject={() => handleReject(art)}
                  onToggleFeatured={() => handleToggleFeatured(art)}
                />
              ))}
            </div>
            {pendingArt.length === 0 && (
              <EmptyState 
                title="No pending submissions" 
                description="All caught up! No art submissions waiting for review."
              />
            )}
          </TabsContent>

          <TabsContent value="approved">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {approvedArt.map((art) => (
                <ArtModerationCard
                  key={art.id}
                  art={art}
                  isPending={false}
                  isProcessing={processingIds.has(art.id)}
                  onApprove={() => handleApprove(art)}
                  onReject={() => handleReject(art)}
                  onToggleFeatured={() => handleToggleFeatured(art)}
                />
              ))}
            </div>
            {approvedArt.length === 0 && (
              <EmptyState 
                title="No approved art yet" 
                description="Start approving submissions to see them here."
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Helper Components
interface StatsCardProps {
  title: string;
  value: number;
  color: 'purple' | 'green' | 'yellow' | 'pink';
}

const StatsCard = ({ title, value, color }: StatsCardProps) => {
  const colorClasses = {
    purple: 'border-purple-500 text-purple-400',
    green: 'border-green-500 text-green-400',
    yellow: 'border-yellow-500 text-yellow-400',
    pink: 'border-pink-500 text-pink-400'
  };

  return (
    <Card className={`bg-gray-800 ${colorClasses[color]} border`}>
      <CardContent className="p-4 text-center">
        <div className="text-3xl font-bold mb-1">{value}</div>
        <div className="text-sm opacity-80">{title}</div>
      </CardContent>
    </Card>
  );
};

interface ArtModerationCardProps {
  art: ArtSubmission;
  isPending: boolean;
  isProcessing: boolean;
  onApprove: () => void;
  onReject: () => void;
  onToggleFeatured: () => void;
}

const ArtModerationCard = ({ 
  art, 
  isPending, 
  isProcessing, 
  onApprove, 
  onReject, 
  onToggleFeatured 
}: ArtModerationCardProps) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      <Card className="bg-gray-800 border-gray-700 overflow-hidden">
        {/* Image */}
        <div className="relative h-48 bg-gray-700">
          {art.file_url ? (
            <img
              src={art.file_url}
              alt={art.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <User className="w-8 h-8" />
                </div>
                <p>No preview</p>
              </div>
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute top-2 right-2 flex gap-2">
            {art.featured && (
              <Badge className="bg-yellow-500 text-black">
                <Star className="w-3 h-3 mr-1" />
                Featured
              </Badge>
            )}
            <Badge variant={art.source === 'user' ? 'default' : 'secondary'}>
              {art.source}
            </Badge>
          </div>
        </div>

        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Title and Artist */}
            <div>
              <h3 className="font-bold text-lg text-purple-400 line-clamp-1">
                {art.title}
              </h3>
              <p className="text-gray-400">by {art.artist_name}</p>
            </div>

            {/* Description */}
            {art.description && (
              <p className="text-sm text-gray-300 line-clamp-2">
                {art.description}
              </p>
            )}

            {/* Metadata */}
            <div className="text-xs text-gray-500 space-y-1">
              {art.telegram_handle && (
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  @{art.telegram_handle}
                </div>
              )}
              {art.email && (
                <div>📧 {art.email}</div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(art.created_at).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {art.view_count}
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  {art.likes}
                </span>
              </div>
              {art.origin_url && (
                <a 
                  href={art.origin_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  Original source
                </a>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              {isPending ? (
                <>
                  <Button
                    onClick={onApprove}
                    disabled={isProcessing}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    Approve
                  </Button>
                  <Button
                    onClick={onReject}
                    disabled={isProcessing}
                    variant="destructive"
                    className="flex-1"
                  >
                    {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                    Reject
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={onToggleFeatured}
                    disabled={isProcessing}
                    variant={art.featured ? "default" : "outline"}
                    className="flex-1"
                  >
                    {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Star className="w-4 h-4" />}
                    {art.featured ? 'Unfeature' : 'Feature'}
                  </Button>
                  <Button
                    onClick={onReject}
                    disabled={isProcessing}
                    variant="destructive"
                  >
                    {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                    Delete
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const EmptyState = ({ title, description }: { title: string; description: string }) => (
  <div className="text-center py-12">
    <div className="text-6xl text-gray-600 mb-4">🎨</div>
    <h3 className="text-xl font-semibold text-gray-400 mb-2">{title}</h3>
    <p className="text-gray-500">{description}</p>
  </div>
);

export default ArtModerationPanel;