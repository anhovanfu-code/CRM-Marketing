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
  Users,
  Lightbulb,
  Award,
  Settings,
  ChevronDown,
  ChevronRight,
  Info,
  PlusCircle
} from 'lucide-react';

interface GuideViewProps {
  activeRole: 'Admin' | 'Manager' | 'Staff' | 'Viewer';
  setActiveMenu: (menu: string) => void;
}

export default function GuideView({ activeRole, setActiveMenu }: GuideViewProps) {
  const [selectedRole, setSelectedRole] = useState('content');
  const [activeScenario, setActiveScenario] = useState<number | null>(0);
  
  // Interactive Onboarding Tasklist
  const [onboardingTasks, setOnboardingTasks] = useState([
    { id: 1, text: 'Xác nhận phân quyền của bạn ở khung "Quyền truy cập" trên Sidebar', completed: true },
    { id: 2, text: 'Truy cập "Quản Lý Công Việc" và tìm hiểu cách lọc công việc theo tên mình', completed: false },
    { id: 3, text: 'Chuyển sang tab "Nhật Ký Hàng Ngày" bên trong mục công việc để xem cách ghi nhận báo cáo', completed: false },
    { id: 4, text: 'Vào "Thư Viện Tài Nguyên" để kiểm tra các tư liệu hình ảnh nội thất có sẵn', completed: false },
    { id: 5, text: 'Xem "Lịch Sản Xuất MKT" để nắm rõ ngày đăng bài và lịch sản xuất video tuần này', completed: false }
  ]);

  const toggleOnboardingTask = (id: number) => {
    setOnboardingTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const progressPercent = Math.round((onboardingTasks.filter(t => t.completed).length / onboardingTasks.length) * 100);

  // Core Role Handbooks
  const rolesInfo = [
    {
      id: 'content',
      title: 'Nhân Viên Content & SEO',
      icon: ClipboardList,
      color: 'border-blue-500 text-blue-600 bg-blue-50/50',
      tagColor: 'bg-blue-100 text-blue-800',
      duties: [
        'Lên kịch bản nội dung chi tiết cho các bài đăng Fanpage, Website & Video ngắn.',
        'Quản lý nội dung bài viết chuẩn SEO cho các dòng tủ bếp sồi Pháp, sofa da Ý.',
        'Lập kế hoạch tuần (mục tiêu KPI bài viết) & cập nhật tiến độ công việc hàng ngày.'
      ],
      steps: [
        { title: 'Bước 1: Nhận Task & Xem Kế Hoạch', desc: 'Vào "Quản Lý Công Việc" lọc theo tên bạn hoặc vào "Kế Hoạch Định Kỳ" để nắm rõ KPI mục tiêu tuần.' },
        { title: 'Bước 2: Viết Bài & Triển Khai', desc: 'Sử dụng tư liệu hình ảnh chất lượng từ "Thư Viện Tài Nguyên" để thiết kế bài viết chuẩn SEO.' },
        { title: 'Bước 3: Gửi Bài & Cập Nhật Trạng Thái', desc: 'Khi viết xong, chuyển trạng thái task từ "Cần làm" sang "Đang làm" hoặc "Sẵn sàng" và đính kèm link bài viết.' },
        { title: 'Bước 4: Ghi Nhật Ký Daily Logs', desc: 'Cuối ngày vào "Quản Lý Công Việc" -> Tab "Nhật Ký Hàng Ngày", bấm "Ghi nhận nhật ký mới", tích chọn việc đã làm và điền mô tả cụ thể.' }
      ],
      image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=600&h=300&q=80'
    },
    {
      id: 'designer',
      title: 'Nhân Viên Thiết Kế Đồ Họa (Designer)',
      icon: Sparkles,
      color: 'border-purple-500 text-purple-600 bg-purple-50/50',
      tagColor: 'bg-purple-100 text-purple-800',
      duties: [
        'Thiết kế banner quảng cáo, bộ nhận diện phong thủy thương hiệu FUGALO.',
        'Sản xuất 3D phối cảnh tủ bếp, phòng khách, phòng ngủ cho khách hàng.',
        'Quản lý, phân loại tệp tin ảnh và tài nguyên thiết kế lên Thư Viện.'
      ],
      steps: [
        { title: 'Bước 1: Tra Cứu Yêu Cầu Thiết Kế', desc: 'Vào "Quản Lý Công Việc", click vào các thẻ task "Thiết kế" để xem yêu cầu kích thước, màu sắc, phong cách.' },
        { title: 'Bước 2: Thiết Kế & Upload Lên Thư Viện', desc: 'Khi hoàn thiện, upload link ảnh chất lượng cao lên "Thư Viện Tài Nguyên" kèm thẻ tag mảng nội dung tương ứng.' },
        { title: 'Bước 3: Gán Tag & Cập Nhật Trạng Thái', desc: 'Chuyển task sang "Hoàn thành" hoặc gửi duyệt, gửi webhook thông báo tự động cho Content lấy ảnh viết bài.' },
        { title: 'Bước 4: Báo Cáo Nhật Ký Ngày', desc: 'Điền chính xác số lượng banner đã hoàn thành vào "Nhật Ký Hàng Ngày" kèm các khó khăn kỹ thuật nếu có.' }
      ],
      image: 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=600&h=300&q=80'
    },
    {
      id: 'video_editor',
      title: 'Nhân Viên Dựng Video (Video Editor)',
      icon: Flame,
      color: 'border-orange-500 text-orange-600 bg-orange-50/50',
      tagColor: 'bg-orange-100 text-orange-800',
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
      color: 'border-[#E04B1C] text-[#E04B1C] bg-orange-50/50',
      tagColor: 'bg-orange-100 text-orange-800',
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

  // ALL 8 MODULES IN THE APP - NO LONGER HIDDEN!
  const appModules = [
    {
      id: 'm-dashboard',
      menuId: 'dashboard',
      title: 'Dashboard Tổng Quan',
      icon: Layout,
      desc: 'Nơi tập hợp toàn bộ số liệu thống kê thời gian thực của phòng Marketing. Xem tỷ lệ hoàn thành công việc, sản lượng video/bài viết thực tế đạt được so với cam kết tuần.',
      tip: 'Nhân viên mới nên xem Dashboard đầu ngày để nắm bắt tổng quát mục tiêu chung.'
    },
    {
      id: 'm-campaigns',
      menuId: 'campaigns',
      title: 'Campaign Nội Bộ',
      icon: Megaphone,
      desc: 'Theo dõi các chiến dịch Marketing đang triển khai (ví dụ: Chiến dịch Tủ Bếp Sồi Pháp, Sofa Da Bò Ý). Giúp bạn hiểu rõ thông điệp cốt lõi, ngân sách và định hướng truyền thông chung.',
      tip: 'Click vào từng Campaign để xem chi tiết đối tượng mục tiêu trước khi viết bài.'
    },
    {
      id: 'm-plans',
      menuId: 'plans',
      title: 'Kế Hoạch Định Kỳ MKT',
      icon: Target,
      desc: 'Quản lý các mục tiêu cam kết theo tuần/tháng. Mỗi nhân sự sẽ đăng ký kế hoạch cụ thể (Ví dụ: Đăng ký viết 5 bài SEO, 3 bài Fanpage). Trưởng phòng sẽ duyệt trực tiếp tại đây.',
      tip: 'Bấm nút "Tạo Kế Hoạch Tuần" vào thứ Hai đầu tuần để đăng ký cam kết KPI cá nhân.'
    },
    {
      id: 'm-tasks',
      menuId: 'tasks',
      title: 'Quản Lý Công Việc (Kanban & Daily Logs)',
      icon: CheckSquare,
      desc: 'Bảng Kanban kéo thả công việc trực quan (Yêu cầu, Đang làm, Cần sửa, Hoàn thành). Đặc biệt tích hợp tab "Nhật Ký Hàng Ngày" (Daily Logs) để nhân viên báo cáo checklist cuối ngày.',
      tip: 'Lọc danh sách theo tên bạn để xem ngay công việc mình được giao phụ trách chính hoặc phối hợp.'
    },
    {
      id: 'm-calendar',
      menuId: 'calendar',
      title: 'Lịch Sản Xuất MKT',
      icon: Calendar,
      desc: 'Lịch biên tập nội dung số (Content Calendar). Giúp đồng bộ ngày đăng bài lên Fanpage, lịch đăng video TikTok, ngày quay hình và hạn chót thiết kế của cả phòng.',
      tip: 'Dễ dàng chuyển đổi giữa chế độ xem Lịch Tháng, Lịch Tuần hoặc Danh Sách Công Việc.'
    },
    {
      id: 'm-resources',
      menuId: 'resources',
      title: 'Thư Viện Tài Nguyên',
      icon: FolderClosed,
      desc: 'Kho lưu trữ ảnh render sản phẩm 3D, kịch bản mẫu, video gốc, logo, font chữ thương hiệu FUGALO. Tiết kiệm thời gian, không cần hỏi đi hỏi lại file thô giữa các thành viên.',
      tip: 'Hãy gắn các thẻ tag rõ ràng (ví dụ: "Tủ Bếp Sồi", "Sofa Da") khi tải tài nguyên lên.'
    },
    {
      id: 'm-proposals',
      menuId: 'proposals',
      title: 'Đề Xuất Phương Án',
      icon: Lightbulb,
      desc: 'Không gian sáng tạo dành cho mọi thành viên. Bạn có ý tưởng chiến dịch mới, đề xuất ngân sách hay cách tối ưu hóa hiệu quả? Hãy tạo đề xuất tại đây để Trưởng phòng và Giám đốc phản hồi.',
      tip: 'Tích hợp tính năng bình chọn và thả tim giúp cả team cùng thảo luận trực quan.'
    },
    {
      id: 'm-reports',
      menuId: 'reports',
      title: 'Hệ Thống Báo Cáo & Đánh Giá KPI',
      icon: Award,
      desc: 'Bao gồm Báo Cáo Công Việc, Quản Lý KPI và Đánh Giá Hiệu Suất (Phân quyền bảo mật cho Trưởng phòng/Admin). Tự động tổng hợp điểm số từ Nhật ký ngày và Kế hoạch cam kết.',
      tip: 'Chỉ hiển thị với vai trò Manager/Admin. Cung cấp báo cáo chính xác để xếp hạng khen thưởng.'
    }
  ];

  // Interactive Scenario-based FAQs
  const scenarios = [
    {
      q: 'Tôi là nhân viên mới, làm thế nào để thấy công việc mình được giao?',
      a: 'Hãy truy cập phân hệ "Quản Lý Công Việc" (ở thanh menu trái). Ở phía trên bộ lọc, hãy chọn tên của bạn ở mục "Người phụ trách". Hệ thống sẽ ngay lập tức lọc ra các công việc bạn cần làm. Lưu ý: Công việc bạn làm "Chính" sẽ hiện đầu tiên, ngoài ra còn có các công việc bạn làm "Phối hợp (Phụ)" hỗ trợ đồng nghiệp.',
      step: 'Menu trái ➔ Quản Lý Công Việc ➔ Bộ lọc Người phụ trách ➔ Chọn tên của bạn.'
    },
    {
      q: 'Hệ thống phân biệt giữa "Người phụ trách chính" và "Người phối hợp (Phụ)" như thế nào?',
      a: 'Mỗi công việc (Task) trong hệ thống có cấu trúc rõ ràng:\n• Người phụ trách chính: Là người chịu trách nhiệm cao nhất về kết quả công việc.\n• Người phối hợp thực hiện (Phụ / Đồng thực hiện): Là những thành viên tham gia hỗ trợ, làm chung phần việc đó. Khi Trưởng phòng tạo Task, họ có thể chọn nhiều người phối hợp. Trên thẻ công việc Kanban, avatar của người phối hợp phụ sẽ hiển thị nhỏ hơn ngay cạnh avatar người phụ trách chính để cả team cùng theo dõi.',
      step: 'Khi xem bảng Kanban hoặc danh sách: Người chính hiển thị viền Tím, người phối hợp phụ hiển thị viền Vàng.'
    },
    {
      q: 'Báo cáo Nhật Ký Hàng Ngày (Daily Logs) thế nào cho đúng quy chuẩn?',
      a: 'Đây là việc cực kỳ quan trọng cuối mỗi ngày làm việc để Trưởng phòng nắm bắt tiến độ và ghi nhận KPI:\n1. Vào "Quản Lý Công Việc" ➔ Click chọn tab "Nhật Ký Hàng Ngày" (trên đầu bảng Kanban).\n2. Bấm nút "+ Ghi nhận nhật ký mới" (hoặc chỉnh sửa bản ghi hiện có).\n3. Tích chọn các đầu việc lớn bạn đã thực hiện hôm nay.\n4. Nhập "Nội dung chi tiết kết quả công việc" cụ thể (Ví dụ: "Viết xong bài SEO tủ bếp sồi, upload lên drive review").\n5. Nếu gặp khó khăn/rào cản, hãy điền vào ô "Khó khăn / Kiến nghị" để Trưởng phòng nhận được thông báo hỗ trợ bạn ngay lập tức.',
      step: 'Daily Logs giúp Trưởng phòng duyệt tự động KPI ngày. Đừng quên nộp trước 18h00 mỗi ngày!'
    },
    {
      q: 'Lập Kế Hoạch Tuần (Weekly Plan) vào lúc nào và gửi duyệt ra sao?',
      a: 'Vào mỗi sáng Thứ Hai đầu tuần, bạn cần đăng ký các cam kết mục tiêu công việc của mình:\n1. Vào mục "Kế Hoạch Định Kỳ MKT" ➔ Bấm nút "+ Tạo Kế Hoạch Tuần".\n2. Chọn tuần hiện tại và điền các cam kết số lượng (Ví dụ: Viết 5 bài SEO, thiết kế 4 banner, dựng 3 video Reels).\n3. Nhấn "Gửi Trưởng Phòng Phê Duyệt". Trưởng phòng sẽ nhận được thông báo, kiểm tra xem có phù hợp với mục tiêu chung của Campaign không và bấm Duyệt. Cuối tuần, hệ thống sẽ đo lường hiệu suất thực tế so với cam kết này.',
      step: 'Kế Hoạch Tuần là thước đo chính để chấm điểm Đánh Giá Hiệu Suất (A/B/C) cuối tháng.'
    },
    {
      q: 'Tôi tìm tài liệu thiết kế, kịch bản, font chữ hay hình ảnh nội thất ở đâu?',
      a: 'Bạn không cần nhắn tin hỏi file thô liên tục trên Zalo/Telegram. Hãy truy cập ngay phân hệ "Thư Viện Tài Nguyên". Tại đây có các thư mục chia sẻ theo mảng như "Tủ Bếp Gỗ Sồi", "Sofa Da Thật", "Kịch Bản Video", "Logo & Font Chữ". Bạn có thể tìm kiếm, tải về hoặc đăng tải tài nguyên mới lên để chia sẻ với đồng nghiệp.',
      step: 'Thư Viện Tài Nguyên ➔ Sử dụng bộ lọc theo mảng nội dung hoặc ô tìm kiếm ở góc phải.'
    }
  ];

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-transparent text-[#2F2B3D] p-6 space-y-6 animate-fade-in text-xs">
      
      {/* Welcome Hero Section */}
      <div className="bg-gradient-to-r from-[#E04B1C] to-[#F46336] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-15 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent hidden md:block" />
        <div className="max-w-4xl space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5 animate-pulse" />
            <span>Sách Hướng Dẫn Hội Nhập Nhân Sự Mới</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-wide leading-tight">
            CỔNG HƯỚNG DẪN VẬN HÀNH PHÒNG MARKETING FUGALO
          </h2>
          <p className="text-white/90 leading-relaxed text-[11px] font-medium max-w-3xl">
            Chào mừng bạn gia nhập đội ngũ Marketing của FUGALO! Sổ tay tương tác này được thiết kế để giúp bạn nhanh chóng làm quen với hệ thống điều hành nội bộ, hiểu rõ cách phối hợp công việc, tạo kế hoạch tuần và làm báo cáo Daily Logs hằng ngày một cách đơn giản, trực quan và không bị rối.
          </p>
        </div>
      </div>

      {/* Workflow Diagram Section */}
      <div className="bg-white border border-[#E6E6E8] rounded-2xl p-5 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h4 className="text-xs font-black uppercase text-[#E04B1C] tracking-wide flex items-center gap-1.5">
            <Layout className="w-4 h-4" />
            <span>SƠ ĐỒ QUY TRÌNH VẬN HÀNH MARKETING KHÉP KÍN (4 BƯỚC)</span>
          </h4>
          <p className="text-[10px] text-slate-400">Xem luồng đi của thông tin và công việc từ lúc lập chiến dịch đến khi báo cáo hiệu suất</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
          
          <div className="bg-amber-50/50 border border-amber-200/60 rounded-xl p-3.5 flex flex-col justify-between space-y-3 relative">
            <div className="space-y-1.5">
              <span className="text-[9px] bg-amber-100 text-amber-800 font-extrabold px-2 py-0.5 rounded-full uppercase">BƯỚC 1: CHIẾN LƯỢC</span>
              <h5 className="font-extrabold text-[#2F2B3D] text-[11px]">Thiết Lập Campaign</h5>
              <p className="text-[10px] text-slate-500 leading-normal">Trưởng phòng khởi tạo Campaign lớn (ví dụ: Chiến dịch Tủ Bếp Sồi Pháp) kèm mục tiêu cốt lõi và định hướng ngân sách.</p>
            </div>
            <div className="text-[10px] bg-white border border-slate-100 px-2 py-1 rounded text-slate-500 font-bold flex items-center gap-1">
              <Megaphone className="w-3 h-3 text-amber-500" />
              <span>Xem tại "Campaign Nội Bộ"</span>
            </div>
            <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 bg-white border border-slate-200 rounded-full p-1 shadow-xs">
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </div>

          <div className="bg-blue-50/50 border border-blue-200/60 rounded-xl p-3.5 flex flex-col justify-between space-y-3 relative">
            <div className="space-y-1.5">
              <span className="text-[9px] bg-blue-100 text-blue-800 font-extrabold px-2 py-0.5 rounded-full uppercase">BƯỚC 2: KẾ HOẠCH TUẦN</span>
              <h5 className="font-extrabold text-[#2F2B3D] text-[11px]">Cam Kết Mục Tiêu</h5>
              <p className="text-[10px] text-slate-500 leading-normal">Mỗi sáng Thứ Hai, từng nhân sự chủ động đăng ký số lượng cam kết cụ thể (KPI tuần) của mình và gửi Trưởng phòng phê duyệt.</p>
            </div>
            <div className="text-[10px] bg-white border border-slate-100 px-2 py-1 rounded text-slate-500 font-bold flex items-center gap-1">
              <Target className="w-3 h-3 text-blue-500" />
              <span>Đăng ký tại "Kế Hoạch Định Kỳ"</span>
            </div>
            <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 bg-white border border-slate-200 rounded-full p-1 shadow-xs">
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </div>

          <div className="bg-purple-50/50 border border-purple-200/60 rounded-xl p-3.5 flex flex-col justify-between space-y-3 relative">
            <div className="space-y-1.5">
              <span className="text-[9px] bg-purple-100 text-purple-800 font-extrabold px-2 py-0.5 rounded-full uppercase">BƯỚC 3: TRIỂN KHAI</span>
              <h5 className="font-extrabold text-[#2F2B3D] text-[11px]">Kanban &amp; Daily Logs</h5>
              <p className="text-[10px] text-slate-500 leading-normal">Phân rã thành các Task chi tiết. Cuối ngày, nhân viên tích chọn việc đã làm tại tab Nhật Ký Hàng Ngày để hệ thống tính sản lượng thực tế.</p>
            </div>
            <div className="text-[10px] bg-white border border-slate-100 px-2 py-1 rounded text-slate-500 font-bold flex items-center gap-1">
              <CheckSquare className="w-3 h-3 text-purple-500" />
              <span>Kéo thả &amp; báo cáo tại "Công Việc"</span>
            </div>
            <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 bg-white border border-slate-200 rounded-full p-1 shadow-xs">
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </div>

          <div className="bg-emerald-50/50 border border-emerald-200/60 rounded-xl p-3.5 flex flex-col justify-between space-y-3">
            <div className="space-y-1.5">
              <span className="text-[9px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full uppercase">BƯỚC 4: ĐÁNH GIÁ</span>
              <h5 className="font-extrabold text-[#2F2B3D] text-[11px]">Duyệt Báo Cáo &amp; KPI</h5>
              <p className="text-[10px] text-slate-500 leading-normal">Hệ thống so khớp tự động giữa kế hoạch tuần và nhật ký ngày của bạn để chấm điểm hiệu suất hoàn thành công việc khách quan.</p>
            </div>
            <div className="text-[10px] bg-white border border-slate-100 px-2 py-1 rounded text-slate-500 font-bold flex items-center gap-1">
              <Award className="w-3 h-3 text-emerald-500" />
              <span>Tự động kết xuất trên "Dashboard"</span>
            </div>
          </div>

        </div>
      </div>

      {/* Main Grid: Onboarding Checklist & Scenario Walkthrough */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Onboarding Checklist Card */}
        <div className="bg-white border border-[#E6E6E8] rounded-2xl p-5 shadow-sm space-y-4">
          <div className="space-y-1">
            <h4 className="text-xs font-black uppercase text-[#E04B1C] tracking-wide flex items-center gap-1.5">
              <UserCheck className="w-4 h-4" />
              <span>Nhiệm vụ hội nhập của bạn</span>
            </h4>
            <p className="text-[10px] text-slate-400">Từng bước làm quen với hệ thống bằng cách thực hiện các thao tác sau</p>
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
                    ? 'border-emerald-100 bg-emerald-50/30 text-slate-400' 
                    : 'border-[#E6E6E8] bg-white hover:border-[#E04B1C]/30 hover:shadow-xs'
                }`}
              >
                <div className="mt-0.5 flex-shrink-0">
                  {task.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 animate-fade-in" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-slate-300 hover:border-[#E04B1C] transition-colors" />
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
              🎉 Tuyệt vời! Bạn đã hoàn thành các bước trải nghiệm cơ bản của hệ thống. Bạn đã sẵn sàng để thực hành công việc thực tế cùng phòng Marketing FUGALO!
            </div>
          )}
        </div>

        {/* Dynamic Q&A Scenario Walkthrough */}
        <div className="lg:col-span-2 bg-white border border-[#E6E6E8] rounded-2xl p-5 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h4 className="text-xs font-black uppercase text-[#2F2B3D] tracking-wide flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-[#E04B1C]" />
              <span>GIẢI ĐÁP THẮC MẮC &amp; HƯỚNG DẪN THAO TÁC THỰC TẾ</span>
            </h4>
            <p className="text-[10px] text-slate-400">Các tình huống thực tế thường gặp giúp nhân viên mới hiểu ngay cách sử dụng hệ thống</p>
          </div>

          <div className="space-y-3">
            {scenarios.map((sc, idx) => {
              const isOpen = activeScenario === idx;
              return (
                <div 
                  key={idx} 
                  className={`border rounded-xl overflow-hidden transition duration-150 ${
                    isOpen 
                      ? 'border-[#E04B1C]/40 bg-[#Fdfbf7]' 
                      : 'border-[#E6E6E8] bg-white hover:border-slate-300'
                  }`}
                >
                  <button
                    onClick={() => setActiveScenario(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-3 text-left font-extrabold text-[#2F2B3D] transition hover:text-[#E04B1C]"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center font-black text-[10px] flex-shrink-0 ${
                        isOpen ? 'bg-[#E04B1C] text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                        Q
                      </span>
                      <span className="text-[11px] leading-tight pt-0.5">{sc.q}</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 border-t border-slate-100 space-y-3 animate-fade-in">
                      <p className="text-[11px] text-slate-600 leading-relaxed whitespace-pre-line font-medium">{sc.a}</p>
                      
                      <div className="bg-slate-100 border border-slate-200/60 rounded-lg p-2.5 flex items-start gap-2">
                        <Info className="w-3.5 h-3.5 text-[#E04B1C] mt-0.5 flex-shrink-0" />
                        <div>
                          <strong className="text-[10px] text-slate-700 uppercase tracking-wider block">Các bước thao tác nhanh:</strong>
                          <span className="text-[10px] text-slate-500 font-mono font-bold leading-normal mt-0.5 block">{sc.step}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Guide by Specific Job Role */}
      <div className="bg-white border border-[#E6E6E8] rounded-2xl p-5 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-xs font-black uppercase text-[#2F2B3D] tracking-wide flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[#E04B1C]" />
              <span>SỔ TAY CÔNG VIỆC THEO VỊ TRÍ CHUYÊN MÔN</span>
            </h4>
            <p className="text-[10px] text-slate-400">Chọn vị trí công việc của bạn để nắm bắt chi tiết quy trình phối hợp nội bộ</p>
          </div>

          {/* Selector list */}
          <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            {rolesInfo.map(role => (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`px-3 py-1.5 rounded-md text-[10px] font-black transition ${
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 animate-fade-in">
              {/* Left Column: Duties & Action Steps */}
              <div className="space-y-4">
                <div className={`p-3.5 rounded-xl border flex items-center gap-3 ${currentRole.color}`}>
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <div>
                    <h5 className="font-black uppercase tracking-wide text-xs text-[#2F2B3D]">{currentRole.title}</h5>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Chức trách cốt lõi phòng Marketing</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">Nhiệm Vụ Thường Nhật:</span>
                  <ul className="space-y-1.5 pl-1">
                    {currentRole.duties.map((duty, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-[11px] leading-relaxed text-slate-600 font-medium">
                        <span className="w-1.5 h-1.5 bg-[#E04B1C] rounded-full mt-1.5 flex-shrink-0" />
                        <span>{duty}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3 border-t border-slate-100 pt-3">
                  <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">Luồng Thao Tác 4 Bước Khuyến Nghị:</span>
                  <div className="space-y-3">
                    {currentRole.steps.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="w-5 h-5 bg-[#E04B1C]/10 text-[#E04B1C] font-black rounded-full flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5 border border-[#E04B1C]/20">
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

              {/* Right Column: Interactive tips & image simulation */}
              <div className="space-y-4">
                <div className="relative rounded-xl overflow-hidden border border-[#E6E6E8] h-48 group shadow-xs">
                  <img 
                    src={currentRole.image} 
                    alt={currentRole.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-3 text-white">
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-wider bg-[#E04B1C] text-white px-2 py-0.5 rounded">Phòng Marketing FUGALO</span>
                      <p className="text-[10px] font-bold mt-1 text-white/95">Hình ảnh thực tế không gian làm việc sáng tạo.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-[10px] leading-relaxed text-slate-500 font-semibold space-y-1">
                  <span className="font-black text-[#2F2B3D] block uppercase tracking-wider">💡 MẸO GIA TĂNG ĐIỂM KPI HIỆU SUẤT:</span>
                  <p>Hệ thống tự động liên kết các báo cáo Daily Logs của bạn với danh sách đầu việc đã cam kết trong tuần. Để tránh bị sụt giảm hiệu suất, hãy liên tục kiểm tra trạng thái các Task của bạn, đảm bảo hoàn thành đúng tiến độ và cập nhật Daily Logs đều đặn mỗi ngày làm việc!</p>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Directory of All 8 Interactive Application Modules */}
      <div className="bg-white border border-[#E6E6E8] rounded-2xl p-5 shadow-sm space-y-4">
        <div>
          <h4 className="text-xs font-black uppercase text-[#2F2B3D] tracking-wide flex items-center gap-1.5">
            <Layout className="w-4 h-4 text-[#E04B1C]" />
            <span>KHÁM PHÁ CHI TIẾT TẤT CẢ CÁC CHỨC NĂNG HỆ THỐNG</span>
          </h4>
          <p className="text-[10px] text-slate-400">Xem chức năng chi tiết của từng phân hệ trên menu trái để vận hành trơn tru</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {appModules.map(module => {
            const Icon = module.icon;
            // Check if this module requires special permissions
            const isProtected = ['m-reports', 'm-evaluations'].includes(module.id) || ['reports', 'kpis', 'evaluations', 'team', 'settings'].includes(module.menuId);
            const canAccess = !isProtected || activeRole === 'Admin' || activeRole === 'Manager';

            return (
              <div 
                key={module.id}
                className={`border rounded-2xl p-4 flex flex-col justify-between transition duration-200 relative overflow-hidden group ${
                  canAccess 
                    ? 'border-[#E6E6E8] bg-slate-50/30 hover:border-[#E04B1C]/30 hover:shadow-md' 
                    : 'border-slate-100 bg-slate-50/50 opacity-60'
                }`}
              >
                <div className="space-y-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black border ${
                    canAccess 
                      ? 'bg-[#E04B1C]/10 text-[#E04B1C] border-[#E04B1C]/15' 
                      : 'bg-slate-200 text-slate-400 border-slate-300'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h5 className="font-black text-xs text-[#2F2B3D] group-hover:text-[#E04B1C] transition">{module.title}</h5>
                      {!canAccess && <span className="text-[8px] bg-slate-200 text-slate-500 px-1 py-0.5 rounded font-black uppercase">🔒 Khóa</span>}
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium leading-relaxed mt-1.5">{module.desc}</p>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 mt-4 space-y-2">
                  <div className="bg-[#E04B1C]/5 border border-[#E04B1C]/10 p-2.5 rounded-lg text-[9px] leading-relaxed text-[#2F2B3D]/80">
                    🔥 <strong>Mẹo hay:</strong> {module.tip}
                  </div>
                  {canAccess ? (
                    <button
                      onClick={() => setActiveMenu(module.menuId)}
                      className="w-full bg-white hover:bg-[#E04B1C]/5 hover:text-[#E04B1C] text-slate-600 border border-[#E6E6E8] hover:border-[#E04B1C]/30 py-1.5 rounded-lg font-black text-[9px] flex items-center justify-center gap-1 transition"
                    >
                      <span>Truy cập nhanh</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  ) : (
                    <div className="w-full bg-slate-100 text-slate-400 border border-slate-200 py-1.5 rounded-lg font-black text-[9px] text-center cursor-not-allowed select-none">
                      Yêu cầu quyền Quản lý
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
