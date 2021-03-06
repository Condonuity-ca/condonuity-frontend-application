import { Component, OnDestroy, OnInit, ViewEncapsulation, ElementRef, ViewChild } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { takeUntil, startWith, map } from 'rxjs/operators';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators, FormControl, FormArray } from '@angular/forms';
import { fuseAnimations } from '@condonuity/animations';

import { Router, ActivatedRoute } from '@angular/router';
import { Tag } from '../../models/tag.model';
import { City } from '../../models/city.model';
import { AppService } from 'app/main/services/app.service';
import { APIResponse, AlertType, AppLiterals, AppDateFormat, UserProfileViewMode, SearchBarPageIndex, UserType } from 'app/utils/app-constants';
import { AppUtilService } from 'app/utils/app-util.service';
import { isNumber } from 'util';
import * as moment from 'moment';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material';
import { VendorBrowserService } from 'app/main/vendor-browser/vendor-browser.service';
import { SupportUserService } from '../../service/support-user.service';
import { MenuService } from 'app/layout/components/toolbar/menu.service';
import * as XLSX from 'xlsx';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';

@Component({
    selector: 'client-vendor',
    templateUrl: './client-vendor.component.html',
    styleUrls: ['./client-vendor.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})

export class ClientVendorComponent implements OnInit, OnDestroy {

    private _unsubscribeAll: Subject<any>;

    accountStatus = '0';

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
    export_data: Array<any> = [];

    @ViewChild('tagInput', { static: false }) tagInput: ElementRef<HTMLInputElement>;
    @ViewChild('auto', { static: false }) matAutocomplete: MatAutocomplete;

    @ViewChild('cityInput', { static: false }) cityInput: ElementRef<HTMLInputElement>;
    @ViewChild('cityAuto', { static: false }) cityMatAutocomplete: MatAutocomplete;


    constructor(
        private _supportUserService: SupportUserService,
        private _formBuilder: FormBuilder,
        private _appService: AppService,
        private _appUtil: AppUtilService,
        private router: Router,
        private _vendorBrowserService: VendorBrowserService,
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

        this._appUtil.appTags.pipe(takeUntil(this._unsubscribeAll)).subscribe(tags => {
            if (tags != null) {
                this.allTags = tags;
                this.allTags.sort((a, b) => a.tagName.localeCompare(b.tagName));
                this.filteredTags = this.tagCtrl.valueChanges.pipe(
                    startWith(null),
                    map((data: Tag | null) => data ? this._filter(data) : this.allTags.slice()));

            }
        });

        this.filterForm = this._formBuilder.group({
            tags: [''],
            servicedCities: [''],
            accountStatus: [this.accountStatus],
            cityChips: [],
            searchWord: ['']
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
            if (vendor.vendorTags != null && vendor.vendorTags != '') {
                vendor.tags = vendor.vendorTags.split(',');
            } else {
                vendor.tags = ['NA']
            }

            if (!isNumber(vendor.rating)) {
                vendor.rating = 0;
            }

            vendor.rating = (Math.round(vendor.rating * 10) / 10).toFixed(1);
            vendor.preferred = false;

            vendor.registeredDate = moment(vendor.establishedDate).format(AppDateFormat.DisplayFormat);
            return vendor;
        });
        this.actualVendorList = this.vendorsList;
        this.sortedList = this.vendorsList;
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

    accountStatusSelected(accountStatus) {
        this.accountStatus = accountStatus;
    }


    filterVendorList() {
        var filteredTagVendors = [];
        var filteredCityVendors = [];
        var shouldApplyCityFilter = false;

        var filteredAccountStatusVendors = [];
        var shouldApplyAccountStatusFilter = false;

        var cityIdList = this.selectedCities.map(function (city) {
            return city.cityName;
        });


        if (this.selectedTags != null && this.selectedTags.length > 0) {
            this.selectedTags.forEach(tag => {
                this.actualVendorList.forEach(vendor => {
                    if (vendor.vendorTags.indexOf(tag.tagName) > -1) {
                        filteredTagVendors.push(vendor);
                    }
                });
            });
        }

        if (cityIdList != null && cityIdList.length > 0) {
            shouldApplyCityFilter = true;
            cityIdList.forEach(city => {
                this.actualVendorList.forEach(vendor => {
                    if (vendor.city.indexOf(city) > -1) {
                        filteredCityVendors.push(vendor);
                    }
                });
            });
        }

        if (this.accountStatus != '0') {
            shouldApplyAccountStatusFilter = true;
            filteredAccountStatusVendors = this.actualVendorList.filter(vendor => vendor.deleteStatus == this.accountStatus);
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

            if (this.accountStatus != '0' && filteredAccountStatusVendors.length > 0) {
                this.filteredVendors = this.filteredVendors.filter(condo => filteredAccountStatusVendors.some(statusVendor => condo.vendorOrganisationId === statusVendor.vendorOrganisationId));
            } else if (shouldApplyAccountStatusFilter == true) {
                this.filteredVendors = [];
            }

        } else if (shouldApplyCityFilter) {

            if (filteredCityVendors.length > 0) {
                this.filteredVendors = filteredCityVendors;
            } else {
                this.filteredVendors = [];
            }

            if (shouldApplyAccountStatusFilter) {
                this.filteredVendors = this.filteredVendors.filter(vendor => filteredAccountStatusVendors.some(statusVendor => vendor.vendorOrganisationId === statusVendor.vendorOrganisationId));
            }
        } else if (shouldApplyAccountStatusFilter) {
            this.filteredVendors = filteredAccountStatusVendors;
        }

        this.sortedList = this.filteredVendors;

        if (cityIdList.length == 0 && this.selectedTags.length == 0 && this.accountStatus == '0') {
            this.sortedList = this.actualVendorList;
            this.disableClearFilterButton = true;
        } else {
            this.disableClearFilterButton = false;
        }
    }

    onClickclearFilter() {
        this.sortedList = this.actualVendorList;
        this.disableClearFilterButton = true;
        this.accountStatus = '0';

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
        this.filterForm.controls['accountStatus'].setValue('0');
    }

    viewVendor(event) {
        if (event.type == 'click') {
            let vendor = event.row;
            let vendorData = { id: vendor.vendorOrganisationId, name: vendor.companyName, accountCurrentStatus: vendor.accountStatus, profileMode: UserProfileViewMode.AccountStatusChange, sourceScreen: "vendorManagement" };
            this._supportUserService.clientProfileSubject.next(vendorData);
            this._vendorBrowserService.setVendorData(vendorData);
            this.router.navigate(['/browseVendors/view'], { skipLocationChange: true });
        }
    }

    // Excel Download
    public ExportTOExcel() {
        console.log(this.sortedList)
        let op_json = {};
        for (let i = 0; i < this.sortedList.length; i++) {
            op_json = [];
            op_json['Org. Name'] = this.sortedList[i]['companyName'];
            op_json['Emp. Count#'] = this.sortedList[i]['employeesCount'];
            op_json['Tags'] = this.sortedList[i]['vendorTags'];
            op_json['Address'] = this.sortedList[i]['address'];
            op_json['City'] = this.sortedList[i]['city'];
            op_json['Province'] = this.sortedList[i]['province'];
            op_json['Postal Code'] = this.sortedList[i]['postalCode'];
            op_json['Phone'] = this.sortedList[i]['phoneNumber'];
            op_json['Email'] = this.sortedList[i]['email'];
            op_json['Fax'] = this.sortedList[i]['faxNumber'];
            op_json['Registration Date'] = this.sortedList[i]['registeredDate'];
            op_json['Status'] = this.sortedList[i]['accountStatus'];

            this.export_data.push(op_json);
        }
        const workSheet = XLSX.utils.json_to_sheet(this.export_data);
        const workBook: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workBook, workSheet, 'SheetName');
        XLSX.writeFile(workBook, 'vendors_list.xlsx');
        this.export_data = [];
    }

    // Print Data
    public print() {
        let header = ['Org. Name', 'City', 'Emp. Count#', 'Tags', 'Province', 'Registration Date', 'Status'];
        this.print_pdf(header, this.export_data);
        this.export_data = [];
    }

    public print_pdf(header: any, data: any) {
        for (let i = 0; i < this.sortedList.length; i++) {
            let op_json = [];
            op_json.push(this.sortedList[i]['companyName']);
            op_json.push(this.sortedList[i]['city']);
            op_json.push(this.sortedList[i]['employeesCount']);
            op_json.push(this.sortedList[i]['vendorTags']);
            op_json.push(this.sortedList[i]['province']);
            op_json.push(this.sortedList[i]['registeredDate']);
            op_json.push(this.sortedList[i]['accountStatus']);
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


    searchOrg() {

        let searchDetails = {
            "userType": UserType.Vendor,
            "searchType": "1",
            "keyword": this.filterForm.controls['searchWord'].value
        }

        this._appService.searchOrganization(searchDetails).subscribe((response) => {
            if (response.statusCode == APIResponse.Success) {
                this.vendorsList = [];
                this.vendorsList = response.vendorOrganisations;
                this.vendorsList.sort((a, b) => a.companyName.localeCompare(b.companyName));
                this.processVendorList();
            } else {
                this._appUtil.showAlert(AlertType.Error, AppLiterals.unableToLoadCondoListMessage);
            }
        }, err => {
            this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
        });
    }

    clearCondoSearch() {
        this.filterForm.controls['searchWord'].setValue('');
        this.getVendorList();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
}

