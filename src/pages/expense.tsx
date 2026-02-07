import { CONFIG } from 'src/config-global';

import { ExpenseView } from 'src/sections/expense/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Expense - ${CONFIG.appName}`}</title>

      <ExpenseView />
    </>
  );
}
