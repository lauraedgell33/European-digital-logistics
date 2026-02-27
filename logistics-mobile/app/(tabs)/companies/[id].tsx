import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Linking,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { companyApi } from '@/lib/api';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '@/constants/theme';
import { Company } from '@/types';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import LoadingScreen from '@/components/ui/LoadingScreen';

// ── Helpers ───────────────────────────────────────────
const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  carrier: { bg: '#dbeafe', text: '#1e40af' },
  freight_forwarder: { bg: '#ede9fe', text: '#5b21b6' },
  shipper: { bg: '#d1fae5', text: '#065f46' },
  broker: { bg: '#ffedd5', text: '#9a3412' },
  logistics_provider: { bg: '#cffafe', text: '#155e75' },
};

const getCountryFlag = (country: string): string => {
  const code = country.toUpperCase().trim();
  if (code.length === 2) {
    return String.fromCodePoint(
      ...code.split('').map((c) => 0x1f1e6 + c.charCodeAt(0) - 65)
    );
  }
  return '🌍';
};

const formatType = (type: string): string =>
  type
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

const renderStars = (rating: number): string => {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
};

// ── Section Component ─────────────────────────────────
function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name={icon} size={18} color={Colors.primary} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

// ── Info Row ──────────────────────────────────────────
function InfoRow({
  label,
  value,
  icon,
  onPress,
}: {
  label: string;
  value: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
}) {
  const content = (
    <View style={styles.infoRow}>
      {icon && <Ionicons name={icon} size={16} color={Colors.textTertiary} style={{ marginRight: Spacing.sm }} />}
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={[styles.infoValue, onPress && styles.infoValueLink]} numberOfLines={2}>
          {value}
        </Text>
      </View>
    </View>
  );
  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.6} onPress={onPress}>
        {content}
      </TouchableOpacity>
    );
  }
  return content;
}

// ── Main Screen ───────────────────────────────────────
export default function CompanyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const companyId = Number(id);

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['company', companyId],
    queryFn: async () => {
      const res = await companyApi.get(companyId);
      return (res.data?.data ?? res.data) as Company;
    },
    enabled: !!companyId,
  });

  const company = data;

  const handleEmail = useCallback(() => {
    if (company?.email) Linking.openURL(`mailto:${company.email}`);
  }, [company?.email]);

  const handlePhone = useCallback(() => {
    if (company?.phone) Linking.openURL(`tel:${company.phone}`);
  }, [company?.phone]);

  const handleWebsite = useCallback(() => {
    if (company?.website) {
      const url = company.website.startsWith('http') ? company.website : `https://${company.website}`;
      Linking.openURL(url);
    }
  }, [company?.website]);

  const handleMapLink = useCallback(() => {
    const parts = [company?.address, company?.city, company?.country].filter(Boolean).join(', ');
    if (parts) Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(parts)}`);
  }, [company?.address, company?.city, company?.country]);

  const handleContact = useCallback(() => {
    if (company?.email) {
      handleEmail();
    } else if (company?.phone) {
      handlePhone();
    }
  }, [company?.email, company?.phone, handleEmail, handlePhone]);

  if (isLoading) return <LoadingScreen message="Loading company..." />;

  if (isError || !company) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.headerBar}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.textTertiary} />
          <Text style={styles.errorText}>Company not found</Text>
          <Button title="Go Back" onPress={() => router.back()} size="sm" fullWidth={false} />
        </View>
      </SafeAreaView>
    );
  }

  const typeColor = TYPE_COLORS[company.type] || { bg: Colors.surfaceSecondary, text: Colors.textSecondary };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {company.name}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.primary} />
        }
      >
        {/* Avatar / Logo */}
        <View style={styles.heroSection}>
          {company.logo_url ? (
            <Image source={{ uri: company.logo_url }} style={styles.logo} resizeMode="contain" />
          ) : (
            <View style={styles.heroAvatar}>
              <Text style={styles.heroAvatarText}>{company.name.charAt(0).toUpperCase()}</Text>
            </View>
          )}
          <Text style={styles.heroName}>{company.name}</Text>

          <View style={styles.heroBadges}>
            <View style={[styles.typeBadgeLg, { backgroundColor: typeColor.bg }]}>
              <Text style={[styles.typeBadgeLgText, { color: typeColor.text }]}>
                {formatType(company.type)}
              </Text>
            </View>
            {company.is_verified && (
              <Badge label="Verified" status="verified" size="md" />
            )}
          </View>

          {(company.rating != null && company.rating > 0) && (
            <View style={styles.heroRating}>
              <Text style={styles.heroStars}>{renderStars(company.rating)}</Text>
              <Text style={styles.heroRatingValue}>{company.rating.toFixed(1)}</Text>
              {company.total_reviews != null && (
                <Text style={styles.heroReviewCount}>({company.total_reviews} reviews)</Text>
              )}
            </View>
          )}
        </View>

        {/* About */}
        {company.description && (
          <Section title="About" icon="information-circle-outline">
            <Text style={styles.aboutText}>{company.description}</Text>
          </Section>
        )}

        {/* Contact */}
        {(company.email || company.phone || company.website) && (
          <Section title="Contact" icon="call-outline">
            {company.email && (
              <InfoRow label="Email" value={company.email} icon="mail-outline" onPress={handleEmail} />
            )}
            {company.phone && (
              <InfoRow label="Phone" value={company.phone} icon="call-outline" onPress={handlePhone} />
            )}
            {company.website && (
              <InfoRow label="Website" value={company.website} icon="globe-outline" onPress={handleWebsite} />
            )}
          </Section>
        )}

        {/* Location */}
        {(company.country || company.city || company.address) && (
          <Section title="Location" icon="location-outline">
            {company.address && (
              <InfoRow label="Address" value={company.address} icon="navigate-outline" />
            )}
            {company.city && (
              <InfoRow label="City" value={company.city} icon="business-outline" />
            )}
            {company.country && (
              <InfoRow
                label="Country"
                value={`${getCountryFlag(company.country)} ${company.country}`}
                icon="flag-outline"
              />
            )}
            <TouchableOpacity style={styles.mapLink} activeOpacity={0.7} onPress={handleMapLink}>
              <Ionicons name="map-outline" size={16} color={Colors.primary} />
              <Text style={styles.mapLinkText}>View on Map</Text>
            </TouchableOpacity>
          </Section>
        )}

        {/* Business */}
        {(company.founded_year || company.employees_count || company.fleet_size || company.tax_id || company.registration_number) && (
          <Section title="Business Information" icon="briefcase-outline">
            {company.founded_year && (
              <InfoRow label="Founded" value={String(company.founded_year)} icon="calendar-outline" />
            )}
            {company.employees_count != null && (
              <InfoRow label="Employees" value={String(company.employees_count)} icon="people-outline" />
            )}
            {company.fleet_size != null && (
              <InfoRow label="Fleet Size" value={`${company.fleet_size} vehicles`} icon="car-outline" />
            )}
            {company.tax_id && (
              <InfoRow label="Tax ID" value={company.tax_id} icon="document-text-outline" />
            )}
            {company.registration_number && (
              <InfoRow label="Registration №" value={company.registration_number} icon="receipt-outline" />
            )}
          </Section>
        )}

        {/* Certifications */}
        {company.certifications && company.certifications.length > 0 && (
          <Section title="Certifications" icon="ribbon-outline">
            <View style={styles.tagContainer}>
              {company.certifications.map((cert) => (
                <View key={cert} style={styles.certBadge}>
                  <Ionicons name="shield-checkmark-outline" size={14} color={Colors.success} />
                  <Text style={styles.certBadgeText}>{cert}</Text>
                </View>
              ))}
            </View>
          </Section>
        )}

        {/* Specializations */}
        {company.specializations && company.specializations.length > 0 && (
          <Section title="Specializations" icon="layers-outline">
            <View style={styles.tagContainer}>
              {company.specializations.map((spec) => (
                <View key={spec} style={styles.specTag}>
                  <Text style={styles.specTagText}>{spec}</Text>
                </View>
              ))}
            </View>
          </Section>
        )}

        {/* Operating Countries */}
        {company.operating_countries && company.operating_countries.length > 0 && (
          <Section title="Operating Countries" icon="globe-outline">
            <View style={styles.tagContainer}>
              {company.operating_countries.map((c) => (
                <View key={c} style={styles.countryTag}>
                  <Text style={styles.countryTagText}>
                    {getCountryFlag(c)} {c}
                  </Text>
                </View>
              ))}
            </View>
          </Section>
        )}

        {/* Contact CTA */}
        {(company.email || company.phone) && (
          <View style={styles.ctaContainer}>
            <Button
              title={company.email ? 'Send Email' : 'Call Company'}
              onPress={handleContact}
              icon={
                <Ionicons
                  name={company.email ? 'mail-outline' : 'call-outline'}
                  size={20}
                  color={Colors.white}
                  style={{ marginRight: Spacing.sm }}
                />
              }
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // Header bar
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
    textAlign: 'center',
    marginHorizontal: Spacing.sm,
  },

  scrollContent: {
    paddingBottom: Spacing.xxxxl,
  },

  // Error
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  errorText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },

  // Hero
  heroSection: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.xxl,
    backgroundColor: Colors.surface,
    marginBottom: Spacing.md,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.lg,
    backgroundColor: Colors.surfaceSecondary,
  },
  heroAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  heroAvatarText: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  heroName: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  heroBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  typeBadgeLg: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
  },
  typeBadgeLgText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  heroRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  heroStars: {
    fontSize: FontSize.lg,
    color: Colors.warning,
  },
  heroRatingValue: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
  heroReviewCount: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
  },

  // Sections
  section: {
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadow.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },

  // About
  aboutText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    lineHeight: 22,
  },

  // Info rows
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: Spacing.sm,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    fontWeight: FontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: FontSize.md,
    color: Colors.text,
  },
  infoValueLink: {
    color: Colors.textLink,
  },

  // Map link
  mapLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  mapLinkText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.primary,
  },

  // Tags & badges
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  certBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.successLight,
  },
  certBadgeText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.successDark,
  },
  specTag: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primaryBg,
  },
  specTagText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.primary,
  },
  countryTag: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceSecondary,
  },
  countryTagText: {
    fontSize: FontSize.sm,
    color: Colors.text,
  },

  // CTA
  ctaContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
});
