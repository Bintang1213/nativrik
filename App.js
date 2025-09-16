import React from 'react';
import {SafeAreaView, StatusBar, StyleSheet, Alert} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {CartProvider} from './src/CartContext';

import WelcomeScreen from './src/screens/WelcomeScreen';
import AuthScreen from './src/screens/AuthScreen';
import HomeScreen from './src/screens/HomeScreen';
import MenuScreen from './src/screens/MenuScreen';
import CartScreen from './src/screens/CartScreen';
import OrderScreen from './src/screens/OrderScreen';
import OrderConfirmationScreen from './src/screens/OrderConfirmationScreen';
import ChatScreen from './src/screens/ChatScreen';

const Stack = createNativeStackNavigator();

function App() {
  return (
    <CartProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="#DC143C"
          translucent={false}
        />
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen
              name="Welcome"
              component={WelcomeScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="Auth"
              component={AuthScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{title: 'Halaman Utama', headerShown: false}}
            />
            <Stack.Screen
              name="Menu"
              component={MenuScreen}
              options={{title: 'Daftar Menu', headerShown: false}}
            />
            <Stack.Screen
              name="Cart"
              component={CartScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="Order"
              component={OrderScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="OrderConfirmation"
              component={OrderConfirmationScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="Chat"
              component={ChatScreen}
              options={{headerShown: false}}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaView>
    </CartProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
