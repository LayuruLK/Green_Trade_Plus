import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Switch,
    TouchableOpacity,
    ScrollView,
    Image,
    Alert,
    Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../hooks/useAuth'; // Ensure this path is correct
// REMOVE THIS LINE: import ReactNativeBiometrics from 'react-native-biometrics';
import * as LocalAuthentication from 'expo-local-authentication'; // Keep this for device-side biometric checks

// Green color palette for farming app
const COLORS = {
    primary: '#2E7D32',         // Deep green
    primaryLight: '#4CAF50',    // Medium green
    primaryDark: '#1B5E20',     // Dark green
    secondary: '#A5D6A7',       // Soft green
    accent: '#C8E6C9',          // Pale green for highlights
    background: '#F5F5F5',      // Light gray background
    surface: '#FFFFFF',         // White surface
    error: '#D32F2F',           // Red error
    warning: '#FFA000',         // Amber warning
    success: '#388E3C',         // Confirmation green
    text: '#212121',            // Almost black primary text
    textSecondary: '#616161',   // Medium gray for secondary text
    border: '#BDBDBD',          // Gray border
    disabled: '#E0E0E0'         // Light gray for disabled elements
};


const SettingsScreen = () => {
    // Destructure new functions from useAuth
    const { user, logout, updateBiometricPreference, enableBiometricAuth, disableBiometricAuth, checkBiometricSupport } = useAuth();

    // Settings states
    const [notifications, setNotifications] = useState(true);
    const [marketAlerts, setMarketAlerts] = useState(true);
    const [priceUpdates, setPriceUpdates] = useState(false);
    const [weatherAlerts, setWeatherAlerts] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [locationServices, setLocationServices] = useState(true);
    const [biometric, setBiometric] = useState(false); // You might want to fetch initial state from user object or local storage
    const [autoSync, setAutoSync] = useState(true);

    // Initial check for biometric state (e.g., from user profile if stored on backend)
    // useEffect(() => {
    //     // Fetch initial biometric state for the user from backend if available
    //     // For now, it defaults to false
    // }, []);


    // --- Modified handleBiometricToggle ---
    const handleBiometricToggle = async (value) => {
        try {
            // 1. Check biometric support
            const isSupported = await checkBiometricSupport();
            if (!isSupported) {
                Alert.alert('Biometrics Not Available', 'Your device does not support biometric authentication.');
                setBiometric(false);
                return;
            }

            // 2. Authenticate with device biometrics
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Authenticate to change biometric login setting',
                cancelLabel: 'Cancel',
            });

            if (result.success) {
                // 3. Update backend preference
                const backendSuccess = await updateBiometricPreference(value);

                if (backendSuccess) {
                    setBiometric(value);
                    Alert.alert('Success', `Biometric login ${value ? 'enabled' : 'disabled'}`);
                } else {
                    throw new Error('Failed to update server');
                }
            } else {
                throw new Error(result.error || 'Authentication failed');
            }
        } catch (error) {
            console.error('Biometric toggle error:', error);
            Alert.alert('Error', error.message || 'Failed to update biometric settings');
            setBiometric(!value); // Revert switch state
        }
    };
    // --- END Modified handleBiometricToggle ---


    // The original setupBiometricAuth and removeBiometricAuth functions are now unnecessary here.
    // Their logic is either integrated into `handleBiometricToggle` or moved to AuthContext.js
    // if they involve backend API calls.
    // The actual key generation/deletion (if using react-native-biometrics) would also move to AuthContext
    // or be handled by a different mechanism if sticking with expo-local-authentication.

    const handleLogout = async () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => await logout()
                }
            ]
        );
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            'Delete Account',
            'This action cannot be undone. All your data will be permanently deleted.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => console.log('Account deletion requested')
                }
            ]
        );
    };

    const openURL = (url) => {
        Linking.openURL(url).catch(err => console.error('Failed to open URL:', err));
    };

    const SettingItem = ({ icon, title, subtitle, onPress, rightComponent, showBorder = true }) => (
        <TouchableOpacity
            style={[styles.settingItem, !showBorder && styles.noBorder]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.settingLeft}>
                <View style={styles.iconContainer}>
                    <Ionicons name={icon} size={22} color={COLORS.primary} />
                </View>
                <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>{title}</Text>
                    {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
                </View>
            </View>
            {rightComponent || <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />}
        </TouchableOpacity>
    );

    const SectionHeader = ({ title }) => (
        <Text style={styles.sectionHeader}>{title}</Text>
    );

    if (!user) {
        return (
            <SafeAreaProvider>
                <SafeAreaView style={styles.container}>
                    <View style={styles.emptyState}>
                        <Ionicons name="person-outline" size={80} color={COLORS.disabled} />
                        <Text style={styles.emptyStateText}>Please login to access settings</Text>
                        <TouchableOpacity style={styles.loginButton}>
                            <Text style={styles.loginButtonText}>Login</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </SafeAreaProvider>
        );
    }

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Settings</Text>
                        <Text style={styles.headerSubtitle}>Manage your farming hub</Text>
                    </View>

                    {/* Profile Card */}
                    <View style={styles.profileCard}>
                        <View style={styles.profileInfo}>
                            <View style={styles.avatarContainer}>
                                <Image
                                    source={{ uri: user?.profilePhotoPath || 'https://via.placeholder.com/100' }}
                                    style={styles.avatar}
                                />
                                <View style={styles.onlineIndicator} />
                            </View>
                            <View style={styles.userInfo}>
                                <Text style={styles.userName}>{user?.userName || 'John Farmer'}</Text>
                                <Text style={styles.userEmail}>{user?.email || 'john@farmhub.com'}</Text>
                                <View style={styles.membershipBadge}>
                                    <Ionicons name="star" size={12} color={COLORS.warning} />
                                    <Text style={styles.membershipText}>Premium Member</Text>
                                </View>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.editProfileButton}>
                            <Ionicons name="pencil" size={16} color={COLORS.primary} />
                        </TouchableOpacity>
                    </View>

                    {/* Quick Stats */}
                    <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>24</Text>
                            <Text style={styles.statLabel}>Crops</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>156</Text>
                            <Text style={styles.statLabel}>Trades</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>4.8★</Text>
                            <Text style={styles.statLabel}>Rating</Text>
                        </View>
                    </View>

                    {/* Account Settings */}
                    <SectionHeader title="Account" />
                    <View style={styles.section}>
                        <SettingItem
                            icon="person-outline"
                            title="Edit Profile"
                            subtitle="Update your personal information"
                            onPress={() => console.log('Edit Profile')}
                        />
                        <SettingItem
                            icon="card-outline"
                            title="Payment Methods"
                            subtitle="Manage your payment options"
                            onPress={() => console.log('Payment Methods')}
                        />
                        <SettingItem
                            icon="location-outline"
                            title="Farm Location"
                            subtitle="Set your farm's location"
                            onPress={() => console.log('Farm Location')}
                        />
                        <SettingItem
                            icon="shield-checkmark-outline"
                            title="Verification"
                            subtitle="Verify your farmer status"
                            onPress={() => console.log('Verification')}
                            showBorder={false}
                        />
                    </View>

                    {/* Notifications */}
                    <SectionHeader title="Notifications" />
                    <View style={styles.section}>
                        <SettingItem
                            icon="notifications-outline"
                            title="Push Notifications"
                            subtitle="General app notifications"
                            rightComponent={
                                <Switch
                                    value={notifications}
                                    onValueChange={setNotifications}
                                    trackColor={{ false: COLORS.disabled, true: COLORS.accent }}
                                    thumbColor={notifications ? COLORS.primary : '#f4f3f4'}
                                />
                            }
                        />
                        <SettingItem
                            icon="trending-up-outline"
                            title="Market Alerts"
                            subtitle="Price changes and market trends"
                            rightComponent={
                                <Switch
                                    value={marketAlerts}
                                    onValueChange={setMarketAlerts}
                                    trackColor={{ false: COLORS.disabled, true: COLORS.accent }}
                                    thumbColor={marketAlerts ? COLORS.primary : '#f4f3f4'}
                                />
                            }
                        />
                        <SettingItem
                            icon="pricetag-outline"
                            title="Price Updates"
                            subtitle="Real-time crop price updates"
                            rightComponent={
                                <Switch
                                    value={priceUpdates}
                                    onValueChange={setPriceUpdates}
                                    trackColor={{ false: COLORS.disabled, true: COLORS.accent }}
                                    thumbColor={priceUpdates ? COLORS.primary : '#f4f3f4'}
                                />
                            }
                        />
                        <SettingItem
                            icon="rainy-outline"
                            title="Weather Alerts"
                            subtitle="Weather warnings and forecasts"
                            rightComponent={
                                <Switch
                                    value={weatherAlerts}
                                    onValueChange={setWeatherAlerts}
                                    trackColor={{ false: COLORS.disabled, true: COLORS.accent }}
                                    thumbColor={weatherAlerts ? COLORS.primary : '#f4f3f4'}
                                />
                            }
                            showBorder={false}
                        />
                    </View>

                    {/* Privacy & Security */}
                    <SectionHeader title="Privacy & Security" />
                    <View style={styles.section}>
                        <SettingItem
                            icon="lock-closed-outline"
                            title="Change Password"
                            subtitle="Update your account password"
                            onPress={() => console.log('Change Password')}
                        />
                        <SettingItem
                            icon="finger-print-outline"
                            title="Biometric Login"
                            subtitle="Use fingerprint or face ID"
                            rightComponent={
                                <Switch
                                    value={biometric}
                                    onValueChange={handleBiometricToggle}
                                    trackColor={{ false: COLORS.disabled, true: COLORS.accent }}
                                    thumbColor={biometric ? COLORS.primary : '#f4f3f4'}
                                />
                            }
                        />
                        <SettingItem
                            icon="eye-off-outline"
                            title="Privacy Settings"
                            subtitle="Control your data visibility"
                            onPress={() => console.log('Privacy Settings')}
                        />
                        <SettingItem
                            icon="shield-outline"
                            title="Two-Factor Authentication"
                            subtitle="Add extra security to your account"
                            onPress={() => console.log('2FA')}
                            showBorder={false}
                        />
                    </View>

                    {/* App Preferences */}
                    <SectionHeader title="App Preferences" />
                    <View style={styles.section}>
                        <SettingItem
                            icon="language-outline"
                            title="Language"
                            subtitle="English (US)"
                            onPress={() => console.log('Language')}
                        />
                        <SettingItem
                            icon="moon-outline"
                            title="Dark Mode"
                            subtitle="Switch to dark theme"
                            rightComponent={
                                <Switch
                                    value={darkMode}
                                    onValueChange={setDarkMode}
                                    trackColor={{ false: COLORS.disabled, true: COLORS.accent }}
                                    thumbColor={darkMode ? COLORS.primary : '#f4f3f4'}
                                />
                            }
                        />
                        <SettingItem
                            icon="locate-outline"
                            title="Location Services"
                            subtitle="Allow location access"
                            rightComponent={
                                <Switch
                                    value={locationServices}
                                    onValueChange={setLocationServices}
                                    trackColor={{ false: COLORS.disabled, true: COLORS.accent }}
                                    thumbColor={locationServices ? COLORS.primary : '#f4f3f4'}
                                />
                            }
                        />
                        <SettingItem
                            icon="sync-outline"
                            title="Auto Sync"
                            subtitle="Automatically sync your data"
                            rightComponent={
                                <Switch
                                    value={autoSync}
                                    onValueChange={setAutoSync}
                                    trackColor={{ false: COLORS.disabled, true: COLORS.accent }}
                                    thumbColor={autoSync ? COLORS.primary : '#f4f3f4'}
                                />
                            }
                            showBorder={false}
                        />
                    </View>

                    {/* Support */}
                    <SectionHeader title="Support" />
                    <View style={styles.section}>
                        <SettingItem
                            icon="help-circle-outline"
                            title="Help Center"
                            subtitle="Get help and support"
                            onPress={() => console.log('Help Center')}
                        />
                        <SettingItem
                            icon="chatbubble-outline"
                            title="Contact Us"
                            subtitle="Get in touch with support"
                            onPress={() => console.log('Contact Us')}
                        />
                        <SettingItem
                            icon="star-outline"
                            title="Rate App"
                            subtitle="Rate us on the app store"
                            onPress={() => console.log('Rate App')}
                        />
                        <SettingItem
                            icon="share-outline"
                            title="Share App"
                            subtitle="Tell your friends about us"
                            onPress={() => console.log('Share App')}
                            showBorder={false}
                        />
                    </View>

                    {/* Legal */}
                    <SectionHeader title="Legal" />
                    <View style={styles.section}>
                        <SettingItem
                            icon="document-text-outline"
                            title="Terms of Service"
                            onPress={() => openURL('https://example.com/terms')}
                        />
                        <SettingItem
                            icon="shield-outline"
                            title="Privacy Policy"
                            onPress={() => openURL('https://example.com/privacy')}
                        />
                        <SettingItem
                            icon="information-circle-outline"
                            title="About"
                            subtitle="Version 2.1.0"
                            onPress={() => console.log('About')}
                            showBorder={false}
                        />
                    </View>

                    {/* Danger Zone */}
                    <SectionHeader title="Account Actions" />
                    <View style={styles.section}>
                        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                            <Ionicons name="log-out-outline" size={20} color="white" />
                            <Text style={styles.logoutButtonText}>Logout</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
                            <Ionicons name="trash-outline" size={20} color="white" />
                            <Text style={styles.deleteButtonText}>Delete Account</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>FarmHub © 2024</Text>
                        <Text style={styles.footerSubtext}>Connecting farmers worldwide</Text>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </SafeAreaProvider>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        padding: 20,
        paddingBottom: 10,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 16,
        color: COLORS.textSecondary,
    },
    profileCard: {
        backgroundColor: COLORS.surface,
        margin: 20,
        marginTop: 10,
        borderRadius: 16,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    profileInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 16,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 3,
        borderColor: COLORS.accent,
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: COLORS.success,
        borderWidth: 2,
        borderColor: COLORS.surface,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 2,
    },
    userEmail: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: 6,
    },
    membershipBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.accent,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    membershipText: {
        fontSize: 12,
        color: COLORS.primary,
        fontWeight: '600',
        marginLeft: 4,
    },
    editProfileButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.accent,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: COLORS.surface,
        margin: 20,
        marginTop: 0,
        borderRadius: 16,
        padding: 20,
        justifyContent: 'space-around',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
        marginLeft: 20,
        marginTop: 24,
        marginBottom: 12,
    },
    section: {
        backgroundColor: COLORS.surface,
        marginHorizontal: 20,
        borderRadius: 16,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    noBorder: {
        borderBottomWidth: 0,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.accent,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    settingText: {
        flex: 1,
    },
    settingTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 2,
    },
    settingSubtitle: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    logoutButton: {
        backgroundColor: COLORS.primary,
        margin: 20,
        marginBottom: 10,
        padding: 16,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    logoutButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    deleteButton: {
        backgroundColor: COLORS.error,
        margin: 20,
        marginTop: 0,
        padding: 16,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: COLORS.error,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    deleteButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    footer: {
        alignItems: 'center',
        padding: 30,
        paddingTop: 20,
    },
    footerText: {
        fontSize: 14,
        color: COLORS.textSecondary,
        fontWeight: '600',
    },
    footerSubtext: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginTop: 4,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyStateText: {
        fontSize: 18,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginTop: 20,
        marginBottom: 30,
    },
    loginButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 40,
        paddingVertical: 12,
        borderRadius: 25,
    },
    loginButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default SettingsScreen;