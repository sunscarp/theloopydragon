# The Loopy Dragon Ecommerce

This is a simple ecommerce website built with [Next.js](https://nextjs.org) and [Tailwind CSS](https://tailwindcss.com).

## Features

- Product grid with add-to-cart functionality
- Cart summary with total price
- Responsive and dark mode support
- **Mobile-first design:** Looks great and is fully usable on all phones and tablets

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

You can start editing the page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## Deploy on Vercel

1. Create a Vercel account at [vercel.com](https://vercel.com) if you haven't already
2. Install Vercel CLI:
```bash
npm i -g vercel
```
3. Push your code to GitHub
4. Link your GitHub repository with Vercel:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Select the repository and click "Import"
5. Configure environment variables:
   - Add the following environment variables in Vercel project settings:
     ```
     RAZORPAY_KEY_ID=your_key_here
     RAZORPAY_SECRET=your_secret_here
     NEXT_PUBLIC_RAZORPAY_KEY_ID=your_key_here
     ```
6. Deploy:
   - Vercel will automatically deploy your app
   - Every push to main branch will trigger a new deployment

Your app will be live at: `https://your-project-name.vercel.app`
