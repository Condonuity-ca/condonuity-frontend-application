import { Component, OnDestroy, OnInit, ViewEncapsulation, ElementRef, ViewChild, Inject, Input } from '@angular/core';
import { Subject, Observable, from } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators, FormControl, FormArray } from '@angular/forms';
import { fuseAnimations } from '@condonuity/animations';
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete';
import { map, startWith } from 'rxjs/operators';
import { MatChipInputEvent } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { DatePipe } from '@angular/common';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AppService } from '../../../../services/app.service';
import { BuildingRepo } from '../building-repository/model/building-repo.model';
import { MenuService } from '../../../../../layout/components/toolbar/menu.service';
import { APIResponse, AppLiterals, AlertType, AppDateFormat, SearchBarPageIndex } from '../../../../../utils/app-constants';
import { AppUtilService } from '../../../../../utils/app-util.service';
import { AuthenticationService } from 'app/_services/authentication.service';
import { CommonFunctionsService } from '../../../../../../app/_services/common-functions.service';
import { resetFakeAsyncZone } from '@angular/core/testing';
import * as moment from 'moment';
import { stat } from 'fs';
import * as XLSX from 'xlsx';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
import { SearchService } from 'app/layout/components/toolbar/service/search.service';

export interface DialogData {
  userData: any;
  isEditUser: Boolean;
  buildingRepo: BuildingRepo;
}

export enum UnitType {
  Locker = 1,
  Residential = 2,
  Parking = 3,
  Commercial = 4,
  Common = 5,
  Other = 6
}

export enum TenantStatus {
  OwnerOccupied = 1,
  Leased = 2,
  Vacant = 3,
  Other = 4
}

export enum PersonTenantType {
  Owner = 1,
  Occupant = 2,
  Tenant = 3,
  Other = 4
}

export enum LienType {
  Yes = 1,
  No = 2,
  Other = 3
}


@Component({
  selector: 'building-repository',
  templateUrl: './building-repository.component.html',
  styleUrls: ['./building-repository.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class BuildingRepositoryComponent implements OnInit, OnDestroy {
  @Input()

  // selectedOrganization: any;
  currentUser: any;

  actualBuildingRepoList: BuildingRepo[] = [];
  buildingRepoList: BuildingRepo[] = [];
  export_data: Array<any> = [];

  lastAppliedFilter = 0;
  shouldSortReverse = false;
  sortType: string;

  buildingRepoform: FormGroup;

  // Private
  private _unsubscribeAll: Subject<any>;


  constructor(
    private _appUtil: AppUtilService,
    private _menuService: MenuService,
    private _authService: AuthenticationService,
    private _formBuilder: FormBuilder,
    public dialog: MatDialog,
    private _appService: AppService,
    private _commonFunctionsService: CommonFunctionsService,
    private _searchService: SearchService
  ) {
    this._unsubscribeAll = new Subject();

    this._menuService.currentPageSearchBarSubject.next(SearchBarPageIndex.BUILDING_REPOSITORY);

    this._authService.currentUser.pipe(takeUntil(this._unsubscribeAll)).subscribe(userData => {
      this.currentUser = userData;
      this.getBuildingRepoForOrg(this.currentUser.currentOrgId);
    });

    this._searchService.buildingRepoSearchResults.pipe(takeUntil(this._unsubscribeAll)).subscribe(repoList => {
      if (repoList != null) {
        this.populateBuildingRepoList(repoList);
        this._searchService.buildingRepoSearchSubject.next(null);
      }
    });

    this._searchService.clearSearchForIndex.pipe(takeUntil(this._unsubscribeAll)).subscribe(searchIndex => {
      if (searchIndex != null && searchIndex == SearchBarPageIndex.BUILDING_REPOSITORY) {
        this.getBuildingRepoForOrg(this.currentUser.currentOrgId);
        this._searchService.clearSearchSubject.next(null);
      }
    });

    this.buildingRepoform = this._formBuilder.group({
      unitType: [''],
      personType: [''],
      lien: [''],
      status: ['']
    });
  }


  openCreateBuildingRepositoryDialog() {
    const CreateBuildingRepositoryDialogRef = this.dialog.open(CreateBuildingRepositoryDialog, { data: { userData: this.currentUser }, width: '700px', height: 'auto' });
    CreateBuildingRepositoryDialogRef.afterClosed().subscribe(result => {
      if (result != undefined && result != '') {
        this.getBuildingRepoForOrg(this.currentUser.currentOrgId);
      }
    });
  }

  openEditBuildingRepositoryDialog(event, selectedBuilding) {
    event.stopPropagation();
    if (event.type == 'click') {
      const CreateBuildingRepositoryDialogRef = this.dialog.open(CreateBuildingRepositoryDialog, { data: { buildingRepo: selectedBuilding, userData: this.currentUser }, width: '700px', height: 'auto' });
      CreateBuildingRepositoryDialogRef.afterClosed().subscribe(updatedBuildingDetails => {
        if (updatedBuildingDetails != undefined && updatedBuildingDetails != '') {
          this.getBuildingRepoForOrg(this.currentUser.currentOrgId);
        }
      });
    }
  }

  openViewBuildingRepositoryDialog(event) {
    if (event.type == 'click') {
      const ViewBuildingRepositoryDialogRef = this.dialog.open(ViewBuildingRepositoryDialog, { data: { buildingRepo: event.row }, width: '900px', height: 'auto' });
      ViewBuildingRepositoryDialogRef.afterClosed().subscribe(result => {
        if (result != undefined && result != '') {
          this.getBuildingRepoForOrg(this.currentUser.currentOrgId);
        }
      });
    }
  }

  sortRepo(type) {
    if (this.lastAppliedFilter != type) {
      this.shouldSortReverse = false;
    }

    if (type == 1) {
      this.sortType = 'Unit Type';
      if (!this.shouldSortReverse) {
        this.buildingRepoList.sort((a, b) => b.unitType - a.unitType);
        this.shouldSortReverse = true;
      } else {
        this.buildingRepoList.sort((a, b) => a.unitType - b.unitType);
        this.shouldSortReverse = false;
      }
    } else if (type == 2) {
      this.sortType = 'Status';
      if (!this.shouldSortReverse) {
        this.buildingRepoList.sort((a, b) => b.tenantStatus - a.tenantStatus);
        this.shouldSortReverse = true;
      } else {
        this.buildingRepoList.sort((a, b) => a.tenantStatus - b.tenantStatus);
        this.shouldSortReverse = false;
      }
    } else if (type == 3) {
      this.sortType = 'Person Type';
      if (!this.shouldSortReverse) {
        this.buildingRepoList.sort((a, b) => a.personTenantType - b.personTenantType);
        this.shouldSortReverse = true;
      } else {
        this.buildingRepoList.sort((a, b) => b.personTenantType - a.personTenantType);
        this.shouldSortReverse = false;
      }
    }
    this.lastAppliedFilter = type;
  }

  filterUnitType: number;
  unitTypeChanged(unitType) {
    this.filterUnitType = unitType;
    this.filterBuildingRepoList();
  }

  filterPersonType: number;
  personTypeChanged(personType) {
    this.filterPersonType = personType;
    this.filterBuildingRepoList();
    console.log(this.filterPersonType)
  }

  filterLien: number;
  lienChanged(lien) {
    this.filterLien = lien;
    this.filterBuildingRepoList();
  }

  filterStatus: number;
  statusChanged(status) {
    this.filterStatus = status;
    this.filterBuildingRepoList();
  }

  filterBuildingRepoList() {
    var filterdList: BuildingRepo[];
    var filterApplied = false;

    if (this.filterUnitType != null) {
      filterdList = this.actualBuildingRepoList.filter(buildingRepo => buildingRepo.unitType == this.filterUnitType);
      if (filterdList == null) {
        this.buildingRepoList = filterdList;
        return;
      }
      filterApplied = true;
    }

    if (this.filterPersonType != null) {
      if (filterApplied == true) {
        filterdList = filterdList.filter(buildingRepo => buildingRepo.personTenantType == this.filterPersonType);
      } else {
        filterdList = this.actualBuildingRepoList.filter(buildingRepo => buildingRepo.personTenantType == this.filterPersonType);
      }

      if (filterdList == null) {
        this.buildingRepoList = filterdList;
        return;
      }
    }


    if (this.filterLien != null) {
      if (filterApplied == true) {
        filterdList = filterdList.filter(buildingRepo => buildingRepo.lienType == this.filterLien);
      } else {
        filterdList = this.actualBuildingRepoList.filter(buildingRepo => buildingRepo.lienType == this.filterLien);
      }

      if (filterdList == null) {
        this.buildingRepoList = filterdList;
        return;
      }
    }

    if (this.filterStatus != null) {
      if (filterApplied == true) {
        filterdList = filterdList.filter(buildingRepo => buildingRepo.tenantStatus == this.filterStatus);
      } else {
        filterdList = this.actualBuildingRepoList.filter(buildingRepo => buildingRepo.tenantStatus == this.filterStatus);
      }

      if (filterdList == null) {
        this.buildingRepoList = filterdList;
        return;
      }
    }

    this.buildingRepoList = filterdList;
  }

  onClickclearFilter() {
    this.filterStatus = null;
    this.filterUnitType = null;
    this.filterLien = null;
    this.filterPersonType = null;

    this.buildingRepoList = this.actualBuildingRepoList;
    this.buildingRepoform.controls['unitType'].setValue('0');
    this.buildingRepoform.controls['personType'].setValue('0');
    this.buildingRepoform.controls['lien'].setValue('0');
    this.buildingRepoform.controls['status'].setValue('0');
  }

  // Excel Download
  public ExportTOExcel() {
    let op_json = {};
    for (let i = 0; i < this.buildingRepoList.length; i++) {

      op_json = [];
      op_json['Unit#'] = this.buildingRepoList[i]['unitNumber'];
      op_json['Type'] = this.buildingRepoList[i]['unitTypeDisplayText'];
      op_json['Status'] = this.buildingRepoList[i]['tenantStatusDisplayText'];
      op_json['Lien'] = this.buildingRepoList[i]['lienTypeDisplayText'];
      op_json['Lien Date'] = this.buildingRepoList[i]['lienDisplayDate'];
      op_json['Name'] = this.buildingRepoList[i]['firstName'];
      op_json['Person Type'] = this.buildingRepoList[i]['personTenantTypeDisplayText'];
      op_json['Contact Number'] = this.buildingRepoList[i]['contactNumber'];
      op_json['Email'] = this.buildingRepoList[i]['contactEmail'];
      op_json['Vehicle Make/Model'] = this.buildingRepoList[i]['vehicleMode'];
      op_json['Color'] = this.buildingRepoList[i]['color'];
      op_json['License Number'] = this.buildingRepoList[i]['licenseNumber'];
      op_json['Pet Name'] = this.buildingRepoList[i]['petName'];
      op_json['Pet Description'] = this.buildingRepoList[i]['petDescription'];
      op_json['Emergency Contact Name'] = this.buildingRepoList[i]['emergencyContactName'];
      op_json['Emergency Contact Number'] = this.buildingRepoList[i]['emergencyContactNumber'];
      op_json['Contact Email'] = this.buildingRepoList[i]['emergencyContactEmail'];
      op_json['Handicap Info'] = this.buildingRepoList[i]['handicapInfo'];
      op_json['Comments'] = this.buildingRepoList[i]['comments'];


      this.export_data.push(op_json);
    }
    const workSheet = XLSX.utils.json_to_sheet(this.export_data);
    const workBook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workBook, workSheet, 'SheetName');
    XLSX.writeFile(workBook, 'building_repository_list.xlsx');
    this.export_data = [];
  }

  // Print Data
  public print() {
    let header = ['Unit#', 'Type', 'Status', 'Lien', 'Lien Date', 'Name', 'Person Type', 'Contact Number', 'Email'];
    this.print_pdf(header, this.export_data);
    this.export_data = [];
  }
  public print_pdf(header: any, data: any) {
    for (let i = 0; i < this.buildingRepoList.length; i++) {
      let op_json = [];
      op_json.push(this.buildingRepoList[i]['unitNumber']);
      op_json.push(this.buildingRepoList[i]['unitTypeDisplayText']);
      op_json.push(this.buildingRepoList[i]['tenantStatusDisplayText']);
      op_json.push(this.buildingRepoList[i]['lienTypeDisplayText']);
      op_json.push(this.buildingRepoList[i]['lienDisplayDate']);
      op_json.push(this.buildingRepoList[i]['firstName']);
      op_json.push(this.buildingRepoList[i]['personTenantTypeDisplayText']);
      op_json.push(this.buildingRepoList[i]['contactNumber']);
      op_json.push(this.buildingRepoList[i]['contactEmail']);
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
  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
  }

  getBuildingRepoForOrg(organizationId) {
    this._appService.getBuildingRepoList(organizationId).subscribe((response) => {
      if (response.statusCode == APIResponse.Success) {
        this.populateBuildingRepoList(response.buildingRepositories);
      } else {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.unableToFetchBuildingRepoList);
      }
    }, err => {
      this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
    });
  }

  populateBuildingRepoList(buildingRepoList) {

    let rawbuildingRepoList = buildingRepoList;
    this.buildingRepoList = rawbuildingRepoList.map(buildingRepo => {

      switch (Number(buildingRepo.unitType)) {
        case UnitType.Commercial: {
          buildingRepo.unitTypeDisplayText = 'Commercial Unit';
          break;
        }

        case UnitType.Common: {
          buildingRepo.unitTypeDisplayText = 'Common Element';
          break;
        }

        case UnitType.Locker: {
          buildingRepo.unitTypeDisplayText = 'Locker';
          break;
        }

        case UnitType.Other: {
          buildingRepo.unitTypeDisplayText = 'Other';
          break;
        }

        case UnitType.Parking: {
          buildingRepo.unitTypeDisplayText = 'Parking Unit';
          break;
        }

        case UnitType.Residential: {
          buildingRepo.unitTypeDisplayText = 'Residential Unit';
          break;
        }
      }

      switch (Number(buildingRepo.tenantStatus)) {
        case TenantStatus.Leased: {
          buildingRepo.tenantStatusDisplayText = 'Leased';
          break;
        }

        case TenantStatus.Other: {
          buildingRepo.tenantStatusDisplayText = 'Other';
          break;
        }

        case TenantStatus.OwnerOccupied: {
          buildingRepo.tenantStatusDisplayText = 'Owner Occupied';
          break;
        }

        case TenantStatus.Vacant: {
          buildingRepo.tenantStatusDisplayText = 'Vacant';
          break;
        }
      }

      if (buildingRepo.lienType != null && buildingRepo.lienType != '') {
        switch (Number(buildingRepo.lienType)) {
          case LienType.Yes: {
            buildingRepo.lienTypeDisplayText = 'Yes';
            break;
          }

          case LienType.No: {
            buildingRepo.lienTypeDisplayText = 'No';
            break;
          }

          case LienType.Other: {
            buildingRepo.lienTypeDisplayText = 'Other';
            break;
          }
        }
      } else {
        buildingRepo.lienTypeDisplayText = '--';
      }

      switch (Number(buildingRepo.personTenantType)) {
        case PersonTenantType.Occupant: {
          buildingRepo.personTenantTypeDisplayText = 'Occupant';
          break;
        }

        case PersonTenantType.Other: {
          buildingRepo.personTenantTypeDisplayText = 'Other';
          break;
        }

        case PersonTenantType.Owner: {
          buildingRepo.personTenantTypeDisplayText = 'Owner';
          break;
        }

        case PersonTenantType.Tenant: {
          buildingRepo.personTenantTypeDisplayText = 'Tenant';
          break;
        }
      }


      if (buildingRepo.contactNumber == null || buildingRepo.contactNumber == '') {
        buildingRepo.displayContactNumber = '--';
      } else {
        buildingRepo.displayContactNumber = buildingRepo.contactNumber;
      }

      if (buildingRepo.contactEmail == null || buildingRepo.contactEmail == '') {
        buildingRepo.displayContactEmail = '--';
      } else {
        buildingRepo.displayContactEmail = buildingRepo.contactEmail;
      }


      if (buildingRepo.dateOfLien != null && buildingRepo.dateOfLien != '') {
        buildingRepo.lienDisplayDate = moment(buildingRepo.dateOfLien).format(AppDateFormat.DisplayFormat);
      } else {
        buildingRepo.lienDisplayDate = '--';
      }
      return buildingRepo;
    })


    this.buildingRepoList.sort((a, b) => { return <any>new Date(b.createdAt) - <any>new Date(a.createdAt) });


    this.actualBuildingRepoList = Object.assign([], this.buildingRepoList);
  }



  /**
   * On destroy
   */
  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}


@Component({
  selector: 'create-building-repository-dialog',
  templateUrl: 'create-building-repository-dialog.html',
  animations: fuseAnimations
})

export class CreateBuildingRepositoryDialog {
  createBuildingRepositoryform: FormGroup;
  buildingDetails: BuildingRepo;
  isEditMode = false;
  currentUser;

  constructor(
    private _appService: AppService,
    private _appUtil: AppUtilService,
    private _formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<ViewBuildingRepositoryDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {

    this.currentUser = data.userData;
    if (data.buildingRepo != null) {
      this.isEditMode = true;
      this.buildingDetails = data.buildingRepo;

      var lienDate: any;
      lienDate = moment(this.buildingDetails.lienDisplayDate);
      if (!lienDate.isValid()) {
        lienDate = '';
      }


      this.createBuildingRepositoryform = this._formBuilder.group({
        unitNumber: [this.buildingDetails.unitNumber, Validators.required],
        unitType: [this.buildingDetails.unitType.toString(), Validators.required],
        status: [this.buildingDetails.tenantStatus.toString(), Validators.required],
        lien: [this.buildingDetails.lienType.toString()],
        lienDate: [lienDate],
        firstName: [this.buildingDetails.firstName, Validators.required],
        personType: [this.buildingDetails.personTenantType.toString(), Validators.required],
        comments: [this.buildingDetails.comments],
        contactNumber: [this.buildingDetails.contactNumber, Validators.pattern("^((\\+91-?)|0)?[0-9]{10}$")],
        contactEmail: [this.buildingDetails.contactEmail, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)],
        vehicleMake: [this.buildingDetails.vehicleMode],
        vechileColor: [this.buildingDetails.color],
        licenceNumber: [this.buildingDetails.licenseNumber],
        petName: [this.buildingDetails.petName],
        petDescription: [this.buildingDetails.petDescription],
        emergencyContactName: [this.buildingDetails.emergencyContactName],
        emergencyContactNumber: [this.buildingDetails.emergencyContactNumber, Validators.pattern("^((\\+91-?)|0)?[0-9]{10}$")],
        emergencyEmail: [this.buildingDetails.emergencyContactEmail, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)],
        handicapInfo: [this.buildingDetails.handicapInfo]
      });
    } else {
      this.isEditMode = false;
      this.createBuildingRepositoryform = this._formBuilder.group({
        unitNumber: ['', Validators.required],
        unitType: ['', Validators.required],
        status: ['', Validators.required],
        lien: [''],
        lienDate: [''],
        firstName: ['', Validators.required],
        personType: ['', Validators.required],
        comments: [''],
        contactNumber: ['', Validators.pattern("^((\\+1-?)|0)?[0-9]{10}$")],
        contactEmail: ['', Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)],
        vehicleMake: [''],
        vechileColor: [''],
        licenceNumber: [''],
        petName: [''],
        petDescription: [''],
        emergencyContactName: [''],
        emergencyContactNumber: ['', Validators.pattern("^((\\+1-?)|0)?[0-9]{10}$")],
        emergencyEmail: ['', Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)],
        handicapInfo: ['']
      });
    }
  }

  unitType;
  unitTypeUpdated(unitType) {
    this.unitType = unitType;
  }

  tenentStatus;
  statusUpdated(status) {
    this.tenentStatus = status;
  }

  lien;
  lienUpdated(lien) {
    this.lien = lien;
  }

  personType;
  personTypeUpdated(personType) {
    this.personType = personType;
  }

  submitBuildingDetails() {

    var buildingRepo: BuildingRepo;

    if (this.isEditMode) {
      buildingRepo = Object.assign({}, this.buildingDetails);
      buildingRepo.clientOrganisationId = this.currentUser.currentOrgId;
    } else {
      buildingRepo = new BuildingRepo();
      buildingRepo.createdBy = this.currentUser.clientId;
      buildingRepo.clientOrganisationId = this.currentUser.currentOrgId;
    }

    if (this.unitType != null) {
      buildingRepo.unitType = this.unitType;

      switch (Number(buildingRepo.unitType)) {
        case UnitType.Commercial: {
          buildingRepo.unitTypeDisplayText = 'Commercial Unit';
          break;
        }

        case UnitType.Common: {
          buildingRepo.unitTypeDisplayText = 'Common Element';
          break;
        }

        case UnitType.Locker: {
          buildingRepo.unitTypeDisplayText = 'Locker';
          break;
        }

        case UnitType.Other: {
          buildingRepo.unitTypeDisplayText = 'Other';
          break;
        }

        case UnitType.Parking: {
          buildingRepo.unitTypeDisplayText = 'Parking Unit';
          break;
        }

        case UnitType.Residential: {
          buildingRepo.unitTypeDisplayText = 'Residential Unit';
          break;
        }
      }
    }

    if (this.tenentStatus != null) {
      buildingRepo.tenantStatus = this.tenentStatus;

      switch (Number(buildingRepo.tenantStatus)) {
        case TenantStatus.Leased: {
          buildingRepo.tenantStatusDisplayText = 'Leased';
          break;
        }

        case TenantStatus.Other: {
          buildingRepo.tenantStatusDisplayText = 'Other';
          break;
        }

        case TenantStatus.OwnerOccupied: {
          buildingRepo.tenantStatusDisplayText = 'Owner Occupied';
          break;
        }

        case TenantStatus.Vacant: {
          buildingRepo.tenantStatusDisplayText = 'Vacant';
          break;
        }
      }
    }

    if (this.lien != null) {
      buildingRepo.lienType = this.lien;

      switch (Number(buildingRepo.lienType)) {
        case LienType.Yes: {
          buildingRepo.lienTypeDisplayText = 'Yes';
          break;
        }

        case LienType.No: {
          buildingRepo.lienTypeDisplayText = 'No';
          break;
        }

        case LienType.Other: {
          buildingRepo.lienTypeDisplayText = 'Other';
          break;
        }
      }
    }

    if (this.personType != null) {
      buildingRepo.personTenantType = this.personType;

      switch (Number(buildingRepo.personTenantType)) {
        case PersonTenantType.Occupant: {
          buildingRepo.personTenantTypeDisplayText = 'Occupant';
          break;
        }

        case PersonTenantType.Other: {
          buildingRepo.personTenantTypeDisplayText = 'Other';
          break;
        }

        case PersonTenantType.Owner: {
          buildingRepo.personTenantTypeDisplayText = 'Owner';
          break;
        }

        case PersonTenantType.Tenant: {
          buildingRepo.personTenantTypeDisplayText = 'Tenant';
          break;
        }
      }
    }


    var lienDate = this.createBuildingRepositoryform.value['lienDate'];

    buildingRepo.unitNumber = this.createBuildingRepositoryform.value['unitNumber'];
    if (lienDate != null && lienDate != '') {
      buildingRepo.dateOfLien = lienDate.format(AppDateFormat.ServiceFormat);
      buildingRepo.lienDisplayDate = lienDate.format(AppDateFormat.DisplayFormat);
    }

    buildingRepo.firstName = this.createBuildingRepositoryform.value['firstName'];
    buildingRepo.comments = this.createBuildingRepositoryform.value['comments'];
    buildingRepo.contactNumber = this.createBuildingRepositoryform.value['contactNumber'];
    buildingRepo.contactEmail = this.createBuildingRepositoryform.value['contactEmail'];
    buildingRepo.vehicleMode = this.createBuildingRepositoryform.value['vehicleMake'];
    buildingRepo.color = this.createBuildingRepositoryform.value['vechileColor'];
    buildingRepo.licenseNumber = this.createBuildingRepositoryform.value['licenceNumber'];
    buildingRepo.petName = this.createBuildingRepositoryform.value['petName'];
    buildingRepo.petDescription = this.createBuildingRepositoryform.value['petDescription'];
    buildingRepo.emergencyContactName = this.createBuildingRepositoryform.value['emergencyContactName'];
    buildingRepo.emergencyContactNumber = this.createBuildingRepositoryform.value['emergencyContactNumber'];
    buildingRepo.emergencyContactEmail = this.createBuildingRepositoryform.value['emergencyEmail'];
    buildingRepo.handicapInfo = this.createBuildingRepositoryform.value['handicapInfo'];

    var reqBuildingDetails = {
      "clientOrganisationId": buildingRepo.clientOrganisationId,
      "color": buildingRepo.color,
      "comments": buildingRepo.comments,
      "contactEmail": buildingRepo.contactEmail,
      "contactNumber": buildingRepo.contactNumber,
      "createdBy": buildingRepo.createdBy,
      "dateOfLien": buildingRepo.dateOfLien,
      "emergencyContactEmail": buildingRepo.emergencyContactEmail,
      "emergencyContactName": buildingRepo.emergencyContactName,
      "emergencyContactNumber": buildingRepo.emergencyContactNumber,
      "firstName": buildingRepo.firstName,
      "handicapInfo": buildingRepo.handicapInfo,
      "lastName": buildingRepo.lastName,
      "licenseNumber": buildingRepo.licenseNumber,
      "lienType": buildingRepo.lienType,
      "personTenantType": buildingRepo.personTenantType,
      "petDescription": buildingRepo.petDescription,
      "petName": buildingRepo.petName,
      "tenantStatus": buildingRepo.tenantStatus,
      "unitNumber": buildingRepo.unitNumber,
      "unitType": buildingRepo.unitType,
      "vehicleMode": buildingRepo.vehicleMode
    }

    if (this.isEditMode) {
      reqBuildingDetails['id'] = buildingRepo.id;
    }


    if (this.isEditMode == false) {
      this._appService.createBuildingRepo(reqBuildingDetails).subscribe((response) => {
        if (response.statusCode == APIResponse.Success) {
          this._appUtil.showAlert(AlertType.Success, AppLiterals.addNewBuildingDetailsSuccessful);
          this.dialogRef.close(buildingRepo);
        } else {
          this._appUtil.showAlert(AlertType.Error, AppLiterals.unableToAddBuildingRepo);
        }
      }, err => {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
      });
    } else {
      this._appService.updateBuildingRepo(reqBuildingDetails).subscribe((response) => {
        if (response.statusCode == APIResponse.Success) {
          this._appUtil.showAlert(AlertType.Success, AppLiterals.updateBuildingDetailSuccessful);
          this.dialogRef.close(buildingRepo);
        } else {
          this._appUtil.showAlert(AlertType.Error, AppLiterals.unableToUpdateBuildingRepo);
        }
      }, err => {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
      });
    }
  }
}


@Component({
  selector: 'view-building-repository-dialog',
  templateUrl: 'view-building-repository-dialog.html',
  animations: fuseAnimations
})

export class ViewBuildingRepositoryDialog {
  buildingRepoForm: FormGroup;
  buildingDetails: BuildingRepo;
  constructor(
    public dialogRef: MatDialogRef<ViewBuildingRepositoryDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.buildingDetails = data.buildingRepo;
  }
}