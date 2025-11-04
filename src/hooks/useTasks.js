import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import storage from '../utils/storage';
import notificationService from '../utils/notificationService';

export const useTasks = () => {
  const queryClient = useQueryClient();

  // 获取所有任务
  const {
    data: tasks = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => storage.getTasks(),
  });

  // 添加任务
  const addTaskMutation = useMutation({
    mutationFn: (task) => storage.addTask(task),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  // 更新任务
  const updateTaskMutation = useMutation({
    mutationFn: ({ id, updates }) => storage.updateTask(id, updates),
    onSuccess: (updatedTask, { id, updates }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      
      // 获取通知设置
      const notificationSettings = JSON.parse(localStorage.getItem('notificationSettings') || '{}');
      
      // 检查是否应该发送通知
      if (updates.dueDate) {
        // 如果设置了截止日期且启用了任务提醒，发送任务提醒通知
        if (notificationSettings.taskReminders) {
          notificationService.sendTaskNotification(updatedTask, 'reminder');
        }
      }
    },
  });

  // 删除任务
  const deleteTaskMutation = useMutation({
    mutationFn: (id) => storage.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  // 切换任务完成状态
  const toggleTaskComplete = async (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const newCompletedState = !task.completed;
    
    try {
      await updateTaskMutation.mutateAsync({
        id: taskId,
        updates: { completed: newCompletedState }
      });
      
      // 获取通知设置
      const notificationSettings = JSON.parse(localStorage.getItem('notificationSettings') || '{}');
      
      // 检查是否需要发送任务完成通知
      if (newCompletedState && notificationSettings.tasks && notificationSettings.tasks.taskCompleted && task) {
        notificationService.sendTaskNotification(taskId, 'taskCompleted', task);
      }
    } catch (error) {
      console.error('切换任务完成状态失败:', error);
    }
  };

  // 切换置顶状态
  const toggleTaskPin = (id) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      updateTaskMutation.mutate({
        id,
        updates: { isPinned: !task.isPinned }
      });
    }
  };

  // 切换常驻状态
  const toggleTaskRecurring = (id) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      updateTaskMutation.mutate({
        id,
        updates: { isRecurring: !task.isRecurring }
      });
    }
  };

  // 获取按优先级分类的任务
  const getTasksByPriority = () => {
    return {
      high: tasks.filter(task => task.priority === 'high'),
      medium: tasks.filter(task => task.priority === 'medium'),
      low: tasks.filter(task => task.priority === 'low')
    };
  };

  // 获取按完成状态分类的任务
  const getTasksByStatus = () => {
    return {
      completed: tasks.filter(task => task.completed),
      pending: tasks.filter(task => !task.completed)
    };
  };

  // 获取置顶任务
  const getPinnedTasks = () => {
    return tasks.filter(task => task.isPinned);
  };

  // 获取常驻任务
  const getRecurringTasks = () => {
    return tasks.filter(task => task.isRecurring);
  };

  // 搜索任务
  const searchTasks = (keyword) => {
    if (!keyword) return tasks;
    return tasks.filter(task =>
      task.content.toLowerCase().includes(keyword.toLowerCase())
    );
  };

  // 添加任务
  const addTask = async (taskData) => {
    try {
      const newTask = await addTaskMutation.mutateAsync(taskData);
      // 刷新任务列表
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      return newTask;
    } catch (error) {
      console.error('添加任务失败:', error);
      throw error;
    }
  };

  return {
    tasks,
    isLoading,
    error,
    addTask,
    updateTask: updateTaskMutation.mutate,
    deleteTask: deleteTaskMutation.mutate,
    toggleTaskComplete,
    toggleTaskPin,
    toggleTaskRecurring,
    getTasksByPriority,
    getTasksByStatus,
    getPinnedTasks,
    getRecurringTasks,
    searchTasks,
    isAddingTask: addTaskMutation.isPending,
    isUpdatingTask: updateTaskMutation.isPending,
    isDeletingTask: deleteTaskMutation.isPending,
  };
};
