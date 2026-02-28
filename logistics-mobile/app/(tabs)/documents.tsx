import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { useAppStore } from '@/stores/appStore';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '@/constants/theme';

type DocType = 'cmr' | 'invoice' | 'delivery_note' | 'customs' | 'insurance' | 'other';

interface ScannedDocument {
  id: number;
  original_filename: string;
  document_type: DocType;
  status: 'processing' | 'completed' | 'failed';
  extracted_data?: Record<string, any>;
  confidence_score?: number;
  validation_result?: { valid: boolean; errors: string[] };
  created_at: string;
}

const DOC_TYPES: { key: DocType; label: string; icon: string }[] = [
  { key: 'cmr', label: 'CMR / eCMR', icon: 'document-text' },
  { key: 'invoice', label: 'Invoice', icon: 'receipt' },
  { key: 'delivery_note', label: 'Delivery Note', icon: 'clipboard' },
  { key: 'customs', label: 'Customs', icon: 'globe' },
  { key: 'insurance', label: 'Insurance', icon: 'shield-checkmark' },
  { key: 'other', label: 'Other', icon: 'documents' },
];

export default function DocumentsScreen() {
  const [selectedType, setSelectedType] = useState<DocType>('cmr');
  const [isScanning, setIsScanning] = useState(false);
  const { addNotification } = useAppStore();
  const queryClient = useQueryClient();

  // Fetch scanned documents
  const { data: documents, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['scanned-documents'],
    queryFn: async () => {
      const res = await api.get('/documents/ocr');
      return (res.data.data || res.data || []) as ScannedDocument[];
    },
  });

  // Upload & scan mutation
  const scanMutation = useMutation({
    mutationFn: async (uri: string) => {
      const form = new FormData();
      form.append('file', {
        uri,
        name: `scan_${Date.now()}.jpg`,
        type: 'image/jpeg',
      } as any);
      form.append('document_type', selectedType);

      const res = await api.post('/documents/ocr/scan', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scanned-documents'] });
      addNotification({
        type: 'success',
        title: 'Document Scanned',
        message: 'Document is being processed. OCR results will be available shortly.',
      });
    },
    onError: () => {
      addNotification({
        type: 'error',
        title: 'Scan Failed',
        message: 'Failed to scan document. Please try again.',
      });
    },
  });

  const handleCameraScan = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera access is required to scan documents.');
      return;
    }

    setIsScanning(true);
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.9,
      allowsEditing: true,
    });
    setIsScanning(false);

    if (!result.canceled && result.assets[0]) {
      scanMutation.mutate(result.assets[0].uri);
    }
  };

  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        scanMutation.mutate(result.assets[0].uri);
      }
    } catch {
      // User cancelled
    }
  };

  if (isLoading) return <LoadingScreen />;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Document Scanner</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Document Type Selector */}
        <Text style={styles.sectionTitle}>Document Type</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroller}>
          {DOC_TYPES.map((dt) => (
            <TouchableOpacity
              key={dt.key}
              style={[styles.typeChip, selectedType === dt.key && styles.typeChipActive]}
              onPress={() => setSelectedType(dt.key)}
            >
              <Ionicons
                name={dt.icon as any}
                size={18}
                color={selectedType === dt.key ? Colors.white : Colors.textSecondary}
              />
              <Text style={[styles.typeChipText, selectedType === dt.key && styles.typeChipTextActive]}>
                {dt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Scan Actions */}
        <View style={styles.scanActions}>
          <TouchableOpacity
            style={styles.scanBtn}
            onPress={handleCameraScan}
            disabled={scanMutation.isPending}
          >
            {scanMutation.isPending ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <>
                <Ionicons name="camera" size={32} color={Colors.white} />
                <Text style={styles.scanBtnText}>Scan with Camera</Text>
                <Text style={styles.scanBtnHint}>Point at document & capture</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.uploadBtn} onPress={handleFilePick}>
            <Ionicons name="cloud-upload" size={24} color={Colors.primary} />
            <Text style={styles.uploadBtnText}>Upload File</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Scans */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Scans</Text>
          <Text style={styles.scanCount}>{documents?.length || 0} documents</Text>
        </View>

        {documents && documents.length > 0 ? (
          documents.map((doc) => (
            <Card key={doc.id} style={styles.docCard}>
              <View style={styles.docRow}>
                <View style={styles.docIconWrap}>
                  <Ionicons
                    name={
                      doc.status === 'completed' ? 'checkmark-circle' :
                      doc.status === 'processing' ? 'time' : 'alert-circle'
                    }
                    size={20}
                    color={
                      doc.status === 'completed' ? Colors.success :
                      doc.status === 'processing' ? Colors.warning : Colors.danger
                    }
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.docFilename} numberOfLines={1}>{doc.original_filename}</Text>
                  <View style={styles.docMeta}>
                    <Badge
                      label={doc.document_type.replace('_', ' ')}
                      variant="default"
                    />
                    {doc.confidence_score != null && (
                      <Text style={styles.confidenceText}>
                        {Math.round(doc.confidence_score * 100)}% confidence
                      </Text>
                    )}
                  </View>
                </View>
                <Text style={styles.docDate}>
                  {new Date(doc.created_at).toLocaleDateString()}
                </Text>
              </View>

              {doc.status === 'completed' && doc.extracted_data && (
                <View style={styles.extractedData}>
                  {Object.entries(doc.extracted_data).slice(0, 4).map(([key, val]) => (
                    <View key={key} style={styles.extractedRow}>
                      <Text style={styles.extractedKey}>{key.replace(/_/g, ' ')}</Text>
                      <Text style={styles.extractedVal} numberOfLines={1}>{String(val)}</Text>
                    </View>
                  ))}
                </View>
              )}

              {doc.validation_result && !doc.validation_result.valid && (
                <View style={styles.validationErrors}>
                  {doc.validation_result.errors.map((err, i) => (
                    <View key={i} style={styles.errorRow}>
                      <Ionicons name="warning" size={14} color={Colors.danger} />
                      <Text style={styles.errorText}>{err}</Text>
                    </View>
                  ))}
                </View>
              )}
            </Card>
          ))
        ) : (
          <View style={styles.empty}>
            <Ionicons name="scan-outline" size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyText}>No scanned documents yet</Text>
            <Text style={styles.emptyHint}>Use the camera or upload a file to start scanning</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
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
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl * 2,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scanCount: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
  },
  typeScroller: {
    marginBottom: Spacing.lg,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceSecondary,
    marginRight: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  typeChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  typeChipText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  typeChipTextActive: {
    color: Colors.white,
  },
  scanActions: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  scanBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.xl,
    gap: Spacing.xs,
    ...Shadow.md,
  },
  scanBtnText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
  scanBtnHint: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.7)',
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
  },
  uploadBtnText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.primary,
  },
  docCard: {
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  docIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  docFilename: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
  docMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: 4,
  },
  confidenceText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  docDate: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
  },
  extractedData: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  extractedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  extractedKey: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    textTransform: 'capitalize',
  },
  extractedVal: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    color: Colors.text,
    maxWidth: '60%',
    textAlign: 'right',
  },
  validationErrors: {
    marginTop: Spacing.sm,
    padding: Spacing.sm,
    backgroundColor: Colors.dangerLight,
    borderRadius: BorderRadius.sm,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  errorText: {
    fontSize: FontSize.xs,
    color: Colors.dangerDark,
  },
  empty: {
    alignItems: 'center',
    paddingTop: Spacing.xxl,
    gap: Spacing.sm,
  },
  emptyText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },
  emptyHint: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
});
