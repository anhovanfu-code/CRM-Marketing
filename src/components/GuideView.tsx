import React, { useState } from 'react';
import { 
  BookOpen, 
  UserCheck, 
  ArrowRight, 
  Layout, 
  Target, 
  CheckSquare, 
  Calendar, 
  Megaphone, 
  TrendingUp, 
  FolderClosed, 
  HelpCircle,
  Sparkles,
  ClipboardList,
  Flame,
  CheckCircle2,
  Users
} from 'lucide-react';

interface GuideViewProps {
  activeRole: 'Admin' | 'Manager' | 'Staff' | 'Viewer';
  setActiveMenu: (menu: string) => void;
}

export default function GuideView({ activeRole, setActiveMenu }: GuideViewProps) {
  // Roles list for onboarding view
  const rolesInfo = [
    {
      id: 'content',
      title: 'Nhân Viên Content & SEO',
      icon: ClipboardList,
      color: 'border-blue-500 text-blue-600 bg-blue-50',
      duties: [
        'Lên kịch bản nội dung chi tiết cho các bài đăng Fanpage, Website & Video ngắn.',
        'Quản lý nội dung SEO cho các dòng tủ bếp sồi Pháp, sofa da bò Ý.',
        'Lập kế hoạch tuần (mục tiêu KPI bài viết) & cập nhật tiến độ công việc hàng ngày.'
      ],
      steps: [
        { title: 'Bước 1: Nhận Task & Xem Kế Hoạch', desc: 'Vào "Quản Lý Công Việc" lọc theo tên bạn hoặc vào "Kế Hoạch Định Kỳ" để nắm rõ KPI mục tiêu tuần.' },
        { title: 'Bước 2: Viết Bài & Triển Khai', desc: 'Sử dụng tư liệu từ "Thư Viện Tài Nguyên" để thiết kế bài viết chuẩn SEO.' },
        { title: 'Bước 3: Gửi Bài & Cập Nhật Trạng Thái', desc: 'Khi viết xong, kéo task từ "Cần làm" sang "Đang làm" hoặc "Sẵn sàng" và đính kèm link bài viết.' },
        { title: 'Bước 4: Báo Cáo Daily Logs', desc: 'Cuối ngày vào "Quản Lý Công Việc" -> "Nhật Ký Hàng Ngày", tích chọn việc đã làm và điền ghi chú để Trưởng phòng duyệt.' }
      ],
      image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=600&h=300&q=80'
    },
    {
      id: 'designer',
      title: 'Nhân Viên Thiết Kế Đồ Họa (Designer)',
      icon: Sparkles,
      color: 'border-purple-500 text-purple-600 bg-purple-50',
      duties: [
        'Thiết kế banner quảng cáo, bộ nhận diện phong thủy thương hiệu FUGALO.',
        'Sản xuất 3D phối cảnh tủ bếp, phòng khách, phòng ngủ cho khách hàng.',
        'Quản lý, phân loại tệp tin ảnh và tài nguyên thiết kế lên Thư Viện.'
      ],
      steps: [
        { title: 'Bước 1: Tra Cứu Yêu Cầu Thiết Kế', desc: 'Vào "Quản Lý Công Việc", click vào các thẻ task "Đồ họa" để xem yêu cầu kích thước, màu sắc, phong cách.' },
        { title: 'Bước 2: Upload Tài Nguyên Lên Thư Viện', desc: 'Khi thiết kế xong banner/phối cảnh, upload link ảnh chất lượng cao lên "Thư Viện Tài Nguyên" kèm thẻ tag mảng nội dung tương ứng.' },
        { title: 'Bước 3: Cập Nhật Trạng Thái Thiết Kế', desc: 'Chuyển task sang "Hoàn thành" hoặc gửi duyệt, gửi webhook thông báo tự động cho Content lấy ảnh viết bài.' },
        { title: 'Bước 4: Check-in Nhật Ký Ngày', desc: 'Điền chính xác số lượng banner đã hoàn thành vào "Nhật Ký Hàng Ngày" kèm các khó khăn kỹ thuật nếu có.' }
      ],
      image: 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=600&h=300&q=80'
    },
    {
      id: 'video_editor',
      title: 'Nhân Viên Dựng Video (Video Editor)',
      icon: Flame,
      color: 'border-orange-500 text-orange-600 bg-orange-50',
      duties: [
        'Dựng các video ngắn (Reels, TikTok, Shorts) giới thiệu nội thất da, sồi.',
        'Xử lý âm thanh, nhạc nền, lồng tiếng và hiệu ứng trực quan sinh động.',
        'Phối hợp với Content duyệt kịch bản và diễn viên quay dựng.'
      ],
      steps: [
        { title: 'Bước 1: Đồng Bộ Lịch Sản Xuất MKT', desc: 'Truy cập "Lịch Sản Xuất MKT" để nắm rõ ngày quay, ngày đăng và deadline render video.' },
        { title: 'Bước 2: Nhận File Raw & Dựng Video', desc: 'Lấy file quay từ drive nội bộ, cắt dựng, tối ưu hóa nhịp điệu và âm thanh.' },
        { title: 'Bước 3: Gửi Link Review Lên Thư Viện', desc: 'Đưa video nháp lên Thư Viện hoặc cập nhật trực tiếp vào thẻ Công việc để Content & Trưởng phòng đóng góp ý kiến.' },
        { title: 'Bước 4: Đóng Daily Logs & Sẵn Sàng Đăng', desc: 'Tích hoàn thành công việc dựng trong "Nhật Ký Hàng Ngày" để hệ thống tính KPI sản lượng video trong tuần.' }
      ],
      image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=600&h=300&q=80'
    },
    {
      id: 'manager',
      title: 'Trưởng Phòng Marketing (Manager)',
      icon: Users,
      color: 'border-[#E04B1C] text-[#E04B1C] bg-orange-50',
      duties: [
        'Thiết lập chiến dịch (Campaign) lớn, đặt KPI tổng quan cho toàn bộ phòng.',
        'Quản lý, phân bổ công việc, duyệt Kế Hoạch Tuần của nhân viên.',
        'Theo dõi báo cáo, phê duyệt KPI hiệu suất và hỗ trợ các rào cản từ Daily Logs.'
      ],
      steps: [
        { title: 'Bước 1: Thiết Lập Campaign & Mục Tiêu', desc: 'Vào "Campaign Nội Bộ" & "Kế Hoạch Định Kỳ" để kích hoạt chiến dịch Marketing mới (Ví dụ: Chiến dịch Tủ bếp sồi).' },
        { title: 'Bước 2: Phân Rã Thành Công Việc (Tasks)', desc: 'Tại tab "Quản Lý Công Việc", click "Thêm Task Mới" để phân bổ việc chi tiết cho Designer, Editor, Content.' },
        { title: 'Bước 3: Giám Sát Daily Logs Hàng Ngày', desc: 'Vào "Quản Lý Công Việc" -> "Nhật Ký Hàng Ngày" để xem toàn bộ danh sách checklist thực tế mà nhân viên đăng tải.' },
        { title: 'Bước 4: Đánh Giá KPI Cuối Tuần/Tháng', desc: 'Xem dữ liệu biểu đồ tự động tại "Dashboard Tổng Quan" và "Đánh Giá Hiệu Suất" để chấm điểm hoàn thành công việc.' }
      ],
      image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&h=300&q=80'
    }
  ];

  const appModules = [
    {
      id: 'm-dashboard',
      menuId: 'dashboard',
      title: 'Dashboard Tổng Quan',
      icon: Layout,
      desc: 'Nơi tập hợp toàn bộ số liệu thống kê thời gian thực của phòng Marketing. Bạn có thể xem tỷ lệ hoàn thành công việc, số lượng video/bài viết đã đạt được so với mục tiêu và biểu đồ phân bổ trạng thái công việc.',
      tip: 'Nhân viên mới nên kiểm tra Dashboard mỗi sáng để xem tiến độ chung của toàn phòng và thứ tự các công việc khẩn cấp cần làm.'
    },
    {
      id: 'm-plans',
      menuId: 'plans',
      title: 'Kế Hoạch Định Kỳ MKT',
      icon: Target,
      desc: 'Quản lý các mục tiêu cam kết theo tuần/tháng. Mỗi nhân sự sẽ đăng ký kế hoạch cụ thể (Ví dụ: Phuong_MKT cam kết đạt 5 bài viết chuẩn SEO, 30.000 lượt tiếp cận). Trưởng phòng sẽ phê duyệt kế hoạch trực tiếp tại đây.',
      tip: 'Bấm nút "Tạo Kế Hoạch Tuần" vào thứ Hai đầu tuần để thiết lập mục tiêu cá nhân.'
    },
    {
      id: 'm-tasks',
      menuId: 'tasks',
      title: 'Quản Lý Công Việc (Kanban & Daily Logs)',
      icon: CheckSquare,
      desc: 'Bảng trực quan hóa tiến trình công việc của bạn. Cho phép kéo thả dễ dàng giữa các cột (Yêu cầu, Đang làm, Cần sửa, Hoàn thành). Tích hợp menu "Nhật Ký Hàng Ngày" để ghi nhận checklist cụ thể ngày hôm nay.',
      tip: 'Sự kết hợp hoàn hảo: Tạo checklist thực tế làm việc hàng ngày và liên kết trực tiếp với mã Task (Ví dụ: TSK-001) giúp quản lý dễ đối chiếu dữ liệu.'
    },
    {
      id: 'm-resources',
      menuId: 'resources',
      title: 'Thư Viện Tài Nguyên',
      icon: FolderClosed,
      desc: 'Kho lưu trữ ảnh render sản phẩm (Sofa da bò Ý, Tủ bếp gỗ sồi), kịch bản mẫu, video intro gốc và tài liệu thiết kế chung của toàn phòng, giúp tối ưu hóa quy trình làm việc không cần hỏi đi hỏi lại file raw.',
      tip: 'Hãy gắn các nhãn tag như "Tủ Bếp Sồi", "Sofa Da", "Phong Thủy" để mọi người dễ dàng tìm kiếm.'
    }
  ];

  const [selectedRole, setSelectedRole] = useState('content');
  const [onboardingTasks, setOnboardingTasks] = useState([
    { id: 1, text: 'Chuyển vai trò thành "Nhân Viên" (Staff) ở ô góc trái sidebar', completed: false },
    { id: 2, text: 'Vào "Quản Lý Công Việc" -> Click tab "Nhật Ký Hàng Ngày" để xem mẫu', completed: false },
    { id: 3, text: 'Kiểm tra "Thư Viện Tài Nguyên" để xem tư liệu ảnh tủ bếp gỗ sồi mới', completed: false },
    { id: 4, text: 'Xem "Lịch Sản Xuất MKT" để nắm rõ timeline đăng bài và lịch quay', completed: false }
  ]);

  const toggleOnboardingTask = (id: number) => {
    setOnboardingTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const progressPercent = Math.round((onboardingTasks.filter(t => t.completed).length / onboardingTasks.length) * 100);

  return (
    <div className="space-y-6 mt-6 animate-fade-in text-xs text-[#2F2B3D]">
      
      {/* Welcome Hero Section */}
      <div className="bg-gradient-to-r from-[#E04B1C] to-[#F46336] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-15 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent hidden md:block" />
        <div className="max-w-3xl space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Sách Hướng Dẫn Hội Nhập Nhân Sự Mới</span>
          </div>
          <h2 className="text-xl font-black uppercase tracking-wide leading-tight">
            CHÀO MỪNG BẠN ĐẾN VỚI PHÒNG MARKETING FUGALO!
          </h2>
          <p className="text-white/90 leading-relaxed text-[11px] font-medium">
            Sổ tay hướng dẫn tương tác này sẽ giúp bạn nhanh chóng làm quen với công cụ điều hành nội bộ Fugalo Hub. Hãy chọn vai trò của bạn hoặc khám phá chi tiết các tính năng bên dưới để bắt đầu công việc một cách hoàn hảo nhất.
          </p>
        </div>
      </div>

      {/* Main Grid: Checklist & Interactive Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Onboarding Checklist Card */}
        <div className="bg-white border border-[#E6E6E8] rounded-2xl p-5 shadow-sm space-y-4">
          <div className="space-y-1">
            <h4 className="text-xs font-black uppercase text-[#E04B1C] tracking-wide flex items-center gap-1.5">
              <UserCheck className="w-4 h-4" />
              <span>Nhiệm vụ hội nhập của bạn</span>
            </h4>
            <p className="text-[10px] text-slate-400">Hãy thực hiện tuần tự các thao tác sau để kích hoạt tiến trình làm việc chính thức</p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center font-bold text-[10px] text-slate-500">
              <span>TIẾN ĐỘ HOÀN THÀNH:</span>
              <span className="text-[#E04B1C]">{progressPercent}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div className="h-full bg-gradient-to-r from-[#E04B1C] to-[#F46336] transition-all duration-500" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>

          {/* Checklist Items */}
          <div className="space-y-2.5 pt-2">
            {onboardingTasks.map(task => (
              <div 
                key={task.id}
                onClick={() => toggleOnboardingTask(task.id)}
                className={`p-3 rounded-xl border transition duration-200 cursor-pointer flex items-start gap-3 ${
                  task.completed 
                    ? 'border-emerald-100 bg-emerald-50/40 text-slate-500' 
                    : 'border-[#E6E6E8] bg-white hover:border-[#E04B1C]/30 hover:shadow-xs'
                }`}
              >
                <div className="mt-0.5 flex-shrink-0">
                  {task.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-slate-300 hover:border-[#E04B1C]" />
                  )}
                </div>
                <span className={`text-[11px] font-bold leading-relaxed ${task.completed ? 'line-through text-slate-400' : 'text-[#2F2B3D]'}`}>
                  {task.text}
                </span>
              </div>
            ))}
          </div>

          {progressPercent === 100 && (
            <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl text-[11px] text-emerald-800 leading-relaxed font-bold animate-bounce mt-4">
              🎉 Tuyệt vời! Bạn đã hoàn thành xuất sắc các bước hội nhập cơ bản. Hãy tự tin triển khai công việc thực tế và liên hệ Trưởng phòng nếu cần bất cứ trợ giúp nào nhé!
            </div>
          )}
        </div>

        {/* Dynamic Workflow Instruction Card */}
        <div className="lg:col-span-2 bg-white border border-[#E6E6E8] rounded-2xl p-5 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-black uppercase text-[#2F2B3D] tracking-wide flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-[#E04B1C]" />
                <span>QUY TRÌNH THAO TÁC THEO TỪNG VỊ TRÍ</span>
              </h4>
              <p className="text-[10px] text-slate-400">Chọn vai trò của bạn để xem quy trình thực thi và ghi nhận KPI chuẩn mực</p>
            </div>

            {/* Selector list */}
            <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
              {rolesInfo.map(role => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`px-2.5 py-1.5 rounded-md text-[10px] font-black transition ${
                    selectedRole === role.id 
                      ? 'bg-white text-[#E04B1C] shadow-xs' 
                      : 'text-slate-500 hover:text-[#E04B1C]'
                  }`}
                >
                  {role.title.replace('Nhân Viên ', '')}
                </button>
              ))}
            </div>
          </div>

          {/* Render selected role content */}
          {(() => {
            const currentRole = rolesInfo.find(r => r.id === selectedRole)!;
            const Icon = currentRole.icon;
            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fade-in">
                {/* Left guide */}
                <div className="space-y-4">
                  <div className={`p-3 rounded-xl border flex items-center gap-2.5 ${currentRole.color}`}>
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <div>
                      <h5 className="font-black uppercase tracking-wide text-xs">{currentRole.title}</h5>
                      <span className="text-[9px] font-bold text-slate-400">Chức trách cốt lõi phòng Marketing</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">Nhiệm Vụ Cốt Lõi:</span>
                    <ul className="space-y-1.5 pl-1.5">
                      {currentRole.duties.map((duty, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-[11px] leading-relaxed text-slate-600 font-medium">
                          <span className="w-1.5 h-1.5 bg-[#E04B1C] rounded-full mt-1.5 flex-shrink-0" />
                          <span>{duty}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2 border-t border-slate-100 pt-3">
                    <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">Quy Trình 4 Bước Thao Tác Trực Quan:</span>
                    <div className="space-y-3">
                      {currentRole.steps.map((step, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <div className="w-5 h-5 bg-[#E04B1C]/15 text-[#E04B1C] font-black rounded-full flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">
                            {idx + 1}
                          </div>
                          <div>
                            <h6 className="font-extrabold text-[#2F2B3D] text-[11px] leading-tight">{step.title}</h6>
                            <p className="text-[10px] text-slate-400 leading-normal mt-0.5 font-medium">{step.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right image mockup preview */}
                <div className="space-y-3">
                  <div className="relative rounded-xl overflow-hidden border border-[#E6E6E8] h-48 group shadow-xs">
                    <img 
                      src={currentRole.image} 
                      alt={currentRole.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-3 text-white">
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-wider bg-[#E04B1C] text-white px-2 py-0.5 rounded">Tư liệu mô phỏng</span>
                        <p className="text-[10px] font-bold mt-1 text-white/90">Khu vực làm việc và thảo luận dự án mảng nội thất.</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-[10px] leading-relaxed text-slate-500 font-semibold space-y-1">
                    <span className="font-black text-[#2F2B3D] block uppercase tracking-wider">💡 Gợi Ý LÀM VIỆC ĐẠT HIỆU SUẤT CAO:</span>
                    <p>Hãy duy trì việc đồng bộ tiến độ hàng ngày. Khi gặp các lỗi phát sinh hoặc khó khăn trong khâu thiết kế, dựng bài hãy điền ngay vào ô "Khó khăn / Vướng mắc" tại phần <strong>Nhật Ký Hàng Ngày</strong> để Trưởng phòng nhận thông báo hỗ trợ bạn nhanh nhất!</p>
                  </div>
                </div>
              </div>
            );
          })()}

        </div>

      </div>

      {/* Interactive Application Modules Map */}
      <div className="bg-white border border-[#E6E6E8] rounded-2xl p-5 shadow-sm space-y-4">
        <div>
          <h4 className="text-xs font-black uppercase text-[#2F2B3D] tracking-wide flex items-center gap-1.5">
            <Layout className="w-4 h-4 text-[#E04B1C]" />
            <span>KHÁM PHÁ CHI TIẾT CÁC PHÂN HỆ ĐIỀU HÀNH</span>
          </h4>
          <p className="text-[10px] text-slate-400">Xem nhanh vai trò và cách thức khai thác từng tính năng cụ thể trên thanh Menu bên trái</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {appModules.map(module => {
            const Icon = module.icon;
            return (
              <div 
                key={module.id}
                className="border border-[#E6E6E8] rounded-2xl p-4 hover:border-[#E04B1C]/30 hover:shadow-md transition duration-200 flex flex-col justify-between bg-slate-50/40 relative overflow-hidden group"
              >
                <div className="space-y-3">
                  <div className="w-8 h-8 rounded-xl bg-[#E04B1C]/10 text-[#E04B1C] border border-[#E04B1C]/15 flex items-center justify-center font-black">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-black text-xs text-[#2F2B3D] group-hover:text-[#E04B1C] transition">{module.title}</h5>
                    <p className="text-[10px] text-slate-400 font-medium leading-relaxed mt-1.5">{module.desc}</p>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 mt-4 space-y-2">
                  <div className="bg-[#E04B1C]/5 border border-[#E04B1C]/10 p-2.5 rounded-lg text-[9px] leading-relaxed text-[#2F2B3D]/80">
                    🔥 <strong>Mẹo hay:</strong> {module.tip}
                  </div>
                  <button
                    onClick={() => setActiveMenu(module.menuId)}
                    className="w-full bg-white hover:bg-slate-100 text-slate-600 border border-[#E6E6E8] py-1.5 rounded-lg font-black text-[9px] flex items-center justify-center gap-1 transition"
                  >
                    <span>Truy cập nhanh</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
