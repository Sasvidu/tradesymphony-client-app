import dynamic from 'next/dynamic';
import { TradingProvider } from "../components/TradingContext";

// Use dynamic import to avoid hydration issues with client components
const TradingDashboard = dynamic(
  () => import("../components/TradingDashboard").then(mod => mod.TradingDashboard),
  { ssr: false }
);

export default function Home() {
  return (
    <main className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">TradeSymphony</h1>
        <TradingProvider>
          <TradingDashboard />
        </TradingProvider>
      </div>
    </main>
  );
}
