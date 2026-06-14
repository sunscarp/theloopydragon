export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  targetSelector?: string;
  placement?: "top" | "bottom" | "left" | "right" | "center";
  actionRequired?: string;
  actionType?: "navigate" | "click" | "custom";
  actionRoute?: string;
  mockup?: "add" | "edit" | "delete" | "stats" | "withdraw";
}

export interface PageTutorial {
  page: string;
  title: string;
  steps: TutorialStep[];
}

export const DEMO_PRODUCT = {
  Product: "Handcrafted Macrame Keychain",
  Price: 299,
  Quantity: 50,
  Weight: 25,
  Material: "Cotton cord, wooden beads",
  Length: 12,
  Width: 2,
  Height: 1,
  Tag: "Keychains, Macrame, Handmade",
  Description:
    "A beautiful handcrafted macrame keychain made with premium cotton cord and natural wooden beads. Perfect for keys, bags, or as a decorative accessory. Each piece is carefully crafted with love.",
};

export const DEMO_ORDER_ID = "TUTORIAL-DEMO-ORDER";

export const DEMO_TUTORIAL_ORDER = {
  id: 999999,
  order_id: DEMO_ORDER_ID,
  Product: "Handcrafted Macrame Keychain",
  Quantity: 2,
  "Total Price": "598.00",
  "Shipping Cost": "50.00",
  Name: "Tutorial Customer",
  Address: "42 Learning Lane, Educational District",
  Pincode: "400001",
  Contact: "+91 9876543210",
  Email: "learner@example.com",
  uid: "TUTORIAL-UID-001",
  "Order Date": new Date(Date.now() - 86400000).toISOString(),
  payment_id: "TUTORIAL-PAY-001",
  commission_earned: "29.90",
  seller_payout: "556.14",
  seller_id: 0,
  Status: "pending",
};

export const DEMO_TUTORIAL_ORDER_PROFILE = {
  order_id: DEMO_ORDER_ID,
  Status: "pending",
  Tracking_ID: "",
  seller_action: null,
  payment_approval_status: null,
};

export const DEMO_TRANSACTION = {
  id: 999999,
  order_id: DEMO_ORDER_ID,
  Product: "Handcrafted Macrame Keychain",
  Quantity: 2,
  "Total Price": "598.00",
  "Shipping Cost": "50.00",
  "Order Date": new Date(Date.now() - 86400000).toISOString(),
  commission_earned: "29.90",
  seller_payout: "556.14",
  payout_status: null,
  Name: "Tutorial Customer",
  seller_action: "accepted",
};

export const ONBOARDING_STEPS: TutorialStep[] = [
  // ===== DASHBOARD =====
  {
    id: "dash-welcome",
    title: "Welcome to Your Seller Dashboard!",
    description:
      "Welcome to The Loopy Dragon! This guided tutorial will help you get started.",
    placement: "center",
  },
  {
    id: "dash-recent-orders",
    title: "Recent Orders",
    description:
      "View recent orders at a glance with order ID, customer, amount, status, and date.",
    targetSelector: '[data-tut="dash-recent-orders"]',
    placement: "bottom",
  },
  {
    id: "dash-stats-products",
    title: "Pending Payout",
    description:
      "• Money you can withdraw\n• Clears in 2 business days\n• Request for Withdrawal on Transactions page",
    targetSelector: '[data-tut="dash-stat-payout"]',
    placement: "left",
  },
  {
    id: "dash-nav-products",
    title: "Navigate to Products",
    description:
      "• Click 'Products' in sidebar\n• Continue the tutorial there",
    targetSelector: '[data-tut="sidebar-products"]',
    placement: "right",
    actionRequired: "Click Products in the sidebar navigation",
    actionType: "navigate",
    actionRoute: "/dashboard/products",
  },

  // ===== PRODUCTS PAGE =====
  {
    id: "products-add-btn",
    title: "Add Your First Product",
    description:
      "• Browse your catalog\n• Search products\n• Click 'Add Product' to create a listing",
    targetSelector: '[data-tut="products-add-btn"]',
    placement: "bottom",
  },
  {
    id: "products-summary",
    title: "Summary Cards",
    description:
      "• Total Products\n• Active Listings\n• Low Stock items",
    targetSelector: '[data-tut="products-summary-cards"]',
    placement: "left",
  },

  // ===== ORDERS PAGE =====
  {
    id: "orders-nav",
    title: "Navigate to Orders",
    description:
      "Click 'Orders' in the sidebar to manage customer orders.",
    targetSelector: '[data-tut="sidebar-orders"]',
    placement: "right",
    actionRequired: "Click Orders in the sidebar navigation",
    actionType: "navigate",
    actionRoute: "/dashboard/orders",
  },
  {
    id: "orders-overview",
    title: "Orders Overview",
    description:
      "• Orders grouped by ID — each group is one purchase\n• Multiple items per order allowed\n• A demo order is ready to try",
    placement: "center",
  },
  {
    id: "orders-demo-order",
    title: "Demo Order",
    description:
      "• Orange 'Approval Needed' badge = awaiting your decision",
    targetSelector: '[data-tut="orders-demo-card"]',
    placement: "bottom",
  },
  {
    id: "orders-accept",
    title: "Accept the Order",
    description:
      "Accept to fulfill the order. Reject to cancel (5% penalty applies). Click Accept to approve this demo order.",
    targetSelector: '[data-tut="orders-accept-btn"]',
    placement: "left",
    actionRequired: "Click Accept to approve the tutorial order",
    actionType: "custom",
  },
  {
    id: "orders-after-accept",
    title: "Order Management",
    description:
      "After accepting: add tracking info, update status, view breakdowns, and track shipments. Details button gives full order info.",
    targetSelector: '[data-tut="orders-actions"]',
    placement: "left",
  },

  // ===== TRANSACTIONS PAGE =====
  {
    id: "transactions-nav",
    title: "Navigate to Transactions",
    description:
      "Click 'Transactions' in the sidebar to explore payments.",
    targetSelector: '[data-tut="sidebar-transactions"]',
    placement: "right",
    actionRequired: "Click Transactions in the sidebar navigation",
    actionType: "navigate",
    actionRoute: "/dashboard/transactions",
  },
  {
    id: "transactions-overview",
    title: "Transactions & Payouts",
    description:
      "Manage earnings: view balance breakdown, request withdrawals, and review transaction history.",
    placement: "center",
  },
  {
    id: "transactions-demo-row",
    title: "Tutorial Transaction",
    description:
      "'In Clearing' status — funds are temporarily held. After 2 business days it moves to Available.",
    targetSelector: '[data-tut="transactions-demo-row"]',
    placement: "right",
  },
  {
    id: "transactions-clearing",
    title: "What is 'In Clearing'?",
    description:
      "• 2 business day clearing period after acceptance\n• Protects against disputes and chargebacks\n• Amber badge = In Clearing, then moves to Cleared",
    targetSelector: '[data-tut="transactions-clearing-card"]',
    placement: "left",
  },
  {
    id: "transactions-cleared",
    title: "Funds Available",
    description:
      "• Demo transaction moved to 'Cleared' status\n• Amount reflected in 'Available for Withdrawal'\n• Cards show: Total Balance, Available (green), In Clearing (amber)",
    targetSelector: '[data-tut="transactions-available-card"]',
    placement: "bottom",
  },
  {
    id: "transactions-withdraw",
    title: "Request a Withdrawal",
    description:
      "Click 'Withdraw' on the Available for Withdrawal card to open the confirmation popup.",
    targetSelector: '[data-tut="transactions-available-card"]',
    placement: "bottom",
    actionRequired: "Click Withdraw on the card to open the confirmation popup",
    actionType: "custom",
  },
  {
    id: "transactions-withdraw-confirm",
    title: "Confirm Withdrawal",
    description:
      "Click 'Confirm' in the popup to submit your withdrawal request.",
    targetSelector: '[data-tut="transactions-confirm-card"]',
    placement: "right",
    actionRequired: "Click Confirm to submit your withdrawal",
    actionType: "custom",
  },
  // ===== SUPPORT PAGE =====
  {
    id: "support-nav",
    title: "Navigate to Support",
    description:
      "Click 'Support' in the sidebar to get help.",
    targetSelector: '[data-tut="sidebar-support"]',
    placement: "right",
    actionRequired: "Click Support in the sidebar navigation",
    actionType: "navigate",
    actionRoute: "/dashboard/support",
  },
  {
    id: "support-overview",
    title: "Support Options",
    description:
      "Contact form, email, WhatsApp, and Instagram support. Response within 1-2 business days.",
    placement: "center",
  },

  // ===== COMPLETION =====
  {
    id: "tutorial-complete",
    title: "Onboarding Complete!",
    description:
      "You're all set! Manage products, process orders, request payouts, and grow your store. Happy selling on The Loopy Dragon!",
    placement: "center",
  },
];

export const PAGE_TUTORIALS: Record<string, PageTutorial> = {
  dashboard: {
    page: "dashboard",
    title: "Dashboard Guide",
    steps: ONBOARDING_STEPS.slice(0, 3).map((s) => ({ ...s })),
  },
  products: {
    page: "products",
    title: "Products Guide",
    steps: [
      ONBOARDING_STEPS.find((s) => s.id === "products-add-btn")!,
      { ...ONBOARDING_STEPS.find((s) => s.id === "products-summary")!, id: "page-products-summary" },
    ],
  },
  orders: {
    page: "orders",
    title: "Orders Guide",
    steps: [
      { ...ONBOARDING_STEPS.find((s) => s.id === "orders-overview")!, id: "page-orders-overview" },
      { ...ONBOARDING_STEPS.find((s) => s.id === "orders-after-accept")!, id: "page-orders-management" },
    ],
  },
  transactions: {
    page: "transactions",
    title: "Transactions Guide",
    steps: [
      { ...ONBOARDING_STEPS.find((s) => s.id === "transactions-overview")!, id: "page-tx-overview" },
      { ...ONBOARDING_STEPS.find((s) => s.id === "transactions-clearing")!, id: "page-tx-clearing" },
    ],
  },
  support: {
    page: "support",
    title: "Support Guide",
    steps: [
      { ...ONBOARDING_STEPS.find((s) => s.id === "support-overview")!, id: "page-sup-overview" },
    ],
  },
};

export const ONBOARDING_STORAGE_KEY = "seller-loopy-tutorial-progress";
