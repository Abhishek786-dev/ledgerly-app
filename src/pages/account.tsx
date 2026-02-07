import { CONFIG } from 'src/config-global';

import { AccountView } from 'src/sections/account/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Account - ${CONFIG.appName}`}</title>

      <AccountView />
    </>
  );
}
