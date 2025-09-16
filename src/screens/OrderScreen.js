import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
  Linking,
} from 'react-native';
import {WebView} from 'react-native-webview';
import {useRoute} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

const API_BASE_URL = 'https://cedrick-unlunated-gwyn.ngrok-free.app';

const OrderScreen = ({navigation}) => {
  const route = useRoute();
  const {method, cartItems, subtotal} = route.params;

  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [showWebView, setShowWebView] = useState(false);
  const [webViewUrl, setWebViewUrl] = useState('');
  const [currentOrderId, setCurrentOrderId] = useState(null);

  const serviceFee = subtotal * 0.1;
  const deliveryFee = method === 'Diantar' ? 10000 : 0;
  const total = subtotal + serviceFee + deliveryFee;

  const deepLinkSchemes = [
    'gojek://',
    'shopeepay://',
    'dana://',
    'linkaja://',
    'telkomsel_e-money://',
    'bca-mobile://',
    'mandiri-online://',
    'bri-mobile://',
    'bca-virtual-account://',
    'permatabank-va://',
    'cimb-niaga-va://',
  ];

  const onShouldStartLoadWithRequest = request => {
    const url = request.url;
    console.log('Intercepting URL:', url);

    const isDeepLink = deepLinkSchemes.some(scheme => url.startsWith(scheme));

    const isMidtransRedirect = url.includes(
      'app.sandbox.midtrans.com/snap/v4/redirection',
    );

    const isAppRedirect = url.startsWith('nativrik://');

    if (isDeepLink || isAppRedirect || isMidtransRedirect) {
      console.log('Handling redirect/deep-link:', url);
      Linking.openURL(url).catch(err => {
        console.error('Failed to open URL:', err);
        Alert.alert(
          'Gagal Membuka Aplikasi',
          'Aplikasi pembayaran tidak dapat dibuka. Pastikan Anda telah menginstalnya.',
        );
      });
      setShowWebView(false);
      setIsLoading(false);
      return false;
    }

    return true;
  };

  // Fungsi lama untuk memeriksa status pembayaran, tidak berubah
  const checkPaymentStatus = async orderId => {
    try {
      const userToken = global.userToken;
      const response = await fetch(`${API_BASE_URL}/api/order/${orderId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        return data.data.status;
      }
      return null;
    } catch (error) {
      console.error('Error checking payment status:', error);
      return null;
    }
  };

  const pollPaymentStatus = orderId => {
    console.log('Starting payment status polling for order:', orderId);

    const interval = setInterval(async () => {
      console.log('Checking payment status...');
      const status = await checkPaymentStatus(orderId);
      console.log('Current order status:', status);

      if (status === 'Pembayaran Berhasil') {
        console.log('Payment successful, navigating to confirmation');
        clearInterval(interval);
        setIsLoading(false);
        Alert.alert(
          'Sukses',
          'Pembayaran berhasil! Pesanan Anda telah dikonfirmasi.',
          [
            {
              text: 'OK',
              onPress: () =>
                navigation.navigate('OrderConfirmation', {orderId: orderId}),
            },
          ],
        );
      } else if (
        status === 'Pembayaran Dibatalkan' ||
        status === 'Challenged'
      ) {
        console.log('Payment failed or cancelled');
        clearInterval(interval);
        setIsLoading(false);
        Alert.alert(
          'Gagal',
          'Pembayaran dibatalkan atau ditolak. Silakan coba lagi.',
        );
      }
    }, 3000);

    setTimeout(() => {
      clearInterval(interval);
      setIsLoading(false);
      console.log('Payment polling timeout');
      Alert.alert(
        'Timeout',
        'Waktu pembayaran habis. Silakan periksa status pesanan Anda.',
      );
    }, 120000);
  };

  const handleCheckout = async () => {
    if (!name || !paymentMethod) {
      Alert.alert('Peringatan', 'Silakan lengkapi Nama dan Metode Pembayaran.');
      return;
    }
    if (method === 'Diantar' && (!phone || !address)) {
      Alert.alert('Peringatan', 'Silakan lengkapi Nomor Telepon dan Alamat.');
      return;
    }
    if (method === 'Makan di Tempat' && !tableNumber) {
      Alert.alert('Peringatan', 'Silakan lengkapi Nomor Meja.');
      return;
    }
    const requestBody = {
      name: name,
      method: method,
      items: cartItems.map(item => ({
        _id: item.itemId._id,
        name: item.itemId.name,
        quantity: item.quantity,
        price: item.itemId.price,
      })),
      subtotal: subtotal,
      serviceFee: serviceFee,
      deliveryFee: deliveryFee,
      totalAmount: total,
      payment: paymentMethod,
      note: note,
      ...(method === 'Makan di Tempat' && {
        tableNumber: tableNumber,
      }),
      ...(method === 'Diantar' && {
        phone: phone,
        address: address,
      }),
    };
    setIsLoading(true);
    try {
      const userToken = global.userToken;
      if (!userToken) {
        throw new Error('User not authenticated. Please log in.');
      }
      const response = await fetch(`${API_BASE_URL}/api/order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify(requestBody),
      });
      const data = await response.json();
      if (data.success) {
        console.log('Order created successfully:', data);
        if (paymentMethod === 'Non-Tunai') {
          if (data.redirect_url) {
            setIsLoading(false);
            setWebViewUrl(data.redirect_url);
            setCurrentOrderId(data.order._id);
            setShowWebView(true);
          } else {
            setIsLoading(false);
            Alert.alert(
              'Error',
              'Tidak dapat membuat link pembayaran. Silakan coba lagi atau pilih pembayaran tunai.',
            );
          }
        } else {
          setIsLoading(false);
          Alert.alert('Sukses', 'Pesanan Anda berhasil dibuat!', [
            {
              text: 'OK',
              onPress: () =>
                navigation.navigate('OrderConfirmation', {
                  orderId: data.order._id,
                }),
            },
          ]);
        }
      } else {
        setIsLoading(false);
        Alert.alert('Gagal', data.message || 'Gagal membuat pesanan.');
      }
    } catch (error) {
      setIsLoading(false);
      console.error('Checkout error:', error);
      Alert.alert(
        'Error',
        error.message || 'Terjadi kesalahan saat memproses pesanan.',
      );
    }
  };
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Konfirmasi Pesanan</Text>
        <View style={styles.headerRight} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.summaryCard}>
          <Text style={styles.cardTitle}>Metode Pesanan</Text>
          <Text style={styles.cardText}>{method}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.cardTitle}>Data Pelanggan</Text>
          <TextInput
            style={styles.input}
            placeholder="Nama Lengkap"
            value={name}
            onChangeText={setName}
          />
          {method === 'Diantar' ? (
            <>
              <TextInput
                style={styles.input}
                placeholder="Nomor Telepon"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
              <TextInput
                style={styles.input}
                placeholder="Alamat Pengiriman"
                value={address}
                onChangeText={setAddress}
                multiline
              />
            </>
          ) : (
            <TextInput
              style={styles.input}
              placeholder="Nomor Meja"
              value={tableNumber}
              onChangeText={setTableNumber}
              keyboardType="number-pad"
            />
          )}
          <TextInput
            style={[styles.input, styles.noteInput]}
            placeholder="Catatan untuk pesanan (Opsional)"
            value={note}
            onChangeText={setNote}
            multiline
          />
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.cardTitle}>Metode Pembayaran</Text>
          <View style={styles.paymentMethodContainer}>
            <TouchableOpacity
              style={[
                styles.paymentOption,
                paymentMethod === 'Tunai' && styles.paymentOptionSelected,
              ]}
              onPress={() => setPaymentMethod('Tunai')}>
              <Text
                style={[
                  styles.paymentOptionText,
                  paymentMethod === 'Tunai' && styles.paymentOptionTextSelected,
                ]}>
                Tunai
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.paymentOption,
                paymentMethod === 'Non-Tunai' && styles.paymentOptionSelected,
              ]}
              onPress={() => setPaymentMethod('Non-Tunai')}>
              <Text
                style={[
                  styles.paymentOptionText,
                  paymentMethod === 'Non-Tunai' &&
                    styles.paymentOptionTextSelected,
                ]}>
                Non Tunai
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.cardTitle}>Daftar Pesanan</Text>
          {cartItems.map(item => (
            <View key={item.itemId._id} style={styles.itemRow}>
              {/* UBAH: Mengganti URL gambar untuk menggunakan Ngrok */}
              <Image
                source={{uri: `${API_BASE_URL}/images/${item.itemId.image}`}}
                style={styles.itemImage}
              />
              <View style={styles.itemDetails}>
                <Text style={styles.itemName} numberOfLines={2}>
                  {item.itemId.name}
                </Text>
                <Text style={styles.itemQuantity}>Jumlah: {item.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>
                Rp {(item.itemId.price * item.quantity).toLocaleString('id-ID')}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <View style={styles.priceSummaryRow}>
          <Text style={styles.priceSummaryText}>Subtotal</Text>
          <Text style={styles.priceSummaryValue}>
            Rp {subtotal.toLocaleString('id-ID')}
          </Text>
        </View>
        <View style={styles.priceSummaryRow}>
          <Text style={styles.priceSummaryText}>Biaya Layanan (10%)</Text>
          <Text style={styles.priceSummaryValue}>
            Rp {serviceFee.toLocaleString('id-ID')}
          </Text>
        </View>
        {method === 'Diantar' && (
          <View style={styles.priceSummaryRow}>
            <Text style={styles.priceSummaryText}>Ongkos Kirim</Text>
            <Text style={styles.priceSummaryValue}>
              Rp {deliveryFee.toLocaleString('id-ID')}
            </Text>
          </View>
        )}
        <View style={styles.separator} />
        <View style={styles.priceSummaryRow}>
          <Text style={styles.totalText}>Total Akhir</Text>
          <Text style={styles.totalValue}>
            Rp {total.toLocaleString('id-ID')}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={handleCheckout}
          disabled={isLoading}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#fff" />
              <Text style={styles.loadingText}>
                {paymentMethod === 'Non-Tunai'
                  ? 'Menunggu pembayaran...'
                  : 'Memproses pesanan...'}
              </Text>
            </View>
          ) : (
            <Text style={styles.checkoutButtonText}>
              Konfirmasi & Lanjutkan Pembayaran
            </Text>
          )}
        </TouchableOpacity>
      </View>
      {/* WebView Modal untuk Midtrans Snap */}
      <Modal
        visible={showWebView}
        animationType="slide"
        onRequestClose={() => {
          Alert.alert(
            'Batalkan Pembayaran?',
            'Apakah Anda yakin ingin membatalkan proses pembayaran?',
            [
              {text: 'Tidak', style: 'cancel'},
              {
                text: 'Ya, Batalkan',
                onPress: () => {
                  setShowWebView(false);
                  setIsLoading(false);
                },
              },
            ],
          );
        }}>
        <View style={styles.webViewContainer}>
          <View style={styles.webViewHeader}>
            <TouchableOpacity
              onPress={() => {
                Alert.alert(
                  'Batalkan Pembayaran?',
                  'Apakah Anda yakin ingin membatalkan proses pembayaran?',
                  [
                    {text: 'Tidak', style: 'cancel'},
                    {
                      text: 'Ya, Batalkan',
                      onPress: () => {
                        setShowWebView(false);
                        setIsLoading(false);
                      },
                    },
                  ],
                );
              }}
              style={styles.closeButton}>
              <Icon name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.webViewHeaderTitle}>Pembayaran</Text>
            <View style={styles.headerRight} />
          </View>
          {isLoading && (
            <View style={styles.webViewLoading}>
              <ActivityIndicator size="large" color="#DC143C" />
              <Text style={styles.webViewLoadingText}>
                Memuat halaman pembayaran...
              </Text>
            </View>
          )}
          <WebView
            source={{uri: webViewUrl}}
            onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
            onLoadStart={() => setIsLoading(true)}
            onLoadEnd={() => setIsLoading(false)}
            style={styles.webView}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            scalesPageToFit={true}
          />
        </View>
      </Modal>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#DC143C',
    elevation: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  headerRight: {
    width: 24,
  },
  scrollContent: {
    padding: 15,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  noteInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  paymentMethodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  paymentOption: {
    backgroundColor: '#eee',
    padding: 15,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  paymentOptionSelected: {
    backgroundColor: '#DC143C',
  },
  paymentOptionText: {
    color: '#2D3436',
    fontWeight: 'bold',
  },
  paymentOptionTextSelected: {
    color: '#fff',
  },
  cardText: {
    fontSize: 16,
    color: '#636E72',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 10,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3436',
  },
  itemQuantity: {
    fontSize: 12,
    color: '#636E72',
    marginTop: 4,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#DC143C',
  },
  footer: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
  },
  priceSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceSummaryText: {
    fontSize: 16,
    color: '#636E72',
  },
  priceSummaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3436',
  },
  totalText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#DC143C',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#DC143C',
  },
  separator: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 10,
  },
  checkoutButton: {
    backgroundColor: '#DC143C',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  // WebView Styles
  webViewContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  webViewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#DC143C',
    elevation: 8,
  },
  webViewHeaderTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  closeButton: {
    padding: 5,
  },
  webView: {
    flex: 1,
  },
  webViewLoading: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1,
  },
  webViewLoadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#636E72',
  },
});
export default OrderScreen;
