import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import {MatDialogModule} from '@angular/material/dialog';
import { FuseSharedModule } from '@condonuity/shared.module';
import {ContactDialog,TermsConditionDialog,PrivacyPolicyDialog} from 'app/layout/components/footer/footer.component';
import { FooterComponent } from 'app/layout/components/footer/footer.component';
import { MatInputModule } from '@angular/material/input';
@NgModule({
    declarations: [
        FooterComponent,
        ContactDialog,
		TermsConditionDialog,
		PrivacyPolicyDialog
    ],
    imports     : [
        RouterModule,
        MatDialogModule,
        MatButtonModule,
        MatIconModule,
        MatToolbarModule,
        MatInputModule,
        FuseSharedModule
    ],
    exports     : [
        FooterComponent
    ],
entryComponents: [ContactDialog,TermsConditionDialog,PrivacyPolicyDialog
         ]
})
export class FooterModule
{
}
