import { useState, useEffect } from 'react';

// You can define a type for your user object for better type-safety
interface User {
  id: number;
  email: string;
  username: string;
  // add other user properties here
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');

    if (storedUser && token) {
      try {
        setUser(storedUser ? JSON.parse(storedUser) : null);
        setIsAuthenticated(true);
        
      } catch (e) {
        console.error("Failed to parse user data from localStorage", e);
        // Clear corrupted data
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
        setIsAuthenticated(false);
      }
    }
  }, []);
  
  return { user, isAuthenticated };
}
