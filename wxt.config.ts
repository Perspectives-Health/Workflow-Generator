import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  webExt: {
    startUrls: [
      'https://trecovery.reliatrax.net',
      'https://hygea12973.kipuworks.com/users/sign_in',
      'https://slr11291.kipuworks.com/',
      'https://fresh.bestnotes.com/auth/lockout'
    ],
  },
  manifest: {
    permissions: [
      'storage',
      'activeTab',
      'scripting',
      'tabs',
      'webRequest',
    ],
  },
});
