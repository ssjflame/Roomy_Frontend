# 🏠 Roomy

**A modern, blockchain-powered expense sharing and group management platform**

Roomy is a comprehensive web application that simplifies shared living expenses through smart contracts and democratic voting. Perfect for roommates, shared apartments, and group living situations, Roomy enables transparent expense tracking, automated bill splitting, and secure blockchain-based payments.

![Roomy Dashboard](https://via.placeholder.com/800x400/4F46E5/FFFFFF?text=Roomy+Dashboard)

## ✨ Features

### 🏘️ **Group Management**
- Create and manage living groups with smart contract integration
- Role-based permissions (admin, member)
- Invite system for adding new members
- Real-time group balance tracking

### 💰 **Smart Expense Tracking**
- Create and categorize bills with detailed line items
- Automatic expense splitting among group members
- Support for recurring bills (rent, utilities, subscriptions)
- Attachment support for receipts and documents

### 🗳️ **Democratic Voting System**
- Proposal-based expense approval workflow
- Transparent voting with FOR/AGAINST/ABSTAIN options
- Configurable voting thresholds
- Automatic execution of approved proposals

### 💳 **Blockchain Integration**
- Secure payments via Polygon blockchain
- Smart account wallets through Openfort
- Transaction history and verification
- Real-time balance updates

### 📊 **Budget Management**
- Category-based expense tracking
- Monthly budget limits and progress monitoring
- Visual spending analytics
- Expense trend analysis

### 🔔 **Real-time Notifications**
- Instant updates on new bills and proposals
- Voting reminders and deadlines
- Payment confirmations
- Group activity notifications

## 🛠️ Tech Stack

### **Frontend**
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI + shadcn/ui
- **State Management:** Zustand
- **HTTP Client:** Axios
- **Animations:** GSAP

### **Blockchain & Payments**
- **Blockchain:** Polygon Amoy Testnet
- **Wallet Integration:** Openfort SDK
- **Smart Contracts:** Account Abstraction

### **Development Tools**
- **Package Manager:** npm
- **Linting:** ESLint
- **Type Checking:** TypeScript
- **Build Tool:** Next.js built-in

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 18.0 or higher)
- **npm** (version 8.0 or higher)
- **Git** for version control

### **Required Accounts & API Keys**
- **Openfort Account** - For blockchain wallet integration
- **Backend API** - Roomy backend service (see API Documentation)

## 🚀 Installation

### 1. **Clone the Repository**
```bash
git clone https://github.com/your-username/roomy-frontend.git
cd roomy-frontend
```

### 2. **Install Dependencies**
```bash
npm install
```

### 3. **Environment Setup**
Create a `.env.local` file in the root directory:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# Openfort Configuration
NEXT_PUBLIC_OPENFORT_PUBLISHABLE_KEY=your_openfort_publishable_key
```

### 4. **Start Development Server**
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 🎯 Usage

### **Getting Started**

1. **Register/Login**
   - Visit the homepage and click "Get Started"
   - Create an account or login with existing credentials
   - Connect your wallet through Openfort integration

2. **Create a Group**
   - Navigate to Dashboard → Groups
   - Click "Create Group" and provide group details
   - Invite members via email or username

3. **Add Expenses**
   - Go to Dashboard → Bills
   - Create new bills with itemized expenses
   - Set due dates and assign categories

4. **Vote on Proposals**
   - Review pending proposals in the dashboard
   - Cast your vote (FOR/AGAINST/ABSTAIN)
   - Add comments to explain your decision

5. **Track Finances**
   - Monitor group balance and individual contributions
   - View transaction history on the blockchain
   - Set and track budget categories

### **Available Scripts**

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Type Checking
npx tsc --noEmit     # Check TypeScript types
```

## 📁 Project Structure

```
roomy-frontend/
├── app/                    # Next.js App Router pages
│   ├── api/               # API route handlers
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Main application pages
│   └── globals.css        # Global styles
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components (shadcn/ui)
│   ├── auth-dialog.tsx   # Authentication modal
│   ├── create-*.tsx      # Creation dialogs
│   └── dashboard-nav.tsx # Navigation component
├── lib/                   # Utility libraries
│   ├── api.ts            # API client and endpoints
│   ├── store.ts          # Zustand state management
│   ├── types.ts          # TypeScript type definitions
│   ├── utils.ts          # Helper functions
│   └── validation.ts     # Form validation schemas
├── public/               # Static assets
├── styles/               # Additional stylesheets
└── docs/                 # Documentation files
```

### **Key Files**

- **`lib/api.ts`** - Centralized API client with Axios
- **`lib/store.ts`** - Global state management with Zustand
- **`lib/types.ts`** - TypeScript interfaces and types
- **`components/ui/`** - Reusable UI components
- **`app/dashboard/`** - Main application pages

## 📚 API Documentation

The frontend communicates with a REST API backend using a standardized response envelope:

```json
{
  "success": true,
  "message": "optional message",
  "data": { ... },
  "error": "optional error",
  "errors": { "field": ["validation messages"] }
}
```

### **Key Endpoints**

- **Authentication:** `/auth/*` - Login, register, session management
- **Groups:** `/groups/*` - Group CRUD operations
- **Bills:** `/bills/*` - Expense management
- **Proposals:** `/proposals/*` - Voting system
- **Transactions:** `/transactions/*` - Blockchain transactions
- **Notifications:** `/notifications/*` - Real-time updates

For detailed API documentation, see [`docs/API_ENDPOINTS.md`](docs/API_ENDPOINTS.md)

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### **Development Workflow**

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
   - Follow existing code style and conventions
   - Add TypeScript types for new features
   - Update tests if applicable
4. **Commit your changes**
   ```bash
   git commit -m "Add amazing feature"
   ```
5. **Push to your branch**
   ```bash
   git push origin feature/amazing-feature
   ```
6. **Open a Pull Request**

### **Code Style Guidelines**

- Use TypeScript for all new code
- Follow existing naming conventions
- Add JSDoc comments for complex functions
- Use Tailwind CSS for styling
- Ensure components are accessible (ARIA labels, keyboard navigation)

### **Testing**

- Test new features thoroughly in development
- Verify blockchain integration works correctly
- Check responsive design on multiple screen sizes
- Validate form inputs and error handling

## 🔧 Environment Variables

### **Frontend Configuration**

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | ✅ |
| `NEXT_PUBLIC_OPENFORT_PUBLISHABLE_KEY` | Openfort public key | ✅ |

### **Backend Requirements**

The backend should provide these environment variables:
- `OPENFORT_API_SECRET_KEY` - Server-side Openfort integration
- `JWT_SECRET` / `JWT_REFRESH_SECRET` - Authentication tokens
- `AMOY_RPC_URL` - Polygon Amoy RPC endpoint

## 🐛 Troubleshooting

### **Common Issues**

**Build Errors:**
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

**API Connection Issues:**
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check backend server is running
- Confirm CORS settings allow frontend domain

**Wallet Connection Problems:**
- Ensure Openfort keys are valid
- Check browser console for errors
- Verify network connection to Polygon Amoy

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Radix UI](https://www.radix-ui.com/) - Accessible UI components
- [Openfort](https://www.openfort.xyz/) - Blockchain wallet infrastructure
- [Zustand](https://github.com/pmndrs/zustand) - State management

---

**Made with ❤️ for better shared living experiences**

For questions or support, please [open an issue](https://github.com/your-username/roomy-frontend/issues) or contact the development team.
