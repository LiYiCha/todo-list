import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Save, 
  RotateCcw,
  Smartphone,
  Monitor
} from 'lucide-react';
import { useToast } from '../ui/use-toast';

const NotificationSettings = ({ isTransparentMode = false }) => {
  const [notifications, setNotifications] = useState(() => {
    // 尝试从localStorage加载保存的设置
    const saved = localStorage.getItem('notificationSettings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        console.error('加载通知设置失败:', error);
      }
    }
    // 默认设置
    return {
      // 任务相关通知
      taskReminders: true,
      taskDueSoon: true,
      taskOverdue: true,
      taskCompleted: false,
      
      // 系统通知
      systemUpdates: true,
      
      // 通知方式
      pushNotifications: true,
      desktopNotifications: true,
      
      // 静默时间
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00'
      }
    };
  });

  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  
  // 根据透明模式设置容器类名
  const containerClass = isTransparentMode 
    ? 'bg-white/90 backdrop-blur-md' 
    : 'bg-white dark:bg-gray-800';
  const cardClass = isTransparentMode 
    ? 'bg-white/80 backdrop-blur-sm' 
    : 'bg-gray-50 dark:bg-gray-700';

  const handleNotificationChange = (key, value) => {
    setNotifications(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleQuietHoursChange = (key, value) => {
    setNotifications(prev => ({
      ...prev,
      quietHours: {
        ...prev.quietHours,
        [key]: value
      }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // 保存到localStorage
      localStorage.setItem('notificationSettings', JSON.stringify(notifications));
      
      setTimeout(() => {
        setIsSaving(false);
        toast({
          title: "通知设置已保存",
          description: "您的通知偏好设置已成功更新",
        });
        
        // 如果启用了桌面通知，请求权限
        if (notifications.desktopNotifications && 'Notification' in window) {
          Notification.requestPermission();
        }
      }, 500);
    } catch (error) {
      setIsSaving(false);
      toast({
        title: "保存失败",
        description: "保存通知设置时出错",
        variant: "destructive"
      });
    }
  };

  const handleReset = () => {
    const defaultSettings = {
      taskReminders: true,
      taskDueSoon: true,
      taskOverdue: true,
      taskCompleted: false,
      systemUpdates: true,
      pushNotifications: true,
      desktopNotifications: true,
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00'
      }
    };
    
    setNotifications(defaultSettings);
    localStorage.setItem('notificationSettings', JSON.stringify(defaultSettings));
    
    toast({
      title: "通知设置已重置",
      description: "已恢复默认通知设置",
    });
  };

  return (
    <div className={`space-y-6 ${containerClass}`}>
      {/* 任务通知 */}
      <div className={`space-y-4 ${cardClass} rounded-lg p-4`}>
        <div className="flex items-center space-x-2">
          <Bell className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            任务通知
          </h3>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white text-sm">任务提醒</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">定时提醒未完成的任务</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.taskReminders}
                onChange={(e) => handleNotificationChange('taskReminders', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white text-sm">即将到期</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">任务即将到期时提醒</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.taskDueSoon}
                onChange={(e) => handleNotificationChange('taskDueSoon', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white text-sm">逾期任务</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">任务逾期时提醒</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.taskOverdue}
                onChange={(e) => handleNotificationChange('taskOverdue', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white text-sm">任务完成</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">任务完成时发送通知</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.taskCompleted}
                onChange={(e) => handleNotificationChange('taskCompleted', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* 系统通知 */}
      <div className={`space-y-4 ${cardClass} rounded-lg p-4`}>
        <div className="flex items-center space-x-2">
          <Monitor className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            系统通知
          </h3>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white text-sm">系统更新</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">系统更新和维护通知</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.systemUpdates}
                onChange={(e) => handleNotificationChange('systemUpdates', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
  
        </div>
      </div>

      {/* 通知方式 */}
      <div className={`space-y-4 ${cardClass} rounded-lg p-4`}>
        <div className="flex items-center space-x-2">
          <Smartphone className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            通知方式
          </h3>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-2">
              <Monitor className="w-4 h-4 text-gray-500" />
              <span className="font-medium text-gray-900 dark:text-white text-sm">桌面通知</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.desktopNotifications}
                onChange={(e) => handleNotificationChange('desktopNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-2">
              <Smartphone className="w-4 h-4 text-gray-500" />
              <span className="font-medium text-gray-900 dark:text-white text-sm">推送通知</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.pushNotifications}
                onChange={(e) => handleNotificationChange('pushNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* 静默时间 */}
       <div className={`space-y-4 ${cardClass} rounded-lg p-4`}>
          <div className="flex items-center space-x-2">
          <Bell className="w-5 h-5 text-orange-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            静默时间
          </h3>
        </div>
        
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="font-medium text-gray-900 dark:text-white text-sm">启用静默时间</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.quietHours.enabled}
                onChange={(e) => handleQuietHoursChange('enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          {notifications.quietHours.enabled && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  开始时间
                </label>
                <input
                  type="time"
                  value={notifications.quietHours.start}
                  onChange={(e) => handleQuietHoursChange('start', e.target.value)}
                  className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  结束时间
                </label>
                <input
                  type="time"
                  value={notifications.quietHours.end}
                  onChange={(e) => handleQuietHoursChange('end', e.target.value)}
                  className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleReset}
          className="flex items-center space-x-1.5 px-3 py-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors text-sm"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>重置</span>
        </button>
        
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center space-x-1.5 px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
        >
          {isSaving ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>保存中...</span>
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              <span>保存设置</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default NotificationSettings;
