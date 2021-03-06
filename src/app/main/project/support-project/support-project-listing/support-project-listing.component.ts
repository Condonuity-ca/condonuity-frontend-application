import { Component, OnDestroy, OnInit, ViewEncapsulation, ElementRef, ViewChild, Inject } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators, FormControl, FormArray } from '@angular/forms';
import { fuseAnimations } from '@condonuity/animations';
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete';
import { map, startWith } from 'rxjs/operators';
import { MatChipInputEvent } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { DatePipe } from '@angular/common';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { ProjectPostingService } from '../../client-project/components/project-view/project-posting/services/project-posting.service';
import { VendorProject } from '../../models/vendor-project.model';
import { Tag } from 'app/main/profile/tabs/models/tag.model';
import { City } from 'app/main/profile/tabs/models/city.model';
import { MenuService } from 'app/layout/components/toolbar/menu.service';
import { AppService } from 'app/main/services/app.service';
import { AppUtilService } from 'app/utils/app-util.service';
import { AuthenticationService } from 'app/_services';
import { SearchService } from 'app/layout/components/toolbar/service/search.service';
import { SearchBarPageIndex, UserType, APIResponse, AlertType, ProjectStatus, ContractType, AppDateFormat } from 'app/utils/app-enum';
import { AppLiterals } from 'app/utils/app-literals';
import * as moment from 'moment';
import * as XLSX from 'xlsx';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
import { User } from 'app/main/account/models/user.model';

enum ProjectState {
  Active = 1,
  InActive = 2
}

@Component({
  selector: 'support-project-listing',
  templateUrl: './support-project-listing.component.html',
  styleUrls: ['./support-project-listing.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})


export class SupportProjectListingComponent implements OnInit, OnDestroy {



  projectList = [];
  actualProjectList: VendorProject[];
  filteredProjects: VendorProject[] = [];

  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];

  tagCtrl = new FormControl();
  allTags: Tag[];
  selectedTags: Tag[] = [];
  filteredTags: Observable<Tag[]>;

  cityCtrl = new FormControl();
  cityNames: City[];
  selectedCities: City[] = [];
  filteredCities: Observable<City[]>;

  @ViewChild('tagInput', { static: false }) tagInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto', { static: false }) matAutocomplete: MatAutocomplete;

  @ViewChild('cityInput', { static: false }) cityInput: ElementRef<HTMLInputElement>;
  @ViewChild('cityAuto', { static: false }) cityMatAutocomplete: MatAutocomplete;

  @ViewChild("tagInput", { static: false }) tagField: ElementRef;
  @ViewChild("cityInput", { static: false }) cityField: ElementRef;

  filterSelectedTagIdList: [] = [];
  filterSelectedCityIdList: string[] = [];

  isDataAvailableToLoad = false;
  isTagsAvailableToLoad = false;
  isCitiesAvailableToLoad = false;
  disableClearFilterButton = true;

  filterForm: FormGroup;
  currentUser: any;

  bidFromCloseDate: any;
  bidToCloseDate: any;

  bidFromCompletionDate: any;
  bidToCompletionDate: any;

  private _unsubscribeAll: Subject<any>;
  export_data: Array<any> = [];

  constructor(
    private _formBuilder: FormBuilder,
    private _menuService: MenuService,
    private _appService: AppService,
    private _appUtil: AppUtilService,
    private router: Router,
    private _projPostService: ProjectPostingService,
    public datepipe: DatePipe,
    private _authService: AuthenticationService,
    private _searchService: SearchService
  ) {
    this._unsubscribeAll = new Subject();

    this.getProjectTags();
    this.getServiceCities();

    this.filterForm = this._formBuilder.group({
      tags: [''],
      servicedCities: [''],
      completionDate: [''],
      bidCloseDate: ['']
    });

    this._menuService.currentPageSearchBarSubject.next(SearchBarPageIndex.OTHERS);

    this._authService.currentUser.subscribe(user => {
      this.currentUser = user;
    });

    this._searchService.marketPlaceProjectsSearchResults.pipe(takeUntil(this._unsubscribeAll)).subscribe(projects => {
      if (projects != null) {
        this.processProjectList(projects);
      }
    });


    this._searchService.clearSearchForIndex.pipe(takeUntil(this._unsubscribeAll)).subscribe(searchIndex => {
      if (searchIndex != null && searchIndex == SearchBarPageIndex.MARKETPLACE_PROJECTS) {
        this.getMarketplaceProjectList();
        this._searchService.clearSearchSubject.next(null);
      }
    });
  }

  viewProjects(event) {
    let allowEventType = 'click';
    if (event.type == allowEventType) {
      let status: number = 0;
      if (event.row.status == 'Submitted') {
        status = 2;
      }
      let data = { userType: UserType.Client, projectStatus: status, projectData: event.row };
      this._projPostService.setProjectData(data);
      let route = 'projects/support/view';
      this.router.navigate([route], { skipLocationChange: true });
    }
  }


  getMarketplaceProjectList() {
    if (this.currentUser.userType == UserType.SupportUser) {
      this._appService.getAllProjectsForSupport().subscribe((response) => {
        if (response.statusCode == APIResponse.Success) {
          this.processProjectList(response.projects);
        } else {
          this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
        }
      }, err => {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
      });
    }
  }


  processProjectList(projectResponse) {
    let projects = [];
    projects = projectResponse;
    projects.sort((project1, project2) => {
      return <any>new Date(project2.createdAt) - <any>new
        Date(project1.createdAt)
    });

    projects = projects.map(p => {
      switch (p.deleteStatus) {
        case ProjectState.Active: {
          p.statusMessage = 'Active';
          break;
        }
        case ProjectState.InActive: {
          p.statusMessage = 'InActive';
          break;
        }
      }

      switch (p.contractType) {
        case ContractType.FixedCost: {
          p.contractMessage = 'Fixed Cost';
          break;
        }
        case ContractType.TimeAndMaterial: {
          p.contractMessage = 'Time & Material';
          break;
        }
        case ContractType.AnnualContract: {
          p.contractMessage = 'Annual Contract';
          break;
        }
      }

      var createdDate = moment.utc(p.createdAt).toDate();
      p.createdAt = moment(createdDate).format(AppDateFormat.DisplayFormat);

      let endDate = moment(p.bidEndDate);
      if (endDate.isValid()) {
        p.bidEndDate = moment(endDate).format('MM/DD/YYYY');
      } else {
        p.bidEndDate = 'NA';
      }

      let deadline = moment(p.projectCompletionDeadline);
      if (deadline.isValid()) {
        p.deadLine = moment(deadline).format('MM/DD/YYYY');
      } else {
        p.deadLine = 'NA';
      }

      if (p.tags != null) {
        p.tagArray = p.tags.split(',');
      }

      if (p.city != null) {
        p.cityArray = p.city.split(',');
      }
      return p;
    })

    if (projects.length > 0) {
      this.isDataAvailableToLoad = true;
    } else {
      this.isDataAvailableToLoad = false;
    }

    this.actualProjectList = projects;
    this.projectList = projects;
  }


  getProjectTags() {
    this._appService.getProjectTagList().subscribe((response) => {
      if (response.statusCode == APIResponse.Success) {
        this.allTags = response.tags;
        this.allTags.sort((a, b) => a.tagName.localeCompare(b.tagName));
        this.isTagsAvailableToLoad = true;

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
        this.isCitiesAvailableToLoad = true;

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

  tagListUpdated(tagArray) {
    this.filterSelectedTagIdList = tagArray;
  }

  cityListUpdated(cityArray) {
    this.filterSelectedCityIdList = cityArray;
  }


  ngOnInit(): void {
    this.getMarketplaceProjectList()
  }

  //******** Filter Section Begins */

  //********************* Filter Section Begins *****************************/

  completionDateChanged(date) {
    this.bidFromCompletionDate = date.startDate;
    this.bidToCompletionDate = date.endDate;
  }

  bidCloseDateChanged(date) {
    this.bidFromCloseDate = date.startDate;
    this.bidToCloseDate = date.endDate;
  }


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

    this.tagField.nativeElement.blur();
    this.tagField.nativeElement.focus();

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
    this.tagField.nativeElement.blur();
    this.tagField.nativeElement.focus();

  }

  //********************* */


  //*************** City search starts ****************************

  @ViewChild('cityAuto', { static: false }) cityAutocomplete: MatAutocomplete;

  private _cityFilter(value): City[] {
    let return_value: any;
    if (this.cityNames.includes(value)) {
      return_value = this.cityNames.filter((data: City) => data.cityName.toLowerCase().indexOf(value) !== -1);
      this.cityNames.sort((a, b) => a.cityName.localeCompare(b.cityName));
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
    this.cityField.nativeElement.blur();
    this.cityField.nativeElement.focus();
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
    this.cityField.nativeElement.blur();
    this.cityField.nativeElement.focus();

  }


  //*************************** */


  filterProjectList() {
    this.filteredProjects = [];

    var filteredTagProjects = [];
    var filteredCityProjects = [];
    var filteredBidCloseDateProjects = [];
    var filteredCompletionDateProjects = [];

    var cityIdList = this.selectedCities.map(function (city) {
      return city.cityName;
    });

    this.filterSelectedCityIdList = cityIdList;

    if (this.selectedTags != null) {
      this.selectedTags.forEach(tag => {
        this.actualProjectList.forEach(project => {
          if (project.tagArray.indexOf(tag.tagName) > -1) {
            if (!filteredTagProjects.some(existingProject => existingProject.projectId === project.projectId)) {
              filteredTagProjects.push(project);
            }
          }
        });
      });
    }

    if (this.filterSelectedCityIdList != null) {
      this.filterSelectedCityIdList.forEach(id => {
        this.actualProjectList.forEach(project => {
          if (project.cityArray.indexOf(id) > -1) {
            filteredCityProjects.push(project);
          }
        });
      });
    }

    if (this.bidFromCompletionDate != null) {
      this.actualProjectList.forEach(project => {
        let compDate = new Date(project.projectCompletionDeadline);
        if ((compDate.getTime() <= this.bidToCompletionDate.getTime() && compDate.getTime() >= this.bidFromCompletionDate.getTime())) {
          filteredCompletionDateProjects.push(project);
        }
      });
    }

    if (this.bidFromCloseDate != null) {
      this.actualProjectList.forEach(project => {
        let closeDate = new Date(project.bidEndDate);
        if ((closeDate.getTime() <= this.bidToCloseDate.getTime() && closeDate.getTime() >= this.bidFromCloseDate.getTime())) {
          filteredBidCloseDateProjects.push(project);
        }
      });
    }


    if (this.selectedTags.length > 0) {
      if (filteredTagProjects.length > 0) {
        this.filteredProjects = filteredTagProjects;
      } else {
        this.filteredProjects = [];
      }

      if (this.filteredProjects.length > 0 && filteredCityProjects.length > 0) {
        this.filteredProjects = this.filteredProjects.filter(project => filteredCityProjects.some(cityProject => project.projectId === cityProject.projectId));
      } else if (this.filterSelectedCityIdList.length > 0) {
        this.filteredProjects = [];
      }

      if (this.filteredProjects.length > 0 && filteredCompletionDateProjects.length > 0) {
        this.filteredProjects = this.filteredProjects.filter(project => filteredCompletionDateProjects.some(compProject => project.projectId === compProject.projectId));
      } else if (this.bidFromCompletionDate != null) {
        this.filteredProjects = [];
      }

      if (this.filteredProjects.length > 0 && filteredBidCloseDateProjects.length > 0) {
        this.filteredProjects = this.filteredProjects.filter(project => filteredBidCloseDateProjects.some(bidProject => project.projectId === bidProject.projectId));
      } else if (this.bidFromCloseDate != null) {
        this.filteredProjects = [];
      }

    } else if (this.filterSelectedCityIdList.length > 0 && filteredCityProjects.length > 0 && this.selectedTags.length == 0) {
      this.filteredProjects = filteredCityProjects;

      if (this.filteredProjects.length > 0 && filteredCompletionDateProjects.length > 0) {
        this.filteredProjects = this.filteredProjects.filter(project => filteredCompletionDateProjects.some(compProject => project.projectId === compProject.projectId));
      } else if (this.bidFromCompletionDate != null) {
        this.filteredProjects = [];
      }

      if (this.filteredProjects.length > 0 && filteredBidCloseDateProjects.length > 0) {
        this.filteredProjects = this.filteredProjects.filter(project => filteredBidCloseDateProjects.some(bidProject => project.projectId === bidProject.projectId));
      } else if (this.bidFromCloseDate != null) {
        this.filteredProjects = [];
      }

    } else if (this.bidFromCompletionDate != null && filteredCompletionDateProjects.length > 0 && this.selectedTags.length == 0 && this.filterSelectedCityIdList.length == 0) {
      this.filteredProjects = filteredCompletionDateProjects;

      if (filteredBidCloseDateProjects.length > 0) {
        this.filteredProjects = this.filteredProjects.filter(project => filteredBidCloseDateProjects.some(bidProject => project.projectId === bidProject.projectId));
      } else if (this.bidFromCloseDate != null) {
        this.filteredProjects = [];
      }
    } else if (filteredBidCloseDateProjects.length > 0 && this.bidFromCompletionDate == null && this.selectedTags.length == 0 && this.filterSelectedCityIdList.length == 0) {
      this.filteredProjects = filteredBidCloseDateProjects;
    }
    this.projectList = this.filteredProjects;

    if (this.filterSelectedCityIdList.length == 0 && this.selectedTags.length == 0 && this.bidFromCompletionDate == null && this.bidFromCloseDate == null) {
      this.projectList = this.actualProjectList;
      this.disableClearFilterButton = true;
    } else {
      this.disableClearFilterButton = false;
    }
  }

  onClickclearFilter() {

    this.projectList = this.actualProjectList;

    this.filterSelectedTagIdList = [];
    this.filterSelectedCityIdList = [];
    this.bidFromCloseDate = null;
    this.bidToCloseDate = null;
    this.bidFromCompletionDate = null;
    this.bidToCompletionDate = null;

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

    this.filterForm.reset();
    this.disableClearFilterButton = true;
  }


  //**************Filter Section Ends */

  viewProjectDetails(event) {


    let allowEventType = 'click';
    if (event.type == allowEventType) {
      let status: number = 0;
      if (event.row.status == 'Submitted') {
        status = 2;
      }
      let data = { userType: this.currentUser.userType, projectStatus: status, projectData: event.row, projectStage: 1 };
      this._projPostService.setProjectData(data);
      let route = 'projects/support/view';
      this.router.navigate([route], { skipLocationChange: true });
    }
  }

  public ExportTOExcel() {
    let op_json = {};
    for (let i = 0; i < this.projectList.length; i++) {

      op_json = [];
      op_json['Project ID'] = this.projectList[i]['projectId'];
      op_json['Tags'] = this.projectList[i]['tags'];
      op_json['Project Name'] = this.projectList[i]['projectName'];
      op_json['Contract Type'] = this.projectList[i]['contractMessage'];
      op_json['Location'] = this.projectList[i]['city'];
      op_json['Condo'] = this.projectList[i]['condoName'];
      op_json['Date Posted'] = this.projectList[i]['createdAt'];
      op_json['Bid Close Date'] = this.projectList[i]['bidEndDate'];
      op_json['Required Comp. Date'] = this.projectList[i]['deadLine'];
      op_json['Project Post Date'] = this.projectList[i]['projectStartDate'];
      op_json['Project Start Date'] = this.projectList[i]['projectStartDate'];
      op_json['Project Deadline'] = this.projectList[i]['projectCompletionDeadline'];
      op_json['Status'] = this.projectList[i]['statusMessage'];
      op_json['Budget'] = this.projectList[i]['estimatedBudget'];
      this.export_data.push(op_json);
    }
    const workSheet = XLSX.utils.json_to_sheet(this.export_data);
    const workBook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workBook, workSheet, 'SheetName');
    XLSX.writeFile(workBook, 'project_list.xlsx');
    this.export_data = [];
  }
  // Print Data
  public print() {
    let header = ['Project ID', 'Tags', 'Project Name', 'Contract Type', 'Location', 'Condo', 'Date Posted', 'Bid Close Date', 'Required Comp. Date', 'Status', 'Budget'];
    this.print_pdf(header, this.export_data);
    this.export_data = [];
  }
  public print_pdf(header: any, data: any) {
    for (let i = 0; i < this.projectList.length; i++) {
      let op_json = [];
      op_json.push(this.projectList[i]['projectId']);
      op_json.push(this.projectList[i]['tags']);
      op_json.push(this.projectList[i]['projectName']);
      op_json.push(this.projectList[i]['contractMessage']);
      op_json.push(this.projectList[i]['city']);
      op_json.push(this.projectList[i]['condoName']);
      op_json.push(this.projectList[i]['createdAt']);
      op_json.push(this.projectList[i]['bidEndDate']);
      op_json.push(this.projectList[i]['deadLine']);
      op_json.push(this.projectList[i]['statusMessage']);
      op_json.push(this.projectList[i]['estimatedBudget']);
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


  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}

