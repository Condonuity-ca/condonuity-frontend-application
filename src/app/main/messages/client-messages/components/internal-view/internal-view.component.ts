import { Component, OnDestroy, OnInit, ViewEncapsulation, ElementRef, ViewChild, Inject } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators, FormControl, FormArray } from '@angular/forms';
import { fuseAnimations } from '@condonuity/animations';
import { Router } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MessageService } from 'app/main/messages/service/message.service';
import { takeUntil } from 'rxjs/operators';
import { AppUtilService } from 'app/utils/app-util.service';
import { AuthenticationService } from 'app/_services';
import { AppService } from 'app/main/services/app.service';
import { APIResponse, AlertType, AppLiterals, MessageType, UserType, SearchBarPageIndex, AppDateFormat, MaxFileSize } from 'app/utils/app-constants';
import { Message } from 'app/main/messages/Model/message.model';
import { MessageComment } from 'app/main/messages/Model/message-comment.model';
import { User } from 'app/main/messages/Model/user.model';
import { MenuService } from 'app/layout/components/toolbar/menu.service';
import * as moment from 'moment';


@Component({
  selector: 'internal-view',
  templateUrl: './internal-view.component.html',
  styleUrls: ['./internal-view.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})

export class InternalViewComponent implements OnInit, OnDestroy {

  currentUser: any;
  message: Message;
  commentAttachments: any[];

  postmessageCommentForm: FormGroup;

  private _unsubscribeAll: Subject<any>;

  constructor(
    private _appService: AppService,
    private _authService: AuthenticationService,
    private _appUtil: AppUtilService,
    private _messageService: MessageService,
    private _formBuilder: FormBuilder,
    public dialog: MatDialog,
    private _menuService: MenuService
  ) {
    this._unsubscribeAll = new Subject();
    this._menuService.currentPageSearchBarSubject.next(SearchBarPageIndex.OTHERS);

    this._authService.currentUser.pipe(takeUntil(this._unsubscribeAll)).subscribe(userData => {
      this.currentUser = userData;
    });

    this._messageService.message.pipe(takeUntil(this._unsubscribeAll)).subscribe(msg => {
      this.message = msg;
    });

    this.postmessageCommentForm = this._formBuilder.group({
      description: ['', Validators.required]
    });
  }

  ngAfterViewInit(): void {
    this.scrollToLastComment();
  }

  attachmentClicked(fileDetails) {
    this._appUtil.downloadFile(fileDetails.containerName, fileDetails.blobName, fileDetails.fileName, fileDetails.fileType);
  }

  removeDocAttachment(index) {
    this.commentAttachments.splice(index, 1);
  }

  appendDocumentFiles(event) {
    let files = event.target.files;
    if (this.commentAttachments == null) {
      this.commentAttachments = [];
    }

    if (AppUtilService.checkMaxFileSize(files, MaxFileSize.FIVEMB)) {
      for (let i = 0; i < files.length; i++) {
        let file = files[i];
        file.formatedSize = AppUtilService.formatSizeUnits(file.size);
        this.commentAttachments.push({
          "name": file.name,
          "formatedSize": file.formatedSize,
          "fileType": "1",
          "file": file
        });
      }
    }
    else {
      this._appUtil.showAlert(AlertType.Error, AppLiterals.FilesizeError5MB);
    }
  }


  postComment() {
    let formValue = this.postmessageCommentForm.value;

    let orgId = '';
    let currentUserId = '';

    if (this.currentUser.userType == UserType.Client) {
      orgId = this.currentUser.currentOrgId;
      currentUserId = this.currentUser.clientId;
    } else if (this.currentUser.userType == UserType.Vendor) {
      orgId = this.currentUser.vendorOrganisationId;
      currentUserId = this.currentUser.userId;
    }

    let user = new User();
    user.firstName = this.currentUser.firstName;
    user.lastName = this.currentUser.lastName;
    user.profileImageURL = this.currentUser.profileImageUrl;
    user.organisationName = "";

    let newMessageDetails = {
      "threadId": this.message.id,
      "userId": currentUserId,
      "organisationId": orgId,
      "userType": this.currentUser.userType,
      "comment": formValue.description,
      "user": user
    }



    let newComment = new MessageComment();
    newComment.comment = newMessageDetails.comment;
    newComment.formatedCreatedDate = "Now";
    newComment.user = user;
    newComment.files = [];

    if (this.commentAttachments != null && this.commentAttachments.length > 0) {
      var attachments = [];
      newComment.files = [];

      this.commentAttachments.forEach(attachment => {
        let val = {
          "fileName": attachment.name
        };
        newComment.files.push(val)
      });
      newComment.files = attachments;
    }


    if (this.message.messageType == MessageType.InternalMessage) {
      this._appService.postInternalMessageComment(newMessageDetails).subscribe((response: any) => {
        if (response.statusCode == APIResponse.Success) {
          this.postmessageCommentForm.controls["description"].reset();

          let commentId = response.threadCommentId;

          if (commentId != null && commentId != '') {
            newComment.id = commentId;
          }
          if (this.commentAttachments != null && this.commentAttachments.length > 0) {
            this.postCommentAttachments(newComment);
          } else {
            this.refreshMessageView()
            // this.message.comments.push(newComment);
            this.scrollToLastComment();
            this.clearCommentForm();
          }
        } else {
          this._appUtil.showAlert(AlertType.Error, AppLiterals.newMessageCreationSuccess);
        }
      }, err => {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
      });
    } else {
      this._appService.postExternalMessageComment(newMessageDetails).subscribe((response: any) => {
        if (response.statusCode == APIResponse.Success) {
          let commentId = response.threadCommentId;
          this.postmessageCommentForm.controls["description"].reset();
          if (commentId != null && commentId != '') {
            newComment.id = commentId;
          }

          if (this.commentAttachments != null && this.commentAttachments.length > 0) {
            this.postCommentAttachments(newComment);
          } else {
            this.refreshMessageView()
            // this.message.comments.push(newComment);
            this.scrollToLastComment();
            this.clearCommentForm();
          }
        } else {
          this._appUtil.showAlert(AlertType.Error, AppLiterals.newMessageCreationSuccess);
        }
      }, err => {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
      });
    }
  }

  postCommentAttachments(comment) {
    if (this.message.messageType == MessageType.InternalMessage) {
      let successfileUpload = 0;
      this.commentAttachments.forEach(attachment => {
        this._appService.uploadFileForInternalMessageComment(attachment.file, comment.id).subscribe((response: any) => {
          if (response.statusCode == APIResponse.Success) {
            successfileUpload = successfileUpload + 1;
            if (successfileUpload == this.commentAttachments.length) {
              this.commentAttachments = [];
              this.refreshMessageView();
              this.scrollToLastComment();
              this.clearCommentForm();
            }
          } else {
            this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
          }
        }, err => {
          this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
          console.log(err);
        });
      });
    } else {
      let successfileUpload = 0;
      this.commentAttachments.forEach(attachment => {
        this._appService.uploadFileForExternalMessageComment(attachment.file, comment.id).subscribe((response: any) => {
          if (response.statusCode == APIResponse.Success) {
            successfileUpload = successfileUpload + 1;
            if (successfileUpload == this.commentAttachments.length) {
              this.refreshMessageView();
              this.scrollToLastComment();
              this.clearCommentForm();
            }
          } else {
            this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
          }
        }, err => {
          this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
          console.log(err);
        });
      });
    }
  }

  scrollToLastComment() {
    document.getElementById('commentEndDiv').scrollIntoView({ behavior: "smooth" });
  }

  clearCommentForm() {
    this.postmessageCommentForm.controls['description'].setValue('');
    this.commentAttachments = [];
  }


  ngOnInit(): void {

  }

  refreshMessageView() {

    let currentUserId: any;

    if (this.currentUser.userType == UserType.Client) {
      currentUserId = this.currentUser.clientId;
    } else if (this.currentUser.userType == UserType.Vendor) {
      currentUserId = this.currentUser.userId;
    }

    if (this.message.messageType == MessageType.InternalMessage) {
      this._appService.getInternalMessageDetailsByID(this.message.id, this.currentUser.userType, currentUserId).subscribe((response: any) => {
        if (response.statusCode == APIResponse.Success) {
          let rawMessage = response.internalMessage;
          rawMessage.formatedCreatedDate = moment.utc(rawMessage.createdAt).format(AppDateFormat.DisplayFormatWithTime);
          rawMessage.messageType = MessageType.InternalMessage;

          rawMessage.comments.forEach(comment => {
            var createdDate = moment.utc(comment.createdAt).toDate();
            comment.formatedCreatedDate = moment(createdDate).format(AppDateFormat.DisplayFormatWithTime);
            if (comment.files == null) {
              comment.files = [];
            }
            return comment;
          });

          this.message = rawMessage;

        } else {
          this._appUtil.showAlert(AlertType.Error, AppLiterals.newMessageCreationSuccess);
        }
      }, err => {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
      });
    } else {
      this._appService.getExternalMessageDetailsByID(this.message.id, this.currentUser.userType, currentUserId).subscribe((response: any) => {
        if (response.statusCode == APIResponse.Success) {

          let rawMessage = response.externalMessage;

          if (rawMessage.fromUser == null) {
            rawMessage.fromUser = [];
            rawMessage.fromUser.profileImageURL = '';
          }

          rawMessage.formatedCreatedDate = moment.utc(rawMessage.createdAt).format(AppDateFormat.DisplayFormatWithTime);
          rawMessage.messageType = MessageType.ExternalMessage;

          rawMessage.comments.forEach(comment => {
            var createdDate = moment.utc(comment.createdAt).toDate();
            comment.formatedCreatedDate = moment(createdDate).format(AppDateFormat.DisplayFormatWithTime);
            if (comment.files == null) {
              comment.files = [];
            }
            return comment;
          });

          this.message = rawMessage;

        } else {
          this._appUtil.showAlert(AlertType.Error, AppLiterals.newMessageCreationSuccess);
        }
      }, err => {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
      });
    }
  }



  /**
   * On destroy
   */
  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}

