export const environment = {
  subDomen: 'sandbox',
  production: false,
  canSwitchToSandBox: false,
  isSandBoxMode: false,
  isLocal: false,
  hostOriginal: 'https://dev-sandbox-paynote.seamlesschex.com',
  host: 'https://dev-sandbox-paynote.seamlesschex.com/sandbox',
  sandboxHost: 'https://dev-sandbox-paynote.seamlesschex.com/sandbox',
  liveHost: 'https://dev-paynote.seamlesschex.com',
  dubugModeForRegDwolla: false,
  debugMode: true,
  link: {
    privacy_policy: 'https://www.seamlesschex.com/privacy-policy/',
    terms_of_service: 'https://www.seamlesschex.com/terms-of-service/',
    api_documentation: 'https://paynote.seamlesschex.com/api-docs/'
  },
  api: {
    live_endpoint: 'https://dev-api-paynote.seamlesschex.com/v1',
    sandbox_endpoint: 'https://dev-sandbox-paynote.seamlesschex.com/v1',
  },
  availableAPIMode: false,
  availableEmailSettings: false,
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
