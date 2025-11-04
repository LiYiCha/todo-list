// 通知服务
class NotificationService {
  constructor() {
    // 检查浏览器是否支持通知
    this.isSupported = 'Notification' in window;
    // 检查是否在移动设备上
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  // 请求通知权限
  async requestPermission() {
    if (!this.isSupported) {
      console.warn('当前浏览器不支持通知功能');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('请求通知权限失败:', error);
      return false;
    }
  }

  // 发送桌面通知（PC端）
  async sendDesktopNotification(title, options = {}) {
    if (!this.isSupported) {
      console.warn('当前浏览器不支持通知功能');
      return false;
    }

    // 检查权限
    if (Notification.permission !== 'granted') {
      const granted = await this.requestPermission();
      if (!granted) {
        console.warn('用户拒绝了通知权限');
        return false;
      }
    }

    try {
      const defaultOptions = {
        body: '',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        vibrate: [100, 50, 100],
        data: {},
        actions: [],
        silent: false
      };

      const notificationOptions = { ...defaultOptions, ...options };
      
      // 创建通知
      const notification = new Notification(title, notificationOptions);
      
      // 设置点击事件
      if (options.onClick) {
        notification.onclick = options.onClick;
      }
      
      // 设置关闭事件
      if (options.onClose) {
        notification.onclose = options.onClose;
      }
      
      // 设置错误事件
      if (options.onError) {
        notification.onerror = options.onError;
      }
      
      return true;
    } catch (error) {
      console.error('发送桌面通知失败:', error);
      return false;
    }
  }

  // 发送移动端通知
  sendMobileNotification(title, options = {}) {
    if (!this.isMobile) {
      console.warn('当前不是移动设备');
      return this.sendDesktopNotification(title, options);
    }

    // 移动设备上也使用浏览器通知API，它会在移动设备上显示为通知栏通知
    return this.sendDesktopNotification(title, {
      ...options,
      // 移动设备特定选项
      vibrate: options.vibrate || [200, 100, 200],
      requireInteraction: options.requireInteraction || false
    });
  }

  // 发送任务相关通知
  async sendTaskNotification(task, type = 'reminder') {
    let title = '';
    let body = '';
    
    // 确保任务对象存在
    if (!task) {
      console.warn('发送任务通知失败: 任务对象不存在');
      return false;
    }
    
    // 处理task可能是字符串或数字ID的情况
    let taskObj = task;
    
    // 处理数字ID的情况
    if (typeof task === 'number') {
      taskObj = { id: task, content: `任务 #${task}` };
    }
    // 处理字符串的情况
    else if (typeof task === 'string') {
      // 检查是否是纯数字字符串（任务ID）
      if (/^\d+$/.test(task)) {
        const taskId = parseInt(task, 10);
        taskObj = { id: taskId, content: `任务 #${taskId}` };
      } else {
        try {
          // 尝试解析JSON字符串
          const parsed = JSON.parse(task);
          // 检查是否是数组中的第一个任务
          taskObj = Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : parsed;
        } catch (e) {
          // 如果解析失败，直接使用字符串作为任务标题
          taskObj = { content: task };
        }
      }
    }
    
    // 调试日志
    console.log("处理后的任务对象:", taskObj);
    
    // 获取任务标题，如果content太长则截取一部分
    let taskTitle = taskObj.title || taskObj.content || '未知任务';
    if (taskTitle && typeof taskTitle === 'string' && taskTitle.length > 20) {
      taskTitle = taskTitle.substring(0, 20) + '...';
    }
    
    switch (type) {
      case 'reminder':
      case 'taskReminder':
        title = '任务提醒';
        body = `您有一个待完成的任务: ${taskTitle}`;
        break;
      case 'dueSoon':
      case 'taskDueSoon':
        title = '任务即将到期';
        body = `任务"${taskTitle}"将在短时间内到期`;
        break;
      case 'overdue':
      case 'taskOverdue':
        title = '任务已逾期';
        body = `任务"${taskTitle}"已经逾期，请尽快处理`;
        break;
      case 'completed':
      case 'taskCompleted':
        title = '任务已完成';
        body = `任务"${taskTitle}"已成功完成`;
        break;
      default:
        title = '任务通知';
        body = taskTitle || '任务状态更新';
    }

    const options = {
      body,
      icon: '/favicon.ico',
      data: { taskId: taskObj.id || '', type },
      vibrate: [100, 50, 100]
    };

    // 根据设备类型选择通知方式
    return this.isMobile 
      ? this.sendMobileNotification(title, options)
      : this.sendDesktopNotification(title, options);
  }

  // 发送系统通知
  async sendSystemNotification(title, message, options = {}) {
    const defaultOptions = {
      body: message,
      icon: '/favicon.ico',
      vibrate: [100]
    };

    const notificationOptions = { ...defaultOptions, ...options };

    // 根据设备类型选择通知方式
    return this.isMobile 
      ? this.sendMobileNotification(title, notificationOptions)
      : this.sendDesktopNotification(title, notificationOptions);
  }

  // 检查通知设置是否启用
  shouldSendNotification(notificationType, settings) {
    // 根据不同类型检查设置
    switch (notificationType) {
      case 'taskReminder':
        return settings.taskReminders;
      case 'taskDueSoon':
        return settings.taskDueSoon;
      case 'taskOverdue':
        return settings.taskOverdue;
      case 'taskCompleted':
        return settings.taskCompleted;
      case 'systemUpdate':
        return settings.systemUpdates;
      default:
        return false;
    }
  }

  // 检查是否在静默时间内
  isInQuietHours(quietHours) {
    if (!quietHours || !quietHours.enabled) return false;
    
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;
    
    const [startHour, startMinute] = quietHours.start.split(':').map(Number);
    const [endHour, endMinute] = quietHours.end.split(':').map(Number);
    
    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;
    
    // 检查是否跨越午夜
    if (startTime <= endTime) {
      // 不跨越午夜
      return currentTime >= startTime && currentTime < endTime;
    } else {
      // 跨越午夜
      return currentTime >= startTime || currentTime < endTime;
    }
  }

  // 综合发送通知方法，会考虑设置和静默时间
  async notify(title, options = {}, notificationType = 'general', settings = {}) {
    // 检查静默时间
    if (this.isInQuietHours(settings.quietHours)) {
      console.log('当前处于静默时间，不发送通知');
      return false;
    }
    
    // 检查通知类型是否启用
    if (notificationType !== 'general' && !this.shouldSendNotification(notificationType, settings)) {
      console.log(`${notificationType} 通知已被禁用`);
      return false;
    }
    
    // 检查通知方式设置
    if (!settings.desktopNotifications && !settings.pushNotifications) {
      console.log('所有通知方式均已禁用');
      return false;
    }
    
    // 根据设备类型选择通知方式
    return this.isMobile 
      ? this.sendMobileNotification(title, options)
      : this.sendDesktopNotification(title, options);
  }
}

// 导出单例
export default new NotificationService();