/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Megaphone,
  Plus,
  Search,
  Trash2,
  Edit,
  Download,
  Calendar,
  DollarSign,
  TrendingUp,
  Target,
  CheckCircle,
  Clock,
  AlertTriangle,
  LayoutGrid,
  Layers
} from 'lucide-react';
import { Campaign, TeamMember, Task, UserRole, BusinessCategory, CampaignStatus } from '../types';
import CampaignCalendar from './CampaignCalendar';

interface CampaignsViewProps {
  campaigns: Campaign[];
  setCampaigns: React.Dispatch<React.SetStateAction<Campaign[]>>;
  members: TeamMember[];
  tasks: Task[];
  activeRole: UserRole;
  onExport: () => void;
}

export default function CampaignsView({
  campaigns,
  setCampaigns,
  members,
  tasks,
  activeRole,
  onExport,
}: CampaignsViewProps) {
  // View mode
  const [viewMode, setViewMode] = useState<'grid' | 'gantt' | 'calendar'>('grid');

  // Search and Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);

  // Form Fields
  const [formData, setFormData] = useState<Partial<Campaign>>({
    campaign_name: '',
    business_category: 'Nội thất',
    goal: '',
    start_date: '',
    end_date: '',
    owner: '',
    participants: [],
    task_ids: [],
    content_production: '',
    media_production: '',
    ads_deployment: '',
    seeding_deployment: '',
    estimated_budget: 0,
    actual_budget: 0,
    status: 'Lên kế hoạch',
    achieved_results: '',
    post_evaluation: '',
    improvement_proposals: ''
  });

  const isReadOnly = activeRole === 'Viewer';

  const openCreateModal = () => {
    setEditingCampaign(null);
    const today = new Date().toISOString().split('T')[0];
    const nextMonth = new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0];
    setFormData({
      campaign_name: '',
      business_category: 'Nội thất',
      goal: '',
      start_date: today,
      end_date: nextMonth,
      owner: members[0]?.id || '',
      participants: [],
      task_ids: [],
      content_production: 'Lên outline kịch bản chi tiết',
      media_production: 'Quay thô shophouse và dựng 3 clip',
      ads_deployment: 'Chạy target khu vực lân cận dự án',
      seeding_deployment: 'Seeding 10 group shophouse đầu tư',
      estimated_budget: 10000000,
      actual_budget: 0,
      status: 'Lên kế hoạch',
      achieved_results: '',
      post_evaluation: '',
      improvement_proposals: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setFormData({ ...campaign });
    setIsModalOpen(true);
  };

  const handleDeleteCampaign = (id: string) => {
    if (confirm(`Bạn có chắc muốn xóa chiến dịch ${id}?`)) {
      setCampaigns(prev => prev.filter(c => c.campaign_id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;

    if (editingCampaign) {
      setCampaigns(prev => prev.map(c => c.campaign_id === editingCampaign.campaign_id ? {
        ...c,
        ...formData,
        estimated_budget: Number(formData.estimated_budget) || 0,
        actual_budget: Number(formData.actual_budget) || 0
      } as Campaign : c));
    } else {
      const newCampaign: Campaign = {
        campaign_id: `CAM-${String(campaigns.length + 1).padStart(3, '0')}`,
        campaign_name: formData.campaign_name || '',
        business_category: formData.business_category as BusinessCategory || 'Nội thất',
        goal: formData.goal || '',
        start_date: formData.start_date || '',
        end_date: formData.end_date || '',
        owner: formData.owner || '',
        participants: formData.participants || [],
        task_ids: formData.task_ids || [],
        content_production: formData.content_production || '',
        media_production: formData.media_production || '',
        ads_deployment: formData.ads_deployment || '',
        seeding_deployment: formData.seeding_deployment || '',
        estimated_budget: Number(formData.estimated_budget) || 0,
        actual_budget: Number(formData.actual_budget) || 0,
        status: formData.status as CampaignStatus || 'Lên kế hoạch',
        achieved_results: formData.achieved_results || '',
        post_evaluation: formData.post_evaluation || '',
        improvement_proposals: formData.improvement_proposals || ''
      };
      setCampaigns(prev => [newCampaign, ...prev]);
    }
    setIsModalOpen(false);
  };

  const todayStr = new Date().toISOString().split('T')[0];

  // Filter Campaigns list
  const filteredCampaigns = campaigns.filter(c => {
    const isOverdue = c.status === 'Trễ hạn' || (c.end_date && c.end_date < todayStr && c.status !== 'Hoàn thành' && c.status !== 'Hủy' && c.status !== 'Tạm dừng');
    const matchesSearch = c.campaign_name.toLowerCase().includes(searchQuery.toLowerCase()) || c.goal.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || c.business_category === filterCategory;
    
    let matchesStatus = false;
    if (filterStatus === 'all') {
      matchesStatus = true;
    } else if (filterStatus === 'Trễ hạn') {
      matchesStatus = isOverdue;
    } else {
      matchesStatus = c.status === filterStatus;
    }

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const highRiskCampaigns = campaigns.filter(
    c => c.estimated_budget > 0 && (c.actual_budget || 0) > c.estimated_budget * 0.9
  );

  const categories: BusinessCategory[] = ['Nội thất', 'Phong thủy', 'Hàng hiệu', 'Thương hiệu chung'];
  const statuses: CampaignStatus[] = ['Lên kế hoạch', 'Đang triển khai', 'Chờ duyệt', 'Hoàn thành', 'Trễ hạn', 'Tạm dừng', 'Hủy'];

  // Gantt Date Processing Helpers
  const parseDateStr = (dateStr: string) => {
    if (!dateStr) return new Date();
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  };

  const getCampaignDatesRange = (cList: Campaign[]) => {
    if (cList.length === 0) {
      const today = new Date();
      const end = new Date();
      end.setDate(today.getDate() + 30);
      return { start: today, end };
    }
    
    let minTime = Infinity;
    let maxTime = -Infinity;
    
    cList.forEach(c => {
      if (c.start_date) {
        const t = parseDateStr(c.start_date).getTime();
        if (t < minTime) minTime = t;
      }
      if (c.end_date) {
        const t = parseDateStr(c.end_date).getTime();
        if (t > maxTime) maxTime = t;
      }
    });
    
    if (minTime === Infinity) minTime = Date.now();
    if (maxTime === -Infinity) maxTime = Date.now() + 86400000 * 30;
    
    // Pad for padding columns
    const start = new Date(minTime - 86400000 * 3);
    const end = new Date(maxTime + 86400000 * 3);
    
    return { start, end };
  };

  const { start: earliestDate, end: latestDate } = getCampaignDatesRange(filteredCampaigns);

  // Create days array
  const daysList: Date[] = [];
  const tempDate = new Date(earliestDate);
  let daysLimit = 0;
  while (tempDate <= latestDate && daysLimit < 120) {
    daysList.push(new Date(tempDate));
    tempDate.setDate(tempDate.getDate() + 1);
    daysLimit++;
  }

  // Helper to find index of a date string
  const getDayIndex = (dateStr: string) => {
    if (!dateStr) return -1;
    const targetDate = parseDateStr(dateStr);
    targetDate.setHours(0,0,0,0);
    
    for (let i = 0; i < daysList.length; i++) {
      const d = new Date(daysList[i]);
      d.setHours(0,0,0,0);
      if (d.getTime() === targetDate.getTime()) {
        return i;
      }
    }
    return -1;
  };

  // Find today's index if it lies in the range
  const getTodayIdx = () => {
    const today = new Date();
    today.setHours(0,0,0,0);
    
    for (let i = 0; i < daysList.length; i++) {
      const d = new Date(daysList[i]);
      d.setHours(0,0,0,0);
      if (d.getTime() === today.getTime()) {
        return i;
      }
    }
    return -1;
  };
  const todayIdx = getTodayIdx();

  const getStatusStyles = (status: CampaignStatus, isOverdue: boolean) => {
    if (isOverdue) {
      return {
        bar: 'bg-red-500/20 text-red-300 border border-red-500/35 hover:bg-red-500/30',
        progress: 'bg-red-500/20',
        dot: 'bg-red-500'
      };
    }
    switch (status) {
      case 'Lên kế hoạch':
        return {
          bar: 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30',
          progress: 'bg-amber-500/15',
          dot: 'bg-amber-500'
        };
      case 'Đang triển khai':
        return {
          bar: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/35 hover:bg-emerald-500/30',
          progress: 'bg-emerald-500/15',
          dot: 'bg-emerald-500'
        };
      case 'Chờ duyệt':
        return {
          bar: 'bg-sky-500/20 text-sky-300 border border-sky-500/30 hover:bg-sky-500/30',
          progress: 'bg-sky-500/15',
          dot: 'bg-sky-500'
        };
      case 'Hoàn thành':
        return {
          bar: 'bg-slate-700/20 text-slate-300 border border-slate-700/30 hover:bg-slate-700/35',
          progress: 'bg-slate-700/15',
          dot: 'bg-slate-400'
        };
      case 'Tạm dừng':
      case 'Hủy':
        return {
          bar: 'bg-slate-800/40 text-slate-500 border border-slate-800/60 hover:bg-slate-850/40',
          progress: 'bg-slate-800/20',
          dot: 'bg-slate-600'
        };
      default:
        return {
          bar: 'bg-slate-800/30 text-slate-300 border border-slate-800/40 hover:bg-slate-800/45',
          progress: 'bg-slate-800/15',
          dot: 'bg-slate-500'
        };
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-transparent text-slate-100 p-6">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-amber-500 font-bold text-xs uppercase tracking-widest mb-1">
            <Megaphone className="w-4 h-4" />
            <span>FUGALO MARKETING CAMPAIGNS</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">CHIẾN DỊCH TRUYỀN THÔNG NỘI BỘ</h1>
          <p className="text-xs text-slate-400 mt-1">Phối hợp chiến dịch thương mại cho các dòng dịch vụ: Nội thất biệt thự, Bát tự tài lộc, Thu mua hàng hiệu ký gửi</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Toggle */}
          <div className="bg-slate-950 border border-slate-800 p-1 rounded-lg flex items-center gap-1 shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition duration-150 cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Dạng lưới</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition duration-150 cursor-pointer ${
                viewMode === 'calendar'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Lịch tháng</span>
            </button>
            <button
              onClick={() => setViewMode('gantt')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition duration-150 cursor-pointer ${
                viewMode === 'gantt'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Biểu đồ Gantt</span>
            </button>
          </div>

          <button
            onClick={onExport}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#F4F5FA] border border-[#E6E6E8] rounded-lg text-xs font-bold text-[#2F2B3D] transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#2F2B3D]" />
            <span>Xuất Chiến Dịch</span>
          </button>

          {!isReadOnly && (
            <button
              onClick={openCreateModal}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-extrabold shadow-md transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Khởi Tạo Chiến Dịch</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Tìm theo tên chiến dịch, mục tiêu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
          />
        </div>

        <div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-semibold text-slate-300 focus:outline-none"
          >
            <option value="all">Tất cả mảng dịch vụ</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-semibold text-slate-300 focus:outline-none"
          >
            <option value="all">Tất cả trạng thái</option>
            {statuses.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Global High Risk Budget Alert */}
      {highRiskCampaigns.length > 0 && (
        <div className="mt-6 p-4 rounded-xl bg-red-950/20 border border-red-500/30 text-red-200 animate-fade-in flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-red-500/10 rounded-lg text-red-400 shrink-0">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-red-400">HỆ THỐNG CẢNH BÁO TIẾN ĐỘ NGÂN SÁCH</h4>
              <p className="text-xs text-slate-300 mt-1 font-semibold leading-relaxed">
                Phát hiện <strong className="text-red-400">{highRiskCampaigns.length} chiến dịch</strong> có mức thực chi vượt ngưỡng an toàn (<strong className="text-red-400">&gt; 90%</strong> so với ngân sách dự kiến). Vui lòng rà soát và điều chỉnh kế kế hoạch chi tiêu để bảo đảm an toàn tài chính.
              </p>
              <div className="flex flex-wrap gap-2 mt-2.5">
                {highRiskCampaigns.map(hc => (
                  <span key={hc.campaign_id} className="text-[10px] bg-red-500/10 border border-red-500/20 text-red-300 px-2 py-1 rounded font-bold">
                    📌 {hc.campaign_name}: {Math.round((hc.actual_budget / hc.estimated_budget) * 100)}% ({hc.actual_budget.toLocaleString('vi-VN')} / {hc.estimated_budget.toLocaleString('vi-VN')} đ)
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic view rendering: Grid vs Gantt */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {filteredCampaigns.length === 0 ? (
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-8 text-center text-slate-500 font-semibold rounded-xl">
              Không tìm thấy chiến dịch nào hoạt động.
            </div>
          ) : (
            filteredCampaigns.map((c) => {
              const leader = members.find(m => m.id === c.owner);
              const associatedTasks = tasks.filter(t => t.task_name.toLowerCase().includes(c.campaign_name.toLowerCase()) || t.description.toLowerCase().includes(c.campaign_name.toLowerCase()));
              const completedCount = associatedTasks.filter(t => t.status === 'Hoàn thành').length;

              return (
                <div key={c.campaign_id} className={`bg-slate-900 border ${
                  c.status === 'Trễ hạn' || (c.end_date && c.end_date < todayStr && c.status !== 'Hoàn thành' && c.status !== 'Hủy' && c.status !== 'Tạm dừng')
                    ? 'border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.1)]'
                    : 'border-slate-800'
                } rounded-2xl p-5 hover:border-slate-700 transition flex flex-col justify-between`}>
                  <div>
                    {/* Campaign Header */}
                    <div className="flex items-start justify-between border-b border-slate-850 pb-3 mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] bg-slate-950 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                            Mảng: {c.business_category}
                          </span>
                          {(c.status === 'Trễ hạn' || (c.end_date && c.end_date < todayStr && c.status !== 'Hoàn thành' && c.status !== 'Hủy' && c.status !== 'Tạm dừng')) && (
                            <span className="text-[9px] bg-red-950 text-red-500 border border-red-500/30 px-2 py-0.5 rounded-full font-black uppercase tracking-wider inline-flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-red-500 animate-pulse" />
                              <span>Trễ hạn</span>
                            </span>
                          )}
                        </div>
                        <h3 className={`text-sm font-black mt-1.5 ${
                          c.status === 'Trễ hạn' || (c.end_date && c.end_date < todayStr && c.status !== 'Hoàn thành' && c.status !== 'Hủy' && c.status !== 'Tạm dừng')
                            ? 'text-red-400'
                            : 'text-white'
                        }`}>{c.campaign_name}</h3>
                        <p className="text-[10px] text-slate-400 mt-1">📅 Thời hạn: <strong className={
                          c.status === 'Trễ hạn' || (c.end_date && c.end_date < todayStr && c.status !== 'Hoàn thành' && c.status !== 'Hủy' && c.status !== 'Tạm dừng')
                            ? 'text-red-400'
                            : 'text-slate-300'
                        }>{c.start_date} ~ {c.end_date}</strong></p>
                      </div>

                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-flex items-center gap-1 ${
                        c.status === 'Trễ hạn' || (c.end_date && c.end_date < todayStr && c.status !== 'Hoàn thành' && c.status !== 'Hủy' && c.status !== 'Tạm dừng')
                          ? 'bg-red-500/15 text-red-500 border border-red-500/30 font-black animate-pulse'
                          : c.status === 'Đang triển khai'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : c.status === 'Lên kế hoạch'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-slate-950 text-slate-500 border border-slate-850'
                      }`}>
                        {(c.status === 'Trễ hạn' || (c.end_date && c.end_date < todayStr && c.status !== 'Hoàn thành' && c.status !== 'Hủy' && c.status !== 'Tạm dừng')) && <AlertTriangle className="w-3.5 h-3.5 text-red-500" />}
                        {c.status === 'Trễ hạn' || (c.end_date && c.end_date < todayStr && c.status !== 'Hoàn thành' && c.status !== 'Hủy' && c.status !== 'Tạm dừng') ? 'Trễ hạn' : c.status}
                      </span>
                    </div>

                    {/* Core Goal & Budget */}
                    <div className="space-y-3 mb-4 text-xxs">
                      <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-850">
                        <span className="font-extrabold text-amber-500 uppercase tracking-wide block mb-1">Mục tiêu chiến dịch</span>
                        <p className="text-slate-300 leading-relaxed font-semibold">{c.goal}</p>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-slate-950/40 p-2 border border-slate-850 rounded">
                          <span className="text-slate-500 block text-[9px]">Kinh phí dự kiến</span>
                          <strong className="text-white text-[11px] font-black">{(c.estimated_budget || 0).toLocaleString('vi-VN')} đ</strong>
                        </div>
                        <div className="bg-slate-950/40 p-2 border border-slate-850 rounded">
                          <span className="text-slate-500 block text-[9px]">Thực chi tế</span>
                          <strong className="text-white text-[11px] font-black">{(c.actual_budget || 0).toLocaleString('vi-VN')} đ</strong>
                        </div>
                        <div className="bg-slate-950/40 p-2 border border-slate-850 rounded">
                          <span className="text-slate-500 block text-[9px]">Chỉ huy chính</span>
                          <strong className="text-amber-500 text-[11px] font-black truncate block">{leader?.name || c.owner}</strong>
                        </div>
                      </div>

                      {/* Thẻ Cảnh báo Ngân sách */}
                      <div className={`p-2.5 rounded-xl border flex items-center justify-between transition-colors ${
                        (c.actual_budget || 0) > (c.estimated_budget || 0) * 0.9
                          ? 'bg-red-950/40 border-red-500/50 text-red-400'
                          : 'bg-emerald-950/20 border-emerald-800/40 text-emerald-400'
                      }`}>
                        <div className="flex items-center gap-2">
                          <AlertTriangle className={`w-4 h-4 ${
                            (c.actual_budget || 0) > (c.estimated_budget || 0) * 0.9 ? 'text-red-500 animate-bounce' : 'text-emerald-500'
                          }`} />
                          <div className="text-left">
                            <span className="font-extrabold text-[10px] uppercase block tracking-wider">Cảnh báo Ngân sách</span>
                            <span className="text-[9px] opacity-80 block">
                              {(c.actual_budget || 0) > (c.estimated_budget || 0) * 0.9
                                ? 'Ngân sách thực chi đã vượt 90% hạn mức!'
                                : 'Chi tiêu an toàn dưới 90% ngân sách.'}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-black">
                            {c.estimated_budget > 0 ? Math.round(((c.actual_budget || 0) / c.estimated_budget) * 100) : 0}%
                          </span>
                          <span className="block text-[7px] uppercase font-bold opacity-60">Đã tiêu</span>
                        </div>
                      </div>
                    </div>

                    {/* Operational deployments */}
                    <div className="space-y-2 border-t border-slate-850/60 pt-3 text-xxs">
                      <span className="font-black text-slate-400 uppercase tracking-wide block">Kế hoạch triển khai kỹ thuật</span>
                      <div className="grid grid-cols-2 gap-2 text-xxs font-semibold">
                        <div className="p-2 bg-slate-950/20 rounded">
                          <span className="text-slate-500 block">Dựng Content:</span>
                          <span className="text-slate-200">{c.content_production || 'N/A'}</span>
                        </div>
                        <div className="p-2 bg-slate-950/20 rounded">
                          <span className="text-slate-500 block">Media Quay/Chụp:</span>
                          <span className="text-slate-200">{c.media_production || 'N/A'}</span>
                        </div>
                        <div className="p-2 bg-slate-950/20 rounded">
                          <span className="text-slate-500 block">Kế hoạch Ads:</span>
                          <span className="text-slate-200">{c.ads_deployment || 'N/A'}</span>
                        </div>
                        <div className="p-2 bg-slate-950/20 rounded">
                          <span className="text-slate-500 block">Seeding/Tương tác:</span>
                          <span className="text-slate-200">{c.seeding_deployment || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Associated Task Status Progress */}
                    {associatedTasks.length > 0 && (
                      <div className="mt-4 bg-slate-950/30 p-2.5 rounded-xl border border-slate-850 text-xxs">
                        <div className="flex justify-between text-slate-400">
                          <span>Tiến độ Task nội bộ liên quan:</span>
                          <strong className="text-amber-500">{completedCount}/{associatedTasks.length} hoàn thành</strong>
                        </div>
                        <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden mt-1.5">
                          <div
                            style={{ width: `${(completedCount / associatedTasks.length) * 100}%` }}
                            className="h-full bg-emerald-400 rounded-full"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Controls */}
                  <div className="flex items-center justify-between border-t border-slate-850 mt-4 pt-3 text-[10px] text-slate-500">
                    <span className="font-mono text-slate-600 font-semibold">ID: {c.campaign_id}</span>
                    
                    {!isReadOnly && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openEditModal(c)}
                          className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-[#F4F5FA] border border-[#E6E6E8] text-[#2F2B3D] font-bold rounded transition cursor-pointer"
                        >
                          <Edit className="w-3 h-3 text-[#2F2B3D]" />
                          <span>Sửa</span>
                        </button>
                        <button
                          onClick={() => handleDeleteCampaign(c.campaign_id)}
                          className="flex items-center gap-1 px-2.5 py-1 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-bold rounded transition cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3 text-red-600" />
                          <span>Xóa</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : viewMode === 'calendar' ? (
        <CampaignCalendar
          campaigns={filteredCampaigns}
          members={members}
          tasks={tasks}
          onEditCampaign={openEditModal}
        />
      ) : (
        /* Gantt Chart View */
        <div className="mt-6 flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl animate-fade-in">
          {filteredCampaigns.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 p-8 text-center text-slate-500 font-semibold rounded-xl">
              Không tìm thấy chiến dịch nào hoạt động để vẽ biểu đồ Gantt.
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <div style={{ minWidth: `${280 + daysList.length * 40}px` }} className="flex flex-col">
                {/* Gantt Timeline Header */}
                <div className="flex h-16 bg-slate-950 border-b border-slate-800 shrink-0">
                  <div className="w-72 shrink-0 border-r border-slate-800 bg-slate-950 p-4 font-black text-xs uppercase tracking-wider text-slate-400 flex items-center sticky left-0 z-20">
                    Tên chiến dịch
                  </div>
                  <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${daysList.length}, minmax(40px, 1fr))` }}>
                    {daysList.map((day, idx) => {
                      const isFirstDayOfMonth = day.getDate() === 1;
                      const isFirstCol = idx === 0;
                      const isToday = todayIdx === idx;
                      const isWeekEnd = day.getDay() === 0 || day.getDay() === 6;
                      
                      return (
                        <div 
                          key={idx} 
                          className={`flex flex-col justify-between py-1 px-0.5 text-center border-r border-slate-900/40 transition shrink-0 ${
                            isToday ? 'bg-amber-500/10' : isWeekEnd ? 'bg-slate-950/45' : ''
                          }`}
                        >
                          {/* Month Banner */}
                          <div className="h-4 text-[9px] font-black text-amber-500 uppercase tracking-tight">
                            {isFirstDayOfMonth || isFirstCol ? `${day.getDate() === 1 ? 'Mùng 1 ' : ''}T${day.getMonth() + 1}/${day.getFullYear().toString().slice(-2)}` : ''}
                          </div>
                          
                          {/* Day Number */}
                          <div className={`text-xs font-black leading-none ${isToday ? 'text-amber-400 scale-110' : isWeekEnd ? 'text-red-400' : 'text-slate-100'}`}>
                            {day.getDate()}
                          </div>
                          
                          {/* Day of Week */}
                          <div className={`text-[8px] font-bold uppercase ${isWeekEnd ? 'text-red-500/80' : 'text-slate-500'}`}>
                            {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][day.getDay()]}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Gantt Rows */}
                <div className="divide-y divide-slate-800/50">
                  {filteredCampaigns.map((c) => {
                    const leader = members.find(m => m.id === c.owner);
                    const associatedTasks = tasks.filter(t => t.task_name.toLowerCase().includes(c.campaign_name.toLowerCase()) || t.description.toLowerCase().includes(c.campaign_name.toLowerCase()));
                    const completedCount = associatedTasks.filter(t => t.status === 'Hoàn thành').length;
                    const progressPercent = associatedTasks.length > 0 
                      ? Math.round((completedCount / associatedTasks.length) * 100) 
                      : 0;

                    const isOverdue = c.status === 'Trễ hạn' || (c.end_date && c.end_date < todayStr && c.status !== 'Hoàn thành' && c.status !== 'Hủy' && c.status !== 'Tạm dừng');
                    const styles = getStatusStyles(c.status, isOverdue);

                    // Find grid columns bounds
                    let sIdx = getDayIndex(c.start_date);
                    let eIdx = getDayIndex(c.end_date);

                    // Cap columns gracefully if they overflow the dynamic day bounds
                    if (sIdx === -1) {
                      const tStart = parseDateStr(c.start_date).getTime();
                      sIdx = tStart < daysList[0].getTime() ? 0 : daysList.length - 1;
                    }
                    if (eIdx === -1) {
                      const tEnd = parseDateStr(c.end_date).getTime();
                      eIdx = tEnd > daysList[daysList.length - 1].getTime() ? daysList.length - 1 : 0;
                    }

                    // Just in case indices are reversed due to bad data
                    if (sIdx > eIdx) {
                      const temp = sIdx;
                      sIdx = eIdx;
                      eIdx = temp;
                    }

                    return (
                      <div key={c.campaign_id} className="flex h-16 hover:bg-slate-850/10 transition duration-150">
                        {/* Pinned Campaign Info Panel */}
                        <div className="w-72 shrink-0 border-r border-slate-800 bg-slate-900/95 p-3 sticky left-0 z-10 flex flex-col justify-between">
                          <div className="truncate">
                            <div className="flex items-center gap-1.5 mb-1 text-[10px] text-slate-400">
                              <span className="px-1.5 py-0.2 bg-slate-950 text-amber-500 border border-amber-500/20 rounded text-[8px] font-bold uppercase">
                                {c.business_category}
                              </span>
                              <span className="truncate">
                                ID: <strong>{c.campaign_id}</strong>
                              </span>
                            </div>
                            <h4 className="text-xs font-black text-white truncate" title={c.campaign_name}>
                              {c.campaign_name}
                            </h4>
                          </div>
                          <div className="flex items-center justify-between text-[9.5px] text-slate-400 border-t border-slate-850 pt-1 mt-1">
                            <span className="font-medium text-slate-500">Chỉ huy: <strong className="text-slate-300">{leader?.name || c.owner}</strong></span>
                            <span className="font-extrabold text-amber-500">{progressPercent}% ({completedCount}/{associatedTasks.length})</span>
                          </div>
                        </div>

                        {/* Scrolling Gantt Timeline Row */}
                        <div className="flex-1 relative grid" style={{ gridTemplateColumns: `repeat(${daysList.length}, minmax(40px, 1fr))` }}>
                          {/* Vertical lines grid paper background */}
                          {daysList.map((_, idx) => (
                            <div 
                              key={idx} 
                              className={`border-r border-slate-800/20 h-full ${
                                todayIdx === idx ? 'bg-amber-500/5' : ''
                              }`} 
                            />
                          ))}

                          {/* Today line marker */}
                          {todayIdx !== -1 && (
                            <div 
                              className="absolute top-0 bottom-0 border-l border-amber-500/40 z-10 pointer-events-none"
                              style={{ 
                                left: `calc(${(todayIdx / daysList.length) * 100}% + 20px)` 
                              }}
                            />
                          )}

                          {/* The Gantt Progress Bar */}
                          <div 
                            style={{ 
                              gridColumnStart: sIdx + 1, 
                              gridColumnEnd: eIdx + 2 
                            }}
                            className={`self-center h-8 mx-1 rounded-lg relative overflow-hidden flex items-center justify-between px-3 text-[10px] font-bold shadow-md transition-all duration-150 group cursor-pointer ${styles.bar}`}
                            title={`${c.campaign_name}\n• Thời hạn: ${c.start_date} ~ ${c.end_date}\n• Trạng thái: ${c.status}${isOverdue ? ' (Trễ hạn)' : ''}\n• Tiến độ: ${completedCount}/${associatedTasks.length} nhiệm vụ hoàn thành (${progressPercent}%)\n• Dự kiến: ${(c.estimated_budget || 0).toLocaleString('vi-VN')} đ | Thực tế: ${(c.actual_budget || 0).toLocaleString('vi-VN')} đ`}
                          >
                            {/* Inner task completion progress background track */}
                            <div 
                              style={{ width: `${progressPercent}%` }} 
                              className={`absolute left-0 top-0 bottom-0 -z-10 transition-all duration-300 ${styles.progress}`} 
                            />

                            {/* Content inside the bar (hidden on extremely short bars) */}
                            <div className="flex items-center gap-1.5 truncate z-10 pr-2">
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${styles.dot}`} />
                              <span className="truncate">
                                {c.campaign_name}
                              </span>
                            </div>
                            
                            <span className="text-[9.5px] opacity-95 font-black shrink-0 z-10">
                              {progressPercent}%
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Campaign CRUD Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white border border-[#E6E6E8] rounded-2xl max-w-3xl w-full p-6 text-[#2F2B3D] shadow-[0_10px_30px_rgba(47,43,61,0.2)]">
            <h3 className="text-base font-black text-[#2F2B3D] uppercase tracking-wide border-b border-[#E6E6E8] pb-3 mb-4">
              {editingCampaign ? 'Cập Nhật Chiến Dịch Truyền Thông' : 'Khởi Tạo Chiến Dịch Nội Bộ'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xxs text-[#5D596C] font-extrabold uppercase block mb-1">Tên chiến dịch</label>
                  <input
                    type="text"
                    value={formData.campaign_name}
                    onChange={(e) => setFormData({ ...formData, campaign_name: e.target.value })}
                    className="w-full bg-[#F8F9FA] border border-[#E6E6E8] rounded px-2.5 py-1.5 text-xs text-[#2F2B3D] font-bold focus:outline-none focus:border-[#E04B1C] transition"
                    placeholder="e.g. Chiến dịch khai trương Shophouse Phúc Đạt"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xxs text-[#5D596C] font-extrabold uppercase block mb-1">Mục tiêu chiến dịch và KPI đầu ra</label>
                <textarea
                  value={formData.goal}
                  onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                  className="w-full bg-[#F8F9FA] border border-[#E6E6E8] rounded p-2 text-xs text-[#2F2B3D] focus:outline-none focus:border-[#E04B1C] transition"
                  rows={2}
                  placeholder="e.g. Thu hút 50 khách hàng đăng ký trải nghiệm spa túi hiệu tại showroom..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xxs text-[#5D596C] font-extrabold uppercase block mb-1">Mảng dịch vụ chuyên trách</label>
                  <select
                    value={formData.business_category}
                    onChange={(e) => setFormData({ ...formData, business_category: e.target.value as any })}
                    className="w-full bg-[#F8F9FA] border border-[#E6E6E8] rounded px-2 py-1.5 text-xs text-[#2F2B3D] focus:outline-none focus:border-[#E04B1C] transition"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xxs text-[#5D596C] font-extrabold uppercase block mb-1">Chỉ huy chính (Owner)</label>
                  <select
                    value={formData.owner}
                    onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                    className="w-full bg-[#F8F9FA] border border-[#E6E6E8] rounded px-2 py-1.5 text-xs text-[#2F2B3D] focus:outline-none focus:border-[#E04B1C] transition"
                    required
                  >
                    {members.map(m => (
                      <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xxs text-[#5D596C] font-extrabold uppercase block mb-1">Ngày bắt đầu</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full bg-[#F8F9FA] border border-[#E6E6E8] rounded px-2.5 py-1.5 text-xs text-[#2F2B3D] font-mono focus:outline-none focus:border-[#E04B1C] transition"
                    required
                  />
                </div>

                <div>
                  <label className="text-xxs text-[#5D596C] font-extrabold uppercase block mb-1">Ngày kết thúc</label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full bg-[#F8F9FA] border border-[#E6E6E8] rounded px-2.5 py-1.5 text-xs text-[#2F2B3D] font-mono focus:outline-none focus:border-[#E04B1C] transition"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xxs text-[#5D596C] font-extrabold uppercase block mb-1">Mục tiêu Content</label>
                  <input
                    type="text"
                    value={formData.content_production}
                    onChange={(e) => setFormData({ ...formData, content_production: e.target.value })}
                    className="w-full bg-[#F8F9FA] border border-[#E6E6E8] rounded px-2.5 py-1.5 text-xs text-[#2F2B3D] focus:outline-none focus:border-[#E04B1C] transition"
                    placeholder="Viết kịch bản, làm caption..."
                  />
                </div>

                <div>
                  <label className="text-xxs text-[#5D596C] font-extrabold uppercase block mb-1">Mục tiêu Media Quay/Chụp</label>
                  <input
                    type="text"
                    value={formData.media_production}
                    onChange={(e) => setFormData({ ...formData, media_production: e.target.value })}
                    className="w-full bg-[#F8F9FA] border border-[#E6E6E8] rounded px-2.5 py-1.5 text-xs text-[#2F2B3D] focus:outline-none focus:border-[#E04B1C] transition"
                    placeholder="Quay thô, dựng video..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xxs text-[#5D596C] font-extrabold uppercase block mb-1">Ngân sách dự kiến (VND)</label>
                  <input
                    type="number"
                    value={formData.estimated_budget}
                    onChange={(e) => setFormData({ ...formData, estimated_budget: Number(e.target.value) })}
                    className="w-full bg-[#F8F9FA] border border-[#E6E6E8] rounded px-2.5 py-1.5 text-xs text-[#2F2B3D] font-bold focus:outline-none focus:border-[#E04B1C] transition"
                    min="0"
                  />
                </div>

                <div>
                  <label className="text-xxs text-[#5D596C] font-extrabold uppercase block mb-1">Ngân sách thực chi (VND)</label>
                  <input
                    type="number"
                    value={formData.actual_budget}
                    onChange={(e) => setFormData({ ...formData, actual_budget: Number(e.target.value) })}
                    className="w-full bg-[#F8F9FA] border border-[#E6E6E8] rounded px-2.5 py-1.5 text-xs text-[#2F2B3D] font-bold focus:outline-none focus:border-[#E04B1C] transition"
                    min="0"
                  />
                </div>

                <div>
                  <label className="text-xxs text-[#5D596C] font-extrabold uppercase block mb-1">Trạng thái chiến dịch</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-[#F8F9FA] border border-[#E6E6E8] rounded px-2 py-1.5 text-xs text-[#2F2B3D] focus:outline-none focus:border-[#E04B1C] transition"
                  >
                    {statuses.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Reactive Live Budget Alert in Modal */}
              {formData.estimated_budget > 0 && formData.actual_budget > formData.estimated_budget * 0.9 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 flex items-center gap-2.5 mt-2 animate-fade-in">
                  <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
                  <div className="text-left">
                    <span className="font-extrabold text-[10px] uppercase block tracking-wider text-red-700">Cảnh báo Vượt ngưỡng Ngân sách</span>
                    <span className="text-[10px] text-red-600 block leading-tight">
                      Ngân sách thực chi ({(formData.actual_budget || 0).toLocaleString('vi-VN')} đ) đã đạt {Math.round((formData.actual_budget / formData.estimated_budget) * 100)}% so với dự kiến! Trạng thái cảnh báo màu đỏ đã kích hoạt.
                    </span>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t border-[#E6E6E8]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-[#F4F5FA] hover:bg-[#E6E6E8] text-[#2F2B3D]/80 border border-[#E6E6E8] font-bold rounded-lg text-xs transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#E04B1C] hover:bg-[#C53A0F] text-white font-extrabold rounded-lg text-xs shadow-md transition"
                >
                  Khởi Tạo Chiến Dịch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
