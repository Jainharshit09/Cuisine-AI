'use client';

import { trpc } from '@/lib/trpc/client';
import type { ShoppingList } from '@/app/types';
import ClientLayout from '../../client-layout';
import { FaShoppingCart, FaPlus, FaEdit, FaCheck, FaTimes, FaChevronDown, FaChevronRight } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FiShoppingCart, FiPlus, FiEdit, FiCheck, FiX, FiChevronDown, FiChevronRight } from 'react-icons/fi';
import { toast } from 'sonner';

function normalizeShoppingList(list: any): ShoppingList {
  return {
    ...list,
    items: Array.isArray(list.items) ? list.items : [],
  };
}

interface RecipeGroup {
  recipeId: string;
  recipeTitle: string;
  items: string[];
}

function organizeItemsByRecipe(items: any[]): RecipeGroup[] {
  const recipeGroups: { [key: string]: RecipeGroup } = {};

  items.forEach((item: any) => {
    if (typeof item === 'object' && item.recipeId) {
      if (!recipeGroups[item.recipeId]) {
        recipeGroups[item.recipeId] = {
          recipeId: item.recipeId,
          recipeTitle: item.recipeTitle,
          items: []
        };
      }
      recipeGroups[item.recipeId].items.push(item.ingredient);
    } else {
      // Handle legacy items (plain strings)
      if (!recipeGroups['ungrouped']) {
        recipeGroups['ungrouped'] = {
          recipeId: 'ungrouped',
          recipeTitle: 'Other Items',
          items: []
        };
      }
      recipeGroups['ungrouped'].items.push(item);
    }
  });

  return Object.values(recipeGroups);
}

export default function ShoppingListPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [newItem, setNewItem] = useState('');
  const [editingItem, setEditingItem] = useState<{ listId: string; groupId: string; index: number; value: string } | null>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const { data: shoppingListsRaw = [], isLoading, isError, refetch } = trpc.shoppingList.getAll.useQuery();
  const addItemsMutation = trpc.shoppingList.addItems.useMutation({
    onSuccess: () => {
      refetch();
      setNewItem('');
    }
  });

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const shoppingLists = shoppingListsRaw.map(normalizeShoppingList);

  const handleAddItem = async () => {
    if (!newItem.trim()) return;

    await addItemsMutation.mutateAsync({
      items: [newItem.trim()]
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddItem();
    }
  };

  const handleEditItem = (listId: string, groupId: string, index: number, currentValue: string) => {
    toast.info('Editing item...', {
      description: 'You can now modify this ingredient',
      duration: 2000,
    });
    setEditingItem({ listId, groupId, index, value: currentValue });
  };

  const handleSaveEdit = async () => {
    if (!editingItem || !editingItem.value.trim()) return;

    toast.info('Saving changes...', {
      description: 'Updating your shopping list',
      duration: 2000,
    });

    const list = shoppingLists.find(l => l.id === editingItem.listId);
    if (!list) return;

    const recipeGroups = organizeItemsByRecipe(list.items);
    const targetGroup = recipeGroups.find(g => g.recipeId === editingItem.groupId);
    if (!targetGroup) return;

    const updatedItems = [...targetGroup.items];
    updatedItems[editingItem.index] = editingItem.value.trim();

    // Reconstruct the items array with the updated item
    const allItems = list.items.map((item: any) => {
      if (typeof item === 'object' && item.recipeId === editingItem.groupId) {
        const itemIndex = targetGroup.items.indexOf(item.ingredient);
        if (itemIndex === editingItem.index) {
          return {
            ...item,
            ingredient: editingItem.value.trim()
          };
        }
      }
      return item;
    });

    await addItemsMutation.mutateAsync({
      items: allItems
    });

    setEditingItem(null);
  };

  const handleCancelEdit = () => {
    toast.info('Edit cancelled', {
      description: 'No changes were made',
      duration: 2000,
    });
    setEditingItem(null);
  };

  const handleDeleteItem = async (listId: string, groupId: string, index: number) => {
    toast.info('Removing item...', {
      description: 'Deleting from your shopping list',
      duration: 2000,
    });

    const list = shoppingLists.find(l => l.id === listId);
    if (!list) return;

    const recipeGroups = organizeItemsByRecipe(list.items);
    const targetGroup = recipeGroups.find(g => g.recipeId === groupId);
    if (!targetGroup) return;

    const updatedGroupItems = targetGroup.items.filter((_, i) => i !== index);

    // Reconstruct the items array without the deleted item
    const allItems = list.items.filter((item: any) => {
      if (typeof item === 'object' && item.recipeId === groupId) {
        const itemIndex = targetGroup.items.indexOf(item.ingredient);
        return itemIndex !== index;
      }
      return true;
    });

    await addItemsMutation.mutateAsync({
      items: allItems
    });
  };

  const handleEditKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const toggleGroup = (groupId: string) => {
    const newCollapsed = new Set(collapsedGroups);
    if (newCollapsed.has(groupId)) {
      newCollapsed.delete(groupId);
    } else {
      newCollapsed.add(groupId);
    }
    setCollapsedGroups(newCollapsed);
  };

  return (
    <ClientLayout>
      <div className="min-h-screen bg-black relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse delay-700"></div>
        </div>

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

        <div className="relative z-10 py-10 px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className={`text-center mb-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                  <FiShoppingCart className="text-white text-xl" />
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-orange-500">
                  AI Shopping List
                </h1>
              </div>
              <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
                Keep track of your ingredients with
                <span className="text-orange-400 font-semibold"> AI intelligence</span> and
                <span className="text-green-400 font-semibold"> smart organization</span>.
              </p>
              <p className="text-sm text-gray-400 mt-4">
                ✨ Ingredients from AI-generated recipes are automatically grouped by dish!
              </p>
            </div>

            {/* Add new item section */}
            <div className={`mb-8 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                    <FiPlus className="text-white text-sm" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Add New Item</h3>
                </div>
                <div className="flex gap-3">
                  <Input
                    type="text"
                    placeholder="Enter ingredient name..."
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-orange-500 focus:ring-orange-500/20"
                  />
                  <Button
                    onClick={handleAddItem}
                    disabled={!newItem.trim() || addItemsMutation.isPending}
                    className="bg-orange-500 hover:bg-orange-600 text-white border-0"
                  >
                    {addItemsMutation.isPending ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Adding...
                      </div>
                    ) : (
                      <FiPlus className="text-lg" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Shopping Lists */}
            <div className={`transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              {isLoading && (
                <div className="flex items-center justify-center py-12">
                  <div className="flex items-center gap-3 text-gray-400">
                    <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                    <span>Loading shopping list...</span>
                  </div>
                </div>
              )}

              {isError && (
                <div className="flex items-center justify-center py-12 text-red-400">
                  <div className="text-center">
                    <FiX className="text-4xl mx-auto mb-3" />
                    <span>Failed to load shopping list.</span>
                  </div>
                </div>
              )}

              {!isLoading && shoppingLists.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <FiShoppingCart className="text-6xl mx-auto mb-4 text-gray-600" />
                  <span className="text-lg">No shopping lists found.</span>
                  <p className="text-sm mt-2 text-gray-500">Add some ingredients to get started!</p>
                  <p className="text-sm text-gray-500">Try generating a recipe to automatically add ingredients here!</p>
                </div>
              )}

              {shoppingLists.map((list: ShoppingList) => {
                const recipeGroups = organizeItemsByRecipe(list.items);
                const totalItems = recipeGroups.reduce((sum, group) => sum + group.items.length, 0);

                return (
                  <div key={list.id} className="mb-8 bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                        <FiShoppingCart className="text-white text-sm" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">
                          🗓 List from {new Date(list.createdAt).toDateString()}
                        </h2>
                        <p className="text-sm text-gray-400">
                          {totalItems} item{totalItems !== 1 ? 's' : ''} across {recipeGroups.length} recipe{recipeGroups.length !== 1 ? 's' : ''} •
                          Last updated: {new Date(list.updatedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {recipeGroups.map((group) => (
                      <div key={group.recipeId} className="mb-6 border-l-4 border-orange-500/50 pl-6">
                        <button
                          onClick={() => toggleGroup(group.recipeId)}
                          className="flex items-center gap-3 w-full text-left font-semibold text-orange-400 hover:text-orange-300 transition-colors"
                        >
                          {collapsedGroups.has(group.recipeId) ? (
                            <FiChevronRight className="w-4 h-4" />
                          ) : (
                            <FiChevronDown className="w-4 h-4" />
                          )}
                          <span className="flex-1">{group.recipeTitle}</span>
                          <span className="text-sm text-gray-400">({group.items.length} items)</span>
                        </button>

                        {!collapsedGroups.has(group.recipeId) && (
                          <ul className="mt-4 space-y-2">
                            {group.items.map((item: string, index: number) => (
                              <li key={index} className="flex items-center gap-3 group">
                                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>

                                {editingItem?.listId === list.id && editingItem?.groupId === group.recipeId && editingItem?.index === index ? (
                                  <div className="flex items-center gap-2 flex-1">
                                    <Input
                                      type="text"
                                      value={editingItem.value}
                                      onChange={(e) => setEditingItem({ ...editingItem, value: e.target.value })}
                                      onKeyPress={handleEditKeyPress}
                                      className="flex-1 bg-gray-800/50 border-gray-600 text-white focus:border-orange-500 focus:ring-orange-500/20"
                                    />
                                    <Button
                                      onClick={handleSaveEdit}
                                      size="sm"
                                      className="bg-green-500 hover:bg-green-600 text-white border-0"
                                    >
                                      <FiCheck className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      onClick={handleCancelEdit}
                                      size="sm"
                                      variant="outline"
                                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                                    >
                                      <FiX className="w-4 h-4" />
                                    </Button>
                                  </div>
                                ) : (
                                  <>
                                    <span className="flex-1 text-gray-300 group-hover:text-white transition-colors">{item}</span>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Button
                                        onClick={() => handleEditItem(list.id, group.recipeId, index, item)}
                                        size="sm"
                                        variant="ghost"
                                        className="text-gray-400 hover:text-orange-400 hover:bg-gray-700"
                                      >
                                        <FiEdit className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        onClick={() => handleDeleteItem(list.id, group.recipeId, index)}
                                        size="sm"
                                        variant="ghost"
                                        className="text-gray-400 hover:text-red-400 hover:bg-gray-700"
                                      >
                                        <FiX className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
}
