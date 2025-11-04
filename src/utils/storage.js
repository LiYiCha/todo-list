// 本地存储工具类
class LocalStorage {
  constructor() {
    this.storage = window.localStorage;
  }

  // 获取所有任务
  getTasks() {
    try {
      const tasks = this.storage.getItem('todos');
      return tasks ? JSON.parse(tasks) : [];
    } catch (error) {
      console.error('获取任务失败:', error);
      return [];
    }
  }

  // 保存任务
  saveTasks(tasks) {
    try {
      this.storage.setItem('todos', JSON.stringify(tasks));
      return true;
    } catch (error) {
      console.error('保存任务失败:', error);
      return false;
    }
  }

  // 添加任务
  addTask(task) {
    const tasks = this.getTasks();
    const newTask = {
      id: Date.now().toString(),
      content: task.content,
      priority: task.priority || 'medium',
      completed: false,
      dueDate: task.dueDate || null,
      isPinned: task.isPinned || false,
      isRecurring: task.isRecurring || false,
      recurringType: task.recurringType || 'daily',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    tasks.push(newTask);
    this.saveTasks(tasks);
    return newTask;
  }

  // 更新任务
  updateTask(id, updates) {
    const tasks = this.getTasks();
    
    // 确保没有重复ID的任务
    const duplicateIds = tasks.filter(task => task.id === id);
    if (duplicateIds.length > 1) {
      console.warn('检测到重复ID任务，清理重复项:', id);
      // 只保留第一个，删除其他重复项
      const uniqueTasks = tasks.filter((task, index) => {
        if (task.id === id) {
          return tasks.findIndex(t => t.id === id) === index;
        }
        return true;
      });
      tasks.length = 0;
      uniqueTasks.forEach(task => tasks.push(task));
    }
    
    const index = tasks.findIndex(task => task.id === id);
    if (index !== -1) {
      const currentTask = tasks[index];
      const isCompletingTask = updates.completed === true && currentTask.completed !== true;
      const isReopeningTask = updates.completed === false && currentTask.completed === true;
      
      const updatedTask = {
        ...currentTask,
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      // 如果任务被标记为完成，记录完成时间
      if (isCompletingTask) {
        updatedTask.completedAt = new Date().toISOString();
      }
      // 如果任务从完成状态恢复为未完成，移除完成时间
      else if (isReopeningTask && updatedTask.completedAt) {
        delete updatedTask.completedAt;
      }
      
      tasks[index] = updatedTask;
      this.saveTasks(tasks);
      return updatedTask;
    }
    return null;
  }

  // 删除任务
  deleteTask(id) {
    const tasks = this.getTasks();
    const filteredTasks = tasks.filter(task => task.id !== id);
    this.saveTasks(filteredTasks);
    return true;
  }

  // 导出数据
  exportData() {
    const tasks = this.getTasks();
    return JSON.stringify(tasks, null, 2);
  }

  // 导入数据
  importData(jsonData) {
    try {
      const tasks = JSON.parse(jsonData);
      if (Array.isArray(tasks)) {
        this.saveTasks(tasks);
        return true;
      }
      return false;
    } catch (error) {
      console.error('导入数据失败:', error);
      return false;
    }
  }
}

export default new LocalStorage();
