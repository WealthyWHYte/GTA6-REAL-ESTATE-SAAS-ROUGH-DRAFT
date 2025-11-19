// src/pages/closer-agent.tsx

import { useNavigate } from "react-router-dom";

export default function CloserAgentPage() {
  const navigate = useNavigate();

  // Redirect to the new agent page structure
  navigate("/agent/email-closer", { replace: true });
  return null;
}
