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
      "This guided tour will walk you through every feature of your seller dashboard. Follow along step by step to learn how to manage your store, process orders, and get paid.",
    placement: "center",
  },
  {
    id: "dash-recent-orders",
    title: "Recent Orders",
    description:
      "This table shows your most recent orders at a glance. Each row displays the Order ID, Customer name, Amount, Status, and Date. Click an Order ID to copy it, or visit the Orders page for full details.",
    targetSelector: '[data-tut="dash-recent-orders"]',
    placement: "bottom",
  },
  {
    id: "dash-stats-products",
    title: "Dashboard Stats",
    description:
      "These four cards give you a quick overview of your store's performance:",
    targetSelector: '[data-tut="dash-stats-grid"]',
    placement: "top",
    mockup: "stats",
  },
  {
    id: "dash-nav-products",
    title: "Navigate to Products",
    description:
      "Now that you understand the dashboard, click 'Products' in the sidebar to continue the tutorial and learn about managing your product catalog.",
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
      "This is your product catalog — all your listed items live here. You can search products, browse the grid, and view summary stats on the right. The 'Add Product' button in the top-right lets you create new listings. Click Next to see how product creation works.",
    targetSelector: '[data-tut="products-add-btn"]',
    placement: "bottom",
  },
  {
    id: "products-add-mockup",
    title: "Adding a Product",
    description:
      "When you click 'Add Product', you'll see a form like this. Fill in the product name, price, quantity, weight, material, dimensions, tags, description, and up to 5 images (first one is required). This is where you bring your products to life.",
    placement: "center",
    mockup: "add",
  },
  {
    id: "products-edit-mockup",
    title: "Editing a Product",
    description:
      "Need to update a listing? Click any product card to open the edit form. You can change the name, price, quantity, category, tags, material, images, and description. You can also activate or deactivate products. Once done, click 'Save Changes'.",
    placement: "center",
    mockup: "edit",
  },
  {
    id: "products-delete-mockup",
    title: "Deleting a Product",
    description:
      "To remove a product from your catalog, click the trash icon on the product card. A confirmation popup will appear asking you to confirm. Deletion is permanent, so make sure you want to remove the item.",
    placement: "center",
    mockup: "delete",
  },
  {
    id: "products-summary",
    title: "Summary Cards",
    description:
      "The right column shows key metrics: Total Products, Active Listings (currently available for sale), and Low Stock items.",
    targetSelector: '[data-tut="products-summary-cards"]',
    placement: "left",
  },

  // ===== ORDERS PAGE =====
  {
    id: "orders-nav",
    title: "Navigate to Orders",
    description:
      "Great! Now let's learn about order management. Click 'Orders' in the sidebar to continue.",
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
      "The Orders page shows all customer orders grouped by order ID. Each group represents one customer's purchase, which may contain multiple items. During this tutorial, a demo order has been created for you to practice with.",
    placement: "center",
  },
  {
    id: "orders-demo-order",
    title: "Demo Order",
    description:
      "This is a tutorial order placed by 'Tutorial Customer'. In real use, you'll see live customer orders here. Notice the orange 'Approval Needed' badge — this means the order is awaiting your decision.",
    targetSelector: '[data-tut="orders-demo-card"]',
    placement: "bottom",
  },
  {
    id: "orders-accept",
    title: "Accept the Order",
    description:
      "For every new order, you can either Accept or Reject it. Accepting confirms you will fulfill the order. Rejecting cancels it (a 5% penalty applies). Click the Accept button to approve this tutorial order.",
    targetSelector: '[data-tut="orders-accept-btn"]',
    placement: "left",
    actionRequired: "Click Accept to approve the tutorial order",
    actionType: "custom",
  },
  {
    id: "orders-after-accept",
    title: "Order Management",
    description:
      "After accepting, you can manage the order from here. The status updates to 'Accepted' and you can add tracking information, change the order status, view detailed breakdowns, and track shipments. Click Details to see the full order including customer info, shipping address, products, and payout breakdown.",
    targetSelector: '[data-tut="orders-actions"]',
    placement: "left",
  },

  // ===== TRANSACTIONS PAGE =====
  {
    id: "transactions-nav",
    title: "Navigate to Transactions",
    description:
      "Now let's explore how payments work. Click 'Transactions' in the sidebar.",
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
      "The Transactions page manages all your earnings. Here you can see your balance breakdown, request withdrawals, and review your transaction history.",
    placement: "center",
  },
  {
    id: "transactions-demo",
    title: "Tutorial Transaction",
    description:
      "The demo order appears in Recent Transactions with a status of 'In Clearing'. This means the funds are temporarily held and not yet available for withdrawal.",
    targetSelector: '[data-tut="transactions-demo-row"]',
    placement: "top",
  },
  {
    id: "transactions-clearing",
    title: "What is 'In Clearing'?",
    description:
      "When an order is accepted, the payment enters a 2 business day clearing period. This standard practice protects against disputes and chargebacks. During this time, the amount shows as 'In Clearing' (amber badge). After 2 business days, it moves to 'Cleared' status and becomes available for withdrawal.",
    targetSelector: '[data-tut="transactions-clearing-card"]',
    placement: "left",
  },
  {
    id: "transactions-cleared",
    title: "Funds Available",
    description:
      "For this tutorial, we've moved the demo transaction to 'Cleared' status. The amount is now reflected in your 'Available for Withdrawal' balance on the right. You can see the breakdown: Total Balance, Available for Withdrawal (green), and In Clearing (amber).",
    targetSelector: '[data-tut="transactions-available-card"]',
    placement: "left",
  },
  {
    id: "transactions-withdraw-form",
    title: "Request a Withdrawal",
    description:
      "Your funds are now cleared and available. Click the 'Max' button to fill in your full available balance, then click 'Request' to submit a withdrawal request.",
    targetSelector: '[data-tut="transactions-withdraw-form"]',
    placement: "bottom",
    actionRequired: "Click Max, then click Request to submit your withdrawal",
    actionType: "custom",
  },
  {
    id: "transactions-withdraw-mockup",
    title: "Withdrawals & Penalties",
    description:
      "After requesting a withdrawal, it appears in the 'Withdrawals & Penalties' section with a Pending status. Once approved, the payout is processed to your UPI ID. Penalties (5% of rejected order value) also appear here — shown as the ₹50 rejected entry in the table below.",
    placement: "center",
    mockup: "withdraw",
  },
  // ===== FINANCIALS PAGE =====
  {
    id: "financials-nav",
    title: "Navigate to Financials",
    description:
      "Next, let's see how to download your financial records. Click 'Financials' in the sidebar.",
    targetSelector: '[data-tut="sidebar-financials"]',
    placement: "right",
    actionRequired: "Click Financials in the sidebar navigation",
    actionType: "navigate",
    actionRoute: "/dashboard/financials",
  },
  {
    id: "financials-overview",
    title: "Financials Page",
    description:
      "This page lets you download your complete financial ledger as a CSV file for tax and accounting purposes. It includes all transactions, payouts, penalties, and monthly earnings breakdowns. The three info cards explain what's included: Transaction History (every sale and adjustment), Payout Records (complete payout history), and Tax Summary (annual earnings breakdown with commission deductions).",
    targetSelector: '[data-tut="financials-download-btn"]',
    placement: "bottom",
  },

  // ===== SUPPORT PAGE =====
  {
    id: "support-nav",
    title: "Navigate to Support",
    description:
      "Now let's see how to get help. Click 'Support' in the sidebar.",
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
      "The Support page provides multiple ways to get help. The Getting Started Guide explains each section of your dashboard. You can submit a support request via the contact form, reach us via email, WhatsApp, or Instagram. We typically respond within 1-2 business days. The Transaction Processing section explains the payout lifecycle.",
    placement: "center",
  },

  // ===== COMPLETION =====
  {
    id: "tutorial-complete",
    title: "Onboarding Complete!",
    description:
      "Congratulations! You've completed the seller onboarding tutorial. You now know how to manage products, process orders, request payouts, and configure your store. Happy selling on The Loopy Dragon!",
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
      ONBOARDING_STEPS.find((s) => s.id === "products-add-mockup")!,
      ONBOARDING_STEPS.find((s) => s.id === "products-edit-mockup")!,
      ONBOARDING_STEPS.find((s) => s.id === "products-delete-mockup")!,
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
  financials: {
    page: "financials",
    title: "Financials Guide",
    steps: [
      { ...ONBOARDING_STEPS.find((s) => s.id === "financials-overview")!, id: "page-fin-overview" },
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
