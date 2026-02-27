import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '@/constants/theme';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <View style={styles.container}>
          <View style={styles.iconBox}>
            <Ionicons name="warning-outline" size={48} color={Colors.danger} />
          </View>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.subtitle}>An unexpected error occurred. Please try again.</Text>

          {__DEV__ && this.state.error && (
            <ScrollView style={styles.errorBox} contentContainerStyle={styles.errorContent}>
              <Text style={styles.errorText}>{this.state.error.message}</Text>
              <Text style={styles.stackText}>{this.state.error.stack?.slice(0, 500)}</Text>
            </ScrollView>
          )}

          <TouchableOpacity style={styles.retryBtn} onPress={this.handleReset} activeOpacity={0.8}>
            <Ionicons name="refresh-outline" size={20} color={Colors.white} />
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    padding: Spacing.xxl, backgroundColor: Colors.background,
  },
  iconBox: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.dangerLight || '#fef2f2',
    justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.xxl,
  },
  title: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing.sm },
  subtitle: { fontSize: FontSize.md, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  errorBox: {
    maxHeight: 200, width: '100%', marginTop: Spacing.xxl,
    backgroundColor: '#fef2f2', borderRadius: BorderRadius.md, borderWidth: 1, borderColor: '#fecaca',
  },
  errorContent: { padding: Spacing.md },
  errorText: { fontSize: FontSize.sm, color: Colors.danger, fontWeight: FontWeight.medium },
  stackText: { fontSize: FontSize.xs, color: '#b91c1c', marginTop: Spacing.sm, fontFamily: 'monospace' },
  retryBtn: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.primary, paddingHorizontal: Spacing.xxl, paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md, marginTop: Spacing.xxl,
  },
  retryText: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.white },
});
