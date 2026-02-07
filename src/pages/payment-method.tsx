import { CONFIG } from 'src/config-global';

import { PaymentMethodView } from 'src/sections/payment-method/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Payment Method- ${CONFIG.appName}`}</title>

      <PaymentMethodView />
    </>
  );
}
