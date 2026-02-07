import type { RouteObject } from 'react-router';

import { lazy, Suspense } from 'react';
import { varAlpha } from 'minimal-shared/utils';
import { Outlet, Navigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';

import PublicRoute from 'src/routes/PublicRoute';
import ProtectedRoute from 'src/routes/ProtectedRoute';

import { AuthLayout } from 'src/layouts/auth';
import { DashboardLayout } from 'src/layouts/dashboard';





// ----------------------------------------------------------------------

export const DashboardPage = lazy(() => import('src/pages/dashboard'));
export const BlogPage = lazy(() => import('src/pages/blog'));
export const UserPage = lazy(() => import('src/pages/user'));
export const ExpensePage = lazy(() => import('src/pages/expense'));
export const SignInPage = lazy(() => import('src/pages/sign-in'));
export const SignUpPage = lazy(() => import('src/pages/sign-up'));
export const ProductsPage = lazy(() => import('src/pages/products'));
export const Page404 = lazy(() => import('src/pages/page-not-found'));
export const AccountPage = lazy(() => import('src/pages/account'));
export const CategoryPage = lazy(() => import('src/pages/category'));
export const VendorPage = lazy(() => import('src/pages/vendor'));
export const PaymentMethodPage = lazy(() => import('src/pages/payment-method'));




const renderFallback = () => (
  <Box
    sx={{
      display: 'flex',
      flex: '1 1 auto',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <LinearProgress
      sx={{
        width: 1,
        maxWidth: 320,
        bgcolor: (theme) => varAlpha(theme.vars.palette.text.primaryChannel, 0.16),
        [`& .${linearProgressClasses.bar}`]: { bgcolor: 'text.primary' },
      }}
    />
  </Box>
);

// const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
//   return isAuthenticated() ? children : <Navigate to="/sign-in" replace />;
// };


export const routesSection: RouteObject[] = [
  {
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <Suspense fallback={renderFallback()}>
            <Outlet />
          </Suspense>
        </DashboardLayout>
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "expenses", element: <ExpensePage /> },
      { path: "user", element: <UserPage /> },
      { path: "products", element: <ProductsPage /> },
      { path: "blog", element: <BlogPage /> },
      { path: "home", element: <DashboardPage /> }, // 🔒 protected now
      {
        path: 'setup-data',
        element: <Outlet />,
        children: [
          { element: <Navigate to="/setup-data/account" replace />, index: true },
          { path: 'account', element: <AccountPage /> },
          { path: 'category', element: <CategoryPage /> },
          { path: 'vendor', element: <VendorPage /> },
          { path: 'payment-method', element: <PaymentMethodPage /> },
        ],
      },
    ],
  },

  {
    path: "sign-in",
    element: (
      <PublicRoute>
        <AuthLayout>
          <SignInPage />
        </AuthLayout>
      </PublicRoute>
    ),
  },

  {
    path: "sign-up",
    element: (
      <PublicRoute>
        <AuthLayout>
          <SignUpPage />
        </AuthLayout>
      </PublicRoute>
    ),
  },

  {
    path: "404",
    element: <Page404 />,
  },
  { path: "*", element: <Page404 /> },
];