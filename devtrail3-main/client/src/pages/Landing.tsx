import { useUser } from "@clerk/clerk-react";
import { SignedIn, SignedOut, SignInButton } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Code2, ArrowRight, BrainCircuit, LineChart, Globe } from "lucide-react";

export default function Landing() {
  
   const { isLoaded, isSignedIn } = useUser();

  if (isLoaded && isSignedIn) {
    window.location.href = "/dashboard";
    return null;
  }
  return (
  <>
    {/* ✅ AUTO REDIRECT WHEN USER IS LOGGED IN */}
    

    {/* 👇 EXISTING LANDING UI (UNCHANGED) */}
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
      
      {/* Background decorations */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Nav */}
      <nav className="container mx-auto px-6 py-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <Code2 className="w-8 h-8 text-primary" />
          <span className="font-bold text-xl tracking-tight">DevTrail</span>
        </div>

        <SignedOut>
          <SignInButton mode="modal">
            <Button 
              variant="outline" 
              className="border-border hover:bg-accent/60 text-foreground"
            >
              Sign In
            </Button>
          </SignInButton>
        </SignedOut>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col justify-center items-center text-center px-4 relative z-10">
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-card/80 border border-border text-sm text-primary mb-4">
            <span className="flex w-2 h-2 rounded-full bg-primary mr-2 animate-pulse"></span>
            AI-Powered Developer Journal
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
            Turn your daily coding <br />
            <span className="text-gradient-primary">struggles into growth.</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Track what you learn, solve bugs faster, and get AI-powered insights to accelerate your developer career.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <SignedOut>
              <SignInButton mode="modal">
                <Button 
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 h-14 rounded-full font-semibold"
                >
                  Get Started Free <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mt-24 px-4 w-full">
          <FeatureCard 
            icon={BrainCircuit}
            title="AI Insights"
            desc="Get daily summaries and personalized learning suggestions based on your entries."
          />
          <FeatureCard 
            icon={LineChart}
            title="Progress Tracking"
            desc="Visualize your growth with beautiful charts and consistency streaks."
          />
          <FeatureCard 
            icon={Globe}
            title="Share Your Journey"
            desc="Build a public profile to showcase your learning to potential employers."
          />
        </div>
      </main>

      <footer className="py-8 text-center text-muted-foreground text-sm border-t border-border mt-20">
        <p>© {new Date().getFullYear()} DevTrail. Built for developers.</p>
      </footer>
    </div>
  </>
);

}

function FeatureCard({ icon: Icon, title, desc }: any) {
  return (
    <div className="p-8 rounded-3xl bg-card border border-border hover:bg-accent/35 transition-colors text-left">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 text-primary">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}

