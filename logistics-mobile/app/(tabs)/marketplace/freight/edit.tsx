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
import { freightApi } from '@/lib/api';
import { useAppStore } from '@/stores/appStore';
import { t } from '@/lib/i18n';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '@/constants/theme';
import { FreightOffer } from '@/types';

const EU_COUNTRIES = [
  'DE', 'FR', 'IT', 'ES', 'RO', 'PL', 'NL', 'BE', 'AT', 'CZ', 'HU', 'BG',
  'HR', 'SK', 'SI', 'LT', 'LV', 'EE', 'PT', 'DK', 'SE', 'FI', 'IE', 'GR',
];

const CARGO_TYPES = [
  'General', 'Palletized', 'Bulk', 'Liquid', 'Refrigerated',
  'Hazardous', 'Oversized', 'Fragile', 'Livestock', 'Automotive',
];

const TRUCK_TYPES = [
  'Curtain Side', 'Box Truck', 'Refrigerated', 'Flatbed',
  'Tanker', 'Container', 'Mega Trailer', 'Van',
];

const CURRENCIES = ['EUR', 'USD', 'GBP', 'RON'];

interface FormState {
  origin_country: string;
  origin_city: string;
  destination_country: string;
  destination_city: string;
  cargo_type: string;
  weight: string;
  volume: string;
  loading_date: string;
  unloading_date: string;
  price: string;
  currency: string;
  description: string;
  requirements: string;
  truck_type: string;
  is_ftl: boolean;
  is_urgent: boolean;
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

export default function EditFreightScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const locale = useAppStore((s) => s.locale);
  const addNotification = useAppStore((s) => s.addNotification);
  const queryClient = useQueryClient();

  const [form, setForm] = useState<FormState>({
    origin_country: '',
    origin_city: '',
    destination_country: '',
    destination_city: '',
    cargo_type: '',
    weight: '',
    volume: '',
    loading_date: '',
    unloading_date: '',
    price: '',
    currency: 'EUR',
    description: '',
    requirements: '',
    truck_type: '',
    is_ftl: false,
    is_urgent: false,
  });

  const [pickerModal, setPickerModal] = useState<{
    visible: boolean;
    field: keyof FormState;
    title: string;
    options: string[];
  }>({ visible: false, field: 'cargo_type', title: '', options: [] });

  const [formInitialized, setFormInitialized] = useState(false);

  const { data: freight, isLoading } = useQuery({
    queryKey: ['freight', id],
    queryFn: async () => {
      const res = await freightApi.get(Number(id));
      return (res.data.data || res.data) as FreightOffer;
    },
    enabled: !!id,
  });

  // Pre-fill form when freight data loads
  useEffect(() => {
    if (freight && !formInitialized) {
      setForm({
        origin_country: freight.origin_country || '',
        origin_city: freight.origin_city || '',
        destination_country: freight.destination_country || '',
        destination_city: freight.destination_city || '',
        cargo_type: freight.cargo_type || '',
        weight: freight.weight ? String(freight.weight) : '',
        volume: freight.volume ? String(freight.volume) : '',
        loading_date: freight.loading_date ? freight.loading_date.split('T')[0] : '',
        unloading_date: freight.unloading_date ? freight.unloading_date.split('T')[0] : '',
        price: freight.price ? String(freight.price) : '',
        currency: freight.currency || 'EUR',
        description: freight.notes || (freight as any).description || '',
        requirements: (freight as any).requirements || '',
        truck_type: freight.vehicle_type || '',
        is_ftl: (freight as any).is_ftl ?? false,
        is_urgent: (freight as any).is_urgent ?? false,
      });
      setFormInitialized(true);
    }
  }, [freight, formInitialized]);

  const updateMutation = useMutation({
    mutationFn: (data: FormState) =>
      freightApi.update(Number(id), {
        origin_country: data.origin_country,
        origin_city: data.origin_city,
        destination_country: data.destination_country,
        destination_city: data.destination_city,
        cargo_type: data.cargo_type,
        weight: parseFloat(data.weight) || 0,
        volume: data.volume ? parseFloat(data.volume) : undefined,
        loading_date: data.loading_date,
        unloading_date: data.unloading_date || undefined,
        price: parseFloat(data.price) || 0,
        currency: data.currency,
        description: data.description || undefined,
        requirements: data.requirements || undefined,
        vehicle_type: data.truck_type || undefined,
        is_ftl: data.is_ftl,
        is_urgent: data.is_urgent,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['freight'] });
      queryClient.invalidateQueries({ queryKey: ['freight', id] });
      addNotification({ type: 'success', title: t('freight.updateSuccess', locale) || 'Freight offer updated' });
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
    if (!form.origin_city || !form.origin_country || !form.destination_city || !form.destination_country) {
      addNotification({ type: 'error', title: 'Please fill in all route fields' });
      return;
    }
    if (!form.cargo_type) {
      addNotification({ type: 'error', title: 'Please select a cargo type' });
      return;
    }
    if (!form.weight || isNaN(parseFloat(form.weight))) {
      addNotification({ type: 'error', title: 'Please enter a valid weight' });
      return;
    }
    if (!form.loading_date) {
      addNotification({ type: 'error', title: 'Please enter a loading date' });
      return;
    }
    if (!form.price || isNaN(parseFloat(form.price))) {
      addNotification({ type: 'error', title: 'Please enter a valid price' });
      return;
    }
    updateMutation.mutate(form);
  };

  if (isLoading || !freight) return <LoadingScreen message="Loading freight offer..." />;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Freight Offer</Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Status Badge */}
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Status</Text>
            <Badge label={freight.status} status={freight.status} size="md" />
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
              placeholder="Berlin"
              leftIcon="location-outline"
            />
            <Input
              label="Destination Country"
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
              label="Destination City"
              value={form.destination_city}
              onChangeText={(v) => updateField('destination_city', v)}
              placeholder="Paris"
              leftIcon="location-outline"
            />
          </Card>

          {/* Section: Cargo */}
          <Card title="Cargo" style={styles.card}>
            <Text style={styles.fieldLabel}>Cargo Type</Text>
            <View style={styles.chipGrid}>
              {CARGO_TYPES.map((ct) => (
                <TouchableOpacity
                  key={ct}
                  onPress={() => updateField('cargo_type', ct)}
                  style={[styles.pill, form.cargo_type === ct && styles.pillActive]}
                >
                  <Text style={[styles.pillText, form.cargo_type === ct && styles.pillTextActive]}>
                    {ct}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Input
              label="Weight (kg)"
              value={form.weight}
              onChangeText={(v) => updateField('weight', v)}
              placeholder="12000"
              keyboardType="numeric"
              leftIcon="scale-outline"
            />
            <Input
              label="Volume (m³)"
              value={form.volume}
              onChangeText={(v) => updateField('volume', v)}
              placeholder="33"
              keyboardType="numeric"
              leftIcon="cube-outline"
            />

            <Text style={styles.fieldLabel}>Truck Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hScroll}>
              {TRUCK_TYPES.map((tt) => (
                <TouchableOpacity
                  key={tt}
                  onPress={() => updateField('truck_type', tt)}
                  style={[styles.pill, form.truck_type === tt && styles.pillActive]}
                >
                  <Text style={[styles.pillText, form.truck_type === tt && styles.pillTextActive]}>
                    {tt}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.toggleRow}>
              <View style={styles.toggleInfo}>
                <Ionicons name="swap-horizontal" size={20} color={Colors.textSecondary} />
                <Text style={styles.toggleLabel}>Full Truck Load (FTL)</Text>
              </View>
              <Switch
                value={form.is_ftl}
                onValueChange={(v) => updateField('is_ftl', v)}
                trackColor={{ false: Colors.border, true: Colors.primaryLight }}
                thumbColor={form.is_ftl ? Colors.primary : Colors.surface}
              />
            </View>

            <View style={styles.toggleRow}>
              <View style={styles.toggleInfo}>
                <Ionicons name="flash" size={20} color={Colors.warning} />
                <Text style={styles.toggleLabel}>Urgent</Text>
              </View>
              <Switch
                value={form.is_urgent}
                onValueChange={(v) => updateField('is_urgent', v)}
                trackColor={{ false: Colors.border, true: Colors.warningLight }}
                thumbColor={form.is_urgent ? Colors.warning : Colors.surface}
              />
            </View>
          </Card>

          {/* Section: Schedule */}
          <Card title="Schedule" style={styles.card}>
            <Input
              label="Loading Date"
              value={form.loading_date}
              onChangeText={(v) => updateField('loading_date', v)}
              placeholder="YYYY-MM-DD"
              leftIcon="calendar-outline"
            />
            <Input
              label="Unloading Date"
              value={form.unloading_date}
              onChangeText={(v) => updateField('unloading_date', v)}
              placeholder="YYYY-MM-DD"
              leftIcon="calendar-outline"
            />
          </Card>

          {/* Section: Pricing */}
          <Card title="Pricing" style={styles.card}>
            <Input
              label="Price"
              value={form.price}
              onChangeText={(v) => updateField('price', v)}
              placeholder="2500"
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
              placeholder="Additional information about this freight..."
              multiline
              numberOfLines={4}
              style={{ height: 100, textAlignVertical: 'top' }}
            />
            <Input
              label="Requirements"
              value={form.requirements}
              onChangeText={(v) => updateField('requirements', v)}
              placeholder="Special requirements, certifications, etc."
              multiline
              numberOfLines={3}
              style={{ height: 80, textAlignVertical: 'top' }}
            />
          </Card>

          {/* Submit */}
          <Button
            title="Update Freight Offer"
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
