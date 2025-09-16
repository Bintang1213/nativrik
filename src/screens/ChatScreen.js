import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  StatusBar,
  Dimensions,
  Animated,
} from 'react-native';
import {io} from 'socket.io-client';
import {useRoute, useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';

const {width} = Dimensions.get('window');
const API_BASE_URL = 'https://cedrick-unlunated-gwyn.ngrok-free.app';
const SOCKET_URL = API_BASE_URL;

const ChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [isOnline, setIsOnline] = useState(false);

  const socketRef = useRef(null);
  const route = useRoute();
  const navigation = useNavigation();
  const typingAnimValue = useRef(new Animated.Value(0)).current;

  const {user, token} = route.params;

  useEffect(() => {
    if (isTyping) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(typingAnimValue, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(typingAnimValue, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      typingAnimValue.stopAnimation();
      typingAnimValue.setValue(0);
    }
  }, [isTyping, typingAnimValue]);

  useEffect(() => {
    if (!user || !token) {
      Alert.alert('Error', 'Informasi pengguna tidak lengkap.');
      navigation.goBack();
      return;
    }

    const initializeChat = async () => {
      setIsLoading(true);
      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/chat/user/initialize`,
          {userName: user.name},
          {headers: {Authorization: `Bearer ${token}`}},
        );
        if (response.data.success) {
          return response.data.conversationId;
        } else {
          Alert.alert(
            'Error',
            response.data.message || 'Gagal menginisialisasi chat.',
          );
          return null;
        }
      } catch (error) {
        console.error('Error initializing chat:', error);
        setIsOnline(false);
        Alert.alert(
          'Error',
          'Gagal terhubung ke server untuk inisialisasi chat.',
        );
        return null;
      }
    };

    const fetchChatHistory = async convoId => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/chat/user/history`,
          {
            headers: {Authorization: `Bearer ${token}`},
            params: {conversationId: convoId},
          },
        );
        if (response.data.success) {
          setMessages(response.data.data.reverse());
        } else if (!response.data.message.includes('tidak ditemukan')) {
          Alert.alert(
            'Error',
            response.data.message || 'Gagal mengambil riwayat chat.',
          );
        }
      } catch (error) {
        console.error('Error fetching chat history:', error);
        Alert.alert(
          'Error',
          'Gagal terhubung ke server untuk mengambil riwayat chat.',
        );
      } finally {
        setIsLoading(false);
      }
    };

    const setupChat = async () => {
      const newConversationId = await initializeChat();
      if (!newConversationId) return;

      setConversationId(newConversationId);
      await fetchChatHistory(newConversationId);

      if (socketRef.current) {
        socketRef.current.disconnect();
      }

      const newSocket = io(SOCKET_URL, {
        auth: {token},
        transports: ['websocket'],
      });
      socketRef.current = newSocket;

      newSocket.on('connect', () => {
        setIsOnline(true);
        newSocket.emit('join_chat', newConversationId);
      });

      newSocket.on('disconnect', () => {
        setIsOnline(false);
      });

      newSocket.on('receive_message', message => {
        setMessages(prevMessages => [message, ...prevMessages]);
      });

      newSocket.on('user_typing', ({isTyping: typingStatus}) => {
        setIsTyping(typingStatus);
      });

      newSocket.on('error_message', error => {
        Alert.alert(
          'Socket Error',
          error || 'Terjadi kesalahan pada koneksi chat.',
        );
      });

      newSocket.on('connect_error', err => {
        setIsOnline(false);
        Alert.alert(
          'Koneksi Gagal',
          'Tidak dapat terhubung ke server chat. ' + err.message,
        );
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    };
    setupChat();
  }, [user, token, navigation]);

  const handleSendMessage = () => {
    if (inputMessage.trim() && socketRef.current && conversationId) {
      const messageData = {
        conversationId,
        message: inputMessage.trim(),
        senderName: user.name || 'User',
      };
      socketRef.current.emit('send_message', messageData);
      setInputMessage('');
    }
  };

  const handleTyping = useCallback(
    text => {
      setInputMessage(text);
      if (socketRef.current && conversationId) {
        if (text.trim()) {
          socketRef.current.emit('typing_start', {conversationId});
        } else {
          socketRef.current.emit('typing_stop', {conversationId});
        }
      }
    },
    [conversationId],
  );

  const renderMessage = ({item}) => {
    const isUser = item.senderType === 'User';
    const senderName = isUser ? 'Anda' : 'Admin'; // Menggunakan 'Anda' atau 'Admin'
    return (
      <View
        style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.adminMessageContainer,
        ]}>
        {!isUser && (
          <View style={styles.adminAvatar}>
            <Icon name="person" size={16} color="#fff" />
          </View>
        )}
        <Animated.View
          style={[
            styles.messageBubble,
            isUser ? styles.userBubble : styles.adminBubble,
            isUser ? styles.userBubbleBorder : styles.adminBubbleBorder,
          ]}>
          <Text
            style={[
              styles.senderName,
              isUser ? styles.userSenderName : styles.adminSenderName,
            ]}>
            {senderName}
          </Text>
          <Text
            style={[
              styles.messageText,
              isUser ? styles.userText : styles.adminText,
            ]}>
            {item.message}
          </Text>
          <Text
            style={[
              styles.messageTime,
              isUser ? styles.userTime : styles.adminTime,
            ]}>
            {new Date(item.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </Animated.View>
      </View>
    );
  };

  const renderTypingIndicator = () => {
    if (!isTyping) return null;
    return (
      <View style={styles.typingContainer}>
        <View style={styles.adminAvatar}>
          <Icon name="person" size={16} color="#fff" />
        </View>
        <View style={styles.typingBubble}>
          <Animated.View
            style={[styles.typingDot, {opacity: typingAnimValue}]}
          />
          <Animated.View
            style={[
              styles.typingDot,
              {
                opacity: typingAnimValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.5, 1],
                }),
              },
            ]}
          />
          <Animated.View
            style={[
              styles.typingDot,
              {
                opacity: typingAnimValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.2, 1],
                }),
              },
            ]}
          />
        </View>
      </View>
    );
  };

  if (isLoading || !conversationId) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <StatusBar backgroundColor="#B20E2C" barStyle="light-content" />
        <ActivityIndicator size="large" color="#DC143C" />
        <Text style={styles.loadingText}>Memuat chat...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#B20E2C" barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Admin Support</Text>
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusDot,
                {backgroundColor: isOnline ? '#4CAF50' : '#F44336'},
              ]}
            />
            <Text style={styles.statusText}>
              {isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>
        </View>
        <View style={{width: 44}} />
      </View>
      <View style={styles.messagesContainer}>
        <FlatList
          data={messages}
          keyExtractor={item => item._id || item.timestamp + Math.random()}
          renderItem={renderMessage}
          inverted
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={renderTypingIndicator}
        />
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            value={inputMessage}
            onChangeText={handleTyping}
            placeholder="Ketik pesan..."
            placeholderTextColor="#9E9E9E"
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              inputMessage.trim() ? styles.sendButtonActive : null,
            ]}
            onPress={handleSendMessage}
            disabled={!inputMessage.trim()}>
            <Icon name="send" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#DC143C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  backButton: {
    padding: 4,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontWeight: '400',
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  messageList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 3,
    alignItems: 'flex-end',
    maxWidth: width * 0.8,
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
  },
  adminMessageContainer: {
    alignSelf: 'flex-start',
    justifyContent: 'flex-start',
  },
  adminAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#9E9E9E',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginBottom: 4,
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: '#DC143C',
    borderTopRightRadius: 6,
  },
  adminBubble: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 6,
  },
  userBubbleBorder: {
    borderBottomRightRadius: 6,
  },
  adminBubbleBorder: {
    borderBottomLeftRadius: 6,
  },
  senderName: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userSenderName: {
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'right',
  },
  adminSenderName: {
    color: '#DC143C',
    textAlign: 'left',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#FFFFFF',
  },
  adminText: {
    color: '#2C3E50',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 6,
    fontWeight: '400',
  },
  userTime: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  adminTime: {
    color: '#95A5A6',
    textAlign: 'left',
  },
  typingContainer: {
    flexDirection: 'row',
    marginVertical: 8,
    alignItems: 'flex-end',
  },
  typingBubble: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderTopLeftRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#BDC3C7',
    marginHorizontal: 2,
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F5F5F5',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 48,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#2C3E50',
    maxHeight: 100,
    paddingVertical: 8,
    paddingHorizontal: 0,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#BDC3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
    marginBottom: 2,
  },
  sendButtonActive: {
    backgroundColor: '#DC143C',
  },
});

export default ChatScreen;
