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
  WorkPlan
} from '../types';

export const teamMembers: TeamMember[] = [
  {
    id: 'an_hv',
    name: 'Hồ Văn An',
    role: 'Marketing Manager',
    email: 'an.hv@fugalo.vn',
    phone: '0939810086',
    specialist_group: 'Quản lý',
    manager_id: 'director', // Cấp trên trực tiếp (Giám đốc thương hiệu)
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
    tasks_in_progress: 2,
    tasks_completed: 18,
    tasks_overdue: 0,
    completion_rate: 90,
    performance_score: 95,
    notes: 'Quản lý bao quát tốt, định hướng chiến lược rõ ràng, cần đẩy mạnh hỗ trợ đào tạo chuyên môn cho các nhân sự mới.'
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
    tasks_in_progress: 3,
    tasks_completed: 15,
    tasks_overdue: 1,
    completion_rate: 88,
    performance_score: 89,
    notes: 'Gu thẩm mỹ cực kỳ tốt, làm việc rất có tâm huyết. Đôi lúc việc setup quay chụp bị kéo dài dẫn tới trễ hạn nhẹ.'
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
    tasks_completed: 21,
    tasks_overdue: 0,
    completion_rate: 91,
    performance_score: 92,
    notes: 'Điều phối đội ngũ năng nổ, giao tiếp nội bộ tốt. Cần tối ưu quy trình lưu trữ ổ cứng chung của team.'
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
    tasks_in_progress: 4,
    tasks_completed: 25,
    tasks_overdue: 1,
    completion_rate: 85,
    performance_score: 83,
    notes: 'Kỹ năng dựng video tốt, bắt trend nhanh. Đôi lúc cần lưu ý kiểm tra kỹ chính tả text trên video trước khi xuất bản.'
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
    tasks_in_progress: 3,
    tasks_completed: 24,
    tasks_overdue: 0,
    completion_rate: 89,
    performance_score: 86,
    notes: 'Làm việc năng suất, chủ động phối hợp rất tốt với nhóm Ads xã hội để chỉnh sửa video tối ưu chuyển đổi.'
  },
  {
    id: 'long_pm',
    name: 'Phạm Minh Long',
    role: 'Marketing Photo',
    email: 'long.pm@fugalo.vn',
    phone: '0343098873',
    specialist_group: 'Photo',
    manager_id: 'duy_lt',
    main_task: 'Chụp ảnh sản phẩm hàng hiệu, chụp ảnh công trình thi công nội thất thực tế, chụp ảnh chân dung và sự kiện.',
    permissions: ['Tải lên tài nguyên', 'Tạo đề xuất thiết bị', 'Xem lịch quay chụp'],
    responsibilities: [
      'Thực hiện chụp ảnh chất lượng cao theo đúng tinh thần sang trọng của FUGALO.',
      'Chỉnh sửa hậu kỳ hình ảnh (ánh sáng, màu sắc, bố cục) đạt chuẩn.'
    ],
    personal_kpis: [
      'Số bộ ảnh hoàn thiện bàn giao đúng hạn',
      'Tỷ lệ ảnh đạt chuẩn sử dụng được ngay trên website/fanpage (>95%)',
      'Bảo quản tốt thiết bị quay chụp của công ty',
      'Tốc độ bàn giao ảnh sau sự kiện hoặc buổi chụp (<48h)'
    ],
    tasks_in_progress: 2,
    tasks_completed: 29,
    tasks_overdue: 0,
    completion_rate: 93,
    performance_score: 94,
    notes: 'Nhiệt tình, tay nghề cao, chỉnh màu sắc hàng hiệu cực kỳ sang trọng. Được các đối tác đánh giá rất cao.'
  },
  {
    id: 'nhan_vt',
    name: 'Võ Trọng Nhân',
    role: 'Marketing Seeding Leader',
    email: 'nhan.vt@fugalo.vn',
    phone: '0587958126',
    specialist_group: 'Seeding',
    manager_id: 'an_hv',
    main_task: 'Lập kế hoạch seeding, quản lý nhóm seeding, xây dựng kịch bản thảo luận tự nhiên trên mạng xã hội để quảng bá dịch vụ FUGALO.',
    permissions: ['Giao việc nhóm seeding', 'Xem báo cáo seeding', 'Đề xuất ngân sách mua tài khoản'],
    responsibilities: [
      'Lập kế hoạch seeding định hướng dư luận phù hợp với định vị cao cấp.',
      'Theo dõi phản hồi trái chiều và xử lý các rủi ro truyền thông trên mạng xã hội.'
    ],
    personal_kpis: [
      'Số lượng kế hoạch seeding hoàn thành đạt chất lượng',
      'Số lượng hội nhóm/kênh seeding lớn tiếp cận thành công',
      'Xây dựng kịch bản seeding tự nhiên không bị phát hiện quảng cáo',
      'Báo cáo insight thị trường và phản hồi của người tiêu dùng đúng hạn'
    ],
    tasks_in_progress: 3,
    tasks_completed: 19,
    tasks_overdue: 0,
    completion_rate: 86,
    performance_score: 88,
    notes: 'Kinh nghiệm dày dặn, nhạy bén với thông tin thị trường. Cần mở rộng thêm các kênh seeding trên TikTok/YouTube.'
  },
  {
    id: 'anh_vtp',
    name: 'Vũ Thị Phương Anh',
    role: 'Marketing Seeding',
    email: 'anh.vtp@fugalo.vn',
    phone: '0342659358',
    specialist_group: 'Seeding',
    manager_id: 'nhan_vt',
    main_task: 'Thực thi các hoạt động seeding hàng ngày: đăng bài thảo luận, bình luận khơi gợi nhu cầu, tương tác trong các nhóm nội thất/hàng hiệu.',
    permissions: ['Cập nhật tiến độ task', 'Gửi báo cáo seeding', 'Lưu trữ kịch bản'],
    responsibilities: [
      'Đảm bảo số lượng bài viết và bình luận seeding chất lượng đúng chỉ tiêu.',
      'Quản lý hệ thống tài khoản seeding hoạt động ổn định, không bị khóa.'
    ],
    personal_kpis: [
      'Số lượng bài viết/bình luận chất lượng hoàn thành hàng ngày (>40)',
      'Tỷ lệ bài viết seeding không bị kiểm duyệt viên xóa (>90%)',
      'Số lượng group tương tác chất lượng cao duy trì thường xuyên',
      'Báo cáo đầy đủ danh sách link seeding định kỳ hằng ngày'
    ],
    tasks_in_progress: 1,
    tasks_completed: 35,
    tasks_overdue: 0,
    completion_rate: 97,
    performance_score: 91,
    notes: 'Rất chăm chỉ, viết content seeding rất khéo léo và tự nhiên. Quản lý tài khoản vệ tinh rất tốt.'
  },
  {
    id: 'chau_nha',
    name: 'Nguyễn Hồ Á Châu',
    role: 'Marketing Ads Social',
    email: 'chau.nha@fugalo.vn',
    phone: '0889805815',
    specialist_group: 'Ads Social',
    manager_id: 'an_hv',
    main_task: 'Thiết lập chiến dịch quảng cáo, theo dõi tối ưu chi phí quảng cáo (Facebook, TikTok, Google) cho các mảng dịch vụ FUGALO.',
    permissions: ['Đề xuất ngân sách quảng cáo', 'Xem số liệu chuyển đổi', 'Tạo yêu cầu media thiết kế'],
    responsibilities: [
      'Quản lý ngân sách chạy quảng cáo được giao, đảm bảo hiệu quả chi phí tối ưu.',
      'Thử nghiệm liên tục các tệp đối tượng và các mẫu quảng cáo (A/B testing).'
    ],
    personal_kpis: [
      'Số chiến dịch quảng cáo triển khai thành công đúng kế hoạch',
      'Hiệu quả chi phí quảng cáo (CPA/ROAS) đạt cam kết tối ưu',
      'Phối hợp tốt với team Content và Media để sản xuất mẫu quảng cáo chất lượng',
      'Báo cáo số liệu quảng cáo trung thực, đúng hạn định kỳ'
    ],
    tasks_in_progress: 3,
    tasks_completed: 20,
    tasks_overdue: 0,
    completion_rate: 87,
    performance_score: 90,
    notes: 'Kỹ thuật ads tốt, tối ưu tệp đối tượng rất chính xác. Cần cập nhật thêm chính sách quảng cáo hàng hiệu mới của TikTok.'
  }
];

export const sampleTasks: Task[] = [
  {
    task_id: 'TSK-001',
    task_name: 'Lập kế hoạch Marketing Quý 3/2026',
    description: 'Xây dựng kế hoạch tổng thể, thông điệp truyền thông chính và phân bổ ngân sách dự kiến cho 3 mảng dịch vụ chính của Fugalo.',
    business_category: 'Thương hiệu chung',
    task_type: 'Kế hoạch Marketing',
    assignee: 'an_hv',
    collaborators: ['kiem_lh', 'duy_lt', 'nhan_vt', 'chau_nha'],
    reviewer: 'an_hv', // Tự duyệt sau khi thảo luận Ban Giám Đốc
    start_date: '2026-06-15',
    deadline: '2026-06-23',
    priority: 'Cao',
    status: 'Hoàn thành',
    progress_percentage: 100,
    attachments: ['Ke_hoach_Marketing_Fugalo_Q3_2026_v1.pdf'],
    expected_delivery: 'Slide trình chiếu kế hoạch chi tiết + File Excel phân bổ ngân sách cho từng mảng dịch vụ.',
    actual_delivery: 'Đã hoàn thành và được Ban Giám đốc thông qua vào cuộc họp ngày 23/06.',
    feedback_notes: 'Kế hoạch chi tiết, bám sát thực tế thị trường. Cần lưu ý tối ưu thêm ngân sách mảng Hàng hiệu.',
    delay_reason: '',
    actual_completion_date: '2026-06-23'
  },
  {
    task_id: 'TSK-002',
    task_name: 'Quay video review túi Hermes ký gửi thành công',
    description: 'Lên concept, setup bối cảnh và tiến hành quay clip review chi tiết chiếc túi Hermes Birkin được khách hàng ký gửi thành công tại showroom.',
    business_category: 'Hàng hiệu',
    task_type: 'Quay video',
    assignee: 'duy_lt',
    collaborators: ['kiem_lh', 'long_pm'],
    reviewer: 'kiem_lh',
    start_date: '2026-06-20',
    deadline: '2026-06-22',
    priority: 'Khẩn cấp',
    status: 'Hoàn thành',
    progress_percentage: 100,
    attachments: ['Hermes_Review_Raw_Footage_Link.txt'],
    expected_delivery: 'File video quay thô chất lượng 4K, đủ các góc cận cảnh chi tiết da, khóa, đường khâu túi Hermes Birkin.',
    actual_delivery: 'Đã quay xong và lưu trữ trên Google Drive chung của team media.',
    feedback_notes: 'Hình ảnh setup ánh sáng đẹp, tôn lên chất lượng da của túi Hermes cực tốt. Chuyển tiếp ngay cho team dựng.',
    delay_reason: '',
    actual_completion_date: '2026-06-22'
  },
  {
    task_id: 'TSK-003',
    task_name: 'Dựng video review túi Hermes Birkin lên TikTok',
    description: 'Từ các source quay thô, dựng clip TikTok thời lượng 60s, chèn nhạc sang trọng, lồng tiếng giới thiệu quy trình kiểm định Entrupy uy tín tại showroom.',
    business_category: 'Hàng hiệu',
    task_type: 'Dựng video',
    assignee: 'tan_tn',
    collaborators: ['truong_pln'],
    reviewer: 'duy_lt',
    start_date: '2026-06-22',
    deadline: '2026-06-24',
    priority: 'Cao',
    status: 'Chờ duyệt',
    progress_percentage: 95,
    attachments: ['Fugalo_Hermes_Birkin_TikTok_v1.mp4'],
    expected_delivery: 'Video định dạng dọc 9:16, độ phân giải 1080p, có phụ đề đầy đủ, không dính bản quyền âm nhạc.',
    actual_delivery: 'Đã hoàn tất dựng bản đầu tiên và gửi lên nhóm duyệt.',
    feedback_notes: 'Video dựng mượt mà, nhưng cần chỉnh âm thanh lồng tiếng to rõ hơn một chút và làm sáng góc logo Fugalo.',
    delay_reason: '',
    actual_completion_date: ''
  },
  {
    task_id: 'TSK-004',
    task_name: 'Chụp ảnh công trình hoàn thiện căn biệt thự Phúc Đạt',
    description: 'Di chuyển xuống hiện trường biệt thự Phúc Đạt - Quốc lộ 1K để thực hiện chụp bộ ảnh hoàn thiện nội thất phòng khách, phòng bếp và phòng ngủ master.',
    business_category: 'Nội thất',
    task_type: 'Chụp ảnh',
    assignee: 'long_pm',
    collaborators: ['kiem_lh'],
    reviewer: 'kiem_lh',
    start_date: '2026-06-21',
    deadline: '2026-06-23',
    priority: 'Cao',
    status: 'Hoàn thành',
    progress_percentage: 100,
    attachments: ['Phuc_Dat_Villa_Interior_Raw.zip'],
    expected_delivery: 'Tối thiểu 30 tấm ảnh chụp các góc độ căn phòng khách, phòng ngủ master đã được sắp xếp decor hoàn chỉnh.',
    actual_delivery: 'Đã chụp xong, lọc được 45 tấm ảnh chất lượng xuất sắc và bàn giao file thô.',
    feedback_notes: 'Bố cục rất đẹp, góc rộng khai thác được tối đa chiều sâu không gian căn biệt thự.',
    delay_reason: '',
    actual_completion_date: '2026-06-23'
  },
  {
    task_id: 'TSK-005',
    task_name: 'Viết nội dung giới thiệu BST Trang sức phong thủy đá quý',
    description: 'Biên soạn bộ bài viết 3 bài đăng trên fanpage giới thiệu BST Vòng tay phong thủy đá Thạch Anh và cách chọn màu sắc hợp bản mệnh năm 2026.',
    business_category: 'Phong thủy',
    task_type: 'Viết nội dung',
    assignee: 'nhan_vt',
    collaborators: ['anh_vtp'],
    reviewer: 'an_hv',
    start_date: '2026-06-23',
    deadline: '2026-06-25',
    priority: 'Trung bình',
    status: 'Đang làm',
    progress_percentage: 60,
    attachments: [],
    expected_delivery: 'File Google Docs gồm 3 kịch bản bài đăng fanpage: Nội dung chi tiết, hashtag, mô tả hình ảnh đính kèm.',
    actual_delivery: 'Đã viết xong bài 1 và bài 2, đang biên tập nốt bài 3 về mệnh Thổ.',
    feedback_notes: '',
    delay_reason: '',
    actual_completion_date: ''
  },
  {
    task_id: 'TSK-006',
    task_name: 'Seeding thảo luận cách nhận biết túi hàng hiệu thật giả',
    description: 'Triển khai chiến dịch seeding trên các group Facebook cộng đồng đồ hiệu lớn về chủ đề "Kinh nghiệm đau thương khi mua túi hiệu và tầm quan trọng của kiểm định uy tín".',
    business_category: 'Hàng hiệu',
    task_type: 'Seeding',
    assignee: 'anh_vtp',
    collaborators: ['nhan_vt'],
    reviewer: 'nhan_vt',
    start_date: '2026-06-22',
    deadline: '2026-06-24',
    priority: 'Trung bình',
    status: 'Hoàn thành',
    progress_percentage: 100,
    attachments: ['Bao_cao_seeding_hang_hieu_tuan_25.xlsx'],
    expected_delivery: 'Đăng tải thành công 5 bài thảo luận và 50 comment dẫn dắt tự nhiên về quy trình kiểm định tại Fugalo, kèm link báo cáo.',
    actual_delivery: 'Đã hoàn thành đạt 120% chỉ tiêu với 6 bài đăng được duyệt lên group và 65 lượt comment thảo luận sôi nổi.',
    feedback_notes: 'Cách triển khai câu chuyện rất tự nhiên và thu hút được nhiều tương tác tự nhiên từ thành viên thật.',
    delay_reason: '',
    actual_completion_date: '2026-06-24'
  },
  {
    task_id: 'TSK-007',
    task_name: 'Thiết lập chiến dịch Ads Facebook "Ưu đãi Phong thủy cải mệnh 2026"',
    description: 'Setup chiến dịch quảng cáo tin nhắn tiếp cận tệp đối tượng khách hàng trung lưu, quan tâm đến phong thủy cải vận tại khu vực TP.HCM.',
    business_category: 'Phong thủy',
    task_type: 'Chạy quảng cáo',
    assignee: 'chau_nha',
    collaborators: ['an_hv'],
    reviewer: 'an_hv',
    start_date: '2026-06-23',
    deadline: '2026-06-25',
    priority: 'Cao',
    status: 'Đang làm',
    progress_percentage: 70,
    attachments: [],
    expected_delivery: 'Chiến dịch ads hoạt động ổn định trên Trình quản lý quảng cáo, tệp khách hàng chính xác, ngân sách 2.000.000đ/ngày.',
    actual_delivery: 'Đã thiết lập xong nhóm quảng cáo và gửi mẫu thiết kế banner lên duyệt, đang chờ hoạt động.',
    feedback_notes: 'Cần chú ý loại trừ kỹ các đối tượng rác và tệp tài khoản ảo để tiết kiệm ngân sách.',
    delay_reason: '',
    actual_completion_date: ''
  },
  {
    task_id: 'TSK-008',
    task_name: 'Thiết kế catalogue nội thất phong cách Neo-Classical',
    description: 'Thiết kế bộ brochure/catalogue 16 trang giới thiệu các mẫu thiết kế nội thất bán cổ điển cao cấp mà Fugalo đã thi công.',
    business_category: 'Nội thất',
    task_type: 'Thiết kế',
    assignee: 'kiem_lh',
    collaborators: ['long_pm'],
    reviewer: 'an_hv',
    start_date: '2026-06-18',
    deadline: '2026-06-22',
    priority: 'Cao',
    status: 'Trễ hạn',
    progress_percentage: 85,
    attachments: ['NeoClassic_Catalogue_Draft.pdf'],
    expected_delivery: 'File thiết kế PDF hoàn chỉnh sẵn sàng mang đi in ấn thương mại và bản gửi khách hàng online.',
    actual_delivery: 'Đang hoàn thiện 4 trang cuối về phòng ngủ trẻ em và sân vườn.',
    feedback_notes: 'Do tiến độ chụp ảnh hiện trường bị chậm nên k có ảnh thực tế ghép vào, dẫn tới việc thiết kế bị trì hoãn.',
    delay_reason: 'Phải chờ hình ảnh chụp hoàn thiện thực tế từ công trình Phúc Đạt chỉnh sửa xong mới có dữ liệu thiết kế.',
    actual_completion_date: ''
  }
];

export const sampleProductionSchedules: ProductionSchedule[] = [
  {
    production_id: 'PROD-001',
    production_date: '2026-06-25',
    business_category: 'Nội thất',
    content: 'Quay chụp căn hộ mẫu 3 phòng ngủ tại chung cư Phúc Đạt - Quốc lộ 1K',
    production_type: 'Quay',
    assignee: 'duy_lt',
    location: 'Chung cư Phúc Đạt, tầng 15 căn 1502, Dĩ An, Bình Dương',
    brief_script: 'Quay video giới thiệu chi tiết cách bố trí phong thủy phòng khách hướng Đông Nam và thiết kế âm tủ bếp sang trọng.',
    resources_needed: 'Máy quay Sony A7S3, gimbal, chân đèn, mic thu âm cài áo không dây, nước uống cho ekip.',
    delivery_deadline: '18:00',
    status: 'Chưa bắt đầu',
    notes: 'Liên hệ trước với ban quản lý chung cư lúc 9h00 sáng để làm thẻ ra vào mang thiết bị lên căn hộ.'
  },
  {
    production_id: 'PROD-002',
    production_date: '2026-06-26',
    business_category: 'Phong thủy',
    content: 'Chụp hình BST Vật phẩm phong thủy Kỳ Lân Đồng tài lộc',
    production_type: 'Chụp',
    assignee: 'long_pm',
    location: 'Studio Fugalo Showroom Quốc lộ 1K',
    brief_script: 'Chụp cận cảnh độ sáng bóng của đồng nguyên chất, các hoa văn phong thủy chạm khắc tinh xảo để đăng bài bán hàng.',
    resources_needed: 'Đèn softbox cỡ lớn, phông nền vải nhung đen, bục xoay sản phẩm, ống kính macro.',
    delivery_deadline: '15:00',
    status: 'Chưa bắt đầu',
    notes: 'Yêu cầu lau chùi vật phẩm bằng khăn sạch mềm trước khi chụp để tránh dấu vân tay trên đồng bóng.'
  },
  {
    production_id: 'PROD-003',
    production_date: '2026-06-24',
    business_category: 'Hàng hiệu',
    content: 'Sản xuất clip phân biệt túi Chanel Classic thật giả qua đường kim mũi chỉ',
    production_type: 'Dựng',
    assignee: 'tan_tn',
    location: 'Phòng media showroom Fugalo',
    brief_script: 'Dựng clip hướng dẫn chi tiết soi mã thẻ hologram và so sánh phông chữ in nhiệt mặt trong túi Chanel thật vs giả.',
    resources_needed: 'Kịch bản chi tiết đã được DOP duyệt, file lồng tiếng của MC Phương Anh.',
    delivery_deadline: '2026-06-24',
    status: 'Đã bàn giao',
    notes: 'Tập trung nhấn mạnh vào độ chính xác và trang thiết bị hiện đại tại Fugalo giúp phát hiện hàng giả siêu tinh vi.'
  }
];

export const sampleCampaigns: Campaign[] = [
  {
    campaign_id: 'CAM-001',
    campaign_name: 'Tái sinh Túi hiệu - Trọn vẹn Niềm tin',
    business_category: 'Hàng hiệu',
    goal: 'Tăng cường nhận diện dịch vụ Thu mua, Ký gửi và Spa túi hiệu uy tín tại TP.HCM. Thu hút tối thiểu 50 túi hiệu ký gửi mới.',
    start_date: '2026-06-01',
    end_date: '2026-06-30',
    owner: 'an_hv',
    participants: ['kiem_lh', 'duy_lt', 'tan_tn', 'nhan_vt', 'anh_vtp', 'chau_nha'],
    task_ids: ['TSK-002', 'TSK-003', 'TSK-006'],
    content_production: 'Xây dựng 12 bài viết về quy trình bảo dưỡng spa túi hiệu, kinh nghiệm phân biệt túi giả, câu chuyện ký gửi túi Hermes/Chanel thành công.',
    media_production: 'Sản xuất 4 video tiktok chất lượng cao về showroom, quy trình spa thực tế và cận cảnh kiểm định máy Entrupy.',
    ads_deployment: 'Chạy ads tiếp cận nhóm người thích mua sắm hàng hiệu, các chủ doanh nghiệp nữ, ngân sách đã chi 25.000.000đ.',
    seeding_deployment: 'Seeding bình luận thảo luận sôi nổi trên 8 group kín mua bán hàng hiệu chính hãng về việc an tâm khi chọn Fugalo.',
    estimated_budget: 35000000,
    actual_budget: 32000000,
    status: 'Đang triển khai',
    achieved_results: 'Đã ký gửi thành công 38 túi hiệu (có 2 túi Hermes Birkin và 5 túi Chanel Classic), tiếp cận hơn 200.000 lượt xem online.',
    post_evaluation: 'Chiến dịch đi đúng hướng, tệp khách hàng hàng hiệu phản hồi tích cực về quy trình minh bạch, uy tín cao.',
    improvement_proposals: 'Nên bổ sung thêm hoạt động tặng voucher giảm giá 10% dịch vụ spa cho khách hàng ký gửi thành công lần đầu.'
  },
  {
    campaign_id: 'CAM-002',
    campaign_name: 'Phong thủy Cát tường - Gia đạo An yên',
    business_category: 'Phong thủy',
    goal: 'Phát triển dịch vụ tư vấn phong thủy nhà ở kết hợp bát tự cá nhân. Thu hút 15 hợp đồng tư vấn khảo sát thực địa trọn gói.',
    start_date: '2026-06-10',
    end_date: '2026-07-10',
    owner: 'nhan_vt',
    participants: ['an_hv', 'anh_vtp', 'long_pm', 'chau_nha'],
    task_ids: ['TSK-005', 'TSK-007'],
    content_production: 'Biên soạn loạt bài viết phân tích thế sát nhà ở thường gặp, cách bố trí hướng bếp mang lại tài lộc và ý nghĩa Bát tự.',
    media_production: 'Chụp ảnh các vật phẩm phong thủy trưng bày tại showroom cực kỳ trang nhã để lồng ghép vào nội dung.',
    ads_deployment: 'Chạy quảng cáo Facebook chuyển đổi về trang landing page tư vấn phong thủy chuyên sâu, chi phí 15.000.000đ.',
    seeding_deployment: 'Triển khai chia sẻ kinh nghiệm cải vận, cải thiện sức khỏe gia đình nhờ bố trí lại nội thất phong thủy hợp lý.',
    estimated_budget: 20000000,
    actual_budget: 15000000,
    status: 'Đang triển khai',
    achieved_results: 'Ghi nhận 12 cuộc hẹn đăng ký tư vấn phong thủy trực tiếp, đã ký thành công 6 hợp đồng trọn gói.',
    post_evaluation: 'Khách hàng phân khúc cao tuổi rất thích các nội dung phân tích khoa học thay vì mê tín dị đoan.',
    improvement_proposals: 'Nên kết hợp chuyên gia phong thủy livestream trực tiếp trả lời câu hỏi vào tối thứ 6 hàng tuần để tạo tương tác mạnh.'
  }
];

export const sampleKpis: KpiAssignment[] = [
  {
    kpi_id: 'KPI-001',
    staff_id: 'an_hv',
    role: 'Marketing Manager',
    evaluation_month: '06/2026',
    kpi_name: 'Tỷ lệ hoàn thành kế hoạch phòng Marketing',
    target_value: '95%',
    actual_value: '96%',
    completion_rate: 101,
    kpi_score: 98,
    manager_feedback: 'Lập kế hoạch xuất sắc, phân bổ nguồn lực hợp lý giúp doanh số các mảng dịch vụ tăng trưởng ổn định.',
    action_proposal: 'Thưởng nóng hiệu suất quản lý xuất sắc.',
    status: 'Đã chốt điểm'
  },
  {
    kpi_id: 'KPI-002',
    staff_id: 'kiem_lh',
    role: 'Marketing DOP',
    evaluation_month: '06/2026',
    kpi_name: 'Chất lượng định hướng hình ảnh & concept đúng brief',
    target_value: 'Tối thiểu 5 concept chụp ảnh / quay dựng được ban duyệt',
    actual_value: '6 concept hoàn thành xuất sắc',
    completion_rate: 120,
    kpi_score: 95,
    manager_feedback: 'Hình ảnh thương hiệu sang trọng đẳng cấp, bám sát giá trị cốt lõi của thương hiệu.',
    action_proposal: 'Thưởng hiệu quả sáng tạo concept.',
    status: 'Đã chốt điểm'
  },
  {
    kpi_id: 'KPI-003',
    staff_id: 'duy_lt',
    role: 'Marketing Media Leader',
    evaluation_month: '06/2026',
    kpi_name: 'Quản lý kho tài nguyên & tỷ lệ bàn giao đúng hạn',
    target_value: '90% file bàn giao đúng hạn',
    actual_value: '91% đúng hạn, kho tài nguyên gọn gàng',
    completion_rate: 101,
    kpi_score: 92,
    manager_feedback: 'Điều phối team media hoạt động hăng say, lưu trữ dữ liệu an toàn gọn gàng.',
    action_proposal: 'Giữ vững phong độ hằng tháng.',
    status: 'Đã chốt điểm'
  },
  {
    kpi_id: 'KPI-004',
    staff_id: 'tan_tn',
    role: 'Marketing Media Edit',
    evaluation_month: '06/2026',
    kpi_name: 'Số lượng video dựng hoàn thành đạt chuẩn TikTok',
    target_value: '12 video/tháng',
    actual_value: '11 video (1 video bị loại do lỗi âm thanh)',
    completion_rate: 91,
    kpi_score: 82,
    manager_feedback: 'Dựng phim mượt, tuy nhiên cần chú ý rà soát lỗi chính tả và kiểm tra bản quyền nhạc nền kỹ hơn.',
    action_proposal: 'Hỗ trợ đào tạo thêm kỹ năng kiểm duyệt chính tả và âm thanh.',
    status: 'Chờ cấp trên duyệt'
  },
  {
    kpi_id: 'KPI-005',
    staff_id: 'chau_nha',
    role: 'Marketing Ads Social',
    evaluation_month: '06/2026',
    kpi_name: 'Tối ưu chi phí CPA và hiệu suất ROAS quảng cáo',
    target_value: 'Đạt ROAS tối thiểu 4.0 cho mảng hàng hiệu',
    actual_value: 'Đạt ROAS 4.2 ấn tượng',
    completion_rate: 105,
    kpi_score: 93,
    manager_feedback: 'Quản lý tài khoản ads cực tốt, tối ưu tệp đối tượng chất lượng cao mang lại chuyển đổi cao.',
    action_proposal: 'Đề xuất thưởng quý cho hiệu suất tối ưu ads.',
    status: 'Đã chốt điểm'
  },
  {
    kpi_id: 'KPI-006',
    staff_id: 'an_hv',
    role: 'Marketing Manager',
    evaluation_month: '05/2026',
    kpi_name: 'Hoàn thành kế hoạch truyền thông tháng 5',
    target_value: '95% kế hoạch',
    actual_value: '94% hoàn thành',
    completion_rate: 95,
    kpi_score: 92,
    manager_feedback: 'Đạt mục tiêu đề ra tương đối tốt.',
    action_proposal: 'Giữ vững phong độ',
    status: 'Đã chốt điểm'
  },
  {
    kpi_id: 'KPI-007',
    staff_id: 'an_hv',
    role: 'Marketing Manager',
    evaluation_month: '04/2026',
    kpi_name: 'Chuẩn bị ngân sách và kế hoạch quý 2',
    target_value: '100% ngân sách phân bổ xong',
    actual_value: 'Hoàn thành vượt hạn định',
    completion_rate: 102,
    kpi_score: 96,
    manager_feedback: 'Kế hoạch chi tiết và rất sát với thực tế vận hành.',
    action_proposal: 'Thưởng nóng hiệu suất',
    status: 'Đã chốt điểm'
  },
  {
    kpi_id: 'KPI-008',
    staff_id: 'kiem_lh',
    role: 'Marketing DOP',
    evaluation_month: '05/2026',
    kpi_name: 'Sản xuất concept hình ảnh mảng phong thủy',
    target_value: '4 concept được phê duyệt',
    actual_value: '4 concept xuất sắc',
    completion_rate: 110,
    kpi_score: 94,
    manager_feedback: 'Hình ảnh sáng tạo và chất lượng vượt mong đợi.',
    action_proposal: 'Giữ vững phong độ',
    status: 'Đã chốt điểm'
  },
  {
    kpi_id: 'KPI-009',
    staff_id: 'kiem_lh',
    role: 'Marketing DOP',
    evaluation_month: '04/2026',
    kpi_name: 'Thiết kế key visual chiến dịch Hè',
    target_value: '1 key visual chính thức',
    actual_value: 'Bản vẽ đạt chuẩn chất lượng cao',
    completion_rate: 105,
    kpi_score: 91,
    manager_feedback: 'Concept tốt, được ban giám đốc đánh giá cao.',
    action_proposal: 'Giữ vững phong độ',
    status: 'Đã chốt điểm'
  },
  {
    kpi_id: 'KPI-010',
    staff_id: 'duy_lt',
    role: 'Marketing Media Leader',
    evaluation_month: '05/2026',
    kpi_name: 'Quản lý kho tư liệu và bàn giao đúng hạn',
    target_value: '90% file bàn giao đúng hạn',
    actual_value: '92% đúng hạn',
    completion_rate: 98,
    kpi_score: 90,
    manager_feedback: 'Team hoạt động nhịp nhàng, quản lý tệp tin tốt.',
    action_proposal: 'Giữ vững phong độ',
    status: 'Đã chốt điểm'
  },
  {
    kpi_id: 'KPI-011',
    staff_id: 'duy_lt',
    role: 'Marketing Media Leader',
    evaluation_month: '04/2026',
    kpi_name: 'Sản xuất video content giới thiệu căn hộ',
    target_value: '6 video hoàn thành',
    actual_value: '5 video hoàn thành đúng hạn',
    completion_rate: 90,
    kpi_score: 85,
    manager_feedback: 'Đạt chỉ tiêu cơ bản, cần đốc thúc đội ngũ hơn.',
    action_proposal: 'Hỗ trợ đào tạo thêm',
    status: 'Đã chốt điểm'
  },
  {
    kpi_id: 'KPI-012',
    staff_id: 'tan_tn',
    role: 'Marketing Media Edit',
    evaluation_month: '05/2026',
    kpi_name: 'Dựng phim ngắn Reels/Tiktok',
    target_value: '10 clip',
    actual_value: '8 clip đạt chuẩn phát sóng',
    completion_rate: 85,
    kpi_score: 80,
    manager_feedback: 'Kỹ thuật tốt, cần đẩy nhanh tiến độ hơn.',
    action_proposal: 'Nhắc nhở chậm deadline',
    status: 'Đã chốt điểm'
  },
  {
    kpi_id: 'KPI-013',
    staff_id: 'tan_tn',
    role: 'Marketing Media Edit',
    evaluation_month: '04/2026',
    kpi_name: 'Dựng video clip review showroom',
    target_value: '10 clip',
    actual_value: '9 clip hoàn thiện tốt',
    completion_rate: 95,
    kpi_score: 88,
    manager_feedback: 'Sản phẩm đầu ra khá mượt, bắt trend tốt.',
    action_proposal: 'Giữ vững phong độ',
    status: 'Đã chốt điểm'
  },
  {
    kpi_id: 'KPI-014',
    staff_id: 'chau_nha',
    role: 'Marketing Ads Social',
    evaluation_month: '05/2026',
    kpi_name: 'Kiểm soát ngân sách & phân tích tệp khách hàng',
    target_value: 'Đạt CPA dưới 150.000đ/lead',
    actual_value: 'Đạt CPA trung bình 145.000đ/lead',
    completion_rate: 100,
    kpi_score: 92,
    manager_feedback: 'Tối ưu ads tốt, giữ vững mức ngân sách cho phép.',
    action_proposal: 'Giữ vững phong độ',
    status: 'Đã chốt điểm'
  },
  {
    kpi_id: 'KPI-015',
    staff_id: 'chau_nha',
    role: 'Marketing Ads Social',
    evaluation_month: '04/2026',
    kpi_name: 'Thiết lập chiến dịch chạy ads thương hiệu',
    target_value: 'ROAS mảng đồ gỗ đạt 3.5',
    actual_value: 'ROAS đạt 3.8 xuất sắc',
    completion_rate: 108,
    kpi_score: 94,
    manager_feedback: 'Target chuẩn tệp khách hàng có thu nhập cao.',
    action_proposal: 'Thưởng nóng hiệu suất',
    status: 'Đã chốt điểm'
  }
];

export const sampleReports: WorkReport[] = [
  {
    report_id: 'RPT-001',
    reporter_id: 'duy_lt',
    report_date: '2026-06-24',
    report_type: 'Tuần',
    completed_tasks_summary: 'Sản xuất thành công bộ ảnh biệt thự biệt thự Phúc Đạt (TSK-004), quay thô xong review túi Hermes Birkin (TSK-002), dựng hoàn thành 3 clip ngắn cho mảng phong thủy.',
    pending_tasks_summary: 'Dựng video review túi Hermes lên TikTok (TSK-003) đang chờ duyệt bản thảo lần cuối.',
    overdue_tasks_summary: 'Thiết kế catalogue nội thất phong cách Neo-Classical (TSK-008) bị trễ hạn.',
    overdue_reason: 'Do công trình Phúc Đạt dọn dẹp decor chậm hơn dự kiến, dẫn tới ngày chụp ảnh thực tế bị lùi, kéo theo thiết kế brochure bị chậm 2 ngày.',
    results_achieved: 'Đầy đủ tài nguyên truyền thông phục vụ chiến dịch "Tái sinh túi hiệu" và "Phong thủy cải mệnh". Các ảnh chụp căn biệt thự đạt độ sắc nét tuyệt hảo.',
    issues_encountered: 'Ổ cứng lưu trữ mạng nội bộ (NAS) bị đầy dung lượng, làm việc tải file raw dung lượng lớn lên gặp khó khăn.',
    proposed_solutions: 'Mua thêm 1 ổ cứng dung lượng 4TB chuyên dụng để mở rộng kho chứa hoặc lọc dọn dẹp xóa bỏ bớt các file video thô lỗi cũ từ đầu năm.',
    support_needed: 'Đề xuất Trưởng phòng phê duyệt chi phí mua ổ cứng lưu trữ 4TB.',
    next_plans: 'Quay chụp phỏng vấn chuyên gia phong thủy cải vận tại showroom; Setup chụp ảnh 10 mẫu túi Chanel và Gucci mới thu mua.',
    reviewer_id: 'an_hv',
    status: 'Đã duyệt'
  },
  {
    report_id: 'RPT-002',
    reporter_id: 'anh_vtp',
    report_date: '2026-06-24',
    report_type: 'Ngày',
    completed_tasks_summary: 'Hoàn thành 42 comment tương tác seeding tự nhiên trên group "Nghiện túi hiệu", viết xong 1 bài thảo luận hỏi kinh nghiệm spa túi bị mốc viền.',
    pending_tasks_summary: 'Đang theo dõi tương tác phản hồi của bài seeding đăng tối qua.',
    overdue_tasks_summary: 'Không có task nào trễ hạn.',
    overdue_reason: '',
    results_achieved: 'Bài đăng thảo luận thu hút hơn 80 bình luận thảo luận sôi nổi của cộng đồng, khéo léo giới thiệu quy trình spa uy tín tại Fugalo.',
    issues_encountered: 'Các quy định kiểm duyệt của quản trị viên group đồ hiệu ngày càng gắt gao hơn đối với các tài khoản mới.',
    proposed_solutions: 'Nên nuôi thêm các tài khoản seeding có tuổi thọ cao hơn, tăng cường tương tác dạo không chứa link quảng cáo trước để tăng điểm uy tín.',
    support_needed: 'Đồng nghiệp team Media hỗ trợ cung cấp thêm ảnh chụp spa túi chân thực để làm tài liệu đăng bài tăng độ tin cậy.',
    next_plans: 'Chuyển sang seeding mảng Nội thất biệt thự cao cấp trong các group cộng đồng cư dân biệt thự.',
    reviewer_id: 'nhan_vt',
    status: 'Đã duyệt'
  }
];

export const sampleEvaluations: PersonnelEvaluation[] = [
  {
    evaluation_id: 'EVAL-001',
    staff_id: 'kiem_lh',
    evaluator_id: 'an_hv',
    month: '06/2026',
    kpi_points: 48,
    deadline_points: 17,
    quality_points: 15,
    proactive_points: 8,
    teamwork_points: 5,
    total_score: 93,
    classification: 'Xuất sắc',
    strengths: 'Định hướng nghệ thuật xuất sắc, có phong cách thẩm mỹ sang trọng, rất am hiểu về giá trị thương hiệu. Phối hợp ăn ý với đội media quay chụp.',
    weaknesses: 'Đôi lúc quá cầu toàn chi tiết nhỏ dẫn đến kéo dài thời gian setup quay chụp, ảnh hưởng nhẹ đến deadline chung của cả nhóm.',
    proposed_action: 'Tiếp tục phát huy thế mạnh sáng tạo; Đề xuất khen thưởng đặc biệt vì đóng góp lớn vào sự thành công của concept BST Hàng Hiệu mới.',
    notes: 'Nhân sự nòng cốt có vai trò quyết định đến diện mạo hình ảnh thương hiệu đẳng cấp của Fugalo.'
  },
  {
    evaluation_id: 'EVAL-002',
    staff_id: 'tan_tn',
    evaluator_id: 'an_hv',
    month: '06/2026',
    kpi_points: 42,
    deadline_points: 16,
    quality_points: 12,
    proactive_points: 7,
    teamwork_points: 4,
    total_score: 81,
    classification: 'Tốt',
    strengths: 'Kỹ năng dựng phim tốt, bắt nhịp nhạc nhanh, video có nhịp điệu lôi cuốn, đúng thị hiếu khán giả trẻ trên TikTok.',
    weaknesses: 'Còn hay mắc lỗi chính tả lặt vặt ở phần phụ đề video, đôi lúc quên rà soát kỹ quy chuẩn kích thước hiển thị logo thương hiệu.',
    proposed_action: 'Yêu cầu tự rà soát checklist 5 bước trước khi xuất video gửi duyệt; Tham gia khóa hướng dẫn nội bộ về quy chuẩn thương hiệu.',
    notes: 'Có tiềm năng phát triển tốt nếu rèn luyện được tính tỉ mỉ, cẩn thận hơn trong công việc.'
  }
];

export const sampleProposals: Proposal[] = [
  {
    proposal_id: 'PRP-001',
    proposer_id: 'an_hv',
    proposal_date: '2026-06-22',
    issue_description: 'Chi phí tiếp cận (CPM) trên Facebook mảng "Thu mua & Spa Hàng hiệu" ngày càng tăng cao, quảng cáo bị cạnh tranh khốc liệt bởi các cửa hàng nhỏ lẻ tự phát phá giá.',
    business_category: 'Hàng hiệu',
    evidence: 'Số liệu CPM tháng 6 tăng 25% so với tháng 5, chi phí thu được một lượt tin nhắn quan tâm tăng từ 120.000đ lên 155.000đ.',
    root_cause: 'Chưa làm nổi bật được sự khác biệt của quy trình kiểm định Entrupy uy tín độc quyền bằng máy AI tại showroom Fugalo so với các tiệm nhỏ lẻ.',
    proposed_solution: 'Triển khai chiến dịch truyền thông tiêu điểm "Kiểm Định Minh Bạch - Giao Dịch An Tâm". Tặng 100 suất kiểm định túi hiệu miễn phí trị giá 300.000đ/lần bằng công nghệ Entrupy cho khách hàng mang túi đến trực tiếp showroom.',
    expected_benefits: 'Tạo làn sóng walk-in kéo khách hàng giàu có đến showroom trực tiếp, từ đó nhân viên có cơ hội tư vấn dịch vụ Spa hoặc Thu mua/Ký gửi túi hiệu với tỷ lệ chốt cao. Dự kiến thu hút hơn 200 lượt khách ghé cửa hàng.',
    resources_needed: 'Ngân sách in banner ưu đãi, chi phí chạy quảng cáo Facebook định vị bán kính 10km quanh showroom: 10.000.000đ.',
    timeline: 'Bắt đầu từ ngày 01/07/2026 đến hết 15/07/2026.',
    owner_id: 'chau_nha',
    status: 'Đã duyệt',
    post_deployment_result: 'Đang chuẩn bị sẵn sàng thiết kế và tệp đối tượng chạy ads, kế hoạch bắt đầu đúng hẹn vào đầu tháng 7.'
  },
  {
    proposal_id: 'PRP-002',
    proposer_id: 'nhan_vt',
    proposal_date: '2026-06-23',
    issue_description: 'Chiến dịch seeding mảng "Tư vấn Phong thủy" gặp khó khăn khi đăng tải trong các group cư dân mới do bộ lọc từ khóa chặn các nội dung liên quan tới bát tự, phong thủy tâm linh.',
    business_category: 'Phong thủy',
    evidence: 'Có 4 bài đăng seeding bị quản trị viên xóa hoặc không phê duyệt do vi phạm tiêu chuẩn cộng đồng hoặc bị gắn mác tâm linh mê tín.',
    root_cause: 'Nội dung sử dụng các từ khóa quá nhạy cảm hoặc trực diện về bói toán, bát tự, phong thủy tâm linh gây phản cảm cho ban quản trị group.',
    proposed_solution: 'Chuyển hướng kịch bản viết bài sang chủ đề khoa học: "Bố trí khoa học không gian sống thoáng mát", "Nghệ thuật sắp đặt ánh sáng và lưu thông không khí trong căn hộ nhỏ giúp cải thiện sức khỏe", khéo léo lồng ghép tri thức phong thủy về luồng khí và năng lượng tích cực.',
    expected_benefits: 'Bài đăng không bị xóa, được quản trị viên duyệt nhanh do mang lại kiến thức trang trí nội thất bổ ích, hướng tới lối sống lành mạnh.',
    resources_needed: 'Đội ngũ Media hỗ trợ thiết kế các infographic đồ họa mô phỏng hướng gió, hướng sáng trong căn phòng.',
    timeline: 'Áp dụng ngay lập tức cho các bài viết seeding từ tuần 26.',
    owner_id: 'anh_vtp',
    status: 'Đang triển khai',
    post_deployment_result: 'Kết quả ban đầu rất khả quan, 3 bài đăng infographic chia sẻ mẹo thông gió phòng ngủ đã được cư dân đón nhận nồng nhiệt với hàng trăm lượt share.'
  }
];

export const sampleResources: Resource[] = [
  {
    resource_id: 'RES-001',
    title: 'Infographic Hướng dẫn phân biệt túi Hermes thật giả qua đường chỉ may',
    resource_type: 'Ảnh',
    business_category: 'Hàng hiệu',
    campaign_id: 'CAM-001',
    creator_id: 'kiem_lh',
    created_date: '2026-06-21',
    file_link: 'https://drive.google.com/drive/folders/fugalo_hermes_infographic',
    status: 'Đã duyệt',
    notes: 'Ảnh độ phân giải cao phục vụ đăng tải fanpage và gửi kèm tin nhắn tư vấn cho khách hàng.'
  },
  {
    resource_id: 'RES-002',
    title: 'Kịch bản chi tiết quay Clip review showroom và dịch vụ Spa hàng hiệu',
    resource_type: 'Kịch bản',
    business_category: 'Hàng hiệu',
    campaign_id: 'CAM-001',
    creator_id: 'duy_lt',
    created_date: '2026-06-18',
    file_link: 'https://docs.google.com/document/d/fugalo_spa_video_script',
    status: 'Đã duyệt',
    notes: 'Kịch bản chi tiết 3 phân đoạn: Đón khách - Soi kính lúp/Kiểm định - Spa phục hồi da túi Chanel.',
    versions: [
      {
        file_link: 'https://docs.google.com/document/d/fugalo_spa_video_script_v1',
        updated_at: '2026-06-15 14:30',
        updater_name: 'Lê Tuấn Duy',
        notes: 'Phác thảo kịch bản phân đoạn 1'
      }
    ]
  },
  {
    resource_id: 'RES-003',
    title: 'Video thô quay căn hộ biệt thự Phúc Đạt góc rộng toàn cảnh',
    resource_type: 'Video', // mapped to 'Video'
    business_category: 'Nội thất',
    creator_id: 'long_pm',
    created_date: '2026-06-23',
    file_link: 'https://drive.google.com/drive/folders/fugalo_phuc_dat_raw_video',
    status: 'Bản nháp',
    notes: 'Dữ liệu gốc chưa chỉnh màu, dung lượng 45GB. Dành cho team edit video dựng phim review biệt thự.'
  },
  {
    resource_id: 'RES-004',
    title: 'Bảng thiết kế 3D hoàn chỉnh phòng khách phong cách Tân Cổ Điển',
    resource_type: 'File thiết kế',
    business_category: 'Nội thất',
    creator_id: 'kiem_lh',
    created_date: '2026-06-20',
    file_link: 'https://drive.google.com/drive/folders/fugalo_3d_design_neo_classical',
    status: 'Đã đăng',
    notes: 'Đã sử dụng để làm tư liệu hình ảnh đăng tải trong bài viết giới thiệu năng lực thi công nội thất của Fugalo.'
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
    plan_id: 'PLN-001',
    creator_id: 'an_hv',
    plan_type: 'Tuần',
    period_name: 'Tuần 26 (22/06 - 28/06/2026)',
    target_goals: '1. Khởi động chiến dịch "Tái sinh túi hiệu" cho mảng Hàng hiệu đạt 50k reach.\n2. Quay chụp biệt thự Phúc Đạt cho mảng Nội thất, dựng xong 3 video review thô.\n3. Hoàn thiện bộ kịch bản "Bát tự cải mệnh" cho mảng Phong thủy.',
    key_results: '- Chụp xong 10 mẫu túi Chanel/Hermes Birkin.\n- Bài đăng giới thiệu spa túi đạt tổng 100+ thảo luận sôi nổi.\n- Đạt 30 lượt đăng ký nhận tư vấn Phong thủy cải vận.',
    tasks_list: '1. Duyệt kịch bản review túi Hermes (TSK-002) - Phụ trách: Duy LT.\n2. Chụp ảnh căn biệt thự Phúc Đạt (TSK-004) - Phụ trách: Duy LT.\n3. Triển khai seeding trên group Nghiện túi hiệu (TSK-003) - Phụ trách: Anh VTP.\n4. Livestream thử nghiệm Phong thủy tại showroom (TSK-010) - Phụ trách: Kiêm LH.',
    notes: 'Yêu cầu tổ Media phối hợp chặt chẽ với tổ Seeding để lấy nguồn ảnh thô sắc nét dán kèm bài thảo luận.',
    reviewer_id: 'an_hv',
    status: 'Đang triển khai',
    created_at: '2026-06-22'
  },
  {
    plan_id: 'PLN-002',
    creator_id: 'an_hv',
    plan_type: 'Tháng',
    period_name: 'Tháng 06/2026',
    target_goals: '1. Đẩy mạnh nhận diện thương hiệu FUGALO mảng Hàng hiệu & Nội thất cao cấp.\n2. Ra mắt 10 bài viết phân tích xu hướng Phong thủy nhà ở năm 2026.\n3. Tăng trưởng 15% tương tác hữu cơ trên toàn bộ các kênh TikTok và Fanpage vệ tinh.',
    key_results: '- Tổng ngân sách sử dụng dưới 150.000.000 đ.\n- Đạt tổng 300k lượt xem video trên TikTok.\n- Thu thập thông tin 150 khách hàng tiềm năng có nhu cầu thiết kế nội thất.',
    tasks_list: '- Sản xuất 15 clip ngắn định dạng dọc.\n- Viết 20 bài viết nội dung chất lượng cao.\n- Chạy quảng cáo tối ưu hóa chuyển đổi với ngân sách 50 triệu đồng.',
    notes: 'Kế hoạch trọng điểm tháng 6 cần bám sát các chỉ số hoàn thành KPI cá nhân của Kiêm LH và Duy LT.',
    reviewer_id: 'an_hv',
    status: 'Đã chốt',
    created_at: '2026-06-01'
  }
];

export const sampleDailyLogs: any[] = [
  {
    log_id: 'LOG-001',
    creator_id: 'phuong_mkt',
    log_date: '2026-06-30',
    checklist_items: [
      { id: 'item-1', text: 'Viết bài truyền thông cho dòng tủ bếp gỗ sồi mới', completed: true },
      { id: 'item-2', text: 'Thiết kế 2 banner chạy quảng cáo phong thủy nhà ở', completed: true },
      { id: 'item-3', text: 'Gửi kịch bản video ngắn cho Linh Edit', completed: false }
    ],
    linked_task_ids: ['TSK-001'],
    achievements: 'Hoàn thành đúng hạn bài viết truyền thông chính cho chiến dịch tủ bếp.',
    challenges: 'Kịch bản video ngắn đang chờ duyệt thêm ý kiến từ anh An.',
    created_at: '2026-06-30 16:30:00'
  },
  {
    log_id: 'LOG-002',
    creator_id: 'linh_edit',
    log_date: '2026-06-30',
    checklist_items: [
      { id: 'item-1', text: 'Dựng xong video ngắn giới thiệu sofa da bò Ý', completed: true },
      { id: 'item-2', text: 'Render và tải lên thư mục tài nguyên chung', completed: true },
      { id: 'item-3', text: 'Nhận feedback và sửa lại âm thanh đoạn intro', completed: true }
    ],
    linked_task_ids: ['TSK-002'],
    achievements: 'Video có nhịp điệu tốt, âm thanh đã được chuẩn hóa theo feedback.',
    challenges: 'File raw quay bằng máy cơ hơi nặng, tốn thời gian tải về.',
    created_at: '2026-06-30 17:00:00'
  }
];


