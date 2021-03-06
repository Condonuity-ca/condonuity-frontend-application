import { Component, OnDestroy, OnInit, ViewEncapsulation, ElementRef, ViewChild } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators, FormControl, FormArray } from '@angular/forms';
import { fuseAnimations } from '@condonuity/animations';

import { Router, ActivatedRoute } from '@angular/router';
import { Tag } from '../../models/tag.model';
import { City } from '../../models/city.model';
import { AppService } from 'app/main/services/app.service';
import { APIResponse, AlertType, AppLiterals, AppDateFormat } from 'app/utils/app-constants';
import { AppUtilService } from 'app/utils/app-util.service';
import { isNumber } from 'util';
import * as moment from 'moment';
import { VendorBrowserService } from 'app/main/vendor-browser/vendor-browser.service';


@Component({
    selector: 'client-vendor',
    templateUrl: './client-vendor.component.html',
    styleUrls: ['./client-vendor.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})

export class ClientVendorComponent implements OnInit, OnDestroy {

    vendorsList = [];
    actualVendorList = [];
    filteredVendors = [];

    allTags: Tag[];
    cityNames: City[];
    disableClearFilterButton = true;

    filterSelectedTagIdList: [] = [];
    filterSelectedCityIdList: City[] = [];

    filterForm: FormGroup;
    sortType: string;
    sortedList = [];

    accountStatus = 0;



    // Private
    private _unsubscribeAll: Subject<any>;
    /**
     * Constructor
     *
     */
    constructor(
        private _formBuilder: FormBuilder,
        private _appService: AppService,
        private _appUtil: AppUtilService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private _vendorBrowserService: VendorBrowserService,
    ) {
        this._unsubscribeAll = new Subject();

        this.getProjectTags();
        this.getServiceCities();

        this.filterForm = this._formBuilder.group({
            tagWords: [''],
            servicedCities: ['']
        });
    }

    isValid: boolean = false;

    /**
     * On init
     */
    ngOnInit(): void {
        this.getVendorList();
    }


    getVendorList() {
        this._appService.getAppVendorOrgList().subscribe((response) => {
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

    processVendorList() {
        this.vendorsList = this.vendorsList.map(vendor => {
            if (vendor.city != null && vendor.city != '') {
                vendor.location = vendor.city.split(',');
            } else {
                vendor.location = ['NA']
            }

            vendor.isPreferred = vendor.isPreferred;

            if (vendor.vendorTags != null && vendor.vendorTags != '') {
                vendor.tags = vendor.vendorTags.split(',');
            } else {
                vendor.tags = ['NA']
            }

            if (!isNumber(vendor.rating)) {
                vendor.rating = 0;
            }

            vendor.rating = (Math.round(vendor.rating * 10) / 10).toFixed(1);
            // vendor.rating.toFixed(1)

            vendor.preferred = false;

            vendor.registeredDate = moment(vendor.establishedDate).format(AppDateFormat.DisplayFormat);
            return vendor;
        });
        this.actualVendorList = this.vendorsList;
        this.sortedList = this.vendorsList;
    }



    getProjectTags() {
        this._appService.getProjectTagList().subscribe((response) => {
            if (response.statusCode == APIResponse.Success) {
                this.allTags = response.tags;
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
            } else {
                this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
            }
        }, err => {
            this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
        });
    }

    accountStatusSelected(accountStatus) {
        this.accountStatus = accountStatus;
    }

    tagListUpdated(tags) {

    }

    cityListUpdated(cities) {

    }


    filterVendorList() {
        var filteredTagVendors = [];
        var filteredCityVendors = [];
        var shouldApplyCityFilter = false;

        if (this.filterSelectedTagIdList != null) {
            this.filterSelectedTagIdList.forEach(id => {
                this.actualVendorList.forEach(vendor => {
                    if (vendor.tags.indexOf(id) > -1) {
                        filteredTagVendors.push(vendor);
                    }
                })
            });
        }

        if (this.filterSelectedCityIdList != null) {
            shouldApplyCityFilter = true;
            this.filterSelectedCityIdList.forEach(city => {
                this.actualVendorList.forEach(vendor => {
                    if (vendor.location.indexOf(city.cityName) > -1) {
                        filteredCityVendors.push(vendor);
                    }
                })
            });
        }


        if (this.filterSelectedTagIdList.length > 0) {

            if (filteredTagVendors.length > 0) {
                this.filteredVendors = filteredTagVendors;
            } else {
                this.filteredVendors = [];
            }

            if (this.filteredVendors.length > 0 && filteredCityVendors.length > 0) {
                this.filteredVendors = this.filteredVendors.filter(vendor => filteredCityVendors.some(cityVendor => vendor.projectId === cityVendor.projectId));
            } else if (this.filterSelectedCityIdList.length > 0 && shouldApplyCityFilter == true) {
                this.filteredVendors = [];
            }

        } else if (this.filterSelectedCityIdList.length > 0 && filteredCityVendors.length > 0 && this.filterSelectedTagIdList.length == 0) {
            this.filteredVendors = filteredCityVendors;
        }
        this.sortedList = this.filteredVendors;

        if (this.filterSelectedCityIdList.length == 0 && this.filterSelectedTagIdList.length == 0) {
            this.sortedList = this.actualVendorList;
            this.disableClearFilterButton = true;
        } else {
            this.disableClearFilterButton = false;
        }
    }

    onClickclearFilter() {
        this.sortedList = this.actualVendorList;
        this.filterSelectedTagIdList = [];
        this.filterSelectedCityIdList = [];
        this.disableClearFilterButton = true;

        this.filterForm.controls['tagWords'].setValue([]);
        this.filterForm.controls['servicedCities'].setValue([]);
    }
    viewVendor(vendor) {
        let vendorData = { id: vendor.vendorOrganisationId, name: vendor.companyName };
        this._vendorBrowserService.setVendorData(vendorData);
        this.router.navigate(['/browseVendors/view']);
    }
    /**
     * On destroy
     */
    ngOnDestroy(): void {
        this._unsubscribeAll.complete();
    }
}
