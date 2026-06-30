/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Lightbulb,
  Plus,
  Search,
  Trash2,
  Edit,
  Download,
  CheckCircle,
  XCircle,
  FileText,
  AlertCircle
} from 'lucide-react';
import { Proposal, TeamMember, UserRole, BusinessCategory } from '../types';

interface ProposalsViewProps {
  proposals: Proposal[];
  setProposals: React.Dispatch<React.SetStateAction<Proposal[]>>;
  members: TeamMember[];
  activeRole: UserRole;
  onExport: () => void;
}

export default function ProposalsView({
  proposals,
  setProposals,
  members,
  activeRole,
  onExport,
}: ProposalsViewProps) {
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProposer, setFilterProposer] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleQuickApprove = (proposalId: string) => {
    setProposals(prev => prev.map(p => {
      if (p.proposal_id === proposalId) {
        return {
          ...p,
          status: 'Đã duyệt'
        };
      }
      return p;
    }));
    
    setToastMessage(`Đã duyệt nhanh đề xuất ${proposalId} thành công!`);
    
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProposal, setEditingProposal] = useState<Proposal | null>(null);

  // Form Fields
  const [formData, setFormData] = useState<Partial<Proposal>>({
    proposer_id: '',
    proposal_date: new Date().toISOString().split('T')[0],
    issue_description: '',
    business_category: 'Nội thất',
    evidence: '',
    root_cause: '',
    proposed_solution: '',
    expected_benefits: '',
    resources_needed: '',
    timeline: '',
    owner_id: '',
    status: 'Chờ duyệt',
    post_deployment_result: ''
  });

  const isReadOnly = activeRole === 'Viewer';

  const openCreateModal = () => {
    setEditingProposal(null);
    setFormData({
      proposer_id: members[0]?.id || '',
      proposal_date: new Date().toISOString().split('T')[0],
      issue_description: '',
      business_category: 'Nội thất',
      evidence: 'Thiếu gimbal chống rung mượt',
      root_cause: 'Ê-kíp chỉ dùng tay quay làm hình ảnh rung lắc',
      proposed_solution: 'Mua thiết bị Gimbal chống rung cầm tay chuyên dụng',
      expected_benefits: 'Chất lượng video sắc nét, mượt mà',
      resources_needed: 'Ngân sách 4,500,000 đ mua Gimbal DJI',
      timeline: 'Hoàn thành trước đợt quay kế tiếp',
      owner_id: members[0]?.id || '',
      status: 'Chờ duyệt',
      post_deployment_result: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (proposal: Proposal) => {
    setEditingProposal(proposal);
    setFormData({ ...proposal });
    setIsModalOpen(true);
  };

  const handleDeleteProposal = (id: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa đề xuất ${id}?`)) {
      setProposals(prev => prev.filter(p => p.proposal_id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;

    if (editingProposal) {
      setProposals(prev => prev.map(p => p.proposal_id === editingProposal.proposal_id ? {
        ...p,
        ...formData
      } as Proposal : p));
    } else {
      const newProposal: Proposal = {
        proposal_id: `PRP-${String(proposals.length + 1).padStart(3, '0')}`,
        proposer_id: formData.proposer_id || '',
        proposal_date: formData.proposal_date || new Date().toISOString().split('T')[0],
        issue_description: formData.issue_description || '',
        business_category: formData.business_category as BusinessCategory || 'Nội thất',
        evidence: formData.evidence || '',
        root_cause: formData.root_cause || '',
        proposed_solution: formData.proposed_solution || '',
        expected_benefits: formData.expected_benefits || '',
        resources_needed: formData.resources_needed || '',
        timeline: formData.timeline || '',
        owner_id: formData.owner_id || '',
        status: formData.status as any || 'Chờ duyệt',
        post_deployment_result: formData.post_deployment_result || ''
      };
      setProposals(prev => [newProposal, ...prev]);
    }
    setIsModalOpen(false);
  };

  // Filter proposals
  const filteredProposals = proposals.filter(p => {
    const author = members.find(m => m.id === p.proposer_id);
    const authorName = author ? author.name.toLowerCase() : '';
    const matchesSearch = p.proposed_solution.toLowerCase().includes(searchQuery.toLowerCase()) || p.issue_description.toLowerCase().includes(searchQuery.toLowerCase()) || authorName.includes(searchQuery.toLowerCase());
    const matchesProposer = filterProposer === 'all' || p.proposer_id === filterProposer;
    const matchesStatus = filterStatus === 'all' || p.status === filterStatus;

    return matchesSearch && matchesProposer && matchesStatus;
  });

  const statuses = ['Chờ duyệt', 'Đã duyệt', 'Cần chỉnh sửa', 'Từ chối', 'Đang triển khai', 'Đã hoàn thành'];
  const categories: BusinessCategory[] = ['Nội thất', 'Phong thủy', 'Hàng hiệu', 'Thương hiệu chung'];

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-transparent text-slate-100 p-6">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-amber-500 font-bold text-xs uppercase tracking-widest mb-1">
            <Lightbulb className="w-4 h-4" />
            <span>FUGALO INNOVATION PANEL</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">ĐỀ XUẤT PHƯƠNG ÁN CẢI TIẾN</h1>
          <p className="text-xs text-slate-400 mt-1">Nộp sáng kiến, kiến nghị mua sắm thiết bị, đề xuất tăng ngân sách quảng cáo hoặc thay đổi kịch bản tiếp cận</p>
        </div>

        <div className="flex items-center gap-2.5">
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
              <span>Nộp Đề Xuất Mới</span>
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
            placeholder="Tìm đề xuất, kế hoạch..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
          />
        </div>

        <div>
          <select
            value={filterProposer}
            onChange={(e) => setFilterProposer(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-semibold text-slate-300 focus:outline-none"
          >
            <option value="all">Tất cả người đề xuất</option>
            {members.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-semibold text-slate-300 focus:outline-none"
          >
            <option value="all">Tất cả trạng thái duyệt</option>
            {statuses.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid of proposals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {filteredProposals.length === 0 ? (
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-8 text-center text-slate-500 font-semibold rounded-xl">
            Không tìm thấy đề xuất phương án cải tiến nào.
          </div>
        ) : (
          filteredProposals.map((p) => {
            const proposer = members.find(m => m.id === p.proposer_id);
            const owner = members.find(m => m.id === p.owner_id);
            return (
              <div key={p.proposal_id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-750 transition flex flex-col justify-between text-xxs font-semibold leading-relaxed">
                <div>
                  
                  {/* Proposal Header */}
                  <div className="flex items-start justify-between border-b border-slate-850 pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-950 text-slate-300 flex items-center justify-center font-bold">
                        {proposer?.name.split(' ').pop()?.slice(0, 2)}
                      </div>
                      <div>
                        <h3 className="text-xs font-black text-white">Mảng: {p.business_category}</h3>
                        <p className="text-[10px] text-slate-500 font-bold">👤 Đề xuất bởi: {proposer?.name || p.proposer_id} • {p.proposal_date}</p>
                      </div>
                    </div>

                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase ${
                      p.status === 'Đã duyệt'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : p.status === 'Chờ duyệt'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : p.status === 'Cần chỉnh sửa'
                        ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {p.status}
                    </span>
                  </div>

                  {/* Core Proposal Content */}
                  <div className="space-y-3 mb-4">
                    <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-850">
                      <span className="font-extrabold text-amber-500 uppercase tracking-wide block mb-1">⚠️ Vấn đề / Thực trạng</span>
                      <p className="text-slate-300">{p.issue_description}</p>
                    </div>

                    <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-850">
                      <span className="font-extrabold text-white uppercase tracking-wide block mb-1">📋 Giải pháp cải tiến đề xuất</span>
                      <p className="text-slate-300">{p.proposed_solution}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-950/40 p-2 border border-slate-850 rounded">
                        <span className="text-slate-500 block">Tài nguyên, thiết bị cần</span>
                        <strong className="text-white text-xs font-black">{p.resources_needed || 'Không cần'}</strong>
                      </div>
                      <div className="bg-slate-950/40 p-2 border border-slate-850 rounded">
                        <span className="text-slate-500 block">Lộ trình triển khai</span>
                        <strong className="text-amber-500 text-xs font-black">{p.timeline}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Post Deployment Result */}
                  {p.post_deployment_result && (
                    <div className="bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-xl mb-4 text-slate-400">
                      <span className="font-extrabold text-emerald-500 uppercase tracking-wide block">🏆 Kết quả sau triển khai thực tế:</span>
                      <p className="mt-1">{p.post_deployment_result}</p>
                    </div>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between border-t border-slate-850 pt-3 text-[10px] text-slate-500">
                  <span className="font-mono text-slate-600 font-bold">ID: {p.proposal_id}</span>
                  
                  {!isReadOnly && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {(activeRole === 'Manager' || activeRole === 'Admin') && p.status !== 'Đã duyệt' && (
                        <button
                          onClick={() => handleQuickApprove(p.proposal_id)}
                          className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-600 font-bold rounded transition"
                        >
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          <span>Duyệt nhanh</span>
                        </button>
                      )}
                      <button
                        onClick={() => openEditModal(p)}
                        className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-[#F4F5FA] border border-[#E6E6E8] text-[#2F2B3D] font-bold rounded transition"
                      >
                        <Edit className="w-3 h-3 text-[#2F2B3D]" />
                        <span>Xem / Phê duyệt</span>
                      </button>
                      <button
                        onClick={() => handleDeleteProposal(p.proposal_id)}
                        className="flex items-center gap-1 px-2.5 py-1 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-bold rounded transition"
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

      {/* Proposal CRUD Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white border border-[#E6E6E8] rounded-2xl max-w-3xl w-full p-6 text-[#2F2B3D] shadow-[0_10px_30px_rgba(47,43,61,0.2)]">
            <h3 className="text-base font-black text-[#2F2B3D] uppercase tracking-wide border-b border-[#E6E6E8] pb-3 mb-4">
              {editingProposal ? 'Chi Tiết & Phê Duyệt Đề Xuất Phương Án' : 'Nộp Đề Xuất Sáng Kiến Mới'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xxs text-[#5D596C] font-extrabold uppercase block mb-1">Mảng kinh doanh chuyên trách</label>
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

                <div>
                  <label className="text-xxs text-[#5D596C] font-extrabold uppercase block mb-1">Người đề xuất</label>
                  <select
                    value={formData.proposer_id}
                    onChange={(e) => setFormData({ ...formData, proposer_id: e.target.value })}
                    disabled={!!editingProposal}
                    className="w-full bg-[#F8F9FA] border border-[#E6E6E8] rounded px-2.5 py-1.5 text-xs text-[#2F2B3D] focus:outline-none focus:border-[#E04B1C] transition"
                  >
                    {members.map(m => (
                      <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xxs text-[#5D596C] font-extrabold uppercase block mb-1">Mô tả vấn đề / Thực trạng</label>
                <textarea
                  value={formData.issue_description}
                  onChange={(e) => setFormData({ ...formData, issue_description: e.target.value })}
                  className="w-full bg-[#F8F9FA] border border-[#E6E6E8] rounded p-2 text-xs text-[#2F2B3D] focus:outline-none focus:border-[#E04B1C] transition"
                  rows={2}
                  placeholder="e.g. Video giới thiệu trang sức phong thủy bị rung lắc do quay tay thô..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xxs text-[#5D596C] font-extrabold uppercase block mb-1">Nguyên nhân gốc rễ</label>
                  <input
                    type="text"
                    value={formData.root_cause}
                    onChange={(e) => setFormData({ ...formData, root_cause: e.target.value })}
                    className="w-full bg-[#F8F9FA] border border-[#E6E6E8] rounded px-2.5 py-1.5 text-xs text-[#2F2B3D] focus:outline-none focus:border-[#E04B1C] transition"
                    placeholder="Không có gimbal, tay quay thiếu ổn định..."
                  />
                </div>

                <div>
                  <label className="text-xxs text-[#5D596C] font-extrabold uppercase block mb-1">Bằng chứng / Dẫn chứng</label>
                  <input
                    type="text"
                    value={formData.evidence}
                    onChange={(e) => setFormData({ ...formData, evidence: e.target.value })}
                    className="w-full bg-[#F8F9FA] border border-[#E6E6E8] rounded px-2.5 py-1.5 text-xs text-[#2F2B3D] focus:outline-none focus:border-[#E04B1C] transition"
                    placeholder="Video raw trong Folder Drive..."
                  />
                </div>
              </div>

              <div>
                <label className="text-xxs text-[#5D596C] font-extrabold uppercase block mb-1">Giải pháp đề xuất</label>
                <textarea
                  value={formData.proposed_solution}
                  onChange={(e) => setFormData({ ...formData, proposed_solution: e.target.value })}
                  className="w-full bg-[#F8F9FA] border border-[#E6E6E8] rounded p-2 text-xs text-[#2F2B3D] focus:outline-none focus:border-[#E04B1C] transition"
                  rows={2}
                  placeholder="e.g. Trang bị thiết bị Gimbal DJI RS3..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xxs text-[#5D596C] font-extrabold uppercase block mb-1">Tài nguyên & Thiết bị cần</label>
                  <input
                    type="text"
                    value={formData.resources_needed}
                    onChange={(e) => setFormData({ ...formData, resources_needed: e.target.value })}
                    className="w-full bg-[#F8F9FA] border border-[#E6E6E8] rounded px-2.5 py-1.5 text-xs text-[#2F2B3D] font-bold focus:outline-none focus:border-[#E04B1C] transition"
                    placeholder="e.g. Dự toán kinh phí 4,500,000đ"
                  />
                </div>

                <div>
                  <label className="text-xxs text-[#5D596C] font-extrabold uppercase block mb-1">Trạng thái phê duyệt</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-[#F8F9FA] border border-[#E6E6E8] rounded px-2.5 py-1.5 text-xs text-[#2F2B3D] focus:outline-none focus:border-[#E04B1C] transition"
                  >
                    {statuses.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xxs text-[#5D596C] font-extrabold uppercase block mb-1">Lộ trình triển khai (Timeline)</label>
                  <input
                    type="text"
                    value={formData.timeline}
                    onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                    className="w-full bg-[#F8F9FA] border border-[#E6E6E8] rounded px-2.5 py-1.5 text-xs text-[#2F2B3D] focus:outline-none focus:border-[#E04B1C] transition"
                    placeholder="e.g. Hoàn tất mua sắm trong 3 ngày"
                  />
                </div>

                <div>
                  <label className="text-xxs text-[#5D596C] font-extrabold uppercase block mb-1">Chủ quản triển khai (Owner)</label>
                  <select
                    value={formData.owner_id}
                    onChange={(e) => setFormData({ ...formData, owner_id: e.target.value })}
                    className="w-full bg-[#F8F9FA] border border-[#E6E6E8] rounded px-2.5 py-1.5 text-xs text-[#2F2B3D] focus:outline-none focus:border-[#E04B1C] transition"
                  >
                    {members.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xxs text-[#5D596C] font-extrabold uppercase block mb-1">Kết quả sau triển khai (Thực tế)</label>
                <textarea
                  value={formData.post_deployment_result}
                  onChange={(e) => setFormData({ ...formData, post_deployment_result: e.target.value })}
                  className="w-full bg-[#F8F9FA] border border-[#E6E6E8] rounded p-2 text-xs text-[#2F2B3D] focus:outline-none focus:border-[#E04B1C] transition"
                  rows={1.5}
                  placeholder="Ghi nhận kết quả sau khi đề xuất được duyệt thực thi..."
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
                  Xác nhận đề xuất
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Status Confirmation Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[100] bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-[0_10px_30px_rgba(86,202,0,0.3)] flex items-center gap-3 border border-emerald-500/30 animate-bounce">
          <CheckCircle className="w-5 h-5 text-white" />
          <span className="text-xs font-black">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
