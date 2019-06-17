export const environment = {
  subDomen: 'local',
  production: true,
  canSwitchToSandBox: false,
  isSandBoxMode: false,
  isLocal: true,
  hostOriginal: 'http://local.schex-paynote.com',
  host: localStorage.getItem('sandBoxMode') == '0' || !localStorage.getItem('sandBoxMode')
    ? 'http://local.schex-paynote.com/api' : 'http://local.schex-paynote.com/sandbox',
  sandboxHost: 'http://local.schex-paynote.com/sandbox',
  liveHost: 'http://local.schex-paynote.com',
  dubugModeForRegDwolla: true,
  debugMode: true,
  link: {
    privacy_policy: 'https://www.seamlesschex.com/privacy-policy/',
    terms_of_service: 'https://www.seamlesschex.com/terms-of-service/',
    api_documentation: 'https://paynote.seamlesschex.com/api-docs/'
  },
  api: {
    live_endpoint: 'http://local.schex-paynote.com/v1',
    sandbox_endpoint: 'http://local-sandbox.schex-paynote.com/v1'
  },
  availableAPIMode: true,
  availableEmailSettings: true,
  plaid: {
    selectAccount: true,
    env: 'sandbox',
    clientName: 'SeamlessChex',
    apiVersion: 'v2',
    key: '1902b1de5ce38dfe7586c08873d297',
    product: ['auth']
  },
  plaidSandbox: {
    selectAccount: true,
    env: 'sandbox',
    clientName: 'SeamlessChex',
    apiVersion: 'v2',
    key: '1902b1de5ce38dfe7586c08873d297',
    product: ['auth']
  }
};
