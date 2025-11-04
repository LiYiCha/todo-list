import React, { useState } from 'react';
import TaskItem from './TaskItem';
import { Clock, CheckCircle, Calendar, AlertTriangle, List } from 'lucide-react';

const StatusView = ({ tasks, onToggleComplete, onDelete, onEdit, onTogglePin, onToggleRecurring, selectedDate }) => {
  const [activeTab, setActiveTab] = useState('today');

  const getTodayTasks = () => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    return tasks.filter(task => {
      // 处理没有设置dueDate的任务
      if (!task.dueDate) {
        // 没有设置截止日期的任务也显示在今日视图中
        return true;
      }
      
      const taskDate = new Date(task.dueDate);
      
      // 今日任务
      if (task.dueDate === todayStr) {
        return true;
      }
      
      // 未完成的历史任务也显示在今日视图中
      if (taskDate < today && !task.completed) {
        return true;
      }
      
      return false;
    });
  };

  const getOverdueTasks = () => {
    const today = new Date();
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      return dueDate < today && !task.completed;
    });
  };

  const getCompletedTasks = () => {
    return tasks.filter(task => task.completed);
  };

  const getPendingTasks = () => {
    return tasks.filter(task => !task.completed);
  };

  const tabs = [
    {
      id: 'today',
      label: '今日',
      icon: Calendar,
      count: getTodayTasks().length,
      tasks: getTodayTasks()
    },
    {
      id: 'overdue',
      label: '逾期',
      icon: AlertTriangle,
      count: getOverdueTasks().length,
      tasks: getOverdueTasks()
    },
    {
      id: 'completed',
      label: '已完成',
      icon: CheckCircle,
      count: getCompletedTasks().length,
      tasks: getCompletedTasks()
    },
    {
      id: 'pending',
      label: '未完成',
      icon: Clock,
      count: getPendingTasks().length,
      tasks: getPendingTasks()
    },
    {
      id: 'all',
      label: '全部',
      icon: List,
      count: tasks.length,
      tasks: tasks
    }
  ];

  const activeTabData = tabs.find(tab => tab.id === activeTab);

  return (
    <div className="space-y-4">
      {/* 水平标签栏 - 优化移动端显示 */}
      <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg overflow-x-auto">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center space-x-1 px-3 py-2 rounded-md transition-colors flex-shrink-0
                ${activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{tab.label}</span>
              <span className={`
                px-1.5 py-0.5 text-xs rounded-full font-medium
                ${activeTab === tab.id
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200'
                  : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                }
              `}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 任务列表 */}
      <div className="space-y-2">
        {activeTabData.tasks.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            暂无{activeTabData.label}任务
          </div>
        ) : (
          activeTabData.tasks.map(task => (
            <TaskItem
                key={task.id}
                task={task}
                onToggleComplete={onToggleComplete}
                onDelete={onDelete}
                onEdit={onEdit}
                onTogglePin={onTogglePin}
                onToggleRecurring={onToggleRecurring}
                selectedDate={selectedDate}
              />
          ))
        )}
      </div>
    </div>
  );
};

export default StatusView;
