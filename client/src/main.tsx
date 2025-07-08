import { createRoot } from "react-dom/client";
import App from "./App";
import TestApp from "./TestApp";
import "./index.css";

// Temporarily use TestApp to debug
createRoot(document.getElementById("root")!).render(<TestApp />);
