import { Component, OnDestroy, OnInit, ViewEncapsulation, ElementRef, ViewChild, Inject, Input, ɵɵNgOnChangesFeature } from '@angular/core';
import { Subject, Observable, from } from 'rxjs';
import { takeUntil, startWith, map } from 'rxjs/operators';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators, FormControl, FormArray } from '@angular/forms';
import { fuseAnimations } from '@condonuity/animations';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { ProjectPostingService } from '../../client-project/components/project-view/project-posting/services/project-posting.service';
import { AppService } from '../../../services/app.service';
import { AppLiterals, APIResponse, AlertType, ContractType, ProjectStatus, SearchBarPageIndex, BidStatus, AppDateFormat } from '../../../../utils/app-constants';
import { AppUtilService } from '../../../../utils/app-util.service';
import { AuthenticationService } from '../../../../_services/authentication.service';
import { Project } from './project.model';
import { Tag } from '../../../profile/tabs/models/tag.model';
import { City } from '../../../profile/tabs/models/city.model';
import { ProjectListingComponent } from '../../client-project/components/project-listing/project-listing.component';
import { P, ENTER, COMMA } from '@angular/cdk/keycodes';
import { MenuService } from 'app/layout/components/toolbar/menu.service';
import { SearchService } from 'app/layout/components/toolbar/service/search.service';
import { CondoBrowserService } from 'app/main/condo-browser/condo-browser.service';
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete';
import * as XLSX from 'xlsx';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';

// import {ExcelService} from './services/excel.service';


@Component({
  selector: 'vendor-project-listing',
  templateUrl: './vendor-project-listing.component.html',
  styleUrls: ['./vendor-project-listing.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})



export class VendorProjectListingComponent implements OnInit, OnDestroy {

  static tabIndex: number = -1;
  static previousTabIndex: number = -1;

  @Input() selectedTab: number;

  currentVendorUser: any;

  filterForm: FormGroup;

  projectList: Project[];
  actualProjectList: Project[];
  filteredProjects: Project[] = [];

  allTags: Tag[];
  cityNames: City[];

  filterSelectedTagIdList: [] = [];
  filterSelectedCityIdList: string[] = [];

  filterBidCloseDate: string;
  filterCompletionDate: string;

  isDataAvailableToLoad = false;
  isTagsAvailableToLoad = false;
  isCitiesAvailableToLoad = false;
  disableClearFilterButton = true;

  private _unsubscribeAll: Subject<any>;


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

  bidFromCloseDate: any;
  bidToCloseDate: any;

  bidFromCompletionDate: any;
  bidToCompletionDate: any;

  export_data: Array<any> = [];


  @ViewChild('tagInput', { static: false }) tagInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto', { static: false }) matAutocomplete: MatAutocomplete;

  @ViewChild('cityInput', { static: false }) cityInput: ElementRef<HTMLInputElement>;
  @ViewChild('cityAuto', { static: false }) cityMatAutocomplete: MatAutocomplete;

  @ViewChild("tagInput", { static: false }) tagField: ElementRef;
  @ViewChild("cityInput", { static: false }) cityField: ElementRef;

  constructor(
    private _formBuilder: FormBuilder,
    private _appService: AppService,
    private _appUtil: AppUtilService,
    private _authService: AuthenticationService,
    public dialog: MatDialog,
    private router: Router,
    private _projPostService: ProjectPostingService,
    private _menuService: MenuService,
    private _searchService: SearchService,
    private _condoBrowserService: CondoBrowserService
  ) {
    this._unsubscribeAll = new Subject();

    this._menuService.currentPageSearchBarSubject.next(SearchBarPageIndex.FAVOURITE_PROJECTS);

    this._authService.currentUser.pipe(takeUntil(this._unsubscribeAll)).subscribe(userData => {
      this.currentVendorUser = userData;

      if (this.allTags == null) {
        this.getProjectTags();
      }

      if (this.cityNames == null) {
        this.getServiceCities();
      }
    });

    this._searchService.favoriteProjectsSearchResults.pipe(takeUntil(this._unsubscribeAll)).subscribe(projects => {
      if (projects != null) {
        this.populateProjectsInView(projects);
      }
    });

    this._searchService.currentProjectsSearchResults.pipe(takeUntil(this._unsubscribeAll)).subscribe(projects => {
      if (projects != null) {
        this.populateProjectsInView(projects);
      }
    });

    this._searchService.historyProjectsSearchResults.pipe(takeUntil(this._unsubscribeAll)).subscribe(projects => {
      if (projects != null) {
        this.populateProjectsInView(projects);
      }
    });

    this._searchService.clearSearchForIndex.pipe(takeUntil(this._unsubscribeAll)).subscribe(searchIndex => {
      if (searchIndex != null && (searchIndex == SearchBarPageIndex.FAVOURITE_PROJECTS || searchIndex == SearchBarPageIndex.CURRENT_PROJECTS || searchIndex == SearchBarPageIndex.HISTORY_PROJECTS)) {
        this.getVendorProjects();
        this._searchService.clearSearchSubject.next(null);
      }
    });


    this.filterForm = this._formBuilder.group({
      tags: [''],
      servicedCities: [''],
      bidCloseDate: [''],
      completionDate: ['']
    });
  }

  viewProjects(event) {
    let allowEventType = 'click';
    if (event.type == allowEventType) {
      let status: number = 0;
      if (event.row.status == 'Submitted') {
        status = 2;
      }
      let data = { userType: 2, projectStatus: status, projectData: event.row, projectStage: this.selectedTab };
      this._projPostService.setProjectData(data);
      let route = 'projects/vendor/viewProjects';
      this.router.navigate([route]);
    }
  }


  ngOnInit(): void {
  }


  ngOnChanges(): void {

    if (VendorProjectListingComponent.previousTabIndex != this.selectedTab) {
      VendorProjectListingComponent.tabIndex = this.selectedTab;
      VendorProjectListingComponent.previousTabIndex = this.selectedTab;
    }

    if (VendorProjectListingComponent.tabIndex != -1) {
      if (this.selectedTab == 0) {
        this._menuService.currentPageSearchBarSubject.next(SearchBarPageIndex.FAVOURITE_PROJECTS);
      } else if (this.selectedTab == 1) {
        this._menuService.currentPageSearchBarSubject.next(SearchBarPageIndex.CURRENT_PROJECTS);
      } else {
        this._menuService.currentPageSearchBarSubject.next(SearchBarPageIndex.HISTORY_PROJECTS);
      }
      this.getVendorProjects();
    }
  }

  getVendorProjects() {
    let rawProjectList: Project[];
    if (this.selectedTab == 0) {
      this._appService.getVendorFavoriteProjectList(this.currentVendorUser.vendorOrganisationId).subscribe((response) => {
        if (response.statusCode == APIResponse.Success) {
          rawProjectList = response.projects;
          this.populateProjectsInView(rawProjectList)
        } else {
          this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
        }
      }, err => {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
      });
    } else if (this.selectedTab == 1) {
      this._appService.getVendorCurrentProjectList(this.currentVendorUser.vendorOrganisationId).subscribe((response) => {
        if (response.statusCode == APIResponse.Success) {
          rawProjectList = response.projects;
          this.populateProjectsInView(rawProjectList)
        } else {
          this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
        }
      }, err => {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
      });

    } else if (this.selectedTab == 2) {
      this._appService.getVendorHistoryProjectList(this.currentVendorUser.vendorOrganisationId).subscribe((response) => {
        if (response.statusCode == APIResponse.Success) {
          rawProjectList = response.projects;
          this.populateProjectsInView(rawProjectList)
        } else {
          this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
        }
      }, err => {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
      });
    }
  }

  populateProjectsInView(rawProjectList) {
    if (rawProjectList != null) {
      rawProjectList = rawProjectList.map(p => {
        if (this.selectedTab == 0) {
          if (p.bidStatus == BidStatus.Pulled) {
            p.statusMessage = 'Bid Pulled';
          } else {
            p.statusMessage = 'Bid Not Submitted';
          }
        } else if (this.selectedTab == 1) {
          switch (p.status) {
            case ProjectStatus.Published: {
              p.statusMessage = 'Bid Submitted';
              break;
            }
            case ProjectStatus.Unpublished: {
              p.statusMessage = 'Un-published';
              break;
            }
            case ProjectStatus.Completed: {
              if (p.vendorBid != null) {
                switch (p.vendorBid.bidStatus) {
                  case BidStatus.NotSubmitted: {
                    p.statusMessage = 'Closed - Not Submitted';
                    break;
                  }
                  case BidStatus.Submitted: {
                    p.statusMessage = 'Closed - Submitted';
                    break;
                  }
                  case BidStatus.Awarded: {
                    p.statusMessage = 'Awarded';
                    break;
                  }
                  case BidStatus.Pulled: {
                    p.statusMessage = 'Closed - Pulled';
                    break;
                  }
                }
              } else {
                p.statusMessage = 'Closed - Not Submitted';
              }
              break;
            }
            case ProjectStatus.Cancelled: {
              p.statusMessage = 'Cancelled';
              break;
            }
          }
        } else if (this.selectedTab == 2) {
          switch (p.status) {
            case ProjectStatus.Published: {
              p.statusMessage = 'Published';
              break;
            }
            case ProjectStatus.Unpublished: {
              p.statusMessage = 'Un-published';
              break;
            }
            case ProjectStatus.Completed: {
              if (p.vendorBid != null) {
                switch (p.vendorBid.bidStatus) {
                  case BidStatus.NotSubmitted: {
                    p.statusMessage = 'Closed - Not Submitted';
                    break;
                  }
                  case BidStatus.Submitted: {
                    p.statusMessage = 'Closed - Submitted';
                    break;
                  }
                  case BidStatus.Awarded: {

                    if (p.vendorBid.id == p.awardedBidId) {
                      p.statusMessage = 'Won';
                    } else {
                      p.statusMessage = 'Lost';
                    }
                    break;
                  }
                  case BidStatus.Pulled: {
                    p.statusMessage = 'Closed - Pulled';
                    break;
                  }
                }
              } else {
                p.statusMessage = 'Closed - Not Submitted';
              }
              break;
            }
            case ProjectStatus.Cancelled: {
              p.statusMessage = 'Cancelled';
              break;
            }
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

        if (p.tags != null) {
          p.tagArray = p.tags.split(',');
        }

        if (p.city != null) {
          p.cityArray = p.city.split(',');
        }

        let projCompletionDate = moment(p.projectCompletionDeadline);
        if (endDate.isValid()) {
          p.projectCompletionDeadline = moment(projCompletionDate).format('MM/DD/YYYY');
        } else {
          p.projectCompletionDeadline = 'NA';
        }
        return p;
      })

      if (rawProjectList.length > 0) {
        this.isDataAvailableToLoad = true;
      } else {
        this.isDataAvailableToLoad = false;
      }

      this.projectList = rawProjectList;
      this.actualProjectList = rawProjectList;
    }
  }

  viewCondoProfile(event, row) {
    debugger;
    event.stopPropagation();
    let data = { id: row.clientOrganisationId, name: row.condoName, sourceScreen: "others" };
    this._condoBrowserService.setClientData(data);
    this.router.navigate(['/browseCondos/view']);
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

  // Excel Download
  public onClickDownload() {
    let op_json = {};
    for (let i = 0; i < this.projectList.length; i++) {

      op_json = [];
      op_json['Project ID'] = this.projectList[i]['projectId'];
      op_json['Posted By'] = this.projectList[i]['condoName'];
      op_json['Tags'] = this.projectList[i]['tags'];
      op_json['Project Name'] = this.projectList[i]['projectName'];
      op_json['Contract Type'] = this.projectList[i]['contractMessage'];
      op_json['Date Created'] = this.projectList[i]['createdAt'];
      op_json['Bid Close Date'] = this.projectList[i]['bidEndDate'];
      op_json['Required Comp. Date'] = this.projectList[i]['projectCompletionDeadline'];
      op_json['Status'] = this.projectList[i]['statusMessage'];
      op_json['Estimated Budget'] = this.projectList[i]['estimatedBudget'];
      this.export_data.push(op_json);
    }
    const workSheet = XLSX.utils.json_to_sheet(this.export_data);
    const workBook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workBook, workSheet, 'SheetName');
    XLSX.writeFile(workBook, 'current_project_list.xlsx');
    this.export_data = [];
  }

  // Print Data
  public onClickPrint() {
    let header = ['Project ID', 'Posted By', 'Tags', 'Project Name', 'Contract Type', 'Date Created', 'Bid Close Date', 'Required Comp. Date', 'Status', 'Estimated Budget'];
    this.print_pdf(header, this.export_data);
    this.export_data = [];
  }

  public print_pdf(header: any, data: any) {

    for (let i = 0; i < this.projectList.length; i++) {
      let op_json = [];
      op_json.push(this.projectList[i]['projectId']);
      op_json.push(this.projectList[i]['condoName']);
      op_json.push(this.projectList[i]['tags']);
      op_json.push(this.projectList[i]['projectName']);
      op_json.push(this.projectList[i]['contractMessage']);
      op_json.push(this.projectList[i]['createdAt']);
      op_json.push(this.projectList[i]['bidEndDate']);
      op_json.push(this.projectList[i]['projectCompletionDeadline']);
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

