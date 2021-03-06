import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ValidationErrors, Validators, FormControl, FormArray } from '@angular/forms';
import { environment } from 'environments/environment';


@Component({
  selector: 'footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})


export class FooterComponent implements OnInit, OnDestroy {
  constructor(
    public dialog: MatDialog,
  ) {
  }

  contactUsPageUrl = environment.landingSiteUrl + "/contact.html";
  privacyPolicyUrl = environment.landingSiteUrl + "/privacy.html";
  termsConditionUrl = environment.landingSiteUrl + "/terms.html";


  openContactDialog() {
    const userNewRef = this.dialog.open(ContactDialog, { width: '600px', height: 'auto' });
  }


  openTermsConditionDialog() {
    const TermsConditionDialogRef = this.dialog.open(TermsConditionDialog, { panelClass: 'myapp-no-padding-dialog', width: '1100px', height: 'auto' });

  }


  openPrivacyPolicyDialog() {
    const PrivacyPolicyDialogRef = this.dialog.open(PrivacyPolicyDialog, { panelClass: 'myapp-no-padding-dialog', width: '1100px', height: 'auto' });

  }

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {

  }

  /**
   * On destroy
   */
  ngOnDestroy(): void {

  }

}

@Component({
  selector: 'contact-dialog',
  templateUrl: 'contact-dialog.html',
})
export class ContactDialog {
  ContactForm: FormGroup;


  constructor(private _formBuilder: FormBuilder) {
    this.ContactForm = this._formBuilder.group({
      name: ['', Validators.required],
      email: ['', Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)],
      phonenumber: ['', Validators.pattern("^((\\+1-?)|0)?[0-9]{10}$")],
      description: ['', Validators.required],
    })
  }
}

@Component({
  selector: 'terms-condition-dialog',
  templateUrl: 'terms-condition-dialog.html',
})
export class TermsConditionDialog {


}

@Component({
  selector: 'privacy-policy-dialog',
  templateUrl: 'privacy-policy-dialog.html',
})
export class PrivacyPolicyDialog {


}
