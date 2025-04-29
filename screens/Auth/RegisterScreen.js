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
exports.default = RegisterScreen;
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const react_native_paper_1 = require("react-native-paper");
const auth_1 = require("firebase/auth");
const firebase_1 = require("../../services/firebase");
function RegisterScreen({ navigation }) {
    const [name, setName] = (0, react_1.useState)('');
    const [email, setEmail] = (0, react_1.useState)('');
    const [password, setPassword] = (0, react_1.useState)('');
    const [confirm, setConfirm] = (0, react_1.useState)('');
    const [role, setRole] = (0, react_1.useState)('');
    const [roleMenuVisible, setRoleMenuVisible] = (0, react_1.useState)(false);
    const roleOptions = ['Teacher', 'Student', 'Parent', 'Admin'];
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)('');
    const [success, setSuccess] = (0, react_1.useState)(false);
    const theme = (0, react_native_paper_1.useTheme)();
    const handleRegister = async () => {
        setError('');
        setSuccess(false);
        if (!email || !password || !confirm || !role) {
            setError('Please fill in all required fields and select a role.');
            return;
        }
        if (password !== confirm) {
            setError('Passwords do not match.');
            return;
        }
        setLoading(true);
        try {
            await (0, auth_1.createUserWithEmailAndPassword)(firebase_1.auth, email, password);
            setSuccess(true);
            setTimeout(() => navigation.navigate('Login'), 1000);
        }
        catch (e) {
            setError(e.message || 'Registration failed');
        }
        finally {
            setLoading(false);
        }
    };
    return (<react_native_1.View style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <react_native_paper_1.Text variant="headlineSmall" style={styles.title}>Create Account</react_native_paper_1.Text>
      <react_native_paper_1.TextInput label="Name" value={name} onChangeText={setName} style={styles.input}/>
      <react_native_paper_1.TextInput label="Email" value={email} onChangeText={setEmail} style={styles.input} autoCapitalize="none" keyboardType="email-address"/>
      <react_native_paper_1.TextInput label="Password" value={password} onChangeText={setPassword} style={styles.input} secureTextEntry/>
      <react_native_paper_1.TextInput label="Confirm Password" value={confirm} onChangeText={setConfirm} style={styles.input} secureTextEntry/>
      <react_native_paper_1.Menu visible={roleMenuVisible} onDismiss={() => setRoleMenuVisible(false)} anchor={<react_native_1.TouchableOpacity onPress={() => setRoleMenuVisible(true)} style={[styles.input, { borderColor: !role && error ? '#D32F2F' : '#ccc', borderWidth: 1, borderRadius: 4 }]}>
            <react_native_1.View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <react_native_paper_1.Text style={{ color: role ? '#000' : '#888' }}>{role || 'Select Role...'}</react_native_paper_1.Text>
              <react_native_paper_1.IconButton icon="chevron-down" size={20}/>
            </react_native_1.View>
          </react_native_1.TouchableOpacity>}>
        {roleOptions.map(option => (<react_native_paper_1.Menu.Item key={option} onPress={() => { setRole(option); setRoleMenuVisible(false); }} title={option}/>))}
      </react_native_paper_1.Menu>
      {error ? <react_native_paper_1.Text style={{ color: theme.colors.error, marginBottom: 8 }}>{error}</react_native_paper_1.Text> : null}
      {success ? <react_native_paper_1.Text style={{ color: theme.colors.primary, marginBottom: 8 }}>Registration successful! Redirecting…</react_native_paper_1.Text> : null}
      <react_native_paper_1.Button mode="contained" style={styles.button} onPress={handleRegister} loading={loading} disabled={loading}>
        Register
      </react_native_paper_1.Button>
      <react_native_1.TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <react_native_paper_1.Text style={styles.link}>Already have an account? Login</react_native_paper_1.Text>
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
