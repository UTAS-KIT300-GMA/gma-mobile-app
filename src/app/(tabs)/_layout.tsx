import { Tabs } from "expo-router";
import { View, StyleSheet } from "react-native";
import {
  DiscoveryIcon,
  HomeIcon,
  LearningIcon,
  SearchIcon,
} from "../../../assets/icons";

/* Defines the tab navigation layout. The `Tabs` component is used to create 
a tab-based navigation structure.*/

/* The `TabBarIcon` component is a custom wrapper for the tab icons. It takes in a `focused` 
prop to determine if the tab is active and applies different styles accordingly. The `children` 
prop allows you to pass in the actual icon component that should be rendered within the wrapper. 
*/
function TabBarIcon({
  focused,
  children,
}: {
  focused: boolean;
  children: React.ReactNode;
}) {
  return (
    <View style={[styles.iconWrapper, focused && styles.activeIconWrapper]}>
      {children}
    </View>
  );
}

/*
- Each `Tabs.Screen` represents a different tab in the navigation. 
- The `screenOptions` prop is used to customize the appearance of the tab bar, 
including active and inactive tint colors, label styles, and overall tab bar styling. 
- Each screen also has its own options for the title and icon, which are defined using 
the `Ionicons` library for consistent and visually appealing icons. 
*/
export default function TabsLayout() {
  return (
    // The `Tabs` component is the main container for the tab navigation.
    // It wraps around all the individual screens (tabs) and provides the necessary context
    // for navigation.
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: { height: 100, paddingTop: 12, paddingBottom: 14 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused}>
              <HomeIcon width={32} height={32} />
            </TabBarIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="discovery"
        options={{
          title: "Discovery",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused}>
              <DiscoveryIcon width={32} height={32} />
            </TabBarIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="learning"
        options={{
          title: "Learning",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused}>
              <LearningIcon width={32} height={32} />
            </TabBarIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused}>
              <SearchIcon width={32} height={32} />
            </TabBarIcon>
          ),
        }}
      />
    </Tabs>
  );
}

/* The `styles` object defines the styling for the tab bar and icons.
- `tabBar` styles the overall tab bar, including height, padding, background color, and border.
- `iconWrapper` styles the container for each tab icon, including size and alignment.
- `activeIconWrapper` adds a background color to the active tab icon for visual feedback. */
const styles = StyleSheet.create({
  tabBar: {
    height: 88,
    paddingTop: 10,
    paddingBottom: 12,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 0,
    elevation: 0,
  },
  iconWrapper: {
    width: 58,
    height: 50,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  activeIconWrapper: {
    backgroundColor: "#E5E5E5",
  },
});