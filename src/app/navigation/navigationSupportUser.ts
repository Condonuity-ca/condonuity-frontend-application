import { FuseNavigation } from '@condonuity/types';

export const navigationSupportUser: FuseNavigation[] = [

    {
        id: 'registration',
        title: 'New Registrations',
        type: 'item',
        icon: 'perm_identity',
        url: 'support/newRegistration',
        exactMatch: true
    },
    {
        id: 'client',
        title: 'Client Mangement',
        type: 'item',
        icon: 'perm_identity',
        url: 'support/clientManagement',
        exactMatch: true
    },
    {
        id: 'users',
        title: 'Users',
        type: 'item',
        icon: 'perm_identity',
        url: 'support/users',
        exactMatch: true
    },
    {
        id: 'usermanagement',
        title: 'User Accounts',
        type: 'item',
        icon: 'perm_identity',
        url: 'support/userManagement',
        exactMatch: true
    },

    {
        id: 'project',
        title: 'Project Management',
        type: 'item',
        icon: 'assignment_ind',
        url: 'projects/support',
        exactMatch: true
    },
    {
        id: 'reviews',
        title: 'Reviews',
        type: 'item',
        icon: 'assignment_ind',
        url: 'support/reviews',
        exactMatch: true
    },
    {
        id: 'messages',
        title: 'Messages',
        type: 'item',
        icon: 'assignment_ind',
        url: 'support/messages',
        exactMatch: true
    },
];
