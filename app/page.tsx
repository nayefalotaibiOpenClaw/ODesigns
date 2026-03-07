"use client";

import { useState } from "react";
import { LayoutGrid, List, Pencil, Sparkles, Palette } from "lucide-react";
import { EditContext } from "./components/EditContext";
import Link from "next/link";
import SummerOfferPost from "./components/SummerOffer";
import RelaxPost from "./components/RelaxPost";
import OfflineModePost from "./components/OfflineModePost";
import OnePlatformPost from "./components/OnePlatformPost";
import KitchenDisplayPost from "./components/KitchenDisplayPost";
import AnalyticsPost from "./components/AnalyticsPost";
import OnlineStorePost from "./components/OnlineStorePost";
import DeliveryIntegrationPost from "./components/DeliveryIntegrationPost";
import HRAttendancePost from "./components/HRAttendancePost";
import TaskManagementPost from "./components/TaskManagementPost";
import LoyaltyPost from "./components/LoyaltyPost";
import InventoryPost from "./components/InventoryPost";
import AccountingPost from "./components/AccountingPost";
import AIInsightsPost from "./components/AIInsightsPost";
import MultiBranchPost from "./components/MultiBranchPost";
import MobileDashboardPost from "./components/MobileDashboardPost";
import StaffManagementPost from "./components/StaffManagementPost";
import InventoryStockPost from "./components/InventoryStockPost";
import MenuPerformancePost from "./components/MenuPerformancePost";

export default function Home() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [editMode, setEditMode] = useState(false);

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      {/* Controls Header */}
      <div className="max-w-[1920px] mx-auto flex justify-between items-center mb-12">
        <h1 className="text-2xl font-black text-[#1B4332]">Social Media Kit</h1>
        
        <div className="flex items-center gap-3">
          <Link
            href="/generate"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-white text-gray-500 border border-gray-200 shadow-sm hover:bg-gray-50"
          >
            <Sparkles size={16} />
            Generate
          </Link>
          <Link
            href="/customize"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-white text-gray-500 border border-gray-200 shadow-sm hover:bg-gray-50"
          >
            <Palette size={16} />
            Theme
          </Link>
          <button
            onClick={() => setEditMode(!editMode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              editMode
                ? 'bg-yellow-400 text-yellow-900 shadow-md'
                : 'bg-white text-gray-500 border border-gray-200 shadow-sm hover:bg-gray-50'
            }`}
          >
            <Pencil size={16} />
            {editMode ? 'Editing' : 'Edit Mode'}
          </button>
          <div className="bg-white p-1 rounded-lg shadow-sm border border-gray-200 flex gap-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-md transition-all ${
              viewMode === 'grid' 
                ? 'bg-[#1B4332] text-white shadow-sm' 
                : 'text-gray-400 hover:bg-gray-50'
            }`}
            title="Grid View"
          >
            <LayoutGrid size={20} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md transition-all ${
              viewMode === 'list' 
                ? 'bg-[#1B4332] text-white shadow-sm' 
                : 'text-gray-400 hover:bg-gray-50'
            }`}
            title="List View"
          >
            <List size={20} />
          </button>
        </div>
        </div>
      </div>

      {/* Content Grid/List */}
      <EditContext.Provider value={editMode}>
      <div className={`
        max-w-[1920px] mx-auto transition-all duration-500
        ${viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8' 
          : 'flex flex-col items-center space-y-12'
        }
      `}>
          {/* New Neon Series */}
          <MobileDashboardPost />
          <StaffManagementPost />
          <InventoryStockPost />
          <MenuPerformancePost />

          {/* 12. Inventory Management */}
          <InventoryPost />

          {/* 13. Accounting */}
          <AccountingPost />

          {/* 14. AI Insights */}
          <AIInsightsPost />

          {/* 15. Multi-Branch */}
          <MultiBranchPost />

          {/* 8. Delivery Integration */}
          <DeliveryIntegrationPost />

          {/* 9. HR Attendance */}
          <HRAttendancePost />

          {/* 10. Task Management */}
          <TaskManagementPost />

          {/* 11. Loyalty System */}
          <LoyaltyPost />

          {/* 5. Kitchen Display System */}
          <KitchenDisplayPost />

          {/* 6. Analytics Dashboard */}
          <AnalyticsPost />

          {/* 7. Online Store */}
          <OnlineStorePost />

          {/* 3. Offline Mode Post */}
          <OfflineModePost />

          {/* 4. One Platform Post */}
          <OnePlatformPost />

          {/* 1. Summer Offer Post */}
          <SummerOfferPost />
          
          {/* 2. Relax Post */}
          <RelaxPost />
      </div>
      </EditContext.Provider>
    </main>
  );
}
