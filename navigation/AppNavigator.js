"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AppNavigator;
const react_1 = __importDefault(require("react"));
const native_1 = require("@react-navigation/native");
const native_stack_1 = require("@react-navigation/native-stack");
const react_native_paper_1 = require("react-native-paper");
const react_native_1 = require("react-native");
const theme_1 = require("../theme/theme");
const AuthStack_1 = __importDefault(require("./AuthStack"));
const AuthContext_1 = require("../context/AuthContext");
const react_native_paper_2 = require("react-native-paper");
const HomeScreen_1 = __importDefault(require("../screens/HomeScreen"));
const TeacherDashboardScreen_1 = __importDefault(require("../screens/TeacherDashboardScreen"));
const IncidentFormScreen_1 = __importDefault(require("../screens/IncidentFormScreen"));
const MeritFormScreen_1 = __importDefault(require("../screens/MeritFormScreen"));
const StudentSearchScreen_1 = __importDefault(require("../screens/StudentSearchScreen"));
const RecentLogsScreen_1 = __importDefault(require("../screens/RecentLogsScreen"));
const Stack = (0, native_stack_1.createNativeStackNavigator)();
// Sync navigation theme with Paper theme
const navigationTheme = {
    ...native_1.DefaultTheme,
    colors: {
        ...native_1.DefaultTheme.colors,
        primary: theme_1.theme.colors.primary,
        background: theme_1.theme.colors.background,
        card: theme_1.theme.colors.primary, // header background
        text: theme_1.theme.colors.onPrimary, // header text
        border: theme_1.theme.colors.primary,
        notification: theme_1.theme.colors.secondary,
    },
};
const styles = react_native_1.StyleSheet.create({
    surface: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
function AppNavigator() {
    const { user, loading } = (0, AuthContext_1.useAuth)();
    if (loading) {
        return (<react_native_paper_1.Surface style={[styles.surface, { backgroundColor: theme_1.theme.colors.background }]}> 
        <react_native_paper_2.ActivityIndicator animating color={theme_1.theme.colors.primary}/>
      </react_native_paper_1.Surface>);
    }
    return (<native_1.NavigationContainer theme={navigationTheme}>
      {user ? (<Stack.Navigator screenOptions={{
                headerStyle: { backgroundColor: theme_1.theme.colors.primary },
                headerTintColor: theme_1.theme.colors.onPrimary,
                headerTitleStyle: { fontWeight: 'bold' },
            }}>
          <Stack.Screen name="TeacherDashboard" component={TeacherDashboardScreen_1.default} options={{
                headerShown: false,
                title: 'Dashboard',
            }}/>
          <Stack.Screen name="Home" component={HomeScreen_1.default} options={{
                headerShown: false,
                title: 'MCC Home',
            }}/>
          <Stack.Screen name="IncidentFormScreen" component={IncidentFormScreen_1.default} options={{
                title: 'Log Incident',
            }}/>
          <Stack.Screen name="MeritFormScreen" component={MeritFormScreen_1.default} options={{
                title: 'Log Merit',
            }}/>
          <Stack.Screen name="StudentSearchScreen" component={StudentSearchScreen_1.default} options={{
                title: 'Search Students',
            }}/>
          <Stack.Screen name="RecentLogsScreen" component={RecentLogsScreen_1.default} options={{
                title: 'Recent Activity',
            }}/>
        </Stack.Navigator>) : (<AuthStack_1.default />)}
    </native_1.NavigationContainer>);
}
