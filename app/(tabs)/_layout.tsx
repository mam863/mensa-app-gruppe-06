import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

export default function TabLayout() {
    const colorScheme = useColorScheme();

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#fff',
                    borderTopColor: '#eee',
                    borderTopWidth: 1,
                    height: 90,
                    paddingBottom: 4,
                    paddingTop: 4,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, focused }) => (
                        <MaterialCommunityIcons
                            name={focused ? 'food' : 'food-outline'}
                            size={24}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="mensen"
                options={{
                    title: 'Mensen',
                    tabBarIcon: ({ color }) => (
                        <MaterialCommunityIcons
                            name="office-building"
                            size={24}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="speiseplan"
                options={{
                    title: 'Speiseplan',
                    tabBarIcon: ({ color }) => (
                        <MaterialCommunityIcons
                            name="silverware-fork-knife"
                            size={24}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="favoriten"
                options={{
                    title: 'Favoriten',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? 'heart' : 'heart-outline'}
                            size={24}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Einstellungen',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? 'settings' : 'settings-outline'}
                            size={24}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="SurpriseMe"
                options={{
                    title: 'Surprise Me',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="sparkles-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="KIFeature"
                options={{
                    title: 'KI Feature',
                    tabBarIcon: ({ color }) => (
                        <MaterialCommunityIcons name="robot-happy-outline" size={24} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
