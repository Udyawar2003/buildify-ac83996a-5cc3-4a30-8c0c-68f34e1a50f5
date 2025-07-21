
import { 
  createDigitalProduct, 
  purchaseDigitalProduct, 
  trackProductDownload, 
  withdrawProfit,
  getWalletSummary,
  getSalesReport
} from './ameen-assistant.js';

// Test the Ameen digital product management system
console.log("===== AMEEN DIGITAL PRODUCT MANAGEMENT SYSTEM =====");

// 1. Create some digital products
console.log("\n----- Creating Digital Products -----");

const logoProduct = createDigitalProduct(
  "Modern Minimalist Logo Pack",
  "A collection of 10 modern, minimalist logo templates perfect for startups and small businesses.",
  1500,
  "logo",
  ["https://example.com/logo-preview.jpg"],
  "https://example.com/downloads/logo-pack.zip",
  ["minimalist", "modern", "startup", "branding"]
);

const ebookProduct = createDigitalProduct(
  "Financial Freedom eBook Template",
  "Professional eBook template designed for financial advice and personal development books.",
  2500,
  "ebook",
  ["https://example.com/ebook-preview.jpg"],
  "https://example.com/downloads/finance-ebook-template.zip",
  ["finance", "ebook", "template", "personal development"]
);

const uiuxProduct = createDigitalProduct(
  "Dashboard UI Kit",
  "Complete UI kit for creating modern analytics dashboards with 50+ components and 10 example layouts.",
  3500,
  "ui_ux",
  ["https://example.com/dashboard-preview.jpg"],
  "https://example.com/downloads/dashboard-ui-kit.zip",
  ["ui", "dashboard", "analytics", "figma"]
);

// 2. Process some purchases
console.log("\n----- Processing Purchases -----");

const purchase1 = purchaseDigitalProduct(
  logoProduct.id,
  "customer123",
  1500,
  "INR",
  "phonepay",
  "TXN123456"
);

const purchase2 = purchaseDigitalProduct(
  ebookProduct.id,
  "customer456",
  35,
  "USD",
  "paytm",
  "TXN789012"
);

const purchase3 = purchaseDigitalProduct(
  uiuxProduct.id,
  "customer789",
  40,
  "EUR",
  "googlepay",
  "TXN345678"
);

// 3. Track downloads
console.log("\n----- Tracking Downloads -----");

if (purchase1) {
  trackProductDownload(purchase1.purchase.download_link);
  // Second download of the same product
  trackProductDownload(purchase1.purchase.download_link);
}

if (purchase2) {
  trackProductDownload(purchase2.purchase.download_link);
}

// 4. Withdraw profit
console.log("\n----- Withdrawing Profit -----");

// Check wallet before withdrawal
const walletBefore = getWalletSummary();
console.log("Wallet before withdrawal:", walletBefore);

// Withdraw some profit
withdrawProfit(2000, "googlepay", "owner@okicici");

// Check wallet after withdrawal
const walletAfter = getWalletSummary();
console.log("Wallet after withdrawal:", walletAfter);

// 5. Generate sales report
console.log("\n----- Sales Report -----");

const report = getSalesReport();
console.log(JSON.stringify(report, null, 2));

console.log("\n===== TEST COMPLETED =====");