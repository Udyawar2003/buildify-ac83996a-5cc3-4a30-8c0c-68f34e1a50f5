
/**
 * Ameen Digital Product Management System
 * 
 * This module handles digital product creation, sales, delivery, and financial tracking
 * without relying on file system operations.
 */

// In-memory storage for our application
const store = {
  products: [],
  purchases: [],
  payments: [],
  wallet: {
    balance: 0,
    withdrawable_profit: 0,
    business_growth_fund: 0,
    expense_coverage: 0,
    last_updated: new Date().toISOString()
  },
  backups: [],
  marketingContent: []
};

// Product categories
const PRODUCT_CATEGORIES = [
  'logo', 
  'poster', 
  'ebook', 
  'planner', 
  'notes', 
  'ui_ux', 
  'quranic_journal', 
  'other'
];

/**
 * Create a new digital product
 */
export function createDigitalProduct(title, description, price, category, previewImages, downloadFile, tags = []) {
  // Validate inputs
  if (!title || !description || !price || !category || !downloadFile) {
    console.error("Missing required product information");
    return null;
  }
  
  if (!PRODUCT_CATEGORIES.includes(category)) {
    console.error(`Invalid category. Must be one of: ${PRODUCT_CATEGORIES.join(', ')}`);
    return null;
  }
  
  // Create product object
  const product = {
    id: generateId(),
    title,
    description,
    price: Number(price),
    category,
    preview_images: Array.isArray(previewImages) ? previewImages : [previewImages],
    download_file: downloadFile,
    is_active: true,
    tags: Array.isArray(tags) ? tags : [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  // Add to store
  store.products.push(product);
  
  // Generate marketing content
  generateMarketingContent(product);
  
  // Backup to vault
  simulateVaultBackup('product', product, product.id);
  
  console.log(`Created new digital product: ${title} (${category}) - ₹${price}`);
  return product;
}

/**
 * Purchase a digital product
 */
export function purchaseDigitalProduct(productId, customerId, amount, currency, paymentMethod, transactionId) {
  // Find product
  const product = store.products.find(p => p.id === productId);
  if (!product) {
    console.error(`Product not found: ${productId}`);
    return null;
  }
  
  // Convert currency if needed
  const amountInr = convertToInr(amount, currency);
  
  // Create download link
  const downloadLink = `download/${generateId()}`;
  
  // Create purchase record
  const purchase = {
    id: generateId(),
    product_id: productId,
    customer_id: customerId,
    download_link: downloadLink,
    download_count: 0,
    download_expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
    created_at: new Date().toISOString()
  };
  
  // Add to store
  store.purchases.push(purchase);
  
  // Process payment
  const payment = processPayment(purchase.id, amount, currency, amountInr, paymentMethod, transactionId);
  
  // Update purchase with payment ID
  purchase.payment_id = payment.id;
  
  // Send confirmation email (simulated)
  simulateSendEmail(
    customerId,
    `Your purchase of ${product.title} is complete!`,
    `Thank you for purchasing ${product.title}. You can download your product using this link: ${downloadLink}`
  );
  
  // Backup to vault
  simulateVaultBackup('purchase', {
    purchase,
    product,
    payment
  }, purchase.id);
  
  console.log(`Processed purchase: ${product.title} for ${currency} ${amount} (₹${amountInr})`);
  return { purchase, payment };
}

/**
 * Process payment and update wallet
 */
function processPayment(purchaseId, amount, currency, amountInr, paymentMethod, transactionId) {
  // Calculate profit distribution (60% profit, 30% growth, 10% expenses)
  const profitAmount = amountInr * 0.6;
  const growthAmount = amountInr * 0.3;
  const expenseAmount = amountInr * 0.1;
  
  // Create payment record
  const payment = {
    id: generateId(),
    purchase_id: purchaseId,
    amount: amount,
    currency: currency,
    amount_inr: amountInr,
    status: 'completed',
    payment_method: paymentMethod,
    transaction_id: transactionId,
    profit_amount: profitAmount,
    growth_fund_amount: growthAmount,
    expense_amount: expenseAmount,
    created_at: new Date().toISOString()
  };
  
  // Add to store
  store.payments.push(payment);
  
  // Update wallet
  store.wallet.balance += amountInr;
  store.wallet.withdrawable_profit += profitAmount;
  store.wallet.business_growth_fund += growthAmount;
  store.wallet.expense_coverage += expenseAmount;
  store.wallet.last_updated = new Date().toISOString();
  
  console.log(`Payment processed: ${currency} ${amount} (₹${amountInr})`);
  console.log(`Profit: ₹${profitAmount.toFixed(2)}, Growth: ₹${growthAmount.toFixed(2)}, Expenses: ₹${expenseAmount.toFixed(2)}`);
  
  return payment;
}

/**
 * Track product download
 */
export function trackProductDownload(downloadLink) {
  // Find purchase
  const purchase = store.purchases.find(p => p.download_link === downloadLink);
  if (!purchase) {
    console.error(`Invalid download link: ${downloadLink}`);
    return null;
  }
  
  // Check if expired
  if (new Date(purchase.download_expiry) < new Date()) {
    console.error(`Download link expired: ${downloadLink}`);
    return null;
  }
  
  // Find product
  const product = store.products.find(p => p.id === purchase.product_id);
  if (!product) {
    console.error(`Product not found: ${purchase.product_id}`);
    return null;
  }
  
  // Update download count
  purchase.download_count += 1;
  
  // Backup download event
  simulateVaultBackup('file', {
    purchase_id: purchase.id,
    product_id: purchase.product_id,
    customer_id: purchase.customer_id,
    download_count: purchase.download_count,
    download_time: new Date().toISOString()
  }, `${purchase.id}-download-${purchase.download_count}`);
  
  console.log(`Download tracked: ${product.title} (download #${purchase.download_count})`);
  return product.download_file;
}

/**
 * Withdraw profit to UPI
 */
export function withdrawProfit(amount, upiMethod, upiId) {
  if (amount > store.wallet.withdrawable_profit) {
    console.error(`Insufficient withdrawable profit. Available: ₹${store.wallet.withdrawable_profit.toFixed(2)}, Requested: ₹${amount.toFixed(2)}`);
    return false;
  }
  
  // Update wallet
  store.wallet.withdrawable_profit -= amount;
  store.wallet.balance -= amount;
  store.wallet.last_updated = new Date().toISOString();
  
  // Simulate UPI transfer
  simulateUpiTransfer(amount, upiMethod, upiId);
  
  // Create notification
  const notification = {
    id: generateId(),
    title: 'Profit Withdrawal',
    message: `₹${amount.toFixed(2)} has been transferred to your ${upiMethod} (${upiId})`,
    type: 'balance',
    created_at: new Date().toISOString()
  };
  
  console.log(`Profit withdrawn: ₹${amount.toFixed(2)} to ${upiMethod} (${upiId})`);
  console.log(`Remaining withdrawable profit: ₹${store.wallet.withdrawable_profit.toFixed(2)}`);
  
  return true;
}

/**
 * Generate marketing content for a product
 */
function generateMarketingContent(product) {
  // Blog content
  const blogContent = {
    id: generateId(),
    product_id: product.id,
    content_type: 'blog',
    title: `Introducing: ${product.title}`,
    content: `We are excited to introduce our latest digital product: ${product.title}. ${product.description} This premium digital asset is available now for just ₹${product.price}. Perfect for professionals looking to enhance their projects with high-quality design elements.`,
    is_published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  // Social content
  const socialContent = {
    id: generateId(),
    product_id: product.id,
    content_type: 'social',
    title: `New Release: ${product.title}`,
    content: `🚀 Just launched! ${product.title} - ${product.description.substring(0, 100)}... Get yours now at a special price of ₹${product.price}! #DigitalProducts #Design`,
    is_published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  // Email content
  const emailContent = {
    id: generateId(),
    product_id: product.id,
    content_type: 'email',
    title: `Exclusive New Release: ${product.title}`,
    content: `Dear Valued Customer,\n\nWe are thrilled to announce the release of our latest digital product: ${product.title}.\n\n${product.description}\n\nThis premium digital asset is available now for just ₹${product.price}.\n\nClick here to purchase and download instantly!\n\nThank you for your continued support.\n\nBest regards,\nThe Digital Products Team`,
    is_published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  // Website content
  const websiteContent = {
    id: generateId(),
    product_id: product.id,
    content_type: 'website',
    title: product.title,
    content: `<div class="product-highlight">
  <h2>${product.title}</h2>
  <p class="product-description">${product.description}</p>
  <div class="product-price">₹${product.price}</div>
  <a href="/digital-products/${product.id}" class="btn btn-primary">View Details</a>
</div>`,
    is_published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  // Add to store
  store.marketingContent.push(blogContent, socialContent, emailContent, websiteContent);
  
  console.log(`Generated marketing content for: ${product.title}`);
  return [blogContent, socialContent, emailContent, websiteContent];
}

/**
 * Get wallet summary
 */
export function getWalletSummary() {
  return {
    balance: store.wallet.balance,
    withdrawable_profit: store.wallet.withdrawable_profit,
    business_growth_fund: store.wallet.business_growth_fund,
    expense_coverage: store.wallet.expense_coverage,
    last_updated: store.wallet.last_updated
  };
}

/**
 * Get sales report
 */
export function getSalesReport(startDate, endDate) {
  const start = startDate ? new Date(startDate) : new Date(0);
  const end = endDate ? new Date(endDate) : new Date();
  
  const filteredPayments = store.payments.filter(payment => {
    const paymentDate = new Date(payment.created_at);
    return paymentDate >= start && paymentDate <= end;
  });
  
  const totalSales = filteredPayments.length;
  const totalRevenue = filteredPayments.reduce((sum, payment) => sum + payment.amount_inr, 0);
  const totalProfit = filteredPayments.reduce((sum, payment) => sum + payment.profit_amount, 0);
  
  // Group by product
  const salesByProduct = {};
  for (const payment of filteredPayments) {
    const purchase = store.purchases.find(p => p.id === payment.purchase_id);
    if (purchase) {
      const product = store.products.find(p => p.id === purchase.product_id);
      if (product) {
        if (!salesByProduct[product.id]) {
          salesByProduct[product.id] = {
            product_name: product.title,
            count: 0,
            revenue: 0
          };
        }
        salesByProduct[product.id].count += 1;
        salesByProduct[product.id].revenue += payment.amount_inr;
      }
    }
  }
  
  return {
    period: {
      start: start.toISOString(),
      end: end.toISOString()
    },
    summary: {
      total_sales: totalSales,
      total_revenue: totalRevenue,
      total_profit: totalProfit
    },
    sales_by_product: Object.values(salesByProduct)
  };
}

// Utility functions

/**
 * Generate a random ID
 */
function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * Convert currency to INR
 */
function convertToInr(amount, currency) {
  // Simple conversion rates (in a real app, you'd use an API)
  const conversionRates = {
    USD: 75,
    EUR: 85,
    GBP: 95,
    AUD: 55,
    CAD: 60,
    INR: 1
  };
  
  const rate = conversionRates[currency] || 1;
  return amount * rate;
}

/**
 * Simulate vault backup
 */
function simulateVaultBackup(type, data, referenceId) {
  const backup = {
    id: generateId(),
    type,
    data,
    reference_id: referenceId,
    created_at: new Date().toISOString()
  };
  
  store.backups.push(backup);
  console.log(`Simulated Vault Backup: ${type} - ${referenceId}`);
  return backup;
}

/**
 * Simulate sending email
 */
function simulateSendEmail(recipient, subject, body) {
  console.log(`Simulated Email to ${recipient}:`);
  console.log(`Subject: ${subject}`);
  console.log(`Body: ${body}`);
}

/**
 * Simulate UPI transfer
 */
function simulateUpiTransfer(amount, upiMethod, upiId) {
  console.log(`Simulated UPI Transfer: ₹${amount.toFixed(2)} to ${upiMethod} (${upiId})`);
}