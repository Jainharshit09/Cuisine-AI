'use client';
import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc/client';
import RecipeCard from '@/components/RecipeCard';
import { Input } from '@/components/ui/input';
import { Recipe } from '@/app/types';
import ClientLayout from '../../client-layout';
import { FiSearch, FiBookOpen, FiClock, FiStar, FiChevronRight } from 'react-icons/fi';
import { GiCookingPot, GiKnifeFork } from 'react-icons/gi';

function toRecipeType(recipe: any): Recipe {
  return {
    ...recipe,
    ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
    nutrition: typeof recipe.nutrition === 'object' && recipe.nutrition !== null ? recipe.nutrition : { calories: 0, protein: 0, carbs: 0, fat: 0 },
  };
}

export default function Recipes() {
  const [search, setSearch] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const { data: recipes, isLoading } = trpc.recipe.getAll.useQuery();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Ensure all recipes are of type Recipe before filtering/mapping
  const normalizedRecipes = (recipes || []).map(toRecipeType);
  const filteredRecipes = normalizedRecipes.filter((recipe) =>
    recipe.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ClientLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-green-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
        </div>

        {/* Circuit Pattern Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_0)] bg-[size:20px_20px]"></div>

        <div className="relative z-10 py-10 px-4 md:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Header Section - Redesigned for Recipes */}
            <div className={`mb-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              {/* Main Title Row */}
              <div className="flex flex-col md:flex-row items-center justify-between mb-8">
                <div className="flex items-center gap-4 mb-6 md:mb-0">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center">
                      <GiKnifeFork className="text-white text-2xl" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <FiStar className="text-white text-xs" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
                      Recipe <span className="text-orange-500">Collection</span>
                    </h1>
                    <p className="text-gray-400 mt-2">AI-Curated Culinary Masterpieces</p>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="flex gap-4">
                  <div className="bg-gradient-to-r from-orange-500/20 to-orange-600/20 border border-orange-500/30 rounded-xl px-4 py-2 text-center">
                    <div className="text-orange-400 font-bold text-lg">{filteredRecipes.length}</div>
                    <div className="text-orange-200 text-xs">Recipes</div>
                  </div>
                  <div className="bg-gradient-to-r from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl px-4 py-2 text-center">
                    <div className="text-green-400 font-bold text-lg">AI</div>
                    <div className="text-green-200 text-xs">Powered</div>
                  </div>
                </div>
              </div>

              {/* Feature Highlights */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-gradient-to-r from-orange-500/10 to-orange-600/10 border border-orange-500/20 rounded-xl p-4 flex items-center gap-3">
                  <FiBookOpen className="text-orange-400 text-xl" />
                  <div>
                    <div className="text-white font-semibold">Recipe Library</div>
                    <div className="text-orange-200 text-xs">Curated Collection</div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-500/10 to-green-600/10 border border-green-500/20 rounded-xl p-4 flex items-center gap-3">
                  <FiClock className="text-green-400 text-xl" />
                  <div>
                    <div className="text-white font-semibold">Quick Access</div>
                    <div className="text-green-200 text-xs">Instant Recipes</div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl p-4 flex items-center gap-3">
                  <GiCookingPot className="text-blue-400 text-xl" />
                  <div>
                    <div className="text-white font-semibold">Smart Cooking</div>
                    <div className="text-blue-200 text-xs">AI Guidance</div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-xl p-4 flex items-center gap-3">
                  <FiStar className="text-purple-400 text-xl" />
                  <div>
                    <div className="text-white font-semibold">Personalized</div>
                    <div className="text-purple-200 text-xs">Tailored to You</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Search Section */}
            <div className={`bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 mb-12 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                  <FiSearch className="text-white text-lg" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white">Recipe Discovery</h2>
              </div>

              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search for AI-generated recipes..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 rounded-2xl px-6 py-4 text-lg focus:border-orange-500 focus:ring-orange-500/20 transition-all duration-300"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Recipes Grid */}
            <div className={`transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-gray-700 border-t-orange-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-green-500 rounded-full animate-spin animation-delay-500"></div>
                  </div>
                  <span className="ml-4 text-gray-300 text-lg">AI is cooking up recipes...</span>
                </div>
              ) : filteredRecipes && filteredRecipes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredRecipes.map((recipe, index) => (
                    <div
                      key={recipe.id}
                      className={`transform transition-all duration-700 delay-${index * 100} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                    >
                      <RecipeCard recipe={recipe} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="relative mb-8">
                    <div className="w-32 h-32 bg-gradient-to-br from-orange-500/20 to-green-500/20 rounded-full flex items-center justify-center">
                      <GiCookingPot className="text-orange-400 text-4xl" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">No recipes found</h3>
                  <p className="text-gray-400 text-center max-w-md">
                    Try uploading ingredients or adjusting your search. Our AI is ready to create personalized recipes for you.
                  </p>
                  <div className="mt-6 flex gap-4">
                    <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce delay-100"></div>
                    <div className="w-3 h-3 bg-white rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
}