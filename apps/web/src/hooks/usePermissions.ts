import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '@issueflow/types';

export function usePermissions() {
  const { user, currentOrg } = useAuth();
  
  // Real role from the current organization, fallback to user.role (for testing) or MEMBER
  const role = currentOrg?.members?.[0]?.role || user?.role || 'MEMBER';
  const hasOrg = !!currentOrg?.id;

  return {
    role,
    isOwner: hasOrg && role === 'OWNER',
    isAdmin: hasOrg && role === 'ADMIN',
    isMember: hasOrg && role === 'MEMBER',
    isViewer: hasOrg && role === 'VIEWER',

    // 🗝️ Owner specific permissions
    canManageBilling: hasOrg && role === 'OWNER',
    canDeleteWorkspace: hasOrg && role === 'OWNER',
    canViewAuditLogs: hasOrg && role === 'OWNER',
    canTransferOwnership: hasOrg && role === 'OWNER',
    canConfigureSecurity: hasOrg && role === 'OWNER',

    // 🛠️ Admin & Owner permissions
    canInviteMembers: hasOrg && (role === 'OWNER' || role === 'ADMIN'),
    canManageProjects: hasOrg && (role === 'OWNER' || role === 'ADMIN'),
    canCreateProjects: hasOrg && (role === 'OWNER' || role === 'ADMIN'),
    canManageUsers: hasOrg && (role === 'OWNER' || role === 'ADMIN'),
    canManageGlobalIssues: hasOrg && (role === 'OWNER' || role === 'ADMIN'),

    // Members (Baseline)
    canCreateIssues: hasOrg && role !== 'VIEWER',
    canEditOwnIssues: hasOrg && role !== 'VIEWER',
    canComment: hasOrg, // Everyone except viewers can comment
  };
}
