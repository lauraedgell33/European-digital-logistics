import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { useAppStore } from '@/stores/appStore';
import { t, supportedLocales } from '@/lib/i18n';
import Card from '@/components/ui/Card';
import ListItem from '@/components/ui/ListItem';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '@/constants/theme';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const { locale, setLocale, addNotification } = useAppStore();
  const [pushNotifications, setPushNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [showLanguages, setShowLanguages] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      t('profile.logout', locale),
      t('profile.logoutConfirm', locale),
      [
        { text: t('common.no', locale), style: 'cancel' },
        {
          text: t('common.yes', locale),
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t('profile.deleteAccount', locale),
      t('profile.deleteAccountConfirm', locale),
      [
        { text: t('common.no', locale), style: 'cancel' },
        {
          text: t('common.delete', locale),
          style: 'destructive',
          onPress: () => addNotification({ type: 'info', title: t('profile.deleteAccountRequested', locale) }),
        },
      ]
    );
  };

  const currentLocale = supportedLocales.find((l) => l.code === locale);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <Text style={styles.userName}>{user?.name || 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          {user?.company && (
            <View style={styles.companyBadge}>
              <Ionicons name="business-outline" size={14} color={Colors.primary} />
              <Text style={styles.companyName}>{user.company.name}</Text>
            </View>
          )}
          <Badge label={user?.role || 'user'} status="active" size="md" />
        </View>

        {/* Account Section */}
        <Text style={styles.sectionTitle}>{t('profile.account', locale)}</Text>
        <Card style={styles.sectionCard}>
          <ListItem
            title={t('profile.personalInfo', locale)}
            subtitle={user?.name}
            leftIcon="person-outline"
            leftIconBg={Colors.primaryBg}
            leftIconColor={Colors.primary}
            borderBottom
            arrow
            onPress={() => router.push('/(tabs)/profile/edit')}
          />
          <ListItem
            title={t('profile.company', locale)}
            subtitle={user?.company?.name}
            leftIcon="business-outline"
            leftIconBg={Colors.infoBg}
            leftIconColor={Colors.info}
            borderBottom
            arrow
            onPress={() => router.push('/(tabs)/profile/company')}
          />
          <ListItem
            title={t('profile.changePassword', locale)}
            leftIcon="lock-closed-outline"
            leftIconBg={Colors.warningLight}
            leftIconColor={Colors.warning}
            borderBottom={false}
            arrow
            onPress={() => router.push('/(tabs)/profile/password')}
          />
        </Card>

        {/* Quick Links Section */}
        <Text style={styles.sectionTitle}>Quick Links</Text>
        <Card style={styles.sectionCard}>
          <ListItem
            title="Tenders"
            subtitle="Browse open tenders"
            leftIcon="megaphone-outline"
            leftIconBg="#fef3c7"
            leftIconColor={Colors.warning}
            borderBottom
            arrow
            onPress={() => router.push('/(tabs)/tenders')}
          />
          <ListItem
            title="Partner Networks"
            subtitle="Manage your networks"
            leftIcon="people-outline"
            leftIconBg={Colors.successLight}
            leftIconColor={Colors.success}
            borderBottom
            arrow
            onPress={() => router.push('/(tabs)/networks')}
          />
          <ListItem
            title="Company Directory"
            subtitle="Find logistics companies"
            leftIcon="business-outline"
            leftIconBg={Colors.infoBg}
            leftIconColor={Colors.info}
            borderBottom={false}
            arrow
            onPress={() => router.push('/(tabs)/companies')}
          />
        </Card>

        {/* Preferences Section */}
        <Text style={styles.sectionTitle}>{t('profile.preferences', locale)}</Text>
        <Card style={styles.sectionCard}>
          <TouchableOpacity style={styles.languageBtn} onPress={() => setShowLanguages(!showLanguages)}>
            <View style={[styles.listIconBox, { backgroundColor: Colors.successLight }]}>
              <Ionicons name="globe-outline" size={18} color={Colors.success} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.listTitle}>{t('profile.language', locale)}</Text>
              <Text style={styles.listSubtitle}>{currentLocale?.flag} {currentLocale?.name}</Text>
            </View>
            <Ionicons name={showLanguages ? 'chevron-up' : 'chevron-down'} size={18} color={Colors.textTertiary} />
          </TouchableOpacity>

          {showLanguages && (
            <View style={styles.languageList}>
              {supportedLocales.map((loc) => (
                <TouchableOpacity
                  key={loc.code}
                  style={[styles.languageItem, locale === loc.code && styles.languageItemActive]}
                  onPress={() => { setLocale(loc.code); setShowLanguages(false); }}
                >
                  <Text style={styles.languageFlag}>{loc.flag}</Text>
                  <Text style={[styles.languageName, locale === loc.code && styles.languageNameActive]}>
                    {loc.name}
                  </Text>
                  {locale === loc.code && <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />}
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={styles.switchRow}>
            <View style={[styles.listIconBox, { backgroundColor: '#fef3c7' }]}>
              <Ionicons name="notifications-outline" size={18} color={Colors.warning} />
            </View>
            <Text style={[styles.listTitle, { flex: 1 }]}>{t('profile.pushNotifications', locale)}</Text>
            <Switch
              value={pushNotifications}
              onValueChange={setPushNotifications}
              trackColor={{ false: Colors.border, true: Colors.primaryLight }}
              thumbColor={pushNotifications ? Colors.primary : Colors.neutralLight}
            />
          </View>

          <View style={[styles.switchRow, { borderBottomWidth: 0 }]}>
            <View style={[styles.listIconBox, { backgroundColor: '#e0e7ff' }]}>
              <Ionicons name="moon-outline" size={18} color="#6366f1" />
            </View>
            <Text style={[styles.listTitle, { flex: 1 }]}>{t('profile.darkMode', locale)}</Text>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: Colors.border, true: Colors.primaryLight }}
              thumbColor={darkMode ? Colors.primary : Colors.neutralLight}
            />
          </View>
        </Card>

        {/* Support Section */}
        <Text style={styles.sectionTitle}>{t('profile.support', locale)}</Text>
        <Card style={styles.sectionCard}>
          <ListItem
            title={t('profile.helpCenter', locale)}
            leftIcon="help-circle-outline"
            leftIconBg={Colors.infoBg}
            leftIconColor={Colors.info}
            borderBottom
            arrow
            onPress={() => {}}
          />
          <ListItem
            title={t('profile.privacyPolicy', locale)}
            leftIcon="shield-checkmark-outline"
            leftIconBg={Colors.successLight}
            leftIconColor={Colors.success}
            borderBottom
            arrow
            onPress={() => {}}
          />
          <ListItem
            title={t('profile.termsOfService', locale)}
            leftIcon="document-text-outline"
            leftIconBg="#fef3c7"
            leftIconColor={Colors.warning}
            borderBottom={false}
            arrow
            onPress={() => {}}
          />
        </Card>

        {/* Logout & Delete */}
        <Button
          title={t('profile.logout', locale)}
          onPress={handleLogout}
          variant="outline"
          icon={<Ionicons name="log-out-outline" size={18} color={Colors.primary} />}
          style={styles.logoutBtn}
        />

        <TouchableOpacity onPress={handleDeleteAccount} style={styles.deleteBtn}>
          <Text style={styles.deleteText}>{t('profile.deleteAccount', locale)}</Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text style={styles.versionText}>LogiMarket v1.0.0</Text>

        <View style={{ height: Spacing.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingHorizontal: Spacing.xxl },
  profileCard: {
    alignItems: 'center', paddingVertical: Spacing.xxl, marginTop: Spacing.lg,
  },
  avatarLarge: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primary,
    justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.lg,
  },
  avatarText: { color: Colors.white, fontSize: 32, fontWeight: FontWeight.bold },
  userName: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.text },
  userEmail: { fontSize: FontSize.md, color: Colors.textSecondary, marginTop: Spacing.xs },
  companyBadge: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.xs,
    marginVertical: Spacing.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
    backgroundColor: Colors.primaryBg, borderRadius: BorderRadius.full,
  },
  companyName: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.medium },
  sectionTitle: {
    fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textTertiary,
    textTransform: 'uppercase', letterSpacing: 0.5, marginTop: Spacing.xxl, marginBottom: Spacing.md,
    marginLeft: Spacing.xs,
  },
  sectionCard: { marginBottom: 0 },
  languageBtn: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    paddingVertical: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  listIconBox: {
    width: 36, height: 36, borderRadius: BorderRadius.sm, justifyContent: 'center', alignItems: 'center',
  },
  listTitle: { fontSize: FontSize.md, fontWeight: FontWeight.medium, color: Colors.text },
  listSubtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  languageList: {
    paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  languageItem: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    paddingVertical: Spacing.md, paddingHorizontal: Spacing.sm, borderRadius: BorderRadius.md,
  },
  languageItemActive: { backgroundColor: Colors.primaryBg },
  languageFlag: { fontSize: 20 },
  languageName: { flex: 1, fontSize: FontSize.md, color: Colors.text },
  languageNameActive: { fontWeight: FontWeight.semibold, color: Colors.primary },
  switchRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    paddingVertical: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  logoutBtn: { marginTop: Spacing.xxl },
  deleteBtn: { alignSelf: 'center', paddingVertical: Spacing.lg },
  deleteText: { fontSize: FontSize.sm, color: Colors.danger, fontWeight: FontWeight.medium },
  versionText: {
    textAlign: 'center', fontSize: FontSize.xs, color: Colors.textTertiary, marginTop: Spacing.md,
  },
});
