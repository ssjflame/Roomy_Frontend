# Roomy - Group Expense Management Application

A comprehensive Next.js application for managing group expenses with DAO-style governance and blockchain integration through Openfort.

## 🎯 Features Overview

### 1. **Dashboard** (`/dashboard`)
The main dashboard provides an overview of all group activities:
- Group balance and wallet information
- Group member management
- Active proposals list with voting capabilities
- Statistics overview
- Voting statistics and participation rates

### 2. **Groups Management** (`/dashboard/groups`)
Manage all your expense sharing groups:
- View all groups you're a member of
- See group details including:
  - Smart account addresses
  - Member count
  - Voting threshold
  - Creation date
  - Active/Inactive status
- Create new groups
- Switch between groups
- Group settings and management

**Features:**
- Grid layout for easy browsing
- Active group highlighting
- Visual indicators for admin roles
- Quick access to group settings

### 3. **Bills & Expenses** (`/dashboard/bills`)
Comprehensive bill management system:
- View all bills for the current group
- Filter bills by status:
  - Draft
  - Proposed
  - Approved
  - Rejected
  - Paid
  - Cancelled
- Bill details include:
  - Title and description
  - Amount and currency
  - Due date
  - Category
  - Payee address
  - Creator information
- Create new bills
- Edit draft bills
- Propose bills for voting
- Process payments for approved bills

**Statistics Dashboard:**
- Total bills count
- Bills by status breakdown
- Quick status overview

### 4. **Transactions History** (`/dashboard/transactions`)
Complete transaction tracking:
- View all blockchain transactions
- Filter by transaction type:
  - Bill Payments
  - Deposits
  - Withdrawals
  - Refunds
  - Transfers
- Transaction details include:
  - Transaction hash (with blockchain explorer link)
  - Amount and currency
  - Status (Pending, Processing, Completed, Failed, Cancelled)
  - Sender/Receiver information
  - Description
  - Timestamps
- Export transaction history
- View on Polygon Amoy explorer

**Transaction Statistics:**
- Total transaction count
- Total volume
- Breakdown by transaction type

### 5. **Budget & Categories** (`/dashboard/budget`)
Budget tracking and category management:
- Create and manage budget categories
- Set monthly spending limits
- Track spending against budgets
- Visual progress indicators
- Budget alerts for overspending
- Category details include:
  - Name and icon (emoji)
  - Color coding
  - Monthly limit
  - Current spending
  - Percentage utilized
  - Remaining budget

**Budget Insights:**
- Total budget overview
- Total spending
- Budget utilization percentage
- Top spending categories
- Over-budget alerts
- Near-limit warnings

**Default Categories:**
- ⚡ Utilities
- 📡 Internet & Cable
- 🧹 Cleaning & Maintenance
- 🛒 Groceries
- 📦 Other

### 6. **Recurring Bills** (`/dashboard/recurring`)
Automate regular payments:
- Set up recurring bills with customizable frequencies:
  - Daily
  - Weekly
  - Biweekly
  - Monthly
  - Quarterly
  - Yearly
- Auto-proposal feature for automatic bill creation
- Track next due dates
- View occurrences remaining
- Pause/Resume recurring bills
- Category assignment
- End date management

**Features:**
- Active and paused bills separation
- Next occurrence calculation
- Auto-propose toggle
- Category integration

### 7. **User Profile & Wallet** (`/dashboard/profile`)
Manage your account and blockchain wallet:

**Personal Information Tab:**
- Update first and last name
- Username management
- Email address
- Phone number
- Profile picture
- Account creation date
- Last login information

**Wallet Tab:**
- View wallet balance
- Wallet address (copyable)
- Openfort Player ID
- Chain information (Polygon Amoy)
- Wallet status
- Deposit/Withdraw actions
- View transaction history
- Links to blockchain explorer

**Security Tab:**
- Change password
- Email verification status
- Two-factor authentication
- Security settings

**Group Memberships:**
- View all group memberships
- Role indicators (Admin/Member/Viewer)
- Joined date

### 8. **Notifications** (`/dashboard/notifications`)
Stay updated with all group activities:
- Real-time notification center
- Filter notifications:
  - All
  - Unread
  - Read
- Notification types:
  - 📄 Bill Proposed
  - 🗳️ Vote Requested
  - ✅ Proposal Approved
  - ❌ Proposal Rejected
  - 💳 Payment Completed
  - ⚠️ Payment Failed
  - 👥 Member Joined
  - 👋 Member Left
  - 📊 Budget Alert

**Features:**
- Unread count badge
- Mark as read functionality
- Mark all as read
- Delete notifications
- Timestamp with formatted dates
- Visual indicators for notification types
- Notification preferences

## 🗄️ Database Schema

The application follows the Prisma schema with the following main entities:

### Core Entities:
- **User** - User accounts with authentication
- **Wallet** - Openfort-powered blockchain wallets
- **Group** - Expense sharing groups
- **GroupMember** - User memberships in groups
- **Bill** - Individual expense records
- **BillItem** - Line items for bills
- **Proposal** - Voting proposals for bills
- **Vote** - Individual votes on proposals
- **Transaction** - Blockchain transactions
- **BudgetCategory** - Expense categories with limits
- **RecurringBill** - Automated recurring expenses
- **Notification** - User notifications

### Key Relationships:
- Users have Wallets (1:1)
- Users belong to Groups through GroupMembers (M:N)
- Bills belong to Groups (M:1)
- Bills have Proposals (1:1)
- Proposals have Votes (1:M)
- Transactions link to Bills (M:1)
- Categories belong to Groups (M:1)

## 🎨 UI Components

Built with **shadcn/ui** components:
- Card
- Button
- Input
- Label
- Badge
- Avatar
- Dialog
- Tabs
- Progress
- Dropdown Menu
- Alert
- Switch

## 🔧 Technology Stack

- **Framework:** Next.js 16
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI + shadcn/ui
- **State Management:** Zustand
- **Date Handling:** date-fns
- **Icons:** Lucide React
- **Blockchain:** Openfort SDK
- **Network:** Polygon Amoy Testnet (Chain ID: 80002)

## 📱 Responsive Design

All pages are fully responsive with:
- Mobile-first approach
- Tablet optimizations
- Desktop layouts with sidebar navigation
- Touch-friendly interactions

## 🎯 Static Data

Currently, the application uses comprehensive mock data that matches the Prisma schema:
- 4 mock users (John, Jane, Mike, Sarah)
- 2 groups (Apartment 4B, Beach House Crew)
- 5 bills with various statuses
- 4 proposals with voting data
- 3 transactions (completed and pending)
- 5 budget categories
- 2 recurring bills
- 5 notifications

## 🚀 Next Steps

To connect to the actual backend:
1. Update API endpoints in the store
2. Replace mock data with API calls
3. Implement authentication flow
4. Connect Openfort SDK for wallet operations
5. Add real-time updates with WebSockets
6. Implement file upload for bill attachments

## 📝 Page Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page with authentication |
| `/dashboard` | Main dashboard overview |
| `/dashboard/groups` | Groups management |
| `/dashboard/bills` | Bills and expenses |
| `/dashboard/transactions` | Transaction history |
| `/dashboard/budget` | Budget categories |
| `/dashboard/recurring` | Recurring bills |
| `/dashboard/profile` | User profile and wallet |
| `/dashboard/notifications` | Notification center |

## 🎨 Design Features

- **Dark Mode Support** - Theme provider included
- **Color Coding** - Visual indicators for different states
- **Loading States** - Proper loading indicators
- **Empty States** - User-friendly empty state messages
- **Error Handling** - Graceful error displays
- **Confirmation Dialogs** - User confirmations for critical actions

## 🔐 Security Features

- Email verification system
- Two-factor authentication (placeholder)
- Password reset tokens
- Account lockout protection
- Secure wallet integration

## 📊 Key Metrics Tracked

- Group balance
- Total bills and proposals
- Voting participation
- Budget utilization
- Transaction volume
- Notification counts

