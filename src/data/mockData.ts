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
  WebhookConfig,
  WorkPlan,
  DailyLog
} from '../types';

export const teamMembers: TeamMember[] = [
  {
    id: 'an_hv',
    name: 'Hồ Văn An',
    role: 'Marketing Manager',
    email: 'an.hv@fugalo.vn',
    phone: '0939810086',
    specialist_group: 'Quản lý',
    manager_id: 'director',
    main_task: 'Chịu trách nhiệm lập kế hoạch, phân bổ ngân sách, giám sát KPI, tối ưu hoạt động marketing tổng thể và duyệt nội dung xuất bản.',
    permissions: ['Toàn quyền cấu hình', 'Duyệt công việc', 'Phê duyệt đề xuất', 'Đánh giá nhân sự', 'Xem toàn bộ báo cáo'],
    responsibilities: [
      'Xây dựng chiến lược Marketing tổng thể cho 3 mảng: Nội thất, Phong thủy, Hàng hiệu.',
      'Quản lý ngân sách phòng Marketing hiệu quả.',
      'Đảm bảo KPI doanh số phòng đạt chỉ tiêu đề ra.'
    ],
    personal_kpis: [
      'Tỷ lệ hoàn thành kế hoạch phòng Marketing (>90%)',
      'Tỷ lệ task toàn team hoàn thành đúng hạn (>85%)',
      'Chất lượng và hiệu quả doanh số các Campaign',
      'Đóng góp đề xuất cải thiện định kỳ hằng tháng'
    ],
    tasks_in_progress: 1,
    tasks_completed: 25,
    tasks_overdue: 0,
    completion_rate: 96,
    performance_score: 95,
    notes: 'Quản lý bao quát tốt, định hướng chiến lược rõ ràng, bám sát kế hoạch tháng 7.'
  },
  {
    id: 'kiem_lh',
    name: 'Lê Hoàn Kiếm',
    role: 'Marketing DOP',
    email: 'kiem.lh@fugalo.vn',
    phone: '0933338648',
    specialist_group: 'DOP',
    manager_id: 'an_hv',
    main_task: 'Định hướng nghệ thuật, bố cục hình ảnh và kiểm soát chất lượng hình ảnh/video đầu ra cho thương hiệu FUGALO.',
    permissions: ['Đề xuất lịch sản xuất', 'Duyệt kịch bản sản xuất', 'Xem báo cáo media', 'Quản lý tài nguyên media'],
    responsibilities: [
      'Đảm bảo hình ảnh thương hiệu sang trọng, đúng thông điệp "Tái sinh giá trị".',
      'Định hướng concept quay chụp cho các công trình Nội thất, vật phẩm Phong thủy, các túi xách Hàng hiệu.'
    ],
    personal_kpis: [
      'Số concept video hoàn thành chất lượng cao',
      'Số buổi quay thực tế triển khai thành công',
      'Tỷ lệ video đúng brief nghệ thuật ban đầu (>95%)',
      'Tỷ lệ file bàn giao đúng deadline (>90%)'
    ],
    tasks_in_progress: 2,
    tasks_completed: 20,
    tasks_overdue: 0,
    completion_rate: 90,
    performance_score: 92,
    notes: 'Gu thẩm mỹ cực kỳ tốt, đang triển khai sản xuất video branding chất lượng cao cho tháng 7.'
  },
  {
    id: 'duy_lt',
    name: 'Lê Thanh Duy',
    role: 'Marketing Media Leader',
    email: 'duy.lt@fugalo.vn',
    phone: '0911046073',
    specialist_group: 'Media',
    manager_id: 'an_hv',
    main_task: 'Điều phối hoạt động của team media bao gồm lên kịch bản, tổ chức sản xuất hình ảnh, video và quản lý thư viện tài nguyên.',
    permissions: ['Giao việc nhóm media', 'Duyệt tài nguyên thô', 'Sử dụng thư viện', 'Tạo lịch sản xuất'],
    responsibilities: [
      'Lập lịch sản xuất chi tiết hàng tuần và điều phối quay phim, chụp ảnh.',
      'Quản lý và lưu trữ hệ thống tài nguyên hình ảnh, video chất lượng cao.'
    ],
    personal_kpis: [
      'Tổng số lượng video/hình ảnh sản xuất đạt chuẩn hằng tuần',
      'Tỷ lệ tài nguyên đúng thời gian cam kết (>90%)',
      'Kiểm soát tỷ lệ file cần sửa đổi dưới 15%',
      'Quản lý tốt và không để xảy ra mất mát dữ liệu kho tài nguyên'
    ],
    tasks_in_progress: 2,
    tasks_completed: 24,
    tasks_overdue: 0,
    completion_rate: 92,
    performance_score: 93,
    notes: 'Điều phối đội ngũ năng nổ, tổ chức sản xuất media tháng 7 bám sát chỉ tiêu 35-40 clip.'
  },
  {
    id: 'tan_tn',
    name: 'Trần Nhật Tân',
    role: 'Marketing Media Edit',
    email: 'tan.tn@fugalo.vn',
    phone: '0908905565',
    specialist_group: 'Edit Video',
    manager_id: 'duy_lt',
    main_task: 'Dựng video clip, tạo kỹ xảo, chỉnh âm thanh và hoàn thiện các ấn phẩm video cho các nền tảng TikTok, Facebook, YouTube.',
    permissions: ['Tải lên tài nguyên', 'Tạo task tiến độ', 'Xem brief công việc'],
    responsibilities: [
      'Dựng và hiệu chỉnh video theo kịch bản và định hướng hình ảnh từ DOP.',
      'Đảm bảo đúng tiến độ bàn giao video cho các chiến dịch.'
    ],
    personal_kpis: [
      'Số lượng video dựng hoàn thành đạt tiêu chuẩn hằng tuần',
      'Tỷ lệ video đúng deadline chiến dịch (>85%)',
      'Tỷ lệ video phải sửa lại dưới 3 lần',
      'Khả năng bám sát brief nghệ thuật của DOP'
    ],
    tasks_in_progress: 3,
    tasks_completed: 30,
    tasks_overdue: 0,
    completion_rate: 91,
    performance_score: 88,
    notes: 'Tốc độ dựng nhanh, đã bàn giao toàn bộ các clip tuần 1 đúng cam kết chất lượng cao.'
  },
  {
    id: 'truong_pln',
    name: 'Phạm Lê Nhật Trường',
    role: 'Marketing Media Edit',
    email: 'truong.pln@fugalo.vn',
    phone: '0786255969',
    specialist_group: 'Edit Video',
    manager_id: 'duy_lt',
    main_task: 'Dựng video review dịch vụ, feedback khách hàng và biên tập các nội dung video phục vụ hoạt động Seeding và Ads.',
    permissions: ['Tải lên tài nguyên', 'Tạo task tiến độ', 'Xem brief công việc'],
    responsibilities: [
      'Biên tập video dạng ngắn (shorts/reels) với tần suất cao.',
      'Phối hợp với team Ads và Seeding để sản xuất nội dung quảng cáo tối ưu.'
    ],
    personal_kpis: [
      'Số lượng reels/shorts hoàn thành đúng chỉ tiêu tuần',
      'Tỷ lệ chuyển đổi thu hút từ video quảng cáo',
      'Tỷ lệ bàn giao video đúng deadline (>90%)',
      'Chủ động đề xuất các định dạng video quảng cáo mới'
    ],
    tasks_in_progress: 2,
    tasks_completed: 28,
    tasks_overdue: 0,
    completion_rate: 93,
    performance_score: 90,
    notes: 'Phối hợp hiệu quả với Seeding trong việc trích xuất file SRT phụ đề daily vlog.'
  },
  {
    id: 'long_pm',
    name: 'Phạm Minh Long',
    role: 'Marketing Photo/Video Shoot',
    email: 'long.pm@fugalo.vn',
    phone: '0977223040',
    specialist_group: 'Photo',
    manager_id: 'duy_lt',
    main_task: 'Thực hiện quay chụp hình ảnh, video sản phẩm, phóng sự thực tế tại Showroom, các Kiot và công trình Nội thất.',
    permissions: ['Tải lên tài nguyên thô', 'Đề xuất thiết bị quay chụp', 'Xem lịch sản xuất'],
    responsibilities: [
      'Quay video, chụp ảnh chất lượng cao các BST Hàng hiệu, căn hộ thi công.',
      'Bảo quản thiết bị máy ảnh, máy quay chuyên dụng của phòng.'
    ],
    personal_kpis: [
      'Số lượng bộ hình sản phẩm hoàn thành retouch hằng tuần',
      'Số giờ quay thực tế và đảm bảo dữ liệu thô sắc nét đạt chuẩn (>95%)',
      'Tỷ lệ bàn giao đúng hạn để team Edit dựng phim (>90%)',
      'Bảo trì tốt và không phát sinh sự cố hỏng hóc thiết bị do bất cẩn'
    ],
    tasks_in_progress: 2,
    tasks_completed: 35,
    tasks_overdue: 0,
    completion_rate: 95,
    performance_score: 94,
    notes: 'Làm việc năng nổ, chụp ảnh Kiot hằng ngày rất chuyên nghiệp, đúng kịch bản.'
  },
  {
    id: 'nhan_vt',
    name: 'Võ Trọng Nhân',
    role: 'Marketing Seeding Leader',
    email: 'nhan_vt@fugalo.vn',
    phone: '0969695671',
    specialist_group: 'Seeding',
    manager_id: 'an_hv',
    main_task: 'Lập kế hoạch seeding, quản trị các group cộng đồng cư dân/đồ hiệu, tổ chức bình luận định hướng dư luận và hỗ trợ livestream.',
    permissions: ['Phê duyệt kịch bản seeding', 'Quản lý tài khoản seeding', 'Xem báo cáo tương tác'],
    responsibilities: [
      'Xây dựng các bài viết chia sẻ kiến thức, tăng thảo luận tự nhiên về dịch vụ.',
      'Định hướng dư luận tránh các thông tin tiêu cực về thương hiệu.'
    ],
    personal_kpis: [
      'Tổng lượt tiếp cận tự nhiên hữu cơ của các chiến dịch seeding',
      'Số lượng bài thảo luận được phê duyệt đăng trên các group lớn',
      'Tỷ lệ phản hồi tích cực từ cộng đồng (>85%)',
      'Vận hành livestream mượt mà, hạn chế lỗi kỹ thuật hoặc comment xấu'
    ],
    tasks_in_progress: 2,
    tasks_completed: 22,
    tasks_overdue: 0,
    completion_rate: 91,
    performance_score: 92,
    notes: 'Quản lý tốt đội livestream và kiểm duyệt group cộng đồng trong tháng 7.'
  },
  {
    id: 'anh_vtp',
    name: 'Vũ Thị Phương Anh',
    role: 'Marketing Content Seeding',
    email: 'anh.vtp@fugalo.vn',
    phone: '0834567812',
    specialist_group: 'Seeding',
    manager_id: 'nhan_vt',
    main_task: 'Viết nội dung seeding, thực hiện tương tác bình luận trong các group, fanpage, hỗ trợ kiểm duyệt group cộng đồng.',
    permissions: ['Tạo kịch bản seeding', 'Quản lý group thành viên', 'Xem brief công việc'],
    responsibilities: [
      'Viết các kịch bản thảo luận hỏi đáp chân thực, không lộ dấu vết quảng cáo.',
      'Duy trì tương tác thường xuyên trên các group cộng đồng vệ tinh.'
    ],
    personal_kpis: [
      'Số lượng bài viết seeding đạt yêu cầu duyệt của Leader',
      'Số lượng tài khoản seeding hoạt động ổn định không bị khóa',
      'Tỷ lệ tương tác thảo luận tự nhiên trên mỗi bài đăng',
      'Hoàn thành đúng hạn các công việc được giao trong ngày (>90%)'
    ],
    tasks_in_progress: 1,
    tasks_completed: 40,
    tasks_overdue: 0,
    completion_rate: 98,
    performance_score: 93,
    notes: 'Nội dung seeding khéo léo, dọn dẹp group cư dân sạch sẽ và đúng định hướng.'
  },
  {
    id: 'chau_nha',
    name: 'Nguyễn Hồ Á Châu',
    role: 'Marketing Ads Social',
    email: 'chau.nha@fugalo.vn',
    phone: '0988776655',
    specialist_group: 'Ads Social',
    manager_id: 'an_hv',
    main_task: 'Thiết lập, phân bổ ngân sách và tối ưu hóa các chiến dịch quảng cáo trên các nền tảng mạng xã hội (Facebook, TikTok, Google).',
    permissions: ['Quản lý tài khoản quảng cáo', 'Phân bổ ngân sách ads', 'Đọc báo cáo chỉ số quảng cáo'],
    responsibilities: [
      'Phân bổ ngân sách ads hợp lý theo tỷ lệ được duyệt.',
      'Tối ưu hóa chi phí tiếp cận, chi phí tin nhắn và tăng chuyển đổi thực tế.'
    ],
    personal_kpis: [
      'Chi phí trên mỗi khách hàng tiềm năng đạt mục tiêu (CPA < 150k)',
      'Tỷ lệ chuyển đổi và ROAS đạt chỉ tiêu cam kết',
      'Báo cáo số liệu trung thực, cập nhật hằng ngày đúng giờ',
      'Tối ưu hóa phân phối quảng cáo dựa trên remarketing'
    ],
    tasks_in_progress: 2,
    tasks_completed: 24,
    tasks_overdue: 0,
    completion_rate: 92,
    performance_score: 91,
    notes: 'Tối ưu tốt ngân sách quảng cáo tháng 7 tập trung 50% cho phiên live.'
  }
];

export const sampleTasks: Task[] = [
  {
    task_id: 'TSK-101',
    task_name: 'Lên ý tưởng kịch bản & kế hoạch sản xuất Video Branding Fugalo 2026',
    description: 'Xây dựng kịch bản chi tiết và lập kế hoạch quay chụp video quảng bá thương hiệu Fugalo 2026 bám sát định hướng của DOP.',
    business_category: 'Thương hiệu chung',
    task_type: 'Kế hoạch Marketing',
    assignee: 'kiem_lh',
    collaborators: ['duy_lt', 'an_hv'],
    reviewer: 'an_hv',
    start_date: '2026-07-01',
    deadline: '2026-07-10',
    priority: 'Cao',
    status: 'Hoàn thành',
    progress_percentage: 100,
    attachments: ['Kich_ban_Video_Branding_Fugalo_2026_Final.pdf'],
    expected_delivery: 'File kịch bản hoàn thiện được phê duyệt bởi DOP và Trưởng phòng.',
    actual_delivery: 'Kịch bản đã hoàn thành xuất sắc và được duyệt vào ngày 09/07.',
    feedback_notes: 'Ý tưởng rất độc đáo, bám sát giá trị cốt lõi "Tái sinh giá trị" của thương hiệu.',
    delay_reason: '',
    actual_completion_date: '2026-07-09'
  },
  {
    task_id: 'TSK-102',
    task_name: 'Quay series "Review by Long" mảng phụ kiện LV',
    description: 'Setup ánh sáng và tiến hành quay 2 video review chi tiết các phụ kiện túi xách Hermes, Chanel, LV theo lịch quay của anh Long.',
    business_category: 'Hàng hiệu',
    task_type: 'Quay video',
    assignee: 'duy_lt',
    collaborators: ['kiem_lh', 'long_pm'],
    reviewer: 'kiem_lh',
    start_date: '2026-07-04',
    deadline: '2026-07-05',
    priority: 'Khẩn cấp',
    status: 'Hoàn thành',
    progress_percentage: 100,
    attachments: ['LV_Accessories_Raw_Footage.txt'],
    expected_delivery: 'Bàn giao đầy đủ file quay thô chất lượng cao 4K cận cảnh sản phẩm.',
    actual_delivery: 'Đã quay xong và tải lên Drive chung của team.',
    feedback_notes: 'Hình ảnh rất sắc nét, ánh sáng hài hòa, tôn vinh được đường nét của sản phẩm.',
    delay_reason: '',
    actual_completion_date: '2026-07-04'
  },
  {
    task_id: 'TSK-103',
    task_name: 'Dựng 4 clip biến hình (Anh Long) - Tuần 1',
    description: 'Biên tập và dựng 4 video clip biến hình sang trọng của Anh Long đăng tải trên các nền tảng Reels và TikTok.',
    business_category: 'Hàng hiệu',
    task_type: 'Dựng video',
    assignee: 'tan_tn',
    collaborators: ['truong_pln'],
    reviewer: 'duy_lt',
    start_date: '2026-07-01',
    deadline: '2026-07-05',
    priority: 'Cao',
    status: 'Hoàn thành',
    progress_percentage: 100,
    attachments: ['Clip_Bien_Hinh_T1_Final.mp4'],
    expected_delivery: '4 video định dạng 9:16 có hiệu ứng chuyển cảnh bắt mắt và nhạc nền cuốn hút.',
    actual_delivery: 'Đã dựng hoàn thiện và bàn giao đúng hạn.',
    feedback_notes: 'Dựng rất chuyên nghiệp, chuyển cảnh mượt mà, bắt trend tốt.',
    delay_reason: '',
    actual_completion_date: '2026-07-04'
  },
  {
    task_id: 'TSK-104',
    task_name: 'Dựng 2 clip review sản phẩm (Anh Tài) - Tuần 1',
    description: 'Dựng 2 video clip review túi và đồng hồ hàng hiệu cao cấp dựa trên source quay thực tế của anh Tài.',
    business_category: 'Hàng hiệu',
    task_type: 'Dựng video',
    assignee: 'tan_tn',
    collaborators: ['truong_pln'],
    reviewer: 'duy_lt',
    start_date: '2026-07-02',
    deadline: '2026-07-06',
    priority: 'Trung bình',
    status: 'Hoàn thành',
    progress_percentage: 100,
    attachments: ['Clip_Review_Tuan1_Tài_Final.mp4'],
    expected_delivery: '2 video review thời lượng dưới 2 phút, lồng ghép phụ đề đầy đủ.',
    actual_delivery: 'Đã hoàn thành và được duyệt.',
    feedback_notes: 'Nhịp video tốt, âm thanh giới thiệu rõ ràng.',
    delay_reason: '',
    actual_completion_date: '2026-07-05'
  },
  {
    task_id: 'TSK-105',
    task_name: 'Chụp ảnh hàng Kiot & retouch hình ảnh hằng ngày',
    description: 'Thực hiện chụp ảnh sản phẩm mới về tại Kiot hàng hiệu và tiến hành retouch, chỉnh sửa ánh sáng đạt chuẩn.',
    business_category: 'Hàng hiệu',
    task_type: 'Chụp ảnh',
    assignee: 'long_pm',
    collaborators: ['kiem_lh'],
    reviewer: 'duy_lt',
    start_date: '2026-07-01',
    deadline: '2026-07-31',
    priority: 'Cao',
    status: 'Đang làm',
    progress_percentage: 45,
    attachments: [],
    expected_delivery: 'Cập nhật ảnh sản phẩm retouch hàng ngày lên thư viện tài nguyên.',
    actual_delivery: 'Đã retouch hoàn thiện và upload ảnh của 12 mẫu túi mới về đầu tháng 7.',
    feedback_notes: 'Hình ảnh sắc nét, giữ đúng màu gốc của da túi.',
    delay_reason: '',
    actual_completion_date: ''
  },
  {
    task_id: 'TSK-106',
    task_name: 'Thiết lập & tối ưu chi phí Ads tháng 7',
    description: 'Phân bổ ngân sách ads mảng hàng hiệu & live: 20% cho 2 page tick xanh, 30% bài đăng page, 50% phiên live và tối ưu CPA hàng ngày.',
    business_category: 'Hàng hiệu',
    task_type: 'Chạy quảng cáo',
    assignee: 'chau_nha',
    collaborators: ['an_hv'],
    reviewer: 'an_hv',
    start_date: '2026-07-01',
    deadline: '2026-07-31',
    priority: 'Cao',
    status: 'Đang làm',
    progress_percentage: 40,
    attachments: [],
    expected_delivery: 'Báo cáo hiệu quả chi phí ads (ROAS/CPA) hàng tuần.',
    actual_delivery: 'Đã setup xong nhóm chiến dịch cho page tick xanh mới và tối ưu chuyển đổi trực tiếp.',
    feedback_notes: 'Cần bám sát số liệu thực tế để tăng giảm ngân sách linh hoạt.',
    delay_reason: '',
    actual_completion_date: ''
  },
  {
    task_id: 'TSK-107',
    task_name: 'Hỗ trợ vận hành các phiên livestream & tổng hợp feedback khách hàng',
    description: 'Hỗ trợ kỹ thuật âm thanh, chặn tài khoản quấy phá trong phiên live và lưu trữ video, feedback của khách hàng mảng hàng hiệu.',
    business_category: 'Hàng hiệu',
    task_type: 'Seeding',
    assignee: 'nhan_vt',
    collaborators: ['anh_vtp'],
    reviewer: 'an_hv',
    start_date: '2026-07-01',
    deadline: '2026-07-31',
    priority: 'Cao',
    status: 'Đang làm',
    progress_percentage: 35,
    attachments: [],
    expected_delivery: 'Livestream diễn ra thuận lợi, không gặp lỗi âm thanh, lưu feedback đầy đủ.',
    actual_delivery: 'Vận hành thành công 3 phiên live đầu tháng, đã lưu đầy đủ thông tin khách hàng tiềm năng.',
    feedback_notes: 'Rút kinh nghiệm kiểm tra mic kỹ trước khi live 15 phút.',
    delay_reason: '',
    actual_completion_date: ''
  },
  {
    task_id: 'TSK-108',
    task_name: 'Dựng video clip daily vlog từ anh Long (1 ngày 2 clip)',
    description: 'Dựng và chỉnh sửa video daily vlog ngắn từ anh Long, xuất file SRT gửi bên seeding để kiểm tra và phân phối.',
    business_category: 'Hàng hiệu',
    task_type: 'Dựng video',
    assignee: 'truong_pln',
    collaborators: ['nhan_vt'],
    reviewer: 'duy_lt',
    start_date: '2026-07-01',
    deadline: '2026-07-31',
    priority: 'Cao',
    status: 'Đang làm',
    progress_percentage: 35,
    attachments: [],
    expected_delivery: 'Xuất bản đều đặn 2 clip daily vlog mỗi ngày kèm file phụ đề SRT đạt chuẩn.',
    actual_delivery: 'Đã hoàn thiện đúng tiến độ 10 clip trong tuần đầu tiên.',
    feedback_notes: 'Nội dung gần gũi, truyền tải thông điệp tự nhiên.',
    delay_reason: '',
    actual_completion_date: ''
  },
  {
    task_id: 'TSK-109',
    task_name: 'Duy trì tương tác seeding và phê duyệt thành viên Group',
    description: 'Triển khai 8-12 bài share/tháng trong group cộng đồng, kiểm tra và ẩn bình luận rác không phù hợp.',
    business_category: 'Thương hiệu chung',
    task_type: 'Seeding',
    assignee: 'anh_vtp',
    collaborators: ['nhan_vt'],
    reviewer: 'nhan_vt',
    start_date: '2026-07-01',
    deadline: '2026-07-31',
    priority: 'Trung bình',
    status: 'Đang làm',
    progress_percentage: 30,
    attachments: [],
    expected_delivery: 'Các bài share nhận được tương tác tự nhiên, dọn dẹp group sạch sẽ.',
    actual_delivery: 'Đã duyệt hơn 200 thành viên mới và share thành công 3 bài viết chất lượng.',
    feedback_notes: 'Lọc kỹ để tránh nick clone phá hoại group.',
    delay_reason: '',
    actual_completion_date: ''
  },
  {
    task_id: 'TSK-110',
    task_name: 'Dựng 3 clip đồ hiệu (Anh Long) - Tuần 2',
    description: 'Dựng 3 clip chuyên sâu phân tích tháp đồ hiệu, góc nhìn chuyên gia về các thương hiệu Hermes, Chanel, LV.',
    business_category: 'Hàng hiệu',
    task_type: 'Dựng video',
    assignee: 'tan_tn',
    collaborators: ['kiem_lh'],
    reviewer: 'duy_lt',
    start_date: '2026-07-09',
    deadline: '2026-07-15',
    priority: 'Cao',
    status: 'Đang làm',
    progress_percentage: 20,
    attachments: [],
    expected_delivery: 'Video phân tích sâu sắc, phụ đề rõ ràng, hình ảnh chèn khớp bối cảnh.',
    actual_delivery: 'Đang lên timeline và ghép thô phân cảnh đầu tiên.',
    feedback_notes: '',
    delay_reason: '',
    actual_completion_date: ''
  }
];

export const sampleProductionSchedules: ProductionSchedule[] = [
  {
    production_id: 'PROD-JUL-001',
    production_date: '2026-07-04',
    business_category: 'Hàng hiệu',
    content: 'Quay video series "Review by Long" & "Góc nhìn của Long" tại Showroom',
    production_type: 'Quay',
    assignee: 'duy_lt',
    participants: ['tan_tn', 'truong_pln', 'long_pm'],
    location: 'Showroom Fugalo Quốc lộ 1K',
    brief_script: 'Quay 2 sản phẩm review (túi hiệu/đồng hồ) và ghi hình 2 clip chia sẻ quan điểm của anh Long về công việc, cuộc sống.',
    resources_needed: 'Sony A7S3, ống kính 50mm f1.2, bộ micro không dây, kịch bản chi tiết.',
    delivery_deadline: '17:00',
    status: 'Đã duyệt',
    notes: 'Sản lượng đã bàn giao đầy đủ cho team edit, DOP hài lòng.'
  },
  {
    production_id: 'PROD-JUL-002',
    production_date: '2026-07-10',
    business_category: 'Hàng hiệu',
    content: 'Quay video review túi, đồng hồ cao cấp với Anh Tài',
    production_type: 'Quay',
    assignee: 'long_pm',
    participants: ['duy_lt', 'tan_tn', 'anh_vtp'],
    location: 'Showroom Fugalo Quốc lộ 1K',
    brief_script: 'Quay 2 clip review sản phẩm hàng hiệu cận cảnh chất liệu và kiểu dáng.',
    resources_needed: 'Bục xoay sản phẩm, phông nền nhung đen, đèn led softbox.',
    delivery_deadline: '15:00',
    status: 'Đang thực hiện',
    notes: 'Chuẩn bị đầy đủ thiết bị, kiểm tra pin và thẻ nhớ trước giờ quay.'
  }
];

export const sampleCampaigns: Campaign[] = [
  {
    campaign_id: 'CAM-JUL-001',
    campaign_name: 'Phát triển Thương hiệu cá nhân & Định vị Fugalo',
    business_category: 'Thương hiệu chung',
    goal: 'Xây dựng thương hiệu anh Long là chuyên gia & người truyền cảm hứng; củng cố hình ảnh Fugalo là công ty đa lĩnh vực chuyên nghiệp, minh bạch, đáng tin cậy.',
    start_date: '2026-07-01',
    end_date: '2026-07-31',
    owner: 'an_hv',
    participants: ['an_hv', 'kiem_lh', 'duy_lt', 'tan_tn', 'truong_pln', 'long_pm', 'nhan_vt', 'anh_vtp', 'chau_nha'],
    task_ids: ['TSK-101', 'TSK-102', 'TSK-103', 'TSK-104', 'TSK-105', 'TSK-106', 'TSK-107', 'TSK-108', 'TSK-109', 'TSK-110'],
    content_production: '10 clip chia sẻ quan điểm, 10 clip tháp đồ hiệu, các series talkshow tự sự và talkshow những người đồng hành.',
    media_production: '~35-40 video ngắn và 5 bộ ảnh beauty của các hãng Hermes, Chanel, LV, Gucci, Balenciaga.',
    ads_deployment: 'Chiến dịch quảng cáo phân bổ: 20% page tick xanh mới, 30% bài đăng trên page, 50% các phiên live.',
    seeding_deployment: 'Chia sẻ bài viết từ fanpage đến group Facebook (tần suất T2, T5 hàng tuần); Seeding thảo luận tự nhiên trong phiên livestream.',
    estimated_budget: 100000000,
    actual_budget: 35000000,
    status: 'Đang triển khai',
    achieved_results: 'Tuần 1 hoàn thành xuất sắc các clip biến hình và review, livestream hoạt động ổn định, thu hút 50k reach.',
    post_evaluation: 'Chiến dịch bám sát kế hoạch tháng 7, nội dung có chiều sâu được khán giả phản hồi tích cực.',
    improvement_proposals: 'Tăng cường chạy ads trong các khung giờ vàng livestream để thu hút thêm người xem trực tiếp.'
  }
];

export const sampleKpis: KpiAssignment[] = [
  {
    kpi_id: 'KPI-101',
    staff_id: 'an_hv',
    role: 'Marketing Manager',
    evaluation_month: '07/2026',
    kpi_name: 'Tỷ lệ hoàn thành kế hoạch Marketing tháng 7',
    target_value: '95% kế hoạch phòng đạt tiến độ',
    actual_value: '96% kế hoạch đang vận hành đúng tiến trình',
    completion_rate: 101,
    kpi_score: 96,
    manager_feedback: 'Hoàn thành vượt mục tiêu của tuần đầu, điều phối mượt mà.',
    action_proposal: 'Giữ vững phong độ',
    status: 'Đã chốt điểm'
  },
  {
    kpi_id: 'KPI-102',
    staff_id: 'kiem_lh',
    role: 'Marketing DOP',
    evaluation_month: '07/2026',
    kpi_name: 'Concept & kịch bản Branding và series Review',
    target_value: 'Duyệt kịch bản branding và quay 10 clip Review',
    actual_value: 'Đã duyệt kịch bản và hoàn thành quay 4 clip',
    completion_rate: 45,
    kpi_score: 92,
    manager_feedback: 'Kịch bản rất sáng tạo, khâu setup hình ảnh rất chỉn chu.',
    action_proposal: 'Giữ vững phong độ',
    status: 'Chờ cấp trên duyệt'
  },
  {
    kpi_id: 'KPI-103',
    staff_id: 'duy_lt',
    role: 'Marketing Media Leader',
    evaluation_month: '07/2026',
    kpi_name: 'Đảm bảo tổng sản lượng Media tháng 7',
    target_value: '35-40 video & 5 bộ hình đạt chuẩn bàn giao',
    actual_value: 'Bàn giao 10 video & 2 bộ ảnh đạt chuẩn',
    completion_rate: 28,
    kpi_score: 91,
    manager_feedback: 'Tiến độ rất ổn định, quản lý team sản xuất tốt.',
    action_proposal: 'Giữ vững phong độ',
    status: 'Chờ cấp trên duyệt'
  },
  {
    kpi_id: 'KPI-104',
    staff_id: 'tan_tn',
    role: 'Marketing Media Edit',
    evaluation_month: '07/2026',
    kpi_name: 'Dựng video daily vlog & clip tuần đúng hạn',
    target_value: '1-2 video daily vlog/ngày, dựng đúng hạn',
    actual_value: 'Dựng xong 4 clip biến hình + 2 clip review + 2 clip quan điểm',
    completion_rate: 100,
    kpi_score: 90,
    manager_feedback: 'Bàn giao đúng hạn, kỹ xảo và nhạc nền rất lôi cuốn.',
    action_proposal: 'Giữ vững phong độ',
    status: 'Chờ cấp trên duyệt'
  },
  {
    kpi_id: 'KPI-105',
    staff_id: 'chau_nha',
    role: 'Marketing Ads Social',
    evaluation_month: '07/2026',
    kpi_name: 'Tối ưu ngân sách quảng cáo & ROAS/CPA',
    target_value: 'Phân bổ ngân sách ads đúng tỷ lệ & tối ưu chi phí CPA',
    actual_value: 'Đã setup nhóm ads 2 page tick xanh, tối ưu CPA < 135k',
    completion_rate: 105,
    kpi_score: 93,
    manager_feedback: 'Kiểm soát chi phí quảng cáo rất tốt, giữ vững hiệu quả.',
    action_proposal: 'Giữ vững phong độ',
    status: 'Chờ cấp trên duyệt'
  }
];

export const sampleReports: WorkReport[] = [
  {
    report_id: 'RPT-101',
    reporter_id: 'duy_lt',
    report_date: '2026-07-07',
    report_type: 'Tuần',
    completed_tasks_summary: 'Sản xuất kịch bản và hoàn thành quay chụp series "Review by Long" mảng LV (TSK-102), dựng hoàn thiện 4 clip biến hình (TSK-103) và 2 clip review sản phẩm (TSK-104) đúng hạn.',
    pending_tasks_summary: 'Dựng 3 clip tháp đồ hiệu (TSK-110) đang lên timeline chi tiết.',
    overdue_tasks_summary: 'Không có công việc nào trễ hạn.',
    overdue_reason: '',
    results_achieved: 'Bàn giao 100% video và ảnh sản lượng tuần 1 đạt chuẩn chất lượng cao, nhận được phản hồi rất tốt từ người xem.',
    issues_encountered: 'Một số tệp video thô của anh Long dung lượng khá lớn, mất nhiều thời gian upload lên Drive.',
    proposed_solutions: 'Đề xuất nén file zip hoặc nâng cấp gói truyền tải của showroom.',
    support_needed: 'Hỗ trợ thiết bị đầu đọc thẻ tốc độ cao cho team Photo.',
    next_plans: 'Triển khai quay phim review với Anh Tài và dựng 3 clip tháp đồ hiệu tuần 2.',
    reviewer_id: 'an_hv',
    status: 'Đã duyệt'
  }
];

export const sampleEvaluations: PersonnelEvaluation[] = [
  {
    evaluation_id: 'EVAL-101',
    staff_id: 'duy_lt',
    evaluator_id: 'an_hv',
    month: '07/2026',
    kpi_points: 46,
    deadline_points: 18,
    quality_points: 14,
    proactive_points: 9,
    teamwork_points: 5,
    total_score: 92,
    classification: 'Xuất sắc',
    strengths: 'Quản lý team sản xuất năng nổ, bàn giao đầy đủ sản lượng tuần 1 đạt chuẩn DOP phê duyệt.',
    weaknesses: 'Chưa có điểm yếu đáng kể.',
    proposed_action: 'Tiếp tục duy trì phong độ và nhân rộng mô hình điều phối cho tuần tiếp theo.',
    notes: 'Nhân sự quản lý có tinh thần trách nhiệm cao.'
  }
];

export const sampleProposals: Proposal[] = [
  {
    proposal_id: 'PRP-101',
    proposer_id: 'an_hv',
    proposal_date: '2026-07-02',
    issue_description: 'Chi phí tiếp cận và lượt mắt livestream trên TikTok mảng đồ hiệu của Fugalo có xu hướng bão hòa do tệp phân phối hẹp.',
    business_category: 'Hàng hiệu',
    evidence: 'Mắt xem trung bình ở phiên live tối thứ 3 giảm 15% so với tuần trước đó.',
    root_cause: 'Chưa sử dụng tính năng remarketing và chạy quảng cáo nhắm mục tiêu mắt xem trực tiếp qua page tick xanh của anh Long.',
    proposed_solution: 'Triển khai phân bổ ngân sách: 20% cho 2 page tick xanh, 30% cho bài viết và 50% chạy trực tiếp thúc đẩy mắt xem phiên live.',
    expected_benefits: 'Lượt mắt xem tăng 30-45%, tăng tỷ lệ chốt đơn trực tiếp trên sóng livestream mảng đồ hiệu.',
    resources_needed: 'Ngân sách ads từ tài khoản doanh nghiệp, bài đăng content chất lượng cao từ anh Long.',
    timeline: 'Áp dụng ngay từ tuần 1 tháng 7/2026.',
    owner_id: 'chau_nha',
    status: 'Đang triển khai',
    post_deployment_result: 'Hiệu quả rõ rệt, lượt mắt xem phiên live ngày 05/07 đã tăng trưởng vượt bậc, doanh số chốt đơn tăng 20%.'
  }
];

export const sampleResources: Resource[] = [
  {
    resource_id: 'RES-101',
    title: 'Kịch bản chi tiết Video Branding thương hiệu Fugalo 2026',
    resource_type: 'Kịch bản',
    business_category: 'Thương hiệu chung',
    campaign_id: 'CAM-JUL-001',
    creator_id: 'kiem_lh',
    created_date: '2026-07-08',
    file_link: 'https://docs.google.com/document/d/fugalo_branding_2026',
    status: 'Đã duyệt',
    notes: 'Kịch bản chính thức đã được Trưởng phòng phê duyệt, sẵn sàng bấm máy.'
  }
];

export const sampleWebhooks: WebhookConfig[] = [
  {
    id: 'quan_ly',
    groupName: 'Quản lý',
    webhookUrl: '',
    isActive: false,
    description: 'Nhận thông báo quan trọng từ Trưởng phòng Marketing & Ban giám đốc.'
  },
  {
    id: 'dop',
    groupName: 'DOP',
    webhookUrl: '',
    isActive: false,
    description: 'Kênh nhận thông báo trễ hạn và cần sửa của tổ chức đạo diễn hình ảnh và quay phim.'
  },
  {
    id: 'media',
    groupName: 'Media',
    webhookUrl: '',
    isActive: false,
    description: 'Kênh thông báo cho tổ media, chạy quảng cáo Ads, thiết kế và truyền thông.'
  },
  {
    id: 'edit_video',
    groupName: 'Edit Video',
    webhookUrl: '',
    isActive: false,
    description: 'Kênh thông báo cho tổ dựng video, xử lý hiệu ứng và hậu kỳ âm thanh.'
  },
  {
    id: 'photo',
    groupName: 'Photo',
    webhookUrl: '',
    isActive: false,
    description: 'Kênh thông báo cho tổ chụp ảnh sản phẩm, chụp ảnh ngoại cảnh và chỉnh sửa hình ảnh.'
  },
  {
    id: 'seeding',
    groupName: 'Seeding',
    webhookUrl: '',
    isActive: false,
    description: 'Kênh thông báo cho tổ seeding fanpage, group, bình luận định hướng dư luận.'
  },
  {
    id: 'ads_social',
    groupName: 'Ads Social',
    webhookUrl: '',
    isActive: false,
    description: 'Kênh thông báo cho tổ tối ưu hóa chiến dịch quảng cáo Facebook, TikTok, Google.'
  }
];

export const samplePlans: WorkPlan[] = [
  {
    plan_id: 'PLN-101',
    creator_id: 'an_hv',
    plan_type: 'Tháng',
    period_name: 'Tháng 07/2026',
    target_goals: '1. Phát triển thương hiệu cá nhân anh Long (Tập trung series "Review by Long" & Góc nhìn của Long) và củng cố hình ảnh Fugalo chuyên nghiệp, minh bạch.\n2. Đạt tổng sản lượng Media tháng: ~35-40 video & 5 bộ hình chất lượng cao.\n3. Triển khai phân bổ ngân sách Ads tháng 7: 20% cho 2 page tick xanh, 30% cho bài đăng page, 50% cho các phiên live.\n4. Vận hành livestream mượt mà, kiểm tra âm thanh, chặn tài khoản quấy phá & kiểm soát phản hồi khách hàng.',
    key_results: '- Quay đúng lịch series "Review by Long" và hoàn thành Video Branding Fugalo 2026.\n- Đăng đầy đủ và đúng lịch: 4 clip biến hình, 2-3 bộ hình, clip review và clip quan điểm mỗi tuần.\n- Đảm bảo tỷ lệ video thô đạt chuẩn và bàn giao đúng deadline (>90%).\n- Tối ưu hóa chi phí quảng cáo hàng ngày & remarketing hiệu quả.',
    tasks_list: '- Sản xuất 35-40 video content mảng hàng hiệu & thương hiệu cá nhân.\n- Đăng tải đều đặn bài viết seeding và quản trị tương tác livestream.\n- Thiết lập ngân sách ads tối ưu chi phí CPA dưới 150k.',
    notes: 'Kế hoạch trọng điểm tháng 7 của phòng Marketing, yêu cầu toàn bộ ekip bám sát KPI cá nhân.',
    reviewer_id: 'an_hv',
    status: 'Đang triển khai',
    created_at: '2026-07-01'
  },
  {
    plan_id: 'PLN-102',
    creator_id: 'an_hv',
    plan_type: 'Tuần',
    period_name: 'Tuần 1 (01/07 - 07/07/2026)',
    target_goals: '1. Triển khai tuần khởi động (Warm up & xả hàng tồn): dựng & đăng 4 clip biến hình, 2-3 bộ hình, 2 clip review (Anh Tài) và 2 clip quan điểm (Anh Long).\n2. Hỗ trợ quay Video Branding Fugalo và series Review by Long.\n3. Chụp ảnh hàng Kiosk mỗi ngày và chỉnh sửa hình ảnh.',
    key_results: '- Hoàn thành dựng và đăng tải 100% video tuần 1 đúng tiến độ.\n- Ekip quay chụp phối hợp nhịp nhàng, đảm bảo đầy đủ dữ liệu thô.',
    tasks_list: '1. Quay series Review LV (TSK-102) - Phụ trách: Duy LT.\n2. Dựng 4 clip biến hình (TSK-103) - Phụ trách: Tân TN.\n3. Chụp ảnh hàng Kiot & retouch (TSK-105) - Phụ trách: Long PM.\n4. Trích xuất file phụ đề SRT daily vlog (TSK-108) - Phụ trách: Trường PLN.',
    notes: 'Tuần khởi động quan trọng, tất cả các sản phẩm đầu ra đã đạt chất lượng xuất sắc đúng tiến độ.',
    reviewer_id: 'an_hv',
    status: 'Đã chốt',
    created_at: '2026-07-01'
  }
];

export const sampleDailyLogs: DailyLog[] = [
  {
    log_id: 'LOG-101',
    creator_id: 'tan_tn',
    log_date: '2026-07-04',
    checklist_items: [
      { id: 'item-1', text: 'Dựng xong 4 clip biến hình tuần 1', completed: true },
      { id: 'item-2', text: 'Xuất file demo gửi DOP duyệt chất lượng', completed: true },
      { id: 'item-3', text: 'Bàn giao file hoàn thiện định dạng mp4 lên NAS', completed: true }
    ],
    linked_task_ids: ['TSK-103'],
    achievements: 'Hoàn thành bàn giao toàn bộ video tuần 1 đúng hạn, chuyển cảnh bắt trend mượt mà.',
    challenges: 'File quay thô từ máy cơ khá nặng nên khâu render tốn nhiều thời gian hơn.',
    created_at: '2026-07-04 17:30:00'
  },
  {
    log_id: 'LOG-102',
    creator_id: 'long_pm',
    log_date: '2026-07-05',
    checklist_items: [
      { id: 'item-1', text: 'Chụp ảnh 12 mẫu túi hiệu mới về tại Kiot', completed: true },
      { id: 'item-2', text: 'Retouch và chỉnh màu ánh sáng chân thực', completed: true },
      { id: 'item-3', text: 'Tải lên thư viện tài nguyên mảng Hàng hiệu', completed: true }
    ],
    linked_task_ids: ['TSK-105'],
    achievements: 'Màu sắc túi xách sau retouch giữ đúng độ sang trọng gốc của thương hiệu.',
    challenges: 'Có một số mẫu túi bằng chất liệu da bóng khó xử lý phản sáng, đã tăng thêm tấm hắt sáng hỗ trợ.',
    created_at: '2026-07-05 16:45:00'
  }
];
