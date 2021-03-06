import { Component, OnDestroy, OnInit, Inject, ViewEncapsulation, ElementRef, ViewChild } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators, FormControl, FormArray } from '@angular/forms';
import { fuseAnimations } from '@condonuity/animations';
import { profileData } from '../profileData';
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete';
import { map, startWith } from 'rxjs/operators';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Tag } from 'app/main/profile/tabs/models/tag.model';
import { City } from 'app/main/profile/tabs/models/city.model';


@Component({
  selector: 'user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})


export class UserManagementComponent implements OnInit, OnDestroy {
  about: any;
  projectList = [];
  registerForm: FormGroup;
  portfolioForm: FormGroup;
  // Private
  private _unsubscribeAll: Subject<any>;

  /**
   * Constructor
   *
   * @param {ProfileService} _profileService
   */
  constructor(
    // private _profileService: ProfileService
    private _formBuilder: FormBuilder,
    public dialog: MatDialog,

  ) {
    // Set the private defaults
    this._unsubscribeAll = new Subject();
    this.filteredTags = this.tagCtrl.valueChanges.pipe(
      startWith(null),
      map((data: Tag | null) => data ? this._filter(data) : this.allTags.slice()));
  }

  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  tagCtrl = new FormControl();
  filteredTags: Observable<Tag[]>;
  selectedTags: Tag[] = [];
  // allTags: string[] = ['Paint', 'Construction', 'Interior', 'Decoration', 'Exterior','Design'];
  allTags: Tag[] = [{ tagId: 1, tagName: 'Paint' }, { tagId: 2, tagName: 'Construction' }, { tagId: 3, tagName: 'Interior' }, { tagId: 4, tagName: 'Decoration' }, { tagId: 5, tagName: 'Exterior' }, { tagId: 6, tagName: 'Design' }];
  cityNames: City[] = [];

  @ViewChild('tagInput', { static: false }) tagInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto', { static: false }) matAutocomplete: MatAutocomplete;


  private _filter(value): Tag[] {

    let return_value: any;

    if (this.allTags.includes(value)) {
      return_value = this.allTags.filter((data: Tag) => data.tagName.toLowerCase().indexOf(value) !== -1);
      this.selectedHandle(value);
    } else {
      const filterValue = value.toLowerCase();
      return_value = this.allTags.filter((data: Tag) => data.tagName.toLowerCase().indexOf(filterValue) !== -1);
    }
    return return_value;
  }

  private selectedHandle(value: Tag) {
    let index = this.allTags.indexOf(value)
    this.allTags.splice(index, 1);
    this.allTags.sort((a, b) => a.tagName.localeCompare(b.tagName));
    this.registerForm.get('tags').setValue(this.selectedTags);
  }

  remove(data: Tag): void {
    const index = this.selectedTags.indexOf(data);

    if (index >= 0) {
      this.selectedTags.splice(index, 1);
      this.allTags.push(data);
      this.allTags.sort((a, b) => a.tagName.localeCompare(b.tagName));
      this.tagCtrl.setValue(null);
      this.registerForm.get('tags').setValue(this.selectedTags);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.selectedTags.push(event.option.value);
    this.tagInput.nativeElement.value = '';
    this.tagCtrl.setValue(null);
  }

  manageInsurance($event: any) {
    if ($event.checked == true) {
      this.registerForm.get('insuranceCompany').enable();
      this.registerForm.get('liability').enable();
      this.registerForm.get('expiryDate').enable();
    } else {
      this.registerForm.get('insuranceCompany').disable();
      this.registerForm.get('liability').disable();
      this.registerForm.get('expiryDate').disable();
    }
  }

  manageWsib($event: any) {
    if ($event.checked == true) {
      this.registerForm.get('wsibId').enable();
    } else {
      this.registerForm.get('wsibId').disable();
    }
  }

  submitVendor() {
    console.log("Register", this.registerForm.value)
  }

  portfolioDetails() {
    let port = <FormArray>this.registerForm.controls.portfolio as FormArray;
    port.push(this._formBuilder.group({
      projectName: new FormControl(),
      city: new FormControl(),
      client: new FormControl(),
      description: new FormControl(),
      duration: new FormControl(),
      projDate: new FormControl(),
      cost: new FormControl(),
      images: new FormControl(),
      supportDocs: new FormControl()

    }));
  }

  openUserDetailDialog() {
    const UserDetailDialogRef = this.dialog.open(UserDetailDialog, { width: '50%', height: 'auto' });
    UserDetailDialogRef.afterClosed().subscribe(result => {
      if (result != undefined && result != '') {

      }
    });
  }

  openAddVendorUserDialog() {
    const AddVendorUserDialogRef = this.dialog.open(AddVendorUserDialog, { width: '30%', height: 'auto' });
    AddVendorUserDialogRef.afterClosed().subscribe(result => {
      if (result != undefined && result != '') {

      }
    });
  }

  viewProjects(evnet) {

  }


  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    this.about = profileData.about;

    this.registerForm = this._formBuilder.group({
      vendorName: [''],
      compLegalName: [''],
      contactPer: [''],
      streetAddr: [''],
      city: [''],
      province: [''],
      postalCode: [''],
      phone: ['', [Validators.pattern("^[0-9]*$"), Validators.maxLength(15)]],
      fax: [''],
      email: ['', Validators.email],
      website: [''],
      tags: [''],
      servicedCities: [''],
      services: [''],
      lisences: [''],
      memberships: [''],
      products: [''],
      brands: [''],
      establishDate: [''],
      totalEmp: ['', [Validators.pattern("^[0-9]*$"), Validators.maxLength(10)]],
      yearSales: [''],
      desciption: [''],
      portfolio: this._formBuilder.array([]),
      insured: [false],
      insuranceCompany: [{ value: '', disabled: true }],
      liability: [{ value: '', disabled: true }],
      expiryDate: [{ value: '', disabled: true }],
      bonded: [''],
      wsib: [false],
      wsibId: [{ value: '', disabled: true }]
    });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}






@Component({
  selector: 'user-detail-dialog',
  templateUrl: 'user-detail-dialog.html',
  animations: fuseAnimations

})
export class UserDetailDialog {
  spot = { ug: true, gl: true };
  userDetailform: FormGroup;
  profileData;
  constructor(
    // private _profileService: ProfileService
    private _formBuilder: FormBuilder
  ) {
    this.userDetailform = this._formBuilder.group({

      to: ['', Validators.required],
      subject: ['', Validators.required],
      description: ['', Validators.required]



    });

  }
}


@Component({
  selector: 'add-vendor-user-dialog',
  templateUrl: 'add-vendor-user-dialog.html',
  animations: fuseAnimations

})
export class AddVendorUserDialog {
  spot = { ug: true, gl: true };
  userDetailform: FormGroup;
  profileData;
  constructor(
    // private _profileService: ProfileService
    private _formBuilder: FormBuilder
  ) {
    this.userDetailform = this._formBuilder.group({

      to: ['', Validators.required],
      subject: ['', Validators.required],
      description: ['', Validators.required]
    });
  }

  adminCheckboxTriggered(event) {

  }
}