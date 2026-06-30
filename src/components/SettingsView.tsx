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
  ExternalLink
} from 'lucide-react';
import { WebhookConfig, SpecialistGroup } from '../types';

interface SettingsViewProps {
  webhooks: WebhookConfig[];
  setWebhooks: React.Dispatch<React.SetStateAction<WebhookConfig[]>>;
  activeRole: string;
}

export default function SettingsView({
  webhooks,
  setWebhooks,
  activeRole
}: SettingsViewProps) {
  const [localConfigs, setLocalConfigs] = useState<WebhookConfig[]>(webhooks);
  const [testStatuses, setTestStatuses] = useState<Record<string, { status: 'idle' | 'sending' | 'success' | 'error'; message?: string }>>({});
  const [saveSuccess, setSaveSuccess] = useState(false);

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
    </div>
  );
}
