import * as React from "react";
import { App } from "./App";
import { BrowserRouter } from "react-router-dom";
import { createRoot } from "react-dom/client";
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const container = document.getElementById("root");
const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

serviceWorkerRegistration.register();
