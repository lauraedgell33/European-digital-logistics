import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { trackingApi, orderApi } from '@/lib/api';
import { useAppStore } from '@/stores/appStore';
import { t } from '@/lib/i18n';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '@/constants/theme';
import { TrackingPosition, TransportOrder } from '@/types';
import { format } from 'date-fns';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function TrackingScreen() {
  const { shipmentId } = useLocalSearchParams<{ shipmentId: string }>();
  const locale = useAppStore((s) => s.locale);
  const mapRef = useRef<MapView>(null);
  const [mapReady, setMapReady] = useState(false);

  const { data: positions, isLoading: positionsLoading } = useQuery({
    queryKey: ['tracking', shipmentId],
    queryFn: async () => {
      const res = await trackingApi.positions(Number(shipmentId));
      return (res.data.data || res.data) as TrackingPosition[];
    },
    enabled: !!shipmentId,
    refetchInterval: 30000,
  });

  const latestPosition = positions && positions.length > 0 ? positions[positions.length - 1] : null;

  const polylineCoords = positions?.map((p) => ({
    latitude: p.lat,
    longitude: p.lng,
  })) || [];

  useEffect(() => {
    if (mapReady && latestPosition && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: latestPosition.lat,
        longitude: latestPosition.lng,
        latitudeDelta: 2,
        longitudeDelta: 2,
      }, 1000);
    }
  }, [mapReady, latestPosition]);

  if (positionsLoading) return <LoadingScreen message={t('tracking.loading', locale)} />;

  const defaultRegion = {
    latitude: latestPosition?.lat || 50.1109,
    longitude: latestPosition?.lng || 8.6821,
    latitudeDelta: 5,
    longitudeDelta: 5,
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('tracking.liveTracking', locale)}</Text>
        <View style={styles.liveDot}>
          <View style={styles.liveDotInner} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
          initialRegion={defaultRegion}
          onMapReady={() => setMapReady(true)}
          showsUserLocation={false}
          showsCompass
          showsScale
        >
          {/* Route polyline */}
          {polylineCoords.length > 1 && (
            <Polyline
              coordinates={polylineCoords}
              strokeColor={Colors.primary}
              strokeWidth={4}
              lineDashPattern={[0]}
            />
          )}

          {/* Start marker */}
          {positions && positions.length > 0 && (
            <Marker
              coordinate={{ latitude: positions[0].lat, longitude: positions[0].lng }}
              title="Start"
              pinColor="green"
            />
          )}

          {/* Current position marker */}
          {latestPosition && (
            <Marker
              coordinate={{ latitude: latestPosition.lat, longitude: latestPosition.lng }}
              title={t('tracking.currentPosition', locale)}
            >
              <View style={styles.currentMarker}>
                <Ionicons name="navigate" size={24} color={Colors.white} />
              </View>
            </Marker>
          )}
        </MapView>

        {/* Map overlay controls */}
        <View style={styles.mapControls}>
          <TouchableOpacity
            style={styles.mapControlBtn}
            onPress={() => {
              if (latestPosition && mapRef.current) {
                mapRef.current.animateToRegion({
                  latitude: latestPosition.lat,
                  longitude: latestPosition.lng,
                  latitudeDelta: 0.5,
                  longitudeDelta: 0.5,
                }, 500);
              }
            }}
          >
            <Ionicons name="locate" size={22} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.mapControlBtn}
            onPress={() => {
              if (polylineCoords.length > 1 && mapRef.current) {
                mapRef.current.fitToCoordinates(polylineCoords, {
                  edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                  animated: true,
                });
              }
            }}
          >
            <Ionicons name="resize" size={22} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom panel */}
      <ScrollView style={styles.bottomPanel} showsVerticalScrollIndicator={false}>
        {/* Current Status */}
        {latestPosition && (
          <Card style={styles.statusCard}>
            <View style={styles.statusRow}>
              <View style={styles.statusIcon}>
                <Ionicons name="navigate-circle" size={28} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.statusTitle}>{t('tracking.currentPosition', locale)}</Text>
                <Text style={styles.statusCoords}>
                  {latestPosition.lat.toFixed(4)}°, {latestPosition.lng.toFixed(4)}°
                </Text>
                <Text style={styles.statusTime}>
                  {t('tracking.lastUpdate', locale)}: {format(new Date(latestPosition.recorded_at), 'HH:mm:ss')}
                </Text>
              </View>
            </View>

            {(latestPosition.speed_kmh != null || latestPosition.heading != null) && (
              <View style={styles.metricsRow}>
                {latestPosition.speed_kmh != null && (
                  <View style={styles.metric}>
                    <Ionicons name="speedometer-outline" size={18} color={Colors.info} />
                    <Text style={styles.metricValue}>{Math.round(latestPosition.speed_kmh)} km/h</Text>
                    <Text style={styles.metricLabel}>{t('tracking.speed', locale)}</Text>
                  </View>
                )}
                {latestPosition.heading != null && (
                  <View style={styles.metric}>
                    <Ionicons name="compass-outline" size={18} color={Colors.warning} />
                    <Text style={styles.metricValue}>{Math.round(latestPosition.heading)}°</Text>
                    <Text style={styles.metricLabel}>{t('tracking.heading', locale)}</Text>
                  </View>
                )}
                <View style={styles.metric}>
                  <Ionicons name="pin-outline" size={18} color={Colors.success} />
                  <Text style={styles.metricValue}>{positions?.length || 0}</Text>
                  <Text style={styles.metricLabel}>{t('tracking.points', locale)}</Text>
                </View>
              </View>
            )}
          </Card>
        )}

        {/* Position history */}
        {positions && positions.length > 0 && (
          <Card title={t('tracking.history', locale)} style={styles.historyCard}>
            {positions.slice(-10).reverse().map((pos, idx) => (
              <View key={pos.id || idx} style={[styles.historyItem, idx < Math.min(positions.length, 10) - 1 && styles.historyItemBorder]}>
                <View style={styles.historyDot} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.historyCoords}>
                    {pos.lat.toFixed(4)}°, {pos.lng.toFixed(4)}°
                  </Text>
                  {pos.speed_kmh != null && (
                    <Text style={styles.historySpeed}>{Math.round(pos.speed_kmh)} km/h</Text>
                  )}
                </View>
                <Text style={styles.historyTime}>
                  {format(new Date(pos.recorded_at), 'HH:mm')}
                </Text>
              </View>
            ))}
          </Card>
        )}

        {!latestPosition && (
          <Card style={styles.noDataCard}>
            <View style={styles.noDataContent}>
              <Ionicons name="location-outline" size={48} color={Colors.textTertiary} />
              <Text style={styles.noDataTitle}>{t('tracking.noData', locale)}</Text>
              <Text style={styles.noDataDesc}>{t('tracking.noDataDesc', locale)}</Text>
            </View>
          </Card>
        )}

        <View style={{ height: Spacing.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.md, gap: Spacing.md, backgroundColor: Colors.card,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backBtn: {},
  headerTitle: { flex: 1, fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text },
  liveDot: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  liveDotInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.success },
  liveText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.success },
  mapContainer: { height: SCREEN_WIDTH * 0.65, position: 'relative' },
  map: { ...StyleSheet.absoluteFillObject },
  mapControls: {
    position: 'absolute', right: Spacing.lg, bottom: Spacing.lg, gap: Spacing.sm,
  },
  mapControlBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.card,
    justifyContent: 'center', alignItems: 'center', ...Shadow.md,
  },
  currentMarker: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary,
    justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: Colors.white,
  },
  bottomPanel: { flex: 1, paddingHorizontal: Spacing.xxl, paddingTop: Spacing.lg },
  statusCard: { marginBottom: Spacing.lg },
  statusRow: { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start' },
  statusIcon: { marginTop: 2 },
  statusTitle: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text },
  statusCoords: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  statusTime: { fontSize: FontSize.xs, color: Colors.textTertiary, marginTop: Spacing.xs },
  metricsRow: { flexDirection: 'row', marginTop: Spacing.lg, paddingTop: Spacing.lg, borderTopWidth: 1, borderTopColor: Colors.border },
  metric: { flex: 1, alignItems: 'center', gap: Spacing.xs },
  metricValue: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text },
  metricLabel: { fontSize: FontSize.xs, color: Colors.textTertiary },
  historyCard: { marginBottom: Spacing.lg },
  historyItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md, gap: Spacing.md },
  historyItemBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  historyDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },
  historyCoords: { fontSize: FontSize.sm, color: Colors.text, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  historySpeed: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  historyTime: { fontSize: FontSize.sm, color: Colors.textTertiary },
  noDataCard: {},
  noDataContent: { alignItems: 'center', paddingVertical: Spacing.xxl, gap: Spacing.md },
  noDataTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold, color: Colors.text },
  noDataDesc: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center' },
});
