/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Bell, AlertTriangle, ShieldCheck, CheckCircle, LogIn, UserPlus, Key, LogOut, Loader2, Database, Shield } from 'lucide-react';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import TeamView from './components/TeamView';
import TasksView from './components/TasksView';
import CalendarView from './components/CalendarView';
import CampaignsView from './components/CampaignsView';
import KpiView from './components/KpiView';
import ReportsView from './components/ReportsView';
import EvaluationsView from './components/EvaluationsView';
import ProposalsView from './components/ProposalsView';
import ResourcesView from './components/ResourcesView';
import SettingsView from './components/SettingsView';
import WeeklyPlansTab from './components/WeeklyPlansTab';
import GuideView from './components/GuideView';

import { auth } from './firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { loadCollection, syncCollection } from './firebaseSync';

import {
  teamMembers as initialTeamMembers,
  sampleTasks as initialTasks,
  sampleProductionSchedules as initialSchedules,
  sampleCampaigns as initialCampaigns,
  sampleKpis as initialKpis,
  sampleReports as initialReports,
  sampleEvaluations as initialEvaluations,
  sampleProposals as initialProposals,
  sampleResources as initialResources,
  sampleWebhooks,
  samplePlans,
  sampleDailyLogs,
} from './data/mockData';

import {
  TeamMember,
  Task,
  ProductionSchedule,
  Campaign,
  KpiAssignment,
  WorkReport,
  PersonnelEvaluation,
  Proposal,
  Resource,
  UserRole,
  WebhookConfig,
  WorkPlan,
  DailyLog
} from './types';

export default function App() {
  const [activeMenu, setActiveMenu] = useState<string>('dashboard');
  const [activeRole, setActiveRole] = useState<UserRole>('Viewer');

  // Real-time notification menu state
  const [showNotifications, setShowNotifications] = useState(false);

  // Firebase Auth states
  const [user, setUser] = useState<any | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dbLoaded, setDbLoaded] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Form states for login/signup screen
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [showEmailLogin, setShowEmailLogin] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [fullNameInput, setFullNameInput] = useState('');
  const [registerRole, setRegisterRole] = useState('Chuyên viên Marketing');
  const [registerGroup, setRegisterGroup] = useState<'Quản lý' | 'DOP' | 'Media' | 'Edit Video' | 'Photo' | 'Seeding' | 'Ads Social'>('Media');

  // Core Reactive States
  const [members, setMembers] = useState<TeamMember[]>(initialTeamMembers);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [schedules, setSchedules] = useState<ProductionSchedule[]>(initialSchedules);
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [kpis, setKpis] = useState<KpiAssignment[]>(initialKpis);
  const [reports, setReports] = useState<WorkReport[]>(initialReports);
  const [evaluations, setEvaluations] = useState<PersonnelEvaluation[]>(initialEvaluations);
  const [proposals, setProposals] = useState<Proposal[]>(initialProposals);
  const [resources, setResources] = useState<Resource[]>(initialResources);
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>(sampleWebhooks);
  const [plans, setPlans] = useState<WorkPlan[]>(samplePlans);
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>(sampleDailyLogs);

  // 1. Firebase Authentication State Observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setSyncing(true);
        // Automatically determine userRole based on email if matched with team
        const email = currentUser.email?.toLowerCase();
        if (email === 'an.hv@fugalo.vn' || email === 'anhovan.fu@gmail.com' || email?.startsWith('an.hv') || email?.startsWith('anhovan')) {
          setActiveRole('Manager');
        } else {
          setActiveRole('Staff');
        }

        // Fetch Firestore data or seed it if empty
        try {
          const loadedMembers = await loadCollection<TeamMember>('members', initialTeamMembers);
          const loadedTasks = await loadCollection<Task>('tasks', initialTasks);
          const loadedSchedules = await loadCollection<ProductionSchedule>('schedules', initialSchedules);
          const loadedCampaigns = await loadCollection<Campaign>('campaigns', initialCampaigns);
          const loadedKpis = await loadCollection<KpiAssignment>('kpis', initialKpis);
          const loadedReports = await loadCollection<WorkReport>('reports', initialReports);
          const loadedEvaluations = await loadCollection<PersonnelEvaluation>('evaluations', initialEvaluations);
          const loadedProposals = await loadCollection<Proposal>('proposals', initialProposals);
          const loadedResources = await loadCollection<Resource>('resources', initialResources);
          const loadedWebhooks = await loadCollection<WebhookConfig>('webhooks', sampleWebhooks);
          const loadedPlans = await loadCollection<WorkPlan>('plans', samplePlans);
          const loadedDailyLogs = await loadCollection<DailyLog>('daily_logs', sampleDailyLogs);

          setMembers(loadedMembers);
          setTasks(loadedTasks);
          setSchedules(loadedSchedules);
          setCampaigns(loadedCampaigns);
          setKpis(loadedKpis);
          setReports(loadedReports);
          setEvaluations(loadedEvaluations);
          setProposals(loadedProposals);
          setResources(loadedResources);
          setWebhooks(loadedWebhooks);
          setPlans(loadedPlans);
          setDailyLogs(loadedDailyLogs);

          setDbLoaded(true);
        } catch (error) {
          console.error("Lỗi khi tải cơ sở dữ liệu Firebase:", error);
        } finally {
          setSyncing(false);
        }
      } else {
        setDbLoaded(false);
        setActiveRole('Viewer');
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Real-time changes syncing back to Firestore
  useEffect(() => {
    if (!dbLoaded) return;
    syncCollection('members', members);
  }, [members, dbLoaded]);

  useEffect(() => {
    if (!dbLoaded) return;
    syncCollection('tasks', tasks);
  }, [tasks, dbLoaded]);

  useEffect(() => {
    if (!dbLoaded) return;
    syncCollection('schedules', schedules);
  }, [schedules, dbLoaded]);

  useEffect(() => {
    if (!dbLoaded) return;
    syncCollection('campaigns', campaigns);
  }, [campaigns, dbLoaded]);

  useEffect(() => {
    if (!dbLoaded) return;
    syncCollection('kpis', kpis);
  }, [kpis, dbLoaded]);

  useEffect(() => {
    if (!dbLoaded) return;
    syncCollection('reports', reports);
  }, [reports, dbLoaded]);

  useEffect(() => {
    if (!dbLoaded) return;
    syncCollection('evaluations', evaluations);
  }, [evaluations, dbLoaded]);

  useEffect(() => {
    if (!dbLoaded) return;
    syncCollection('proposals', proposals);
  }, [proposals, dbLoaded]);

  useEffect(() => {
    if (!dbLoaded) return;
    syncCollection('resources', resources);
  }, [resources, dbLoaded]);

  useEffect(() => {
    if (!dbLoaded) return;
    syncCollection('webhooks', webhooks);
  }, [webhooks, dbLoaded]);

  useEffect(() => {
    if (!dbLoaded) return;
    syncCollection('plans', plans);
  }, [plans, dbLoaded]);

  useEffect(() => {
    if (!dbLoaded) return;
    syncCollection('daily_logs', dailyLogs);
  }, [dailyLogs, dbLoaded]);

  // Auth helper methods
  const handleGoogleLogin = async () => {
    setAuthError(null);
    setAuthLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      const result = await signInWithPopup(auth, provider);
      const currentUser = result.user;
      
      if (currentUser && currentUser.email) {
        const emailVal = currentUser.email;
        const memberId = emailVal.split('@')[0].replace('.', '_').replace('-', '_');
        const isManager = emailVal.toLowerCase() === 'an.hv@fugalo.vn' || emailVal.toLowerCase() === 'anhovan.fu@gmail.com';
        
        const newMember: TeamMember = {
          id: memberId,
          name: currentUser.displayName || emailVal.split('@')[0].toUpperCase(),
          role: isManager ? 'Trưởng Phòng MKT' : 'Chuyên viên Marketing',
          email: emailVal,
          phone: 'Chưa cập nhật',
          specialist_group: isManager ? 'Quản lý' : 'Media',
          manager_id: 'an_hv',
          main_task: 'Tài khoản đăng nhập tự động bằng Google.',
          permissions: isManager ? ['Tất cả quyền hạn'] : ['Cập nhật tiến độ task', 'Tải lên tài nguyên'],
          responsibilities: isManager ? ['Quản lý toàn bộ hoạt động marketing', 'Duyệt đề xuất và KPI'] : ['Thực hiện và hỗ trợ các hoạt động của nhóm chuyên môn.'],
          personal_kpis: ['Chủ động đề xuất cải thiện định kỳ', 'Hoàn thành đúng hạn các đầu việc giao'],
          tasks_in_progress: 0,
          tasks_completed: 0,
          tasks_overdue: 0,
          completion_rate: 0,
          performance_score: 90,
          notes: 'Đăng nhập bảo mật qua Google.'
        };

        setMembers(prev => {
          const exists = prev.some(m => m.email.toLowerCase() === emailVal.toLowerCase());
          if (exists) return prev;
          return [...prev, newMember];
        });
      }
    } catch (error: any) {
      console.error("Google login error:", error);
      if (error.code === 'auth/popup-blocked') {
        setAuthError("Trình duyệt đã chặn popup. Hãy cho phép hiển thị popup hoặc dùng email.");
      } else {
        setAuthError("Lỗi kết nối tài khoản Google: " + error.message);
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);
    try {
      await signInWithEmailAndPassword(auth, emailInput, passwordInput);
    } catch (error: any) {
      console.error("Login failed, attempting auto-registration:", error);
      // Auto-register if the user does not exist or credentials look brand new
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        try {
          await createUserWithEmailAndPassword(auth, emailInput, passwordInput);
          
          // Auto register/seed a team profile if they do not match any existing members
          const memberId = emailInput.split('@')[0].replace('.', '_').replace('-', '_');
          const matchedSeed = initialTeamMembers.find(m => m.email.toLowerCase() === emailInput.toLowerCase());
          
          if (!matchedSeed) {
            const newMember: TeamMember = {
              id: memberId,
              name: emailInput.split('@')[0].toUpperCase(),
              role: 'Chuyên viên Marketing',
              email: emailInput,
              phone: 'Chưa cập nhật',
              specialist_group: 'Media',
              manager_id: 'an_hv',
              main_task: 'Tài khoản tự động khởi tạo bằng Gmail.',
              permissions: ['Cập nhật tiến độ task', 'Tải lên tài nguyên'],
              responsibilities: ['Thực hiện và hỗ trợ các hoạt động của nhóm chuyên môn.'],
              personal_kpis: ['Chủ động đề xuất cải thiện định kỳ', 'Hoàn thành đúng hạn các đầu việc giao'],
              tasks_in_progress: 0,
              tasks_completed: 0,
              tasks_overdue: 0,
              completion_rate: 0,
              performance_score: 80,
              notes: 'Tự động kích hoạt qua đăng nhập Gmail.'
            };

            setMembers(prev => {
              const exists = prev.some(m => m.email.toLowerCase() === emailInput.toLowerCase());
              if (exists) return prev;
              return [...prev, newMember];
            });
          }
        } catch (regError: any) {
          console.error("Auto-registration failed:", regError);
          let msg = "Lỗi đăng ký tự động: ";
          if (regError.code === 'auth/weak-password') {
            msg = "Mật khẩu quá yếu (yêu cầu tối thiểu 6 ký tự).";
          } else {
            msg += regError.message;
          }
          setAuthError(msg);
        }
      } else if (error.code === 'auth/wrong-password') {
        setAuthError("Mật khẩu không chính xác cho tài khoản này.");
      } else if (error.code === 'auth/invalid-email') {
        setAuthError("Định dạng email không hợp lệ.");
      } else {
        setAuthError("Không thể đăng nhập: " + error.message);
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
    }
  };


  // Real-time notifications calculation
  const notifications = useMemo(() => {
    const list: { id: string; title: string; message: string; type: 'overdue' | 'needs_correction'; taskId: string; date: string }[] = [];
    
    tasks.forEach(t => {
      // Filter based on activeRole
      // If Staff, only show alerts for typical staff assignees
      if (activeRole === 'Staff') {
        const isStaffTask = t.assignee === 'phuong_mkt' || t.assignee === 'linh_edit' || t.assignee === 'tung_media' || t.collaborators.includes('phuong_mkt');
        if (!isStaffTask) return;
      }
      
      if (t.status === 'Trễ hạn') {
        list.push({
          id: `notif-overdue-${t.task_id}`,
          title: `⚠️ Trễ hạn: ${t.task_id}`,
          message: `Công việc "${t.task_name}" đã quá hạn chốt (${t.deadline})`,
          type: 'overdue',
          taskId: t.task_id,
          date: t.deadline
        });
      }
      if (t.status === 'Cần sửa') {
        list.push({
          id: `notif-fix-${t.task_id}`,
          title: `🔧 Cần sửa: ${t.task_id}`,
          message: `Công việc "${t.task_name}" cần chỉnh sửa gấp!`,
          type: 'needs_correction',
          taskId: t.task_id,
          date: new Date().toISOString().split('T')[0]
        });
      }
    });

    return list;
  }, [tasks, activeRole]);

  // State to support high-fidelity PDF print layout
  const [printData, setPrintData] = useState<{ type: 'report' | 'evaluation'; data: any } | null>(null);

  // Automatically recalculate Team Member statistics when tasks or evaluations change
  const computedMembers = useMemo(() => {
    return members.map((member) => {
      const memberTasks = tasks.filter((t) => t.assignee === member.id);
      const inProgress = memberTasks.filter((t) => t.status === 'Đang làm' || t.status === 'Chưa làm' || t.status === 'Chờ duyệt' || t.status === 'Cần sửa').length;
      const completed = memberTasks.filter((t) => t.status === 'Hoàn thành').length;
      const overdue = memberTasks.filter((t) => t.status === 'Trễ hạn').length;
      
      const total = inProgress + completed + overdue;
      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

      // Get performance score from the latest evaluation of this month, or default
      const latestEval = evaluations
        .filter((ev) => ev.staff_id === member.id)
        .sort((a, b) => b.month.localeCompare(a.month))[0];

      const score = latestEval ? latestEval.total_score : member.performance_score;

      return {
        ...member,
        tasks_in_progress: inProgress,
        tasks_completed: completed,
        tasks_overdue: overdue,
        completion_rate: completionRate,
        performance_score: score,
      };
    });
  }, [members, tasks, evaluations]);

  // Automatically update KPI assignments' completion_rate and kpi_score based on completed tasks
  useEffect(() => {
    setKpis(prevKpis => {
      let updated = false;
      const nextKpis = prevKpis.map(kpi => {
        const staffTasks = tasks.filter(t => t.assignee === kpi.staff_id);
        if (staffTasks.length === 0) return kpi;

        // Check tasks for this specific evaluation month (MM/YYYY)
        const [m, y] = kpi.evaluation_month.split('/');
        const targetMonthPrefix = `${y}-${m}`; // e.g., "2026-06"

        const monthlyTasks = staffTasks.filter(t => {
          return (t.start_date && t.start_date.startsWith(targetMonthPrefix)) || 
                 (t.deadline && t.deadline.startsWith(targetMonthPrefix));
        });

        // If no monthly tasks found, fall back to all of their tasks
        const tasksToUse = monthlyTasks.length > 0 ? monthlyTasks : staffTasks;

        const completedCount = tasksToUse.filter(t => t.status === 'Hoàn thành').length;
        const totalCount = tasksToUse.length;
        const calculatedRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 100;
        const calculatedScore = Math.min(100, calculatedRate);

        if (kpi.completion_rate !== calculatedRate || kpi.kpi_score !== calculatedScore) {
          updated = true;
          return {
            ...kpi,
            completion_rate: calculatedRate,
            kpi_score: calculatedScore,
            actual_value: `Hoàn thành ${completedCount}/${totalCount} công việc thực tế`
          };
        }
        return kpi;
      });

      return updated ? nextKpis : prevKpis;
    });
  }, [tasks]);

  // Export as CSV/Excel simulation helper
  const handleExportData = (dataType: string, data: any[]) => {
    if (data.length === 0) {
      alert('Không có dữ liệu để xuất!');
      return;
    }
    
    // Simple CSV conversion
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','), // header row
      ...data.map(row => 
        headers.map(fieldName => {
          const val = row[fieldName];
          const stringVal = val === undefined || val === null ? '' : typeof val === 'object' ? JSON.stringify(val) : String(val);
          return `"${stringVal.replace(/"/g, '""')}"`;
        }).join(',')
      )
    ];
    
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Fugalo_${dataType}_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // High-fidelity print handler
  const handlePrint = (type: 'report' | 'evaluation', data: any) => {
    setPrintData({ type, data });
    setTimeout(() => {
      window.print();
      setPrintData(null);
    }, 150);
  };

  // Webhook notification trigger logic for tasks ("Trễ hạn" & "Cần sửa")
  const prevTasksRef = React.useRef<Task[]>([]);

  const triggerTaskWebhook = async (task: Task, oldStatus: string, newStatus: string) => {
    try {
      const assigneeMember = members.find(m => m.id === task.assignee);
      if (!assigneeMember) return;

      const group = assigneeMember.specialist_group;
      const webhookConfig = webhooks.find(wh => wh.groupName === group);
      if (!webhookConfig || !webhookConfig.isActive || !webhookConfig.webhookUrl) {
        console.log(`Không có webhook kích hoạt cho nhóm chuyên môn: ${group}`);
        return;
      }

      const emoji = newStatus === 'Trễ hạn' ? '🔴' : '🟡';
      const titleText = newStatus === 'Trễ hạn' ? 'CÔNG VIỆC TRỄ HẠN' : 'CÔNG VIỆC CẦN SỬA';
      
      const messageText = `${emoji} *THÔNG BÁO ${titleText}* ${emoji}\n\n` +
        `• *Công việc:* ${task.task_name}\n` +
        `• *Mã:* ${task.task_id}\n` +
        `• *Nhân sự phụ trách:* ${assigneeMember.name} (Nhóm: ${group})\n` +
        `• *Độ ưu tiên:* ${task.priority}\n` +
        `• *Hạn chót:* ${task.deadline || 'Không có'}\n` +
        `• *Trạng thái cũ:* ${oldStatus}\n` +
        `• *Trạng thái mới:* ${newStatus}\n` +
        (task.feedback_notes ? `• *Ý kiến phản hồi:* _${task.feedback_notes}_\n` : '') +
        (task.description ? `• *Mô tả công việc:* ${task.description.slice(0, 150)}${task.description.length > 150 ? '...' : ''}\n` : '') +
        `\n*Vui lòng truy cập hệ thống để kiểm tra và xử lý công việc kịp thời!*`;

      const payload = { text: messageText };

      await fetch(webhookConfig.webhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      console.log(`Đã gửi webhook thông báo ${newStatus} thành công cho nhóm ${group}.`);
    } catch (err) {
      console.error("Lỗi khi gửi thông báo Webhook:", err);
    }
  };

  useEffect(() => {
    if (!dbLoaded) return;
    if (prevTasksRef.current.length === 0) {
      prevTasksRef.current = tasks;
      return;
    }

    const prevTasksMap = new Map<string, Task>(prevTasksRef.current.map(t => [t.task_id, t]));
    
    tasks.forEach(task => {
      const prevTask = prevTasksMap.get(task.task_id);
      
      if (prevTask) {
        if (prevTask.status !== task.status) {
          const newStatus = task.status;
          if (newStatus === 'Trễ hạn' || newStatus === 'Cần sửa') {
            triggerTaskWebhook(task, prevTask.status, newStatus);
          }
        }
      } else {
        if (task.status === 'Trễ hạn' || task.status === 'Cần sửa') {
          triggerTaskWebhook(task, 'N/A', task.status);
        }
      }
    });

    prevTasksRef.current = tasks;
  }, [tasks, dbLoaded, webhooks, members]);

  const renderActiveView = () => {
    // Bảo vệ các view riêng tư dựa trên vai trò người dùng (activeRole)
    const isManagerOrAdmin = activeRole === 'Admin' || activeRole === 'Manager';
    const protectedMenus = ['kpis', 'reports', 'evaluations', 'team', 'settings'];
    
    if (protectedMenus.includes(activeMenu) && !isManagerOrAdmin) {
      // Nếu không có quyền, tự động chuyển hướng/hiển thị Dashboard
      return (
        <DashboardView
          members={computedMembers}
          tasks={tasks}
          schedules={schedules}
          campaigns={campaigns}
          kpis={kpis}
          reports={reports}
          evaluations={evaluations}
          proposals={proposals}
        />
      );
    }

    switch (activeMenu) {
      case 'guide':
        return (
          <GuideView
            activeRole={activeRole}
            setActiveMenu={setActiveMenu}
          />
        );
      case 'dashboard':
        return (
          <DashboardView
            members={computedMembers}
            tasks={tasks}
            schedules={schedules}
            campaigns={campaigns}
            kpis={kpis}
            reports={reports}
            evaluations={evaluations}
            proposals={proposals}
          />
        );
      case 'team':
        return (
          <TeamView
            members={computedMembers}
            setMembers={setMembers}
            tasks={tasks}
            evaluations={evaluations}
            activeRole={activeRole}
            onExport={() => handleExportData('Nhan_Su', computedMembers)}
          />
        );
      case 'tasks':
        return (
          <TasksView
            tasks={tasks}
            setTasks={setTasks}
            members={computedMembers}
            campaigns={campaigns}
            activeRole={activeRole}
            onExport={() => handleExportData('Cong_Viec', tasks)}
            currentUserEmail={user?.email}
            plans={plans}
            setPlans={setPlans}
            dailyLogs={dailyLogs}
            setDailyLogs={setDailyLogs}
          />
        );
      case 'calendar':
        return (
          <CalendarView
            schedules={schedules}
            setSchedules={setSchedules}
            members={computedMembers}
            activeRole={activeRole}
            onExport={() => handleExportData('Lich_San_Xuat', schedules)}
          />
        );
      case 'campaigns':
        return (
          <CampaignsView
            campaigns={campaigns}
            setCampaigns={setCampaigns}
            members={computedMembers}
            tasks={tasks}
            activeRole={activeRole}
            onExport={() => handleExportData('Campaign_Noi_Bo', campaigns)}
          />
        );
      case 'kpis':
        return (
          <KpiView
            kpis={kpis}
            setKpis={setKpis}
            members={computedMembers}
            activeRole={activeRole}
            onExport={() => handleExportData('KPI_Nhan_Su', kpis)}
          />
        );
      case 'plans':
        return (
          <WeeklyPlansTab
            plans={plans}
            setPlans={setPlans}
            tasks={tasks}
            members={computedMembers}
            activeRole={activeRole}
            currentUserEmail={user?.email}
          />
        );
      case 'reports':
        return (
          <ReportsView
            reports={reports}
            setReports={setReports}
            tasks={tasks}
            members={computedMembers}
            activeRole={activeRole}
            onExport={() => handleExportData('Bao_Cao', reports)}
            onPrint={(report) => handlePrint('report', report)}
            webhooks={webhooks}
            currentUserEmail={user?.email}
          />
        );
      case 'evaluations':
        return (
          <EvaluationsView
            evaluations={evaluations}
            setEvaluations={setEvaluations}
            members={computedMembers}
            activeRole={activeRole}
            onExport={() => handleExportData('Danh_Gia', evaluations)}
            onPrint={(evaluation) => handlePrint('evaluation', evaluation)}
          />
        );
      case 'proposals':
        return (
          <ProposalsView
            proposals={proposals}
            setProposals={setProposals}
            members={computedMembers}
            activeRole={activeRole}
            onExport={() => handleExportData('De_Xuat', proposals)}
          />
        );
      case 'resources':
        return (
          <ResourcesView
            resources={resources}
            setResources={setResources}
            members={computedMembers}
            campaigns={campaigns}
            activeRole={activeRole}
            onExport={() => handleExportData('Tai_Nguyen', resources)}
          />
        );
      case 'settings':
        return (
          <SettingsView
            webhooks={webhooks}
            setWebhooks={setWebhooks}
            activeRole={activeRole}
          />
        );
      default:
        return (
          <DashboardView
            members={computedMembers}
            tasks={tasks}
            schedules={schedules}
            campaigns={campaigns}
            kpis={kpis}
            reports={reports}
            evaluations={evaluations}
            proposals={proposals}
          />
        );
    }
  };

  if (authLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#F4F5FA] flex-col gap-4">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-[#E04B1C]/20 border-t-[#E04B1C] rounded-full animate-spin"></div>
          <Shield className="w-6 h-6 text-[#E04B1C] absolute animate-pulse" />
        </div>
        <div className="text-center">
          <p className="text-xs font-black text-[#2F2B3D] uppercase tracking-widest animate-pulse">
            Đang khởi động FUGALO Hub...
          </p>
          <span className="text-[9px] text-slate-400 font-bold uppercase mt-1 block">
            Kết nối đám mây bảo mật Google Firebase
          </span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen w-screen bg-[#F5F5FA] text-[#2F2B3D] flex items-center justify-center p-4 relative overflow-y-auto font-sans">
        {/* Soft, warm orange and purple ambient glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#E04B1C]/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="w-full max-w-md bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-[0_15px_40px_rgba(47,43,61,0.08)] relative z-10 my-8">
          <div className="flex flex-col items-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <img 
                src="https://mkt.fugalo.vn/logo-banner.png" 
                alt="FUGALO Logo" 
                className="h-12 object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="text-[10px] bg-[#E04B1C]/10 text-[#E04B1C] border border-[#E04B1C]/20 px-3.5 py-1 rounded-full font-black uppercase tracking-wider mb-3">
              Marketing Hub • Cổng Đám Mây Firebase
            </div>
            <h2 className="text-xs font-semibold text-slate-500 text-center tracking-wide leading-relaxed">
              Kết nối đám mây thông tin phòng Marketing <br/>
              <span className="text-[#E04B1C] font-extrabold text-[13px] block mt-1">Đồng bộ dữ liệu thời gian thực</span>
            </h2>
          </div>

          {authError && (
            <div className="mb-6 p-4 bg-red-50/80 border border-red-100 rounded-xl text-xs font-bold text-red-600 flex items-start gap-2.5 leading-relaxed">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-500" />
              <span>{authError}</span>
            </div>
          )}

          {/* Primary Action: Google Sign-In */}
          <div className="space-y-4">
            <button
              onClick={handleGoogleLogin}
              disabled={authLoading}
              className="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 font-extrabold py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-all duration-200 shadow-sm active:scale-[0.98] flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              {authLoading ? 'Đang kết nối...' : 'Đăng nhập bằng tài khoản Google (Gmail)'}
            </button>

            {/* Simple Separator */}
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-100"></div>
              <span className="flex-shrink mx-4 text-slate-400 font-bold text-[9px] uppercase tracking-wider">Hoặc sử dụng Email</span>
              <div className="flex-grow border-t border-slate-100"></div>
            </div>

            {/* Collapsible Email Login Option to prevent popup issues & keep UI super clean */}
            {!showEmailLogin ? (
              <button
                onClick={() => setShowEmailLogin(true)}
                className="w-full text-center text-slate-400 hover:text-[#E04B1C] font-bold text-xs py-2 transition-colors duration-200"
              >
                Nhập Email & Mật khẩu thủ công
              </button>
            ) : (
              <form onSubmit={handleLogin} className="space-y-4 animate-fadeIn">
                <div>
                  <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1 pl-1">Địa chỉ Email / Gmail</label>
                  <input
                    type="email"
                    placeholder="ten.nhanvien@gmail.com..."
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#E04B1C] focus:bg-white transition-all text-slate-800 font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1 pl-1">Mật khẩu</label>
                  <input
                    type="password"
                    placeholder="Nhập mật khẩu..."
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#E04B1C] focus:bg-white transition-all text-slate-800 font-semibold"
                    required
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowEmailLogin(false)}
                    className="flex-1 border border-slate-200 text-slate-500 hover:bg-slate-50 text-xs font-bold py-2.5 rounded-xl transition"
                  >
                    Quay lại
                  </button>
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="flex-[2] bg-gradient-to-r from-[#E04B1C] to-[#f46336] hover:from-[#f46336] hover:to-[#E04B1C] text-white font-extrabold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-all duration-300 shadow-md shadow-orange-500/10 flex items-center justify-center gap-1.5"
                  >
                    {authLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Đăng Nhập'}
                  </button>
                </div>
              </form>
            )}
          </div>

          <p className="text-[9px] text-slate-400 mt-8 text-center font-bold leading-relaxed">
            * Hệ thống tự động thiết lập quyền truy cập dựa trên tài khoản.<br/>
            Dữ liệu được đồng bộ trực tiếp lên Đám Mây Google Firebase.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div id="app-root" className="flex h-screen w-screen overflow-hidden bg-[#F4F5FA] font-sans antialiased text-[#2F2B3D]">
      {/* Sidebar navigation component */}
      <Sidebar
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        activeRole={activeRole}
        setActiveRole={setActiveRole}
        currentUserEmail={user?.email || undefined}
      />

      {/* Main interactive window with top header */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative bg-[#F4F5FA]">
        {/* Global Header Bar with Notification System */}
        <header className="bg-white border-b border-[#E6E6E8] px-6 py-3 flex items-center justify-between flex-shrink-0 z-40 relative shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-[#E04B1C] uppercase tracking-wider bg-[#E04B1C]/10 px-2.5 py-1 rounded-lg">
              Fugalo Hub
            </span>
            <span className="text-xs text-[#2F2B3D]/50 font-bold hidden sm:inline">| Hệ Thống Quản Trị Marketing Phòng Nội Bộ</span>
            {syncing && (
              <span className="text-[9px] text-[#E04B1C] bg-orange-50 border border-orange-100 font-black px-2 py-0.5 rounded-full animate-pulse flex items-center gap-1 ml-2">
                <Loader2 className="w-3 h-3 animate-spin" /> Đồng bộ Firebase...
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 relative">
            {/* Real-time Bell Icon */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-slate-500 hover:text-[#E04B1C] hover:bg-slate-50 rounded-full transition focus:outline-none"
                id="bell-icon-button"
              >
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[9px] font-black flex items-center justify-center animate-pulse">
                    {notifications.length}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Menu */}
              {showNotifications && (
                <div className="absolute right-0 mt-2.5 w-80 bg-white border border-[#E6E6E8] rounded-2xl shadow-[0_10px_30px_rgba(47,43,61,0.15)] z-50 overflow-hidden">
                  <div className="p-3 bg-slate-50 border-b border-[#E6E6E8] flex justify-between items-center">
                    <span className="text-xs font-black text-[#2F2B3D] uppercase tracking-wider">Thông báo khẩn cấp</span>
                    <span className="text-[10px] bg-[#E04B1C]/10 text-[#E04B1C] font-extrabold px-2 py-0.5 rounded-full">
                      {notifications.length} tin mới
                    </span>
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-[#E6E6E8]">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-slate-400 font-semibold text-xs">
                        🎉 Không có công việc trễ hạn hay cần sửa!
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div 
                          key={n.id}
                          onClick={() => {
                            setActiveMenu('tasks');
                            setShowNotifications(false);
                          }}
                          className="p-3 hover:bg-slate-50/75 cursor-pointer transition text-xxs leading-normal space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-[#2F2B3D]">{n.title}</span>
                            <span className="text-[8px] bg-red-50 text-red-500 font-black uppercase px-1.5 py-0.5 rounded">
                              {n.type === 'overdue' ? 'Quá hạn' : 'Cần sửa'}
                            </span>
                          </div>
                          <p className="text-slate-500 font-semibold">{n.message}</p>
                          <div className="text-[9px] text-[#E04B1C] font-bold hover:underline flex items-center gap-0.5">
                            Chuyển tới Task →
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile indicator with Firebase and Logout controls */}
            <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
              <div className="hidden lg:flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100 text-[9px] font-black uppercase tracking-wider">
                <Database className="w-3 h-3" />
                Đám Mây Live
              </div>
              
              <div className="w-8 h-8 rounded-full bg-[#E04B1C]/10 text-[#E04B1C] border border-[#E04B1C]/20 flex items-center justify-center font-black text-xs uppercase shadow-sm">
                {activeRole.slice(0, 2)}
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-black text-[#2F2B3D] leading-tight">
                  {activeRole === 'Manager' ? 'Trưởng Phòng MKT' : activeRole === 'Admin' ? 'Admin' : activeRole === 'Staff' ? 'Nhân Viên Team' : 'Khách Xem'}
                </span>
                <span className="text-[8px] text-[#8C8995] font-semibold max-w-[100px] truncate" title={user?.email}>
                  {user?.email || '@fugalo.vn'}
                </span>
              </div>
              
              <button
                onClick={handleLogout}
                title="Đăng xuất khỏi hệ thống"
                className="p-1.5 text-[#8C8995] hover:text-red-500 hover:bg-red-50 rounded-lg transition ml-1"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {renderActiveView()}
      </div>

      {/* High-fidelity PDF print layout container */}
      {printData && (
        <div id="print-container">
          <div className="flex items-center justify-between border-b-2 border-[#E04B1C] pb-4 mb-6">
            <div className="flex items-center">
              <img 
                src="https://mkt.fugalo.vn/logo-banner.png" 
                alt="FUGALO Logo" 
                className="h-12 object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="text-right">
              <div className="text-sm font-black text-[#E04B1C] tracking-wide uppercase">CÔNG TY THƯƠNG HIỆU FUGALO</div>
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">PHÒNG MARKETING NỘI BỘ</div>
              <div className="text-[8px] text-gray-400 mt-1">Đại lộ Bình Dương, Showroom FUGALO</div>
            </div>
          </div>

          {printData.type === 'report' ? (
            <div>
              {/* REPORT VIEW PRINT TEMPLATE */}
              <div className="text-center mb-6">
                <h1 className="text-lg font-black text-gray-900 tracking-tight uppercase">BÁO CÁO CÔNG VIỆC CHUYÊN MÔN</h1>
                <p className="text-[10px] text-gray-500 font-bold uppercase mt-1">Kỳ báo cáo: {printData.data.report_type} • Ngày nộp: {printData.data.report_date}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6">
                <div>
                  <div className="mb-2"><span className="text-gray-500 font-bold">Mã báo cáo:</span> <strong className="text-gray-900">{printData.data.report_id}</strong></div>
                  <div><span className="text-gray-500 font-bold">Nhân sự thực hiện:</span> <strong className="text-gray-900">{computedMembers.find(m => m.id === printData.data.reporter_id)?.name || printData.data.reporter_id}</strong></div>
                </div>
                <div>
                  <div className="mb-2"><span className="text-gray-500 font-bold">Người phê duyệt:</span> <strong className="text-gray-900">{computedMembers.find(m => m.id === printData.data.reviewer_id)?.name || 'Trưởng phòng'}</strong></div>
                  <div><span className="text-gray-500 font-bold">Trạng thái phê duyệt:</span> <span className="font-extrabold text-[#E04B1C] uppercase">{printData.data.status}</span></div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h2 className="text-xs font-black text-[#E04B1C] uppercase tracking-wider mb-2 border-b border-gray-100 pb-1">I. CÔNG VIỆC ĐÃ HOÀN THÀNH & KẾT QUẢ ĐẠT ĐƯỢC</h2>
                  <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{printData.data.completed_tasks_summary}</p>
                  <div className="mt-3 text-[10px] text-green-700 bg-green-50 p-2 rounded font-bold">🎯 Chỉ số / Kết quả ghi nhận: {printData.data.results_achieved}</div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h2 className="text-xs font-black text-[#E04B1C] uppercase tracking-wider mb-2 border-b border-gray-100 pb-1">II. KHÓ KHĂN, VƯỚNG MẮC & LÝ DO CHẬM TRỄ (NẾU CÓ)</h2>
                  <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{printData.data.issues_encountered || 'Không ghi nhận khó khăn trở ngại lớn.'}</p>
                  {printData.data.overdue_tasks_summary && printData.data.overdue_tasks_summary !== '0' && (
                    <div className="mt-3 text-[10px] text-red-700 bg-red-50 p-2 rounded font-bold">⚠️ Trễ hạn: {printData.data.overdue_tasks_summary} công việc (Lý do: {printData.data.overdue_reason})</div>
                  )}
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h2 className="text-xs font-black text-[#E04B1C] uppercase tracking-wider mb-2 border-b border-gray-100 pb-1">III. PHƯƠNG ÁN ĐỀ XUẤT & KẾ HOẠCH TIẾP THEO</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-[10px] font-bold text-gray-500 uppercase mb-1">Đề xuất cải tiến:</h3>
                      <p className="text-gray-800 whitespace-pre-wrap">{printData.data.proposed_solutions || 'Giữ vững phong độ, tiếp tục bám sát tiến độ.'}</p>
                    </div>
                    <div>
                      <h3 className="text-[10px] font-bold text-gray-500 uppercase mb-1">Kế hoạch kỳ tiếp theo:</h3>
                      <p className="text-gray-800 whitespace-pre-wrap">{printData.data.next_plans}</p>
                    </div>
                  </div>
                  {printData.data.support_needed && printData.data.support_needed !== 'Không' && (
                    <div className="mt-3 text-[10px] text-[#E04B1C] bg-orange-50 p-2 rounded font-bold">🆘 Hỗ trợ từ cấp trên yêu cầu: {printData.data.support_needed}</div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div>
              {/* EVALUATION VIEW PRINT TEMPLATE */}
              <div className="text-center mb-6">
                <h1 className="text-lg font-black text-gray-900 tracking-tight uppercase">BẢNG ĐÁNH GIÁ HIỆU SUẤT & PHÁT TRIỂN NHÂN SỰ</h1>
                <p className="text-[10px] text-gray-500 font-bold uppercase mt-1">Đánh giá kỳ: Tháng {printData.data.month}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6">
                <div>
                  <div className="mb-2"><span className="text-gray-500 font-bold">Nhân sự được đánh giá:</span> <strong className="text-gray-900">{computedMembers.find(m => m.id === printData.data.staff_id)?.name || printData.data.staff_id}</strong></div>
                  <div><span className="text-gray-500 font-bold">Chức vụ chuyên môn:</span> <strong className="text-gray-900">{computedMembers.find(m => m.id === printData.data.staff_id)?.role || 'Chuyên viên Marketing'}</strong></div>
                </div>
                <div>
                  <div className="mb-2"><span className="text-gray-500 font-bold">Người thực hiện đánh giá:</span> <strong className="text-gray-900">{computedMembers.find(m => m.id === printData.data.evaluator_id)?.name || 'Trưởng phòng Marketing'}</strong></div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 font-bold">Xếp loại hiệu suất:</span> 
                    <span className="font-extrabold text-[#E04B1C] bg-orange-50 px-2 py-0.5 border border-orange-100 rounded text-[10px] uppercase">{printData.data.classification}</span>
                  </div>
                </div>
              </div>

              {/* Points Grid table */}
              <div className="border border-gray-200 rounded-lg overflow-hidden mb-6">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-100 border-b border-gray-200">
                      <th className="p-3 font-bold text-gray-750">Tiêu chí đánh giá</th>
                      <th className="p-3 font-bold text-gray-750 text-center">Trọng số</th>
                      <th className="p-3 font-bold text-gray-750 text-right">Điểm đạt được</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="p-3"><strong>1. Hoàn thành chỉ tiêu công việc (KPI Score)</strong><p className="text-[10px] text-gray-400">Đo lường từ khối lượng & tỷ lệ hoàn thành task thực tế</p></td>
                      <td className="p-3 text-center text-gray-500">50đ</td>
                      <td className="p-3 text-right font-black text-gray-900">{printData.data.kpi_points}đ</td>
                    </tr>
                    <tr>
                      <td className="p-3"><strong>2. Tiến độ & Đúng hạn (Deadline Compliance)</strong><p className="text-[10px] text-gray-400">Đánh giá tỷ lệ trễ hạn các nhiệm vụ được giao</p></td>
                      <td className="p-3 text-center text-gray-500">20đ</td>
                      <td className="p-3 text-right font-black text-gray-900">{printData.data.deadline_points}đ</td>
                    </tr>
                    <tr>
                      <td className="p-3"><strong>3. Chất lượng & Thẩm mỹ sản phẩm (Quality)</strong><p className="text-[10px] text-gray-400">Kiểm định nghệ thuật, layout, chuẩn chỉ thương hiệu FUGALO</p></td>
                      <td className="p-3 text-center text-gray-500">15đ</td>
                      <td className="p-3 text-right font-black text-gray-900">{printData.data.quality_points}đ</td>
                    </tr>
                    <tr>
                      <td className="p-3"><strong>4. Chủ động & Sáng tạo phương án (Proactivity)</strong><p className="text-[10px] text-gray-400">Đóng góp ý kiến sáng tạo, cải tiến hiệu quả vận hành</p></td>
                      <td className="p-3 text-center text-gray-500">10đ</td>
                      <td className="p-3 text-right font-black text-gray-900">{printData.data.proactive_points}đ</td>
                    </tr>
                    <tr>
                      <td className="p-3"><strong>5. Kỷ luật, Đồng đội & Hỗ trợ (Teamwork)</strong><p className="text-[10px] text-gray-400">Tinh thần hợp tác hỗ trợ chéo giữa các ê-kíp</p></td>
                      <td className="p-3 text-center text-gray-500">5đ</td>
                      <td className="p-3 text-right font-black text-gray-900">{printData.data.teamwork_points}đ</td>
                    </tr>
                    <tr className="bg-gray-50 font-black text-sm text-[#E04B1C]">
                      <td className="p-3 uppercase text-[#E04B1C]">TỔNG ĐIỂM HIỆU SUẤT ĐẠT ĐƯỢC</td>
                      <td className="p-3 text-center text-[#E04B1C]">100đ</td>
                      <td className="p-3 text-right text-[#E04B1C] font-black text-base">{printData.data.total_score}đ</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="space-y-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h2 className="text-xs font-black text-[#E04B1C] uppercase tracking-wider mb-2 border-b border-gray-100 pb-1">I. ĐIỂM MẠNH NỔI TRỘI TRONG KỲ</h2>
                  <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{printData.data.strengths}</p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h2 className="text-xs font-black text-[#E04B1C] uppercase tracking-wider mb-2 border-b border-gray-100 pb-1">II. ĐIỂM HẠN CHẾ & CẦN CẢI THIỆN TRONG KỲ TIẾP THEO</h2>
                  <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{printData.data.weaknesses || 'Không ghi nhận điểm hạn chế đáng kể.'}</p>
                </div>

                {printData.data.proposed_action && (
                  <div className="border border-gray-200 rounded-lg p-4 bg-orange-50/10">
                    <h2 className="text-xs font-black text-[#E04B1C] uppercase tracking-wider mb-2 border-b border-gray-100 pb-1">III. ĐỀ XUẤT PHƯƠNG ÁN & HÀNH ĐỘNG CỤ THỂ</h2>
                    <p className="text-gray-900 font-extrabold leading-relaxed whitespace-pre-wrap">{printData.data.proposed_action}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Signature blocks */}
          <div className="mt-16 grid grid-cols-2 gap-12 text-center text-xs">
            <div>
              <div className="text-gray-400 uppercase font-bold text-[10px] tracking-wider mb-1">NHÂN SỰ THỰC HIỆN</div>
              <div className="text-[9px] text-gray-400 italic mb-16">(Ký và ghi rõ họ tên)</div>
              <div className="font-extrabold text-gray-800">
                {printData.type === 'report'
                  ? (computedMembers.find(m => m.id === printData.data.reporter_id)?.name || printData.data.reporter_id)
                  : (computedMembers.find(m => m.id === printData.data.staff_id)?.name || printData.data.staff_id)
                }
              </div>
            </div>
            <div>
              <div className="text-[#E04B1C] uppercase font-bold text-[10px] tracking-wider mb-1">TRƯỞNG PHÒNG MARKETING</div>
              <div className="text-[9px] text-gray-400 italic mb-16">(Phê duyệt và ký tên)</div>
              <div className="font-extrabold text-gray-900">
                {printData.type === 'report'
                  ? (computedMembers.find(m => m.id === printData.data.reviewer_id)?.name || 'An Hoàng Vân')
                  : (computedMembers.find(m => m.id === printData.data.evaluator_id)?.name || 'An Hoàng Vân')
                }
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
