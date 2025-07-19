'use client';
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { trpc } from '@/lib/trpc/client';
import { FiUpload, FiCamera, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { toast } from 'sonner';

export default function IngredientUpload() {
  const [image, setImage] = useState<File | null>(null);
  const [dishName, setDishName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const uploadImage = trpc.ingredient.uploadImage.useMutation();

  const validateImage = (file: File): string | null => {
    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return 'Image size must be less than 10MB';
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return 'Please upload a valid image file (JPG, PNG, or WebP)';
    }

    return null;
  };

  const handleImageChange = (file: File | null) => {
    setError(null);
    setSuccess(false);

    if (!file) {
      setImage(null);
      return;
    }

    const validationError = validateImage(file);
    if (validationError) {
      toast.error(validationError);
      setError(validationError);
      return;
    }

    setImage(file);
    toast.success('Image selected successfully!');
  };

  const handleUpload = async () => {
    if (!image) {
      toast.error('Please select an image to upload');
      return;
    }

    setUploading(true);
    setSuccess(false);
    setError(null);

    try {
      // Show loading toast
      const loadingToast = toast.loading('Processing your image...');

      // Convert image to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          if (result) {
            resolve(result.split(',')[1]);
          } else {
            reject(new Error('Failed to read image file'));
          }
        };
        reader.onerror = () => reject(new Error('Failed to read image file'));
        reader.readAsDataURL(image);
      });

      // Upload to server
      await uploadImage.mutateAsync({
        image: base64,
        dishName: dishName.trim() || undefined
      });

      // Success handling
      toast.dismiss(loadingToast);
      toast.success('Image uploaded successfully! AI is analyzing your ingredients...');

      setSuccess(true);
      setDishName('');
      setImage(null);

      // Reset success state after delay
      setTimeout(() => setSuccess(false), 3000);

    } catch (err: any) {
      // Error handling
      const errorMessage = err?.message || 'Failed to upload image. Please try again.';

      toast.error(errorMessage);
      setError(errorMessage);

      // Reset error after delay
      setTimeout(() => setError(null), 5000);

      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FiCamera className="text-white text-2xl" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Upload Ingredient Image</h3>
        <p className="text-gray-400 text-center">Snap a photo and let AI detect ingredients for you!</p>
      </div>

      {/* Dish Name Input */}
      <div className="w-full">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Dish Name (Optional)
        </label>
        <Input
          type="text"
          placeholder="e.g., Chocolate Chip Cookies, Pasta Carbonara..."
          value={dishName}
          onChange={(e) => setDishName(e.target.value)}
          className="w-full bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-orange-500 focus:ring-orange-500/20"
        />
        <p className="text-xs text-gray-500 mt-1">
          Leave empty to let AI suggest a name based on ingredients
        </p>
      </div>

      {/* File Upload Area */}
      <label className="w-full flex flex-col items-center px-6 py-8 bg-gray-800/50 text-gray-300 rounded-2xl border-2 border-dashed border-gray-600 cursor-pointer hover:border-orange-500 hover:bg-gray-800/70 transition-all duration-300 group">
        <div className="w-12 h-12 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <FiUpload className="text-orange-400 text-xl" />
        </div>
        <span className="text-base font-medium mb-2">
          {image ? image.name : 'Select an image to upload'}
        </span>
        <span className="text-sm text-gray-500">
          {image ? 'Click to change' : 'PNG, JPG, JPEG up to 10MB'}
        </span>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleImageChange(e.target.files?.[0] || null)}
        />
      </label>

      {/* Upload Button */}
      <Button
        onClick={handleUpload}
        disabled={!image || uploading}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white border-0 py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        size="lg"
      >
        {uploading ? (
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Uploading...
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <FiUpload className="text-lg" />
            Upload Image
          </div>
        )}
      </Button>

      {/* Status Messages */}
      {success && (
        <div className="flex items-center gap-2 text-green-400 text-sm">
          <FiCheckCircle className="text-lg" />
          Upload successful! AI is processing your ingredients...
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm">
          <FiAlertCircle className="text-lg" />
          {error}
        </div>
      )}
    </div>
  );
}