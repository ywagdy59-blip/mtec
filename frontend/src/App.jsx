
import { BrowserRouter } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import { Toaster } from "react-hot-toast";
import { LangProvider } from "./context/LangContext";
import { AuthProvider } from "./context/AuthContext";
import AppRouter from "./routes/AppRouter";

export default function App() {
  return (
    <BrowserRouter
      future={{
        v7_relativeSplatPath: true,
        v7_startTransition: true,
      }}
    >
      <MotionConfig reducedMotion="user">
        <LangProvider>
          <AuthProvider>
            <AppRouter />

            <Toaster
              position="bottom-right"
              toastOptions={{
                duration: 3500,
                style: {
                  borderRadius: "12px",
                  fontWeight: 600,
                  color: "#0D1633",
                  border: "1px solid #E1E8F7",
                },
              }}
            />
          </AuthProvider>
        </LangProvider>
      </MotionConfig>
    </BrowserRouter>
  );
}
