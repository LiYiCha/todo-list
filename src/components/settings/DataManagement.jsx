import React, { useState, useCallback } from 'react';
import { Upload, Download, FileText, AlertCircle, CheckCircle, X } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useToast } from '../ui/use-toast';
import storage from '../../utils/storage';
import { startOfWeek, startOfMonth, isWithinInterval, isToday, parseISO } from 'date-fns';

const DataManagement = ({ isTransparentMode }) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [timeRange, setTimeRange] = useState('all');
  const [taskStatus, setTaskStatus] = useState('all');
  const { toast } = useToast();
  
  // 根据透明模式设置容器类名
  const containerClass = isTransparentMode 
    ? 'bg-white/90 backdrop-blur-md' 
    : 'bg-white dark:bg-gray-800';
  const cardClass = isTransparentMode 
    ? 'bg-white/80 backdrop-blur-sm' 
    : 'bg-white dark:bg-gray-800';

  const onDrop = useCallback((acceptedFiles) => {
    setSelectedFiles(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/json': ['.json']
    },
    multiple: true
  });

  // 根据筛选条件获取任务
  const getFilteredTasks = () => {
    const allTasks = storage.getTasks();
    let filteredTasks = [...allTasks];

    // 时间范围筛选
    if (timeRange !== 'all') {
      const now = new Date();
      filteredTasks = filteredTasks.filter(task => {
        if (!task.dueDate && !task.createdAt) return false;
        const taskDate = task.dueDate ? parseISO(task.dueDate) : parseISO(task.createdAt);
        
        switch (timeRange) {
          case 'today':
            return isToday(taskDate);
          case 'week':
            const weekStart = startOfWeek(now, { weekStartsOn: 1 });
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 6);
            return isWithinInterval(taskDate, { start: weekStart, end: weekEnd });
          case 'month':
            const monthStart = startOfMonth(now);
            const monthEnd = new Date(monthStart);
            monthEnd.setMonth(monthEnd.getMonth() + 1);
            monthEnd.setDate(0);
            return isWithinInterval(taskDate, { start: monthStart, end: monthEnd });
          default:
            return true;
        }
      });
    }

    // 任务状态筛选
    if (taskStatus !== 'all') {
      filteredTasks = filteredTasks.filter(task => {
        if (taskStatus === 'pending') return !task.completed;
        if (taskStatus === 'completed') return !!task.completed;
        return true;
      });
    }

    return filteredTasks;
  };

  // 将数据转换为CSV格式
  const convertToCSV = (tasks) => {
    const headers = ['ID', '内容', '优先级', '完成状态', '截止日期', '创建时间', '更新时间'];
    const csvRows = [headers.join(',')];

    tasks.forEach(task => {
      const values = [
        task.id,
        `"${task.content || ''}"`,
        task.priority || 'medium',
        task.completed ? '已完成' : '待完成',
        task.dueDate || '',
        task.createdAt || '',
        task.updatedAt || ''
      ];
      csvRows.push(values.join(','));
    });

    return csvRows.join('\n');
  };

  // 模拟Excel导出（实际使用CSV格式，但使用Excel扩展名）
  const convertToExcel = (tasks) => {
    // Excel实际上可以直接打开CSV文件，这里我们生成一个带有Excel MIME类型的CSV
    return convertToCSV(tasks);
  };

  const handleImport = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "请先选择文件",
        description: "请选择要导入的文件",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // 实际导入功能
      const file = selectedFiles[0]; // 只处理第一个文件
      const reader = new FileReader();
      
      // 模拟进度更新
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 10;
        });
      }, 100);
      
      reader.onload = (e) => {
        try {
          clearInterval(progressInterval);
          const content = e.target.result;
          
          if (file.name.endsWith('.json')) {
            try {
              const importData = JSON.parse(content);
              // 确保是数组格式
              const importTasks = Array.isArray(importData) ? importData : [];
              
              // 获取现有任务并去重
              const existingTasks = storage.getTasks();
              const existingTaskIds = new Set(existingTasks.map(task => task.id));
              
              // 为导入任务生成新ID并去重
              const newTasks = importTasks
                .map(task => ({
                  ...task,
                  // 生成新的唯一ID，避免重复
                  id: Date.now().toString() + Math.floor(Math.random() * 10000) + '_' + Math.floor(Math.random() * 1000),
                  priority: ['high', 'medium', 'low'].includes(task.priority) ? task.priority : 'medium'
                }))
                .filter(task => !existingTaskIds.has(task.id));
              
              if (newTasks.length > 0) {
                const mergedTasks = [...existingTasks, ...newTasks];
                storage.saveTasks(mergedTasks);
                
                setUploadProgress(100);
                toast({
                  title: "导入成功",
                  description: `成功导入 ${newTasks.length} 个新任务`,
                });
              } else {
                setUploadProgress(100);
                toast({
                  title: "导入完成",
                  description: "未发现新任务，所有任务已存在",
                });
              }
              
              // 延迟刷新页面，让用户看到完成进度
              setTimeout(() => {
                window.location.reload();
              }, 500);
            } catch (error) {
              console.error('JSON导入错误:', error);
              toast({
                title: "导入失败",
                description: "JSON文件格式不正确或数据无效",
                variant: "destructive"
              });
            }
          } else if (file.name.endsWith('.csv') || file.name.endsWith('.xls') || file.name.endsWith('.xlsx')) {
            // 简单的CSV解析
            const lines = content.split('\n').filter(line => line.trim());
            if (lines.length < 2) {
              throw new Error('文件格式不正确');
            }
            
            // 跳过标题行
            const dataRows = lines.slice(1);
            const tasks = [];
            
            dataRows.forEach(row => {
              // 更健壮的CSV解析，处理引号内的逗号
              const values = [];
              let currentValue = '';
              let inQuotes = false;
              let escaped = false;
              
              for (let i = 0; i < row.length; i++) {
                const char = row[i];
                
                if (escaped) {
                  currentValue += char;
                  escaped = false;
                } else if (char === '\\') {
                  escaped = true;
                } else if (char === '"') {
                  inQuotes = !inQuotes;
                } else if (char === ',' && !inQuotes) {
                  values.push(currentValue.trim());
                  currentValue = '';
                } else {
                  currentValue += char;
                }
              }
              values.push(currentValue.trim());
              
              // 确保至少有3个值才能创建任务
              if (values.length >= 3) {
                // 创建任务对象
              const newTask = {
                id: Date.now().toString() + Math.floor(Math.random() * 10000),
                content: values[1] || '未命名任务',
                priority: ['high', 'medium', 'low'].includes(values[2]) ? values[2] : 'medium',
                completed: values[3] === '已完成' || values[3] === 'true' || values[3] === '1',
                dueDate: values[4] && values[4] !== 'null' && values[4] !== '' ? values[4] : null,
                createdAt: values[5] || new Date().toISOString(),
                updatedAt: values[6] || new Date().toISOString()
              };
              tasks.push(newTask);
              } else {
                console.warn('跳过无效行:', row);
              }
            });
            
            if (tasks.length > 0) {
                // 获取现有任务并去重
                const existingTasks = storage.getTasks();
                const existingTaskIds = new Set(existingTasks.map(task => task.id));
                
                // 只添加新任务，避免重复
                const newTasks = tasks.filter(task => !existingTaskIds.has(task.id));
                
                if (newTasks.length > 0) {
                  const mergedTasks = [...existingTasks, ...newTasks];
                  storage.saveTasks(mergedTasks);
                  
                  setUploadProgress(100);
                  toast({
                    title: "导入成功",
                    description: `成功导入 ${newTasks.length} 个新任务`,
                  });
                } else {
                  setUploadProgress(100);
                  toast({
                    title: "导入完成",
                    description: "未发现新任务，所有任务已存在",
                  });
                }
                
                setTimeout(() => {
                  window.location.reload();
                }, 500);
              } else {
                throw new Error('未找到有效任务数据');
              }
          } else {
            toast({
              title: "导入失败",
              description: "不支持的文件格式",
              variant: "destructive"
            });
          }
        } catch (error) {
          console.error('导入错误:', error);
          toast({
            title: "导入失败",
            description: error.message || "处理文件时出错",
            variant: "destructive"
          });
        } finally {
          setIsUploading(false);
          setSelectedFiles([]);
          setTimeout(() => {
            setUploadProgress(0);
          }, 1000);
        }
      };
      
      reader.readAsText(file);
    } catch (error) {
      console.error('导入错误:', error);
      toast({
        title: "导入失败",
        description: error.message,
        variant: "destructive"
      });
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleExport = (format) => {
    try {
      // 获取筛选后的任务
      const filteredTasks = getFilteredTasks();
      
      if (filteredTasks.length === 0) {
        toast({
          title: "无数据可导出",
          description: "根据当前筛选条件没有找到任务",
          variant: "destructive"
        });
        return;
      }
      
      let content;
      let mimeType;
      let extension;
      
      switch (format) {
        case 'CSV':
          content = convertToCSV(filteredTasks);
          mimeType = 'text/csv;charset=utf-8;';
          extension = 'csv';
          break;
        case 'Excel':
          content = convertToExcel(filteredTasks);
          mimeType = 'application/vnd.ms-excel;charset=utf-8;';
          extension = 'xls';
          break;
        case 'JSON':
          content = JSON.stringify(filteredTasks, null, 2);
          mimeType = 'application/json';
          extension = 'json';
          break;
        default:
          throw new Error('不支持的导出格式');
      }
      
      // 创建下载链接
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `todo-data-${new Date().toISOString().split('T')[0]}.${extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "导出成功",
        description: `成功导出 ${filteredTasks.length} 个任务为 ${format} 格式`,
      });
    } catch (error) {
      console.error('导出错误:', error);
      toast({
        title: "导出失败",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className={`space-y-6 ${containerClass}`}>
      {/* 数据导入 */}
      <div className={`${cardClass} space-y-4 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700`}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          数据导入
        </h3>
        
        {/* 文件拖拽区域 */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragActive
              ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 hover:border-gray-400 dark:border-gray-600'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            {isDragActive ? '释放文件以上传' : '拖拽文件到此处或点击选择文件'}
          </p>
          <p className="text-sm text-gray-500">
            支持 CSV、Excel、JSON 格式
          </p>
        </div>

        {/* 选中的文件列表 */}
        {selectedFiles.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900 dark:text-white">选中的文件：</h4>
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50/80 dark:bg-gray-700/80 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-gray-500" />
                  <span className="text-sm font-medium">{file.name}</span>
                  <span className="text-xs text-gray-500">
                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 上传进度 */}
        {isUploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">上传进度</span>
              <span className="text-gray-600 dark:text-gray-400">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* 导入按钮 */}
        <button
          onClick={handleImport}
          disabled={selectedFiles.length === 0 || isUploading}
          className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isUploading ? '导入中...' : '开始导入'}
        </button>
      </div>

      {/* 数据导出 */}
      <div className={`${cardClass} space-y-4 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700`}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          数据导出
        </h3>
        
        {/* 导出格式选择 */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          <button
            type="button"
            className={`p-2 rounded-lg text-center flex flex-col items-center justify-center ${isTransparentMode ? 'bg-white/70 hover:bg-white/90' : 'bg-gray-100 hover:bg-gray-200'} dark:bg-gray-800/70 dark:hover:bg-gray-700/90 transition-colors`}
            onClick={() => handleExport('JSON')}
          >
            <FileText size={24} className="mb-1" />
            <span className="text-sm">JSON</span>
          </button>
          
          <button
            type="button"
            className={`p-2 rounded-lg text-center flex flex-col items-center justify-center ${isTransparentMode ? 'bg-white/70 hover:bg-white/90' : 'bg-gray-100 hover:bg-gray-200'} dark:bg-gray-800/70 dark:hover:bg-gray-700/90 transition-colors`}
            onClick={() => handleExport('CSV')}
          >
            <FileText size={24} className="mb-1" />
            <span className="text-sm">CSV</span>
          </button>
          
          <button
            type="button"
            className={`p-2 rounded-lg text-center flex flex-col items-center justify-center ${isTransparentMode ? 'bg-white/70 hover:bg-white/90' : 'bg-gray-100 hover:bg-gray-200'} dark:bg-gray-800/70 dark:hover:bg-gray-700/90 transition-colors`}
            onClick={() => handleExport('Excel')}
          >
            <FileText size={24} className="mb-1" />
            <span className="text-sm">Excel</span>
          </button>
        </div>
      </div>

      {/* 数据筛选条件 */}
      <div className={`${cardClass} space-y-4 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700`}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          导出筛选条件
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              时间范围
            </label>
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/80 dark:bg-gray-700/80 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">全部时间</option>
              <option value="today">今天</option>
              <option value="week">本周</option>
              <option value="month">本月</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              任务状态
            </label>
            <select 
              value={taskStatus}
              onChange={(e) => setTaskStatus(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/80 dark:bg-gray-700/80 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">全部状态</option>
              <option value="pending">待完成</option>
              <option value="completed">已完成</option>
            </select>
          </div>
        </div>
        
        {/* 筛选结果预览 */}
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">筛选结果</span>
              <span className="text-blue-600 dark:text-blue-400 font-medium">
                {getFilteredTasks().length} 个任务
              </span>
            </div>
          </div>
      </div>
    </div>
  );
};

export default DataManagement;
