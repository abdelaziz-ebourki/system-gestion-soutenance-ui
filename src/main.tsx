import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import { TooltipProvider } from "./components/ui/tooltip";
import { Toaster } from "./components/ui/sonner";
import { ThemeProvider } from "./components/theme-provider";

async function enableMocking() {
	if (import.meta.env.DEV) {
		const { worker } = await import("./mocks/browser");
		return worker.start();
	}
}

enableMocking().then(() => {
	createRoot(document.getElementById("root")!).render(
		<StrictMode>
			<ThemeProvider>
				<BrowserRouter>
					<TooltipProvider>
						<App />
						<Toaster position="top-center" />
					</TooltipProvider>
				</BrowserRouter>
			</ThemeProvider>
		</StrictMode>,
	);
});
