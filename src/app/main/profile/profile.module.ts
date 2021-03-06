import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import {DatePipe} from '@angular/common';

const routes = [
    {
        path     : 'clientProfile',
        loadChildren:  'app/main/profile/tabs/client-profile/client-profile.module#ClientProfileModule',
    },
    {
        path     : 'vendorProfile',
        loadChildren:  'app/main/profile/tabs/vendor-profile-view/vendor-profile-view.module#VendorProfileViewModule',

    },
    {
        path     : 'editVendorProfile',
        loadChildren:  'app/main/profile/tabs/vendor-profile/vendor-profile.module#VendorProfileModule',
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
export class ProfileModule
{
}
