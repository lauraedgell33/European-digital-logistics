import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { vehicleApi } from '@/lib/api';
import { useAppStore } from '@/stores/appStore';
import { t } from '@/lib/i18n';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '@/constants/theme';
import { format } from 'date-fns';

const schema = z.object({
  vehicle_type: z.string().min(2),
  current_city: z.string().min(2),
  current_country: z.string().min(2),
  destination_city: z.string().optional(),
  destination_country: z.string().optional(),
  max_weight: z.string().min(1),
  max_volume: z.string().optional(),
  available_from: z.string().min(1),
  price_per_km: z.string().min(1),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const EU_COUNTRIES = ['DE', 'FR', 'IT', 'ES', 'RO', 'PL', 'NL', 'BE', 'AT', 'CZ', 'HU', 'BG'];
const VEHICLE_TYPES = ['Curtain Side', 'Box Truck', 'Refrigerated', 'Flatbed', 'Tanker', 'Container', 'Mega Trailer', 'Van'];

export default function CreateVehicleScreen() {
  const locale = useAppStore((s) => s.locale);
  const addNotification = useAppStore((s) => s.addNotification);
  const queryClient = useQueryClient();

  const { control, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      current_country: 'DE',
      available_from: format(new Date(), 'yyyy-MM-dd'),
    },
  });

  const currentCountry = watch('current_country');
  const destCountry = watch('destination_country');

  const createMutation = useMutation({
    mutationFn: (data: FormData) => vehicleApi.create({
      ...data,
      max_weight: parseFloat(data.max_weight),
      max_volume: data.max_volume ? parseFloat(data.max_volume) : undefined,
      price_per_km: parseFloat(data.price_per_km),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      addNotification({ type: 'success', title: t('vehicles.createSuccess', locale) });
      router.back();
    },
    onError: () => addNotification({ type: 'error', title: t('common.error', locale) }),
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('vehicles.create', locale)}</Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Vehicle Type */}
          <Card title={t('vehicles.type', locale)} style={styles.card}>
            <Controller control={control} name="vehicle_type" render={({ field }) => (
              <View style={styles.grid}>
                {VEHICLE_TYPES.map((vt) => (
                  <TouchableOpacity key={vt} onPress={() => field.onChange(vt)} style={[styles.pill, field.value === vt && styles.pillActive]}>
                    <Text style={[styles.pillText, field.value === vt && styles.pillTextActive]}>{vt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )} />
          </Card>

          {/* Current Location */}
          <Card title={t('vehicles.currentLocation', locale)} style={styles.card}>
            <Controller control={control} name="current_city" render={({ field }) => (
              <Input label={t('orders.city', locale)} placeholder="Munich" value={field.value} onChangeText={field.onChange} error={errors.current_city?.message} />
            )} />
            <Text style={styles.fieldLabel}>{t('orders.country', locale)}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hScroll}>
              {EU_COUNTRIES.map((c) => (
                <TouchableOpacity key={c} onPress={() => setValue('current_country', c)} style={[styles.pill, currentCountry === c && styles.pillActive]}>
                  <Text style={[styles.pillText, currentCountry === c && styles.pillTextActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Card>

          {/* Destination */}
          <Card title={t('vehicles.destination', locale)} style={styles.card}>
            <Controller control={control} name="destination_city" render={({ field }) => (
              <Input label={t('orders.city', locale)} placeholder="Optional" value={field.value} onChangeText={field.onChange} />
            )} />
            <Text style={styles.fieldLabel}>{t('orders.country', locale)}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hScroll}>
              {EU_COUNTRIES.map((c) => (
                <TouchableOpacity key={c} onPress={() => setValue('destination_country', c)} style={[styles.pill, destCountry === c && styles.pillActive]}>
                  <Text style={[styles.pillText, destCountry === c && styles.pillTextActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Card>

          {/* Specs */}
          <Card title={t('vehicles.specs', locale)} style={styles.card}>
            <Controller control={control} name="max_weight" render={({ field }) => (
              <Input label={`${t('vehicles.maxWeight', locale)} (kg)`} placeholder="24000" value={field.value} onChangeText={field.onChange} keyboardType="numeric" error={errors.max_weight?.message} />
            )} />
            <Controller control={control} name="max_volume" render={({ field }) => (
              <Input label={`${t('vehicles.maxVolume', locale)} (m³)`} placeholder="90" value={field.value} onChangeText={field.onChange} keyboardType="numeric" />
            )} />
          </Card>

          {/* Availability & Price */}
          <Card title={t('vehicles.availability', locale)} style={styles.card}>
            <Controller control={control} name="available_from" render={({ field }) => (
              <Input label={t('vehicles.availableFrom', locale)} placeholder="2025-01-15" value={field.value} onChangeText={field.onChange} error={errors.available_from?.message} leftIcon="calendar-outline" />
            )} />
            <Controller control={control} name="price_per_km" render={({ field }) => (
              <Input label={`${t('vehicles.price', locale)} (€/km)`} placeholder="1.20" value={field.value} onChangeText={field.onChange} keyboardType="numeric" error={errors.price_per_km?.message} leftIcon="cash-outline" />
            )} />
          </Card>

          {/* Description */}
          <Card title={t('common.description', locale)} style={styles.card}>
            <Controller control={control} name="description" render={({ field }) => (
              <Input label="" placeholder="Additional info..." value={field.value} onChangeText={field.onChange} multiline numberOfLines={4} style={{ height: 100, textAlignVertical: 'top' }} />
            )} />
          </Card>

          <Button title={t('vehicles.create', locale)} onPress={handleSubmit((d) => createMutation.mutate(d))} loading={createMutation.isPending} icon={<Ionicons name="checkmark-circle" size={18} color={Colors.white} />} style={styles.submitBtn} />

          <View style={{ height: Spacing.xxxl * 2 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.xxl, paddingVertical: Spacing.lg, gap: Spacing.md },
  backBtn: { marginRight: Spacing.sm },
  headerTitle: { flex: 1, fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text },
  scrollContent: { paddingHorizontal: Spacing.xxl },
  card: { marginBottom: Spacing.lg },
  fieldLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.text, marginBottom: Spacing.sm, marginTop: Spacing.md },
  hScroll: { marginBottom: Spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  pill: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, marginRight: Spacing.sm, marginBottom: Spacing.xs },
  pillActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  pillText: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textSecondary },
  pillTextActive: { color: Colors.white },
  submitBtn: { marginTop: Spacing.lg },
});
