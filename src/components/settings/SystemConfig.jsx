import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Globe, 
  Save, 
  RotateCcw,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useToast } from '../ui/use-toast';

const SystemConfig = () => {
  const [config, setConfig] = useState(() => {
    // 尝试从localStorage加载保存的设置
    const saved = localStorage.getItem('systemSettings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        console.error('加载系统设置失败:', error);
      }
    }
    // 默认设置
    return {
      // 通知设置
      emailNotifications: true,
      pushNotifications: true,
      desktopNotifications: false,
      notificationSound: true,
      
      // 语言和时区
      language: 'zh-CN',
      timezone: 'Asia/Shanghai',
      dateFormat: 'YYYY-MM-DD',
      timeFormat: '24h'
    };
  });

  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // 监听系统设置变化并应用
  useEffect(() => {
    // 可以在这里根据配置应用一些UI调整
    // 例如根据语言设置调整界面元素等
  }, [config]);

  const handleConfigChange = (key, value) => {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // 保存到localStorage
      localStorage.setItem('systemSettings', JSON.stringify(config));
      
      setTimeout(() => {
        setIsSaving(false);
        toast({
          title: "设置已保存",
          description: "系统配置已成功更新",
        });
      }, 500);
    } catch (error) {
      setIsSaving(false);
      toast({
        title: "保存失败",
        description: "保存系统设置时出错",
        variant: "destructive"
      });
    }
  };

  const handleReset = () => {
    setConfig({
      emailNotifications: true,
      pushNotifications: true,
      desktopNotifications: false,
      notificationSound: true,
      language: 'zh-CN',
      timezone: 'Asia/Shanghai',
      dateFormat: 'YYYY-MM-DD',
      timeFormat: '24h'
    });
    
    // 默认设置
    const defaultSettings = {
      emailNotifications: true,
      pushNotifications: true,
      desktopNotifications: false,
      notificationSound: true,
      language: 'zh-CN',
      timezone: 'Asia/Shanghai',
      dateFormat: 'YYYY-MM-DD',
      timeFormat: '24h'
    };
    
    setConfig(defaultSettings);
    localStorage.setItem('systemSettings', JSON.stringify(defaultSettings));
    
    toast({
      title: "设置已重置",
      description: "系统配置已恢复默认值",
    });

  return (
    <div className="space-y-8">
      {/* 通知设置 */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Bell className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            通知设置
          </h3>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">邮件通知</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  接收重要更新和提醒
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.emailNotifications}
                  onChange={(e) => handleConfigChange('emailNotifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">推送通知</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  浏览器推送通知
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.pushNotifications}
                  onChange={(e) => handleConfigChange('pushNotifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">桌面通知</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  桌面弹窗通知
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.desktopNotifications}
                  onChange={(e) => handleConfigChange('desktopNotifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">通知音效</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  通知时播放提示音
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.notificationSound}
                  onChange={(e) => handleConfigChange('notificationSound', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* 语言和时区设置 */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Globe className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            语言和时区
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              语言
            </label>
            <select
              value={config.language}
              onChange={(e) => handleConfigChange('language', e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="zh-CN">简体中文</option>
              <option value="en-US">English</option>
              <option value="ja-JP">日本語</option>
              <option value="ko-KR">한국어</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              时区
            </label>
            <select
              value={config.timezone}
              onChange={(e) => handleConfigChange('timezone', e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Asia/Shanghai">中国标准时间 (UTC+8)</option>
              <option value="America/New_York">美国东部时间 (UTC-5)</option>
              <option value="Europe/London">格林威治标准时间 (UTC+0)</option>
              <option value="Asia/Tokyo">日本标准时间 (UTC+9)</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              日期格式
            </label>
            <select
              value={config.dateFormat}
              onChange={(e) => handleConfigChange('dateFormat', e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="YYYY-MM-DD">2024-01-01</option>
              <option value="DD/MM/YYYY">01/01/2024</option>
              <option value="MM/DD/YYYY">01/01/2024</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              时间格式
            </label>
            <select
              value={config.timeFormat}
              onChange={(e) => handleConfigChange('timeFormat', e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="24h">24小时制</option>
              <option value="12h">12小时制</option>
            </select>
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleReset}
          className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>重置</span>
        </button>
        
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>保存中...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>保存设置</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
}
export default SystemConfig;
