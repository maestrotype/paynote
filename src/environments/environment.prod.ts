export const environment = {
  subDomen: 'paynote',
  production: true,
  canSwitchToSandBox: true,
  isSandBoxMode: false,
  isLocal: false,
  hostOriginal: 'https://paynote.seamlesschex.com',
  host: localStorage.getItem('sandBoxMode') == '0' || !localStorage.getItem('sandBoxMode')
    ? 'https://paynote.seamlesschex.com/api' : 'https://paynote.seamlesschex.com/sandbox',
  //  host: 'https://paynote.seamlesschex.com/api',
  sandboxHost: 'https://paynote.seamlesschex.com/sandbox',
  liveHost: 'https://paynote.seamlesschex.com',
  dubugModeForRegDwolla: false,
  debugMode: false,
  link: {
    privacy_policy: 'https://www.seamlesschex.com/privacy-policy/',
    terms_of_service: 'https://www.seamlesschex.com/terms-of-service/',
    api_documentation: 'https://paynote.seamlesschex.com/api-docs/'
  },
  api: {
    live_endpoint: 'https://api-paynote.seamlesschex.com/v1',
    sandbox_endpoint: 'https://sandbox-paynote.seamlesschex.com/v1',
  },
  availableAPIMode: true,
  availableEmailSettings: true,
  plaid: {
    selectAccount: true,
    env: 'production',
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
