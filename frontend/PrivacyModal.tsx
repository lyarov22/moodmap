import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function PrivacyModal({ visible, onClose }: Props) {
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
            <Text style={styles.title}>Политика использования</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionTitle}>Условия использования</Text>
            <Text style={styles.text}>
              MoodMap предоставляется "как есть" без каких-либо гарантий. 
              Использование приложения осуществляется на ваш собственный риск.
            </Text>
            
            <Text style={styles.sectionTitle}>Некоммерческое использование</Text>
            <Text style={styles.text}>
              Данный проект является некоммерческим и создан в образовательных целях. 
              Мы не собираем персональные данные пользователей и не используем их в коммерческих целях.
            </Text>
            
            <Text style={styles.sectionTitle}>Сбор данных</Text>
            <Text style={styles.text}>
              Приложение собирает только анонимные данные о настроении и местоположении. 
              IP-адрес используется только для ограничения частоты отправки настроений (1 раз в час).
            </Text>
            
            <Text style={styles.sectionTitle}>Ответственность</Text>
            <Text style={styles.text}>
              Разработчики не несут ответственности за любые убытки или проблемы, 
              возникшие в результате использования данного приложения.
            </Text>
            
            <Text style={styles.sectionTitle}>Изменения</Text>
            <Text style={styles.text}>
              Мы оставляем за собой право изменять данную политику в любое время 
              без предварительного уведомления.
            </Text>
          </ScrollView>
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
    maxHeight: 400,
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
    marginBottom: 12,
  },
});
