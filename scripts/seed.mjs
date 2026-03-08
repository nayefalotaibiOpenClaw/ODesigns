/**
 * Seed script: reads all existing post .tsx files and pushes them into Convex.
 *
 * Usage:
 *   1. First run the seedDatabase internal mutation via Convex dashboard to create
 *      the user, workspace, branding, and collection. Note the returned IDs.
 *   2. Then run: node scripts/seed.mjs <userId> <workspaceId> <collectionId>
 *
 * Or use the all-in-one approach:
 *   node scripts/seed.mjs
 *   (will use environment variables and create everything)
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COMPONENTS_DIR = path.join(__dirname, "..", "app", "components");

// Post registry matching the order in design/page.tsx
const SEED_POSTS = [
  { title: "Smart Menu", file: "SmartMenuPost.tsx" },
  { title: "Dual Screen", file: "DualScreenPost.tsx" },
  { title: "Live Tracking", file: "LiveTrackingPost.tsx" },
  { title: "Profit Center", file: "ProfitCenterPost.tsx" },
  { title: "Smart Workflows", file: "SmartWorkflowsPost.tsx" },
  { title: "Online Ordering", file: "OnlineOrderingPost.tsx" },
  { title: "Table Ordering", file: "TableOrderingPost.tsx" },
  { title: "Menu Management", file: "MenuManagementPost.tsx" },
  { title: "Dashboard Overview", file: "DashboardOverviewPost.tsx" },
  { title: "Reports Export", file: "ReportsExportPost.tsx" },
  { title: "Customer Insights", file: "CustomerInsightsPost.tsx" },
  { title: "Waste Reduction", file: "WasteReductionPost.tsx" },
  { title: "Quality Control", file: "QualityControlPost.tsx" },
  { title: "Integrated Payments", file: "IntegratedPaymentsPost.tsx" },
  { title: "Regional Scalability", file: "RegionalScalabilityPost.tsx" },
  { title: "Mobile Dashboard", file: "MobileDashboardPost.tsx" },
  { title: "Staff Management", file: "StaffManagementPost.tsx" },
  { title: "Inventory Stock", file: "InventoryStockPost.tsx" },
  { title: "Menu Performance", file: "MenuPerformancePost.tsx" },
  { title: "Inventory", file: "InventoryPost.tsx" },
  { title: "Accounting", file: "AccountingPost.tsx" },
  { title: "AI Insights", file: "AIInsightsPost.tsx" },
  { title: "Multi Branch", file: "MultiBranchPost.tsx" },
  { title: "Delivery Integration", file: "DeliveryIntegrationPost.tsx" },
  { title: "HR Attendance", file: "HRAttendancePost.tsx" },
  { title: "Task Management", file: "TaskManagementPost.tsx" },
  { title: "Loyalty", file: "LoyaltyPost.tsx" },
  { title: "Kitchen Display", file: "KitchenDisplayPost.tsx" },
  { title: "Analytics", file: "AnalyticsPost.tsx" },
  { title: "Online Store", file: "OnlineStorePost.tsx" },
  { title: "Offline Mode", file: "OfflineModePost.tsx" },
  { title: "One Platform", file: "OnePlatformPost.tsx" },
  { title: "Summer Offer", file: "SummerOffer.tsx" },
  { title: "Relax", file: "RelaxPost.tsx" },
];

// Read all post files and output JSON for seeding
const posts = [];
let missing = [];

for (let i = 0; i < SEED_POSTS.length; i++) {
  const { title, file } = SEED_POSTS[i];
  const filePath = path.join(COMPONENTS_DIR, file);

  if (!fs.existsSync(filePath)) {
    missing.push(file);
    continue;
  }

  const code = fs.readFileSync(filePath, "utf-8");
  posts.push({
    title,
    componentCode: code,
    order: i,
  });
}

if (missing.length > 0) {
  console.warn(`⚠ Missing files: ${missing.join(", ")}`);
}

console.log(`✓ Read ${posts.length} post files`);

// Output as JSON file for importing via Convex dashboard or mutation
const outputPath = path.join(__dirname, "seed-data.json");
fs.writeFileSync(outputPath, JSON.stringify(posts, null, 2));
console.log(`✓ Wrote seed data to ${outputPath}`);
console.log(`\nNext steps:`);
console.log(`  1. Run seedDatabase via Convex dashboard to create user/workspace/collection`);
console.log(`  2. Use the returned IDs to call seedPosts with the data from seed-data.json`);
