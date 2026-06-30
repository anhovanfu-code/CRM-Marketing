/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  FileText,
  Plus,
  Search,
  Trash2,
  Edit,
  Download,
  CheckCircle,
  Clock,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  Calendar,
  Layers,
  User,
  ListTodo,
  TrendingUp,
  Briefcase,
  Award,
  BookOpen,
  Eye,
  Settings,
  HelpCircle
} from 'lucide-react';
import { WorkReport, TeamMember, UserRole, Task, WebhookConfig } from '../types';

interface ReportsViewProps {
  reports: WorkReport[];
  setReports: React.Dispatch<React.SetStateAction<WorkReport[]>>;
  tasks: Task[];
  members: TeamMember[];
  activeRole: UserRole;
  onExport: () => void;
  onPrint?: (report: WorkReport) => void;
  webhooks?: WebhookConfig[];
  currentUserEmail?: string;
}

const WEEKS = [
  { id: 'w23', name: 'Tuần 23 (01/06 - 07/06/2026)', start: '2026-06-01', end: '2026-06-07' },
  { id: 'w24', name: 'Tuần 24 (08/06 - 14/06/2026)', start: '2026-06-08', end: '2026-06-14' },
  { id: 'w25', name: 'Tuần 25 (15/06 - 21/06/2026)', start: '2026-06-15', end: '2026-06-21' },
  { id: 'w26', name: 'Tuần 26 (22/06 - 28/06/2026)', start: '2026-06-22', end: '2026-06-28' },
  { id: 'w27', name: 'Tuần 27 (29/06 - 05/07/2026)', start: '2026-06-29', end: '2026-07-05' },
  { id: 'w28', name: 'Tuần 28 (06/07 - 12/07/2026)', start: '2026-07-06', end: '2026-07-12' },
];

const MONTHS = [
  { id: 'm05', name: 'Tháng 05/2026', value: '2026-05' },
  { id: 'm06', name: 'Tháng 06/2026', value: '2026-06' },
  { id: 'm07', name: 'Tháng 07/2026', value: '2026-07' },
  { id: 'm08', name: 'Tháng 08/2026', value: '2026-08' },
];

export default function ReportsView({
  reports,
  setReports,
  tasks,
  members,
  activeRole,
  onExport,
  onPrint,
  webhooks,
  currentUserEmail,
}: ReportsViewProps) {
  // Báo cáo general filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterReporter, setFilterReporter] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Employee report aggregator filters
  const [aggMember, setAggMember] = useState<string>(members[0]?.id || 'all');
  const [aggType, setAggType] = useState<'Ngày' | 'Tuần' | 'Tháng'>('Tuần');
  const [aggDate, setAggDate] = useState<string>('2026-06-26');
  const [aggWeek, setAggWeek] = useState<string>('w26');
  const [aggMonth, setAggMonth] = useState<string>('m06');

  // Modals
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<WorkReport | null>(null);

  // Form Fields - Reports
  const [reportFormData, setReportFormData] = useState<Partial<WorkReport>>({
    reporter_id: '',
    report_date: new Date().toISOString().split('T')[0],
    report_type: 'Tuần',
    completed_tasks_summary: '',
    pending_tasks_summary: '',
    overdue_tasks_summary: '',
    overdue_reason: '',
    results_achieved: '',
    issues_encountered: '',
    proposed_solutions: '',
    support_needed: '',
    next_plans: '',
    reviewer_id: '',
    status: 'Chờ duyệt'
  });

  const isReadOnly = activeRole === 'Viewer';

  // --- BÁO CÁO NHANH (QUICK DAILY REPORT) FEATURE ---
  const [isQuickReportModalOpen, setIsQuickReportModalOpen] = useState(false);
  const [quickReportNotes, setQuickReportNotes] = useState('');
  const [isSendingQuickReport, setIsSendingQuickReport] = useState(false);

  // Identify current member logged in
  const currentMember = useMemo(() => {
    return members.find(m => {
      const email = m.email.toLowerCase();
      const userEmail = currentUserEmail?.toLowerCase() || '';
      return email === userEmail || (userEmail === 'anhovan.fu@gmail.com' && m.id === 'an_hv');
    }) || members[0]; // Fallback to first member
  }, [members, currentUserEmail]);

  const todayStr = useMemo(() => {
    return '2026-06-30'; // aligns with current metadata date exactly
  }, []);

  // Filter completed tasks today for current member
  const completedTasksToday = useMemo(() => {
    if (!currentMember) return [];
    return tasks.filter(t => 
      t.assignee === currentMember.id && 
      t.status === 'Hoàn thành' && 
      t.actual_completion_date === todayStr
    );
  }, [tasks, currentMember, todayStr]);

  const openQuickReportModal = () => {
    setQuickReportNotes('');
    setIsQuickReportModalOpen(true);
  };

  const handleQuickReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    setIsSendingQuickReport(true);

    try {
      const reportId = `RPT-${String(reports.length + 1).padStart(3, '0')}`;
      const summaryOfTasks = completedTasksToday.length > 0 
        ? completedTasksToday.map((t, idx) => `${idx + 1}. ${t.task_name} [${t.task_id}]`).join('\n')
        : 'Hôm nay không có công việc nào hoàn thành trực tiếp trên hệ thống.';

      const quickReport: WorkReport = {
        report_id: reportId,
        reporter_id: currentMember.id,
        report_date: todayStr,
        report_type: 'Ngày',
        completed_tasks_summary: summaryOfTasks,
        pending_tasks_summary: 'Các công việc khác đang được tiếp tục triển khai.',
        overdue_tasks_summary: '0',
        overdue_reason: 'N/A',
        results_achieved: `Báo cáo nhanh cuối ngày tự động. Hoàn thành ${completedTasksToday.length} công việc. ${quickReportNotes ? `Ghi chú: ${quickReportNotes}` : ''}`,
        issues_encountered: 'Không có',
        proposed_solutions: 'Không có',
        support_needed: 'Không có',
        next_plans: 'Duy trì kế hoạch đề ra.',
        reviewer_id: 'an_hv',
        status: 'Chờ duyệt'
      };

      // 1. Save locally & Firestore
      setReports(prev => [quickReport, ...prev]);

      // 2. Trigger webhook notification
      const managerWebhook = webhooks?.find(w => w.isActive && (w.id === 'quan_ly' || w.groupName === 'Quản lý')) 
                         || webhooks?.find(w => w.isActive && w.webhookUrl)
                         || webhooks?.find(w => w.id === 'quan_ly' || w.groupName === 'Quản lý');

      if (managerWebhook && managerWebhook.webhookUrl) {
        const completedTasksText = completedTasksToday.length > 0
          ? completedTasksToday.map((t, idx) => `${idx + 1}. *${t.task_name}* [${t.task_id}] - Mảng: _${t.business_category}_`).join('\n')
          : '_Không có task hoàn thành trực tiếp trên hệ thống hôm nay._';

        const messageText = `⚡ *NỘP BÁO CÁO NGÀY NHANH* ⚡\n\n` +
          `• *Nhân sự báo cáo:* ${currentMember.name} (Nhóm: ${currentMember.specialist_group})\n` +
          `• *Ngày lập:* ${todayStr}\n` +
          `• *Loại báo cáo:* Báo cáo ngày (Hệ thống tự động tổng hợp)\n` +
          `• *Công việc đã hoàn thành trong ngày:*\n${completedTasksText}\n\n` +
          (quickReportNotes ? `• *Ghi chú bổ sung:* _${quickReportNotes}_\n` : '') +
          `• *Trạng thái:* Chờ Trưởng phòng phê duyệt.\n\n` +
          `_*Hệ thống báo cáo tự động FUGALO*_`;

        const payload = { text: messageText };

        await fetch(managerWebhook.webhookUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
        alert('Nộp báo cáo ngày thành công và đã gửi thông báo tới Google Chat của Manager!');
      } else {
        alert('Nộp báo cáo ngày thành công! (Lưu ý: Chưa cấu hình hoặc chưa kích hoạt Webhook Google Chat của Manager).');
      }
    } catch (err) {
      console.error(err);
      alert('Đã có lỗi xảy ra khi gửi báo cáo ngày.');
    } finally {
      setIsSendingQuickReport(false);
      setIsQuickReportModalOpen(false);
    }
  };

  // Open Report Modal
  const openCreateReportModal = () => {
    setEditingReport(null);
    setReportFormData({
      reporter_id: members[0]?.id || '',
      report_date: '2026-06-26', // stable timeline date
      report_type: 'Tuần',
      completed_tasks_summary: 'Hoàn thiện 3 video shophouse mảng Nội thất, đăng tải 2 video TikTok đạt chỉ số tương tác cao.',
      pending_tasks_summary: 'Đang dựng video biệt thự Phúc Đạt bản HD.',
      overdue_tasks_summary: '0',
      overdue_reason: 'N/A',
      results_achieved: 'Đạt 45k lượt tiếp cận, thu hút 12 khách hàng liên hệ tư vấn.',
      issues_encountered: 'Không có vướng mắc đáng kể.',
      proposed_solutions: 'Tiếp tục bám sát lịch quay chụp mảng Nội thất.',
      support_needed: 'Không có.',
      next_plans: 'Lên kịch bản livestream mảng Phong thủy cải mệnh.',
      reviewer_id: members.find(m => m.id === 'an_hv')?.id || members[0]?.id || '',
      status: 'Chờ duyệt'
    });
    setIsReportModalOpen(true);
  };

  const openEditReportModal = (report: WorkReport) => {
    setEditingReport(report);
    setReportFormData({ ...report });
    setIsReportModalOpen(true);
  };

  const handleDeleteReport = (id: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa báo cáo ${id}?`)) {
      setReports(prev => prev.filter(r => r.report_id !== id));
    }
  };

  // Submit Report
  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;

    if (editingReport) {
      setReports(prev => prev.map(r => r.report_id === editingReport.report_id ? {
        ...r,
        ...reportFormData
      } as WorkReport : r));
    } else {
      const newReport: WorkReport = {
        report_id: `RPT-${String(reports.length + 1).padStart(3, '0')}`,
        reporter_id: reportFormData.reporter_id || '',
        report_date: reportFormData.report_date || '2026-06-26',
        report_type: reportFormData.report_type as any || 'Tuần',
        completed_tasks_summary: reportFormData.completed_tasks_summary || '',
        pending_tasks_summary: reportFormData.pending_tasks_summary || '',
        overdue_tasks_summary: reportFormData.overdue_tasks_summary || '',
        overdue_reason: reportFormData.overdue_reason || '',
        results_achieved: reportFormData.results_achieved || '',
        issues_encountered: reportFormData.issues_encountered || '',
        proposed_solutions: reportFormData.proposed_solutions || '',
        support_needed: reportFormData.support_needed || '',
        next_plans: reportFormData.next_plans || '',
        reviewer_id: reportFormData.reviewer_id || '',
        status: reportFormData.status as any || 'Chờ duyệt'
      };
      setReports(prev => [newReport, ...prev]);
    }
    setIsReportModalOpen(false);
  };

  // 1. FILTER: General reports list
  const filteredReports = reports.filter(r => {
    const author = members.find(m => m.id === r.reporter_id);
    const authorName = author ? author.name.toLowerCase() : '';
    const matchesSearch = r.completed_tasks_summary.toLowerCase().includes(searchQuery.toLowerCase()) || authorName.includes(searchQuery.toLowerCase());
    const matchesReporter = filterReporter === 'all' || r.reporter_id === filterReporter;
    const matchesStatus = filterStatus === 'all' || r.status === filterStatus;

    return matchesSearch && matchesReporter && matchesStatus;
  });

  // 2. AGGREGATOR: Interactive employee Day/Week/Month work compiler
  const compiledEmployeeResults = useMemo(() => {
    if (aggMember === 'all') return null;

    const member = members.find(m => m.id === aggMember);
    if (!member) return null;

    let periodStart = '';
    let periodEnd = '';
    let periodText = '';

    // Define period boundaries
    if (aggType === 'Ngày') {
      periodStart = aggDate;
      periodEnd = aggDate;
      periodText = aggDate;
    } else if (aggType === 'Tuần') {
      const wkObj = WEEKS.find(w => w.id === aggWeek);
      if (wkObj) {
        periodStart = wkObj.start;
        periodEnd = wkObj.end;
        periodText = wkObj.name;
      }
    } else if (aggType === 'Tháng') {
      const moObj = MONTHS.find(m => m.id === aggMonth);
      if (moObj) {
        periodStart = `${moObj.value}-01`;
        periodEnd = `${moObj.value}-31`;
        periodText = moObj.name;
      }
    }

    // A. Filter submitted WorkReports
    const matchedReports = reports.filter(r => {
      if (r.reporter_id !== aggMember) return false;
      if (r.report_type !== aggType) return false;

      if (aggType === 'Ngày') {
        return r.report_date === aggDate;
      } else if (aggType === 'Tuần') {
        // Report falls in the week
        return r.report_date >= periodStart && r.report_date <= periodEnd;
      } else if (aggType === 'Tháng') {
        // Report falls in the month
        return r.report_date.startsWith(periodStart.substring(0, 7));
      }
      return false;
    });

    // B. Filter actual matching Tasks assigned in this period
    const matchedTasks = tasks.filter(t => {
      // Must be assigned or co-worker
      const isAssigned = t.assignee === aggMember || t.collaborators?.includes(aggMember);
      if (!isAssigned) return false;

      // Check date range overlap
      // Task overlaps if task deadline falls inside period, or is active during period
      const taskStart = t.start_date || t.deadline;
      const taskEnd = t.deadline;

      if (aggType === 'Ngày') {
        return taskStart <= aggDate && aggDate <= taskEnd;
      } else {
        return (taskStart <= periodEnd && taskEnd >= periodStart);
      }
    });

    const totalTasksCount = matchedTasks.length;
    const completedTasksCount = matchedTasks.filter(t => t.status === 'Hoàn thành').length;
    const pendingTasksCount = matchedTasks.filter(t => t.status === 'Đang làm' || t.status === 'Chờ duyệt').length;
    const overdueTasksCount = matchedTasks.filter(t => t.status === 'Trễ hạn').length;
    
    const taskCompletionRate = totalTasksCount > 0 
      ? Math.round((completedTasksCount / totalTasksCount) * 100) 
      : 0;

    return {
      member,
      periodText,
      matchedReports,
      matchedTasks,
      metrics: {
        totalTasksCount,
        completedTasksCount,
        pendingTasksCount,
        overdueTasksCount,
        taskCompletionRate
      }
    };

  }, [reports, tasks, members, aggMember, aggType, aggDate, aggWeek, aggMonth]);

  const statuses = ['Chờ duyệt', 'Đã duyệt', 'Cần bổ sung', 'Từ chối'];
  const reportTypes = ['Ngày', 'Tuần', 'Tháng', 'Campaign'];
  const planStatuses = ['Bản nháp', 'Đã chốt', 'Đang triển khai', 'Đã hoàn thành'];

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-transparent text-slate-100 p-6">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-amber-500 font-bold text-xs uppercase tracking-widest mb-1">
            <FileText className="w-4 h-4" />
            <span>FUGALO REPORTING SYSTEM</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">BÁO CÁO CÔNG VIỆC MARKETING</h1>
          <p className="text-xs text-slate-400 mt-1">Giám sát tổng hợp kết quả công việc đã hoàn tất, đối chiếu thực tế chuyên môn</p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onExport}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#F4F5FA] border border-[#E6E6E8] rounded-lg text-xs font-bold text-[#2F2B3D] transition"
          >
            <Download className="w-3.5 h-3.5 text-[#2F2B3D]" />
            <span>Xuất báo cáo</span>
          </button>

          {!isReadOnly && (
            <div className="flex gap-2">
              <button
                onClick={openQuickReportModal}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-lg text-xs font-extrabold shadow-md transition"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Nộp Báo Cáo Ngày (Nhanh)</span>
              </button>
              <button
                onClick={openCreateReportModal}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-extrabold shadow-md transition"
              >
                <Plus className="w-4 h-4" />
                <span>Nộp Báo Cáo Mới</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ======================== BÁO CÁO CÔNG VIỆC ======================== */}
      <div className="space-y-6 mt-6">
          
          {/* A. Dynamic Interactive Report Compiler according to Employee and Time-range */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mt-6 shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-500">
                <Search className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">🔍 Tra cứu & Phân tích Báo cáo theo nhân sự</h3>
                <p className="text-[10px] text-slate-400">Xem báo cáo Ngày/Tuần/Tháng cụ thể của từng nhân viên và đối chiếu với danh sách công việc thực tế</p>
              </div>
            </div>

            {/* Selector Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-850">
              
              {/* Member Selector */}
              <div>
                <label className="text-[10px] text-slate-400 font-extrabold uppercase block mb-1">Chọn nhân sự</label>
                <select
                  value={aggMember}
                  onChange={(e) => setAggMember(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="all">-- Chọn nhân sự muốn tra cứu --</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
                  ))}
                </select>
              </div>

              {/* Aggregator Type */}
              <div>
                <label className="text-[10px] text-slate-400 font-extrabold uppercase block mb-1">Kỳ báo cáo</label>
                <select
                  value={aggType}
                  onChange={(e) => setAggType(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Ngày">Hằng ngày (Day)</option>
                  <option value="Tuần">Hằng tuần (Week)</option>
                  <option value="Tháng">Hằng tháng (Month)</option>
                </select>
              </div>

              {/* Date/Week/Month picker based on type */}
              <div className="sm:col-span-2">
                <label className="text-[10px] text-slate-400 font-extrabold uppercase block mb-1">Thời gian cụ thể</label>
                
                {aggType === 'Ngày' && (
                  <input
                    type="date"
                    value={aggDate}
                    onChange={(e) => setAggDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                )}

                {aggType === 'Tuần' && (
                  <select
                    value={aggWeek}
                    onChange={(e) => setAggWeek(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    {WEEKS.map(w => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                )}

                {aggType === 'Tháng' && (
                  <select
                    value={aggMonth}
                    onChange={(e) => setAggMonth(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    {MONTHS.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                )}
              </div>

            </div>

            {/* Results aggregation */}
            {compiledEmployeeResults ? (
              <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-5 animate-fade-in text-xxs">
                
                {/* Side A: Submitted Reports Info */}
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
                      <span className="font-extrabold text-amber-500 uppercase tracking-wide">📝 BÁO CÁO ĐÃ NỘP HỆ THỐNG</span>
                      <span className="text-[10px] text-slate-400 font-bold">{compiledEmployeeResults.periodText}</span>
                    </div>

                    {compiledEmployeeResults.matchedReports.length === 0 ? (
                      <div className="py-12 text-center text-slate-500">
                        <AlertTriangle className="w-8 h-8 text-amber-500/40 mx-auto mb-2 animate-pulse" />
                        <p className="font-extrabold uppercase text-[10px]">Chưa nộp báo cáo bản cứng/mềm</p>
                        <p className="text-[10px] text-slate-400 mt-1">Nhân sự chưa khởi tạo báo cáo cho kỳ {aggType} này.</p>
                      </div>
                    ) : (
                      compiledEmployeeResults.matchedReports.map((r) => (
                        <div key={r.report_id} className="space-y-3">
                          <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                            <div>
                              <span className="font-extrabold text-[#E04B1C] uppercase block">Báo cáo {r.report_type} ({r.report_id})</span>
                              <span className="text-[10px] text-slate-400">Ngày lập: {r.report_date}</span>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                              r.status === 'Đã duyệt' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                            }`}>{r.status}</span>
                          </div>

                          <div className="space-y-2.5 text-[11px] leading-relaxed">
                            <div>
                              <strong className="text-white block">✅ Tóm tắt công việc đã xong:</strong>
                              <p className="text-slate-300 bg-slate-900/30 p-2 rounded border border-slate-850 mt-1">{r.completed_tasks_summary}</p>
                            </div>
                            <div>
                              <strong className="text-emerald-400 block">🎯 Kết quả định lượng:</strong>
                              <p className="text-slate-300 italic">{r.results_achieved || 'Chưa cập nhật'}</p>
                            </div>
                            {r.issues_encountered && (
                              <div>
                                <strong className="text-red-400 block">⚠️ Khó khăn vướng mắc:</strong>
                                <p className="text-slate-300">{r.issues_encountered}</p>
                              </div>
                            )}
                            <div>
                              <strong className="text-sky-400 block">🚀 Dự định kỳ tới:</strong>
                              <p className="text-slate-300">{r.next_plans || 'Duy trì kế hoạch.'}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {compiledEmployeeResults.matchedReports.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-850 flex justify-end">
                      <button
                        onClick={() => openEditReportModal(compiledEmployeeResults.matchedReports[0])}
                        className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded text-xxs transition"
                      >
                        Duyệt & Sửa nhanh
                      </button>
                    </div>
                  )}
                </div>

                {/* Side B: Automated Tasks Compiling from Database */}
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-850">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
                    <span className="font-extrabold text-sky-400 uppercase tracking-wide">⚙️ DỮ LIỆU ĐẦU VIỆC THỰC TẾ</span>
                    <span className="text-[10px] text-slate-400 font-bold">Tổng hợp tự động</span>
                  </div>

                  {/* Micro stats banner */}
                  <div className="grid grid-cols-4 gap-2 text-center mb-3">
                    <div className="bg-slate-900 p-2 rounded border border-slate-800">
                      <div className="text-sm font-black text-white">{compiledEmployeeResults.metrics.totalTasksCount}</div>
                      <div className="text-[8px] text-slate-400 uppercase">Tổng đầu việc</div>
                    </div>
                    <div className="bg-slate-900 p-2 rounded border border-slate-800">
                      <div className="text-sm font-black text-emerald-400">{compiledEmployeeResults.metrics.completedTasksCount}</div>
                      <div className="text-[8px] text-emerald-500 uppercase">Hoàn thành</div>
                    </div>
                    <div className="bg-slate-900 p-2 rounded border border-slate-800">
                      <div className="text-sm font-black text-amber-500">{compiledEmployeeResults.metrics.pendingTasksCount}</div>
                      <div className="text-[8px] text-amber-500 uppercase">Đang làm</div>
                    </div>
                    <div className="bg-slate-900 p-2 rounded border border-slate-800">
                      <div className="text-sm font-black text-red-500">{compiledEmployeeResults.metrics.overdueTasksCount}</div>
                      <div className="text-[8px] text-red-400 uppercase">Trễ hạn</div>
                    </div>
                  </div>

                  {/* Task list */}
                  {compiledEmployeeResults.matchedTasks.length === 0 ? (
                    <div className="py-8 text-center text-slate-500">
                      Không có đầu việc nào được phân công chính thức trong kỳ này.
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1 text-[10px]">
                      {compiledEmployeeResults.matchedTasks.map(t => (
                        <div key={t.task_id} className="bg-slate-900/55 p-2 rounded border border-slate-850 flex items-center justify-between gap-3 hover:bg-slate-900 transition">
                          <div className="truncate flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-extrabold text-white truncate">{t.task_name}</span>
                              <span className="text-[8px] text-slate-500 shrink-0 font-mono">({t.task_id})</span>
                            </div>
                            <div className="flex items-center gap-2 text-[9px] text-slate-400 mt-1">
                              <span>Hạn: {t.deadline}</span>
                              <span>•</span>
                              <span className="text-amber-500 font-bold">{t.priority}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`px-1.5 py-0.2 rounded text-[8px] font-black uppercase border ${
                              t.status === 'Hoàn thành' 
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25' 
                                : t.status === 'Trễ hạn'
                                ? 'bg-red-500/10 text-red-400 border-red-500/25 animate-pulse'
                                : 'bg-amber-500/10 text-amber-400 border-amber-500/25'
                            }`}>{t.status}</span>
                            
                            <div className="w-10 bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
                              <div className="bg-amber-500 h-full" style={{ width: `${t.progress_percentage}%` }} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Automated KPI alert */}
                  <div className="mt-3 p-2 bg-[#F8F9FA]/5 border border-slate-800 rounded-lg flex items-center gap-2 text-[9px] text-slate-400 leading-normal">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Dữ liệu này được đối chiếu với KPI đã giao. Tỷ lệ hoàn thành công việc thực tế trong kỳ: <strong>{compiledEmployeeResults.metrics.taskCompletionRate}%</strong></span>
                  </div>
                </div>

              </div>
            ) : (
              <div className="mt-4 p-8 text-center text-slate-500 text-xs font-semibold bg-slate-950/30 border border-dashed border-slate-800 rounded-xl">
                💡 Hãy chọn một nhân sự ở bảng điều khiển bên trên để bắt đầu đối chiếu báo cáo công việc tự động.
              </div>
            )}

          </div>

          {/* B. General Reports Database Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="border-b border-slate-850 pb-3.5 mb-4">
              <h3 className="text-xs font-black text-white uppercase tracking-wider">📋 Toàn bộ danh sách báo cáo</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Lọc, tra cứu và tải xuống dữ liệu báo cáo thô của toàn ê-kíp</p>
            </div>

            {/* Filters Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Tìm nội dung công việc, họ tên nhân sự..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
                />
              </div>

              <div>
                <select
                  value={filterReporter}
                  onChange={(e) => setFilterReporter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-semibold text-slate-300 focus:outline-none focus:border-amber-500"
                >
                  <option value="all">Tất cả người nộp</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-semibold text-slate-300 focus:outline-none focus:border-amber-500"
                >
                  <option value="all">Tất cả trạng thái</option>
                  {statuses.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Reports list */}
            <div className="grid grid-cols-1 gap-4 mt-4">
              {filteredReports.length === 0 ? (
                <div className="bg-slate-950/40 border border-dashed border-slate-800 p-8 text-center text-slate-500 font-semibold rounded-xl">
                  Không tìm thấy báo cáo công việc nào khớp với bộ lọc.
                </div>
              ) : (
                filteredReports.map((r) => {
                  const reporter = members.find(m => m.id === r.reporter_id);
                  const reviewer = members.find(m => m.id === r.reviewer_id);
                  return (
                    <div key={r.report_id} className="bg-slate-950/30 border border-slate-850 rounded-xl p-4 hover:border-slate-800 transition text-xxs leading-relaxed">
                      
                      {/* Item header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-850 pb-2 mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center font-extrabold">
                            {reporter?.name.split(' ').pop()?.slice(0, 2)}
                          </div>
                          <div>
                            <span className="font-extrabold text-white text-[11px]">{reporter?.name}</span>
                            <span className="text-[10px] text-slate-400 font-bold"> • Báo cáo {r.report_type} • Ngày {r.report_date}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className={`text-[9px] font-black px-2 py-0.2 rounded-full uppercase ${
                            r.status === 'Đã duyệt'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : r.status === 'Chờ duyệt'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}>
                            {r.status}
                          </span>
                          <span className="font-mono text-slate-500">ID: {r.report_id}</span>
                        </div>
                      </div>

                      {/* Content highlights */}
                      <p className="text-slate-300 font-medium line-clamp-2 mb-2">
                        <strong className="text-slate-400">Hoàn thành:</strong> {r.completed_tasks_summary}
                      </p>

                      <div className="flex items-center justify-between border-t border-slate-850/50 pt-2 text-[10px]">
                        <span className="text-slate-500">Người duyệt: <strong className="text-slate-400">{reviewer?.name || 'Manager'}</strong></span>
                        
                        <div className="flex items-center gap-1.5">
                          {onPrint && (
                            <button
                              onClick={() => onPrint(r)}
                              className="px-2 py-0.5 bg-[#E04B1C]/10 text-[#E04B1C] font-bold rounded hover:bg-[#E04B1C]/15 transition"
                            >
                              Xuất PDF
                            </button>
                          )}
                          {!isReadOnly && (
                            <>
                              <button
                                onClick={() => openEditReportModal(r)}
                                className="px-2 py-0.5 bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded font-bold transition"
                              >
                                Sửa
                              </button>
                              <button
                                onClick={() => handleDeleteReport(r.report_id)}
                                className="px-2 py-0.5 bg-red-500/10 text-red-400 rounded hover:bg-red-500/15 transition"
                              >
                                Xóa
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                    </div>
                  );
                })
              )}
            </div>

          </div>

        </div>

      {/* 3. REPORT CRUD & APPROVAL MODAL */}
      {isReportModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white border border-[#E6E6E8] rounded-2xl max-w-3xl w-full p-6 text-[#2F2B3D] shadow-[0_10px_30px_rgba(47,43,61,0.2)]">
            <h3 className="text-base font-black text-[#2F2B3D] uppercase tracking-wide border-b border-[#E6E6E8] pb-3 mb-4">
              {editingReport ? 'Chi Tiết & Phê Duyệt Báo Cáo' : 'Nộp Báo Cáo Công Việc'}
            </h3>

            <form onSubmit={handleReportSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xxs text-[#5D596C] font-extrabold uppercase block mb-1">Nhân sự nộp báo cáo</label>
                  <select
                    value={reportFormData.reporter_id}
                    onChange={(e) => setReportFormData({ ...reportFormData, reporter_id: e.target.value })}
                    disabled={!!editingReport}
                    className="w-full bg-[#F8F9FA] border border-[#E6E6E8] rounded px-2.5 py-1.5 text-xs text-[#2F2B3D] font-bold focus:outline-none focus:border-[#E04B1C] transition"
                  >
                    {members.map(m => (
                      <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xxs text-[#5D596C] font-extrabold uppercase block mb-1">Kỳ báo cáo</label>
                  <select
                    value={reportFormData.report_type}
                    onChange={(e) => setReportFormData({ ...reportFormData, report_type: e.target.value as any })}
                    className="w-full bg-[#F8F9FA] border border-[#E6E6E8] rounded px-2.5 py-1.5 text-xs text-[#2F2B3D] font-bold focus:outline-none"
                  >
                    {reportTypes.map(t => (
                      <option key={t} value={t}>Báo cáo {t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xxs text-[#5D596C] font-extrabold uppercase block mb-1">Tóm tắt kết quả công việc hoàn thành trong kỳ</label>
                <textarea
                  value={reportFormData.completed_tasks_summary}
                  onChange={(e) => setReportFormData({ ...reportFormData, completed_tasks_summary: e.target.value })}
                  className="w-full bg-[#F8F9FA] border border-[#E6E6E8] rounded p-2 text-xs text-[#2F2B3D] font-medium focus:outline-none"
                  rows={2}
                  placeholder="Ghi rõ các task đã giải quyết, clip dựng xong, bài viết seeding đã lên..."
                  required
                />
              </div>

              <div>
                <label className="text-xxs text-[#5D596C] font-extrabold uppercase block mb-1">Kết quả định lượng cụ thể đạt được (KPIs thực tế)</label>
                <input
                  type="text"
                  value={reportFormData.results_achieved}
                  onChange={(e) => setReportFormData({ ...reportFormData, results_achieved: e.target.value })}
                  className="w-full bg-[#F8F9FA] border border-[#E6E6E8] rounded px-2.5 py-1.5 text-xs text-[#2F2B3D] font-bold focus:outline-none"
                  placeholder="e.g. 10 bài đăng đạt 12k reach, 50 lượt tương tác..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xxs text-[#5D596C] font-extrabold uppercase block mb-1">Công việc dở dang</label>
                  <input
                    type="text"
                    value={reportFormData.pending_tasks_summary}
                    onChange={(e) => setReportFormData({ ...reportFormData, pending_tasks_summary: e.target.value })}
                    className="w-full bg-[#F8F9FA] border border-[#E6E6E8] rounded px-2.5 py-1.5 text-xs text-[#2F2B3D] focus:outline-none"
                    placeholder="Các task chưa xong..."
                  />
                </div>

                <div>
                  <label className="text-xxs text-[#5D596C] font-extrabold uppercase block mb-1">Khó khăn vướng mắc</label>
                  <input
                    type="text"
                    value={reportFormData.issues_encountered}
                    onChange={(e) => setReportFormData({ ...reportFormData, issues_encountered: e.target.value })}
                    className="w-full bg-[#F8F9FA] border border-[#E6E6E8] rounded px-2.5 py-1.5 text-xs text-[#2F2B3D] focus:outline-none"
                    placeholder="Trở ngại chuyên môn (nếu có)..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xxs text-[#5D596C] font-extrabold uppercase block mb-1">Giải pháp đề xuất</label>
                  <input
                    type="text"
                    value={reportFormData.proposed_solutions}
                    onChange={(e) => setReportFormData({ ...reportFormData, proposed_solutions: e.target.value })}
                    className="w-full bg-[#F8F9FA] border border-[#E6E6E8] rounded px-2.5 py-1.5 text-xs text-[#2F2B3D] focus:outline-none"
                    placeholder="Giải pháp vượt qua trở ngại..."
                  />
                </div>

                <div>
                  <label className="text-xxs text-[#5D596C] font-extrabold uppercase block mb-1">Kế hoạch kỳ tiếp theo</label>
                  <input
                    type="text"
                    value={reportFormData.next_plans}
                    onChange={(e) => setReportFormData({ ...reportFormData, next_plans: e.target.value })}
                    className="w-full bg-[#F8F9FA] border border-[#E6E6E8] rounded px-2.5 py-1.5 text-xs text-[#2F2B3D] focus:outline-none"
                    placeholder="e.g. Triển khai livestream mảng hàng hiệu..."
                  />
                </div>
              </div>

              <div className="bg-[#F8F9FA] p-3 rounded-xl border border-[#E6E6E8] space-y-3">
                <h4 className="text-xxs font-black text-[#E04B1C] uppercase tracking-wider">Phê Duyệt của Cấp Quản Lý</h4>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xxs text-[#5D596C] font-extrabold uppercase block mb-1">Quyết định duyệt</label>
                    <select
                      value={reportFormData.status}
                      onChange={(e) => setReportFormData({ ...reportFormData, status: e.target.value as any })}
                      className="w-full bg-white border border-[#E6E6E8] rounded px-2.5 py-1.5 text-xs text-[#2F2B3D] font-bold focus:outline-none"
                    >
                      {statuses.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xxs text-[#5D596C] font-extrabold uppercase block mb-1">Người duyệt</label>
                    <select
                      value={reportFormData.reviewer_id}
                      onChange={(e) => setReportFormData({ ...reportFormData, reviewer_id: e.target.value })}
                      className="w-full bg-white border border-[#E6E6E8] rounded px-2.5 py-1.5 text-xs text-[#2F2B3D] font-bold focus:outline-none"
                    >
                      {members.map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[#E6E6E8]">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="px-4 py-2 bg-[#F4F5FA] hover:bg-[#E6E6E8] text-[#2F2B3D]/80 border border-[#E6E6E8] font-bold rounded-lg text-xs transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#E04B1C] hover:bg-[#C53A0F] text-white font-extrabold rounded-lg text-xs shadow-md transition"
                >
                  Xác nhận báo cáo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- QUICK REPORT MODAL --- */}
      {isQuickReportModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-[#E6E6E8] overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-6 py-4 bg-emerald-600 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <h3 className="font-extrabold tracking-tight uppercase text-sm">BÁO CÁO NHANH CUỐI NGÀY</h3>
              </div>
              <span className="text-xs bg-emerald-700 font-bold px-2 py-0.5 rounded font-mono">
                {todayStr}
              </span>
            </div>

            <form onSubmit={handleQuickReportSubmit} className="p-6 flex-1 overflow-y-auto space-y-4">
              <div className="bg-[#F4F5FA] border border-[#E6E6E8] rounded-xl p-4 space-y-2 text-xs text-[#2F2B3D]">
                <p>👤 <strong>Nhân viên:</strong> {currentMember?.name} ({currentMember?.role})</p>
                <p>📌 <strong>Nhóm chuyên môn:</strong> {currentMember?.specialist_group}</p>
                <p>📅 <strong>Kỳ báo cáo:</strong> Báo cáo ngày ({todayStr})</p>
              </div>

              <div>
                <label className="text-xxs text-[#5D596C] font-extrabold uppercase block mb-1">
                  Công việc hoàn thành trong ngày (Hệ thống tự động tổng hợp)
                </label>
                {completedTasksToday.length === 0 ? (
                  <div className="p-4 bg-amber-50 text-amber-800 rounded-lg border border-amber-200 text-xs flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-bold">Không tìm thấy task hoàn thành hôm nay!</p>
                      <p className="text-[11px] mt-0.5">Bạn cần chuyển trạng thái các task sang "Hoàn thành" trong Module Task để hệ thống tự động nhận diện.</p>
                    </div>
                  </div>
                ) : (
                  <div className="max-h-40 overflow-y-auto border border-[#E6E6E8] rounded-lg p-2.5 space-y-1 bg-white">
                    {completedTasksToday.map((task, idx) => (
                      <div key={task.task_id} className="text-xs text-[#2F2B3D] flex items-start gap-1.5 py-1 border-b border-slate-50 last:border-0">
                        <span className="text-emerald-600 font-bold">✔</span>
                        <div>
                          <strong className="font-bold text-[#8C57FF]">{task.task_id}</strong> - {task.task_name}
                          <span className="block text-[10px] text-slate-400 font-medium">Mảng: {task.business_category}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="text-xxs text-[#5D596C] font-extrabold uppercase block mb-1">
                  Ghi chú hoặc bổ sung kết quả khác (Không bắt buộc)
                </label>
                <textarea
                  value={quickReportNotes}
                  onChange={(e) => setQuickReportNotes(e.target.value)}
                  placeholder="Ví dụ: Đã hỗ trợ tổ Seeding xử lý sự cố truyền thông, chuẩn bị tài liệu cho buổi họp sáng mai..."
                  className="w-full bg-white border border-[#E6E6E8] rounded px-3 py-2 text-xs text-[#2F2B3D] focus:outline-none focus:border-emerald-500 h-20"
                />
              </div>

              <div className="bg-sky-50 border border-sky-200 text-sky-800 p-3 rounded-lg text-xxs flex items-start gap-1.5 leading-relaxed">
                <p>ℹ</p>
                <p>Hệ thống sẽ tạo 1 bản ghi Báo Cáo Ngày gửi cho Manager duyệt, đồng thời gửi thông điệp dạng Markdown sang kênh Chat của Manager thông qua Webhook đã được cấu hình.</p>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[#E6E6E8]">
                <button
                  type="button"
                  onClick={() => setIsQuickReportModalOpen(false)}
                  className="px-4 py-2 bg-[#F4F5FA] hover:bg-[#E6E6E8] text-[#2F2B3D]/80 border border-[#E6E6E8] font-bold rounded-lg text-xs transition"
                  disabled={isSendingQuickReport}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-lg text-xs shadow-md transition flex items-center gap-1.5"
                  disabled={isSendingQuickReport}
                >
                  {isSendingQuickReport ? 'Đang gửi...' : 'Nộp báo cáo ngay'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}



    </div>
  );
}
