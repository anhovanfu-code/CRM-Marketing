/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit,
  Download,
  AlertTriangle,
  Play,
  CheckCircle,
  Clock,
  Eye,
  KanbanSquare,
  List,
  Paperclip,
  ArrowRight,
  Lock,
  Globe,
  Target,
  Calendar
} from 'lucide-react';
import { Task, TeamMember, Campaign, TaskType, TaskStatus, TaskPriority, BusinessCategory, WorkPlan, DailyLog } from '../types';
import DailyLogsView from './DailyLogsView';

interface TasksViewProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  members: TeamMember[];
  campaigns: Campaign[];
  activeRole: 'Admin' | 'Manager' | 'Staff' | 'Viewer';
  onExport: () => void;
  currentUserEmail?: string;
  plans?: WorkPlan[];
  setPlans?: React.Dispatch<React.SetStateAction<WorkPlan[]>>;
  dailyLogs?: DailyLog[];
  setDailyLogs?: React.Dispatch<React.SetStateAction<DailyLog[]>>;
}

export default function TasksView({
  tasks,
  setTasks,
  members,
  campaigns,
  activeRole,
  onExport,
  currentUserEmail,
  plans = [],
  setPlans = () => {},
  dailyLogs = [],
  setDailyLogs = () => {},
}: TasksViewProps) {
  const [viewMode, setViewMode] = useState<'kanban' | 'table' | 'plans' | 'daily-logs'>('kanban');
  const [hoveredCol, setHoveredCol] = useState<string | null>(null);

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    if (isReadOnly) return;
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (isReadOnly) return;
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    if (isReadOnly) return;
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (!taskId) return;

    setTasks(prevTasks => prevTasks.map(t => {
      if (t.task_id === taskId) {
        const isCompleting = targetStatus === 'Hoàn thành';
        return {
          ...t,
          status: targetStatus,
          progress_percentage: isCompleting ? 100 : t.progress_percentage,
          actual_completion_date: isCompleting ? new Date().toISOString().split('T')[0] : t.actual_completion_date,
        };
      }
      return t;
    }));
  };

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAssignee, setFilterAssignee] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // --- WEEKLY PLANS STATE ---
  const [selectedPlanWeek, setSelectedPlanWeek] = useState('Tuần 27 (29/06 - 05/07/2026)');
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<WorkPlan | null>(null);
  
  const [planGoals, setPlanGoals] = useState('');
  const [planTasks, setPlanTasks] = useState('');
  const [planResults, setPlanResults] = useState('');
  
  const [managerNotes, setManagerNotes] = useState('');

  // Identify current member logged in
  const planCurrentMember = React.useMemo(() => {
    return members.find(m => {
      const email = m.email.toLowerCase();
      const userEmail = currentUserEmail?.toLowerCase() || '';
      return email === userEmail || (userEmail === 'anhovan.fu@gmail.com' && m.id === 'an_hv');
    }) || members[0]; // Fallback
  }, [members, currentUserEmail]);

  const planCurrentMemberId = planCurrentMember?.id || 'an_hv';
  const planIsManager = activeRole === 'Manager' || activeRole === 'Admin' || planCurrentMemberId === 'an_hv';

  const handleOpenCreatePlan = (planToEdit?: WorkPlan) => {
    if (planToEdit) {
      setEditingPlan(planToEdit);
      setPlanGoals(planToEdit.target_goals || '');
      setPlanTasks(planToEdit.tasks_list || '');
      setPlanResults(planToEdit.key_results || '');
    } else {
      setEditingPlan(null);
      setPlanGoals('');
      setPlanTasks('');
      setPlanResults('');
    }
    setIsPlanModalOpen(true);
  };

  const handleSavePlan = (status: WorkPlan['status']) => {
    if (!planGoals.trim() || !planTasks.trim() || !planResults.trim()) {
      alert('Vui lòng nhập đầy đủ các trường Kế hoạch.');
      return;
    }

    if (editingPlan) {
      setPlans(prev => prev.map(p => p.plan_id === editingPlan.plan_id ? {
        ...p,
        target_goals: planGoals,
        tasks_list: planTasks,
        key_results: planResults,
        status: status,
        notes: status === 'Chờ duyệt' ? '' : p.notes
      } : p));
      alert(status === 'Chờ duyệt' ? 'Kế hoạch đã được nộp để phê duyệt!' : 'Đã lưu bản nháp thành công!');
    } else {
      // Check duplicate
      const exists = plans.some(p => p.creator_id === planCurrentMemberId && p.period_name === selectedPlanWeek && p.plan_type === 'Tuần');
      if (exists) {
        alert('Bạn đã có kế hoạch cho tuần này rồi. Vui lòng chỉnh sửa kế hoạch hiện tại.');
        return;
      }

      const newPlan: WorkPlan = {
        plan_id: `PLN-${Date.now()}`,
        creator_id: planCurrentMemberId,
        plan_type: 'Tuần',
        period_name: selectedPlanWeek,
        target_goals: planGoals,
        tasks_list: planTasks,
        key_results: planResults,
        reviewer_id: 'an_hv',
        status: status,
        created_at: new Date().toISOString().split('T')[0]
      };

      setPlans(prev => [newPlan, ...prev]);
      alert(status === 'Chờ duyệt' ? 'Đã tạo và gửi phê duyệt kế hoạch tuần mới!' : 'Đã lưu bản nháp thành công!');
    }

    setIsPlanModalOpen(false);
  };

  const handlePlanApproval = (planId: string, approve: boolean) => {
    setPlans(prev => prev.map(p => {
      if (p.plan_id === planId) {
        return {
          ...p,
          status: approve ? 'Đã chốt' : 'Từ chối',
          notes: managerNotes
        };
      }
      return p;
    }));
    setManagerNotes('');
    alert(approve ? 'Đã duyệt kế hoạch thành công!' : 'Đã từ chối kế hoạch tuần.');
  };

  // Form Fields
  const [formData, setFormData] = useState<Partial<Task>>({
    task_name: '',
    description: '',
    business_category: 'Nội thất',
    task_type: 'Viết nội dung',
    assignee: '',
    collaborators: [],
    reviewer: 'an_hv',
    start_date: new Date().toISOString().split('T')[0],
    deadline: '',
    priority: 'Trung bình',
    status: 'Chưa làm',
    progress_percentage: 0,
    expected_delivery: '',
    actual_delivery: '',
    feedback_notes: '',
    delay_reason: '',
    attachments: [],
    actual_completion_date: '',
    visibility: 'Riêng tư'
  });

  const isReadOnly = activeRole === 'Viewer';

  const openCreateModal = () => {
    setEditingTask(null);
    setFormData({
      task_name: '',
      description: '',
      business_category: 'Nội thất',
      task_type: 'Viết nội dung',
      assignee: members[0]?.id || '',
      collaborators: [],
      reviewer: 'an_hv',
      start_date: new Date().toISOString().split('T')[0],
      deadline: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0], // 3 days from now
      priority: 'Trung bình',
      status: 'Chưa làm',
      progress_percentage: 0,
      expected_delivery: '',
      actual_delivery: '',
      feedback_notes: '',
      delay_reason: '',
      attachments: [],
      actual_completion_date: '',
      visibility: 'Riêng tư'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setFormData({ ...task, visibility: task.visibility || 'Riêng tư' });
    setIsModalOpen(true);
  };

  const handleDeleteTask = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Bạn có chắc chắn muốn xóa công việc ${id}?`)) {
      setTasks(prev => prev.filter(t => t.task_id !== id));
    }
  };

  // Quick state update helper for the workflow
  const handleUpdateStatus = (task: Task, newStatus: TaskStatus) => {
    if (isReadOnly) return;
    
    let updatedProgress = task.progress_percentage;
    let compDate = task.actual_completion_date;
    
    if (newStatus === 'Hoàn thành') {
      updatedProgress = 100;
      compDate = new Date().toISOString().split('T')[0];
    } else if (newStatus === 'Chưa làm') {
      updatedProgress = 0;
      compDate = '';
    }

    setTasks(prev => prev.map(t => t.task_id === task.task_id ? {
      ...t,
      status: newStatus,
      progress_percentage: updatedProgress,
      actual_completion_date: compDate
    } : t));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;

    let finalStatus = formData.status as TaskStatus;
    let finalProgress = Number(formData.progress_percentage) || 0;
    let compDate = formData.actual_completion_date || '';

    // Automated safety check for deadlines
    const todayStr = new Date().toISOString().split('T')[0];
    if (formData.deadline && formData.deadline < todayStr && finalStatus !== 'Hoàn thành' && finalStatus !== 'Tạm dừng' && finalStatus !== 'Hủy') {
      finalStatus = 'Trễ hạn';
    }

    if (finalStatus === 'Hoàn thành') {
      finalProgress = 100;
      if (!compDate) compDate = todayStr;
    }

    const calculatedVisibility = formData.assignee === 'an_hv' ? (formData.visibility || 'Riêng tư') : 'Công khai';

    if (editingTask) {
      setTasks(prev => prev.map(t => t.task_id === editingTask.task_id ? {
        ...t,
        ...formData,
        status: finalStatus,
        progress_percentage: finalProgress,
        actual_completion_date: compDate,
        visibility: calculatedVisibility
      } as Task : t));
    } else {
      const newTask: Task = {
        task_id: `TSK-${String(tasks.length + 1).padStart(3, '0')}`,
        task_name: formData.task_name || '',
        description: formData.description || '',
        business_category: formData.business_category as BusinessCategory || 'Nội thất',
        task_type: formData.task_type as TaskType || 'Viết nội dung',
        assignee: formData.assignee || '',
        collaborators: formData.collaborators || [],
        reviewer: formData.reviewer || 'an_hv',
        start_date: formData.start_date || todayStr,
        deadline: formData.deadline || '',
        priority: formData.priority as TaskPriority || 'Trung bình',
        status: finalStatus,
        progress_percentage: finalProgress,
        attachments: formData.attachments || [],
        expected_delivery: formData.expected_delivery || '',
        actual_delivery: formData.actual_delivery || '',
        feedback_notes: formData.feedback_notes || '',
        delay_reason: formData.delay_reason || '',
        actual_completion_date: compDate,
        visibility: calculatedVisibility
      };
      setTasks(prev => [newTask, ...prev]);
    }
    setIsModalOpen(false);
  };

  // Filter Tasks list
  const filteredTasks = tasks.filter(t => {
    // Role-based visibility check:
    // - Only tasks of tk ID 'an_hv' (tp.mkt) can be private/restricted.
    // - All other team member tasks are ALWAYS public (visible to everyone).
    const isVisibleToUser = (() => {
      if (t.assignee !== 'an_hv') return true;
      if (activeRole === 'Admin' || activeRole === 'Manager') return true;
      if ((t.visibility || 'Riêng tư') === 'Công khai') return true;
      
      // Private task of an_hv: only visible if the user is a collaborator
      const currentMember = members.find(m => m.email.toLowerCase() === currentUserEmail?.toLowerCase());
      const currentMemberId = currentMember?.id;
      if (currentMemberId) {
        return t.collaborators.includes(currentMemberId);
      }
      
      return false; // Hidden from other staff/viewers
    })();

    if (!isVisibleToUser) return false;

    const matchesSearch = t.task_name.toLowerCase().includes(searchQuery.toLowerCase()) || t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAssignee = filterAssignee === 'all' || t.assignee === filterAssignee || t.collaborators.includes(filterAssignee);
    const matchesCategory = filterCategory === 'all' || t.business_category === filterCategory;
    const matchesType = filterType === 'all' || t.task_type === filterType;
    const matchesStatus = filterStatus === 'all' || t.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || t.priority === filterPriority;

    return matchesSearch && matchesAssignee && matchesCategory && matchesType && matchesStatus && matchesPriority;
  });

  const statuses: TaskStatus[] = ['Chưa làm', 'Đang làm', 'Chờ duyệt', 'Cần sửa', 'Hoàn thành', 'Trễ hạn', 'Tạm dừng', 'Hủy'];
  const categories: BusinessCategory[] = ['Nội thất', 'Phong thủy', 'Hàng hiệu', 'Thương hiệu chung'];
  const taskTypes: TaskType[] = [
    'Kế hoạch Marketing', 'Quay video', 'Chụp ảnh', 'Dựng video', 'Thiết kế',
    'Viết nội dung', 'Đăng bài', 'Chạy quảng cáo', 'Seeding', 'Báo cáo',
    'Họp nội bộ', 'Đề xuất phương án', 'Sản xuất tài nguyên', 'Duyệt nội dung'
  ];
  const priorities: TaskPriority[] = ['Thấp', 'Trung bình', 'Cao', 'Khẩn cấp'];

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-transparent text-[#2F2B3D] p-6">
      
      {/* Upper header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E6E6E8]">
        <div>
          <div className="flex items-center gap-2 text-[#8C57FF] font-bold text-xs uppercase tracking-widest mb-1">
            <CheckSquare className="w-4 h-4" />
            <span>FUGALO WORKSPACE</span>
          </div>
          <h1 className="text-2xl font-black text-[#2F2B3D] tracking-tight">QUẢN LÝ CÔNG VIỆC MARKETING</h1>
          <p className="text-xs text-[#2F2B3D]/70 mt-1">Lập kế hoạch, giao việc, đính kèm tài liệu bàn giao, ghi nhận feedback và duyệt duyệt kết quả</p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View Modes */}
          <div className="bg-white border border-[#E6E6E8] p-1 rounded-lg flex items-center shadow-[0_2px_4px_rgba(15,10,32,0.02)]">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-md text-xs font-bold transition flex items-center gap-1 ${viewMode === 'kanban' ? 'bg-[#8C57FF] text-white' : 'text-[#2F2B3D]/60 hover:text-[#8C57FF]'}`}
            >
              <KanbanSquare className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md text-xs font-bold transition flex items-center gap-1 ${viewMode === 'table' ? 'bg-[#8C57FF] text-white' : 'text-[#2F2B3D]/60 hover:text-[#8C57FF]'}`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Danh Sách</span>
            </button>
            <button
              onClick={() => setViewMode('plans')}
              className={`p-1.5 rounded-md text-xs font-bold transition flex items-center gap-1 ${viewMode === 'plans' ? 'bg-[#8C57FF] text-white' : 'text-[#2F2B3D]/60 hover:text-[#8C57FF]'}`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>Kế Hoạch Tuần</span>
            </button>
            <button
              onClick={() => setViewMode('daily-logs')}
              className={`p-1.5 rounded-md text-xs font-bold transition flex items-center gap-1 ${viewMode === 'daily-logs' ? 'bg-[#8C57FF] text-white' : 'text-[#2F2B3D]/60 hover:text-[#8C57FF]'}`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Nhật Ký Hàng Ngày</span>
            </button>
          </div>

          <button
            onClick={onExport}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-[#E6E6E8] rounded-lg text-xs font-bold text-[#2F2B3D] transition shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-[#2F2B3D]/60" />
            <span>Xuất Excel</span>
          </button>

          {!isReadOnly && (
            <button
              onClick={openCreateModal}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-[#8C57FF] hover:bg-[#7A40F2] text-white rounded-lg text-xs font-extrabold shadow-[0_4px_12px_rgba(140,87,255,0.35)] transition"
            >
              <Plus className="w-4 h-4" />
              <span>Giao Task Mới</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter controls */}
      {(viewMode === 'kanban' || viewMode === 'table') && (
        <div className="bg-white border border-[#E6E6E8] rounded-xl p-4 mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 shadow-[0_4px_18px_rgba(15,10,32,0.03)]">
          <div className="col-span-1 sm:col-span-2 relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#2F2B3D]/40" />
            <input
              type="text"
              placeholder="Tìm theo tiêu đề hoặc nội dung..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[#E6E6E8] rounded-lg pl-9 pr-4 py-2 text-xs font-semibold text-[#2F2B3D] placeholder-[#2F2B3D]/40 focus:outline-none focus:border-[#8C57FF] transition"
            />
          </div>

          <div>
            <select
              value={filterAssignee}
              onChange={(e) => setFilterAssignee(e.target.value)}
              className="w-full bg-white border border-[#E6E6E8] rounded-lg px-3 py-2 text-xs font-semibold text-[#2F2B3D] focus:outline-none focus:border-[#8C57FF]"
            >
              <option value="all">Tất cả nhân sự</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full bg-white border border-[#E6E6E8] rounded-lg px-3 py-2 text-xs font-semibold text-[#2F2B3D] focus:outline-none focus:border-[#8C57FF]"
            >
              <option value="all">Tất cả mảng</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full bg-white border border-[#E6E6E8] rounded-lg px-3 py-2 text-xs font-semibold text-[#2F2B3D] focus:outline-none focus:border-[#8C57FF]"
            >
              <option value="all">Tất cả loại việc</option>
              {taskTypes.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full bg-white border border-[#E6E6E8] rounded-lg px-3 py-2 text-xs font-semibold text-[#2F2B3D] focus:outline-none focus:border-[#8C57FF]"
            >
              <option value="all">Tất cả ưu tiên</option>
              {priorities.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Main View layout render */}
      {viewMode === 'daily-logs' ? (
        <DailyLogsView
          dailyLogs={dailyLogs}
          setDailyLogs={setDailyLogs}
          tasks={tasks}
          members={members}
          activeRole={activeRole}
          currentUserEmail={currentUserEmail}
        />
      ) : viewMode === 'plans' ? (
        /* Weekly Plans view inside TasksView */
        <div className="space-y-6 mt-6 animate-fade-in text-xs">
          <div className="bg-white border border-[#E6E6E8] rounded-2xl p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
              <div>
                <h3 className="text-sm font-black text-[#2F2B3D] uppercase tracking-wider flex items-center gap-1.5">
                  <Target className="w-5 h-5 text-[#8C57FF]" />
                  <span>KẾ HOẠCH TUẦN PHÒNG BAN MARKETING</span>
                </h3>
                <p className="text-slate-400 mt-1">Lập và xem duyệt kế hoạch tuần của từng nhân sự, bám sát mục tiêu và kết quả thực tế</p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={selectedPlanWeek}
                  onChange={(e) => setSelectedPlanWeek(e.target.value)}
                  className="bg-white border border-[#E6E6E8] rounded-lg px-3 py-1.5 text-xs font-bold text-[#2F2B3D] focus:outline-none focus:border-[#8C57FF]"
                >
                  <option value="Tuần 26 (22/06 - 28/06/2026)">Tuần 26 (22/06 - 28/06/2026)</option>
                  <option value="Tuần 27 (29/06 - 05/07/2026)">Tuần 27 (29/06 - 05/07/2026)</option>
                  <option value="Tuần 28 (06/07 - 12/07/2026)">Tuần 28 (06/07 - 12/07/2026)</option>
                </select>

                {!planIsManager && (
                  <button
                    onClick={() => handleOpenCreatePlan()}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-[#8C57FF] hover:bg-[#7A40F2] text-white rounded-lg text-xs font-extrabold shadow-sm transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Lập kế hoạch tuần</span>
                  </button>
                )}
              </div>
            </div>

            {/* Display Plans */}
            {(() => {
              const weekPlans = plans.filter(p => p.plan_type === 'Tuần' && p.period_name === selectedPlanWeek);
              const displayPlans = planIsManager ? weekPlans : weekPlans.filter(p => p.creator_id === planCurrentMemberId);

              if (displayPlans.length === 0) {
                return (
                  <div className="py-12 text-center text-slate-400 border border-dashed border-[#E6E6E8] rounded-xl bg-slate-50">
                    <Target className="w-10 h-10 text-slate-300 mx-auto mb-2 animate-bounce" />
                    <p className="font-extrabold text-xs uppercase text-[#2F2B3D]">Chưa có tài liệu kế hoạch nào</p>
                    <p className="text-slate-400 mt-1 max-w-md mx-auto text-[11px]">Không tìm thấy tài liệu kế hoạch nào cho kỳ này. Nhân viên vui lòng bấm nút "Lập kế hoạch tuần" ở trên để khởi tạo.</p>
                  </div>
                );
              }

              return (
                <div className="space-y-6">
                  {displayPlans.map((plan) => {
                    const creator = members.find(m => m.id === plan.creator_id);
                    const isOwnPlan = plan.creator_id === planCurrentMemberId;

                    return (
                      <div key={plan.plan_id} className="border border-[#E6E6E8] rounded-2xl p-6 bg-[#F8F7FA] space-y-4 shadow-sm relative overflow-hidden">
                        {/* Plan Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E6E6E8]/70 pb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#8C57FF]/10 border border-[#8C57FF]/20 flex items-center justify-center font-black text-[#8C57FF] text-sm">
                              {creator?.name ? creator.name.substring(0, 2).toUpperCase() : 'NV'}
                            </div>
                            <div>
                              <h4 className="text-xs font-black text-[#2F2B3D] uppercase">{creator?.name || plan.creator_id}</h4>
                              <p className="text-[10px] text-slate-400 mt-0.5 font-bold">Chức vụ: {creator?.role || 'Nhân viên Marketing'}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                              plan.status === 'Đã chốt' ? 'bg-[#56CA00]/10 text-[#56CA00] border border-[#56CA00]/20' :
                              plan.status === 'Chờ duyệt' ? 'bg-[#FFB400]/10 text-[#FFB400] border border-[#FFB400]/20' :
                              plan.status === 'Từ chối' ? 'bg-red-50 text-[#FF4C51] border border-red-200' :
                              'bg-slate-100 text-slate-500 border border-slate-200'
                            }`}>
                              {plan.status === 'Đã chốt' ? 'Trưởng phòng đã duyệt' : plan.status}
                            </span>

                            {isOwnPlan && plan.status === 'Bản nháp' && (
                              <button
                                onClick={() => handleOpenCreatePlan(plan)}
                                className="px-2 py-1 bg-white hover:bg-slate-50 border border-[#E6E6E8] text-[#2F2B3D] font-bold rounded text-[10px] transition"
                              >
                                Chỉnh sửa
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Plan Content */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                          {/* Col 1 */}
                          <div className="bg-white border border-[#E6E6E8] rounded-xl p-4 space-y-2 shadow-xs">
                            <span className="font-extrabold text-[#8C57FF] uppercase tracking-wider block border-b border-slate-100 pb-1.5 text-[10px]">
                              🎯 Mục tiêu trọng tâm
                            </span>
                            <p className="text-[#2F2B3D] font-semibold leading-relaxed whitespace-pre-wrap">{plan.target_goals}</p>
                          </div>

                          {/* Col 2 */}
                          <div className="bg-white border border-[#E6E6E8] rounded-xl p-4 space-y-2 shadow-xs">
                            <span className="font-extrabold text-[#16B1FF] uppercase tracking-wider block border-b border-slate-100 pb-1.5 text-[10px]">
                              📋 Checklist công việc dự kiến
                            </span>
                            <p className="text-[#2F2B3D] font-semibold leading-relaxed whitespace-pre-wrap">{plan.tasks_list}</p>
                          </div>

                          {/* Col 3 */}
                          <div className="bg-white border border-[#E6E6E8] rounded-xl p-4 space-y-2 shadow-xs">
                            <span className="font-extrabold text-[#56CA00] uppercase tracking-wider block border-b border-slate-100 pb-1.5 text-[10px]">
                              📈 Kết quả cuối tuần
                            </span>
                            <p className="text-[#2F2B3D] font-semibold leading-relaxed whitespace-pre-wrap">{plan.key_results}</p>
                          </div>
                        </div>

                        {/* Feedback / Review Section */}
                        {plan.notes && (
                          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 text-[11px] text-amber-900 leading-relaxed">
                            <strong className="block text-[10px] font-black uppercase text-amber-800 mb-1">📝 Ý kiến phê duyệt từ Trưởng Phòng (an_hv):</strong>
                            <p className="italic font-medium">{plan.notes}</p>
                          </div>
                        )}

                        {/* Workflow action for Employee */}
                        {isOwnPlan && (plan.status === 'Bản nháp' || plan.status === 'Từ chối') && (
                          <div className="flex justify-end border-t border-[#E6E6E8]/40 pt-3">
                            <button
                              onClick={() => {
                                setPlans(prev => prev.map(p => p.plan_id === plan.plan_id ? { ...p, status: 'Chờ duyệt' } : p));
                                alert('Đã gửi phê duyệt kế hoạch tuần thành công!');
                              }}
                              className="px-4 py-1.5 bg-[#8C57FF] hover:bg-[#7A40F2] text-white font-extrabold rounded-lg text-[10px] shadow-sm transition"
                            >
                              Gửi phê duyệt
                            </button>
                          </div>
                        )}

                        {/* Workflow action for Manager */}
                        {planIsManager && plan.status === 'Chờ duyệt' && (
                          <div className="border-t border-[#E6E6E8]/40 pt-4 space-y-3 bg-white p-4 rounded-xl">
                            <span className="font-bold uppercase text-[10px] block text-[#2F2B3D]">Quy trình phê duyệt kế hoạch (Manager Only)</span>
                            <textarea
                              value={managerNotes}
                              onChange={(e) => setManagerNotes(e.target.value)}
                              placeholder="Nhập ý kiến chỉ đạo, nhận xét hoặc lý do từ chối..."
                              className="w-full bg-white border border-[#E6E6E8] rounded px-3 py-2 text-xs text-[#2F2B3D] focus:outline-none focus:border-[#8C57FF] h-16"
                            />
                            <div className="flex items-center gap-2 justify-end">
                              <button
                                onClick={() => handlePlanApproval(plan.plan_id, false)}
                                className="px-3.5 py-1.5 bg-red-100 hover:bg-red-200 text-[#FF4C51] font-extrabold rounded-lg text-[10px] border border-red-200 transition"
                              >
                                Từ chối kế hoạch
                              </button>
                              <button
                                onClick={() => handlePlanApproval(plan.plan_id, true)}
                                className="px-3.5 py-1.5 bg-[#56CA00] hover:bg-[#48AA00] text-white font-extrabold rounded-lg text-[10px] shadow-sm transition"
                              >
                                Duyệt kế hoạch
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>
      ) : viewMode === 'kanban' ? (
        /* Kanban Board View */
        <div className="flex flex-row md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mt-6 items-start overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-thin">
          {['Chưa làm', 'Đang làm', 'Chờ duyệt', 'Cần sửa', 'Hoàn thành', 'Trễ hạn'].map((colStatus) => {
            const colTasks = filteredTasks.filter(t => t.status === colStatus);
            const isHovered = hoveredCol === colStatus;

            // Helper to get corresponding status icon
            const getStatusIcon = (status: string) => {
              switch (status) {
                case 'Chưa làm':
                  return <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />;
                case 'Đang làm':
                  return <Play className="w-4 h-4 text-[#16B1FF] flex-shrink-0" />;
                case 'Chờ duyệt':
                  return <Eye className="w-4 h-4 text-[#FFB400] flex-shrink-0" />;
                case 'Cần sửa':
                  return <AlertTriangle className="w-4 h-4 text-[#FFB400] animate-pulse flex-shrink-0" />;
                case 'Hoàn thành':
                  return <CheckCircle className="w-4 h-4 text-[#56CA00] flex-shrink-0" />;
                case 'Trễ hạn':
                  return <AlertTriangle className="w-4 h-4 text-[#FF4C51] animate-bounce flex-shrink-0" />;
                default:
                  return <CheckSquare className="w-4 h-4 flex-shrink-0" />;
              }
            };

            return (
              <div 
                key={colStatus} 
                onDragOver={(e) => { handleDragOver(e); setHoveredCol(colStatus); }}
                onDragLeave={() => setHoveredCol(null)}
                onDrop={(e) => { handleDrop(e, colStatus as TaskStatus); setHoveredCol(null); }}
                className={`transition-all duration-200 border rounded-2xl p-4 flex flex-col min-h-[500px] w-[85vw] sm:w-[320px] md:w-auto flex-shrink-0 snap-center ${
                  isHovered 
                    ? 'bg-[#E04B1C]/5 border-[#E04B1C]/40 shadow-sm' 
                    : 'bg-slate-50 border-[#E6E6E8]'
                }`}
              >
                {/* Column header */}
                <div className="flex items-center justify-between border-b border-[#E6E6E8] pb-2 mb-3">
                  <span className="text-xs font-black uppercase text-[#2F2B3D] flex items-center gap-1.5" title={colStatus}>
                    {getStatusIcon(colStatus)}
                    <span className="hidden md:inline">{colStatus}</span>
                  </span>
                  <span className={`text-xxs bg-white border px-2 py-0.5 rounded-full font-bold ${
                    colStatus === 'Trễ hạn' ? 'text-[#FF4C51] border-[#FF4C51]/30 bg-red-50' : 'text-[#2F2B3D]/60 border-[#E6E6E8]'
                  }`}>
                    {colTasks.length}
                  </span>
                </div>

                {/* Column task items */}
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px] pr-1">
                  {colTasks.length === 0 ? (
                    <div className="text-center py-8 text-xxs text-slate-400 font-bold border border-dashed border-[#E6E6E8] rounded-xl bg-white/50">
                      Chưa có việc
                    </div>
                  ) : (
                    colTasks.map((t) => {
                      const assigneeObj = members.find(m => m.id === t.assignee);
                      const isOverdue = t.status === 'Trễ hạn';
                      const isTaskPrivate = t.assignee === 'an_hv' && (t.visibility || 'Riêng tư') === 'Riêng tư';
                      return (
                        <div
                          key={t.task_id}
                          onClick={() => openEditModal(t)}
                          draggable={!isReadOnly}
                          onDragStart={(e) => handleDragStart(e, t.task_id)}
                          className={`bg-white border active:scale-[0.98] ${
                            isReadOnly ? '' : 'cursor-grab active:cursor-grabbing'
                          } ${
                            isOverdue ? 'border-[#FF4C51]/40 shadow-[0_4px_12px_rgba(255,76,81,0.08)] bg-red-50/10' : 'border-[#E6E6E8] hover:border-[#8C57FF]/40 hover:shadow-[0_4px_12px_rgba(47,43,61,0.04)]'
                          } p-3.5 rounded-xl transition duration-150 cursor-pointer text-xxs space-y-3 shadow-sm relative group`}
                        >
                          <div className="flex items-start justify-between gap-1.5">
                            <span className="text-[9px] bg-[#8C57FF]/10 text-[#8C57FF] border border-[#8C57FF]/20 px-1.5 py-0.5 rounded font-extrabold uppercase tracking-wide">
                              {t.business_category}
                            </span>
                            <div className="flex items-center gap-1">
                              {isOverdue && (
                                <span className="bg-red-100 text-[#FF4C51] border border-[#FF4C51]/20 text-[8px] font-black uppercase px-1.5 py-0.5 rounded flex items-center gap-0.5 animate-pulse">
                                  <AlertTriangle className="w-2.5 h-2.5 text-[#FF4C51]" />
                                  Trễ hạn
                                </span>
                              )}
                              {t.assignee === 'an_hv' && (
                                <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase flex items-center gap-1 ${
                                  !isTaskPrivate ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-50 text-slate-500 border border-slate-150'
                                }`}>
                                  {!isTaskPrivate ? <Globe className="w-2.5 h-2.5" /> : <Lock className="w-2.5 h-2.5" />}
                                  {isTaskPrivate ? 'Riêng tư' : 'Công khai'}
                                </span>
                              )}
                              <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                                t.priority === 'Khẩn cấp' ? 'bg-red-50 text-[#FF4C51] border border-red-100' : t.priority === 'Cao' ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'bg-slate-50 text-slate-500 border border-slate-150'
                              }`}>
                                {t.priority}
                              </span>
                            </div>
                          </div>

                          <h4 className={`text-xs font-extrabold leading-snug group-hover:text-[#8C57FF] transition flex items-start gap-1 ${
                            isOverdue ? 'text-[#FF4C51]' : 'text-[#2F2B3D]'
                          }`}>
                            {isOverdue && <AlertTriangle className="w-3.5 h-3.5 text-[#FF4C51] flex-shrink-0 mt-0.5" />}
                            {isTaskPrivate && <Lock className="w-3 h-3 text-slate-400 mt-0.5 flex-shrink-0" />}
                            <span>{t.task_name}</span>
                          </h4>

                          <p className="text-xxs text-[#2F2B3D]/70 line-clamp-2">
                            {t.description}
                          </p>

                          {/* Progress bar info */}
                          <div className="space-y-1">
                            <div className="flex justify-between items-center text-[9px] text-slate-400">
                              <span>Tiến độ</span>
                              <span className={`font-bold ${isOverdue ? 'text-[#FF4C51]' : 'text-[#8C57FF]'}`}>{t.progress_percentage}%</span>
                            </div>
                            <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                style={{ width: `${t.progress_percentage}%` }}
                                className={`h-full ${isOverdue ? 'bg-[#FF4C51]' : 'bg-[#8C57FF]'} rounded-full`}
                              />
                            </div>
                          </div>

                          {/* Footer assignees & deadlines */}
                          <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-[10px] text-slate-400 font-semibold">
                            <span>📅 Hạn: <strong className={isOverdue ? 'text-[#FF4C51]' : 'text-[#2F2B3D]'}>{t.deadline}</strong></span>
                            
                            <div className="flex items-center gap-1">
                              <div className="w-5 h-5 rounded-full bg-[#8C57FF]/10 text-[#8C57FF] flex items-center justify-center font-bold text-[8px]" title={assigneeObj?.name}>
                                {assigneeObj?.name.split(' ').pop()?.slice(0, 2)}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table Layout View */
        <div className="bg-white border border-[#E6E6E8] rounded-xl mt-6 overflow-hidden shadow-[0_4px_18px_rgba(15,10,32,0.03)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-semibold">
              <thead>
                <tr className="bg-[#F8F7FA] border-b border-[#E6E6E8] text-[10px] uppercase tracking-wider font-extrabold text-[#2F2B3D]/80">
                  <th className="p-4">Mã Task</th>
                  <th className="p-4">Tên công việc</th>
                  <th className="p-4">Mảng</th>
                  <th className="p-4">Loại hình</th>
                  <th className="p-4">Phụ trách</th>
                  <th className="p-4">Độ ưu tiên</th>
                  <th className="p-4">Thời hạn</th>
                  <th className="p-4 text-center">Tiến độ</th>
                  <th className="p-4">Trạng thái</th>
                  {!isReadOnly && <th className="p-4 text-right">Thao tác</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6E6E8] text-[#2F2B3D]/90 bg-white">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-[#2F2B3D]/50 font-semibold bg-white">
                      Không tìm thấy công việc nào phù hợp bộ lọc.
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((t) => {
                    const assigneeObj = members.find(m => m.id === t.assignee);
                    const isTaskPrivate = t.assignee === 'an_hv' && (t.visibility || 'Riêng tư') === 'Riêng tư';
                    return (
                      <tr key={t.task_id} className={`hover:bg-slate-50/50 transition ${t.status === 'Trễ hạn' ? 'bg-red-50/20' : ''}`}>
                        <td className={`p-4 font-mono font-bold ${t.status === 'Trễ hạn' ? 'text-[#FF4C51] font-extrabold' : 'text-[#8C57FF]'}`}>{t.task_id}</td>
                        <td className="p-4 max-w-xs">
                          <div className={`font-bold leading-tight flex items-center gap-1.5 ${t.status === 'Trễ hạn' ? 'text-[#FF4C51] font-black' : 'text-[#2F2B3D]'}`}>
                            {t.status === 'Trễ hạn' && <AlertTriangle className="w-4 h-4 text-[#FF4C51] flex-shrink-0 animate-pulse" />}
                            {isTaskPrivate && <Lock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />}
                            <span>{t.task_name}</span>
                          </div>
                          <div className="text-xxs text-slate-400 line-clamp-1 mt-0.5 flex items-center gap-1.5">
                            {t.assignee === 'an_hv' && (
                              <>
                                <span className={`px-1 py-0.5 rounded-[3px] text-[8px] font-black uppercase tracking-wider flex items-center gap-1 ${
                                  !isTaskPrivate ? 'bg-emerald-50 text-emerald-600 border border-emerald-150' : 'bg-slate-100 text-slate-500 border border-slate-200'
                                }`}>
                                  {!isTaskPrivate ? <Globe className="w-2.5 h-2.5" /> : <Lock className="w-2.5 h-2.5" />}
                                  {isTaskPrivate ? 'Riêng tư' : 'Công khai'}
                                </span>
                                <span>•</span>
                              </>
                            )}
                            <span>{t.description}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="bg-[#8C57FF]/10 px-2 py-0.5 border border-[#8C57FF]/20 text-[#8C57FF] rounded">
                            {t.business_category}
                          </span>
                        </td>
                        <td className="p-4 text-[#2F2B3D]/70 font-bold">{t.task_type}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-[#8C57FF]/10 text-[#8C57FF] flex items-center justify-center font-bold text-[8px]">
                              {assigneeObj?.name.split(' ').pop()?.slice(0, 2)}
                            </div>
                            <span className="font-extrabold text-[#2F2B3D]/80">{assigneeObj?.name || t.assignee}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            t.priority === 'Khẩn cấp' ? 'bg-red-50 text-[#FF4C51] border border-red-150' : t.priority === 'Cao' ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'bg-slate-50 text-slate-500 border border-slate-150'
                          }`}>
                            {t.priority}
                          </span>
                        </td>
                        <td className={`p-4 font-mono font-bold ${t.status === 'Trễ hạn' ? 'text-[#FF4C51] font-extrabold' : 'text-[#2F2B3D]/60'}`}>{t.deadline}</td>
                        <td className={`p-4 text-center font-bold ${t.status === 'Trễ hạn' ? 'text-[#FF4C51]' : 'text-[#8C57FF]'}`}>{t.progress_percentage}%</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1.5 text-xxs font-black ${
                            t.status === 'Hoàn thành' ? 'text-[#56CA00]' :
                            t.status === 'Đang làm' ? 'text-[#16B1FF]' :
                            t.status === 'Chờ duyệt' ? 'text-[#FFB400]' :
                            t.status === 'Cần sửa' ? 'text-[#FFB400]' :
                            t.status === 'Trễ hạn' ? 'text-[#FF4C51] font-extrabold animate-pulse' :
                            'text-[#2F2B3D]/60'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              t.status === 'Hoàn thành' ? 'bg-[#56CA00]' :
                              t.status === 'Đang làm' ? 'bg-[#16B1FF]' :
                              t.status === 'Chờ duyệt' ? 'bg-[#FFB400]' :
                              t.status === 'Cần sửa' ? 'bg-[#FFB400]' :
                              t.status === 'Trễ hạn' ? 'bg-[#FF4C51] animate-pulse shadow-[0_0_8px_rgba(255,76,81,0.8)]' :
                              'bg-slate-400'
                            }`} />
                            {t.status}
                          </span>
                        </td>
                        {!isReadOnly && (
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openEditModal(t)}
                                className="p-1.5 bg-slate-50 hover:bg-[#8C57FF]/10 hover:text-[#8C57FF] border border-[#E6E6E8] text-slate-600 rounded transition shadow-sm"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => handleDeleteTask(t.task_id, e)}
                                className="p-1.5 bg-red-50 hover:bg-red-100 text-[#FF4C51] border border-red-200 rounded transition shadow-sm"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Task Creation & Approval Workflow Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white border border-[#E6E6E8] rounded-2xl max-w-3xl w-full p-6 text-[#2F2B3D] shadow-[0_10px_30px_rgba(47,43,61,0.2)]">
            <h3 className="text-base font-black text-[#2F2B3D] uppercase tracking-wide border-b border-[#E6E6E8] pb-3 mb-4">
              {editingTask ? `Chi Tiết & Quy Trình Duyệt Task (${editingTask.task_id})` : 'Giao Việc Phòng Marketing'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xxs text-[#2F2B3D]/70 font-extrabold uppercase block mb-1">Tên công việc / Tác vụ</label>
                  <input
                    type="text"
                    value={formData.task_name}
                    onChange={(e) => setFormData({ ...formData, task_name: e.target.value })}
                    className="w-full bg-white border border-[#E6E6E8] rounded px-2.5 py-1.5 text-xs text-[#2F2B3D] font-bold focus:border-[#8C57FF] focus:outline-none"
                    placeholder="e.g. Quay dựng video giới thiệu dịch vụ spa túi xách"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xxs text-[#2F2B3D]/70 font-extrabold uppercase block mb-1">Mô tả chi tiết và yêu cầu chuyên môn</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-white border border-[#E6E6E8] rounded p-2.5 text-xs text-[#2F2B3D] focus:border-[#8C57FF] focus:outline-none"
                  rows={3}
                  placeholder="Ghi cụ thể kịch bản thô hoặc yêu cầu kỹ thuật..."
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xxs text-[#2F2B3D]/70 font-extrabold uppercase block mb-1">Mảng dịch vụ</label>
                  <select
                    value={formData.business_category}
                    onChange={(e) => setFormData({ ...formData, business_category: e.target.value as any })}
                    className="w-full bg-white border border-[#E6E6E8] rounded px-2 py-1.5 text-xs text-[#2F2B3D] focus:border-[#8C57FF] focus:outline-none"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xxs text-[#2F2B3D]/70 font-extrabold uppercase block mb-1">Loại công việc</label>
                  <select
                    value={formData.task_type}
                    onChange={(e) => setFormData({ ...formData, task_type: e.target.value as any })}
                    className="w-full bg-white border border-[#E6E6E8] rounded px-2 py-1.5 text-xs text-[#2F2B3D] focus:border-[#8C57FF] focus:outline-none"
                  >
                    {taskTypes.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xxs text-[#2F2B3D]/70 font-extrabold uppercase block mb-1">Người phụ trách</label>
                  <select
                    value={formData.assignee}
                    onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                    className="w-full bg-white border border-[#E6E6E8] rounded px-2 py-1.5 text-xs text-[#2F2B3D] focus:border-[#8C57FF] focus:outline-none"
                    required
                  >
                    {members.map(m => (
                      <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={formData.assignee === 'an_hv' ? "grid grid-cols-4 gap-3" : "grid grid-cols-3 gap-3"}>
                <div>
                  <label className="text-xxs text-[#2F2B3D]/70 font-extrabold uppercase block mb-1">Mức độ ưu tiên</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full bg-white border border-[#E6E6E8] rounded px-2 py-1.5 text-xs text-[#2F2B3D] focus:border-[#8C57FF] focus:outline-none"
                  >
                    {priorities.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xxs text-[#2F2B3D]/70 font-extrabold uppercase block mb-1">Thời hạn (Deadline)</label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full bg-white border border-[#E6E6E8] rounded px-2 py-1.5 text-xs text-[#2F2B3D] font-mono focus:border-[#8C57FF] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-xxs text-[#2F2B3D]/70 font-extrabold uppercase block mb-1">Tiến độ (%)</label>
                  <input
                    type="number"
                    value={formData.progress_percentage}
                    onChange={(e) => setFormData({ ...formData, progress_percentage: Number(e.target.value) })}
                    className="w-full bg-white border border-[#E6E6E8] rounded px-2 py-1 text-xs text-[#2F2B3D] text-center font-bold focus:border-[#8C57FF] focus:outline-none"
                    min="0"
                    max="100"
                  />
                </div>

                {formData.assignee === 'an_hv' && (
                  <div>
                    <label className="text-xxs text-[#2F2B3D]/70 font-extrabold uppercase block mb-1">
                      Quyền hiển thị
                    </label>
                    <select
                      value={formData.visibility || 'Riêng tư'}
                      onChange={(e) => setFormData({ ...formData, visibility: e.target.value as any })}
                      disabled={activeRole !== 'Manager' && activeRole !== 'Admin'}
                      className="w-full bg-white border border-[#E6E6E8] rounded px-2 py-1.5 text-xs text-[#2F2B3D] font-bold focus:border-[#8C57FF] focus:outline-none disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
                    >
                      <option value="Riêng tư">🔒 Riêng tư (Chỉ nhân sự phụ trách & TP)</option>
                      <option value="Công khai">🌐 Công khai (Toàn bộ nhân sự thấy)</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Deliverable result expectations */}
              <div className="grid grid-cols-2 gap-3 bg-[#F4F5FA] p-3 rounded-xl border border-[#E6E6E8]">
                <div>
                  <label className="text-[10px] text-[#2F2B3D]/70 font-bold block mb-1">Kết quả cần bàn giao (Brief)</label>
                  <textarea
                    value={formData.expected_delivery}
                    onChange={(e) => setFormData({ ...formData, expected_delivery: e.target.value })}
                    className="w-full bg-white border border-[#E6E6E8] rounded p-1.5 text-xxs text-[#2F2B3D] focus:border-[#8C57FF] focus:outline-none"
                    rows={2}
                    placeholder="e.g. 1 video mp4, phụ đề đầy đủ, không bản quyền nhạc..."
                  />
                </div>

                <div>
                  <label className="text-[10px] text-[#8C57FF] font-bold block mb-1">Kết quả thực tế đã bàn giao</label>
                  <textarea
                    value={formData.actual_delivery}
                    onChange={(e) => setFormData({ ...formData, actual_delivery: e.target.value })}
                    className="w-full bg-white border border-[#E6E6E8] rounded p-1.5 text-xxs text-[#2F2B3D] focus:border-[#8C57FF] focus:outline-none"
                    rows={2}
                    placeholder="Nhân viên dán link file drive hoặc kết quả thực tế vào đây..."
                  />
                </div>
              </div>

              {/* Delay warning and notes */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xxs text-[#2F2B3D]/70 font-extrabold uppercase block mb-1">Feedback của Người duyệt / Trưởng phòng</label>
                  <input
                    type="text"
                    value={formData.feedback_notes}
                    onChange={(e) => setFormData({ ...formData, feedback_notes: e.target.value })}
                    className="w-full bg-white border border-[#E6E6E8] rounded px-2.5 py-1.5 text-xs text-[#2F2B3D] focus:border-[#8C57FF] focus:outline-none"
                    placeholder="Cần chỉnh âm lượng, lỗi chính tả, duyệt đạt..."
                  />
                </div>

                <div>
                  <label className="text-xxs text-[#FF4C51] font-extrabold uppercase block mb-1">Lý do trễ hạn (Nếu có)</label>
                  <input
                    type="text"
                    value={formData.delay_reason}
                    onChange={(e) => setFormData({ ...formData, delay_reason: e.target.value })}
                    className="w-full bg-white border border-[#E6E6E8] rounded px-2.5 py-1.5 text-xs text-[#FF4C51] focus:border-[#FF4C51] focus:outline-none placeholder-[#FF4C51]/40"
                    placeholder="e.g. do công trình thi công chậm hơn dự kiến..."
                  />
                </div>
              </div>

              {/* Status Selector & Workflow */}
              <div className="bg-[#F4F5FA] p-3 rounded-xl border border-[#E6E6E8] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <label className="text-xxs text-[#2F2B3D]/70 font-extrabold uppercase block mb-0.5">Trạng thái công việc</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
                    className="bg-white border border-[#E6E6E8] rounded px-2 py-1 text-xs text-[#8C57FF] font-bold focus:outline-none"
                  >
                    {statuses.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Workflow Helper Buttons */}
                {editingTask && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          status: 'Chờ duyệt',
                          progress_percentage: 95,
                          actual_delivery: 'Đã nộp kết quả thô, kính mong Trưởng phòng xem xét duyệt.'
                        }));
                      }}
                      className="px-2.5 py-1 bg-[#16B1FF]/10 text-[#16B1FF] hover:bg-[#16B1FF]/20 border border-[#16B1FF]/20 rounded text-[10px] font-bold transition"
                    >
                      Nộp kết quả
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          status: 'Hoàn thành',
                          progress_percentage: 100,
                          feedback_notes: 'Duyệt đạt chất lượng xuất sắc!'
                        }));
                      }}
                      className="px-2.5 py-1 bg-[#56CA00]/10 text-[#56CA00] hover:bg-[#56CA00]/20 border border-[#56CA00]/20 rounded text-[10px] font-bold transition"
                    >
                      Duyệt Đạt
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          status: 'Cần sửa',
                          feedback_notes: 'Yêu cầu rà soát kỹ lại âm thanh và lỗi chính tả.'
                        }));
                      }}
                      className="px-2.5 py-1 bg-[#FFB400]/10 text-[#FFB400] hover:bg-[#FFB400]/20 border border-[#FFB400]/20 rounded text-[10px] font-bold transition"
                    >
                      Yêu cầu sửa
                    </button>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[#E6E6E8]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-[#F4F5FA] hover:bg-[#E6E6E8] text-[#2F2B3D]/80 font-bold rounded-lg text-xs border border-[#E6E6E8] transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#8C57FF] hover:bg-[#7A40F2] text-white font-extrabold rounded-lg text-xs shadow-md transition"
                >
                  Lưu Tiến Độ Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- WEEKLY PLAN MODAL --- */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-[#E6E6E8] rounded-2xl max-w-lg w-full p-6 text-[#2F2B3D] shadow-[0_10px_30px_rgba(47,43,61,0.2)]">
            <h3 className="text-base font-black text-[#2F2B3D] uppercase tracking-wide border-b border-[#E6E6E8] pb-3 mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-[#8C57FF]" />
              <span>{editingPlan ? 'Cập Nhật Kế Hoạch Tuần' : 'Lập Kế Hoạch Tuần Mới'}</span>
            </h3>

            <div className="mb-4 bg-[#F4F5FA] p-3 rounded-lg text-xxs font-bold text-[#2F2B3D]/70 space-y-1">
              <p>👤 Nhân viên: {planCurrentMember?.name}</p>
              <p>📅 Kỳ kế hoạch: {selectedPlanWeek}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xxs text-[#5D596C] font-extrabold uppercase block mb-1">🎯 Mục tiêu trọng tâm</label>
                <textarea
                  value={planGoals}
                  onChange={(e) => setPlanGoals(e.target.value)}
                  placeholder="Nhập 2-3 mục tiêu cốt lõi của tuần này..."
                  className="w-full bg-white border border-[#E6E6E8] rounded px-3 py-2 text-xs text-[#2F2B3D] focus:outline-none focus:border-[#8C57FF] h-20"
                />
              </div>

              <div>
                <label className="text-xxs text-[#5D596C] font-extrabold uppercase block mb-1">📋 Checklist công việc dự kiến</label>
                <textarea
                  value={planTasks}
                  onChange={(e) => setPlanTasks(e.target.value)}
                  placeholder="Danh sách các đầu việc bạn dự kiến triển khai..."
                  className="w-full bg-white border border-[#E6E6E8] rounded px-3 py-2 text-xs text-[#2F2B3D] focus:outline-none focus:border-[#8C57FF] h-20"
                />
              </div>

              <div>
                <label className="text-xxs text-[#5D596C] font-extrabold uppercase block mb-1">📈 Kết quả cuối tuần</label>
                <textarea
                  value={planResults}
                  onChange={(e) => setPlanResults(e.target.value)}
                  placeholder="Cam kết hoặc kết quả dự kiến đạt được vào cuối tuần..."
                  className="w-full bg-white border border-[#E6E6E8] rounded px-3 py-2 text-xs text-[#2F2B3D] focus:outline-none focus:border-[#8C57FF] h-20"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-5 border-t border-[#E6E6E8] mt-5">
              <button
                type="button"
                onClick={() => setIsPlanModalOpen(false)}
                className="px-4 py-2 bg-[#F4F5FA] hover:bg-[#E6E6E8] text-[#2F2B3D]/80 font-bold rounded-lg text-xs border border-[#E6E6E8] transition"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => handleSavePlan('Bản nháp')}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#2F2B3D] font-bold rounded-lg text-xs border border-[#E6E6E8] transition"
              >
                Lưu Nháp
              </button>
              <button
                type="button"
                onClick={() => handleSavePlan('Chờ duyệt')}
                className="px-4 py-2 bg-[#8C57FF] hover:bg-[#7A40F2] text-white font-extrabold rounded-lg text-xs shadow-md transition"
              >
                Gửi Phê Duyệt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
