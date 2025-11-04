import React from 'react';

// 玻璃卡片组件 - Web版本
const GlassCard = ({
  children,
  style,
  intensity = 50,
  blurType = 'light',
  borderRadius = 16,
  borderWidth = 1,
  borderColor = 'rgba(255, 255, 255, 0.2)',
  backgroundColor = 'rgba(255, 255, 255, 0.15)',
  ...props
}) => {
  // 计算模糊半径样式
  const blurStyle = {
    filter: `blur(${intensity * 0.3}px)`, // 转换intensity到合理的blur值
    WebkitBackdropFilter: `blur(${intensity * 0.3}px)`,
    backdropFilter: `blur(${intensity * 0.3}px)`,
  };

  // 根据blurType调整背景颜色
  const finalBackgroundColor = blurType === 'dark' 
    ? 'rgba(0, 0, 0, 0.15)' 
    : backgroundColor;

  return (
    <div 
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: `${borderRadius}px`,
        ...style
      }} 
      {...props}
    >
      {/* 背景模糊层 */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          borderRadius: `${borderRadius}px`,
          borderWidth: `${borderWidth}px`,
          borderColor: borderColor,
          backgroundColor: finalBackgroundColor,
          ...blurStyle,
          zIndex: 1,
        }}
      />
      
      {/* 内容容器 */}
      <div 
        style={{
          width: '100%',
          minHeight: '100%',
          padding: '16px',
          backgroundColor: 'transparent',
          position: 'relative',
          zIndex: 2,
        }}
      >
        {children}
      </div>
    </div>
  );
};

// 主题配置对象
const GlassCardTheme = {
  light: {
    intensity: 40,
    blurType: 'light',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  dark: {
    intensity: 60,
    blurType: 'dark',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  vibrant: {
    intensity: 80,
    blurType: 'light',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  subtle: {
    intensity: 30,
    blurType: 'light',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.15)',
  }
};

// 带主题的液态玻璃卡片组件
const ThemedGlassCard = ({ 
  children, 
  theme = 'light', 
  style, 
  ...props 
}) => {
  const themeConfig = GlassCardTheme[theme] || GlassCardTheme.light;
  
  return (
    <GlassCard
      style={style}
      intensity={themeConfig.intensity}
      blurType={themeConfig.blurType}
      backgroundColor={themeConfig.backgroundColor}
      borderColor={themeConfig.borderColor}
      {...props}
    >
      {children}
    </GlassCard>
  );
};

// 示例应用组件
const GlassTestPage = () => {
  return (
    <div 
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
        background: 'linear-gradient(135deg, #6e8efb, #a777e3)',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: 'white', fontSize: '2.5rem', marginBottom: '10px', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
          液态玻璃效果演示
        </h1>
        <p style={{ color: 'white', fontSize: '1.1rem', opacity: 0.9 }}>
          不同主题和自定义样式的玻璃态UI组件
        </p>
      </div>
      
      <div style={{ width: '100%', maxWidth: '500px' }}>
        <ThemedGlassCard theme="light" style={{
          marginVertical: '10px',
          width: '100%',
          minHeight: '100px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <h3 style={{ color: 'white', fontSize: '1.5rem', margin: 0 }}>Light Theme</h3>
        </ThemedGlassCard>
        
        <ThemedGlassCard theme="dark" style={{
          marginVertical: '10px',
          width: '100%',
          minHeight: '100px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <h3 style={{ color: 'white', fontSize: '1.5rem', margin: 0 }}>Dark Theme</h3>
        </ThemedGlassCard>
        
        <ThemedGlassCard theme="vibrant" style={{
          marginVertical: '10px',
          width: '100%',
          minHeight: '100px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <h3 style={{ color: 'white', fontSize: '1.5rem', margin: 0 }}>Vibrant Theme</h3>
        </ThemedGlassCard>
        
        <ThemedGlassCard theme="subtle" style={{
          marginVertical: '10px',
          width: '100%',
          minHeight: '100px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <h3 style={{ color: 'white', fontSize: '1.5rem', margin: 0 }}>Subtle Theme</h3>
        </ThemedGlassCard>
        
        {/* 自定义样式的卡片 */}
        <GlassCard
          intensity={70}
          borderRadius={20}
          borderWidth={2}
          borderColor="rgba(255, 255, 255, 0.4)"
          backgroundColor="rgba(100, 150, 255, 0.2)"
          style={{
            marginVertical: '10px',
            width: '100%',
            minHeight: '100px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <h3 style={{ color: 'white', fontSize: '1.5rem', margin: 0 }}>Custom Card</h3>
        </GlassCard>
      </div>
    </div>
  );
};

export default GlassTestPage;