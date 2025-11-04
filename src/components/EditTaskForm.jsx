import React, { useState, useEffect } from 'react';
import { Calendar, Flag, Pin, Repeat } from 'lucide-react';

const EditTaskForm = ({ task, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    content: '',
    priority: 'medium',
    dueDate: '',
    isPinned: false,
    isRecurring: false,
    recurringType: 'daily',
    recurringDays: ['1'],
    recurringMonthDays: ['1']
  });

  // 当task属性变化时，更新表单数据
  useEffect(() => {
    if (task) {
      setFormData({
        content: task.content || '',
        priority: task.priority || 'medium',
        dueDate: task.dueDate || '',
        isPinned: task.isPinned || false,
        isRecurring: task.isRecurring || false,
        recurringType: task.recurringType || 'daily',
        recurringDays: task.recurringDays || ['1'],
        recurringMonthDays: task.recurringMonthDays || ['1']
      });
    }
  }, [task]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.content.trim()) return;

    // 确保日期格式正确（yyyy-MM-dd）
    const updatedTask = {
      ...task,
      ...formData,
      dueDate: formData.dueDate ? formData.dueDate : null,
      updatedAt: new Date().toISOString()
    };

    onSave(updatedTask);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <input
          type="text"
          value={formData.content}
          onChange={(e) => handleInputChange('content', e.target.value)}
          placeholder="输入任务内容..."
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          autoFocus
        />
      </div>

      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-1.5">
          <Flag className="w-3.5 h-3.5 text-gray-500" />
          <select
            value={formData.priority}
            onChange={(e) => handleInputChange('priority', e.target.value)}
            className="px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="low">低优先级</option>
            <option value="medium">中优先级</option>
            <option value="high">高优先级</option>
          </select>
        </div>

        <div className="flex items-center space-x-1.5">
          <Calendar className="w-3.5 h-3.5 text-gray-500" />
          <input
            type="date"
            value={formData.dueDate}
            onChange={(e) => handleInputChange('dueDate', e.target.value)}
            className="px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <label className="flex items-center space-x-1.5">
          <input
            type="checkbox"
            checked={formData.isPinned}
            onChange={(e) => handleInputChange('isPinned', e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <Pin className="w-3.5 h-3.5 text-gray-500" />
          <span className="text-xs text-gray-700">置顶任务</span>
        </label>

        <label className="flex items-center space-x-1.5">
          <input
            type="checkbox"
            checked={formData.isRecurring}
            onChange={(e) => handleInputChange('isRecurring', e.target.checked)}
            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
          />
          <Repeat className="w-3.5 h-3.5 text-gray-500" />
          <span className="text-xs text-gray-700">常驻任务</span>
        </label>

        {formData.isRecurring && (
          <div className="space-y-2">
            <select
              value={formData.recurringType}
              onChange={(e) => handleInputChange('recurringType', e.target.value)}
              className="px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="daily">每日</option>
              <option value="weekly">每周</option>
              <option value="monthly">每月</option>
            </select>
            
            {formData.recurringType === 'weekly' && (
              <div className="flex flex-wrap gap-1 mt-1">
                {['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map((day, index) => {
                  const dayValue = (index + 1).toString();
                  return (
                    <label key={dayValue} className="flex items-center space-x-1">
                      <input
                        type="checkbox"
                        checked={formData.recurringDays.includes(dayValue)}
                        onChange={(e) => {
                          let newDays = [...formData.recurringDays];
                          if (e.target.checked) {
                            if (!newDays.includes(dayValue)) {
                              newDays.push(dayValue);
                            }
                          } else {
                            newDays = newDays.filter(d => d !== dayValue);
                          }
                          handleInputChange('recurringDays', newDays);
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-3 w-3"
                      />
                      <span className="text-xs">{day}</span>
                    </label>
                  );
                })}
              </div>
            )}
            
            {formData.recurringType === 'monthly' && (
              <div className="flex flex-wrap gap-1 mt-1">
                {Array.from({ length: 31 }, (_, i) => i + 1).map(day => {
                  const dayValue = day.toString();
                  return (
                    <label key={dayValue} className="flex items-center space-x-1">
                      <input
                        type="checkbox"
                        checked={formData.recurringMonthDays.includes(dayValue)}
                        onChange={(e) => {
                          let newDays = [...formData.recurringMonthDays];
                          if (e.target.checked) {
                            if (!newDays.includes(dayValue)) {
                              newDays.push(dayValue);
                            }
                          } else {
                            newDays = newDays.filter(d => d !== dayValue);
                          }
                          handleInputChange('recurringMonthDays', newDays);
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-3 w-3"
                      />
                      <span className="text-xs">{day}日</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 text-gray-600 hover:text-gray-800 transition-colors text-sm"
        >
          取消
        </button>
        <button
          type="submit"
          disabled={!formData.content.trim()}
          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
        >
          保存修改
        </button>
      </div>
    </form>
  );
};

export default EditTaskForm;