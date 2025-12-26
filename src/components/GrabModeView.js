import React, { useRef, useEffect, useState, useMemo, useCallback, forwardRef, useImperativeHandle } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Animated, 
  PanResponder, 
  useWindowDimensions,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// 配置常量
const CARD_CONFIG = {
  width: 120,
  height: 200,
  fanRadius: 240,
  maxRotateAngle: 30, // 最大旋转角度（度）
  selectionThresholdRatio: 0.15, // 相对于屏幕尺寸的选择阈值比例
  selectedScale: 1.2,
  selectedLift: -30,
};

// GrabCard 组件 - 使用 forwardRef 暴露动画方法
const GrabCard = forwardRef(({ item, theme, isSelected, layout, onPress }, ref) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const translateAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    playReleaseAnimation: (callback) => {
      Animated.sequence([
        Animated.parallel([
          Animated.spring(scaleAnim, { 
            toValue: 1.5, 
            friction: 3, 
            useNativeDriver: true 
          }),
          Animated.spring(translateAnim, { 
            toValue: -50, 
            friction: 3, 
            useNativeDriver: true 
          })
        ]),
        Animated.timing(opacityAnim, { 
          toValue: 0, 
          duration: 200, 
          useNativeDriver: true 
        })
      ]).start(callback);
    }
  }));

  // 选中状态动画
  useEffect(() => {
    if (isSelected) {
      Animated.parallel([
        Animated.spring(scaleAnim, { 
          toValue: CARD_CONFIG.selectedScale, 
          friction: 5, 
          useNativeDriver: true 
        }),
        Animated.spring(translateAnim, { 
          toValue: CARD_CONFIG.selectedLift, 
          friction: 5, 
          useNativeDriver: true 
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(scaleAnim, { 
          toValue: 1, 
          friction: 5, 
          useNativeDriver: true 
        }),
        Animated.spring(translateAnim, { 
          toValue: 0, 
          friction: 5, 
          useNativeDriver: true 
        })
      ]).start();
    }
  }, [isSelected]);

  if (!layout) return null;

  return (
    <Animated.View
      style={[
        styles.cardGrabItem,
        {
          backgroundColor: theme.card,
          opacity: opacityAnim,
          // 动态计算 zIndex：确保选中卡片在最前，其他按扇形排列
          zIndex: isSelected ? 9999 : (layout.totalCards * 2 - layout.index * 2),
          // 关键修复：确保绝对定位起点正确
          top: 0,
          left: 0,
          transform: [
            // { perspective: 1000 }, // 暂时移除透视，防止渲染异常
            { translateX: layout.x },
            { translateY: layout.y },
            { rotate: layout.rotate },
            { rotateY: layout.rotateY || '0deg' },
            { scale: scaleAnim },
            { translateY: translateAnim }
          ],
        }
      ]}
    >
      <View style={styles.cardContent}>
        {typeof item.icon === 'string' && item.icon.includes && 
         (item.icon.includes('-') || item.icon === 'logo-github') ? (
          <Ionicons 
            name={item.icon} 
            size={40} 
            color={theme.text} 
            style={styles.icon} 
          />
        ) : (
          <Text style={styles.iconText}>{item.icon}</Text>
        )}
        <Text style={[styles.menuItemTitle, { color: theme.text }]}>
          {item.title}
        </Text>
      </View>
    </Animated.View>
  );
});

// 辅助函数：计算卡片布局
const calculateCardLayouts = (visibleItems, containerWidth, containerHeight) => {
  if (visibleItems.length === 0) return {};
  
  const layouts = {};
  const { fanRadius, width, height, maxRotateAngle } = CARD_CONFIG;
  
  // 单卡片特殊处理
  if (visibleItems.length === 1) {
    layouts[visibleItems[0].id] = {
      x: containerWidth / 2 - width / 2,
      // 调整 Y 轴位置，确保在容器中间偏下
      y: containerHeight * 0.4, 
      rotate: '0deg',
      rotateY: '0deg',
      index: 0,
      totalCards: 1,
    };
    return layouts;
  }
  
  // 多卡片扇形排列
  const fanAngle = Math.PI / 1.8; // 扇形总角度
  const centerIndex = (visibleItems.length - 1) / 2;
  const maxRadians = (maxRotateAngle * Math.PI) / 180; // 转换为弧度
  
  visibleItems.forEach((item, index) => {
    // 计算基础角度
    let cardAngle = (index - centerIndex) * (fanAngle / (visibleItems.length - 1));
    
    // 限制最大旋转角度
    if (Math.abs(cardAngle) > maxRadians) {
      cardAngle = cardAngle > 0 ? maxRadians : -maxRadians;
    }
    
    // 计算位置 - 优化坐标公式
    // X轴：围绕容器中心点分布
    const x = containerWidth / 2 + Math.sin(cardAngle) * fanRadius - width / 2;
    // Y轴：根据扇形角度计算高度，加上基准偏移
    // 增加 yOffset 确保卡片整体可见，不会被推到屏幕外
    const yOffset = containerHeight * 0.4;
    const y = yOffset - Math.cos(cardAngle) * (fanRadius * 0.3) + (Math.abs(index - centerIndex) * 20);
    
    layouts[item.id] = {
      x,
      y,
      rotate: `${(cardAngle * 180 / Math.PI)}deg`,
      rotateY: `${(cardAngle * 180 / Math.PI)}deg`, // 使用 deg 提高兼容性
      index,
      totalCards: visibleItems.length,
    };
  });
  
  return layouts;
};

// GrabModeView 主组件
const GrabModeView = ({ menuItems, theme, selectedCard, setSelectedCardId, navigation }) => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [containerDimensions, setContainerDimensions] = useState({ width: screenWidth, height: screenHeight });
  const cardLayouts = useRef({});
  const cardRefs = useRef({}); // 存储所有卡片的 ref
  const containerViewRef = useRef(null); // 容器组件引用
  const containerLayout = useRef({ x: 0, y: 0, width: 0, height: 0 }); // 容器布局
  
  // 获取可见项目
  const visibleItems = useMemo(() => 
    menuItems.filter(item => item.visible), 
    [menuItems]
  );
  
  // 计算卡片布局（缓存）
  const currentLayouts = useMemo(() => 
    calculateCardLayouts(visibleItems, containerDimensions.width, containerDimensions.height),
    [visibleItems, containerDimensions]
  );
  
  // 更新布局引用
  useEffect(() => {
    cardLayouts.current = currentLayouts;
  }, [currentLayouts]);
  
  // 计算选择阈值
  const selectionThreshold = useMemo(
    () => Math.min(screenWidth, screenHeight) * CARD_CONFIG.selectionThresholdRatio,
    [screenWidth, screenHeight]
  );
  
  // 查找悬停的卡片（优化版 - 使用绝对坐标转换）
  const findHoveredCard = useCallback((pageX, pageY) => {
    // 将 pageX/pageY 转换为相对于容器的坐标
    const relativeX = pageX - containerLayout.current.x;
    const relativeY = pageY - containerLayout.current.y;
    
    let closestCardId = null;
    let minDistance = Infinity;
    
    Object.keys(cardLayouts.current).forEach(id => {
      const layout = cardLayouts.current[id];
      if (!layout) return;
      
      // 计算卡片中心点
      const centerX = layout.x + CARD_CONFIG.width / 2;
      const centerY = layout.y + CARD_CONFIG.height / 2;
      
      // 计算距离
      const distance = Math.sqrt(
        Math.pow(relativeX - centerX, 2) + Math.pow(relativeY - centerY, 2)
      );
      
      // 更新最近卡片
      if (distance < minDistance && distance < selectionThreshold) {
        minDistance = distance;
        closestCardId = id;
      }
    });
    
    // 设置选中卡片
    if (closestCardId && selectedCard !== closestCardId) {
      setSelectedCardId(closestCardId);
    } else if (!closestCardId && selectedCard) {
      // 只有距离过远才取消选中，增加一点粘性
      if (minDistance > selectionThreshold * 1.5) {
        setSelectedCardId(null);
      }
    }
  }, [selectedCard, selectionThreshold, setSelectedCardId]);
  
  // 节流版本的手势处理
  const throttledFindHoveredCard = useCallback((x, y) => {
    findHoveredCard(x, y);
  }, [findHoveredCard]);
  
  // PanResponder 配置
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        // 使用 pageX/pageY
        throttledFindHoveredCard(
          evt.nativeEvent.pageX, 
          evt.nativeEvent.pageY
        );
      },
      onPanResponderMove: (evt) => {
        // 使用 pageX/pageY
        throttledFindHoveredCard(
          evt.nativeEvent.pageX, 
          evt.nativeEvent.pageY
        );
      },
      onPanResponderRelease: (evt) => {
        if (selectedCard) {
          const selectedItem = visibleItems.find(item => item.id === selectedCard);
          if (selectedItem) {
            // 调用卡片的释放动画
            const cardRef = cardRefs.current[selectedCard];
            if (cardRef && cardRef.playReleaseAnimation) {
              cardRef.playReleaseAnimation(() => {
                navigation.navigate(selectedItem.screen);
              });
            } else {
              // 降级处理
              navigation.navigate(selectedItem.screen);
            }
          }
        }
        setSelectedCardId(null);
      },
      onPanResponderTerminate: () => {
        setSelectedCardId(null);
      },
    })
  ).current;
  
  // 空状态处理
  if (visibleItems.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: theme.background }]}>
        <Ionicons name="folder-open-outline" size={60} color={theme.textSecondary} />
        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
          暂无可用的抓取卡片
        </Text>
      </View>
    );
  }
  
  return (
    <View 
      ref={containerViewRef}
      style={[
        styles.cardGrabModeContainer, 
        { backgroundColor: theme.background }
      ]} 
      {...panResponder.panHandlers}
      onLayout={() => {
        // 捕获容器在父视图中的布局
        // 注意：如果父视图有滚动或偏移，这里可能还需要 measureInWindow
        if (containerViewRef.current) {
          containerViewRef.current.measure((x, y, width, height, pageX, pageY) => {
            containerLayout.current = { x: pageX, y: pageY, width, height };
            // 更新容器尺寸以触发重新布局
            if (width > 0 && height > 0 && (width !== containerDimensions.width || height !== containerDimensions.height)) {
              setContainerDimensions({ width, height });
            }
          });
        }
      }}
    >
      {visibleItems.map((item) => (
        <GrabCard
          key={item.id}
          ref={el => cardRefs.current[item.id] = el}
          item={item}
          theme={theme}
          isSelected={selectedCard === item.id}
          layout={currentLayouts[item.id]}
          onPress={() => {
            if (selectedCard === item.id) {
              navigation.navigate(item.screen);
            }
          }}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  // 容器样式
  cardGrabModeContainer: { 
    flex: 1, 
    minHeight: 500, 
    position: 'relative',
    // 增加顶部内边距，确保卡片不会太靠上
    paddingTop: 50,
    overflow: 'visible', // 确保卡片不会被裁剪
  },
  
  // 空状态
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    marginTop: 16,
    textAlign: 'center',
  },
  
  // 卡片样式
  cardGrabItem: { 
    position: 'absolute', 
    width: CARD_CONFIG.width, 
    height: CARD_CONFIG.height, 
    padding: 15, 
    borderRadius: 16, 
    alignItems: 'center', 
    justifyContent: 'center', 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 4, 
    elevation: 3,
  },
  
  // 卡片内容
  cardContent: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    width: '100%',
  },
  
  // 图标
  icon: { 
    fontSize: 40, 
    marginBottom: 12,
  },
  iconText: {
    fontSize: 40, 
    marginBottom: 12,
  },
  
  // 标题
  menuItemTitle: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    marginBottom: 8, 
    textAlign: 'center',
  },
});

export default GrabModeView;