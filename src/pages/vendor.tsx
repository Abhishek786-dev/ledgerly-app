import { CONFIG } from 'src/config-global';

import { VendorView } from 'src/sections/vendor/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Vendor - ${CONFIG.appName}`}</title>

      <VendorView />
    </>
  );
}
