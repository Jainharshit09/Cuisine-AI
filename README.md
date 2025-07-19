# Culinary Assistant

A Next.js-based culinary assistant that helps you generate recipes, plan meals, and manage your shopping list with AI-powered features.

## Features

- **AI Recipe Generation**: Generate recipes from ingredients using Gemini AI
- **Nutrition Analysis**: Automatic nutritional analysis of generated recipes
- **Meal Planning**: Plan your meals with a calendar interface
- **Shopping List Management**: 
  - Automatically add ingredients from AI-generated recipes to your shopping list
  - Manually add items to your shopping list
  - View and manage your shopping lists
- **Ingredient Detection**: Upload images to detect ingredients using AI
- **User Authentication**: Secure authentication with Clerk

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Variables

Make sure to set up the following environment variables:

- `GEMINI_API_KEY`: Your Google Gemini API key for AI features
- `DATABASE_URL`: Your PostgreSQL database connection string
- Clerk authentication variables (see Clerk documentation)

## Database Setup

1. Run the database migrations:
```bash
npx prisma migrate dev
```

2. Generate the Prisma client:
```bash
npx prisma generate
```

## Key Features

### Automatic Shopping List Integration
When you generate a recipe using AI, the ingredients are automatically added to your shopping list. This ensures you never miss an ingredient when shopping for your AI-generated recipes.

### Recipe Generation Flow
1. Upload ingredients or enter them manually
2. AI generates a recipe with instructions
3. Nutrition analysis is performed automatically
4. Recipe is saved to your collection
5. **Ingredients are automatically added to your shopping list**

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
