import packageJson from '../package.json';

// ----------------------------------------------------------------------

export type ConfigValue = {
  appName: string;
  appVersion: string;
  apiUrl: string;
};

export const CONFIG: ConfigValue = {
  appName: 'Ledgerly',
  appVersion: packageJson.version,
  apiUrl: 'http://192.168.29.67:8000/api/',
};
