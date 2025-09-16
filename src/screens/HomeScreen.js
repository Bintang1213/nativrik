import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  TextInput,
  ScrollView,
  Image,
  FlatList,
  Dimensions,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useCart} from '../CartContext';

const API_BASE_URL = 'https://cedrick-unlunated-gwyn.ngrok-free.app';

const promoBannerImage = require('./../assets/banner.png');

const menu_list = [
  {menu_name: 'All', menu_icon: 'grid-outline'},
  {menu_name: 'Paket Nasi Liwet', menu_icon: 'restaurant-outline'},
  {menu_name: 'Aneka Lauk', menu_icon: 'fish-outline'},
  {menu_name: 'Aneka Mie', menu_icon: 'fast-food-outline'},
  {menu_name: 'Paket Nasi Tutug', menu_icon: 'nutrition-outline'},
  {menu_name: 'Minuman', menu_icon: 'cafe-outline'},
];

const mockPromo = {
  title: 'Kedai Wartiyem',
  subtitle: 'Makanan Tradisional Terlezat',
  discount: 'Tengko Badog',
  image: promoBannerImage,
};

const HomeScreen = ({navigation}) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({
    name: global.userData?.name || 'User',
  });
  const [cartQuantities, setCartQuantities] = useState({});

  const {cartCount, incrementCart, decrementCart, fetchAndSetCartCount} =
    useCart();

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
        console.log('Failed to fetch menu items');
      }
    } catch (error) {
      console.error('Error fetching menu:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserCart = async () => {
    try {
      const token = global.userToken;
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/cart/get`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success || data.succes) {
        setCartQuantities(data.cartData);
      }
    } catch (error) {
      console.error('Failed to fetch user cart quantities:', error);
    }
  };

  useEffect(() => {
    fetchMenuItems();
    fetchUserCart();
    if (global.userData) {
      setUserData({
        name: global.userData.name || 'User',
      });
    }
  }, []);

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

  const handleLogout = () => {
    Alert.alert('Logout', 'Apakah Anda yakin ingin keluar?', [
      {text: 'Batal', style: 'cancel'},
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          global.userToken = null;
          global.userData = null;
          fetchAndSetCartCount();
          navigation.navigate('Welcome');
        },
      },
    ]);
  };

  // ✅ Fungsi baru untuk navigasi ke chat
  const handleChat = () => {
    if (!global.userToken || !global.userData) {
      Alert.alert(
        'Login Diperlukan',
        'Anda harus login terlebih dahulu untuk memulai chat.',
      );
      return;
    }

    navigation.navigate('Chat', {
      user: global.userData,
      token: global.userToken,
    });
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
      <View style={styles.menuImageContainer}>
        <Image
          source={{uri: `${API_BASE_URL}/images/${item.image}`}}
          style={styles.menuImage}
          resizeMode="cover"
        />
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingText}>⭐</Text>
        </View>
      </View>
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#DC143C" />
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerSubtitle}>Selamat Datang,</Text>
            <Text style={styles.greetingText}>{userData.name}</Text>
          </View>
          <TouchableOpacity style={styles.profileButton} onPress={handleLogout}>
            <Icon name="person-circle-outline" size={40} color="#fff" />
          </TouchableOpacity>
        </View>
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
      </View>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.promoBanner}>
          <Image
            source={mockPromo.image}
            style={styles.promoImage}
            resizeMode="cover"
          />
          <View style={styles.promoOverlay}>
            <View style={styles.promoBadge}>
              <Text style={styles.promoBadgeText}>{mockPromo.discount}</Text>
            </View>
            <Text style={styles.promoTitle}>{mockPromo.title}</Text>
            <Text style={styles.promoSubtitle}>{mockPromo.subtitle}</Text>
          </View>
        </TouchableOpacity>
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
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Menu Populer Kami</Text>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading menu...</Text>
            </View>
          ) : (
            <FlatList
              data={filteredItems}
              renderItem={renderMenuItem}
              keyExtractor={item =>
                item._id?.toString() || Math.random().toString()
              }
              numColumns={2}
              columnWrapperStyle={styles.menuRow}
              contentContainerStyle={styles.menuList}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="home" size={24} color="#DC143C" />
          <Text style={styles.navTextActive}>Beranda</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Menu')}>
          <Icon name="menu-outline" size={24} color="#636E72" />
          <Text style={styles.navText}>Menu</Text>
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
        {/* ✅ Tambah Tombol Chat */}
        <TouchableOpacity style={styles.navItem} onPress={handleChat}>
          <Icon name="chatbubbles-outline" size={24} color="#636E72" />
          <Text style={styles.navText}>Chat</Text>
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
    backgroundColor: '#DC143C',
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerSubtitle: {color: 'rgba(255,255,255,0.7)', fontSize: 14},
  greetingText: {color: '#fff', fontSize: 20, fontWeight: '700'},
  profileButton: {marginLeft: 10},
  searchSection: {flexDirection: 'row', alignItems: 'center'},
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 15,
    paddingHorizontal: 15,
    marginRight: 12,
  },
  searchInput: {flex: 1, paddingVertical: 12, fontSize: 16, color: '#2D3436'},
  filterButton: {
    backgroundColor: '#DC143C',
    borderRadius: 12,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {flex: 1, paddingTop: 20},
  promoBanner: {
    marginHorizontal: 20,
    marginBottom: 25,
    borderRadius: 20,
    overflow: 'hidden',
    height: 140,
  },
  promoImage: {width: '100%', height: '100%', backgroundColor: '#DC143C'},
  promoOverlay: {position: 'absolute', left: 20, top: 20, bottom: 20},
  promoBadge: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  promoBadgeText: {color: '#fff', fontSize: 12, fontWeight: '700'},
  promoTitle: {color: '#fff', fontSize: 24, fontWeight: '800', marginBottom: 4},
  promoSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: '500',
  },
  categoriesSection: {marginBottom: 25},
  categoriesList: {paddingHorizontal: 20},
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
  menuSection: {paddingHorizontal: 20, paddingBottom: 20},
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 15,
  },
  menuList: {paddingBottom: 20},
  menuRow: {justifyContent: 'space-between'},
  menuCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    width: Dimensions.get('window').width / 2 - 30,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  menuImageContainer: {position: 'relative'},
  menuImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  ratingContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  ratingText: {
    color: '#DC143C',
    fontSize: 12,
    fontWeight: '600',
  },
  menuContent: {padding: 12},
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
  menuPrice: {fontSize: 14, fontWeight: '700', color: '#DC143C'},
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
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  loadingText: {fontSize: 16, color: '#666'},
});

export default HomeScreen;
