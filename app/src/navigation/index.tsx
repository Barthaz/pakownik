import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faListCheck, faUsers } from '@fortawesome/free-solid-svg-icons';
import type {
  AuthStackParamList,
  ListsStackParamList,
  MainTabParamList,
} from '@/models/types';
import { WelcomeScreen } from '@/screens/WelcomeScreen';
import { LoginScreen } from '@/screens/LoginScreen';
import { RegisterScreen } from '@/screens/RegisterScreen';
import { ListsScreen } from '@/screens/ListsScreen';
import { ListDetailScreen } from '@/screens/ListDetailScreen';
import { FamilyScreen } from '@/screens/FamilyScreen';
import { pl } from '@/models/pl';
import { colors, fonts } from '@/theme';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const ListsStack = createNativeStackNavigator<ListsStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function ListsNavigator() {
  return (
    <ListsStack.Navigator screenOptions={{ headerShown: false }}>
      <ListsStack.Screen name="Lists" component={ListsScreen} />
      <ListsStack.Screen name="ListDetail" component={ListDetailScreen} />
    </ListsStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.coral,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.border,
          paddingTop: 4,
          height: 60,
        },
        tabBarLabelStyle: {
          fontFamily: fonts.bodyMedium,
          fontSize: 12,
        },
      }}
    >
      <Tab.Screen
        name="ListsTab"
        component={ListsNavigator}
        options={{
          title: pl.lists.title,
          tabBarIcon: ({ color, size }) => (
            <FontAwesomeIcon icon={faListCheck} size={size - 2} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="FamilyTab"
        component={FamilyScreen}
        options={{
          title: pl.family.title,
          tabBarIcon: ({ color, size }) => (
            <FontAwesomeIcon icon={faUsers} size={size - 2} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

export function MainNavigator() {
  return <MainTabs />;
}

export function RootNavigation({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <NavigationContainer>
      {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
