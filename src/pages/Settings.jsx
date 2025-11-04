import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Home,
  Database,
  Shield,
  Bell,
  Globe,
  Palette,
  Layout,
  Keyboard,
  ChevronRight,
  Upload,
  Download,
  Moon,
  Sun,
  Eye,
  EyeOff
} from 'lucide-react';
import DataManagement from '../components/settings/DataManagement';
import Personalization from '../components/settings/Personalization';
import NotificationSettings from '../components/settings/NotificationSettings';
import { useToast } from '../components/ui/use-toast';

const Settings = ({ navigationRef, isDarkMode: propDarkMode, onToggleTheme, isEyeProtectionMode: propEyeProtectionMode, onToggleEyeProtection, isTransparentMode: propTransparentMode, onToggleTransparentMode, onSettingsChange: propSettingsChange, sidebarPosition, isSidebarCollapsed, layoutMode, density }) => {  
  const [activeTab, setActiveTab] = useState('data');
  const [isDarkMode, setIsDarkMode] = useState(propDarkMode);
  const [isEyeProtectionMode, setIsEyeProtectionMode] = useState(propEyeProtectionMode);
  const [isTransparentMode, setIsTransparentMode] = useState(propTransparentMode);
  
  // 当外部props变化时更新本地状态
  useEffect(() => {
    setIsDarkMode(propDarkMode);
    setIsEyeProtectionMode(propEyeProtectionMode);
    setIsTransparentMode(propTransparentMode);
  }, [propDarkMode, propEyeProtectionMode, propTransparentMode]);
  const { toast } = useToast();

  const tabs = [
    {
      id: 'data',
      label: '数据管理',
      icon: Database,
      component: DataManagement
    },
    {
      id: 'personalization',
      label: '个性化设置',
      icon: Palette,
      component: Personalization
    },
    {
      id: 'notifications',
      label: '通知管理',
      icon: Bell,
      component: NotificationSettings
    }
  ];

  const handleThemeToggle = () => {
    const newValue = !isDarkMode;
    setIsDarkMode(newValue);
    onToggleTheme && onToggleTheme(newValue);
    toast({
      title: "主题已切换",
      description: isDarkMode ? "已切换到浅色模式" : "已切换到深色模式",
    });
  };

  const handleEyeProtectionToggle = () => {
    const newValue = !isEyeProtectionMode;
    setIsEyeProtectionMode(newValue);
    onToggleEyeProtection && onToggleEyeProtection(newValue);
    toast({
      title: "护眼模式已切换",
      description: isEyeProtectionMode ? "已关闭护眼模式" : "已开启护眼模式",
    });
  };
  
  const handleTransparentModeToggle = () => {
    const newValue = !isTransparentMode;
    setIsTransparentMode(newValue);
    onToggleTransparentMode && onToggleTransparentMode(newValue);
    toast({
      title: "透明模式已切换",
      description: isTransparentMode ? "已关闭透明模式" : "已开启透明模式",
    });
  };

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;
  
  // 处理个性化设置变更
  const handleSettingsChange = (settings) => {
    console.log('设置已更新:', settings);
    
    // 调用从App.jsx传入的回调函数，将设置变更通知给App组件
    if (typeof propSettingsChange === 'function') {
      propSettingsChange(settings);
    }
  };

  // 打开/关闭移动端菜单
  const toggleMobileMenu = () => {
    // 触发全局事件通知App组件切换侧边栏状态
    window.dispatchEvent(new CustomEvent('toggleSidebar'));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 relative">
      {/* 移动端菜单按钮 */}
      <button
        onClick={toggleMobileMenu}
        className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md"
        aria-label="打开菜单"
      >
        <SettingsIcon className="w-5 h-5" />
      </button>
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        {/* 页面标题和面包屑导航 */}
        <div className="mb-6">
          <nav className="flex items-center space-x-2 text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-3">
            <Home className="w-3.5 h-3.5 md:w-4 md:h-4" />
            <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
            <span>系统设置</span>
          </nav>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            系统设置
          </h1>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mt-1 md:mt-2">
            管理您的系统配置和个性化设置
          </p>
        </div>

        {/* 全局设置快捷操作 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6 mb-4 md:mb-6">
          <h2 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-3 md:mb-4">
            快速设置
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <div className="flex items-center justify-between p-3 md:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <div className="flex items-center space-x-2 md:space-x-3">
                {isDarkMode ? <Sun className="w-4 h-4 md:w-5 md:h-5" /> : <Moon className="w-4 h-4 md:w-5 md:h-5" />}
                <span className="font-medium text-sm md:text-base">深色模式</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  value=""
                  className="sr-only peer"
                  checked={isDarkMode}
                  onChange={handleThemeToggle}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            <div className="flex items-center justify-between p-3 md:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <div className="flex items-center space-x-2 md:space-x-3">
                {isEyeProtectionMode ? <EyeOff className="w-4 h-4 md:w-5 md:h-5" /> : <Eye className="w-4 h-4 md:w-5 md:h-5" />}
                <span className="font-medium text-sm md:text-base">护眼模式</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  value=""
                  className="sr-only peer"
                  checked={isEyeProtectionMode}
                  onChange={handleEyeProtectionToggle}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            <div className="flex items-center justify-between p-3 md:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <div className="flex items-center space-x-2 md:space-x-3">
                <Palette className="w-4 h-4 md:w-5 md:h-5" />
                <span className="font-medium text-sm md:text-base">透明模式</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  value=""
                  className="sr-only peer"
                  checked={isTransparentMode}
                  onChange={handleTransparentModeToggle}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* 设置选项卡导航 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-4 md:mb-6">
          <div className="flex overflow-x-auto scrollbar-hide p-1">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 whitespace-nowrap px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id
                    ? 'bg-primary/10 text-primary dark:bg-primary/20'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'}`}
                >
                  <TabIcon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 设置选项卡内容 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6">
          {ActiveComponent && <ActiveComponent 
            isTransparentMode={isTransparentMode} 
            onSettingsChange={handleSettingsChange} 
            sidebarPosition={sidebarPosition}
            isSidebarCollapsed={isSidebarCollapsed}
            layoutMode={layoutMode}
            density={density}
          />}
        </div>
      </div>
    </div>
  );
};

export default Settings;
