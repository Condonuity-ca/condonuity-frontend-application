import { Component, OnDestroy, OnInit, ViewEncapsulation, Inject, Input, ViewChild, ElementRef } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { takeUntil, startWith, map } from 'rxjs/operators';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators, FormControl, FormArray } from '@angular/forms';
// import { FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators,FormControl,FormArray } from '@angular/forms';
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete';
import { fuseAnimations } from '@condonuity/animations';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import { AppService } from '../../../services/app.service';
import { APIResponse, AlertType, AppLiterals, SearchBarPageIndex } from 'app/utils/app-constants';
import { AppUtilService } from '../../../../utils/app-util.service'
import { AuthenticationService } from '../../../../../app/_services/authentication.service';
import { CondoBrowserService } from '../../../condo-browser/condo-browser.service';
import { MenuService } from '../../../../layout/components/toolbar/menu.service';
import { Aminity } from '../models/aminity.model';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import * as moment from 'moment';
import { ConfirmationDialogComponent, DialogType } from 'app/main/Shared/confirmation-dialog/confirmation-dialog.component';
import { VendorDetails } from 'app/main/account/models/vendor-details.model';
import { Review } from 'app/main/profile/tabs/models/review.model';


export interface DialogData {
    userData;
}

@Component({
    selector: 'reviews',
    templateUrl: './reviews.component.html',
    styleUrls: ['./reviews.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})

export class ReviewsComponent implements OnInit, OnDestroy {

    pageOfItems: Array<any> = [];

    vendorUserDetailform: FormGroup;
    vendorsList = [];
    selectedVendors: any[] = [];
    filteredVendors: Observable<any[]>;
    userDetails: VendorDetails[] = [];

    visible = true;
    selectable = true;
    removable = true;
    addOnBlur = true;
    separatorKeysCodes: number[] = [ENTER, COMMA];

    vendorCtrl = new FormControl();
    isInputDisabled = false;

    currentUser: any;
    selectedOrganization: any;

    reviewData: Review[];
    ratingSortType: string;
    vendorRating;
    vendorDetails;


    reviewList = [];
    sortedList = [];
    // reviewRatingData = [];

    // proRatingData = [];
    // accRatingData = [];
    // qaRatingData = [];
    // resRatingData = [];

    // proRatingValue = [];
    // accRatingValue = [];
    // qaRatingValue = [];
    // resRatingValue = [];

    lastAppliedFilter = '';
    shouldSortReverse = false;
    isDataAvailableToLoad = false;

    @ViewChild('vendorInput', { static: false }) vendorInput: ElementRef<HTMLInputElement>;

    private _unsubscribeAll: Subject<any>;

    constructor(
        private _appService: AppService,
        private _formBuilder: FormBuilder,
        public dialog: MatDialog,
        private _authService: AuthenticationService,
        private _menuService: MenuService,
        private _appUtil: AppUtilService
    ) {
        this._unsubscribeAll = new Subject();
        this._menuService.currentPageSearchBarSubject.next(SearchBarPageIndex.OTHERS);

        this.vendorUserDetailform = this._formBuilder.group({
            vendors: [''],
            cityChips: []
        });

        this._authService.currentUser.pipe(takeUntil(this._unsubscribeAll)).subscribe(user => {
            this.currentUser = user;
        });
    }

    ngOnInit(): void {
        this.getVendorList();
    }

    getVendorList() {
        this._appService.getAppVendorOrgList().subscribe((response) => {
            if (response.statusCode == APIResponse.Success) {
                this.vendorsList = response.vendorOrgs;

                this.vendorsList.sort((a, b) => a.companyName.localeCompare(b.companyName));
                this.filteredVendors = this.vendorCtrl.valueChanges.pipe(
                    startWith(null),
                    map((data: any | null) => data ? this._vendorFilter(data) : this.vendorsList.slice()));
            } else {
                this._appUtil.showAlert(AlertType.Error, AppLiterals.unableToLoadVendorListMessage);
            }
        }, err => {
            this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
        });
    }

    //**************  Vendor Filter Starts *********************/
    private _vendorFilter(value): any[] {
        let return_value: any;
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
        this.vendorUserDetailform.get('vendors').setValue(this.selectedVendors);
        this.vendorInput.nativeElement.blur();
        this.vendorInput.nativeElement.focus();
    }

    removeVendor(data: any): void {
        const index = this.selectedVendors.indexOf(data);
        if (index >= 0) {
            this.isInputDisabled = false;
            this.selectedVendors.splice(index, 1);
            this.vendorsList.push(data);
            this.vendorsList.sort((a, b) => a.companyName.localeCompare(b.companyName));
            this.vendorCtrl.setValue(null);
            this.vendorUserDetailform.get('vendors').setValue(this.selectedVendors);
            this.userDetails = [];
        }
    }


    selectVendor(event: MatAutocompleteSelectedEvent): void {
        this.isInputDisabled = true;
        this.selectedVendors.push(event.option.value);
        this.vendorInput.nativeElement.value = '';
        this.vendorCtrl.setValue(null);
        this.vendorInput.nativeElement.blur();
        this.vendorInput.nativeElement.focus();
        this.selectedOrganization = event.option.value;
        this.getMyReviews(this.selectedOrganization.vendorOrganisationId);
    }


    getMyReviews(OrgId) {
        this._appService.getVendorAllReviews(OrgId).subscribe((response) => {
            if (response.statusCode == APIResponse.Success) {
                this.vendorDetails = response.vendorOrganisation;
                this.reviewList = this.vendorDetails.reviewsRatings;
                this.sortReviews('0');
                this.rateValues();
            } else {
                this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
            }
        }, err => {
            this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
        });
    }


    sortReviews(type: string) {

        if (this.lastAppliedFilter != type) {
            this.shouldSortReverse = false;
        }

        if (type == '1' || type == '0') {
            if (!this.shouldSortReverse) {
                this.reviewList.sort((a, b) => { return <any>new Date(a.createdAt) - <any>new Date(b.createdAt) });
                this.shouldSortReverse = true;
            } else {
                this.reviewList.sort((a, b) => { return <any>new Date(b.createdAt) - <any>new Date(a.createdAt) });
                this.shouldSortReverse = false;
            }

        } else if (type == '2') {
            if (!this.shouldSortReverse) {
                this.reviewList.sort((a, b) => a.rating - b.rating)
                this.shouldSortReverse = true;
            } else {
                this.reviewList.sort((b, a) => a.rating - b.rating)
                this.shouldSortReverse = false;
            }
        }
        this.ratingSortType = type;
        this.lastAppliedFilter = type;
        if (type != '0') {
            this.sortedList = [...this.reviewList];
        }
    }


    rateValues() {
        this.reviewList.map(review => {

            if (Number.isNaN(review.rating)) {
                review.rating = 'NA';
            } else {
                review.rating = (Math.round(review.rating * 10) / 10).toFixed(1);
            }

            review.reviewRatingData = this.ratingConverter(review.rating)
            let categoryWiseRating = review.categoryRating;

            categoryWiseRating.forEach(catRating => {
                if (catRating.ratingCategory == "1") {
                    review.resRatingData = this.ratingConverter(catRating.rating);
                    review.resRatingValue = catRating.rating;
                } else if (catRating.ratingCategory == "2") {
                    review.proRatingData = this.ratingConverter(catRating.rating);
                    review.proRatingValue = catRating.rating;
                } else if (catRating.ratingCategory == "3") {
                    review.accRatingData = this.ratingConverter(catRating.rating);
                    review.accRatingValue = catRating.rating;
                } else if (catRating.ratingCategory == "4") {
                    review.qaRatingData = this.ratingConverter(catRating.rating);
                    review.qaRatingValue = catRating.rating;
                }
                return review;
            });
        });

        this.sortedList = this.reviewList;
    }



    ratingConverter(value) {
        let rating = [];
        for (let i = .5; i <= 5; i += .5) {
            if (i <= value) {
                if (i % 1 !== 0) {
                    if (i == value) {
                        rating.push('halfStar');
                    }
                    else {
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

    onChangePage(pageOfItems: Array<any>) {
        this.pageOfItems = pageOfItems;
    }


    updateReview(review, status) {

        let confirmationMessage = '';

        if (status == 1) {
            confirmationMessage = AppLiterals.UnHideReviewConfirmation;
        } else {
            confirmationMessage = AppLiterals.HideReviewConfirmation;
        }

        const userNewRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '550px', data: {
                type: DialogType.TwoButtonDialog,
                title: "PLEASE CONFIRM",
                message: confirmationMessage,
                yesButtonTitle: "YES",
                noButtonTitle: "NO"
            }
        });
        userNewRef.afterClosed().subscribe(result => {
            if (result != undefined && result != '') {
                if (result == 'true') {
                    this.confirmReviewStatus(review, status);
                } else {
                    console.log("No tapped");
                }
            }
        });
    }

    confirmReviewStatus(review, status) {

        let updatedReviewDetails = {
            "reviewRatingId": review.id,
            "activeStatus": status,
            "supportUserId": this.currentUser.id
        }

        this._appService.hideUserReview(updatedReviewDetails).subscribe((response) => {
            if (response.statusCode == APIResponse.Success) {
                this._appUtil.showAlert(AlertType.Success, AppLiterals.HideReviewSuccessful);
                this.getMyReviews(this.selectedOrganization.vendorOrganisationId);
            } else {
                this._appUtil.showAlert(AlertType.Error, AppLiterals.HideReviewFailure);
            }
        }, err => {
            this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
        });

    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
}




