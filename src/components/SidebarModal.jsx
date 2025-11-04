import React, { useState, useEffect, useRef } from 'react';
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

const SidebarModal = ({ 
  isOpen,
  onClose,
  onOpen,
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
}) => {
  // 检测透明模式
  const [isTransparentModeEnabled, setIsTransparentModeEnabled] = useState(false);
  // 检测是否为PC端
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  // 鼠标在边缘的计时器
  const edgeTimerRef = useRef(null);
  
  useEffect(() => {
    // 检查body元素是否有透明模式类
    const checkTransparentMode = () => {
      const body = document.body;
      setIsTransparentModeEnabled(body.classList.contains('transparent-mode'));
    };
    
    // 初始检查
    checkTransparentMode();
    
    // 创建观察器监听class变化
    const observer = new MutationObserver(() => {
      checkTransparentMode();
    });
    
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);

  // 检测是否为PC端
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 鼠标移动到边缘自动打开侧边栏
  useEffect(() => {
    if (!isDesktop) return; // 只在PC端启用
    
    const handleMouseMove = (e) => {
      // 如果侧边栏已经打开，不需要再检测
      if (isOpen) return;
      
      // 检测鼠标是否在屏幕左边缘
      if (e.clientX <= 10) {
        // 清除之前的计时器
        if (edgeTimerRef.current) {
          clearTimeout(edgeTimerRef.current);
        }
        
        // 设置新的计时器，延迟300ms后打开侧边栏
        edgeTimerRef.current = setTimeout(() => {
          // 再次检查鼠标是否仍在边缘
          if (e.clientX <= 10) {
            // 打开侧边栏
            onOpen && onOpen();
          }
        }, 300);
      } else {
        // 鼠标离开边缘，清除计时器
        if (edgeTimerRef.current) {
          clearTimeout(edgeTimerRef.current);
          edgeTimerRef.current = null;
        }
      }
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      if (edgeTimerRef.current) {
        clearTimeout(edgeTimerRef.current);
      }
    };
  }, [isDesktop, isOpen, onOpen]);

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

  const handleNavItemClick = (itemId) => {
    onViewChange(itemId);
    onShowSettings(false);
    onClose();
  };

  const handleSettingsClick = () => {
    onShowSettings(!showSettings);
    onClose();
  };

  return (
    <>
      {/* 遮罩层 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>

      {/* 侧边栏 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={`
              fixed top-0 left-0 h-full w-80 z-50 overflow-hidden
              ${isTransparentModeEnabled ? 'glass-sidebar' : 'bg-white'} 
              dark:bg-gray-800
              border-r border-gray-200 dark:border-gray-700 
              flex flex-col shadow-xl
            `}
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* 标题栏 */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">待办事项</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {new Date().toLocaleDateString('zh-CN', { 
                    month: 'long', 
                    day: 'numeric',
                    weekday: 'long'
                  })}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* 导航菜单 */}
            <nav className="flex-1 p-4 overflow-y-auto">
              <ul className="space-y-2">
                {navItems.map(item => {
                  const Icon = item.icon;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => handleNavItemClick(item.id)}
                        className={`
                          w-full flex items-center justify-between p-3 rounded-lg transition-colors
                          ${activeView === item.id && !showSettings
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }
                        `}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className="w-5 h-5" />
                          <span className="font-medium">{item.label}</span>
                        </div>
                        {item.count > 0 && (
                          <span className={`px-2 py-1 text-sm rounded-full font-medium ${
                            activeView === item.id && !showSettings
                              ? 'bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200'
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
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
              <button
                onClick={handleSettingsClick}
                className={`
                  w-full flex items-center space-x-3 p-3 rounded-lg transition-colors
                  ${showSettings 
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-300' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }
                `}
              >
                <Settings className="w-5 h-5" />
                <span className="font-medium">系统设置</span>
              </button>
              
              <button
                onClick={onToggleEyeProtection}
                className={`
                  w-full flex items-center space-x-3 p-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors
                `}
              >
                {isEyeProtectionMode ? (
                  <>
                    <Eye className="w-5 h-5" />
                    <span className="font-medium">护眼模式</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="w-5 h-5" />
                    <span className="font-medium">护眼模式</span>
                  </>
                )}
              </button>
              
              <button
                onClick={onToggleTransparentMode}
                className={`
                  w-full flex items-center space-x-3 p-3 rounded-lg transition-colors
                  ${isTransparentMode 
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-300' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }
                `}
              >
                <div className="w-5 h-5 bg-gradient-to-br from-blue-400 to-purple-500 rounded"></div>
                <span className="font-medium">透明模式</span>
              </button>

              <button
                onClick={onToggleTheme}
                className={`
                  w-full flex items-center space-x-3 p-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors
                `}
              >
                {isDarkMode ? (
                  <>
                    <Sun className="w-5 h-5" />
                    <span className="font-medium">浅色模式</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-5 h-5" />
                    <span className="font-medium">深色模式</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SidebarModal;