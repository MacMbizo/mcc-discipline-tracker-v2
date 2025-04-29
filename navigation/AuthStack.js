"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AuthStack;
const react_1 = __importDefault(require("react"));
const native_stack_1 = require("@react-navigation/native-stack");
const LoginScreen_1 = __importDefault(require("../screens/Auth/LoginScreen"));
const RegisterScreen_1 = __importDefault(require("../screens/Auth/RegisterScreen"));
const Stack = (0, native_stack_1.createNativeStackNavigator)();
function AuthStack() {
    return (<Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={LoginScreen_1.default} options={{ headerShown: false }}/>
      <Stack.Screen name="Register" component={RegisterScreen_1.default} options={{ headerShown: false }}/>
    </Stack.Navigator>);
}
