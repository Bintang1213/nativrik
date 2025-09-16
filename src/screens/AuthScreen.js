import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';

// API Configuration
const API_BASE_URL = 'https://cedrick-unlunated-gwyn.ngrok-free.app';

const AuthScreen = ({navigation, setUserToken}) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setIsLoading(true);

      const response = await fetch(`${API_BASE_URL}/api/user/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        global.userToken = data.token;
        global.userData = data.user;

        if (setUserToken) {
          setUserToken(data.token);
        }

        navigation.navigate('Home');
      } else {
        Alert.alert('Login Gagal', data.message);
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert(
        'Error',
        'Terjadi kesalahan saat login. Periksa koneksi internet Anda.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  // API Call untuk Register
  const handleRegister = async () => {
    try {
      setIsLoading(true);

      const response = await fetch(`${API_BASE_URL}/api/user/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password: password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert(
          'Registrasi Berhasil',
          'Akun berhasil dibuat! Silakan login.',
          [{text: 'OK', onPress: () => setIsLoginMode(true)}],
        );
        clearForm();
      } else {
        Alert.alert('Registrasi Gagal', data.message);
      }
    } catch (error) {
      console.error('Register error:', error);
      Alert.alert(
        'Error',
        'Terjadi kesalahan saat registrasi. Periksa koneksi internet Anda.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuth = async () => {
    if (isLoginMode) {
      if (!email || !password) {
        Alert.alert('Error', 'Mohon isi email dan password');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        Alert.alert('Error', 'Format email tidak valid');
        return;
      }

      await handleLogin();
    } else {
      // Validasi Register
      if (!name || !email || !password || !confirmPassword) {
        Alert.alert('Error', 'Mohon lengkapi semua field');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        Alert.alert('Error', 'Format email tidak valid');
        return;
      }

      if (password !== confirmPassword) {
        Alert.alert('Error', 'Password tidak cocok');
        return;
      }

      if (password.length < 8) {
        Alert.alert('Error', 'Password minimal 8 karakter');
        return;
      }

      await handleRegister();
    }
  };

  const toggleAuthMode = () => {
    setIsLoginMode(!isLoginMode);
    clearForm();
  };

  const clearForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Lupa Password',
      'Fitur reset password akan segera hadir. Hubungi admin untuk sementara.',
      [{text: 'OK'}],
    );
  };

  const handleGoogleLogin = () => {
    Alert.alert(
      'Google Login',
      'Fitur login dengan Google akan segera hadir.',
      [{text: 'OK'}],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#DC143C" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}>
          {/* Header Section */}
          <View style={styles.headerSection}>
            <View style={styles.decorations}>
              <View
                style={[
                  styles.floatCircle,
                  {top: 50, left: 30, width: 60, height: 60},
                ]}
              />
              <View
                style={[
                  styles.floatCircle,
                  {top: 120, right: 40, width: 40, height: 40},
                ]}
              />
              <View
                style={[
                  styles.floatCircle,
                  {bottom: 40, left: 20, width: 35, height: 35},
                ]}
              />
            </View>

            <View style={styles.headerContent}>
              <Text style={styles.welcomeText}>
                {isLoginMode ? 'Selamat Datang' : 'Bergabung'}
              </Text>
              <Text style={styles.subtitle}>
                {isLoginMode ? 'Masuk ke akun Anda' : 'Buat akun baru Anda'}
              </Text>
            </View>

            {/* Toggle Buttons */}
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  isLoginMode && styles.toggleButtonActive,
                ]}
                onPress={() => isLoginMode || toggleAuthMode()}>
                <Text
                  style={[
                    styles.toggleText,
                    isLoginMode && styles.toggleTextActive,
                  ]}>
                  Masuk
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  !isLoginMode && styles.toggleButtonActive,
                ]}
                onPress={() => !isLoginMode || toggleAuthMode()}>
                <Text
                  style={[
                    styles.toggleText,
                    !isLoginMode && styles.toggleTextActive,
                  ]}>
                  Daftar
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            <View style={styles.formContainer}>
              {/* Register Only - Name Field */}
              {!isLoginMode && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Nama Lengkap</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Masukkan nama lengkap"
                    placeholderTextColor="#B0B0B0"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                  />
                </View>
              )}

              {/* Email Field */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Masukkan email Anda"
                  placeholderTextColor="#B0B0B0"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {/* Password Field */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Password</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder={
                    isLoginMode
                      ? 'Masukkan password'
                      : 'Password (min. 8 karakter)'
                  }
                  placeholderTextColor="#B0B0B0"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {/* Register Only - Confirm Password */}
              {!isLoginMode && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Konfirmasi Password</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Ulangi password Anda"
                    placeholderTextColor="#B0B0B0"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              )}

              {/* Login Only - Forgot Password */}
              {isLoginMode && (
                <TouchableOpacity
                  style={styles.forgotButton}
                  onPress={handleForgotPassword}>
                  <Text style={styles.forgotText}>Lupa Password?</Text>
                </TouchableOpacity>
              )}

              {/* Auth Button */}
              <TouchableOpacity
                style={[
                  styles.authButton,
                  isLoading && styles.authButtonDisabled,
                ]}
                activeOpacity={0.8}
                onPress={handleAuth}
                disabled={isLoading}>
                <Text style={styles.authButtonText}>
                  {isLoading
                    ? 'Memuat...'
                    : isLoginMode
                    ? 'Masuk'
                    : 'Daftar Sekarang'}
                </Text>
              </TouchableOpacity>

              {/* Divider - Only show for login */}
              {isLoginMode && (
                <>
                  <View style={styles.dividerContainer}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>atau</Text>
                    <View style={styles.dividerLine} />
                  </View>

                  {/* Social Login */}
                  <TouchableOpacity
                    style={styles.socialButton}
                    onPress={handleGoogleLogin}>
                    <Text style={styles.socialButtonText}>
                      🌐 Masuk dengan Google
                    </Text>
                  </TouchableOpacity>
                </>
              )}

              {/* Bottom Text */}
              <View style={styles.bottomContainer}>
                <Text style={styles.bottomText}>
                  {isLoginMode ? 'Belum punya akun? ' : 'Sudah punya akun? '}
                </Text>
                <TouchableOpacity onPress={toggleAuthMode}>
                  <Text style={styles.bottomLink}>
                    {isLoginMode ? 'Daftar Sekarang' : 'Masuk Disini'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#DC143C',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },

  // Header Section
  headerSection: {
    flex: 0.4,
    backgroundColor: '#DC143C',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    paddingBottom: 20,
  },
  decorations: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  floatCircle: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 50,
  },
  headerContent: {
    alignItems: 'center',
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    fontWeight: '500',
  },

  // Toggle Buttons
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 25,
    padding: 4,
    marginHorizontal: 40,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 20,
  },
  toggleButtonActive: {
    backgroundColor: '#FFFFFF',
  },
  toggleText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: '#DC143C',
  },

  // Form Section
  formSection: {
    flex: 0.6,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    marginTop: -20,
    paddingTop: 40,
    paddingHorizontal: 30,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -10},
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 15,
  },
  formContainer: {
    flex: 1,
  },

  // Input Styles
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#2D3436',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },

  // Forgot Password
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: 20,
    marginTop: 5,
  },
  forgotText: {
    color: '#DC143C',
    fontSize: 14,
    fontWeight: '600',
  },

  // Auth Button
  authButton: {
    backgroundColor: '#DC143C',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
    shadowColor: '#DC143C',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  authButtonDisabled: {
    opacity: 0.7,
  },
  authButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },

  // Divider
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E9ECEF',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#6C757D',
    fontSize: 14,
    fontWeight: '500',
  },

  // Social Button
  socialButton: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    marginBottom: 30,
  },
  socialButtonText: {
    color: '#2D3436',
    fontSize: 16,
    fontWeight: '600',
  },

  // Bottom Link
  bottomContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
  },
  bottomText: {
    color: '#6C757D',
    fontSize: 16,
  },
  bottomLink: {
    color: '#DC143C',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default AuthScreen;
