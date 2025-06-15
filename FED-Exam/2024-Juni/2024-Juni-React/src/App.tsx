import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import React, { useEffect, useState } from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router";
import { Navigation } from "./components/Navigation";
import { BookingPage } from "./pages/BookingPage";
import { EditAppointmentPage } from "./pages/EditAppointmentPage";
import { ViewAppointmentPage } from "./pages/ViewAppointmentPage";
import { HomePage } from "./pages/homePage";

const App: React.FC = () => {
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
      <Router>
        <div className="flex items-center justify-end fixed top-4 right-4 z-10">
          <ThemeToggle />
        </div>
        <div className="fixed top-0 left-0 w-full z-1">
          <Navigation />
        </div>

        <div className=" overflow-hidden">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/book" element={<BookingPage />} />
            <Route
              path="/book/service"
              element={<BookingPage serviceType="service" />}
            />
            <Route
              path="/book/repair"
              element={<BookingPage serviceType="repair" />}
            />
            <Route
              path="/book/inspection"
              element={<BookingPage serviceType="inspection" />}
            />
            <Route path="/agreement/edit" element={<EditAppointmentPage />} />
            <Route path="/agreement/view" element={<ViewAppointmentPage />} />
          </Routes>
        </div>

        <Toaster />
      </Router>
    </ThemeProvider>
  );
};

export default App;
