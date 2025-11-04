import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { 
  List, 
  CheckCircle, 
  Settings,
  Moon,
  Sun,
  Menu,
  X,
  Eye,
  EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navigation = forwardRef(({ 
  activeView, 
  onViewChange, 
  taskCounts,
  isDarkMode,
  onToggleTheme,
  isEyeProtectionMode,
  onToggleEyeProtection,
  isTransparentMode,
  onToggleTransparentMode,
  showSettings,
  onShowSettings
}, ref) => {
  const [isCollapsed, setIsCollapsed] = useState(false); // 默认展开
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const navItems = [
    {
      id: 'all',
      label: '所有任务',
      icon: List,
      count: taskCounts.total
    },
    {
      id: 'status',
      label: '按状态',
      icon: CheckCircle,
      count: taskCounts.completed
    }
  ];

  // PC端自动收缩功能 - 优化版，添加防抖和延迟处理
  useEffect(() => {
    let timeoutId;
    
    const handleMouseMove = (e) => {
      if (window.innerWidth >= 1024) { // 只在PC端生效
        // 清除之前的定时器
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        
        // 设置新的定时器，添加防抖效果
        timeoutId = setTimeout(() => {
          if (e.clientX <= 50 && isCollapsed) {
            // 鼠标靠近左侧边缘，展开侧边栏
            setIsCollapsed(false);
          } else if (e.clientX > 300 && !isCollapsed && !isHovered) {
            // 鼠标远离左侧边缘且不在侧边栏上，收起侧边栏
            setIsCollapsed(true);
          }
        }, 300); // 300ms延迟，避免频繁切换
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    // 清理函数
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isHovered, isCollapsed]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    toggleMobileMenu
  }), [isMobileMenuOpen]);

  return (
    <>
      {/* 侧边栏 */}
      <motion.div
        className={`
          ${isCollapsed ? 'w-16' : 'w-64'} 
          fixed inset-y-0 left-0 z-40 overflow-hidden
          ${isTransparentMode ? 'bg-white/80 backdrop-blur-md' : 'bg-white'} dark:bg-gray-800
          border-r border-gray-200 dark:border-gray-700 h-full flex flex-col
          transition-all duration-300 ease-in-out
          
          /* 移动端和桌面端不同行为 */
          lg:relative lg:translate-x-0
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* 标题栏 */}
        <div className="p-2.5 border-b border-gray-200 flex items-center justify-between">
          {!isCollapsed && (
            <>
              <div>
                <h1 className="text-base font-bold text-gray-900">待办事项</h1>
                <p className="text-xs text-gray-500 mt-0.5">
                  {new Date().toLocaleDateString('zh-CN', { 
                    month: 'long', 
                    day: 'numeric',
                    weekday: 'long'
                  })}
                </p>
              </div>
            </>
          )}
          <button
            onClick={toggleSidebar}
            className="hidden lg:block p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 p-2.5">
          <ul className="space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      onViewChange(item.id);
                      setIsMobileMenuOpen(false);
                      onShowSettings(false);
                    }}
                    className={`
                      w-full flex items-center p-1.5 rounded-lg transition-colors
                      ${isCollapsed ? 'justify-center' : 'justify-between'}
                      ${activeView === item.id && !showSettings
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                      }
                    `}
                  >
                    <div className="flex items-center space-x-1.5">
                      <Icon className="w-3.5 h-3.5" />
                      {!isCollapsed && (
                        <span className="text-xs font-medium">{item.label}</span>
                      )}
                    </div>
                    {!isCollapsed && item.count > 0 && (
                      <span className={`px-1.5 py-0.5 text-xs rounded-full font-medium ${
                        activeView === item.id && !showSettings
                          ? 'bg-blue-200 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      }`}>
                        {item.count}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* 底部设置 */}
        <div className="p-2.5 border-t border-gray-200 space-y-2">
          <button
            onClick={() => {
              onShowSettings(!showSettings);
              setIsMobileMenuOpen(false);
            }}
            className={`
              w-full flex items-center space-x-1.5 p-1.5 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors
              ${isCollapsed ? 'justify-center' : ''}
              ${showSettings ? 'bg-blue-50 text-blue-600' : ''}
            `}
          >
            <Settings className="w-3.5 h-3.5" />
            {!isCollapsed && <span className="text-xs">系统设置</span>}
          </button>
          
          <button
            onClick={onToggleEyeProtection}
            className={`
              w-full flex items-center space-x-1.5 p-1.5 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors
              ${isCollapsed ? 'justify-center' : ''}
            `}
          >
            {isEyeProtectionMode ? (
              <>
                <Eye className="w-3.5 h-3.5" />
                {!isCollapsed && <span className="text-xs">护眼模式</span>}
              </>
            ) : (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                {!isCollapsed && <span className="text-xs">护眼模式</span>}
              </>
            )}
          </button>
          
          <button
            onClick={onToggleTransparentMode}
            className={`
              w-full flex items-center space-x-1.5 p-1.5 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors
              ${isCollapsed ? 'justify-center' : ''}
              ${isTransparentMode ? 'bg-blue-50 text-blue-600' : ''}
            `}
          >
            <div className="w-3.5 h-3.5 bg-gradient-to-br from-blue-400 to-purple-500 rounded"></div>
            {!isCollapsed && <span className="text-xs">透明模式</span>}
          </button>

          <button
            onClick={onToggleTheme}
            className={`
              w-full flex items-center space-x-1.5 p-1.5 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors
              ${isCollapsed ? 'justify-center' : ''}
            `}
          >
            {isDarkMode ? (
              <>
                <Sun className="w-3.5 h-3.5" />
                {!isCollapsed && <span className="text-xs">浅色模式</span>}
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5" />
                {!isCollapsed && <span className="text-xs">深色模式</span>}
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* 移动端遮罩层 */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={() => setIsMobileMenuOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>
    </>
  );
});

export default Navigation;
