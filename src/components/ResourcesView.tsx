/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FolderOpen,
  Plus,
  Search,
  Trash2,
  Edit,
  Download,
  ExternalLink,
  FileText,
  Image,
  Video,
  FileSpreadsheet,
  Link2
} from 'lucide-react';
import { Resource, TeamMember, Campaign, UserRole, BusinessCategory, ResourceUsageStatus } from '../types';

interface ResourcesViewProps {
  resources: Resource[];
  setResources: React.Dispatch<React.SetStateAction<Resource[]>>;
  members: TeamMember[];
  campaigns: Campaign[];
  activeRole: UserRole;
  onExport: () => void;
}

export default function ResourcesView({
  resources,
  setResources,
  members,
  campaigns,
  activeRole,
  onExport,
}: ResourcesViewProps) {
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [versionNotes, setVersionNotes] = useState('');

  // Form Fields
  const [formData, setFormData] = useState<Partial<Resource>>({
    title: '',
    resource_type: 'File thiết kế',
    business_category: 'Nội thất',
    campaign_id: '',
    creator_id: '',
    created_date: new Date().toISOString().split('T')[0],
    file_link: '',
    status: 'Đã duyệt',
    notes: ''
  });

  const isReadOnly = activeRole === 'Viewer';

  const openCreateModal = () => {
    setEditingResource(null);
    setVersionNotes('');
    setFormData({
      title: '',
      resource_type: 'File thiết kế',
      business_category: 'Nội thất',
      campaign_id: campaigns[0]?.campaign_id || '',
      creator_id: members[0]?.id || '',
      created_date: new Date().toISOString().split('T')[0],
      file_link: '',
      status: 'Đã duyệt',
      notes: 'Sử dụng cho toàn ê-kíp truyền thông nội bộ FUGALO.'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (resource: Resource) => {
    setEditingResource(resource);
    setVersionNotes('');
    setFormData({ ...resource });
    setIsModalOpen(true);
  };

  const handleDeleteResource = (id: string) => {
    if (confirm(`Bạn có chắc muốn xóa tài nguyên ${id}?`)) {
      setResources(prev => prev.filter(r => r.resource_id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;

    if (editingResource) {
      setResources(prev => prev.map(r => {
        if (r.resource_id === editingResource.resource_id) {
          const hasFileLinkChanged = formData.file_link !== r.file_link;
          const updatedVersions = r.versions ? [...r.versions] : [];
          
          if (hasFileLinkChanged) {
            const updaterMember = members.find(m => m.id === formData.creator_id) || members[0];
            const updaterName = updaterMember ? updaterMember.name : 'Chuyên viên';
            updatedVersions.push({
              file_link: r.file_link,
              updated_at: new Date().toISOString().replace('T', ' ').substring(0, 16),
              updater_name: updaterName,
              notes: versionNotes || 'Cập nhật liên kết mới'
            });
          }

          return {
            ...r,
            ...formData,
            versions: updatedVersions
          } as Resource;
        }
        return r;
      }));
    } else {
      const newResource: Resource = {
        resource_id: `RES-${String(resources.length + 1).padStart(3, '0')}`,
        title: formData.title || '',
        resource_type: formData.resource_type as any || 'File thiết kế',
        business_category: formData.business_category as BusinessCategory || 'Nội thất',
        campaign_id: formData.campaign_id || '',
        creator_id: formData.creator_id || '',
        created_date: formData.created_date || new Date().toISOString().split('T')[0],
        file_link: formData.file_link || '',
        status: formData.status as ResourceUsageStatus || 'Đã duyệt',
        notes: formData.notes || '',
        versions: []
      };
      setResources(prev => [newResource, ...prev]);
    }
    setIsModalOpen(false);
  };

  // Filter resources list
  const filteredResources = resources.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) || r.notes.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || r.business_category === filterCategory;
    const matchesType = filterType === 'all' || r.resource_type === filterType;

    return matchesSearch && matchesCategory && matchesType;
  });

  const categories: BusinessCategory[] = ['Nội thất', 'Phong thủy', 'Hàng hiệu', 'Thương hiệu chung'];
  const resourceTypes = ['Ảnh', 'Video', 'Kịch bản', 'Caption', 'File thiết kế', 'Brief', 'Báo cáo'];
  const statuses: ResourceUsageStatus[] = ['Bản nháp', 'Chờ duyệt', 'Đã duyệt', 'Đã đăng', 'Lưu trữ', 'Không sử dụng'];

  const isFileLinkChanged = !!(editingResource && formData.file_link !== editingResource.file_link);

  // Icon chooser helper based on format
  const renderTypeIcon = (type: string) => {
    if (type === 'Video') return <Video className="w-5 h-5 text-sky-400" />;
    if (type === 'Ảnh' || type === 'File thiết kế') return <Image className="w-5 h-5 text-emerald-400" />;
    if (type === 'Báo cáo') return <FileSpreadsheet className="w-5 h-5 text-emerald-500" />;
    return <FileText className="w-5 h-5 text-slate-400" />;
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-transparent text-slate-100 p-6">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-amber-500 font-bold text-xs uppercase tracking-widest mb-1">
            <FolderOpen className="w-4 h-4" />
            <span>FUGALO RESOURCE LIBRARY</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">KHO TÀI NGUYÊN MARKETING NỘI BỘ</h1>
          <p className="text-xs text-slate-400 mt-1">Lưu trữ biểu mẫu thiết kế, nhạc nền miễn phí bản quyền, kịch bản quay dựng mẫu, brand guidelines</p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onExport}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#F4F5FA] border border-[#E6E6E8] rounded-lg text-xs font-bold text-[#2F2B3D] transition"
          >
            <Download className="w-3.5 h-3.5 text-[#2F2B3D]" />
            <span>Xuất Thống Kê</span>
          </button>

          {!isReadOnly && (
            <button
              onClick={openCreateModal}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-extrabold shadow-md transition"
            >
              <Plus className="w-4 h-4" />
              <span>Tải Lên Tài Nguyên</span>
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
            placeholder="Tìm tài nguyên, biểu mẫu mẫu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
          />
        </div>

        <div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-semibold text-slate-300 focus:outline-none"
          >
            <option value="all">Tất cả mảng kinh doanh</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-semibold text-slate-300 focus:outline-none"
          >
            <option value="all">Tất cả loại tài nguyên</option>
            {resourceTypes.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid of resource files */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {filteredResources.length === 0 ? (
          <div className="md:col-span-2 lg:col-span-3 bg-slate-900 border border-slate-800 p-8 text-center text-slate-500 font-semibold rounded-xl">
            Không tìm thấy tài liệu hay tài nguyên nào.
          </div>
        ) : (
          filteredResources.map((r) => {
            const author = members.find(m => m.id === r.creator_id);
            const campaign = campaigns.find(c => c.campaign_id === r.campaign_id);
            return (
              <div key={r.resource_id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 hover:border-slate-700 transition flex flex-col justify-between text-xxs font-semibold">
                <div>
                  
                  {/* Top row */}
                  <div className="flex items-start justify-between border-b border-slate-850 pb-2.5 mb-3">
                    <div className="flex items-center gap-2">
                      {renderTypeIcon(r.resource_type)}
                      <div>
                        <span className="text-[9px] text-slate-500 font-mono font-bold uppercase">{r.resource_id} • {r.resource_type}</span>
                        <h4 className="text-xs font-black text-white mt-0.5 line-clamp-1">{r.title}</h4>
                      </div>
                    </div>

                    <span className="text-slate-500 text-[9px] font-mono">{r.created_date}</span>
                  </div>

                  {/* Resource descriptions */}
                  <div className="space-y-2 mb-3">
                    <p className="text-slate-400 font-medium line-clamp-2">{r.notes || 'Chưa có mô tả chi tiết cho file này.'}</p>
                    
                    <div className="flex flex-wrap gap-1.5">
                      <span className="bg-slate-950 border border-slate-850 px-2 py-0.5 rounded text-slate-300">
                        📁 {r.business_category}
                      </span>
                      {campaign && (
                        <span className="bg-amber-500/10 text-amber-500 border border-amber-500/10 px-2 py-0.5 rounded">
                          🎯 Cpg: {campaign.campaign_name}
                        </span>
                      )}
                    </div>

                    {/* Lịch sử phiên bản */}
                    {r.versions && r.versions.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-slate-800/60">
                        <span className="text-[9px] font-black uppercase text-amber-500 tracking-wider block mb-1">
                          📜 Lịch sử phiên bản ({r.versions.length})
                        </span>
                        <div className="space-y-1 max-h-[80px] overflow-y-auto pr-1 text-[9px]">
                          {r.versions.map((v, idx) => (
                            <div key={idx} className="flex justify-between items-start gap-1 text-[9px] text-slate-400 bg-slate-950/40 p-1.5 rounded border border-slate-850/40">
                              <div className="truncate">
                                <span className="font-extrabold text-slate-300">{v.updater_name}</span>
                                <span className="text-[8px] text-slate-500 ml-1">({v.updated_at})</span>
                                {v.notes && <p className="text-[8px] text-slate-500 mt-0.5 truncate">{v.notes}</p>}
                              </div>
                              <a
                                href={v.file_link}
                                target="_blank"
                                rel="noreferrer"
                                className="text-amber-500 hover:underline font-extrabold flex-shrink-0 flex items-center gap-0.5"
                              >
                                <ExternalLink className="w-2.5 h-2.5" />
                                <span>v{idx + 1}</span>
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer details & direct link */}
                <div className="flex items-center justify-between border-t border-slate-850 pt-2.5 mt-2">
                  <div className="text-slate-500 text-[10px]">
                    Người nộp: <strong className="text-slate-400">{author?.name || r.creator_id}</strong>
                  </div>

                  <div className="flex items-center gap-2">
                    {r.file_link && (
                      <a
                        href={r.file_link}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold rounded-lg transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Mở Link</span>
                      </a>
                    )}

                    {!isReadOnly && (
                      <>
                        <button
                          onClick={() => openEditModal(r)}
                          className="p-1 bg-white hover:bg-[#F4F5FA] border border-[#E6E6E8] rounded text-[#2F2B3D] transition"
                          title="Sửa tài liệu"
                        >
                          <Edit className="w-3.5 h-3.5 text-[#2F2B3D]" />
                        </button>
                        <button
                          onClick={() => handleDeleteResource(r.resource_id)}
                          className="p-1 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded transition"
                          title="Xóa tài liệu"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-600" />
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

      {/* Resource CRUD Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white border border-[#E6E6E8] rounded-2xl max-w-3xl w-full p-6 text-[#2F2B3D] shadow-[0_10px_30px_rgba(47,43,61,0.2)]">
            <h3 className="text-base font-black text-[#2F2B3D] uppercase tracking-wide border-b border-[#E6E6E8] pb-3 mb-4">
              {editingResource ? 'Cập Nhật Tài Nguyên Thư Viện' : 'Tải Lên Tài Nguyên Mới'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xxs text-[#5D596C] font-extrabold uppercase block mb-1">Tiêu đề tài nguyên / Tài liệu</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-[#F8F9FA] border border-[#E6E6E8] rounded px-2.5 py-1.5 text-xs text-[#2F2B3D] font-bold focus:outline-none focus:border-[#E04B1C] transition"
                    placeholder="e.g. Logo FUGALO chuẩn định dạng vector AI..."
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xxs text-[#5D596C] font-extrabold uppercase block mb-1">Mô tả chi tiết nội dung tài nguyên</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-[#F8F9FA] border border-[#E6E6E8] rounded p-2 text-xs text-[#2F2B3D] focus:outline-none focus:border-[#E04B1C] transition"
                  rows={2}
                  placeholder="Ghi chú sử dụng tài liệu cho ê-kíp..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xxs text-[#5D596C] font-extrabold uppercase block mb-1">Mảng kinh doanh</label>
                  <select
                    value={formData.business_category}
                    onChange={(e) => setFormData({ ...formData, business_category: e.target.value as BusinessCategory })}
                    className="w-full bg-[#F8F9FA] border border-[#E6E6E8] rounded px-2 py-1.5 text-xs text-[#2F2B3D] focus:outline-none focus:border-[#E04B1C] transition"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xxs text-[#5D596C] font-extrabold uppercase block mb-1">Loại tài nguyên</label>
                  <select
                    value={formData.resource_type}
                    onChange={(e) => setFormData({ ...formData, resource_type: e.target.value as any })}
                    className="w-full bg-[#F8F9FA] border border-[#E6E6E8] rounded px-2 py-1.5 text-xs text-[#2F2B3D] focus:outline-none focus:border-[#E04B1C] transition"
                  >
                    {resourceTypes.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xxs text-[#5D596C] font-extrabold uppercase block mb-1">Đường dẫn tài liệu (Drive/Web link)</label>
                  <input
                    type="url"
                    value={formData.file_link}
                    onChange={(e) => setFormData({ ...formData, file_link: e.target.value })}
                    className="w-full bg-[#F8F9FA] border border-[#E6E6E8] rounded px-2.5 py-1.5 text-xs text-[#2F2B3D] font-mono focus:outline-none focus:border-[#E04B1C] transition"
                    placeholder="https://drive.google.com/..."
                    required
                  />
                </div>
              </div>

              {/* Ghi chú thay đổi phiên bản */}
              {isFileLinkChanged && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-[#2F2B3D] flex flex-col gap-1.5 mt-2 animate-fade-in">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="font-extrabold text-[10px] uppercase block tracking-wider text-red-700">💡 PHÁT HIỆN THAY ĐỔI ĐƯỜNG DẪN FILE</span>
                  </div>
                  <label className="text-xxs text-[#5D596C] font-extrabold uppercase block mt-1">Ghi chú thay đổi phiên bản (bắt buộc)</label>
                  <input
                    type="text"
                    value={versionNotes}
                    onChange={(e) => setVersionNotes(e.target.value)}
                    className="w-full bg-white border border-[#E6E6E8] rounded px-2.5 py-1.5 text-xs text-[#2F2B3D] font-bold focus:outline-none focus:border-[#E04B1C] transition placeholder-slate-400"
                    placeholder="Mô tả lý do thay đổi (ví dụ: Sửa lỗi chính tả, thay video HD, đổi nhạc nền)..."
                    required
                  />
                  <span className="text-[10px] text-slate-500 italic block mt-0.5">Hệ thống sẽ tự động lưu lại liên kết cũ ({editingResource?.file_link}) vào danh sách Lịch sử phiên bản.</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xxs text-[#5D596C] font-extrabold uppercase block mb-1">Người tải lên</label>
                  <select
                    value={formData.creator_id}
                    onChange={(e) => setFormData({ ...formData, creator_id: e.target.value })}
                    className="w-full bg-[#F8F9FA] border border-[#E6E6E8] rounded px-2 py-1.5 text-xs text-[#2F2B3D] focus:outline-none focus:border-[#E04B1C] transition"
                  >
                    {members.map(m => (
                      <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xxs text-[#5D596C] font-extrabold uppercase block mb-1">Gắn kết với chiến dịch</label>
                  <select
                    value={formData.campaign_id}
                    onChange={(e) => setFormData({ ...formData, campaign_id: e.target.value })}
                    className="w-full bg-[#F8F9FA] border border-[#E6E6E8] rounded px-2 py-1.5 text-xs text-[#2F2B3D] focus:outline-none focus:border-[#E04B1C] transition"
                  >
                    <option value="">Không liên kết chiến dịch</option>
                    {campaigns.map(c => (
                      <option key={c.campaign_id} value={c.campaign_id}>{c.campaign_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xxs text-[#5D596C] font-extrabold uppercase block mb-1">Ngày nộp</label>
                  <input
                    type="date"
                    value={formData.created_date}
                    onChange={(e) => setFormData({ ...formData, created_date: e.target.value })}
                    className="w-full bg-[#F8F9FA] border border-[#E6E6E8] rounded px-2.5 py-1.5 text-xs text-[#2F2B3D] focus:outline-none focus:border-[#E04B1C] transition"
                  />
                </div>

                <div>
                  <label className="text-xxs text-[#5D596C] font-extrabold uppercase block mb-1">Trạng thái lưu trữ</label>
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

              {/* Lịch sử các phiên bản cũ trong Modal */}
              {editingResource && editingResource.versions && editingResource.versions.length > 0 && (
                <div className="border-t border-[#E6E6E8] pt-3 mt-3">
                  <label className="text-xxs text-[#5D596C] font-extrabold uppercase block mb-1.5">📜 Lịch sử phiên bản ({editingResource.versions.length})</label>
                  <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                    {editingResource.versions.map((ver, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-3 bg-[#F8F9FA] border border-[#E6E6E8] p-2 rounded-lg text-xxs">
                        <div className="truncate flex-1">
                          <div className="flex items-center gap-1.5 text-[#2F2B3D]">
                            <span className="font-extrabold text-amber-600">v{idx + 1}</span>
                            <span className="text-[10px] text-slate-500">• {ver.updated_at}</span>
                            <span className="text-[10px] text-[#5D596C] font-medium">bởi <strong className="font-bold">{ver.updater_name}</strong></span>
                          </div>
                          {ver.notes && <p className="text-[10px] text-slate-500 italic mt-0.5 truncate">{ver.notes}</p>}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <a
                            href={ver.file_link}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2 py-1 bg-white border border-[#E6E6E8] rounded text-[#2F2B3D] font-bold hover:bg-[#F4F5FA] transition flex items-center gap-1"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-[#2F2B3D]" />
                            <span>Xem</span>
                          </a>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                file_link: ver.file_link
                              }));
                              setVersionNotes(`Khôi phục từ phiên bản v${idx + 1} (${ver.updater_name})`);
                            }}
                            className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold rounded text-xxs transition cursor-pointer"
                          >
                            Khôi phục
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
                  Lưu Tài Nguyên
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
