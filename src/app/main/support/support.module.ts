import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import {DatePipe} from '@angular/common';

const routes = [
    {
        path     : 'contactUs',
        loadChildren:  'app/main/support/tabs/contact-us/contact-us.module#ContactUsModule',
    },
    {
        path     : 'newRegistration',
        loadChildren:  'app/main/support/tabs/new-registration/new-registration.module#NewRegistrationModule',

    },
	{
        path     : 'users',
        loadChildren:  'app/main/support/tabs/users/users.module#UsersModule',

    },
	{
        path     : 'userManagement',
        loadChildren:  'app/main/support/tabs/user-management/user-management.module#UserManagementModule',

    },
	
	{
        path     : 'clientManagement',
        loadChildren:  'app/main/support/tabs/client-management/client-management.module#ClientManagementModule',

    },
	{
        path     : 'reviews',
        loadChildren:  'app/main/support/tabs/reviews/reviews.module#ReviewsModule',

    },
	{
        path     : 'messages',
        loadChildren:  'app/main/support/tabs/messages/messages.module#MessagesModule',

    }
	
];



@NgModule({
    declarations: [

    ],
    imports     : [
        RouterModule.forChild(routes),
        
    ],
    providers   : [
        DatePipe
    ],
})
export class SupportModule
{
}
