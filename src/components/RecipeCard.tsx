'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Recipe } from '@/app/types';
import { toast } from 'sonner';

interface Props {
  recipe: Recipe;
}

export default function RecipeCard({ recipe }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const handleCardClick = () => {
    toast.info(`Opening ${recipe.title}...`, {
      description: 'Loading recipe details',
      duration: 2000,
    });
    setIsOpen(true);
  };

  return (
    <>
      {/* Small Card - Click to Open Modal */}
      <div
        onClick={handleCardClick}
        className="bg-white rounded-lg shadow-lg p-6 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl border border-gray-100"
      >
        <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2">
          {recipe.title}
        </h3>
        <div className="space-y-2">
          <div>
            <p className="font-semibold text-sm text-gray-700">Ingredients:</p>
            <p className="text-sm text-gray-600 line-clamp-1">
              {recipe.ingredients.slice(0, 3).join(', ')}
              {recipe.ingredients.length > 3 && '...'}
            </p>
          </div>
          <div>
            <p className="font-semibold text-sm text-gray-700">Instructions:</p>
            <p className="text-sm text-gray-600 line-clamp-2">
              {recipe.instructions}
            </p>
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Calories: {recipe.nutrition.calories} kcal</span>
            <span>Protein: {recipe.nutrition.protein}g</span>
          </div>
        </div>
      </div>

      {/* Modal Popup */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              {recipe.title}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Ingredients */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Ingredients</h3>
              <ul className="list-disc list-inside space-y-1">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="text-gray-700">{ingredient}</li>
                ))}
              </ul>
            </div>

            {/* Instructions */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Instructions</h3>
              <div className="text-gray-700 whitespace-pre-wrap">
                {recipe.instructions}
              </div>
            </div>

            {/* Nutrition Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Nutrition Information</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-orange-600">{recipe.nutrition.calories}</div>
                  <div className="text-sm text-gray-600">Calories</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">{recipe.nutrition.protein}g</div>
                  <div className="text-sm text-gray-600">Protein</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">{recipe.nutrition.carbs}g</div>
                  <div className="text-sm text-gray-600">Carbs</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-600">{recipe.nutrition.fat}g</div>
                  <div className="text-sm text-gray-600">Fat</div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}