/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Target,
  Plus,
  Check,
  X,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  ChevronRight,
  Info,
  Lock,
  Globe,
  FileText,
  ThumbsUp,
  MessageSquare,
  TrendingUp,
  User,
  ExternalLink,
  Edit,
  Trash2,
  ListTodo,
  Link2,
  Unlink2,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import { Task, TeamMember, WorkPlan, TaskStatus, BusinessCategory } from '../types';

interface WeeklyPlansTabProps {
  plans: WorkPlan[];
  setPlans: React.Dispatch<React.SetStateAction<WorkPlan[]>>;
  tasks: Task[];
  members: TeamMember[];
  activeRole: 'Admin' | 'Manager' | 'Staff' | 'Viewer';
  currentUserEmail?: string;
}

// Predefined weeks for June & July 2026 to fit mock data perfectly
const AVAILABLE_WEEKS = [
  'Tuần 25 (15/06 - 21/06/2026)',
  'Tuần 26 (22/06 - 28/06/2026)',
  'Tuần 27 (29/06 - 05/07/2026)',
  'Tuần 28 (06/07 - 12/07/2026)',
  'Tuần 29 (13/07 - 19/07/2026)',
  'Tuần 30 (20/07 - 26/07/2026)'
];

export default function WeeklyPlansTab({
  plans,
  setPlans,
  tasks,
  members,
  activeRole,
  currentUserEmail,
}: WeeklyPlansTabProps) {
  // 1. Identify logged-in member
  const currentMember = members.find(m => {
    const email = m.email.toLowerCase();
    const userEmail = currentUserEmail?.toLowerCase() || '';
    return email === userEmail || (userEmail === 'anhovan.fu@gmail.com' && m.id === 'an_hv');
  });

  const currentMemberId = currentMember?.id || 'an_hv';
  const isManagerOrAdmin = activeRole === 'Manager' || activeRole === 'Admin' || currentMemberId === 'an_hv';

  // 2. Local filters and selections
  const [selectedWeek, setSelectedWeek] = useState<string>(AVAILABLE_WEEKS[1]); // Default to Tuần 26
  const [selectedMemberId, setSelectedMemberId] = useState<string>(
    isManagerOrAdmin ? 'all' : currentMemberId
  );

  // Sub-tab selection state: 'objectives' vs 'daily'
  const [activeSubTab, setActiveSubTab] = useState<'objectives' | 'daily'>('objectives');
  // Selected day index (0-6) for detailed list view
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  // Daily view layout mode: 'grid' or 'list'
  const [dailyViewMode, setDailyViewMode] = useState<'grid' | 'list'>('grid');

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<WorkPlan | null>(null);

  // Form Fields
  const [formData, setFormData] = useState({
    notes: '',
    visibility: 'Công khai' as 'Công khai' | 'Riêng tư'
  });

  // Structured Objectives state inside the modal
  const [modalObjectives, setModalObjectives] = useState<{
    id: string;
    title: string;
    key_result: string;
    linked_task_ids: string[];
  }[]>([]);

  // Task search filter inside the modal
  const [taskSearchQuery, setTaskSearchQuery] = useState('');

  // Review state
  const [reviewFeedback, setReviewFeedback] = useState('');

  // 3. Helper to parse week start/end dates
  const parseWeekDates = (periodName: string) => {
    const match = periodName.match(/Tuần\s+\d+\s*\((\d{2})\/(\d{2})\s*-\s*(\d{2})\/(\d{2})\/(\d{4})\)/i);
    if (match) {
      const [_, startDay, startMonth, endDay, endMonth, year] = match;
      const start = `${year}-${startMonth}-${startDay}`;
      const end = `${year}-${endMonth}-${endDay}`;
      return { start, end };
    }
    return null;
  };

  // 4. Extract plans based on current filters
  const filteredPlans = plans.filter(p => {
    if (p.plan_type !== 'Tuần') return false;
    
    // Filter by week
    if (p.period_name !== selectedWeek) return false;

    // Filter by member
    if (selectedMemberId !== 'all' && p.creator_id !== selectedMemberId) return false;

    // Visibility rules for an_hv
    if (p.creator_id === 'an_hv' && p.visibility === 'Riêng tư') {
      if (!isManagerOrAdmin && p.creator_id !== currentMemberId) {
        return false; // Hidden from non-managers
      }
    }

    return true;
  });

  // Get list of tasks available for linking in the modal, filtered by creator
  const availableTasks = useMemo(() => {
    const planCreatorId = editingPlan ? editingPlan.creator_id : currentMemberId;
    return tasks.filter(t => {
      // Prioritize tasks assigned to this creator, or where they collaborate
      const isRelated = t.assignee === planCreatorId || t.collaborators.includes(planCreatorId);
      
      // Match with search query if any
      if (taskSearchQuery.trim()) {
        const query = taskSearchQuery.toLowerCase();
        return (
          t.task_id.toLowerCase().includes(query) ||
          t.task_name.toLowerCase().includes(query) ||
          t.business_category.toLowerCase().includes(query)
        );
      }
      return isRelated;
    });
  }, [tasks, editingPlan, currentMemberId, taskSearchQuery]);

  // 5. Open plan editor modal
  const openCreateModal = (plan?: WorkPlan) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({
        notes: plan.notes || '',
        visibility: plan.visibility || 'Công khai'
      });
      
      // Load objectives if they exist, otherwise initialize from text
      if (plan.objectives && plan.objectives.length > 0) {
        setModalObjectives(plan.objectives);
      } else {
        // Fallback adapter: parse existing text goals into an objective
        setModalObjectives([
          {
            id: 'obj-1',
            title: plan.target_goals || 'Mục tiêu chính',
            key_result: plan.key_results || 'Đo lường KPIs',
            linked_task_ids: []
          }
        ]);
      }
    } else {
      setEditingPlan(null);
      setFormData({
        notes: '',
        visibility: 'Công khai'
      });
      // Start with one empty objective ready to fill
      setModalObjectives([
        {
          id: 'obj-1',
          title: '',
          key_result: '',
          linked_task_ids: []
        }
      ]);
    }
    setTaskSearchQuery('');
    setIsCreateModalOpen(true);
  };

  // Add a new empty objective in the modal
  const handleAddObjective = () => {
    setModalObjectives(prev => [
      ...prev,
      {
        id: `obj-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        title: '',
        key_result: '',
        linked_task_ids: []
      }
    ]);
  };

  // Remove an objective in the modal
  const handleRemoveObjective = (index: number) => {
    if (modalObjectives.length <= 1) {
      alert('Kế hoạch tuần phải có ít nhất 1 mục tiêu trọng điểm.');
      return;
    }
    setModalObjectives(prev => prev.filter((_, i) => i !== index));
  };

  // Update objective fields
  const handleUpdateObjective = (index: number, fields: Partial<typeof modalObjectives[0]>) => {
    setModalObjectives(prev => prev.map((obj, i) => i === index ? { ...obj, ...fields } : obj));
  };

  // Toggle a task link to a specific objective
  const handleToggleTaskLink = (objIndex: number, taskId: string) => {
    setModalObjectives(prev => prev.map((obj, i) => {
      if (i !== objIndex) return obj;
      const isLinked = obj.linked_task_ids.includes(taskId);
      return {
        ...obj,
        linked_task_ids: isLinked
          ? obj.linked_task_ids.filter(id => id !== taskId)
          : [...obj.linked_task_ids, taskId]
      };
    }));
  };

  // 6. Handle Plan Submit (Create / Edit)
  const handleSubmitPlan = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    const hasEmptyObj = modalObjectives.some(obj => !obj.title.trim() || !obj.key_result.trim());
    if (hasEmptyObj) {
      alert('Vui lòng điền đầy đủ tiêu đề và kết quả then chốt cho tất cả các mục tiêu.');
      return;
    }

    const planCreatorId = editingPlan ? editingPlan.creator_id : currentMemberId;
    const calculatedVisibility = planCreatorId === 'an_hv' ? formData.visibility : 'Công khai';

    // Auto-generate text fallbacks for compatibility with legacy components
    const targetGoalsText = modalObjectives.map((o, idx) => `${idx + 1}. ${o.title}`).join('\n');
    const keyResultsText = modalObjectives.map((o, idx) => `${idx + 1}. ${o.key_result}`).join('\n');
    const tasksListText = modalObjectives.map((o, idx) => {
      const linked = tasks.filter(t => o.linked_task_ids.includes(t.task_id));
      const linkedStr = linked.map(t => `- ${t.task_name} (${t.task_id})`).join('\n  ');
      return `Mục tiêu ${idx + 1}:\n  ${linkedStr || 'Chưa liên kết công việc cụ thể'}`;
    }).join('\n\n');

    if (editingPlan) {
      setPlans(prev => prev.map(p => p.plan_id === editingPlan.plan_id ? {
        ...p,
        target_goals: targetGoalsText,
        key_results: keyResultsText,
        tasks_list: tasksListText,
        notes: formData.notes,
        visibility: calculatedVisibility,
        objectives: modalObjectives
      } : p));
    } else {
      // Check if plan already exists for this creator and week
      const exists = plans.some(p => p.creator_id === currentMemberId && p.period_name === selectedWeek && p.plan_type === 'Tuần');
      if (exists) {
        alert(`Bạn đã lập kế hoạch cho ${selectedWeek} rồi. Vui lòng chỉnh sửa kế hoạch hiện có thay vì tạo mới.`);
        return;
      }

      const newPlan: WorkPlan = {
        plan_id: `PLN-${String(plans.length + 1).padStart(3, '0')}`,
        creator_id: currentMemberId,
        plan_type: 'Tuần',
        period_name: selectedWeek,
        target_goals: targetGoalsText,
        key_results: keyResultsText,
        tasks_list: tasksListText,
        notes: formData.notes,
        reviewer_id: 'an_hv',
        status: 'Bản nháp',
        created_at: new Date().toISOString().split('T')[0],
        visibility: calculatedVisibility,
        objectives: modalObjectives
      };
      setPlans(prev => [newPlan, ...prev]);
    }

    setIsCreateModalOpen(false);
  };

  // Delete plan handler
  const handleDeletePlan = (planId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa kế hoạch tuần này không?')) {
      setPlans(prev => prev.filter(p => p.plan_id !== planId));
    }
  };

  // 7. Workflow Actions (Submit, Approve, Request changes)
  const handleUpdateStatus = (planId: string, newStatus: WorkPlan['status'], notes?: string) => {
    setPlans(prev => prev.map(p => {
      if (p.plan_id === planId) {
        return {
          ...p,
          status: newStatus,
          notes: notes !== undefined ? notes : p.notes
        };
      }
      return p;
    }));
    setReviewFeedback('');
  };

  // 8. Helper to get member details
  const getMemberDetails = (id: string) => {
    return members.find(m => m.id === id);
  };

  // 9. Side-by-side performance matching logic for a plan
  const getPerformanceMetrics = (plan: WorkPlan) => {
    const range = parseWeekDates(plan.period_name);
    if (!range) return { completedTasks: [], pendingTasks: [], totalCount: 0, completedCount: 0, rate: 0 };

    const { start, end } = range;

    // Filter tasks assigned to creator or collaborator that fall within this week
    const weekTasks = tasks.filter(t => {
      // Assigned to creator
      const isAssignee = t.assignee === plan.creator_id || t.collaborators.includes(plan.creator_id);
      if (!isAssignee) return false;

      // Completed or Active in this week
      const compDate = t.actual_completion_date || '';
      const deadline = t.deadline || '';
      const start_date = t.start_date || '';

      const isCompletedInWeek = compDate && compDate >= start && compDate <= end;
      const isPlannedInWeek = (deadline && deadline >= start && deadline <= end) || 
                              (start_date && start_date >= start && start_date <= end);

      return isCompletedInWeek || isPlannedInWeek;
    });

    const completedTasks = weekTasks.filter(t => t.status === 'Hoàn thành' && t.actual_completion_date && t.actual_completion_date >= start && t.actual_completion_date <= end);
    const pendingTasks = weekTasks.filter(t => t.status !== 'Hoàn thành');

    const totalCount = weekTasks.length;
    const completedCount = completedTasks.length;
    const rate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return {
      completedTasks,
      pendingTasks,
      totalCount,
      completedCount,
      rate
    };
  };

  // 10. Generate dates of the week
  const getWeekDates = (startStr: string) => {
    const [year, month, day] = startStr.split('-').map(Number);
    const dates = [];
    const dayNames = [
      'Thứ Hai',
      'Thứ Ba',
      'Thứ Tư',
      'Thứ Năm',
      'Thứ Sáu',
      'Thứ Bảy',
      'Chủ Nhật'
    ];
    for (let i = 0; i < 7; i++) {
      const d = new Date(year, month - 1, day + i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      dates.push({
        name: dayNames[i],
        dateStr: `${yyyy}-${mm}-${dd}`,
        displayDate: `${dd}/${mm}`
      });
    }
    return dates;
  };

  const weekDates = useMemo(() => {
    const range = parseWeekDates(selectedWeek);
    if (!range) return [];
    return getWeekDates(range.start);
  }, [selectedWeek]);

  // 11. Fetch tasks for a specific date
  const getTasksForDate = (dateStr: string, memberId: string) => {
    return tasks.filter(t => {
      // Filter by assignee / collaborator
      const isAssigned = memberId === 'all' 
        ? true 
        : (t.assignee === memberId || t.collaborators.includes(memberId));
      if (!isAssigned) return false;

      // Active duration check
      const start = t.start_date || t.deadline || '';
      const end = t.deadline || t.start_date || '';
      
      if (!start && !end) return false;

      // Active if dateStr falls in range
      const isActive = dateStr >= start && dateStr <= end;

      // Or actually completed on this day
      const isCompletedOnDay = t.actual_completion_date === dateStr;

      return isActive || isCompletedOnDay;
    });
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-y-auto p-6">
      
      {/* Top filter rail */}
      <div className="bg-white border border-[#E6E6E8] rounded-xl p-4 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[0_4px_18px_rgba(15,10,32,0.03)]">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          {/* Week selector */}
          <div className="flex items-center gap-2 bg-slate-50 border border-[#E6E6E8] rounded-lg px-3 py-1.5">
            <Calendar className="w-4 h-4 text-[#8C57FF]" />
            <span className="text-xs font-bold text-[#2F2B3D]/70 uppercase">Tuần:</span>
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
              className="bg-transparent border-none text-xs font-extrabold text-[#2F2B3D] focus:outline-none pr-2 cursor-pointer"
            >
              {AVAILABLE_WEEKS.map(w => (
                <option key={w} value={w}>{w.split(' ')[0] + ' ' + w.split(' ')[1]}</option>
              ))}
            </select>
          </div>

          {/* Member selector (for Managers) */}
          {isManagerOrAdmin ? (
            <div className="flex items-center gap-2 bg-slate-50 border border-[#E6E6E8] rounded-lg px-3 py-1.5">
              <User className="w-4 h-4 text-[#8C57FF]" />
              <span className="text-xs font-bold text-[#2F2B3D]/70 uppercase">Nhân viên:</span>
              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="bg-transparent border-none text-xs font-extrabold text-[#2F2B3D] focus:outline-none pr-2 cursor-pointer"
              >
                <option value="all">Tất cả nhân sự</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>{m.name} ({m.role.split(' ').pop()})</option>
                ))}
              </select>
            </div>
          ) : (
            <div className="bg-indigo-50/50 border border-[#8C57FF]/20 text-[#8C57FF] px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-bold">
              <User className="w-3.5 h-3.5" />
              <span>Đang xem kế hoạch của bạn: {currentMember?.name}</span>
            </div>
          )}
        </div>

        {/* Action Button: Create plan (visible to staff/owners if no plan for this week yet) */}
        {!isManagerOrAdmin && !filteredPlans.some(p => p.creator_id === currentMemberId) && (
          <button
            onClick={() => openCreateModal()}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-[#8C57FF] hover:bg-[#7A40F2] text-white rounded-lg text-xs font-black shadow-[0_4px_12px_rgba(140,87,255,0.30)] transition"
          >
            <Plus className="w-4 h-4" />
            <span>Lập Kế Hoạch {selectedWeek.split(' ')[0] + ' ' + selectedWeek.split(' ')[1]}</span>
          </button>
        )}
      </div>

      {/* Sub-Tabs Selector */}
      <div className="flex border-b border-[#E6E6E8] mb-6 gap-6">
        <button
          type="button"
          onClick={() => setActiveSubTab('objectives')}
          className={`pb-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 px-1 flex items-center gap-2 ${
            activeSubTab === 'objectives'
              ? 'border-[#8C57FF] text-[#8C57FF]'
              : 'border-transparent text-[#2F2B3D]/60 hover:text-[#2F2B3D]'
          }`}
        >
          <Target className="w-4 h-4" />
          Mục tiêu & Đánh giá hiệu suất tuần
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('daily')}
          className={`pb-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 px-1 flex items-center gap-2 ${
            activeSubTab === 'daily'
              ? 'border-[#8C57FF] text-[#8C57FF]'
              : 'border-transparent text-[#2F2B3D]/60 hover:text-[#2F2B3D]'
          }`}
        >
          <ListTodo className="w-4 h-4" />
          Lịch biểu công việc hàng ngày
        </button>
      </div>

      {activeSubTab === 'daily' ? (
        <div className="space-y-6">
          {/* Header row for daily schedule */}
          <div className="bg-white border border-[#E6E6E8] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_4px_18px_rgba(15,10,32,0.03)]">
            <div>
              <h3 className="text-sm font-black text-[#2F2B3D] uppercase tracking-wide flex items-center gap-2">
                <ListTodo className="w-4 h-4 text-[#8C57FF]" />
                Lịch Biểu Phân Chia Công Việc Hàng Ngày Trong Tuần
              </h3>
              <p className="text-xxs text-slate-500 mt-0.5">
                Xem chi tiết phân bổ công việc theo từng ngày của vị trí được chọn trong <span className="font-bold">{selectedWeek}</span>
              </p>
            </div>

            {/* View Mode Toggle: Grid vs List */}
            <div className="flex bg-slate-100 p-1 rounded-lg self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setDailyViewMode('grid')}
                className={`px-3 py-1 text-xxs font-black uppercase rounded-md transition ${
                  dailyViewMode === 'grid'
                    ? 'bg-white text-[#8C57FF] shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Lưới 7 ngày (Grid)
              </button>
              <button
                type="button"
                onClick={() => setDailyViewMode('list')}
                className={`px-3 py-1 text-xxs font-black uppercase rounded-md transition ${
                  dailyViewMode === 'list'
                    ? 'bg-white text-[#8C57FF] shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Chi tiết 1 ngày (List)
              </button>
            </div>
          </div>

          {/* Render Mode 1: GRID VIEW (7 columns) */}
          {dailyViewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-7 gap-4">
              {weekDates.map((day, dIdx) => {
                const dayTasks = getTasksForDate(day.dateStr, selectedMemberId);
                const doneTasksCount = dayTasks.filter(t => t.status === 'Hoàn thành').length;

                return (
                  <div
                    key={day.dateStr}
                    onClick={() => {
                      setSelectedDayIndex(dIdx);
                      setDailyViewMode('list');
                    }}
                    className="bg-white border border-[#E6E6E8] rounded-2xl p-4 shadow-sm hover:border-[#8C57FF]/40 hover:shadow-[0_4px_15px_rgba(140,87,255,0.05)] cursor-pointer transition flex flex-col min-h-[300px]"
                  >
                    {/* Day header */}
                    <div className="border-b border-slate-100 pb-2 mb-3">
                      <span className="text-[10px] font-black text-[#8C57FF] uppercase tracking-wide block">
                        {day.name}
                      </span>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-xs font-black text-[#2F2B3D]">{day.displayDate}</span>
                        <span className="text-[9px] font-extrabold px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                          {dayTasks.length} việc
                        </span>
                      </div>
                    </div>

                    {/* Day Task List */}
                    <div className="space-y-2 flex-1 overflow-y-auto max-h-96 pr-0.5">
                      {dayTasks.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center py-10 text-center text-slate-400">
                          <Check className="w-5 h-5 text-emerald-400 mb-1 opacity-40" />
                          <span className="text-[10px] font-bold">Không có việc</span>
                        </div>
                      ) : (
                        dayTasks.map(t => {
                          const taskAssignee = members.find(m => m.id === t.assignee);
                          return (
                            <div
                              key={t.task_id}
                              className={`p-2 rounded-xl border text-left space-y-1 ${
                                t.status === 'Hoàn thành'
                                  ? 'bg-emerald-50/20 border-emerald-100/50'
                                  : t.status === 'Trễ hạn'
                                  ? 'bg-red-50/20 border-red-100/50'
                                  : 'bg-slate-50/50 border-slate-100'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-[8px] font-bold text-slate-400">{t.task_id}</span>
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                  t.status === 'Hoàn thành' ? 'bg-[#56CA00]' :
                                  (t.status === 'Đang làm' || t.status === 'Chờ duyệt') ? 'bg-[#16B1FF]' :
                                  t.status === 'Trễ hạn' ? 'bg-[#FF4C51]' : 'bg-slate-400'
                                }`} />
                              </div>
                              <h4 className="text-[10px] font-extrabold text-[#2F2B3D] line-clamp-2 leading-snug">
                                {t.task_name}
                              </h4>
                              {selectedMemberId === 'all' && (
                                <div className="text-[8px] text-slate-500 font-bold flex items-center gap-1 pt-0.5">
                                  <User className="w-2 h-2 text-[#8C57FF]" />
                                  <span className="truncate">{taskAssignee?.name}</span>
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Column footer progress */}
                    {dayTasks.length > 0 && (
                      <div className="pt-2 mt-2 border-t border-slate-50">
                        <div className="flex justify-between items-center text-[8px] text-slate-500 font-bold mb-1">
                          <span>Đạt: {doneTasksCount}/{dayTasks.length}</span>
                          <span>{Math.round((doneTasksCount / dayTasks.length) * 100)}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
                          <div
                            className="bg-[#56CA00] h-1 rounded-full transition-all duration-300"
                            style={{ width: `${(doneTasksCount / dayTasks.length) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Render Mode 2: DETAILED SINGLE DAY VIEW (with tabs) */}
          {dailyViewMode === 'list' && (
            <div className="space-y-6">
              {/* Day Quick selector tabs */}
              <div className="flex flex-wrap gap-2 bg-slate-50 p-2 border border-[#E6E6E8] rounded-2xl">
                {weekDates.map((day, index) => {
                  const dayTasks = getTasksForDate(day.dateStr, selectedMemberId);
                  const isSelected = selectedDayIndex === index;
                  return (
                    <button
                      key={day.dateStr}
                      type="button"
                      onClick={() => setSelectedDayIndex(index)}
                      className={`flex-1 min-w-[90px] px-3 py-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-0.5 ${
                        isSelected
                          ? 'bg-[#8C57FF] border-[#8C57FF] text-white shadow-sm'
                          : 'bg-white border-[#E6E6E8] text-[#2F2B3D] hover:bg-slate-50'
                      }`}
                    >
                      <span className={`text-[9px] font-black uppercase ${isSelected ? 'text-white/80' : 'text-[#8C57FF]'}`}>
                        {day.name}
                      </span>
                      <span className="text-xs font-black">{day.displayDate}</span>
                      <span className={`text-[8px] font-extrabold px-1.5 py-0.2 rounded-full mt-1 ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {dayTasks.length} việc
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Detailed Checklist Card of Selected Day */}
              {(() => {
                const day = weekDates[selectedDayIndex];
                if (!day) return null;
                const dayTasks = getTasksForDate(day.dateStr, selectedMemberId);
                const completedTasks = dayTasks.filter(t => t.status === 'Hoàn thành');

                return (
                  <div className="bg-white border border-[#E6E6E8] rounded-2xl shadow-sm overflow-hidden">
                    {/* Header */}
                    <div className="bg-slate-50 border-b border-[#E6E6E8] px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-[#8C57FF] uppercase tracking-wider">{day.name}</span>
                          <span className="text-xs font-bold text-slate-500">• Ngày {day.dateStr}</span>
                        </div>
                        <p className="text-xxs text-slate-500 mt-0.5">
                          Danh sách chi tiết đầu việc, mục tiêu liên kết và kết quả báo cáo thực thi của ngày.
                        </p>
                      </div>

                      {/* Day performance bar */}
                      <div className="flex items-center gap-3 bg-white border border-[#E6E6E8] px-4 py-2 rounded-xl">
                        <div className="text-right">
                          <span className="text-[9px] text-slate-400 font-black block uppercase">Tiến độ ngày</span>
                          <span className="text-xs font-black text-[#2F2B3D]">
                            Đã hoàn tất {completedTasks.length}/{dayTasks.length} việc
                          </span>
                        </div>
                        <div className="w-12 h-12 rounded-full border-2 border-slate-100 flex items-center justify-center text-xs font-black text-[#56CA00] bg-slate-50">
                          {dayTasks.length > 0 ? Math.round((completedTasks.length / dayTasks.length) * 100) : 0}%
                        </div>
                      </div>
                    </div>

                    {/* Task checklist */}
                    <div className="p-6">
                      {dayTasks.length === 0 ? (
                        <div className="py-16 text-center">
                          <div className="w-12 h-12 bg-emerald-50 text-[#56CA00] rounded-full flex items-center justify-center mx-auto mb-3">
                            <Check className="w-6 h-6" />
                          </div>
                          <h4 className="text-xs font-black text-[#2F2B3D] uppercase tracking-wider">Không có đầu việc nào được lên lịch</h4>
                          <p className="text-xxs text-slate-500 mt-1 max-w-sm mx-auto">
                            Nhân sự chưa có đầu việc nào được lên lịch bắt đầu, đang chạy, hoặc có hạn chót vào ngày này.
                          </p>
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-100">
                          {dayTasks.map(task => {
                            const taskAssignee = members.find(m => m.id === task.assignee);
                            
                            // Find which objective (if any) this task is linked to in the current week's plans
                            const linkedPlan = plans.find(p => p.period_name === selectedWeek && p.plan_type === 'Tuần' && p.objectives?.some(o => o.linked_task_ids?.includes(task.task_id)));
                            const linkedObjective = linkedPlan?.objectives?.find(o => o.linked_task_ids?.includes(task.task_id));

                            return (
                              <div key={task.task_id} className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row items-start justify-between gap-4 hover:bg-slate-50/40 px-2 rounded-xl transition">
                                <div className="space-y-2 flex-1 min-w-0">
                                  {/* Task Name and Category Tag */}
                                  <div className="flex items-start gap-2.5">
                                    {/* Beautiful Task checkbox icon */}
                                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                      task.status === 'Hoàn thành'
                                        ? 'bg-[#56CA00] border-[#56CA00] text-white'
                                        : 'border-slate-300 hover:border-[#8C57FF]'
                                    }`}>
                                      {task.status === 'Hoàn thành' && <Check className="w-3.5 h-3.5" />}
                                    </div>

                                    <div className="min-w-0">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-mono text-[9px] font-extrabold text-slate-400">
                                          {task.task_id}
                                        </span>
                                        <span className={`font-extrabold text-xs leading-snug ${
                                          task.status === 'Hoàn thành' ? 'text-slate-400 line-through' : 'text-[#2F2B3D]'
                                        }`}>
                                          {task.task_name}
                                        </span>
                                        <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-extrabold uppercase">
                                          {task.business_category}
                                        </span>
                                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                                          task.priority === 'Khẩn cấp' ? 'bg-red-50 text-red-600 border border-red-100' :
                                          task.priority === 'Cao' ? 'bg-amber-50 text-amber-600' :
                                          'bg-blue-50 text-blue-600'
                                        }`}>
                                          {task.priority}
                                        </span>
                                      </div>

                                      {/* Task Description */}
                                      {task.description && (
                                        <p className="text-xxs text-slate-500 mt-1.5 font-medium leading-relaxed max-w-2xl">
                                          {task.description}
                                        </p>
                                      )}

                                      {/* Linked Objective Indicator */}
                                      {linkedObjective ? (
                                        <div className="inline-flex items-center gap-1.5 mt-2 bg-[#8C57FF]/5 border border-[#8C57FF]/10 text-[#8C57FF] px-2 py-1 rounded-lg text-[9px] font-extrabold">
                                          <Target className="w-3 h-3" />
                                          <span>Đồng bộ: Mục tiêu "{linkedObjective.title}"</span>
                                        </div>
                                      ) : (
                                        <div className="inline-flex items-center gap-1.5 mt-2 bg-slate-50 border border-slate-100 text-slate-400 px-2 py-1 rounded-lg text-[9px] font-bold">
                                          <HelpCircle className="w-3 h-3 text-slate-300" />
                                          <span>Chưa liên kết mục tiêu trọng điểm tuần</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Task Stats & Details panel on the right */}
                                <div className="flex flex-row md:flex-col items-end gap-3 flex-shrink-0 w-full md:w-auto md:text-right border-t md:border-t-0 border-dashed border-slate-100 pt-3 md:pt-0 justify-between sm:justify-end">
                                  {/* Status badge */}
                                  <div className="space-y-1">
                                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase inline-block ${
                                      task.status === 'Hoàn thành' ? 'bg-[#56CA00]/10 text-[#56CA00] border border-[#56CA00]/20' :
                                      (task.status === 'Đang làm' || task.status === 'Chờ duyệt') ? 'bg-[#16B1FF]/10 text-[#16B1FF] border border-[#16B1FF]/20' :
                                      task.status === 'Trễ hạn' ? 'bg-[#FF4C51]/10 text-[#FF4C51] border border-[#FF4C51]/20' :
                                      'bg-slate-100 text-slate-600'
                                    }`}>
                                      {task.status}
                                    </span>
                                    {task.progress_percentage !== undefined && (
                                      <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
                                        Tiến độ: {task.progress_percentage}%
                                      </span>
                                    )}
                                  </div>

                                  {/* Staff info */}
                                  <div className="text-left md:text-right">
                                    <span className="text-[9px] text-slate-400 font-extrabold block uppercase">Người thực hiện</span>
                                    <div className="flex items-center gap-1.5 mt-0.5 justify-end">
                                      <div className="w-4 h-4 rounded-full bg-[#8C57FF]/10 text-[#8C57FF] flex items-center justify-center text-[9px] font-black">
                                        {taskAssignee?.name.split(' ').pop()?.slice(0, 1)}
                                      </div>
                                      <span className="text-xxs font-extrabold text-slate-700">{taskAssignee?.name}</span>
                                    </div>
                                  </div>

                                  {/* Expected Delivery vs Actual Date */}
                                  <div className="text-left md:text-right text-[9px] text-slate-400 font-bold space-y-0.5">
                                    <div>Thời gian: <span className="text-[#2F2B3D]">{task.start_date || 'N/A'} - {task.deadline}</span></div>
                                    {task.actual_completion_date && (
                                      <div className="text-emerald-600">Đã xong: {task.actual_completion_date}</div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      ) : (
        /* Main content Area */
        filteredPlans.length === 0 ? (
        <div className="bg-white border border-[#E6E6E8] rounded-xl p-12 text-center shadow-sm flex flex-col items-center justify-center">
          <div className="w-14 h-14 bg-[#8C57FF]/10 text-[#8C57FF] rounded-full flex items-center justify-center mb-4">
            <Target className="w-7 h-7" />
          </div>
          <h3 className="text-base font-black text-[#2F2B3D] uppercase tracking-wide">Chưa có kế hoạch tuần này</h3>
          <p className="text-xs text-slate-500 mt-2 max-w-md">
            Nhân viên chưa tạo hoặc gửi mục tiêu tuần cho <span className="font-bold">{selectedWeek}</span>. 
            {!isManagerOrAdmin && ' Hãy bấm nút Lập kế hoạch bên dưới để đề xuất các mục tiêu trọng điểm (Objectives) và liên kết các công việc thực tế của tuần.'}
          </p>
          {!isManagerOrAdmin && (
            <button
              onClick={() => openCreateModal()}
              className="mt-5 flex items-center gap-1.5 px-5 py-2 bg-[#8C57FF] hover:bg-[#7A40F2] text-white rounded-lg text-xs font-extrabold shadow-md transition"
            >
              <Plus className="w-4 h-4" />
              <span>Lập Kế Hoạch Ngay</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {filteredPlans.map(plan => {
            const creator = getMemberDetails(plan.creator_id);
            const { completedTasks, pendingTasks, totalCount, completedCount, rate } = getPerformanceMetrics(plan);

            // Fetch actual objectives array
            const objectivesList = plan.objectives && plan.objectives.length > 0 
              ? plan.objectives 
              : [
                  {
                    id: 'fallback-obj',
                    title: plan.target_goals,
                    key_result: plan.key_results,
                    linked_task_ids: []
                  }
                ];

            return (
              <div
                key={plan.plan_id}
                className="bg-white border border-[#E6E6E8] rounded-2xl shadow-[0_4px_25px_rgba(15,10,32,0.04)] overflow-hidden"
              >
                {/* Card Header with creator name, status and visibility */}
                <div className="bg-slate-50 border-b border-[#E6E6E8] px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#8C57FF]/10 text-[#8C57FF] flex items-center justify-center font-black text-sm border border-[#8C57FF]/20">
                      {creator?.name.split(' ').pop()?.slice(0, 2)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-[#2F2B3D]">{creator?.name || plan.creator_id}</span>
                        <span className="text-xxs px-2 py-0.5 bg-slate-200/60 text-slate-600 rounded-full font-bold">
                          {creator?.role || 'Nhân sự'}
                        </span>
                        {plan.creator_id === 'an_hv' && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-indigo-500 font-bold bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                            {plan.visibility === 'Riêng tư' ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                            {plan.visibility || 'Riêng tư'}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                        Đã lập lúc {plan.created_at} • {plan.period_name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Status Badge */}
                    <span className={`px-3 py-1 rounded-full text-xxs font-black uppercase tracking-wider ${
                      plan.status === 'Đã chốt' ? 'bg-[#56CA00]/10 text-[#56CA00] border border-[#56CA00]/20' :
                      plan.status === 'Đang triển khai' ? 'bg-[#16B1FF]/10 text-[#16B1FF] border border-[#16B1FF]/20' :
                      plan.status === 'Đã hoàn thành' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' :
                      'bg-amber-50 text-amber-600 border border-amber-100'
                    }`}>
                      {plan.status === 'Đã chốt' ? 'Trưởng phòng đã duyệt' : plan.status}
                    </span>

                    {/* Staff actions on their own plans */}
                    {plan.creator_id === currentMemberId && (plan.status === 'Bản nháp' || plan.status === 'Đang triển khai') && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openCreateModal(plan)}
                          className="p-1.5 text-slate-600 hover:text-[#8C57FF] bg-white border border-[#E6E6E8] rounded hover:bg-[#8C57FF]/5 transition"
                          title="Chỉnh sửa mục tiêu & liên kết task"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        {plan.status === 'Bản nháp' && (
                          <button
                            onClick={() => handleUpdateStatus(plan.plan_id, 'Đang triển khai')}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-[#8C57FF] hover:bg-[#7A40F2] text-white rounded text-xxs font-bold transition"
                          >
                            <ThumbsUp className="w-3 h-3" />
                            <span>Gửi duyệt</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleDeletePlan(plan.plan_id)}
                          className="p-1.5 text-red-500 hover:text-red-700 bg-red-50 border border-red-100 rounded transition"
                          title="Xóa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Side-by-Side Bento Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-[#E6E6E8]">
                  
                  {/* LEFT PANEL: Target Goals & Planned Actions */}
                  <div className="p-6 bg-white space-y-6">
                    <div className="flex items-center gap-2 text-xs font-black text-[#8C57FF] uppercase tracking-wider border-b border-slate-100 pb-2">
                      <Target className="w-4 h-4" />
                      <span>DANH SÁCH MỤC TIÊU TRỌNG ĐIỂM (OBJECTIVES)</span>
                    </div>

                    <div className="space-y-6">
                      {objectivesList.map((obj, index) => {
                        // Find concrete tasks linked to this objective
                        const linkedTasks = tasks.filter(t => obj.linked_task_ids?.includes(t.task_id));
                        const compCount = linkedTasks.filter(t => t.status === 'Hoàn thành').length;
                        const totalLinkedCount = linkedTasks.length;
                        const taskRate = totalLinkedCount > 0 ? Math.round((compCount / totalLinkedCount) * 100) : 0;

                        return (
                          <div 
                            key={obj.id || index}
                            className="border border-[#E6E6E8] rounded-2xl p-4 space-y-3.5 bg-slate-50/40 relative overflow-hidden shadow-sm"
                          >
                            {/* Decorative Top Line */}
                            <div className="absolute top-0 left-0 right-0 h-1 bg-[#8C57FF]" />

                            <div className="flex items-start justify-between gap-3">
                              <div className="space-y-1">
                                <span className="inline-block px-2 py-0.5 bg-[#8C57FF]/10 text-[#8C57FF] text-[9px] font-black uppercase rounded">
                                  Mục tiêu {index + 1}
                                </span>
                                <h4 className="text-xs font-black text-[#2F2B3D] uppercase tracking-wide leading-snug">
                                  {obj.title}
                                </h4>
                              </div>
                            </div>

                            {/* Key Results */}
                            <div className="bg-white border border-[#E6E6E8] rounded-xl p-3">
                              <span className="text-[10px] text-slate-500 font-extrabold uppercase block mb-1">
                                Kết quả then chốt (KPI)
                              </span>
                              <p className="text-xs text-[#2F2B3D]/80 font-semibold leading-relaxed">
                                {obj.key_result}
                              </p>
                            </div>

                            {/* Linked tasks display */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase">
                                <span>Công việc liên kết thực thi:</span>
                                <span className="text-[#8C57FF]">
                                  Đã hoàn thành {compCount}/{totalLinkedCount}
                                </span>
                              </div>

                              {linkedTasks.length === 0 ? (
                                <div className="text-center py-4 border border-dashed border-[#E6E6E8] rounded-xl bg-white text-slate-400 text-xxs font-bold">
                                  Chưa liên kết công việc thực tế nào.
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  {linkedTasks.map(task => (
                                    <div 
                                      key={task.task_id}
                                      className="bg-white border border-[#E6E6E8] rounded-xl p-2.5 flex items-center justify-between gap-2 hover:border-[#8C57FF]/40 transition shadow-xxs"
                                    >
                                      <div className="min-w-0">
                                        <div className="flex items-center gap-1.5">
                                          <span className="font-mono text-[9px] font-bold text-slate-400 flex-shrink-0">
                                            {task.task_id}
                                          </span>
                                          <span className="font-extrabold text-xs text-[#2F2B3D] truncate block">
                                            {task.task_name}
                                          </span>
                                        </div>
                                        <span className="text-[9px] text-slate-400 font-bold">
                                          Hạn: {task.deadline} • Tiến độ: {task.progress_percentage}%
                                        </span>
                                      </div>

                                      <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold flex-shrink-0 uppercase ${
                                        task.status === 'Hoàn thành' ? 'bg-[#56CA00]/10 text-[#56CA00]' :
                                        (task.status === 'Đang làm' || task.status === 'Chờ duyệt') ? 'bg-[#16B1FF]/10 text-[#16B1FF]' :
                                        task.status === 'Trễ hạn' ? 'bg-[#FF4C51]/10 text-[#FF4C51]' :
                                        'bg-slate-100 text-slate-600'
                                      }`}>
                                        {task.status}
                                      </span>
                                    </div>
                                  ))}

                                  {/* Progress bar of this specific objective */}
                                  <div className="pt-1">
                                    <div className="w-full bg-slate-200 rounded-full h-1 overflow-hidden">
                                      <div 
                                        className="bg-[#8C57FF] h-1 rounded-full transition-all duration-300" 
                                        style={{ width: `${taskRate}%` }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Plan notes / comments */}
                    {plan.notes && (
                      <div className="bg-amber-50/50 border border-amber-200/60 rounded-xl p-3.5 flex gap-2.5 mt-4">
                        <MessageSquare className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="text-xxs font-extrabold text-amber-800 uppercase block">Ghi chú & Feedback của Trưởng phòng</span>
                          <p className="text-xs text-amber-950 mt-1 whitespace-pre-wrap font-medium">{plan.notes}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* RIGHT PANEL: Side-by-side Actual Performance Comparison */}
                  <div className="p-6 bg-white space-y-6 lg:border-l lg:border-[#E6E6E8]">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2 text-xs font-black text-[#56CA00] uppercase tracking-wider">
                        <TrendingUp className="w-4 h-4" />
                        <span>ĐỐI CHIẾU HIỆU SUẤT THỰC TẾ TUẦN</span>
                      </div>
                      
                      {/* Live completion indicator widget */}
                      <div className="flex items-center gap-1.5 bg-slate-50 border border-[#E6E6E8] px-2.5 py-1 rounded-full text-xxs font-black text-[#2F2B3D]/80">
                        <span>Đã xong:</span>
                        <span className="text-[#56CA00]">{completedCount}/{totalCount} tasks</span>
                      </div>
                    </div>

                    {/* Completion rate progress bar widget */}
                    <div className="bg-slate-50 border border-[#E6E6E8] rounded-2xl p-4 flex items-center gap-4">
                      <div className="relative flex items-center justify-center">
                        {/* Circle Score */}
                        <div className="w-14 h-14 rounded-full bg-indigo-50 border-2 border-indigo-100 flex flex-col items-center justify-center">
                          <span className="text-xs font-black text-[#8C57FF]">{rate}%</span>
                          <span className="text-[7px] text-[#2F2B3D]/50 font-black uppercase tracking-tighter">Tỉ lệ</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <h5 className="text-xs font-black text-[#2F2B3D] uppercase tracking-wide">Hiệu suất hoàn thành thực tế</h5>
                        <p className="text-xxs text-slate-500 mt-1">
                          Tổng hợp tự động tất cả công việc trong tuần được giao hoặc hợp tác để làm thước đo đánh giá kết quả thực thi.
                        </p>
                        <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 overflow-hidden">
                          <div 
                            className="bg-[#56CA00] h-1.5 rounded-full transition-all duration-500" 
                            style={{ width: `${rate}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Linked completed tasks checklist */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-black text-[#2F2B3D] uppercase tracking-wide flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#56CA00]" />
                        Công việc đã HOÀN THÀNH trong tuần
                      </h4>

                      {completedTasks.length === 0 ? (
                        <div className="text-center py-6 border border-dashed border-[#E6E6E8] rounded-xl bg-slate-50 text-slate-400 text-xs font-medium">
                          Chưa ghi nhận công việc hoàn thành nào trong tuần này.
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                          {completedTasks.map(task => (
                            <div 
                              key={task.task_id}
                              className="bg-[#56CA00]/5 border border-[#56CA00]/15 rounded-xl p-3 flex items-start justify-between gap-3 shadow-sm hover:bg-[#56CA00]/10 transition"
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono text-[9px] font-bold text-slate-400">{task.task_id}</span>
                                  <span className="font-extrabold text-xs text-[#2F2B3D] leading-snug">{task.task_name}</span>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                                  <span className="px-1.5 py-0.5 bg-slate-200/50 rounded font-bold text-[9px] text-slate-600 uppercase">
                                    {task.business_category}
                                  </span>
                                  <span>•</span>
                                  <span>Phân loại: {task.task_type}</span>
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <div className="flex items-center justify-end gap-1 text-[#56CA00] font-black text-[10px]">
                                  <CheckCircle className="w-3.5 h-3.5" />
                                  <span>Hoàn thành</span>
                                </div>
                                <span className="text-[9px] text-slate-400 font-bold block mt-0.5">
                                  {task.actual_completion_date}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Linked pending/overdue tasks in this week */}
                    <div className="space-y-3 pt-2">
                      <h4 className="text-xs font-black text-[#2F2B3D] uppercase tracking-wide flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        Công việc ĐANG TRIỂN KHAI hoặc TRỄ HẠN
                      </h4>

                      {pendingTasks.length === 0 ? (
                        <div className="text-center py-4 border border-dashed border-[#E6E6E8] rounded-xl bg-slate-50 text-slate-400 text-xs font-medium">
                          Không có công việc tồn đọng hay trễ hạn nào trong tuần này.
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                          {pendingTasks.map(task => (
                            <div 
                              key={task.task_id}
                              className="bg-slate-50 border border-[#E6E6E8] rounded-xl p-3 flex items-start justify-between gap-3 hover:bg-slate-100/60 transition"
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono text-[9px] font-bold text-slate-400">{task.task_id}</span>
                                  <span className="font-bold text-xs text-[#2F2B3D]/80 leading-snug">{task.task_name}</span>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                                  <span className="px-1.5 py-0.5 bg-slate-200/50 rounded font-bold text-[9px] text-slate-600 uppercase">
                                    {task.business_category}
                                  </span>
                                  <span>•</span>
                                  <span>Hạn chót: {task.deadline}</span>
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold uppercase ${
                                  task.status === 'Trễ hạn' ? 'text-[#FF4C51]' : 'text-[#16B1FF]'
                                }`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${
                                    task.status === 'Trễ hạn' ? 'bg-[#FF4C51]' : 'bg-[#16B1FF]'
                                  }`} />
                                  {task.status}
                                </span>
                                <span className="text-[9px] text-slate-400 font-bold block mt-0.5">
                                  {task.progress_percentage}% xong
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* MANAGER APPROVAL CAROUSEL PANEL (only visible to Managers/Admins or reviewer) */}
                {isManagerOrAdmin && (
                  <div className="bg-slate-50/50 border-t border-[#E6E6E8] px-6 py-5">
                    <div className="max-w-2xl">
                      <h4 className="text-xs font-black text-[#2F2B3D] uppercase tracking-wide mb-2 flex items-center gap-1.5">
                        <MessageSquare className="w-4 h-4 text-[#8C57FF]" />
                        Trưởng Phòng Phê Duyệt & Nhận Xét Kế Hoạch Tuần
                      </h4>
                      <p className="text-xxs text-slate-500 mb-3">
                        Kiểm tra đối chiếu các chỉ tiêu đề ra bên trái so với danh sách các công việc đã hoàn thành tự động bên phải trước khi phê duyệt hoặc yêu cầu chỉnh sửa.
                      </p>
                      
                      <div className="space-y-3">
                        <textarea
                          placeholder="Nhập nhận xét của Trưởng phòng, các lưu ý về KPI hoặc chỉ đạo cụ thể..."
                          value={reviewFeedback}
                          onChange={(e) => setReviewFeedback(e.target.value)}
                          className="w-full bg-white border border-[#E6E6E8] rounded-xl px-3 py-2.5 text-xs font-medium text-[#2F2B3D] placeholder-[#2F2B3D]/30 focus:outline-none focus:border-[#8C57FF] h-16 resize-none"
                        />
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdateStatus(plan.plan_id, 'Đã chốt', reviewFeedback || plan.notes)}
                            className="flex items-center gap-1.5 px-4 py-2 bg-[#56CA00] hover:bg-[#4EBF00] text-white rounded-lg text-xs font-extrabold transition shadow-sm"
                          >
                            <Check className="w-4 h-4" />
                            <span>Phê Duyệt Kế Hoạch</span>
                          </button>
                          
                          <button
                            onClick={() => handleUpdateStatus(plan.plan_id, 'Bản nháp', reviewFeedback || plan.notes)}
                            className="flex items-center gap-1.5 px-4 py-2 bg-red-50 hover:bg-red-100 text-[#FF4C51] border border-red-200 rounded-lg text-xs font-extrabold transition shadow-sm"
                          >
                            <X className="w-4 h-4" />
                            <span>Yêu Cầu Chỉnh Sửa</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )
    )
  }

      {/* CREATE / EDIT PLAN DIALOG/MODAL WITH DYNAMIC OBJECTIVE AND LINKED TASKS ENGINE */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white border border-[#E6E6E8] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col text-[#2F2B3D] shadow-[0_10px_30px_rgba(47,43,61,0.2)]">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#E6E6E8] flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-black text-[#2F2B3D] uppercase tracking-wide">
                  {editingPlan ? 'Chỉnh Sửa Kế Hoạch Tuần' : `Tạo Kế Hoạch Tuần Mới`}
                </h3>
                <p className="text-xxs text-slate-500 font-medium">
                  {selectedWeek} • Gắn công việc cụ thể để theo dõi đồng bộ giữa Kế hoạch và Thực thi
                </p>
              </div>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200/50 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitPlan} className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Objectives List Container */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#E6E6E8] pb-2">
                  <span className="text-xs font-black text-[#8C57FF] uppercase tracking-wider flex items-center gap-1.5">
                    <Target className="w-4 h-4" />
                    MỤC TIÊU TRỌNG ĐIỂM (OBJECTIVES) & CÔNG VIỆC LIÊN KẾT
                  </span>
                  <button
                    type="button"
                    onClick={handleAddObjective}
                    className="flex items-center gap-1 px-3 py-1 bg-[#8C57FF]/10 text-[#8C57FF] border border-[#8C57FF]/20 hover:bg-[#8C57FF]/20 rounded-lg text-xxs font-black transition uppercase tracking-wider"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Thêm Mục Tiêu
                  </button>
                </div>

                <div className="space-y-6">
                  {modalObjectives.map((obj, objIndex) => (
                    <div 
                      key={obj.id} 
                      className="border border-[#E6E6E8] rounded-2xl p-5 bg-slate-50/30 relative space-y-4"
                    >
                      {/* Delete Objective Button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveObjective(objIndex)}
                        className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-[#FF4C51] rounded-full hover:bg-red-50 hover:border hover:border-red-100 transition"
                        title="Xóa mục tiêu này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      {/* Header Badge */}
                      <span className="inline-block px-2.5 py-0.5 bg-slate-200 text-[#2F2B3D] text-[9px] font-black uppercase rounded">
                        Mục tiêu số {objIndex + 1}
                      </span>

                      {/* Title & Key Result Fields */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xxs text-[#2F2B3D]/70 font-black uppercase block">
                            Mục tiêu trọng điểm *
                          </label>
                          <textarea
                            required
                            placeholder="Ví dụ: Hoàn thiện kịch bản và dựng thô 3 video phong thủy..."
                            value={obj.title}
                            onChange={(e) => handleUpdateObjective(objIndex, { title: e.target.value })}
                            className="w-full bg-white border border-[#E6E6E8] rounded-xl px-3 py-2 text-xs font-semibold text-[#2F2B3D] placeholder-[#2F2B3D]/30 focus:outline-none focus:border-[#8C57FF] h-16 resize-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xxs text-[#2F2B3D]/70 font-black uppercase block">
                            Kết quả then chốt / KPIs của mục tiêu này *
                          </label>
                          <textarea
                            required
                            placeholder="Ví dụ: Hoàn tất bàn giao demo trước Thứ Năm, thu hút tổng 10k view..."
                            value={obj.key_result}
                            onChange={(e) => handleUpdateObjective(objIndex, { key_result: e.target.value })}
                            className="w-full bg-white border border-[#E6E6E8] rounded-xl px-3 py-2 text-xs font-semibold text-[#2F2B3D] placeholder-[#2F2B3D]/30 focus:outline-none focus:border-[#8C57FF] h-16 resize-none"
                          />
                        </div>
                      </div>

                      {/* Task Selector for linking */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xxs text-[#2F2B3D]/70 font-black uppercase block">
                            Liên kết Công việc trong danh sách hiện có ({obj.linked_task_ids.length} đã chọn)
                          </label>
                          {objIndex === 0 && (
                            <div className="flex items-center gap-2 max-w-xs">
                              <input
                                type="text"
                                placeholder="Tìm kiếm nhanh công việc..."
                                value={taskSearchQuery}
                                onChange={(e) => setTaskSearchQuery(e.target.value)}
                                className="bg-white border border-[#E6E6E8] rounded-lg px-2 py-1 text-[10px] text-[#2F2B3D] focus:outline-none focus:border-[#8C57FF] placeholder-slate-400"
                              />
                            </div>
                          )}
                        </div>

                        {/* List of selectables with custom style */}
                        <div className="bg-white border border-[#E6E6E8] rounded-xl max-h-40 overflow-y-auto p-2.5 space-y-1.5">
                          {availableTasks.length === 0 ? (
                            <div className="text-center py-6 text-slate-400 text-xxs font-medium">
                              {taskSearchQuery ? 'Không tìm thấy công việc phù hợp.' : 'Chưa có công việc nào thuộc quyền quản lý của bạn.'}
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {availableTasks.map(task => {
                                const isLinked = obj.linked_task_ids.includes(task.task_id);
                                return (
                                  <button
                                    key={task.task_id}
                                    type="button"
                                    onClick={() => handleToggleTaskLink(objIndex, task.task_id)}
                                    className={`w-full text-left p-2.5 rounded-xl border transition flex items-start gap-2.5 ${
                                      isLinked 
                                        ? 'border-[#8C57FF] bg-[#8C57FF]/5 shadow-[0_2px_8px_rgba(140,87,255,0.06)]' 
                                        : 'border-[#E6E6E8] hover:bg-slate-50'
                                    }`}
                                  >
                                    <div className={`w-4 h-4 rounded mt-0.5 flex-shrink-0 flex items-center justify-center border transition-all duration-200 ${
                                      isLinked ? 'bg-[#8C57FF] border-[#8C57FF] text-white' : 'border-slate-300 bg-white'
                                    }`}>
                                      {isLinked && <Check className="w-3 h-3 stroke-[3]" />}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-1.5">
                                        <span className="font-mono text-[9px] font-bold text-slate-400">{task.task_id}</span>
                                        <span className={`text-[11px] font-bold block truncate ${isLinked ? 'text-[#8C57FF]' : 'text-[#2F2B3D]/80'}`}>
                                          {task.task_name}
                                        </span>
                                      </div>
                                      <span className="text-[9px] text-slate-400 font-medium block mt-0.5">
                                        {task.business_category} • {task.status} ({task.progress_percentage}% xong)
                                      </span>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* General Plan Notes */}
              <div className="space-y-1">
                <label className="text-xxs text-[#2F2B3D]/70 font-black uppercase block mb-1">
                  Ghi chú tổng hợp bổ sung
                </label>
                <textarea
                  placeholder="Nhập thông tin cần hỗ trợ từ Trưởng phòng hoặc ghi chú phối hợp liên phòng ban..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-white border border-[#E6E6E8] rounded-xl p-3 text-xs font-semibold text-[#2F2B3D] placeholder-[#2F2B3D]/30 focus:outline-none focus:border-[#8C57FF] h-20"
                />
              </div>

              {/* Visibility Option specifically restricted to 'an_hv' creator per user rules */}
              {currentMemberId === 'an_hv' && (
                <div className="space-y-1.5">
                  <label className="text-xxs text-[#2F2B3D]/70 font-black uppercase block">Quyền hiển thị kế hoạch</label>
                  <div className="flex gap-4">
                    <label className="inline-flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="visibility"
                        value="Công khai"
                        checked={formData.visibility === 'Công khai'}
                        onChange={() => setFormData({ ...formData, visibility: 'Công khai' })}
                        className="text-[#8C57FF] focus:ring-[#8C57FF] focus:ring-0"
                      />
                      <span className="text-xs font-extrabold flex items-center gap-1 text-slate-700">
                        <Globe className="w-3.5 h-3.5 text-slate-400" /> Công khai
                      </span>
                    </label>
                    <label className="inline-flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="visibility"
                        value="Riêng tư"
                        checked={formData.visibility === 'Riêng tư'}
                        onChange={() => setFormData({ ...formData, visibility: 'Riêng tư' })}
                        className="text-[#8C57FF] focus:ring-[#8C57FF] focus:ring-0"
                      />
                      <span className="text-xs font-extrabold flex items-center gap-1 text-slate-700">
                        <Lock className="w-3.5 h-3.5 text-slate-400" /> Riêng tư
                      </span>
                    </label>
                  </div>
                </div>
              )}
            </form>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-[#E6E6E8] bg-slate-50 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 bg-white hover:bg-slate-50 border border-[#E6E6E8] rounded-xl text-xs font-bold text-[#2F2B3D] transition shadow-xxs"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={handleSubmitPlan}
                className="px-5 py-2 bg-[#8C57FF] hover:bg-[#7A40F2] text-white rounded-xl text-xs font-extrabold shadow-sm hover:shadow-md transition"
              >
                {editingPlan ? 'Lưu Thay Đổi' : 'Tạo Kế Hoạch'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
