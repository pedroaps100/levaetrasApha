import { useAuth } from '@/contexts/AuthContext';

export const usePermissions = () => {
    const { user } = useAuth();

    const hasPermission = (permission: string) => {
        if (!user || user.role !== 'admin') {
            return false;
        }
        // Master admin always has all permissions
        if (user.cargoId === 'admin-master') {
            return true;
        }
        return user.permissions?.includes(permission) ?? false;
    };
    
    return { hasPermission };
};
