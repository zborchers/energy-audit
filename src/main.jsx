import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import EnergyAuditInterpreter from "./EnergyAuditInterpreter.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <EnergyAuditInterpreter />
  </StrictMode>
);
