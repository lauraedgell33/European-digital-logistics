import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  Switch,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vehicleApi } from '@/lib/api';
import { useAppStore } from '@/stores/appStore';
import { t } from '@/lib/i18n';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '@/constants/theme';
import { VehicleOffer } from '@/types';

const EU_COUNTRIES = [
  'DE', 'FR', 'IT', 'ES', 'RO', 'PL', 'NL', 'BE', 'AT', 'CZ', 'HU', 'BG',
  'HR', 'SK', 'SI', 'LT', 'LV', 'EE', 'PT', 'DK', 'SE', 'FI', 'IE', 'GR',
];

const VEHICLE_TYPES = [
  'Curtain Side', 'Box Truck', 'Refrigerated', 'Flatbed',
  'Tanker', 'Container', 'Mega Trailer', 'Van',
];

const CURRENCIES = ['EUR', 'USD', 'GBP', 'RON'];

interface FormState {
  origin_country: string;
  origin_city: string;
  destination_country: string;
  destination_city: string;
  vehicle_type: string;
  capacity_tons: string;
  capacity_m3: string;
  available_from: string;
  available_until: string;
  price_per_km: string;
  currency: string;
  description: string;
  features: string;
  is_available: boolean;
}

interface PickerModalProps {
  visible: boolean;
  title: string;
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}

function PickerModal({ visible, title, options, selected, onSelect, onClose }: PickerModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={options}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.modalOption, item === selected && styles.modalOptionActive]}
                onPress={() => { onSelect(item); onClose(); }}
              >
                <Text style={[styles.modalOptionText, item === selected && styles.modalOptionTextActive]}>
                  {item}
                </Text>
                {item === selected && (
                  <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                )}
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={styles.modalSeparator} />}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

export default function EditVehicleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const locale = useAppStore((s) => s.locale);
  const addNotification = useAppStore((s) => s.addNotification);
  const queryClient = useQueryClient();

  const [form, setForm] = useState<FormState>({
    origin_country: '',
    origin_city: '',
    destination_country: '',
    destination_city: '',
    vehicle_type: '',
    capacity_tons: '',
    capacity_m3: '',
    available_from: '',
    available_until: '',
    price_per_km: '',
    currency: 'EUR',
    description: '',
    features: '',
    is_available: true,
  });

  const [pickerModal, setPickerModal] = useState<{
    visible: boolean;
    field: keyof FormState;
    title: string;
    options: string[];
  }>({ visible: false, field: 'vehicle_type', title: '', options: [] });

  const [formInitialized, setFormInitialized] = useState(false);

  const { data: vehicle, isLoading } = useQuery({
    queryKey: ['vehicles', id],
    queryFn: async () => {
      const res = await vehicleApi.get(Number(id));
      return (res.data.data || res.data) as VehicleOffer;
    },
    enabled: !!id,
  });

  // Pre-fill form when vehicle data loads
  useEffect(() => {
    if (vehicle && !formInitialized) {
      setForm({
        origin_country: vehicle.current_country || '',
        origin_city: vehicle.current_city || '',
        destination_country: vehicle.destination_country || '',
        destination_city: vehicle.destination_city || '',
        vehicle_type: vehicle.vehicle_type || '',
        capacity_tons: vehicle.capacity_kg ? String(vehicle.capacity_kg / 1000) : '',
        capacity_m3: vehicle.capacity_m3 ? String(vehicle.capacity_m3) : '',
        available_from: vehicle.available_from ? vehicle.available_from.split('T')[0] : '',
        available_until: vehicle.available_to ? vehicle.available_to.split('T')[0] : '',
        price_per_km: vehicle.price_per_km ? String(vehicle.price_per_km) : '',
        currency: vehicle.currency || 'EUR',
        description: vehicle.notes || (vehicle as any).description || '',
        features: Array.isArray(vehicle.equipment) ? vehicle.equipment.join(', ') : (vehicle as any).features || '',
        is_available: vehicle.status === 'available',
      });
      setFormInitialized(true);
    }
  }, [vehicle, formInitialized]);

  const updateMutation = useMutation({
    mutationFn: (data: FormState) =>
      vehicleApi.update(Number(id), {
        current_country: data.origin_country,
        current_city: data.origin_city,
        destination_country: data.destination_country || undefined,
        destination_city: data.destination_city || undefined,
        vehicle_type: data.vehicle_type,
        capacity_kg: data.capacity_tons ? parseFloat(data.capacity_tons) * 1000 : undefined,
        capacity_m3: data.capacity_m3 ? parseFloat(data.capacity_m3) : undefined,
        available_from: data.available_from,
        available_to: data.available_until || undefined,
        price_per_km: data.price_per_km ? parseFloat(data.price_per_km) : undefined,
        currency: data.currency,
        description: data.description || undefined,
        features: data.features || undefined,
        is_available: data.is_available,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles', id] });
      addNotification({ type: 'success', title: t('vehicles.updateSuccess', locale) || 'Vehicle offer updated' });
      router.back();
    },
    onError: () => {
      addNotification({ type: 'error', title: t('common.error', locale) });
    },
  });

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const openPicker = (field: keyof FormState, title: string, options: string[]) => {
    setPickerModal({ visible: true, field, title, options });
  };

  const handleSubmit = () => {
    if (!form.origin_city || !form.origin_country) {
      addNotification({ type: 'error', title: 'Please fill in origin location' });
      return;
    }
    if (!form.vehicle_type) {
      addNotification({ type: 'error', title: 'Please select a vehicle type' });
      return;
    }
    if (!form.capacity_tons || isNaN(parseFloat(form.capacity_tons))) {
      addNotification({ type: 'error', title: 'Please enter a valid capacity' });
      return;
    }
    if (!form.available_from) {
      addNotification({ type: 'error', title: 'Please enter availability start date' });
      return;
    }
    if (!form.price_per_km || isNaN(parseFloat(form.price_per_km))) {
      addNotification({ type: 'error', title: 'Please enter a valid price per km' });
      return;
    }
    updateMutation.mutate(form);
  };

  if (isLoading || !vehicle) return <LoadingScreen message="Loading vehicle offer..." />;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Vehicle Offer</Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Status Badge */}
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Status</Text>
            <Badge label={vehicle.status} status={vehicle.status} size="md" />
          </View>

          {/* Section: Route */}
          <Card title="Route" style={styles.card}>
            <Input
              label="Origin Country"
              value={form.origin_country}
              onChangeText={(v) => updateField('origin_country', v)}
              placeholder="DE"
              rightIcon={
                <TouchableOpacity onPress={() => openPicker('origin_country', 'Origin Country', EU_COUNTRIES)}>
                  <Ionicons name="chevron-down" size={18} color={Colors.textTertiary} />
                </TouchableOpacity>
              }
            />
            <Input
              label="Origin City"
              value={form.origin_city}
              onChangeText={(v) => updateField('origin_city', v)}
              placeholder="Munich"
              leftIcon="location-outline"
            />
            <Input
              label="Destination Country (optional)"
              value={form.destination_country}
              onChangeText={(v) => updateField('destination_country', v)}
              placeholder="FR"
              rightIcon={
                <TouchableOpacity onPress={() => openPicker('destination_country', 'Destination Country', EU_COUNTRIES)}>
                  <Ionicons name="chevron-down" size={18} color={Colors.textTertiary} />
                </TouchableOpacity>
              }
            />
            <Input
              label="Destination City (optional)"
              value={form.destination_city}
              onChangeText={(v) => updateField('destination_city', v)}
              placeholder="Paris"
              leftIcon="location-outline"
            />
          </Card>

          {/* Section: Vehicle */}
          <Card title="Vehicle" style={styles.card}>
            <Text style={styles.fieldLabel}>Vehicle Type</Text>
            <View style={styles.chipGrid}>
              {VEHICLE_TYPES.map((vt) => (
                <TouchableOpacity
                  key={vt}
                  onPress={() => updateField('vehicle_type', vt)}
                  style={[styles.pill, form.vehicle_type === vt && styles.pillActive]}
                >
                  <Text style={[styles.pillText, form.vehicle_type === vt && styles.pillTextActive]}>
                    {vt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Input
              label="Capacity (tons)"
              value={form.capacity_tons}
              onChangeText={(v) => updateField('capacity_tons', v)}
              placeholder="24"
              keyboardType="numeric"
              leftIcon="speedometer-outline"
            />
            <Input
              label="Capacity (m³)"
              value={form.capacity_m3}
              onChangeText={(v) => updateField('capacity_m3', v)}
              placeholder="90"
              keyboardType="numeric"
              leftIcon="cube-outline"
            />

            <View style={styles.toggleRow}>
              <View style={styles.toggleInfo}>
                <Ionicons name="checkmark-circle" size={20} color={form.is_available ? Colors.success : Colors.textTertiary} />
                <Text style={styles.toggleLabel}>Available</Text>
              </View>
              <Switch
                value={form.is_available}
                onValueChange={(v) => updateField('is_available', v)}
                trackColor={{ false: Colors.border, true: Colors.successLight }}
                thumbColor={form.is_available ? Colors.success : Colors.surface}
              />
            </View>
          </Card>

          {/* Section: Availability */}
          <Card title="Availability" style={styles.card}>
            <Input
              label="Available From"
              value={form.available_from}
              onChangeText={(v) => updateField('available_from', v)}
              placeholder="YYYY-MM-DD"
              leftIcon="calendar-outline"
            />
            <Input
              label="Available Until"
              value={form.available_until}
              onChangeText={(v) => updateField('available_until', v)}
              placeholder="YYYY-MM-DD"
              leftIcon="calendar-outline"
            />
          </Card>

          {/* Section: Pricing */}
          <Card title="Pricing" style={styles.card}>
            <Input
              label="Price per km"
              value={form.price_per_km}
              onChangeText={(v) => updateField('price_per_km', v)}
              placeholder="1.20"
              keyboardType="numeric"
              leftIcon="cash-outline"
            />
            <Text style={styles.fieldLabel}>Currency</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hScroll}>
              {CURRENCIES.map((c) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => updateField('currency', c)}
                  style={[styles.pill, form.currency === c && styles.pillActive]}
                >
                  <Text style={[styles.pillText, form.currency === c && styles.pillTextActive]}>
                    {c}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Card>

          {/* Section: Details */}
          <Card title="Details" style={styles.card}>
            <Input
              label="Description"
              value={form.description}
              onChangeText={(v) => updateField('description', v)}
              placeholder="Additional information about this vehicle..."
              multiline
              numberOfLines={4}
              style={{ height: 100, textAlignVertical: 'top' }}
            />
            <Input
              label="Features"
              value={form.features}
              onChangeText={(v) => updateField('features', v)}
              placeholder="GPS tracking, tail lift, double deck..."
              multiline
              numberOfLines={3}
              style={{ height: 80, textAlignVertical: 'top' }}
            />
          </Card>

          {/* Submit */}
          <Button
            title="Update Vehicle Offer"
            onPress={handleSubmit}
            loading={updateMutation.isPending}
            disabled={updateMutation.isPending}
            icon={<Ionicons name="checkmark-circle" size={18} color={Colors.white} />}
            style={styles.submitBtn}
          />

          <View style={{ height: Spacing.xxxl * 2 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Picker Modal */}
      <PickerModal
        visible={pickerModal.visible}
        title={pickerModal.title}
        options={pickerModal.options}
        selected={form[pickerModal.field] as string}
        onSelect={(value) => updateField(pickerModal.field, value as any)}
        onClose={() => setPickerModal((prev) => ({ ...prev, visible: false }))}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.lg,
    gap: Spacing.md,
  },
  backBtn: {
    marginRight: Spacing.sm,
  },
  headerTitle: {
    flex: 1,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xxl,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadow.sm,
  },
  statusLabel: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },
  card: {
    marginBottom: Spacing.lg,
  },
  fieldLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.text,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  hScroll: {
    marginBottom: Spacing.md,
  },
  pill: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  pillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pillText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },
  pillTextActive: {
    color: Colors.white,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    marginTop: Spacing.sm,
  },
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  toggleLabel: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.text,
  },
  submitBtn: {
    marginTop: Spacing.lg,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: '60%',
    paddingBottom: Spacing.xxxl,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.lg,
  },
  modalOptionActive: {
    backgroundColor: Colors.primaryBg,
  },
  modalOptionText: {
    fontSize: FontSize.md,
    color: Colors.text,
  },
  modalOptionTextActive: {
    color: Colors.primary,
    fontWeight: FontWeight.semibold,
  },
  modalSeparator: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginHorizontal: Spacing.xxl,
  },
});
