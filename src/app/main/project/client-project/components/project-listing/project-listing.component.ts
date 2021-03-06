import { Component, OnDestroy, OnInit, ViewEncapsulation, ElementRef, ViewChild, Inject } from '@angular/core';
import { Subject, Observable, from } from 'rxjs';
import { takeUntil, take } from 'rxjs/operators';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators, FormControl, FormArray } from '@angular/forms';
import { fuseAnimations } from '@condonuity/animations';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Item } from '../models/item.model'
import { Router, ActivatedRoute } from '@angular/router';
import { ProjectPostingService } from '../project-view/project-posting/services/project-posting.service';
import { AppService } from '../../../../services/app.service';
import * as moment from 'moment';
import { ProjectStatus, ContractType, SearchBarPageIndex, AppLiterals, AppDateFormat } from '../../../../../../app/utils/app-constants'
import { MenuService } from '../../../../../layout/components/toolbar/menu.service'
import * as XLSX from 'xlsx';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
import { AuthenticationService } from 'app/_services';
import { SearchService } from 'app/layout/components/toolbar/service/search.service';
import { ConfirmationDialogComponent, DialogType } from 'app/main/Shared/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'project-listing',
  templateUrl: './project-listing.component.html',
  styleUrls: ['./project-listing.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})

export class ProjectListingComponent implements OnInit, OnDestroy {

  // @ViewChild('scroll', { static: false }) public scroll: ElementRef<any>;
  @ViewChild('scroll', { read: ElementRef, static: false }) public scroll:
    ElementRef<any>;

  about: any;
  projectList = [];
  currentUser: any;

  // Private
  private _unsubscribeAll: Subject<any>;
  export_data: Array<any> = [];
  /**
   * Constructor
   *
   * @param {ProfileService} _profileService
   */
  constructor(
    // private _profileService: ProfileService
    private _formBuilder: FormBuilder,
    public dialog: MatDialog,
    private router: Router,
    private _projPostService: ProjectPostingService,
    private _appService: AppService,
    private _menuService: MenuService,
    private _authService: AuthenticationService,
    private _searchService: SearchService
  ) {
    this._unsubscribeAll = new Subject();
  }

  viewProjects(event) {
    let allowEventType = 'click';
    if (event.type == allowEventType) {
      let route = 'projects/client/viewProjects';
      let selectedProjectId = event.row.projectId
      this._appService.getProjectById(selectedProjectId).subscribe(res => {
        res.openProjectInEditMode = true;
        res.isProjectOpen = true;
        this._projPostService.setProjectData(res);
        this.router.navigate([route]);
      },
        err => {
          console.log(err);
        });
    }
  }

  ngOnInit(): void {
    this._authService.currentUser.pipe(takeUntil(this._unsubscribeAll)).subscribe(user => {
      this.currentUser = user;
      // this.primaryOrganizationId = user.currentOrgId;
      this.getClientCurrentProjects(this.currentUser.currentOrgId);

    });


    this._menuService.currentPageSearchBarSubject.next(SearchBarPageIndex.CURRENT_PROJECTS);

    this._searchService.currentProjectsSearchResults.pipe(takeUntil(this._unsubscribeAll)).subscribe(projects => {
      if (projects != null) {
        this.populateProjectList(projects);
      }
    });

    this._searchService.clearSearchForIndex.pipe(takeUntil(this._unsubscribeAll)).subscribe(searchIndex => {
      if (searchIndex != null && searchIndex == SearchBarPageIndex.CURRENT_PROJECTS) {
        this.getClientCurrentProjects(this.currentUser.currentOrgId);
        this._searchService.clearSearchSubject.next(null);
      }
    });

  }

  getClientCurrentProjects(selectedOrganizationId) {
    this._appService.getClientCurrentProjects(selectedOrganizationId).subscribe(res => {
      this.populateProjectList(res.projects);
    });
  }

  ngAfterViewInit() {
    this.scroll.nativeElement.scrollTop = -500;

    // window.scroll({
    //   top: 0,
    //   left: 0,
    //   behavior: 'smooth'
    // });
  }


  populateProjectList(projectList) {
    let projects = projectList;

    projects = projects.map(p => {

      if (p.tags != null) {
        var tags = p.tags.split(',');
        tags.sort((a, b) => a.localeCompare(b));
        p.tags = tags.toString();
      }

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
          p.statusMessage = 'Closed';
          break;
        }
        case ProjectStatus.Cancelled: {
          p.statusMessage = 'Cancelled';
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
      return p;
    });

    projects.sort((a, b) => { return <any>new Date(b.bidEndDate) - <any>new Date(a.bidEndDate) });

    this.projectList = projects;
  }



  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  openDownloadDialog() {
    const userNewRef = this.dialog.open(DownloadDialog, { width: '33%', height: 'auto' });
  }

  // Excel Download
  public ExportTOExcel() {
    let op_json = {};
    for (let i = 0; i < this.projectList.length; i++) {

      op_json = [];
      op_json['Project ID'] = this.projectList[i]['projectId'];
      op_json['Project Name'] = this.projectList[i]['projectName'];
      op_json['Contract Type'] = this.projectList[i]['contractMessage'];
      op_json['Date Created'] = this.projectList[i]['createdAt'];
      op_json['Bid Close Date'] = this.projectList[i]['bidEndDate'];
      op_json['Tags'] = this.projectList[i]['tags'];
      op_json['Status'] = this.projectList[i]['statusMessage'];
      op_json['Location'] = this.projectList[i]['city'];
      op_json['Project Post Date'] = this.projectList[i]['projectStartDate'];
      op_json['Bid End Date'] = this.projectList[i]['bidEndDate'];
      op_json['Project Start Date'] = this.projectList[i]['projectStartDate'];
      op_json['Project Deadline'] = this.projectList[i]['projectCompletionDeadline'];
      op_json['Estimated Budget'] = this.projectList[i]['estimatedBudget'];
      op_json['# of Bids'] = this.projectList[i]['bidCount'];
      op_json['# of Interest'] = this.projectList[i]['interestCount'];
      this.export_data.push(op_json);
    }
    const workSheet = XLSX.utils.json_to_sheet(this.export_data);
    const workBook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workBook, workSheet, 'SheetName');
    XLSX.writeFile(workBook, 'current_project_list.xlsx');
    this.export_data = [];
  }

  // Print Data
  public print() {
    let header = ['Project ID', 'Project Name', 'Contract Type', 'Date Created', 'Bid Close Date', 'Tags', 'Status', '# of Bids', '# of Interest'];
    this.print_pdf(header, this.export_data);
    this.export_data = [];
  }

  public print_pdf(header: any, data: any) {

    for (let i = 0; i < this.projectList.length; i++) {
      let op_json = [];
      op_json.push(this.projectList[i]['projectId']);
      op_json.push(this.projectList[i]['projectName']);
      op_json.push(this.projectList[i]['contractMessage']);
      op_json.push(this.projectList[i]['createdAt']);
      op_json.push(this.projectList[i]['bidEndDate']);
      op_json.push(this.projectList[i]['tags']);
      op_json.push(this.projectList[i]['statusMessage']);
      op_json.push(this.projectList[i]['bidCount']);
      op_json.push(this.projectList[i]['interestCount']);
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

}


@Component({
  selector: 'download-dialog',
  templateUrl: 'download-dialog.html',
})
export class DownloadDialog {


}

