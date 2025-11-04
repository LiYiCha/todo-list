// 任务监控服务 - 定期检查任务截止日期并发送通知，支持常驻任务管理
import storage from './storage';
import notificationService from './notificationService';

class TaskMonitor {
  constructor() {
    this.timer = null;
    this.checkInterval = 5 * 60 * 1000; // 5分钟检查一次
    this.dueSoonThreshold = 1 * 60 * 60 * 1000; // 1小时内即将到期
  }

  // 启动监控
  start() {
    if (this.timer) {
      console.warn('任务监控已在运行');
      return;
    }

    // 立即执行一次检查
    this.checkTasks();

    // 设置定期检查
    this.timer = setInterval(() => {
      this.checkTasks();
    }, this.checkInterval);

    console.log('任务监控已启动');
  }

  // 停止监控
  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      console.log('任务监控已停止');
    }
  }

  // 检查任务
  async checkTasks() {
    try {
      
      // 获取通知设置
      const notificationSettings = JSON.parse(localStorage.getItem('notificationSettings') || '{}');
      
      // 如果通知功能未启用，跳过检查
      if (!notificationSettings.desktopNotifications && !notificationSettings.pushNotifications) {
        return;
      }

      // 获取任务数据
      const tasks = storage.getTasks() || [];
      const now = new Date();
      
      // 处理常驻任务
      this.processRecurringTasks(tasks, now, storage);
      
      // 重新获取更新后的任务列表
      const updatedTasks = storage.getTasks() || [];

      updatedTasks.forEach(task => {
        // 跳过已完成的任务
        if (task.completed) return;

        // 如果没有截止日期，跳过
        if (!task.dueDate) return;

        const dueDate = new Date(task.dueDate);
        const timeUntilDue = dueDate - now;

        // 检查是否已逾期
        if (timeUntilDue < 0) {
          // 检查是否应该发送逾期通知
          if (notificationSettings.taskOverdue) {
            // 为了避免频繁发送通知，我们可以记录最后发送的时间
            const lastSentKey = `lastOverdueNotification_${task.id}`;
            const lastSentTime = localStorage.getItem(lastSentKey);
            const oneHourAgo = now.getTime() - 60 * 60 * 1000;

            // 如果上次发送通知是在一小时前，或者从未发送过，则发送
            if (!lastSentTime || parseInt(lastSentTime) < oneHourAgo) {
              notificationService.sendTaskNotification(task.id, 'overdue', task);
              localStorage.setItem(lastSentKey, now.getTime().toString());
            }
          }
        } 
        // 检查是否即将到期（在阈值内）
        else if (timeUntilDue <= this.dueSoonThreshold) {
          // 检查是否应该发送即将到期通知
          if (notificationSettings.taskDueSoon) {
            // 记录最后发送时间，避免重复发送
            const lastSentKey = `lastDueSoonNotification_${task.id}`;
            const lastSentTime = localStorage.getItem(lastSentKey);
            
            // 对于即将到期的通知，我们只发送一次
            if (!lastSentTime) {
              notificationService.sendTaskNotification(task.id, 'dueSoon', task);
              localStorage.setItem(lastSentKey, now.getTime().toString());
            }
          }
        }
      });
    } catch (error) {
      console.error('检查任务时出错:', error);
    }
  }
  
  // 处理常驻任务
  processRecurringTasks(tasks, targetDate, storage, selectedDate = null) {
    const recurringTasks = tasks.filter(task => task.isRecurring);
    const targetDateStr = targetDate.toISOString().split('T')[0];
    const dayOfWeek = (targetDate.getDay() || 7).toString(); // 转换为1-7，1代表周一
    const dayOfMonth = targetDate.getDate().toString();
    
    let hasUpdates = false;
    const updatedTasks = [...tasks];
    
    recurringTasks.forEach(task => {
      // 检查任务是否应该在目标日期显示
      let shouldShowOnDate = false;
      
      switch (task.recurringType) {
        case 'daily':
          // 每日任务每天都显示
          shouldShowOnDate = true;
          break;
        case 'weekly':
          // 每周任务，检查是否在选中的星期几
          const recurringDays = task.recurringDays || ['1'];
          shouldShowOnDate = recurringDays.includes(dayOfWeek);
          break;
        case 'monthly':
          // 每月任务，检查是否在选中的日期
          const recurringMonthDays = task.recurringMonthDays || ['1'];
          shouldShowOnDate = recurringMonthDays.includes(dayOfMonth);
          break;
      }
      
      // 如果是用户手动选择的日期（不是当前日期）
      if (selectedDate && selectedDate !== targetDate) {
        // 对于手动选择的日期，我们只需要确保在该日期显示任务时，任务的dueDate正确
        if (shouldShowOnDate && task.dueDate !== targetDateStr) {
          const taskIndex = updatedTasks.findIndex(t => t.id === task.id);
          if (taskIndex !== -1) {
            updatedTasks[taskIndex].dueDate = targetDateStr;
            hasUpdates = true;
          }
        }
        return;
      }
      
      // 如果任务已完成但目标日期应该显示，则重置为未完成并更新截止日期
      if (task.completed && shouldShowOnDate) {
        // 检查任务上次完成日期是否不是目标日期
        const taskCompletedDate = task.completedAt ? task.completedAt.split('T')[0] : null;
        if (taskCompletedDate !== targetDateStr) {
          const taskIndex = updatedTasks.findIndex(t => t.id === task.id);
          if (taskIndex !== -1) {
            updatedTasks[taskIndex].completed = false;
            updatedTasks[taskIndex].dueDate = targetDateStr;
            // 移除完成时间，保留其他历史数据
            if (updatedTasks[taskIndex].completedAt) {
              delete updatedTasks[taskIndex].completedAt;
            }
            hasUpdates = true;
          }
        }
      }
      // 如果任务未完成且目标日期应该显示，但截止日期不是目标日期，则更新截止日期
      else if (!task.completed && shouldShowOnDate && (!task.dueDate || task.dueDate !== targetDateStr)) {
        const taskIndex = updatedTasks.findIndex(t => t.id === task.id);
        if (taskIndex !== -1) {
          updatedTasks[taskIndex].dueDate = targetDateStr;
          hasUpdates = true;
        }
      }
      // 如果任务未完成但目标日期不应该显示，则设置一个未来合适的日期
      else if (!task.completed && !shouldShowOnDate && task.dueDate === targetDateStr) {
        // 找到下一个应该显示的日期
        const nextOccurrence = this.findNextRecurrenceDate(targetDate, task);
        if (nextOccurrence) {
          const taskIndex = updatedTasks.findIndex(t => t.id === task.id);
          if (taskIndex !== -1) {
            updatedTasks[taskIndex].dueDate = nextOccurrence.toISOString().split('T')[0];
            hasUpdates = true;
          }
        }
      }
    });
    
    // 如果有更新，保存到存储
    if (hasUpdates) {
      storage.saveTasks(updatedTasks);
    }
    
    return hasUpdates;
  }
  
  // 手动处理特定日期的常驻任务（供UI手动切换日期时调用）
  processRecurringTasksForDate(selectedDate) {
    const tasks = storage.getTasks() || [];
    return this.processRecurringTasks(tasks, new Date(), storage, selectedDate);
  }
  
  // 找到任务的下一个重复日期
  findNextRecurrenceDate(currentDate, task) {
    const nextDate = new Date(currentDate);
    nextDate.setDate(nextDate.getDate() + 1); // 从明天开始查找
    
    // 最多查找365天
    for (let i = 0; i < 365; i++) {
      const dayOfWeek = (nextDate.getDay() || 7).toString();
      const dayOfMonth = nextDate.getDate().toString();
      
      let shouldShowOnThisDate = false;
      
      switch (task.recurringType) {
        case 'daily':
          shouldShowOnThisDate = true;
          break;
        case 'weekly':
          const recurringDays = task.recurringDays || ['1'];
          shouldShowOnThisDate = recurringDays.includes(dayOfWeek);
          break;
        case 'monthly':
          const recurringMonthDays = task.recurringMonthDays || ['1'];
          shouldShowOnThisDate = recurringMonthDays.includes(dayOfMonth);
          break;
      }
      
      if (shouldShowOnThisDate) {
        return nextDate;
      }
      
      nextDate.setDate(nextDate.getDate() + 1);
    }
    
    return null;
  }

  // 手动触发任务检查
  triggerCheck() {
    this.checkTasks();
  }

  // 设置检查间隔
  setCheckInterval(interval) {
    this.checkInterval = interval;
    // 重新启动计时器以应用新的间隔
    if (this.timer) {
      this.stop();
      this.start();
    }
  }

  // 设置即将到期的阈值
  setDueSoonThreshold(threshold) {
    this.dueSoonThreshold = threshold;
  }
}

// 导出单例实例
const taskMonitor = new TaskMonitor();

// 在页面加载时启动监控
document.addEventListener('DOMContentLoaded', () => {
  taskMonitor.start();
});

// 在页面关闭时清理
document.addEventListener('beforeunload', () => {
  taskMonitor.stop();
});

export default taskMonitor;