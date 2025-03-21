import React from "react";
import { createRoot } from "react-dom/client";
import PopupMessage from "./components/PopupMessage";

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<PopupMessage />);
}
