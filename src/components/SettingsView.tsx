/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Webhook, 
  Save, 
  HelpCircle, 
  CheckCircle, 
  AlertTriangle, 
  ToggleLeft, 
  ToggleRight, 
  Send, 
  RefreshCw,
  Info,
  ExternalLink,
  Database,
  Trash2,
  X,
  Loader2
} from 'lucide-react';
import { WebhookConfig, SpecialistGroup } from '../types';

interface SettingsViewProps {
  webhooks: WebhookConfig[];
  setWebhooks: React.Dispatch<React.SetStateAction<WebhookConfig[]>>;
  activeRole: string;
  onResetDatabase?: () => Promise<void>;
}

export default function SettingsView({
  webhooks,
  setWebhooks,
  activeRole,
  onResetDatabase
}: SettingsViewProps) {
  const [localConfigs, setLocalConfigs] = useState<WebhookConfig[]>(webhooks);
  const [testStatuses, setTestStatuses] = useState<Record<string, { status: 'idle' | 'sending' | 'success' | 'error'; message?: string }>>({});
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  const handleResetConfirm = async () => {
    setResetting(true);
    setResetError(null);
    try {
      if (onResetDatabase) {
        await onResetDatabase();
        setResetSuccess(true);
      }
    } catch (err: any) {
      console.error(err);
      setResetError(err.message || 'Lỗi không xác định khi đồng bộ dữ liệu.');
    } finally {
      setResetting(false);
    }
  };

  const isReadOnly = activeRole === 'Viewer';

  // Track state locally until user clicks Save
  const handleUrlChange = (id: string, value: string) => {
    setLocalConfigs(prev => prev.map(cfg => cfg.id === id ? { ...cfg, webhookUrl: value } : cfg));
  };

  const handleToggleActive = (id: string) => {
    if (isReadOnly) return;
    setLocalConfigs(prev => prev.map(cfg => cfg.id === id ? { ...cfg, isActive: !cfg.isActive } : cfg));
  };

  const handleSaveAll = () => {
    if (isReadOnly) return;
    setWebhooks(localConfigs);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Function to send direct Google Chat Webhook message using fetch in no-cors mode
  const sendTestWebhook = async (config: WebhookConfig) => {
    if (!config.webhookUrl) {
      setTestStatuses(prev => ({ 
        ...prev, 
        [config.id]: { status: 'error', message: 'Vui lòng điền URL Webhook trước.' } 
      }));
      return;
    }

    setTestStatuses(prev => ({ 
      ...prev, 
      [config.id]: { status: 'sending' } 
    }));

    try {
      const payload = {
        text: `⚡ *THÔNG BÁO THỬ NGHIỆM* ⚡\n\nChúc mừng! Kết nối từ hệ thống quản lý phòng Marketing Fugalo đến Google Chat Space của nhóm *${config.groupName}* đã thành công.\n\n*Thời gian kết nối:* ${new Date().toLocaleString('vi-VN')}`
      };

      // We use no-cors mode since Google Chat webhook doesn't support CORS from client-side SPA.
      // With no-cors, the request goes through, but response status is opaque.
      await fetch(config.webhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      setTestStatuses(prev => ({ 
        ...prev, 
        [config.id]: { status: 'success', message: 'Đã gửi yêu cầu kiểm tra! (no-cors)' } 
      }));
    } catch (error: any) {
      console.error("Test Webhook Error:", error);
      setTestStatuses(prev => ({ 
        ...prev, 
        [config.id]: { status: 'error', message: `Lỗi: ${error.message || 'Không thể gửi'}` } 
      }));
    }
  };

  return (
    <div id="settings-view-root" className="flex-1 overflow-y-auto p-6 space-y-6 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <Webhook className="w-7 h-7 text-[#E04B1C]" />
            Cấu hình Webhooks Google Chat
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Thiết lập các URL Google Chat Webhook để tự động gửi thông báo khi có công việc bị <b>Trễ hạn</b> hoặc <b>Cần sửa</b> cho từng phòng ban chuyên môn.
          </p>
        </div>

        {!isReadOnly && (
          <button
            onClick={handleSaveAll}
            className="flex items-center gap-2 bg-[#E04B1C] hover:bg-[#c73e13] text-white px-5 py-2.5 rounded-lg text-xs font-bold transition shadow-md shadow-[#E04B1C]/20 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Lưu Toàn Bộ Cấu Hình
          </button>
        )}
      </div>

      {/* Success Notification Alert */}
      {saveSuccess && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs font-semibold animate-fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>Lưu cấu hình Webhooks thành công! Các thông báo từ bây giờ sẽ được định tuyến theo đúng cấu hình mới.</span>
        </div>
      )}

      {/* Instructions on Google Chat Webhooks */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-xs text-slate-600 space-y-3">
        <h3 className="font-bold text-slate-800 flex items-center gap-1.5 text-sm">
          <HelpCircle className="w-4 h-4 text-[#E04B1C]" />
          Làm thế nào để lấy URL Google Chat Webhook cho nhóm?
        </h3>
        <ol className="list-decimal pl-4 space-y-1.5 leading-relaxed">
          <li>Truy cập vào ứng dụng <strong>Google Chat</strong> và mở phòng chat (Space) của group chuyên môn của bạn.</li>
          <li>Click vào tiêu đề phòng ở trên cùng, chọn <strong>Ứng dụng & tích hợp (Apps & integrations)</strong>.</li>
          <li>Chọn <strong>Webhook (Webhooks)</strong>. Nếu chưa có webhook nào, click <strong>Thêm webhook (Add webhook)</strong>.</li>
          <li>Nhập tên webhook (ví dụ: <code>Fugalo Marketing Bot</code>), thêm URL hình đại diện (tùy chọn) và click <strong>Lưu (Save)</strong>.</li>
          <li>Sao chép <strong>Liên kết Webhook (Webhook URL)</strong> và dán vào ô nhập liệu tương ứng dưới đây.</li>
        </ol>
        <div className="bg-[#E04B1C]/5 text-[#E04B1C] p-3 rounded-lg border border-[#E04B1C]/10 flex items-start gap-2 mt-2">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p className="leading-normal">
            <strong>Lưu ý kỹ thuật:</strong> Các yêu cầu kiểm tra được gửi trực tiếp từ trình duyệt của bạn qua giao thức HTTP POST dạng ẩn danh (no-cors). Bạn sẽ nhận được tin nhắn tức thời trên Google Chat nếu URL chính xác và Space cho phép tích hợp.
          </p>
        </div>
      </div>

      {/* Database Management Tools */}
      {!isReadOnly && onResetDatabase && (
        <div className="border border-amber-200 bg-amber-50/50 rounded-xl p-5 space-y-3">
          <div className="flex items-start gap-3">
            <Database className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-slate-800 text-sm">
                Đồng bộ & Áp dụng Kế hoạch Tháng 7/2026
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Hành động này sẽ thực hiện <strong>xoá bỏ hoàn toàn dữ liệu demo cũ của tháng 6</strong> (bao gồm công việc, lịch quay chụp, kpi, báo cáo, đánh giá hiệu suất) và <strong>áp dụng đồng bộ kế hoạch tháng 7/2026 mới</strong> của nhân sự vào hệ thống Firestore.
              </p>
            </div>
          </div>
          <div className="flex justify-end pt-1">
            <button
              onClick={() => {
                setResetSuccess(false);
                setResetError(null);
                setShowResetConfirm(true);
              }}
              className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2.5 rounded-lg text-xs font-bold transition shadow-md shadow-amber-600/10 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Xoá Dữ Liệu Tháng 6 & Áp Dụng Kế Hoạch Tháng 7
            </button>
          </div>
        </div>
      )}

      {/* Main Grid Webhook Configurations */}
      <div className="grid grid-cols-1 gap-4">
        {localConfigs.map((config) => {
          const testStatus = testStatuses[config.id] || { status: 'idle' };
          
          return (
            <div 
              key={config.id} 
              className={`border rounded-xl bg-white p-5 transition duration-200 ${
                config.isActive 
                  ? 'border-[#E04B1C]/20 shadow-[0_4px_12px_rgba(224,75,28,0.03)]' 
                  : 'border-slate-100 opacity-80'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-slate-800 text-sm">{config.groupName}</span>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                      ID: {config.id}
                    </span>
                    {config.isActive ? (
                      <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Đang hoạt động
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-slate-50 text-slate-500 border border-slate-100">
                        Đang tắt
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">{config.description}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-500">Kích hoạt:</span>
                  <button 
                    onClick={() => handleToggleActive(config.id)}
                    disabled={isReadOnly}
                    className="focus:outline-none cursor-pointer"
                  >
                    {config.isActive ? (
                      <ToggleRight className="w-10 h-10 text-[#E04B1C]" />
                    ) : (
                      <ToggleLeft className="w-10 h-10 text-slate-300" />
                    )}
                  </button>
                </div>
              </div>

              {/* Input for URL */}
              <div className="mt-4 flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <input
                    type="url"
                    value={config.webhookUrl}
                    onChange={(e) => handleUrlChange(config.id, e.target.value)}
                    placeholder="https://chat.googleapis.com/v1/spaces/.../webhooks/..."
                    disabled={isReadOnly}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-[#E04B1C]/20 focus:border-[#E04B1C] rounded-lg text-xs transition placeholder:text-slate-400 font-mono"
                  />
                </div>

                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => sendTestWebhook(config)}
                    disabled={testStatus.status === 'sending' || !config.webhookUrl}
                    className="flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:hover:bg-slate-100 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-lg transition cursor-pointer"
                  >
                    {testStatus.status === 'sending' ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-500" />
                    ) : (
                      <Send className="w-3.5 h-3.5 text-slate-500" />
                    )}
                    Gửi Test
                  </button>
                </div>
              </div>

              {/* Individual status reporting */}
              {testStatus.status !== 'idle' && (
                <div className="mt-2.5 flex items-center gap-2 text-[11px]">
                  {testStatus.status === 'sending' && (
                    <span className="text-slate-500 animate-pulse">Đang gửi thử nghiệm đến Google Chat...</span>
                  )}
                  {testStatus.status === 'success' && (
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      {testStatus.message}
                    </span>
                  )}
                  {testStatus.status === 'error' && (
                    <span className="text-rose-600 font-semibold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {testStatus.message}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Custom React-Based Reset Database Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-[0_20px_60px_rgba(47,43,61,0.25)] border border-slate-100 overflow-hidden animate-scaleIn">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-amber-600 animate-pulse" />
                  <h3 className="font-black text-sm text-slate-800 uppercase tracking-wide">
                    Đồng bộ & Chuyển giao hệ thống
                  </h3>
                </div>
                {!resetting && (
                  <button 
                    onClick={() => setShowResetConfirm(false)}
                    className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Body Content */}
              <div className="py-6 space-y-4">
                {!resetting && !resetSuccess && !resetError && (
                  <div className="space-y-3">
                    <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 mx-auto mb-2">
                      <AlertTriangle className="w-6 h-6 animate-bounce" />
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-bold text-center">
                      Bạn có chắc chắn muốn tiến hành xóa dữ liệu demo tháng 6 và đồng bộ kế hoạch tháng 7/2026?
                    </p>
                    <div className="bg-amber-50/70 border border-amber-100 rounded-xl p-3 text-xxs text-amber-800 leading-relaxed space-y-1">
                      <p>• <strong>Toàn bộ dữ liệu demo cũ của tháng 6</strong> sẽ bị xóa sạch khỏi Firestore.</p>
                      <p>• <strong>Kế hoạch, công việc, KPIs tháng 7/2026 mới</strong> sẽ được áp dụng đồng bộ thời gian thực.</p>
                      <p>• Hành động này có tính chất ghi đè vĩnh viễn và không thể khôi phục.</p>
                    </div>
                  </div>
                )}

                {resetting && (
                  <div className="flex flex-col items-center justify-center py-6 space-y-4">
                    <Loader2 className="w-10 h-10 text-[#E04B1C] animate-spin" />
                    <div className="text-center">
                      <p className="text-xs font-black text-slate-800 uppercase tracking-wider">Đang đồng bộ dữ liệu...</p>
                      <p className="text-xxs text-slate-500 mt-1">Hệ thống đang cấu hình lại dữ liệu kế hoạch tháng 7/2026 trên Google Cloud Firestore. Vui lòng không đóng trình duyệt.</p>
                    </div>
                  </div>
                )}

                {resetSuccess && (
                  <div className="space-y-3">
                    <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-2">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-black text-center text-slate-800 uppercase tracking-wider">
                      Đồng bộ & Chuyển giao thành công!
                    </p>
                    <p className="text-xxs text-slate-600 leading-relaxed text-center">
                      Toàn bộ dữ liệu demo tháng 6 đã được thay thế thành công bằng <strong>Dữ liệu Kế hoạch Tháng 7/2026 mới</strong>.
                    </p>
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3.5 text-xxs text-emerald-800 leading-relaxed">
                      Các thay đổi đã được áp dụng trực tiếp lên hệ thống, vui lòng truy cập Dashboard hoặc các tab Chuyên môn để kiểm tra dữ liệu kế hoạch mới.
                    </div>
                  </div>
                )}

                {resetError && (
                  <div className="space-y-3">
                    <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center text-rose-600 mx-auto mb-2">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-black text-center text-slate-800 uppercase tracking-wider">
                      Đã xảy ra lỗi đồng bộ
                    </p>
                    <p className="text-xxs text-slate-600 leading-relaxed text-center">
                      Hệ thống không thể ghi đè dữ liệu lên đám mây Firestore:
                    </p>
                    <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 text-xxs text-rose-800 font-mono text-center">
                      {resetError}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Buttons */}
              <div className="flex justify-end gap-2.5 border-t border-slate-100 pt-4">
                {!resetting && !resetSuccess && !resetError && (
                  <>
                    <button
                      onClick={() => setShowResetConfirm(false)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      onClick={handleResetConfirm}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-amber-600/10 flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Xác nhận & Đồng bộ
                    </button>
                  </>
                )}

                {(resetSuccess || resetError) && (
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition"
                  >
                    Đóng cửa sổ
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
