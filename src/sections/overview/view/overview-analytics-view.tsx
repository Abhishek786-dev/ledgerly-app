import { useState, useEffect, useCallback } from 'react';

import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import { useAuth } from 'src/routes/hooks/use-auth';

import axiosInstance from 'src/utils/axios';

import { DashboardContent } from 'src/layouts/dashboard';
import { _posts, _tasks, _traffic, _timeline } from 'src/_mock';

import { AnalyticsNews } from '../analytics-news';
import { AnalyticsTasks } from '../analytics-tasks';
import { AnalyticsCurrentVisits } from '../analytics-current-visits';
import { AnalyticsOrderTimeline } from '../analytics-order-timeline';
import { AnalyticsWebsiteVisits } from '../analytics-website-visits';
import { AnalyticsWidgetSummary } from '../analytics-widget-summary';
import { AnalyticsTrafficBySite } from '../analytics-traffic-by-site';
import { AnalyticsCurrentSubject } from '../analytics-current-subject';
import { AnalyticsConversionRates } from '../analytics-conversion-rates';



// ----------------------------------------------------------------------

type WeeklyExpenseProps = {
  date: Array<string>;
  total: number;
  sub_total: Array<number>;
};

type DailyExpenseProps = {
  date: Array<string>;
  total: number;
  sub_total: Array<number>;
};

type MonthlyExpenseProps = {
  month: Array<string>;
  total: number;
  sub_total: Array<number>;
};

type PaymentMethodOptionProps = {
  label: string;
  value: number;
};

type CategoryOptionProps = {
  categories: Array<string>;
  total: number;
  sub_total: Array<number>;
};

export function OverviewAnalyticsView() {
  const { user, isAuthenticated } = useAuth();
  const [weeklyExpenses, setWeeklyExpenses] = useState<WeeklyExpenseProps[]>([]);
  const [dailyExpenses, setDailyExpenses] = useState<DailyExpenseProps[]>([]);
  const [monthlyExpenses, setMonthlyExpenses] = useState<MonthlyExpenseProps[]>([]);
  const [categoriesExpenses, setCategoriesExpenses] = useState<CategoryOptionProps[]>([]);
  const [paymentMethodsExpenses, setPaymentMethodsExpenses] = useState<PaymentMethodOptionProps[]>([]);

   useEffect(() => {
    const fetchDropdownData = async () => {
      if (isAuthenticated) {
        try {
          const accessToken = localStorage.getItem('accessToken');
          const config = {
            headers: { Authorization: `Bearer ${accessToken}` },
          };

          const [dailyExpensesRes, weeklyExpensesRes, monthlyExpensesRes, categoriesExpensesRes, paymentMethodsExpensesRes ] =
            await Promise.all([
              axiosInstance.get('reports/chart/daily-expenses/', config),
              axiosInstance.get('reports/chart/weekly-expenses', config),
              axiosInstance.get('reports/chart/monthly-expenses/', config),
              axiosInstance.get('reports/chart/category-expenses/', config),
              axiosInstance.get('reports/chart/payment-methods-expenses/', config),
            ]);
          console.log(JSON.stringify(dailyExpensesRes.data));
          console.log(JSON.stringify(weeklyExpensesRes.data));
          console.log(JSON.stringify(monthlyExpensesRes.data));
          console.log(JSON.stringify(categoriesExpensesRes.data));
          console.log(JSON.stringify(paymentMethodsExpensesRes.data));

          setDailyExpenses(dailyExpensesRes.data.results || dailyExpensesRes.data);
          setWeeklyExpenses(weeklyExpensesRes.data.results || weeklyExpensesRes.data);
          setMonthlyExpenses(monthlyExpensesRes.data.results || monthlyExpensesRes.data);
          setCategoriesExpenses(categoriesExpensesRes.data.results || categoriesExpensesRes.data);
          setPaymentMethodsExpenses(paymentMethodsExpensesRes.data.results || paymentMethodsExpensesRes.data);
          
        } catch (error) {
          console.error('Failed to fetch dropdown data:', error);
        }
      }
    };
    fetchDropdownData();
  }, [isAuthenticated]);
  
  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
        Hi {user?.username}!, Welcome back 👋
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <AnalyticsWidgetSummary
            title="Weekly Expenses"
            percent={2.6}
            total={weeklyExpenses.reduce((sum, item) => sum + item.total, 0)}
            icon={<img alt="Weekly expenses" src="/assets/icons/glass/ic-glass-bag.svg" />}
            chart={{
              categories: weeklyExpenses.flatMap((item) => item.date),
              series: weeklyExpenses.flatMap((item) => item.sub_total),
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <AnalyticsWidgetSummary
            title="Daily Expenses"
            percent={0.1}
            total={dailyExpenses.reduce((sum, item) => sum + item.total, 0)}
            color="secondary"
            icon={<img alt="New users" src="/assets/icons/glass/ic-glass-users.svg" />}
            chart={{
              categories: dailyExpenses.flatMap((item) => item.date),
              series: dailyExpenses.flatMap((item) => item.total),
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <AnalyticsWidgetSummary
            title="Monthly Expenses"
            percent={2.8}
            total={monthlyExpenses.reduce((sum, item) => sum + item.total, 0)}
            color="warning"
            icon={<img alt="Purchase orders" src="/assets/icons/glass/ic-glass-buy.svg" />}
            chart={{
              categories: monthlyExpenses.flatMap((item) => item.month),
              series: monthlyExpenses.flatMap((item) => item.total),
            }}
          />
        </Grid>

        {/* <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsWidgetSummary
            title="Messages"
            percent={3.6}
            total={234}
            color="error"
            icon={<img alt="Messages" src="/assets/icons/glass/ic-glass-message.svg" />}
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              series: [56, 30, 23, 54, 47, 40, 62, 73],
            }}
          />
        </Grid> */}

        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <AnalyticsCurrentVisits
            title="Expenses by Method"
            subheader={`₹${paymentMethodsExpenses.reduce((sum, item) => sum + item.value, 0)}`}
            chart={{
              series: paymentMethodsExpenses.map((item) => ({ label: item.label, value: item.value })),
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 8 }}>
          <AnalyticsWebsiteVisits
            title="Category-wise Expenses"
            subheader={`₹${categoriesExpenses.reduce((sum, item) => sum + item.total, 0)}`}

            chart={{
              categories: categoriesExpenses.flatMap((item) => item.categories),
              series: [
                { name: 'Expenses', data: categoriesExpenses.flatMap((item) => item.sub_total) },
                // { name: 'Team B', data: [51, 70, 47, 67, 40, 37, 24, 70, 24] },
                
                
              ],
            }}
          />
        </Grid>

        {/* <Grid size={{ xs: 12, md: 6, lg: 8 }}>
          <AnalyticsConversionRates
            title="Conversion rates"
            subheader="(+43%) than last year"
            chart={{
              categories: ['Italy', 'Japan', 'China', 'Canada', 'France'],
              series: [
                { name: '2022', data: [44, 55, 41, 64, 22] },
                { name: '2023', data: [53, 32, 33, 52, 13] },
              ],
            }}
          />
        </Grid> */}

        {/* <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <AnalyticsCurrentSubject
            title="Current subject"
            chart={{
              categories: ['English', 'History', 'Physics', 'Geography', 'Chinese', 'Math'],
              series: [
                { name: 'Series 1', data: [80, 50, 30, 40, 100, 20] },
                { name: 'Series 2', data: [20, 30, 40, 80, 20, 80] },
                { name: 'Series 3', data: [44, 76, 78, 13, 43, 10] },
              ],
            }}
          />
        </Grid> */}

        {/* <Grid size={{ xs: 12, md: 6, lg: 8 }}>
          <AnalyticsNews title="News" list={_posts.slice(0, 5)} />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <AnalyticsOrderTimeline title="Order timeline" list={_timeline} />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <AnalyticsTrafficBySite title="Traffic by site" list={_traffic} />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 8 }}>
          <AnalyticsTasks title="Tasks" list={_tasks} />
        </Grid> */}
      </Grid>
    </DashboardContent>
  );
}
