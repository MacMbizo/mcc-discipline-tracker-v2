"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = LoginScreen;
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const react_native_paper_1 = require("react-native-paper");
const auth_1 = require("firebase/auth");
const firebase_1 = require("../../services/firebase");
function LoginScreen({ navigation }) {
    const [email, setEmail] = (0, react_1.useState)('');
    const [password, setPassword] = (0, react_1.useState)('');
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)('');
    const theme = (0, react_native_paper_1.useTheme)();
    const handleLogin = async () => {
        setLoading(true);
        setError('');
        try {
            await (0, auth_1.signInWithEmailAndPassword)(firebase_1.auth, email, password);
            // Navigation will be handled by auth state in AppNavigator
        }
        catch (e) {
            setError(e.message || 'Login failed');
        }
        finally {
            setLoading(false);
        }
    };
    return (<react_native_1.View style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <react_native_paper_1.Text variant="headlineSmall" style={styles.title}>Midlands Christian College</react_native_paper_1.Text>
      <react_native_paper_1.Text variant="titleMedium" style={styles.subtitle}>Discipline Tracker</react_native_paper_1.Text>
      <react_native_paper_1.TextInput label="Email" value={email} onChangeText={setEmail} style={styles.input} autoCapitalize="none" keyboardType="email-address"/>
      <react_native_paper_1.TextInput label="Password" value={password} onChangeText={setPassword} style={styles.input} secureTextEntry/>
      {error ? <react_native_paper_1.Text style={{ color: theme.colors.error, marginBottom: 8 }}>{error}</react_native_paper_1.Text> : null}
      <react_native_paper_1.Button mode="contained" style={styles.button} onPress={handleLogin} loading={loading} disabled={loading}>
        Login
      </react_native_paper_1.Button>
      <react_native_1.TouchableOpacity onPress={() => { }}>
        <react_native_paper_1.Text style={styles.link}>Forgot password?</react_native_paper_1.Text>
      </react_native_1.TouchableOpacity>
      <react_native_1.TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <react_native_paper_1.Text style={styles.link}>New user? Register</react_native_paper_1.Text>
      </react_native_1.TouchableOpacity>
    </react_native_1.View>);
}
const styles = react_native_1.StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    title: {
        color: '#D32F2F',
        fontWeight: 'bold',
        marginBottom: 4,
    },
    subtitle: {
        color: '#1976D2',
        marginBottom: 24,
    },
    input: {
        width: '100%',
        marginBottom: 12,
    },
    button: {
        width: '100%',
        marginTop: 8,
        marginBottom: 8,
        borderRadius: 8,
    },
    link: {
        color: '#1976D2',
        marginTop: 8,
    },
});
