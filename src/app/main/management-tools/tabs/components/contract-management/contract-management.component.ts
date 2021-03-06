import { Component, OnDestroy, OnInit, ViewEncapsulation, ElementRef, ViewChild, Inject } from '@angular/core';
import { Subject, Observable, from } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators, FormControl, FormArray } from '@angular/forms';
import { fuseAnimations } from '@condonuity/animations';
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete';
import { map, startWith } from 'rxjs/operators';
import { MatChipInputEvent } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Tag } from 'app/main/profile/tabs/models/tag.model';
import { City } from 'app/main/profile/tabs/models/city.model';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MenuService } from "../../../../../layout/components/toolbar/menu.service";
import { SearchBarPageIndex } from "../../../../../utils/app-constants";
import { AppService } from '../../../../services/app.service';
import { AuthenticationService } from '../../../../../_services/authentication.service';
import { APIResponse, AppLiterals, AlertType, AppDateFormat } from '../../../../../utils/app-constants';
import { AppUtilService } from '../../../../../utils/app-util.service';
import { AnnualContract } from '../contract-management/model/annual-contract.model';
import * as moment from 'moment';
import { ConfirmationDialogComponent, DialogType } from '../../../../Shared/confirmation-dialog/confirmation-dialog.component';

import * as XLSX from 'xlsx';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
import { SearchService } from 'app/layout/components/toolbar/service/search.service';

export interface DialogData {
  userData;
  currentUser;
}

export enum TermUnits {
  DAYS = 1,
  MONTHS = 2,
  YEARS = 3
}

export enum CostTermUnits {
  WEEKLY = 1,
  MONTHLY = 2,
  YEARLY = 3
}

export enum RenewalType {
  AUTO = 1,
  MANUAL = 2
}

@Component({
  selector: 'contract-management',
  templateUrl: './contract-management.component.html',
  styleUrls: ['./contract-management.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})

export class ContractManagementComponent implements OnInit, OnDestroy {
  pageOfItems: Array<any> = [];

  isDataAvailableToDisplay = false;
  currentUser: any;
  // currentUserOrg: any;
  contractList = [];

  lastAppliedFilter = 0;
  shouldSortReverse = false;
  sortType = '';

  annualContractList: AnnualContract[];
  // Private
  private _unsubscribeAll: Subject<any>;

  export_data: Array<any> = [];

  /**
   * Constructor
   *
   * @param {ProfileService} _profileService
   */
  constructor(
    private _authService: AuthenticationService,
    private _appUtil: AppUtilService,
    private _appService: AppService,
    private _menuService: MenuService,
    private _formBuilder: FormBuilder,
    public dialog: MatDialog,
    private _searchService: SearchService

  ) {

    this._unsubscribeAll = new Subject();
    this._menuService.currentPageSearchBarSubject.next(SearchBarPageIndex.CONTRACTS);

    this._searchService.contractsSearchResults.pipe(takeUntil(this._unsubscribeAll)).subscribe(contracts => {
      if (contracts != null) {
        this.populateContractList(contracts, 1);
        this._searchService.contractsSearchSubject.next(null);
      }
    });

    this._searchService.clearSearchForIndex.pipe(takeUntil(this._unsubscribeAll)).subscribe(searchIndex => {
      if (searchIndex != null && searchIndex == SearchBarPageIndex.CONTRACTS) {
        this.getAnnualContractList(this.currentUser.currentOrgId);
        this._searchService.clearSearchSubject.next(null);
      }
    });

    this._authService.currentUser.pipe(takeUntil(this._unsubscribeAll)).subscribe(userData => {
      this.currentUser = userData;
      this.getAnnualContractList(this.currentUser.currentOrgId);

    });
  }


  sortCondos(type) {
    console.log(type)
  }


  addNewContract() {
    const addContractRef = this.dialog.open(AddContractDialog, { width: 'auto', height: 'auto', data: { currentUser: this.currentUser } });
    addContractRef.afterClosed().subscribe(result => {
      if (result) {
        this.getAnnualContractList(this.currentUser.currentOrgId);

        // let addedContract: AnnualContract[] = [];
        // addedContract.push(result);
        // addedContract = this.populateContractList(addedContract, 2);
        // this.isDataAvailableToDisplay = true;
        // this.contractList.splice(0, 0, addedContract[0]);
      }
    });
  }

  deleteContract(contract, index) {
    const userNewRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '350px', data: {
        type: DialogType.TwoButtonDialog,
        title: "Contract Delete Confirmation",
        message: "Are you sure, you want to delete the contract?",
        yesButtonTitle: "Yes",
        noButtonTitle: "No"
      }
    });

    userNewRef.afterClosed().subscribe(result => {
      if (result != undefined && result != '') {
        if (result == 'true') {
          this.confirmDeleteContract(contract.id, index);
        }
      }
    });
  }

  confirmDeleteContract(contractId, contractIndex) {
    this._appService.deleteAnnaualContract(contractId).subscribe((response: any) => {
      if (response.statusCode == APIResponse.Success) {
        this._appUtil.showAlert(AlertType.Success, AppLiterals.deleteAnnualContractSuccessful);
        this.getAnnualContractList(this.currentUser.currentOrgId);
      } else {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.unableToDeleteContract);
      }
    }, err => {
      this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
    });
  }


  editContract(id) {
    const editContractRef = this.dialog.open(AddContractDialog, { width: 'auto', height: 'auto', data: { userData: this.contractList[id], currentUser: this.currentUser } });
    editContractRef.afterClosed().subscribe(result => {
      if (result) {
        this.getAnnualContractList(this.currentUser.currentOrgId);
      }
    });
  }
  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    this._menuService.currentPageSearchBarSubject.next(SearchBarPageIndex.CONTRACTS);
  }

  onChangePage(pageOfItems: Array<any>) {
    // update current page of items
    this.pageOfItems = pageOfItems;
  }

  getAnnualContractList(clientOrgId: number) {
    this._appService.getClientAnnualContractList(clientOrgId).subscribe((response) => {

      if (response.statusCode == APIResponse.Success) {
        this.populateContractList(response.clientContracts, 1);
      } else {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.unableToFetchContractList);
      }
    }, err => {
      this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
    });
  }

  populateContractList(annualContracts, processType) {

    annualContracts = annualContracts.map(contract => {


      switch (Number(contract.termUnits)) {
        case TermUnits.DAYS: {
          contract.termDisplayUnit = 'Days';
          break;
        }
        case TermUnits.MONTHS: {
          contract.termDisplayUnit = 'Months';
          break;
        }
        case TermUnits.YEARS: {
          contract.termDisplayUnit = 'Years';
          break;
        }
      }

      switch (Number(contract.costTermUnits)) {
        case CostTermUnits.WEEKLY: {
          contract.costTerm = 'Weekly';
          break;
        }
        case CostTermUnits.MONTHLY: {
          contract.costTerm = 'Monthly';
          break;
        }
        case CostTermUnits.YEARLY: {
          contract.costTerm = 'Yearly';
          break;
        }
      }

      switch (Number(contract.renewalType)) {
        case RenewalType.AUTO: {
          contract.renewal = 'Auto';
          break;
        }
        case RenewalType.MANUAL: {
          contract.renewal = 'Manual';
          break;
        }
      }

      if (contract.gstAvailablity == 1 || contract.gstAvailablity == '1') {
        contract.gstInclusion = 'Yes';
      } else {
        contract.gstInclusion = 'No';
      }

      switch (Number(contract.cancellationUnits)) {
        case TermUnits.DAYS: {
          contract.cancelUnits = 'Days';
          break;
        }
        case TermUnits.MONTHS: {
          contract.cancelUnits = 'Months';
          break;
        }
        case TermUnits.YEARS: {
          contract.cancelUnits = 'Years';
          break;
        }
      }

      contract.signedDate = moment(contract.signedDate).format(AppDateFormat.DisplayFormat);
      contract.expiryDate = moment(contract.expiryDate).format(AppDateFormat.DisplayFormat);

      return contract;
    });

    if (processType == 1) {
      this.isDataAvailableToDisplay = true;
      this.contractList = annualContracts;
    } else {
      return annualContracts;
    }

    this.sortContracts(1);
  }

  sortContracts(type) {
    if (this.lastAppliedFilter != type) {
      this.shouldSortReverse = false;
    }

    if (type == 1) {
      this.sortType = 'Contractor Name';
      if (!this.shouldSortReverse) {
        this.contractList.sort((a, b) => a.vendorName.localeCompare(b.vendorName));
        this.shouldSortReverse = true;
      } else {
        this.contractList.sort((a, b) => b.vendorName.localeCompare(a.vendorName));
        this.shouldSortReverse = false;
      }

    } else if (type == 2) {
      this.sortType = 'Expiry Date';
      if (!this.shouldSortReverse) {
        //this.contractList.sort((a, b) => a.expiryDate.localeCompare(b.expiryDate));
        this.contractList.sort((a, b) => { return <any>new Date(a.expiryDate) - <any>new Date(b.expiryDate) });
        this.shouldSortReverse = true;
      } else {
        //this.contractList.sort((a, b) => b.expiryDate.localeCompare(a.expiryDate));
        this.contractList.sort((a, b) => { return <any>new Date(b.expiryDate) - <any>new Date(a.expiryDate) });
        this.shouldSortReverse = false;
      }
    } else if (type == 3) {
      this.sortType = 'Date';
      if (!this.shouldSortReverse) {
        this.contractList.sort((a, b) => { return <any>new Date(a.createdAt) - <any>new Date(b.createdAt) });
        this.shouldSortReverse = true;
      } else {
        this.contractList.sort((a, b) => { return <any>new Date(b.createdAt) - <any>new Date(a.createdAt) });
        this.shouldSortReverse = false;
      }
    }

    this.contractList = [...this.contractList];
    this.lastAppliedFilter = type;
  }


  public exportTOExcel() {
    let op_json = {};
    for (let i = 0; i < this.contractList.length; i++) {
      op_json = [];
      op_json['Contractor Name'] = this.contractList[i]['vendorName'];
      op_json['Services'] = this.contractList[i]['services'];
      op_json['Term'] = this.contractList[i]['term'];
      op_json['Term Units'] = this.contractList[i]['termDisplayUnit'];
      op_json['Signed Date'] = this.contractList[i]['signedDate'];
      op_json['Expiry Date'] = this.contractList[i]['expiryDate'];
      op_json['Renewal'] = this.contractList[i]['renewal'];
      op_json['Cost'] = this.contractList[i]['cost'];
      op_json['Cost Term'] = this.contractList[i]['costTerm'];
      op_json['Including Gst?'] = this.contractList[i]['gstInclusion'];
      op_json['Cancellation Term'] = this.contractList[i]['cancellationTerm'];
      op_json['Cancellation Units'] = this.contractList[i]['cancelUnits'];
      op_json['Expected Increase'] = this.contractList[i]['expectedIncrease'];
      op_json['Notes'] = this.contractList[i]['notes'];
      this.export_data.push(op_json);
    }
    const workSheet = XLSX.utils.json_to_sheet(this.export_data);
    const workBook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workBook, workSheet, 'SheetName');
    XLSX.writeFile(workBook, 'annual__contract_list.xlsx');
    this.export_data = [];
  }

  public print() {
    let header = ['Vendor Name', 'Services', 'Term', 'Term Units', 'Signed Date', 'Expiry Date', 'Renewal', 'Cost', 'Cost Term', 'Gst Status', 'Cancellation Term', 'Cancellation Units', 'Expected Increase', 'Notes'];
    this.printPdf(header, this.export_data);
    this.export_data = [];
  }

  public printPdf(header: any, data: any) {
    for (let i = 0; i < this.contractList.length; i++) {
      let op_json = [];
      op_json.push(this.contractList[i]['vendorName']);
      op_json.push(this.contractList[i]['services']);
      op_json.push(this.contractList[i]['term']);
      op_json.push(this.contractList[i]['termDisplayUnit']);
      op_json.push(this.contractList[i]['signedDate']);
      op_json.push(this.contractList[i]['expiryDate']);
      op_json.push(this.contractList[i]['renewal']);
      op_json.push(this.contractList[i]['cost']);
      op_json.push(this.contractList[i]['costTerm']);
      op_json.push(this.contractList[i]['gstInclusion']);
      op_json.push(this.contractList[i]['cancellationTerm']);
      op_json.push(this.contractList[i]['cancelUnits']);
      op_json.push(this.contractList[i]['expectedIncrease']);
      op_json.push(this.contractList[i]['notes']);
      this.export_data.push(op_json);
    }
    let doc: any = new jsPDF('l', 'pt', 'a4');
    doc.autoTable({
      head: [header],
      body: data
    });
    doc.autoPrint();
    window.open(doc.output('bloburl'), '_blank');
    this.export_data = [];
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
  selector: 'contract-creation-dialog',
  templateUrl: 'contract-creation-dialog.html',
})

export class AddContractDialog {
  isEditMode = false;
  currentUser: any;
  userData: any;
  dialogType: number;
  contractForm: FormGroup;
  constructor(
    private _appService: AppService,
    private _appUtil: AppUtilService,
    private _formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<AddContractDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {

    this.currentUser = data.currentUser;

    if (data.userData) {
      this.isEditMode = true;

      this.userData = data.userData;
      let editData = data.userData;


      let renewalStatus = '';
      let costTerm = '';
      let gstStatus = '';
      let cancellationUnit = '';
      let termUnit = '';

      switch (Number(editData.termUnits)) {
        case TermUnits.DAYS: {
          termUnit = 'days';
          break;
        }
        case TermUnits.MONTHS: {
          termUnit = 'months';
          break;
        }
        case TermUnits.YEARS: {
          termUnit = 'years';
          break;
        }
      }

      switch (Number(editData.costTermUnits)) {
        case CostTermUnits.WEEKLY: {
          costTerm = 'weekly';
          break;
        }
        case CostTermUnits.MONTHLY: {
          costTerm = 'monthly';
          break;
        }
        case CostTermUnits.YEARLY: {
          costTerm = 'yearly';
          break;
        }
      }

      switch (Number(editData.renewalType)) {
        case RenewalType.AUTO: {
          renewalStatus = 'auto';
          break;
        }
        case RenewalType.MANUAL: {
          renewalStatus = 'manual';
          break;
        }
      }

      if (editData.gstAvailablity == 1 || editData.gstAvailablity == '1') {
        gstStatus = 'yes';
      } else {
        gstStatus = 'no';
      }


      switch (Number(editData.cancellationUnits)) {
        case TermUnits.DAYS: {
          cancellationUnit = 'days';
          break;
        }
        case TermUnits.MONTHS: {
          cancellationUnit = 'months';
          break;
        }
        case TermUnits.YEARS: {
          cancellationUnit = 'years';
          break;
        }
      }


      let signedDate: any;
      let expiryDate: any;

      if (editData.signedDate != null && editData.signedDate != '' && editData.signedDate != 'Invalid date') {
        signedDate = moment(editData.signedDate);
      }

      if (editData.expiryDate != null && editData.expiryDate != '' && editData.expiryDate != 'Invalid date') {
        expiryDate = moment(editData.expiryDate);
      }


      if (signedDate == null) {
        signedDate = '';
      }

      if (expiryDate == null) {
        expiryDate = '';
      }

      this.dialogType = 2;
      this.contractForm = this._formBuilder.group({

        vendorName: [editData.vendorName, Validators.required],
        services: [editData.services],
        term: [editData.term, [Validators.pattern("^[0-9]*$")]],
        termUnits: [termUnit],
        signedDate: [signedDate],
        expiryDate: [expiryDate],
        renewal: [renewalStatus],
        cost: [editData.cost, [Validators.pattern('^-?[0-9]\\d*(\\.\\d{1,2})?$')]],
        costTerm: [costTerm],
        gstInclusion: [gstStatus],
        cancelTerm: [editData.cancellationTerm, [Validators.pattern("^[0-9]*$")]],
        cancelUnits: [cancellationUnit],
        expectIncrease: [editData.expectedIncrease],
        notes: [editData.notes]
      });
    } else {
      this.dialogType = 1;
      this.contractForm = this._formBuilder.group({
        vendorName: ['', Validators.required],
        services: [''],
        term: ['', [Validators.pattern("^[0-9]*$")]],
        termUnits: [''],
        signedDate: [''],
        expiryDate: [''],
        renewal: [''],
        cost: ['', [Validators.pattern('^-?[0-9]\\d*(\\.\\d{1,2})?$')]],
        costTerm: [''],
        gstInclusion: [''],
        cancelTerm: ['', [Validators.pattern("^[0-9]*$")]],
        cancelUnits: [''],
        expectIncrease: [''],
        notes: ['']
      });
    }
  }

  renewalStatus = 0;
  costTerm = 0;
  gstStatus = 0;
  cancellationUnit = 0;
  termUnit = 0;

  renewalUpdated(value) {
    if (value == 'auto') {
      this.renewalStatus = 1;
    } else {
      this.renewalStatus = 2;
    }
  }

  costTermUpdated(value) {
    if (value == 'yearly') {
      this.costTerm = 3;
    } else if (value == 'monthly') {
      this.costTerm = 2;
    } else {
      this.costTerm = 1;
    }
  }

  gstUpdated(value) {
    if (value == 'yes') {
      this.gstStatus = 1;
    } else {
      this.gstStatus = 2;
    }
  }

  cancellationUnitUpdated(value) {
    if (value == 'years') {
      this.cancellationUnit = 3;
    } else if (value == 'months') {
      this.cancellationUnit = 2;
    } else {
      this.cancellationUnit = 1;
    }
  }


  termUnitUpdated(value) {
    if (value == 'years') {
      this.termUnit = 3;
    } else if (value == 'months') {
      this.termUnit = 2;
    } else {
      this.termUnit = 1;
    }
  }

  submitContract() {
    let expiryDate = "";
    let signedDate = "";
    if (this.contractForm.value['expiryDate'] != null && this.contractForm.value['expiryDate'] != '') {
      expiryDate = this.contractForm.value['expiryDate'].format(AppDateFormat.ServiceFormat);
    }

    if (this.contractForm.value['signedDate'] != null && this.contractForm.value['signedDate'] != '') {
      signedDate = this.contractForm.value['signedDate'].format(AppDateFormat.ServiceFormat)
    }

    if (this.isEditMode) {

      if (this.renewalStatus == 0) {
        this.renewalStatus = this.userData.renewalType;
      }

      if (this.costTerm == 0) {
        this.costTerm = this.userData.costTermUnits;
      }

      if (this.gstStatus == 0) {
        this.gstStatus = this.userData.gstAvailablity;
      }

      if (this.cancellationUnit == 0) {
        this.cancellationUnit = this.userData.cancellationUnits;
      }

      if (this.termUnit == 0) {
        this.termUnit = this.userData.termUnits;
      }

    }


    let contractId = 0;
    if (this.isEditMode) {
      contractId = this.userData.id;
    }

    let contractDetails = {
      'id': contractId,
      'cancellationTerm': this.contractForm.value['cancelTerm'],
      'cancellationUnits': this.cancellationUnit,
      'clientId': this.currentUser.clientId,
      'clientOrganisationId': this.currentUser.currentOrgId,
      'cost': this.contractForm.value['cost'],
      'costTermUnits': this.costTerm,
      'expectedIncrease': this.contractForm.value['expectIncrease'],
      'expiryDate': expiryDate,
      'gstAvailablity': this.gstStatus,
      'notes': this.contractForm.value['notes'],
      'renewalType': this.renewalStatus,
      'services': this.contractForm.value['services'],
      'signedDate': signedDate,
      'status': 0,
      'term': this.contractForm.value['term'],
      'termUnits': this.termUnit,
      'vendorName': this.contractForm.value['vendorName']
    }

    if (this.isEditMode) {
      this._appService.updateAnnaualContract(contractDetails).subscribe((response: any) => {
        if (response.statusCode == APIResponse.Success) {
          this._appUtil.showAlert(AlertType.Success, AppLiterals.updateAnnualContractSuccessful);
          this.dialogRef.close(contractDetails);
          console.log(contractDetails)
        } else {
          this._appUtil.showAlert(AlertType.Error, AppLiterals.unableToUpdateContract);
        }
      }, err => {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
      });
    } else {
      this._appService.addNewAnnaualContract(contractDetails).subscribe((response: any) => {
        if (response.statusCode == APIResponse.Success) {
          this._appUtil.showAlert(AlertType.Success, AppLiterals.addAnnualContractSuccessful);
          this.dialogRef.close(contractDetails);
        } else {
          this._appUtil.showAlert(AlertType.Error, AppLiterals.unableToAddContract);
        }
      }, err => {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
      });
    }
  }
}