'use client';
import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FaRegCalendarAlt, FaPlus, FaCoffee, FaAppleAlt, FaUtensils, FaHamburger } from 'react-icons/fa';
import { FiCalendar, FiClock, FiTarget, FiTrendingUp } from 'react-icons/fi';
import ClientLayout from '@/app/client-layout';
import { trpc } from '@/lib/trpc/client';
import { Recipe } from '@/app/types';
import { toast } from 'sonner';

const mealTypes = [
  { value: 'breakfast', label: 'Breakfast', icon: FaCoffee },
  { value: 'snack', label: 'Snack', icon: FaAppleAlt },
  { value: 'lunch', label: 'Lunch', icon: FaUtensils },
  { value: 'dinner', label: 'Dinner', icon: FaHamburger },
];

function MealForm({ date, recipes, onClose }: { date: Date; recipes: any[]; onClose: () => void }) {
  const [mealType, setMealType] = useState<'breakfast' | 'snack' | 'lunch' | 'dinner'>('breakfast');
  const [mealSource, setMealSource] = useState<'recipe' | 'custom'>('recipe');
  const [selectedRecipe, setSelectedRecipe] = useState<string>('');
  const [customTitle, setCustomTitle] = useState('');
  const [customIngredients, setCustomIngredients] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const createMealPlan = trpc.mealPlan.create.useMutation();
  const analyzeNutrition = trpc.nutrition.analyze.useMutation();

  const validateForm = (): string | null => {
    if (mealSource === 'recipe') {
      if (!selectedRecipe) {
        return 'Please select a recipe';
      }
    } else {
      if (!customTitle.trim()) {
        return 'Please enter a meal title';
      }
      if (!customIngredients.trim()) {
        return 'Please enter at least one ingredient';
      }
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsLoading(true);

    try {
      // Show loading toast
      const loadingToast = toast.loading('Creating your meal plan...');

      let mealData: any;

      if (mealSource === 'recipe') {
        const recipe = recipes.find(r => r.id === selectedRecipe);
        if (!recipe) {
          throw new Error('Selected recipe not found');
        }

        mealData = {
          id: `meal_${Date.now()}`,
          time: mealType,
          title: recipe.title,
          ingredients: recipe.ingredients,
          instructions: recipe.instructions,
          nutrition: recipe.nutrition,
          recipeId: recipe.id,
          isCustom: false,
        };
      } else {
        // Custom meal - analyze nutrition
        const ingredients = customIngredients.split(',').map(s => s.trim()).filter(Boolean);
        if (ingredients.length === 0) {
          throw new Error('Please enter at least one ingredient');
        }

        try {
          const nutrition = await analyzeNutrition.mutateAsync({
            ingredients,
            instructions: customInstructions || 'Custom meal preparation',
          });

          mealData = {
            id: `meal_${Date.now()}`,
            time: mealType,
            title: customTitle.trim(),
            ingredients,
            instructions: customInstructions.trim(),
            nutrition,
            isCustom: true,
          };
        } catch (nutritionError: any) {
          console.warn('Nutrition analysis failed, using default values:', nutritionError);
          // Use default nutrition values if analysis fails
          mealData = {
            id: `meal_${Date.now()}`,
            time: mealType,
            title: customTitle.trim(),
            ingredients,
            instructions: customInstructions.trim(),
            nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 },
            isCustom: true,
          };
        }
      }

      await createMealPlan.mutateAsync({
        date: date.toISOString(),
        meals: [mealData],
      });

      // Success handling
      toast.dismiss(loadingToast);
      toast.success(`Meal "${mealData.title}" added to ${date.toDateString()}`);

      onClose();
    } catch (error: any) {
      // Error handling
      const errorMessage = error?.message || 'Failed to create meal. Please try again.';

      toast.error(errorMessage);
      console.error('Meal creation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <DialogHeader>
        <DialogTitle className="text-white">Add Meal for {date.toDateString()}</DialogTitle>
      </DialogHeader>

      {/* Meal Type Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300">Meal Type</label>
        <div className="grid grid-cols-2 gap-2">
          {mealTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.value}
                type="button"
                onClick={() => setMealType(type.value as any)}
                className={`p-3 border rounded-lg flex items-center gap-2 transition-colors ${mealType === type.value
                  ? 'border-orange-500 bg-orange-500/20 text-orange-400'
                  : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500 hover:bg-gray-700/50'
                  }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{type.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Meal Source Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300">Meal Source</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMealSource('recipe')}
            className={`flex-1 p-2 border rounded transition-colors ${mealSource === 'recipe'
              ? 'border-orange-500 bg-orange-500/20 text-orange-400'
              : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500 hover:bg-gray-700/50'
              }`}
          >
            From Recipe
          </button>
          <button
            type="button"
            onClick={() => setMealSource('custom')}
            className={`flex-1 p-2 border rounded transition-colors ${mealSource === 'custom'
              ? 'border-orange-500 bg-orange-500/20 text-orange-400'
              : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500 hover:bg-gray-700/50'
              }`}
          >
            Custom Meal
          </button>
        </div>
      </div>

      {mealSource === 'recipe' ? (
        /* Recipe Selection */
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Select Recipe</label>
          <Select value={selectedRecipe} onValueChange={setSelectedRecipe}>
            <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
              <SelectValue placeholder="Choose a recipe..." />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600">
              {recipes.map((recipe) => (
                <SelectItem key={recipe.id} value={recipe.id} className="text-white hover:bg-gray-700">
                  {recipe.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : (
        /* Custom Meal Form */
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Meal Title</label>
            <Input
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="e.g., Quick Pasta Salad"
              required
              className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Ingredients</label>
            <Textarea
              value={customIngredients}
              onChange={(e) => setCustomIngredients(e.target.value)}
              placeholder="Enter ingredients separated by commas (e.g., pasta, tomatoes, olive oil)"
              required
              className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Instructions (Optional)</label>
            <Textarea
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              placeholder="How to prepare this meal..."
              className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
            />
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700">
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white">
          {isLoading ? 'Adding...' : 'Add Meal'}
        </Button>
      </div>
    </form>
  );
}

function MealCard({ meal }: { meal: any }) { // Changed type to any as Meal type is removed
  const [isExpanded, setIsExpanded] = useState(false);

  const getMealIcon = (time: string) => {
    switch (time) {
      case 'breakfast': return FaCoffee;
      case 'snack': return FaAppleAlt;
      case 'lunch': return FaUtensils;
      case 'dinner': return FaHamburger;
      default: return FaUtensils;
    }
  };

  const Icon = getMealIcon(meal.time);

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 hover:bg-gray-800/70 transition-all duration-300">
      <div className="flex items-center gap-3 mb-2">
        <Icon className="w-5 h-5 text-orange-400" />
        <div className="flex-1">
          <h3 className="font-semibold text-white">{meal.title}</h3>
          <p className="text-sm text-gray-400 capitalize">{meal.time}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"
        >
          {isExpanded ? '−' : '+'}
        </Button>
      </div>

      {isExpanded && (
        <div className="space-y-3 pt-2 border-t border-gray-700">
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-1">Ingredients:</h4>
            <ul className="text-sm text-gray-400 list-disc list-inside">
              {meal.ingredients.map((ingredient: string, index: number) => ( // Changed type to string
                <li key={index}>{ingredient}</li>
              ))}
            </ul>
          </div>

          {meal.instructions && (
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-1">Instructions:</h4>
              <p className="text-sm text-gray-400">{meal.instructions}</p>
            </div>
          )}

          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-1">Nutrition:</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-orange-500/20 p-2 rounded-lg border border-orange-500/30">
                <span className="text-orange-300">Calories:</span>
                <span className="ml-1 font-medium text-orange-200">{meal.nutrition.calories} kcal</span>
              </div>
              <div className="bg-green-500/20 p-2 rounded-lg border border-green-500/30">
                <span className="text-green-300">Protein:</span>
                <span className="ml-1 font-medium text-green-200">{meal.nutrition.protein}g</span>
              </div>
              <div className="bg-blue-500/20 p-2 rounded-lg border border-blue-500/30">
                <span className="text-blue-300">Carbs:</span>
                <span className="ml-1 font-medium text-blue-200">{meal.nutrition.carbs}g</span>
              </div>
              <div className="bg-purple-500/20 p-2 rounded-lg border border-purple-500/30">
                <span className="text-purple-300">Fat:</span>
                <span className="ml-1 font-medium text-purple-200">{meal.nutrition.fat}g</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MealPlannerPage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showAllMeals, setShowAllMeals] = useState(false);
  const { data: recipes = [], isLoading: recipesLoading } = trpc.recipe.getAll.useQuery();
  const { data: mealPlan, refetch } = trpc.mealPlan.getByDate.useQuery(
    { date: selectedDate?.toISOString() || new Date().toISOString() },
    { enabled: !!selectedDate }
  );

  useEffect(() => {
    setIsVisible(true);

    // Show data collection toast when user visits the meal planner page
    const dataCollectionToast = toast.info('Collecting your data...', {
      description: 'Setting up your meal planning experience',
      duration: 10000, // 10 seconds
    });

    // Cleanup function to dismiss toast if component unmounts
    return () => {
      toast.dismiss(dataCollectionToast);
    };
  }, []);

  const handleDateClick = (date: Date) => {
    toast.info(`Planning meals for ${date.toDateString()}...`, {
      description: 'Opening meal planner for this date',
      duration: 2000,
    });
    setSelectedDate(date);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    refetch();
  };

  // Reset showAllMeals when date changes
  useEffect(() => {
    setShowAllMeals(false);
  }, [selectedDate]);

  // Completely bypass type system to avoid deep type instantiation
  const meals = (() => {

    const mealPlanData = mealPlan;
    // @ts-expect-error - Bypass all type checking
    const recipes = mealPlanData?.recipes;

    if (Array.isArray(recipes)) {
      return recipes;
    }
    return [];
  })() as any[];

  const mealsByTime = {
    breakfast: meals.filter((m: any) => m.time === 'breakfast'),
    snack: meals.filter((m: any) => m.time === 'snack'),
    lunch: meals.filter((m: any) => m.time === 'lunch'),
    dinner: meals.filter((m: any) => m.time === 'dinner'),
  };

  // Get meals to display (max 3 if not showing all)
  const getMealsToDisplay = (timeMeals: any[]) => {
    if (showAllMeals) return timeMeals;
    return timeMeals.slice(0, 3);
  };

  // Check if there are more meals to show
  const hasMoreMeals = (timeMeals: any[]) => {
    return timeMeals.length > 3;
  };

  return (
    <ClientLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
        </div>

        {/* Dot Pattern Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.05)_1px,transparent_0)] bg-[size:30px_30px]"></div>

        <div className="relative z-10 py-10 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            {/* Header Section */}
            <div className={`text-center mb-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
                    <FiCalendar className="text-white text-2xl" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                    <FiTarget className="text-white text-xs" />
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
                    Smart <span className="text-blue-400">Meal Planner</span>
                  </h1>
                  <p className="text-gray-400 mt-2">AI-Powered Weekly Meal Organization</p>
                </div>
              </div>

              {/* Feature Highlights */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8 max-w-4xl mx-auto">
                <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl p-4 flex items-center gap-3">
                  <FiCalendar className="text-blue-400 text-xl" />
                  <div>
                    <div className="text-white font-semibold">Weekly Planning</div>
                    <div className="text-blue-200 text-xs">Organized Schedule</div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-xl p-4 flex items-center gap-3">
                  <FiClock className="text-purple-400 text-xl" />
                  <div>
                    <div className="text-white font-semibold">Time Management</div>
                    <div className="text-purple-200 text-xs">Efficient Cooking</div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-orange-500/10 to-orange-600/10 border border-orange-500/20 rounded-xl p-4 flex items-center gap-3">
                  <FiTarget className="text-orange-400 text-xl" />
                  <div>
                    <div className="text-white font-semibold">Nutrition Goals</div>
                    <div className="text-orange-200 text-xs">Balanced Meals</div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-500/10 to-green-600/10 border border-green-500/20 rounded-xl p-4 flex items-center gap-3">
                  <FiTrendingUp className="text-green-400 text-xl" />
                  <div>
                    <div className="text-white font-semibold">Progress Tracking</div>
                    <div className="text-green-200 text-xs">Stay on Track</div>
                  </div>
                </div>
              </div>
            </div>

            <div className={`grid md:grid-cols-2 gap-8 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              {/* Calendar */}
              <div className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-6">
                <h2 className="text-xl font-semibold mb-4 text-white flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <FiCalendar className="text-white text-sm" />
                  </div>
                  Calendar
                </h2>
                <Calendar
                  mode="single"
                  selected={selectedDate || new Date()}
                  onSelect={(date) => date && handleDateClick(date)}
                  month={new Date()}
                  className="mx-auto"
                />
              </div>

              {/* Meals for Selected Date */}
              <div className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-white flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                      <FaUtensils className="text-white text-sm" />
                    </div>
                    Meals for {selectedDate ? selectedDate.toDateString() : '...'}
                  </h2>
                  {selectedDate && (
                    <Button onClick={() => setModalOpen(true)} size="sm" className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg">
                      <FaPlus className="w-4 h-4 mr-1" />
                      Add Meal
                    </Button>
                  )}
                </div>

                {!selectedDate ? (
                  <div className="text-center text-gray-400 py-8">
                    <FiCalendar className="text-4xl mx-auto mb-3 text-gray-600" />
                    <p>Click on a date to view and add meals</p>
                  </div>
                ) : meals.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">
                    <FaUtensils className="text-4xl mx-auto mb-3 text-gray-600" />
                    <p>No meals planned for this date</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {mealTypes.map((type) => {
                      const timeMeals = mealsByTime[type.value as keyof typeof mealsByTime];
                      if (timeMeals.length === 0) return null;

                      const mealsToShow = getMealsToDisplay(timeMeals);
                      const hasMore = hasMoreMeals(timeMeals);

                      return (
                        <div key={type.value}>
                          <h3 className="text-lg font-medium text-white mb-2 capitalize flex items-center gap-2">
                            <type.icon className="w-4 h-4 text-orange-400" />
                            {type.label}
                          </h3>
                          <div className="space-y-2">
                            {mealsToShow.map((meal: any) => ( // Changed type to any
                              <MealCard key={meal.id} meal={meal} />
                            ))}
                            {hasMore && !showAllMeals && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowAllMeals(true)}
                                className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg"
                              >
                                Show {timeMeals.length - 3} More Meals
                              </Button>
                            )}
                            {hasMore && showAllMeals && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowAllMeals(false)}
                                className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg"
                              >
                                Show Less
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-w-md bg-gray-900 border-gray-700 rounded-2xl">
            {selectedDate && !recipesLoading && (
              <MealForm
                date={selectedDate}
                recipes={recipes.map((recipe: any) => ({
                  ...recipe,
                  ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
                  nutrition: recipe.nutrition || { calories: 0, protein: 0, carbs: 0, fat: 0 }
                }))}
                onClose={handleCloseModal}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </ClientLayout>
  );
}