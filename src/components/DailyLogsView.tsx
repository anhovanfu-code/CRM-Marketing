import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Plus, 
  Trash2, 
  CheckSquare, 
  Square, 
  Link2, 
  User, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Filter,
  Check
} from 'lucide-react';
import { DailyLog, Task, TeamMember } from '../types';

interface DailyLogsViewProps {
  dailyLogs: DailyLog[];
  setDailyLogs: React.Dispatch<React.SetStateAction<DailyLog[]>>;
  tasks: Task[];
  members: TeamMember[];
  activeRole: 'Admin' | 'Manager' | 'Staff' | 'Viewer';
  currentUserEmail?: string;
}

export default function DailyLogsView({
  dailyLogs,
  setDailyLogs,
  tasks,
  members,
  activeRole,
  currentUserEmail,
}: DailyLogsViewProps) {
  const todayStr = '2026-06-30'; // Align with system timeline

  // Find currently logged-in member
  const currentMember = useMemo(() => {
    return members.find(m => {
      const email = m.email.toLowerCase();
      const userEmail = currentUserEmail?.toLowerCase() || '';
      return email === userEmail || (userEmail === 'anhovan.fu@gmail.com' && m.id === 'an_hv');
    }) || members.find(m => m.id === 'phuong_mkt') || members[0];
  }, [members, currentUserEmail]);

  const currentMemberId = currentMember?.id || 'phuong_mkt';
  const isManager = activeRole === 'Manager' || activeRole === 'Admin' || currentMemberId === 'an_hv';

  // Sub-tabs in Daily Logs view: 
  // For Manager: "Tất cả nhật ký", "Tạo nhật ký cá nhân"
  // For Staff: "Nhật ký của tôi", "Nhật ký đồng đội"
  const [activeSubTab, setActiveSubTab] = useState<'all' | 'mine'>(isManager ? 'all' : 'mine');

  // Form States for creating/updating a log
  const [logDate, setLogDate] = useState(todayStr);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [checklistItems, setChecklistItems] = useState<{ id: string; text: string; completed: boolean }[]>([]);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [achievements, setAchievements] = useState('');
  const [challenges, setChallenges] = useState('');

  // Filtering logs
  const [filterDate, setFilterDate] = useState('all');
  const [filterStaff, setFilterStaff] = useState('all');

  // Check if a log already exists for current user + chosen date
  const existingLogForSelectedDate = useMemo(() => {
    return dailyLogs.find(l => l.creator_id === currentMemberId && l.log_date === logDate);
  }, [dailyLogs, currentMemberId, logDate]);

  // Load existing log into edit state when date or tab changes
  const handleLoadExistingLog = () => {
    if (existingLogForSelectedDate) {
      setChecklistItems(existingLogForSelectedDate.checklist_items || []);
      setSelectedTaskIds(existingLogForSelectedDate.linked_task_ids || []);
      setAchievements(existingLogForSelectedDate.achievements || '');
      setChallenges(existingLogForSelectedDate.challenges || '');
    } else {
      // Pre-populate with tasks assigned to this member that are in progress or due today
      const autoTasks = tasks
        .filter(t => t.assignee === currentMemberId && (t.status === 'Đang làm' || t.status === 'Cần sửa' || t.deadline === todayStr))
        .map(t => t.task_id);
      
      setChecklistItems([]);
      setSelectedTaskIds(autoTasks);
      setAchievements('');
      setChallenges('');
    }
  };

  React.useEffect(() => {
    handleLoadExistingLog();
  }, [logDate, existingLogForSelectedDate, activeSubTab]);

  // Checklist Actions
  const handleAddChecklistItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistItem.trim()) return;
    setChecklistItems(prev => [
      ...prev,
      { id: `item-${Date.now()}`, text: newChecklistItem.trim(), completed: false }
    ]);
    setNewChecklistItem('');
  };

  const handleToggleChecklistItem = (itemId: string) => {
    setChecklistItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, completed: !item.completed } : item
    ));
  };

  const handleRemoveChecklistItem = (itemId: string) => {
    setChecklistItems(prev => prev.filter(item => item.id !== itemId));
  };

  // Task selection toggle
  const handleToggleTaskSelection = (taskId: string) => {
    setSelectedTaskIds(prev => 
      prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
    );
  };

  // Submit/Save log
  const handleSaveLog = () => {
    if (checklistItems.length === 0) {
      alert('Vui lòng tạo ít nhất một đầu việc trong checklist ngày hôm nay.');
      return;
    }

    if (existingLogForSelectedDate) {
      // Update
      setDailyLogs(prev => prev.map(l => l.log_id === existingLogForSelectedDate.log_id ? {
        ...l,
        checklist_items: checklistItems,
        linked_task_ids: selectedTaskIds,
        achievements,
        challenges,
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
      } : l));
      alert(`Cập nhật nhật ký ngày ${logDate} thành công!`);
    } else {
      // Create new
      const newLog: DailyLog = {
        log_id: `LOG-${Date.now()}`,
        creator_id: currentMemberId,
        log_date: logDate,
        checklist_items: checklistItems,
        linked_task_ids: selectedTaskIds,
        achievements,
        challenges,
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
      };
      setDailyLogs(prev => [newLog, ...prev]);
      alert(`Đăng nhật ký công việc ngày ${logDate} thành công!`);
    }
  };

  // Filtered lists for manager/viewers
  const filteredLogs = useMemo(() => {
    return dailyLogs.filter(log => {
      const matchesDate = filterDate === 'all' || log.log_date === filterDate;
      const matchesStaff = filterStaff === 'all' || log.creator_id === filterStaff;
      return matchesDate && matchesStaff;
    });
  }, [dailyLogs, filterDate, filterStaff]);

  // Find tasks assigned to current member to display in the link checklist
  const myTasks = useMemo(() => {
    return tasks.filter(t => t.assignee === currentMemberId);
  }, [tasks, currentMemberId]);

  // Dates represented in logs for filter dropdown
  const uniqueDates = useMemo(() => {
    const dates = new Set<string>();
    dailyLogs.forEach(l => dates.add(l.log_date));
    return Array.from(dates).sort((a, b) => b.localeCompare(a));
  }, [dailyLogs]);

  return (
    <div className="space-y-6 mt-6 animate-fade-in text-xs text-[#2F2B3D]">
      
      {/* Tab bar header for Daily Logs module */}
      <div className="bg-white border border-[#E6E6E8] rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-black text-[#2F2B3D] uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-5 h-5 text-[#8C57FF]" />
            <span>NHẬT KÝ CÔNG VIỆC HÀNG NGÀY (DAILY LOGS)</span>
          </h3>
          <p className="text-slate-400 mt-1">Ghi nhận nhanh checklist công việc thực tế trong ngày, liên kết các task hệ thống và báo cáo tiến độ tức thời lên Manager</p>
        </div>

        {/* Sub tabs selector */}
        <div className="bg-slate-100 p-1 rounded-xl flex items-center self-start sm:self-center border border-slate-200">
          {isManager && (
            <button
              onClick={() => setActiveSubTab('all')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${activeSubTab === 'all' ? 'bg-[#8C57FF] text-white shadow-sm' : 'text-[#2F2B3D]/70 hover:text-[#8C57FF]'}`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Tất cả Nhật ký ({filteredLogs.length})</span>
            </button>
          )}
          <button
            onClick={() => setActiveSubTab('mine')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${activeSubTab === 'mine' ? 'bg-[#8C57FF] text-white shadow-sm' : 'text-[#2F2B3D]/70 hover:text-[#8C57FF]'}`}
          >
            <User className="w-3.5 h-3.5" />
            <span>{isManager ? 'Viết Nhật ký của An_HV' : 'Nhật ký của tôi'}</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'mine' ? (
        /* --- VIEW/WRITE MY LOGS TAB --- */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Columns - Form builder */}
          <div className="lg:col-span-2 bg-white border border-[#E6E6E8] rounded-2xl p-5 space-y-5 shadow-sm">
            <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-black uppercase tracking-wide text-[#2F2B3D]">
                  {existingLogForSelectedDate ? '📝 CẬP NHẬT NHẬT KÝ HÔM NAY' : '🚀 KHỞI TẠO NHẬT KÝ MỚI'}
                </h4>
                <p className="text-[11px] text-slate-400 font-medium">Nhập chi tiết các đầu việc bạn làm thực tế ngày hôm nay</p>
              </div>

              {/* Date selection field */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500 font-bold whitespace-nowrap">Chọn ngày nhật ký:</span>
                <input
                  type="date"
                  value={logDate}
                  onChange={(e) => setLogDate(e.target.value)}
                  className="bg-white border border-[#E6E6E8] rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#2F2B3D] focus:outline-none focus:border-[#8C57FF] font-mono"
                />
              </div>
            </div>

            {/* Checklist creator */}
            <div className="space-y-3">
              <label className="text-[11px] text-[#2F2B3D] font-extrabold uppercase block tracking-wider">
                📋 Checklist công việc thực hiện ({checklistItems.filter(i => i.completed).length}/{checklistItems.length})
              </label>

              {/* Input builder form */}
              <form onSubmit={handleAddChecklistItem} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nhập đầu việc làm hôm nay... (e.g. Sửa xong âm thanh video intro)"
                  value={newChecklistItem}
                  onChange={(e) => setNewChecklistItem(e.target.value)}
                  className="flex-1 bg-white border border-[#E6E6E8] rounded-lg px-3 py-2 text-xs text-[#2F2B3D] focus:outline-none focus:border-[#8C57FF]"
                />
                <button
                  type="submit"
                  className="bg-[#8C57FF] hover:bg-[#7A40F2] text-white px-4 rounded-lg font-bold flex items-center gap-1 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm</span>
                </button>
              </form>

              {/* Items listing */}
              <div className="space-y-2 border border-slate-100 rounded-xl p-3 bg-slate-50/50 max-h-60 overflow-y-auto">
                {checklistItems.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 font-bold">
                    Chưa có đầu việc nào được thêm. Hãy nhập ở trên!
                  </div>
                ) : (
                  checklistItems.map((item, index) => (
                    <div 
                      key={item.id}
                      className="flex items-center justify-between gap-3 p-2 bg-white border border-[#E6E6E8] rounded-lg shadow-xs hover:border-[#8C57FF]/30 transition"
                    >
                      <button
                        type="button"
                        onClick={() => handleToggleChecklistItem(item.id)}
                        className="flex items-center gap-2.5 text-left flex-1"
                      >
                        {item.completed ? (
                          <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-slate-300 hover:border-[#8C57FF] flex-shrink-0" />
                        )}
                        <span className={`text-xs font-semibold leading-relaxed ${item.completed ? 'line-through text-slate-400' : 'text-[#2F2B3D]'}`}>
                          {index + 1}. {item.text}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemoveChecklistItem(item.id)}
                        className="text-slate-400 hover:text-[#FF4C51] p-1 rounded hover:bg-red-50 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Achievements & Challenges Textareas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] text-[#2F2B3D] font-extrabold uppercase block tracking-wider flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Kết quả nổi bật / Ghi chú</span>
                </label>
                <textarea
                  value={achievements}
                  onChange={(e) => setAchievements(e.target.value)}
                  placeholder="Ghi nhận các kết quả nổi bật, con số thực tế đạt được..."
                  rows={4}
                  className="w-full bg-white border border-[#E6E6E8] rounded-lg p-2.5 text-xs text-[#2F2B3D] focus:outline-none focus:border-[#8C57FF] resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] text-[#2F2B3D] font-extrabold uppercase block tracking-wider flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  <span>Khó khăn / Vướng mắc (nếu có)</span>
                </label>
                <textarea
                  value={challenges}
                  onChange={(e) => setChallenges(e.target.value)}
                  placeholder="Có rào cản hay vấn đề gì cần được Manager hỗ trợ không?"
                  rows={4}
                  className="w-full bg-white border border-[#E6E6E8] rounded-lg p-2.5 text-xs text-[#2F2B3D] focus:outline-none focus:border-[#8C57FF] resize-none"
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="border-t border-slate-100 pt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleSaveLog}
                className="bg-[#8C57FF] hover:bg-[#7A40F2] text-white px-5 py-2.5 rounded-lg text-xs font-black shadow-md shadow-[#8C57FF]/25 transition active:scale-[0.98]"
              >
                {existingLogForSelectedDate ? 'Cập Nhật Nhật Ký' : 'Đăng Nhật Ký Trong Ngày'}
              </button>
            </div>
          </div>

          {/* Right Column - Link System Tasks */}
          <div className="bg-white border border-[#E6E6E8] rounded-2xl p-5 space-y-4 shadow-sm flex flex-col justify-between">
            <div className="space-y-1">
              <h4 className="text-xs font-black uppercase tracking-wide text-[#2F2B3D] flex items-center gap-1.5">
                <Link2 className="w-4 h-4 text-[#8C57FF]" />
                <span>🔗 GẮN KÈM TASK HỆ THỐNG</span>
              </h4>
              <p className="text-[10px] text-slate-400 font-medium">Chọn các task từ hệ thống mà bạn đang triển khai hôm nay để liên kết nhật ký trực tiếp</p>
            </div>

            {/* System tasks checkboxes */}
            <div className="flex-1 space-y-2 overflow-y-auto max-h-[300px] pr-1 border border-slate-100 rounded-xl p-3 bg-slate-50/50 mt-2">
              {myTasks.length === 0 ? (
                <div className="text-center py-10 text-slate-400 font-bold">
                  Không tìm thấy task nào được giao cho bạn trên hệ thống.
                </div>
              ) : (
                myTasks.map(t => {
                  const isSelected = selectedTaskIds.includes(t.task_id);
                  return (
                    <div 
                      key={t.task_id}
                      onClick={() => handleToggleTaskSelection(t.task_id)}
                      className={`p-2.5 rounded-lg border text-xxs transition cursor-pointer flex items-start gap-2 ${
                        isSelected 
                          ? 'border-[#8C57FF] bg-[#8C57FF]/5 shadow-xs' 
                          : 'border-[#E6E6E8] bg-white hover:border-[#8C57FF]/30'
                      }`}
                    >
                      <div className="mt-0.5">
                        {isSelected ? (
                          <div className="w-3.5 h-3.5 bg-[#8C57FF] rounded flex items-center justify-center text-white">
                            <Check className="w-2.5 h-2.5 font-bold" />
                          </div>
                        ) : (
                          <div className="w-3.5 h-3.5 border border-slate-300 rounded" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[9px] font-bold text-[#8C57FF]">{t.task_id}</span>
                          <span className={`px-1.5 py-0.2 rounded text-[8px] font-black uppercase ${
                            t.status === 'Đang làm' ? 'bg-blue-50 text-blue-600' :
                            t.status === 'Hoàn thành' ? 'bg-green-50 text-green-600' :
                            t.status === 'Cần sửa' ? 'bg-amber-50 text-amber-600' :
                            'bg-slate-50 text-slate-600'
                          }`}>
                            {t.status}
                          </span>
                        </div>
                        <h5 className="font-extrabold text-[#2F2B3D] line-clamp-1">{t.task_name}</h5>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="bg-[#8C57FF]/5 border border-[#8C57FF]/15 p-3 rounded-xl text-[10px] leading-relaxed text-[#2F2B3D]/80">
              💡 <strong>Gợi ý:</strong> Việc liên kết các task hệ thống giúp Trưởng phòng dễ dàng đánh giá khối lượng công việc, tỷ lệ hoàn thành checklist thực tế và phê duyệt nhanh kết quả cuối tháng.
            </div>
          </div>

        </div>
      ) : (
        /* --- VIEW ALL STAFF LOGS (MANAGER VIEW) --- */
        <div className="space-y-5 bg-white border border-[#E6E6E8] rounded-2xl p-5 shadow-sm">
          
          {/* Header of Manager Logs Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h4 className="text-xs font-black uppercase tracking-wide text-[#2F2B3D] flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4 text-[#8C57FF]" />
                <span>BẢNG TỔNG HỢP NHẬT KÝ LÀM VIỆC CHI TIẾT</span>
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Giám sát các checklist công việc và kết quả thực tế hàng ngày của từng nhân viên</p>
            </div>

            {/* Quick Filter controls */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400 font-bold">Lọc theo ngày:</span>
                <select
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="bg-white border border-[#E6E6E8] rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#2F2B3D] focus:outline-none focus:border-[#8C57FF]"
                >
                  <option value="all">Tất cả các ngày</option>
                  {uniqueDates.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400 font-bold">Lọc theo nhân sự:</span>
                <select
                  value={filterStaff}
                  onChange={(e) => setFilterStaff(e.target.value)}
                  className="bg-white border border-[#E6E6E8] rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#2F2B3D] focus:outline-none focus:border-[#8C57FF]"
                >
                  <option value="all">Tất cả nhân viên</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Logs render */}
          {filteredLogs.length === 0 ? (
            <div className="py-12 text-center text-slate-400 border border-dashed border-[#E6E6E8] rounded-xl bg-slate-50">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2 animate-pulse" />
              <p className="font-extrabold text-xs uppercase text-[#2F2B3D]">Không có nhật ký công việc nào</p>
              <p className="text-slate-400 mt-1 text-[11px]">Không tìm thấy dữ liệu nhật ký phù hợp với bộ lọc hiện tại.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredLogs.map(log => {
                const creatorObj = members.find(m => m.id === log.creator_id);
                const completedCount = log.checklist_items.filter(i => i.completed).length;
                const totalCount = log.checklist_items.length;
                const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

                return (
                  <div 
                    key={log.log_id} 
                    className="border border-[#E6E6E8] rounded-2xl p-5 bg-[#F8F7FA] hover:border-[#8C57FF]/30 hover:shadow-md transition duration-200 relative overflow-hidden flex flex-col justify-between"
                  >
                    {/* Top Creator Info */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-3 border-b border-[#E6E6E8]/70 pb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#8C57FF]/10 text-[#8C57FF] border border-[#8C57FF]/15 flex items-center justify-center font-black text-xs">
                            {creatorObj?.name ? creatorObj.name.substring(0, 2).toUpperCase() : 'NV'}
                          </div>
                          <div>
                            <h5 className="font-black text-[#2F2B3D] uppercase leading-tight">{creatorObj?.name || log.creator_id}</h5>
                            <p className="text-[9px] text-slate-400 mt-0.5 font-bold">{creatorObj?.role || 'Nhân viên Marketing'}</p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-mono text-xs font-black text-[#8C57FF] bg-white px-2 py-0.5 rounded border border-[#E6E6E8]">
                            📅 {log.log_date}
                          </span>
                          <span className="text-[9px] text-slate-400 font-bold block mt-1">Đăng: {log.created_at.split(' ').pop()}</span>
                        </div>
                      </div>

                      {/* Checklist detailed */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                          <span>📋 CHECKLIST CÔNG VIỆC TRONG NGÀY:</span>
                          <span className="text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.2 rounded">
                            {completedCount}/{totalCount} ({percentage}%)
                          </span>
                        </div>

                        {/* Progress line */}
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full transition-all duration-300" style={{ width: `${percentage}%` }} />
                        </div>

                        <div className="space-y-1 bg-white border border-[#E6E6E8] rounded-xl p-3 max-h-40 overflow-y-auto">
                          {log.checklist_items.map((item, index) => (
                            <div key={item.id} className="flex items-start gap-2 text-[11px] leading-relaxed">
                              {item.completed ? (
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                              ) : (
                                <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                              )}
                              <span className={item.completed ? 'line-through text-slate-400 font-semibold' : 'text-[#2F2B3D] font-bold'}>
                                {index + 1}. {item.text}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Achievements and challenges */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        {log.achievements && (
                          <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3 text-[10px]">
                            <strong className="text-emerald-800 uppercase block font-black tracking-wider mb-1">🎯 Kết quả đạt được:</strong>
                            <p className="text-slate-700 font-semibold leading-relaxed whitespace-pre-wrap">{log.achievements}</p>
                          </div>
                        )}

                        {log.challenges && (
                          <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-3 text-[10px]">
                            <strong className="text-amber-800 uppercase block font-black tracking-wider mb-1">⚠️ Khó khăn trở ngại:</strong>
                            <p className="text-slate-700 font-semibold leading-relaxed whitespace-pre-wrap">{log.challenges}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Linked tasks status */}
                    {log.linked_task_ids && log.linked_task_ids.length > 0 && (
                      <div className="border-t border-[#E6E6E8]/70 pt-3 mt-3">
                        <span className="text-[9px] font-black uppercase text-slate-400 block mb-1.5 flex items-center gap-1">
                          <Link2 className="w-3 h-3 text-[#8C57FF]" />
                          GẮN KÈM TASK HỆ THỐNG ({log.linked_task_ids.length}):
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {log.linked_task_ids.map(tid => {
                            const relatedTask = tasks.find(t => t.task_id === tid);
                            if (!relatedTask) return null;
                            return (
                              <span 
                                key={tid}
                                title={relatedTask.task_name}
                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-[#E6E6E8] rounded-md font-bold text-[9px] text-[#2F2B3D]"
                              >
                                <span className="font-mono text-[#8C57FF]">{tid}</span>
                                <span>-</span>
                                <span className="truncate max-w-[80px]">{relatedTask.task_name}</span>
                                <span className={`w-1 h-1 rounded-full ${
                                  relatedTask.status === 'Hoàn thành' ? 'bg-emerald-500' :
                                  relatedTask.status === 'Đang làm' ? 'bg-blue-500' : 'bg-slate-400'
                                }`} />
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
