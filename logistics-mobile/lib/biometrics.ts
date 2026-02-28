let LocalAuthentication: any;
try {
  LocalAuthentication = require('expo-local-authentication');
} catch {
  // expo-local-authentication not installed — provide stubs
  LocalAuthentication = {
    hasHardwareAsync: async () => false,
    isEnrolledAsync: async () => false,
    authenticateAsync: async () => ({ success: false }),
    SecurityLevel: { NONE: 0, SECRET: 1, BIOMETRIC: 2 },
    AuthenticationType: { FINGERPRINT: 1, FACIAL_RECOGNITION: 2, IRIS: 3 },
    supportedAuthenticationTypesAsync: async () => [],
  };
}

export async function isBiometricAvailable(): Promise<boolean> {
  try {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    if (!compatible) return false;
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    return enrolled;
  } catch {
    return false;
  }
}

export async function authenticateWithBiometrics(): Promise<boolean> {
  try {
    const available = await isBiometricAvailable();
    if (!available) return false;

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate to access LogiMarket',
      cancelLabel: 'Cancel',
      disableDeviceFallback: false,
      fallbackLabel: 'Use passcode',
    });

    return result.success;
  } catch {
    return false;
  }
}

export async function getBiometricType(): Promise<string> {
  try {
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();

    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      return 'Face ID';
    }
    if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return 'Fingerprint';
    }
    if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      return 'Iris';
    }
    return 'Biometric';
  } catch {
    return 'Biometric';
  }
}
