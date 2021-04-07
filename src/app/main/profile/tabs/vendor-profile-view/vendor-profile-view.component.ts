import {
  Component,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
  ElementRef,
  ViewChild,
  Inject,
  Input
} from '@angular/core';
import {
  Subject,
  Observable
} from 'rxjs';
import {
  takeUntil,
  pairwise,
  filter
} from 'rxjs/operators';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
  FormControl,
  FormArray
} from '@angular/forms';
import {
  fuseAnimations
} from '@condonuity/animations';
import {
  MatAutocompleteSelectedEvent,
  MatAutocomplete
} from '@angular/material/autocomplete';
import {
  map,
  startWith
} from 'rxjs/operators';
import {
  MatChipInputEvent
} from '@angular/material/chips';
import {
  COMMA,
  ENTER
} from '@angular/cdk/keycodes';
import {
  Review
} from 'app/main/profile/tabs/models/review.model';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA
} from '@angular/material/dialog';
import {
  Tag
} from 'app/main/profile/tabs/models/tag.model';
import {
  City
} from 'app/main/profile/tabs/models/city.model';
import {
  Portfolio
} from 'app/main/models/portfolio.model';
import {
  AppService
} from '../../../services/app.service';
import {
  AuthenticationService
} from '../../../../_services/authentication.service';
import {
  APIResponse,
  AlertType,
  AppLiterals,
  SearchBarPageIndex,
  AppDateFormat,
  UserType,
  UserProfileViewMode,
  AccountStatus,
  UserEnrollmentStatus,
  UserRole,
  MaxFileSize
} from '../../../../utils/app-constants';
import {
  AppUtilService
} from '../../../../utils/app-util.service';
import {
  VendorBrowserService
} from '../../../vendor-browser/vendor-browser.service';
import * as moment from 'moment';
import {
  Router,
  RoutesRecognized,
  NavigationStart,
  NavigationEnd
} from '@angular/router';
import {
  CityProvince
} from 'app/main/registration/model/city-province.model';
import {
  MenuService
} from 'app/layout/components/toolbar/menu.service';
import {
  MatExpansionPanel
} from '@angular/material';
import 'rxjs/add/operator/pairwise';
import {
  SupportUserService
} from 'app/main/support/tabs/service/support-user.service';
import {
  ConfirmationDialogComponent,
  DialogType
} from 'app/main/Shared/confirmation-dialog/confirmation-dialog.component';


export interface DialogData {
  formData: Portfolio;
  userData;
  currentUser;
  cityList;
  allTags;
  cityProvinceList;
  selectedReview;
  vendorOrganizationId;
}

export enum PreviousScreen {
  BrowseVendor = 0,
  MyReviews = 1,
  UserRegistration = 2,
  ClientManagment = 3
}


@Component({
  selector: 'vendor-profile-view',
  templateUrl: './vendor-profile-view.component.html',
  styleUrls: ['./vendor-profile-view.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})

export class VendorProfileViewComponent implements OnInit, OnDestroy {

  //Support user Starts
  currentProfileMode = UserProfileViewMode.Others;
  accountStatus = 1;
  userProfile: any;
  //Support user Ends

  portfolioDetails: Portfolio[];
  portfolios = [];
  portfolioSortType: string;
  reviewData: Review[];
  reviewRatingData = [];
  ratingSortType: string;
  vendorDetails;
  vendorRating;
  vendorOrganizationId: string;
  vendorUnclaimedProfileId: string;
  ratingOpen = false;

  selectedReview: any;
  currentUser: any;

  lastAppliedFilter = '';
  shouldSortReverse = false;

  profileImageUrl: string;

  isDataAvailableToLoad = false;
  shouldEnableEdit = false;

  allTags: Tag[] = [];
  cityNames: City[] = [];

  cityProvinceList: CityProvince[] = [];
  selectedCity: CityProvince;
  slectedProvince: string;
  cityList: String[] = [];

  lastAppliedPortfolioFilter: any;
  shouldSortPortfolioReverse = false;
  viewMoreClicked = false;

  portfolioAttachments = [];

  @ViewChild('tagInput', {
    static: false
  }) tagInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto', {
    static: false
  }) matAutocomplete: MatAutocomplete;


  @Input() isView: boolean;
  @ViewChild("panel1", {
    static: false
  }) ratingView: MatExpansionPanel;

  screenPath: any;
  previousScreen: PreviousScreen;
  shouldShowAttachments = false;

  isFavoriteVendor: any;
  accountApprovalStatus: any;


  // Private
  private _unsubscribeAll: Subject<any>;

  constructor(
    private _supportUserService: SupportUserService,
    public dialog: MatDialog,
    private _appUtil: AppUtilService,
    private _appService: AppService,
    private _authService: AuthenticationService,
    private _vendorBrowserService: VendorBrowserService,
    public router: Router,
    private _menuService: MenuService
  ) {
    this._menuService.currentPageSearchBarSubject.next(SearchBarPageIndex.OTHERS);
    this.router = router
    this._unsubscribeAll = new Subject();

    this.getAppData();

    if (this.router.url == '/browseVendors/view') {
      this.previousScreen = PreviousScreen.BrowseVendor;
    } else if (this.router.url == '/myreview/view') {
      this.previousScreen = PreviousScreen.MyReviews;
    }

    this._supportUserService.clientProfileInfo.pipe(takeUntil(this._unsubscribeAll)).subscribe(clientProfile => {
      if (clientProfile != null) {
        this.userProfile = clientProfile;
        this.currentProfileMode = clientProfile.profileMode;
        this.shouldShowAttachments = true;
        this.accountApprovalStatus = clientProfile.accountApprovalStatus;

        if (clientProfile.sourceScreen == 'vendorRegistration') {
          this.previousScreen = PreviousScreen.UserRegistration
        } else if (clientProfile.sourceScreen == 'vendorManagement') {
          this.previousScreen = PreviousScreen.ClientManagment
        }

        if (clientProfile.accountCurrentStatus == 'Active') {
          this.accountStatus = 0;
        } else {
          this.accountStatus = 1;
        }
      }
    });


    this._authService.currentUser.pipe(takeUntil(this._unsubscribeAll)).subscribe(user => {
      this.currentUser = user;
      this.vendorOrganizationId = user.vendorOrganisationId;
      if (this.currentUser.userType == UserType.SupportUser || (this.currentUser.userType == UserType.Vendor && this.currentUser.userRole == UserRole.Admin)) {
        this.shouldEnableEdit = true;
        this.isView = false;
      } else {
        this.shouldEnableEdit = false;
        this.isView = true;
      }
    });

    this._vendorBrowserService.getVendorData.pipe(takeUntil(this._unsubscribeAll)).subscribe(data => {
      if (data != null && data != '') {
        this.vendorOrganizationId = data.id;
        this.vendorUnclaimedProfileId = data.vendorUnclaimedProfileId;

        if (this.vendorOrganizationId != '0') {
          this.isFavoriteVendor = data.isFavortieVendor;
          if (this.currentUser.userType != UserType.SupportUser) {
            this.shouldEnableEdit = false;
          }
        } else {
          this.getUnClaimedVendorOrganizationDetails();
        }
      }
    });

    this._vendorBrowserService.getSelectedReview.pipe(takeUntil(this._unsubscribeAll)).subscribe(data => {
      if (data != null && data != '') {
        this.selectedReview = data;
        this.viewRating();
      }
    });

    if (this.vendorOrganizationId != '0') {
      debugger;
      this.getVendorOrganizationDetails();
    }
  }



  morePortfolio() {
    this.viewMoreClicked = true;
    this.portfolioDetails = this.vendorDetails.vendorPortfolios;
  }

  hidePortfolio() {
    this.viewMoreClicked = false;
    this.portfolioDetails = this.vendorDetails.vendorPortfolios.slice(0, 2);
  }

  sortPortfolio(type) {

    if (this.lastAppliedPortfolioFilter != type) {
      this.shouldSortPortfolioReverse = false;
    }

    if (type == 'cost') {
      if (!this.shouldSortPortfolioReverse) {
        this.vendorDetails.vendorPortfolios.sort((a, b) => a.cost - b.cost);
        this.shouldSortPortfolioReverse = true;
      } else {
        this.vendorDetails.vendorPortfolios.sort((a, b) => b.cost - a.cost);
        this.shouldSortPortfolioReverse = false;
      }
    } else if (type == 'duration') {
      if (!this.shouldSortPortfolioReverse) {
        this.vendorDetails.vendorPortfolios.sort((a, b) => a.duration - b.duration);
        this.shouldSortPortfolioReverse = true;
      } else {
        this.vendorDetails.vendorPortfolios.sort((a, b) => b.duration - a.duration);
        this.shouldSortPortfolioReverse = false;
      }
    } else if (type == 'date') {
      if (!this.shouldSortPortfolioReverse) {
        this.vendorDetails.vendorPortfolios.sort((a, b) => {
          return <any>new Date(a.date) - <any>new Date(b.date)
        });
        this.shouldSortPortfolioReverse = true;
      } else {
        this.vendorDetails.vendorPortfolios.sort((a, b) => {
          return <any>new Date(b.date) - <any>new Date(a.date)
        });
        this.shouldSortPortfolioReverse = false;
      }
    } else if (type == 'createdAt') {

    }

    this.portfolioDetails = [...this.vendorDetails.vendorPortfolios];
    this.lastAppliedPortfolioFilter = type;

    if (!this.viewMoreClicked) {
      this.listPortfolio();
    }
  }

  listPortfolio() {
    this.portfolioDetails = this.vendorDetails.vendorPortfolios.slice(0, 2);
  }

  rateValues(type) {

    if (type == 'reviews') {
      this.reviewRatingData = [];
      this.reviewData.forEach(element => {
        this.reviewRatingData.push(this.ratingConverter(element.rating));
      });
    } else if (type == 'detailedReport') {
      this.vendorRating = {
        detailed: [],
        averageRating: []
      };
      let avgRating = 0;

      for (let key in this.vendorDetails.detailedRating) {
        let ratingValue = Number(this.vendorDetails.detailedRating[key]);
        if (ratingValue > 5) {
          ratingValue = 5;
        }
        let rating = this.ratingConverter(ratingValue)
        avgRating += ratingValue;

        let ratingDescription = '';

        switch (key.toLowerCase()) {
          case 'responsiveness': {
            ratingDescription = 'The responsiveness rating indicates the contractor\'s level of performance related to the quality of communication and follow-up. This rating constitutes 10% from the overall rating. ';
            break;
          }
          case 'professionalism': {
            ratingDescription = 'The professionalism rating indicates the contractor\'s integrity, honesty, transparency, and level of abiding to the industry standards. This rating constitutes 30% from the overall rating.';
            break;
          }
          case 'accuracy': {
            ratingDescription = 'The accuracy rating indicates the contractor\'s level of abidance to the scope of work, agreed budget, and deadlines. This rating constitutes 30% from the overall rating ';
            break;
          }
          case 'quality': {
            ratingDescription = 'The quality of work rating indicates the contractor\'s quality of work, quality of materials used, and honoring warrantees. This rating constitutes 30% from the overall rating. ';
            break;
          }
        }

        var someRating;
        if (Number.isNaN(ratingValue)) {
          someRating = 'NA';
        } else {
          someRating = Math.round(ratingValue * 10) / 10;
          someRating = someRating.toFixed(1);
          //  ratingValue.toFixed(1);
        }

        let vendorRating = {
          'ratingCategory': key,
          'rating': rating,
          'ratingValue': someRating,
          'ratingDescription': ratingDescription
        }

        this.vendorRating.detailed.push(vendorRating);
      }

      avgRating = avgRating / 4;
      avgRating = Math.round(avgRating * 10) / 10;

      if (Number.isNaN(avgRating)) {
        this.vendorRating.averageRating.value = 'NA'
      } else {
        this.vendorRating.averageRating.value = avgRating.toFixed(1);
      }

      this.vendorRating.averageRating.ratingStar = this.ratingConverter(Math.round(avgRating * 2) / 2);
    } else {
      console.log("Error Call");
    }
  }


  ratingConverter(value) {
    if (value > 5) {
      value = 5;
    }
    let rating = [];
    for (let i = .5; i <= 5; i += .5) {
      if (i <= value) {
        if (i % 1 !== 0) {
          if (i == value) {
            rating.push('halfStar');
          } else {
            rating.push('fullStar');
          }
        }
      } else {
        if (i % 1 != 0) {
          rating.push('noStar');
        }
      }
    }
    return rating;
  }



  changeRatingSort(type: string) {
    if (this.lastAppliedFilter != type) {
      this.shouldSortReverse = false;
    }

    if (type == 'postedDate') {
      if (!this.shouldSortReverse) {
        this.reviewData.sort((a, b) => {
          return <any>new Date(a.createdAt) - <any>new Date(b.createdAt)
        });
        this.shouldSortReverse = true;
      } else {
        this.reviewData.sort((a, b) => {
          return <any>new Date(b.createdAt) - <any>new Date(a.createdAt)
        });
        this.shouldSortReverse = false;
      }

    } else if (type == 'rating') {
      if (!this.shouldSortReverse) {
        this.reviewData.sort((a, b) => a.rating - b.rating)
        this.shouldSortReverse = true;
      } else {
        this.reviewData.sort((b, a) => a.rating - b.rating)
        this.shouldSortReverse = false;
      }
    }
    // this.reviewData = [...this.reviewData];
    this.rateValues('reviews');
    this.ratingSortType = type;
    this.lastAppliedFilter = type;
  }


  updateFavoriteVendor(status) {
    let preferredStatus = {
      "favouriteOrgId": this.vendorOrganizationId,
      "wisherOrgId": this.currentUser.currentOrgId,
      "wisherUserId": this.currentUser.clientId,
      "interestStatus": status
    }

    this._appService.updatePreferredVendorStatus(preferredStatus).subscribe((response) => {
      if (response.statusCode == APIResponse.Success) {
        if (status == '1') {
          this.isFavoriteVendor = 'true';
        } else {
          this.isFavoriteVendor = 'false';
        }

      } else {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
      }
    }, err => {
      this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
    });

  }


  openComponyInfoDialog() {
    let saleInfoDialogRef = this.dialog.open(CompanyInfoDialog, {
      data: {
        userData: this.vendorDetails,
        currentUser: this.currentUser
      },
      width: '700px',
      height: 'auto'
    });
    saleInfoDialogRef.afterClosed().subscribe(result => {
      if (result != undefined && result != '') {
        this.vendorDetails.establishedDate = result.establishedDate;
        this.vendorDetails.employeesCount = result.employeesCount;
        this.vendorDetails.annualRevenue = result.annualRevenue;
      }
    });
  }

  openComponyDetailsDialog() {
    let compnayDetailsDialogRef = this.dialog.open(CompanyDetailsDialog, {
      data: {
        userData: this.vendorDetails,
        cityList: this.cityList,
        allTags: this.allTags,
        cityProvinceList: this.cityProvinceList,
        currentUser: this.currentUser
      },
      width: '600px',
      height: 'auto'
    });
    compnayDetailsDialogRef.afterClosed().subscribe(result => {
      if (result != undefined && result != '') {
        this.getVendorOrganizationDetails();
      }
    });
  }

  openContactInfoDialog() {
    let contactInfoDialogRef = this.dialog.open(ContactInfoDialog, {
      data: {
        userData: this.vendorDetails,
        cityProvinceList: this.cityProvinceList,
        currentUser: this.currentUser
      }
    });
    contactInfoDialogRef.afterClosed().subscribe(result => {
      if (result != undefined && result != '') {
        this.getVendorOrganizationDetails();
      }
    });
  }

  openInsuranceInfoDialog() {
    let insuranceInfoDialogRef = this.dialog.open(InsuranceInfoDialog, {
      data: {
        userData: this.vendorDetails
      },
      width: '90%',
      height: 'auto'
    });
    insuranceInfoDialogRef.afterClosed().subscribe(result => {
      if (result != undefined && result != '') {
        this.getVendorOrganizationDetails();
      }
    });
  }

  openAddReviewDialog() {
    let saleInfoDialogRef = this.dialog.open(AddReviewDialog, {
      data: {
        userData: this.vendorOrganizationId,
        currentUser: this.currentUser
      },
      width: '600px',
      height: 'auto'
    });
    saleInfoDialogRef.afterClosed().subscribe(result => {
      if (result != undefined && result != '') {
        this.getVendorOrganizationDetails();
      }
    });
  }

  openViewReviewDialog(review) {
    let reviewDialogRef = this.dialog.open(ViewReviewDialog, {
      data: {
        currentUser: this.currentUser,
        selectedReview: review,
        vendorOrganizationId: this.vendorOrganizationId
      },
      width: '600px',
      height: 'auto'
    });
    reviewDialogRef.afterClosed().subscribe(result => {
      if (result != undefined && result != '') {
        this.getVendorOrganizationDetails();
      }
    });
  }

  openPortfolioDialog() {
    const dialogRef = this.dialog.open(PortfolioDialog, {
      data: {
        userData: this.currentUser,
        cityList: this.cityNames
      },
      width: '600px',
      height: 'auto'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result != undefined && result != '') {
        this.getVendorOrganizationDetails();
      }
    });
  }

  editPortfolio(portfolio: Portfolio, index) {
    const dialogRef = this.dialog.open(PortfolioDialog, {
      data: {
        formData: portfolio,
        userData: this.currentUser,
        cityList: this.cityNames
      },
      width: '600px',
      height: 'auto'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result != undefined && result != '') {
        this.getVendorOrganizationDetails();
      }
    });
  }

  deletePortfolio(portfolio: Portfolio, index) {
    const userNewRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '550px',
      data: {
        type: DialogType.TwoButtonDialog,
        title: "PLEASE CONFIRM",
        message: "Are you sure you want to delete this portfolio?",
        yesButtonTitle: "YES",
        noButtonTitle: "NO"
      }
    });
    userNewRef.afterClosed().subscribe(result => {
      if (result == 'true') {
        this.confirmDeletePortfolio(portfolio.id);
      }
    });
  }

  confirmDeletePortfolio(portfoilioId) {
    this._appService.vendorDeletePortfolio(portfoilioId).subscribe((response) => {
      if (response.statusCode == APIResponse.Success) {
        this._appUtil.showAlert(AlertType.Success, AppLiterals.vendorPortfolioDeletionSuccessful);
        this.getVendorOrganizationDetails();
      } else {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.unableToDeletePortfolio);
      }
    }, err => {
      this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
    });
  }

  viewRating() {
    this.ratingView.open();
    document.getElementById('info-banner').scrollIntoView({
      behavior: "smooth"
    });
  }

  scrollToSection($event) {
    document.getElementById('info-banner').scrollIntoView({
      behavior: "smooth"
    });
  }


  fileClicked(fileDetails) {
    this._appUtil.downloadFile(fileDetails.containerName, fileDetails.blobName, fileDetails.fileName, fileDetails.fileType);
  }

  /**
   * On init
   */
  ngOnInit(): void {

  }

  getVendorOrganizationDetails() {
    this._appService.getVendorOrgProfileDetails(this.vendorOrganizationId).subscribe((response) => {
      if (response.statusCode == APIResponse.Success) {
        this.isDataAvailableToLoad = true;
        this.vendorDetails = response.vendor;
        this.vendorDetails.vendorRegistrationFiles = response.vendorRegistrationFiles;
        this.profileImageUrl = this.vendorDetails.vendorProfileImageUrl;

        this.vendorDetails.companyEstablishedDate = moment(this.vendorDetails.establishedDate).format(AppDateFormat.DisplayFormat);

        if (this.vendorDetails.vendorTags == "[]") {
          this.vendorDetails.vendorTags = [];
        }



        if (response.vendorInsurances.length > 0) {
          this.vendorDetails.insureDetails = response.vendorInsurances[0];
          if (this.vendorDetails.insureDetails.insurancePolicyExpiryDate != null) {
            this.vendorDetails.insureDetails.insuranceExpiryDate = moment(this.vendorDetails.insureDetails.insurancePolicyExpiryDate).format(AppDateFormat.DisplayFormat);
          }
          let insuredValue = Number(this.vendorDetails.insureDetails.insuranceLiability)
          if (isNaN(insuredValue)) {
            this.vendorDetails.insureDetails.insuranceLiability = '0';
          }
          this.vendorDetails.insureDetails.insurance = true;
        } else {
          this.vendorDetails.insureDetails = [];
          this.vendorDetails.insureDetails.insurance = false;
          this.vendorDetails.insureDetails['insuranceCompany'] = 'NA';
          this.vendorDetails.insureDetails['insuranceLiability'] = 'NA';
          this.vendorDetails.insureDetails['insurancePolicyExpiryDate'] = 'NA';
          this.vendorDetails.insureDetails['insuranceBonded'] = '0';
        }

        this.vendorDetails.vendorPortfolios = response.vendorPortfolios;
        this.vendorDetails.vendorPortfolios.sort((a, b) => {
          return <any>new Date(b.createdAt) - <any>new Date(a.createdAt)
        });

        if (this.vendorDetails.annualRevenue != null) {
          let revenue = this.vendorDetails.annualRevenue.split('$');
          if (revenue.length >= 2) {
            this.vendorDetails.annualRevenue = revenue[1];
          } else {
            this.vendorDetails.annualRevenue = revenue[0];
          }
        }

        let rating = Number(this.vendorDetails.rating);
        if (isNaN(rating)) {
          this.vendorDetails.rating = 'NA';
        } else {
          this.vendorDetails.rating = Math.round(this.vendorDetails.rating * 10) / 10;
          this.vendorDetails.rating = parseFloat(this.vendorDetails.rating).toFixed(1);
        }

        this.rateValues('detailedReport');

        this.lastAppliedPortfolioFilter = '';
        let sortType = 'date';
        this.sortPortfolio(sortType);

        if (this.vendorDetails.reviewsRatings != null) {
          this.vendorDetails.reviewsRatings = this.vendorDetails.reviewsRatings.map(review => {
            review.rating = Math.round(review.rating * 10) / 10;
            review.rating = parseFloat(review.rating).toFixed(1);
            review.formattedEngagementDate = moment(review.lastEngagedDate).format(AppDateFormat.DisplayFormat);
            return review;
          });
        }

        this.reviewData = this.vendorDetails.reviewsRatings
        this.changeRatingSort('postedDate');
        this._vendorBrowserService.setVendorData('');
        this._vendorBrowserService.setReviewData('');

        this.vendorDetails.vendorServicesCities.sort((a, b) => a.localeCompare(b));
        this.vendorDetails.vendorTags.sort((a, b) => a.tagName.localeCompare(b.tagName));

        this.openReviewSectionIfNeeded();
      } else {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.unableToLoadVendorProfile);
      }
    }, err => {
      this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
    });
  }


  getUnClaimedVendorOrganizationDetails() {
    this._appService.getvendorUnclaimedOrgProfile(this.vendorUnclaimedProfileId).subscribe((response) => {
      if (response.statusCode == APIResponse.Success) {
        this.isDataAvailableToLoad = true;
        this.vendorDetails = response.vendor;
        this.vendorDetails.vendorRegistrationFiles = response.vendorRegistrationFiles;
        this.profileImageUrl = this.vendorDetails.vendorProfileImageUrl;

        this.vendorDetails.companyEstablishedDate = moment(this.vendorDetails.establishedDate).format(AppDateFormat.DisplayFormat);

        debugger;
        if (this.vendorDetails.expertiseCategory != null && this.vendorDetails.expertiseCategory != '') {
          let vendorTags = this.vendorDetails.expertiseCategory.split(',');
          var selectedTags: Tag[] = [];
          vendorTags.forEach(tagName => {
            let tag = this.allTags.find(tag => tag.tagName.toLowerCase() == tagName.toLowerCase().trim());
            if (tag != null) {
              selectedTags.push(tag);
            }
          });
          this.vendorDetails.vendorTags = selectedTags;
        }

        if (response.vendorInsurances.length > 0) {
          this.vendorDetails.insureDetails = response.vendorInsurances[0];
          if (this.vendorDetails.insureDetails.insurancePolicyExpiryDate != null) {
            this.vendorDetails.insureDetails.insuranceExpiryDate = moment(this.vendorDetails.insureDetails.insurancePolicyExpiryDate).format(AppDateFormat.DisplayFormat);
          }
          let insuredValue = Number(this.vendorDetails.insureDetails.insuranceLiability)
          if (isNaN(insuredValue)) {
            this.vendorDetails.insureDetails.insuranceLiability = '0';
          }
          this.vendorDetails.insureDetails.insurance = true;
        } else {
          this.vendorDetails.insureDetails = [];
          this.vendorDetails.insureDetails.insurance = false;
          this.vendorDetails.insureDetails['insuranceCompany'] = 'NA';
          this.vendorDetails.insureDetails['insuranceLiability'] = 'NA';
          this.vendorDetails.insureDetails['insurancePolicyExpiryDate'] = 'NA';
          this.vendorDetails.insureDetails['insuranceBonded'] = '0';
        }

        this.vendorDetails.vendorPortfolios = response.vendorPortfolios;
        this.vendorDetails.vendorPortfolios.sort((a, b) => {
          return <any>new Date(b.createdAt) - <any>new Date(a.createdAt)
        });

        if (this.vendorDetails.annualRevenue != null) {
          let revenue = this.vendorDetails.annualRevenue.split('$');
          if (revenue.length >= 2) {
            this.vendorDetails.annualRevenue = revenue[1];
          } else {
            this.vendorDetails.annualRevenue = revenue[0];
          }
        }

        let rating = Number(this.vendorDetails.rating);
        if (isNaN(rating)) {
          this.vendorDetails.rating = 'NA';
        } else {
          this.vendorDetails.rating = Math.round(this.vendorDetails.rating * 10) / 10;
          this.vendorDetails.rating = parseFloat(this.vendorDetails.rating).toFixed(1);
        }

        this.rateValues('detailedReport');

        this.lastAppliedPortfolioFilter = '';
        let sortType = 'date';
        this.sortPortfolio(sortType);

        if (this.vendorDetails.reviewsRatings != null) {
          this.vendorDetails.reviewsRatings = this.vendorDetails.reviewsRatings.map(review => {
            review.rating = Math.round(review.rating * 10) / 10;
            review.rating = parseFloat(review.rating).toFixed(1);
            return review;
          });
        }

        this.reviewData = this.vendorDetails.reviewsRatings
        this.changeRatingSort('postedDate');
        this._vendorBrowserService.setVendorData('');
        this._vendorBrowserService.setReviewData('');

        this.vendorDetails.vendorServicesCities.sort((a, b) => a.localeCompare(b));
        this.vendorDetails.vendorTags.sort((a, b) => a.tagName.localeCompare(b.tagName));

        this.openReviewSectionIfNeeded();
      } else {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.unableToLoadVendorProfile);
      }
    }, err => {
      this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
    });
  }

  populateUnclaimedVendorTags() {
    if (this.vendorDetails != null) {
      if (this.vendorDetails.expertiseCategory != null && this.vendorDetails.expertiseCategory != '') {
        let vendorTags = this.vendorDetails.expertiseCategory.split(',');
        var selectedTags: Tag[] = [];
        vendorTags.forEach(tagName => {
          let tag = this.allTags.find(tag => tag.tagName.toLowerCase() == tagName.toLowerCase().trim());
          if (tag != null) {
            selectedTags.push(tag);
          }
        });
        this.vendorDetails.vendorTags = selectedTags;
      }
    }
  }



  shouldExpandReview = false;

  openReviewSectionIfNeeded() {
    if (this.router.url == '/myreview/view') {
      this.shouldExpandReview = true;
    }
  }

  getAppData() {
    this._appService.getAppData().subscribe((res: any) => {
      if (res.statusCode == APIResponse.Success) {
        this.allTags = res.predefinedTags;

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

        if (this.vendorUnclaimedProfileId != null) {
          this.populateUnclaimedVendorTags();
        }
      } else {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
      }
    },
      err => {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
      });
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
      width: '550px',
      data: {
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
      "userType": "2",
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
      "userType": "2",
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



  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
    this._vendorBrowserService.setVendorData('');
  }
}




@Component({
  selector: 'view-review-dialog',
  templateUrl: 'view-review-dialog.html',
})

export class ViewReviewDialog {
  vendorData: any;
  comInfoEditform: FormGroup;
  review: any;

  pRatingValue = 0;
  aRatingValue = 0;
  rRatingValue = 0;
  qRatingValue = 0;

  prating = "0";
  arating = "0";
  rrating = "0";
  qrating = "0";

  pRatingStars = [];
  aRatingStars = [];
  rRatingStars = [];
  qRatingStars = [];

  reviewEditState = 0;
  shouldShowReplyOption = false;

  currentUser: any;
  currentVendorOrgId: any;

  mandatory = "Mandatory field is required";
  constructor(
    private _appService: AppService,
    private _appUtil: AppUtilService,
    private _formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<CompanyInfoDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {

    this.currentUser = data.currentUser;
    this.review = data.selectedReview;
    this.currentVendorOrgId = data.vendorOrganizationId;

    var engagementDate: any;
    engagementDate = moment(this.review.lastEngagedDate);
    if (!engagementDate.isValid()) {
      engagementDate = '';
    }

    this.comInfoEditform = this._formBuilder.group({
      userReviewInput: [this.review.reviewComments],
      vendorReply: [''],
      prating: [''],
      arating: [''],
      rrating: [''],
      qrating: [''],
      engagementDate: [engagementDate, Validators.required]
    });

    this.review.categoryRating.forEach(venRating => {
      if (venRating.ratingCategory == "1") {
        this.rRatingValue = Number(venRating.rating);
        this.rrating = venRating.rating;
        this.rRatingStars = this.ratingConverter(Math.round(this.rRatingValue * 2) / 2);
      } else if (venRating.ratingCategory == "2") {
        this.pRatingValue = Number(venRating.rating);
        this.prating = venRating.rating;
        this.pRatingStars = this.ratingConverter(Math.round(this.pRatingValue * 2) / 2);
      } else if (venRating.ratingCategory == "3") {
        this.aRatingValue = Number(venRating.rating);
        this.arating = venRating.rating;
        this.aRatingStars = this.ratingConverter(Math.round(this.aRatingValue * 2) / 2);
      } else if (venRating.ratingCategory == "4") {
        this.qRatingValue = Number(venRating.rating);
        this.qrating = venRating.rating;
        this.qRatingStars = this.ratingConverter(Math.round(this.qRatingValue * 2) / 2);
      }
    });
    this.checkReviewStatus();
  }

  ratingConverter(value) {
    if (value > 5) {
      value = 5;
    }
    let rating = [];
    for (let i = .5; i <= 5; i += .5) {
      if (i <= value) {
        if (i % 1 !== 0) {
          if (i == value) {
            rating.push('halfStar');
          } else {
            rating.push('fullStar');
          }
        }
      } else {
        if (i % 1 != 0) {
          rating.push('noStar');
        }
      }
    }
    return rating;
  }


  checkReviewStatus() {
    if (this.currentUser.userType == UserType.Client) {
      if (this.currentUser.clientId == this.review.clientId) {
        this.reviewEditState = 1;
      } else {
        this.reviewEditState = 3;
      }
    } else if (this.currentUser.userType == UserType.Vendor) {
      this.reviewEditState = 3;
      if (this.currentUser.vendorOrganisationId == this.review.vendorOrganisationId) {
        if (this.review.replyComments == '' || this.review.replyComments == null) {
          this.shouldShowReplyOption = true;
        } else {
          this.shouldShowReplyOption = false;
        }
      }
    } else {
      this.reviewEditState = 3;
    }
  }

  ratingUpdated(event) {
    let ratingName = event.target.name;
    let ratingValue = event.target.value;
    if (ratingName == "prating") {
      this.prating = ratingValue;
    } else if (ratingName == "arating") {
      this.arating = ratingValue;
    } else if (ratingName == "rrating") {
      this.rrating = ratingValue;
    } else if (ratingName == "qrating") {
      this.qrating = ratingValue;
    }
  }



  replyClientReview() {
    debugger;
    var vendorComment = this.comInfoEditform.get('vendorReply').value
    let vendorReply = {
      "id": this.review.id,
      "vendorOrganisationId": this.currentUser.vendorOrganisationId,
      "vendorId": this.currentUser.userId,
      "replyComments": vendorComment
    };
    if (vendorReply.replyComments == "") {
      this._appUtil.showAlert(AlertType.Error, AppLiterals.EmptyReply);
    } else {
      this._appService.replyClientReview(vendorReply).subscribe((response) => {
        if (response.statusCode == APIResponse.Success) {
          this._appUtil.showAlert(AlertType.Success, AppLiterals.clientReviewPostedSuccessfully);
          this.dialogRef.close(vendorReply);
        } else {
          this._appUtil.showAlert(AlertType.Error, AppLiterals.unabletoPostReview);
        }
      }, err => {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
      });
    }
  }

  deleteVendorReview() {
    this._appService.deleteVendorReview(this.review.id).subscribe((response) => {
      if (response.statusCode == APIResponse.Success) {
        this._appUtil.showAlert(AlertType.Success, AppLiterals.clientReviewPostedSuccessfully);
        this.dialogRef.close(true);
      } else {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.unabletoPostReview);
      }
    }, err => {
      this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
    });

  }

  updateVendorReview() {
    debugger;

    var reviewComment = this.comInfoEditform.get('userReviewInput').value

    let pratingFloat = parseFloat(this.prating).toFixed(1)
    let aratingFloat = parseFloat(this.arating).toFixed(1)
    let rratingFloat = parseFloat(this.rrating).toFixed(1)
    let qratingFloat = parseFloat(this.qrating).toFixed(1)

    let ratingDetails = [];

    ratingDetails.push({
      "ratingCategory": 1,
      "rating": rratingFloat
    });

    ratingDetails.push({
      "ratingCategory": 2,
      "rating": pratingFloat
    });

    ratingDetails.push({
      "ratingCategory": 3,
      "rating": aratingFloat
    });

    ratingDetails.push({
      "ratingCategory": 4,
      "rating": qratingFloat
    });

    let totalRating = Number(this.prating) + Number(this.arating) + Number(this.rrating) + Number(this.qrating);
    let overAllRating = this.round(totalRating / 4, 0.5);

    var engagementDate = this.comInfoEditform.value['engagementDate'];
    var formattedEngagementDate;
    if (engagementDate != null && engagementDate != '') {
      formattedEngagementDate = engagementDate.format(AppDateFormat.ServiceFormat);
    }

    let reviewRatingDetails = {
      "reviewId": this.review.id,
      "reviewComments": reviewComment,
      "overAllRating": overAllRating.toString(),
      "categoryRatings": ratingDetails,
      "lastEngagedDate": formattedEngagementDate
    };

    this._appService.updateVendorReview(reviewRatingDetails).subscribe((response) => {
      if (response.statusCode == APIResponse.Success) {
        this._appUtil.showAlert(AlertType.Success, AppLiterals.clientReviewPostedSuccessfully);
        this.dialogRef.close(reviewRatingDetails);
      } else {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.unabletoPostReview);
      }
    }, err => {
      this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
    });
  }

  round(value, step) {
    step || (step = 1.0);
    var inv = 1.0 / step;
    return Math.round(value * inv) / inv;
  }


  updateReview() {
    this.reviewEditState = 2;
    this.comInfoEditform.controls["pratingfive"].setValue(1);
  }
}




@Component({
  selector: 'add-review-dialog',
  templateUrl: 'add-review-dialog.html',
})

export class AddReviewDialog {
  vendorOrganizationId: any;
  currentUser: any;
  comInfoEditform: FormGroup;
  mandatory = "Mandatory field is required";
  constructor(
    private _appService: AppService,
    private _appUtil: AppUtilService,
    private _formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<CompanyInfoDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {
    this.vendorOrganizationId = data.userData;
    this.currentUser = data.currentUser;

    this.comInfoEditform = this._formBuilder.group({
      other: [''],
      prating: [''],
      arating: [''],
      rrating: [''],
      qrating: [''],
      engagementDate: ['', Validators.required]
    });
  }

  prating = "0";
  arating = "0";
  rrating = "0";
  qrating = "0";

  ratingUpdated(event) {
    let ratingName = event.target.name;
    let ratingValue = event.target.value;

    if (ratingName == "prating") {
      this.prating = ratingValue;
    } else if (ratingName == "arating") {
      this.arating = ratingValue;
    } else if (ratingName == "rrating") {
      this.rrating = ratingValue;
    } else if (ratingName == "qrating") {
      this.qrating = ratingValue;
    }
  }


  postUserReview() {
    debugger;

    var reviewComment = this.comInfoEditform.get('other').value

    let pratingFloat = parseFloat(this.prating).toFixed(1)
    let aratingFloat = parseFloat(this.arating).toFixed(1)
    let rratingFloat = parseFloat(this.rrating).toFixed(1)
    let qratingFloat = parseFloat(this.qrating).toFixed(1)

    let ratingDetails = [];

    ratingDetails.push({
      "ratingCategory": 1,
      "rating": rratingFloat
    });

    ratingDetails.push({
      "ratingCategory": 2,
      "rating": pratingFloat
    });

    ratingDetails.push({
      "ratingCategory": 3,
      "rating": aratingFloat
    });

    ratingDetails.push({
      "ratingCategory": 4,
      "rating": qratingFloat
    });

    let totalRating = Number(this.prating) + Number(this.arating) + Number(this.rrating) + Number(this.qrating);
    let overAllRating = this.round(totalRating / 4, 0.5)

    var engagementDate = this.comInfoEditform.value['engagementDate'];
    var formattedEngagementDate;

    if (engagementDate != null && engagementDate != '') {
      formattedEngagementDate = engagementDate.format(AppDateFormat.ServiceFormat);
    }

    if (totalRating == 0) {
      this._appUtil.showAlert(AlertType.Error, AppLiterals.EmptyReview);
    } else {
      let reviewRatingDetails = {
        "clientId": this.currentUser.clientId,
        "clientOrganisationId": this.currentUser.currentOrgId,
        "projectId": "1",
        "vendorOrganisationId": this.vendorOrganizationId,
        "reviewComments": reviewComment,
        "overAllRating": overAllRating.toString(),
        "categoryRatings": ratingDetails,
        "lastEngagedDate": formattedEngagementDate
      };

      this._appService.postRatingForVendor(reviewRatingDetails).subscribe((response) => {
        if (response.statusCode == APIResponse.Success) {
          this._appUtil.showAlert(AlertType.Success, AppLiterals.clientReviewPostedSuccessfully);
          this.dialogRef.close(reviewRatingDetails);
        } else {
          this._appUtil.showAlert(AlertType.Error, AppLiterals.unabletoPostReview);
        }
      }, err => {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
      });
    }
  }
  round(value, step) {
    step || (step = 1.0);
    var inv = 1.0 / step;
    return Math.round(value * inv) / inv;
  }
}


@Component({
  selector: 'company-info-dialog',
  templateUrl: 'company-info-dialog.html',
})

export class CompanyInfoDialog {
  vendorData: any;
  currentUser: any;
  comInfoEditform: FormGroup;
  mandatory = "Mandatory field is required";
  constructor(
    private _appService: AppService,
    private _appUtil: AppUtilService,
    private _formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<CompanyInfoDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {
    this.vendorData = data.userData;
    this.currentUser = data.currentUser;
    let establishDate = moment(this.vendorData.establishedDate);

    this.comInfoEditform = this._formBuilder.group({
      establishedDate: [establishDate, Validators.required],
      totalEmp: [this.vendorData.employeesCount, [Validators.pattern('^[0-9]*$')]],
      avgYearlySale: [this.vendorData.annualRevenue, [Validators.pattern('^[+-]?([0-9]*[,])?([0-9]*[.])?[0-9]+$')]]
    });
  }

  updateCompanyInfo() {
    let establishDate = this.comInfoEditform.value['establishedDate'];

    let formattedDateOfEstabilishment = '';
    if (establishDate != null) {
      formattedDateOfEstabilishment = establishDate.format("YYYY-MM-DD")
    }

    let updatedCompanyInfo = {
      'vendorOrganisationId': this.vendorData.vendorOrganisationId,
      'employeesCount': this.comInfoEditform.value['totalEmp'],
      'annualRevenue': this.comInfoEditform.value['avgYearlySale'],
      'establishedDate': formattedDateOfEstabilishment,
      'modifiedByUserId': this.currentUser.userId
    };


    this._appService.updateVendorProfileSaleDetails(updatedCompanyInfo).subscribe((response) => {
      if (response.statusCode == APIResponse.Success) {
        this._appUtil.showAlert(AlertType.Success, AppLiterals.profileDetailsUpdatedSuccessfully);
        updatedCompanyInfo.establishedDate = establishDate;
        this.dialogRef.close(updatedCompanyInfo)
      } else {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.unableToUpdateClientProfile);
      }
    }, err => {
      this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
    });
  }
}



@Component({
  selector: 'company-details-dialog',
  templateUrl: 'company-details-dialog.html',
  animations: fuseAnimations
})
export class CompanyDetailsDialog {
  vendorDetails: any;
  currentUser: any;
  comDetailsEditform: FormGroup;
  mandatory = "Mandatory field is required";

  isProfileImageChanged = false;
  profileImageFile: File;
  imgURL: any;

  allTags: Tag[];
  cityNames: City[];

  cityProvinceList: CityProvince[];
  selectedServiceCityList: CityProvince[];
  selectedCity: CityProvince;
  slectedProvince: string;
  cityList: String[];
  selectedCityList = [];

  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  tagCtrl = new FormControl();

  filteredTags: Observable<Tag[]>;
  selectedTags: Tag[] = [];

  isSupportUser = false;

  docFileList: any[] = [];

  @ViewChild('tagInput', {
    static: false
  }) tagInput: ElementRef<HTMLInputElement>;
  @ViewChild("cityInput", {
    static: false
  }) cityField: ElementRef;
  @ViewChild('auto', {
    static: false
  }) matAutocomplete: MatAutocomplete;


  constructor(
    private _formBuilder: FormBuilder,
    private _appService: AppService,
    private _appUtil: AppUtilService,
    public dialogRef: MatDialogRef<CompanyDetailsDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {
    this.vendorDetails = data.userData;
    this.currentUser = data.currentUser;
    this.cityProvinceList = [...data.cityProvinceList];
    this.allTags = [...data.allTags];

    this.allTags.sort((a, b) => a.tagName.localeCompare(b.tagName));
    this.cityProvinceList.sort((a, b) => a.city.localeCompare(b.city));

    this.imgURL = this.vendorDetails.vendorProfileImageUrl;


    this.docFileList = [];
    for (let document of this.vendorDetails.vendorRegistrationFiles) {
      let file = {
        "name": document.fileName,
        "formatedSize": document.fileSize,
        "isExistingFile": true,
        "attachmentId": document.id
      }
      this.docFileList.push(file);
    }

    if (this.currentUser.userType == UserType.SupportUser) {
      this.isSupportUser = true;
      this.selectable = false;
      this.removable = false;
    }

    this.filteredTags = this.tagCtrl.valueChanges.pipe(
      startWith(null),
      map((data: Tag | null) => data ? this._filter(data) : this.allTags.slice()));

    this.filteredCities = this.cityCtrl.valueChanges.pipe(
      startWith(null),
      map((data: CityProvince | null) => data ? this._cityFilter(data) : this.cityProvinceList.slice()));

    this.selectedTags = [...this.vendorDetails.vendorTags];
    this.selectedCities = this.cityProvinceList.filter(cityProvince => this.vendorDetails.vendorServicesCities.some(city => cityProvince.city === city));

    this.selectedCityList = this.selectedCities.map((cityPro: CityProvince) => {
      return cityPro.id;
    });

    let parent = this;
    this.allTags = this.allTags.filter(function (val) {
      return parent.selectedTags.map(function (e) {
        return e.tagName
      }).indexOf(val.tagName) == -1
    });

    this.cityProvinceList = this.cityProvinceList.filter(function (val) {
      return parent.selectedCities.indexOf(val) == -1;
    });

    this.comDetailsEditform = this._formBuilder.group({
      comName: [{
        value: this.vendorDetails.companyName,
        disabled: !this.isSupportUser
      }, Validators.required],
      description: [this.vendorDetails.description, Validators.required],
      tags: [{
        value: this.selectedTags,
        disabled: this.isSupportUser
      }, Validators.required],
      servicedCities: [{
        value: this.selectedCities,
        disabled: this.isSupportUser
      }, Validators.required],
      city: ['']
    });



  }


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
    this.comDetailsEditform.get('tags').setValue(this.selectedTags);
  }

  remove(data: Tag): void {
    const index = this.selectedTags.indexOf(data);
    if (index >= 0) {
      this.selectedTags.splice(index, 1);
      this.allTags.push(data);
      this.allTags.sort((a, b) => a.tagName.localeCompare(b.tagName));
      this.tagCtrl.setValue(null);
      this.comDetailsEditform.get('tags').setValue(this.selectedTags);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.selectedTags.push(event.option.value);
    this.tagInput.nativeElement.value = '';
    this.tagCtrl.setValue(null);
  }

  //*************** City search starts ****************************
  cityCtrl = new FormControl();
  filteredCities: Observable<CityProvince[]>;
  selectedCities: CityProvince[] = [];

  @ViewChild('cityAuto', {
    static: false
  }) cityAutocomplete: MatAutocomplete;

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
    this.comDetailsEditform.get('servicedCities').setValue(this.selectedCities);
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
      this.comDetailsEditform.get('servicedCities').setValue(this.selectedCities);
    }

    if (this.selectedCities.length == 0) {
      this.comDetailsEditform.controls['servicedCities'].setErrors({
        'incorrect': true
      });
    }
  }


  selectCity(event: MatAutocompleteSelectedEvent): void {
    this.comDetailsEditform.controls['servicedCities'].setErrors(null);
    this.selectedCities.push(event.option.value);
    this.cityField.nativeElement.value = '';
    this.cityCtrl.setValue(null);
    this.cityField.nativeElement.blur();
    this.cityField.nativeElement.focus();

    this.selectedCityList = this.selectedCities.map((cityPro: CityProvince) => {
      return cityPro.id;
    });
  }

  chooseProfileImage(event) {
    debugger;
    let files = event.target.files;
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

  updateCompanyDetails() {
    let tagList = this.selectedTags.map((tag: any) => {
      return tag.tagId;
    });

    let updatedCompanyDetails: any;

    if (this.isSupportUser == true) {
      updatedCompanyDetails = {
        'vendorOrganisationId': this.vendorDetails.vendorOrganisationId,
        'companyName': this.comDetailsEditform.value['comName'],
        'description': this.vendorDetails.description,
        'serviceCities': this.selectedCityList.toString(),
        'tags': tagList.toString(),
        'modifiedByUserId': this.currentUser.id
      };
    } else {
      updatedCompanyDetails = {
        'vendorOrganisationId': this.vendorDetails.vendorOrganisationId,
        'companyName': this.vendorDetails.companyName,
        'description': this.comDetailsEditform.value['description'],
        'serviceCities': this.selectedCityList.toString(),
        'tags': tagList.toString(),
        'modifiedByUserId': this.currentUser.userId
      };
    }

    this._appService.updateVendorProfileCompanyDetails(updatedCompanyDetails).subscribe((response) => {
      if (response.statusCode == APIResponse.Success) {
        this.updateProfileDocuments();
      } else if (response.statusCode == UserEnrollmentStatus.AlreadyExist) {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.vendorCompNameExistAlready);
      } else {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.unableToUpdateVendorProfile);
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
    } else {
      this._appUtil.showAlert(AlertType.Error, AppLiterals.FilesizeError5MB);
    }
  }


  updateProfileDocuments() {
    var filesToDelete = [];
    var filesToUpload = this.docFileList.filter(document => document.isExistingFile == false);
    this.vendorDetails.vendorRegistrationFiles.forEach(file => {
      let filteredFile = this.docFileList.find(document => document.attachmentId == file.id);
      if (filteredFile == null) {
        filesToDelete.push(file);
      }
    });

    if (filesToDelete != null && filesToDelete.length > 0) {
      this.deleteProfileAttachments(filesToDelete, filesToUpload);
    } else if (filesToUpload != null && filesToUpload.length > 0) {
      this.postProfileAttachments(filesToUpload);
    } else if (this.isProfileImageChanged) {
      this.uploadVendorOrgProfileImage(this.vendorDetails.vendorOrganisationId);
    } else {
      this._appUtil.showAlert(AlertType.Success, AppLiterals.profileDetailsUpdatedSuccessfully);
      this.dialogRef.close(true);
    }
  }

  deleteProfileAttachments(filesToDelete, filesToUpload) {
    var fileIdArray = filesToDelete.map(function (file) {
      return file.id;
    });

    this._appService.deleteVendorRegFiles(fileIdArray).subscribe((response: any) => {
      if (response.statusCode == APIResponse.Success) {
        if (filesToUpload != null && filesToUpload.length > 0) {
          this.postProfileAttachments(filesToUpload);
        } else if (this.isProfileImageChanged) {
          this.uploadVendorOrgProfileImage(this.vendorDetails.vendorOrganisationId);
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
      this._appService.supportUseruploadUserRegFiles(attachment, UserType.Vendor, this.vendorDetails.vendorOrganisationId, this.currentUser.id).subscribe((response: any) => {
        if (response.statusCode == APIResponse.Success) {
          successfileUpload = successfileUpload + 1;
          if (successfileUpload == filesToUpload.length) {
            if (this.isProfileImageChanged) {
              this.uploadVendorOrgProfileImage(this.vendorDetails.vendorOrganisationId);
            } else {
              this._appUtil.showAlert(AlertType.Success, AppLiterals.profileDetailsUpdatedSuccessfully);
              this.dialogRef.close(true);
            }
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

  uploadVendorOrgProfileImage(vendorOrgId) {
    this._appService.uploadVendorOrgProfileImage(this.profileImageFile, vendorOrgId).subscribe((response: any) => {
      if (response.statusCode == APIResponse.Success) {
        this._appUtil.showAlert(AlertType.Success, AppLiterals.profileDetailsUpdatedSuccessfully);
        this.dialogRef.close(true);
      } else {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
      }
    }, err => {
      this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
      console.log(err);
    });
  }

}


@Component({
  selector: 'contact-info-dialog',
  templateUrl: 'contact-info-dialog.html',
})
export class ContactInfoDialog {
  vendorDetails: any;
  contactInfoEditform: FormGroup;
  cityProvinceList: CityProvince[];
  selectedCityProvince: CityProvince;
  currentUser: any;

  constructor(
    private _formBuilder: FormBuilder,
    private _appService: AppService,
    private _appUtil: AppUtilService,
    public dialogRef: MatDialogRef<ContactInfoDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {
    this.vendorDetails = data.userData;
    this.currentUser = data.currentUser;
    this.cityProvinceList = data.cityProvinceList;

    this.selectedCityProvince = this.cityProvinceList.find(cityProvince => cityProvince.city == this.vendorDetails.city)

    if (this.selectedCityProvince == null) {
      this.selectedCityProvince = new CityProvince();
    }
    this.contactInfoEditform = this._formBuilder.group({
      streetAddr: [this.vendorDetails.address, Validators.required],
      province: [this.selectedCityProvince.province, Validators.required],
      city: [this.selectedCityProvince, Validators.required],
      postalCode: [this.vendorDetails.postalCode, [Validators.required, Validators.pattern('[a-zA-Z0-9].{5,5}$')]],
      phone: [this.vendorDetails.phoneNumber, Validators.required],
      email: [this.vendorDetails.email, [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)]],
      fax: [this.vendorDetails.faxNumber],
      website: [this.vendorDetails.website],
      contactPer: [this.vendorDetails.contactPerson, Validators.required],
      personPhone: [this.vendorDetails.contactPersonPhone, [Validators.pattern('^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$')]],
      personEmail: [this.vendorDetails.contactPersonEmail, [Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)]],
    });
  }


  updateContactDetails() {
    let formValue = this.contactInfoEditform.value;
    let updatedContactDetails = {
      'vendorOrganisationId': this.vendorDetails.vendorOrganisationId,
      'legalName': 'NA',
      'address': formValue.streetAddr,
      'province': this.selectedCityProvince.province,
      'city': this.selectedCityProvince.id,
      'postalCode': formValue.postalCode,
      'phoneNumber': formValue.phone,
      'email': formValue.email,
      'faxNumber': formValue.fax,
      'website': formValue.website,
      'contactPerson': formValue.contactPer,
      'contactPersonPhone': formValue.personPhone,
      'contactPersonEmail': formValue.personEmail,
      'modifiedByUserId': this.currentUser.userId
    };

    this._appService.updateVendorProfileContactDetails(updatedContactDetails).subscribe((response) => {
      if (response.statusCode == APIResponse.Success) {
        this._appUtil.showAlert(AlertType.Success, AppLiterals.profileDetailsUpdatedSuccessfully);
        this.dialogRef.close(updatedContactDetails);
      } else {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.unableToUpdateVendorProfile);
      }
    }, err => {
      this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
    });
  }

  cityNameUpdated(selectedCity) {
    this.selectedCityProvince = selectedCity
    this.contactInfoEditform.get('province').setValue(selectedCity.province);
  }
}



@Component({
  selector: 'insurance-info-dialog',
  templateUrl: 'insurance-info-dialog.html',
})

export class InsuranceInfoDialog {
  vendorDetails: any;
  insuranceInfoEditform: FormGroup;
  isInsured = false;

  isBonded = false;
  isWsIBEnabled = false;

  constructor(
    private _formBuilder: FormBuilder,
    private _appService: AppService,
    private _appUtil: AppUtilService,
    public dialogRef: MatDialogRef<InsuranceInfoDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {
    this.vendorDetails = Object.assign({}, data.userData);

    if (this.vendorDetails.insureDetails.insurance == true) {
      this.isInsured = true;
    }

    if (this.vendorDetails.insureDetails.insuranceBonded == '1') {
      this.isBonded = true;
    }

    if (this.vendorDetails.insureDetails.insuranceNumber != null && this.vendorDetails.insureDetails.insuranceNumber != '') {
      this.isWsIBEnabled = true;
    }

    this.insuranceInfoEditform = this._formBuilder.group({
      insured: [this.isInsured],
      insuranceCompany: [{
        value: this.vendorDetails.insureDetails.insuranceCompany,
        disabled: !this.isInsured
      }],
      liability: [{
        value: this.vendorDetails.insureDetails.insuranceLiability,
        disabled: !this.isInsured
      }],
      expiryDate: [{
        value: moment(this.vendorDetails.insureDetails.insurancePolicyExpiryDate),
        disabled: !this.isInsured
      }],
      bonded: [this.isBonded],
      wsib: [this.isWsIBEnabled],
      wsibId: [{
        value: this.vendorDetails.insureDetails.insuranceNumber,
        disabled: !this.isWsIBEnabled
      }],
      services: [this.vendorDetails.services.toString()],
      lisences: [this.vendorDetails.licenses.toString()],
      memberships: [this.vendorDetails.memberships.toString()],
      products: [this.vendorDetails.products.toString()],
      brands: [this.vendorDetails.brands.toString()],
    });

  }


  manageInsurance($event: any) {
    this.isInsured = $event.checked;
    if ($event.checked == true) {
      this.insuranceInfoEditform.get('insuranceCompany').enable();
      this.insuranceInfoEditform.get('liability').enable();
      this.insuranceInfoEditform.get('expiryDate').enable();
    } else {
      this.insuranceInfoEditform.get('insuranceCompany').disable();
      this.insuranceInfoEditform.get('liability').disable();
      this.insuranceInfoEditform.get('expiryDate').disable();

      this.insuranceInfoEditform.get('insuranceCompany').setValue("");
      this.insuranceInfoEditform.get('liability').setValue("");
      this.insuranceInfoEditform.get('expiryDate').setValue("");
    }
  }

  wsibChanged($event: any) {
    this.isWsIBEnabled = $event.checked;
    if ($event.checked == true) {
      this.insuranceInfoEditform.get('wsibId').enable();
    } else {
      this.insuranceInfoEditform.get('wsibId').disable();
    }
  }

  bondChanged($event: any) {
    this.isBonded = $event.checked;
  }

  updateInsuranceServiceDetails() {
    debugger;
    var insurance = 0;
    var bonded = 0;
    var wsib = 0;

    if (this.isInsured) {
      insurance = 1;
    }

    if (this.isBonded) {
      bonded = 1;
    }

    if (this.isWsIBEnabled) {
      wsib = 1;
    }


    let formValue = this.insuranceInfoEditform.value;
    var insuranceExpiry = '';
    if (formValue.expiryDate != null) {
      insuranceExpiry = moment(formValue.expiryDate).format(AppDateFormat.ServiceFormat);
    }


    let InsuranceDetails = {
      'vendorOrganisationId': this.vendorDetails.vendorOrganisationId,
      'services': formValue.services,
      'brands': formValue.brands,
      'products': formValue.products,
      'licenses': formValue.lisences,
      'memberships': formValue.memberships,
      'insurance': {
        'insuranceId': this.vendorDetails.insureDetails.insuranceId,
        'insuranceAvailability': insurance,
        'insuranceBonded': bonded,
        'insuranceCompany': formValue.insuranceCompany,
        'insuranceLiability': formValue.liability,
        'insuranceNumber': formValue.wsibId,
        'insurancePolicyExpiryDate': insuranceExpiry
      }
    };

    this._appService.updateVendorOtherDetails(InsuranceDetails).subscribe((response) => {
      if (response.statusCode == APIResponse.Success) {
        this._appUtil.showAlert(AlertType.Success, AppLiterals.profileDetailsUpdatedSuccessfully);
        this.dialogRef.close(true);
      } else {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.unableToUpdateVendorProfile);
      }
    }, err => {
      this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
    });
  }
}






@Component({
  selector: 'portfolio-dialog',
  templateUrl: 'portfolio-dialog.html',
  animations: fuseAnimations

})
export class PortfolioDialog {
  portfolioForm: FormGroup;
  imageFileData = [];
  docsFileData = [];

  docFileList: any[] = [];
  currentuser: any;
  isEditMode = false;
  portfolioData: Portfolio;
  cityNames = [];

  constructor(
    private _formBuilder: FormBuilder,
    private _appUtil: AppUtilService,
    private _appService: AppService,
    public dialogRef: MatDialogRef<PortfolioDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {
    this.currentuser = data.userData;
    this.cityNames = data.cityList.sort((a, b) => a.localeCompare(b));
    if (data.formData) {
      this.portfolioData = data.formData;
      this.isEditMode = true;
      this.portfolioForm = this._formBuilder.group({
        projectName: new FormControl(this.portfolioData.projectName),
        city: new FormControl(this.portfolioData.city),
        client: new FormControl(this.portfolioData.clientName),
        description: new FormControl(this.portfolioData.description,),
        duration: new FormControl(this.portfolioData.duration, [Validators.required, Validators.pattern('^[+-]?([0-9]*[.])?[0-9]+$')]),
        projDate: new FormControl(this.portfolioData.date),
        cost: new FormControl(this.portfolioData.cost, [Validators.pattern('^-?[0-9]\\d*(\\.\\d{1,2})?$')]),
        images: new FormControl(),
        supportDocs: new FormControl()
      });

      this.docFileList = [];
      for (let document of this.portfolioData.portfolioFiles) {
        let file = {
          "name": document.fileName,
          "formatedSize": document.fileSize,
          "isExistingFile": true,
          "attachmentId": document.id
        }
        this.docFileList.push(file);
      }

    } else {
      this.portfolioForm = this._formBuilder.group({
        projectName: [''],
        city: [''],
        client: [''],
        description: [''],
        duration: ['', [Validators.required, Validators.pattern('^[+-]?([0-9]*[.])?[0-9]+$')]],
        projDate: [''],
        cost: ['', [Validators.pattern('^-?[0-9]\\d*(\\.\\d{1,2})?$')]],
        images: [''],
        supportDocs: ['']
      });
    }
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
    } else {
      this._appUtil.showAlert(AlertType.Error, AppLiterals.FilesizeError5MB);
    }
  }

  submitPortfolio() {
    let formValue = this.portfolioForm.value;
    let projectDate = moment(formValue.projDate).format(AppDateFormat.ServiceFormat);

    let portfolioDetails = {
      "city": formValue.city,
      "clientName": formValue.client,
      "cost": formValue.cost,
      "date": projectDate,
      "description": formValue.description,
      "duration": formValue.duration,
      "projectName": formValue.projectName,
      "vendorOrganisationId": this.currentuser.vendorOrganisationId
    }
    if (this.isEditMode) {
      portfolioDetails['id'] = this.portfolioData.id;
      this._appService.updateVendorPortfolio(portfolioDetails).subscribe((response) => {
        if (response.statusCode == APIResponse.Success) {
          if (this.docFileList.length > 0) {
            this.updatePortfolioDocuments(this.portfolioData.id);
          } else {
            this._appUtil.showAlert(AlertType.Success, AppLiterals.vendorPortfolioCreationSuccessful);
            this.dialogRef.close(portfolioDetails);
          }
        } else {
          this._appUtil.showAlert(AlertType.Error, AppLiterals.unableToUpdatePortfolio);
        }
      }, err => {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
      });
    } else {
      this._appService.vendorCreatePortfolio(portfolioDetails).subscribe((response) => {
        if (response.statusCode == APIResponse.Success) {
          if (this.docFileList.length > 0) {
            this.postPortfolioAttachments(this.docFileList, response.portfolioId);
          } else {
            this._appUtil.showAlert(AlertType.Success, AppLiterals.vendorPortfolioCreationSuccessful);
            this.dialogRef.close(portfolioDetails);
          }
        } else {
          this._appUtil.showAlert(AlertType.Error, AppLiterals.unableToCreatePortfolio);
        }
      }, err => {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
      });
    }
  }

  updatePortfolioDocuments(portfolioId) {
    var filesToDelete = [];
    var filesToUpload = this.docFileList.filter(document => document.isExistingFile == false);
    this.portfolioData.portfolioFiles.forEach(file => {
      let filteredFile = this.docFileList.find(document => document.attachmentId == file.id);
      if (filteredFile == null) {
        filesToDelete.push(file);
      }
    });

    if (filesToDelete != null && filesToDelete.length > 0) {
      this.deletePortfolioAttachments(filesToDelete);
    }

    if (filesToUpload != null && filesToUpload.length > 0) {
      this.postPortfolioAttachments(filesToUpload, portfolioId);
    } else {
      this._appUtil.showAlert(AlertType.Success, AppLiterals.projectUpdationSuccessfulMessage);
      this.dialogRef.close(true);
    }
  }

  deletePortfolioAttachments(filesToDelete) {
    var fileIdArray = filesToDelete.map(function (file) {
      return file.id;
    });
    this._appService.deletePortfolioFiles(fileIdArray).subscribe((response: any) => {
      if (response.statusCode == APIResponse.Success) {
        this._appUtil.showAlert(AlertType.Success, AppLiterals.projectUpdationSuccessfulMessage);
      } else {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
      }
    }, err => {
      this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
    });
  }

  postPortfolioAttachments(filesToUpload, portfolioId) {
    let successfileUpload = 0;
    filesToUpload.forEach(attachment => {
      this._appService.uploadFileForVendorPortfolio(attachment, portfolioId).subscribe((response: any) => {
        if (response.statusCode == APIResponse.Success) {
          successfileUpload = successfileUpload + 1;
          if (successfileUpload == filesToUpload.length) {
            this._appUtil.showAlert(AlertType.Success, AppLiterals.vendorPortfolioCreationSuccessful);
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

  savePortfolio() {
    console.log(this.portfolioForm.value);
  }
}
