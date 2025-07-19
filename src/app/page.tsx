"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FiZap, FiTrendingUp, FiUsers, FiArrowRight, FiCheck } from "react-icons/fi";
import { GiCookingPot } from "react-icons/gi";

export default function HomePage() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="flex flex-col-reverse md:flex-row items-center justify-between px-8 py-20 gap-12 max-w-7xl mx-auto w-full">
          <div className={`flex-1 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="flex items-center gap-3 mb-6">

              <h1 className="text-5xl md:text-6xl font-black text-white leading-tight">
                Your AI-Powered <span className="text-orange-500">Kitchen Companion</span>
              </h1>
            </div>
            <p className="text-xl text-gray-300 mb-8 max-w-lg">
              Discover new recipes, plan your meals, and get personalized cooking tips. Cuisine AI brings the power of AI to your kitchen, making every meal smarter and more delicious.
            </p>
            <div className="flex gap-4">
              <Link href="/auth/sign-up">
                <Button className="px-7 py-3 text-lg font-bold shadow-lg bg-orange-500 hover:bg-orange-600 text-white border-0" size="lg">
                  Get Started
                  <FiArrowRight className="ml-2" />
                </Button>
              </Link>
              <Link href="/auth/sign-in">
                <Button className="px-7 py-3 bg-gray-300 text-lg font-bold border-gray-600 text-gray-500 hover:bg-gray-800 hover:text-white" size="lg" variant="outline">
                  Login
                </Button>
              </Link>
            </div>
          </div>
          <div className={`flex-1 flex justify-center transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-green-500/20 rounded-3xl blur-xl"></div>
              <img
                src="https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=600&q=80"
                alt="Fresh ingredients and a tablet in a kitchen"
                className="relative rounded-3xl shadow-2xl w-full max-w-md object-cover border-2 border-orange-500/30 transition-transform duration-300 hover:scale-105"
                loading="lazy"
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16">
          <div className="max-w-5xl mx-auto px-4">
            <div className={`text-center mb-12 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Why Cuisine AI?</h2>
              <p className="text-lg text-gray-400">Experience the future of cooking with AI-powered intelligence</p>
            </div>
            <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              {/* Feature 1 */}
              <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 backdrop-blur-sm border border-orange-500/30 rounded-2xl p-8 flex flex-col items-center text-center hover:scale-105 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-6">
                  <FiZap className="text-white text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">AI Recipe Discovery</h3>
                <p className="text-orange-200">Get recipe suggestions tailored to your tastes, dietary needs, and what's in your fridge.</p>
              </div>
              {/* Feature 2 */}
              <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-sm border border-green-500/30 rounded-2xl p-8 flex flex-col items-center text-center hover:scale-105 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6">
                  <FiTrendingUp className="text-white text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Smart Meal Planning</h3>
                <p className="text-green-200">Plan your week with ease. Let AI suggest balanced meals and generate shopping lists for you.</p>
              </div>
              {/* Feature 3 */}
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-2xl p-8 flex flex-col items-center text-center hover:scale-105 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6">
                  <FiUsers className="text-white text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Personalized Cooking Tips</h3>
                <p className="text-gray-300">Get step-by-step guidance and smart tips based on your skill level and preferences.</p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4">
            <div className={`text-center mb-12 transition-all duration-1000 delay-900 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">How It Works</h2>
              <p className="text-lg text-gray-400">Get started in three simple steps</p>
            </div>
            <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 transition-all duration-1000 delay-1100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-6">
                  <span className="text-white font-bold text-xl">1</span>
                </div>
                <h4 className="text-xl font-bold text-white mb-3">Sign Up</h4>
                <p className="text-gray-400">Create your free account in seconds.</p>
              </div>
              {/* Step 2 */}
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6">
                  <span className="text-white font-bold text-xl">2</span>
                </div>
                <h4 className="text-xl font-bold text-white mb-3">Tell Us Your Preferences</h4>
                <p className="text-gray-400">Let the assistant know your tastes, allergies, and goals.</p>
              </div>
              {/* Step 3 */}
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6">
                  <span className="text-white font-bold text-xl">3</span>
                </div>
                <h4 className="text-xl font-bold text-white mb-3">Enjoy Smarter Cooking</h4>
                <p className="text-gray-400">Get recipes, plans, and tips tailored just for you.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 bg-gradient-to-r from-orange-500/20 to-green-500/20 backdrop-blur-sm border-t border-orange-500/30">
          <div className="text-center">
            <div className={`transition-all duration-1000 delay-1300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Ready to Cook Smarter?</h2>
              <p className="text-xl text-gray-300 mb-8">Join Cuisine AI and transform your kitchen experience today.</p>
              <Link href="/auth/sign-up">
                <Button className="px-8 py-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg shadow-lg border-0 transition-all duration-300 hover:scale-105" size="lg">
                  <FiCheck className="mr-2" />
                  Join Now
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 text-center text-gray-400 text-sm border-t border-gray-800">
          <div className="max-w-4xl mx-auto px-4">
            <p>&copy; {new Date().getFullYear()} Cuisine AI Assistant. All rights reserved.</p>
            <p className="mt-2 text-xs text-gray-500">Powered by AI • Built for Food Lovers</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
