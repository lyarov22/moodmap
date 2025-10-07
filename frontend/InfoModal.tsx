import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Linking } from 'react-native';

interface Props {
  visible: boolean;
  onClose: () => void;
  onPrivacyPress: () => void;
}

export default function InfoModal({ visible, onClose, onPrivacyPress }: Props) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>О проекте</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.content}>
            <Text style={styles.sectionTitle}>Как это работает</Text>
            <Text style={styles.text}>
              • Оставляйте свое настроение на карте{'\n'}
              • Можно добавлять новое настроение каждый час{'\n'}
              • Настроения автоматически исчезают через 24 часа{'\n'}
              • Переключайтесь между маркерами и теплокартой
            </Text>
            
            <Text style={styles.sectionTitle}>Разработчик</Text>
            <TouchableOpacity 
              style={styles.linkContainer}
              onPress={() => Linking.openURL('https://t.me/totaljerkface')}
            >
              <Text style={styles.linkText}>Telegram: @totaljerkface</Text>
            </TouchableOpacity>
            <Text style={styles.text}>
              Email: lyarov22@gmail.com
            </Text>
            
            <TouchableOpacity style={styles.privacyButton} onPress={onPrivacyPress}>
              <Text style={styles.privacyButtonText}>Политика использования</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  privacyButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  privacyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  linkContainer: {
    marginBottom: 8,
  },
  linkText: {
    fontSize: 14,
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
});
