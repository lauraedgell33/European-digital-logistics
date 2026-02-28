import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useMutation } from '@tanstack/react-query';
import { orderApi } from '@/lib/api';
import { useDriverStore } from '@/stores/driverStore';
import { useAppStore } from '@/stores/appStore';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '@/constants/theme';

type Step = 'status' | 'photos' | 'notes' | 'confirm';

export default function PodScreen() {
  const { orderId, taskId, type } = useLocalSearchParams<{
    orderId: string;
    taskId: string;
    type: string;
  }>();

  const [step, setStep] = useState<Step>('status');
  const [photos, setPhotos] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [damageReported, setDamageReported] = useState(false);
  const [damageDescription, setDamageDescription] = useState('');

  const { updateTaskStatus, completeTask, addPodPhoto, isOnline, addOfflineAction } = useDriverStore();
  const { addNotification } = useAppStore();

  const numTaskId = Number(taskId);
  const numOrderId = Number(orderId);
  const isDelivery = type === 'delivery';

  // Upload POD mutation
  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!isOnline) {
        addOfflineAction({
          type: 'upload_pod',
          payload: {
            orderId: numOrderId,
            taskId: numTaskId,
            photos,
            notes,
            damageReported,
            damageDescription,
          },
        });
        return { success: true, offline: true };
      }

      // Upload photos
      for (const uri of photos) {
        await orderApi.uploadDocument(numOrderId, uri, `pod_${Date.now()}.jpg`, 'pod');
      }

      // Update order status
      const newStatus = isDelivery ? 'delivered' : 'picked_up';
      await orderApi.updateStatus(numOrderId, {
        status: newStatus,
        notes,
        damage_reported: damageReported,
        damage_description: damageDescription,
      });

      return { success: true, offline: false };
    },
    onSuccess: (result) => {
      completeTask(numTaskId);
      addNotification({
        type: 'success',
        title: isDelivery ? 'Delivery Confirmed' : 'Pickup Confirmed',
        message: result?.offline
          ? 'POD saved offline. Will sync when connected.'
          : `Order #${orderId} ${isDelivery ? 'delivered' : 'picked up'} successfully.`,
      });
      router.back();
    },
    onError: () => {
      addNotification({
        type: 'error',
        title: 'Upload Failed',
        message: 'Failed to submit POD. Please try again.',
      });
    },
  });

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera access is required to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
      aspect: [4, 3],
    });

    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setPhotos((prev) => [...prev, uri]);
      addPodPhoto(numTaskId, uri);
    }
  };

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Gallery access is required to select photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.7,
      selectionLimit: 5,
    });

    if (!result.canceled) {
      const uris = result.assets.map((a) => a.uri);
      setPhotos((prev) => [...prev, ...uris]);
      uris.forEach((uri) => addPodPhoto(numTaskId, uri));
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const steps: Step[] = ['status', 'photos', 'notes', 'confirm'];
  const stepIndex = steps.indexOf(step);

  const handleNext = () => {
    if (stepIndex < steps.length - 1) {
      setStep(steps[stepIndex + 1]);
    }
  };

  const handleBack = () => {
    if (stepIndex > 0) {
      setStep(steps[stepIndex - 1]);
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isDelivery ? 'Proof of Delivery' : 'Pickup Confirmation'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Progress */}
      <View style={styles.progress}>
        {steps.map((s, i) => (
          <View key={s} style={styles.progressItem}>
            <View
              style={[
                styles.progressDot,
                i <= stepIndex && styles.progressDotActive,
                i < stepIndex && styles.progressDotDone,
              ]}
            >
              {i < stepIndex ? (
                <Ionicons name="checkmark" size={12} color={Colors.white} />
              ) : (
                <Text style={[styles.progressDotText, i <= stepIndex && styles.progressDotTextActive]}>
                  {i + 1}
                </Text>
              )}
            </View>
            {i < steps.length - 1 && (
              <View style={[styles.progressLine, i < stepIndex && styles.progressLineActive]} />
            )}
          </View>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Step 1: Status Update */}
        {step === 'status' && (
          <View>
            <Text style={styles.stepTitle}>Update Status</Text>
            <Text style={styles.stepDesc}>
              Confirm your arrival at the {isDelivery ? 'delivery' : 'pickup'} location.
            </Text>

            <Card style={styles.statusCard}>
              <TouchableOpacity
                style={[styles.statusOption, styles.statusOptionActive]}
                onPress={() => {
                  updateTaskStatus(numTaskId, 'arrived');
                  handleNext();
                }}
              >
                <View style={styles.statusIconWrap}>
                  <Ionicons name="location" size={24} color={Colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.statusOptionTitle}>I have arrived</Text>
                  <Text style={styles.statusOptionDesc}>
                    I am at the {isDelivery ? 'delivery' : 'pickup'} location
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.textTertiary} />
              </TouchableOpacity>
            </Card>

            <Card style={[styles.statusCard, { marginTop: Spacing.md }]}>
              <TouchableOpacity
                style={styles.statusOption}
                onPress={() => {
                  Alert.alert(
                    'Report Issue',
                    'What issue are you experiencing?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Cannot access location',
                        onPress: () => {
                          updateTaskStatus(numTaskId, 'failed');
                          addNotification({
                            type: 'warning',
                            title: 'Issue Reported',
                            message: 'Dispatch has been notified.',
                          });
                          router.back();
                        },
                      },
                      {
                        text: 'Customer not available',
                        onPress: () => {
                          updateTaskStatus(numTaskId, 'failed');
                          router.back();
                        },
                      },
                    ]
                  );
                }}
              >
                <View style={[styles.statusIconWrap, { backgroundColor: Colors.dangerLight }]}>
                  <Ionicons name="alert-circle" size={24} color={Colors.danger} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.statusOptionTitle}>Report Issue</Text>
                  <Text style={styles.statusOptionDesc}>
                    Cannot complete {isDelivery ? 'delivery' : 'pickup'}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.textTertiary} />
              </TouchableOpacity>
            </Card>
          </View>
        )}

        {/* Step 2: Photo Capture */}
        {step === 'photos' && (
          <View>
            <Text style={styles.stepTitle}>Take Photos</Text>
            <Text style={styles.stepDesc}>
              Capture photos of the {isDelivery ? 'delivered goods' : 'goods being loaded'}.
              {isDelivery ? ' Include photos of the goods at the delivery point.' : ''}
            </Text>

            <View style={styles.photoActions}>
              <TouchableOpacity style={styles.photoBtn} onPress={takePhoto}>
                <Ionicons name="camera" size={28} color={Colors.primary} />
                <Text style={styles.photoBtnText}>Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.photoBtn} onPress={pickFromGallery}>
                <Ionicons name="images" size={28} color={Colors.secondary} />
                <Text style={styles.photoBtnText}>Gallery</Text>
              </TouchableOpacity>
            </View>

            {photos.length > 0 && (
              <View style={styles.photoGrid}>
                {photos.map((uri, index) => (
                  <View key={index} style={styles.photoItem}>
                    <Image source={{ uri }} style={styles.photoImage} />
                    <TouchableOpacity
                      style={styles.photoRemove}
                      onPress={() => removePhoto(index)}
                    >
                      <Ionicons name="close-circle" size={24} color={Colors.danger} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            <Text style={styles.photoCount}>{photos.length} photo(s) captured</Text>
          </View>
        )}

        {/* Step 3: Notes & Damage */}
        {step === 'notes' && (
          <View>
            <Text style={styles.stepTitle}>Notes & Damage Report</Text>
            <Text style={styles.stepDesc}>Add any notes about the {isDelivery ? 'delivery' : 'pickup'}.</Text>

            <Text style={styles.inputLabel}>Notes (optional)</Text>
            <TextInput
              style={styles.textArea}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add any relevant notes..."
              placeholderTextColor={Colors.textTertiary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={styles.damageToggle}
              onPress={() => setDamageReported(!damageReported)}
            >
              <Ionicons
                name={damageReported ? 'checkbox' : 'square-outline'}
                size={24}
                color={damageReported ? Colors.danger : Colors.textTertiary}
              />
              <Text style={styles.damageToggleText}>Report damage</Text>
            </TouchableOpacity>

            {damageReported && (
              <>
                <Text style={[styles.inputLabel, { color: Colors.danger }]}>Damage Description *</Text>
                <TextInput
                  style={[styles.textArea, { borderColor: Colors.danger }]}
                  value={damageDescription}
                  onChangeText={setDamageDescription}
                  placeholder="Describe the damage..."
                  placeholderTextColor={Colors.textTertiary}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </>
            )}
          </View>
        )}

        {/* Step 4: Confirmation */}
        {step === 'confirm' && (
          <View>
            <Text style={styles.stepTitle}>Confirm {isDelivery ? 'Delivery' : 'Pickup'}</Text>
            <Text style={styles.stepDesc}>Review and confirm the proof of {isDelivery ? 'delivery' : 'pickup'}.</Text>

            <Card style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Order</Text>
                <Text style={styles.summaryValue}>#{orderId}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Type</Text>
                <Badge label={isDelivery ? 'Delivery' : 'Pickup'} variant={isDelivery ? 'success' : 'info'} />
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Photos</Text>
                <Text style={styles.summaryValue}>{photos.length} captured</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Notes</Text>
                <Text style={styles.summaryValue}>{notes || 'None'}</Text>
              </View>
              {damageReported && (
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: Colors.danger }]}>Damage</Text>
                  <Text style={[styles.summaryValue, { color: Colors.danger }]}>{damageDescription}</Text>
                </View>
              )}
              {!isOnline && (
                <View style={styles.offlineNote}>
                  <Ionicons name="cloud-offline" size={16} color={Colors.warning} />
                  <Text style={styles.offlineNoteText}>
                    You are offline. POD will be synced when connected.
                  </Text>
                </View>
              )}
            </Card>
          </View>
        )}
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomBar}>
        {step !== 'status' && (
          <TouchableOpacity style={styles.secondaryBtn} onPress={handleBack}>
            <Text style={styles.secondaryBtnText}>Back</Text>
          </TouchableOpacity>
        )}
        {step === 'photos' || step === 'notes' ? (
          <TouchableOpacity style={styles.primaryBtn} onPress={handleNext}>
            <Text style={styles.primaryBtnText}>Continue</Text>
            <Ionicons name="arrow-forward" size={18} color={Colors.white} />
          </TouchableOpacity>
        ) : step === 'confirm' ? (
          <TouchableOpacity
            style={[styles.primaryBtn, styles.confirmBtn]}
            onPress={() => uploadMutation.mutate()}
            disabled={uploadMutation.isPending}
          >
            <Ionicons name="checkmark-circle" size={20} color={Colors.white} />
            <Text style={styles.primaryBtnText}>
              {uploadMutation.isPending ? 'Submitting...' : `Confirm ${isDelivery ? 'Delivery' : 'Pickup'}`}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
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
  progress: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.md,
  },
  progressItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  progressDotActive: {
    backgroundColor: Colors.primaryBg,
    borderColor: Colors.primary,
  },
  progressDotDone: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  progressDotText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.textTertiary,
  },
  progressDotTextActive: {
    color: Colors.primary,
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: Colors.border,
    marginHorizontal: 4,
  },
  progressLineActive: {
    backgroundColor: Colors.primary,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 120,
  },
  stepTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  stepDesc: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
    lineHeight: 20,
  },
  statusCard: {
    padding: 0,
    overflow: 'hidden',
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  statusOptionActive: {},
  statusIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusOptionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
  statusOptionDesc: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  photoActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  photoBtn: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  photoBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  photoItem: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoRemove: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  photoCount: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  textArea: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.text,
    minHeight: 100,
    marginBottom: Spacing.md,
  },
  damageToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.md,
  },
  damageToggleText: {
    fontSize: FontSize.md,
    color: Colors.text,
  },
  summaryCard: {
    padding: Spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  summaryLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.text,
    maxWidth: '60%',
    textAlign: 'right',
  },
  offlineNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    padding: Spacing.sm,
    backgroundColor: Colors.warningLight,
    borderRadius: BorderRadius.md,
  },
  offlineNoteText: {
    flex: 1,
    fontSize: FontSize.xs,
    color: Colors.warningDark,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: Spacing.md,
    padding: Spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 34 : Spacing.lg,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  primaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  confirmBtn: {
    backgroundColor: Colors.success,
  },
  primaryBtnText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
  secondaryBtn: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  secondaryBtnText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.text,
  },
});
