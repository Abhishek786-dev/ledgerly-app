
import { CONFIG } from 'src/config-global';

import { SignUpView } from 'src/sections/auth/sign-up-view';

// ----------------------------------------------------------------------

export default function SignUpPage() {
  return (
    <>
      <title>{`Sign up - ${CONFIG.appName}`}</title>

      <SignUpView />
    </>
  );
}
