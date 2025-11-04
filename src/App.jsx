import React, { useState, useEffect, useRef } from 'react';
import { Menu } from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTasks } from './hooks/useTasks';
import Navigation from './components/Navigation';
import AddTaskForm from './components/AddTaskForm';
import EditTaskForm from './components/EditTaskForm';
import TaskList from './components/TaskList';
import PriorityView from './components/PriorityView';
import StatusView from './components/StatusView';
import Settings from './pages/Settings';
import SidebarModal from './components/SidebarModal';
import { ToastProvider } from './components/ui/toast';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format, addDays, subDays } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import taskMonitor from './utils/taskMonitor';
  // 导入GlassTestPage组件用于测试页面渲染
  import GlassTestPage from './test/GlassTestPage.jsx';
  const queryClient = new QueryClient();

function TodoApp() {
  const {
    tasks,
    isLoading,
    addTask,
    deleteTask,
    updateTask,
    toggleTaskComplete,
    toggleTaskPin,
    toggleTaskRecurring,
    getTasksByPriority,
    getTasksByStatus,
    isAddingTask
  } = useTasks();

  const [activeView, setActiveView] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isEyeProtectionMode, setIsEyeProtectionMode] = useState(false);
  const [isTransparentMode, setIsTransparentMode] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showSettings, setShowSettings] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // 侧边栏引用
  const navigationRef = useRef(null);
  // 布局设置
  const [sidebarPosition, setSidebarPosition] = useState('left');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [layoutMode, setLayoutMode] = useState('default');
  const [density, setDensity] = useState('normal');
  const [themeColor, setThemeColor] = useState(null);
  
  // 计算任务统计
  const taskCounts = {
    total: tasks.length,
    pending: tasks.filter(t => !t.completed).length,
    completed: tasks.filter(t => t.completed).length
  };

  // 打开侧边栏
  const openSidebar = () => {
    setIsSidebarOpen(true);
  };

  // 关闭侧边栏
  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // 主题切换
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // 护眼模式切换
  useEffect(() => {
    if (isEyeProtectionMode) {
      document.body.classList.add('eye-protection');
      // 关闭深色模式，但保留透明模式
      document.documentElement.classList.remove('dark');
      setIsDarkMode(false);
    } else {
      document.body.classList.remove('eye-protection');
    }
  }, [isEyeProtectionMode]);

  // 透明模式切换
  useEffect(() => {
    if (isTransparentMode) {
      document.body.classList.add('transparent-mode');
      // 移除强制关闭深色模式的代码，允许透明模式和深色模式共存
    } else {
      document.body.classList.remove('transparent-mode');
    }
  }, [isTransparentMode]);
  
  // 布局设置更新
  useEffect(() => {
    // 应用侧边栏位置
    document.documentElement.classList.remove('sidebar-left', 'sidebar-right');
    document.documentElement.classList.add(`sidebar-${sidebarPosition}`);
    
    // 应用侧边栏折叠状态
    if (isSidebarCollapsed) {
      document.documentElement.classList.add('sidebar-collapsed');
    } else {
      document.documentElement.classList.remove('sidebar-collapsed');
    }
    
    // 应用布局模式
    document.documentElement.classList.remove('layout-default', 'layout-compact', 'layout-wide');
    document.documentElement.classList.add(`layout-${layoutMode}`);
    
    // 应用密度设置
    document.documentElement.classList.remove('density-compact', 'density-normal', 'density-spacious');
    document.documentElement.classList.add(`density-${density}`);
  }, [sidebarPosition, isSidebarCollapsed, layoutMode, density]);
  
  // 主题颜色初始化
  useEffect(() => {
    const savedThemeColor = localStorage.getItem('themeColor');
    if (savedThemeColor) {
      const colorObj = JSON.parse(savedThemeColor);
      setThemeColor(colorObj);
    }
  }, []);
  
  // 主题颜色实时更新
  useEffect(() => {
    if (themeColor) {
      Object.entries(themeColor).forEach(([key, value]) => {
        document.documentElement.style.setProperty(`--${key}`, value);
      });
    }
  }, [themeColor]);
  
  // 初始化加载所有个性化设置
  useEffect(() => {
    // 加载侧边栏位置
    const savedSidebarPosition = localStorage.getItem('sidebarPosition');
    if (savedSidebarPosition) {
      setSidebarPosition(savedSidebarPosition);
    }
    
    // 加载侧边栏折叠状态
    const savedSidebarCollapsed = localStorage.getItem('isSidebarCollapsed');
    if (savedSidebarCollapsed !== null) {
      setIsSidebarCollapsed(savedSidebarCollapsed === 'true');
    }
    
    // 加载布局模式
    const savedLayoutMode = localStorage.getItem('layoutMode');
    if (savedLayoutMode) {
      setLayoutMode(savedLayoutMode);
    }
    
    // 加载密度设置
    const savedDensity = localStorage.getItem('density');
    if (savedDensity) {
      setDensity(savedDensity);
    }
    
    // 从localStorage加载主题颜色设置
    const themeColorSetting = localStorage.getItem('themeColor');
    if (themeColorSetting) {
      setThemeColor(JSON.parse(themeColorSetting));
    }
  }, []);
  
  // 响应侧边栏位置变化
  useEffect(() => {
    if (sidebarPosition) {
      document.documentElement.style.setProperty('--sidebar-position', sidebarPosition);
    }
  }, [sidebarPosition]);

  
  // 监听个性化设置变更事件
  useEffect(() => {
    const handlePersonalizationChange = (event) => {
      const settings = event.detail;
      handleSettingsChange(settings);
    };
    
    // 监听切换侧边栏事件
    const handleToggleSidebar = () => {
      if (isSidebarOpen) {
        closeSidebar();
      } else {
        openSidebar();
      }
    };
    
    window.addEventListener('personalizationChanged', handlePersonalizationChange);
    window.addEventListener('toggleSidebar', handleToggleSidebar);
    
    return () => {
      window.removeEventListener('personalizationChanged', handlePersonalizationChange);
      window.removeEventListener('toggleSidebar', handleToggleSidebar);
    };
  }, [isSidebarOpen]);
  // 处理设置变更
  const handleSettingsChange = (settings) => {
    try {
      // 保存设置到localStorage
      const savedSettings = localStorage.getItem('personalization');
      const currentSettings = savedSettings ? JSON.parse(savedSettings) : {};
      
      // 主题颜色设置
      if (settings.themeColor) {
        setThemeColor(settings.themeColor);
        localStorage.setItem('themeColor', JSON.stringify(settings.themeColor));
      }
      
      // 侧边栏位置设置
      if (settings.sidebarPosition !== undefined) {
        setSidebarPosition(settings.sidebarPosition);
        currentSettings.sidebarPosition = settings.sidebarPosition;
        localStorage.setItem('sidebarPosition', settings.sidebarPosition);
      }
      
      // 侧边栏折叠状态
      if (settings.isSidebarCollapsed !== undefined) {
        setIsSidebarCollapsed(settings.isSidebarCollapsed);
        currentSettings.isSidebarCollapsed = settings.isSidebarCollapsed;
        localStorage.setItem('isSidebarCollapsed', settings.isSidebarCollapsed.toString());
      }
      
      // 布局模式
      if (settings.layoutMode) {
        setLayoutMode(settings.layoutMode);
        currentSettings.layout = settings.layoutMode;
        localStorage.setItem('layoutMode', settings.layoutMode);
      }
      
      // 密度设置
      if (settings.density) {
        setDensity(settings.density);
        currentSettings.density = settings.density;
        localStorage.setItem('density', settings.density);
      }
      
      // 保存更新后的设置
      localStorage.setItem('personalization', JSON.stringify(currentSettings));
      
      // 响应式预览设置
      if (settings.responsiveMode) {
        if (settings.responsiveMode === 'mobile') {
          document.documentElement.classList.add('mobile-preview');
          document.documentElement.classList.remove('tablet-preview', 'desktop-preview');
        } else if (settings.responsiveMode === 'tablet') {
          document.documentElement.classList.add('tablet-preview');
          document.documentElement.classList.remove('mobile-preview', 'desktop-preview');
        } else {
          document.documentElement.classList.remove('mobile-preview', 'tablet-preview');
        }
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleToggleTheme = () => {
    // 只关闭护眼模式，保留透明模式
    if (isEyeProtectionMode) {
      setIsEyeProtectionMode(false);
    }
    
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleToggleEyeProtection = () => {
    // 如果当前是深色模式或透明模式，先关闭它们
    if (isDarkMode) {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
    if (isTransparentMode) {
      setIsTransparentMode(false);
    }
    
    setIsEyeProtectionMode(!isEyeProtectionMode);
  };

  const handleToggleTransparentMode = () => {
    // 只关闭护眼模式，允许透明模式和深色模式共存
    if (isEyeProtectionMode) {
      setIsEyeProtectionMode(false);
    }
    
    setIsTransparentMode(!isTransparentMode);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
  };

  const handleDeleteTask = (taskId) => {
    setShowDeleteConfirm(taskId);
  };

  const confirmDeleteTask = () => {
    if (showDeleteConfirm) {
      deleteTask(showDeleteConfirm);
      setShowDeleteConfirm(null);
    }
  };

  const cancelDeleteTask = () => {
    setShowDeleteConfirm(null);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    // 当用户手动选择日期时，处理常驻任务
    taskMonitor.processRecurringTasksForDate(date);
  };

  const goToToday = () => {
    const today = new Date();
    setSelectedDate(today);
    // 回到今天时，处理常驻任务
    taskMonitor.processRecurringTasksForDate(today);
  };

  const goToPreviousDay = () => {
    const previousDay = subDays(selectedDate, 1);
    setSelectedDate(previousDay);
    // 切换到上一天时，处理常驻任务
    taskMonitor.processRecurringTasksForDate(previousDay);
  };

  const goToNextDay = () => {
    const nextDay = addDays(selectedDate, 1);
    setSelectedDate(nextDay);
    // 切换到下一天时，处理常驻任务
    taskMonitor.processRecurringTasksForDate(nextDay);
  };

  // 获取当前日期的任务
  const getTasksForSelectedDate = () => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const selectedDateObj = new Date(selectedDate);
    const today = new Date();
    
    return tasks.filter(task => {
      // 处理常驻任务
      if (task.isRecurring) {
        // 计算该常驻任务是否应该在选中的日期显示
        const shouldShowOnSelectedDate = shouldShowRecurringTaskOnDate(task, selectedDateObj);
        if (shouldShowOnSelectedDate) {
          return true;
        }
      }
      
      // 处理没有设置dueDate的任务
      if (!task.dueDate) {
        // 没有设置截止日期的任务只在查看今日时显示
        return dateStr === todayStr;
      }
      
      const taskDateStr = task.dueDate;
      const taskDate = new Date(taskDateStr);
      
      // 查看今日任务时：
      // 1. 显示今日的任务
      // 2. 显示未完成的历史任务
      if (dateStr === todayStr) {
        // 今日任务
        if (taskDateStr === todayStr) {
          return true;
        }
        // 未完成的历史任务
        if (taskDate < today && !task.completed) {
          return true;
        }
        return false;
      }
      
      // 查看未来日期任务时：
      // 只显示该未来日期的任务
      if (selectedDateObj > today) {
        return taskDateStr === dateStr;
      }
      
      // 查看历史日期任务时：
      // 只显示该历史日期的任务（无论是否完成）
      return taskDateStr === dateStr;
    });
  };
  
  // 判断常驻任务是否应该在指定日期显示
  const shouldShowRecurringTaskOnDate = (task, date) => {
    const dayOfWeek = (date.getDay() || 7).toString(); // 转换为1-7，1代表周一
    const dayOfMonth = date.getDate().toString();
    
    switch (task.recurringType) {
      case 'daily':
        return true;
      case 'weekly':
        const recurringDays = task.recurringDays || ['1'];
        return recurringDays.includes(dayOfWeek);
      case 'monthly':
        const recurringMonthDays = task.recurringMonthDays || ['1'];
        return recurringMonthDays.includes(dayOfMonth);
      default:
        return false;
    }
  };

  // 渲染主内容
  const renderContent = () => {
    // 根据当前路径进行简单的条件渲染
    const currentPath = window.location.pathname;
    
    // 如果是玻璃效果测试页面，直接渲染GlassTestPage组件
    if (currentPath === '/glass-test') {
      return <GlassTestPage />;
    }
    
    if (showSettings) {
      return (
        <Settings 
          navigationRef={navigationRef}
          isDarkMode={isDarkMode}
          onToggleTheme={handleToggleTheme}
          isEyeProtectionMode={isEyeProtectionMode}
          onToggleEyeProtection={handleToggleEyeProtection}
          isTransparentMode={isTransparentMode}
          onToggleTransparentMode={handleToggleTransparentMode}
          onSettingsChange={handleSettingsChange}
          sidebarPosition={sidebarPosition}
          isSidebarCollapsed={isSidebarCollapsed}
          layoutMode={layoutMode}
          density={density}
        />
      );
    }

    const tasksForDate = getTasksForSelectedDate();
    
    switch (activeView) {
      case 'status':
        return (
          <StatusView
            tasks={tasksForDate}
            onToggleComplete={toggleTaskComplete}
            onDelete={handleDeleteTask}
            onEdit={handleEditTask}
            onTogglePin={toggleTaskPin}
            onToggleRecurring={toggleTaskRecurring}
            selectedDate={selectedDate}
          />
        );
      default:
        return (
          <TaskList
              tasks={tasksForDate}
              onToggleComplete={toggleTaskComplete}
              onDelete={handleDeleteTask}
              onEdit={handleEditTask}
              onTogglePin={toggleTaskPin}
              onToggleRecurring={toggleTaskRecurring}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              filterType={filterType}
              onFilterChange={setFilterType}
              selectedDate={selectedDate}
            />
        );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-3 text-sm text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <div className={`min-h-screen ${isEyeProtectionMode ? 'bg-[#f5f5dc]' : 'bg-gray-50'} dark:bg-gray-900 ${isTransparentMode ? 'transparent-mode' : ''} ${isTransparentMode && isDarkMode ? 'dark' : ''}`}>
        <div className="flex h-screen">
          {/* 移动端菜单按钮 */}
          <button
            onClick={() => isSidebarOpen ? closeSidebar() : openSidebar()}
            className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md"
            aria-label="打开菜单"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          {/* 侧边栏触发按钮 - 桌面端显示，向下调整50px */}
          <button
            onClick={() => isSidebarOpen ? closeSidebar() : openSidebar()}
            className="hidden lg:block fixed top-32 left-4 z-30 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="打开菜单"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* 弹出式侧边栏 */}
          <SidebarModal
            isOpen={isSidebarOpen}
            onClose={closeSidebar}
            onOpen={openSidebar}
            activeView={activeView}
            onViewChange={setActiveView}
            taskCounts={taskCounts}
            isDarkMode={isDarkMode}
            onToggleTheme={handleToggleTheme}
            isEyeProtectionMode={isEyeProtectionMode}
            onToggleEyeProtection={handleToggleEyeProtection}
            isTransparentMode={isTransparentMode}
            onToggleTransparentMode={handleToggleTransparentMode}
            showSettings={showSettings}
            onShowSettings={setShowSettings}
          />

          {/* 主内容区 */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* 顶部标题栏 */}
            <header className={`${isTransparentMode ? 'bg-white/80 backdrop-blur-md' : 'bg-white'} dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                  <h2 className="text-base font-bold text-gray-900 dark:text-white">
                    {showSettings ? '系统设置' : (
                      <>
                        {activeView === 'all' && '所有任务'}
                        {activeView === 'status' && '按状态查看'}
                      </>
                    )}
                  </h2>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                    {format(new Date(), 'yyyy年MM月dd日 EEEE', { locale: zhCN })}
                  </p>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 min-w-[80px]">
                  共 {tasks.length} 个任务
                </div>
              </div>
            </header>

            {/* 日期选择器 */}
            {!showSettings && (
              <div className={`${isTransparentMode ? 'bg-white/80 backdrop-blur-md' : 'bg-white'} dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={goToPreviousDay}
                      className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                    >
                      上一日
                    </button>
                    <DatePicker
                      selected={selectedDate}
                      onChange={handleDateChange}
                      dateFormat="yyyy年MM月dd日"
                      locale={zhCN}
                      className="px-2 py-1 text-xs rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent glass-input"
                    />
                    <button
                      onClick={goToNextDay}
                      className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                    >
                      下一日
                    </button>
                  </div>
                  <button
                    onClick={goToToday}
                    className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors"
                  >
                    今日
                  </button>
                </div>
              </div>
            )}

            {/* 内容区域 */}
            <main className="flex-1 overflow-auto p-3">
              <div className="max-w-4xl mx-auto space-y-3">
                {/* 添加任务表单 */}
                {!showSettings && (
                  <AddTaskForm
                    onAddTask={addTask}
                    isLoading={isAddingTask}
                  />
                )}

                {/* 任务列表或视图 */}
                {renderContent()}

                {/* 编辑任务表单 */}
                {editingTask && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className={`${isTransparentMode ? 'glass-card' : 'bg-white dark:bg-gray-800'} rounded-lg shadow-lg p-4 max-w-md w-full ${density === 'compact' ? 'p-3' : density === 'spacious' ? 'p-6' : 'p-4'}`}>
                      <h3 className="text-lg font-bold mb-3 text-gray-900 dark:text-white">编辑任务</h3>
                      <EditTaskForm
                        task={editingTask}
                        onSave={(updatedTask) => {
                          updateTask({ id: updatedTask.id, updates: updatedTask });
                          setEditingTask(null);
                        }}
                        onCancel={() => setEditingTask(null)}
                      />
                    </div>
                  </div>
                )}

                {/* 删除确认弹窗 */}
                {showDeleteConfirm && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className={`${isTransparentMode ? 'glass-card' : 'bg-white dark:bg-gray-800'} rounded-lg shadow-lg p-4 max-w-md w-full ${density === 'compact' ? 'p-3' : density === 'spacious' ? 'p-6' : 'p-4'}`}>
                      <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">确认删除</h3>
                      <p className="text-gray-700 dark:text-gray-300 mb-4">您确定要删除这个任务吗？此操作无法撤销。</p>
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={cancelDeleteTask}
                          className="px-3 py-1.5 text-gray-600 hover:text-gray-800 transition-colors text-sm"
                        >
                          取消
                        </button>
                        <button
                          onClick={confirmDeleteTask}
                          className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </main>
          </div>
        </div>
      </div>
    </ToastProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TodoApp />
    </QueryClientProvider>
  );
}

export default App;
