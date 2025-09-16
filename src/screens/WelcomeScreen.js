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

          {/* Decorative Elements */}
          <View style={styles.decorations}>
            <View
              style={[
                styles.floatCircle,
                {top: 80, left: 20, width: 50, height: 50},
              ]}
            />
            <View
              style={[
                styles.floatCircle,
                {top: 150, right: 30, width: 30, height: 30},
              ]}
            />
            <View
              style={[
                styles.floatCircle,
                {bottom: 100, left: 40, width: 40, height: 40},
              ]}
            />
          </View>
        </View>

        {/* Bottom Section - White Background */}
        <View style={styles.bottomSection}>
          {/* Welcome Content */}
          <View style={styles.contentArea}>
            <Text style={styles.mainTitle}>Jatuh Cinta</Text>
            <Text style={styles.mainTitle}>dengan Makanan!</Text>

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
              activeOpacity={0.8}
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
    flex: 0.55, // 55% of screen
    backgroundColor: '#DC143C',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },

  // Logo Design
  logoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 30,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 15},
    shadowOpacity: 0.25,
    shadowRadius: 30,
    elevation: 20,
    marginBottom: 20,
  },
  logoImage: {
    width: 220,
    height: 220,
  },

  // Decorative Elements
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
    flex: 0.45, // 45% of screen
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    marginTop: -20, // Slight overlap
    paddingTop: 40,
    paddingHorizontal: 30,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -10},
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 15,
  },

  // Content Area
  contentArea: {
    alignItems: 'center',
    paddingTop: 10,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#2D3436',
    textAlign: 'center',
    lineHeight: 38,
  },
  titleDivider: {
    width: 70,
    height: 4,
    backgroundColor: '#DC143C',
    borderRadius: 2,
    marginVertical: 25,
  },
  subtitle: {
    fontSize: 16,
    color: '#636E72',
    textAlign: 'center',
    lineHeight: 26,
    fontWeight: '500',
  },

  // Action Area
  actionArea: {
    paddingBottom: 20,
  },
  ctaButton: {
    backgroundColor: '#DC143C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 25,
    shadowColor: '#DC143C',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '700',
    marginRight: 10,
  },
  ctaIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 15,
    width: 30,
    height: 30,
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
