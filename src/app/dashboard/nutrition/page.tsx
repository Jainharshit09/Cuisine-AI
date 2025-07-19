'use client';
import { useMemo, useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { trpc } from '@/lib/trpc/client';
import ClientLayout from '../../client-layout';
import { Recipe } from '@prisma/client';
import { GiAppleCore } from 'react-icons/gi';
import { FiTrendingUp, FiActivity, FiTarget } from 'react-icons/fi';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function toRecipeType(recipe: any) {
  return {
    ...recipe,
    ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
    nutrition: typeof recipe.nutrition === 'object' && recipe.nutrition !== null ? recipe.nutrition : { calories: 0, protein: 0, carbs: 0, fat: 0 },
  };
}

export default function NutritionTracker() {
  const [isVisible, setIsVisible] = useState(false);
  const { data: recipesRaw } = trpc.recipe.getAll.useQuery();
  const recipes = (recipesRaw || []).map(toRecipeType);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const chartData = useMemo(() => {
    return {
      labels: recipes?.map((recipe: Recipe) => recipe.title) || [],
      datasets: [
        {
          label: 'Calories (kcal)',
          data: recipes?.map((recipe: Recipe) => (recipe.nutrition as any)?.calories || 0) || [],
          backgroundColor: 'rgba(255, 165, 0, 0.7)',
          borderColor: 'rgba(255, 165, 0, 1)',
          borderWidth: 2,
        },
        {
          label: 'Protein (g)',
          data: recipes?.map((recipe: Recipe) => (recipe.nutrition as any)?.protein || 0) || [],
          backgroundColor: 'rgba(34, 197, 94, 0.7)',
          borderColor: 'rgba(34, 197, 94, 1)',
          borderWidth: 2,
        },
        {
          label: 'Carbs (g)',
          data: recipes?.map((recipe: Recipe) => (recipe.nutrition as any)?.carbs || 0) || [],
          backgroundColor: 'rgba(59, 130, 246, 0.7)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 2,
        },
        {
          label: 'Fat (g)',
          data: recipes?.map((recipe: Recipe) => (recipe.nutrition as any)?.fat || 0) || [],
          backgroundColor: 'rgba(168, 85, 247, 0.7)',
          borderColor: 'rgba(168, 85, 247, 1)',
          borderWidth: 2,
        },
      ],
    };
  }, [recipes]);

  // Calculate nutrition totals
  const nutritionTotals = useMemo(() => {
    return recipes.reduce((totals, recipe) => {
      const nutrition = recipe.nutrition as any;
      return {
        calories: totals.calories + (nutrition?.calories || 0),
        protein: totals.protein + (nutrition?.protein || 0),
        carbs: totals.carbs + (nutrition?.carbs || 0),
        fat: totals.fat + (nutrition?.fat || 0),
      };
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  }, [recipes]);

  return (
    <ClientLayout>
      <div className="min-h-screen bg-black relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-blue-500/8 rounded-full blur-3xl animate-pulse delay-700"></div>
        </div>

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

        <div className="relative z-10 py-10 px-4 md:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className={`text-center mb-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                  <FiTrendingUp className="text-white text-xl" />
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-orange-500">
                  AI Nutrition Tracker
                </h1>
              </div>
              <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
                Visualize your recipe nutrition with
                <span className="text-orange-400 font-semibold"> AI insights</span> and
                <span className="text-green-400 font-semibold"> smart tracking</span>.
              </p>
            </div>

            {/* Nutrition Summary Cards */}
            <div className={`grid grid-cols-1 md:grid-cols-4 gap-6 mb-12 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 backdrop-blur-sm border border-orange-500/30 rounded-2xl p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <FiActivity className="text-white text-xl" />
                </div>
                <h3 className="text-white font-bold text-2xl mb-2">{nutritionTotals.calories}</h3>
                <p className="text-orange-200 text-sm">Total Calories</p>
              </div>

              <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-sm border border-green-500/30 rounded-2xl p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <FiTarget className="text-white text-xl" />
                </div>
                <h3 className="text-white font-bold text-2xl mb-2">{nutritionTotals.protein}g</h3>
                <p className="text-green-200 text-sm">Total Protein</p>
              </div>

              <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <FiTrendingUp className="text-white text-xl" />
                </div>
                <h3 className="text-white font-bold text-2xl mb-2">{nutritionTotals.carbs}g</h3>
                <p className="text-blue-200 text-sm">Total Carbs</p>
              </div>

              <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <GiAppleCore className="text-white text-xl" />
                </div>
                <h3 className="text-white font-bold text-2xl mb-2">{nutritionTotals.fat}g</h3>
                <p className="text-purple-200 text-sm">Total Fat</p>
              </div>
            </div>

            {/* Chart Section */}
            <div className={`transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                    <FiTrendingUp className="text-white text-sm" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Recipe Nutrition Analysis</h2>
                </div>

                {recipes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <GiAppleCore className="text-6xl mx-auto mb-4 text-gray-600" />
                    <span className="text-lg">No nutrition data available.</span>
                    <p className="text-sm mt-2 text-gray-500">Add some recipes to get started!</p>
                  </div>
                ) : (
                  <div className="bg-gray-800/30 rounded-2xl p-6">
                    <Bar
                      data={chartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'top',
                            labels: {
                              color: '#ffffff',
                              font: {
                                size: 12
                              }
                            }
                          },
                          title: {
                            display: true,
                            text: 'Recipe Nutrition Breakdown',
                            color: '#ffffff',
                            font: {
                              size: 16,
                              weight: 'bold'
                            }
                          }
                        },
                        scales: {
                          x: {
                            ticks: {
                              color: '#9ca3af',
                              maxRotation: 45
                            },
                            grid: {
                              color: 'rgba(255, 255, 255, 0.1)'
                            }
                          },
                          y: {
                            ticks: {
                              color: '#9ca3af'
                            },
                            grid: {
                              color: 'rgba(255, 255, 255, 0.1)'
                            }
                          }
                        }
                      }}
                      height={400}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
}