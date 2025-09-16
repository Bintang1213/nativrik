import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useIsFocused} from '@react-navigation/native';
import {useCart} from '../CartContext';

// API Configuration
const API_BASE_URL = 'https://cedrick-unlunated-gwyn.ngrok-free.app';
const {width} = Dimensions.get('window');

const CartScreen = ({navigation}) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subtotal, setSubtotal] = useState(0);
  const [orderMethod, setOrderMethod] = useState(null);
  const isFocused = useIsFocused();

  const {incrementCart, decrementCart, fetchAndSetCartCount} = useCart();

  const fetchCartDetails = async () => {
    try {
      setLoading(true);
      const token = global.userToken;
      if (!token) {
        setCartItems([]);
        setSubtotal(0);
        return;
      }

      const cartResponse = await fetch(`${API_BASE_URL}/api/cart/get`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const cartData = await cartResponse.json();

      if (cartData.success || cartData.succes) {
        const cartItemIds = Object.keys(cartData.cartData);
        if (cartItemIds.length === 0) {
          setCartItems([]);
          setSubtotal(0);
          return;
        }

        const foodResponse = await fetch(`${API_BASE_URL}/api/food/list`);
        const foodData = await foodResponse.json();

        if (foodData.success || foodData.succes) {
          const foodList = foodData.data;
          const combinedCartItems = [];
          let newSubtotal = 0;

          for (const itemId in cartData.cartData) {
            const quantity = cartData.cartData[itemId];
            if (quantity > 0) {
              const foodItem = foodList.find(item => item._id === itemId);
              if (foodItem) {
                combinedCartItems.push({
                  itemId: foodItem,
                  quantity: quantity,
                });
                newSubtotal += foodItem.price * quantity;
              }
            }
          }

          setCartItems(combinedCartItems);
          setSubtotal(newSubtotal);
        } else {
          Alert.alert('Error', 'Gagal mengambil daftar produk.');
        }
      } else {
        Alert.alert(
          'Error',
          cartData.message || 'Gagal mengambil data keranjang',
        );
      }
    } catch (error) {
      console.error('Fetch cart error:', error);
      Alert.alert('Error', 'Terjadi kesalahan saat mengambil data keranjang.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (itemId, quantityChange) => {
    const token = global.userToken;
    if (!token) {
      Alert.alert('Login Diperlukan', 'Silakan login untuk melanjutkan');
      return;
    }
    const endpoint = quantityChange > 0 ? 'add' : 'remove';

    try {
      const response = await fetch(`${API_BASE_URL}/api/cart/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({itemId, quantity: 1}),
      });

      const data = await response.json();
      if (data.success) {
        // Panggil increment/decrement dari hook
        if (quantityChange > 0) {
          incrementCart();
        } else {
          decrementCart();
        }
        fetchCartDetails(); // Muat ulang data detail keranjang di layar ini
      } else {
        Alert.alert('Gagal', data.message || 'Gagal mengubah jumlah item.');
      }
    } catch (error) {
      console.error('Update quantity error:', error);
      Alert.alert('Error', 'Terjadi kesalahan saat memperbarui keranjang.');
    }
  };

  const handleConfirm = () => {
    if (!orderMethod) {
      Alert.alert(
        'Peringatan',
        'Silakan pilih metode pemesanan terlebih dahulu.',
      );
      return;
    }

    const token = global.userToken;
    if (!token) {
      Alert.alert('Error', 'Silakan login terlebih dahulu.');
      navigation.navigate('Auth', {screen: 'Login'});
      return;
    }

    // Mengirim data cartItems dan subtotal ke layar 'Order'
    navigation.navigate('Order', {
      method: orderMethod,
      cartItems: cartItems,
      subtotal: subtotal,
    });
  };

  useEffect(() => {
    if (isFocused) {
      fetchAndSetCartCount();

      fetchCartDetails();
    }
  }, [isFocused]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#DC143C" />
        <Text style={styles.loadingText}>Memuat keranjang...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Keranjang Saya</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {cartItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="cart-outline" size={100} color="#ccc" />
            <Text style={styles.emptyText}>Keranjang Anda masih kosong.</Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => navigation.navigate('Menu')}>
              <Text style={styles.emptyButtonText}>Mulai Belanja</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.cartList}>
            {cartItems.map(item => (
              <View key={item.itemId._id} style={styles.cartItem}>
                <Image
                  source={{uri: `${API_BASE_URL}/images/${item.itemId.image}`}}
                  style={styles.itemImage}
                />
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName} numberOfLines={2}>
                    {item.itemId.name}
                  </Text>
                  <Text style={styles.itemPrice}>
                    Rp {item.itemId.price?.toLocaleString('id-ID') || '0'}
                  </Text>
                  <Text style={styles.itemSubtotal}>
                    Total: Rp{' '}
                    {(item.itemId.price * item.quantity)?.toLocaleString(
                      'id-ID',
                    ) || '0'}
                  </Text>
                </View>
                <View style={styles.quantityContainer}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => handleUpdateQuantity(item.itemId._id, -1)}>
                    <Icon name="remove" size={18} color="#fff" />
                  </TouchableOpacity>
                  <Text style={styles.quantityText}>{item.quantity}</Text>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => handleUpdateQuantity(item.itemId._id, 1)}>
                    <Icon name="add" size={18} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {cartItems.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.optionsContainer}>
            <Text style={styles.optionsTitle}>Pilih Metode Pemesanan</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={[
                  styles.radioItem,
                  orderMethod === 'Makan di Tempat' && styles.radioItemSelected,
                ]}
                onPress={() => setOrderMethod('Makan di Tempat')}>
                <Text
                  style={[
                    styles.radioText,
                    orderMethod === 'Makan di Tempat' &&
                      styles.radioTextSelected,
                  ]}>
                  Makan di Tempat
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.radioItem,
                  orderMethod === 'Bungkus' && styles.radioItemSelected,
                ]}
                onPress={() => setOrderMethod('Bungkus')}>
                <Text
                  style={[
                    styles.radioText,
                    orderMethod === 'Bungkus' && styles.radioTextSelected,
                  ]}>
                  Bungkus
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.radioItem,
                  orderMethod === 'Diantar' && styles.radioItemSelected,
                ]}
                onPress={() => setOrderMethod('Diantar')}>
                <Text
                  style={[
                    styles.radioText,
                    orderMethod === 'Diantar' && styles.radioTextSelected,
                  ]}>
                  Diantar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.priceSummary}>
            <Text style={styles.subtotalText}>Subtotal</Text>
            <Text style={styles.subtotalValue}>
              Rp {subtotal?.toLocaleString('id-ID') || '0'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.checkoutButton}
            onPress={handleConfirm}>
            <Text style={styles.checkoutButtonText}>Konfirmasi Pesanan</Text>
          </TouchableOpacity>
        </View>
      )}
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
    paddingBottom: 20,
    paddingHorizontal: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    color: '#636E72',
    marginTop: 20,
    fontWeight: '500',
  },
  emptyButton: {
    backgroundColor: '#DC143C',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 20,
  },
  emptyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cartList: {
    marginTop: 15,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
    marginRight: 15,
  },
  itemDetails: {
    flex: 1,
    marginRight: 10,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3436',
  },
  itemPrice: {
    fontSize: 14,
    color: '#636E72',
    marginTop: 4,
  },
  itemSubtotal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#DC143C',
    marginTop: 4,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    backgroundColor: '#DC143C',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    marginHorizontal: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3436',
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
  optionsContainer: {
    marginBottom: 20,
  },
  optionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  radioItem: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
  },
  radioItemSelected: {
    backgroundColor: '#DC143C',
    borderColor: '#DC143C',
  },
  radioText: {
    fontSize: 14,
    color: '#333',
  },
  radioTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  priceSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  subtotalText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3436',
  },
  subtotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#DC143C',
  },
  checkoutButton: {
    backgroundColor: '#DC143C',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CartScreen;
