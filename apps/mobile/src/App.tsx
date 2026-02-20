import React, { useEffect } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuthStore } from './utils/auth-store';

import type {
  AuthStackParamList,
  MainTabParamList,
  DashboardStackParamList,
} from './navigation/types';

// Screens
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import DashboardScreen from './screens/DashboardScreen';
import WorkLogScreen from './screens/WorkLogScreen';
import ComplianceScreen from './screens/ComplianceScreen';
import DocumentsScreen from './screens/DocumentsScreen';
import TenancyScreen from './screens/TenancyScreen';

const DarkTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: '#3B82F6',
    background: '#0F172A',
    card: '#1E293B',
    text: '#FFFFFF',
    border: '#334155',
    notification: '#EF4444',
  },
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const DashboardStack = createNativeStackNavigator<DashboardStackParamList>();

function DashboardStackNavigator() {
  return (
    <DashboardStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0F172A' },
      }}
    >
      <DashboardStack.Screen name="DashboardHome" component={DashboardScreen} />
      <DashboardStack.Screen
        name="Tenancy"
        component={TenancyScreen}
        options={{
          headerShown: true,
          headerTitle: 'Tenancy Rights',
          headerStyle: { backgroundColor: '#1E293B' },
          headerTintColor: '#FFFFFF',
          headerShadowVisible: false,
        }}
      />
    </DashboardStack.Navigator>
  );
}

const TAB_ICONS: Record<string, { active: string; inactive: string }> = {
  Dashboard: { active: '🏠', inactive: '🏠' },
  WorkLog: { active: '⏱️', inactive: '⏱️' },
  Compliance: { active: '📋', inactive: '📋' },
  Documents: { active: '📄', inactive: '📄' },
};

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1E293B',
          borderTopColor: '#334155',
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#64748B',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarIcon: ({ focused }) => {
          const icons = TAB_ICONS[route.name];
          return (
            <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>
              {focused ? icons?.active : icons?.inactive}
            </Text>
          );
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardStackNavigator}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="WorkLog"
        component={WorkLogScreen}
        options={{ tabBarLabel: 'Work Log' }}
      />
      <Tab.Screen
        name="Compliance"
        component={ComplianceScreen}
        options={{ tabBarLabel: 'Compliance' }}
      />
      <Tab.Screen
        name="Documents"
        component={DocumentsScreen}
        options={{ tabBarLabel: 'Documents' }}
      />
    </Tab.Navigator>
  );
}

function AuthNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0F172A' },
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

function LoadingScreen() {
  return (
    <View style={loadingStyles.container}>
      <Text style={loadingStyles.logo}>{'⭐'}</Text>
      <Text style={loadingStyles.title}>NorthStar</Text>
      <ActivityIndicator
        size="large"
        color="#3B82F6"
        style={loadingStyles.spinner}
      />
      <Text style={loadingStyles.subtitle}>Loading...</Text>
    </View>
  );
}

const loadingStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontSize: 56,
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 24,
  },
  spinner: {
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
  },
});

export default function App() {
  const { isAuthenticated, isLoading, loadFromStorage } = useAuthStore();

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  if (isLoading) {
    return (
      <>
        <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
        <LoadingScreen />
      </>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      <NavigationContainer theme={DarkTheme}>
        {isAuthenticated ? <MainTabNavigator /> : <AuthNavigator />}
      </NavigationContainer>
    </>
  );
}
