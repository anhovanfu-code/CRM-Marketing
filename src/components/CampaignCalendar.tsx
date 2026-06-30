/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  DollarSign,
  Target,
  AlertTriangle,
  FileText,
  Info,
  CheckCircle,
  Clock,
  PieChart,
  User,
  ArrowRight
} from 'lucide-react';
import { Campaign, TeamMember, Task, BusinessCategory, CampaignStatus } from '../types';

interface CampaignCalendarProps {
  campaigns: Campaign[];
  members: TeamMember[];
  tasks: Task[];
  onEditCampaign: (campaign: Campaign) => void;
}

export default function CampaignCalendar({
  campaigns,
  members,
  tasks,
  onEditCampaign,
}: CampaignCalendarProps) {
  // We default our calendar view to June 2026, which contains all the mock campaigns data
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 5, 1));
  const [selectedDateStr, setSelectedDateStr] = useState<string>('2026-06-26'); // Defaults to June 26, 2026 (the active target date)

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0-indexed

  // Helper to format Date to YYYY-MM-DD
  const formatDateStr = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  // Move to previous month
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  // Move to next month
  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // Reset to June 2026 (active campaign period)
  const handleResetToJune = () => {
    setCurrentDate(new Date(2026, 5, 1));
    setSelectedDateStr('2026-06-26');
  };

  // Helper to get day index where Monday is 0, Sunday is 6
  const getDayOfWeekIndex = (date: Date) => {
    const day = date.getDay(); // 0 is Sun, 1 is Mon, etc.
    return day === 0 ? 6 : day - 1;
  };

  // Calculate grid days
  const calendarGridDays = useMemo(() => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayIndex = getDayOfWeekIndex(new Date(currentYear, currentMonth, 1));
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const grid: { date: Date; isCurrentMonth: boolean; key: string }[] = [];

    // Prev month padding days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const prevDate = new Date(currentYear, currentMonth - 1, daysInPrevMonth - i);
      grid.push({
        date: prevDate,
        isCurrentMonth: false,
        key: `prev-${prevDate.getDate()}`,
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const currDate = new Date(currentYear, currentMonth, i);
      grid.push({
        date: currDate,
        isCurrentMonth: true,
        key: `curr-${i}`,
      });
    }

    // Next month padding days to make it full 6 weeks (42 cells) or 5 weeks (35 cells)
    const remainingCells = grid.length <= 35 ? 35 - grid.length : 42 - grid.length;
    for (let i = 1; i <= remainingCells; i++) {
      const nextDate = new Date(currentYear, currentMonth + 1, i);
      grid.push({
        date: nextDate,
        isCurrentMonth: false,
        key: `next-${i}`,
      });
    }

    return grid;
  }, [currentYear, currentMonth]);

  // Compute start and end of selected month for report boundaries
  const firstDayStr = useMemo(() => {
    return formatDateStr(new Date(currentYear, currentMonth, 1));
  }, [currentYear, currentMonth]);

  const lastDayStr = useMemo(() => {
    return formatDateStr(new Date(currentYear, currentMonth + 1, 0));
  }, [currentYear, currentMonth]);

  // Filter campaigns overlapping with current selected month
  const monthCampaigns = useMemo(() => {
    return campaigns.filter(c => {
      // Overlaps if campaign starts before or on last day, and ends after or on first day
      return c.start_date <= lastDayStr && c.end_date >= firstDayStr;
    });
  }, [campaigns, firstDayStr, lastDayStr]);

  // Monthly Report Calculations
  const monthlyMetrics = useMemo(() => {
    const totalCount = monthCampaigns.length;
    let totalEstimatedBudget = 0;
    let totalActualBudget = 0;
    let highRiskCount = 0;
    let overdueCount = 0;

    const statusCounts: Record<string, number> = {
      'Lên kế hoạch': 0,
      'Đang triển khai': 0,
      'Chờ duyệt': 0,
      'Hoàn thành': 0,
      'Tạm dừng': 0,
      'Trễ hạn': 0,
      'Hủy': 0,
    };

    monthCampaigns.forEach(c => {
      totalEstimatedBudget += c.estimated_budget || 0;
      totalActualBudget += c.actual_budget || 0;

      // Status aggregation
      if (statusCounts[c.status] !== undefined) {
        statusCounts[c.status]++;
      }

      // Budget check (> 90%)
      if (c.estimated_budget > 0 && (c.actual_budget || 0) > c.estimated_budget * 0.9) {
        highRiskCount++;
      }

      // Overdue check
      const todayStr = '2026-06-26'; // Stable context today
      const isOverdue = c.status === 'Trễ hạn' || (c.end_date && c.end_date < todayStr && c.status !== 'Hoàn thành' && c.status !== 'Hủy' && c.status !== 'Tạm dừng');
      if (isOverdue) {
        overdueCount++;
      }
    });

    const avgDisbursementRate = totalEstimatedBudget > 0 
      ? Math.round((totalActualBudget / totalEstimatedBudget) * 100) 
      : 0;

    return {
      totalCount,
      totalEstimatedBudget,
      totalActualBudget,
      highRiskCount,
      overdueCount,
      statusCounts,
      avgDisbursementRate,
    };
  }, [monthCampaigns]);

  // Selected Day Active Campaigns
  const selectedDayCampaigns = useMemo(() => {
    return campaigns.filter(c => {
      return c.start_date <= selectedDateStr && selectedDateStr <= c.end_date;
    });
  }, [campaigns, selectedDateStr]);

  // Color mapper helper for business categories
  const getCategoryColor = (category: BusinessCategory) => {
    switch (category) {
      case 'Nội thất':
        return {
          bg: 'bg-amber-500/10 hover:bg-amber-500/15',
          border: 'border-amber-500/30',
          text: 'text-amber-400',
          badge: 'bg-amber-500 text-slate-950',
          bullet: 'bg-amber-500',
        };
      case 'Phong thủy':
        return {
          bg: 'bg-rose-500/10 hover:bg-rose-500/15',
          border: 'border-rose-500/30',
          text: 'text-rose-400',
          badge: 'bg-rose-500 text-white',
          bullet: 'bg-rose-500',
        };
      case 'Hàng hiệu':
        return {
          bg: 'bg-violet-500/10 hover:bg-violet-500/15',
          border: 'border-violet-500/30',
          text: 'text-violet-400',
          badge: 'bg-violet-500 text-white',
          bullet: 'bg-violet-500',
        };
      default:
        return {
          bg: 'bg-slate-500/10 hover:bg-slate-500/15',
          border: 'border-slate-500/30',
          text: 'text-slate-300',
          badge: 'bg-slate-500 text-white',
          bullet: 'bg-slate-400',
        };
    }
  };

  const getStatusBadgeClass = (status: CampaignStatus) => {
    switch (status) {
      case 'Hoàn thành':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30';
      case 'Đang triển khai':
        return 'bg-sky-500/10 text-sky-400 border border-sky-500/30';
      case 'Chờ duyệt':
        return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30';
      case 'Trễ hạn':
        return 'bg-red-500/15 text-red-400 border border-red-500/40 animate-pulse';
      case 'Tạm dừng':
        return 'bg-slate-700/25 text-slate-400 border border-slate-700/30';
      default:
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/30';
    }
  };

  return (
    <div className="space-y-6 mt-6 animate-fade-in">
      
      {/* 1. Quick Report Summary Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Campaigns */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xxs text-slate-400 font-extrabold uppercase tracking-wider">Chiến dịch trong tháng</span>
            <div className="p-1.5 bg-slate-950 rounded-lg text-amber-500 border border-amber-500/20">
              <CalendarIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-2xl font-black text-white">{monthlyMetrics.totalCount}</h3>
            <p className="text-[10px] text-slate-400 mt-1 font-semibold flex items-center gap-1.5 flex-wrap">
              <span className="text-emerald-400 font-bold">{monthlyMetrics.statusCounts['Đang triển khai']} Đang chạy</span>
              <span>•</span>
              <span className="text-amber-400 font-bold">{monthlyMetrics.statusCounts['Lên kế hoạch']} Kế hoạch</span>
              <span>•</span>
              <span className="text-slate-500">{monthlyMetrics.statusCounts['Hoàn thành']} Xong</span>
            </p>
          </div>
        </div>

        {/* Card 2: Estimated Budget */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xxs text-slate-400 font-extrabold uppercase tracking-wider">Tổng ngân sách dự toán</span>
            <div className="p-1.5 bg-slate-950 rounded-lg text-emerald-500 border border-emerald-500/20">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-2xl font-black text-emerald-400">
              {monthlyMetrics.totalEstimatedBudget.toLocaleString('vi-VN')} <span className="text-xs font-normal">đ</span>
            </h3>
            <p className="text-[10px] text-slate-400 mt-1 font-semibold">
              Bình quân: {monthlyMetrics.totalCount > 0 ? Math.round(monthlyMetrics.totalEstimatedBudget / monthlyMetrics.totalCount).toLocaleString('vi-VN') : 0} đ / chiến dịch
            </p>
          </div>
        </div>

        {/* Card 3: Actual Budget & Disbursement */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xxs text-slate-400 font-extrabold uppercase tracking-wider">Tổng thực tế chi tiêu</span>
            <div className="p-1.5 bg-slate-950 rounded-lg text-sky-500 border border-sky-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline justify-between">
              <h3 className="text-2xl font-black text-sky-400">
                {monthlyMetrics.totalActualBudget.toLocaleString('vi-VN')} <span className="text-xs font-normal">đ</span>
              </h3>
              <span className="text-xxs font-black text-amber-500 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded">
                Đã tiêu {monthlyMetrics.avgDisbursementRate}%
              </span>
            </div>
            {/* Simple progress bar */}
            <div className="w-full bg-slate-950 h-1.5 rounded-full mt-2.5 overflow-hidden border border-slate-850">
              <div 
                className="bg-sky-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, monthlyMetrics.avgDisbursementRate)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 4: Financial Risks / Overdues */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xxs text-slate-400 font-extrabold uppercase tracking-wider">Cảnh báo rủi ro tài chính</span>
            <div className={`p-1.5 rounded-lg border ${
              monthlyMetrics.highRiskCount > 0 || monthlyMetrics.overdueCount > 0 
                ? 'bg-red-500/10 text-red-500 border-red-500/20' 
                : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
            }`}>
              <AlertTriangle className={`w-4 h-4 ${monthlyMetrics.highRiskCount > 0 || monthlyMetrics.overdueCount > 0 ? 'animate-pulse' : ''}`} />
            </div>
          </div>
          <div className="mt-2">
            {monthlyMetrics.highRiskCount > 0 || monthlyMetrics.overdueCount > 0 ? (
              <div>
                <h3 className="text-2xl font-black text-red-400">
                  {monthlyMetrics.highRiskCount + monthlyMetrics.overdueCount} <span className="text-xs font-normal">điểm nóng</span>
                </h3>
                <p className="text-[10px] text-red-300 mt-1 font-bold">
                  ⚠️ {monthlyMetrics.highRiskCount} vượt &gt;90% NS | {monthlyMetrics.overdueCount} trễ hạn
                </p>
              </div>
            ) : (
              <div>
                <h3 className="text-2xl font-black text-emerald-400">An toàn</h3>
                <p className="text-[10px] text-emerald-500 mt-1 font-extrabold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Chưa phát hiện rủi ro vượt ngưỡng ngân sách</span>
                </p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* 2. Main Calendar Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* Left Side: Interactive Calendar Grid */}
        <div className="xl:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          
          {/* Calendar Header Control */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-850 gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-black text-white uppercase tracking-wider">
                  Tháng {String(currentMonth + 1).padStart(2, '0')} / {currentYear}
                </h2>
                <p className="text-[10px] text-slate-400">Nhấp chọn ngày để xem lịch hoạt động chi tiết</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleResetToJune}
                className="px-2.5 py-1 bg-slate-950 border border-slate-800 text-slate-300 rounded text-xxs font-bold hover:text-white transition cursor-pointer"
                title="Khôi phục về mốc dữ liệu mẫu"
              >
                Mốc dữ liệu mẫu
              </button>
              <div className="flex items-center bg-slate-950 border border-slate-850 rounded-lg p-0.5">
                <button
                  onClick={handlePrevMonth}
                  className="p-1.5 hover:text-amber-500 text-slate-400 transition cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-2 text-xxs font-black text-slate-300 select-none">
                  Điều hướng
                </span>
                <button
                  onClick={handleNextMonth}
                  className="p-1.5 hover:text-amber-500 text-slate-400 transition cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1.5 text-center text-xxs font-black text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-850 pb-2">
            <div>Hai</div>
            <div>Ba</div>
            <div>Tư</div>
            <div>Năm</div>
            <div>Sáu</div>
            <div>Bảy</div>
            <div className="text-red-400">CN</div>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1.5 min-h-[420px]">
            {calendarGridDays.map((cell) => {
              const dateStr = formatDateStr(cell.date);
              const isSelected = selectedDateStr === dateStr;
              
              // Filter active campaigns for this specific day
              const dayCampaigns = campaigns.filter(c => {
                return c.start_date <= dateStr && dateStr <= c.end_date;
              });

              const isToday = dateStr === '2026-06-26'; // Mock Today coordinate
              const dow = cell.date.getDay();
              const isWeekend = dow === 0 || dow === 6;

              return (
                <div
                  key={cell.key}
                  onClick={() => setSelectedDateStr(dateStr)}
                  className={`bg-slate-950 border min-h-[90px] p-1.5 rounded-xl flex flex-col justify-between transition group cursor-pointer ${
                    isSelected 
                      ? 'border-amber-500 bg-slate-900/60 shadow-[0_0_15px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/30' 
                      : cell.isCurrentMonth
                      ? 'border-slate-850/70 hover:border-slate-700'
                      : 'border-slate-900/45 opacity-30 hover:opacity-50'
                  } ${isToday ? 'ring-2 ring-amber-500 ring-offset-2 ring-offset-slate-950' : ''}`}
                >
                  {/* Day Header Info */}
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-black ${
                      isToday 
                        ? 'text-amber-400 bg-amber-500/10 px-1 py-0.2 rounded font-black' 
                        : isWeekend 
                        ? 'text-red-400' 
                        : 'text-slate-400'
                    }`}>
                      {cell.date.getDate()}
                    </span>
                    {dayCampaigns.length > 0 && (
                      <span className="text-[8px] bg-slate-900 text-slate-400 font-bold px-1 rounded-full border border-slate-800">
                        {dayCampaigns.length} CD
                      </span>
                    )}
                  </div>

                  {/* Active Campaigns List capsules */}
                  <div className="space-y-1 mt-1.5 flex-1 overflow-y-auto max-h-[64px] scrollbar-none pr-0.5">
                    {dayCampaigns.slice(0, 3).map((c) => {
                      const colors = getCategoryColor(c.business_category);
                      const isOverdue = c.status === 'Trễ hạn' || (c.end_date && c.end_date < '2026-06-26' && c.status !== 'Hoàn thành');
                      
                      return (
                        <div
                          key={c.campaign_id}
                          className={`text-[8.5px] font-bold px-1 py-0.5 rounded border ${colors.bg} ${colors.border} ${colors.text} truncate transition-all duration-150`}
                          title={`[${c.business_category}] ${c.campaign_name}`}
                        >
                          <div className="flex items-center gap-1 truncate">
                            <span className={`w-1 h-1 rounded-full shrink-0 ${isOverdue ? 'bg-red-500 animate-pulse' : colors.bullet}`} />
                            <span className="truncate">{c.campaign_name}</span>
                          </div>
                        </div>
                      );
                    })}
                    {dayCampaigns.length > 3 && (
                      <div className="text-[7.5px] text-slate-500 font-extrabold text-center block pt-0.5">
                        + {dayCampaigns.length - 3} chiến dịch khác
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Right Side: Selected Day Activity Detail */}
        <div className="xl:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between h-full">
          <div>
            {/* Header info */}
            <div className="border-b border-slate-850 pb-3 mb-4">
              <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest block mb-1">Chi tiết hoạt động</span>
              <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>
                  {(() => {
                    const d = new Date(selectedDateStr);
                    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
                    return `${days[d.getDay()]}, ${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
                  })()}
                </span>
              </h3>
            </div>

            {/* Campaign Item Cards */}
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {selectedDayCampaigns.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs font-semibold bg-slate-950/30 border border-dashed border-slate-850 rounded-xl">
                  Không có chiến dịch nào diễn ra vào ngày này.
                </div>
              ) : (
                selectedDayCampaigns.map((c) => {
                  const colors = getCategoryColor(c.business_category);
                  
                  // Calculate completing rate from tasks
                  const associatedTasks = tasks.filter(t => 
                    t.task_name.toLowerCase().includes(c.campaign_name.toLowerCase()) || 
                    t.description.toLowerCase().includes(c.campaign_name.toLowerCase())
                  );
                  const completedTasksCount = associatedTasks.filter(t => t.status === 'Hoàn thành').length;
                  const progressPercent = associatedTasks.length > 0 
                    ? Math.round((completedTasksCount / associatedTasks.length) * 100)
                    : 0;

                  const leadMember = members.find(m => m.id === c.owner);

                  return (
                    <div 
                      key={c.campaign_id}
                      className={`p-3 rounded-xl bg-slate-950 border border-slate-850/80 hover:border-slate-700 transition flex flex-col gap-2`}
                    >
                      <div className="flex items-start justify-between gap-1.5">
                        <span className={`text-[8.5px] font-black uppercase px-2 py-0.5 rounded ${colors.badge}`}>
                          {c.business_category}
                        </span>
                        <span className={`text-[8px] font-black uppercase px-1.5 py-0.2 rounded ${getStatusBadgeClass(c.status)}`}>
                          {c.status}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-xs font-extrabold text-white leading-snug hover:text-amber-400 transition cursor-pointer" onClick={() => onEditCampaign(c)}>
                          {c.campaign_name}
                        </h4>
                        <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed italic">
                          " {c.goal || 'Không có mô tả mục tiêu.'} "
                        </p>
                      </div>

                      {/* Associated Tasks Progress */}
                      {associatedTasks.length > 0 && (
                        <div className="space-y-1 bg-slate-900/50 p-2 rounded-lg border border-slate-850/40">
                          <div className="flex items-center justify-between text-[9px] font-bold">
                            <span className="text-slate-400">Tiến độ nhiệm vụ</span>
                            <span className="text-amber-500 font-extrabold">{progressPercent}% ({completedTasksCount}/{associatedTasks.length})</span>
                          </div>
                          <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden">
                            <div className="bg-amber-500 h-full rounded-full" style={{ width: `${progressPercent}%` }} />
                          </div>
                        </div>
                      )}

                      {/* Footer info inside Card */}
                      <div className="flex items-center justify-between border-t border-slate-850/50 pt-1.5 mt-1 text-[9.5px]">
                        <span className="text-slate-400 flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-500" />
                          <span>{leadMember?.name || c.owner}</span>
                        </span>
                        <button
                          onClick={() => onEditCampaign(c)}
                          className="text-amber-500 hover:text-amber-400 font-black flex items-center gap-0.5 group shrink-0"
                        >
                          <span>Sửa</span>
                          <ArrowRight className="w-3 h-3 transform group-hover:translate-x-0.5 transition" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Brief instruction info box */}
          <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl mt-4">
            <h4 className="text-[10px] font-black uppercase text-amber-500 flex items-center gap-1 mb-1">
              <Info className="w-3.5 h-3.5" />
              <span>Phân hệ lịch truyền thông</span>
            </h4>
            <p className="text-[10px] text-slate-400 leading-normal">
              Báo cáo tiến độ và tổng mức chi tiêu của chiến dịch được đồng bộ trực tiếp từ các đầu việc sản xuất thô, phân phối quảng cáo và seeding liên quan.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
