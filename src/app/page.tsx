import dynamic from 'next/dynamic';
import { TradingProvider } from "../components/TradingContext";

// Use dynamic import to avoid hydration issues with client components
const TradingDashboard = dynamic(
  () => import("../components/TradingDashboard").then(mod => mod.TradingDashboard),
  { ssr: false }
);

/**
 * Home component serves as the main entry point for the application.
 * It wraps the TradingDashboard with the TradingProvider to provide
 * the necessary context for trading operations.
 */
export default function Home() {
  return (
    <main className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        <TradingProvider>
          <TradingDashboard />
        </TradingProvider>
      </div>
    </main>
  );
}
