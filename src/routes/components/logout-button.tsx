// c:\Abhishek\Django\ledgerly-app\src\components\logout-button.tsx

import Button from '@mui/material/Button';
import { SxProps, Theme } from '@mui/material/styles';

import { useLogout } from 'src/routes/hooks/use-logout';

// ----------------------------------------------------------------------

type Props = {
  sx?: SxProps<Theme>;
};

export function LogoutButton({ sx, ...other }: Props) {
  const handleLogout = useLogout();

  return (
    
        <Button 
        onClick={handleLogout} 
        fullWidth color="error" 
        size="medium" 
        variant="text">
        Logout
        </Button>
    
  );
}
