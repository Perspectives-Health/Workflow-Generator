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
    chromiumArgs: ['--user-data-dir=./.wxt/chrome-data'],
  },
  manifest: {
    permissions: [
      'storage',
      'activeTab',
      'scripting',
      'tabs',
      'webRequest',
    ],
    action: {
      default_title: 'Toggle Workflow Generator',
    },
    web_accessible_resources: [
      {
        resources: ['wxt.svg'],
        matches: ['<all_urls>'],
      },
    ],
  },
});
