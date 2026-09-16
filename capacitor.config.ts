import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.fusion.studyapp',
  appName: 'FUSION',
  webDir: 'dist',
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_stat_fusion',
      iconColor: '#1E1E24',
      sound: 'default'
    },
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#1E1E24',
      androidSplashResourceName: 'splash',
      showSpinner: false,
      launchFadeOutDuration: 300
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#1E1E24'
    }
  },
  android: {
    allowMixedContent: true,
    backgroundColor: '#FFFAF5'
  }
};

export default config;
