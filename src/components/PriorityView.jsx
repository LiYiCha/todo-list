import React from 'react';
import TaskItem from './TaskItem';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';

const PriorityView = ({ tasks, onToggleComplete, onDelete, onEdit, onTogglePin, onToggleRecurring }) => {
  // 分离已完成和未完成任务
  const completedTasks = tasks.filter(task => task.completed);
  const pendingTasks = tasks.filter(task => !task.completed);

  // 按优先级分组未完成任务
  const priorityGroups = {
    high: {
      label: '高优先级',
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      tasks: pendingTasks.filter(task => task.priority === 'high')
    },
    medium: {
      label: '中优先级',
      icon: AlertCircle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      tasks: pendingTasks.filter(task => task.priority === 'medium')
    },
    low: {
      label: '低优先级',
      icon: Info,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      tasks: pendingTasks.filter(task => task.priority === 'low')
    }
  };

  return (
    <div className="space-y-6">
      {/* 按优先级分组显示未完成任务 */}
      {Object.entries(priorityGroups).map(([priority, group]) => {
        const Icon = group.icon;
        return (
          <div key={priority} className={`${group.bgColor} rounded-lg p-4 border ${group.borderColor}`}>
            <div className="flex items-center space-x-2 mb-4">
              <Icon className={`w-5 h-5 ${group.color}`} />
              <h3 className={`font-semibold ${group.color}`}>
                {group.label} ({group.tasks.length})
              </h3>
            </div>
            
            <div className="space-y-3">
              {group.tasks.length === 0 ? (
                <p className="text-gray-500 text-sm">暂无任务</p>
              ) : (
                group.tasks.map(task => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggleComplete={onToggleComplete}
                    onDelete={onDelete}
                    onEdit={onEdit}
                    onTogglePin={onTogglePin}
                    onToggleRecurring={onToggleRecurring}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}

      {/* 已完成任务 - 移到底部 */}
      {completedTasks.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 className="font-semibold text-gray-700 mb-4">
            已完成任务 ({completedTasks.length})
          </h3>
          <div className="space-y-3">
            {completedTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onToggleComplete={onToggleComplete}
                onDelete={onDelete}
                onEdit={onEdit}
                onTogglePin={onTogglePin}
                onToggleRecurring={onToggleRecurring}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PriorityView;
