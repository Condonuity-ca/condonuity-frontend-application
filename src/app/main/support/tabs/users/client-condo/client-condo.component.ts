import { Component, OnDestroy, OnInit, ViewEncapsulation, ElementRef, ViewChild } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators, FormControl, FormArray } from '@angular/forms';
import { fuseAnimations } from '../../../../../../@condonuity/animations';

import { Router, ActivatedRoute } from '@angular/router';
import { AppService } from '../../../../../../app/main/services/app.service';
import { APIResponse, AlertType, AppLiterals, AppDateFormat } from '../../../../../../app/utils/app-constants';
import { AppUtilService } from '../../../../../../app/utils/app-util.service';
import * as moment from 'moment';
import { City } from '../../models/city.model';
import { CondoBrowserService } from '../../../../../../app/main/condo-browser/condo-browser.service';


@Component({
    selector: 'client-condo',
    templateUrl: './client-condo.component.html',
    styleUrls: ['./client-condo.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})

export class ClientCondoComponent implements OnInit, OnDestroy {

    isValid: boolean = false;
    filterForm: FormGroup;
    condoList = [];
    condoFilterList = [];
    actualCondoList = [];

    cityNames: City[];
    filterSelectedCityIdList: [] = [];
    accountStatus = 0;


    private _unsubscribeAll: Subject<any>;

    /**
     * Constructor
     *
     */
    constructor(
        private _formBuilder: FormBuilder,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private _condoBrowserService: CondoBrowserService,
        private _appService: AppService,
        private _appUtil: AppUtilService
    ) {
        this._unsubscribeAll = new Subject();
        this.getServiceCities();
    }


    /**
     * On init
     */
    ngOnInit(): void {
        this.getAllCondoList();

        this.filterForm = this._formBuilder.group({
            servicedCities: [''],
            unitsFromNos: ['', Validators.pattern("^[0-9]*$")],
            unitsToNos: ['', Validators.pattern("^[0-9]*$")],
            accountStatus: ['']
        });
    }

    getAllCondoList() {
        this._appService.getAppClientOrgList().subscribe((response) => {
            if (response.statusCode == APIResponse.Success) {
                this.condoList = response.clientOrganisations;
                this.condoList = this.condoList.map(condo => {
                    condo.location = condo.city.split(',');
                    let createdDate = moment.utc(condo.createdAt).toDate();
                    condo.createdDate = moment(createdDate).format(AppDateFormat.DisplayFormat);
                    return condo;
                });
                this.condoFilterList = this.condoList;
                this.actualCondoList = this.condoList;
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

    accountStatusSelected(accountStatus) {
        this.accountStatus = accountStatus;
    }

    filterCondoList() {
        var filteredCityCondos = [];
        var filteredUnitCondos = [];
        var filteredCondos = [];
        var shouldApplyUnitFilter = false;

        let fromUnit = this.filterForm.value.unitsFromNos
        let toUnit = this.filterForm.value.unitsToNos

        if ((fromUnit == null || fromUnit == '') && (toUnit == null || toUnit == '') && (this.filterSelectedCityIdList == null || this.filterSelectedCityIdList.length == 0) && this.accountStatus == 0) {
            return;
        }

        if (this.filterSelectedCityIdList != null && this.filterSelectedCityIdList.length > 0) {
            this.filterSelectedCityIdList.forEach(id => {
                this.actualCondoList.forEach(condo => {
                    if (condo.location.indexOf(id) > -1) {
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


        if (this.filterSelectedCityIdList.length > 0) {
            if (filteredCityCondos.length > 0) {
                filteredCondos = filteredCityCondos;
            } else {
                filteredCondos = [];
            }

            if (filteredCondos.length > 0 && filteredUnitCondos.length > 0) {
                filteredCondos = filteredCondos.filter(condo => filteredUnitCondos.some(unitCondo => condo.clientOrganisationId === unitCondo.clientOrganisationId));
            } else if (this.filterSelectedCityIdList.length > 0 && shouldApplyUnitFilter == true) {
                filteredCondos = [];
            }

            if (this.accountStatus != 0) {
                filteredCondos = filteredCondos.filter(condo => condo.activeStatus === this.accountStatus);
            }

        } else if (filteredUnitCondos.length > 0 && this.filterSelectedCityIdList.length == 0) {
            filteredCondos = filteredUnitCondos;

            if (this.accountStatus != 0) {
                filteredCondos = filteredCondos.filter(condo => condo.activeStatus === this.accountStatus);
            }
        } else if (this.accountStatus != 0) {
            filteredCondos = this.actualCondoList.filter(condo => condo.activeStatus === this.accountStatus);
        }

        this.condoFilterList = filteredCondos;

        if (this.filterSelectedCityIdList.length == 0 && fromUnit == null && toUnit == null) {
            this.condoFilterList = this.actualCondoList;
        }
    }

    viewCondo(event) {
        debugger;
        if (event.type == 'click') {
            let condo = event.row;
            let data = { id: condo.clientOrganisationId, name: condo.organisationName, sourceScreen: "supportUser" };
            this._condoBrowserService.setClientData(data);
            this.router.navigate(['/browseCondos/view']);
        }
    }


    onClickclearFilter() {
        this.condoFilterList = this.actualCondoList;
        this.filterSelectedCityIdList = [];
        this.accountStatus = 0;

        this.filterForm.controls['servicedCities'].setValue([]);
        this.filterForm.controls['unitsToNos'].setValue('');
        this.filterForm.controls['unitsFromNos'].setValue('');
        this.filterForm.controls['accountStatus'].setValue([]);
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
}
