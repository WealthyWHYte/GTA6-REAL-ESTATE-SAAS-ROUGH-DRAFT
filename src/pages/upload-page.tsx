// src/pages/upload-page.tsx
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload as UploadIcon, X, AlertTriangle } from "lucide-react";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const LARGE_FILE_WARNING = 5 * 1024 * 1024; // 5MB

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async () => {
    if (files.length === 0) return;

    setLoading(true);
    setUploadProgress("Processing CSV files...");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Process each file
      const datasetIds: string[] = [];

      for (const file of files) {
        setUploadProgress(`Processing ${file.name}...`);

        // Read CSV content
        const csv_data = await file.text();

        // Call Supabase Edge Function
        const { data, error } = await supabase.functions.invoke('process-csv', {
          body: {
            csv_data,
            account_id: user.id
          }
        });

        if (error) throw error;

        datasetIds.push(data.dataset_id);
      }

      toast({
        title: "🎯 ALL MISSIONS INITIATED",
        description: `${files.length} heist missions are now active!`,
      });

      // Navigate to mission control with all datasets
      navigate(`/mission-control?datasets=${datasetIds.join(",")}`);
    } catch (error) {
      toast({
        title: "❌ UPLOAD FAILED",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setUploadProgress("");
    }
  };





  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files).filter((file) => {
        // ✅ OPTIMIZATION 2: File size validation
        if (!file.name.endsWith(".csv")) {
          return false;
        }
        if (file.size > MAX_FILE_SIZE) {
          toast({
            title: "❌ FILE TOO LARGE",
            description: `${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds 10MB limit.`,
            variant: "destructive",
          });
          return false;
        }
        return true;
      });

      if (droppedFiles.length === 0) {
        toast({
          title: "❌ NO VALID FILES",
          description: "Only CSV files under 10MB are accepted.",
          variant: "destructive",
        });
      } else {
        setFiles(droppedFiles);

        // ✅ OPTIMIZATION 3: Large file warnings
        const largeFiles = droppedFiles.filter((f) => f.size > LARGE_FILE_WARNING);
        if (largeFiles.length > 0) {
          toast({
            title: "⚠️ LARGE FILES DETECTED",
            description: `${largeFiles.length} file(s) over 5MB. Processing may take longer.`,
          });
        }
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files).filter((file) => {
        if (!file.name.endsWith(".csv")) {
          return false;
        }
        if (file.size > MAX_FILE_SIZE) {
          toast({
            title: "❌ FILE TOO LARGE",
            description: `${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds 10MB limit.`,
            variant: "destructive",
          });
          return false;
        }
        return true;
      });

      setFiles(selectedFiles);

      const largeFiles = selectedFiles.filter((f) => f.size > LARGE_FILE_WARNING);
      if (largeFiles.length > 0) {
        toast({
          title: "⚠️ LARGE FILES DETECTED",
          description: `${largeFiles.length} file(s) over 5MB. Processing may take longer.`,
        });
      }
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  const hasLargeFiles = files.some((f) => f.size > LARGE_FILE_WARNING);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-gta font-black text-transparent bg-gradient-neon bg-clip-text mb-4">
            UPLOAD MISSION DATA
          </h1>
          <div className="flex items-center justify-center gap-2 text-vice-cyan text-xl">
            <span className="text-2xl">📤</span>
            <span>MULTIPLE CSV FILES SUPPORTED</span>
          </div>
        </div>

        {/* File Drop Zone */}
        <div className="mission-card p-8">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
              dragActive
                ? "border-vice-pink bg-vice-pink/10"
                : "border-vice-cyan/30 bg-muted/50"
            }`}
          >
            {files.length > 0 ? (
              <div className="space-y-4">
                <div className="text-6xl">✅</div>
                <div>
                  <p className="text-2xl font-gta text-vice-green mb-2">
                    {files.length} FILE{files.length > 1 ? "S" : ""} LOCKED IN
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Total size: {(totalSize / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>

                {/* Large file warning */}
                {hasLargeFiles && (
                  <div className="flex items-center justify-center gap-2 text-vice-orange bg-vice-orange/10 p-3 rounded-lg">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="text-sm">
                      Large files detected - processing may take 2-3 minutes
                    </span>
                  </div>
                )}

                {/* File List */}
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {files.map((file, index) => {
                    const isLarge = file.size > LARGE_FILE_WARNING;
                    return (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-3 bg-muted rounded-lg border ${
                          isLarge ? "border-vice-orange/50" : "border-vice-cyan/20"
                        }`}
                      >
                        <div className="text-left">
                          <p className="text-sm font-bold text-foreground flex items-center gap-2">
                            {file.name}
                            {isLarge && (
                              <span className="text-xs text-vice-orange">⚠️ Large</span>
                            )}
                          </p>
                          <p className="text-xs text-vice-cyan">
                            📊 {(file.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                        <Button
                          onClick={() => removeFile(index)}
                          variant="ghost"
                          size="sm"
                          className="text-vice-orange hover:bg-vice-orange/10"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <>
                <div className="text-8xl mb-6">📁</div>
                <p className="text-2xl font-gta text-vice-cyan mb-2">
                  DROP MULTIPLE CSV FILES HERE
                </p>
                <p className="text-muted-foreground mb-6">or</p>
                <label className="inline-block">
                  <Button
                    variant="neon-cyan"
                    size="lg"
                    className="cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <UploadIcon className="mr-2 w-5 h-5" />
                    BROWSE FILES
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-muted-foreground mt-4">
                  ⚠️ MAX 10MB PER FILE • MULTIPLE FILES SUPPORTED
                </p>
              </>
            )}
          </div>

          {/* Upload Button */}
          {files.length > 0 && (
            <div className="space-y-3 mt-6">
              {uploadProgress && (
                <p className="text-center text-vice-cyan animate-pulse">{uploadProgress}</p>
              )}
              <Button
                onClick={handleUpload}
                disabled={loading}
                variant="neon-pink"
                size="lg"
                className="w-full text-xl font-gta"
              >
                {loading ? (
                  <>
                    <span className="animate-pulse">
                      ⚙️ {uploadProgress || `INITIATING ${files.length} HEIST MISSION${files.length > 1 ? "S" : ""}...`}
                    </span>
                  </>
                ) : (
                  <>
                    🚀 INITIATE {files.length} HEIST MISSION{files.length > 1 ? "S" : ""}
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Back Button */}
        <div className="text-center mt-8">
          <Button
            onClick={() => navigate("/mission-briefing")}
            variant="outline"
            className="border-muted-foreground/30"
          >
            ← BACK TO BRIEFING
          </Button>
        </div>

        {/* Status Info */}
        <div className="mission-card mt-8 p-6">
          <h3 className="font-gta text-vice-yellow mb-3">📋 FILE REQUIREMENTS</h3>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>✓ CSV format from PropWire</li>
            <li>✓ Must include: address, city, state, price</li>
            <li>✓ Maximum: 10MB per file</li>
            <li>✓ Recommended: 1000-2500 properties per file</li>
            <li>✓ Large files (5MB+) will process slower</li>
            <li>✓ Upload multiple files for parallel processing</li>
          </ul>
        </div>
      </div>
    </div>
  );
}