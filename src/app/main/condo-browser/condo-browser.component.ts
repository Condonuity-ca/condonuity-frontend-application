import { Component, OnDestroy, OnInit, ViewEncapsulation, ElementRef, ViewChild } from '@angular/core';
import { Subject, Observable, from } from 'rxjs';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators, FormControl, FormArray } from '@angular/forms';
import { fuseAnimations } from '@condonuity/animations';
import { Router, ActivatedRoute } from '@angular/router';
import { CondoBrowserService } from './condo-browser.service';
import { AppService } from '../services/app.service';
import { APIResponse, AlertType, SearchBarPageIndex } from '../../utils/app-constants';
import { CommonFunctionsService } from '../../_services/common-functions.service';
import { AppUtilService } from '../../utils/app-util.service';
import { AppLiterals } from '../../utils/app-literals';
import { City } from '../profile/tabs/models/city.model';
import { MenuService } from "../../layout/components/toolbar/menu.service";
import { AuthenticationService } from '../../_services/authentication.service';
import { SearchService } from 'app/layout/components/toolbar/service/search.service';
import { takeUntil, startWith, map } from 'rxjs/operators';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete';


@Component({
  selector: 'condo-browser',
  templateUrl: './condo-browser.component.html',
  styleUrls: ['./condo-browser.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})


export class CondoBrowserComponent implements OnInit, OnDestroy {
  pageOfItems: Array<any> = [];

  filterForm: FormGroup;
  condoList = [];
  condoFilterList = [];
  actualCondoList = [];

  sortType: string;
  cityNames: City[];

  currentUser: any;

  private _unsubscribeAll: Subject<any>;
  filterSelectedCityIdList: [] = [];

  lastAppliedFilter = 0;
  shouldSortReverse = false;

  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];

  cityCtrl = new FormControl();
  selectedCities: City[] = [];
  filteredCities: Observable<City[]>;

  @ViewChild('cityInput', { static: false }) cityInput: ElementRef<HTMLInputElement>;
  @ViewChild('cityAuto', { static: false }) cityMatAutocomplete: MatAutocomplete;

  /**
   * Constructor
   *
   * @param {ProfileService} _profileService
   */
  constructor(
    private _authService: AuthenticationService,
    private _formBuilder: FormBuilder,
    private router: Router,
    private _condoBrowserService: CondoBrowserService,
    private _appService: AppService,
    private _appUtil: AppUtilService,
    private _menuService: MenuService,
    private _searchService: SearchService
  ) {
    this._unsubscribeAll = new Subject();
    this._menuService.currentPageSearchBarSubject.next(SearchBarPageIndex.BROWSE_CONDOS);

    this._searchService.browseCondosSearchResults.pipe(takeUntil(this._unsubscribeAll)).subscribe(condoList => {
      if (condoList != null) {
        this.condoList = condoList;
        this.condoList = this.condoList.map(condo => {
          condo.location = condo.city.split(',');
          return condo;
        });

        this.condoFilterList = this.condoList;
        this.actualCondoList = this.condoList;
        this.sortCondos(3);
        this._searchService.browseCondosSearchSubject.next(null);
      }
    });

    this._searchService.clearSearchForIndex.pipe(takeUntil(this._unsubscribeAll)).subscribe(searchIndex => {
      if (searchIndex != null && searchIndex == SearchBarPageIndex.BROWSE_CONDOS) {
        this.getCondoListForVendorOrg(this.currentUser.vendorOrganisationId);
        this._searchService.clearSearchSubject.next(null);
      }
    });
  }


  sortCondos(type) {
    this.condoFilterList.forEach(condo => {
      console.log(condo.registrationDate + '  ' + condo.organisationName);
    });

    if (this.lastAppliedFilter != type) {
      this.shouldSortReverse = false;
    }

    if (type == 2) {
      this.sortType = '# of Units';
      if (!this.shouldSortReverse) {
        this.condoFilterList.sort((a, b) => b.units - a.units);
        this.shouldSortReverse = true;
      } else {
        this.condoFilterList.sort((a, b) => a.units - b.units);
        this.shouldSortReverse = false;
      }
    } else if (type == 3) {
      this.sortType = 'Alphabetical';
      if (!this.shouldSortReverse) {
        this.condoFilterList.sort((a, b) => a.organisationName.localeCompare(b.organisationName));
        this.shouldSortReverse = true;
      } else {
        this.condoFilterList.sort((a, b) => b.organisationName.localeCompare(a.organisationName));
        this.shouldSortReverse = false;
      }
    } else if (type == 4) {
      this.sortType = 'Date of Registration';
      if (!this.shouldSortReverse) {
        this.condoFilterList.sort((a, b) => { return <any>new Date(a.registrationDate) - <any>new Date(b.registrationDate) });
        this.shouldSortReverse = true;
      } else {
        this.condoFilterList.sort((a, b) => { return <any>new Date(b.registrationDate) - <any>new Date(a.registrationDate) });
        this.shouldSortReverse = false;
      }
    }

    this.lastAppliedFilter = type;
    this.condoFilterList = [...this.condoFilterList];
  }

  filterData() {
    let keyword = this.filterForm.value.keyword;
    let locationValue = this.filterForm.value.location;
    let fromUnit = this.filterForm.value.unitsFromNos;
    let toUnit = this.filterForm.value.unitsToNos;

    this.condoFilterList = this.condoList;
    if (keyword) {
      this.condoFilterList = this.condoFilterList.filter(data => data.name.toLowerCase() == keyword.toLowerCase())
    }
    if (locationValue) {
      this.condoFilterList = this.condoFilterList.filter(cityValue => cityValue.location.find(city => city.toLowerCase() == locationValue.toLowerCase()))
    }
    if (fromUnit) {
      this.condoFilterList = this.condoFilterList.filter(data => data.units >= fromUnit)
    }
    if (toUnit) {
      this.condoFilterList = this.condoFilterList.filter(data => data.units <= toUnit)
    }
    this.sortCondos(2);
  }

  viewCondo(condo) {
    debugger;
    let data = { id: condo.clientOrganisationId, name: condo.organisationName, sourceScreen: "condoBrowser" };
    this._condoBrowserService.setClientData(data);
    this.router.navigate(['/browseCondos/view']);
  }


  ngOnInit(): void {
    this._menuService.currentPageSearchBarSubject.next(SearchBarPageIndex.BROWSE_CONDOS);

    this._authService.currentUser.pipe(takeUntil(this._unsubscribeAll)).subscribe(userDetails => {
      this.currentUser = userDetails;
      this.getCondoListForVendorOrg(this.currentUser.vendorOrganisationId);
    });

    this.filterForm = this._formBuilder.group({
      servicedCities: [''],
      unitsFromNos: ['', Validators.pattern("^[0-9]*$")],
      unitsToNos: ['', Validators.pattern("^[0-9]*$")],
    });

    this.getServiceCities();
  }


  onChangePage(pageOfItems: Array<any>) {
    this.pageOfItems = pageOfItems;
  }

  getCondoListForVendorOrg(vendorOrgId) {

    this._appService.getClientOrganizationList(vendorOrgId).subscribe((response) => {
      if (response.statusCode == APIResponse.Success) {
        this.condoList = response.clientOrganisations;
        this.condoList = this.condoList.map(condo => {
          condo.location = condo.city.split(',');
          return condo;
        });

        this.condoFilterList = this.condoList;
        this.actualCondoList = this.condoList;
        this.sortCondos(3);
      } else {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.unableToLoadCondoListMessage);
      }
    }, err => {
      this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
      console.log(err);
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

  cityListUpdated(cityArray) {
    this.filterSelectedCityIdList = cityArray;
  }



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


  filterCondoList() {
    var filteredCityCondos = [];
    var filteredUnitCondos = [];
    var filteredCondos = [];
    var shouldApplyUnitFilter = false;

    var cityIdList = this.selectedCities.map(function (city) {
      return city.cityName;
    });

    let fromUnit = this.filterForm.value.unitsFromNos
    let toUnit = this.filterForm.value.unitsToNos


    if ((fromUnit == null || fromUnit == '') && (toUnit == null || toUnit == '') && (this.selectedCities == null || this.selectedCities.length == 0)) {
      return;
    }

    if (cityIdList != null && cityIdList.length > 0) {
      cityIdList.forEach(city => {
        this.actualCondoList.forEach(condo => {
          if (condo.location.indexOf(city) > -1) {
            filteredCityCondos.push(condo);
          }
        });
      });
    }

    if (fromUnit != null && toUnit != null && fromUnit != '' && toUnit != '') {
      filteredUnitCondos = this.actualCondoList.filter(condo => condo.units >= fromUnit && condo.units <= toUnit)
      shouldApplyUnitFilter = true;
    } else if (fromUnit != null && fromUnit != '') {
      filteredUnitCondos = this.actualCondoList.filter(condo => condo.units >= fromUnit)
      shouldApplyUnitFilter = true;
    } else if (toUnit != null && toUnit != '') {
      filteredUnitCondos = this.actualCondoList.filter(condo => condo.units <= toUnit)
      shouldApplyUnitFilter = true;
    }


    if (cityIdList.length > 0) {
      if (filteredCityCondos.length > 0) {
        filteredCondos = filteredCityCondos;
      } else {
        filteredCondos = [];
      }

      if (filteredCondos.length > 0 && filteredUnitCondos.length > 0) {
        filteredCondos = filteredCondos.filter(condo => filteredUnitCondos.some(unitCondo => condo.clientOrganisationId === unitCondo.clientOrganisationId));
      } else if (cityIdList.length > 0 && shouldApplyUnitFilter == true) {
        filteredCondos = [];
      }

    } else if (filteredUnitCondos.length > 0 && cityIdList.length == 0) {
      filteredCondos = filteredUnitCondos;
    }

    this.condoFilterList = filteredCondos;

    if (cityIdList.length == 0 && fromUnit == null && toUnit == null) {
      this.condoFilterList = this.actualCondoList;
    }

    this.condoFilterList = [...this.condoFilterList];
  }


  onClickclearFilter() {
    this.condoFilterList = [...this.actualCondoList];
    // this.pageOfItems = this.condoFilterList;


    this.selectedCities.forEach(city => {
      this.cityNames.push(city);
      this.cityCtrl.setValue(null);
    });
    this.cityNames.sort((a, b) => a.cityName.localeCompare(b.cityName));

    this.selectedCities = [];

    this.filterForm.controls['servicedCities'].setValue([]);
    this.filterForm.controls['unitsToNos'].setValue('');
    this.filterForm.controls['unitsFromNos'].setValue('');
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
