/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  UsersRound,
  Plus,
  Search,
  Mail,
  Phone,
  Trash2,
  Edit,
  Download,
  Award,
  BookOpen,
  Briefcase,
  ShieldAlert,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { TeamMember, SpecialistGroup, UserRole } from '../types';

interface TeamViewProps {
  members: TeamMember[];
  setMembers: React.Dispatch<React.SetStateAction<TeamMember[]>>;
  tasks: any[];
  evaluations: any[];
  activeRole: UserRole;
  onExport: () => void;
}

export default function TeamView({
  members,
  setMembers,
  tasks,
  evaluations,
  activeRole,
  onExport,
}: TeamViewProps) {
  // Search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');

  // Detail Modal State
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  // CRUD Modal State
  const [isCrudModalOpen, setIsCrudModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  // Form Fields
  const [formData, setFormData] = useState<Partial<TeamMember>>({
    id: '',
    name: '',
    role: '',
    email: '',
    phone: '',
    specialist_group: 'Media',
    manager_id: 'an_hv',
    main_task: '',
    permissions: [],
    responsibilities: [],
    personal_kpis: [],
    notes: '',
  });

  const isReadOnly = activeRole === 'Viewer';

  const handleOpenCreate = () => {
    setEditingMember(null);
    setFormData({
      id: `mkt_${Date.now().toString().slice(-4)}`,
      name: '',
      role: '',
      email: '',
      phone: '',
      specialist_group: 'Media',
      manager_id: 'an_hv',
      main_task: '',
      permissions: ['Xem task cá nhân', 'Cập nhật tiến độ'],
      responsibilities: ['Hoàn thành task đúng deadline'],
      personal_kpis: ['Đảm bảo KPI tiến độ cá nhân'],
      notes: '',
    });
    setIsCrudModalOpen(true);
  };

  const handleOpenEdit = (member: TeamMember, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingMember(member);
    setFormData({ ...member });
    setIsCrudModalOpen(true);
  };

  const handleDeleteMember = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Bạn có chắc chắn muốn xóa nhân sự ${id} khỏi hệ thống phòng Marketing?`)) {
      setMembers(prev => prev.filter(m => m.id !== id));
      if (selectedMember?.id === id) {
        setSelectedMember(null);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;

    if (editingMember) {
      setMembers(prev => prev.map(m => m.id === editingMember.id ? { ...m, ...formData } as TeamMember : m));
      // Update selected member detail if open
      if (selectedMember?.id === editingMember.id) {
        setSelectedMember({ ...selectedMember, ...formData } as TeamMember);
      }
    } else {
      const newMember: TeamMember = {
        id: formData.id || `mkt_${Date.now().toString().slice(-4)}`,
        name: formData.name || '',
        role: formData.role || '',
        email: formData.email || '',
        phone: formData.phone || '',
        specialist_group: formData.specialist_group as SpecialistGroup || 'Media',
        manager_id: formData.manager_id || 'an_hv',
        main_task: formData.main_task || '',
        permissions: formData.permissions || [],
        responsibilities: formData.responsibilities || [],
        personal_kpis: formData.personal_kpis || [],
        tasks_in_progress: 0,
        tasks_completed: 0,
        tasks_overdue: 0,
        completion_rate: 0,
        performance_score: 80,
        notes: formData.notes || '',
      };
      setMembers(prev => [...prev, newMember]);
    }
    setIsCrudModalOpen(false);
  };

  // Filter Members list
  const filteredMembers = members.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.role.toLowerCase().includes(searchQuery.toLowerCase()) || m.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGroup = selectedGroup === 'all' || m.specialist_group === selectedGroup;
    return matchesSearch && matchesGroup;
  });

  const specialistGroups: SpecialistGroup[] = ['Quản lý', 'DOP', 'Media', 'Edit Video', 'Photo', 'Seeding', 'Ads Social'];

  return (
    <div className="flex-1 flex flex-col md:flex-row min-w-0 overflow-hidden bg-transparent text-slate-100">
      
      {/* Left Column: Team List & Filters */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto p-6 border-r border-slate-900">
        
        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-900">
          <div>
            <div className="flex items-center gap-2 text-amber-500 font-bold text-xs uppercase tracking-widest mb-1">
              <UsersRound className="w-4 h-4" />
              <span>FUGALO MARKETING TEAM</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">NHÂN SỰ PHÒNG MARKETING</h1>
            <p className="text-xs text-slate-400 mt-1">Danh sách nhân sự chuyên trách, hồ sơ năng lực, kịch bản bàn giao và đánh giá của Trưởng phòng</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onExport}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#F4F5FA] border border-[#E6E6E8] rounded-lg text-xs font-bold text-[#2F2B3D] transition"
            >
              <Download className="w-3.5 h-3.5 text-[#2F2B3D]" />
              <span>Xuất Danh Sách</span>
            </button>

            {!isReadOnly && (
              <button
                onClick={handleOpenCreate}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-extrabold shadow-md transition"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Nhân Sự</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter controls */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Tìm theo họ tên, chức danh, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          <div>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-semibold text-slate-300 focus:outline-none focus:border-amber-500"
            >
              <option value="all">Tất cả nhóm chuyên môn</option>
              {specialistGroups.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Grid of Team Members */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-6">
          {filteredMembers.map((m) => {
            const isSelected = selectedMember?.id === m.id;
            return (
              <div
                key={m.id}
                onClick={() => setSelectedMember(m)}
                className={`cursor-pointer bg-slate-900 border rounded-2xl p-4 transition-all duration-250 relative flex flex-col justify-between ${
                  isSelected ? 'border-amber-500 shadow-lg shadow-amber-500/5 bg-slate-850' : 'border-slate-800 hover:border-slate-750'
                }`}
              >
                <div>
                  {/* Member Badge & Role */}
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[9px] bg-slate-950 text-amber-500 border border-amber-500/25 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      {m.specialist_group}
                    </span>
                    
                    <span className="text-[10px] text-slate-500 font-mono font-bold">
                      ID: {m.id}
                    </span>
                  </div>

                  {/* Contact Info card */}
                  <div className="flex items-center gap-3 mt-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-950 text-amber-400 border border-slate-800 flex items-center justify-center font-black text-sm">
                      {m.name.split(' ').pop()?.slice(0, 2)}
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-white">{m.name}</h3>
                      <p className="text-[10px] text-slate-400 font-bold mt-0.5">{m.role}</p>
                    </div>
                  </div>

                  {/* Task Mini-stats info */}
                  <div className="grid grid-cols-3 gap-2 mt-4 text-center text-xxs bg-slate-950/40 p-2 rounded-xl border border-slate-850">
                    <div>
                      <span className="text-slate-500 block">Đang làm</span>
                      <strong className="text-sky-400 font-bold text-xs">{m.tasks_in_progress}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Hoàn thành</span>
                      <strong className="text-emerald-400 font-bold text-xs">{m.tasks_completed}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Tỷ lệ đạt</span>
                      <strong className="text-amber-500 font-extrabold text-xs">{m.completion_rate}%</strong>
                    </div>
                  </div>
                </div>

                {/* Card controls */}
                <div className="flex items-center justify-between border-t border-slate-850 mt-4 pt-3 text-[10px] text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    <span>Điểm: <strong className="text-white font-bold">{m.performance_score}đ</strong></span>
                  </div>

                  <div className="flex items-center gap-1">
                    {!isReadOnly && (
                      <>
                        <button
                          onClick={(e) => handleOpenEdit(m, e)}
                          className="p-1 bg-white hover:bg-[#F4F5FA] border border-[#E6E6E8] rounded text-[#2F2B3D] transition"
                          title="Sửa nhân sự"
                        >
                          <Edit className="w-3 h-3 text-[#2F2B3D]" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteMember(m.id, e)}
                          className="p-1 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded transition"
                          title="Xóa nhân sự"
                        >
                          <Trash2 className="w-3 h-3 text-red-600" />
                        </button>
                      </>
                    )}
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 ml-1" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: Member Detail Profile panel */}
      <div className="w-full md:w-80 lg:w-96 bg-slate-950/40 border-l border-slate-900 p-6 overflow-y-auto flex flex-col justify-between">
        {selectedMember ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-amber-500" />
                <span>Hồ Sơ Chi Tiết Nhân Sự</span>
              </h2>
              <button
                onClick={() => setSelectedMember(null)}
                className="text-xxs text-slate-500 hover:text-white font-bold"
              >
                Đóng ×
              </button>
            </div>

            {/* Profile Header Card */}
            <div className="text-center pb-5 border-b border-slate-900">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xl font-black flex items-center justify-center mx-auto mb-3">
                {selectedMember.name.split(' ').pop()?.slice(0, 2)}
              </div>
              <h3 className="text-base font-black text-white">{selectedMember.name}</h3>
              <p className="text-xs text-amber-500 font-bold mt-1">{selectedMember.role}</p>
              <p className="text-xxs text-slate-500 mt-0.5">Nhóm chuyên môn: {selectedMember.specialist_group}</p>
            </div>

            {/* General Contact lists */}
            <div className="space-y-3 text-xxs text-slate-300">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>Email: <strong className="text-white font-bold">{selectedMember.email}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span>Hotline: <strong className="text-white font-bold">{selectedMember.phone}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                <span>Quản lý trực tiếp ID: <strong className="text-slate-400">{selectedMember.manager_id}</strong></span>
              </div>
            </div>

            {/* Core Job Description & Main Tasks */}
            <div className="bg-slate-900/50 border border-slate-850 p-3 rounded-xl space-y-2">
              <span className="text-xxs font-black text-amber-500 uppercase tracking-wide block">Nhiệm vụ chuyên trách chính</span>
              <p className="text-xxs text-slate-300 leading-relaxed font-semibold">{selectedMember.main_task}</p>
            </div>

            {/* Responsibilities & Personal KPIs */}
            <div className="space-y-4">
              <div>
                <span className="text-xxs font-black text-slate-400 uppercase tracking-wide block mb-1.5">Quyết toán KPI cá nhân</span>
                <div className="space-y-1">
                  {selectedMember.personal_kpis.map((kpi, idx) => (
                    <div key={idx} className="bg-slate-900/30 p-2 rounded text-xxs text-slate-300 border border-slate-900 leading-normal font-semibold">
                      • {kpi}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-xxs font-black text-slate-400 uppercase tracking-wide block mb-1.5">Quyền hạn & Trách nhiệm</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedMember.permissions.map((perm, idx) => (
                    <span key={idx} className="bg-slate-900 border border-slate-800 text-[10px] px-2 py-0.5 rounded text-slate-400 font-bold">
                      {perm}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Manager Notes */}
            {selectedMember.notes && (
              <div className="bg-amber-500/5 border border-amber-500/10 p-3.5 rounded-xl">
                <span className="text-xxs font-black text-amber-500 uppercase tracking-wide block mb-1">Ghi chú của Trưởng phòng</span>
                <p className="text-xxxs text-slate-400 italic leading-relaxed">{selectedMember.notes}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12 text-slate-500">
            <BookOpen className="w-12 h-12 text-slate-700 mb-2.5" />
            <p className="text-xs font-bold">Bấm chọn một nhân viên bất kỳ để xem hồ sơ năng lực chi tiết</p>
          </div>
        )}
      </div>

      {/* CRUD MODAL */}
      {isCrudModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white border border-[#E6E6E8] rounded-2xl max-w-3xl w-full p-6 text-[#2F2B3D] shadow-[0_10px_30px_rgba(47,43,61,0.2)]">
            <h3 className="text-sm font-black text-[#2F2B3D] uppercase tracking-wide border-b border-[#E6E6E8] pb-3 mb-4">
              {editingMember ? 'Cập Nhật Nhân Sự Marketing' : 'Thêm Nhân Sự Marketing Mới'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xxs text-[#5D596C] font-extrabold uppercase block mb-1">Mã nhân sự</label>
                  <input
                    type="text"
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                    disabled={!!editingMember}
                    className="w-full bg-[#F8F9FA] border border-[#E6E6E8] rounded px-2.5 py-1.5 text-xs text-[#2F2B3D] focus:outline-none focus:border-[#E04B1C] transition"
                    placeholder="e.g. an_hv"
                    required
                  />
                </div>

                <div>
                  <label className="text-xxs text-[#5D596C] font-extrabold uppercase block mb-1">Họ và tên</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#F8F9FA] border border-[#E6E6E8] rounded px-2.5 py-1.5 text-xs text-[#2F2B3D] focus:outline-none focus:border-[#E04B1C] transition"
                    placeholder="e.g. Hồ Văn An"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xxs text-[#5D596C] font-extrabold uppercase block mb-1">Vị trí chức vụ</label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full bg-[#F8F9FA] border border-[#E6E6E8] rounded px-2.5 py-1.5 text-xs text-[#2F2B3D] focus:outline-none focus:border-[#E04B1C] transition"
                    placeholder="e.g. Marketing Photo"
                    required
                  />
                </div>

                <div>
                  <label className="text-xxs text-[#5D596C] font-extrabold uppercase block mb-1">Nhóm chuyên môn</label>
                  <select
                    value={formData.specialist_group}
                    onChange={(e) => setFormData({ ...formData, specialist_group: e.target.value as SpecialistGroup })}
                    className="w-full bg-[#F8F9FA] border border-[#E6E6E8] rounded px-2.5 py-1.5 text-xs text-[#2F2B3D] focus:outline-none focus:border-[#E04B1C] transition"
                  >
                    {specialistGroups.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xxs text-[#5D596C] font-extrabold uppercase block mb-1">Email nội bộ</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[#F8F9FA] border border-[#E6E6E8] rounded px-2.5 py-1.5 text-xs text-[#2F2B3D] focus:outline-none focus:border-[#E04B1C] transition"
                    placeholder="e.g. an.hv@fugalo.vn"
                    required
                  />
                </div>

                <div>
                  <label className="text-xxs text-[#5D596C] font-extrabold uppercase block mb-1">Số điện thoại</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-[#F8F9FA] border border-[#E6E6E8] rounded px-2.5 py-1.5 text-xs text-[#2F2B3D] focus:outline-none focus:border-[#E04B1C] transition"
                    placeholder="e.g. 0939810086"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xxs text-[#5D596C] font-extrabold uppercase block mb-1">Nhiệm vụ chính được giao</label>
                <textarea
                  value={formData.main_task}
                  onChange={(e) => setFormData({ ...formData, main_task: e.target.value })}
                  className="w-full bg-[#F8F9FA] border border-[#E6E6E8] rounded p-2 text-xs text-[#2F2B3D] focus:outline-none focus:border-[#E04B1C] transition"
                  rows={2}
                  placeholder="Ghi chi tiết nhiệm vụ chính..."
                />
              </div>

              <div>
                <label className="text-xxs text-[#5D596C] font-extrabold uppercase block mb-1">Ghi Chú của Trưởng Phòng</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-[#F8F9FA] border border-[#E6E6E8] rounded px-2.5 py-1.5 text-xs text-[#2F2B3D] focus:outline-none focus:border-[#E04B1C] transition"
                  placeholder="Học hỏi tốt, chịu khó..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[#E6E6E8]">
                <button
                  type="button"
                  onClick={() => setIsCrudModalOpen(false)}
                  className="px-4 py-2 bg-[#F4F5FA] hover:bg-[#E6E6E8] text-[#2F2B3D]/80 border border-[#E6E6E8] font-bold rounded-lg text-xs transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#E04B1C] hover:bg-[#C53A0F] text-white font-extrabold rounded-lg text-xs shadow-md transition"
                >
                  Lưu Thông Tin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
