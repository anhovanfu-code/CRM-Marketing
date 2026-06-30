/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Calendar,
  Plus,
  Search,
  Trash2,
  Edit,
  Download,
  MapPin,
  List,
  FileText,
  AlertTriangle,
  Activity
} from 'lucide-react';
import { ProductionSchedule, TeamMember, UserRole, BusinessCategory, ProductionType, ProductionStatus } from '../types';

interface CalendarViewProps {
  schedules: ProductionSchedule[];
  setSchedules: React.Dispatch<React.SetStateAction<ProductionSchedule[]>>;
  members: TeamMember[];
  activeRole: UserRole;
  onExport: () => void;
}

const getDayOfWeek = (dayNum: number) => {
  const date = new Date(2026, 5, dayNum); // Month 5 is June
  const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  return days[date.getDay()];
};

const getScheduleRange = (s: ProductionSchedule) => {
  let startDay = 1;
  if (s.production_date && s.production_date.startsWith('2026-06-')) {
    const parts = s.production_date.split('-');
    startDay = parseInt(parts[2], 10) || 1;
  }

  let endDay = startDay;
  if (s.delivery_deadline && s.delivery_deadline.startsWith('2026-06-')) {
    const parts = s.delivery_deadline.split('-');
    endDay = parseInt(parts[2], 10) || startDay;
  }

  if (endDay < startDay) {
    endDay = startDay;
  }

  if (startDay > 30) startDay = 30;
  if (endDay > 30) endDay = 30;

  const span = endDay - startDay + 1;
  return { start: startDay, end: endDay, span };
};

export default function CalendarView({
  schedules,
  setSchedules,
  members,
  activeRole,
  onExport,
}: CalendarViewProps) {
  const [viewMode, setViewMode] = useState<'calendar' | 'list' | 'gantt'>('list');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAssignee, setFilterAssignee] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ProductionSchedule | null>(null);

  // Form Fields
  const [formData, setFormData] = useState<Partial<ProductionSchedule>>({
    production_date: new Date().toISOString().split('T')[0],
    business_category: 'Nội thất',
    location: '',
    content: '',
    brief_script: '',
    resources_needed: '',
    delivery_deadline: '17:00',
    assignee: '',
    production_type: 'Quay',
    status: 'Chưa bắt đầu',
    notes: ''
  });

  const isReadOnly = activeRole === 'Viewer';

  const handleDropOnDay = (e: React.DragEvent, targetSchedule: ProductionSchedule, dayNum: number) => {
    e.preventDefault();
    if (isReadOnly) return;
    
    const draggedId = e.dataTransfer.getData('text/plain');
    const scheduleToUpdate = schedules.find(s => s.production_id === draggedId);
    if (!scheduleToUpdate) return;

    const { start } = getScheduleRange(scheduleToUpdate);
    const offset = dayNum - start;
    if (offset === 0) return;

    const newStartDay = Math.min(30, Math.max(1, start + offset));
    const newStartStr = `2026-06-${String(newStartDay).padStart(2, '0')}`;

    let newEndStr = scheduleToUpdate.delivery_deadline;
    if (scheduleToUpdate.delivery_deadline && scheduleToUpdate.delivery_deadline.startsWith('2026-06-')) {
      const parts = scheduleToUpdate.delivery_deadline.split('-');
      const oldEndDay = parseInt(parts[2], 10) || start;
      const newEndDay = Math.min(30, Math.max(1, oldEndDay + offset));
      newEndStr = `2026-06-${String(newEndDay).padStart(2, '0')}`;
    }

    setSchedules(prev => prev.map(s => s.production_id === draggedId ? {
      ...s,
      production_date: newStartStr,
      delivery_deadline: newEndStr
    } : s));
  };

  const openCreateModal = () => {
    setEditingSchedule(null);
    setFormData({
      production_date: new Date().toISOString().split('T')[0],
      business_category: 'Nội thất',
      location: '',
      content: '',
      brief_script: '',
      resources_needed: 'Máy ảnh Sony A7SIII, Gimbal DJI RS3',
      delivery_deadline: '18:00',
      assignee: members[0]?.id || '',
      production_type: 'Quay',
      status: 'Chưa bắt đầu',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (schedule: ProductionSchedule) => {
    setEditingSchedule(schedule);
    setFormData({ ...schedule });
    setIsModalOpen(true);
  };

  const handleDeleteSchedule = (id: string) => {
    if (confirm(`Bạn có chắc muốn xóa lịch sản xuất ${id}?`)) {
      setSchedules(prev => prev.filter(s => s.production_id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;

    if (editingSchedule) {
      setSchedules(prev => prev.map(s => s.production_id === editingSchedule.production_id ? {
        ...s,
        ...formData
      } as ProductionSchedule : s));
    } else {
      const newSchedule: ProductionSchedule = {
        production_id: `PROD-${String(schedules.length + 1).padStart(3, '0')}`,
        production_date: formData.production_date || new Date().toISOString().split('T')[0],
        business_category: formData.business_category as BusinessCategory || 'Nội thất',
        location: formData.location || '',
        content: formData.content || '',
        brief_script: formData.brief_script || '',
        resources_needed: formData.resources_needed || '',
        delivery_deadline: formData.delivery_deadline || '18:00',
        assignee: formData.assignee || '',
        production_type: formData.production_type as ProductionType || 'Quay',
        status: formData.status as ProductionStatus || 'Chưa bắt đầu',
        notes: formData.notes || ''
      };
      setSchedules(prev => [newSchedule, ...prev]);
    }
    setIsModalOpen(false);
  };

  // Filter schedules
  const filteredSchedules = schedules.filter(s => {
    const matchesSearch = s.content.toLowerCase().includes(searchQuery.toLowerCase()) || s.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAssignee = filterAssignee === 'all' || s.assignee === filterAssignee;
    const matchesType = filterType === 'all' || s.production_type === filterType;
    const matchesStatus = filterStatus === 'all' || s.status === filterStatus;

    return matchesSearch && matchesAssignee && matchesType && matchesStatus;
  });

  const productionTypes: ProductionType[] = ['Quay', 'Chụp', 'Dựng', 'Đăng', 'Ads', 'Seeding'];
  const statuses: ProductionStatus[] = ['Chưa bắt đầu', 'Đang thực hiện', 'Đã bàn giao', 'Đã duyệt', 'Trễ hạn', 'Hủy'];
  const categories: BusinessCategory[] = ['Nội thất', 'Phong thủy', 'Hàng hiệu', 'Thương hiệu chung'];

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-transparent text-slate-100 p-6">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-amber-500 font-bold text-xs uppercase tracking-widest mb-1">
            <Calendar className="w-4 h-4" />
            <span>FUGALO PRODUCTION CENTER</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">LỊCH SẢN XUẤT MEDIA / QUAY CHỤP</h1>
          <p className="text-xs text-slate-400 mt-1">Lập kế hoạch tác nghiệp, điều phối thiết bị âm thanh, kịch bản quay thô nội thất và hàng hiệu</p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View Modes */}
          <div className="bg-slate-900 border border-slate-800 p-1 rounded-lg flex items-center">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md text-xs font-bold transition flex items-center gap-1 ${viewMode === 'list' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Danh Sách</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-1.5 rounded-md text-xs font-bold transition flex items-center gap-1 ${viewMode === 'calendar' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Lịch Tháng</span>
            </button>
            <button
              onClick={() => setViewMode('gantt')}
              className={`p-1.5 rounded-md text-xs font-bold transition flex items-center gap-1 ${viewMode === 'gantt' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Gantt Chart</span>
            </button>
          </div>

          <button
            onClick={onExport}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#F4F5FA] border border-[#E6E6E8] rounded-lg text-xs font-bold text-[#2F2B3D] transition"
          >
            <Download className="w-3.5 h-3.5 text-[#2F2B3D]" />
            <span>Xuất Excel</span>
          </button>

          {!isReadOnly && (
            <button
              onClick={openCreateModal}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-extrabold shadow-md transition"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Lịch Quay</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Tìm địa điểm, nội dung..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
          />
        </div>

        <div>
          <select
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-semibold text-slate-300 focus:outline-none"
          >
            <option value="all">Tất cả nhân sự</option>
            {members.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-semibold text-slate-300 focus:outline-none"
          >
            <option value="all">Tất cả hình thức</option>
            {productionTypes.map(t => (
              <option key={t} value={t}>{t}</option>
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

      {/* View Content Render */}
      {viewMode === 'calendar' && (
        /* Calendar Grid */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mt-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
            <h3 className="text-xs font-black uppercase text-amber-500">Tháng Sáu 2026</h3>
            <span className="text-xxs text-slate-500 italic">Lịch biểu hoạt động ghi hình hiện trường</span>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xxs font-black text-slate-400 uppercase tracking-wider mb-2">
            <div>Hai</div><div>Ba</div><div>Tư</div><div>Năm</div><div>Sáu</div><div>Bảy</div><div>CN</div>
          </div>

          <div className="grid grid-cols-7 gap-2 min-h-[350px]">
            {Array.from({ length: 30 }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `2026-06-${String(dayNum).padStart(2, '0')}`;
              const daySchedules = filteredSchedules.filter(s => s.production_date === dateStr);

              return (
                <div key={i} className="bg-slate-950 border border-slate-850 p-2 rounded-xl flex flex-col justify-between min-h-[100px] hover:border-slate-700 transition">
                  <span className="text-xxs text-slate-500 font-bold block">{dayNum}</span>
                  
                  <div className="space-y-1 mt-1 flex-1">
                    {daySchedules.map(s => {
                      const isOverdue = s.status === 'Trễ hạn';
                      return (
                        <div
                          key={s.production_id}
                          onClick={() => openEditModal(s)}
                          className={`${
                            isOverdue
                              ? 'bg-red-500/15 text-red-400 border border-red-500/35 shadow-[0_0_8px_rgba(239,68,68,0.1)]'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          } text-[9px] p-1 rounded font-bold cursor-pointer truncate flex items-center gap-1`}
                          title={`${isOverdue ? '[TRỄ HẠN] ' : ''}${s.content}`}
                        >
                          {isOverdue && <AlertTriangle className="w-2.5 h-2.5 text-red-500 animate-pulse flex-shrink-0" />}
                          <span className="truncate">{s.production_id}: {s.content}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {viewMode === 'list' && (
        /* List Rows */
        <div className="space-y-4 mt-6">
          {filteredSchedules.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 p-8 text-center text-slate-500 font-semibold rounded-xl">
              Không tìm thấy lịch trình sản xuất nào phù hợp.
            </div>
          ) : (
            filteredSchedules.map((s) => {
              const assignedUser = members.find(m => m.id === s.assignee);
              return (
                <div key={s.production_id} className={`bg-slate-900 border ${
                  s.status === 'Trễ hạn' ? 'border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'border-slate-800'
                } rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-750 transition`}>
                  <div className="flex items-start gap-3.5">
                    <div className={`w-12 h-12 rounded-xl bg-slate-950 border ${
                      s.status === 'Trễ hạn' ? 'border-red-500/30 text-red-400' : 'border-slate-850 text-amber-400'
                    } flex flex-col items-center justify-center font-bold`}>
                      <span className="text-[10px] uppercase font-bold text-slate-500">TH6</span>
                      <span className={`text-sm font-black ${s.status === 'Trễ hạn' ? 'text-red-400' : 'text-white'}`}>{s.production_date.split('-')[2] || '25'}</span>
                    </div>

                    <div className="space-y-1 text-xxs">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`font-mono font-bold uppercase tracking-wider ${s.status === 'Trễ hạn' ? 'text-red-400' : 'text-amber-500'}`}>{s.production_id}</span>
                        <span className="text-slate-500">•</span>
                        <span className="bg-slate-950 text-slate-300 border border-slate-800 px-2 py-0.5 rounded font-bold">{s.production_type}</span>
                        <span className="text-slate-500">•</span>
                        <span className="flex items-center gap-1 text-slate-400">
                          <MapPin className="w-3 h-3 text-red-500" />
                          {s.location}
                        </span>
                      </div>

                      <h3 className={`text-xs font-extrabold leading-snug ${s.status === 'Trễ hạn' ? 'text-red-400' : 'text-white'}`}>{s.content}</h3>
                      
                      <div className="text-slate-400 flex items-center gap-2 flex-wrap">
                        <span>👤 Phụ trách chính: <strong>{assignedUser?.name || s.assignee}</strong></span>
                        {s.resources_needed && (
                          <>
                            <span>•</span>
                            <span>⚙️ Thiết bị: {s.resources_needed}</span>
                          </>
                        )}
                        {s.brief_script && (
                          <>
                            <span>•</span>
                            <span>📝 Kịch bản: {s.brief_script}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions & Cost details */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-slate-850 pt-3 sm:pt-0">
                    <div className="text-left sm:text-right">
                      <p className="text-[9px] text-slate-500 font-bold uppercase">Hạn bàn giao</p>
                      <p className={`text-xs font-black ${s.status === 'Trễ hạn' ? 'text-red-400 font-black' : 'text-slate-200'}`}>{s.delivery_deadline}</p>
                    </div>

                    <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1 ${
                      s.status === 'Đã duyệt'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : s.status === 'Đang thực hiện'
                        ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                        : s.status === 'Trễ hạn'
                        ? 'bg-red-500/15 text-red-500 border border-red-500/30 animate-pulse font-black'
                        : 'bg-slate-950 text-slate-400 border border-slate-800'
                    }`}>
                      {s.status === 'Trễ hạn' && <AlertTriangle className="w-3.5 h-3.5 text-red-500 animate-pulse" />}
                      {s.status}
                    </span>

                    {!isReadOnly && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openEditModal(s)}
                          className="p-1.5 bg-white hover:bg-[#F4F5FA] border border-[#E6E6E8] text-[#2F2B3D] rounded transition"
                        >
                          <Edit className="w-3.5 h-3.5 text-[#2F2B3D]" />
                        </button>
                        <button
                          onClick={() => handleDeleteSchedule(s.production_id)}
                          className="p-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded transition"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-600" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {viewMode === 'gantt' && (
        /* Gantt Chart View */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mt-6 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 mb-5 gap-3">
            <div>
              <h3 className="text-xs font-black uppercase text-amber-500 flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-500" />
                <span>BIỂU ĐỒ GANTT TIẾN ĐỘ SẢN XUẤT</span>
              </h3>
              <p className="text-[10px] text-slate-400 mt-1">Sơ đồ trực quan hoá tiến độ thực hiện từ ngày bắt đầu sản xuất thô đến hạn bàn giao</p>
            </div>
            
            {/* Legend indicators */}
            <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-[#C5A85C]" />
                <span>Nội thất</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-[#E04B1C]" />
                <span>Phong thủy</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-[#1E1B26] border border-amber-500/30" />
                <span>Hàng hiệu</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-[#4B5563]" />
                <span>Thương hiệu chung</span>
              </div>
            </div>
          </div>

          {filteredSchedules.length === 0 ? (
            <div className="p-8 text-center text-slate-500 font-semibold">
              Không tìm thấy lịch trình sản xuất nào phù hợp để vẽ Gantt.
            </div>
          ) : (
            <div className="overflow-x-auto select-none">
              <div className="min-w-[1200px] text-xxs font-semibold">
                
                {/* 30 Days Header Row */}
                <div className="flex border-b border-slate-800 pb-2.5 text-slate-500">
                  <div className="w-[280px] flex-shrink-0 font-extrabold uppercase tracking-wider pl-2 text-slate-400">Nội dung sản xuất / Phụ trách</div>
                  <div className="flex-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(30, minmax(0, 1fr))', gap: '2px' }}>
                    {Array.from({ length: 30 }).map((_, i) => {
                      const dayNum = i + 1;
                      const isToday = dayNum === 26; // Highlight June 26
                      const dow = getDayOfWeek(dayNum);
                      const isWeekend = dow === 'T7' || dow === 'CN';
                      return (
                        <div
                          key={dayNum}
                          className={`flex flex-col items-center justify-center text-center py-1 rounded-lg transition-all ${
                            isToday 
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/35 scale-105 shadow-[0_0_8px_rgba(245,158,11,0.2)]' 
                              : isWeekend 
                              ? 'text-slate-600 bg-slate-950/20' 
                              : 'text-slate-400'
                          }`}
                        >
                          <span className="font-extrabold text-[9px]">{dayNum}</span>
                          <span className="text-[7px] opacity-75">{dow}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Rows Grid */}
                <div className="divide-y divide-slate-850 max-h-[480px] overflow-y-auto mt-2.5 pr-1">
                  {filteredSchedules.map((s) => {
                    const { start, span } = getScheduleRange(s);
                    const assignedUser = members.find(m => m.id === s.assignee);
                    
                    // Style by service segments using brand identity
                    let barBg = 'bg-slate-700 text-slate-200 border-slate-600';
                    let textCol = 'text-white';
                    if (s.business_category === 'Nội thất') {
                      barBg = 'bg-[#C5A85C] border border-[#b2944b]';
                      textCol = 'text-slate-950 font-black';
                    } else if (s.business_category === 'Phong thủy') {
                      barBg = 'bg-[#E04B1C] border border-[#c43b12]';
                      textCol = 'text-white font-black';
                    } else if (s.business_category === 'Hàng hiệu') {
                      barBg = 'bg-[#1E1B26] border border-amber-500/40';
                      textCol = 'text-amber-400 font-black';
                    } else if (s.business_category === 'Thương hiệu chung') {
                      barBg = 'bg-[#4B5563] border border-[#374151]';
                      textCol = 'text-white font-bold';
                    }

                    const isOverdue = s.status === 'Trễ hạn';

                    return (
                      <div key={s.production_id} className="flex items-center py-3.5 hover:bg-slate-950/20 transition-all rounded-xl group">
                        
                        {/* Info Column */}
                        <div className="w-[280px] flex-shrink-0 pr-4 flex flex-col justify-center min-w-0 pl-2">
                          <div className="flex items-center gap-1.5 flex-wrap mb-1">
                            <span className="font-mono text-[9px] font-black text-amber-500 uppercase tracking-wider">{s.production_id}</span>
                            <span className="text-[8px] text-slate-400 font-extrabold bg-slate-950 border border-slate-800 px-1.5 py-0.5 rounded uppercase tracking-wide">{s.production_type}</span>
                            <span className="text-slate-500">•</span>
                            <span className="text-[9px] font-extrabold text-slate-300 truncate max-w-[120px]">{assignedUser?.name || s.assignee}</span>
                          </div>
                          <h4 className="text-[11px] font-black text-white truncate leading-tight group-hover:text-amber-400 transition" title={s.content}>{s.content}</h4>
                          <p className="text-[8px] text-slate-500 mt-1 truncate flex items-center gap-1">
                            <MapPin className="w-2.5 h-2.5 text-red-500" />
                            {s.location}
                          </p>
                        </div>

                        {/* Timeline Track Grid */}
                        <div className="flex-1 relative h-9">
                          
                          {/* Background Guides Grid */}
                          <div className="absolute inset-0" style={{ display: 'grid', gridTemplateColumns: 'repeat(30, minmax(0, 1fr))', gap: '2px' }}>
                            {Array.from({ length: 30 }).map((_, i) => {
                              const dayNum = i + 1;
                              const isToday = dayNum === 26;
                              return (
                                <div
                                  key={dayNum}
                                  onDragOver={(e) => {
                                    e.preventDefault();
                                    e.dataTransfer.dropEffect = 'move';
                                  }}
                                  onDrop={(e) => handleDropOnDay(e, s, dayNum)}
                                  className={`h-full border-r border-slate-800/30 last:border-0 ${
                                    isToday ? 'bg-amber-500/5' : ''
                                  } hover:bg-amber-500/10 cursor-pointer transition-all duration-150`}
                                  title={`Thả thanh tiến độ vào đây để dời ngày sản xuất`}
                                />
                              );
                            })}
                          </div>

                          {/* Interactive Bar Overlay */}
                          <div className="absolute inset-0 flex items-center pointer-events-none" style={{ display: 'grid', gridTemplateColumns: 'repeat(30, minmax(0, 1fr))', gap: '2px' }}>
                            <div
                              style={{
                                gridColumnStart: start,
                                gridColumnEnd: `span ${span}`,
                              }}
                              draggable={!isReadOnly}
                              onDragStart={(e) => {
                                e.dataTransfer.setData('text/plain', s.production_id);
                                e.dataTransfer.effectAllowed = 'move';
                              }}
                              onClick={() => openEditModal(s)}
                              className={`h-7 rounded-lg ${barBg} flex items-center justify-between px-3 shadow-[0_3px_10px_rgba(0,0,0,0.25)] hover:scale-[1.015] hover:brightness-110 active:scale-95 transition-all text-[9px] truncate pointer-events-auto ${
                                isReadOnly ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing'
                              }`}
                              title={`${s.production_id} - Mảng: ${s.business_category}\nChi tiết: ${s.content}\nNgày: ${s.production_date} -> ${s.delivery_deadline}\nTrạng thái: ${s.status}\n\n💡 Nhấp chuột để sửa kịch bản/thông tin hoặc kéo thả thanh này sang ô ngày khác.`}
                            >
                              <span className={`truncate ${textCol} tracking-tight font-black uppercase text-[8px]`}>
                                {s.content}
                              </span>
                              <span className={`text-[8px] font-black uppercase tracking-wider ml-1.5 flex-shrink-0 px-1.5 py-0.5 rounded bg-black/15 flex items-center gap-1 ${textCol}`}>
                                {isOverdue && <AlertTriangle className="w-2.5 h-2.5 text-red-400 animate-pulse" />}
                                {s.status}
                              </span>
                            </div>
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

      {/* CRUD MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white border border-[#E6E6E8] rounded-2xl max-w-3xl w-full p-6 text-[#2F2B3D] shadow-[0_10px_30px_rgba(47,43,61,0.2)]">
            <h3 className="text-base font-black text-[#2F2B3D] uppercase tracking-wide border-b border-[#E6E6E8] pb-3 mb-4">
              {editingSchedule ? 'Cập Nhật Lịch Quay Chụp Media' : 'Lên Lịch Sản Xuất Mới'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xxs text-[#5D596C] font-extrabold uppercase block mb-1">Ngày quay chụp</label>
                  <input
                    type="date"
                    value={formData.production_date}
                    onChange={(e) => setFormData({ ...formData, production_date: e.target.value })}
                    className="w-full bg-[#F8F9FA] border border-[#E6E6E8] rounded px-2.5 py-1.5 text-xs text-[#2F2B3D] focus:outline-none focus:border-[#E04B1C] transition"
                    required
                  />
                </div>

                <div>
                  <label className="text-xxs text-[#5D596C] font-extrabold uppercase block mb-1">Mảng kinh doanh</label>
                  <select
                    value={formData.business_category}
                    onChange={(e) => setFormData({ ...formData, business_category: e.target.value as BusinessCategory })}
                    className="w-full bg-[#F8F9FA] border border-[#E6E6E8] rounded px-2.5 py-1.5 text-xs text-[#2F2B3D] focus:outline-none focus:border-[#E04B1C] transition"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xxs text-[#5D596C] font-extrabold uppercase block mb-1">Địa điểm tác nghiệp</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full bg-[#F8F9FA] border border-[#E6E6E8] rounded px-2.5 py-1.5 text-xs text-[#2F2B3D] focus:outline-none focus:border-[#E04B1C] transition"
                  placeholder="e.g. Shophouse Phúc Đạt, Studio Q1..."
                  required
                />
              </div>

              <div>
                <label className="text-xxs text-[#5D596C] font-extrabold uppercase block mb-1">Nội dung tóm tắt</label>
                <input
                  type="text"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full bg-[#F8F9FA] border border-[#E6E6E8] rounded px-2.5 py-1.5 text-xs text-[#2F2B3D] focus:outline-none focus:border-[#E04B1C] transition"
                  placeholder="e.g. Quay video review nội thất Indochine..."
                  required
                />
              </div>

              <div>
                <label className="text-xxs text-[#5D596C] font-extrabold uppercase block mb-1">Chi tiết kịch bản / Script ngắn</label>
                <textarea
                  value={formData.brief_script}
                  onChange={(e) => setFormData({ ...formData, brief_script: e.target.value })}
                  className="w-full bg-[#F8F9FA] border border-[#E6E6E8] rounded p-2.5 text-xs text-[#2F2B3D] focus:outline-none focus:border-[#E04B1C] transition"
                  rows={2}
                  placeholder="e.g. Cảnh 1: Quay từ phòng khách. Cảnh 2: Quay chi tiết tủ thờ gỗ gõ..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xxs text-[#5D596C] font-extrabold uppercase block mb-1">Hình thức sản xuất</label>
                  <select
                    value={formData.production_type}
                    onChange={(e) => setFormData({ ...formData, production_type: e.target.value as ProductionType })}
                    className="w-full bg-[#F8F9FA] border border-[#E6E6E8] rounded px-2 py-1.5 text-xs text-[#2F2B3D] focus:outline-none focus:border-[#E04B1C] transition"
                  >
                    {productionTypes.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xxs text-[#5D596C] font-extrabold uppercase block mb-1">Đạo diễn/Phụ trách chính</label>
                  <select
                    value={formData.assignee}
                    onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
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
                  <label className="text-xxs text-[#5D596C] font-extrabold uppercase block mb-1">Thiết bị & Công cụ yêu cầu</label>
                  <input
                    type="text"
                    value={formData.resources_needed}
                    onChange={(e) => setFormData({ ...formData, resources_needed: e.target.value })}
                    className="w-full bg-[#F8F9FA] border border-[#E6E6E8] rounded px-2.5 py-1.5 text-xs text-[#2F2B3D] focus:outline-none focus:border-[#E04B1C] transition"
                    placeholder="Máy ảnh Sony A7S3, gimbal..."
                  />
                </div>

                <div>
                  <label className="text-xxs text-[#5D596C] font-extrabold uppercase block mb-1">Hạn chót bàn giao file thô</label>
                  <input
                    type="text"
                    value={formData.delivery_deadline}
                    onChange={(e) => setFormData({ ...formData, delivery_deadline: e.target.value })}
                    className="w-full bg-[#F8F9FA] border border-[#E6E6E8] rounded px-2.5 py-1.5 text-xs text-[#2F2B3D] focus:outline-none focus:border-[#E04B1C] transition"
                    placeholder="18:00 hoặc YYYY-MM-DD"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xxs text-[#5D596C] font-extrabold uppercase block mb-1">Trạng thái phê duyệt</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as ProductionStatus })}
                    className="w-full bg-[#F8F9FA] border border-[#E6E6E8] rounded px-2.5 py-1.5 text-xs text-[#2F2B3D] focus:outline-none focus:border-[#E04B1C] transition"
                  >
                    {statuses.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

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
                  Xác nhận lịch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
