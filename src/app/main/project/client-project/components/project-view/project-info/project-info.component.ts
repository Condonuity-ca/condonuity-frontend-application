import { Component, OnDestroy, OnInit, ViewEncapsulation, ElementRef, ViewChild, Inject } from '@angular/core';
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
import { ProjectPostingService } from '../project-posting/services/project-posting.service';
import { ProjectStatus, SearchBarPageIndex } from '../../../../../../utils/app-enum';
import * as XLSX from 'xlsx';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { MenuService } from 'app/layout/components/toolbar/menu.service';

@Component({
  selector: 'project-info',
  templateUrl: './project-info.component.html',
  styleUrls: ['./project-info.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class ProjectInfoComponent implements OnInit, OnDestroy {
  @ViewChild('content', { static: false }) content: ElementRef;
  isHidden: boolean = false;
  about: any;
  projectInfo;
  isProjectDetailsLoaded: boolean = false;
  export_data: Array<any> = [];
  // Private
  private _unsubscribeAll: Subject<any>;
  tags: any;
  tags_words: Array<any> = [];
  tags1: any;
  tags_words1: Array<any> = [];

  /**
   * Constructor
   *
   * @param {ProfileService} _profileService
   */
  constructor(

    private _formBuilder: FormBuilder,
    public dialog: MatDialog,
    private _projPostService: ProjectPostingService,
    private _menuService: MenuService
  ) {
    this._menuService.currentPageSearchBarSubject.next(SearchBarPageIndex.OTHERS);

    // Set the private defaults
    this._unsubscribeAll = new Subject();

    this._projPostService.getProjectData.pipe(takeUntil(this._unsubscribeAll)).subscribe(
      data => {
        if (data.project) {
          let project = data.project;
          switch (project.status) {
            case ProjectStatus.Published: {
              project.statusMessage = 'Published';
              break;
            }
            case ProjectStatus.Unpublished: {
              project.statusMessage = 'Un-published';
              break;
            }
            case ProjectStatus.Completed: {

              if (project.awardedBidId != null && project.awardedBidId != '') {
                project.statusMessage = 'Awarded';
              } else {
                project.statusMessage = 'Bidding Closed';
              }
              break;
            }
            case ProjectStatus.Cancelled: {
              project.statusMessage = 'Cancelled';
              break;
            }
          }
          this.isProjectDetailsLoaded = true;

          project.tags.sort((a, b) => a.tagName.localeCompare(b.tagName));
          this.projectInfo = project;
        }
      }
    )

  }

  /**
   * On init
   */
  ngOnInit(): void {

  }

  /**
   * On destroy
   */
  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
  // Export to Excel
  public ExportTOExcel() {
    console.log(this.projectInfo)
    let op_json = {};
    op_json = [];
    for (let i = 0; i < this.projectInfo.tags.length; i++) {
      this.tags = this.projectInfo.tags[i].tagName;
      this.tags_words.push(this.tags);
    }
    op_json['Project ID'] = this.projectInfo['projectId'];
    op_json['Status'] = this.projectInfo['statusMessage'];
    op_json['Project Name'] = this.projectInfo['projectName'];
    console.log(this.tags_words)
    op_json['Tags'] = this.tags;
    op_json['Bid Close Date'] = this.projectInfo['bidEndDate'];
    op_json['Project Start Date'] = this.projectInfo['projectStartDate'];
    op_json['Project Deadline'] = this.projectInfo['projectCompletionDeadline'];
    op_json['Estimated Budget'] = this.projectInfo['estimatedBudget'];
    this.export_data.push(op_json);

    const workSheet = XLSX.utils.json_to_sheet(this.export_data);
    const workBook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workBook, workSheet, 'SheetName');
    XLSX.writeFile(workBook, 'project_information.xlsx');
    this.export_data = [];
  }


  // Print Method
  public print() {
    // let header = ['Project ID','Status','Project Name','Tags','Bid Close Date','Project Start Date','Project Deadline','Estimated Budget'];
    // this.print_pdf(header,this.export_data);
    // this.export_data=[];
    window.print();
  }

  public pdf() {
    const self = this.content.nativeElement;
    html2canvas(self).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 208;
      const pageHeight = 295;
      const imgHeight = canvas.height * imgWidth / canvas.width;
      const doc = new jsPDF('p', 'mm');
      let heightLeft = imgHeight;
      let position = 0;
      doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        doc.window.Print();
        doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      doc.save('viewprojects' + '.pdf');
    });

  }

  openDownloadDialog() {
    // const userNewRef = this.dialog.open(DownloadDialogComponent,{width:'33%', height:'auto'});
  }
}



