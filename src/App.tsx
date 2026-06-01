import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAppStore } from '@/store/appStore';
import { OnboardingScreen } from '@/screens/OnboardingScreen';
import { MealSetupScreen } from '@/screens/MealSetupScreen';
import { DashboardScreen } from '@/screens/DashboardScreen';
import { FoodLoggingScreen } from '@/screens/FoodLoggingScreen';
import { FixMyDayScreen } from '@/screens/FixMyDayScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const DashboardStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="DashboardMain" component={DashboardScreen} />
      <Stack.Screen
        name="FoodLogging"
        component={FoodLoggingScreen}
        options={{
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
};

const MainAppTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#6BCB77',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#f0f0f0',
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardStack}
        options={{
          title: 'Dashboard',
          tabBarLabel: 'Today',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>📊</Text>,
        }}
      />
      <Tab.Screen
        name="FixMyDay"
        component={FixMyDayScreen}
        options={{
          title: 'Fix My Day',
          tabBarLabel: 'Coach',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🤖</Text>,
        }}
      />
      <Tab.Screen
        name="Progress"
        component={DummyScreen}
        options={{
          title: 'Progress',
          tabBarLabel: 'Progress',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>📈</Text>,
        }}
      />
    </Tab.Navigator>
  );
};

const DummyScreen = () => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
      <Text style={{ fontSize: 18, fontWeight: '600', color: '#666' }}>Coming Soon</Text>
    </View>
  );
};

const AuthStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="MealSetup" component={MealSetupScreen} />
    </Stack.Navigator>
  );
};

export default function App() {
  const { user, setAuthenticated } = useAppStore();

  useEffect(() => {
    if (user) {
      setAuthenticated(true);
    }
  }, [user]);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="MainApp" component={MainAppTabs} />
        ) : (
          <Stack.Screen name="Auth" component={AuthStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

import { View, Text } from 'react-native';
