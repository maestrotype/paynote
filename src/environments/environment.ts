// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  subDomen: 'local',
  production: false,
//  canSwitchToSandBox: false,
//  isSandBoxMode: false,
  canSwitchToSandBox: true,
  isSandBoxMode: false,
  isLocal: true,
  hostOriginal: 'http://local.schex-paynote.com',
  host: localStorage.getItem('sandBoxMode') == '0' || !localStorage.getItem('sandBoxMode')
    ? 'http://local.schex-paynote.com/api' : 'http://local.schex-paynote.com/sandbox',
  sandboxHost: 'http://local.schex-paynote.com/sandbox',
  liveHost: 'http://paynote.seamlesschex.com',
  link: {
    privacy_policy: 'https://www.seamlesschex.com/privacy-policy/',
    terms_of_service: 'https://www.seamlesschex.com/terms-of-service/',
    api_documentation: 'https://paynote.seamlesschex.com/api-docs/'
  },
  api: {
    live_endpoint: 'http://local.schex-paynote.com/v1',
    sandbox_endpoint: 'http://local-sandbox.schex-paynote.com/v1'
  },
  dubugModeForRegDwolla: true,
  debugMode: true,
  availableAPIMode: true,
  availableEmailSettings: true,
  plaid: {
    selectAccount: true,
    env: 'sandbox',
//    env: 'production',
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
