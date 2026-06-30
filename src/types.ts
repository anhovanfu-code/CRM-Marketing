/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'Admin' | 'Manager' | 'Staff' | 'Viewer';

export type SpecialistGroup = 'Quản lý' | 'DOP' | 'Media' | 'Edit Video' | 'Photo' | 'Seeding' | 'Ads Social';

export interface TeamMember {
  id: string; // e.g. "an_hv"
  name: string;
  role: string; // e.g. "Marketing Manager"
  email: string;
  phone: string;
  specialist_group: SpecialistGroup;
  manager_id: string; // id of supervisor
  main_task: string;
  permissions: string[];
  responsibilities: string[];
  personal_kpis: string[];
  tasks_in_progress: number;
  tasks_completed: number;
  tasks_overdue: number;
  completion_rate: number; // percentage (0 - 100)
  performance_score: number; // calculated rating (0 - 100)
  notes: string;
}

export type BusinessCategory = 'Nội thất' | 'Phong thủy' | 'Hàng hiệu' | 'Thương hiệu chung';

export type TaskType =
  | 'Kế hoạch Marketing'
  | 'Quay video'
  | 'Chụp ảnh'
  | 'Dựng video'
  | 'Thiết kế'
  | 'Viết nội dung'
  | 'Đăng bài'
  | 'Chạy quảng cáo'
  | 'Seeding'
  | 'Báo cáo'
  | 'Họp nội bộ'
  | 'Đề xuất phương án'
  | 'Sản xuất tài nguyên'
  | 'Duyệt nội dung';

export type TaskStatus =
  | 'Chưa làm'
  | 'Đang làm'
  | 'Chờ duyệt'
  | 'Cần sửa'
  | 'Hoàn thành'
  | 'Trễ hạn'
  | 'Tạm dừng'
  | 'Hủy';

export type TaskPriority = 'Thấp' | 'Trung bình' | 'Cao' | 'Khẩn cấp';

export interface Task {
  task_id: string; // e.g., "TSK-001"
  task_name: string;
  description: string;
  business_category: BusinessCategory;
  task_type: TaskType;
  assignee: string; // TeamMember ID
  collaborators: string[]; // TeamMember IDs
  reviewer: string; // TeamMember ID (manager usually)
  start_date: string; // YYYY-MM-DD
  deadline: string; // YYYY-MM-DD
  priority: TaskPriority;
  status: TaskStatus;
  progress_percentage: number; // 0 - 100
  attachments: string[]; // urls or filenames
  expected_delivery: string;
  actual_delivery: string;
  feedback_notes: string;
  delay_reason: string;
  actual_completion_date: string; // YYYY-MM-DD
  visibility?: 'Công khai' | 'Riêng tư';
}

export type ProductionType = 'Quay' | 'Chụp' | 'Dựng' | 'Đăng' | 'Ads' | 'Seeding';

export type ProductionStatus = 'Chưa bắt đầu' | 'Đang thực hiện' | 'Đã bàn giao' | 'Đã duyệt' | 'Trễ hạn' | 'Hủy';

export interface ProductionSchedule {
  production_id: string; // e.g. "PROD-001"
  production_date: string; // YYYY-MM-DD
  business_category: BusinessCategory;
  content: string;
  production_type: ProductionType;
  assignee: string; // TeamMember ID
  location: string;
  brief_script: string;
  resources_needed: string;
  delivery_deadline: string; // YYYY-MM-DD or HH:MM
  status: ProductionStatus;
  notes: string;
}

export type CampaignStatus = 'Lên kế hoạch' | 'Đang triển khai' | 'Chờ duyệt' | 'Hoàn thành' | 'Trễ hạn' | 'Tạm dừng' | 'Hủy';

export interface Campaign {
  campaign_id: string; // e.g. "CAM-001"
  campaign_name: string;
  business_category: BusinessCategory;
  goal: string;
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  owner: string; // TeamMember ID
  participants: string[]; // TeamMember IDs
  task_ids: string[]; // List of Task IDs
  content_production: string;
  media_production: string;
  ads_deployment: string;
  seeding_deployment: string;
  estimated_budget: number;
  actual_budget: number;
  status: CampaignStatus;
  achieved_results: string;
  post_evaluation: string;
  improvement_proposals: string;
}

export interface KpiAssignment {
  kpi_id: string; // e.g. "KPI-001"
  staff_id: string; // TeamMember ID
  role: string;
  evaluation_month: string; // e.g. "06/2026"
  kpi_name: string;
  target_value: string;
  actual_value: string;
  completion_rate: number; // percentage (0 - 100)
  kpi_score: number; // score (0 - 100)
  manager_feedback: string;
  action_proposal: string; // e.g. "Thưởng nóng", "Nhắc nhở", "Hỗ trợ đào tạo"
  status: 'Chờ tự đánh giá' | 'Chờ cấp trên duyệt' | 'Đã chốt điểm';
}

export interface WorkReport {
  report_id: string; // e.g. "RPT-001"
  reporter_id: string; // TeamMember ID
  report_date: string; // YYYY-MM-DD
  report_type: 'Ngày' | 'Tuần' | 'Tháng' | 'Campaign';
  completed_tasks_summary: string;
  pending_tasks_summary: string;
  overdue_tasks_summary: string;
  overdue_reason: string;
  results_achieved: string;
  issues_encountered: string;
  proposed_solutions: string;
  support_needed: string;
  next_plans: string;
  reviewer_id: string; // TeamMember ID
  status: 'Chờ duyệt' | 'Đã duyệt' | 'Cần bổ sung' | 'Từ chối';
}

export interface PersonnelEvaluation {
  evaluation_id: string; // e.g. "EVAL-001"
  staff_id: string; // TeamMember ID
  evaluator_id: string; // TeamMember ID
  month: string; // e.g. "06/2026"
  kpi_points: number; // Max 50
  deadline_points: number; // Max 20
  quality_points: number; // Max 15
  proactive_points: number; // Max 10
  teamwork_points: number; // Max 5
  total_score: number; // Max 100 (auto calculate)
  classification: 'Xuất sắc' | 'Tốt' | 'Đạt' | 'Cần cải thiện' | 'Không đạt'; // auto based on total_score
  strengths: string;
  weaknesses: string;
  proposed_action: string;
  notes: string;
}

export interface Proposal {
  proposal_id: string; // e.g. "PRP-001"
  proposer_id: string; // TeamMember ID
  proposal_date: string; // YYYY-MM-DD
  issue_description: string;
  business_category: BusinessCategory;
  evidence: string;
  root_cause: string;
  proposed_solution: string;
  expected_benefits: string;
  resources_needed: string;
  timeline: string;
  owner_id: string; // TeamMember ID
  status: 'Chờ duyệt' | 'Đã duyệt' | 'Cần chỉnh sửa' | 'Từ chối' | 'Đang triển khai' | 'Đã hoàn thành';
  post_deployment_result: string;
}

export type ResourceUsageStatus = 'Bản nháp' | 'Chờ duyệt' | 'Đã duyệt' | 'Đã đăng' | 'Lưu trữ' | 'Không sử dụng';

export interface Resource {
  resource_id: string; // e.g. "RES-001"
  title: string;
  resource_type: 'Ảnh' | 'Video' | 'Kịch bản' | 'Caption' | 'File thiết kế' | 'Brief' | 'Báo cáo';
  business_category: BusinessCategory;
  campaign_id?: string;
  creator_id: string; // TeamMember ID
  created_date: string; // YYYY-MM-DD
  file_link: string;
  status: ResourceUsageStatus;
  notes: string;
  versions?: {
    file_link: string;
    updated_at: string;
    updater_name: string;
    notes?: string;
  }[];
}

export interface WebhookConfig {
  id: string; // group_id, e.g., 'dop', 'media', 'edit_video', etc.
  groupName: SpecialistGroup;
  webhookUrl: string;
  isActive: boolean;
  description: string;
}

export interface WorkPlan {
  plan_id: string; // e.g. "PLN-001"
  creator_id: string; // TeamMember ID
  plan_type: 'Tuần' | 'Tháng';
  period_name: string; // e.g. "Tuần 26 (22/06 - 28/06/2026)" or "Tháng 06/2026"
  target_goals: string; // Mục tiêu chính
  key_results: string; // Kết quả then chốt mong đợi
  tasks_list: string; // Các đầu việc dự kiến (chi tiết)
  notes?: string; // Ghi chú thêm
  reviewer_id: string; // TeamMember ID (manager usually)
  status: 'Bản nháp' | 'Chờ duyệt' | 'Đã chốt' | 'Từ chối' | 'Đang triển khai' | 'Đã hoàn thành';
  created_at: string; // YYYY-MM-DD
  visibility?: 'Công khai' | 'Riêng tư';
  objectives?: {
    id: string;
    title: string;
    key_result: string;
    linked_task_ids: string[];
  }[];
}

export interface DailyLog {
  log_id: string; // e.g. "LOG-001"
  creator_id: string; // TeamMember ID (e.g. phuong_mkt)
  log_date: string; // YYYY-MM-DD
  checklist_items: {
    id: string;
    text: string;
    completed: boolean;
  }[];
  linked_task_ids: string[]; // IDs of tasks in the system (e.g. ["TSK-001"])
  achievements?: string; // Kết quả nổi bật / ghi chú trong ngày
  challenges?: string; // Khó khăn vướng mắc
  created_at: string; // YYYY-MM-DD HH:MM:SS
}


