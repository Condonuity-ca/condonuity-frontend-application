import { FuseNavigation } from '@condonuity/types';

export const navigationVendor: FuseNavigation[] = [

    {
        id: 'profile',
        title: 'Profile',
        type: 'item',
        icon: 'perm_identity',
        url: 'profile/vendorProfile',
        exactMatch: true
    },
    {
        id: 'account',
        title: 'Account',
        type: 'item',
        icon: 'assignment_ind',
        url: 'account/vendorDetails',
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
        id: 'myprojects',
        title: 'My Projects',
        type: 'item',
        icon: 'event_note',
        url: 'projects/vendor',
        exactMatch: true
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

];
