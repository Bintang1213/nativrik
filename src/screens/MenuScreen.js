import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useCart} from '../CartContext';

const {width} = Dimensions.get('window');

const API_BASE_URL = 'https://cedrick-unlunated-gwyn.ngrok-free.app';

const menu_list = [
  {menu_name: 'All', menu_icon: 'grid-outline'},
  {menu_name: 'Paket Nasi Liwet', menu_icon: 'restaurant-outline'},
  {menu_name: 'Aneka Lauk', menu_icon: 'fish-outline'},
  {menu_name: 'Aneka Mie', menu_icon: 'fast-food-outline'},
  {menu_name: 'Paket Nasi Tutug', menu_icon: 'nutrition-outline'},
  {menu_name: 'Minuman', menu_icon: 'cafe-outline'},
];

const MenuScreen = ({navigation}) => {
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [cartQuantities, setCartQuantities] = useState({});

  const {cartCount, incrementCart, decrementCart} = useCart();

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const url = `${API_BASE_URL}/api/food/list`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.success || data.succes) {
        setMenuItems(data.data);
        setFilteredItems(data.data);
      } else {
        console.log('Gagal mengambil data menu.');
      }
    } catch (error) {
      console.error('Error fetching menu:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = useCallback(
    category => {
      setSelectedCategory(category);
      const searchFiltered = menuItems.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      if (category === 'All') {
        setFilteredItems(searchFiltered);
      } else {
        const filteredByCategory = searchFiltered.filter(
          item => item.category === category,
        );
        setFilteredItems(filteredByCategory);
      }
    },
    [menuItems, searchQuery],
  );

  useEffect(() => {
    handleCategorySelect(selectedCategory);
  }, [handleCategorySelect, selectedCategory, searchQuery]);

  const handleAddToCart = async item => {
    try {
      const token = global.userToken;
      if (!token) {
        Alert.alert(
          'Login Diperlukan',
          'Silakan login untuk menambah item ke keranjang',
        );
        return;
      }
      const response = await fetch(`${API_BASE_URL}/api/cart/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          itemId: item._id,
          quantity: 1,
        }),
      });
      const data = await response.json();
      if (data.success || data.succes) {
        incrementCart();
        setCartQuantities(prev => ({
          ...prev,
          [item._id]: (prev[item._id] || 0) + 1,
        }));
        Alert.alert(
          'Ditambahkan ke Keranjang',
          `${item.name} berhasil ditambahkan ke keranjang`,
        );
      } else {
        Alert.alert('Error', data.message || 'Gagal menambahkan ke keranjang');
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      Alert.alert('Error', 'Terjadi kesalahan saat menambahkan ke keranjang');
    }
  };

  const handleDecreaseFromCart = async item => {
    const currentQuantity = cartQuantities[item._id] || 0;
    if (currentQuantity <= 0) {
      return;
    }
    try {
      const token = global.userToken;
      if (!token) {
        Alert.alert(
          'Login Diperlukan',
          'Silakan login untuk mengurangi item dari keranjang',
        );
        return;
      }
      const response = await fetch(`${API_BASE_URL}/api/cart/remove`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          itemId: item._id,
          quantity: 1,
        }),
      });
      const data = await response.json();
      if (data.success || data.succes) {
        decrementCart();
        setCartQuantities(prev => ({
          ...prev,
          [item._id]: prev[item._id] - 1,
        }));
        Alert.alert(
          'Dihapus dari Keranjang',
          `${item.name} berhasil dikurangi dari keranjang`,
        );
      } else {
        Alert.alert('Error', data.message || 'Gagal mengurangi dari keranjang');
      }
    } catch (error) {
      console.error('Decrease from cart error:', error);
      Alert.alert('Error', 'Terjadi kesalahan saat mengurangi dari keranjang');
    }
  };

  const renderCategoryItem = ({item}) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory === item.menu_name && styles.categoryButtonActive,
      ]}
      onPress={() => handleCategorySelect(item.menu_name)}>
      <Icon
        name={item.menu_icon}
        size={24}
        color={selectedCategory === item.menu_name ? '#fff' : '#DC143C'}
      />
      <Text
        style={[
          styles.categoryText,
          selectedCategory === item.menu_name && styles.categoryTextActive,
        ]}>
        {item.menu_name}
      </Text>
    </TouchableOpacity>
  );

  const renderMenuItem = ({item}) => (
    <View style={styles.menuCard}>
      {/* */}
      <Image
        source={{uri: `${API_BASE_URL}/images/${item.image}`}}
        style={styles.menuImage}
        resizeMode="cover"
      />
      <View style={styles.menuContent}>
        <Text style={styles.menuName}>{item.name}</Text>
        <Text style={styles.menuDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.menuFooter}>
          <Text style={styles.menuPrice}>
            Rp {item.price?.toLocaleString('id-ID') || '0'}
          </Text>
          <View style={styles.actionButtons}>
            {cartQuantities[item._id] > 0 && (
              <>
                <TouchableOpacity
                  style={styles.decreaseButton}
                  onPress={() => handleDecreaseFromCart(item)}>
                  <Icon name="remove" size={20} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.quantityText}>
                  {cartQuantities[item._id]}
                </Text>
              </>
            )}
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => handleAddToCart(item)}>
              <Icon name="add" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#DC143C" />
        <Text style={styles.loadingText}>Memuat menu...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#DC143C" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Daftar Menu</Text>
        <TouchableOpacity
          style={styles.cartBadge}
          onPress={() => navigation.navigate('Cart')}>
          <Icon name="cart-outline" size={24} color="#fff" />
          {cartCount > 0 && (
            <View style={styles.cartCounter}>
              <Text style={styles.cartCountText}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Icon name="search-outline" size={20} color="#999" />
            <TextInput
              style={styles.searchInput}
              placeholder="Cari menu favorit..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => Alert.alert('Filter', 'Fitur filter segera hadir!')}>
            <Icon name="options-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.categoriesSection}>
          <FlatList
            data={menu_list}
            renderItem={renderCategoryItem}
            keyExtractor={(item, index) => index.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        </View>
        <FlatList
          data={filteredItems}
          renderItem={renderMenuItem}
          keyExtractor={item =>
            item._id?.toString() || Math.random().toString()
          }
          numColumns={2}
          columnWrapperStyle={styles.menuRow}
          contentContainerStyle={styles.menuList}
        />
      </View>
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Home')}>
          <Icon name="home-outline" size={24} color="#636E72" />
          <Text style={styles.navText}>Beranda</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="menu" size={24} color="#DC143C" />
          <Text style={styles.navTextActive}>Menu</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Cart')}>
          <View style={styles.cartBadge}>
            <Icon name="cart-outline" size={24} color="#636E72" />
            {cartCount > 0 && (
              <View style={styles.cartCounter}>
                <Text style={styles.cartCountText}>{cartCount}</Text>
              </View>
            )}
          </View>
          <Text style={styles.navText}>Keranjang</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="receipt-outline" size={24} color="#636E72" />
          <Text style={styles.navText}>Riwayat</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
  content: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 10,
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 15,
    paddingHorizontal: 15,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  searchInput: {flex: 1, paddingVertical: 12, fontSize: 16, color: '#2D3436'},
  filterButton: {
    backgroundColor: '#DC143C',
    borderRadius: 12,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  categoriesSection: {marginBottom: 25},
  categoriesList: {paddingHorizontal: 10},
  categoryButton: {
    alignItems: 'center',
    marginRight: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#fff',
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  categoryButtonActive: {backgroundColor: '#DC143C'},
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  categoryTextActive: {color: '#fff'},
  menuList: {
    paddingBottom: 20,
  },
  menuRow: {
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  menuCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    width: width / 2 - 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  menuImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  menuContent: {
    padding: 12,
  },
  menuName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 11,
    color: '#636E72',
    marginBottom: 12,
    lineHeight: 16,
  },
  menuFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#DC143C',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  decreaseButton: {
    backgroundColor: '#DC143C',
    borderRadius: 12,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    marginHorizontal: 8,
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3436',
  },
  addButton: {
    backgroundColor: '#DC143C',
    borderRadius: 12,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
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
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
    elevation: 8,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  navItem: {flex: 1, alignItems: 'center', paddingVertical: 4},
  navText: {fontSize: 11, color: '#636E72', fontWeight: '500'},
  navTextActive: {fontSize: 11, color: '#DC143C', fontWeight: '600'},
  cartBadge: {position: 'relative'},
  cartCounter: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartCountText: {color: '#fff', fontSize: 10, fontWeight: '700'},
});

export default MenuScreen;
