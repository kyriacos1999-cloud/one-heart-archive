import Hero from "@/components/Hero";
import HeartWall from "@/components/HeartWall";
import AddHeartForm from "@/components/AddHeartForm";
import MeaningSection from "@/components/MeaningSection";
import RulesSection from "@/components/RulesSection";
import GlobalProof from "@/components/GlobalProof";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <Hero />
      <HeartWall />
      <AddHeartForm />
      <MeaningSection />
      <RulesSection />
      <GlobalProof />
      <Footer />
    </main>
  );
};

export default Index;
