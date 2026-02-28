import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '@/constants/theme';

interface EcmrDocument {
  id: number;
  ecmr_number: string;
  transport_order_id: number;
  status: string;
  sender_name: string;
  sender_address: string;
  carrier_name: string;
  carrier_address: string;
  consignee_name: string;
  consignee_address: string;
  goods_description: string;
  weight: number;
  packages_count: number;
  pickup_date: string;
  delivery_date: string;
  pickup_location: string;
  delivery_location: string;
  sender_signed_at?: string;
  carrier_signed_at?: string;
  consignee_signed_at?: string;
  blockchain_hash?: string;
  notes?: string;
  created_at: string;
}

export default function EcmrSignScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [signatureInput, setSignatureInput] = useState('');
  const [signingRole, setSigningRole] = useState<'sender' | 'carrier' | 'consignee' | null>(null);

  const { data: ecmr, isLoading } = useQuery({
    queryKey: ['ecmr', id],
    queryFn: async () => {
      const res = await api.get(`/ecmr/${id}`);
      return (res.data.data || res.data) as EcmrDocument;
    },
  });

  const signMutation = useMutation({
    mutationFn: async (role: string) => {
      const res = await api.post(`/ecmr/${id}/sign`, {
        role,
        signature: signatureInput,
        signed_at: new Date().toISOString(),
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ecmr', id] });
      setSigningRole(null);
      setSignatureInput('');
      Alert.alert('Success', 'eCMR signed successfully. Recorded on blockchain.');
    },
    onError: () => {
      Alert.alert('Error', 'Failed to sign eCMR. Please try again.');
    },
  });

  if (isLoading) return <LoadingScreen />;
  if (!ecmr) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>eCMR document not found.</Text>
      </SafeAreaView>
    );
  }

  const statusColor =
    ecmr.status === 'completed' ? 'success' :
    ecmr.status === 'in_transit' ? 'info' :
    ecmr.status === 'draft' ? 'default' : 'warning';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>eCMR Document</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Document Header */}
        <Card style={styles.docHeader}>
          <View style={styles.docHeaderRow}>
            <View>
              <Text style={styles.ecmrNumber}>{ecmr.ecmr_number}</Text>
              <Text style={styles.ecmrDate}>Created: {new Date(ecmr.created_at).toLocaleDateString()}</Text>
            </View>
            <Badge label={ecmr.status.replace('_', ' ')} variant={statusColor as any} />
          </View>
          {ecmr.blockchain_hash && (
            <View style={styles.blockchainRow}>
              <Ionicons name="shield-checkmark" size={14} color={Colors.success} />
              <Text style={styles.blockchainText} numberOfLines={1}>
                Blockchain: {ecmr.blockchain_hash.substring(0, 20)}...
              </Text>
            </View>
          )}
        </Card>

        {/* Parties */}
        <Text style={styles.sectionTitle}>Parties</Text>
        <Card style={styles.partyCard}>
          <PartyRow
            label="Sender"
            name={ecmr.sender_name}
            address={ecmr.sender_address}
            signed={!!ecmr.sender_signed_at}
            signedAt={ecmr.sender_signed_at}
            icon="arrow-up-circle"
          />
          <View style={styles.partyDivider} />
          <PartyRow
            label="Carrier"
            name={ecmr.carrier_name}
            address={ecmr.carrier_address}
            signed={!!ecmr.carrier_signed_at}
            signedAt={ecmr.carrier_signed_at}
            icon="bus"
          />
          <View style={styles.partyDivider} />
          <PartyRow
            label="Consignee"
            name={ecmr.consignee_name}
            address={ecmr.consignee_address}
            signed={!!ecmr.consignee_signed_at}
            signedAt={ecmr.consignee_signed_at}
            icon="arrow-down-circle"
          />
        </Card>

        {/* Goods */}
        <Text style={styles.sectionTitle}>Goods</Text>
        <Card style={styles.goodsCard}>
          <Text style={styles.goodsDesc}>{ecmr.goods_description}</Text>
          <View style={styles.goodsRow}>
            <View style={styles.goodsStat}>
              <Ionicons name="scale" size={16} color={Colors.textSecondary} />
              <Text style={styles.goodsStatText}>{ecmr.weight} kg</Text>
            </View>
            <View style={styles.goodsStat}>
              <Ionicons name="cube" size={16} color={Colors.textSecondary} />
              <Text style={styles.goodsStatText}>{ecmr.packages_count} packages</Text>
            </View>
          </View>
        </Card>

        {/* Route */}
        <Text style={styles.sectionTitle}>Route</Text>
        <Card style={styles.routeCard}>
          <View style={styles.routePoint}>
            <View style={styles.routeDotGreen} />
            <View style={{ flex: 1 }}>
              <Text style={styles.routeLabel}>Pickup</Text>
              <Text style={styles.routeLocation}>{ecmr.pickup_location}</Text>
              <Text style={styles.routeDate}>{ecmr.pickup_date}</Text>
            </View>
          </View>
          <View style={styles.routeLine} />
          <View style={styles.routePoint}>
            <View style={styles.routeDotRed} />
            <View style={{ flex: 1 }}>
              <Text style={styles.routeLabel}>Delivery</Text>
              <Text style={styles.routeLocation}>{ecmr.delivery_location}</Text>
              <Text style={styles.routeDate}>{ecmr.delivery_date}</Text>
            </View>
          </View>
        </Card>

        {/* Signing Section */}
        {ecmr.status !== 'completed' && (
          <>
            <Text style={styles.sectionTitle}>Digital Signature</Text>
            <Card style={styles.signCard}>
              {signingRole === null ? (
                <View style={styles.signActions}>
                  {!ecmr.sender_signed_at && (
                    <TouchableOpacity
                      style={styles.signBtn}
                      onPress={() => setSigningRole('sender')}
                    >
                      <Ionicons name="create" size={20} color={Colors.primary} />
                      <Text style={styles.signBtnText}>Sign as Sender</Text>
                    </TouchableOpacity>
                  )}
                  {!ecmr.carrier_signed_at && (
                    <TouchableOpacity
                      style={styles.signBtn}
                      onPress={() => setSigningRole('carrier')}
                    >
                      <Ionicons name="create" size={20} color={Colors.info} />
                      <Text style={[styles.signBtnText, { color: Colors.info }]}>Sign as Carrier</Text>
                    </TouchableOpacity>
                  )}
                  {!ecmr.consignee_signed_at && (
                    <TouchableOpacity
                      style={styles.signBtn}
                      onPress={() => setSigningRole('consignee')}
                    >
                      <Ionicons name="create" size={20} color={Colors.success} />
                      <Text style={[styles.signBtnText, { color: Colors.success }]}>Sign as Consignee</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                <View>
                  <Text style={styles.signingTitle}>
                    Signing as {signingRole.charAt(0).toUpperCase() + signingRole.slice(1)}
                  </Text>
                  <TextInput
                    style={styles.signatureInput}
                    value={signatureInput}
                    onChangeText={setSignatureInput}
                    placeholder="Type your full name to sign"
                    placeholderTextColor={Colors.textTertiary}
                    autoFocus
                  />
                  <Text style={styles.signDisclaimer}>
                    By signing, you acknowledge the contents of this eCMR document.
                    The signature will be recorded on the blockchain.
                  </Text>
                  <View style={styles.signConfirmRow}>
                    <TouchableOpacity
                      style={styles.cancelSignBtn}
                      onPress={() => {
                        setSigningRole(null);
                        setSignatureInput('');
                      }}
                    >
                      <Text style={styles.cancelSignText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.confirmSignBtn, !signatureInput && styles.disabledBtn]}
                      onPress={() => signMutation.mutate(signingRole)}
                      disabled={!signatureInput || signMutation.isPending}
                    >
                      <Ionicons name="shield-checkmark" size={18} color={Colors.white} />
                      <Text style={styles.confirmSignText}>
                        {signMutation.isPending ? 'Signing...' : 'Sign & Record'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </Card>
          </>
        )}

        {ecmr.notes && (
          <>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Card>
              <Text style={styles.notesText}>{ecmr.notes}</Text>
            </Card>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function PartyRow({
  label, name, address, signed, signedAt, icon,
}: {
  label: string; name: string; address: string;
  signed: boolean; signedAt?: string; icon: string;
}) {
  return (
    <View style={styles.partyRow}>
      <Ionicons name={icon as any} size={20} color={Colors.primary} />
      <View style={{ flex: 1, marginLeft: Spacing.sm }}>
        <Text style={styles.partyLabel}>{label}</Text>
        <Text style={styles.partyName}>{name}</Text>
        <Text style={styles.partyAddress}>{address}</Text>
      </View>
      {signed ? (
        <View style={styles.signedBadge}>
          <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
          <Text style={styles.signedText}>Signed</Text>
        </View>
      ) : (
        <Badge label="Pending" variant="warning" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  backBtn: { padding: Spacing.xs },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  errorText: {
    fontSize: FontSize.md,
    color: Colors.danger,
    textAlign: 'center',
    marginTop: Spacing.xxl,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl * 2,
  },
  docHeader: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  docHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ecmrNumber: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  ecmrDate: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  blockchainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  blockchainText: {
    flex: 1,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  partyCard: {
    padding: Spacing.md,
  },
  partyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  partyDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: Spacing.xs,
  },
  partyLabel: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  partyName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
  partyAddress: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  signedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  signedText: {
    fontSize: FontSize.xs,
    color: Colors.success,
    fontWeight: FontWeight.medium,
  },
  goodsCard: {
    padding: Spacing.md,
  },
  goodsDesc: {
    fontSize: FontSize.sm,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  goodsRow: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  goodsStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  goodsStatText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  routeCard: {
    padding: Spacing.md,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  routeLabel: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  routeLocation: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.text,
  },
  routeDate: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  routeDotGreen: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.success,
    marginTop: 4,
  },
  routeDotRed: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.danger,
    marginTop: 4,
  },
  routeLine: {
    width: 2,
    height: 24,
    backgroundColor: Colors.border,
    marginLeft: 5,
    marginVertical: 4,
  },
  signCard: {
    padding: Spacing.lg,
  },
  signActions: {
    gap: Spacing.sm,
  },
  signBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  signBtnText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.primary,
  },
  signingTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  signatureInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSize.lg,
    color: Colors.text,
    fontStyle: 'italic',
    marginBottom: Spacing.sm,
  },
  signDisclaimer: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    lineHeight: 16,
    marginBottom: Spacing.md,
  },
  signConfirmRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  cancelSignBtn: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  cancelSignText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.text,
  },
  confirmSignBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary,
  },
  disabledBtn: {
    opacity: 0.5,
  },
  confirmSignText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
  notesText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});
