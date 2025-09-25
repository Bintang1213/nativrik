import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  SafeAreaView,
  Image,
} from 'react-native';

const {width, height} = Dimensions.get('window');

const WelcomeScreen = ({navigation}) => {
  const handleStart = () => {
    console.log('Mari Mulai pressed');
    // Navigate to Auth screen
    navigation.navigate('Auth');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#DC143C" />

      <View style={styles.mainContainer}>
        {/* Top Section - Crimson Background */}
        <View style={styles.topSection}>
          {/* Floating Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={require('./../assets/a.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          {/* Subtle Decorative Elements */}
          <View style={styles.decorations}>
            <View
              style={[
                styles.floatCircle,
                {top: 70, left: 25, width: 60, height: 60, opacity: 0.08},
              ]}
            />
            <View
              style={[
                styles.floatCircle,
                {top: 140, right: 35, width: 35, height: 35, opacity: 0.12},
              ]}
            />
            <View
              style={[
                styles.floatCircle,
                {bottom: 80, left: 45, width: 45, height: 45, opacity: 0.1},
              ]}
            />
            <View
              style={[
                styles.floatCircle,
                {top: 100, right: 80, width: 25, height: 25, opacity: 0.15},
              ]}
            />
          </View>
        </View>

        {/* Bottom Section - White Background */}
        <View style={styles.bottomSection}>
          {/* Welcome Content */}
          <View style={styles.contentArea}>
            <View style={styles.titleContainer}>
              <Text style={styles.mainTitle}>Jatuh Cinta</Text>
              <Text style={styles.mainTitle}>dengan Makanan!</Text>
            </View>

            <View style={styles.titleDivider} />

            <Text style={styles.subtitle}>
              Selamat datang di kedai kami yang hangat,{'\n'}
              dimana setiap pesanan adalah kelezatan{'\n'}
              yang memanjakan lidah Anda.
            </Text>
          </View>

          {/* CTA Button */}
          <View style={styles.actionArea}>
            <TouchableOpacity
              style={styles.ctaButton}
              activeOpacity={0.85}
              onPress={handleStart}>
              <Text style={styles.ctaText}>Mari Mulai</Text>
              <View style={styles.ctaIcon}>
                <Text style={styles.arrowIcon}>→</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#DC143C',
  },
  mainContainer: {
    flex: 1,
  },

  // Top Section - Crimson
  topSection: {
    flex: 0.58,
    backgroundColor: '#DC143C',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },

  // Enhanced Logo Design
  logoContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 35,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 18},
    shadowOpacity: 0.28,
    shadowRadius: 32,
    elevation: 22,
    marginBottom: 15,
  },
  logoImage: {
    width: 210,
    height: 200,
  },

  // Subtle Decorative Elements
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

  // Bottom Section - White
  bottomSection: {
    flex: 0.42,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 38,
    borderTopRightRadius: 38,
    marginTop: -22,
    paddingTop: 45,
    paddingHorizontal: 32,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -12},
    shadowOpacity: 0.12,
    shadowRadius: 22,
    elevation: 18,
  },

  // Enhanced Content Area
  contentArea: {
    alignItems: 'center',
    paddingTop: 8,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 25,
  },
  mainTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#1A1A1A',
    textAlign: 'center',
    lineHeight: 36,
    letterSpacing: 0.3,
  },
  titleDivider: {
    width: 75,
    height: 4,
    backgroundColor: '#DC143C',
    borderRadius: 2,
    marginVertical: 22,
  },
  subtitle: {
    fontSize: 16,
    color: '#555555',
    textAlign: 'center',
    lineHeight: 25,
    fontWeight: '500',
    letterSpacing: 0.2,
  },

  // Enhanced Action Area
  actionArea: {
    paddingBottom: 25,
  },
  ctaButton: {
    backgroundColor: '#DC143C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 35,
    borderRadius: 28,
    shadowColor: '#DC143C',
    shadowOffset: {width: 0, height: 12},
    shadowOpacity: 0.35,
    shadowRadius: 22,
    elevation: 18,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginRight: 12,
    letterSpacing: 0.5,
  },
  ctaIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 18,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowIcon: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default WelcomeScreen;
