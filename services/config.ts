import Constants from 'expo-constants';
export const wordpressUrl = String(Constants.expoConfig?.extra?.wordpressUrl ?? 'https://taai.net.au').replace(/\/$/, '');
export const urls = { wordpress: wordpressUrl, api: `${wordpressUrl}/wp-json`, mobile: `${wordpressUrl}/wp-json/taai-mobile/v1`, store: `${wordpressUrl}/wp-json/wc/store/v1` };

