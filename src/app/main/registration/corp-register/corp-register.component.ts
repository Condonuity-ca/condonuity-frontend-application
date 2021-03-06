import { Component, OnDestroy, OnInit, ViewEncapsulation, ElementRef, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators, FormControl } from '@angular/forms';
import { Subject, from, Observable } from 'rxjs';
import { FuseConfigService } from '@condonuity/services/config.service';
import { fuseAnimations } from '@condonuity/animations';
import { CookieService } from 'ngx-cookie-service';
import { AppService } from '../../services/app.service';
import { APIResponse, AmenityID, UserEnrollmentStatus, MaxFileSize } from '../../../utils/app-constants';
import { Router, ActivatedRoute } from '@angular/router';
import { RegistrationService } from '../registration.service';
import { takeUntil, startWith, map } from 'rxjs/operators';
import { UserType, AlertType, AppLiterals } from '../../../utils/app-constants';
import { AppUtilService } from '../../../utils/app-util.service';
import { DatePipe } from '@angular/common';
import * as moment from 'moment';
import { Amenity } from '../model/amenity.model';
import { CityProvince } from '../model/city-province.model';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete';
import { AppStateService } from 'app/main/services/app-state.service';

@Component({
  selector: 'corp-register',
  templateUrl: './corp-register.component.html',
  styleUrls: ['./corp-register.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})

export class CorpRegisterComponent implements OnInit, OnDestroy {
  corpInfoForm: FormGroup;
  otherInfoForm: FormGroup;
  aminitiesInfoForm: FormGroup;

  mandatory = "Mandatory field is required";
  uploadedFiles = [];
  maxRegDate = new Date();

  amenitiesDetails = {};
  userId: any;

  imgURL: any;
  profileImageFile: File;
  docFileList: File[] = [];

  amenityList: Amenity[];
  cityProvinceList: CityProvince[] = [];
  cityList: String[] = [];

  selectedCityPro: CityProvince;

  userRegistrationMetaData: any;


  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];

  tagCtrl = new FormControl();
  filteredAmenities: Observable<Amenity[]>;
  selectedAmenities: Amenity[] = [];

  @ViewChild('tagInput', { static: false }) tagInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto', { static: false }) matAutocomplete: MatAutocomplete;

  // Private
  private _unsubscribeAll: Subject<any>;
  private hash: string;

  constructor(
    private route: ActivatedRoute,
    private _fuseConfigService: FuseConfigService,
    private _formBuilder: FormBuilder,
    private _cookieService: CookieService,
    private _appService: AppService,
    private router: Router,
    private _registrationService: RegistrationService,
    private _appUtil: AppUtilService,
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

  citySelected(cityInfo) {
    this.selectedCityPro = cityInfo;
    this.corpInfoForm.get('province').setValue(cityInfo.province);
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
      this.corpInfoForm.controls['docUploader'].setErrors(null);
    } else {
      this._appUtil.showAlert(AlertType.Error, AppLiterals.FilesizeError5MB);
    }
  }

  removeDocAttachment(index) {
    this.docFileList.splice(index, 1);

    if (this.docFileList.length == 0) {
      this.corpInfoForm.controls['docUploader'].setErrors({ 'incorrect': true });
    }
  }


  fileEvent(files) {
    if (AppUtilService.checkMaxFileSize(files, MaxFileSize.TWOMB)) {
      if (files.length === 0)
        return;

      var mimeType = files[0].type;
      if (mimeType.match(/image\/*/) == null) {
        return;
      }

      var reader = new FileReader();
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


  clearRegisterData() {
    this._cookieService.deleteAll();
    localStorage.clear();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {

    this._registrationService.userData.pipe(takeUntil(this._unsubscribeAll)).subscribe(userData => {
      if (userData.hash != null) {
        this.hash = userData.hash;
      }
    });

    this.corpInfoForm = this._formBuilder.group({
      corpName: ['', Validators.required],
      corpNumber: ['', Validators.required],
      address: ['', Validators.required],
      city: [''],
      // city: [''],
      province: ['', Validators.required],
      postalCode: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9].{5,5}$')]],
      phoneNumber: ['', Validators.required],
      fax: [''],
      generalMail: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)]],
      managementMail: ['', [Validators.email, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)]],
      boardMail: ['', [Validators.email, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)]],
      docUploader: ['', Validators.required]
    });


    this.otherInfoForm = this._formBuilder.group({
      unitsNos: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      votingUnits: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      registerDate: ['', Validators.required],
      managementCompany: ['', Validators.required],
      managerName: [''],
      managerEmail: ['', Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)],
      managerPhone: [''],

    });

    this.aminitiesInfoForm = this._formBuilder.group({
      amenity: ['']
    });
    this.getAppData();
  }

  getAppData() {
    this._appService.getAppData().subscribe((res: any) => {
      if (res.statusCode == APIResponse.Success) {
        this.amenityList = res.amenities.map(aminity => {
          switch (aminity.id) {
            case AmenityID.PartyRoom: {
              aminity.imageSource = 'assets/images/i-party.png';
              break;
            }
            case AmenityID.Gym: {
              aminity.imageSource = 'assets/images/i-gym.png';
              break;
            }
            case AmenityID.PoolIndoor: {
              aminity.imageSource = 'assets/images/i-swimming.png';
              break;
            }
            case AmenityID.PoolOutdoor: {
              aminity.imageSource = 'assets/images/i-swimming.png';
              break;
            }
            case AmenityID.ParkingIndoor: {
              aminity.imageSource = 'assets/images/i-car.png';
              break;
            }
            case AmenityID.ParkingOutdoor: {
              aminity.imageSource = 'assets/images/i-car.png';
              break;
            }
            case AmenityID.SecurityDesk: {
              aminity.imageSource = 'assets/images/i-security.png';
              break;
            }
            case AmenityID.SecurityCamera: {
              aminity.imageSource = 'assets/images/i-camera.png';
              break;
            }
            case AmenityID.BusinessCenter: {
              aminity.imageSource = 'assets/images/i-business.png';
              break;
            }
            case AmenityID.GuestRoom: {
              aminity.imageSource = 'assets/images/i-guest.png';
              break;
            }
            case AmenityID.MediaRoom: {
              aminity.imageSource = 'assets/images/i-media.png';
              break;
            }
            case AmenityID.TennisCourt: {
              aminity.imageSource = 'assets/images/i-tennis.png';
              break;
            }
            case AmenityID.ValleyBallCourt: {
              aminity.imageSource = 'assets/images/i-volleyball.png';
              break;
            }
            case AmenityID.OutdoorBBQ: {
              aminity.imageSource = 'assets/images/i-bbq.png';
              break;
            }
            case AmenityID.RooftopDeck: {
              aminity.imageSource = 'assets/images/i-rooftop.png';
              break;
            }
            case AmenityID.GardenPatio: {
              aminity.imageSource = 'assets/images/i-garden.png';
              break;
            }
            case AmenityID.BasketCourt: {
              aminity.imageSource = 'assets/images/i-basket.png';
              break;
            }
            case AmenityID.SquashCourt: {
              aminity.imageSource = 'assets/images/i-squash.png';
              break;
            }
            case AmenityID.Jacuzzi: {
              aminity.imageSource = 'assets/images/i-faz.png';
              break;
            }
            case AmenityID.Sauna: {
              aminity.imageSource = 'assets/images/i-sauna.png';
              break;
            }
            case AmenityID.Elevator: {
              aminity.imageSource = 'assets/images/i-elevator.png';
              break;
            }
            case AmenityID.Other: {
              aminity.imageSource = 'assets/images/i-security.png';
              break;
            }
          }
          return aminity;
        });

        this.amenityList.sort((a, b) => a.amenitiesName.localeCompare(b.amenitiesName));


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
            this.cityList.push(cityDetails.cityName);
            this.cityProvinceList.push(cityProvince);
          });
        });

        this.cityProvinceList.sort((a, b) => a.city.localeCompare(b.city));

        this.filteredAmenities = this.tagCtrl.valueChanges.pipe(
          startWith(null),
          map((data: Amenity | null) => data ? this._filter(data) : this.amenityList.slice()));
      } else {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
      }
    },
      err => {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
      });
  }

  private _filter(value): Amenity[] {
    let return_value: any;
    if (this.amenityList.includes(value)) {
      return_value = this.amenityList.filter((data: Amenity) => data.amenitiesName.toLowerCase().indexOf(value) !== -1);
      this.selectedHandle(value);
    } else {
      const filterValue = value.toLowerCase();
      return_value = this.amenityList.filter((data: Amenity) => data.amenitiesName.toLowerCase().indexOf(filterValue) !== -1);
    }
    return return_value;
  }

  private selectedHandle(value: Amenity) {
    let index = this.amenityList.indexOf(value)
    this.amenityList.splice(index, 1);
    this.amenityList.sort((a, b) => a.amenitiesName.localeCompare(b.amenitiesName));
    this.aminitiesInfoForm.get('amenity').setValue(this.selectedAmenities);
    this.tagInput.nativeElement.blur();
    this.tagInput.nativeElement.focus();

  }

  remove(data: Amenity): void {
    const index = this.selectedAmenities.indexOf(data);
    if (index >= 0) {
      this.selectedAmenities.splice(index, 1);
      this.amenityList.push(data);
      this.amenityList.sort((a, b) => a.amenitiesName.localeCompare(b.amenitiesName));
      this.tagCtrl.setValue(null);
      this.aminitiesInfoForm.get('amenity').setValue(this.selectedAmenities);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.selectedAmenities.push(event.option.value);
    this.selectedAmenities.sort((a, b) => a.amenitiesName.localeCompare(b.amenitiesName));
    this.tagInput.nativeElement.value = '';
    this.tagCtrl.setValue(null);
    this.tagInput.nativeElement.blur();
    this.tagInput.nativeElement.focus();
  }


  /**
   * On destroy
   */
  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  registerClientOrganisation() {

    if (this.aminitiesInfoForm.valid && this.corpInfoForm.valid && this.otherInfoForm.valid) {
      let aminitiesDeatilsList = this.selectedAmenities.map((aminity: Amenity) => {
        return {
          'amenityId': aminity.id
        }
      });

      let regDate = 'YYYY-MM-DD';
      let createdDate = moment(this.otherInfoForm.value['registerDate']);
      if (createdDate.isValid()) {
        regDate = moment(createdDate).format('YYYY-MM-DD');
      }

      let organisationDetails = {
        "clientAmenities": aminitiesDeatilsList,
        "address": this.corpInfoForm.value['address'],
        "boardEmail": this.corpInfoForm.value['boardMail'],
        "city": this.selectedCityPro.id,
        "province": this.selectedCityPro.province,
        "corporateNumber": this.corpInfoForm.value['corpNumber'],
        "countryCode": this.corpInfoForm.value['postalCode'],
        "faxNumber": this.corpInfoForm.value['fax'],
        "generalEmail": this.corpInfoForm.value['generalMail'],
        "managementEmail": this.corpInfoForm.value['managementMail'],
        "phoneNumber": this.corpInfoForm.value['phoneNumber'],
        "postalCode": this.corpInfoForm.value['postalCode'],
        "organisationName": this.corpInfoForm.value['corpName'],

        "managementCompany": this.otherInfoForm.value['managementCompany'],
        "managerEmail": this.otherInfoForm.value['managerEmail'],
        "managerName": this.otherInfoForm.value['managerName'],
        "managerPhone": this.otherInfoForm.value['managerPhone'],
        "registrationDate": regDate,
        "units": this.otherInfoForm.value['unitsNos'],
        "votingUnits": this.otherInfoForm.value['votingUnits'],

        "userType": UserType.Client
      };

      debugger;
      this._appService.registerClientOrganisation(organisationDetails, this.hash).subscribe((res: any) => {
        if (res.statusCode == APIResponse.Success) {
          localStorage.setItem('authToken', res.authToken);
          this.checkAndUploadFiles(res.clientOrganisationId, res.clientId);
        } else if (res.statusCode == UserEnrollmentStatus.AlreadyExist) {
          this._appUtil.showAlert(AlertType.Error, AppLiterals.condoCorpNameExistAlready);
        } else if (res.statusCode == UserEnrollmentStatus.ReachedMaxiumCount) { //Corp# alreay exists
          this._appUtil.showAlert(AlertType.Error, AppLiterals.condoCorpNoExistAlready);
        } else {
          this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
        }
      },
        err => {
          this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
        });
    }
  }

  checkAndUploadFiles(clientOrgId, clientUserId) {
    if (this.profileImageFile != null) {
      this.uploadClientProfileImage(clientOrgId, clientUserId);
    } else if (this.docFileList != null && this.docFileList.length > 0) {
      this.uploadClientSupportingFiles(clientOrgId, clientUserId);
    } else {
      this._appUtil.showAlert(AlertType.Success, AppLiterals.userRegistrationSuccessful);
      this.router.navigate(['/auth/login']);
    }
  }

  uploadClientProfileImage(clientOrgId, clientUserId) {
    debugger;
    this._appService.uploadClientOrgProfileImage(this.profileImageFile, clientOrgId).subscribe((response: any) => {
      if (response.statusCode == APIResponse.Success) {
        if (this.docFileList != null && this.docFileList.length > 0) {
          this.uploadClientSupportingFiles(clientOrgId, clientUserId);
        } else {
          this._appUtil.showAlert(AlertType.Success, AppLiterals.userRegistrationSuccessful);
          this.router.navigate(['/auth/login']);
        }
      } else {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
      }
    }, err => {
      this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
      console.log(err);
    });
  }

  uploadClientSupportingFiles(clientOrgId, clientUserId) {
    let successCount = 0;
    this.docFileList.forEach(file => {
      this._appService.uploadClientOrgRegistrationSupportFiles(file, clientOrgId, clientUserId).subscribe((response: any) => {
        if (response.statusCode == APIResponse.Success) {
          successCount = successCount + 1;
          if (successCount == this.docFileList.length) {
            this._appUtil.showAlert(AlertType.Success, AppLiterals.userRegistrationSuccessful);
            this.router.navigate(['/auth/login']);
          }
        } else {
          this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
        }
      }, err => {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
        console.log(err);
      });
    });
  }
}


/**
 * Confirm password validator
 *
 * @param {AbstractControl} control
 * @returns {ValidationErrors | null}
 */
export const confirmPasswordValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {

  if (!control.parent || !control) {
    return null;
  }

  const password = control.parent.get('password');
  const passwordConfirm = control.parent.get('passwordConfirm');

  if (!password || !passwordConfirm) {
    return null;
  }

  if (passwordConfirm.value === '') {
    return null;
  }

  if (password.value === passwordConfirm.value) {
    return null;
  }

  return { passwordsNotMatching: true };
};
