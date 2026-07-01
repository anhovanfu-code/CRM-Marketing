/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  Megaphone,
  Briefcase,
  TrendingUp,
  Award,
  Compass,
  ArrowUpRight,
  ShieldAlert,
  FolderOpen,
  PieChart as LucidePieChart
} from 'lucide-react';
import {
  TeamMember,
  Task,
  ProductionSchedule,
  Campaign,
  KpiAssignment,
  WorkReport,
  PersonnelEvaluation,
  Proposal
} from '../types';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

interface DashboardViewProps {
  members: TeamMember[];
  tasks: Task[];
  schedules: ProductionSchedule[];
  campaigns: Campaign[];
  kpis: KpiAssignment[];
  reports: WorkReport[];
  evaluations: PersonnelEvaluation[];
  proposals: Proposal[];
}

export default function DashboardView({
  members,
  tasks,
  schedules,
  campaigns,
  kpis,
  reports,
  evaluations,
  proposals,
}: DashboardViewProps) {

  const [selectedStaffChecklist, setSelectedStaffChecklist] = React.useState('all');

  const checklistTodayStr = '2026-07-05'; // aligns with system timeline exactly
  const dailyTasks = React.useMemo(() => {
    return tasks.filter(t => {
      const isToday = t.deadline === checklistTodayStr;
      const isOverdue = t.status === 'Trễ hạn';
      
      const matchesDate = isToday || isOverdue;
      if (!matchesDate) return false;
      
      if (selectedStaffChecklist !== 'all') {
        return t.assignee === selectedStaffChecklist;
      }
      return true;
    });
  }, [tasks, selectedStaffChecklist, checklistTodayStr]);

  // 1. Task calculations
  const totalTasks = tasks.length;
  const tasksInProgress = tasks.filter(t => t.status === 'Đang làm').length;
  const tasksPendingReview = tasks.filter(t => t.status === 'Chờ duyệt').length;
  const tasksNeedsEdit = tasks.filter(t => t.status === 'Cần sửa').length;
  const tasksCompleted = tasks.filter(t => t.status === 'Hoàn thành').length;
  const tasksOverdue = tasks.filter(t => t.status === 'Trễ hạn').length;
  const tasksNotStarted = tasks.filter(t => t.status === 'Chưa làm').length;

  const totalActiveAndFinished = tasksInProgress + tasksPendingReview + tasksNeedsEdit + tasksCompleted + tasksOverdue + tasksNotStarted;
  const completionRate = totalActiveAndFinished > 0 ? Math.round((tasksCompleted / totalActiveAndFinished) * 100) : 0;

  // 2. Service segment category breakdown
  const categoryStats = {
    'Nội thất': tasks.filter(t => t.business_category === 'Nội thất').length,
    'Phong thủy': tasks.filter(t => t.business_category === 'Phong thủy').length,
    'Hàng hiệu': tasks.filter(t => t.business_category === 'Hàng hiệu').length,
    'Thương hiệu chung': tasks.filter(t => t.business_category === 'Thương hiệu chung').length,
  };

  const maxCategoryCount = Math.max(...Object.values(categoryStats), 1);

  // 3. Status breakdown
  const statusStats = {
    'Chưa làm': tasksNotStarted,
    'Đang làm': tasksInProgress,
    'Chờ duyệt': tasksPendingReview,
    'Cần sửa': tasksNeedsEdit,
    'Hoàn thành': tasksCompleted,
    'Trễ hạn': tasksOverdue,
  };

  // 4. Overload alerts: personnel with > 3 active tasks in progress
  const overloadedMembers = members.filter(m => m.tasks_in_progress > 3);

  // 5. Overdue warning alerts: tasks where status is 'Trễ hạn' or past deadline and not completed
  const todayStr = new Date().toISOString().split('T')[0];
  const criticallyOverdueTasks = tasks.filter(t => 
    t.status === 'Trễ hạn' || (t.deadline < todayStr && t.status !== 'Hoàn thành' && t.status !== 'Hủy' && t.status !== 'Tạm dừng')
  );
  const criticallyOverdueCampaigns = campaigns.filter(c =>
    c.status === 'Trễ hạn' || (c.end_date < todayStr && c.status !== 'Hoàn thành' && c.status !== 'Hủy' && c.status !== 'Tạm dừng')
  );

  // --- Recharts Data Preparation & Custom Tooltips for Materio Theme ---
  
  // 1. Donut chart data for overall team progress (using Materio Purple and light grey)
  const donutData = [
    { name: 'Đã hoàn thành', value: tasksCompleted, color: '#8C57FF' },
    { name: 'Chưa hoàn thành', value: Math.max(0, totalActiveAndFinished - tasksCompleted), color: '#E1E0E6' }
  ];

  const CustomDonutTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] text-xxs font-bold text-slate-700 max-w-xs">
          <p className="text-slate-800 border-b border-slate-100 pb-1.5 mb-2 uppercase font-extrabold tracking-wider text-[10px] flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-[#8C57FF]" />
            <span className="text-[#8C57FF]">Hiệu suất toàn đội ngũ</span>
          </p>
          <div className="space-y-1.5 text-slate-600">
            <p className="flex items-center justify-between gap-6">
              <span className="text-slate-500">Tỷ lệ hoàn thành:</span>
              <span className="text-[#8C57FF] font-black text-xs">{completionRate}%</span>
            </p>
            <div className="border-t border-slate-100 pt-1.5 mt-1 space-y-1">
              <p className="flex items-center justify-between gap-4">
                <span className="text-slate-400">✔ Hoàn thành:</span>
                <span className="text-slate-800 font-extrabold">{tasksCompleted} task</span>
              </p>
              <p className="flex items-center justify-between gap-4">
                <span className="text-slate-400">⚙ Đang làm:</span>
                <span className="text-slate-800 font-extrabold">{tasksInProgress} task</span>
              </p>
              <p className="flex items-center justify-between gap-4">
                <span className="text-slate-400">⏱ Chờ duyệt:</span>
                <span className="text-slate-800 font-extrabold">{tasksPendingReview} task</span>
              </p>
              <p className="flex items-center justify-between gap-4">
                <span className="text-slate-400">✏ Cần sửa:</span>
                <span className="text-slate-800 font-extrabold">{tasksNeedsEdit} task</span>
              </p>
              <p className="flex items-center justify-between gap-4">
                <span className="text-slate-400">⚠️ Trễ hạn:</span>
                <span className="text-red-500 font-extrabold">{tasksOverdue} task</span>
              </p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // 2. Category Stats data
  const categoryData = Object.entries(categoryStats).map(([cat, val]) => {
    const catTasks = tasks.filter(t => t.business_category === cat);
    const completed = catTasks.filter(t => t.status === 'Hoàn thành').length;
    const ongoing = catTasks.filter(t => ['Đang làm', 'Chờ duyệt', 'Cần sửa'].includes(t.status)).length;
    const overdue = catTasks.filter(t => t.status === 'Trễ hạn').length;
    
    return {
      name: cat,
      'Số công việc': val,
      completed,
      ongoing,
      overdue,
      percentage: totalTasks > 0 ? Math.round((val / totalTasks) * 100) : 0
    };
  });

  const CustomCategoryTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] text-xxs font-bold text-slate-700 max-w-xs">
          <p className="text-slate-800 border-b border-slate-100 pb-1.5 mb-2 uppercase font-extrabold tracking-wider text-[10px] flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-[#8C57FF]" />
            <span className="text-[#8C57FF]">Mảng {data.name}</span>
          </p>
          <div className="space-y-1.5 text-slate-600">
            <p className="flex items-center justify-between gap-6">
              <span className="text-slate-500">Tổng số task:</span>
              <span className="text-[#8C57FF] font-black text-xs">{data['Số công việc']} task ({data.percentage}%)</span>
            </p>
            <div className="border-t border-slate-100 pt-1.5 mt-1 space-y-1">
              <p className="flex items-center justify-between gap-4">
                <span className="text-slate-400">Hoàn thành:</span>
                <span className="text-emerald-500 font-extrabold">{data.completed} task</span>
              </p>
              <p className="flex items-center justify-between gap-4">
                <span className="text-slate-400">Đang thực hiện:</span>
                <span className="text-sky-500 font-extrabold">{data.ongoing} task</span>
              </p>
              <p className="flex items-center justify-between gap-4">
                <span className="text-slate-400">Trễ hạn:</span>
                <span className="text-red-500 font-extrabold">{data.overdue} task</span>
              </p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Pie chart data for the three FUGALO service segments (Nội thất, Phong thủy, Hàng hiệu)
  const segmentPieData = [
    { name: 'Nội thất', value: tasks.filter(t => t.business_category === 'Nội thất').length, color: '#C5A85C' }, // Vàng Gold
    { name: 'Phong thủy', value: tasks.filter(t => t.business_category === 'Phong thủy').length, color: '#E04B1C' }, // Cam Terracotta
    { name: 'Hàng hiệu', value: tasks.filter(t => t.business_category === 'Hàng hiệu').length, color: '#1E1B26' } // Đen
  ];

  const CustomSegmentPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const totalSelected = tasks.filter(t => ['Nội thất', 'Phong thủy', 'Hàng hiệu'].includes(t.business_category)).length;
      const pct = totalSelected > 0 ? Math.round((data.value / totalSelected) * 100) : 0;
      return (
        <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] text-xxs font-bold text-slate-700 max-w-xs">
          <p className="text-slate-800 border-b border-slate-100 pb-1.5 mb-2 uppercase font-extrabold tracking-wider text-[10px] flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
            <span>Mảng {data.name}</span>
          </p>
          <div className="space-y-1.5 text-slate-600">
            <p className="flex items-center justify-between gap-6">
              <span className="text-slate-500">Số lượng:</span>
              <span className="font-black text-xs" style={{ color: data.color }}>{data.value} công việc</span>
            </p>
            <p className="flex items-center justify-between gap-6">
              <span className="text-slate-500">Tỷ lệ trong 3 mảng:</span>
              <span className="font-extrabold text-slate-800">{pct}%</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // 3. Staff Workload data
  const staffData = members.map(m => {
    return {
      name: m.name,
      'Đang gánh vác': m.tasks_in_progress,
      'Đã hoàn thành': m.tasks_completed,
      'Trễ hạn': m.tasks_overdue,
      rate: m.completion_rate,
      score: m.performance_score,
      role: m.role
    };
  });

  const CustomStaffTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] text-xxs font-bold text-slate-700 max-w-xs">
          <p className="text-slate-800 border-b border-slate-100 pb-1.5 mb-1.5 uppercase font-extrabold tracking-wider text-[10px] flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-[#8C57FF]" />
            <span className="text-[#8C57FF]">{data.name}</span>
          </p>
          <p className="text-[9px] text-slate-400 mb-2 font-bold">{data.role}</p>
          <div className="space-y-1.5 text-slate-600">
            <div className="grid grid-cols-2 gap-2 border-b border-slate-100 pb-2 mb-1">
              <div>
                <p className="text-[9px] text-slate-400 uppercase">Tỷ lệ hoàn thành</p>
                <p className="text-[#8C57FF] font-black text-xs">{data.rate}%</p>
              </div>
              <div>
                <p className="text-[9px] text-slate-400 uppercase">Điểm hiệu suất</p>
                <p className="text-sky-500 font-black text-xs">{data.score}đ</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="flex items-center justify-between gap-4">
                <span className="text-slate-400">Đã hoàn thành:</span>
                <span className="text-emerald-500 font-extrabold">{data['Đã hoàn thành']} task</span>
              </p>
              <p className="flex items-center justify-between gap-4">
                <span className="text-slate-400">Đang gánh vác:</span>
                <span className="text-amber-500 font-extrabold">{data['Đang gánh vác']} task</span>
              </p>
              <p className="flex items-center justify-between gap-4">
                <span className="text-slate-400">Bị trễ hạn:</span>
                <span className="text-red-500 font-extrabold">{data['Trễ hạn']} task</span>
              </p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-transparent text-[#2F2B3D] p-6">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E6E6E8]">
        <div>
          <div className="flex items-center gap-2 text-[#8C57FF] font-bold text-xs uppercase tracking-widest mb-1">
            <LayoutDashboard className="w-4 h-4" />
            <span>FUGALO MARKETING CONSOLE</span>
          </div>
          <h1 className="text-2xl font-black text-[#2F2B3D] tracking-tight">DASHBOARD ĐIỀU HÀNH PHÒNG MARKETING</h1>
          <p className="text-xs text-[#2F2B3D]/70 mt-1">Hệ thống giám sát hiệu suất nội bộ, kịch bản quay chụp, chiến dịch thương hiệu và chấm điểm KPI</p>
        </div>

        <div className="flex items-center gap-3 bg-white border border-[#E6E6E8] p-3 rounded-xl shadow-[0_4px_18px_rgba(15,10,32,0.03)]">
          <div className="text-right">
            <p className="text-[9px] text-[#2F2B3D]/60 font-bold uppercase tracking-wider">Trực ban hôm nay</p>
            <p className="text-xs font-black text-[#8C57FF]">Hồ Văn An (Manager)</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#8C57FF] text-white flex items-center justify-center font-black text-xs">
            AN
          </div>
        </div>
      </div>

      {/* Critical Warnings Bar (Overdue and Overloads) */}
      {(criticallyOverdueTasks.length > 0 || criticallyOverdueCampaigns.length > 0 || overloadedMembers.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {(criticallyOverdueTasks.length > 0 || criticallyOverdueCampaigns.length > 0) && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-extrabold text-red-700 uppercase tracking-wider">Cảnh báo chậm trễ tiến độ</h4>
                
                {criticallyOverdueTasks.length > 0 && (
                  <div className="mt-1">
                    <p className="text-xxs text-slate-600 leading-relaxed">
                      Có <strong>{criticallyOverdueTasks.length} công việc</strong> quá hạn bàn giao nhưng chưa hoàn tất thực tế:
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {criticallyOverdueTasks.slice(0, 3).map(t => (
                        <span key={t.task_id} className="bg-red-100 text-red-800 border border-red-200 px-2 py-0.5 rounded text-[9px] font-bold">
                          {t.task_id}: {t.task_name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {criticallyOverdueCampaigns.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xxs text-slate-600 leading-relaxed">
                      Có <strong>{criticallyOverdueCampaigns.length} chiến dịch</strong> quá hạn kết thúc nhưng chưa hoàn tất:
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {criticallyOverdueCampaigns.slice(0, 3).map(c => (
                        <span key={c.campaign_id} className="bg-red-100 text-red-800 border border-red-200 px-2 py-0.5 rounded text-[9px] font-bold">
                          {c.campaign_id}: {c.campaign_name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {overloadedMembers.length > 0 && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-extrabold text-amber-800 uppercase tracking-wider">Cảnh báo nhân sự quá tải ({overloadedMembers.length})</h4>
                <p className="text-xxs text-slate-600 mt-1 leading-relaxed">
                  Một số nhân viên đang phụ trách đồng thời trên 3 đầu việc dở dang. Hãy cân nhắc phân bổ bớt nhân sự phối hợp!
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {overloadedMembers.map(m => (
                    <span key={m.id} className="bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded text-[9px] font-bold">
                      {m.name} ({m.tasks_in_progress} task)
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Task Status Bento Grid Summary Card Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mt-6">
        {/* Card 1: Tổng công việc */}
        <div className="bg-white border border-[#E6E6E8] hover:border-[#8C57FF]/40 rounded-xl p-4 relative overflow-hidden transition-all duration-300 shadow-[0_4px_18px_rgba(15,10,32,0.03)] hover:shadow-[0_4px_25px_rgba(140,87,255,0.08)] group">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#8C57FF]" />
          <p className="text-[9px] font-black text-[#8C57FF] uppercase tracking-widest pl-2">Tổng công việc</p>
          <div className="flex items-baseline gap-1 pl-2 mt-1">
            <span className="text-3xl font-black text-[#2F2B3D] tracking-tight group-hover:scale-105 transition-transform duration-300">{totalTasks}</span>
            <span className="text-[9px] text-[#2F2B3D]/60 font-bold uppercase">task</span>
          </div>
          <p className="text-[9px] text-[#2F2B3D]/50 font-medium pl-2 mt-2">Tất cả các mảng</p>
          <div className="absolute right-3 bottom-3 text-[#8C57FF]/[0.05] group-hover:text-[#8C57FF]/[0.08] transition-colors">
            <CheckSquare className="w-10 h-10" />
          </div>
        </div>

        {/* Card 2: Đang làm */}
        <div className="bg-white border border-[#E6E6E8] hover:border-[#16B1FF]/40 rounded-xl p-4 relative overflow-hidden transition-all duration-300 shadow-[0_4px_18px_rgba(15,10,32,0.03)] hover:shadow-[0_4px_25px_rgba(22,177,255,0.08)] group">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#16B1FF]" />
          <p className="text-[9px] font-black text-[#16B1FF] uppercase tracking-widest pl-2">Đang thực hiện</p>
          <div className="flex items-baseline gap-1 pl-2 mt-1">
            <span className="text-3xl font-black text-[#2F2B3D] tracking-tight group-hover:scale-105 transition-transform duration-300">{tasksInProgress}</span>
            <span className="text-[9px] text-[#2F2B3D]/60 font-bold uppercase">task</span>
          </div>
          <p className="text-[9px] text-[#2F2B3D]/50 font-medium pl-2 mt-2">Cần hoàn thành gấp</p>
          <div className="absolute right-3 bottom-3 text-[#16B1FF]/[0.05] group-hover:text-[#16B1FF]/[0.08] transition-colors">
            <Compass className="w-10 h-10" />
          </div>
        </div>

        {/* Card 3: Chờ duyệt */}
        <div className="bg-white border border-[#E6E6E8] hover:border-[#FFB400]/40 rounded-xl p-4 relative overflow-hidden transition-all duration-300 shadow-[0_4px_18px_rgba(15,10,32,0.03)] hover:shadow-[0_4px_25px_rgba(255,180,0,0.08)] group">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#FFB400]" />
          <p className="text-[9px] font-black text-[#FFB400] uppercase tracking-widest pl-2">Chờ phê duyệt</p>
          <div className="flex items-baseline gap-1 pl-2 mt-1">
            <span className="text-3xl font-black text-[#2F2B3D] tracking-tight group-hover:scale-105 transition-transform duration-300">{tasksPendingReview}</span>
            <span className="text-[9px] text-[#2F2B3D]/60 font-bold uppercase">task</span>
          </div>
          <p className="text-[9px] text-[#2F2B3D]/50 font-medium pl-2 mt-2">Đang đợi sếp duyệt</p>
          <div className="absolute right-3 bottom-3 text-[#FFB400]/[0.05] group-hover:text-[#FFB400]/[0.08] transition-colors">
            <Clock className="w-10 h-10" />
          </div>
        </div>

        {/* Card 4: Cần sửa */}
        <div className="bg-white border border-[#E6E6E8] hover:border-[#CA8A04]/40 rounded-xl p-4 relative overflow-hidden transition-all duration-300 shadow-[0_4px_18px_rgba(15,10,32,0.03)] hover:shadow-[0_4px_25px_rgba(202,138,4,0.08)] group">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#CA8A04]" />
          <p className="text-[9px] font-black text-[#CA8A04] uppercase tracking-widest pl-2">Cần chỉnh sửa</p>
          <div className="flex items-baseline gap-1 pl-2 mt-1">
            <span className="text-3xl font-black text-[#2F2B3D] tracking-tight group-hover:scale-105 transition-transform duration-300">{tasksNeedsEdit}</span>
            <span className="text-[9px] text-[#2F2B3D]/60 font-bold uppercase">task</span>
          </div>
          <p className="text-[9px] text-[#2F2B3D]/50 font-medium pl-2 mt-2">Cần tối ưu thêm</p>
          <div className="absolute right-3 bottom-3 text-[#CA8A04]/[0.05] group-hover:text-[#CA8A04]/[0.08] transition-colors">
            <AlertTriangle className="w-10 h-10" />
          </div>
        </div>

        {/* Card 5: Hoàn thành */}
        <div className="bg-white border border-[#E6E6E8] hover:border-[#56CA00]/40 rounded-xl p-4 relative overflow-hidden transition-all duration-300 shadow-[0_4px_18px_rgba(15,10,32,0.03)] hover:shadow-[0_4px_25px_rgba(86,202,0,0.08)] group">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#56CA00]" />
          <p className="text-[9px] font-black text-[#56CA00] uppercase tracking-widest pl-2">Đã hoàn thành</p>
          <div className="flex items-baseline gap-1 pl-2 mt-1">
            <span className="text-3xl font-black text-[#2F2B3D] tracking-tight group-hover:scale-105 transition-transform duration-300">{tasksCompleted}</span>
            <span className="text-[9px] text-[#2F2B3D]/60 font-bold uppercase">task</span>
          </div>
          <p className="text-[9px] text-[#56CA00] font-semibold pl-2 mt-2">Đạt chuẩn FUGALO</p>
          <div className="absolute right-3 bottom-3 text-[#56CA00]/[0.05] group-hover:text-[#56CA00]/[0.08] transition-colors">
            <CheckCircle className="w-10 h-10" />
          </div>
        </div>

        {/* Card 6: Trễ hạn */}
        <div className="bg-white border border-[#E6E6E8] hover:border-red-500/40 rounded-xl p-4 relative overflow-hidden transition-all duration-300 shadow-[0_4px_18px_rgba(15,10,32,0.03)] hover:shadow-[0_4px_25px_rgba(239,68,68,0.08)] group">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#FF4C51] shadow-[0_0_8px_rgba(255,76,81,0.4)] animate-pulse" />
          <p className="text-[9px] font-black text-[#FF4C51] uppercase tracking-widest pl-2 animate-pulse">Trễ hạn bàn giao</p>
          <div className="flex items-baseline gap-1 pl-2 mt-1">
            <span className="text-3xl font-black text-[#FF4C51] tracking-tight group-hover:scale-105 transition-transform duration-300">{tasksOverdue}</span>
            <span className="text-[9px] text-[#2F2B3D]/60 font-bold uppercase">task</span>
          </div>
          <p className="text-[9px] text-[#FF4C51]/80 font-medium pl-2 mt-2">Quá hạn deadline</p>
          <div className="absolute right-3 bottom-3 text-[#FF4C51]/[0.05] group-hover:text-[#FF4C51]/[0.08] transition-colors">
            <ShieldAlert className="w-10 h-10" />
          </div>
        </div>
      </div>

      {/* Main Graph Charts & Statistics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mt-6">
        
        {/* Chart 1: Circular Overall Progress & Status bar */}
        <div className="bg-white border border-[#E6E6E8] rounded-2xl p-5 flex flex-col justify-between shadow-[0_4px_18px_rgba(15,10,32,0.03)] hover:border-[#8C57FF]/20 transition-colors">
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-[#8C57FF] mb-2 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-[#8C57FF]" />
              <span>Tỷ lệ hoàn thành phòng ban</span>
            </h3>
            <p className="text-[9px] text-slate-400 font-medium">Tổng quan kết quả xử lý task của toàn bộ nhân sự Marketing Fugalo.</p>

            <div className="flex flex-col items-center justify-center py-4 h-48 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomDonutTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute text-center">
                <span className="text-3xl font-black text-[#2F2B3D]">{completionRate}%</span>
                <span className="block text-[8px] text-[#8C57FF] font-extrabold uppercase mt-0.5 tracking-widest">Đạt Tiến Độ</span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-2">
            <div className="flex items-center justify-between text-xxs font-bold text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#8C57FF]" />
                Hoàn thành ({tasksCompleted})
              </span>
              <span className="text-[#2F2B3D]">{totalTasks > 0 ? Math.round((tasksCompleted / totalTasks) * 100) : 0}%</span>
            </div>
            <div className="flex items-center justify-between text-xxs font-bold text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#E1E0E6]" />
                Đang xử lý dở dang ({totalActiveAndFinished - tasksCompleted})
              </span>
              <span className="text-[#2F2B3D]">{totalTasks > 0 ? Math.round(((totalActiveAndFinished - tasksCompleted) / totalTasks) * 100) : 0}%</span>
            </div>
          </div>
        </div>

        {/* Chart 2: Custom Bar Chart showing Task distribution by Service Categories */}
        <div className="bg-white border border-[#E6E6E8] rounded-2xl p-5 flex flex-col justify-between shadow-[0_4px_18px_rgba(15,10,32,0.03)] hover:border-[#8C57FF]/20 transition-colors">
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-[#2F2B3D] mb-2 flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-[#8C57FF]" />
              <span>Phân bổ task theo mảng kinh doanh</span>
            </h3>
            <p className="text-[9px] text-slate-400 font-medium">Bản đồ mật độ công việc chia theo 4 khối thương hiệu chính của Fugalo.</p>

            <div className="h-48 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categoryData}
                  layout="vertical"
                  margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                >
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke="#5a5a65"
                    fontSize={9}
                    fontWeight="bold"
                    tickLine={false}
                    axisLine={false}
                    width={90}
                  />
                  <Tooltip content={<CustomCategoryTooltip />} cursor={{ fill: '#8C57FF', opacity: 0.05 }} />
                  <Bar dataKey="Số công việc" fill="#8C57FF" radius={[0, 4, 4, 0]} barSize={12}>
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index === 0 ? '#8C57FF' : index === 1 ? '#FFB400' : index === 2 ? '#16B1FF' : '#56CA00'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <p className="text-[9px] text-[#2F2B3D]/60 leading-normal font-semibold mt-4 border-t border-slate-100 pt-3">
            Fugalo vận hành tập trung vào: <strong className="text-[#8C57FF]">Nội thất quý tộc</strong>, <strong className="text-[#FFB400]">Phong thủy thượng lưu</strong>, <strong className="text-[#16B1FF]">Hàng hiệu xa xỉ</strong> và Branding toàn quốc.
          </p>
        </div>

        {/* Chart 3: FUGALO Core Service Segments Pie Chart */}
        <div className="bg-white border border-[#E6E6E8] rounded-2xl p-5 flex flex-col justify-between shadow-[0_4px_18px_rgba(15,10,32,0.03)] hover:border-[#E04B1C]/20 transition-colors">
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-[#2F2B3D] mb-2 flex items-center gap-1.5">
              <LucidePieChart className="w-4 h-4 text-[#E04B1C]" />
              <span>Phân bổ 3 mảng cốt lõi FUGALO</span>
            </h3>
            <p className="text-[9px] text-slate-400 font-medium">Tỷ lệ công việc chia theo 3 trụ cột giá trị: Vàng gold, Cam terracotta, Đen.</p>

            <div className="flex flex-col items-center justify-center py-4 h-48 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={segmentPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {segmentPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomSegmentPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute text-center mt-[-4px]">
                <span className="text-xl font-black text-[#2F2B3D]">3 Trụ Cột</span>
                <span className="block text-[7px] text-[#E04B1C] font-extrabold uppercase mt-0.5 tracking-wider">FUGALO</span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3 space-y-1.5">
            <div className="grid grid-cols-3 gap-1 text-[8px] font-black uppercase text-center">
              <div className="flex flex-col items-center border-r border-slate-100 last:border-0">
                <span className="w-2 h-2 rounded-full mb-1 bg-[#C5A85C]" />
                <span className="text-slate-500 truncate w-full">Nội thất</span>
                <span className="text-slate-800 font-extrabold mt-0.5">{tasks.filter(t => t.business_category === 'Nội thất').length} task</span>
              </div>
              <div className="flex flex-col items-center border-r border-slate-100 last:border-0">
                <span className="w-2 h-2 rounded-full mb-1 bg-[#E04B1C]" />
                <span className="text-slate-500 truncate w-full">Phong thủy</span>
                <span className="text-slate-800 font-extrabold mt-0.5">{tasks.filter(t => t.business_category === 'Phong thủy').length} task</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="w-2 h-2 rounded-full mb-1 bg-[#1E1B26]" />
                <span className="text-slate-500 truncate w-full">Hàng hiệu</span>
                <span className="text-slate-800 font-extrabold mt-0.5">{tasks.filter(t => t.business_category === 'Hàng hiệu').length} task</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chart 4: Recharts Grouped Bar Chart showing Staff workload with rich tooltip */}
        <div className="bg-white border border-[#E6E6E8] rounded-2xl p-5 flex flex-col justify-between shadow-[0_4px_18px_rgba(15,10,32,0.03)] hover:border-[#8C57FF]/20 transition-colors">
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-[#2F2B3D] mb-2 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[#8C57FF]" />
              <span>Hiệu suất & Gánh nặng nhân sự</span>
            </h3>
            <p className="text-[9px] text-slate-400 font-medium">So sánh tương quan số lượng task hoàn tất so với khối lượng đang chịu trách nhiệm.</p>

            <div className="h-48 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={staffData.slice(0, 5)}
                  margin={{ top: 10, right: 10, left: -25, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f2" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="#5a5a65"
                    fontSize={9}
                    fontWeight="bold"
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#5a5a65"
                    fontSize={9}
                    fontWeight="bold"
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomStaffTooltip />} cursor={{ fill: '#8C57FF', opacity: 0.05 }} />
                  <Legend
                    iconSize={6}
                    iconType="circle"
                    wrapperStyle={{ fontSize: '8px', fontWeight: 'bold', color: '#5a5a65' }}
                  />
                  <Bar dataKey="Đang gánh vác" fill="#C3A5FF" radius={[2, 2, 0, 0]} barSize={8} />
                  <Bar dataKey="Đã hoàn thành" fill="#8C57FF" radius={[2, 2, 0, 0]} barSize={8} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3 text-[9px] text-[#2F2B3D]/60 font-semibold leading-normal">
            Bao gồm 5 nhân viên nòng cốt. Hover vào biểu đồ để kiểm tra chi tiết <span className="text-[#8C57FF]">tỷ lệ hoàn thành</span> và <span className="text-sky-500">điểm số hiệu suất</span> cá nhân.
          </div>
        </div>
      </div>

      {/* --- CÔNG VIỆC TRONG NGÀY (DAILY CHECKLIST FOR EMPLOYEES) --- */}
      <div className="bg-white border border-[#E6E6E8] rounded-2xl p-5 shadow-[0_4px_18px_rgba(15,10,32,0.03)] mt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-[#2F2B3D] flex items-center gap-1.5">
              <CheckSquare className="w-5 h-5 text-emerald-500" />
              <span>📋 CÔNG VIỆC TRONG NGÀY (DAILY CHECKLIST)</span>
            </h3>
            <p className="text-[10px] text-slate-400 mt-1 font-medium">Giám sát các checklist công việc có hạn hoàn thành Hôm nay hoặc đang Trễ hạn để Manager đôn đốc kịp thời</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500 font-bold whitespace-nowrap">Lọc theo nhân sự:</span>
            <select
              value={selectedStaffChecklist}
              onChange={(e) => setSelectedStaffChecklist(e.target.value)}
              className="bg-white border border-[#E6E6E8] rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-[#2F2B3D] focus:outline-none focus:border-[#8C57FF]"
            >
              <option value="all">Tất cả nhân viên</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
              ))}
            </select>
          </div>
        </div>

        {dailyTasks.length === 0 ? (
          <div className="py-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-[#E6E6E8]">
            <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-1.5 animate-pulse" />
            <p className="font-extrabold text-[11px] uppercase text-[#2F2B3D]">Checklist hoàn toàn sạch sẽ!</p>
            <p className="text-slate-400 text-[10px] mt-0.5">Không có công việc nào có deadline hôm nay hoặc đang bị trễ hạn cần xử lý gấp.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dailyTasks.map((task) => {
              const assigneeInfo = members.find(m => m.id === task.assignee);
              const isOverdue = task.status === 'Trễ hạn';
              const isToday = task.deadline === checklistTodayStr;

              return (
                <div
                  key={task.task_id}
                  className={`border rounded-xl p-4 bg-white relative overflow-hidden flex flex-col justify-between transition-all hover:shadow-md ${
                    isOverdue ? 'border-red-200 bg-red-50/20 shadow-[0_2px_12px_rgba(255,76,81,0.04)]' : 'border-[#E6E6E8]'
                  }`}
                >
                  {/* Decorative bar */}
                  <div className={`absolute top-0 left-0 bottom-0 w-1 ${isOverdue ? 'bg-[#FF4C51]' : 'bg-[#16B1FF]'}`} />

                  <div className="space-y-2 pl-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] font-black text-[#8C57FF] bg-[#8C57FF]/5 px-2 py-0.5 rounded border border-[#8C57FF]/15">
                        {task.task_id}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase ${
                        isOverdue ? 'bg-red-50 text-[#FF4C51] border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {isOverdue ? 'Trễ hạn' : 'Hôm nay'}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-800 leading-snug line-clamp-2" title={task.task_name}>
                      {task.task_name}
                    </h4>

                    <p className="text-[10px] text-slate-400 line-clamp-2 font-medium">
                      {task.description || '_Không có mô tả chi tiết_'}
                    </p>
                  </div>

                  <div className="border-t border-slate-100 pt-3 mt-3 pl-1 space-y-2">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-400 font-medium">Nhân sự:</span>
                      <strong className="text-slate-700 font-bold">{assigneeInfo?.name || task.assignee}</strong>
                    </div>

                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-400 font-medium">Trạng thái:</span>
                      <span className={`font-bold ${
                        task.status === 'Hoàn thành' ? 'text-[#56CA00]' :
                        task.status === 'Đang làm' ? 'text-[#16B1FF]' :
                        task.status === 'Chờ duyệt' ? 'text-[#FFB400]' :
                        task.status === 'Cần sửa' ? 'text-[#FFB400]' :
                        task.status === 'Trễ hạn' ? 'text-[#FF4C51] animate-pulse font-extrabold' :
                        'text-slate-500'
                      }`}>
                        {task.status}
                      </span>
                    </div>

                    {/* Progress slider / bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[9px] font-bold text-slate-400">
                        <span>Tiến độ</span>
                        <span>{task.progress_percentage}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${isOverdue ? 'bg-[#FF4C51]' : 'bg-[#8C57FF]'}`}
                          style={{ width: `${task.progress_percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Production & Campaigns Live status list */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        
        {/* Production schedules */}
        <div className="bg-white border border-[#E6E6E8] rounded-2xl p-5 shadow-[0_4px_18px_rgba(15,10,32,0.03)]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-[#2F2B3D] flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-[#8C57FF]" />
              <span>LỊCH SẢN XUẤT MEDIA MỚI NHẤT</span>
            </h3>
            <span className="text-[10px] bg-[#8C57FF]/10 text-[#8C57FF] border border-[#8C57FF]/20 px-2 py-0.5 rounded-full font-bold">
              {schedules.length} lịch
            </span>
          </div>

          <div className="space-y-3">
            {schedules.slice(0, 3).map(s => {
              const staff = members.find(m => m.id === s.assignee);
              const isOverdue = s.status === 'Trễ hạn';
              return (
                <div key={s.production_id} className={`p-3 bg-[#F8F7FA] border ${isOverdue ? 'border-red-300 bg-red-50/50 shadow-[0_0_8px_rgba(239,68,68,0.05)]' : 'border-[#E6E6E8]'} rounded-xl flex items-start justify-between gap-3`}>
                  <div>
                    <span className="text-[9px] bg-white text-[#2F2B3D]/80 border border-[#E6E6E8] px-1.5 py-0.5 rounded font-mono font-bold">
                      {s.production_id} • {s.production_date}
                    </span>
                    <h4 className={`text-xs font-bold mt-1.5 leading-snug ${isOverdue ? 'text-red-600 font-extrabold' : 'text-[#2F2B3D]'}`}>{s.content}</h4>
                    <p className="text-xxs text-slate-400 mt-1">📌 Địa điểm: {s.location}</p>
                    <p className="text-xxs text-slate-500 mt-0.5">👤 Phụ trách: <strong>{staff?.name || s.assignee}</strong> • Loại: {s.production_type}</p>
                  </div>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider inline-flex items-center gap-0.5 ${
                    s.status === 'Đã duyệt'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : s.status === 'Đang thực hiện'
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : s.status === 'Trễ hạn'
                      ? 'bg-red-100 text-red-800 border border-red-200 animate-pulse font-black'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}>
                    {isOverdue && <AlertTriangle className="w-3 h-3 text-red-500 animate-pulse" />}
                    {s.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Campaign progress */}
        <div className="bg-white border border-[#E6E6E8] rounded-2xl p-5 shadow-[0_4px_18px_rgba(15,10,32,0.03)]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-[#2F2B3D] flex items-center gap-1.5">
              <Megaphone className="w-4 h-4 text-[#8C57FF]" />
              <span>CHIẾN DỊCH / CAMPAIGN ĐANG TRIỂN KHAI</span>
            </h3>
            <span className="text-[10px] bg-[#8C57FF]/10 text-[#8C57FF] border border-[#8C57FF]/20 px-2 py-0.5 rounded-full font-bold">
              {campaigns.length} Campaign
            </span>
          </div>

          <div className="space-y-3">
            {campaigns.slice(0, 3).map(c => {
              const manager = members.find(m => m.id === c.owner);
              const isCampaignOverdue = c.status === 'Trễ hạn' || (c.end_date < todayStr && c.status !== 'Hoàn thành' && c.status !== 'Hủy' && c.status !== 'Tạm dừng');
              return (
                <div key={c.campaign_id} className={`p-3 bg-[#F8F7FA] border ${isCampaignOverdue ? 'border-red-300 bg-red-50/50 shadow-[0_0_8px_rgba(239,68,68,0.05)]' : 'border-[#E6E6E8]'} rounded-xl`}>
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[9px] bg-white text-[#8C57FF] border border-[#8C57FF]/20 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                          {c.business_category}
                        </span>
                        {isCampaignOverdue && (
                          <span className="text-[9px] bg-red-100 text-red-700 border border-red-200 px-1.5 py-0.5 rounded font-black uppercase tracking-wider inline-flex items-center gap-0.5 animate-pulse">
                            <AlertTriangle className="w-2.5 h-2.5 text-red-500" />
                            Trễ hạn
                          </span>
                        )}
                      </div>
                      <h4 className={`text-xs font-extrabold mt-1.5 leading-snug ${isCampaignOverdue ? 'text-red-700' : 'text-[#2F2B3D]'}`}>{c.campaign_name}</h4>
                    </div>
                    <span className={`text-xxs font-black ${isCampaignOverdue ? 'text-red-500' : 'text-slate-400'}`}>{c.start_date} ~ {c.end_date}</span>
                  </div>
                  
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xxs text-slate-500 border-t border-slate-200/50 pt-2">
                    <div>🎯 Mục tiêu: <span className="text-[#2F2B3D]/80 font-semibold line-clamp-1">{c.goal}</span></div>
                    <div>👤 Chỉ huy: <span className="text-[#2F2B3D]/80 font-semibold">{manager?.name || c.owner}</span></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
