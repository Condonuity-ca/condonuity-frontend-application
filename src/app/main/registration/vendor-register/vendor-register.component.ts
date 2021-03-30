import { Component, OnDestroy, OnInit, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/internal/operators';
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete';
import { FuseConfigService } from '@condonuity/services/config.service';
import { fuseAnimations } from '@condonuity/animations';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Tag } from 'app/main/profile/tabs/models/tag.model';
import { City } from 'app/main/profile/tabs/models/city.model';
import { map, startWith } from 'rxjs/operators';
import { PortfolioDialog } from 'app/main/profile/tabs/vendor-profile-view/vendor-profile-view.component'
import { MatDialog } from '@angular/material/dialog';
import { Portfolio } from 'app/main/models/portfolio.model'
import { CookieService } from 'ngx-cookie-service';
import { AppService } from '../../services/app.service';
import { APIResponse, AppLiterals, AlertType, UserType, AppDateFormat, UserEnrollmentStatus, MaxFileSize } from '../../../utils/app-constants';
import { AppUtilService } from '../../../utils/app-util.service';
import { Router } from '@angular/router';
import { RegistrationService } from '../registration.service';
import * as moment from 'moment';
import { CityProvince } from '../model/city-province.model';
import { AppStateService } from 'app/main/services/app-state.service';
import { MatChipList } from '@angular/material/chips';


export interface DialogData {
  formData: Portfolio;
}

@Component({
  selector: 'vendor-register',
  templateUrl: './vendor-register.component.html',
  styleUrls: ['./vendor-register.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})

export class VendorRegisterComponent implements OnInit, OnDestroy {

  @ViewChild("tagInput", { static: false }) tagField: ElementRef;
  @ViewChild("cityInput", { static: false }) cityField: ElementRef;
  @ViewChild("vendorInput", { static: false }) vendorNameField: ElementRef;
  @ViewChild('chipList', { static: false }) chipList: MatChipList;


  registerForm: FormGroup;
  vendorInfoForm: FormGroup;
  contactInfoForm: FormGroup;
  insuranceForm: FormGroup;
  uploadedFiles = [];

  isValidVendorName = false;
  enteredVendorName: string;

  portfolioDetails = [];
  selectedTagList = [];
  selectedCityList = [];
  selectedProvinceList = [];

  vendorsList = [];
  selectedVendor: any;
  isVendorInputDisabled = false;

  // Private
  private _unsubscribeAll: Subject<any>;
  private hash: string;

  private isInsuranceAvailable: boolean = false;
  private isWsibAvailable: boolean = false;
  private isBonded: boolean;

  public imagePath;
  imgURL: any;

  docFileList: File[] = [];
  profileImageFile: File;
  provinces: string[];

  cityProvinceList: CityProvince[] = [];
  cityProvinceListClone: CityProvince[] = [];

  selectedServiceCityList: CityProvince[];
  selectedCity: CityProvince;
  slectedProvince: string;
  cityList: string[] = [];

  userRegistrationMetaData: any;

  constructor(
    private _fuseConfigService: FuseConfigService,
    private _formBuilder: FormBuilder,
    private dialog: MatDialog,
    private _cookieService: CookieService,
    private _appService: AppService,
    private _appUtil: AppUtilService,
    private router: Router,
    private _registrationService: RegistrationService,
    private appStateService: AppStateService
  ) {
    this._fuseConfigService.config = {
      layout: {
        navbar: {
          hidden: true
        },
        toolbar: {
          hidden: true
        },
        footer: {
          hidden: true
        },
        sidepanel: {
          hidden: true
        }
      }
    };

    this.userRegistrationMetaData = appStateService.userRegMetaData;
    if (this.userRegistrationMetaData != null) {
      this.hash = this.userRegistrationMetaData.hash;
    }
    appStateService.userRegMetaData = null;
    this._unsubscribeAll = new Subject();
  }

  ngOnInit(): void {
    this._registrationService.userData.pipe(takeUntil(this._unsubscribeAll)).subscribe(userData => {
      this.hash = userData.hash;
    });

    this.getAppData();
    this.getUnClaimedVendorOrgList();

    this.vendorInfoForm = this._formBuilder.group({
      vendorName: [''],
      tags: ['', Validators.required],
      finalTags: [this.selectedTags, this.validateTags],
      vendors: ['', Validators.required],
      tagChips: [''],
      vendorChips: [''],
      cityChips: [''],
      servicedCities: ['', Validators.required],
      serviceProvinces: [''],
      description: [''],
      establishDate: [''],
      totalEmp: ['', [Validators.pattern("^[0-9]*$"), Validators.maxLength(10)]],
      yearSales: ['', [Validators.pattern('^[+-]?([0-9]*[,])?([0-9]*[.])?[0-9]+$')]],
      docUploader: ['', Validators.required]
    });

    this.vendorInfoForm.get(['finalTags']).statusChanges.subscribe(
      status => this.chipList.errorState = status === 'INVALID'
    );

    this.contactInfoForm = this._formBuilder.group({
      compLegalName: [''],
      streetAddr: [''],
      city: [''],
      province: [''],
      postalCode: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9].{5,5}$')]],
      phone: [''],
      email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)]],
      fax: [''],
      website: [''],
      contactPerson: [''],
      contactPhone: [''],
      contactEmail: ['', [Validators.email, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)]],
    });

    this.insuranceForm = this._formBuilder.group({
      insured: [false],
      insuranceCompany: [{ value: '', disabled: true }],
      liability: [{ value: '', disabled: true }],
      expiryDate: [{ value: '', disabled: true }],
      bonded: [''],
      wsib: [false],
      wsibId: [{ value: '', disabled: true }],
      servicedCities: [''],
      services: [''],
      lisences: [''],
      memberships: [''],
      products: [''],
      brands: [''],
    });
    this.provinces = AppUtilService.getProvicesList();
  }

  getAppData() {
    this._appService.getAppData().subscribe((res: any) => {
      if (res.statusCode == APIResponse.Success) {
        this.allTags = res.predefinedTags;
        this.allTags.sort((a, b) => a.tagName.localeCompare(b.tagName));

        this.filteredTags = this.tagCtrl.valueChanges.pipe(
          startWith(null),
          map((data: Tag | null) => data ? this._filter(data) : this.allTags.slice()));

        let provinceList = res.serviceProvinceCities;
        provinceList.forEach(province => {
          console.log(province);
          let keys = Object.keys(province);

          let cityList = province[keys[0]];
          cityList.forEach(cityDetails => {
            let cityProvince = new CityProvince();
            cityProvince.city = cityDetails.cityName;
            cityProvince.id = cityDetails.id;
            cityProvince.province = keys[0];
            this.cityNames.push(cityDetails.cityName);
            this.cityProvinceList.push(cityProvince);
          });
        });

        this.cityProvinceList.sort((a, b) => a.city.localeCompare(b.city));

        this.cityProvinceListClone = [...this.cityProvinceList];

        this.filteredCities = this.cityCtrl.valueChanges.pipe(
          startWith(null),
          map((data: CityProvince | null) => data ? this._cityFilter(data) : this.cityProvinceList.slice()));

      } else {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
      }
    },
      err => {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
      });
  }


  getUnClaimedVendorOrgList() {
    this._appService.getUnclaimedVendorOrgList().subscribe((res: any) => {
      if (res.statusCode == APIResponse.Success) {
        this.vendorsList = res.vendorProfiles;
        this.vendorsList.sort((a, b) => a.companyName.localeCompare(b.companyName));
      } else {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
      }
      this.filteredVendors = this.vendorCtrl.valueChanges.pipe(
        startWith(null),
        map((data: any | null) => data ? this._vendorFilter(data) : this.vendorsList.slice()));
    },
      err => {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
        this.filteredVendors = this.vendorCtrl.valueChanges.pipe(
          startWith(null),
          map((data: any | null) => data ? this._vendorFilter(data) : this.vendorsList.slice()));
      });
  }

  preview(files) {
    if (AppUtilService.checkMaxFileSize(files, MaxFileSize.TWOMB)) {
      if (files.length === 0)
        return;

      var mimeType = files[0].type;
      if (mimeType.match(/image\/*/) == null) {
        return;
      }

      var reader = new FileReader();
      this.imagePath = files;
      this.profileImageFile = files[0];
      reader.readAsDataURL(files[0]);
      reader.onload = (_event) => {
        this.imgURL = reader.result;
      }
    }
    else {
      this._appUtil.showAlert(AlertType.Error, AppLiterals.FilesizeError2MB);
    }
  }


  validateTags(finalTags: FormControl) {
    debugger;
    if (finalTags.value && finalTags.value.length === 0) {
      return {
        validateTagsArray: { valid: false }
      };
    }
    return null;
  }

  tagInputFocusOut() {
    this.vendorInfoForm.get(['finalTags']).setValue(this.selectedTags);
  }
  //File Upload
  removeDocAttachment(index) {
    this.docFileList.splice(index, 1);

    if (this.docFileList.length == 0) {
      this.vendorInfoForm.controls['docUploader'].setErrors({ 'incorrect': true });
    }
  }

  appendDocumentFiles(event) {
    let files = event.target.files;


    if (AppUtilService.checkMaxFileSize(files, MaxFileSize.FIVEMB)) {
      if (this.docFileList == null) {
        this.docFileList = [];
      }

      for (let i = 0; i < files.length; i++) {
        let file = files[i];
        file.formatedSize = AppUtilService.formatSizeUnits(file.size);
        this.docFileList.push(file)
      }
    } else {
      this._appUtil.showAlert(AlertType.Error, AppLiterals.FilesizeError5MB);
    }

    this.vendorInfoForm.controls['docUploader'].setErrors(null);

  }

  //*************** Tag search starts ****************************
  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];

  tagCtrl = new FormControl();
  filteredTags: Observable<Tag[]>;
  selectedTags: Tag[] = [];
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
    console.log(this.selectedTags, this.allTags);
    this.vendorInfoForm.get('tags').setValue(this.selectedTags);
    this.tagField.nativeElement.blur();
    this.tagField.nativeElement.focus();
  }

  remove(data: Tag): void {
    const index = this.selectedTags.indexOf(data);
    if (index >= 0) {
      this.selectedTags.splice(index, 1);
      this.allTags.push(data);
      this.allTags.sort((a, b) => a.tagName.localeCompare(b.tagName));
      this.tagCtrl.setValue(null);
      this.vendorInfoForm.get('tags').setValue(this.selectedTags);
    }
    this.vendorInfoForm.get(['finalTags']).setValue(this.selectedTags);

    if (this.selectedTags.length == 0) {
      this.vendorInfoForm.controls['tags'].setErrors({ 'incorrect': true });
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.vendorInfoForm.controls['tags'].setErrors(null);
    this.selectedTags.push(event.option.value);
    this.tagInput.nativeElement.value = '';
    this.tagCtrl.setValue(null);
    this.tagField.nativeElement.blur();
    this.tagField.nativeElement.focus();
    this.vendorInfoForm.get(['finalTags']).setValue(this.selectedTags);
  }
  //*************** Tag search ends ****************************

  //*************** City search starts ****************************
  cityCtrl = new FormControl();
  filteredCities: Observable<CityProvince[]>;
  selectedCities: CityProvince[] = [];

  @ViewChild('cityAuto', { static: false }) cityAutocomplete: MatAutocomplete;

  private _cityFilter(value): CityProvince[] {
    let return_value: any;
    if (this.cityProvinceList.includes(value)) {
      return_value = this.cityProvinceList.filter((data: CityProvince) => data.city.toLowerCase().indexOf(value) !== -1);
      this.selectedCityHandle(value);
    } else {
      const filterValue = value.toLowerCase();
      return_value = this.cityProvinceList.filter((data: CityProvince) => data.city.toLowerCase().indexOf(filterValue) !== -1);
    }
    return return_value;
  }

  private selectedCityHandle(value: CityProvince) {
    let index = this.cityProvinceList.indexOf(value)
    this.cityProvinceList.splice(index, 1);
    this.cityProvinceList.sort((a, b) => a.city.localeCompare(b.city));
    console.log(this.selectedCities, this.cityProvinceList);
    this.vendorInfoForm.get('servicedCities').setValue(this.selectedCities);
    this.cityField.nativeElement.blur();
    this.cityField.nativeElement.focus();
  }

  removeCity(data: CityProvince): void {

    const index = this.selectedCities.indexOf(data);
    if (index >= 0) {
      this.selectedCities.splice(index, 1);
      this.cityProvinceList.push(data);
      this.cityProvinceList.sort((a, b) => a.city.localeCompare(b.city));
      this.cityCtrl.setValue(null);
      this.vendorInfoForm.get('servicedCities').setValue(this.selectedCities);
    }

    if (this.selectedCities.length == 0) {
      this.vendorInfoForm.controls['servicedCities'].setErrors({ 'incorrect': true });
    }

    this.populateProvinceNameList();
  }


  selectCity(event: MatAutocompleteSelectedEvent): void {
    this.vendorInfoForm.controls['servicedCities'].setErrors(null);
    this.selectedCities.push(event.option.value);
    this.cityField.nativeElement.value = '';
    this.cityCtrl.setValue(null);
    this.populateProvinceNameList();
    this.cityField.nativeElement.blur();
    this.cityField.nativeElement.focus();
  }

  populateProvinceNameList() {
    let provinceNames = this.selectedCities.map((cityPro: CityProvince) => {
      return cityPro.province;
    });

    provinceNames = provinceNames.filter(function (elem, index, self) {
      return index === self.indexOf(elem);
    });

    this.selectedCityList = this.selectedCities.map((cityPro: CityProvince) => {
      return cityPro.id;
    });
    this.vendorInfoForm.get('serviceProvinces').setValue(provinceNames.toString());
  }

  //*************** City search ends ****************************

  //*************** Vendor search starts ****************************
  vendorCtrl = new FormControl();
  filteredVendors: Observable<any[]>;
  selectedVendors: any[] = [];

  @ViewChild('vendorInput', { static: false }) vendorInput: ElementRef<HTMLInputElement>;
  @ViewChild('vendorAuto', { static: false }) vendorAutocomplete: MatAutocomplete;


  private _vendorFilter(value): any[] {

    let return_value: any;
    if (value.length >= 3) {
      this.enteredVendorName = value;
      this.isValidVendorName = true;
      this.vendorInfoForm.controls['vendors'].setErrors(null);
    } else {
      this.isValidVendorName = false;
      this.vendorInfoForm.controls['vendors'].setErrors({ 'incorrect': true });
    }

    if (this.vendorsList.includes(value)) {
      return_value = this.vendorsList.filter((vendor: any) => vendor.companyName.toLowerCase().indexOf(value) !== -1);
      this.selectedVendorHandle(value);
    } else {
      const filterValue = value.toLowerCase();
      return_value = this.vendorsList.filter((vendor: any) => vendor.companyName.toLowerCase().indexOf(filterValue) !== -1);
    }
    return return_value;
  }

  private selectedVendorHandle(value: any) {
    let index = this.vendorsList.indexOf(value)
    this.vendorsList.splice(index, 1);
    this.vendorsList.sort((a, b) => a.companyName.localeCompare(b.companyName));
    this.vendorInfoForm.get('vendors').setValue(this.selectedVendors);
    this.vendorInput.nativeElement.blur();
    this.vendorInput.nativeElement.focus();
  }

  removeVendor(data: any): void {
    const index = this.selectedVendors.indexOf(data);
    if (index >= 0) {
      this.isVendorInputDisabled = false;
      this.selectedVendors.splice(index, 1);
      this.vendorsList.push(data);
      this.vendorsList.sort((a, b) => a.companyName.localeCompare(b.companyName));
      this.vendorCtrl.setValue(null);
      this.vendorInfoForm.get('vendors').setValue(this.selectedVendors);
      this.selectedVendor = null;

      this.isValidVendorName = false;
      this.enteredVendorName = null;
      this.contactInfoForm.reset();
    }
    this.vendorInfoForm.controls['vendors'].setErrors({ 'incorrect': true });
  }

  selectVendor(event: MatAutocompleteSelectedEvent): void {
    this.isVendorInputDisabled = true;
    this.selectedVendors.push(event.option.value);
    this.vendorInput.nativeElement.value = '';
    this.vendorCtrl.setValue(null);
    this.vendorInput.nativeElement.blur();
    this.isValidVendorName = true;
    this.enteredVendorName = null;

    this.selectedVendor = event.option.value;
    let vendorTags = this.selectedVendor.expertiseCategory.split(',');
    vendorTags.forEach(tagName => {
      let sTag = this.allTags.find(mTag => mTag.tagName.toLowerCase() == tagName.toLowerCase().trim());
      if (sTag != null) {
        this.selectedTags.push(sTag);
      }
    });

    if (this.selectedTags.length > 0) {
      this.vendorInfoForm.controls['tags'].setErrors(null);
      this.tagInput.nativeElement.value = '';
      this.tagCtrl.setValue(null);
    }

    if (this.selectedTags.length > 0) {
      let parent = this;
      this.allTags = this.allTags.filter(function (val) {
        return parent.selectedTags.map(function (e) {
          return e.tagName
        }).indexOf(val.tagName) == -1
      });
    }


    this.vendorInfoForm.controls['vendors'].setErrors(null);
    this.vendorInfoForm.get(['finalTags']).setValue(this.selectedTags);

    this.populateVendorInfo();
  }

  populateVendorInfo() {
    debugger;
    this.contactInfoForm.get('streetAddr').setValue(this.selectedVendor.address);
    this.contactInfoForm.get('phone').setValue(this.selectedVendor.phoneNumber);
    this.contactInfoForm.get('contactPerson').setValue(this.selectedVendor.contactPerson);
    this.contactInfoForm.get('fax').setValue(this.selectedVendor.fax);
    this.contactInfoForm.get('website').setValue(this.selectedVendor.website);
    this.contactInfoForm.get('postalCode').setValue(this.selectedVendor.postalCode);

    this.contactInfoForm.get('phone').setValue(this.selectedVendor.phoneNumber);
    this.contactInfoForm.get('fax').setValue(this.selectedVendor.faxNumber);

    let vendorCity = this.cityProvinceListClone.find(cityPro => cityPro.city.toLocaleLowerCase() == this.selectedVendor.city.toLocaleLowerCase());
    if (vendorCity != null) {
      this.selectedCity = vendorCity;
      this.contactInfoForm.get('city').setValue(vendorCity);
      this.contactInfoForm.get('province').setValue(vendorCity.province);
    }
  }

  //*************** Vendor search ends ****************************


  manageInsurance($event: any) {
    this.isInsuranceAvailable = $event.checked;
    if ($event.checked == true) {
      this.insuranceForm.get('insuranceCompany').enable();
      this.insuranceForm.get('liability').enable();
      this.insuranceForm.get('expiryDate').enable();
    } else {
      this.insuranceForm.get('insuranceCompany').disable();
      this.insuranceForm.get('liability').disable();
      this.insuranceForm.get('expiryDate').disable();

      this.insuranceForm.get('insuranceCompany').setValue("");
      this.insuranceForm.get('liability').setValue("");
      this.insuranceForm.get('expiryDate').setValue("");

    }
  }

  bondChanged($event: any) {
    this.isBonded = $event.checked;
  }

  manageWsib($event: any) {
    this.isWsibAvailable = $event.checked;
    if ($event.checked == true) {
      this.insuranceForm.get('wsibId').enable();
    } else {
      this.insuranceForm.get('wsibId').disable();
      this.insuranceForm.get('wsibId').setValue("");
    }
  }

  openPortfolioDialog() {
    const dialogRef = this.dialog.open(PortfolioDialog);
    dialogRef.afterClosed().subscribe(result => {
      if (result != undefined && result != '') {
        this.portfolioDetails.push(result);
      }
    });
  }

  openEditPortfolioDialog(portfolioData: Portfolio, index) {
    const dialogRef = this.dialog.open(PortfolioDialog, { data: { formData: portfolioData } });

    dialogRef.afterClosed().subscribe(result => {
      if (result != undefined && result != '') {
        console.log(result);
      }
    });
  }

  clearRegisterData() {
    this._cookieService.deleteAll();
    localStorage.clear();
  }

  tagListUpdated(selectedTagsValue) {
    this.selectedTagList = selectedTagsValue;
  }

  provinceListUpdated(selectedprovinceList) {
    this.selectedProvinceList = selectedprovinceList;
  }

  cityListUpdated(selectedCitiesValue) {
    this.selectedServiceCityList = selectedCitiesValue
    let provinceNames = this.selectedServiceCityList.map((cityPro: CityProvince) => {
      return cityPro.province;
    });

    provinceNames = provinceNames.filter(function (elem, index, self) {
      return index === self.indexOf(elem);
    });

    this.selectedCityList = this.selectedServiceCityList.map((cityPro: CityProvince) => {
      return cityPro.id;
    });
    this.vendorInfoForm.get('serviceProvinces').setValue(provinceNames.toString());
  }



  cityNameUpdated(selectedCity) {
    this.selectedCity = selectedCity
    this.contactInfoForm.get('province').setValue(selectedCity.province);
  }



  registerVendorOrganisation() {
    debugger;

    let formatedTags = this.selectedTags.map((tag: any) => {
      return {
        'tagId': tag.tagId
      }
    });

    let insurnaceExpiry = this.insuranceForm.value['expiryDate'];
    let insuranceAvailability = '1';

    if (this.isInsuranceAvailable == false) {
      insuranceAvailability = '0';
    }

    let bondedValue = '1';
    if (this.isBonded == false) {
      bondedValue = '0';
    }

    let insuranceExpiryDate = "";
    if (insurnaceExpiry != null) {
      insuranceExpiryDate = insurnaceExpiry.format(AppDateFormat.ServiceFormat)
    }

    let insuranceDetails = {
      "insuranceAvailability": insuranceAvailability,
      "insuranceBonded": bondedValue,
      "insuranceCompany": this.insuranceForm.value['insuranceCompany'],
      "insuranceLiability": this.insuranceForm.value['liability'],
      "insuranceNumber": this.insuranceForm.value['wsibId'],
      "insurancePolicyExpiryDate": insuranceExpiryDate
    }

    let vendorCompanyName = '';

    if (this.selectedVendor != null) {
      vendorCompanyName = this.selectedVendor.companyName;
    } else {
      vendorCompanyName = this.enteredVendorName;
    }

    if (this.vendorInfoForm.valid && this.contactInfoForm.valid && this.insuranceForm.valid) {

      let dateOfEstabilishment = moment(this.vendorInfoForm.value['establishDate']).format('YYYY-MM-DD');
      let orgonization = {
        "userType": UserType.Vendor,

        "companyName": vendorCompanyName.trim(),
        "description": this.vendorInfoForm.value['description'],
        "establishedDate": dateOfEstabilishment,
        "employeesCount": this.vendorInfoForm.value['totalEmp'],
        "annualRevenue": this.vendorInfoForm.value['yearSales'],

        "legalName": this.contactInfoForm.value['compLegalName'],
        "address": this.contactInfoForm.value['streetAddr'],
        "province": this.contactInfoForm.value['province'],
        "city": this.selectedCity.id.toString(),
        "postalCode": this.contactInfoForm.value['postalCode'],
        "phoneNumber": this.contactInfoForm.value['phone'],
        "email": this.contactInfoForm.value['email'],
        "faxNumber": this.contactInfoForm.value['fax'],
        "website": this.contactInfoForm.value['website'],
        "contactPerson": this.contactInfoForm.value['contactPerson'],
        "contactPersonEmail": this.contactInfoForm.value['contactEmail'],
        "contactPersonPhone": this.contactInfoForm.value['contactPhone'],
        "vendorTags": formatedTags,

        //**** Hardcoded *****
        "countryCode": "",
        "expertiseCategory": "",
        "logoName": "",
      };

      let vendorOrganisationDetails = {
        "organisation": orgonization,
        "serviceCities": this.selectedCityList.toString(),
        "services": this.insuranceForm.value['services'],
        "licenses": this.insuranceForm.value['lisences'],
        "memberships": this.insuranceForm.value['memberships'],
        "products": this.insuranceForm.value['products'],
        "brands": this.insuranceForm.value['brands'],
        "insurance": insuranceDetails
      };

      if (this.selectedVendor != null) {
        vendorOrganisationDetails['vendorProfileId'] = this.selectedVendor.vendorProfileId;
      }

      this._appService.registerVendorOrganisation(vendorOrganisationDetails, this.hash).subscribe((res: any) => {
        if (res.statusCode == APIResponse.Success) {
          this._appUtil.showAlert(AlertType.Success, AppLiterals.userRegistrationSuccessful);
          localStorage.setItem('authToken', res.authToken);
          this.checkAndUploadFiles(res.vendorOrganisationId, res.vendorId);
        } else if (res.statusCode == UserEnrollmentStatus.AlreadyExist) {
          this._appUtil.showAlert(AlertType.Error, AppLiterals.vendorCompNameExistAlready);
        } else if (res.statusCode == UserEnrollmentStatus.ReachedMaxiumCount) { //Corp# alreay exists
          this._appUtil.showAlert(AlertType.Error, AppLiterals.vendorCompNameExistAlready);
        } else {
          this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
        }
      },
        err => {
          this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
        });
    }
  }

  checkAndUploadFiles(vendorOrgId, vendorId) {
    if (this.profileImageFile != null) {
      this.uploadVendorProfileImage(vendorOrgId, vendorId);
    } else if (this.docFileList != null && this.docFileList.length > 0) {
      this.uploadVendorSupportingFiles(vendorOrgId, vendorId);
    } else {
      this._appUtil.showAlert(AlertType.Success, AppLiterals.userRegistrationSuccessful);
      this.router.navigate(['/auth/login']);
    }
  }


  uploadVendorProfileImage(vendorOrgId, vendorId) {
    this._appService.uploadVendorOrgProfileImage(this.profileImageFile, vendorOrgId).subscribe((response: any) => {
      if (response.statusCode == APIResponse.Success) {
        if (this.docFileList != null && this.docFileList.length > 0) {
          this.uploadVendorSupportingFiles(vendorOrgId, vendorId);
        } else {
          this._appUtil.showAlert(AlertType.Success, AppLiterals.filesSubmissionSuccessful);
          this.router.navigate(['/auth/login']);
        }
      } else {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.filesSubmissionFailes);
      }
    }, err => {
      this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
      console.log(err);
    });
  }

  uploadVendorSupportingFiles(vendorOrgId, vendorId) {
    let successCount = 0;
    this.docFileList.forEach(file => {
      this._appService.uploadVendorOrgRegistrationSupportFiles(file, vendorOrgId, vendorId).subscribe((response: any) => {
        if (response.statusCode == APIResponse.Success) {
          successCount = successCount + 1;
          if (successCount == this.docFileList.length) {
            this._appUtil.showAlert(AlertType.Success, AppLiterals.filesSubmissionSuccessful);
            this.router.navigate(['/auth/login']);
          }
        } else {
          this._appUtil.showAlert(AlertType.Error, AppLiterals.filesSubmissionFailes);
        }
      }, err => {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
        console.log(err);
      });
    });
  }


  /**
   * On destroy
   */
  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
