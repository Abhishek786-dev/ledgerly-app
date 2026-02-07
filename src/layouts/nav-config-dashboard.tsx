import { Label } from 'src/components/label';
import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name: string) => <SvgColor src={`/assets/icons/navbar/${name}.svg`} />;

export type NavItem = {
  title: string;
  path: string;
  icon: React.ReactNode;
  info?: React.ReactNode;
  children?: any;
};

export const navData = [
  {
    title: 'Dashboard',
    path: '/',
    icon: icon('ic-analytics'),
  },
  {
    title: 'Expenses',
    path: '/expenses',
    icon: icon('ic-expenses'),
  },
  
  // {
  //   title: 'Product',
  //   path: '/products',
  //   icon: icon('ic-cart'),
  //   info: (
  //     <Label color="error" variant="inverted">
  //       +3
  //     </Label>
  //   ),
  // },
  {
    title: 'Account',
    path: '/setup-data/account',
    icon: icon('icon-account'),
  },
  {
    title: 'Category',
    path: '/setup-data/category',
    icon: icon('icon-category'),
  },
   {
    title: 'Vendor',
    path: '/setup-data/vendor',
    icon: icon('ic-user'),
  },
  {
    title: 'Payment method',
    path: '/setup-data/payment-method',
    icon: icon('ic-payment'),
  },
];
