import { FuseNavigation } from '@condonuity/types';

export const navigationclient: FuseNavigation[] = [


    {
        id: 'profile',
        title: 'Profile',
        type: 'item',
        icon: 'perm_identity',
        url: 'profile/clientProfile',
        exactMatch: true
    },
    {
        id: 'account',
        title: 'Account',
        type: 'item',
        icon: 'assignment_ind',
        url: 'account/clientDetails',
        exactMatch: true
    },
    {
        id: 'messages',
        title: 'Messages',
        type: 'item',
        icon: 'message',
        url: 'messages/clientMessages',
        // exactMatch: true,
        // badge    : {
        //     title: '13',
        //     bg   : '#F44336',
        //     fg   : '#ffffff'
        // }
    },
    {
        id: 'myreviews',
        title: 'My Reviews',
        type: 'item',
        icon: 'format_list_bulleted',
        url: 'myreview',
    },
    {
        id: 'myprojects',
        title: 'My Projects',
        type: 'item',
        icon: 'event_note',
        url: 'projects/client'
    },
    {
        id: 'marketplace',
        title: 'Marketplace',
        type: 'item',
        icon: 'device_hub',
        url: 'marketplace'
    },
    {
        id: 'browsevendors',
        title: 'Browse Contractors',
        type: 'item',
        icon: 'filter_tilt_shift',
        url: 'browseVendors'
    },
    {
        id: 'browsecondos',
        title: 'Browse Condos',
        type: 'item',
        icon: 'group_work',
        url: 'browseCondos',
        exactMatch: true
    },

    {
        id: 'managementtools',
        title: 'Management Tools',
        type: 'item',
        icon: 'dvr',
        url: 'managementTools/task'
    }
];
