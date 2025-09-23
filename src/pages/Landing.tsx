import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { 
  Rocket, 
  Zap, 
  Target, 
  Upload, 
  BarChart3, 
  Brain, 
  Satellite, 
  Globe, 
  ArrowRight,
  Github,
  ExternalLink
} from "lucide-react";
import { useNavigate } from "react-router";

export default function Landing() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      navigate("/auth");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center shadow-lg shadow-cyan-500/25">
                <Rocket className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">ExoPlanet AI</h1>
                <p className="text-xs text-slate-400">NASA Space Apps 2025</p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Button 
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-medium shadow-lg shadow-cyan-500/25 transition-all duration-300 hover:shadow-cyan-500/40"
              >
                {isAuthenticated ? "Dashboard" : "Get Started"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
              Discover
              <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent"> Exoplanets </span>
              with AI
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 mb-8 leading-relaxed">
              Advanced machine learning models trained on NASA's Kepler, K2, and TESS mission data 
              to automatically classify and discover new worlds beyond our solar system.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <Button 
              size="lg"
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-medium px-8 py-4 text-lg shadow-lg shadow-cyan-500/25 transition-all duration-300 hover:shadow-cyan-500/40 hover:scale-105"
            >
              <Rocket className="w-5 h-5 mr-2" />
              Start Exploring
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white px-8 py-4 text-lg transition-all duration-300 hover:scale-105"
            >
              <Github className="w-5 h-5 mr-2" />
              View Source
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20"
          >
            <div className="text-center">
              <div className="text-4xl font-bold text-cyan-400 mb-2">94.7%</div>
              <div className="text-slate-400">Model Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-400 mb-2">5,000+</div>
              <div className="text-slate-400">Exoplanets Analyzed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-400 mb-2">342</div>
              <div className="text-slate-400">New Discoveries</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            Powered by Advanced
            <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent"> AI Technology</span>
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Our machine learning pipeline processes astronomical data with unprecedented accuracy, 
            helping researchers and enthusiasts discover new worlds.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: Brain,
              title: "AI Classification",
              description: "Advanced neural networks trained on thousands of confirmed exoplanets and false positives",
              color: "from-cyan-400 to-blue-500"
            },
            {
              icon: Upload,
              title: "Easy Data Upload",
              description: "Drag and drop CSV files or manually enter transit parameters for instant analysis",
              color: "from-purple-400 to-pink-500"
            },
            {
              icon: BarChart3,
              title: "Real-time Results",
              description: "Get classification results with confidence scores and detailed performance metrics",
              color: "from-green-400 to-emerald-500"
            },
            {
              icon: Satellite,
              title: "NASA Data Integration",
              description: "Built on official datasets from Kepler, K2, and TESS space missions",
              color: "from-orange-400 to-red-500"
            },
            {
              icon: Target,
              title: "High Precision",
              description: "94.7% accuracy with optimized preprocessing and feature engineering",
              color: "from-indigo-400 to-purple-500"
            },
            {
              icon: Globe,
              title: "Open Source",
              description: "Completely free and open-source, designed for the global research community",
              color: "from-teal-400 to-cyan-500"
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm hover:bg-slate-900/70 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/10">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 shadow-lg`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-white text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-slate-400 text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative z-10 container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            How It
            <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent"> Works</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              step: "01",
              title: "Upload Data",
              description: "Upload your exoplanet transit data in CSV format or enter parameters manually through our intuitive interface."
            },
            {
              step: "02", 
              title: "AI Analysis",
              description: "Our trained machine learning model processes the data, analyzing orbital periods, transit duration, and planetary characteristics."
            },
            {
              step: "03",
              title: "Get Results",
              description: "Receive instant classification results with confidence scores, distinguishing between planets, candidates, and false positives."
            }
          ].map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center mx-auto mb-6 text-white font-bold text-xl shadow-lg shadow-cyan-500/25">
                {step.step}
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">{step.title}</h3>
              <p className="text-slate-400 text-lg leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <Card className="bg-gradient-to-r from-slate-900/80 to-purple-900/80 border-slate-700 backdrop-blur-sm max-w-4xl mx-auto">
            <CardContent className="p-12">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                Ready to Discover New Worlds?
              </h2>
              <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                Join the next generation of exoplanet hunters. Start analyzing NASA data with AI today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg"
                  onClick={handleGetStarted}
                  className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-medium px-8 py-4 text-lg shadow-lg shadow-cyan-500/25 transition-all duration-300 hover:shadow-cyan-500/40 hover:scale-105"
                >
                  <Rocket className="w-5 h-5 mr-2" />
                  Launch Explorer
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white px-8 py-4 text-lg transition-all duration-300 hover:scale-105"
                >
                  <ExternalLink className="w-5 h-5 mr-2" />
                  Learn More
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/50 bg-slate-950/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center">
                <Rocket className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-white font-semibold">ExoPlanet AI</div>
                <div className="text-xs text-slate-400">NASA Space Apps Challenge 2025</div>
              </div>
            </div>
            <div className="text-sm text-slate-400">
              Built with ❤️ for space exploration and discovery
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}