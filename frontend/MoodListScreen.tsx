import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { moodEmojis, moodColors } from './constants/mood';

interface Mood {
  mood: number;
  coords: {
    lat: number;
    lng: number;
  };
  ip?: string;
  timestamp?: string;
}

interface Props {
  moods: Mood[];
  onClose: () => void;
}


export default function MoodListScreen({ moods, onClose }: Props) {
  const sortedMoods = [...moods].sort((a, b) => {
    if (!a.timestamp || !b.timestamp) return 0;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  const formatTime = (timestamp?: string) => {
    if (!timestamp) return 'Неизвестно';
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Неизвестно';
    }
  };

  const renderMoodItem = ({ item, index }: { item: Mood; index: number }) => (
    <View style={styles.moodItem}>
      <View style={styles.moodHeader}>
        <View style={[styles.moodEmojiContainer, { backgroundColor: moodColors[item.mood - 1] }]}>
          <Text style={styles.moodEmoji}>{moodEmojis[item.mood - 1]}</Text>
        </View>
        <View style={styles.moodInfo}>
          <Text style={styles.moodTime}>{formatTime(item.timestamp)}</Text>
          {item.ip && <Text style={styles.moodIp}>IP: {item.ip}</Text>}
        </View>
      </View>
      <View style={styles.coordsContainer}>
        <Text style={styles.coordsText}>
          📍 {item.coords.lat.toFixed(6)}, {item.coords.lng.toFixed(6)}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>История настроений</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          Всего записей: {moods.length}
        </Text>
      </View>

      {moods.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Пока нет сохраненных настроений</Text>
        </View>
      ) : (
        <FlatList
          data={sortedMoods}
          renderItem={renderMoodItem}
          keyExtractor={(item, index) => `${item.coords.lat}-${item.coords.lng}-${index}`}
          style={styles.list}
          showsVerticalScrollIndicator={true}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerTitle: {
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
  statsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  statsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  list: {
    flex: 1,
  },
  moodItem: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  moodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  moodEmojiContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  moodEmoji: {
    fontSize: 20,
  },
  moodInfo: {
    flex: 1,
  },
  moodTime: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  moodIp: {
    fontSize: 12,
    color: '#666',
  },
  coordsContainer: {
    marginTop: 4,
  },
  coordsText: {
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
