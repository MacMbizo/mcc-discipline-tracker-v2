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
exports.default = HomeScreen;
const react_1 = __importStar(require("react"));
const react_native_paper_1 = require("react-native-paper");
const react_native_1 = require("react-native");
const vector_icons_1 = require("@expo/vector-icons");
const AuthContext_1 = require("../context/AuthContext");
function HomeScreen() {
    const theme = (0, react_native_paper_1.useTheme)();
    const { logout } = (0, AuthContext_1.useAuth)();
    const [dialogVisible, setDialogVisible] = (0, react_1.useState)(false);
    const handleDismiss = () => setDialogVisible(false);
    const handleLogout = () => {
        setDialogVisible(false);
        logout();
    };
    return (<react_native_paper_1.Surface style={[styles.surface, { backgroundColor: theme.colors.background, padding: 0 }]}> 
      <react_native_1.View style={{ flex: 1 }}>
        {/* Custom Header */}
        <react_native_1.View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#d32f2f', height: 80, width: '100%', alignSelf: 'stretch', paddingHorizontal: 24, paddingTop: 16 }}>
          <react_native_paper_1.Text style={{ color: '#fff', fontSize: 26, fontWeight: 'bold' }}>MCC Home</react_native_paper_1.Text>
          <react_native_1.TouchableOpacity style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#fff',
            borderRadius: 28,
            paddingVertical: 6,
            paddingHorizontal: 18,
            marginLeft: 12,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2,
        }} onPress={() => setDialogVisible(true)} activeOpacity={0.7} accessibilityLabel="Logout">
            <vector_icons_1.MaterialCommunityIcons name="logout" size={26} color="#d32f2f" style={{ marginRight: 8 }}/>
            <react_native_paper_1.Text style={{ color: '#d32f2f', fontWeight: 'bold', fontSize: 18 }}>Logout</react_native_paper_1.Text>
          </react_native_1.TouchableOpacity>
        </react_native_1.View>
        {/* Main Content */}
        <react_native_1.View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <react_native_paper_1.Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>Welcome to MCC!</react_native_paper_1.Text>
        </react_native_1.View>
        <react_native_paper_1.Portal>
          <react_native_paper_1.Dialog visible={dialogVisible} onDismiss={handleDismiss}>
            <react_native_paper_1.Dialog.Title>Logout</react_native_paper_1.Dialog.Title>
            <react_native_paper_1.Dialog.Content>
              <react_native_paper_1.Text>Are you sure you want to log out?</react_native_paper_1.Text>
            </react_native_paper_1.Dialog.Content>
            <react_native_paper_1.Dialog.Actions>
              <react_native_paper_1.Button onPress={handleDismiss}>Cancel</react_native_paper_1.Button>
              <react_native_paper_1.Button onPress={handleLogout}>Logout</react_native_paper_1.Button>
            </react_native_paper_1.Dialog.Actions>
          </react_native_paper_1.Dialog>
        </react_native_paper_1.Portal>
      </react_native_1.View>
    </react_native_paper_1.Surface>);
}
const styles = react_native_1.StyleSheet.create({
    surface: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
});
