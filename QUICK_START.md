# 🚀 Quick Start Guide - Roomy DAO

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```

### 3. Access the Application
Open your browser and navigate to: **http://localhost:3000**

## 🔐 Login Credentials

Use any of these mock accounts:

### **Primary Account (John Doe)**
```
Email: john.doe@example.com
Password: (any password - e.g., "password123")
```

### **Alternative Accounts**
```
Email: jane.smith@example.com
Password: (any password)

Email: demo@roomdao.app
Password: (any password)
```

## ✨ What You'll See

After logging in, you'll have access to:

1. **Dashboard** - Overview with stats, proposals, and voting
2. **Groups** - View and manage expense groups (Apartment 4B, Beach House Crew)
3. **Bills** - 5 mock bills in various states (Draft, Proposed, Approved, Paid)
4. **Transactions** - 3 sample blockchain transactions
5. **Budget** - 5 categories with spending tracking
6. **Recurring Bills** - 2 automated recurring payments
7. **Profile** - User profile with wallet ($1,250.75 USDC)
8. **Notifications** - 5 notifications (2 unread)

## 📊 Mock Data Overview

- **Users**: 4 (John, Jane, Mike, Sarah)
- **Groups**: 2 (Apartment 4B, Beach House Crew)
- **Bills**: 5 with various statuses
- **Proposals**: 4 with voting data
- **Transactions**: 3 (1 completed, 1 pending)
- **Budget Categories**: 5 (Utilities, Internet, Cleaning, Groceries, Other)
- **Recurring Bills**: 2 (Internet - Monthly, Cleaning - Biweekly)
- **Notifications**: 5 notifications

## 🎯 Features to Try

### Dashboard
- View group balance ($2,450.50)
- See active proposals
- Check voting statistics
- View group members with roles

### Bills Management
- Filter bills by status (Draft, Proposed, Approved, Paid)
- View bill details with categories
- See due dates and amounts

### Budget Tracking
- View spending vs. limits
- See budget utilization percentages
- Check category-wise expenses
- Identify over-budget categories

### Transactions
- View transaction history
- Filter by type (Bill Payment, Deposit, Withdrawal)
- See blockchain tx hashes
- Link to Polygon Amoy explorer

### Profile & Wallet
- View wallet balance ($1,250.75 USDC)
- Copy wallet address
- See Openfort Player ID
- Manage personal information

## 🔧 Technical Details

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui + Radix UI
- **State Management**: Zustand
- **Blockchain**: Polygon Amoy Testnet (Chain ID: 80002)
- **Wallet Integration**: Openfort SDK (mock mode)

## 📱 Responsive Design

The application is fully responsive:
- **Desktop**: Full sidebar navigation
- **Tablet**: Optimized layouts
- **Mobile**: Touch-friendly interface

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill the process on port 3000
npx kill-port 3000
# Then run dev server again
npm run dev
```

### Module Not Found Errors
```bash
# Clear Next.js cache
rm -rf .next
# Reinstall dependencies
npm install
# Run dev server
npm run dev
```

### TypeScript Errors
```bash
# Check for errors
npm run build
```

## 🎨 Customization

### Change Mock Data
Edit `lib/mock-data.ts` to modify:
- User information
- Group details
- Bills and proposals
- Transactions
- Budget categories
- Notifications

### Add New Features
- Components are in `components/`
- Pages are in `app/dashboard/`
- Store is in `lib/store.ts`
- Mock data is in `lib/mock-data.ts`

## 📚 Documentation

- **FEATURES.md** - Complete features documentation
- **SETUP.md** - Detailed setup guide
- **README.md** - Project overview

## 🔗 Next Steps

1. **Connect Backend** - Replace mock data with API calls to [Roomy Backend](https://github.com/NickFotsing/Roomy)
2. **Openfort Integration** - Configure real Openfort SDK
3. **Authentication** - Implement JWT tokens
4. **Real-time Updates** - Add WebSocket connections
5. **File Uploads** - Add bill attachments

## 💡 Tips

- Use the **sidebar navigation** (desktop) to explore all pages
- Check **notifications** (bell icon with badge) for updates
- Try **filtering** bills and transactions by status/type
- View **budget insights** to see spending patterns
- Click on **group members** to see roles (Admin/Member)

## 🎉 You're Ready!

Start exploring the full-featured Roomy DAO expense management application!

Need help? Check the other documentation files or the inline code comments.

