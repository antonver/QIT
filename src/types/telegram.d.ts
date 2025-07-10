// Telegram WebApp API types
export interface TelegramWebAppUser {
  id: number;
  is_bot?: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  added_to_attachment_menu?: boolean;
  allows_write_to_pm?: boolean;
  photo_url?: string;
}

export interface TelegramWebAppChat {
  id: number;
  type: 'group' | 'supergroup' | 'channel';
  title: string;
  username?: string;
  photo_url?: string;
}

export interface TelegramWebAppInitDataUnsafe {
  query_id?: string;
  user?: TelegramWebAppUser;
  receiver?: TelegramWebAppUser;
  chat?: TelegramWebAppChat;
  chat_type?: string;
  chat_instance?: string;
  start_param?: string;
  can_send_after?: number;
  auth_date?: number;
  hash?: string;
}

export interface TelegramWebApp {
  initData: string;
  initDataUnsafe: TelegramWebAppInitDataUnsafe;
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: Record<string, string>;
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  headerColor: string;
  backgroundColor: string;
  isClosingConfirmationEnabled: boolean;
  isVerticalSwipesEnabled: boolean;
  isActive: boolean;
  isFullscreen: boolean;
  isOrientationLocked: boolean;
  
  // Methods
  ready(): void;
  expand(): void;
  close(): void;
  setHeaderColor(color: string): void;
  setBackgroundColor(color: string): void;
  enableClosingConfirmation(): void;
  disableClosingConfirmation(): void;
  enableVerticalSwipes(): void;
  disableVerticalSwipes(): void;
  requestWriteAccess(callback?: (success: boolean) => void): void;
  requestContact(callback?: (success: boolean, contact?: any) => void): void;
  showAlert(message: string, callback?: () => void): void;
  showConfirm(message: string, callback?: (confirmed: boolean) => void): void;
  showPopup(params: {
    title?: string;
    message: string;
    buttons?: Array<{
      id?: string;
      type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
      text?: string;
    }>;
  }, callback?: (buttonId: string) => void): void;
  showScanQrPopup(params: {
    text?: string;
  }, callback?: (text: string) => void): void;
  closeScanQrPopup(): void;
  readTextFromClipboard(callback?: (text: string) => void): void;
  switchInlineQuery(query: string, choose_chat_types?: string[]): void;
  openLink(url: string): void;
  openTelegramLink(url: string): void;
  openInvoice(url: string, callback?: (status: string) => void): void;
  shareToStory(mediaUrl: string, params?: any): void;
  
  // Events
  onEvent(eventType: string, eventHandler: (...args: any[]) => void): void;
  offEvent(eventType: string, eventHandler: (...args: any[]) => void): void;
  sendData(data: string): void;
  
  // UI Components
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    isProgressVisible: boolean;
    setText(text: string): void;
    onClick(callback: () => void): void;
    show(): void;
    hide(): void;
    enable(): void;
    disable(): void;
    showProgress(leaveActive?: boolean): void;
    hideProgress(): void;
    setParams(params: {
      text?: string;
      color?: string;
      text_color?: string;
      is_active?: boolean;
      is_visible?: boolean;
    }): void;
  };
  
  BackButton: {
    isVisible: boolean;
    onClick(callback: () => void): void;
    show(): void;
    hide(): void;
  };
  
  SettingsButton: {
    isVisible: boolean;
    onClick(callback: () => void): void;
    show(): void;
    hide(): void;
  };
  
  HapticFeedback: {
    impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void;
    notificationOccurred(type: 'error' | 'success' | 'warning'): void;
    selectionChanged(): void;
  };
  
  CloudStorage: {
    setItem(key: string, value: string, callback?: (error: string | null, success: boolean) => void): void;
    getItem(key: string, callback?: (error: string | null, value: string) => void): void;
    getItems(keys: string[], callback?: (error: string | null, values: Record<string, string>) => void): void;
    removeItem(key: string, callback?: (error: string | null, success: boolean) => void): void;
    removeItems(keys: string[], callback?: (error: string | null, success: boolean) => void): void;
    getKeys(callback?: (error: string | null, keys: string[]) => void): void;
  };
  
  BiometricManager: {
    isInited: boolean;
    isBiometricAvailable: boolean;
    biometricType: 'finger' | 'face' | 'unknown';
    isAccessRequested: boolean;
    isAccessGranted: boolean;
    isBiometricTokenSaved: boolean;
    deviceId: string;
    init(callback?: () => void): void;
    requestAccess(params: {
      reason?: string;
    }, callback?: (success: boolean) => void): void;
    authenticate(params: {
      reason?: string;
    }, callback?: (success: boolean, biometricToken?: string) => void): void;
    updateBiometricToken(token: string, callback?: (success: boolean) => void): void;
    openSettings(): void;
  };
}

export interface TelegramWebAppUtils {
  openTelegramLink(url: string): void;
  openLink(url: string): void;
  shareUrl(url: string, text?: string): void;
}

export interface Telegram {
  WebApp: TelegramWebApp;
  Utils: TelegramWebAppUtils;
}

// Global declarations
declare global {
  interface Window {
    Telegram?: Telegram;
  }
  
  // For external script loading
  const Telegram: Telegram | undefined;
}

export {}; 