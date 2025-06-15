import { ThemeProvider, useTheme } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import React, { useEffect, useState } from "react";
import { Navigation } from "./components/Navigation";
import { HomePage } from "./pages/homePage";

const App: React.FC = () => {
  const { theme } = useTheme();
  const [htmlClasses, setHtmlClasses] = useState("");

  useEffect(() => {
    // Check what classes are actually on the HTML element
    const updateHtmlClasses = () => {
      setHtmlClasses(document.documentElement.className);
    };

    updateHtmlClasses();

    // Watch for changes
    const observer = new MutationObserver(updateHtmlClasses);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <div className="flex items-center justify-end fixed top-4 right-4 z-10">
        <ThemeToggle />
      </div>
      <div className="fixed top-0 left-0 w-full z-1">
        <Navigation />
      </div>

      <HomePage />
    </ThemeProvider>
  );
};

export default App;
