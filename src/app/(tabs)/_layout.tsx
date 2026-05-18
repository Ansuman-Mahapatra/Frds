import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';

// Simplified icons since we don't have lucide-react-native or vector-icons properly typed out of the box yet
function TabBarIcon({ color, name }: { color: string, name: string }) {
  return (
    <View style={[styles.iconPlaceholder, { borderColor: color }]}>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0F172A',
          borderTopWidth: 1,
          borderTopColor: '#1E293B',
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 28 : 12,
          paddingTop: 12,
        },
        tabBarActiveTintColor: '#FF3366',
        tabBarInactiveTintColor: '#64748B',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <TabBarIcon color={color} name="home" />,
        }}
      />
      <Tabs.Screen
        name="sports"
        options={{
          title: 'Sports',
          tabBarIcon: ({ color }) => <TabBarIcon color={color} name="activity" />,
        }}
      />
      <Tabs.Screen
        name="gaming"
        options={{
          title: 'Gaming',
          tabBarIcon: ({ color }) => <TabBarIcon color={color} name="gamepad" />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color }) => <TabBarIcon color={color} name="message-circle" />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <TabBarIcon color={color} name="user" />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
  }
});
