import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useSleep } from '../context/SleepContext';

const ProfileScreen = () => {
  const { theme, toggleTheme, isDarkMode } = useTheme();
  const { notificationPermission } = useSleep();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textColor }]}>个人中心</Text>
        <View style={[styles.avatar, { backgroundColor: theme.primaryColor }]}>
          <Text style={styles.avatarText}>👤</Text>
        </View>
      </View>
      
      <View style={styles.infoSection}>
        <Text style={[styles.sectionTitle, { color: theme.textColor }]}>账户信息</Text>
        <View style={[styles.infoItem, { backgroundColor: theme.cardBackgroundColor }]}>
          <Text style={[styles.infoLabel, { color: theme.textColor + '80' }]}>用户名</Text>
          <Text style={[styles.infoValue, { color: theme.textColor }]}>SleepWell用户</Text>
        </View>
        <View style={[styles.infoItem, { backgroundColor: theme.cardBackgroundColor }]}>
          <Text style={[styles.infoLabel, { color: theme.textColor + '80' }]}>会员状态</Text>
          <Text style={[styles.infoValue, { color: '#4CAF50' }]}>普通会员</Text>
        </View>
        <View style={[styles.infoItem, { backgroundColor: theme.cardBackgroundColor }]}>
          <Text style={[styles.infoLabel, { color: theme.textColor + '80' }]}>积分</Text>
          <Text style={[styles.infoValue, { color: theme.textColor }]}>1250</Text>
        </View>
      </View>
      
      <View style={styles.settingsSection}>
        <Text style={[styles.sectionTitle, { color: theme.textColor }]}>设置</Text>
        
        <TouchableOpacity 
          style={[styles.settingItem, { backgroundColor: theme.cardBackgroundColor }]}
          onPress={toggleTheme}
        >
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, { color: theme.textColor }]}>深色模式</Text>
            <Text style={[styles.settingDescription, { color: theme.textColor + '60' }]}>
              {isDarkMode ? '已开启' : '已关闭'}
            </Text>
          </View>
          <Text style={styles.settingIcon}>{isDarkMode ? '🌙' : '☀️'}</Text>
        </TouchableOpacity>
        
        <View style={[styles.settingItem, { backgroundColor: theme.cardBackgroundColor }]}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, { color: theme.textColor }]}>通知权限</Text>
            <Text style={[styles.settingDescription, { color: theme.textColor + '60' }]}>
              {notificationPermission === 'granted' ? '已开启' : '已关闭'}
            </Text>
          </View>
          <Text style={styles.settingIcon}>
            {notificationPermission === 'granted' ? '✅' : '❌'}
          </Text>
        </View>
        
        <TouchableOpacity style={[styles.settingItem, { backgroundColor: theme.cardBackgroundColor }]}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, { color: theme.textColor }]}>关于我们</Text>
            <Text style={[styles.settingDescription, { color: theme.textColor + '60' }]}>版本 1.0.0</Text>
          </View>
          <Text style={styles.settingIcon}>ℹ️</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.settingItem, { backgroundColor: theme.cardBackgroundColor }]}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, { color: theme.textColor }]}>帮助与反馈</Text>
            <Text style={[styles.settingDescription, { color: theme.textColor + '60' }]}>获取帮助或反馈问题</Text>
          </View>
          <Text style={styles.settingIcon}>❓</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 40,
  },
  infoSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  infoItem: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  infoLabel: {
    fontSize: 14,
    marginBottom: 5,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  settingsSection: {
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 3,
  },
  settingDescription: {
    fontSize: 12,
  },
  settingIcon: {
    fontSize: 20,
  },
});

export default ProfileScreen;
