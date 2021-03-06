import { Component, OnDestroy, OnInit, ViewEncapsulation, ElementRef, ViewChild, Inject, Input } from '@angular/core';
import { Subject, Observable, from } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators, FormControl, FormArray } from '@angular/forms';
import { fuseAnimations } from '@condonuity/animations';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { map, startWith } from 'rxjs/operators';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { AppService } from '../../../../services/app.service';
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete';
import { CommonFunctionsService } from '../../../../../../app/_services/common-functions.service';
import { MenuService } from '../../../../../layout/components/toolbar/menu.service';
import { APIResponse, AppLiterals, AlertType, AppDateFormat, SearchBarPageIndex } from '../../../../../utils/app-constants';
import { AppUtilService } from '../../../../../utils/app-util.service';
import { AuthenticationService } from 'app/_services/authentication.service';
import { resetFakeAsyncZone } from '@angular/core/testing';
import { Task } from '../task/model/task.model';
import * as moment from 'moment';
import { TaskComment } from './model/task-comment.model';
import { ClientUser } from '../task/model/client-user.model';
import * as XLSX from 'xlsx';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
import { SearchService } from 'app/layout/components/toolbar/service/search.service';

export interface DialogData {
  userData: any;
  isEditUser: Boolean;
  task: Task;
  userList: any;
  newTaskId: number;
}

export enum TaskStatus {
  Open = 1,
  Deferred = 2,
  OnHold = 3,
  InProgress = 4,
  Closed = 5,
  ReOpened = 6
}

export enum TaskPirority {
  Highest = 1,
  High = 2,
  Medium = 3,
  Low = 4
}


@Component({
  selector: 'task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})

export class TaskComponent implements OnInit, OnDestroy {
  @Input()

  // selectedOrganization: any;
  currentUser: any;

  actualTaskList: Task[] = [];
  taskList: Task[] = [];
  userList: ClientUser[] = [];


  lastAppliedFilter = 0;
  shouldSortReverse = false;
  sortType: string;

  taskListform: FormGroup;
  export_data: Array<any> = [];
  // Private
  private _unsubscribeAll: Subject<any>;

  /**
   * Constructor
   */
  constructor(
    private _authService: AuthenticationService,
    private _appUtil: AppUtilService,
    private _menuService: MenuService,
    private _formBuilder: FormBuilder,
    public dialog: MatDialog,
    private _appService: AppService,
    private _commonFunctionsService: CommonFunctionsService,
    private _searchService: SearchService
  ) {
    this._unsubscribeAll = new Subject();

    this._menuService.currentPageSearchBarSubject.next(SearchBarPageIndex.TASKS);

    this._searchService.tasksSearchResults.pipe(takeUntil(this._unsubscribeAll)).subscribe(tasks => {
      if (tasks != null) {
        this.populateTaskList(tasks);
        this._searchService.tasksSearchSubject.next(null);
      }
    });

    this._searchService.clearSearchForIndex.pipe(takeUntil(this._unsubscribeAll)).subscribe(searchIndex => {
      if (searchIndex != null && searchIndex == SearchBarPageIndex.TASKS) {
        this.getTaskListForOrg(this.currentUser.currentOrgId);
        this._searchService.clearSearchSubject.next(null);
      }
    });

    this._authService.currentUser.pipe(takeUntil(this._unsubscribeAll)).subscribe(userData => {
      this.currentUser = userData;
      this.getTaskListForOrg(this.currentUser.currentOrgId);
      this.getUserListForOrg(this.currentUser.currentOrgId);
    });

    this.taskListform = this._formBuilder.group({
      priority: [''],
      status: [''],
    });
  }

  openCreateTaskDialog() {
    this.currentUser.organizationId = this.currentUser.currentOrgId;
    let taskId = Math.max.apply(Math, this.actualTaskList.map(function (task) { return task.id; }))
    taskId = taskId + 1;


    const CreateTaskDialogRef = this.dialog.open(CreateTaskDialog, { data: { userData: this.currentUser, userList: this.userList, newTaskId: taskId }, width: '500px', height: 'auto' });
    CreateTaskDialogRef.afterClosed().subscribe(result => {
      if (result != undefined && result != '') {
        this.getTaskListForOrg(this.currentUser.currentOrgId);


        // this.actualTaskList.push(result);
        // this.taskList.push(result);
        // this.taskList.sort((a, b) => { return <any>new Date(b.createdAt) - <any>new Date(a.createdAt) });
        // this.taskList = [...this.taskList];
      }
    });
  }

  shouldReloadData = true;

  openEditTaskDialog(event, task) {
    event.stopPropagation();
    if (event.type == 'click') {
      var selectedTask = task;
      this.currentUser.organizationId = this.currentUser.currentOrgId;
      const CreateTaskDialogRef = this.dialog.open(CreateTaskDialog, { data: { userData: this.currentUser, userList: this.userList, task: selectedTask }, width: '500px', height: 'auto' });
      CreateTaskDialogRef.afterClosed().subscribe(updatedTask => {

        if (updatedTask != undefined && updatedTask != '') {
          this.getTaskListForOrg(this.currentUser.currentOrgId);


          // this.shouldReloadData = false;
          // this.taskList = [];
          // let index = this.actualTaskList.findIndex(task => task.id == updatedTask.id);
          // this.actualTaskList[index] = updatedTask;
          // this.taskList = this.actualTaskList
          // this.shouldReloadData = true;

          // let index = this.taskList.findIndex(task => task.id == updatedTask.id);
          // this.taskList[index] = updatedTask;
        }
      });
    }
  }

  openTaskCommentsDialog(event) {
    if (event.type == 'click') {
      var selectedTask = event.row;
      const TaskCommentsDialogRef = this.dialog.open(TaskCommentsDialog, { data: { userData: this.currentUser, task: selectedTask }, width: '900px', height: 'auto' });
      TaskCommentsDialogRef.afterClosed().subscribe(result => {
        if (result != undefined && result != '') {
          if (result == true) {
            this.getTaskListForOrg(this.currentUser.currentOrgId);
          }
          // this.getTaskListForOrg(this.currentUser.currentOrgId);
        }
      });
    }
  }

  getTaskListForOrg(organizationId) {
    this._appService.getClientTaskList(organizationId).subscribe((response) => {
      if (response.statusCode == APIResponse.Success) {
        this.populateTaskList(response.clientTasks);
      } else {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.unableToFetchTaskList);
      }
    }, err => {
      this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
    });
  }


  getUserListForOrg(organizationId) {
    this._appService.getClientUserListForOrg(organizationId).subscribe((response) => {
      if (response.statusCode == APIResponse.Success) {
        this.userList = response.clientUsers;
        this.userList = this.userList.map(user => {
          user.clientUserName = user.firstName + ' ' + user.lastName;
          user.clientUserId = user.clientId;
          return user;
        })
      }
    }, err => {
      this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
    });
  }

  populateTaskList(taskList) {
    let rawTaskList = taskList;
    debugger;

    rawTaskList = rawTaskList.map(task => {

      switch (Number(task.priority)) {
        case TaskPirority.Highest: {
          task.priorityText = 'Highest';
          break;
        }

        case TaskPirority.High: {
          task.priorityText = 'High';
          break;
        }

        case TaskPirority.Medium: {
          task.priorityText = 'Medium';
          break;
        }

        case TaskPirority.Low: {
          task.priorityText = 'Low';
          break;
        }
      }

      switch (Number(task.taskStatus)) {
        case TaskStatus.Open: {
          task.statusText = 'Open';
          break;
        }
        case TaskStatus.InProgress: {
          task.statusText = 'In Progress';
          break;
        }
        case TaskStatus.ReOpened: {
          task.statusText = 'Re Opened';
          break;
        }
        case TaskStatus.OnHold: {
          task.statusText = 'On Hold';
          break;
        }
        case TaskStatus.Closed: {
          task.statusText = 'Closed';
          break;
        }
        case TaskStatus.Deferred: {
          task.statusText = 'Deferred';
          break;
        }
      }

      if (task.closureDate != null) {
        task.closureDate = moment(task.closureDate).format(AppDateFormat.DisplayFormat);
      } else {
        task.closureDate = '--';
      }

      task.clientUserName = task.createdByUser;

      var assigneeName: string[] = [];
      task.assignedTo.forEach(assignee => {
        assigneeName.push(assignee.clientUserName);
      });

      if (task.isOther == "1") {
        assigneeName.push(task.othersName);
      }

      task.assineeDisplayName = assigneeName.toString();

      if (task.comments != null && task.comments.length > 0) {
        task.commentsCount = task.comments.length;
      } else {
        task.commentsCount = 0;
      }

      var localTime = moment.utc(task.createdAt).toDate();
      task.createdDate = moment(localTime).format(AppDateFormat.DisplayFormat);

      var localTime1 = moment.utc(task.modifiedDate).toDate();
      task.modifiedDisplayDate = moment(localTime1).format(AppDateFormat.DisplayFormat);

      return task;
    });

    rawTaskList.sort((a, b) => { return <any>new Date(b.createdAt) - <any>new Date(a.createdAt) });

    this.actualTaskList = Object.assign([], rawTaskList);
    this.taskList = rawTaskList;
  }

  sortTasks(type) {
    if (this.lastAppliedFilter != type) {
      this.shouldSortReverse = false;
    }


    if (type == 1) {
      this.sortType = 'Priority';
      if (!this.shouldSortReverse) {
        this.taskList.sort((a, b) => b.priority - a.priority);
        this.shouldSortReverse = true;
      } else {
        this.taskList.sort((a, b) => a.priority - b.priority);
        this.shouldSortReverse = false;
      }
    } else if (type == 2) {
      this.sortType = 'Status';
      if (!this.shouldSortReverse) {
        this.taskList.sort((a, b) => b.taskStatus - a.taskStatus);
        this.shouldSortReverse = true;
      } else {
        this.taskList.sort((a, b) => a.taskStatus - b.taskStatus);
        this.shouldSortReverse = false;
      }
    } else if (type == 3) {
      this.sortType = 'Created Date';
      if (!this.shouldSortReverse) {
        this.taskList.sort((a, b) => { return <any>new Date(a.createdAt) - <any>new Date(b.createdAt) });
        this.shouldSortReverse = true;
      } else {
        this.taskList.sort((a, b) => { return <any>new Date(b.createdAt) - <any>new Date(a.createdAt) });
        this.shouldSortReverse = false;
      }
    } else if (type == 4) {
      this.sortType = 'Modified Date';
      if (!this.shouldSortReverse) {
        this.taskList.sort((a, b) => { return <any>new Date(a.modifiedDate) - <any>new Date(b.modifiedDate) });
        this.shouldSortReverse = true;
      } else {
        this.taskList.sort((a, b) => { return <any>new Date(b.modifiedDate) - <any>new Date(a.modifiedDate) });
        this.shouldSortReverse = false;
      }
    }

    this.lastAppliedFilter = type;
  }

  filterPriority: number;
  priorityChanged(priority) {
    this.filterPriority = priority;
    this.filterTaskList();
  }

  filterStatus: number;
  statusChanged(status) {
    this.filterStatus = status;
    this.filterTaskList();
  }

  filterTaskList() {
    if (this.filterPriority != null && this.filterStatus != null) {
      this.taskList = this.actualTaskList.filter(task => task.priority == this.filterPriority);
      this.taskList = this.taskList.filter(task => task.taskStatus == this.filterStatus);
    } else if (this.filterPriority) {
      this.taskList = this.actualTaskList.filter(task => task.priority == this.filterPriority);
    } else if (this.filterStatus) {
      this.taskList = this.actualTaskList.filter(task => task.taskStatus == this.filterStatus);
    }
  }


  onClickclearFilter() {
    this.filterStatus = null;
    this.filterPriority = null;
    this.taskList = this.actualTaskList;
    this.taskListform.controls['priority'].setValue('0');
    this.taskListform.controls['status'].setValue('0');
  }

  // Excel Download
  public ExportTOExcel() {
    console.log(this.taskList)
    let op_json = {};
    for (let i = 0; i < this.taskList.length; i++) {
      let task = this.taskList[i];
      op_json = [];
      op_json['Item'] = this.taskList[i]['id'];
      op_json['Priority'] = this.taskList[i]['priorityText'];
      op_json['Status'] = this.taskList[i]['statusText'];
      op_json['Description'] = this.taskList[i]['taskDescription'];
      op_json['Assigned To'] = this.taskList[i]['assineeDisplayName'];
      op_json['Created By'] = this.taskList[i]['createdByUser'];
      op_json['Created Date'] = this.taskList[i]['createdDate'];
      op_json['Last Modified By'] = this.taskList[i]['modifiedByUser'];
      op_json['Last Modified'] = this.taskList[i]['modifiedDisplayDate'];
      op_json['Closure Date'] = this.taskList[i]['closureDate'];

      let commentString = ""
      for (let j = 0; j < task.comments.length; j++) {
        let userComment = task.comments[j];
        commentString = commentString + userComment.clientName + ":" + userComment.comment + '\n';
      }
      op_json['Comments'] = commentString;
      this.export_data.push(op_json);
    }
    const workSheet = XLSX.utils.json_to_sheet(this.export_data);
    const workBook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workBook, workSheet, 'SheetName');
    XLSX.writeFile(workBook, 'task_list.xlsx');
    this.export_data = [];
  }

  public print() {
    let header = ['Item', 'Priority', 'Status', 'Description', 'Assigned To', 'Created By', 'Created Date', 'Last Modified By', 'Last Modified', 'Closure Date'];
    this.print_pdf(header, this.export_data);
    this.export_data = [];
  }
  public print_pdf(header: any, data: any) {
    for (let i = 0; i < this.taskList.length; i++) {
      let op_json = [];
      op_json.push(this.taskList[i]['id']);
      op_json.push(this.taskList[i]['priorityText']);
      op_json.push(this.taskList[i]['statusText']);
      op_json.push(this.taskList[i]['taskDescription']);
      op_json.push(this.taskList[i]['assineeDisplayName']);
      op_json.push(this.taskList[i]['createdByUser']);
      op_json.push(this.taskList[i]['createdDate']);
      op_json.push(this.taskList[i]['modifiedByUser']);
      op_json.push(this.taskList[i]['modifiedDisplayDate']);
      op_json.push(this.taskList[i]['closureDate']);
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

  ngOnInit(): void {
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
  selector: 'create-task-dialog',
  templateUrl: 'create-task-dialog.html',
  animations: fuseAnimations
})

export class CreateTaskDialog {
  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];

  selectedTask: Task;

  createTaskform: FormGroup;
  profileData;
  currentUser;
  dialogType: number;

  taskPriority: number;
  taskStatus: number;
  assignees = [];
  isOther = 2;
  otherUserName = '';

  taskData = {};
  newTaskId: any;

  filteredUsers: Observable<ClientUser[]>;
  selectedUsers: ClientUser[] = [];
  allUsers: ClientUser[] = [];

  isValidAssignee = false;

  userCtrl = new FormControl();

  @ViewChild('userInput', { static: false }) userInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto', { static: false }) matAutocomplete: MatAutocomplete;

  constructor(
    private _formBuilder: FormBuilder,
    private _appService: AppService,
    private _appUtil: AppUtilService,
    public dialogRef: MatDialogRef<CreateTaskDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {

    if (this.data != null) {
      this.currentUser = this.data.userData;
      this.allUsers = Object.assign([], this.data.userList);
      if (this.data.newTaskId != null) {
        this.newTaskId = this.data.newTaskId;
      }

      this.filteredUsers = this.userCtrl.valueChanges.pipe(
        startWith(null),
        map((data: ClientUser | null) => data ? this._filter(data) : this.allUsers.slice()));

      if (this.data.task == null) {
        this.dialogType = 2;
        this.createTaskform = this._formBuilder.group({
          priority: ['', Validators.required],
          status: ['1', Validators.required],
          desciption: ['', Validators.required],
          user: ['']
        });

        this.taskStatus = TaskStatus.Open;

      } else {


        this.selectedTask = Object.assign({}, this.data.task);
        this.dialogType = 1;
        this.isValidAssignee = true;

        this.selectedUsers = this.selectedTask.assignedTo;
        this.allUsers = this.allUsers.filter(user => !this.selectedUsers.find(selectedUser => (selectedUser.clientUserId === user.clientUserId)))
        // this.allUsers = this.allUsers.filter(user => !this.selectedUsers.includes(user.clientId));

        //   this.allUsers= this.allUsers.filter(function(user) {
        //     return this.selectedUsers.find(function(selectedUser){
        //         return selectedUser.clientUserId != user.clientId;
        //     });
        // });

        this.createTaskform = this._formBuilder.group({
          priority: [this.selectedTask.priority.toString(), Validators.required],
          status: [this.selectedTask.taskStatus.toString(), Validators.required],
          desciption: [this.selectedTask.taskDescription, Validators.required],
          user: ['']
        });
      }
    }
  }

  // ************  Assignee filter

  private _filter(value): ClientUser[] {
    if (this.isString(value)) {
      if (value.includes(';') || value.includes(',')) {
        let nonUserAssignee = value.replace(';', '');
        nonUserAssignee = nonUserAssignee.replace(',', '');
        if (nonUserAssignee.trim().length >= 3) {
          let clientUser = new ClientUser();
          clientUser.clientUserName = nonUserAssignee.trim();
          clientUser.isNewUser = true;
          this.selectedUsers.push(clientUser);
          this.userInput.nativeElement.value = '';
        }
        if (this.selectedUsers.length > 0) {
          this.isValidAssignee = true;
        }
        return;
      }
    }

    this.otherUserName = value;
    let return_value: any;
    if (this.allUsers.includes(value)) {
      return_value = this.allUsers.filter((user: ClientUser) => user.clientUserId == value.clientUserId);
      this.selectedHandle(value);
    } else {
      const filterValue = value.toLowerCase();
      return_value = this.allUsers.filter((user: ClientUser) => user.clientUserName.toLowerCase().indexOf(filterValue) === 0);
    }
    return return_value;
  }

  isString(val): boolean {
    return typeof val === 'string';
  }


  private selectedHandle(value: ClientUser) {

    let index = this.allUsers.indexOf(value)
    this.allUsers.splice(index, 1);
    console.log(this.selectedUsers, this.allUsers);
    this.createTaskform.get('user').setValue(this.selectedUsers);
  }

  remove(user: ClientUser): void {


    const index = this.selectedUsers.indexOf(user);
    if (index >= 0) {
      this.selectedUsers.splice(index, 1);
      if (user.isNewUser != true) {
        this.allUsers.push(user);
      }
      this.userCtrl.setValue(null);
      this.createTaskform.get('user').setValue(this.selectedUsers);
    }
    if (this.selectedUsers.length > 0) {
      this.isValidAssignee = true;
    } else {
      this.isValidAssignee = false;
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.selectedUsers.push(event.option.value);
    this.userInput.nativeElement.value = '';
    this.userCtrl.setValue(null);
    this.isValidAssignee = true;
  }

  removeNonEmpUser() {
    this.selectedTask.othersName = '';
  }
  //***************** */

  assigneeListUpdated(assignees) {
    this.assignees = assignees;
  }

  priorityUpdated(priority) {
    this.taskPriority = priority;
  }

  statusUpdated(status) {
    this.taskStatus = status;
  }

  submitTask() {

    var task: Task;
    var assigneeNameList: string[] = [];

    if (this.dialogType == 1) {
      task = this.selectedTask;
    } else {
      task = new Task();
      task.id = 0;
      task.createdBy = this.currentUser.clientId;
      task.createdByUser = this.currentUser.firstName + ' ' + this.currentUser.lastName;

      task.createdAt = new Date().toString();
      task.createdDate = moment.utc(task.createdAt).format(AppDateFormat.DisplayFormat);
    }

    if (this.selectedUsers.length > 0) {
      task.assignedTo = this.selectedUsers;

      task.assignedTo.forEach(assignee => {
        let id: any;
        if (assignee.clientId != null) {
          id = assignee.clientId;
        } else {
          id = assignee.clientUserId;
        }
        if (id == null) {
          id = '';
        }

        if (assignee.clientUserName == null) {
          assignee.clientUserName = assignee.firstName + ' ' + assignee.lastName;
        }
        assigneeNameList.push(assignee.clientUserName);
        this.assignees.push({
          "clientUserId": id,
          "clientUserName": assignee.clientUserName
        });
      });
    }

    if (task.assignedTo != null && task.assignedTo.length > 0) {
      task.isOther = 2;
    } else {
      task.isOther = 1;
      task.othersName = this.otherUserName;
    }

    task.taskDescription = this.createTaskform.value['desciption'];
    task.modifiedBy = this.currentUser.clientId;
    task.modifiedByUser = this.currentUser.firstName + ' ' + this.currentUser.lastName;

    if (this.taskPriority != null) {
      task.priority = this.taskPriority;
    }

    if (this.taskStatus != null) {
      task.taskStatus = this.taskStatus;
    }

    task.modifiedDate = new Date().toString();
    task.modifiedDisplayDate = moment(task.modifiedDate).format(AppDateFormat.DisplayFormat);

    switch (Number(this.taskPriority)) {
      case TaskPirority.Highest: {
        task.priorityText = 'Highest';
        break;
      }

      case TaskPirority.High: {
        task.priorityText = 'High';
        break;
      }

      case TaskPirority.Medium: {
        task.priorityText = 'Medium';
        break;
      }

      case TaskPirority.Low: {
        task.priorityText = 'Low';
        break;
      }
    }

    switch (Number(this.taskStatus)) {

      case TaskStatus.Open: {
        task.statusText = 'Open';
        break;
      }
      case TaskStatus.InProgress: {
        task.statusText = 'In Progress';
        break;
      }
      case TaskStatus.ReOpened: {
        task.statusText = 'Re Opened';
        break;
      }
      case TaskStatus.OnHold: {
        task.statusText = 'On Hold';
        break;
      }
      case TaskStatus.Closed: {
        task.statusText = 'Closed';
        break;
      }
      case TaskStatus.Deferred: {
        task.statusText = 'Deferred';
        break;
      }
    }

    var clientTask = {
      'clientOrganisationId': this.currentUser.organizationId,
      'createdBy': this.currentUser.clientId,
      'modifiedBy': this.currentUser.clientId,
      'priority': task.priority,
      'isOther': task.isOther,
      'othersName': task.othersName,
      'taskDescription': task.taskDescription,
      'taskStatus': task.taskStatus
    }

    if (this.dialogType == 1) {
      clientTask['id'] = task.id;
    } else {
      clientTask['id'] = this.newTaskId;
    }

    this.taskData['clientTask'] = clientTask;

    if (this.assignees != null && this.assignees.length > 0) {
      this.taskData['assignee'] = this.assignees;
    }



    if (this.dialogType == 2) {
      this._appService.postNewClientTask(this.taskData).subscribe((response) => {
        if (response.statusCode == APIResponse.Success) {
          this._appUtil.showAlert(AlertType.Success, AppLiterals.addNewTaskSuccessful);
          task.assineeDisplayName = assigneeNameList.toString();
          task.id = this.newTaskId;
          this.dialogRef.close(task);
        } else {
          this._appUtil.showAlert(AlertType.Error, AppLiterals.unableToAddTask);
        }
      }, err => {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
      });
    } else if (this.dialogType == 1) {
      this._appService.updateClientTask(this.taskData).subscribe((response) => {
        if (response.statusCode == APIResponse.Success) {
          this._appUtil.showAlert(AlertType.Success, AppLiterals.updateTaskSuccessful);
          this.dialogRef.close(task);
        } else {
          this._appUtil.showAlert(AlertType.Error, AppLiterals.unableToUpdateTask);
        }
      }, err => {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
      });
    }
  }
}


@Component({
  selector: 'task-comments-dialog',
  templateUrl: 'task-comments-dialog.html',
  animations: fuseAnimations
})

export class TaskCommentsDialog {
  createCommentform: FormGroup;
  currentUser;
  currentTask;

  newCommentPosted = false;

  constructor(
    private _formBuilder: FormBuilder,
    public _appService: AppService,
    public _appUtil: AppUtilService,
    public dialogRef: MatDialogRef<CreateTaskDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {

    this.createCommentform = this._formBuilder.group({
      userInputComment: ['', Validators.required]
    });

    debugger;

    if (this.data != null) {
      this.currentUser = this.data.userData;
      var tempTask = this.data.task;
      if (tempTask.comments != null) {
        var userComments = tempTask.comments.map(comment => {
          comment.createdAtFormattedText = moment.utc(comment.createdAt).format(AppDateFormat.DisplayFormat);
          return comment;
        });
        tempTask.comments = userComments;
      } else {
        tempTask.comments = [];
      }
      this.currentTask = tempTask;
    }
  }


  postComment() {
    var taskComment = new TaskComment();
    taskComment.comment = this.createCommentform.value['userInputComment'];
    taskComment.createdAt = new Date().toString();
    taskComment.createdAtFormattedText = moment(taskComment.createdAt).format(AppDateFormat.DisplayFormat);
    taskComment.clientName = this.currentUser.firstName + ' ' + this.currentUser.lastName;

    var commentData = {
      'taskId': this.currentTask.id,
      'comment': taskComment.comment,
      'clientId': this.currentUser.clientId
    }

    this._appService.postCommentOnTask(commentData).subscribe((response) => {
      if (response.statusCode == APIResponse.Success) {
        this._appUtil.showAlert(AlertType.Success, AppLiterals.addNewTaskCommentSuccessful);
        this.currentTask.comments.push(taskComment);
        this.newCommentPosted = true;
        this.createCommentform.controls["userInputComment"].reset();
      } else {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.unableToPostTaskComment);
      }
    }, err => {
      this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
    });
  }

  dismissDialog() {
    this.dialogRef.close(this.newCommentPosted);
  }
}



