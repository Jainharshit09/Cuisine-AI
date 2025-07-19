'use client';

import { useState, useEffect } from 'react';
import IngredientUpload from '@/components/IngredientUpload';
import RecipeCard from '@/components/RecipeCard';
import { trpc } from '@/lib/trpc/client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Recipe } from '@/app/types';
import ClientLayout from '../client-layout';
import { FiZap, FiTrendingUp, FiUsers } from 'react-icons/fi';
import { GiCookingPot } from 'react-icons/gi';

function toRecipeType(recipe: any): Recipe {
  return {
    ...recipe,
    ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
    nutrition: typeof recipe.nutrition === 'object' && recipe.nutrition !== null ? recipe.nutrition : { calories: 0, protein: 0, carbs: 0, fat: 0 },
  };
}

export default function Dashboard() {
  const [isVisible, setIsVisible] = useState(false);
  const { data: recipes, isLoading } = trpc.recipe.getAll.useQuery();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Get only the most recent 3 recipes for the dashboard
  const recentRecipes = recipes ? recipes
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 2)
    .map(toRecipeType) : [];

  return (
    <ClientLayout>
      <div className="min-h-screen bg-black relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

        <div className="relative z-10 py-10 px-4 md:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className={`text-center mb-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                  <GiCookingPot className="text-white text-xl" />
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-orange-500">
                  Welcome to Cuisine AI
                </h1>
              </div>
              <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
                Your personal hub for
                <span className="text-orange-400 font-semibold"> smarter cooking</span>,
                <span className="text-green-400 font-semibold"> meal planning</span>, and
                <span className="text-white font-semibold"> nutrition intelligence</span>.
              </p>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
                <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 backdrop-blur-sm border border-orange-500/30 rounded-2xl p-6 transform hover:scale-105 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-3">
                    <FiZap className="text-orange-400 text-2xl" />
                    <h3 className="text-white font-bold text-lg">AI Generated</h3>
                  </div>
                  <p className="text-orange-200 text-sm">Powered by advanced culinary AI</p>
                </div>

                <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-sm border border-green-500/30 rounded-2xl p-6 transform hover:scale-105 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-3">
                    <FiTrendingUp className="text-green-400 text-2xl" />
                    <h3 className="text-white font-bold text-lg">Smart Planning</h3>
                  </div>
                  <p className="text-green-200 text-sm">Intelligent meal organization</p>
                </div>

                <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-2xl p-6 transform hover:scale-105 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-3">
                    <FiUsers className="text-white text-2xl" />
                    <h3 className="text-white font-bold text-lg">Personalized</h3>
                  </div>
                  <p className="text-gray-300 text-sm">Tailored to your preferences</p>
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              {/* Ingredient Upload Card */}
              <div className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8">
                <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                    <GiCookingPot className="text-white text-sm" />
                  </div>
                  Upload Ingredients
                </h2>
                <IngredientUpload />
              </div>

              {/* Recent Recipes Card */}
              <div className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8">
                <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                    <FiTrendingUp className="text-white text-sm" />
                  </div>
                  Recent Recipes
                </h2>
                {isLoading ? (
                  <div className="flex-1 flex items-center justify-center py-8">
                    <div className="flex items-center gap-3 text-gray-400">
                      <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading recipes...</span>
                    </div>
                  </div>
                ) : recentRecipes && recentRecipes.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4 mb-6">
                    {recentRecipes.map((recipe: Recipe) => (
                      <RecipeCard key={recipe.id} recipe={recipe} />
                    ))}
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center py-8 text-gray-400">
                    <div className="text-center">
                      <GiCookingPot className="text-4xl mx-auto mb-3 text-gray-600" />
                      <p>No recipes yet. Start by uploading ingredients!</p>
                    </div>
                  </div>
                )}
                <Link href="/dashboard/recipes" className="inline-block">
                  <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white border-0 w-full">
                    View All Recipes
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
}