import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { StatusBar } from 'expo-status-bar';
import Toast from 'react-native-toast-message';
import UniversalMap, { UniversalMapHandle } from './UniversalMap';
import { moodEmojis, moodColors } from './constants/mood';
import MoodListScreen from './MoodListScreen';
import Constants from 'expo-constants';
import { getMoods, createMood } from './api';
import styles from './styles/App.styles';
import InfoModal from './InfoModal';
import PrivacyModal from './PrivacyModal';

interface UserLocation {
  latitude: number;
  longitude: number;
}

interface Mood {
  mood: number;
  coords: {
    lat: number;
    lng: number;
  };
  ip?: string;
  timestamp?: string;
}

const MAPBOX_TOKEN = (Constants.expoConfig?.extra as any)?.mapboxToken || process.env.EXPO_PUBLIC_MAPBOX_TOKEN || 'YOUR_MAPBOX_ACCESS_TOKEN';
 



export default function App(): React.JSX.Element {
  const [moods, setMoods] = useState<Mood[]>([]);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [loading, setLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([76.899425, 43.239221]);
  const [showMoodList, setShowMoodList] = useState(false);
  const [heatmapEnabled, setHeatmapEnabled] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  useEffect(() => {
    requestLocationPermission();
    fetchMoods();
  }, []);

  const requestLocationPermission = async () => {
    try {
      console.log('Запрашиваем разрешение на геолокацию...');
      const { status } = await Location.requestForegroundPermissionsAsync();
      console.log('Статус разрешения:', status);
      
      if (status !== 'granted') {
        console.log('Разрешение на геолокацию не предоставлено');
        Toast.show({
          type: 'error',
          text1: 'Ошибка',
          text2: 'Разрешение на геолокацию необходимо для работы приложения',
          topOffset: 120,
        });
        return;
      }

      console.log('Получаем текущее местоположение...');
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      const newLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      
      console.log('Получена геолокация:', newLocation);
      setUserLocation(newLocation);
      // Центрируем карту по полученной геолокации
      setMapCenter([newLocation.longitude, newLocation.latitude]);
    } catch (error) {
      console.error('Ошибка получения геолокации:', error);
      Toast.show({
        type: 'error',
        text1: 'Ошибка',
        text2: 'Не удалось получить ваше местоположение. Проверьте настройки браузера.',
        topOffset: 120,
      });
      // Оставляем координаты по умолчанию
    }
  };

  const fetchMoods = async () => {
    try {
      const data = await getMoods();
      setMoods(data);
    } catch (error) {
      console.error('Ошибка загрузки настроений:', error);
    }
  };

  const submitMood = async (moodLevel: number) => {
    console.log('Кнопка нажата, уровень настроения:', moodLevel);
    console.log('Текущая геолокация:', userLocation);
    
    if (!userLocation) {
      console.log('Геолокация не получена, пытаемся запросить снова...');
      await requestLocationPermission();
      if (!userLocation) {
        Toast.show({
          type: 'error',
          text1: 'Ошибка',
          text2: 'Не удалось получить ваше местоположение. Разрешите доступ к геолокации в браузере.',
          topOffset: 120,
        });
        return;
      }
    }

    setLoading(true);
    console.log('Отправляем настроение на сервер...');
    try {
      const data = await createMood(moodLevel, userLocation.latitude, userLocation.longitude);

      if (data.ok && data.success) {
        Toast.show({
          type: 'success',
          text1: 'Успех',
          text2: 'Ваше настроение сохранено!',
          topOffset: 120,
        });
        fetchMoods(); // Обновляем карту
      } else {
        Toast.show({
          type: 'info',
          text1: 'Не так быстро!',
          text2: data.detail || 'Не удалось сохранить настроение',
          topOffset: 120,
        });
      }
    } catch (error) {
      console.error('Ошибка отправки настроения:', error);
      Toast.show({
        type: 'error',
        text1: 'Ошибка',
        text2: 'Ошибка сети. Проверьте подключение к интернету.',
        topOffset: 120,
      });
    } finally {
      setLoading(false);
    }
  };


  const mapRef = useRef<UniversalMapHandle | null>(null);

  const renderMap = () => {
    return (
      <UniversalMap
        ref={mapRef}
        moods={moods}
        userLocation={userLocation}
        mapCenter={mapCenter}
        mapboxToken={MAPBOX_TOKEN}
        heatmapEnabled={heatmapEnabled}
      />
    );
  };

  if (showMoodList) {
    return (
      <MoodListScreen 
        moods={moods} 
        onClose={() => setShowMoodList(false)} 
      />
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="auto" />
      {renderMap()}

      {/* Кнопка меню сверху справа */}
      <View style={styles.topOverlay} pointerEvents="box-none">
        {/* Рычаг теплокарты */}
        <View style={styles.heatToggleContainer}>
          <Text style={styles.heatToggleLabel}>Теплокарта</Text>
          <TouchableOpacity
            onPress={() => setHeatmapEnabled(prev => !prev)}
            style={[styles.toggle, heatmapEnabled && styles.toggleOn]}
          >
            <View style={[styles.knob, heatmapEnabled && styles.knobOn]} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity 
          style={styles.infoButton} 
          onPress={() => setShowInfoModal(true)}
        >
          <Text style={styles.infoButtonText}>ℹ️</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.menuButton} 
          onPress={() => setShowMoodList(true)}
        >
          <Text style={styles.menuButtonText}>☰</Text>
        </TouchableOpacity>
      </View>

      {/* Плавающие кнопки настроения */}
      <View style={styles.overlayContainer} pointerEvents="box-none">
        {/* Кнопка центрирования по геолокации */}
        <View pointerEvents="box-none" style={styles.rightBottomOverlay}>
          <TouchableOpacity
            style={styles.gpsButton}
            onPress={() => {
              if (userLocation) {
                mapRef.current?.centerOn(userLocation.longitude, userLocation.latitude);
              } else {
                requestLocationPermission();
              }
            }}
          >
            <Text style={styles.gpsButtonText}>📍</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomPanel}>
         {loading && (
             <Text style={styles.loadingText}>Отправка настроение...</Text>
           )}
          <Text style={styles.title}>Как ваше настроение?</Text>

          <View style={styles.buttonRow}>
            {moodEmojis.map((emoji, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.moodButton, { backgroundColor: moodColors[index] }]}
                onPress={() => submitMood(index + 1)}
                disabled={loading}
              >
                <Text style={styles.moodEmoji}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>

        </View>
      </View>
      
      <InfoModal 
        visible={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        onPrivacyPress={() => {
          setShowInfoModal(false);
          setShowPrivacyModal(true);
        }}
      />
      
      <PrivacyModal 
        visible={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />
      
      <Toast />
    </SafeAreaView>
  );
}

  