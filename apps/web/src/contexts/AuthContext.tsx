import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserRole } from '@issueflow/types';
import { useAuthQueries } from '../hooks/useAuthQueries';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  img?: string;
}

interface AuthContextType {
  user: User | null;
  currentOrg: any | null;
  setCurrentOrg: (org: any) => void;
  isLoading: boolean;
  setRole: (role: UserRole) => void; // Keep for UI testing
}

// Keep mock images for better UI feel even with real data
const MOCK_IMAGES: Record<string, string> = {
  OWNER: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCZWNC8qZXcwSlGdjlRwzLfOAn92PelMPxO6H-AJ_32d-Y9PuuzxNOhiCsm7dZwPXAmA3BJNpDr6aaltuD2AO92STvBbWK9zVwzXNagvlA4b9SR22LOyBsBdt14Wy-Q792l5wUYv0kz2cCJwZd6hUqlIjiUlYPnA7w3_i07baPgVxQ5EYKoNtb3BbMALnA3LiKELFwMOVWV4TcQjw5bANR2wIuLR_eWFJf8DHU5r-5Bdksk21Vt3MkMbUUOvGm6GLXsKOqLrNwgw4Ca',
  ADMIN: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAKvxWyT99kSjaRkQB-7nzzEfRBzpjjXwWYRQUdXO86MtswKgO5H7ydF0jZEJTR03Irc2tw2fDTaP-3gpAS3SRHxoltDhhNFIkq5aqhgWOCu23ZIx4Av511uK6czKOUVkTn3H2FxmKNIeYIo75ZONdBFJOMnJPzyaHfCPExrVvygjByEBG7ULr5OKxgQxXdKmfbmiLf03xt-5Jelq-6WfcoTLKlxGQKLXxOR4zPqauZ15QtBehlaka1wd05702YK4HVjXi-acWZ9YFo',
  MEMBER: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB3P9Nv2TTwQKzhqgmOrXf44Xb4OIzIZ7KwTEn5Tc06MJ3DpXBebHUVzY9Ln52UNQnMEqznoh2868BFLwOPKf_N9STP0e9No-RuArXK_rrFRDRrTzeY42l_HqLBO5KI6ZPkP4ScqiIZ5L0PMDy6nZVqo-X5BYqcMy18GHWbVDPwSeQ_nAfYMdWSB1EkRSycqmfuq8oM1AneEu9CsAY6rnC6zhUEanR31XA00k8GKNfX1qACtn6NuiS9pt7HB1543xJ4Vh0kALYhZixa',
  VIEWER: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCZWNC8qZXcwSlGdjlRwzLfOAn92PelMPxO6H-AJ_32d-Y9PuuzxNOhiCsm7dZwPXAmA3BJNpDr6aaltuD2AO92STvBbWK9zVwzXNagvlA4b9SR22LOyBsBdt14Wy-Q792l5wUYv0kz2cCJwZd6hUqlIjiUlYPnA7w3_i07baPgVxQ5EYKoNtb3BbMALnA3LiKELFwMOVWV4TcQjw5bANR2wIuLR_eWFJf8DHU5r-5Bdksk21Vt3MkMbUUOvGm6GLXsKOqLrNwgw4Ca'
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { useMe, useOrganizations } = useAuthQueries();
  const { data: apiUser, isLoading: isUserLoading } = useMe();
  const { data: organizations, isLoading: isOrgsLoading } = useOrganizations();
  
  // Local state for role switching (useful for UI testing)
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [currentOrg, setCurrentOrg] = useState<any | null>(null);

  useEffect(() => {
    if (apiUser) {
      setActiveUser({
        ...apiUser,
        img: MOCK_IMAGES[apiUser.role] || MOCK_IMAGES.MEMBER
      });
    } else {
      setActiveUser(null);
    }
  }, [apiUser]);

  useEffect(() => {
    if (organizations && organizations.length > 0 && !currentOrg) {
      setCurrentOrg(organizations[0]);
    }
  }, [organizations, currentOrg]);

  const setRole = (role: UserRole) => {
    if (activeUser) {
      setActiveUser({ ...activeUser, role, img: MOCK_IMAGES[role] });
    }
  };

  return (
    <AuthContext.Provider value={{ user: activeUser, currentOrg, setCurrentOrg, isLoading: isUserLoading || isOrgsLoading, setRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
