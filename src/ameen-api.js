
import { 
  createDigitalProduct, 
  purchaseDigitalProduct, 
  trackProductDownload, 
  withdrawProfit,
  getWalletSummary,
  getSalesReport
} from './ameen-assistant.js';

/**
 * Ameen API - Handles requests from the frontend
 */
export function handleRequest(action, params) {
  switch (action) {
    case 'create_product':
      return createDigitalProduct(
        params.title,
        params.description,
        params.price,
        params.category,
        params.previewImages,
        params.downloadFile,
        params.tags
      );
      
    case 'purchase_product':
      return purchaseDigitalProduct(
        params.productId,
        params.customerId,
        params.amount,
        params.currency,
        params.paymentMethod,
        params.transactionId
      );
      
    case 'track_download':
      return trackProductDownload(params.downloadLink);
      
    case 'withdraw_profit':
      return withdrawProfit(
        params.amount,
        params.upiMethod,
        params.upiId
      );
      
    case 'get_wallet_summary':
      return getWalletSummary();
      
    case 'get_sales_report':
      return getSalesReport(params.startDate, params.endDate);
      
    default:
      return {
        error: 'Unknown action',
        message: `Action '${action}' is not supported`
      };
  }
}

/**
 * Process a command from the owner
 */
export function processOwnerCommand(command) {
  // Simple command parser
  const commandLower = command.toLowerCase();
  
  if (commandLower.includes('create') && commandLower.includes('product')) {
    return "To create a product, please provide: title, description, price, category, and file details.";
  }
  
  if (commandLower.includes('sales') && commandLower.includes('report')) {
    const report = getSalesReport();
    return `Sales Report Summary:
- Total Sales: ${report.summary.total_sales}
- Total Revenue: ₹${report.summary.total_revenue.toFixed(2)}
- Total Profit: ₹${report.summary.total_profit.toFixed(2)}`;
  }
  
  if (commandLower.includes('wallet') || commandLower.includes('balance')) {
    const wallet = getWalletSummary();
    return `Wallet Summary:
- Total Balance: ₹${wallet.balance.toFixed(2)}
- Withdrawable Profit: ₹${wallet.withdrawable_profit.toFixed(2)}
- Business Growth Fund: ₹${wallet.business_growth_fund.toFixed(2)}
- Expense Coverage: ₹${wallet.expense_coverage.toFixed(2)}
- Last Updated: ${new Date(wallet.last_updated).toLocaleString()}`;
  }
  
  if (commandLower.includes('withdraw') && commandLower.includes('profit')) {
    return "To withdraw profit, please specify the amount and UPI details.";
  }
  
  return "I'm listening, Master. You can ask me about products, sales, wallet balance, or give me commands to create products or withdraw profit.";
}