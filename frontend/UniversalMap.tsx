import React, { useMemo, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { moodEmojis, moodColors } from './constants/mood';

interface Mood {
  mood: number;
  coords: { lat: number; lng: number };
  ip?: string;
  timestamp?: string;
}

interface UserLocation {
  latitude: number;
  longitude: number;
}

interface Props {
  moods: Mood[];
  userLocation: UserLocation | null;
  mapCenter: [number, number];
  mapboxToken: string;
  heatmapEnabled?: boolean;
}

export interface UniversalMapHandle {
  centerOn: (lng: number, lat: number) => void;
}

// вынесено в constants/mood

function UniversalMapImpl({ moods, userLocation, mapCenter, mapboxToken, heatmapEnabled = false }: Props, ref: React.Ref<UniversalMapHandle>) {
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const webviewRef = useRef<any>(null);

  useImperativeHandle(ref, () => ({
    centerOn: (lng: number, lat: number) => {
      if (Platform.OS === 'web') {
        if (mapRef.current && mapRef.current.flyTo) {
          mapRef.current.flyTo({ center: [lng, lat], zoom: 12, duration: 800 });
        }
      } else {
        if (webviewRef.current) {
          const js = `window.flyTo && window.flyTo(${lng}, ${lat}); true;`;
          webviewRef.current.injectJavaScript(js);
        }
      }
    }
  }), []);

  // Для веб-платформы используем mapbox-gl через CDN
  useEffect(() => {
    if (Platform.OS !== 'web' || !mapboxToken || mapboxToken === 'YOUR_MAPBOX_ACCESS_TOKEN') {
      return;
    }

    const loadMapbox = async () => {
      try {
        const w: any = globalThis as any;
        const d: any = (globalThis as any).document;

        // CSS
        if (d && !d.getElementById('mapbox-gl-css')) {
          const link = d.createElement('link');
          link.id = 'mapbox-gl-css';
          link.rel = 'stylesheet';
          link.href = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css';
          d.head.appendChild(link);
        }

        // JS
        if (!w.mapboxgl) {
          await new Promise<void>((resolve, reject) => {
            const script = d.createElement('script');
            script.src = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js';
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load mapbox-gl'));
            d.body.appendChild(script);
          });
        }

        const mapboxgl = w.mapboxgl;
        mapboxgl.accessToken = mapboxToken;

        const map = new mapboxgl.Map({
          container: 'web-map',
          style: 'mapbox://styles/mapbox/streets-v12',
          center: mapCenter,
          zoom: 12
        });

        mapRef.current = map;

        const sourceId = 'moods-source';
        const layerId = 'moods-heat-circles';

        const initialVisualization = () => {
          if (!map) return;
          // Только начальная отрисовка маркеров
          moods.forEach((mood) => {
            if (d) {
              const el = d.createElement('div');
              el.className = 'mood-marker';
              el.style.backgroundColor = moodColors[mood.mood - 1];
              el.style.width = '40px';
              el.style.height = '40px';
              el.style.borderRadius = '50%';
              el.style.display = 'flex';
              el.style.alignItems = 'center';
              el.style.justifyContent = 'center';
              el.style.fontSize = '20px';
              el.style.border = '2px solid white';
              el.style.boxShadow = '0px 2px 4px rgba(0,0,0,0.3)';
              el.style.cursor = 'pointer';
              el.textContent = moodEmojis[mood.mood - 1];

              const marker = new mapboxgl.Marker(el)
                .setLngLat([mood.coords.lng, mood.coords.lat])
                .addTo(map);
              markersRef.current.push(marker);
            }
          });
        };

        const ensureLoadedAndUpdate = () => {
          if (map.isStyleLoaded()) {
            initialVisualization();
          } else {
            map.once('load', initialVisualization);
          }
        };

        // Начальная отрисовка
        ensureLoadedAndUpdate();

        // Добавляем маркер пользователя
        if (userLocation && d) {
          const userEl = d.createElement('div');
          userEl.className = 'user-marker';
          userEl.style.backgroundColor = '#007AFF';
          userEl.style.width = '30px';
          userEl.style.height = '30px';
          userEl.style.borderRadius = '50%';
          userEl.style.display = 'flex';
          userEl.style.alignItems = 'center';
          userEl.style.justifyContent = 'center';
          userEl.style.fontSize = '16px';
          userEl.style.border = '2px solid white';
          userEl.style.boxShadow = '0px 2px 4px rgba(0,0,0,0.3)';
          userEl.textContent = '📍';

          const userMarker = new mapboxgl.Marker(userEl)
            .setLngLat([userLocation.longitude, userLocation.latitude])
            .addTo(map);

          markersRef.current.push(userMarker);
        }

        // Центрируем карту
        map.flyTo({
          center: mapCenter,
          zoom: 12,
          duration: 1000
        });

      } catch (error) {
        console.error('Ошибка загрузки Mapbox:', error);
      }
    };

    loadMapbox();

    // Очистка при размонтировании
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, [moods, userLocation, mapCenter, mapboxToken]);

  // Отдельный эффект для переключения теплокарты без перерендера карты
  useEffect(() => {
    if (Platform.OS !== 'web' || !mapRef.current) return;

    const map = mapRef.current;
    const sourceId = 'moods-source';
    const layerId = 'moods-heat-circles';

    const updateVisualization = () => {
      if (!map || !map.isStyleLoaded()) return;

      // Убираем маркеры
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];

      if (!heatmapEnabled) {
        // Показать маркеры, скрыть теплокарту
        if (map.getLayer(layerId)) {
          map.setLayoutProperty(layerId, 'visibility', 'none');
        }
        
        const d: any = (globalThis as any).document;
        moods.forEach((mood) => {
          if (d) {
            const el = d.createElement('div');
            el.className = 'mood-marker';
            el.style.backgroundColor = moodColors[mood.mood - 1];
            el.style.width = '40px';
            el.style.height = '40px';
            el.style.borderRadius = '50%';
            el.style.display = 'flex';
            el.style.alignItems = 'center';
            el.style.justifyContent = 'center';
            el.style.fontSize = '20px';
            el.style.border = '2px solid white';
            el.style.boxShadow = '0px 2px 4px rgba(0,0,0,0.3)';
            el.style.cursor = 'pointer';
            el.textContent = moodEmojis[mood.mood - 1];

            const marker = new (globalThis as any).mapboxgl.Marker(el)
              .setLngLat([mood.coords.lng, mood.coords.lat])
              .addTo(map);
            markersRef.current.push(marker);
          }
        });
      } else {
        // Показать теплокарту, скрыть маркеры
        const features = moods.map((m) => ({
          type: 'Feature',
          properties: { mood: m.mood },
          geometry: { type: 'Point', coordinates: [m.coords.lng, m.coords.lat] }
        }));
        const data = { type: 'FeatureCollection', features } as any;

        if (map.getSource(sourceId)) {
          (map.getSource(sourceId) as any).setData(data);
        } else {
          map.addSource(sourceId, { type: 'geojson', data });
        }

        if (map.getLayer(layerId)) {
          map.setLayoutProperty(layerId, 'visibility', 'visible');
        } else {
          map.addLayer({
            id: layerId,
            type: 'circle',
            source: sourceId,
            paint: {
              'circle-radius': ["interpolate", ["linear"], ["zoom"], 10, 20, 14, 60],
              'circle-color': [
                'match',
                ['get', 'mood'],
                1, moodColors[0],
                2, moodColors[1],
                3, moodColors[2],
                4, moodColors[3],
                5, moodColors[4],
                '#888'
              ],
              'circle-opacity': 0.35,
              'circle-blur': 0.6
            }
          });
        }
      }
    };

    if (map.isStyleLoaded()) {
      updateVisualization();
    } else {
      map.once('load', updateVisualization);
    }
  }, [heatmapEnabled, moods]);

  const html = useMemo(() => {
    const moodsJson = JSON.stringify(moods);
    const userJson = JSON.stringify(userLocation);
    const centerJson = JSON.stringify(mapCenter);
    const colorsJson = JSON.stringify(moodColors);
    const emojisJson = JSON.stringify(moodEmojis);
    const heatEnabledJson = JSON.stringify(heatmapEnabled);

    return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"/>
    <link href="https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css" rel="stylesheet" />
    <style>
      html, body, #map { height: 100%; width: 100%; margin: 0; padding: 0; }
      .mood-marker { 
        width: 40px; height: 40px; border-radius: 20px; 
        display: flex; align-items: center; justify-content: center; 
        font-size: 20px; border: 2px solid #fff; 
        box-shadow: 0px 2px 4px rgba(0,0,0,0.3); 
        cursor: pointer;
      }
      .user-marker { 
        width: 30px; height: 30px; border-radius: 15px; 
        background: #007AFF; display: flex; 
        align-items: center; justify-content: center; 
        font-size: 16px; border: 2px solid #fff; 
        box-shadow: 0px 2px 4px rgba(0,0,0,0.3); 
      }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script src="https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js"></script>
    <script>
      const MAPBOX_TOKEN = ${JSON.stringify(mapboxToken)};
      const moods = ${moodsJson};
      const userLocation = ${userJson};
      const mapCenter = ${centerJson};
      const moodColors = ${colorsJson};
      const moodEmojis = ${emojisJson};
      const heatmapEnabled = ${heatEnabledJson};

      mapboxgl.accessToken = MAPBOX_TOKEN;
      const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v12',
        center: mapCenter,
        zoom: 12
      });

      window.flyTo = function(lng, lat){
        try { map.flyTo({ center: [lng, lat], zoom: 12, duration: 800 }); } catch(e) {}
      }

      if (!heatmapEnabled) {
        // Добавляем маркеры настроений
        moods.forEach((mood, idx) => {
          const el = document.createElement('div');
          el.className = 'mood-marker';
          el.style.backgroundColor = moodColors[mood.mood - 1];
          el.textContent = moodEmojis[mood.mood - 1];
          new mapboxgl.Marker(el).setLngLat([mood.coords.lng, mood.coords.lat]).addTo(map);
        });
      } else {
        // Теплокарта кругами
        const features = moods.map(m => ({
          type: 'Feature',
          properties: { mood: m.mood },
          geometry: { type: 'Point', coordinates: [m.coords.lng, m.coords.lat] }
        }));
        map.on('load', () => {
          if (!map.getSource('moods-source')) {
            map.addSource('moods-source', { type: 'geojson', data: { type: 'FeatureCollection', features } });
          }
          if (!map.getLayer('moods-heat-circles')) {
            map.addLayer({
              id: 'moods-heat-circles',
              type: 'circle',
              source: 'moods-source',
              paint: {
                'circle-radius': ["interpolate", ["linear"], ["zoom"], 10, 20, 14, 60],
                'circle-color': [
                  'match',
                  ['get', 'mood'],
                  1, moodColors[0],
                  2, moodColors[1],
                  3, moodColors[2],
                  4, moodColors[3],
                  5, moodColors[4],
                  '#888'
                ],
                'circle-opacity': 0.35,
                'circle-blur': 0.6
              }
            });
          } else {
            map.getSource('moods-source').setData({ type: 'FeatureCollection', features });
          }
        });
      }

      // Добавляем маркер пользователя
      if (userLocation) {
        const el = document.createElement('div');
        el.className = 'user-marker';
        el.textContent = '📍';
        new mapboxgl.Marker(el).setLngLat([userLocation.longitude, userLocation.latitude]).addTo(map);
      }

      // Центрируем карту при изменении центра
      map.flyTo({
        center: mapCenter,
        zoom: 12,
        duration: 1000
      });
    </script>
  </body>
</html>`;
  }, [moods, userLocation, mapCenter, mapboxToken, heatmapEnabled]);

  // Для веб-платформы используем обычный div с mapbox-gl
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <div
          id="web-map"
          style={{
            width: '100%',
            height: '100%',
          }}
        />
      </View>
    );
  }

  // Для мобильных платформ используем WebView
  return (
    <View style={styles.container}>
      <WebView 
        originWhitelist={["*"]} 
        source={{ html }} 
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        ref={webviewRef}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  webview: { flex: 1 },
});

export default forwardRef<UniversalMapHandle, Props>(UniversalMapImpl);
