import React from 'react';
import TaskItem from './TaskItem';
import { Search, Filter } from 'lucide-react';

const TaskList = ({ 
  tasks, 
  onToggleComplete, 
  onDelete, 
  onEdit, 
  onTogglePin,
  onToggleRecurring,
  searchTerm, 
  onSearchChange,
  filterType = 'all',
  onFilterChange,
  selectedDate
} = {}) => {
  const getFilteredTasks = () => {
    let filteredTasks = tasks;

    // 搜索过滤
    if (searchTerm) {
      filteredTasks = filteredTasks.filter(task =>
        task.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 状态过滤
    if (filterType === 'completed') {
      filteredTasks = filteredTasks.filter(task => task.completed);
    } else if (filterType === 'pending') {
      filteredTasks = filteredTasks.filter(task => !task.completed);
    }

    // 排序逻辑：置顶任务优先 > 已完成任务在最下面 > 按优先级从高到低
    filteredTasks.sort((a, b) => {
      // 首先按置顶状态排序
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      
      // 然后按完成状态排序（未完成在前，已完成在后）
      if (!a.completed && b.completed) return -1;
      if (a.completed && !b.completed) return 1;
      
      // 最后按优先级排序（高到低）
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    return filteredTasks;
  };

  const filteredTasks = getFilteredTasks();

  return (
    <div className="space-y-3">
      {/* 搜索和过滤栏 - 减小大小 */}
      <div className="flex items-center space-x-2">
        <div className="flex-1 relative">
          <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="搜索任务..."
            className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>
        
        <div className="flex items-center space-x-1.5">
          <Filter className="w-3.5 h-3.5 text-gray-500" />
          <select
            value={filterType}
            onChange={(e) => onFilterChange(e.target.value)}
            className="px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="all">全部任务</option>
            <option value="pending">待完成</option>
            <option value="completed">已完成</option>
          </select>
        </div>
      </div>

      {/* 任务列表 */}
      <div className="space-y-2">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-6 text-gray-500 text-sm">
            {searchTerm ? '没有找到匹配的任务' : '暂无任务'}
          </div>
        ) : (
          filteredTasks.map(task => (
            <TaskItem
                key={`${task.id}-${task.updatedAt || task.createdAt || Date.now()}`}
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

      {/* 统计信息 */}
      {tasks.length > 0 && (
        <div className="text-xs text-gray-500 text-center pt-3 border-t">
          共 {tasks.length} 个任务，已完成 {tasks.filter(t => t.completed).length} 个
        </div>
      )}
    </div>
  );
};

export default TaskList;
