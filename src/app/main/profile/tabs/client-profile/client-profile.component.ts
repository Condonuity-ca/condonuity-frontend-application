import { Component, OnDestroy, OnInit, ViewEncapsulation, Inject, Input, ViewChild, ElementRef } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { takeUntil, startWith, map } from 'rxjs/operators';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators, FormControl, FormArray } from '@angular/forms';

import { fuseAnimations } from '@condonuity/animations';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import { AppService } from '../../../services/app.service';
import { APIResponse, AlertType, AppLiterals, AmenityID, SearchBarPageIndex, UserType, UserProfileViewMode, AccountStatus, UserEnrollmentStatus, UserRole, MaxFileSize } from 'app/utils/app-constants';
import { AppUtilService } from '../../../../utils/app-util.service'
import { AuthenticationService } from '../../../../../app/_services/authentication.service';
import { CondoBrowserService } from '../../../condo-browser/condo-browser.service';
import { MenuService } from '../../../../layout/components/toolbar/menu.service';
import { Amenity } from 'app/main/registration/model/amenity.model';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete';
import { CityProvince } from 'app/main/registration/model/city-province.model';
import { Router } from '@angular/router';
import { SupportUserService } from 'app/main/support/tabs/service/support-user.service';
import { ConfirmationDialogComponent, DialogType } from 'app/main/Shared/confirmation-dialog/confirmation-dialog.component';
import { NotificationDialog } from 'app/layout/components/toolbar/toolbar.component';

export interface DialogData {
  userData;
  clientOrgId;
  amenityList;
  provinceList;
  currentUser;
}

@Component({
  selector: 'client-profile',
  templateUrl: './client-profile.component.html',
  styleUrls: ['./client-profile.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})

export class ClientProfileComponent implements OnInit, OnDestroy {

  @Input() viewOnly: boolean;

  //Support user Starts
  currentProfileMode = UserProfileViewMode.Others;
  accountApprovalStatus: any;
  accountStatus = 1;
  userProfile: any;
  //Support user Ends

  clientOrganizationId: string;
  condoOrganizationId: string;

  about: any;
  aminityForm: FormGroup;
  profileData;
  profileImgUrl: any;

  currentUser: any;
  organizationList: any;

  amenityList: Amenity[];
  cityProvinceList: CityProvince[] = [];
  cityList: String[] = [];
  screenPath: any;

  shouldShowOrgAttachments = false;

  private _unsubscribeAll: Subject<any>;

  constructor(
    private _appService: AppService,
    public dialog: MatDialog,
    private _authService: AuthenticationService,
    private _condoBrowserService: CondoBrowserService,
    private _menuService: MenuService,
    private _appUtil: AppUtilService,
    public router: Router,
    private _supportUserService: SupportUserService
  ) {
    this._unsubscribeAll = new Subject();

    this.screenPath = [];
    this.screenPath.sourceScreen = "clientProfile";
    this._menuService.currentPageSearchBarSubject.next(SearchBarPageIndex.OTHERS);
    this.router = router;

    this._authService.currentUser.pipe(takeUntil(this._unsubscribeAll)).subscribe(user => {
      this.currentUser = user;
      if (this.currentUser.userType == UserType.Client) {
        this.clientOrganizationId = this.currentUser.currentOrgId;
        this.condoOrganizationId = this.currentUser.currentOrgId;
        // this.getProfileData(this.clientOrganizationId);
      }
    });

    this._authService.organisationLists.pipe(takeUntil(this._unsubscribeAll)).subscribe(orgList => {
      if (orgList != null && orgList.length > 0) {
        this.organizationList = orgList;
      }
    });

    this._menuService.selectedOrganization.pipe(takeUntil(this._unsubscribeAll)).subscribe(org => {
      if (org != null) {
        this.condoOrganizationId = org.clientOrganisationId;
        this.checkUserAutority();
        this.getProfileData(this.condoOrganizationId);
        this._menuService.currentCorporationSubject.next(null);
      }
    });



    this._condoBrowserService.getClientData.pipe(takeUntil(this._unsubscribeAll)).subscribe(data => {
      if (data != null && data != '') {
        this.condoOrganizationId = data.id;
        this.viewOnly = true;
        this.screenPath = data;
      }
    });

    this._supportUserService.clientProfileInfo.pipe(takeUntil(this._unsubscribeAll)).subscribe(clientProfile => {
      if (clientProfile != null) {
        this.condoOrganizationId = clientProfile.id;
        this.shouldShowOrgAttachments = true;
        this.userProfile = clientProfile;
        this.currentProfileMode = clientProfile.profileMode;
        this.accountApprovalStatus = clientProfile.accountApprovalStatus;
        if (clientProfile.accountCurrentStatus == 'Active') {
          this.accountStatus = 0;
        } else {
          this.accountStatus = 1;
        }
      }
    });

    if (this.currentUser.userType == UserType.Client) {
      this.checkUserAutority();
    } else if (this.currentUser.userType == UserType.Vendor) {
      this.viewOnly = true;
      this.shouldShowOrgAttachments = false;
    }
    this.getProfileData(this.condoOrganizationId);
  }



  submitAminity() {
    console.log(this.aminityForm.value);
  }

  openCorpDialog() {
    const dialogRef = this.dialog.open(CorporateDetailsDialog, { data: { formData: this.profileData.corporateInfo, provinceList: this.cityProvinceList, currentUser: this.currentUser } });
    dialogRef.afterClosed().subscribe(result => {
      if (result != undefined && result != '') {
        this.updateCorporateData(result);
      }
    });
  }

  updateCorporateData(data) {
    this.profileData.corporateInfo = data;
  }


  openAminitiesDialog() {
    const AminitiesInfoDialogRef = this.dialog.open(AminitiesInfoDialog, { data: { userData: this.profileData, clientOrgId: this.clientOrganizationId, amenityList: this.amenityList }, width: '700px', height: 'auto' });
    AminitiesInfoDialogRef.afterClosed().subscribe(result => {
      if (result != undefined && result != '') {
        this.getProfileData(this.clientOrganizationId)
      }
    });
  }

  updateOtherData(result) {
    this.profileData.otherInfo = result;
  }


  openCorporationInfoDialog() {
    const CorporationInfoDialogRef = this.dialog.open(CorporationInfoDialog, { width: '800px', height: 'auto', data: { userData: this.profileData, provinceList: this.cityProvinceList, currentUser: this.currentUser } });
    CorporationInfoDialogRef.afterClosed().subscribe(result => {
      if (result != undefined && result != '') {
        if (this.currentUser.userType == UserType.SupportUser) {
          this.getProfileData(this.userProfile.id);
        } else {
          this.getProfileData(this.clientOrganizationId);
        }
      }
    });
  }

  openOtherDialog() {
    const otherDialogRef = this.dialog.open(CorporateOtherDetailsDialog, { data: { userData: this.profileData, provinceList: this.cityProvinceList, currentUser: this.currentUser } });
    otherDialogRef.afterClosed().subscribe(result => {
      if (result != undefined && result != '') {
        if (this.currentUser.userType == UserType.SupportUser) {
          this.getProfileData(this.userProfile.id);
        } else {
          this.getProfileData(this.clientOrganizationId);
        }
      }
    });
  }


  ngOnInit(): void {
    this.getAppData();
  }

  checkUserAutority() {
    this.viewOnly = true;
    var showAttachments = false;
    this.organizationList.forEach(org => {
      if (this.condoOrganizationId == org.clientOrganisationId) {
        showAttachments = true
        if (org.userRole == UserRole.Admin && this.screenPath.sourceScreen != "condoBrowser") {
          this.viewOnly = false;
        }
      }
    });
    this.shouldShowOrgAttachments = showAttachments;
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

      } else {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
      }
    },
      err => {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
      });
  }

  getProfileData(organizationId) {
    this._appService.getClientProfileDetails(organizationId).subscribe((response) => {
      if (response.statusCode == APIResponse.Success) {
        this.profileImgUrl = response.organisation.organisationLogo;
        this.profileData = response;
        this.getAminitiesDetails();
        this._condoBrowserService.setClientData("");
      } else {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.unableToFetchClientProfile);
      }
    }, err => {
      this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
    });
  }


  fileClicked(fileDetails) {
    this._appUtil.downloadFile(fileDetails.containerName, fileDetails.blobName, fileDetails.fileName, fileDetails.fileType);
  }

  getAminitiesDetails() {
    this.profileData.clientAmenities = this.profileData.clientAmenities.map(aminity => {
      switch (aminity.amenityId) {
        case AmenityID.PartyRoom: {
          aminity.amenityLogo = 'assets/images/i-party.png';
          break;
        }
        case AmenityID.Gym: {
          aminity.amenityLogo = 'assets/images/i-gym.png';
          break;
        }
        case AmenityID.PoolOutdoor: {
          aminity.amenityLogo = 'assets/images/i-swimming.png';
          break;
        }
        case AmenityID.PoolIndoor: {
          aminity.amenityLogo = 'assets/images/i-swimming.png';
          break;
        }
        case AmenityID.ParkingOutdoor: {
          aminity.amenityLogo = 'assets/images/i-car.png';
          break;
        }
        case AmenityID.ParkingIndoor: {
          aminity.amenityLogo = 'assets/images/i-car.png';
          break;
        }
        case AmenityID.SecurityDesk: {
          aminity.amenityLogo = 'assets/images/i-security.png';
          break;
        }
        case AmenityID.SecurityCamera: {
          aminity.amenityLogo = 'assets/images/i-camera.png';
          break;
        }
        case AmenityID.BusinessCenter: {
          aminity.amenityLogo = 'assets/images/i-business.png';
          break;
        }
        case AmenityID.GuestRoom: {
          aminity.amenityLogo = 'assets/images/i-guest.png';
          break;
        }
        case AmenityID.MediaRoom: {
          aminity.amenityLogo = 'assets/images/i-media.png';
          break;
        }
        case AmenityID.TennisCourt: {
          aminity.amenityLogo = 'assets/images/i-tennis.png';
          break;
        }
        case AmenityID.ValleyBallCourt: {
          aminity.amenityLogo = 'assets/images/i-volleyball.png';
          break;
        }
        case AmenityID.OutdoorBBQ: {
          aminity.amenityLogo = 'assets/images/i-bbq.png';
          break;
        }
        case AmenityID.RooftopDeck: {
          aminity.amenityLogo = 'assets/images/i-rooftop.png';
          break;
        }
        case AmenityID.GardenPatio: {
          aminity.amenityLogo = 'assets/images/i-garden.png';
          break;
        }
        case AmenityID.BasketCourt: {
          aminity.amenityLogo = 'assets/images/i-basket.png';
          break;
        }
        case AmenityID.SquashCourt: {
          aminity.amenityLogo = 'assets/images/i-squash.png';
          break;
        }
        case AmenityID.Jacuzzi: {
          aminity.amenityLogo = 'assets/images/i-faz.png';
          break;
        }
        case AmenityID.Sauna: {
          aminity.amenityLogo = 'assets/images/i-sauna.png';
          break;
        }
        case AmenityID.Elevator: {
          aminity.amenityLogo = 'assets/images/i-elevator.png';
          break;
        }
        case AmenityID.Other: {
          aminity.amenityLogo = 'assets/images/i-security.png';
          break;
        }
      }

      return aminity;
    });
    this.profileData.clientAmenities.sort((a, b) => a.amenityName.localeCompare(b.amenityName));
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }


  /**************** Support User Functionalities Start ******************/
  confirmationMsg = '';

  updateUserAccountStatus(status) {
    if (status == '1') {
      this.confirmationMsg = AppLiterals.AccountActivateConfirmation;
    } else if (status == '2') {
      this.confirmationMsg = AppLiterals.AccountDeactivateConfirmation;
    } else if (status == '3') {
      this.confirmationMsg = AppLiterals.AccountApprovalConfirmation;
    } else if (status == '4') {
      this.confirmationMsg = AppLiterals.AccountRejectionConfirmation;
    }

    const userNewRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '550px', data: {
        type: DialogType.TwoButtonDialog,
        title: "PLEASE CONFIRM",
        message: this.confirmationMsg,
        yesButtonTitle: "YES",
        noButtonTitle: "NO"
      }
    });
    userNewRef.afterClosed().subscribe(result => {
      if (result == 'true') {
        if (status == '3') {
          this.confirmClientRegistrationStatus('1');
        } else if (status == '4') {
          this.confirmClientRegistrationStatus('2');
        } else {
          this.confirmAccountStatus(status);
        }
      }
    });
  }


  confirmAccountStatus(status) {
    let approveOrgDetails = {
      "userType": "1",
      "organisationId": this.userProfile.id,
      "activeStatus": status,
      "supportUserId": this.currentUser.id
    }

    this._appService.updateOrgStatus(approveOrgDetails).subscribe((response) => {
      if (response.statusCode == APIResponse.Success) {
        if (status == '1') {
          this.accountStatus = AccountStatus.Active;
          this._appUtil.showAlert(AlertType.Success, AppLiterals.AccountActivationSuccessful);
        } else if (status == '2') {
          this.accountStatus = AccountStatus.InActive;
          this._appUtil.showAlert(AlertType.Success, AppLiterals.AccountDeactivationSuccessful);
        }
      } else {
        if (status == '1') {
          this._appUtil.showAlert(AlertType.Error, AppLiterals.AccountActivationFailure);
        } else if (status == '2') {
          this._appUtil.showAlert(AlertType.Error, AppLiterals.AccountDeactivationFailure);
        }
      }
    }, err => {
      this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
    });
  }


  confirmClientRegistrationStatus(accountStatus) {
    let approveOrgDetails = {
      "userType": "1",
      "organisationId": this.userProfile.id,
      "approvalStatus": accountStatus,
      "supportUserId": this.currentUser.id
    }

    this._appService.approveNewOrgRegistration(approveOrgDetails).subscribe((response) => {
      if (response.statusCode == APIResponse.Success) {
        if (accountStatus == '1') {
          this.accountStatus = AccountStatus.Active;
          this._appUtil.showAlert(AlertType.Success, AppLiterals.AccountApprovalSuccessful);
        } else {
          this.accountStatus = 2;
          this._appUtil.showAlert(AlertType.Success, AppLiterals.AccountRejectionSuccessful);
        }
      } else {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.AccountApprovalFailure);
      }
    }, err => {
      this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
    });
  }
  /**************** Support User Functionalities End ******************/
}



@Component({
  selector: 'corporate-details-dialog',
  templateUrl: 'corporate-details-dialog.html',
  animations: fuseAnimations
})

export class CorporateDetailsDialog {

  cityProvinceList: CityProvince[] = [];

  currentUser: any;
  imgURL: any;
  profileImageFile: File;
  corpEditform: FormGroup;
  mandatory = "Mandatory field is required";
  fileData = [];

  docFileList: any[] = [];


  constructor(
    private _formBuilder: FormBuilder,
    private _appUtil: AppUtilService,
    public dialogRef: MatDialogRef<CorporateDetailsDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {
    let dialogData = data.userData;
    this.currentUser = data.currentUser;

    this.corpEditform = this._formBuilder.group({
      corpName: [dialogData.corpName, Validators.required],
      corpNumber: [dialogData.corpNumber],
      address: [dialogData.address, Validators.required],
      city: [dialogData.city, Validators.required],
      province: [dialogData.province, Validators.required],
      postalCode: [dialogData.postalCode, [Validators.required, Validators.pattern('[a-zA-Z0-9].{5,5}$')]],
      phoneNumber: [dialogData.phoneNumber, [Validators.required, Validators.pattern('^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$')]],
      fax: [dialogData.fax, [Validators.required, Validators.pattern('^[0-9]*$')]],
      generalMail: [dialogData.generalMail, [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)]],
      managementMail: [dialogData.managementMail, [Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)]],
      boardMail: [dialogData.boardMail, [Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)]]
    });
  }


  citySelected(cityInfo) {
  }
  update() {

  }

  removeFile(index) {
    this.fileData.splice(index, 1);
  }

  fileEvent(files) {
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

  appendDocumentFiles(event) {
    let files = event.target.files;

    if (AppUtilService.checkMaxFileSize(files, MaxFileSize.FIVEMB)) {
      if (this.docFileList == null) {
        this.docFileList = [];
      }
      for (let i = 0; i < files.length; i++) {
        let file = files[i];
        file.formatedSize = AppUtilService.formatSizeUnits(file.size);
        file.isExistingFile = false;
        file.attachmentId = "0";
        this.docFileList.push(file)
      }
    }
    else {
      this._appUtil.showAlert(AlertType.Error, AppLiterals.FilesizeError5MB);
    }
  }



  editCorporation() {
    console.log(this.corpEditform.value);
  }
}





@Component({
  selector: 'corporate-details-dialog',
  templateUrl: 'corporate-details-dialog.html',
  animations: fuseAnimations
})

export class CorporationInfoDialog {
  cityProvinceList: CityProvince[] = [];
  corpEditform: FormGroup;
  corpDetails;

  isProfileImageChanged = false;
  profileImageFile: File;
  imgURL: any;

  selectedCityPro: CityProvince;
  currentUser;

  docFileList: any[] = [];

  public updatedProfileData = {};

  constructor(
    private _appService: AppService,
    private _appUtil: AppUtilService,
    private _formBuilder: FormBuilder,
    private _authService: AuthenticationService,
    public dialogRef: MatDialogRef<CorporationInfoDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    if (data) {
      this.corpDetails = this.data.userData;
      this.currentUser = this.data.currentUser;
      this.cityProvinceList = this.data.provinceList;
      this.imgURL = this.corpDetails.organisation.organisationLogo;
      this.selectedCityPro = this.cityProvinceList.find(province => province.city === this.corpDetails.organisation.city);

      for (let document of this.corpDetails.registrationFiles) {
        let file = {
          "name": document.fileName,
          "formatedSize": document.fileSize,
          "isExistingFile": true,
          "attachmentId": document.id
        }
        this.docFileList.push(file);
      }

      var isSupportUser = false;

      if (this.currentUser.userType == UserType.SupportUser) {
        isSupportUser = true;
      }

      this.corpEditform = this._formBuilder.group({
        corpName: [{ value: this.corpDetails.organisation.organisationName, disabled: !isSupportUser }, Validators.required],
        corpNumber: [{ value: this.corpDetails.organisation.corporateNumber, disabled: !isSupportUser }, Validators.required],
        address: [{ value: this.corpDetails.organisation.address, disabled: isSupportUser }, Validators.required],
        city: [{ value: this.selectedCityPro, disabled: isSupportUser }, Validators.required],
        province: [{ value: this.corpDetails.organisation.province, disabled: isSupportUser }, Validators.required],
        postalCode: [{ value: this.corpDetails.organisation.postalCode, disabled: isSupportUser }, [Validators.required, Validators.pattern('[a-zA-Z0-9].{5,5}$')]],
        phoneNumber: [{ value: this.corpDetails.organisation.phoneNumber, disabled: isSupportUser }, Validators.required],
        fax: [{ value: this.corpDetails.organisation.faxNumber, disabled: isSupportUser }],
        generalEmail: [{ value: this.corpDetails.organisation.generalEmail, disabled: isSupportUser }, [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)]],
        managementEmail: [{ value: this.corpDetails.organisation.managementEmail, disabled: isSupportUser }, [Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)]],
        boardEmail: [{ value: this.corpDetails.organisation.boardEmail, disabled: isSupportUser }, [Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)]]
      });
    }
  }

  citySelected(cityInfo) {
    this.selectedCityPro = cityInfo;
    this.corpEditform.get('province').setValue(cityInfo.province);
  }

  update() {
    debugger;
    if (this.currentUser.userType == UserType.SupportUser) {
      this.supportUserUpdateClientOrg();
    } else {
      this.updatedProfileData['organisationName'] = this.corpDetails.organisation.organisationName;
      this.updatedProfileData['corporateNumber'] = this.corpDetails.organisation.corporateNumber;
      this.updatedProfileData['address'] = this.corpEditform.value['address'];
      this.updatedProfileData['province'] = this.selectedCityPro.province;
      this.updatedProfileData['postalCode'] = this.corpEditform.value['postalCode'];
      this.updatedProfileData['phoneNumber'] = this.corpEditform.value['phoneNumber'];
      this.updatedProfileData['city'] = this.selectedCityPro.id;
      this.updatedProfileData['faxNumber'] = this.corpEditform.value['fax'];
      this.updatedProfileData['generalEmail'] = this.corpEditform.value['generalEmail'];
      this.updatedProfileData['managementEmail'] = this.corpEditform.value['managementEmail'];
      this.updatedProfileData['boardEmail'] = this.corpEditform.value['boardEmail'];

      this.updatedProfileData['units'] = this.corpDetails.organisation.units;
      this.updatedProfileData['votingUnits'] = this.corpDetails.organisation.votingUnits;
      this.updatedProfileData['registrationDate'] = this.corpDetails.organisation.registrationDate;
      this.updatedProfileData['managementCompany'] = this.corpDetails.organisation.managementCompany;
      this.updatedProfileData['managerName'] = this.corpDetails.organisation.managerName;
      this.updatedProfileData['managerEmail'] = this.corpDetails.organisation.managerEmail;
      this.updatedProfileData['managerPhone'] = this.corpDetails.organisation.managerPhone;

      this.updatedProfileData['clientOrganisationId'] = this.corpDetails.organisation.clientOrganisationId;
      this.updatedProfileData['userType'] = this.corpDetails.organisation.userType;

      let profileData = {
        'clientOrganisation': this.updatedProfileData,
        'modifiedByUserId': this.currentUser.clientId
      }


      this._appService.updateClientOrganisation(profileData).subscribe((response) => {
        if (response.statusCode == APIResponse.Success) {
          if (this.isProfileImageChanged) {
            this.uploadClientProfileImage(this.corpDetails.organisation.clientOrganisationId);
          } else {
            this.updatedProfileData['city'] = this.selectedCityPro.city;
            this._appUtil.showAlert(AlertType.Success, AppLiterals.profileDetailsUpdatedSuccessfully);
            this.dialogRef.close(this.updatedProfileData);
            this.refreshOrgList();
          }
        } else {
          this._appUtil.showAlert(AlertType.Error, AppLiterals.unableToUpdateClientProfile);
        }
      }, err => {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
      });
    }
  }

  supportUserUpdateClientOrg() {
    let formValue = this.corpEditform.value;
    let updatedClientOrgDetails = {
      "clientOrganisationId": this.corpDetails.organisation.clientOrganisationId,
      "corporationName": formValue.corpName,
      "corporationNumber": formValue.corpNumber,
      "supportUserId": this.currentUser.id,
      "modifiedByUserId": this.currentUser.id
    }
    this._appService.updateOrgDetails(updatedClientOrgDetails).subscribe((response) => {
      if (response.statusCode == APIResponse.Success) {
        this.updateProfileDocuments();
      } else if (response.statusCode == UserEnrollmentStatus.AlreadyExist) {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.condoCorpNameExistAlready);
      } else {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.unableToUpdateClientProfile);
      }
    }, err => {
      this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
    });
  }

  removeDocAttachment(index) {
    this.docFileList.splice(index, 1);
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
        file.isExistingFile = false;
        file.attachmentId = "0";
        this.docFileList.push(file)
      }
    }
    else {
      this._appUtil.showAlert(AlertType.Error, AppLiterals.FilesizeError5MB);
    }
  }


  updateProfileDocuments() {
    var filesToDelete = [];
    var filesToUpload = this.docFileList.filter(document => document.isExistingFile == false);
    this.corpDetails.registrationFiles.forEach(file => {
      let filteredFile = this.docFileList.find(document => document.attachmentId == file.id);
      if (filteredFile == null) {
        filesToDelete.push(file);
      }
    });

    if (filesToDelete != null && filesToDelete.length > 0) {
      this.deleteProfileAttachments(filesToDelete, filesToUpload);
    } else if (filesToUpload != null && filesToUpload.length > 0) {
      this.postProfileAttachments(filesToUpload);
    } else {
      this._appUtil.showAlert(AlertType.Success, AppLiterals.profileDetailsUpdatedSuccessfully);
      this.dialogRef.close(true);
    }
  }

  deleteProfileAttachments(filesToDelete, filesToUpload) {

    var fileIdArray = filesToDelete.map(function (file) {
      return file.id;
    });
    this._appService.deleteClientRegFiles(fileIdArray).subscribe((response: any) => {
      if (response.statusCode == APIResponse.Success) {
        if (filesToUpload != null && filesToUpload.length > 0) {
          this.postProfileAttachments(filesToUpload);
        } else {
          this._appUtil.showAlert(AlertType.Success, AppLiterals.profileDetailsUpdatedSuccessfully);
          this.dialogRef.close(true);
        }
      } else {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
      }
    }, err => {
      this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
    });
  }


  postProfileAttachments(filesToUpload) {

    let successfileUpload = 0;
    filesToUpload.forEach(attachment => {
      this._appService.supportUseruploadUserRegFiles(attachment, UserType.Client, this.corpDetails.organisation.clientOrganisationId, this.currentUser.id).subscribe((response: any) => {
        if (response.statusCode == APIResponse.Success) {
          successfileUpload = successfileUpload + 1;
          if (successfileUpload == filesToUpload.length) {
            this._appUtil.showAlert(AlertType.Success, AppLiterals.profileDetailsUpdatedSuccessfully);
            this.dialogRef.close(true);
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


  uploadClientProfileImage(clientOrgId) {
    this._appService.uploadClientOrgProfileImage(this.profileImageFile, clientOrgId).subscribe((response: any) => {
      if (response.statusCode == APIResponse.Success) {
        this._appUtil.showAlert(AlertType.Success, AppLiterals.profileDetailsUpdatedSuccessfully);
        this.dialogRef.close(this.updatedProfileData)
        this.refreshOrgList();
      } else {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
      }
    }, err => {
      this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
      console.log(err);
    });
  }

  fileEvent(files) {
    if (AppUtilService.checkMaxFileSize(files, MaxFileSize.TWOMB)) {
      var mimeType = files[0].type;
      if (mimeType.match(/image\/*/) == null) {
        return;
      }

      var reader = new FileReader();
      this.profileImageFile = files[0];
      reader.readAsDataURL(files[0]);
      reader.onload = (_event) => {
        this.imgURL = reader.result;
        this.isProfileImageChanged = true;
      }
    }
    else {
      this._appUtil.showAlert(AlertType.Error, AppLiterals.FilesizeError2MB);
    }
  }

  refreshOrgList() {
    this._appService.getClientOrganisationList(this.currentUser.clientId).subscribe(orgData => {
      if (orgData != null && orgData.statusCode == APIResponse.Success) {
        this._authService.corporationSubject.next(orgData.corporateAccounts);
        this.dialogRef.close(this.updatedProfileData)
      }
    });
  }
}



@Component({
  selector: 'corporate-other-details-dialog',
  templateUrl: 'corporate-other-details-dialog.html',
})

export class CorporateOtherDetailsDialog {
  corpEditform: FormGroup;
  mandatory = "Mandatory field is required";
  public updatedProfileData = {};
  corpDetails;
  currentUser;
  cityProvinceList: CityProvince[] = [];

  constructor(
    private _formBuilder: FormBuilder,
    private _appService: AppService,
    private _appUtil: AppUtilService,
    public dialogRef: MatDialogRef<CorporateDetailsDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private datePipe: DatePipe,
  ) {
    this.corpDetails = data.userData;
    this.currentUser = data.currentUser;
    this.cityProvinceList = this.data.provinceList;
    let registerDate = this.datePipe.transform(this.corpDetails.organisation.registrationDate, 'yyyy-MM-ddThh:mm:ssZ');
    this.corpEditform = this._formBuilder.group({
      unitsNos: [this.corpDetails.organisation.units, [Validators.required, Validators.pattern('^[0-9]*$')]],
      votingUnits: [this.corpDetails.organisation.votingUnits, [Validators.required, Validators.pattern('^[0-9]*$')]],
      registerDate: [registerDate, Validators.required],
      managementCompany: [this.corpDetails.organisation.managementCompany, Validators.required],
      managerName: [this.corpDetails.organisation.managerName],
      managerEmail: [this.corpDetails.organisation.managerEmail, [Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)]],
      managerPhone: [this.corpDetails.organisation.managerPhone, [Validators.pattern('^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$')]],
    });
  }


  public update() {

    this.updatedProfileData['units'] = this.corpEditform.value['unitsNos'];
    this.updatedProfileData['votingUnits'] = this.corpEditform.value['votingUnits'];
    this.updatedProfileData['registrationDate'] = this.datePipe.transform(this.corpEditform.value['registerDate'], 'yyyy/MM/dd');
    this.updatedProfileData['managementCompany'] = this.corpEditform.value['managementCompany'];
    this.updatedProfileData['managerName'] = this.corpEditform.value['managerName'];
    this.updatedProfileData['managerEmail'] = this.corpEditform.value['managerEmail'];
    this.updatedProfileData['managerPhone'] = this.corpEditform.value['managerPhone'];

    this.updatedProfileData['organisationName'] = this.corpDetails.organisation.organisationName;
    this.updatedProfileData['corporateNumber'] = this.corpDetails.organisation.corporateNumber;
    this.updatedProfileData['address'] = this.corpDetails.organisation.address;
    this.updatedProfileData['province'] = this.corpDetails.organisation.province;
    this.updatedProfileData['postalCode'] = this.corpDetails.organisation.postalCode;
    this.updatedProfileData['phoneNumber'] = this.corpDetails.organisation.phoneNumber;
    this.updatedProfileData['city'] = this.getCityIdForCityName(this.corpDetails.organisation.city);
    this.updatedProfileData['faxNumber'] = this.corpDetails.organisation.faxNumber;
    this.updatedProfileData['generalEmail'] = this.corpDetails.organisation.generalEmail;
    this.updatedProfileData['managementEmail'] = this.corpDetails.organisation.managementEmail;
    this.updatedProfileData['boardEmail'] = this.corpDetails.organisation.boardEmail;

    this.updatedProfileData['clientOrganisationId'] = this.corpDetails.organisation.clientOrganisationId;
    this.updatedProfileData['userType'] = this.corpDetails.organisation.userType;

    let profileData = {
      'clientOrganisation': this.updatedProfileData,
      'modifiedByUserId': this.currentUser.clientId
    }

    this._appService.updateClientOrganisation(profileData).subscribe((response) => {
      if (response.statusCode == APIResponse.Success) {
        this._appUtil.showAlert(AlertType.Success, AppLiterals.profileDetailsUpdatedSuccessfully);
        this.dialogRef.close(true);
      } else {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.unableToUpdateClientProfile);
      }
    }, err => {
      this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
    });
  }

  editOtherCorp() {
    console.log(this.corpEditform.value);
  }

  getCityIdForCityName(cityName) {
    let selectedCity = this.cityProvinceList.find(cityProvince => cityProvince.city.toLowerCase() == cityName.toLowerCase());
    return selectedCity.id;
  }

}



@Component({
  selector: 'aminities-info-dialog',
  templateUrl: 'aminities-info-dialog.html',
  animations: fuseAnimations
})

export class AminitiesInfoDialog {

  @ViewChild("tagInput", { static: false }) tagField: ElementRef;

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

  spot = { ug: true, gl: true };
  aminityForm: FormGroup;
  profileData;
  amenityList: Amenity[];
  clientOrgId: any;
  constructor(
    private _appUtil: AppUtilService,
    private _appService: AppService,
    private _formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<CorporationInfoDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.amenityList = Object.assign([], data.amenityList);
    this.profileData = data.userData;
    this.clientOrgId = data.clientOrgId;

    this.amenityList.sort((a, b) => a.amenitiesName.localeCompare(b.amenitiesName));

    this.aminityForm = this._formBuilder.group({
      amenity: [''],
    });

    this.processAmenityList();
  }


  processAmenityList() {
    this.profileData.clientAmenities.forEach(amenity => {
      let result = this.amenityList.find(myAmenity => myAmenity.id === amenity.amenityId)
      this.selectedAmenities.push(result);
      this.selectedAmenities.sort((a, b) => a.amenitiesName.localeCompare(b.amenitiesName));
    });

    this.selectedAmenities.forEach(amenity => {
      let index = this.amenityList.indexOf(amenity)
      this.amenityList.splice(index, 1);
    });

    this.filteredAmenities = this.tagCtrl.valueChanges.pipe(
      startWith(null),
      map((data: Amenity | null) => data ? this._filter(data) : this.amenityList.slice()));
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
    this.aminityForm.get('amenity').setValue(this.selectedAmenities);
    this.tagField.nativeElement.blur();
    this.tagField.nativeElement.focus();

  }


  remove(data: Amenity): void {
    const index = this.selectedAmenities.indexOf(data);
    if (index >= 0) {
      this.selectedAmenities.splice(index, 1);
      this.selectedAmenities.sort((a, b) => a.amenitiesName.localeCompare(b.amenitiesName));
      this.amenityList.push(data);
      this.amenityList.sort((a, b) => a.amenitiesName.localeCompare(b.amenitiesName));
      this.tagCtrl.setValue(null);
      this.aminityForm.get('amenity').setValue(this.selectedAmenities);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.selectedAmenities.push(event.option.value);
    this.selectedAmenities.sort((a, b) => a.amenitiesName.localeCompare(b.amenitiesName));
    this.tagInput.nativeElement.value = '';
    this.tagCtrl.setValue(null);
    this.tagField.nativeElement.blur();
    this.tagField.nativeElement.focus();

  }

  submitAminityList() {

    let amenitiesDeatilsList = this.selectedAmenities.map((aminity: Amenity) => {
      return {
        'amenityId': aminity.id
      }
    });

    let finalAmenityList = [];

    this.selectedAmenities.forEach(amenity => {
      let finalAme = {
        "id": amenity.id,
        "amenityName": amenity.amenitiesName,
        "amenityLogo": amenity.imageSource
      }
      finalAmenityList.push(finalAme);
    })

    this._appService.updateClientAmenityList(amenitiesDeatilsList, this.clientOrgId).subscribe((res: any) => {
      if (res.statusCode == APIResponse.Success) {
        this._appUtil.showAlert(AlertType.Success, AppLiterals.amenityDetailsUpdateSuccessful);
        this.dialogRef.close(finalAmenityList)
      } else {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.unableToUpdateAmenityDetails);
      }
    },
      err => {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
      });
  }
}