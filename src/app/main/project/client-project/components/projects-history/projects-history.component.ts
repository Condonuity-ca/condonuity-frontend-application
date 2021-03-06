import { Component, OnDestroy, OnInit, ViewEncapsulation, ElementRef, ViewChild, Inject } from '@angular/core';
import { Subject, Observable, from } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators, FormControl, FormArray } from '@angular/forms';
import { fuseAnimations } from '@condonuity/animations';
import * as moment from 'moment';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { ProjectPostingService } from '../project-view/project-posting/services/project-posting.service';
import { AppService } from '../../../../services/app.service';
import { MenuService } from '../../../../../layout/components/toolbar/menu.service'
import { AppDateFormat, ContractType, ProjectStatus, SearchBarPageIndex } from '../../../../../utils/app-constants'
import * as XLSX from 'xlsx';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
import { SearchService } from 'app/layout/components/toolbar/service/search.service';
import { AuthenticationService } from 'app/_services';

enum ProjectStatusCode {
  Unpublished = 1,
  Published = 2,
  Completed = 3,
  Cancelled = 4,
  BiddingClosed = 5,
  Awarded = 6
}

@Component({
  selector: 'app-projects-history',
  templateUrl: './projects-history.component.html',
  styleUrls: ['./projects-history.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class ProjectsHistoryComponent implements OnInit {
  about: any;
  projectList = [];
  private _unsubscribeAll: Subject<any>;
  currentUser: any;
  export_data: Array<any> = [];

  constructor(
    private _authService: AuthenticationService,
    private _formBuilder: FormBuilder,
    public dialog: MatDialog,
    private router: Router,
    private _projPostService: ProjectPostingService,
    private _appService: AppService,
    private _menuService: MenuService,
    private _searchService: SearchService
  ) {
    this._unsubscribeAll = new Subject();

    this._menuService.currentPageSearchBarSubject.next(SearchBarPageIndex.HISTORY_PROJECTS);

    this._searchService.historyProjectsSearchResults.pipe(takeUntil(this._unsubscribeAll)).subscribe(projects => {
      if (projects != null) {
        this.populateProjectList(projects);
      }
    });

    this._searchService.clearSearchForIndex.pipe(takeUntil(this._unsubscribeAll)).subscribe(searchIndex => {
      if (searchIndex != null && searchIndex == SearchBarPageIndex.HISTORY_PROJECTS) {
        this.getClientProjectsHistory(this.currentUser.currentOrgId);
        this._searchService.clearSearchSubject.next(null);
      }
    });

    this._authService.currentUser.subscribe(userDetails => {
      this.currentUser = userDetails;
      this.getClientProjectsHistory(this.currentUser.currentOrgId);
    });
  }

  ngOnInit() {
  }

  viewProjects(event) {
    let allowEventType = 'click';
    if (event.type == allowEventType) {
      let route = 'projects/client/viewProjects';
      let selectedProjectId = event.row.projectId
      this._appService.getProjectById(selectedProjectId).subscribe(res => {
        res.openProjectInEditMode = true;
        this._projPostService.setProjectData(res);
        this.router.navigate([route]);
      },
        err => {
          console.log(err);
        });
    }
  }

  getClientProjectsHistory(clientOrgId) {
    this._appService.getClientProjectsHistory(clientOrgId).subscribe(res => {
      this.populateProjectList(res.projects);
    });
  }


  populateProjectList(projectList) {
    let projects = projectList;
    projects = projects.map(p => {
      switch (p.status) {
        case ProjectStatus.Published: {
          p.statusMessage = 'Published';
          p.statusCode = ProjectStatusCode.Published;
          break;
        }
        case ProjectStatus.Unpublished: {
          p.statusMessage = 'Un-published';
          p.statusCode = ProjectStatusCode.Unpublished;
          break;
        }
        case ProjectStatus.Completed: {
          if (p.awardedBidId != null && p.awardedBidId != '') {
            p.statusMessage = 'Awarded';
            p.statusCode = ProjectStatusCode.Awarded;
          } else {
            p.statusMessage = 'Bidding Closed';
            p.statusCode = ProjectStatusCode.BiddingClosed;
          }
          break;
        }
        case ProjectStatus.Cancelled: {
          p.statusMessage = 'Cancelled';
          p.statusCode = ProjectStatusCode.Cancelled;
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
    XLSX.writeFile(workBook, 'project_history_list.xlsx');
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
