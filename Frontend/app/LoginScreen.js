import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  useWindowDimensions,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import api from '../constants/api';
import { saveSession } from '../constants/authStore';
import { setLawyerProfileFromUser } from './(lawyer)/MockStore';
import { setCitizenProfileFromUser } from './(citizen)/MockStore';

const roleConfig = {
  citizen: {
    label: 'Citizen Portal',
    subLabel: 'Legal Empowerment for Citizens',
    color: '#FF9500',
    topGlow: 'rgba(255, 149, 0, 0.4)',
    canSignUp: true,
  },
  lawyer: {
    label: 'Lawyer Portal',
    subLabel: 'Advocate Legal Practice',
    color: '#FFB300',
    topGlow: 'rgba(255, 179, 0, 0.4)',
    canSignUp: true,
  },
  ngo: {
    label: 'NGO - National commission for human development (NCHD)',
    subLabel: 'Institutional Human Development Portal',
    color: '#FF7A29',
    topGlow: 'rgba(255, 122, 41, 0.4)',
    canSignUp: false,
  },
  media: {
    label: 'Media - KTN news',
    subLabel: 'Court Reporting & Broadcast Journalism',
    color: '#F59E0B',
    topGlow: 'rgba(245, 158, 11, 0.4)',
    canSignUp: false,
  },
  admin: {
    label: 'Admin Panel',
    subLabel: 'Sindh Bar Council Governance',
    color: '#EF4444',
    topGlow: 'rgba(239, 68, 68, 0.36)',
    canSignUp: false,
  },
};

const SINDH_DISTRICTS = [
  'Badin', 'Dadu', 'Ghotki', 'Hyderabad', 'Jacobabad',
  'Jamshoro', 'Karachi Central', 'Karachi East', 'Karachi South',
  'Karachi West', 'Kashmore', 'Khairpur', 'Korangi', 'Larkana',
  'Malir', 'Matiari', 'Mirpur Khas', 'Naushahro Feroze',
  'Qambar Shahdadkot', 'Sanghar', 'Shaheed Benazirabad',
  'Shikarpur', 'Sukkur', 'Tando Allahyar', 'Tando Muhammad Khan',
  'Tharparkar', 'Thatta', 'Umerkot',
];

// ── VALIDATION HELPERS ─────────────────────────────────────────────────────

const validateName = (val) => {
  if (!val) return 'Name is required';
  if (!/^[a-zA-Z\s]+$/.test(val)) return 'Name must contain letters only';
  if (val.trim().length < 3) return 'Name must be at least 3 characters';
  return null;
};

const validateCNIC = (val) => {
  const raw = val.replace(/-/g, '');
  if (!val) return 'CNIC is required';
  if (!/^\d{5}-\d{7}-\d{1}$/.test(val)) return 'Format must be: xxxxx-xxxxxxx-x';
  if (raw.length !== 13) return 'CNIC must be 13 digits';

  const prefix = parseInt(raw.substring(0, 2));
  if (prefix < 41 || prefix > 45) return 'Only Sindh CNICs are accepted';
  return null;
};

const validatePhone = (val) => {
  if (!val) return 'Phone number is required';
  if (!/^\d{11}$/.test(val)) return 'Phone number must be 11 digits';
  return null;
};

const validatePassword = (val) => {
  if (!val) return 'Password is required';
  if (val.length < 8) return 'Password must be at least 8 characters';
  if (!/[a-z]/.test(val)) return 'Must contain at least one lowercase letter';
  if (!/[0-9]/.test(val)) return 'Must contain at least one number';
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(val))
    return 'Must contain at least one special character';
  return null;
};

const validateEmail = (val) => {
  if (!val) return 'Email is required';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(val)) return 'Please enter a valid email address';
  return null;
};

const getPasswordStrength = (val) => {
  if (!val) return { label: '', color: '#555', width: '0%' };
  let score = 0;
  if (val.length >= 8) score++;
  if (/[a-z]/.test(val)) score++;
  if (/[0-9]/.test(val)) score++;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(val)) score++;
  if (score <= 2) return { label: 'Weak',   color: '#ef4444', width: '33%' };
  if (score <= 3) return { label: 'Fair',   color: '#f59e0b', width: '60%' };
  if (score <= 4) return { label: 'Good',   color: '#38bdf8', width: '80%' };
  return           { label: 'Strong', color: '#22c55e', width: '100%' };
};

const formatCNIC = (val) => {
  const digits = val.replace(/[^\d]/g, '');
  if (digits.length <= 5) return digits;
  if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12, 13)}`;
};

// ── REUSABLE SUB-COMPONENTS ────────────────────────────────────────────────

const PasswordInput = ({ label, value, onChangeText, color }) => {
  const [show, setShow] = useState(false);
  return (
    <>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.passwordRow}>
        <TextInput
          style={[styles.input, { flex: 1, borderBottomWidth: 0 }]}
          placeholder="Enter password"
          placeholderTextColor="rgba(255, 220, 180, 0.35)"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!show}
          autoCapitalize="none"
        />
        <TouchableOpacity onPress={() => setShow(!show)} style={styles.eyeBtn}>
          <Image
            source={show ? require('../assets/images/show.png') : require('../assets/images/hide.png')}
            style={{ width: 22, height: 22, tintColor: color || '#FFB800' }}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
      <View style={[styles.inputUnderline, { backgroundColor: color || 'rgba(255, 210, 140, 0.3)' }]} />
    </>
  );
};

const DistrictPicker = ({ value, onSelect, color }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <TouchableOpacity
        style={styles.dropdownBtn}
        onPress={() => setOpen(!open)}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.dropdownValue,
            !value && { color: 'rgba(255, 220, 180, 0.35)' },
          ]}
        >
          {value || 'Select Sindh District'}
        </Text>
        <Text style={styles.dropdownArrow}>{open ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      <View style={[styles.inputUnderline, { backgroundColor: 'rgba(255, 210, 140, 0.3)' }]} />
      {open && (
        <View style={styles.dropdownList}>
          <ScrollView
            nestedScrollEnabled
            style={{ maxHeight: 200 }}
            showsVerticalScrollIndicator
          >
            {SINDH_DISTRICTS.map((d) => (
              <TouchableOpacity
                key={d}
                style={[
                  styles.dropdownItem,
                  value === d && { backgroundColor: 'rgba(255, 152, 0, 0.18)' },
                ]}
                onPress={() => {
                  onSelect(d);
                  setOpen(false);
                }}
              >
                <Text
                  style={[
                    styles.dropdownItemText,
                    value === d && { color: '#FFB800', fontWeight: '700' },
                  ]}
                >
                  {d}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </>
  );
};

// ── MAIN COMPONENT ─────────────────────────────────────────────────────────

export default function LoginScreen() {
  const { role } = useLocalSearchParams();
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  const [selectedRole, setSelectedRole] = useState(role || 'citizen');
  const config = roleConfig[selectedRole] || roleConfig.citizen;

  const [activeTab,   setActiveTab]   = useState('login');
  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [retypePass,  setRetypePass]  = useState('');
  const [name,        setName]        = useState('');
  const [phone,       setPhone]       = useState('');
  const [district,    setDistrict]    = useState('');
  const [cnic,        setCnic]        = useState('');
  const [sbcNumber,   setSbcNumber]   = useState('');
  const [specialty,   setSpecialty]   = useState('');
  const [loading,     setLoading]     = useState(false);
  const [errors,      setErrors]      = useState({});
  const [rememberMe,  setRememberMe]  = useState(true);

  const strength = getPasswordStrength(password);
  const clearErrors = () => setErrors({});

  // ── AUTHENTICATED LOGIN ──
  const handleLogin = async () => {
    clearErrors();
    const currentRole = selectedRole || role || 'citizen';
    const newErrors = {};

    if (!email.trim()) newErrors.email = 'Email address is required.';
    if (!password) newErrors.password = 'Password is required.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      let endpoint = '';
      let targetRoute = '';

      if (currentRole === 'citizen') {
        endpoint = '/citizens/login';
        targetRoute = '/(citizen)/CitizenHome';
      } else if (currentRole === 'lawyer') {
        endpoint = '/lawyers/login';
        targetRoute = '/(lawyer)/LawyerHome';
      } else if (currentRole === 'admin') {
        endpoint = '/admin/login';
        targetRoute = '/(Admin)';
      } else if (currentRole === 'ngo') {
        endpoint = '/ngo/login';
        targetRoute = '/(ngo)/NGOHome';
      } else if (currentRole === 'media') {
        endpoint = '/ngo/login';
        targetRoute = '/(media)/MediaHome';
      }

      console.log(`[AUTH] Logging in to ${endpoint} with ${email.trim()}`);
      const response = await api.post(endpoint, {
        email: email.trim(),
        password: password,
      });

      console.log('[AUTH] Login response:', response.data);

      if (response.data && (response.data.token || response.data.success !== false)) {
        try {
          const userObj = response.data.lawyer || response.data.citizen || response.data.ngo || response.data.admin || response.data.user;
          saveSession({
            token: response.data.token,
            role: currentRole,
            user: userObj,
            id: userObj?.id,
          });
          if (currentRole === 'lawyer' && userObj) setLawyerProfileFromUser(userObj);
          if (currentRole === 'citizen' && userObj) setCitizenProfileFromUser(userObj);
        } catch (_) {}

        Alert.alert(
          'Login Successful',
          `Welcome back to ${config.label}!`,
          [
            {
              text: 'Continue',
              onPress: () => router.replace(targetRoute),
            },
          ]
        );
      }
    } catch (err) {
      console.error('[AUTH] Login error:', err.response?.data || err.message);
      const serverMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Unable to connect to server. Please check your credentials.';

      Alert.alert(
        'Login Status',
        `${serverMessage}\n\nProceed to portal in offline demo mode?`,
        [
          { text: 'Retry', style: 'cancel' },
          { text: 'Proceed', onPress: () => router.replace(targetRoute) }
        ]
      );
      setErrors((prev) => ({ ...prev, general: serverMessage }));
    } finally {
      setLoading(false);
    }
  };

  // ── AUTHENTICATED SIGNUP / REGISTER ──
  const handleSignup = async () => {
    clearErrors();
    const currentRole = selectedRole || role || 'citizen';
    const newErrors = {};

    if (!name.trim()) newErrors.name = 'Full Name is required.';
    if (!phone.trim()) newErrors.phone = 'Phone number is required.';
    if (!district.trim()) newErrors.district = 'District is required.';
    if (!email.trim()) newErrors.email = 'Email address is required.';
    if (!password) newErrors.password = 'Password is required.';
    if (password.length < 8) newErrors.password = 'Password must be at least 8 characters.';
    if (retypePass && password !== retypePass) newErrors.retypePass = 'Passwords do not match.';

    if (currentRole === 'lawyer') {
      if (!sbcNumber.trim()) newErrors.sbcNumber = 'SBC Bar License Number is required.';
      if (!cnic.trim()) newErrors.cnic = 'CNIC is required for lawyer verification.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      let endpoint = '';
      let targetRoute = '';
      let payload = {};

      if (currentRole === 'citizen') {
        endpoint = '/citizens/register';
        targetRoute = '/(citizen)/CitizenHome';
        payload = {
          fullName: name.trim(),
          phone: phone.trim(),
          district: district.trim(),
          email: email.trim(),
          password: password,
          confirmPassword: retypePass,
        };
      } else if (currentRole === 'lawyer') {
        endpoint = '/lawyers/register';
        targetRoute = '/(lawyer)/LawyerHome';
        payload = {
          name: name.trim(),
          phone: phone.trim(),
          cnic: cnic.trim(),
          district: district.trim(),
          sbcNumber: sbcNumber.trim(),
          specialty: specialty.trim() || 'General Law',
          email: email.trim(),
          password: password,
          confirmPassword: retypePass,
        };
      } else if (currentRole === 'ngo') {
        endpoint = '/ngo/register';
        targetRoute = '/(ngo)/NGOHome';
        payload = {
          fullName: name.trim(),
          phone: phone.trim(),
          cnic: cnic.trim() || null,
          district: district.trim(),
          email: email.trim(),
          password: password,
          confirmPassword: retypePass,
          organizationType: 'NGO',
        };
      } else if (currentRole === 'media') {
        endpoint = '/ngo/register';
        targetRoute = '/(media)/MediaHome';
        payload = {
          fullName: name.trim(),
          phone: phone.trim(),
          cnic: cnic.trim() || null,
          district: district.trim(),
          email: email.trim(),
          password: password,
          confirmPassword: retypePass,
          organizationType: 'Media',
        };
      }

      console.log(`[AUTH] Registering via ${endpoint}`, payload);
      const response = await api.post(endpoint, payload);
      console.log('[AUTH] Register response:', response.data);

      if (response.data && (response.data.token || response.data.success !== false)) {
        try {
          const userObj = response.data.lawyer || response.data.citizen || response.data.ngo || response.data.admin || response.data.user;
          saveSession({
            token: response.data.token,
            role: currentRole,
            user: userObj,
            id: userObj?.id,
          });
          if (currentRole === 'lawyer' && userObj) setLawyerProfileFromUser(userObj);
          if (currentRole === 'citizen' && userObj) setCitizenProfileFromUser(userObj);
        } catch (_) {}

        const successMsg = response.data.message || 'Registration successful! Welcome to Barq-e-Insaf.';
        Alert.alert('Registration Successful', successMsg, [
          {
            text: 'Proceed to Dashboard',
            onPress: () => router.replace(targetRoute),
          },
        ]);
      }
    } catch (err) {
      console.error('[AUTH] Registration error:', err.response?.data || err.message);
      let serverMessage = err.response?.data?.message || null;
      if (!serverMessage && Array.isArray(err.response?.data?.errors)) {
        serverMessage = err.response.data.errors
          .map((e) => (typeof e === 'string' ? e : e.message || e.code || ''))
          .filter(Boolean)
          .join(' ');
      }
      if (!serverMessage) {
        serverMessage = err.message || 'Registration failed. Please try again.';
      }

      Alert.alert(
        'Registration Status',
        `${serverMessage}\n\nProceed to portal in offline demo mode?`,
        [
          { text: 'Retry', style: 'cancel' },
          { text: 'Proceed', onPress: () => router.replace(targetRoute) },
        ]
      );
      setErrors((prev) => ({ ...prev, general: serverMessage }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.container}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

        {/* Deep Obsidian Background */}
        <LinearGradient
          colors={['#0C0502', '#060201', '#010101']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />

        {/* Ambient warm glow halos */}
        <View
          pointerEvents="none"
          style={[
            styles.ambientHalo,
            {
              top: -height * 0.05,
              left: -width * 0.15,
              width: width * 0.8,
              height: width * 0.8,
              backgroundColor: config.topGlow,
            },
          ]}
        />
        <View
          pointerEvents="none"
          style={[
            styles.ambientHalo,
            {
              bottom: height * 0.05,
              right: -width * 0.2,
              width: width * 0.85,
              height: width * 0.85,
              backgroundColor: 'rgba(234, 88, 12, 0.06)',
            },
          ]}
        />

        <SafeAreaView style={styles.safeArea}>
          {/* ── TOP SECTION ── */}
          <View style={styles.topSection}>
            {/* Simple '<' back button to RoleSelectScreen */}
            <TouchableOpacity
              style={styles.simpleBackBtn}
              onPress={() => router.replace('/RoleSelectScreen')}
              hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
              accessibilityLabel="Back to Role Selection"
            >
              <Image
                source={require('../assets/images/backarrow.png')}
                style={styles.backArrowImg}
                resizeMode="contain"
              />
            </TouchableOpacity>

            {/* Glowing Liquid Glass Brand Orb */}
            <View style={styles.logoOrbWrapper}>
              <View style={styles.logoCoronaGlow} pointerEvents="none" />
              <BlurView
                intensity={Platform.OS === 'ios' ? 40 : 65}
                tint="dark"
                style={styles.logoBlur}
              >
                <LinearGradient
                  colors={[
                    'rgba(255, 255, 255, 0.28)',
                    'rgba(255, 170, 50, 0.15)',
                    'rgba(20, 10, 4, 0.5)',
                  ]}
                  start={{ x: 0.2, y: 0 }}
                  end={{ x: 0.8, y: 1 }}
                  style={styles.logoGradient}
                >
                  <Svg width={30} height={30} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M13 2L4 14h6l-1 8 9-12h-6z"
                      stroke="#FFE8C5"
                      strokeWidth={1.5}
                      strokeLinejoin="round"
                    />
                  </Svg>
                </LinearGradient>
              </BlurView>
            </View>

            <Text style={styles.appName}>BARQ-E-INSAF</Text>
            <View style={styles.portalBadge}>
              <Text style={[styles.portalName, { color: config.color }]}>
                {config.label.toUpperCase()}
              </Text>
            </View>
            {config.subLabel ? (
              <Text style={styles.portalSubText}>{config.subLabel}</Text>
            ) : null}
          </View>

          {/* ── FORM CONTAINER (FROSTED GLASS CARD) ── */}
          <View style={styles.formCardContainer}>
            <BlurView
              intensity={Platform.OS === 'ios' ? 40 : 65}
              tint="dark"
              style={styles.cardBlur}
            >
              <LinearGradient
                colors={[
                  'rgba(255, 160, 40, 0.08)',
                  'rgba(255, 255, 255, 0.02)',
                  'rgba(16, 8, 3, 0.55)',
                ]}
                style={styles.cardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
              >
                <View style={styles.cardSheen} pointerEvents="none" />

                <ScrollView
                  contentContainerStyle={styles.formWrapper}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
                  {/* TABS - LOGIN / SIGNUP (Sign Up only shown if allowed for role) */}
                  {config.canSignUp ? (
                    <View style={styles.tabRow}>
                      <TouchableOpacity
                        style={[styles.tabBtn, activeTab === 'login' && styles.tabActive]}
                        onPress={() => {
                          setActiveTab('login');
                          clearErrors();
                        }}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.tabText,
                            activeTab === 'login' && styles.tabTextActive,
                          ]}
                        >
                          LOGIN
                        </Text>
                        {activeTab === 'login' && (
                          <View style={[styles.activeTabIndicator, { backgroundColor: config.color }]} />
                        )}
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.tabBtn, activeTab === 'signup' && styles.tabActive]}
                        onPress={() => {
                          setActiveTab('signup');
                          clearErrors();
                        }}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.tabText,
                            activeTab === 'signup' && styles.tabTextActive,
                          ]}
                        >
                          SIGN UP
                        </Text>
                        {activeTab === 'signup' && (
                          <View style={[styles.activeTabIndicator, { backgroundColor: config.color }]} />
                        )}
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.loginOnlyHeader}>
                      <Text style={[styles.loginOnlyTitle, { color: config.color }]}>
                        SECURE PORTAL LOGIN
                      </Text>
                      <Text style={styles.loginOnlySubtitle}>
                        Authorized credentials required
                      </Text>
                    </View>
                  )}

                  {/* ── SIGNUP FIELDS ── */}
                  {activeTab === 'signup' && selectedRole !== 'admin' && (
                    <>
                      {/* NAME */}
                      <Text style={styles.inputLabel}>Full Name</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="e.g. Ali Khan"
                        placeholderTextColor="rgba(255, 220, 180, 0.35)"
                        value={name}
                        onChangeText={(v) => {
                          if (/^[a-zA-Z\s]*$/.test(v)) setName(v);
                        }}
                      />
                      {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

                      {/* PHONE */}
                      <Text style={styles.inputLabel}>Phone Number</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="03001234567"
                        placeholderTextColor="rgba(255, 220, 180, 0.35)"
                        value={phone}
                        onChangeText={(v) => {
                          if (/^\d*$/.test(v) && v.length <= 11) setPhone(v);
                        }}
                        keyboardType="number-pad"
                        maxLength={11}
                      />
                      {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

                      {/* CNIC - For Lawyer & NGO only */}
                      {selectedRole !== 'citizen' && (
                        <>
                          <Text style={styles.inputLabel}>CNIC (Sindh Only)</Text>
                          <TextInput
                            style={styles.input}
                            placeholder="42101-1234567-1"
                            placeholderTextColor="rgba(255, 220, 180, 0.35)"
                            value={cnic}
                            onChangeText={(v) => {
                              const formatted = formatCNIC(v);
                              if (formatted.length <= 15) setCnic(formatted);
                            }}
                            keyboardType="number-pad"
                            maxLength={15}
                          />
                          {errors.cnic && <Text style={styles.errorText}>{errors.cnic}</Text>}
                        </>
                      )}

                      {/* DISTRICT */}
                      <Text style={styles.inputLabel}>District</Text>
                      <DistrictPicker
                        value={district}
                        onSelect={setDistrict}
                        color={config.color}
                      />
                      {errors.district && <Text style={styles.errorText}>{errors.district}</Text>}

                      {/* LAWYER FIELDS */}
                      {selectedRole === 'lawyer' && (
                        <>
                          <Text style={styles.inputLabel}>SBC Bar License Number</Text>
                          <TextInput
                            style={styles.input}
                            placeholder="SBC-4421"
                            placeholderTextColor="rgba(255, 220, 180, 0.35)"
                            value={sbcNumber}
                            onChangeText={setSbcNumber}
                          />
                          {errors.sbcNumber && (
                            <Text style={styles.errorText}>{errors.sbcNumber}</Text>
                          )}

                          <Text style={styles.inputLabel}>Legal Specialty</Text>
                          <TextInput
                            style={styles.input}
                            placeholder="Criminal / Property / Family"
                            placeholderTextColor="rgba(255, 220, 180, 0.35)"
                            value={specialty}
                            onChangeText={setSpecialty}
                          />
                          {errors.specialty && (
                            <Text style={styles.errorText}>{errors.specialty}</Text>
                          )}
                        </>
                      )}
                    </>
                  )}

                  {/* ── COMMON FIELDS ── */}
                  <Text style={styles.inputLabel}>Email Address</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="user@barqeinsaf.pk"
                    placeholderTextColor="rgba(255, 220, 180, 0.35)"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

                  {/* PASSWORD */}
                  <PasswordInput
                    label="Password"
                    value={password}
                    onChangeText={setPassword}
                    color={config.color}
                  />

                  {/* PASSWORD STRENGTH */}
                  {activeTab === 'signup' && password.length > 0 && selectedRole !== 'admin' && (
                    <View style={styles.strengthWrap}>
                      <View style={styles.strengthTrack}>
                        <View
                          style={[
                            styles.strengthFill,
                            {
                              width: strength.width,
                              backgroundColor: strength.color,
                            },
                          ]}
                        />
                      </View>
                      <Text style={[styles.strengthLabel, { color: strength.color }]}>
                        {strength.label}
                      </Text>
                    </View>
                  )}

                  {/* PASSWORD REQUIREMENTS */}
                  {activeTab === 'signup' && selectedRole !== 'admin' && (
                    <View style={styles.requirementsBox}>
                      <Text style={styles.requirementsTitle}>Password criteria:</Text>
                      {[
                        { label: 'At least 8 characters',        pass: password.length >= 8 },
                        { label: 'One lowercase letter (a-z)',    pass: /[a-z]/.test(password) },
                        { label: 'One number (0-9)',              pass: /[0-9]/.test(password) },
                        { label: 'One special symbol (!@#...)',   pass: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) },
                      ].map((req, i) => (
                        <Text
                          key={i}
                          style={[
                            styles.requirementItem,
                            { color: req.pass ? '#22c55e' : 'rgba(255, 230, 205, 0.45)' },
                          ]}
                        >
                          {req.pass ? '✓' : '○'} {req.label}
                        </Text>
                      ))}
                    </View>
                  )}

                  {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

                  {/* RETYPE PASSWORD */}
                  {activeTab === 'signup' && selectedRole !== 'admin' && (
                    <>
                      <PasswordInput
                        label="Confirm Password"
                        value={retypePass}
                        onChangeText={setRetypePass}
                        color={config.color}
                      />
                      {retypePass.length > 0 && (
                        <Text
                          style={{
                            fontSize: 11,
                            marginTop: 6,
                            fontWeight: '600',
                            color: password === retypePass ? '#22c55e' : '#ef4444',
                          }}
                        >
                          {password === retypePass ? '✓ Passwords match' : '✗ Passwords do not match'}
                        </Text>
                      )}
                      {errors.retypePass && (
                        <Text style={styles.errorText}>{errors.retypePass}</Text>
                      )}
                    </>
                  )}

                  {/* REMEMBER ME & FORGOT PASSWORD */}
                  {activeTab === 'login' && (
                    <View style={styles.rememberRow}>
                      <TouchableOpacity
                        style={styles.rememberCheckboxRow}
                        activeOpacity={0.8}
                        onPress={() => setRememberMe(!rememberMe)}
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: rememberMe }}
                      >
                        <View
                          style={[
                            styles.checkboxBox,
                            rememberMe && [
                              styles.checkboxBoxActive,
                              { borderColor: config.color, backgroundColor: config.color + '26' },
                            ],
                          ]}
                        >
                          {rememberMe && (
                            <Text style={[styles.checkIcon, { color: config.color }]}>✓</Text>
                          )}
                        </View>
                        <Text style={styles.rememberLabel}>Remember Me</Text>
                      </TouchableOpacity>

                      <TouchableOpacity activeOpacity={0.8}>
                        <Text style={[styles.forgotText, { color: config.color }]}>
                          Forgot password?
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* GENERAL ERROR BANNER */}
                  {errors.general && (
                    <View style={styles.generalErrorBox}>
                      <Text style={styles.generalErrorText}>{errors.general}</Text>
                    </View>
                  )}

                  {/* ── LIQUID GLASS SUBMIT BUTTON ── */}
                  <View style={styles.submitBtnWrapper}>
                    <TouchableOpacity
                      style={styles.submitTouch}
                      activeOpacity={0.82}
                      onPress={activeTab === 'login' ? handleLogin : handleSignup}
                      disabled={loading}
                      accessibilityRole="button"
                    >
                      <View style={styles.submitCoronaGlow} pointerEvents="none" />
                      <BlurView
                        intensity={Platform.OS === 'ios' ? 40 : 65}
                        tint="dark"
                        style={styles.submitBlur}
                        pointerEvents="none"
                      >
                        <LinearGradient
                          colors={[
                            'rgba(255, 255, 255, 0.25)',
                            'rgba(255, 170, 50, 0.14)',
                            'rgba(22, 11, 4, 0.55)',
                          ]}
                          start={{ x: 0.5, y: 0 }}
                          end={{ x: 0.5, y: 1 }}
                          style={styles.submitGradient}
                        >
                          <View style={styles.submitSheen} />
                          {loading ? (
                            <ActivityIndicator color="#FFEED6" />
                          ) : (
                            <Text style={styles.submitBtnText}>
                              {activeTab === 'login'
                                ? 'LOGIN'
                                : 'REGISTER'}
                            </Text>
                          )}
                        </LinearGradient>
                      </BlurView>
                    </TouchableOpacity>
                  </View>

                </ScrollView>
              </LinearGradient>
            </BlurView>
          </View>
        </SafeAreaView>
      </View>
    </KeyboardAvoidingView>
  );
}

// ── STYLES ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#060201',
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
  },
  ambientHalo: {
    position: 'absolute',
    borderRadius: 999,
  },

  // ── TOP SECTION ──
  topSection: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 16,
    position: 'relative',
    paddingHorizontal: 24,
  },
  simpleBackBtn: {
    position: 'absolute',
    top: 10,
    left: 20,
    zIndex: 20,
    padding: 8,
  },
  backArrowImg: {
    width: 24,
    height: 17,
  },
  portalSubText: {
    fontSize: 11.5,
    color: 'rgba(255, 230, 205, 0.65)',
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '500',
  },
  loginOnlyHeader: {
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 149, 0, 0.18)',
  },
  loginOnlyTitle: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  loginOnlySubtitle: {
    fontSize: 11,
    color: 'rgba(255, 230, 205, 0.55)',
    marginTop: 3,
  },
  logoOrbWrapper: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 8,
  },
  logoCoronaGlow: {
    position: 'absolute',
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(255, 130, 20, 0.25)',
    ...(Platform.OS === 'web' ? { filter: 'blur(16px)' } : {}),
  },
  logoBlur: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 1.4,
    borderColor: 'rgba(255, 225, 160, 0.65)',
  },
  logoGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(25, 12, 4, 0.45)',
  },
  appName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFF5E8',
    letterSpacing: 2.2,
    textTransform: 'uppercase',
  },
  portalBadge: {
    marginTop: 4,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 152, 0, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 170, 60, 0.28)',
  },
  portalName: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
  },

  // ── FORM CARD (FROSTED GLASS) ──
  formCardContainer: {
    flex: 1,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
    borderWidth: 1.2,
    borderBottomWidth: 0,
    borderColor: 'rgba(255, 210, 140, 0.24)',
    shadowColor: '#FF7A00',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 8,
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
  },
  cardBlur: {
    flex: 1,
  },
  cardGradient: {
    flex: 1,
    position: 'relative',
    backgroundColor: 'rgba(18, 9, 3, 0.52)',
  },
  cardSheen: {
    position: 'absolute',
    top: 1,
    left: '12%',
    right: '12%',
    height: 1.2,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    borderRadius: 1,
  },
  formWrapper: {
    padding: 26,
    paddingBottom: 48,
  },

  // ── ROLE TABS ──
  sectionHeaderLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(255, 210, 150, 0.7)',
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    marginBottom: 8,
  },
  roleGrid: {
    flexDirection: 'row',
    gap: 6,
  },
  roleTabItem: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 210, 140, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleTabText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: 'rgba(255, 225, 200, 0.65)',
  },

  // ── TABS ──
  tabRow: {
    flexDirection: 'row',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 210, 140, 0.14)',
  },
  tabBtn: {
    flex: 1,
    paddingBottom: 10,
    alignItems: 'center',
    position: 'relative',
  },
  tabActive: {},
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.8,
    color: 'rgba(255, 220, 185, 0.45)',
  },
  tabTextActive: {
    color: '#FFF5E8',
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: -1,
    height: 2.5,
    left: '20%',
    right: '20%',
    borderRadius: 2,
    shadowColor: '#FF7A00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
  },

  // ── INPUTS ──
  inputLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: 'rgba(255, 210, 150, 0.75)',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 4,
    marginTop: 14,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 210, 140, 0.2)',
    paddingVertical: 9,
    fontSize: 14,
    color: '#FFF5E8',
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputUnderline: {
    height: 1,
    marginTop: 0,
  },
  eyeBtn: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  rememberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
  },
  rememberCheckboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkboxBox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 210, 140, 0.35)',
    backgroundColor: 'rgba(20, 10, 4, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxBoxActive: {
    borderWidth: 1.4,
  },
  checkIcon: {
    fontSize: 11,
    fontWeight: '900',
    lineHeight: 12,
  },
  rememberLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 225, 195, 0.8)',
    letterSpacing: 0.3,
  },
  forgotText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // ── SUBMIT BUTTON (LIQUID GLASS) ──
  submitBtnWrapper: {
    marginTop: 26,
    width: '100%',
  },
  submitTouch: {
    width: '100%',
    borderRadius: 999,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#FF7A00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.65,
    shadowRadius: 18,
    elevation: 8,
  },
  submitCoronaGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 120, 20, 0.15)',
    ...(Platform.OS === 'web' ? { filter: 'blur(16px)' } : {}),
  },
  submitBlur: {
    width: '100%',
    borderRadius: 999,
    overflow: 'hidden',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 220, 160, 0.55)',
  },
  submitGradient: {
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: 'rgba(22, 11, 4, 0.45)',
  },
  submitSheen: {
    position: 'absolute',
    top: 1,
    left: '15%',
    right: '15%',
    height: 1.2,
    borderRadius: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  submitBtnText: {
    color: '#FFEED6',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  fastModeHint: {
    textAlign: 'center',
    fontSize: 10.5,
    color: 'rgba(255, 180, 70, 0.72)',
    marginTop: 12,
    fontWeight: '600',
    letterSpacing: 0.4,
  },

  generalErrorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.45)',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  generalErrorText: {
    color: '#fca5a5',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 17,
  },
  errorText: {
    fontSize: 10.5,
    color: '#ef4444',
    marginTop: 3,
    fontWeight: '600',
  },

  // ── PASSWORD HELPERS ──
  strengthWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  strengthTrack: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    width: 50,
  },
  requirementsBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 210, 140, 0.15)',
  },
  requirementsTitle: {
    fontSize: 10.5,
    fontWeight: '700',
    color: 'rgba(255, 210, 150, 0.8)',
    marginBottom: 4,
  },
  requirementItem: {
    fontSize: 10.5,
    fontWeight: '500',
    marginBottom: 2,
    lineHeight: 15,
  },

  // ── DISTRICT DROPDOWN ──
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 9,
  },
  dropdownValue: {
    fontSize: 14,
    color: '#FFF5E8',
    flex: 1,
  },
  dropdownArrow: {
    fontSize: 10,
    color: 'rgba(255, 210, 140, 0.6)',
  },
  dropdownList: {
    backgroundColor: '#160B05',
    borderWidth: 1,
    borderColor: 'rgba(255, 200, 120, 0.3)',
    borderRadius: 12,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 999,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 210, 140, 0.1)',
  },
  dropdownItemText: {
    fontSize: 13,
    color: '#FFF5E8',
    fontWeight: '500',
  },
});
