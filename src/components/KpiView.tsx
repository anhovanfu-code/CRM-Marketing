/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  TrendingUp,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit,
  Download,
  CheckCircle,
  FileSpreadsheet,
  Calendar,
  User,
  Activity
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  ReferenceLine
} from 'recharts';
import { KpiAssignment, TeamMember, UserRole } from '../types';

interface KpiViewProps {
  kpis: KpiAssignment[];
  setKpis: React.Dispatch<React.SetStateAction<KpiAssignment[]>>;
  members: TeamMember[];
  activeRole: UserRole;
  onExport: () => void;
}

export default function KpiView({
  kpis,
  setKpis,
  members,
  activeRole,
  onExport,
}: KpiViewProps) {
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKpi, setEditingKpi] = useState<KpiAssignment | null>(null);

  // Form Fields
  const [formData, setFormData] = useState<Partial<KpiAssignment>>({
    staff_id: '',
    role: '',
    evaluation_month: '07/2026',
    kpi_name: '',
    target_value: '',
    actual_value: '',
    completion_rate: 100,
    kpi_score: 100,
    manager_feedback: '',
    action_proposal: 'Giữ vững phong độ',
    status: 'Chờ cấp trên duyệt'
  });

  const isReadOnly = activeRole === 'Viewer';

  // Handle staff change in form to automatically pull their role
  const handleStaffChange = (staffId: string) => {
    const member = members.find(m => m.id === staffId);
    setFormData(prev => ({
      ...prev,
      staff_id: staffId,
      role: member ? member.role : ''
    }));
  };

  const openCreateModal = () => {
    setEditingKpi(null);
    setFormData({
      staff_id: members[0]?.id || '',
      role: members[0]?.role || '',
      evaluation_month: '07/2026',
      kpi_name: '',
      target_value: '',
      actual_value: '',
      completion_rate: 100,
      kpi_score: 100,
      manager_feedback: '',
      action_proposal: 'Giữ vững phong độ',
      status: 'Chờ cấp trên duyệt'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (kpi: KpiAssignment) => {
    setEditingKpi(kpi);
    setFormData({ ...kpi });
    setIsModalOpen(true);
  };

  const handleDeleteKpi = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa đánh giá KPI này?')) {
      setKpis(prev => prev.filter(k => k.kpi_id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;

    const rate = Number(formData.completion_rate) || 0;
    const score = Number(formData.kpi_score) || 0;

    if (editingKpi) {
      setKpis(prev => prev.map(k => k.kpi_id === editingKpi.kpi_id ? {
        ...k,
        ...formData,
        completion_rate: rate,
        kpi_score: score,
      } as KpiAssignment : k));
    } else {
      const newKpi: KpiAssignment = {
        kpi_id: `KPI-${String(kpis.length + 1).padStart(3, '0')}`,
        staff_id: formData.staff_id || '',
        role: formData.role || '',
        evaluation_month: formData.evaluation_month || '06/2026',
        kpi_name: formData.kpi_name || '',
        target_value: formData.target_value || '',
        actual_value: formData.actual_value || '',
        completion_rate: rate,
        kpi_score: score,
        manager_feedback: formData.manager_feedback || '',
        action_proposal: formData.action_proposal || '',
        status: formData.status as any || 'Chờ cấp trên duyệt'
      };
      setKpis(prev => [newKpi, ...prev]);
    }
    setIsModalOpen(false);
  };

  // Filter KPI lists
  const filteredKpis = kpis.filter(k => {
    const member = members.find(m => m.id === k.staff_id);
    const staffName = member ? member.name.toLowerCase() : '';
    const matchesSearch = k.kpi_name.toLowerCase().includes(searchQuery.toLowerCase()) || staffName.includes(searchQuery.toLowerCase());
    const matchesStaff = selectedStaff === 'all' || k.staff_id === selectedStaff;
    const matchesStatus = selectedStatus === 'all' || k.status === selectedStatus;
    const matchesMonth = selectedMonth === 'all' || k.evaluation_month === selectedMonth;

    return matchesSearch && matchesStaff && matchesStatus && matchesMonth;
  });

  const months = Array.from(new Set(kpis.map(k => k.evaluation_month)));

  // --- Recharts Data Preparation ---
  const [activeChartTab, setActiveChartTab] = useState<'compare' | 'trend'>('compare');

  // Colors for staff members' lines/bars
  const staffColors = [
    '#f59e0b', // amber-500
    '#10b981', // emerald-500
    '#0ea5e9', // sky-500
    '#ec4899', // pink-500
    '#8b5cf6', // violet-500
  ];

  const getMemberColor = (index: number) => staffColors[index % staffColors.length];

  // Sort months chronologically (e.g., 04/2026 before 05/2026 before 06/2026)
  const sortedMonths = [...months].sort((a, b) => {
    const [m1, y1] = a.split('/').map(Number);
    const [m2, y2] = b.split('/').map(Number);
    return y1 !== y2 ? y1 - y2 : m1 - m2;
  });

  // Calculate Bar Chart Data: average/specific completion rates for the selected filters
  const barChartData = members.map(m => {
    const memberKpis = kpis.filter(k => {
      const matchesStaff = k.staff_id === m.id;
      const matchesMonth = selectedMonth === 'all' || k.evaluation_month === selectedMonth;
      const matchesStatus = selectedStatus === 'all' || k.status === selectedStatus;
      return matchesStaff && matchesMonth && matchesStatus;
    });

    if (memberKpis.length === 0) return null;

    const totalRate = memberKpis.reduce((sum, k) => sum + k.completion_rate, 0);
    const totalScore = memberKpis.reduce((sum, k) => sum + k.kpi_score, 0);

    return {
      id: m.id,
      name: m.name,
      role: m.role,
      'Tỷ lệ hoàn thành (%)': Math.round(totalRate / memberKpis.length),
      'Điểm số KPI': Math.round(totalScore / memberKpis.length),
    };
  }).filter(Boolean) as Array<{
    id: string;
    name: string;
    role: string;
    'Tỷ lệ hoàn thành (%)': number;
    'Điểm số KPI': number;
  }>;

  // Calculate Trend Chart Data: Monthly progression of completion rates
  const isSingleStaff = selectedStaff !== 'all';
  const selectedStaffObj = members.find(m => m.id === selectedStaff);

  const trendChartData = sortedMonths.map(month => {
    const dataPoint: any = { month: `Tháng ${month}` };

    if (isSingleStaff) {
      // Single selected staff member
      const kpi = kpis.find(k => k.staff_id === selectedStaff && k.evaluation_month === month);
      dataPoint['Tỷ lệ hoàn thành (%)'] = kpi ? kpi.completion_rate : null;
      dataPoint['Điểm số KPI'] = kpi ? kpi.kpi_score : null;
    } else {
      // Comparison of all staff members
      members.forEach(m => {
        const kpi = kpis.find(k => k.staff_id === m.id && k.evaluation_month === month);
        dataPoint[m.name] = kpi ? kpi.completion_rate : null;
      });

      // Team average
      const monthKpis = kpis.filter(k => k.evaluation_month === month);
      if (monthKpis.length > 0) {
        const avgRate = monthKpis.reduce((sum, k) => sum + k.completion_rate, 0) / monthKpis.length;
        dataPoint['Độ trung bình team'] = Math.round(avgRate);
      }
    }
    return dataPoint;
  });

  // Custom tooltips matching deep dark aesthetic
  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl shadow-xl text-xxs font-bold text-slate-300">
          <p className="text-white border-b border-slate-800 pb-1 mb-1.5 uppercase font-extrabold tracking-wider">{label}</p>
          <p className="text-[10px] text-slate-500 mb-1">{data.role}</p>
          <div className="space-y-1">
            <p className="flex items-center justify-between gap-4">
              <span className="text-slate-400">Tỷ lệ hoàn thành:</span>
              <span className="text-amber-500 font-black">{data['Tỷ lệ hoàn thành (%)']}%</span>
            </p>
            <p className="flex items-center justify-between gap-4">
              <span className="text-slate-400">Điểm số KPI:</span>
              <span className="text-sky-400 font-black">{data['Điểm số KPI']}đ</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomTrendTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl shadow-xl text-xxs font-bold text-slate-300">
          <p className="text-white border-b border-slate-800 pb-1 mb-1.5 uppercase font-extrabold tracking-wider">{label}</p>
          <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
            {payload.map((item: any, idx: number) => (
              <p key={idx} className="flex items-center justify-between gap-4 py-0.5">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color || item.fill }} />
                  <span>{item.name}:</span>
                </span>
                <span className="text-white font-black">{item.value}%</span>
              </p>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-transparent text-slate-100 p-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-amber-500 font-bold text-xs uppercase tracking-widest mb-1">
            <TrendingUp className="w-4 h-4" />
            <span>FUGALO INTERNAL OPERATIONS</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">QUẢN LÝ KPI NHÂN SỰ MARKETING</h1>
          <p className="text-xs text-slate-400 mt-1">Lập chỉ tiêu, giám sát tiến độ thực tế, tính toán tỷ lệ hoàn thành KPI định kỳ hằng tháng</p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onExport}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#F4F5FA] border border-[#E6E6E8] rounded-lg text-xs font-bold text-[#2F2B3D] transition"
          >
            <Download className="w-3.5 h-3.5 text-[#2F2B3D]" />
            <span>Xuất Báo Cáo</span>
          </button>

          {!isReadOnly && (
            <button
              onClick={openCreateModal}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-extrabold shadow-md transition"
            >
              <Plus className="w-4 h-4" />
              <span>Giao Chỉ Tiêu KPI</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Overview Guidelines */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
          <h4 className="text-xs font-extrabold text-amber-500 uppercase mb-2">Quy chuẩn KPI DOP & Media</h4>
          <ul className="text-xxs text-slate-400 space-y-1.5 list-disc list-inside">
            <li>DOP: Concept hoàn thành, đúng brief, chất lượng mỹ thuật</li>
            <li>Media Leader: Video thô đạt chuẩn, điều phối, bảo vệ dữ liệu</li>
            <li>Video Edit: Số clip dựng hoàn thành, tỷ lệ bám brief, sửa lỗi</li>
          </ul>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
          <h4 className="text-xs font-extrabold text-amber-500 uppercase mb-2">Quy chuẩn KPI Seeding</h4>
          <ul className="text-xxs text-slate-400 space-y-1.5 list-disc list-inside">
            <li>Seeding Leader: Kế hoạch, kịch bản seeding chất lượng</li>
            <li>Seeding Staff: Số comment/bài đăng chất lượng mỗi ngày</li>
            <li>Không bị xóa bài, duy trì độ hoạt động của các nick vệ tinh</li>
          </ul>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
          <h4 className="text-xs font-extrabold text-amber-500 uppercase mb-2">Quy chuẩn KPI Ads Social</h4>
          <ul className="text-xxs text-slate-400 space-y-1.5 list-disc list-inside">
            <li>Số chiến dịch ads triển khai đúng hạn</li>
            <li>Chỉ số CPA tối ưu, ROAS mang về đạt chỉ tiêu cam kết</li>
            <li>Phối hợp tốt với Media/Content tạo phễu thu hút</li>
          </ul>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
        <div className="col-span-1 sm:col-span-2 relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Tìm kiếm chỉ tiêu KPI hoặc họ tên..."
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
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-semibold text-slate-300 focus:outline-none focus:border-amber-500"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="Chờ tự đánh giá">Chờ tự đánh giá</option>
            <option value="Chờ cấp trên duyệt">Chờ cấp trên duyệt</option>
            <option value="Đã chốt điểm">Đã chốt điểm</option>
          </select>
        </div>

        <div>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-semibold text-slate-300 focus:outline-none focus:border-amber-500"
          >
            <option value="all">Tất cả tháng</option>
            {months.map(m => (
              <option key={m} value={m}>Tháng {m}</option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Recharts Visual Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/60">
          <div>
            <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-amber-500" />
              <span>
                {activeChartTab === 'compare'
                  ? `So sánh Tỷ lệ hoàn thành KPI - ${selectedMonth === 'all' ? 'Trung bình tất cả tháng' : `Tháng ${selectedMonth}`}`
                  : `Xu hướng Hiệu suất liên tháng - ${selectedStaff === 'all' ? 'Tất cả nhân sự' : selectedStaffObj?.name}`}
              </span>
            </h3>
            <p className="text-[10px] text-slate-400 mt-1">
              {activeChartTab === 'compare'
                ? 'Biểu đồ cột so sánh trực quan mức độ hoàn thành chỉ tiêu giữa các nhân viên marketing.'
                : 'Biểu đồ đường biểu diễn lịch sử thăng trầm của hiệu quả làm việc qua các chu kỳ tháng.'}
            </p>
          </div>

          {/* Toggle Switches */}
          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-850 self-start sm:self-center">
            <button
              onClick={() => setActiveChartTab('compare')}
              className={`px-3 py-1 text-[10px] font-extrabold uppercase rounded-md tracking-wide transition-all ${
                activeChartTab === 'compare'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              So sánh hiệu suất
            </button>
            <button
              onClick={() => setActiveChartTab('trend')}
              className={`px-3 py-1 text-[10px] font-extrabold uppercase rounded-md tracking-wide transition-all ${
                activeChartTab === 'trend'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Xu hướng liên tháng
            </button>
          </div>
        </div>

        {/* Chart Canvas Area */}
        <div className="h-72 w-full mt-5">
          {activeChartTab === 'compare' ? (
            barChartData.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 font-bold gap-2">
                <Activity className="w-8 h-8 text-slate-700 animate-pulse" />
                <span className="text-xs text-slate-500">Không có dữ liệu KPI khớp với bộ lọc tháng & trạng thái</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 15, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="#64748b"
                    fontSize={10}
                    fontWeight="bold"
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={10}
                    fontWeight="bold"
                    domain={[0, 140]}
                    tickFormatter={(val) => `${val}%`}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomBarTooltip />} cursor={{ fill: '#0f172a', opacity: 0.3 }} />
                  <ReferenceLine
                    y={100}
                    stroke="#10b981"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    label={{
                      value: 'Đạt chỉ tiêu (100%)',
                      position: 'insideBottomLeft',
                      fill: '#10b981',
                      fontSize: 8,
                      fontWeight: 'bold',
                      offset: 8
                    }}
                  />
                  <Bar dataKey="Tỷ lệ hoàn thành (%)" radius={[4, 4, 0, 0]} barSize={36}>
                    {barChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getMemberColor(index)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              {isSingleStaff ? (
                <AreaChart data={trendChartData} margin={{ top: 15, right: 10, left: -20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey="month"
                    stroke="#64748b"
                    fontSize={10}
                    fontWeight="bold"
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={10}
                    fontWeight="bold"
                    domain={[0, 140]}
                    tickFormatter={(val) => `${val}%`}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTrendTooltip />} />
                  <ReferenceLine
                    y={100}
                    stroke="#10b981"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    label={{
                      value: 'Mục tiêu 100%',
                      position: 'insideBottomLeft',
                      fill: '#10b981',
                      fontSize: 8,
                      fontWeight: 'bold',
                      offset: 8
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="Tỷ lệ hoàn thành (%)"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRate)"
                    name={selectedStaffObj?.name || 'Nhân sự'}
                  />
                </AreaChart>
              ) : (
                <LineChart data={trendChartData} margin={{ top: 15, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey="month"
                    stroke="#64748b"
                    fontSize={10}
                    fontWeight="bold"
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={10}
                    fontWeight="bold"
                    domain={[0, 140]}
                    tickFormatter={(val) => `${val}%`}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTrendTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconSize={10}
                    iconType="circle"
                    wrapperStyle={{ fontSize: '9px', fontWeight: 'bold', color: '#94a3b8' }}
                  />
                  <ReferenceLine
                    y={100}
                    stroke="#475569"
                    strokeDasharray="3 3"
                    strokeWidth={1}
                  />
                  {members.map((m, index) => (
                    <Line
                      key={m.id}
                      type="monotone"
                      dataKey={m.name}
                      stroke={getMemberColor(index)}
                      strokeWidth={2}
                      dot={{ r: 3, strokeWidth: 1 }}
                      activeDot={{ r: 5 }}
                      connectNulls
                    />
                  ))}
                  <Line
                    type="monotone"
                    dataKey="Độ trung bình team"
                    stroke="#ffffff"
                    strokeDasharray="5 5"
                    strokeWidth={1.5}
                    dot={false}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Main KPI Table & Cards */}
      <div className="mt-6">
        {/* Mobile Responsive Cards (shown on < md) */}
        <div className="block md:hidden space-y-4">
          {filteredKpis.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center text-slate-500 font-semibold shadow-sm">
              Không tìm thấy bản ghi chỉ tiêu KPI nào phù hợp.
            </div>
          ) : (
            filteredKpis.map((k) => {
              const member = members.find(m => m.id === k.staff_id);
              return (
                <div key={k.kpi_id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-3 relative overflow-hidden transition">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono font-black text-amber-500">
                        {k.kpi_id}
                      </span>
                      <h4 className="text-xs font-black leading-tight text-white">
                        {k.kpi_name}
                      </h4>
                      <div className="text-[10px] text-slate-400 font-bold">
                        Tháng: <span className="text-slate-200">{k.evaluation_month}</span>
                      </div>
                    </div>

                    {/* Status badge */}
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${
                      k.status === 'Đã chốt điểm' ? 'text-emerald-400' : k.status === 'Chờ cấp trên duyệt' ? 'text-amber-400' : 'text-slate-400'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        k.status === 'Đã chốt điểm' ? 'bg-emerald-400' : 'bg-amber-400'
                      }`} />
                      {k.status}
                    </span>
                  </div>

                  <div className="border-t border-slate-800 pt-2.5 grid grid-cols-2 gap-2 text-[10px] text-slate-400 font-bold">
                    <div>
                      <span className="text-slate-500 block text-[9px] uppercase font-extrabold">Nhân sự</span>
                      <div className="flex items-center gap-1.5 mt-1">
                        <div className="w-5 h-5 rounded-full bg-slate-800 text-slate-200 flex items-center justify-center font-bold text-[8px]">
                          {member?.name.split(' ').pop()?.slice(0, 2)}
                        </div>
                        <span className="text-white">{member?.name || 'Nhân sự cũ'}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[9px] uppercase font-extrabold font-mono">Chỉ tiêu (Mục tiêu / Đạt)</span>
                      <div className="flex items-center gap-1.5 mt-1.5 font-bold">
                        <span className="text-slate-300">{k.target_value}</span>
                        <span className="text-slate-600">/</span>
                        <span className="text-white">{k.actual_value}</span>
                        <span className={`px-1 rounded text-[8px] font-black ${
                          k.completion_rate >= 100 ? 'bg-emerald-500/10 text-emerald-400' : k.completion_rate >= 80 ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'
                        }`}>
                          {k.completion_rate}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {k.manager_feedback && (
                    <div className="bg-slate-950/40 border border-slate-800/80 rounded-lg p-2.5 text-[10px] text-slate-400 leading-relaxed italic">
                      <strong className="text-[9px] font-black text-slate-500 uppercase not-italic block mb-0.5">Nhận xét:</strong>
                      {k.manager_feedback}
                    </div>
                  )}

                  <div className="border-t border-slate-800 pt-2.5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      <span className="text-slate-500 text-[9px] uppercase font-extrabold">Điểm số:</span>
                      <span className="text-amber-400 font-black text-xs">{k.kpi_score}đ</span>
                    </div>

                    {!isReadOnly && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openEditModal(k)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition"
                          title="Chỉnh sửa"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteKpi(k.kpi_id)}
                          className="p-1.5 bg-red-950/20 hover:bg-red-900/30 text-red-400 border border-red-900/40 rounded-lg transition"
                          title="Xóa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop Table View (hidden on < md) */}
        <div className="hidden md:block bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/60 border-b border-slate-800 text-[10px] uppercase tracking-wider font-extrabold text-slate-400">
                  <th className="p-4">Mã KPI</th>
                  <th className="p-4">Nhân sự</th>
                  <th className="p-4">Tháng</th>
                  <th className="p-4">Chỉ tiêu KPI được giao</th>
                  <th className="p-4 text-center">Mục tiêu</th>
                  <th className="p-4 text-center">Thực tế đạt</th>
                  <th className="p-4 text-center">Tỷ lệ</th>
                  <th className="p-4 text-center">Điểm số</th>
                  <th className="p-4">Ý kiến Trưởng phòng</th>
                  <th className="p-4">Trạng thái</th>
                  {!isReadOnly && <th className="p-4 text-right">Thao tác</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs font-medium text-slate-300">
                {filteredKpis.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="p-8 text-center text-slate-500 font-semibold">
                      Không tìm thấy bản ghi chỉ tiêu KPI nào phù hợp.
                    </td>
                  </tr>
                ) : (
                  filteredKpis.map((k) => {
                    const member = members.find(m => m.id === k.staff_id);
                    return (
                      <tr key={k.kpi_id} className="hover:bg-slate-850/40 transition">
                        <td className="p-4 font-mono text-amber-500 font-bold">{k.kpi_id}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-slate-800 text-slate-200 flex items-center justify-center font-bold text-xxs">
                              {member?.name.split(' ').pop()?.slice(0, 2)}
                            </div>
                            <div>
                              <div className="font-extrabold text-white">{member?.name || 'Nhân sự cũ'}</div>
                              <div className="text-[10px] text-slate-500">{k.role}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-bold text-slate-400">{k.evaluation_month}</td>
                        <td className="p-4 max-w-xs">
                          <div className="font-bold text-slate-200 line-clamp-2">{k.kpi_name}</div>
                        </td>
                        <td className="p-4 text-center font-bold text-slate-400">{k.target_value}</td>
                        <td className="p-4 text-center font-bold text-white">{k.actual_value}</td>
                        <td className="p-4 text-center">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-black ${
                            k.completion_rate >= 100
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : k.completion_rate >= 80
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}>
                            {k.completion_rate}%
                          </span>
                        </td>
                        <td className="p-4 text-center font-black text-amber-400 text-sm">{k.kpi_score}đ</td>
                        <td className="p-4 max-w-xs">
                          <div className="text-xxs text-slate-400 line-clamp-2" title={k.manager_feedback}>
                            {k.manager_feedback || 'Chưa có ý kiến nhận xét.'}
                          </div>
                          {k.action_proposal && (
                            <div className="text-[9px] text-amber-500/80 mt-0.5 font-bold uppercase tracking-wider">
                              ↳ Đề xuất: {k.action_proposal}
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${
                            k.status === 'Đã chốt điểm'
                              ? 'text-emerald-400'
                              : k.status === 'Chờ cấp trên duyệt'
                              ? 'text-amber-400'
                              : 'text-slate-400'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              k.status === 'Đã chốt điểm' ? 'bg-emerald-400' : 'bg-amber-400'
                            }`} />
                            {k.status}
                          </span>
                        </td>
                        {!isReadOnly && (
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openEditModal(k)}
                                className="p-1.5 bg-white hover:bg-[#F4F5FA] border border-[#E6E6E8] text-[#2F2B3D] rounded transition"
                                title="Chỉnh sửa chỉ tiêu"
                              >
                                <Edit className="w-3.5 h-3.5 text-[#2F2B3D]" />
                              </button>
                              <button
                                onClick={() => handleDeleteKpi(k.kpi_id)}
                                className="p-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded transition"
                                title="Xóa đánh giá"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-red-600" />
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
      </div>

      {/* KPI Giao Việc Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white border border-[#E6E6E8] rounded-2xl max-w-3xl w-full p-6 text-[#2F2B3D] shadow-[0_10px_30px_rgba(47,43,61,0.2)]">
            <h3 className="text-base font-black text-[#2F2B3D] uppercase tracking-wide border-b border-[#E6E6E8] pb-3 mb-4">
              {editingKpi ? 'Cập Nhật Đánh Giá KPI' : 'Giao Chỉ Tiêu KPI Mới'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xxs text-[#5D596C] font-extrabold uppercase block mb-1">Nhân Sự Giao Việc</label>
                  <select
                    value={formData.staff_id}
                    onChange={(e) => handleStaffChange(e.target.value)}
                    disabled={!!editingKpi}
                    className="w-full bg-[#F8F9FA] border border-[#E6E6E8] rounded px-2.5 py-1.5 text-xs text-[#2F2B3D] focus:outline-none focus:border-[#E04B1C] transition"
                  >
                    {members.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xxs text-[#5D596C] font-extrabold uppercase block mb-1">Tháng Đánh Giá</label>
                  <input
                    type="text"
                    value={formData.evaluation_month}
                    onChange={(e) => setFormData({ ...formData, evaluation_month: e.target.value })}
                    className="w-full bg-[#F8F9FA] border border-[#E6E6E8] rounded px-2.5 py-1.5 text-xs text-[#2F2B3D] focus:outline-none focus:border-[#E04B1C] transition"
                    placeholder="e.g. 06/2026"
                  />
                </div>
              </div>

              <div>
                <label className="text-xxs text-[#5D596C] font-extrabold uppercase block mb-1">Tên Chỉ Tiêu KPI</label>
                <textarea
                  value={formData.kpi_name}
                  onChange={(e) => setFormData({ ...formData, kpi_name: e.target.value })}
                  className="w-full bg-[#F8F9FA] border border-[#E6E6E8] rounded p-2 text-xs text-[#2F2B3D] focus:outline-none focus:border-[#E04B1C] transition"
                  rows={2}
                  placeholder="e.g. Dựng video review túi Hermes đạt chuẩn chất lượng..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xxs text-[#5D596C] font-extrabold uppercase block mb-1">Mục Tiêu Đề Ra</label>
                  <input
                    type="text"
                    value={formData.target_value}
                    onChange={(e) => setFormData({ ...formData, target_value: e.target.value })}
                    className="w-full bg-[#F8F9FA] border border-[#E6E6E8] rounded px-2.5 py-1.5 text-xs text-[#2F2B3D] focus:outline-none focus:border-[#E04B1C] transition"
                    placeholder="e.g. 12 video"
                    required
                  />
                </div>

                <div>
                  <label className="text-xxs text-[#5D596C] font-extrabold uppercase block mb-1">Kết Quả Thực Tế Đạt</label>
                  <input
                    type="text"
                    value={formData.actual_value}
                    onChange={(e) => setFormData({ ...formData, actual_value: e.target.value })}
                    className="w-full bg-[#F8F9FA] border border-[#E6E6E8] rounded px-2.5 py-1.5 text-xs text-[#2F2B3D] focus:outline-none focus:border-[#E04B1C] transition"
                    placeholder="e.g. 11 video"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xxs text-[#5D596C] font-extrabold uppercase block mb-1">Tỷ Lệ Hoàn Thành (%)</label>
                  <input
                    type="number"
                    value={formData.completion_rate}
                    onChange={(e) => setFormData({ ...formData, completion_rate: Number(e.target.value) })}
                    className="w-full bg-[#F8F9FA] border border-[#E6E6E8] rounded px-2.5 py-1.5 text-xs text-[#2F2B3D] focus:outline-none focus:border-[#E04B1C] transition"
                    min="0"
                    max="200"
                  />
                </div>

                <div>
                  <label className="text-xxs text-[#5D596C] font-extrabold uppercase block mb-1">Điểm KPI (Thang 100)</label>
                  <input
                    type="number"
                    value={formData.kpi_score}
                    onChange={(e) => setFormData({ ...formData, kpi_score: Number(e.target.value) })}
                    className="w-full bg-[#F8F9FA] border border-[#E6E6E8] rounded px-2.5 py-1.5 text-xs text-[#2F2B3D] focus:outline-none focus:border-[#E04B1C] transition"
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              <div>
                <label className="text-xxs text-[#5D596C] font-extrabold uppercase block mb-1">Đề xuất khen thưởng/phạt/đào tạo</label>
                <select
                  value={formData.action_proposal}
                  onChange={(e) => setFormData({ ...formData, action_proposal: e.target.value })}
                  className="w-full bg-[#F8F9FA] border border-[#E6E6E8] rounded px-2.5 py-1.5 text-xs text-[#2F2B3D] focus:outline-none focus:border-[#E04B1C] transition"
                >
                  <option value="Giữ vững phong độ">Giữ vững phong độ</option>
                  <option value="Thưởng nóng hiệu suất">Thưởng nóng hiệu suất</option>
                  <option value="Nhắc nhở chậm deadline">Nhắc nhở chậm deadline</option>
                  <option value="Hỗ trợ đào tạo chuyên môn">Hỗ trợ đào tạo chuyên môn</option>
                  <option value="Đề xuất tăng lương">Đề xuất tăng lương</option>
                </select>
              </div>

              <div>
                <label className="text-xxs text-[#5D596C] font-extrabold uppercase block mb-1">Nhận Xét của Trưởng Phòng</label>
                <textarea
                  value={formData.manager_feedback}
                  onChange={(e) => setFormData({ ...formData, manager_feedback: e.target.value })}
                  className="w-full bg-[#F8F9FA] border border-[#E6E6E8] rounded p-2 text-xs text-[#2F2B3D] focus:outline-none focus:border-[#E04B1C] transition"
                  rows={2}
                  placeholder="Ghi nhận phản hồi..."
                />
              </div>

              <div>
                <label className="text-xxs text-[#5D596C] font-extrabold uppercase block mb-1">Trạng Thế Đánh Giá</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full bg-[#F8F9FA] border border-[#E6E6E8] rounded px-2.5 py-1.5 text-xs text-[#2F2B3D] focus:outline-none focus:border-[#E04B1C] transition"
                >
                  <option value="Chờ tự đánh giá">Chờ tự đánh giá</option>
                  <option value="Chờ cấp trên duyệt">Chờ cấp trên duyệt</option>
                  <option value="Đã chốt điểm">Đã chốt điểm</option>
                </select>
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
