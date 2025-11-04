// 系统通知服务
import notificationService from './notificationService';

class SystemNotificationService {
  constructor() {
    this.lastSentNotifications = new Map();
  }

  // 发送系统更新通知
  async sendSystemUpdateNotification(message, options = {}) {
    // 获取通知设置
    const notificationSettings = JSON.parse(localStorage.getItem('notificationSettings') || '{}');
    
    // 检查系统更新通知是否启用
    if (!notificationSettings.systemUpdates) {
      console.log('系统更新通知已禁用');
      return false;
    }
    
    // 检查是否应该发送通知（避免重复发送相同的通知）
    const notificationId = options.id || `system_update_${Date.now()}`;
    const now = Date.now();
    const lastSent = this.lastSentNotifications.get(notificationId);
    
    // 如果通知在过去24小时内已发送，不重复发送
    if (lastSent && (now - lastSent < 24 * 60 * 60 * 1000)) {
      console.log(`通知 ${notificationId} 在过去24小时内已发送，跳过`);
      return false;
    }
    
    // 记录发送时间
    this.lastSentNotifications.set(notificationId, now);
    
    // 发送通知
    return notificationService.sendSystemNotification('系统更新', message, {
      ...options,
      icon: '/favicon.ico',
      badge: '/favicon.ico'
    });
  }

  // 发送维护通知
  async sendMaintenanceNotification(startTime, endTime, message = '系统将进行例行维护') {
    const formattedMessage = `${message}\n维护时间: ${startTime} - ${endTime}`;
    
    return this.sendSystemUpdateNotification(formattedMessage, {
      id: 'maintenance_notification',
      vibrate: [100, 50, 100],
      requireInteraction: true
    });
  }

  // 发送重要公告
  async sendAnnouncement(title, message, options = {}) {
    return notificationService.notify(title, {
      body: message,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options,
      requireInteraction: true
    }, 'systemUpdate');
  }

  // 清理过期的通知记录
  cleanOldNotifications() {
    const now = Date.now();
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
    
    for (const [id, timestamp] of this.lastSentNotifications.entries()) {
      if (timestamp < oneWeekAgo) {
        this.lastSentNotifications.delete(id);
      }
    }
  }

  // 清除所有通知记录
  clearAllNotifications() {
    this.lastSentNotifications.clear();
  }
}

// 导出单例
export default new SystemNotificationService();