import React from 'react';
import { Check, Clock, AlertCircle, Trash2, Edit, Pin, Repeat } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

const TaskItem = ({ task, onToggleComplete, onDelete, onEdit, onTogglePin, onToggleRecurring, selectedDate = new Date() }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case 'high':
        return '高';
      case 'medium':
        return '中';
      case 'low':
        return '低';
      default:
        return '中';
    }
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    // 使用用户选择的日期而不是当前真实日期来判断是否逾期
    const compareDate = new Date(selectedDate);
    compareDate.setHours(0, 0, 0, 0); // 设置时间为当天开始
    
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0); // 设置时间为当天开始
    
    return due < compareDate && !task.completed;
  };

  // 从body元素获取透明模式状态
  const isTransparentMode = document.body.classList.contains('transparent-mode');

  return (
    <div className={`p-3 border rounded-lg shadow-sm transition-all duration-200 hover:shadow-md ${
      isTransparentMode 
        ? task.completed ? 'bg-gray-50/80 backdrop-blur-sm opacity-75 border-gray-200/50' : 'glass-card'
        : task.completed ? 'bg-gray-50 opacity-75' : 'bg-white'
    } ${task.isPinned ? 'border-l-4 border-l-blue-500' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-2 flex-1">
          <button
            onClick={() => onToggleComplete(task.id)}
            className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
              task.completed
                ? 'bg-green-500 border-green-500 text-white'
                : 'border-gray-300 hover:border-green-400'
            }`}
          >
            {task.completed && <Check className="w-2.5 h-2.5" />}
          </button>
          
          <div className="flex-1">
            <div className="flex items-center space-x-1.5">
              <h3 className={`text-sm font-medium ${
                task.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-950 dark:text-white'
              }`}>
                {task.content}
              </h3>
              {task.isPinned && <Pin className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />}
              {task.isRecurring && <Repeat className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />}
            </div>
            
            <div className="flex items-center space-x-2 mt-1.5">
              <span className={`px-1.5 py-0.5 text-xs font-medium rounded-full border ${getPriorityColor(task.priority)}`}>
                {getPriorityText(task.priority)}
              </span>
              
              {task.dueDate && (
                <div className={`flex items-center space-x-1 text-xs ${
                  isOverdue(task.dueDate) ? 'text-red-600' : 'text-gray-500'
                }`}>
                  <Clock className="w-3 h-3" />
                  <span>
                    {format(new Date(task.dueDate), 'MM月dd日', { locale: zhCN })}
                  </span>
                  {isOverdue(task.dueDate) && (
                    <AlertCircle className="w-3 h-3" />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onTogglePin(task.id)}
            className={`p-1 transition-colors ${
              task.isPinned ? 'text-blue-600' : 'text-gray-400 hover:text-blue-600'
            }`}
          >
            <Pin className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onToggleRecurring(task.id)}
            className={`p-1 transition-colors ${
              task.isRecurring ? 'text-green-600' : 'text-gray-400 hover:text-green-600'
            }`}
          >
            <Repeat className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onEdit(task)}
            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskItem;
