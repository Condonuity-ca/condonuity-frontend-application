import { Component, OnDestroy, OnInit, ViewEncapsulation, ElementRef, ViewChild } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators, FormControl, FormArray } from '@angular/forms';
import { fuseAnimations } from '@condonuity/animations';
import { VendorBrowserService } from './vendor-browser.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AppService } from '../services/app.service'
import { APIResponse, AppLiterals, AlertType, SearchBarPageIndex, UserType } from '../../utils/app-constants';
import { CommonFunctionsService } from '../../_services/common-functions.service';
import { AppUtilService } from '../../utils/app-util.service';
import { City } from '../profile/tabs/models/city.model';
import { Tag } from '../profile/tabs/models/tag.model';
import { isNumber } from 'util';
import { MenuService } from "../../layout/components/toolbar/menu.service";
import { AuthenticationService } from '../../_services/authentication.service';
import { SearchService } from 'app/layout/components/toolbar/service/search.service';
import { takeUntil, startWith, map } from 'rxjs/operators';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete';


@Component({
  selector: 'vendor-browser',
  templateUrl: './vendor-browser.component.html',
  styleUrls: ['./vendor-browser.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})

export class VendorBrowserComponent implements OnInit, OnDestroy {

  pageOfItems: Array<any>;

  vendorsList = [];
  actualVendorList = [];
  filteredVendors = [];

  filterForm: FormGroup;
  sortType: string;
  sortedList = [];

  vendorRatingData = []

  allTags: Tag[];
  cityNames: City[];
  disableClearFilterButton = true;

  lastAppliedFilter = 0;
  shouldSortReverse = false;

  currentUser: any;

  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];

  tagCtrl = new FormControl();
  selectedTags: Tag[] = [];
  filteredTags: Observable<Tag[]>;

  cityCtrl = new FormControl();
  selectedCities: City[] = [];
  filteredCities: Observable<City[]>;

  @ViewChild('tagInput', { static: false }) tagInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto', { static: false }) matAutocomplete: MatAutocomplete;

  @ViewChild('cityInput', { static: false }) cityInput: ElementRef<HTMLInputElement>;
  @ViewChild('cityAuto', { static: false }) cityMatAutocomplete: MatAutocomplete;


  // Private
  private _unsubscribeAll: Subject<any>;

  /**
   * Constructor
   *
   */
  constructor(
    private _authService: AuthenticationService,
    private _formBuilder: FormBuilder,
    private _vendorBrowserService: VendorBrowserService,
    private router: Router,
    private _appService: AppService,
    private _appUtil: AppUtilService,
    private _menuService: MenuService,
    private _searchService: SearchService
  ) {
    this._unsubscribeAll = new Subject();
    this._menuService.currentPageSearchBarSubject.next(SearchBarPageIndex.BROWSE_VENDORS);


    this._searchService.browseVendorsSearchResults.pipe(takeUntil(this._unsubscribeAll)).subscribe(vendorsList => {
      if (vendorsList != null) {
        this.vendorsList = vendorsList;
        this.processVendorList();
        this._searchService.browseVendorsSearchSubject.next(null);
      }
    });

    this._searchService.clearSearchForIndex.pipe(takeUntil(this._unsubscribeAll)).subscribe(searchIndex => {
      if (searchIndex != null && searchIndex == SearchBarPageIndex.BROWSE_VENDORS) {
        this.getVendorsList();
        this._searchService.clearSearchSubject.next(null);
      }
    });

    this.getProjectTags();
    this.getServiceCities();

    this._authService.currentUser.subscribe(userDetails => {
      this.currentUser = userDetails;
      this.getVendorsList();
    });
  }

  sortVendors(type) {

    if (this.lastAppliedFilter != type) {
      this.shouldSortReverse = false;
    }

    if (type == 1) {
      this.sortType = 'Nearest';
      this.sortedList.sort((a, b) => a.location - b.location);
    } else if (type == 2) {
      this.sortType = 'Highest Rating';
      if (!this.shouldSortReverse) {
        this.sortedList.sort((a, b) => b.rating - a.rating);
        this.shouldSortReverse = true;
      } else {
        this.sortedList.sort((a, b) => a.rating - b.rating);
        this.shouldSortReverse = false;
      }
    } else if (type == 3) {
      this.sortType = 'Alphabetical';
      if (!this.shouldSortReverse) {
        this.sortedList.sort((a, b) => a.companyName.localeCompare(b.companyName));
        this.shouldSortReverse = true;
      } else {
        this.sortedList.sort((a, b) => b.companyName.localeCompare(a.companyName));
        this.shouldSortReverse = false;
      }
    } else if (type == 4) {
      this.sortType = 'Preferred';

      if (!this.shouldSortReverse) {
        this.sortedList.sort((a, b) => a.isPreferred.localeCompare(b.isPreferred));
        this.shouldSortReverse = true;
      } else {
        this.sortedList.sort((a, b) => b.isPreferred.localeCompare(a.isPreferred));
        this.shouldSortReverse = false;
      }
    }
    this.lastAppliedFilter = type;

    this.sortedList = [...this.sortedList];

    this.rateValues();
  }


  filterSearch() {
    debugger;
    let value = this.filterForm.value.tagWords;
    let locationValue = this.filterForm.value.servicedCities;
    if (value != '' && locationValue != '') {
      this.sortedList = this.vendorsList.filter(record => record.location.find(city => city.toLowerCase() == locationValue.toLowerCase()));
      this.sortedList = this.sortedList.filter(tagValue => tagValue.tags.find(tag => tag.toLowerCase() == value.toLowerCase()));
    } else if (locationValue) {
      this.sortedList = this.vendorsList.filter(function (vendor) {
        return vendor.serviceCityArray.filter(function (city) {
          return this.selectedCities.some(function (selectedCity) {
            return selectedCity.cityName.toLowerCase() == city.toLowerCase();
          });
        });
      });
    } else if (value) {
      this.sortedList = this.vendorsList.filter(tagValue => tagValue.tags.find(tag => tag.toLowerCase() == value.toLowerCase()));
    } else {
      this.sortedList = this.vendorsList;
    }

    // this.rateValues();
  }

  rateValues() {
    this.vendorRatingData = [];

    this.sortedList.map(vendor => {
      vendor.ratingArray = this.ratingConverter(vendor.rating);
      return vendor;
    });

    // this.sortedList.forEach(element => {
    //   this.vendorRatingData.push(this.ratingConverter(element.rating));
    // });
  }

  ratingConverter(value) {
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


  viewVendor(vendor) {
    let vendorData = { id: vendor.vendorOrganisationId, name: vendor.companyName, isFavortieVendor: vendor.isPreferred, vendorUnclaimedProfileId: vendor.vendorProfileId };
    this._vendorBrowserService.setVendorData(vendorData);
    this.router.navigate(['/browseVendors/view']);
  }

  /**
   * On init
   */
  ngOnInit(): void {
    this.filterForm = this._formBuilder.group({
      tags: [''],
      servicedCities: ['']
    });
  }


  getVendorsList() {

    if (this.currentUser.userType == UserType.Client) {
      this._appService.getVendorOrganizationListForClient(this.currentUser.currentOrgId).subscribe((response) => {
        if (response.statusCode == APIResponse.Success) {
          this.vendorsList = response.vendorOrgs;
          this.processVendorList();
        } else {
          this._appUtil.showAlert(AlertType.Error, AppLiterals.unableToLoadVendorListMessage);
        }
      }, err => {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
      });
    } else {
      this._appService.getVendorOrganizationList().subscribe((response) => {
        if (response.statusCode == APIResponse.Success) {
          this.vendorsList = response.vendorOrgs;
          this.processVendorList();
        } else {
          this._appUtil.showAlert(AlertType.Error, AppLiterals.unableToLoadVendorListMessage);
        }
      }, err => {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
      });
    }
  }


  processVendorList() {
    this.vendorsList = this.vendorsList.map(vendor => {

      if (vendor.city != null && vendor.city != '') {
        vendor.location = vendor.city.split(',');
      } else {
        vendor.location = ['NA']
      }

      vendor.isPreferred = vendor.isPreferred;

      if (vendor.serviceCities != null && vendor.serviceCities != '') {
        vendor.serviceCityArray = vendor.serviceCities.split(',');
      } else {
        vendor.serviceCityArray = ['NA']
      }


      if (vendor.vendorTags != null && vendor.vendorTags != '') {
        vendor.tags = vendor.vendorTags.split(',');
      } else if (vendor.expertiseCategory != null && vendor.expertiseCategory != '') {
        vendor.tags = vendor.expertiseCategory.split(',');
      } else {
        vendor.tags = ['NA']
      }


      if (!isNumber(vendor.rating)) {
        vendor.rating = 0;
      }

      vendor.rating = (Math.round(vendor.rating * 10) / 10).toFixed(1);

      vendor.preferred = false;
      return vendor;
    });
    this.actualVendorList = this.vendorsList;
    this.sortedList = this.vendorsList;
    this.sortVendors(3);
  }

  onChangePage(pageOfItems: Array<any>) {
    this.pageOfItems = pageOfItems;
  }

  getProjectTags() {
    this._appService.getProjectTagList().subscribe((response) => {
      if (response.statusCode == APIResponse.Success) {
        this.allTags = response.tags;
        this.allTags.sort((a, b) => a.tagName.localeCompare(b.tagName));
        this.filteredTags = this.tagCtrl.valueChanges.pipe(
          startWith(null),
          map((data: Tag | null) => data ? this._filter(data) : this.allTags.slice()));
      } else {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
      }
    }, err => {
      this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
    });
  }

  getServiceCities() {
    this._appService.getSupportedCitiesList().subscribe((response) => {
      if (response.statusCode == APIResponse.Success) {
        this.cityNames = response.serviceCities;
        this.cityNames.sort((a, b) => a.cityName.localeCompare(b.cityName));
        this.filteredCities = this.cityCtrl.valueChanges.pipe(
          startWith(null),
          map((data: City | null) => data ? this._cityFilter(data) : this.cityNames.slice()));
      } else {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
      }
    }, err => {
      this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
    });
  }


  //********************* Filter Section Begins *****************************/

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
    this.filterForm.get('tags').setValue(this.selectedTags);

    this.tagInput.nativeElement.blur();
    this.tagInput.nativeElement.focus();

  }

  remove(data: Tag): void {
    const index = this.selectedTags.indexOf(data);
    if (index >= 0) {
      this.selectedTags.splice(index, 1);
      this.allTags.push(data);
      this.allTags.sort((a, b) => a.tagName.localeCompare(b.tagName));
      this.tagCtrl.setValue(null);
      this.filterForm.get('tags').setValue(this.selectedTags);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {

    this.selectedTags.push(event.option.value);
    this.tagInput.nativeElement.value = '';
    this.tagCtrl.setValue(null);
    this.tagInput.nativeElement.blur();
    this.tagInput.nativeElement.focus();

  }


  //*************** City search starts ****************************

  @ViewChild('cityAuto', { static: false }) cityAutocomplete: MatAutocomplete;

  private _cityFilter(value): City[] {
    let return_value: any;
    if (this.cityNames.includes(value)) {
      return_value = this.cityNames.filter((data: City) => data.cityName.toLowerCase().indexOf(value) !== -1);
      this.selectedCityHandle(value);
    } else {
      const filterValue = value.toLowerCase();
      return_value = this.cityNames.filter((data: City) => data.cityName.toLowerCase().indexOf(filterValue) !== -1);
    }
    return return_value;
  }

  private selectedCityHandle(value: City) {
    let index = this.cityNames.indexOf(value)
    this.cityNames.splice(index, 1);
    this.cityNames.sort((a, b) => a.cityName.localeCompare(b.cityName));
    this.filterForm.get('servicedCities').setValue(this.selectedCities);
    this.cityInput.nativeElement.blur();
    this.cityInput.nativeElement.focus();

  }

  removeCity(data: City): void {
    const index = this.selectedCities.indexOf(data);
    if (index >= 0) {
      this.selectedCities.splice(index, 1);
      this.cityNames.push(data);
      this.cityNames.sort((a, b) => a.cityName.localeCompare(b.cityName));
      this.cityCtrl.setValue(null);
      this.filterForm.get('servicedCities').setValue(this.selectedCities);
    }
  }


  selectCity(event: MatAutocompleteSelectedEvent): void {
    this.selectedCities.push(event.option.value);
    this.cityInput.nativeElement.value = '';
    this.cityCtrl.setValue(null);
    this.cityInput.nativeElement.blur();
    this.cityInput.nativeElement.focus();
  }



  filterVendorList() {
    var filteredTagVendors = [];
    var filteredCityVendors = [];
    var shouldApplyCityFilter = false;

    var cityIdList = this.selectedCities.map(function (city) {
      return city.cityName;
    });


    if (this.selectedTags != null) {
      this.selectedTags.forEach(tag => {
        this.actualVendorList.forEach(vendor => {
          if (vendor.tags.indexOf(tag.tagName) > -1) {
            filteredTagVendors.push(vendor);
          }
        });
      });
    }

    if (cityIdList != null) {
      shouldApplyCityFilter = true;
      this.actualVendorList.forEach(vendor => {
        var result = vendor.serviceCityArray.filter(city => this.selectedCities.find(myCity => city.toLowerCase() === myCity.cityName.toLowerCase()));
        if (result != null && result.length > 0) {
          filteredCityVendors.push(vendor);
        }
      });
    }


    if (this.selectedTags.length > 0) {

      if (filteredTagVendors.length > 0) {
        this.filteredVendors = filteredTagVendors;
      } else {
        this.filteredVendors = [];
      }

      if (this.filteredVendors.length > 0 && filteredCityVendors.length > 0) {
        this.filteredVendors = this.filteredVendors.filter(vendor => filteredCityVendors.some(cityVendor => vendor.vendorOrganisationId === cityVendor.vendorOrganisationId));
      } else if (cityIdList.length > 0 && shouldApplyCityFilter == true) {
        this.filteredVendors = [];
      }

    } else if (cityIdList.length > 0 && filteredCityVendors.length > 0 && this.selectedTags.length == 0) {
      this.filteredVendors = filteredCityVendors;
    }
    this.sortedList = this.filteredVendors;

    if (cityIdList.length == 0 && this.selectedTags.length == 0) {
      this.sortedList = this.actualVendorList;
      this.disableClearFilterButton = true;
    } else {
      this.disableClearFilterButton = false;
    }
    this.sortedList = this.sortedList.filter((el, i, a) => i === a.indexOf(el));
  }

  onClickclearFilter() {
    this.sortedList = this.actualVendorList;
    this.disableClearFilterButton = true;

    this.selectedTags.forEach(tag => {
      this.allTags.push(tag);
      this.tagCtrl.setValue(null);
    });
    this.allTags.sort((a, b) => a.tagName.localeCompare(b.tagName));

    this.selectedCities.forEach(city => {
      this.cityNames.push(city);
      this.cityCtrl.setValue(null);
    });
    this.cityNames.sort((a, b) => a.cityName.localeCompare(b.cityName));

    this.selectedTags = [];
    this.selectedCities = [];

    this.filterForm.controls['tags'].setValue([]);
    this.filterForm.controls['servicedCities'].setValue([]);
  }


  updateFavoriteVendor(event, status, vendor) {
    event.stopPropagation();
    let preferredStatus = {
      "favouriteOrgId": vendor.vendorOrganisationId,
      "wisherOrgId": this.currentUser.currentOrgId,
      "wisherUserId": this.currentUser.clientId,
      "interestStatus": status
    }

    this._appService.updatePreferredVendorStatus(preferredStatus).subscribe((response) => {
      if (response.statusCode == APIResponse.Success) {
        let selectedVendor = this.vendorsList[event.row];
        if (status == 2) {
          vendor.isPreferred = 'false';
        } else {
          vendor.isPreferred = 'true';
        }

        this.vendorsList[event.row] = selectedVendor;
        this.vendorsList = [...this.vendorsList];
      } else {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
      }
    }, err => {
      this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
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
