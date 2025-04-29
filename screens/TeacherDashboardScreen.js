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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TeacherDashboardScreen;
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const react_native_paper_1 = require("react-native-paper");
const native_1 = require("@react-navigation/native");
const AuthContext_1 = require("../context/AuthContext");
const firestore_1 = require("firebase/firestore");
const vector_icons_1 = require("@expo/vector-icons");
const firebase_1 = __importDefault(require("../services/firebase"));
const db = (0, firestore_1.getFirestore)(firebase_1.default);
function TeacherDashboardScreen() {
    const { user, logout } = (0, AuthContext_1.useAuth)();
    // TODO: Replace 'any' with proper navigation type if available
    const navigation = (0, native_1.useNavigation)();
    const theme = (0, react_native_paper_1.useTheme)();
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [incidentCount, setIncidentCount] = (0, react_1.useState)(0);
    const [meritCount, setMeritCount] = (0, react_1.useState)(0);
    const [displayName, setDisplayName] = (0, react_1.useState)(null);
    const [dialogVisible, setDialogVisible] = (0, react_1.useState)(false);
    // Fetch teacher's display name from Firestore
    (0, react_1.useEffect)(() => {
        async function fetchDisplayName() {
            if (!user?.uid)
                return;
            try {
                const userDoc = await (0, firestore_1.getDoc)((0, firestore_1.doc)(db, 'users', user.uid));
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    setDisplayName(data.displayName || data.name || null);
                }
                else {
                    setDisplayName(null);
                }
            }
            catch {
                setDisplayName(null);
            }
        }
        fetchDisplayName();
    }, [user]);
    (0, react_1.useEffect)(() => {
        async function fetchStats() {
            setLoading(true);
            try {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const startOfDay = firestore_1.Timestamp.fromDate(today);
                const incidentsQuery = (0, firestore_1.query)((0, firestore_1.collection)(db, 'incidents'), (0, firestore_1.where)('teacherId', '==', user?.uid), (0, firestore_1.where)('createdAt', '>=', startOfDay));
                const incidentsSnap = await (0, firestore_1.getDocs)(incidentsQuery);
                setIncidentCount(incidentsSnap.size);
                const meritsQuery = (0, firestore_1.query)((0, firestore_1.collection)(db, 'merits'), (0, firestore_1.where)('teacherId', '==', user?.uid), (0, firestore_1.where)('createdAt', '>=', startOfDay));
                const meritsSnap = await (0, firestore_1.getDocs)(meritsQuery);
                setMeritCount(meritsSnap.size);
            }
            catch (e) {
                setIncidentCount(0);
                setMeritCount(0);
            }
            setLoading(false);
        }
        if (user?.uid)
            fetchStats();
    }, [user]);
    const handleDismiss = () => setDialogVisible(false);
    const handleLogout = () => {
        setDialogVisible(false);
        logout();
    };
    // TODO: Implement role-based routing in AppNavigator for admin/teacher separation
    return (<react_native_1.View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Custom Header */}
      <react_native_1.View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#d32f2f', height: 80, width: '100%', alignSelf: 'stretch', paddingHorizontal: 24, paddingTop: 16 }}>
        <react_native_paper_1.Text style={{ color: '#fff', fontSize: 26, fontWeight: 'bold' }}>Dashboard</react_native_paper_1.Text>
        <react_native_1.TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 28, paddingVertical: 6, paddingHorizontal: 18 }} onPress={() => setDialogVisible(true)}>
          <vector_icons_1.MaterialCommunityIcons name="logout" size={26} color="#d32f2f" style={{ marginRight: 8 }}/>
          <react_native_paper_1.Text style={{ color: '#d32f2f', fontWeight: 'bold', fontSize: 18 }}>Logout</react_native_paper_1.Text>
        </react_native_1.TouchableOpacity>
      </react_native_1.View>
      <react_native_1.View>
        <react_native_1.ScrollView contentContainerStyle={styles.container}>
          <react_native_paper_1.Text style={styles.welcome}>
            Welcome, {displayName || user?.email || 'Teacher'}
          </react_native_paper_1.Text>
          <react_native_1.View style={styles.statsRow}>
            <react_native_paper_1.Card style={styles.statCard}>
              <react_native_paper_1.Card.Title title="Incidents Today"/>
              <react_native_paper_1.Card.Content>
                {loading ? <react_native_paper_1.ActivityIndicator /> : <react_native_paper_1.Text style={styles.statNum}>{incidentCount}</react_native_paper_1.Text>}
              </react_native_paper_1.Card.Content>
            </react_native_paper_1.Card>
            <react_native_paper_1.Card style={styles.statCard}>
              <react_native_paper_1.Card.Title title="Merits Today"/>
              <react_native_paper_1.Card.Content>
                {loading ? <react_native_paper_1.ActivityIndicator /> : <react_native_paper_1.Text style={styles.statNum}>{meritCount}</react_native_paper_1.Text>}
              </react_native_paper_1.Card.Content>
            </react_native_paper_1.Card>
          </react_native_1.View>
          <react_native_1.View style={styles.actionsRow}>
            <react_native_paper_1.Button mode="contained" icon="plus" style={styles.actionBtn} onPress={() => navigation.navigate('IncidentFormScreen')}>
              Log Incident
            </react_native_paper_1.Button>
            <react_native_paper_1.Button mode="contained" icon="star" style={styles.actionBtn} onPress={() => navigation.navigate('MeritFormScreen')}>
              Log Merit
            </react_native_paper_1.Button>
          </react_native_1.View>
          <react_native_paper_1.Button mode="outlined" icon="history" style={[styles.actionBtn, { alignSelf: 'center', marginTop: 12, width: '80%' }]} onPress={() => navigation.navigate('RecentLogsScreen')}>
            View Recent Activity
          </react_native_paper_1.Button>
        </react_native_1.ScrollView>
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
    </react_native_1.View>);
}
const styles = react_native_1.StyleSheet.create({
    container: {
        padding: 24,
        backgroundColor: '#fafafa',
        flexGrow: 1,
        alignItems: 'stretch',
    },
    welcome: {
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 18,
        color: '#d32f2f',
        textAlign: 'center',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 18,
    },
    statCard: {
        flex: 1,
        marginHorizontal: 6,
    },
    statNum: {
        fontSize: 34,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginVertical: 8,
    },
    actionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 18,
    },
    actionBtn: {
        flex: 1,
        marginHorizontal: 6,
        marginVertical: 6,
    },
});
