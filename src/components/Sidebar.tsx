/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  LayoutDashboard,
  UsersRound,
  CheckSquare,
  Calendar,
  Megaphone,
  TrendingUp,
  BarChart3,
  Award,
  Lightbulb,
  FolderClosed,
  ShieldCheck,
  ChevronDown,
  Phone,
  MapPin,
  Mail,
  Settings,
  Target,
  BookOpen
} from 'lucide-react';
import { UserRole } from '../types';

interface SidebarProps {
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
}

export default function Sidebar({
  activeMenu,
  setActiveMenu,
  activeRole,
  setActiveRole,
}: SidebarProps) {
  const [showRoleDropdown, setShowRoleDropdown] = React.useState(false);

  const menuSections = [
    {
      title: "1. Chiến Lược & Kế Hoạch",
      items: [
        { id: 'campaigns', label: 'Campaign Nội Bộ', icon: Megaphone },
        { id: 'plans', label: 'Kế Hoạch Định Kỳ MKT', icon: Target },
        { id: 'guide', label: 'Hướng Dẫn Onboarding', icon: BookOpen },
      ]
    },
    {
      title: "2. Triển Khai Hàng Ngày",
      items: [
        { id: 'tasks', label: 'Quản Lý Công Việc', icon: CheckSquare },
        { id: 'calendar', label: 'Lịch Sản Xuất MKT', icon: Calendar },
        { id: 'resources', label: 'Thư Viện Tài Nguyên', icon: FolderClosed },
      ]
    },
    {
      title: "3. Hiệu Suất & Đánh Giá",
      items: [
        { id: 'dashboard', label: 'Dashboard Tổng Quan', icon: LayoutDashboard },
        { id: 'reports', label: 'Báo Cáo Công Việc', icon: BarChart3 },
        { id: 'kpis', label: 'Quản Lý KPI Nhân Sự', icon: TrendingUp },
        { id: 'evaluations', label: 'Đánh Giá Hiệu Suất', icon: Award },
      ]
    },
    {
      title: "4. Sáng Tạo & Hệ Thống",
      items: [
        { id: 'proposals', label: 'Đề Xuất Phương Án', icon: Lightbulb },
        { id: 'team', label: 'Nhân Sự Marketing', icon: UsersRound },
        { id: 'settings', label: 'Cấu Hình Webhooks', icon: Settings },
      ]
    }
  ];

  const roles: UserRole[] = ['Admin', 'Manager', 'Staff', 'Viewer'];

  return (
    <div id="sidebar-container" className="flex flex-col h-full bg-white text-[#2F2B3D] w-64 border-r border-[#E6E6E8] flex-shrink-0 select-none shadow-[0_2px_14px_rgba(47,43,61,0.05)]">
      {/* Brand Logo & Slogan */}
      <div id="brand-header" className="p-4 flex flex-col items-center border-b border-[#F4F5FA] bg-white">
        <div className="flex items-center justify-center mb-2 w-full">
          <img 
            src="https://mkt.fugalo.vn/logo-banner.png" 
            alt="FUGALO Logo" 
            className="h-10 object-contain"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="text-[8px] bg-[#E04B1C]/10 text-[#E04B1C] border border-[#E04B1C]/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-extrabold">
          PHÒNG MARKETING NỘI BỘ
        </div>
      </div>

      {/* Role Switcher */}
      <div id="role-switcher-section" className="px-4 py-3 border-b border-[#F4F5FA] bg-[#F4F5FA]/40 relative">
        <label className="text-[9px] text-[#8C8995] font-bold uppercase tracking-wider block mb-1">
          Quyền truy cập (Phòng MKT)
        </label>
        <button
          onClick={() => setShowRoleDropdown(!showRoleDropdown)}
          className="w-full flex items-center justify-between px-3 py-1.5 bg-white hover:bg-slate-50 text-xs font-bold rounded border border-slate-200 text-[#2F2B3D] transition shadow-sm"
        >
          <div className="flex items-center gap-1.5 text-[#E04B1C]">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-[#2F2B3D]">{activeRole === 'Manager' ? 'Trưởng Phòng (Manager)' : activeRole === 'Admin' ? 'Admin' : activeRole === 'Staff' ? 'Nhân Viên' : 'Chỉ Xem (Viewer)'}</span>
          </div>
          <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${showRoleDropdown ? 'rotate-180' : ''}`} />
        </button>

        {showRoleDropdown && (
          <div className="absolute left-4 right-4 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-50 overflow-hidden">
            {roles.map((role) => (
              <button
                key={role}
                onClick={() => {
                  setActiveRole(role);
                  setShowRoleDropdown(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs font-semibold transition duration-150 ${
                  activeRole === role
                    ? 'bg-[#E04B1C]/10 text-[#E04B1C] border-l-4 border-[#E04B1C]'
                    : 'text-slate-700 hover:bg-[#F4F5FA]'
                }`}
              >
                {role === 'Admin' && 'Admin (Ban Giám Đốc)'}
                {role === 'Manager' && 'Manager (Trưởng Phòng)'}
                {role === 'Staff' && 'Staff (Nhân Viên Team)'}
                {role === 'Viewer' && 'Viewer (Chỉ Xem)'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Menu Navigation */}
      <div id="sidebar-menu" className="flex-1 overflow-y-auto py-4 space-y-4 px-3">
        {menuSections.map((section) => (
          <div key={section.title} className="space-y-1">
            <div className="px-3 py-1 text-[9px] font-black text-[#8C8995] uppercase tracking-wider font-mono">
              {section.title}
            </div>
            {section.items.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeMenu === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveMenu(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-bold rounded-lg transition duration-150 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#E04B1C] to-[#F46336] text-white font-extrabold shadow-[0_4px_12px_0_rgba(224,75,28,0.3)]'
                      : 'text-[#2F2B3D]/70 hover:bg-[#F4F5FA] hover:text-[#2F2B3D]'
                  }`}
                >
                  <IconComponent className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-[#8C8995]'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
