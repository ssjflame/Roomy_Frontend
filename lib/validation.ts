import { z } from 'zod';

// Common validation schemas
export const UUIDSchema = z.string().uuid('Invalid UUID format');
export const EmailSchema = z.string().email('Invalid email format');
export const PasswordSchema = z.string().min(8, 'Password must be at least 8 characters');

// User validation schemas
export const CreateUserSchema = z.object({
  email: EmailSchema,
  username: z.string().min(3).max(50),
  password: PasswordSchema,
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  phoneNumber: z.string().regex(/^\+?[\d\s-()]+$/).optional(),
});

export const UpdateUserProfileSchema = z.object({
  username: z.string().min(3).max(50).optional(),
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  phoneNumber: z.string().regex(/^\+?[\d\s-()]+$/).optional(),
  avatarUrl: z.string().url().optional(),
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: PasswordSchema,
  confirmPassword: z.string().min(1),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Group validation schemas
export const CreateGroupSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  votingThreshold: z.number().int().min(1).max(100).default(50),
});

export const UpdateGroupSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional(),
  votingThreshold: z.number().int().min(1).max(100).optional(),
});

export const InviteMemberSchema = z.object({
  email: EmailSchema,
  role: z.enum(['ADMIN', 'MEMBER']).default('MEMBER'),
});

export const UpdateMemberRoleSchema = z.object({
  role: z.enum(['ADMIN', 'MEMBER']),
});

// Bill validation schemas
export const BillItemSchema = z.object({
  description: z.string().min(1).max(255),
  amount: z.number().positive(),
  quantity: z.number().int().positive().default(1),
});

export const CreateBillSchema = z.object({
  groupId: UUIDSchema,
  title: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  totalAmount: z.number().positive(),
  currency: z.string().default('USDC'),
  dueDate: z.string().datetime().optional(),
  payeeAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
  categoryId: UUIDSchema.optional(),
  items: z.array(BillItemSchema).optional(),
});

export const UpdateBillSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional(),
  totalAmount: z.number().positive().optional(),
  currency: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  payeeAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address').optional(),
  categoryId: UUIDSchema.optional(),
  status: z.enum(['DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'PAID']).optional(),
  items: z.array(BillItemSchema).optional(),
});

// Proposal validation schemas
export const CreateProposalSchema = z.object({
  billId: UUIDSchema,
  title: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  votingDeadline: z.string().datetime(),
});

export const UpdateProposalSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional(),
  votingDeadline: z.string().datetime().optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'PASSED', 'REJECTED', 'EXECUTED']).optional(),
});

export const VoteOnProposalSchema = z.object({
  voteType: z.enum(['FOR', 'AGAINST', 'ABSTAIN']),
  comment: z.string().max(500).optional(),
});

// Transaction validation schemas
export const CreateTransactionSchema = z.object({
  billId: UUIDSchema.optional(),
  groupId: UUIDSchema,
  receiverId: UUIDSchema.optional(),
  amount: z.number().positive(),
  currency: z.string().default('USDC'),
  type: z.enum(['PAYMENT', 'REFUND', 'TRANSFER', 'DEPOSIT', 'WITHDRAWAL']),
  description: z.string().max(500).optional(),
});

// Budget Category validation schemas
export const CreateBudgetCategorySchema = z.object({
  groupId: UUIDSchema,
  name: z.string().min(1).max(100),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color').default('#6B7280'),
  icon: z.string().min(1).max(50).default('folder'),
  monthlyLimit: z.number().positive().optional(),
});

export const UpdateBudgetCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color').optional(),
  icon: z.string().min(1).max(50).optional(),
  monthlyLimit: z.number().positive().optional(),
  isActive: z.boolean().optional(),
});

// Recurring Schedule validation schemas
export const CreateRecurringScheduleSchema = z.object({
  groupId: UUIDSchema,
  categoryId: UUIDSchema.optional(),
  title: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  amount: z.number().positive(),
  currency: z.string().default('USDC'),
  payeeAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
  frequency: z.enum(['WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY']),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  autoPropose: z.boolean().default(true),
});

export const UpdateRecurringScheduleSchema = z.object({
  categoryId: UUIDSchema.optional(),
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional(),
  amount: z.number().positive().optional(),
  currency: z.string().optional(),
  payeeAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address').optional(),
  frequency: z.enum(['WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  isActive: z.boolean().optional(),
  autoPropose: z.boolean().optional(),
});

// Authentication validation schemas
export const LoginSchema = z.object({
  email: EmailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const RegisterSchema = z.object({
  email: EmailSchema,
  username: z.string().min(3).max(50),
  password: PasswordSchema,
  confirmPassword: z.string().min(1),
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const ForgotPasswordSchema = z.object({
  email: EmailSchema,
});

export const ResetPasswordSchema = z.object({
  token: z.string().min(1),
  password: PasswordSchema,
  confirmPassword: z.string().min(1),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Notification validation schemas
export const CreateNotificationSchema = z.object({
  userId: UUIDSchema,
  type: z.string().min(1).max(50),
  title: z.string().min(1).max(255),
  message: z.string().min(1),
  data: z.record(z.string(), z.any()).optional(),
});

export const UpdateNotificationSchema = z.object({
  isRead: z.boolean(),
});

// Pagination schema
export const PaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

// Query parameter schemas
export const GetBillsQuerySchema = z.object({
  groupId: UUIDSchema.optional(),
  status: z.enum(['DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'PAID']).optional(),
  categoryId: UUIDSchema.optional(),
  ...PaginationSchema.shape,
});

export const GetTransactionsQuerySchema = z.object({
  groupId: UUIDSchema.optional(),
  billId: UUIDSchema.optional(),
  type: z.enum(['PAYMENT', 'REFUND', 'TRANSFER', 'DEPOSIT', 'WITHDRAWAL']).optional(),
  status: z.enum(['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED']).optional(),
  ...PaginationSchema.shape,
});

export const GetProposalsQuerySchema = z.object({
  groupId: UUIDSchema.optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'PASSED', 'REJECTED', 'EXECUTED']).optional(),
  ...PaginationSchema.shape,
});

// Wallet validation schemas
export const ProvisionWalletSchema = z.object({
  chainId: z.number().int().positive().default(1), // Ethereum mainnet
});

export const WalletTransactionSchema = z.object({
  to: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
  amount: z.number().positive(),
  currency: z.string().default('USDC'),
});

// Health check schemas
export const HealthCheckResponseSchema = z.object({
  status: z.enum(['healthy', 'unhealthy']),
  timestamp: z.string().datetime(),
  version: z.string().optional(),
  uptime: z.number().optional(),
  checks: z.record(z.string(), z.object({
    status: z.enum(['healthy', 'unhealthy']),
    message: z.string().optional(),
    responseTime: z.number().optional(),
  })).optional(),
});

// Export all schemas as a collection for easy access
export const ValidationSchemas = {
  // User schemas
  CreateUser: CreateUserSchema,
  UpdateUserProfile: UpdateUserProfileSchema,
  ChangePassword: ChangePasswordSchema,
  
  // Group schemas
  CreateGroup: CreateGroupSchema,
  UpdateGroup: UpdateGroupSchema,
  InviteMember: InviteMemberSchema,
  UpdateMemberRole: UpdateMemberRoleSchema,
  
  // Bill schemas
  CreateBill: CreateBillSchema,
  UpdateBill: UpdateBillSchema,
  BillItem: BillItemSchema,
  
  // Proposal schemas
  CreateProposal: CreateProposalSchema,
  UpdateProposal: UpdateProposalSchema,
  VoteOnProposal: VoteOnProposalSchema,
  
  // Transaction schemas
  CreateTransaction: CreateTransactionSchema,
  
  // Budget Category schemas
  CreateBudgetCategory: CreateBudgetCategorySchema,
  UpdateBudgetCategory: UpdateBudgetCategorySchema,
  
  // Recurring Schedule schemas
  CreateRecurringSchedule: CreateRecurringScheduleSchema,
  UpdateRecurringSchedule: UpdateRecurringScheduleSchema,
  
  // Authentication schemas
  Login: LoginSchema,
  Register: RegisterSchema,
  ForgotPassword: ForgotPasswordSchema,
  ResetPassword: ResetPasswordSchema,
  
  // Notification schemas
  CreateNotification: CreateNotificationSchema,
  UpdateNotification: UpdateNotificationSchema,
  
  // Query schemas
  GetBillsQuery: GetBillsQuerySchema,
  GetTransactionsQuery: GetTransactionsQuerySchema,
  GetProposalsQuery: GetProposalsQuerySchema,
  
  // Wallet schemas
  ProvisionWallet: ProvisionWalletSchema,
  WalletTransaction: WalletTransactionSchema,
  
  // Common schemas
  UUID: UUIDSchema,
  Email: EmailSchema,
  Password: PasswordSchema,
  Pagination: PaginationSchema,
};