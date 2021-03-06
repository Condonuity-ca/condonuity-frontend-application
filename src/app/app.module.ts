import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import 'hammerjs';

import { FuseModule } from '@condonuity/condonuity.module';
import { FuseSharedModule } from '@condonuity/shared.module';
import { FuseProgressBarModule, FuseSidebarModule, FuseThemeOptionsModule } from '@condonuity/components';

import { fuseConfig } from 'app/condonuity-config';
import { AppComponent } from 'app/app.component';
import { LayoutModule } from 'app/layout/layout.module';
// import { RegisterModule } from 'app/main/registration/register/register.module';
import { AuthGuard } from './_helpers';
import { MatSnackBarModule, MatFormFieldModule, MatSelectModule, MatCheckboxModule, MatInputModule } from '@angular/material';
import { AuthInterceptor } from './_services/auth-interceptor';
import { ConfirmationDialogComponent } from './main/Shared/confirmation-dialog/confirmation-dialog.component';
import { DownloadDialogComponent } from './main/Shared/download-dialog/download-dialog.component';

import { LoaderService } from '../app/_services/loader.service';
import { LoaderInterceptor } from '../app/_services/loader.interceptor';
import { LoaderComponent } from './layout/components/loader/loader/loader.component';
import { DateRangePickerModule } from '@syncfusion/ej2-angular-calendars';
import { DatePipe } from '@angular/common'
import { ReactiveFormsModule } from '@angular/forms';



const appRoutes: Routes = [
  {
    path: 'auth',
    loadChildren: './main/authenticate/authenticate.module#AuthenticateModule'
  },
  {
    path: 'register',
    loadChildren: './main/registration/registration.module#RegistrationModule'
  },
  {
    path: 'profile',
    loadChildren: './main/profile/profile.module#ProfileModule',
    canActivate: [AuthGuard]
  },
  {
    path: 'account',
    loadChildren: './main/account/account.module#AccountModule',
    canActivate: [AuthGuard]
  },
  {
    path: 'messages',
    loadChildren: './main/messages/messages.module#MessagesModule',
    canActivate: [AuthGuard]
  },
  {
    path: 'marketplace',
    loadChildren: './main/market-place/market-place.module#MarketPlaceModule',
    canActivate: [AuthGuard]
  },
  {
    path: 'browseVendors',
    loadChildren: './main/vendor-browser/vendor-browser.module#VendorBrowserModule',
    canActivate: [AuthGuard]
  },
  {
    path: 'browseCondos',
    loadChildren: './main/condo-browser/condo-browser.module#CondoBrowserModule',
    canActivate: [AuthGuard]
  },
  {
    path: 'managementTools',
    loadChildren: './main/management-tools/management-tools.module#ManagementToolsModule',
    canActivate: [AuthGuard]
  },
  {
    path: 'myreview',
    loadChildren: './main/view-review/view-review.module#ViewReviewModule',
    canActivate: [AuthGuard]
  },
  {
    path: 'projects',
    loadChildren: './main/project/project.module#ProjectModule',
    canActivate: [AuthGuard]
  },

  {
    path: 'support',
    loadChildren: './main/support/support.module#SupportModule',
    canActivate: [AuthGuard]
  },

  {
    path: '**',
    redirectTo: 'auth/login'
  },

];

@NgModule({
  declarations: [
    AppComponent,
    ConfirmationDialogComponent,
    DownloadDialogComponent,
    LoaderComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    RouterModule.forRoot(appRoutes, {
      scrollPositionRestoration: 'enabled'
    }),

    TranslateModule.forRoot(),

    // Material moment date module
    MatMomentDateModule,

    // Material
    MatButtonModule,
    MatDialogModule,
    MatIconModule,

    // Fuse modules
    FuseModule.forRoot(fuseConfig),
    FuseProgressBarModule,
    FuseSharedModule,
    FuseSidebarModule,
    FuseThemeOptionsModule,

    // App modules
    LayoutModule,
    // LoginModule,
    // ProfileModule
    MatSnackBarModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,
    MatInputModule,
    DateRangePickerModule,
    ReactiveFormsModule
  ],
  exports: [
    ConfirmationDialogComponent,
    DownloadDialogComponent,
  ],
  providers: [
    DatePipe,
    LoaderService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoaderInterceptor,
      multi: true
    }
  ],
  bootstrap: [
    AppComponent
  ],
  entryComponents: [
    ConfirmationDialogComponent,
    DownloadDialogComponent
  ]
})

export class AppModule {

}
