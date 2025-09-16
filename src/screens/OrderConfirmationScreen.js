import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {useRoute} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

const OrderConfirmationScreen = ({navigation}) => {
  const route = useRoute();
  const {orderId} = route.params;

  const handleGoHome = () => {
    navigation.navigate('Home');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Icon name="checkmark-circle-outline" size={100} color="#2ECC71" />
        <Text style={styles.title}>Pesanan Berhasil Dibuat!</Text>
        <Text style={styles.message}>
          Terima kasih atas pesanan Anda. Kami sedang memprosesnya.
        </Text>
        <View style={styles.orderInfoContainer}>
          <Text style={styles.orderInfoLabel}>ID Pesanan:</Text>
          <Text style={styles.orderIdText}>{orderId}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleGoHome}>
        <Text style={styles.buttonText}>Kembali ke Beranda</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3436',
    marginTop: 20,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#636E72',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  orderInfoContainer: {
    backgroundColor: '#E8F6F3',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  orderInfoLabel: {
    fontSize: 14,
    color: '#34495E',
  },
  orderIdText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 5,
  },
  button: {
    backgroundColor: '#DC143C',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default OrderConfirmationScreen;
