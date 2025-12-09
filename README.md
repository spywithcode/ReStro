# QRmenu - Restaurant Management System

A modern, AI-powered restaurant management system built with Next.js, TypeScript, and Firebase. This application enables restaurants to digitize their menus, manage orders, and provide seamless customer experiences through QR code-based menu access.

## 🚀 Features

### Admin Panel
- **Secure Admin Login**: Restaurant staff authentication with restaurant-specific access
- **Multi-Restaurant Support**: Manage multiple restaurants from a single interface
- **Menu Management**: Add, edit, and delete menu items with categories, pricing, and availability
- **Order Management**: Real-time order tracking with status updates (Placed → Preparing → Ready → Completed)
- **Table Management**: Monitor table status and capacity with QR code generation
- **Reports & Analytics**: Revenue tracking and order statistics with visual charts

### Customer Experience
- **QR Code Access**: Customers scan table-specific QR codes to access digital menus
- **Online Ordering**: Place orders directly from mobile devices
- **Real-time Updates**: Live order status tracking
- **Responsive Design**: Optimized for mobile and desktop viewing

### AI Integration
- **Smart Menu Suggestions**: AI-powered recommendations based on menu analysis
- **Context-Aware Recommendations**: Personalized suggestions using Google Gemini AI

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI Components
- **AI**: Google Gemini AI via Genkit
- **Backend**: Firebase (Hosting & Storage)
- **State Management**: React Context with localStorage persistence
- **Icons**: Lucide React
- **Charts**: Recharts
- **Forms**: React Hook Form with Zod validation

## 📁 Project Structure

```
├── src/
│   ├── ai/                   # AI integration and flows
│   │   ├── dev.ts            # Development AI setup
│   │   ├── genkit.ts         # Genkit AI configuration
│   │   └── flows/            # AI workflow definitions
│   ├── app/                  # Next.js app router
│   │   ├── admin/            # Admin panel pages
│   │   │   ├── dashboard/    # Admin dashboard
│   │   │   ├── menu/         # Menu management
│   │   │   ├── orders/       # Order management
│   │   │   ├── tables/       # Table management
│   │   │   ├── reports/      # Analytics & reports
│   │   │   └── layout.tsx    # Admin layout with sidebar
│   │   ├── menu/             # Customer-facing menu pages
│   │   ├── order/            # Order placement pages
│   │   ├── page.tsx          # Admin login page
│   │   └── layout.tsx        # Root layout
│   ├── components/           # Reusable UI components
│   │   ├── ui/               # Radix UI components
│   │   ├── admin/            # Admin-specific components
│   │   └── logo.tsx          # App logo component
│   ├── context/              # React context providers
│   │   └── app-context.tsx   # Main app state management
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utility functions and data
│   │   ├── data.ts           # Mock data and type definitions
│   │   └── utils.ts          # Helper functions
│   └── types/                # TypeScript type definitions
├── docs/                     # Documentation
│   └── blueprint.md          # Project blueprint and design guidelines
├── patches/                  # Custom patches for dependencies
└── public/                   # Static assets
```

## 🏗️ Architecture

### Data Model
- **Restaurant**: Multi-tenant restaurant entities
- **MenuItem**: Food/beverage items with categories and pricing
- **Order**: Customer orders with status tracking
- **Table**: Restaurant tables with QR code generation
- **Customer**: Customer information for orders

### State Management
- Global state managed through React Context
- Local storage persistence for offline functionality
- Real-time updates across browser tabs

### AI Features
- Menu analysis for intelligent suggestions
- Context-aware recommendations
- Powered by Google Gemini 2.0 Flash model

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd qrmenu
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Add your Firebase and AI API keys
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Admin panel: https://re-stro.vercel.app/
   - Use restaurant ID: `your-restaurant-id` or `paradise-biryani`

## 📜 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run genkit:dev` - Start AI development environment
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## 🎨 Design System

- **Primary Color**: Saturated Violet (#9400D3)
- **Background**: Very Light Grey (#F0F0F0)
- **Accent**: Purple (#BF00FF)
- **Typography**: Inter (sans-serif)
- **Code Font**: Source Code Pro

## 🔧 Configuration

- **Firebase Hosting**: Configured in `apphosting.yaml`
- **Tailwind CSS**: Custom configuration in `tailwind.config.ts`
- **TypeScript**: Strict configuration in `tsconfig.json`
- **ESLint**: Next.js recommended rules in `.eslintrc.json`

## 📱 Demo Data

The application includes sample data for two restaurants:
- **The Grand Italiano**: Italian cuisine with sample menu and orders
- **Paradise Biryani**: Indian cuisine with traditional dishes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

Built with ❤️ using Next.js and Firebase
