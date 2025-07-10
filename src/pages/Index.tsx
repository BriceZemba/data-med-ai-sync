
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Footer from "@/components/Footer";
import TrustedBy from "@/components/TrustedBy";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <Services />
      <TrustedBy />
      <Footer />
    </div>
  );
};

export default Index;
