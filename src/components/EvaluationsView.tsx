/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Award,
  Plus,
  Search,
  Trash2,
  Edit,
  FileText,
  Download,
  CheckCircle2,
  Percent,
  TrendingUp,
  User,
  Zap,
  Info
} from 'lucide-react';
import { PersonnelEvaluation, TeamMember, UserRole } from '../types';

interface EvaluationsViewProps {
  evaluations: PersonnelEvaluation[];
  setEvaluations: React.Dispatch<React.SetStateAction<PersonnelEvaluation[]>>;
  members: TeamMember[];
  activeRole: UserRole;
  onExport: () => void;
  onPrint?: (evaluation: PersonnelEvaluation) => void;
}

export default function EvaluationsView({
  evaluations,
  setEvaluations,
  members,
  activeRole,
  onExport,
  onPrint,
}: EvaluationsViewProps) {
  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEval, setEditingEval] = useState<PersonnelEvaluation | null>(null);

  // Form Fields (using point breakdown requested by user)
  const [formData, setFormData] = useState<Partial<PersonnelEvaluation>>({
    staff_id: '',
    evaluator_id: 'an_hv', // Usually Hồ Văn An (Marketing Manager)
    month: '06/2026',
    kpi_points: 40,
    deadline_points: 15,
    quality_points: 12,
    proactive_points: 8,
    teamwork_points: 4,
    strengths: '',
    weaknesses: '',
    proposed_action: '',
    notes: ''
  });

  const isReadOnly = activeRole === 'Viewer';

  const openCreateModal = () => {
    setEditingEval(null);
    setFormData({
      staff_id: members[0]?.id || '',
      evaluator_id: 'an_hv',
      month: '06/2026',
      kpi_points: 40,
      deadline_points: 15,
      quality_points: 12,
      proactive_points: 8,
      teamwork_points: 4,
      strengths: '',
      weaknesses: '',
      proposed_action: 'Tiếp tục bồi dưỡng nâng cao tay nghề',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (ev: PersonnelEvaluation) => {
    setEditingEval(ev);
    setFormData({ ...ev });
    setIsModalOpen(true);
  };

  const handleDeleteEval = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa bản đánh giá hiệu suất này?')) {
      setEvaluations(prev => prev.filter(e => e.evaluation_id !== id));
    }
  };

  // Automatic calculation helper for score + classification
  const calculateResult = (
    kpi: number,
    deadline: number,
    quality: number,
    proactive: number,
    teamwork: number
  ) => {
    const total = Number(kpi) + Number(deadline) + Number(quality) + Number(proactive) + Number(teamwork);
    const score = Math.min(100, Math.max(0, total));
    
    let classification: 'Xuất sắc' | 'Tốt' | 'Đạt' | 'Cần cải thiện' | 'Không đạt' = 'Đạt';
    if (score >= 90) classification = 'Xuất sắc';
    else if (score >= 80) classification = 'Tốt';
    else if (score >= 65) classification = 'Đạt';
    else if (score >= 50) classification = 'Cần cải thiện';
    else classification = 'Không đạt';

    return { score, classification };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;

    const { score, classification } = calculateResult(
      formData.kpi_points || 0,
      formData.deadline_points || 0,
      formData.quality_points || 0,
      formData.proactive_points || 0,
      formData.teamwork_points || 0
    );

    if (editingEval) {
      setEvaluations(prev => prev.map(ev => ev.evaluation_id === editingEval.evaluation_id ? {
        ...ev,
        ...formData,
        total_score: score,
        classification,
      } as PersonnelEvaluation : ev));
    } else {
      const newEval: PersonnelEvaluation = {
        evaluation_id: `EVAL-${String(evaluations.length + 1).padStart(3, '0')}`,
        staff_id: formData.staff_id || '',
        evaluator_id: formData.evaluator_id || 'an_hv',
        month: formData.month || '06/2026',
        kpi_points: Number(formData.kpi_points) || 0,
        deadline_points: Number(formData.deadline_points) || 0,
        quality_points: Number(formData.quality_points) || 0,
        proactive_points: Number(formData.proactive_points) || 0,
        teamwork_points: Number(formData.teamwork_points) || 0,
        total_score: score,
        classification,
        strengths: formData.strengths || '',
        weaknesses: formData.weaknesses || '',
        proposed_action: formData.proposed_action || '',
        notes: formData.notes || ''
      };
      setEvaluations(prev => [newEval, ...prev]);
    }
    setIsModalOpen(false);
  };

  // Filter evaluations
  const filteredEvaluations = evaluations.filter(ev => {
    const member = members.find(m => m.id === ev.staff_id);
    const staffName = member ? member.name.toLowerCase() : '';
    const matchesSearch = staffName.includes(searchQuery.toLowerCase()) || ev.strengths.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStaff = selectedStaff === 'all' || ev.staff_id === selectedStaff;
    const matchesMonth = selectedMonth === 'all' || ev.month === selectedMonth;

    return matchesSearch && matchesStaff && matchesMonth;
  });

  const months = Array.from(new Set(evaluations.map(e => e.month)));

  // Score live preview during form input
  const liveResult = calculateResult(
    formData.kpi_points || 0,
    formData.deadline_points || 0,
    formData.quality_points || 0,
    formData.proactive_points || 0,
    formData.teamwork_points || 0
  );

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-transparent text-slate-100 p-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-amber-500 font-bold text-xs uppercase tracking-widest mb-1">
            <Award className="w-4 h-4" />
            <span>FUGALO PERFORMANCE EVALUATIONS</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">ĐÁNH GIÁ HIỆU SUẤT NHÂN SỰ MKT</h1>
          <p className="text-xs text-slate-400 mt-1">Đánh giá điểm mạnh, điểm yếu và tính điểm tổng hợp dựa trên 5 tiêu chí chuẩn phòng ban</p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onExport}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#F4F5FA] border border-[#E6E6E8] rounded-lg text-xs font-bold text-[#2F2B3D] transition"
          >
            <Download className="w-3.5 h-3.5 text-[#2F2B3D]" />
            <span>Xuất Phiếu Đánh Giá</span>
          </button>

          {!isReadOnly && (
            <button
              onClick={openCreateModal}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-extrabold shadow-md transition"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo Đánh Giá Mới</span>
            </button>
          )}
        </div>
      </div>

      {/* Evaluation Formula banner */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mt-6">
        <h4 className="text-xs font-extrabold text-amber-500 uppercase flex items-center gap-2">
          <Info className="w-4 h-4" />
          <span>CÔNG THỨC TÍNH ĐIỂM HIỆU SUẤT PHÒNG MARKETING (TỔNG 100 ĐIỂM)</span>
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-3 text-xxs font-bold text-slate-300">
          <div className="bg-slate-900/60 p-2.5 border border-slate-800 rounded-lg">
            <span className="text-amber-500 font-black text-sm block">50 Điểm</span>
            Hoàn thành KPI chính
          </div>
          <div className="bg-slate-900/60 p-2.5 border border-slate-800 rounded-lg">
            <span className="text-amber-500 font-black text-sm block">20 Điểm</span>
            Đúng deadline bàn giao
          </div>
          <div className="bg-slate-900/60 p-2.5 border border-slate-800 rounded-lg">
            <span className="text-amber-500 font-black text-sm block">15 Điểm</span>
            Chất lượng công việc
          </div>
          <div className="bg-slate-900/60 p-2.5 border border-slate-800 rounded-lg">
            <span className="text-amber-500 font-black text-sm block">10 Điểm</span>
            Chủ động đề xuất phương án
          </div>
          <div className="bg-slate-900/60 p-2.5 border border-slate-800 rounded-lg">
            <span className="text-amber-500 font-black text-sm block">5 Điểm</span>
            Phối hợp hỗ trợ đội nhóm
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Tìm theo họ tên nhân sự..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
          />
        </div>

        <div>
          <select
            value={selectedStaff}
            onChange={(e) => setSelectedStaff(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-semibold text-slate-300 focus:outline-none focus:border-amber-500"
          >
            <option value="all">Tất cả nhân sự</option>
            {members.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-semibold text-slate-300 focus:outline-none focus:border-amber-500"
          >
            <option value="all">Tất cả các tháng</option>
            {months.map(m => (
              <option key={m} value={m}>Tháng {m}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid of evaluations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {filteredEvaluations.length === 0 ? (
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-8 text-center text-slate-500 font-semibold rounded-xl">
            Chưa có bản đánh giá hiệu suất nhân viên nào được tạo.
          </div>
        ) : (
          filteredEvaluations.map((ev) => {
            const member = members.find(m => m.id === ev.staff_id);
            const evaluator = members.find(m => m.id === ev.evaluator_id);
            
            return (
              <div key={ev.evaluation_id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden group flex flex-col justify-between">
                <div>
                  {/* Top Header of Card */}
                  <div className="flex items-start justify-between border-b border-slate-850 pb-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-850 flex items-center justify-center font-black text-amber-500 text-sm border border-slate-800">
                        {member?.name.split(' ').pop()?.slice(0, 2)}
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-white">{member?.name}</h4>
                        <p className="text-xxs text-slate-400 font-bold uppercase tracking-wider mt-0.5">{member?.role} • Tháng {ev.month}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`text-xxs font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        ev.classification === 'Xuất sắc'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : ev.classification === 'Tốt'
                          ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                          : ev.classification === 'Đạt'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {ev.classification}
                      </span>
                      <div className="text-2xl font-black text-amber-500 mt-1">{ev.total_score}đ</div>
                    </div>
                  </div>

                  {/* Point Breakdown Visualization */}
                  <div className="grid grid-cols-5 gap-1.5 mb-4 text-center">
                    <div className="bg-slate-950/55 p-1 border border-slate-800 rounded">
                      <div className="text-[10px] text-slate-400">KPI</div>
                      <div className="font-extrabold text-white text-[11px]">{ev.kpi_points}/50</div>
                    </div>
                    <div className="bg-slate-950/55 p-1 border border-slate-800 rounded">
                      <div className="text-[10px] text-slate-400">D.line</div>
                      <div className="font-extrabold text-white text-[11px]">{ev.deadline_points}/20</div>
                    </div>
                    <div className="bg-slate-950/55 p-1 border border-slate-800 rounded">
                      <div className="text-[10px] text-slate-400">Q.lity</div>
                      <div className="font-extrabold text-white text-[11px]">{ev.quality_points}/15</div>
                    </div>
                    <div className="bg-slate-950/55 p-1 border border-slate-800 rounded">
                      <div className="text-[10px] text-slate-400">P.act</div>
                      <div className="font-extrabold text-white text-[11px]">{ev.proactive_points}/10</div>
                    </div>
                    <div className="bg-slate-950/55 p-1 border border-slate-800 rounded">
                      <div className="text-[10px] text-slate-400">T.work</div>
                      <div className="font-extrabold text-white text-[11px]">{ev.teamwork_points}/5</div>
                    </div>
                  </div>

                  {/* Comments */}
                  <div className="space-y-2 text-xxs">
                    <div>
                      <span className="font-extrabold text-slate-400 uppercase tracking-wide block">👍 Điểm mạnh nổi trội:</span>
                      <p className="text-slate-300 mt-0.5 bg-slate-950/40 p-2 border border-slate-850 rounded leading-relaxed">{ev.strengths}</p>
                    </div>

                    <div>
                      <span className="font-extrabold text-slate-400 uppercase tracking-wide block">⚠️ Hạn chế cần cải thiện:</span>
                      <p className="text-slate-300 mt-0.5 bg-slate-950/40 p-2 border border-slate-850 rounded leading-relaxed">{ev.weaknesses || 'Không có điểm hạn chế lớn nào.'}</p>
                    </div>

                    {ev.proposed_action && (
                      <div>
                        <span className="font-extrabold text-amber-500 uppercase tracking-wide block">🎯 Đề xuất phương án & Hành động:</span>
                        <p className="text-slate-200 mt-0.5 font-bold leading-relaxed">{ev.proposed_action}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between border-t border-slate-850 mt-4 pt-3 text-[10px] text-slate-500">
                  <span>Người đánh giá: <strong className="text-slate-400">{evaluator?.name || 'Trưởng phòng'}</strong></span>
                  
                  <div className="flex items-center gap-2">
                    {onPrint && (
                      <button
                        onClick={() => onPrint(ev)}
                        className="flex items-center gap-1 px-2.5 py-1 bg-[#E04B1C]/10 hover:bg-[#E04B1C]/20 text-[#E04B1C] font-bold rounded transition"
                      >
                        <FileText className="w-3 h-3 text-[#E04B1C]" />
                        <span className="text-[#E04B1C]">Xuất PDF</span>
                      </button>
                    )}
                    {!isReadOnly && (
                      <>
                        <button
                          onClick={() => openEditModal(ev)}
                          className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-[#F4F5FA] border border-[#E6E6E8] text-[#2F2B3D] font-bold rounded transition"
                        >
                          <Edit className="w-3 h-3 text-[#2F2B3D]" />
                          <span>Sửa</span>
                        </button>
                        <button
                          onClick={() => handleDeleteEval(ev.evaluation_id)}
                          className="flex items-center gap-1 px-2.5 py-1 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-bold rounded transition"
                        >
                          <Trash2 className="w-3 h-3 text-red-600" />
                          <span>Xóa</span>
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

      {/* Evaluation CRUD Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white border border-[#E6E6E8] rounded-2xl max-w-3xl w-full p-6 text-[#2F2B3D] shadow-[0_10px_30px_rgba(47,43,61,0.2)]">
            <h3 className="text-base font-black text-[#2F2B3D] uppercase tracking-wide border-b border-[#E6E6E8] pb-3 mb-4">
              {editingEval ? 'Cập Nhật Đánh Giá Hiệu Suất' : 'Tạo Phiếu Đánh Giá Hiệu Suất Mới'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="text-xxs text-[#5D596C] font-extrabold uppercase block mb-1">Nhân Sự Được Đánh Giá</label>
                  <select
                    value={formData.staff_id}
                    onChange={(e) => setFormData({ ...formData, staff_id: e.target.value })}
                    disabled={!!editingEval}
                    className="w-full bg-[#F8F9FA] border border-[#E6E6E8] rounded px-2.5 py-1.5 text-xs text-[#2F2B3D] focus:outline-none focus:border-[#E04B1C] transition"
                  >
                    {members.map(m => (
                      <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xxs text-[#5D596C] font-extrabold uppercase block mb-1">Tháng Đánh Giá</label>
                  <input
                    type="text"
                    value={formData.month}
                    onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                    className="w-full bg-[#F8F9FA] border border-[#E6E6E8] rounded px-2.5 py-1.5 text-xs text-[#2F2B3D] focus:outline-none focus:border-[#E04B1C] transition"
                    placeholder="e.g. 06/2026"
                  />
                </div>
              </div>

              {/* Point Breakdown Inputs */}
              <div className="bg-[#F8F9FA] p-4 border border-[#E6E6E8] rounded-xl">
                <h4 className="text-xxs font-black text-[#E04B1C] uppercase tracking-wider mb-3">Bảng Chấm Điểm Tiêu Chí</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <div>
                    <label className="text-[9px] text-[#5D596C] font-bold uppercase block mb-1">KPI (Max 50)</label>
                    <input
                      type="number"
                      value={formData.kpi_points}
                      onChange={(e) => setFormData({ ...formData, kpi_points: Math.min(50, Math.max(0, Number(e.target.value))) })}
                      className="w-full bg-white border border-[#E6E6E8] rounded px-2 py-1 text-xs text-[#2F2B3D] text-center font-bold focus:outline-none focus:border-[#E04B1C] transition"
                      min="0"
                      max="50"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-[#5D596C] font-bold uppercase block mb-1">D.Line (Max 20)</label>
                    <input
                      type="number"
                      value={formData.deadline_points}
                      onChange={(e) => setFormData({ ...formData, deadline_points: Math.min(20, Math.max(0, Number(e.target.value))) })}
                      className="w-full bg-white border border-[#E6E6E8] rounded px-2 py-1 text-xs text-[#2F2B3D] text-center font-bold focus:outline-none focus:border-[#E04B1C] transition"
                      min="0"
                      max="20"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-[#5D596C] font-bold uppercase block mb-1">Q.Lity (Max 15)</label>
                    <input
                      type="number"
                      value={formData.quality_points}
                      onChange={(e) => setFormData({ ...formData, quality_points: Math.min(15, Math.max(0, Number(e.target.value))) })}
                      className="w-full bg-white border border-[#E6E6E8] rounded px-2 py-1 text-xs text-[#2F2B3D] text-center font-bold focus:outline-none focus:border-[#E04B1C] transition"
                      min="0"
                      max="15"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-[#5D596C] font-bold uppercase block mb-1">P.Act (Max 10)</label>
                    <input
                      type="number"
                      value={formData.proactive_points}
                      onChange={(e) => setFormData({ ...formData, proactive_points: Math.min(10, Math.max(0, Number(e.target.value))) })}
                      className="w-full bg-white border border-[#E6E6E8] rounded px-2 py-1 text-xs text-[#2F2B3D] text-center font-bold focus:outline-none focus:border-[#E04B1C] transition"
                      min="0"
                      max="10"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-[#5D596C] font-bold uppercase block mb-1">T.Work (Max 5)</label>
                    <input
                      type="number"
                      value={formData.teamwork_points}
                      onChange={(e) => setFormData({ ...formData, teamwork_points: Math.min(5, Math.max(0, Number(e.target.value))) })}
                      className="w-full bg-white border border-[#E6E6E8] rounded px-2 py-1 text-xs text-[#2F2B3D] text-center font-bold focus:outline-none focus:border-[#E04B1C] transition"
                      min="0"
                      max="5"
                    />
                  </div>
                </div>

                {/* Score Live Preview */}
                <div className="flex justify-between items-center border-t border-[#E6E6E8] mt-3 pt-3 text-xs font-bold text-[#5D596C]">
                  <span>Tổng điểm tính toán:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-[#E04B1C]">{liveResult.score} điểm</span>
                    <span className="text-[10px] px-2 py-0.5 bg-[#E04B1C]/10 text-[#E04B1C] border border-[#E04B1C]/20 rounded">
                      {liveResult.classification}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xxs text-[#5D596C] font-extrabold uppercase block mb-1">Điểm mạnh nổi trội</label>
                <textarea
                  value={formData.strengths}
                  onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
                  className="w-full bg-[#F8F9FA] border border-[#E6E6E8] rounded p-2 text-xs text-[#2F2B3D] focus:outline-none focus:border-[#E04B1C] transition"
                  rows={2}
                  placeholder="Ghi nhận những đóng góp vượt trội, tính chủ động..."
                  required
                />
              </div>

              <div>
                <label className="text-xxs text-[#5D596C] font-extrabold uppercase block mb-1">Hạn chế cần cải thiện</label>
                <textarea
                  value={formData.weaknesses}
                  onChange={(e) => setFormData({ ...formData, weaknesses: e.target.value })}
                  className="w-full bg-[#F8F9FA] border border-[#E6E6E8] rounded p-2 text-xs text-[#2F2B3D] focus:outline-none focus:border-[#E04B1C] transition"
                  rows={2}
                  placeholder="Điểm chậm deadline, lỗi chính tả, kỹ thuật còn yếu..."
                />
              </div>

              <div>
                <label className="text-xxs text-[#5D596C] font-extrabold uppercase block mb-1">Hành Động & Phương án Đề Xuất tiếp theo</label>
                <input
                  type="text"
                  value={formData.proposed_action}
                  onChange={(e) => setFormData({ ...formData, proposed_action: e.target.value })}
                  className="w-full bg-[#F8F9FA] border border-[#E6E6E8] rounded px-2.5 py-1.5 text-xs text-[#2F2B3D] focus:outline-none focus:border-[#E04B1C] transition"
                  placeholder="e.g. Cử đi học nâng cao, Nhắc nhở nghiêm túc, Thưởng nóng hiệu suất"
                />
              </div>

              <div>
                <label className="text-xxs text-[#5D596C] font-extrabold uppercase block mb-1">Ghi Chú Chung</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-[#F8F9FA] border border-[#E6E6E8] rounded px-2.5 py-1.5 text-xs text-[#2F2B3D] focus:outline-none focus:border-[#E04B1C] transition"
                  placeholder="Thêm ghi chú bảo mật nếu có..."
                />
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
                  Lưu Phiếu Đánh Giá
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
