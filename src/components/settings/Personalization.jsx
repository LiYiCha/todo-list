import React, { useState, useEffect } from 'react';
import { 
  Palette, 
  Layout, 
  Keyboard, 
  Save, 
  RotateCcw,
  Check,
  Monitor,
  Smartphone,
  Tablet,
  CheckCircle
} from 'lucide-react';
import { useToast } from '../ui/use-toast';

const Personalization = ({ isTransparentMode = false, onSettingsChange, sidebarPosition: propSidebarPosition, isSidebarCollapsed: propSidebarCollapsed, layoutMode: propLayoutMode, density: propDensity }) => {
  // 创建全局事件总线，用于通知应用其他部分设置已更改
  const notifySettingsChanged = (settings) => {
    // 构建设置对象，按照App.jsx中handleSettingsChange期望的格式
    const settingsToSend = {};
    
    // 添加主题颜色设置
    if (settings.theme || settings.customColor || settings.brightness) {
      // 获取当前主题颜色
      let primaryColor;
      if (settings.theme === 'custom') {
        primaryColor = settings.customColor;
      } else {
        const themeColor = themes.find(t => t.id === settings.theme)?.color;
        primaryColor = themeColor || '#3B82F6';
      }
      
      // 根据亮度调整颜色
      const brightnessFactor = (settings.brightness || 100) / 100;
      settingsToSend.themeColor = {
        primary: primaryColor,
        'primary-light': adjustBrightness(primaryColor, brightnessFactor * 1.2),
        'primary-dark': adjustBrightness(primaryColor, brightnessFactor * 0.8)
      };
    }
    
    // 添加布局设置
    if (settings.sidebarPosition !== undefined) {
      settingsToSend.sidebarPosition = settings.sidebarPosition;
    }
    
    if (settings.isSidebarCollapsed !== undefined) {
      settingsToSend.isSidebarCollapsed = settings.isSidebarCollapsed;
    }
    
    if (settings.layout) {
      settingsToSend.layoutMode = settings.layout;
    }
    
    if (settings.density) {
      settingsToSend.density = settings.density;
    }
    
    // 添加响应式预览设置
    if (settings.responsiveMode) {
      settingsToSend.responsiveMode = settings.responsiveMode;
    }
    
    // 触发全局自定义事件，传递格式化后的设置对象
      window.dispatchEvent(new CustomEvent('personalizationChanged', { 
        detail: settingsToSend 
      }));
      
      // 如果有外部传入的回调函数，也通知外部
      if (typeof onSettingsChange === 'function' && Object.keys(settingsToSend).length > 0) {
        onSettingsChange(settingsToSend);
      }
  };
  
  const [personalization, setPersonalization] = useState(() => {
    // 尝试从localStorage加载保存的设置
    const saved = localStorage.getItem('personalization');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        console.error('加载个性化设置失败:', error);
      }
    }
    // 默认设置
    return {
      theme: 'blue',
      customColor: '#3B82F6',
      brightness: 100,
      
      // 界面布局
      layout: 'default',
      density: 'comfortable',
      sidebarPosition: 'left',
      isSidebarCollapsed: false,
      
      // 响应式预览
      responsiveMode: 'desktop',
      
      // 快捷键
      shortcuts: {
        newTask: 'Ctrl+N',
        search: 'Ctrl+F',
        settings: 'Ctrl+,',
        toggleSidebar: 'Ctrl+B'
      }
    };
  });
  
  // 组件加载时应用保存的设置并同步props
  useEffect(() => {
    // 初始化时，如果有来自props的值，优先使用props
    const updatedSettings = { ...personalization };
    let hasChanges = false;
    
    if (propSidebarPosition !== undefined && propSidebarPosition !== updatedSettings.sidebarPosition) {
      updatedSettings.sidebarPosition = propSidebarPosition;
      hasChanges = true;
    }
    
    if (propSidebarCollapsed !== undefined && propSidebarCollapsed !== updatedSettings.isSidebarCollapsed) {
      updatedSettings.isSidebarCollapsed = propSidebarCollapsed;
      hasChanges = true;
    }
    
    if (propLayoutMode && propLayoutMode !== updatedSettings.layout) {
      updatedSettings.layout = propLayoutMode;
      hasChanges = true;
    }
    
    if (propDensity && propDensity !== updatedSettings.density) {
      updatedSettings.density = propDensity;
      hasChanges = true;
    }
    
    if (hasChanges) {
      setPersonalization(updatedSettings);
    }
    
    // 应用设置
    applySettings();
  }, []);
  
  // 监听props变化
  useEffect(() => {
    const updatedSettings = { ...personalization };
    let hasChanges = false;
    
    if (propSidebarPosition !== undefined && propSidebarPosition !== updatedSettings.sidebarPosition) {
      updatedSettings.sidebarPosition = propSidebarPosition;
      hasChanges = true;
    }
    
    if (propSidebarCollapsed !== undefined && propSidebarCollapsed !== updatedSettings.isSidebarCollapsed) {
      updatedSettings.isSidebarCollapsed = propSidebarCollapsed;
      hasChanges = true;
    }
    
    if (propLayoutMode && propLayoutMode !== updatedSettings.layout) {
      updatedSettings.layout = propLayoutMode;
      hasChanges = true;
    }
    
    if (propDensity && propDensity !== updatedSettings.density) {
      updatedSettings.density = propDensity;
      hasChanges = true;
    }
    
    if (hasChanges) {
      setPersonalization(updatedSettings);
      applySettings();
    }
  }, [propSidebarPosition, propSidebarCollapsed, propLayoutMode, propDensity]);
  
  // 使用ref保存上一次的设置，避免不必要的通知
  const prevSettingsRef = React.useRef({});
  
  // 初始化ref
  useEffect(() => {
    // 将初始设置存入ref
    prevSettingsRef.current = { ...personalization };
  }, []);

  // 当设置变化时应用预览效果并通知其他组件
  useEffect(() => {
    // 应用设置到UI
    applySettings();
    
    // 检查是否有实际的设置变更
    const hasActualChanges = Object.keys(personalization).some(key => {
      // 对于嵌套对象（如shortcuts），进行深度比较
      if (typeof personalization[key] === 'object' && personalization[key] !== null && prevSettingsRef.current[key]) {
        return JSON.stringify(personalization[key]) !== JSON.stringify(prevSettingsRef.current[key]);
      }
      return prevSettingsRef.current[key] !== undefined && personalization[key] !== prevSettingsRef.current[key];
    });
    
    // 只有当有实际变更时才通知外部
    if (hasActualChanges) {
      notifySettingsChanged(personalization);
      // 更新ref中的设置
      prevSettingsRef.current = { ...personalization };
    }
  }, [personalization]);
  
  // 应用设置到整个应用
  const applySettings = () => {
    // 应用主题颜色到全局CSS变量
    const rootStyle = document.documentElement.style;
    const rootClassList = document.documentElement.classList;
    
    // 计算亮度因子
    const brightnessFactor = (personalization.brightness || 100) / 100;
    
    // 应用主题颜色
    let primaryColor;
    if (personalization.theme === 'custom') {
      primaryColor = personalization.customColor;
    } else {
      const themeColor = themes.find(t => t.id === personalization.theme)?.color;
      primaryColor = themeColor || '#3B82F6';
    }
    
    rootStyle.setProperty('--primary', primaryColor);
    rootStyle.setProperty('--primary-light', adjustBrightness(primaryColor, brightnessFactor * 1.2));
    rootStyle.setProperty('--primary-dark', adjustBrightness(primaryColor, brightnessFactor * 0.8));
    
    // 应用布局类
    // 移除所有布局类
    rootClassList.remove('layout-compact', 'layout-expanded');
    if (personalization.layout !== 'default') {
      rootClassList.add(`layout-${personalization.layout}`);
    }
    
    // 应用密度类
    rootClassList.remove('density-compact', 'density-spacious');
    if (personalization.density !== 'comfortable') {
      rootClassList.add(`density-${personalization.density}`);
      
      // 根据密度设置调整间距变量
      if (personalization.density === 'compact') {
        rootStyle.setProperty('--spacing-xs', '0.25rem');
        rootStyle.setProperty('--spacing-sm', '0.5rem');
        rootStyle.setProperty('--spacing-md', '0.75rem');
        rootStyle.setProperty('--spacing-lg', '1rem');
        rootStyle.setProperty('--spacing-xl', '1.5rem');
      } else if (personalization.density === 'spacious') {
        rootStyle.setProperty('--spacing-xs', '0.5rem');
        rootStyle.setProperty('--spacing-sm', '0.75rem');
        rootStyle.setProperty('--spacing-md', '1.25rem');
        rootStyle.setProperty('--spacing-lg', '1.75rem');
        rootStyle.setProperty('--spacing-xl', '2.5rem');
      } else {
        // 舒适模式 - 使用默认值
        rootStyle.setProperty('--spacing-xs', '0.25rem');
        rootStyle.setProperty('--spacing-sm', '0.5rem');
        rootStyle.setProperty('--spacing-md', '1rem');
        rootStyle.setProperty('--spacing-lg', '1.5rem');
        rootStyle.setProperty('--spacing-xl', '2rem');
      }
    }
    
    // 应用侧边栏位置
    rootClassList.remove('sidebar-left', 'sidebar-right');
    rootClassList.add(`sidebar-${personalization.sidebarPosition}`);
    
    // 应用侧边栏折叠状态
    if (personalization.isSidebarCollapsed) {
      rootClassList.add('sidebar-collapsed');
    } else {
      rootClassList.remove('sidebar-collapsed');
    }
    
    // 应用响应式预览
    rootClassList.remove('mobile-preview', 'tablet-preview');
    if (personalization.responsiveMode === 'mobile') {
      rootClassList.add('mobile-preview');
    } else if (personalization.responsiveMode === 'tablet') {
      rootClassList.add('tablet-preview');
    }
    
    // 直接操作侧边栏元素
    const sidebarElement = document.querySelector('.sidebar');
    const contentElement = document.querySelector('.main-content');
    
    if (sidebarElement && contentElement) {
      // 设置侧边栏位置
      if (personalization.sidebarPosition === 'left') {
        sidebarElement.style.left = '0';
        sidebarElement.style.right = 'auto';
        contentElement.style.marginLeft = personalization.isSidebarCollapsed ? '60px' : '240px';
        contentElement.style.marginRight = '0';
      } else {
        sidebarElement.style.left = 'auto';
        sidebarElement.style.right = '0';
        contentElement.style.marginLeft = '0';
        contentElement.style.marginRight = personalization.isSidebarCollapsed ? '60px' : '240px';
      }
      
      // 设置侧边栏折叠状态
      sidebarElement.style.width = personalization.isSidebarCollapsed ? '60px' : '240px';
      sidebarElement.style.transform = 'translateX(0)';
      
      // 更新内容区域样式
      contentElement.style.transition = 'margin 0.3s ease';
    }
  };
  
  // 辅助函数：调整颜色亮度
  const adjustBrightness = (hex, percent) => {
    // 移除#号
    const hexValue = hex.replace('#', '');
    
    // 将16进制转换为RGB
    let r = parseInt(hexValue.substring(0, 2), 16);
    let g = parseInt(hexValue.substring(2, 4), 16);
    let b = parseInt(hexValue.substring(4, 6), 16);
    
    // 调整亮度
    r = Math.floor(r * percent);
    g = Math.floor(g * percent);
    b = Math.floor(b * percent);
    
    // 确保值在0-255范围内
    r = Math.min(255, Math.max(0, r));
    g = Math.min(255, Math.max(0, g));
    b = Math.min(255, Math.max(0, b));
    
    // 转换回16进制并添加#号
    const toHex = (c) => {
      const hex = c.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    
    return '#' + toHex(r) + toHex(g) + toHex(b);
  };

  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  
  // 根据透明模式设置容器类名
  const containerClass = isTransparentMode 
    ? 'bg-white/90 backdrop-blur-md' 
    : 'bg-white dark:bg-gray-800';
  const cardClass = isTransparentMode 
    ? 'bg-white/80 backdrop-blur-sm' 
    : 'bg-white dark:bg-gray-800';

  const themes = [
    { id: 'blue', name: '蓝色', color: '#3B82F6' },
    { id: 'green', name: '绿色', color: '#10B981' },
    { id: 'purple', name: '紫色', color: '#8B5CF6' },
    { id: 'red', name: '红色', color: '#EF4444' },
    { id: 'orange', name: '橙色', color: '#F97316' },
    { id: 'custom', name: '自定义', color: personalization.customColor }
  ];

  // 更新个性化设置
  const handlePersonalizationChange = (key, value) => {
    setPersonalization(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  // 处理主题亮度调整
  const handleBrightnessChange = (value) => {
    setPersonalization(prev => ({
      ...prev,
      brightness: parseInt(value)
    }));
  };
  
  // 处理响应式预览模式切换
  const handleResponsiveModeChange = (mode) => {
    setPersonalization(prev => ({
      ...prev,
      responsiveMode: mode
    }));
  };
  
  // 切换侧边栏折叠状态
  const toggleSidebarCollapse = () => {
    setPersonalization(prev => ({
      ...prev,
      isSidebarCollapsed: !prev.isSidebarCollapsed
    }));
  };

  // 设置键盘快捷键 - 实现真正的快捷键功能
  const setupKeyboardShortcuts = () => {
    // 移除之前可能存在的事件监听，避免重复绑定
    document.removeEventListener('keydown', handleKeyboardShortcut);
    
    // 添加新的快捷键事件监听
    document.addEventListener('keydown', handleKeyboardShortcut);
    
    console.log('快捷键设置已更新:', personalization.shortcuts);
  };
  
  // 键盘快捷键处理函数
  const handleKeyboardShortcut = (e) => {
    // 获取当前聚焦的元素类型，避免在输入框中触发快捷键
    const activeElement = document.activeElement;
    const isInputElement = activeElement && 
                          (activeElement.tagName === 'INPUT' || 
                           activeElement.tagName === 'TEXTAREA' || 
                           activeElement.isContentEditable);
    
    // 如果在输入框中且不是Ctrl+A等文本编辑快捷键，则不处理
    if (isInputElement && !['a', 'c', 'v', 'x', 'z', 'y'].includes(e.key.toLowerCase())) {
      return;
    }
    
    // 检查是否按下了Ctrl或Cmd键
    const isCommandKey = e.ctrlKey || e.metaKey;
    
    // 根据设置的快捷键处理不同操作
    if (isCommandKey) {
      switch (e.key.toLowerCase()) {
        case 'n':
          if (!e.shiftKey && personalization.shortcuts.newTask.includes('Ctrl+N')) {
            e.preventDefault();
            triggerNewTask();
          }
          break;
        case 'f':
          if (!e.shiftKey && personalization.shortcuts.search.includes('Ctrl+F')) {
            e.preventDefault();
            triggerSearch();
          }
          break;
        case ',':
          if (personalization.shortcuts.settings.includes('Ctrl+,')) {
            e.preventDefault();
            triggerSettings();
          }
          break;
        case 'b':
          if (!e.shiftKey && personalization.shortcuts.toggleSidebar.includes('Ctrl+B')) {
            e.preventDefault();
            triggerToggleSidebar();
          }
          break;
      }
    }
  };
  
  // 触发新建任务操作
  const triggerNewTask = () => {
    // 查找并触发新建任务按钮
    const addTaskButton = document.querySelector('[data-action="new-task"]') || 
                         document.querySelector('.add-task-button') ||
                         document.getElementById('add-task');
    
    if (addTaskButton) {
      addTaskButton.click();
    } else {
      // 或者通过事件通知应用其他部分
      window.dispatchEvent(new CustomEvent('triggerNewTask'));
    }
  };
  
  // 触发搜索操作
  const triggerSearch = () => {
    const searchInput = document.querySelector('[data-action="search"]') || 
                       document.querySelector('.search-input') ||
                       document.getElementById('search');
    
    if (searchInput) {
      searchInput.focus();
    } else {
      window.dispatchEvent(new CustomEvent('triggerSearch'));
    }
  };
  
  // 触发设置页面
  const triggerSettings = () => {
    // 查找设置按钮并点击
    const settingsButton = document.querySelector('[data-action="settings"]') ||
                          document.querySelector('.settings-button') ||
                          document.getElementById('settings');
    
    if (settingsButton) {
      settingsButton.click();
    } else {
      // 或者直接导航到设置页面
      const settingsLink = document.querySelector('a[href="#/settings"]') ||
                          document.querySelector('a[href="/settings"]');
      if (settingsLink) {
        settingsLink.click();
      }
    }
  };
  
  // 触发切换侧边栏
  const triggerToggleSidebar = () => {
    const sidebarToggle = document.querySelector('[data-action="toggle-sidebar"]') ||
                         document.querySelector('.sidebar-toggle') ||
                         document.getElementById('toggle-sidebar');
    
    if (sidebarToggle) {
      sidebarToggle.click();
    } else {
      // 尝试直接切换侧边栏可见性
      const sidebar = document.querySelector('.sidebar');
      const content = document.querySelector('.main-content');
      
      if (sidebar && content) {
        sidebar.classList.toggle('collapsed');
        content.classList.toggle('sidebar-collapsed');
      }
    }
  };
  
  // 组件卸载时清理事件监听器
  useEffect(() => {
    return () => {
      document.removeEventListener('keydown', handleKeyboardShortcut);
    };
  }, []);

  const handleReset = () => {
    try {
      const defaultSettings = {
        theme: 'blue',
        customColor: '#3B82F6',
        brightness: 100,
        layout: 'default',
        density: 'comfortable',
        sidebarPosition: 'left',
        isSidebarCollapsed: false,
        responsiveMode: 'desktop',
        shortcuts: {
          newTask: 'Ctrl+N',
          search: 'Ctrl+F',
          settings: 'Ctrl+,',
          toggleSidebar: 'Ctrl+B'
        }
      };
      
      // 更新状态
      setPersonalization(defaultSettings);
      
      // 应用默认设置
      applySettings();
      setupKeyboardShortcuts();
      
      // 清理本地存储
      localStorage.removeItem('personalization');
      localStorage.removeItem('themeColor');
      localStorage.removeItem('sidebarPosition');
      localStorage.removeItem('isSidebarCollapsed');
      localStorage.removeItem('layoutMode');
      localStorage.removeItem('density');
      
      // 显示成功提示
      toast({
        title: '成功',
        description: '已恢复默认个性化设置并应用',
        variant: 'success'
      });
      
      // 添加视觉反馈
      const resetButton = document.getElementById('reset-settings-button');
      if (resetButton) {
        const originalText = resetButton.textContent;
        resetButton.textContent = '已重置！';
        resetButton.classList.add('bg-yellow-600', 'text-white');
        setTimeout(() => {
          resetButton.textContent = originalText;
          resetButton.classList.remove('bg-yellow-600', 'text-white');
        }, 2000);
      }
    } catch (error) {
      console.error('重置个性化设置失败:', error);
      toast({
        title: '错误',
        description: '重置个性化设置时出错，请重试',
        variant: 'destructive'
      });
    }
  };

  // 添加状态管理按钮视觉反馈
  const [showSuccessFeedback, setShowSuccessFeedback] = useState(false);
  
  const handleSave = async () => {
    try {
      setIsSaving(true);
      setShowSuccessFeedback(false); // 确保重置反馈状态
      
      // 保存到localStorage
      localStorage.setItem('personalization', JSON.stringify(personalization));
      
      // 应用所有设置
      applySettings();
      setupKeyboardShortcuts();
      
      // 通知应用其他部分设置已保存
      notifySettingsChanged(personalization);
      
      // 模拟异步操作
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 显示成功提示
      toast({
        title: '设置已保存',
        description: '您的个性化设置已成功应用到整个应用',
        variant: 'success'
      });
      
    } catch (error) {
      console.error('保存个性化设置失败:', error);
      toast({
        title: '保存失败',
        description: '无法保存设置，请重试',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
      // 使用setTimeout确保在状态更新周期结束后再设置成功反馈
      setTimeout(() => {
        setShowSuccessFeedback(true);
        // 2秒后隐藏反馈
        setTimeout(() => {
          setShowSuccessFeedback(false);
        }, 2000);
      }, 0);
    }
  };

  return (
    <div className={`space-y-8 ${containerClass} p-6 rounded-xl`}>
      {/* 主题设置 */}
      <div className={`${cardClass} rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4`}>
        <div className="flex items-center space-x-2">
          <Palette className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">主题颜色</h3>
        </div>
        
        {/* 预定义主题 */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          {themes.filter(theme => theme.id !== 'custom').map((theme) => (
            <button
              key={theme.id}
              onClick={() => setPersonalization({ ...personalization, theme: theme.id, customColor: theme.color })}
              className={`
                relative p-3 rounded-lg transition-all duration-200
                ${theme.id === personalization.theme
                  ? 'ring-2 ring-blue-500 dark:ring-blue-400 ring-offset-2 dark:ring-offset-gray-800'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'}
              `}
            >
              <div 
                className="w-full h-8 rounded-md" 
                style={{ backgroundColor: theme.color }}
              />
              <span className="text-xs mt-1 block text-center text-gray-600 dark:text-gray-400">
                {theme.name}
              </span>
              {theme.id === personalization.theme && (
                <Check className="absolute top-2 right-2 w-4 h-4 text-blue-600 dark:text-blue-400" />
              )}
            </button>
          ))}
        </div>
        
        {/* 自定义颜色 */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            自定义选项
          </label>
          
          <div className="mb-4">
            <label htmlFor="customColor" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              自定义主题色
            </label>
            <div className="flex items-center space-x-3">
              <input
                id="customColor"
                type="color"
                value={personalization.customColor || '#3B82F6'}
                onChange={(e) => setPersonalization({ ...personalization, customColor: e.target.value, theme: 'custom' })}
                className="w-10 h-10 rounded border-0 cursor-pointer"
              />
              <input
                type="text"
                value={personalization.customColor || '#3B82F6'}
                onChange={(e) => setPersonalization({ ...personalization, customColor: e.target.value, theme: 'custom' })}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white flex-1"
                placeholder="例如: #3B82F6"
              />
            </div>
          </div>
          
          {/* 亮度调节 */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="brightness" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                主题亮度
              </label>
              <span className="text-xs text-gray-500 dark:text-gray-400">{personalization.brightness || 100}%</span>
            </div>
            <input
              id="brightness"
              type="range"
              min="50"
              max="150"
              value={personalization.brightness || 100}
              onChange={(e) => handleBrightnessChange(e.target.value)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
          </div>
        </div>
      </div>

      {/* 布局设置 */}
      <div className={`${cardClass} rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4`}>
        <div className="flex items-center space-x-2">
          <Layout className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">界面布局</h3>
        </div>
        
        <div className="space-y-5 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              布局模式
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { value: 'default', label: '默认', description: '平衡的布局' },
                { value: 'compact', label: '紧凑', description: '节省空间' },
                { value: 'expanded', label: '宽敞', description: '更宽敞的视图' }
              ].map((layout) => (
                <button
                  key={layout.value}
                  onClick={() => setPersonalization({ ...personalization, layout: layout.value })}
                  className={`
                    p-3 rounded-lg border text-left transition-colors
                    ${personalization.layout === layout.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'}
                  `}
                >
                  <span className="font-medium">{layout.label}</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {layout.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              元素密度
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { value: 'compact', label: '紧凑', description: '最小间距' },
                { value: 'comfortable', label: '舒适', description: '适中的间距' },
                { value: 'spacious', label: '宽敞', description: '最大间距' }
              ].map((density) => (
                <button
                  key={density.value}
                  onClick={() => setPersonalization({ ...personalization, density: density.value })}
                  className={`
                    p-3 rounded-lg border text-left transition-colors
                    ${personalization.density === density.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'}
                  `}
                >
                  <span className="font-medium">{density.label}</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {density.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              侧边栏位置
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'left', label: '左侧' },
                { value: 'right', label: '右侧' }
              ].map((position) => (
                <button
                  key={position.value}
                  onClick={() => setPersonalization({ ...personalization, sidebarPosition: position.value })}
                  className={`
                    p-3 rounded-lg border flex items-center justify-center space-x-2 transition-colors
                    ${personalization.sidebarPosition === position.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'}
                  `}
                >
                  <div className={`w-4 h-10 bg-gray-200 dark:bg-gray-700 rounded ${position.value === 'left' ? 'mr-2' : 'ml-2'}`} />
                  <div className="w-20 h-10 bg-gray-300 dark:bg-gray-600 rounded" />
                  <span className="text-sm font-medium">{position.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              侧边栏状态
            </label>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm font-medium">{personalization.isSidebarCollapsed ? '已折叠' : '展开'}</span>
              <button
                onClick={toggleSidebarCollapse}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors
                  ${personalization.isSidebarCollapsed
                    ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400'}
                `}
              >
                {personalization.isSidebarCollapsed ? '展开' : '折叠'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 快捷键设置 */}
      <div className={`${cardClass} rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4`}>
        <div className="flex items-center space-x-2">
          <Keyboard className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">键盘快捷键</h3>
        </div>
        
        <div className="space-y-3 mt-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
              <div className="text-sm text-gray-500 dark:text-gray-400">新建任务</div>
              <div className="font-mono text-sm mt-1">{personalization.shortcuts.newTask}</div>
            </div>
            <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
              <div className="text-sm text-gray-500 dark:text-gray-400">搜索</div>
              <div className="font-mono text-sm mt-1">{personalization.shortcuts.search}</div>
            </div>
            <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
              <div className="text-sm text-gray-500 dark:text-gray-400">设置</div>
              <div className="font-mono text-sm mt-1">{personalization.shortcuts.settings}</div>
            </div>
            <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
              <div className="text-sm text-gray-500 dark:text-gray-400">切换侧边栏</div>
              <div className="font-mono text-sm mt-1">{personalization.shortcuts.toggleSidebar}</div>
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            快捷键设置仅用于查看参考，实际功能取决于浏览器支持情况
          </p>
        </div>
      </div>

      {/* 响应式预览 */}
      <div className={`${cardClass} rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4`}>
        <div className="flex items-center space-x-2">
          <Monitor className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">响应式预览</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {[
            { mode: 'desktop', label: '桌面端', icon: Monitor, size: '1920x1080' },
            { mode: 'tablet', label: '平板端', icon: Tablet, size: '768x1024' },
            { mode: 'mobile', label: '移动端', icon: Smartphone, size: '375x667' }
          ].map((device) => {
            const DeviceIcon = device.icon;
            return (
              <button
                key={device.mode}
                onClick={() => handleResponsiveModeChange(device.mode)}
                className={`
                  p-4 rounded-lg transition-all duration-200
                  ${personalization.responsiveMode === device.mode
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500 dark:border-blue-400'
                    : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'}
                `}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <DeviceIcon className="w-4 h-4" />
                  <span className="font-medium">{device.label}</span>
                </div>
                <div className="w-full h-20 bg-white dark:bg-gray-800 rounded border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
                  <span className="text-sm text-gray-500">{device.size}</span>
                </div>
              </button>
            );
          })}
        </div>
        
        <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md">
          <p className="text-sm text-amber-700 dark:text-amber-300">
            点击上方选项可实时预览不同设备的显示效果。点击「桌面端」可恢复正常视图。
          </p>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          id="reset-settings-button"
          onClick={handleReset}
          className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>重置</span>
        </button>
        
        <button
          id="save-settings-button"
          onClick={handleSave}
          disabled={isSaving}
          className={`flex items-center space-x-2 px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${showSuccessFeedback ? 'bg-green-600' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>保存中...</span>
            </>
          ) : showSuccessFeedback ? (
            <>
              <CheckCircle className="w-4 h-4" />
              <span>保存成功！</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>保存设置</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Personalization;
