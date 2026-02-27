import React, { useState } from 'react';
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
import { orderApi } from '@/lib/api';
import { useAppStore } from '@/stores/appStore';
import { t } from '@/lib/i18n';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '@/constants/theme';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';

const schema = z.object({
  pickup_address: z.string().min(3),
  pickup_city: z.string().min(2),
  pickup_country: z.string().min(2),
  pickup_date: z.date(),
  delivery_address: z.string().min(3),
  delivery_city: z.string().min(2),
  delivery_country: z.string().min(2),
  delivery_date: z.date(),
  cargo_type: z.string().min(2),
  weight: z.string().min(1),
  total_price: z.string().min(1),
  special_instructions: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const EU_COUNTRIES = ['DE', 'FR', 'IT', 'ES', 'RO', 'PL', 'NL', 'BE', 'AT', 'CZ', 'HU', 'BG'];
const CARGO_TYPES = ['General', 'Palletized', 'Bulk', 'Liquid', 'Refrigerated', 'Hazardous', 'Oversized', 'Fragile'];

export default function CreateOrderScreen() {
  const locale = useAppStore((s) => s.locale);
  const addNotification = useAppStore((s) => s.addNotification);
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [showPickupDate, setShowPickupDate] = useState(false);
  const [showDeliveryDate, setShowDeliveryDate] = useState(false);

  const { control, handleSubmit, formState: { errors }, trigger, setValue, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      pickup_date: new Date(),
      delivery_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      pickup_country: 'DE',
      delivery_country: 'FR',
    },
  });

  const pickupDate = watch('pickup_date');
  const deliveryDate = watch('delivery_date');
  const pickupCountry = watch('pickup_country');
  const deliveryCountry = watch('delivery_country');

  const createMutation = useMutation({
    mutationFn: (data: FormData) => orderApi.create({
      ...data,
      weight: parseFloat(data.weight),
      total_price: parseFloat(data.total_price),
      pickup_date: format(data.pickup_date, 'yyyy-MM-dd'),
      delivery_date: format(data.delivery_date, 'yyyy-MM-dd'),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      addNotification({ type: 'success', title: t('orders.createSuccess', locale) });
      router.back();
    },
    onError: () => {
      addNotification({ type: 'error', title: t('common.error', locale) });
    },
  });

  const nextStep = async () => {
    const isValid = await trigger(['pickup_address', 'pickup_city', 'pickup_country', 'pickup_date', 'delivery_address', 'delivery_city', 'delivery_country', 'delivery_date']);
    if (isValid) setStep(2);
  };

  const onSubmit = (data: FormData) => createMutation.mutate(data);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => step === 1 ? router.back() : setStep(1)} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('orders.create', locale)}</Text>
        <Text style={styles.stepText}>{step}/2</Text>
      </View>

      {/* Step indicators */}
      <View style={styles.stepIndicator}>
        <View style={[styles.stepDot, styles.stepActive]} />
        <View style={[styles.stepLine, step === 2 && styles.stepLineActive]} />
        <View style={[styles.stepDot, step === 2 && styles.stepActive]} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {step === 1 ? (
            <>
              {/* Pickup */}
              <Card title={t('orders.pickup', locale)} style={styles.card}>
                <Controller control={control} name="pickup_address" render={({ field }) => (
                  <Input label={t('orders.address', locale)} placeholder="Industriestraße 12" value={field.value} onChangeText={field.onChange} error={errors.pickup_address?.message} />
                )} />
                <Controller control={control} name="pickup_city" render={({ field }) => (
                  <Input label={t('orders.city', locale)} placeholder="Berlin" value={field.value} onChangeText={field.onChange} error={errors.pickup_city?.message} />
                )} />

                <Text style={styles.fieldLabel}>{t('orders.country', locale)}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.countryScroll}>
                  {EU_COUNTRIES.map((c) => (
                    <TouchableOpacity key={c} onPress={() => setValue('pickup_country', c)} style={[styles.countryBtn, pickupCountry === c && styles.countryActive]}>
                      <Text style={[styles.countryText, pickupCountry === c && styles.countryTextActive]}>{c}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <Text style={styles.fieldLabel}>{t('orders.date', locale)}</Text>
                <TouchableOpacity style={styles.dateBtn} onPress={() => setShowPickupDate(true)}>
                  <Ionicons name="calendar-outline" size={18} color={Colors.textSecondary} />
                  <Text style={styles.dateText}>{format(pickupDate, 'MMM dd, yyyy')}</Text>
                </TouchableOpacity>
                {showPickupDate && (
                  <DateTimePicker value={pickupDate} mode="date" onChange={(_, d) => { setShowPickupDate(false); d && setValue('pickup_date', d); }} minimumDate={new Date()} />
                )}
              </Card>

              {/* Delivery */}
              <Card title={t('orders.delivery', locale)} style={styles.card}>
                <Controller control={control} name="delivery_address" render={({ field }) => (
                  <Input label={t('orders.address', locale)} placeholder="Rue de Paris 45" value={field.value} onChangeText={field.onChange} error={errors.delivery_address?.message} />
                )} />
                <Controller control={control} name="delivery_city" render={({ field }) => (
                  <Input label={t('orders.city', locale)} placeholder="Paris" value={field.value} onChangeText={field.onChange} error={errors.delivery_city?.message} />
                )} />

                <Text style={styles.fieldLabel}>{t('orders.country', locale)}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.countryScroll}>
                  {EU_COUNTRIES.map((c) => (
                    <TouchableOpacity key={c} onPress={() => setValue('delivery_country', c)} style={[styles.countryBtn, deliveryCountry === c && styles.countryActive]}>
                      <Text style={[styles.countryText, deliveryCountry === c && styles.countryTextActive]}>{c}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <Text style={styles.fieldLabel}>{t('orders.date', locale)}</Text>
                <TouchableOpacity style={styles.dateBtn} onPress={() => setShowDeliveryDate(true)}>
                  <Ionicons name="calendar-outline" size={18} color={Colors.textSecondary} />
                  <Text style={styles.dateText}>{format(deliveryDate, 'MMM dd, yyyy')}</Text>
                </TouchableOpacity>
                {showDeliveryDate && (
                  <DateTimePicker value={deliveryDate} mode="date" onChange={(_, d) => { setShowDeliveryDate(false); d && setValue('delivery_date', d); }} minimumDate={pickupDate} />
                )}
              </Card>

              <Button title={t('common.next', locale)} onPress={nextStep} style={styles.nextBtn} icon={<Ionicons name="arrow-forward" size={18} color={Colors.white} />} />
            </>
          ) : (
            <>
              {/* Cargo */}
              <Card title={t('orders.cargo', locale)} style={styles.card}>
                <Text style={styles.fieldLabel}>Cargo Type</Text>
                <Controller control={control} name="cargo_type" render={({ field }) => (
                  <View style={styles.cargoGrid}>
                    {CARGO_TYPES.map((ct) => (
                      <TouchableOpacity key={ct} onPress={() => field.onChange(ct)} style={[styles.cargoBtn, field.value === ct && styles.cargoActive]}>
                        <Text style={[styles.cargoText, field.value === ct && styles.cargoTextActive]}>{ct}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )} />

                <Controller control={control} name="weight" render={({ field }) => (
                  <Input label={`${t('orders.weight', locale)} (kg)`} placeholder="12000" value={field.value} onChangeText={field.onChange} keyboardType="numeric" error={errors.weight?.message} />
                )} />
              </Card>

              {/* Pricing */}
              <Card title={t('orders.price', locale)} style={styles.card}>
                <Controller control={control} name="total_price" render={({ field }) => (
                  <Input label="Total Price (€)" placeholder="3500" value={field.value} onChangeText={field.onChange} keyboardType="numeric" error={errors.total_price?.message} leftIcon="cash-outline" />
                )} />
              </Card>

              {/* Notes */}
              <Card title={t('orders.specialInstructions', locale)} style={styles.card}>
                <Controller control={control} name="special_instructions" render={({ field }) => (
                  <Input label="" placeholder="Any special handling requirements..." value={field.value} onChangeText={field.onChange} multiline numberOfLines={4} style={{ height: 100, textAlignVertical: 'top' }} />
                )} />
              </Card>

              <Button
                title={t('orders.create', locale)}
                onPress={handleSubmit(onSubmit)}
                loading={createMutation.isPending}
                icon={<Ionicons name="checkmark-circle" size={18} color={Colors.white} />}
                style={styles.nextBtn}
              />
            </>
          )}

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
  stepText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textSecondary },
  stepIndicator: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xxxl * 2, marginBottom: Spacing.xl },
  stepDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.border },
  stepActive: { backgroundColor: Colors.primary },
  stepLine: { flex: 1, height: 2, backgroundColor: Colors.border, marginHorizontal: Spacing.sm },
  stepLineActive: { backgroundColor: Colors.primary },
  scrollContent: { paddingHorizontal: Spacing.xxl },
  card: { marginBottom: Spacing.lg },
  fieldLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.text, marginBottom: Spacing.sm, marginTop: Spacing.md },
  countryScroll: { marginBottom: Spacing.md },
  countryBtn: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, marginRight: Spacing.sm },
  countryActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  countryText: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textSecondary },
  countryTextActive: { color: Colors.white },
  dateBtn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md, backgroundColor: Colors.card, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.border },
  dateText: { fontSize: FontSize.md, color: Colors.text },
  cargoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg },
  cargoBtn: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border },
  cargoActive: { backgroundColor: Colors.primaryBg, borderColor: Colors.primary },
  cargoText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  cargoTextActive: { color: Colors.primary, fontWeight: FontWeight.semibold },
  nextBtn: { marginTop: Spacing.lg },
});
