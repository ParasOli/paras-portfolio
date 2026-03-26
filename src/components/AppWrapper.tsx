"use client";

import { useProfile } from "@/context/ProfileContext";
import SplashScreen from "@/components/SplashScreen";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import ScrollProgressBar from "@/components/ScrollProgressBar";

export default function AppWrapper({ children }: { children: React.ReactNode }) {
  const { isLoading } = useProfile();

  return (
    <>
      <ScrollProgressBar />
      <SplashScreen isVisible={isLoading} />
      <Navbar />
      <main className="flex-grow pt-20">
        {children}
      </main>
      <Footer />
      <ChatWidget />
    </>
  );
}

