"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { LayoutGrid, List, Sparkles, Palette, ArrowUpDown, Pencil, Settings, Upload, Image as ImageIcon, X, Check } from "lucide-react";
import { EditContext, AspectRatioContext, AspectRatioType, SelectedIdContext, SetSelectedIdContext } from "./components/EditContext";
import { useTheme, useSetTheme, Theme, defaultTheme } from "./components/ThemeContext";
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
import WasteReductionPost from "./components/WasteReductionPost";
import QualityControlPost from "./components/QualityControlPost";
import IntegratedPaymentsPost from "./components/IntegratedPaymentsPost";
import RegionalScalabilityPost from "./components/RegionalScalabilityPost";
import CustomerInsightsPost from "./components/CustomerInsightsPost";
import TableOrderingPost from "./components/TableOrderingPost";
import MenuManagementPost from "./components/MenuManagementPost";
import DashboardOverviewPost from "./components/DashboardOverviewPost";
import ReportsExportPost from "./components/ReportsExportPost";
import ProfitCenterPost from "./components/ProfitCenterPost";
import SmartWorkflowsPost from "./components/SmartWorkflowsPost";
import OnlineOrderingPost from "./components/OnlineOrderingPost";
import SmartMenuPost from "./components/SmartMenuPost";
import DualScreenPost from "./components/DualScreenPost";
import LiveTrackingPost from "./components/LiveTrackingPost";
import PostWrapper from "./components/PostWrapper";

const POST_REGISTRY: { id: string; filename: string; component: React.ComponentType }[] = [
  { id: "smart-menu", filename: "smart-menu", component: SmartMenuPost },
  { id: "dual-screen", filename: "dual-screen", component: DualScreenPost },
  { id: "live-tracking", filename: "live-tracking", component: LiveTrackingPost },
  { id: "profit-center", filename: "profit-center", component: ProfitCenterPost },
  { id: "smart-workflows", filename: "smart-workflows", component: SmartWorkflowsPost },
  { id: "online-ordering", filename: "online-ordering", component: OnlineOrderingPost },
  { id: "table-ordering", filename: "table-ordering", component: TableOrderingPost },
  { id: "menu-management", filename: "menu-management", component: MenuManagementPost },
  { id: "dashboard-overview", filename: "dashboard-overview", component: DashboardOverviewPost },
  { id: "reports-export", filename: "reports-export", component: ReportsExportPost },
  { id: "customer-insights", filename: "customer-insights", component: CustomerInsightsPost },
  { id: "waste-reduction", filename: "waste-reduction", component: WasteReductionPost },
  { id: "quality-control", filename: "quality-control", component: QualityControlPost },
  { id: "integrated-payments", filename: "integrated-payments", component: IntegratedPaymentsPost },
  { id: "regional-scalability", filename: "regional-scalability", component: RegionalScalabilityPost },
  { id: "mobile-dashboard", filename: "mobile-dashboard", component: MobileDashboardPost },
  { id: "staff-management", filename: "staff-management", component: StaffManagementPost },
  { id: "inventory-stock", filename: "inventory-stock", component: InventoryStockPost },
  { id: "menu-performance", filename: "menu-performance", component: MenuPerformancePost },
  { id: "inventory", filename: "inventory", component: InventoryPost },
  { id: "accounting", filename: "accounting", component: AccountingPost },
  { id: "ai-insights", filename: "ai-insights", component: AIInsightsPost },
  { id: "multi-branch", filename: "multi-branch", component: MultiBranchPost },
  { id: "delivery-integration", filename: "delivery-integration", component: DeliveryIntegrationPost },
  { id: "hr-attendance", filename: "hr-attendance", component: HRAttendancePost },
  { id: "task-management", filename: "task-management", component: TaskManagementPost },
  { id: "loyalty", filename: "loyalty", component: LoyaltyPost },
  { id: "kitchen-display", filename: "kitchen-display", component: KitchenDisplayPost },
  { id: "analytics", filename: "analytics", component: AnalyticsPost },
  { id: "online-store", filename: "online-store", component: OnlineStorePost },
  { id: "offline-mode", filename: "offline-mode", component: OfflineModePost },
  { id: "one-platform", filename: "one-platform", component: OnePlatformPost },
  { id: "summer-offer", filename: "summer-offer", component: SummerOfferPost },
  { id: "relax", filename: "relax", component: RelaxPost },
];

const STATIC_IMAGES = [
  "/1.jpg", "/2.jpg", "/3.jpg", "/4.jpg",
  "/pos-screen.jpg", "/sylo-logo.jpg", "/mockup.png",
];

const FONTS = [
  { name: "Cairo", value: "'Cairo', sans-serif" },
  { name: "Tajawal", value: "'Tajawal', sans-serif" },
  { name: "IBM Plex Sans Arabic", value: "'IBM Plex Sans Arabic', sans-serif" },
  { name: "Noto Sans Arabic", value: "'Noto Sans Arabic', sans-serif" },
  { name: "Readex Pro", value: "'Readex Pro', sans-serif" },
  { name: "Rubik", value: "'Rubik', sans-serif" },
  { name: "Almarai", value: "'Almarai', sans-serif" },
  { name: "Changa", value: "'Changa', sans-serif" },
  { name: "El Messiri", value: "'El Messiri', sans-serif" },
  { name: "Baloo Bhaijaan 2", value: "'Baloo Bhaijaan 2', sans-serif" },
  { name: "Inter", value: "'Inter', sans-serif" },
  { name: "Geist", value: "'Geist', sans-serif" },
];

const PALETTES: { name: string; theme: Theme }[] = [
  { name: "Sylo Green", theme: defaultTheme },
  { name: "Ocean Blue", theme: { ...defaultTheme, primary: "#1E3A5F", primaryLight: "#EFF6FF", primaryDark: "#0F1D30", accent: "#3B82F6", accentLight: "#60A5FA", accentLime: "#38BDF8", border: "#2D5A8E" } },
  { name: "Royal Purple", theme: { ...defaultTheme, primary: "#3B0764", primaryLight: "#F5F3FF", primaryDark: "#1E0334", accent: "#7C3AED", accentLight: "#A78BFA", accentLime: "#C084FC", border: "#581C87" } },
  { name: "Warm Orange", theme: { ...defaultTheme, primary: "#7C2D12", primaryLight: "#FFF7ED", primaryDark: "#431407", accent: "#EA580C", accentLight: "#FB923C", accentLime: "#FBBF24", border: "#9A3412" } },
  { name: "Rose Pink", theme: { ...defaultTheme, primary: "#881337", primaryLight: "#FFF1F2", primaryDark: "#4C0519", accent: "#E11D48", accentLight: "#FB7185", accentLime: "#FDA4AF", border: "#9F1239" } },
  { name: "Slate Dark", theme: { ...defaultTheme, primary: "#0F172A", primaryLight: "#F8FAFC", primaryDark: "#020617", accent: "#475569", accentLight: "#94A3B8", accentLime: "#CBD5E1", border: "#1E293B" } },
  { name: "Teal", theme: { ...defaultTheme, primary: "#134E4A", primaryLight: "#F0FDFA", primaryDark: "#042F2E", accent: "#0D9488", accentLight: "#2DD4BF", accentLime: "#5EEAD4", border: "#115E59" } },
  { name: "Gold & Black", theme: { ...defaultTheme, primary: "#1C1917", primaryLight: "#FFFBEB", primaryDark: "#0C0A09", accent: "#A16207", accentLight: "#CA8A04", accentLime: "#FBBF24", border: "#292524" } },
  { name: "Crimson Red", theme: { ...defaultTheme, primary: "#450A0A", primaryLight: "#FEF2F2", primaryDark: "#1C0404", accent: "#DC2626", accentLight: "#F87171", accentLime: "#FCA5A5", border: "#7F1D1D" } },
  { name: "Forest", theme: { ...defaultTheme, primary: "#14532D", primaryLight: "#F0FDF4", primaryDark: "#052E16", accent: "#16A34A", accentLight: "#4ADE80", accentLime: "#86EFAC", border: "#166534" } },
];

type SidebarTab = 'settings' | 'theme' | 'uploads' | 'generate' | null;

const SIDEBAR_ITEMS: { id: SidebarTab; icon: React.ComponentType<{ size?: number }>; label: string }[] = [
  { id: 'settings', icon: Settings, label: 'Settings' },
  { id: 'theme', icon: Palette, label: 'Theme' },
  { id: 'uploads', icon: Upload, label: 'Uploads' },
  { id: 'generate', icon: Sparkles, label: 'Generate' },
];

export default function Home() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [editMode, setEditMode] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>('1:1');
  const [gridCols, setGridCols] = useState(3);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const handleSetSelectedId = useCallback((id: string | null) => setSelectedId(id), []);
  const [postOrder, setPostOrder] = useState(() => POST_REGISTRY.map(p => p.id));
  const [reorderMode, setReorderMode] = useState(false);
  const dragItem = useRef<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<SidebarTab>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const currentTheme = useTheme();
  const setTheme = useSetTheme();

  const handleDragEnter = useCallback((targetId: string) => {
    if (!dragItem.current || dragItem.current === targetId) return;
    setPostOrder(prev => {
      const newOrder = [...prev];
      const fromIdx = newOrder.indexOf(dragItem.current!);
      const toIdx = newOrder.indexOf(targetId);
      newOrder.splice(fromIdx, 1);
      newOrder.splice(toIdx, 0, dragItem.current!);
      return newOrder;
    });
  }, []);

  const handleTabClick = (tab: SidebarTab) => {
    setActiveTab(prev => prev === tab ? null : tab);
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      const url = URL.createObjectURL(file);
      setUploadedImages(prev => [url, ...prev]);
    });
    e.target.value = '';
  };

  const panelOpen = activeTab !== null;

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Icon Rail */}
      <div className="w-[72px] bg-white border-r border-gray-200 flex flex-col items-center py-4 gap-1 shrink-0">
        <div className="w-10 h-10 bg-[#1B4332] rounded-xl flex items-center justify-center mb-4">
          <span className="text-white font-black text-sm">S</span>
        </div>
        {SIDEBAR_ITEMS.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => handleTabClick(id)}
            className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all text-[10px] font-medium ${
              activeTab === id
                ? 'bg-[#1B4332] text-white'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            <Icon size={20} />
            {label}
          </button>
        ))}
      </div>

      {/* Expandable Panel */}
      <div
        className={`bg-white border-r border-gray-200 overflow-y-auto shrink-0 transition-all duration-300 ${
          panelOpen ? 'w-[280px]' : 'w-0'
        }`}
      >
        {panelOpen && (
          <div className="w-[280px] p-5">
            {/* Panel Header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-bold text-gray-900 capitalize">{activeTab}</h2>
              <button onClick={() => setActiveTab(null)} className="text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            </div>

            {/* Settings Panel */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                {/* Edit & Reorder */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Mode</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setEditMode(!editMode); setReorderMode(false); }}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold border transition-all ${
                        editMode
                          ? 'bg-yellow-400 text-yellow-900 border-yellow-500'
                          : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <Pencil size={14} />
                      Edit
                    </button>
                    <button
                      onClick={() => { setReorderMode(!reorderMode); setEditMode(false); }}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold border transition-all ${
                        reorderMode
                          ? 'bg-[#1B4332] text-white border-[#1B4332]'
                          : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <ArrowUpDown size={14} />
                      Reorder
                    </button>
                  </div>
                </div>

                {/* Aspect Ratio */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Aspect Ratio</label>
                  <div className="flex gap-1">
                    {(['1:1', '3:4', '4:3', '9:16', '16:9'] as const).map((ratio) => (
                      <button
                        key={ratio}
                        onClick={() => setAspectRatio(ratio)}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                          aspectRatio === ratio
                            ? 'bg-[#1B4332] text-white shadow-sm'
                            : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                        }`}
                      >
                        {ratio}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Grid Columns */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Grid Columns</label>
                  <div className="flex gap-1">
                    {[2, 3, 4].map((cols) => (
                      <button
                        key={cols}
                        onClick={() => { setGridCols(cols); setViewMode('grid'); }}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                          viewMode === 'grid' && gridCols === cols
                            ? 'bg-[#1B4332] text-white shadow-sm'
                            : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                        }`}
                      >
                        {cols}
                      </button>
                    ))}
                  </div>
                </div>

                {/* View Mode */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">View</label>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                        viewMode === 'grid'
                          ? 'bg-[#1B4332] text-white shadow-sm'
                          : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                      }`}
                    >
                      <LayoutGrid size={14} />
                      Grid
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                        viewMode === 'list'
                          ? 'bg-[#1B4332] text-white shadow-sm'
                          : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                      }`}
                    >
                      <List size={14} />
                      List
                    </button>
                  </div>
                </div>

                {/* Post Count */}
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-400">{postOrder.length} posts</p>
                </div>
              </div>
            )}

            {/* Theme Panel */}
            {activeTab === 'theme' && (
              <div className="space-y-5">
                {/* Live Preview */}
                <div className="rounded-lg p-4 text-center" style={{ backgroundColor: currentTheme.primaryLight, fontFamily: currentTheme.font }}>
                  <p className="text-lg font-black" style={{ color: currentTheme.primary }}>معاينة مباشرة</p>
                  <p className="text-xs font-bold" style={{ color: currentTheme.accent }}>هذا مثال على شكل النصوص</p>
                  <div className="flex justify-center gap-1.5 mt-2">
                    <span className="px-3 py-1 rounded-full text-white text-[10px] font-bold" style={{ backgroundColor: currentTheme.accent }}>زر</span>
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold" style={{ backgroundColor: currentTheme.accentLime, color: currentTheme.primary }}>مميز</span>
                  </div>
                </div>

                {/* Color Palettes */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Color Palette</label>
                  <div className="space-y-1.5">
                    {PALETTES.map((palette, i) => {
                      const isSelected = palette.theme.primary === currentTheme.primary && palette.theme.primaryLight === currentTheme.primaryLight;
                      return (
                        <button
                          key={palette.name}
                          onClick={() => setTheme({ ...palette.theme, font: currentTheme.font })}
                          className={`w-full flex items-center gap-3 p-2.5 rounded-lg border transition-all text-left ${
                            isSelected ? 'border-gray-900 bg-white shadow-sm' : 'border-gray-100 bg-gray-50 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex gap-1 shrink-0">
                            {[palette.theme.primary, palette.theme.accent, palette.theme.accentLight, palette.theme.accentLime].map((c, j) => (
                              <div key={j} className="w-5 h-5 rounded" style={{ backgroundColor: c }} />
                            ))}
                          </div>
                          <span className="text-xs font-bold text-gray-700 truncate flex-1">{palette.name}</span>
                          {isSelected && <Check size={14} className="text-gray-900 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Font Selector */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Font</label>
                  <div className="space-y-1.5">
                    {FONTS.map((font) => {
                      const isSelected = font.value === currentTheme.font;
                      return (
                        <button
                          key={font.value}
                          onClick={() => setTheme({ ...currentTheme, font: font.value })}
                          className={`w-full flex items-center justify-between p-2.5 rounded-lg border transition-all ${
                            isSelected ? 'border-gray-900 bg-white shadow-sm' : 'border-gray-100 bg-gray-50 hover:border-gray-300'
                          }`}
                        >
                          <span className="text-sm font-bold" style={{ fontFamily: font.value }}>{font.name}</span>
                          {isSelected && <Check size={14} className="text-gray-900 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Uploads Panel */}
            {activeTab === 'uploads' && (
              <div className="space-y-4">
                <label className="block w-full cursor-pointer">
                  <div className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold bg-[#1B4332] text-white hover:bg-[#2D6A4F] transition-colors">
                    <Upload size={16} />
                    Upload Files
                  </div>
                  <input type="file" multiple accept="image/*" onChange={handleUpload} className="hidden" />
                </label>

                {uploadedImages.length > 0 && (
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Your Uploads</label>
                    <div className="grid grid-cols-2 gap-2">
                      {uploadedImages.map((src, i) => (
                        <div key={i} className="aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                          <img src={src} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Project Images</label>
                  <div className="grid grid-cols-2 gap-2">
                    {STATIC_IMAGES.map((src) => (
                      <div key={src} className="aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                        <img src={src} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Generate Panel */}
            {activeTab === 'generate' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-500">AI-generate new social media posts from your brand config.</p>
                <Link
                  href="/generate"
                  className="block w-full text-center px-4 py-2.5 rounded-lg text-sm font-bold bg-[#1B4332] text-white hover:bg-[#2D6A4F] transition-colors"
                >
                  Open Generator
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Content */}
      <main
        className="flex-1 overflow-y-auto p-6"
        onClick={(e) => {
          if (!editMode) return;
          if ((e.target as HTMLElement).closest?.('[data-toolbar-portal]')) return;
          setSelectedId(null);
        }}
      >
        <EditContext.Provider value={editMode}>
        <AspectRatioContext.Provider value={aspectRatio}>
        <SelectedIdContext.Provider value={selectedId}>
        <SetSelectedIdContext.Provider value={handleSetSelectedId}>
        <div
          className={`
            mx-auto transition-all duration-500
            ${viewMode === 'list' ? 'flex flex-col items-center space-y-12' : 'gap-6'}
            ${editMode ? 'edit-mode' : ''}
          `}
          style={viewMode === 'grid' ? {
            display: 'grid',
            gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
          } : undefined}
        >
            {postOrder.map((id) => {
              const post = POST_REGISTRY.find(p => p.id === id);
              if (!post) return null;
              const PostComponent = post.component;
              return (
                <div
                  key={id}
                  draggable={reorderMode}
                  onDragStart={reorderMode ? (e) => {
                    dragItem.current = id;
                    setDraggingId(id);
                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setData('text/plain', id);
                  } : undefined}
                  onDragOver={reorderMode ? (e) => {
                    e.preventDefault();
                  } : undefined}
                  onDragEnter={reorderMode ? () => {
                    handleDragEnter(id);
                  } : undefined}
                  onDragEnd={reorderMode ? () => {
                    dragItem.current = null;
                    setDraggingId(null);
                  } : undefined}
                  className="relative"
                  style={{
                    opacity: draggingId === id ? 0.4 : 1,
                    transition: 'opacity 0.2s',
                    cursor: reorderMode ? 'grab' : undefined,
                  }}
                >
                  <PostWrapper aspectRatio={aspectRatio} filename={post.filename}>
                    <PostComponent />
                  </PostWrapper>
                  {reorderMode && <div className="absolute inset-0 z-10 border-2 border-dashed border-transparent hover:border-[#1B4332]/30 transition-colors" />}
                </div>
              );
            })}
        </div>
        </SetSelectedIdContext.Provider>
        </SelectedIdContext.Provider>
        </AspectRatioContext.Provider>
        </EditContext.Provider>
      </main>
    </div>
  );
}
