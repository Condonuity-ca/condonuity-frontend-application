import { Component, OnDestroy, OnInit, ViewEncapsulation, ElementRef, ViewChild } from '@angular/core';
import { Subject, Observable, from } from 'rxjs';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators, FormControl, FormArray } from '@angular/forms';
import { fuseAnimations } from '@condonuity/animations';
import { Router, ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { VendorBrowserService } from '../vendor-browser/vendor-browser.service';
import { SearchBarPageIndex } from '../../utils/app-constants';
import { MenuService } from "../../layout/components/toolbar/menu.service";
import { AuthenticationService } from "../../_services/authentication.service";
import { AppService } from "../services/app.service";
import { APIResponse, AppLiterals, AlertType } from "../../utils/app-constants";
import { AppUtilService } from "../../utils/app-util.service";
import { SearchService } from 'app/layout/components/toolbar/service/search.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'view-review',
  templateUrl: './view-review.component.html',
  styleUrls: ['./view-review.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})

export class ViewReviewComponent implements OnInit, OnDestroy {
  pageOfItems: Array<any> = [];

  currentUser: any;
  reviewList = [];
  sortedList = [];
  reviewRatingData = [];

  proRatingData = [];
  accRatingData = [];
  qaRatingData = [];
  resRatingData = [];

  proRatingValue = [];
  accRatingValue = [];
  qaRatingValue = [];
  resRatingValue = [];

  lastAppliedFilter = 0;
  shouldSortReverse = false;
  isDataAvailableToLoad = false;

  private _unsubscribeAll: Subject<any>;

  constructor(
    private _appUtil: AppUtilService,
    private _appService: AppService,
    private _authService: AuthenticationService,
    private _formBuilder: FormBuilder,
    private _menuService: MenuService,
    private router: Router,
    private _vendorBrowserService: VendorBrowserService,
    private _searchService: SearchService
  ) {
    this._unsubscribeAll = new Subject();

    this._menuService.currentPageSearchBarSubject.next(SearchBarPageIndex.REVIEWS);

    this._authService.currentUser.subscribe(userDetails => {
      this.currentUser = userDetails;
      this.getMyReviews(this.currentUser.clientId, this.currentUser.currentOrgId);
    });


    this._searchService.reviewsSearchResults.pipe(takeUntil(this._unsubscribeAll)).subscribe(reviewList => {
      if (reviewList != null) {
        this.processReviews(reviewList);
        this._searchService.reviewsSearchSubject.next(null);
      }
    });


    this._searchService.clearSearchForIndex.pipe(takeUntil(this._unsubscribeAll)).subscribe(searchIndex => {
      if (searchIndex != null && searchIndex == SearchBarPageIndex.REVIEWS) {
        this.getMyReviews(this.currentUser.clientId, this.currentUser.currentOrgId);
        this._searchService.clearSearchSubject.next(null);
      }
    });
  }

  sortReviews(type) {
    if (this.lastAppliedFilter != type) {
      this.shouldSortReverse = false;
    }

    if (type == 2) {
      if (!this.shouldSortReverse) {
        this.sortedList.sort((a, b) => a.rating - b.rating);
        this.shouldSortReverse = true;
      } else {
        this.sortedList.sort((a, b) => b.rating - a.rating);
        this.shouldSortReverse = false;
      }
    } else if (type == 3) {
      this.sortedList.sort((a, b) => a.companyName.localeCompare(b.companyName));
    } else {
      debugger;
      if (!this.shouldSortReverse) {
        this.sortedList.sort((a, b) => { return <any>new Date(b.reviewDateTime + ' UTC') - <any>new Date(a.reviewDateTime + ' UTC') });
        this.shouldSortReverse = true;
      } else {
        this.sortedList.sort((a, b) => { return <any>new Date(a.reviewDateTime + ' UTC') - <any>new Date(b.reviewDateTime + ' UTC') });
        this.shouldSortReverse = false;
      }
    }
    this.lastAppliedFilter = type;
    this.rateValues();
    this.sortedList = [...this.sortedList];
  }

  getMyReviews(clientId, OrgId) {
    this._appService.getClientMyReviews(clientId, OrgId).subscribe((response) => {
      if (response.statusCode == APIResponse.Success) {
        this.processReviews(response.reviews);
      } else {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
      }
    }, err => {
      this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
    });
  }


  processReviews(reviewList) {
    let reviews = reviewList;
    reviews = reviews.map(review => {
      let vendorLocation = '';

      if (review.vendorOrganisation.address != null) {
        vendorLocation = review.vendorOrganisation.address + ', ';
      }

      if (review.vendorOrganisation.city != null) {
        vendorLocation = vendorLocation + review.vendorOrganisation.city;
      }

      review.location = vendorLocation;

      let reviewDate = moment(review.reviewDate);
      if (reviewDate.isValid()) {
        review.reviewDate = moment(reviewDate).format('MM/DD/YYYY');
        review.reviewDateTime = moment(reviewDate).format('MM/DD/YYYY h:mm');
      } else {
        review.reviewDate = 'NA';
      }

      if (Number.isNaN(review.rating)) {
        review.rating = 'NA';
      } else {
        review.rating = (Math.round(review.rating * 10) / 10).toFixed(1);
        // review.rating.toFixed(1);
      }

      return review;
    });

    this.reviewList = reviews;
    this.sortedList = this.reviewList;
    this.sortReviews(1);
    this.isDataAvailableToLoad = true;
  }


  rateValues() {
    this.reviewRatingData = [];
    this.proRatingData = [];
    this.accRatingData = [];
    this.qaRatingData = [];
    this.resRatingData = [];

    this.proRatingValue = [];
    this.accRatingValue = [];
    this.qaRatingValue = [];
    this.resRatingValue = [];

    this.sortedList.forEach(element => {
      this.reviewRatingData.push(this.ratingConverter(element.rating));
      let categoryWiseRating = element.vendorCategoryRating;

      categoryWiseRating.forEach(catRating => {
        if (catRating.ratingCategory == "1") {
          this.resRatingData.push(this.ratingConverter(catRating.rating));
          this.resRatingValue.push(catRating.rating);
        } else if (catRating.ratingCategory == "2") {
          this.proRatingData.push(this.ratingConverter(catRating.rating));
          this.proRatingValue.push(catRating.rating);
        } else if (catRating.ratingCategory == "3") {
          this.accRatingData.push(this.ratingConverter(catRating.rating));
          this.accRatingValue.push(catRating.rating);
        } else if (catRating.ratingCategory == "4") {
          this.qaRatingData.push(this.ratingConverter(catRating.rating));
          this.qaRatingValue.push(catRating.rating);
        }
      })
    });
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

  viewReviewDetails(review) {
    let vendorData = { id: review.vendorOrganisation.vendorOrganisationId, name: review.vendorOrganisation.companyName }
    this._vendorBrowserService.setVendorData(vendorData);
    this._vendorBrowserService.setReviewData(review);
    this.router.navigate(['/myreview/view']);
  }

  ngOnInit(): void {
    this._menuService.currentPageSearchBarSubject.next(SearchBarPageIndex.REVIEWS);
  }

  onChangePage(pageOfItems: Array<any>) {
    this.pageOfItems = pageOfItems;
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
