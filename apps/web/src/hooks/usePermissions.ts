import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '@issueflow/types';

export function usePermissions() {
  const { user, currentOrg } = useAuth();
  
  // Real role from the current organization, fallback to user.role (for testing) or MEMBER
  const role = currentOrg?.members?.[0]?.role || user?.role || 'MEMBER';

  return {
    role,
    isOwner: role === 'OWNER',
    isAdmin: role === 'ADMIN',
    isMember: role === 'MEMBER',
    isViewer: role === 'VIEWER',

    // 🗝️ Owner specific permissions
    canManageBilling: role === 'OWNER',
    canDeleteWorkspace: role === 'OWNER',
    canViewAuditLogs: role === 'OWNER',
    canTransferOwnership: role === 'OWNER',
    canConfigureSecurity: role === 'OWNER',

    // 🛠️ Admin & Owner permissions
    canInviteMembers: role === 'OWNER' || role === 'ADMIN',
    canManageProjects: role === 'OWNER' || role === 'ADMIN',
    canCreateProjects: role === 'OWNER' || role === 'ADMIN',
    canManageUsers: role === 'OWNER' || role === 'ADMIN',
    canManageGlobalIssues: role === 'OWNER' || role === 'ADMIN',

    // Members (Baseline)
    canCreateIssues: role !== 'VIEWER',
    canEditOwnIssues: role !== 'VIEWER',
    canComment: true, // Everyone can comment according to PRD v1.2 (though usually viewers might be limited, ROLES_MEMBER says collaboration is a perk)
  };
}
