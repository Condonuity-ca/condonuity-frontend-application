import { Component, OnDestroy, OnInit, ViewEncapsulation, ElementRef, ViewChild, Input } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { takeUntil, startWith, map } from 'rxjs/operators';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators, FormControl, FormArray } from '@angular/forms';
import { fuseAnimations } from '@condonuity/animations';

import { Router, ActivatedRoute } from '@angular/router';
import { AppService } from 'app/main/services/app.service';
import { APIResponse, AlertType, AppLiterals, AppDateFormat, UserProfileViewMode, UserType, SearchBarPageIndex } from 'app/utils/app-constants';
import { AppUtilService } from 'app/utils/app-util.service';
import * as moment from 'moment';
import { City } from '../../models/city.model';
import { CondoBrowserService } from 'app/main/condo-browser/condo-browser.service';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material';
import { SupportUserService } from '../../service/support-user.service';
import { MenuService } from 'app/layout/components/toolbar/menu.service';
import * as XLSX from 'xlsx';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';


@Component({
    selector: 'client-condo',
    templateUrl: './client-condo.component.html',
    styleUrls: ['./client-condo.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})

export class ClientCondoComponent implements OnInit, OnDestroy {

    @Input() newcondolist;

    filterForm: FormGroup;
    condoList = [];
    condoFilterList = [];
    actualCondoList = [];

    cityNames: City[];
    filterSelectedCityIdList: [] = [];

    accountStatus = 0;
    disableClearFilterButton = true;

    condoSearchType = 1;

    visible = true;
    selectable = true;
    removable = true;
    addOnBlur = true;
    separatorKeysCodes: number[] = [ENTER, COMMA];

    cityCtrl = new FormControl();
    selectedCities: City[] = [];
    filteredCities: Observable<City[]>;
    export_data: Array<any> = [];

    @ViewChild('cityInput', { static: false }) cityInput: ElementRef<HTMLInputElement>;
    @ViewChild('cityAuto', { static: false }) cityMatAutocomplete: MatAutocomplete;


    private _unsubscribeAll: Subject<any>;

    constructor(
        private _formBuilder: FormBuilder,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private _condoBrowserService: CondoBrowserService,
        private _appService: AppService,
        private _appUtil: AppUtilService,
        private _supportUserService: SupportUserService,
        private _menuService: MenuService
    ) {
        this._unsubscribeAll = new Subject();
        this._menuService.currentPageSearchBarSubject.next(SearchBarPageIndex.OTHERS);

        this._appUtil.appCities.pipe(takeUntil(this._unsubscribeAll)).subscribe(cityList => {
            if (cityList != null) {
                this.cityNames = cityList;
                this.cityNames.sort((a, b) => a.cityName.localeCompare(b.cityName));
                this.filteredCities = this.cityCtrl.valueChanges.pipe(
                    startWith(null),
                    map((data: City | null) => data ? this._cityFilter(data) : this.cityNames.slice()));
            }
        });
    }


    ngOnInit(): void {
        this.actualCondoList = this.newcondolist;

        this.actualCondoList.sort((a, b) => { return <any>new Date(a.createdAt) - <any>new Date(b.createdAt) });

        this.actualCondoList = this.actualCondoList.map(condo => {
            condo.createdAt = condo.createdAt + ' UTC';

            if (condo.activeStatus == '0') {
                condo.status = 'New';
            } else if (condo.activeStatus == '2') {
                condo.status = 'Rejected';
            }

            return condo;
        });

        this.condoFilterList = [...this.actualCondoList];

        this.filterForm = this._formBuilder.group({
            servicedCities: [''],
            unitsFromNos: ['', Validators.pattern("^[0-9]*$")],
            unitsToNos: ['', Validators.pattern("^[0-9]*$")],
            accountStatus: [''],
            cityChips: [''],
            searchWord: ['']
        });
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

    accountStatusSelected(accountStatus) {
        this.accountStatus = accountStatus;
    }

    filterCondoList() {
        var filteredCityCondos = [];
        var filteredUnitCondos = [];
        var filteredAccountStatusCondos = [];
        var filteredCondos = [];

        var shouldApplyUnitFilter = false;
        var shouldApplyAccountStatusFilter = false;

        var cityIdList = this.selectedCities.map(function (city) {
            return city.cityName;
        });

        let fromUnit = this.filterForm.value.unitsFromNos
        let toUnit = this.filterForm.value.unitsToNos

        if ((fromUnit == null || fromUnit == '') && (toUnit == null || toUnit == '') && (this.selectedCities == null || this.selectedCities.length == 0) && this.accountStatus == 0) {
            return;
        }

        if (cityIdList != null && cityIdList.length > 0) {
            cityIdList.forEach(city => {
                this.actualCondoList.forEach(condo => {
                    if (condo.city.indexOf(city) > -1) {
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


        if (this.accountStatus != 0) {
            shouldApplyAccountStatusFilter = true;

            var selectedAccountStatus = 0;
            if (this.accountStatus == 1) {
                selectedAccountStatus = 0;
            } else {
                selectedAccountStatus = this.accountStatus;
            }

            filteredAccountStatusCondos = this.actualCondoList.filter(condo => condo.activeStatus == selectedAccountStatus);
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

            if (this.accountStatus != 0 && filteredAccountStatusCondos.length > 0) {
                filteredCondos = filteredCondos.filter(condo => filteredAccountStatusCondos.some(statusCondo => condo.clientOrganisationId === statusCondo.clientOrganisationId));
            } else if (shouldApplyAccountStatusFilter == true) {
                filteredCondos = [];
            }

        } else if (shouldApplyUnitFilter) {
            filteredCondos = filteredUnitCondos;

            if (filteredUnitCondos.length > 0) {
                filteredCondos = filteredUnitCondos;
            } else if (shouldApplyUnitFilter == true) {
                filteredCondos = [];
            }

            if (this.accountStatus != 0 && filteredAccountStatusCondos.length > 0) {
                filteredCondos = filteredCondos.filter(condo => filteredAccountStatusCondos.some(statusCondo => condo.clientOrganisationId === statusCondo.clientOrganisationId));
            } else if (shouldApplyAccountStatusFilter == true) {
                filteredCondos = [];
            }
        } else if (shouldApplyAccountStatusFilter) {
            filteredCondos = filteredAccountStatusCondos;
        }

        this.condoFilterList = filteredCondos;

        if (cityIdList.length == 0 && fromUnit == null && toUnit == null && !shouldApplyAccountStatusFilter) {
            this.condoFilterList = this.actualCondoList;
            this.disableClearFilterButton = true;
        } else {
            this.disableClearFilterButton = false;
        }

        this.condoFilterList = [...this.condoFilterList];
    }

    onClickclearFilter() {
        this.condoFilterList = [...this.actualCondoList];
        this.accountStatus = 0;
        this.disableClearFilterButton = true;

        this.selectedCities.forEach(city => {
            this.cityNames.push(city);
            this.cityCtrl.setValue(null);
        });
        this.cityNames.sort((a, b) => a.cityName.localeCompare(b.cityName));

        this.selectedCities = [];

        this.filterForm.controls['servicedCities'].setValue([]);
        this.filterForm.controls['unitsToNos'].setValue('');
        this.filterForm.controls['unitsFromNos'].setValue('');
        this.filterForm.controls['accountStatus'].setValue('0');
    }



    //**************  Condo Search ****************/

    searchTypeChanged(searchType) {
        this.condoSearchType = searchType;
    }

    searchOrg() {
        let searchDetails = {
            "userType": UserType.Client,
            "searchType": this.condoSearchType,
            "keyword": this.filterForm.controls['searchWord'].value
        }

        this._appService.searchNewOrganization(searchDetails).subscribe((response) => {
            if (response.statusCode == APIResponse.Success) {
                this.condoList = response.clientOrganisations;
                this.condoList.sort((a, b) => a.corporateNumber.localeCompare(b.corporateNumber));
                this.condoList = this.condoList.map(condo => {
                    condo.location = condo.city.split(',');
                    var createdDate = moment.utc(condo.createdAt).toDate();
                    condo.createdDate = moment(createdDate).format(AppDateFormat.DisplayFormat);
                    if (condo.activeStatus == '0') {
                        condo.status = 'New';
                    } else if (condo.activeStatus == '2') {
                        condo.status = 'Rejected';
                    }
                    return condo;
                });
                this.condoFilterList = this.condoList;
                this.actualCondoList = this.condoList;
            } else {
                this._appUtil.showAlert(AlertType.Error, AppLiterals.unableToLoadCondoListMessage);
            }
        }, err => {
            this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
        });
    }

    clearCondoSearch() {
        this.filterForm.controls['searchWord'].setValue('');
        this.getUnapprovedOrgList();
    }

    getUnapprovedOrgList() {
        this._appService.getUnapprovedOrgList().subscribe(response => {
            if (response.statusCode == APIResponse.Success) {
                this.actualCondoList = response.results.clientOrganisations;
                this.actualCondoList.sort((a, b) => { return <any>new Date(a.createdAt) - <any>new Date(b.createdAt) });
                this.actualCondoList = this.actualCondoList.map(condo => {
                    condo.createdAt = condo.createdAt + ' UTC';

                    if (condo.activeStatus == '0') {
                        condo.status = 'New';
                    } else if (condo.activeStatus == '2') {
                        condo.status = 'Rejected';
                    }

                    return condo;
                });
                this.condoFilterList = [...this.actualCondoList];
            } else {
                this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
            }
        }, err => {
            this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
        });
    }



    viewCondo(event) {
        debugger;
        if (event.type == 'click') {
            let condo = event.row;
            let data = { id: condo.clientOrganisationId, name: condo.organisationName, userType: UserType.Client, profileMode: UserProfileViewMode.NewRegistration, sourceScreen: "supportUser", accountApprovalStatus: condo.activeStatus };
            this._condoBrowserService.setClientData(data);
            this._supportUserService.clientProfileSubject.next(data);
            this.router.navigate(['/browseCondos/view'], { skipLocationChange: true });
        }
    }

    // Excel Download
    public ExportTOExcel() {
        console.log(this.condoFilterList)
        let op_json = {};
        for (let i = 0; i < this.condoFilterList.length; i++) {
            op_json = [];
            op_json['Corporation#'] = this.condoFilterList[i]['corporateNumber'];
            op_json['Org. Name'] = this.condoFilterList[i]['organisationName'];
            op_json['Units#'] = this.condoFilterList[i]['units'];
            op_json['Address'] = this.condoFilterList[i]['address'];
            op_json['City'] = this.condoFilterList[i]['city'];
            op_json['Province'] = this.condoFilterList[i]['province'];
            op_json['Postal Code'] = this.condoFilterList[i]['postalCode'];
            op_json['Phone Number'] = this.condoFilterList[i]['phoneNumber'];
            op_json['Fax'] = this.condoFilterList[i]['faxNumber'];
            op_json['General Email'] = this.condoFilterList[i]['generalEmail'];
            op_json['Registration Date'] = moment.utc(this.condoFilterList[i]['createdAt']).format(AppDateFormat.DisplayFormat);
            op_json['Management Email'] = this.condoFilterList[i]['managementEmail'];
            op_json['Board Email'] = this.condoFilterList[i]['boardEmail'];
            op_json['First Name'] = this.condoFilterList[i]['adminFirstName'];
            op_json['Last Name'] = this.condoFilterList[i]['adminLastName'];
            op_json['User Email'] = this.condoFilterList[i]['adminEmail'];
            this.export_data.push(op_json);
        }
        const workSheet = XLSX.utils.json_to_sheet(this.export_data);
        const workBook: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workBook, workSheet, 'SheetName');
        XLSX.writeFile(workBook, 'condos_list.xlsx');
        this.export_data = [];
    }

    // Print Data
    public print() {
        let header = ['Corporation#', 'Org. Name', 'Units#', 'City', 'Phone Number', 'Management Email', 'Registration Date'];
        this.print_pdf(header, this.export_data);
        this.export_data = [];
    }
    public print_pdf(header: any, data: any) {
        for (let i = 0; i < this.condoFilterList.length; i++) {
            let op_json = [];
            op_json.push(this.condoFilterList[i]['corporateNumber']);
            op_json.push(this.condoFilterList[i]['organisationName']);
            op_json.push(this.condoFilterList[i]['units']);
            op_json.push(this.condoFilterList[i]['city']);
            op_json.push(this.condoFilterList[i]['phoneNumber']);
            op_json.push(this.condoFilterList[i]['managementEmail']);
            op_json.push(this.condoFilterList[i]['registeredDate']);
            this.export_data.push(op_json);
        }
        let doc = new jsPDF('l', 'pt', 'a4');
        doc.autoTable({
            head: [header],
            body: data
        });
        doc.autoPrint();
        window.open(doc.output('bloburl'), '_blank');
        this.export_data = [];
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
}
