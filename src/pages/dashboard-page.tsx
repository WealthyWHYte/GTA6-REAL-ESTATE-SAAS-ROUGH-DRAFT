// src/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [missions, setMissions] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data } = await supabase
          .from("datasets")
          .select("*")
          .eq("account_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5);

        setMissions(data || []);
      }
    };

    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-green-500">
          🎯 Heist Command Center
        </h1>
        <Button onClick={handleLogout} variant="destructive">
          Logout
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-900 p-6 rounded-lg border border-green-500">
          <h3 className="text-xl font-bold mb-2">Active Missions</h3>
          <p className="text-3xl text-green-500">{missions.length}</p>
        </div>

        <div className="bg-gray-900 p-6 rounded-lg border border-blue-500">
          <h3 className="text-xl font-bold mb-2">Properties Analyzed</h3>
          <p className="text-3xl text-blue-500">
            {missions.reduce((sum, m) => sum + (m.processed_count || 0), 0)}
          </p>
        </div>

        <div className="bg-gray-900 p-6 rounded-lg border border-yellow-500">
          <h3 className="text-xl font-bold mb-2">Deals Pending</h3>
          <p className="text-3xl text-yellow-500">12</p>
        </div>
      </div>

      {/* UPLOAD BUTTON */}
      <div className="mb-8">
        <Button
          onClick={() => navigate("/upload")}
          className="w-full md:w-auto px-8 py-6 bg-green-600 hover:bg-green-700 text-white font-bold text-lg"
        >
          <span className="text-2xl mr-3">📤</span>
          Upload Properties List
        </Button>
      </div>

      {/* Recent Missions */}
      <div className="bg-gray-900 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Recent Heist Missions</h2>

        {missions.length === 0 ? (
          <p className="text-gray-400">
            No missions yet. Upload your first property list!
          </p>
        ) : (
          <div className="space-y-4">
            {missions.map((mission) => (
              <div
                key={mission.id}
                onClick={() => navigate(`/heist-mission/${mission.dataset_id}`)}
                className="bg-gray-800 p-4 rounded-lg cursor-pointer hover:bg-gray-700 transition"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-lg">{mission.name}</h3>
                    <p className="text-gray-400 text-sm">
                      {mission.row_count} properties • {mission.status}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-green-500 font-bold">
                      {Math.round(
                        (mission.processed_count / mission.row_count) * 100
                      )}
                      %
                    </div>
                    <div className="text-gray-400 text-sm">Complete</div>
                  </div>
                </div>

                <div className="mt-3 w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{
                      width: `${
                        (mission.processed_count / mission.row_count) * 100
                      }%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}