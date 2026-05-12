import React, { useState, useEffect, useCallback } from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppContext } from './context/AppContext';
import './i18n/config';

// Screens
import Splash from './screens/Splash';
import Login from './screens/Login';
import Register from './screens/Register';
import NonSlopHome from './screens/NonSlopHome';
import AICustomRequest from './screens/AICustomRequest';
import SelectSpecialty from './screens/SelectSpecialty';
import ReviewConcepts from './screens/ReviewConcepts';
import ReviewComponent from './screens/ReviewComponent';
import EditComponents from './screens/EditComponents';
import PrototypeComplete from './screens/PrototypeComplete';
import LaunchPracticeApp from './screens/LaunchPracticeApp';
import DeploymentOptions from './screens/DeploymentOptions';
import MyAppsLibrary from './screens/MyAppsLibrary';
import CommunityFeed from './screens/CommunityFeed';
import ClinicianHome from './screens/ClinicianHome';
import ClinicianDashboard from './screens/ClinicianDashboard';
import CalculatorScreen from './screens/CalculatorScreen';
import UseCaseBrowser from './screens/UseCaseBrowser';
import CalculatorBrowser from './screens/CalculatorBrowser';
import AskExpert from './screens/AskExpert';
import ExpertReview from './screens/ExpertReview';
import RequestSent from './screens/RequestSent';
import ExpertPanel from './screens/ExpertPanel';
import MyRequests from './screens/MyRequests';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const APPS_KEY = '@nonslop_apps';
const PROFILE_KEY = '@nonslop_profile';
const AUTH_KEY = '@nonslop_auth';

const EMPTY_DRAFT = {
  specialty: null,
  stylePreference: null,
  selectedComponents: [],
  aiSuggestedComponents: [],
  appName: '',
  superStyle: null,
  superComponents: [],
};

function WizardStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#121415' } }}>
      <Stack.Screen name="SelectSpecialty" component={SelectSpecialty} />
      <Stack.Screen name="ReviewConcepts" component={ReviewConcepts} />
      <Stack.Screen name="EditComponents" component={EditComponents} />
      <Stack.Screen name="ReviewComponent" component={ReviewComponent} />
      <Stack.Screen name="PrototypeComplete" component={PrototypeComplete} />
      <Stack.Screen name="LaunchPracticeApp" component={LaunchPracticeApp} />
      <Stack.Screen name="DeploymentOptions" component={DeploymentOptions} />
    </Stack.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#121415' } }}>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Register} />
    </Stack.Navigator>
  );
}

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = focused ? 'home' : 'home-outline';
          if (route.name === 'MyApps') iconName = focused ? 'grid' : 'grid-outline';
          else if (route.name === 'Community') iconName = focused ? 'people' : 'people-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#abcbdf',
        tabBarInactiveTintColor: '#6B6B6B',
        headerShown: false,
        tabBarStyle: { backgroundColor: '#1e2021', borderTopColor: '#292a2b' },
        tabBarLabelStyle: { fontSize: 11 },
      })}
    >
      <Tab.Screen name="Home" component={NonSlopHome} />
      <Tab.Screen name="MyApps" component={MyAppsLibrary} options={{ title: 'My Apps' }} />
      <Tab.Screen name="Community" component={CommunityFeed} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [apps, setAppsState] = useState([]);
  const [currentDraft, setCurrentDraft] = useState({ ...EMPTY_DRAFT });
  const [userProfile, setUserProfileState] = useState(null);
  const [authUser, setAuthUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    AsyncStorage.multiGet([APPS_KEY, PROFILE_KEY, AUTH_KEY]).then((pairs) => {
      const [appsRaw, profileRaw, authRaw] = pairs.map((p) => p[1]);
      if (appsRaw) { try { setAppsState(JSON.parse(appsRaw)); } catch (_) { } }
      if (profileRaw) { try { setUserProfileState(JSON.parse(profileRaw)); } catch (_) { } }
      if (authRaw) {
        try {
          const stored = JSON.parse(authRaw);
          if (stored?.session) {
            setAuthUser(stored.session);
            if (stored.session.specialty) {
              setCurrentDraft((d) => ({ ...d, specialty: stored.session.specialty }));
            }
          }
        } catch (_) { }
      }
      setAuthChecked(true);
    });
  }, []);

  const setApps = useCallback((updater) => {
    setAppsState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      AsyncStorage.setItem(APPS_KEY, JSON.stringify(next)).catch(() => { });
      return next;
    });
  }, []);

  const setProfile = useCallback((patch) => {
    setUserProfileState((prev) => {
      const next = { ...prev, ...patch };
      AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(next)).catch(() => { });
      return next;
    });
  }, []);

  const updateDraft = useCallback(
    (patch) => setCurrentDraft((prev) => ({ ...prev, ...patch })),
    []
  );

  const resetDraft = useCallback(
    () => setCurrentDraft({ ...EMPTY_DRAFT }),
    []
  );

  const startNewDraft = useCallback(
    (specialty) => setCurrentDraft({ ...EMPTY_DRAFT, specialty }),
    []
  );

  const signIn = useCallback(async (email, password) => {
    try {
      const raw = await AsyncStorage.getItem(AUTH_KEY);
      if (!raw) return false;
      const stored = JSON.parse(raw);
      const users = Array.isArray(stored) ? stored : [stored];
      const user = users.find((u) => u.email === email && u.password === password);
      if (!user) return false;
      const session = { email: user.email, name: user.name, specialty: user.specialty };
      setAuthUser(session);
      setProfile({ name: user.name, specialty: user.specialty });
      setCurrentDraft((d) => ({ ...d, specialty: user.specialty }));
      await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(
        users.map((u) => u.email === email ? { ...u, session } : u)
      ));
      return true;
    } catch (_) {
      return false;
    }
  }, []);

  const register = useCallback(async (email, password, name, specialty) => {
    try {
      const raw = await AsyncStorage.getItem(AUTH_KEY);
      const users = raw ? (Array.isArray(JSON.parse(raw)) ? JSON.parse(raw) : [JSON.parse(raw)]) : [];
      if (users.find((u) => u.email === email)) return false;
      const newUser = { email, password, name, specialty, createdAt: new Date().toISOString() };
      const session = { email, name, specialty };
      newUser.session = session;
      await AsyncStorage.setItem(AUTH_KEY, JSON.stringify([...users, newUser]));
      setAuthUser(session);
      setProfile({ name, specialty });
      setCurrentDraft({ ...EMPTY_DRAFT, specialty });
      return true;
    } catch (_) {
      return false;
    }
  }, []);

  const signOut = useCallback(async () => {
    const raw = await AsyncStorage.getItem(AUTH_KEY);
    if (raw) {
      try {
        const users = Array.isArray(JSON.parse(raw)) ? JSON.parse(raw) : [JSON.parse(raw)];
        const cleaned = users.map(({ session: _s, ...u }) => u);
        await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(cleaned));
      } catch (_) { }
    }
    setAuthUser(null);
    setCurrentDraft({ ...EMPTY_DRAFT });
  }, []);

  const customDarkTheme = {
    ...DarkTheme,
    colors: { ...DarkTheme.colors, background: '#121415', text: '#e3e2e3' },
  };

  return (
    <AppContext.Provider value={{
      apps, setApps,
      currentDraft, updateDraft, resetDraft, startNewDraft,
      userProfile, setProfile,
      authUser, signIn, register, signOut,
    }}>
      <SafeAreaProvider>
        <NavigationContainer theme={customDarkTheme}>
          <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#121415' } }}>
            <Stack.Screen name="Splash" component={Splash} />
            <Stack.Screen name="Auth" component={AuthStack} />
            <Stack.Screen name="MainTabs" component={TabNavigator} />
            <Stack.Screen name="AICustomRequest" component={AICustomRequest} />
            <Stack.Screen name="UseCaseBrowser" component={UseCaseBrowser} />
            <Stack.Screen name="WizardFlow" component={WizardStack} />
            <Stack.Screen name="ClinicianHome" component={ClinicianHome} />
            <Stack.Screen name="ClinicianDashboard" component={ClinicianDashboard} />
            <Stack.Screen name="CalculatorScreen" component={CalculatorScreen} />
            <Stack.Screen name="CalculatorBrowser" component={CalculatorBrowser} />
            <Stack.Screen name="AskExpert" component={AskExpert} />
            <Stack.Screen name="ExpertReview" component={ExpertReview} />
            <Stack.Screen name="RequestSent" component={RequestSent} />
            <Stack.Screen name="ExpertPanel" component={ExpertPanel} />
            <Stack.Screen name="MyRequests" component={MyRequests} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </AppContext.Provider>
  );
}
