import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient, HttpParams } from '@angular/common/http';
import { AppConstants } from 'app/utils/app-constants';
import { userdetailsApi } from 'app/global';

@Injectable({
  providedIn: 'root'
})

export class AppService {

  httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };

  constructor(
    private _httpClient: HttpClient
  ) { }

  //Client

  getClientAccountDetails(clientOrgId: string, clientUserId: string) {
    let finalUrl = AppConstants.clientOrgAccountDetailsURL + clientOrgId + '/' + clientUserId
    return this._httpClient.get<any>(finalUrl, this.httpOptions);
  }

  getClientAccountDetailsForSupportUser(clientOrgId: string) {
    let finalUrl = AppConstants.clientOrgAccountDetailsURL + clientOrgId
    return this._httpClient.get<any>(finalUrl, this.httpOptions);
  }

  getClientProfileDetails(clientId: string) {
    return this._httpClient.get<any>(`${AppConstants.clientOrgProfileDetailsURL}${clientId}`, this.httpOptions);
  }

  resetPassword(resetPasswordDetails: any) {
    return this._httpClient.post(AppConstants.resetPasswordURL, resetPasswordDetails, this.httpOptions);
  }

  forgotPassword(emailId: string) {
    return this._httpClient.get<any>(`${AppConstants.forgotPasswordURL}${emailId}`, this.httpOptions);
  }

  getClientUserListForOrg(clientOrgId: string) {
    return this._httpClient.get<any>(`${AppConstants.clientGetUserListForOrgURL}${clientOrgId}`, this.httpOptions);
  }

  setPasswordWithDynamicLink(params) {
    return this._httpClient.post(AppConstants.resetPasswordURL, params, this.httpOptions);
  }

  resendClientOrgRegisterOrgEmail(param) {
    return this._httpClient.post(AppConstants.resendClientRegisterMailURL, param, this.httpOptions);
  }

  resendVendorOrgRegisterOrgEmail(param) {
    return this._httpClient.post(AppConstants.resendVendorRegisterMailURL, param, this.httpOptions);
  }


  resetPasswordWithDynamicLink(hash: string, password: string, isNewUser: boolean) {
    let params = {
      "hash": hash,
      "password": password,
      "isNewUser": isNewUser
    };
    return this._httpClient.post(AppConstants.resetPasswordURL, params, this.httpOptions);
  }

  inviteNewClientUser(userDetails: any) {
    return this._httpClient.post<any>(AppConstants.clientNewUserInvitationURL, userDetails, this.httpOptions);
  }

  accpetClientInvitation(hash: string) {
    let params = {
      "hash": hash
    };
    return this._httpClient.post<any>(AppConstants.clientInvitationAcceptanceURL, params, this.httpOptions);
  }

  validateRegistrationLink(hash: string) {
    let params = {
      "hash": hash
    };
    return this._httpClient.post<any>(AppConstants.validteRegistrationLinkURL, params, this.httpOptions);
  }


  validteUserInviteLinkURL(hash: string) {
    let params = {
      "hash": hash
    };
    return this._httpClient.post<any>(AppConstants.validteUserInviteLinkURL, params, this.httpOptions);
  }


  updateClientUserDetails(userDetails: any) {
    return this._httpClient.put<any>(AppConstants.clientUserDetailsUpdateURL, userDetails);
  }

  deleteClientUser(userId: string, orgId: string, modifiedByUserId: string) {
    let userDetails = {
      "clientUserId": userId,
      "clientOrgId": orgId,
      "modifiedByUserId": modifiedByUserId
    };
    return this._httpClient.put<any>(AppConstants.clientUserDeleteURL, userDetails);
  }

  registerClientOrganisation(registrationDetails: any, hash: string) {
    let params = new HttpParams().set('hash', hash);
    return this._httpClient.post(AppConstants.clientOrgRegisterationURL, registrationDetails, { params: params });
  }

  registerNewClientOrgFromApp(registrationDetails: any, clientId: string) {
    let newOrgUrl = AppConstants.clientRegisterNewOrgURL + clientId;
    return this._httpClient.post(newOrgUrl, registrationDetails);
  }

  cloneProject(projectId: string) {
    let cloneUrl = AppConstants.cloneProjectURL + projectId;
    return this._httpClient.post<any>(cloneUrl, this.httpOptions);
  }


  // vendorGetUnclaimedOrgProfilesURL


  updateClientOrganisation(orgDetails: any) {
    return this._httpClient.put<any>(AppConstants.clientUpdateOrgDetailsURL, orgDetails, { params: orgDetails });
  }

  getClientOrganisationList(clientId: string) {
    return this._httpClient.get<any>(`${AppConstants.clientUserOrgListURL}${clientId}`, this.httpOptions);
  }

  getVendorOrgDetails(vendorId: string) {
    return this._httpClient.get<any>(`${userdetailsApi}/vendor/${vendorId}`, this.httpOptions);

    // return this._httpClient.get<any>(`${AppConstants.getVendorOrgDetailURL}${vendorId}`, this.httpOptions);
  }

  getAppData() {
    return this._httpClient.get<any>(`${AppConstants.getAppDataURL}`, this.httpOptions);
  }

  getAmenityList() {
    return this._httpClient.get<any>(`${AppConstants.getAmenityListURL}`, this.httpOptions);
  }

  updateClientDetails(userDetails: any) {
    return this._httpClient.put<any>(AppConstants.clientUpdateUserDetailsURL, userDetails);
  }

  getClientMyReviews(clientId: number, orgId: number) {
    let urlPrefix = AppConstants.clientGetMyReviewsURL + clientId + '/'
    return this._httpClient.get<any>(`${urlPrefix}${orgId}`, this.httpOptions);
  }

  replyClientReview(vendorReply: any) {
    return this._httpClient.put<any>(AppConstants.vendorReplyReviewURL, vendorReply);
  }

  deleteVendorReview(reviewId: any) {
    return this._httpClient.put<any>(`${AppConstants.clientDeleteReviewURL}${reviewId}`, reviewId);
  }

  updateVendorReview(updatedReview: any) {
    return this._httpClient.put<any>(AppConstants.clientUpdateReviewURL, updatedReview);
  }

  postRatingForVendor(vendorRatingDetails) {
    return this._httpClient.post<any>(AppConstants.clientSubmitVendorRatingURL, vendorRatingDetails);
  }

  answerToProjectQuestion(projectQuestionId: number, clientUserId: number, answer: string) {
    let params = {
      "answer": answer,
      "clientUserId": clientUserId,
      "projectqaId": projectQuestionId
    };
    return this._httpClient.put<any>(AppConstants.clientAnswerToProjectQuestionURL, params);
  }

  updateClientAmenityList(amenityList, clientOrgId) {
    let amenityUpdateUrl = AppConstants.clientOrgUpdateAmenityListURL + clientOrgId;
    return this._httpClient.put<any>(amenityUpdateUrl, amenityList);
  }

  updateClientDefaultOrg(clientOrgId: number, userId: number) {
    let updateDefaultOrgUrl = AppConstants.clientSetDefaultOrgURL + userId + '/primary/' + clientOrgId
    return this._httpClient.put<any>(updateDefaultOrgUrl, clientOrgId);
  }

  pullProjectBid(projectBidId: string) {
    let bidPullUrl = AppConstants.vendorPullProjectBidURL + projectBidId;
    return this._httpClient.put<any>(bidPullUrl, this.httpOptions);
  }


  //Client Annual Contract

  getClientAnnualContractList(clientOrgId: number) {
    return this._httpClient.get<any>(`${AppConstants.clientGetAnnualContractListURL}${clientOrgId}`, this.httpOptions);
  }

  addNewAnnaualContract(annualContract) {
    return this._httpClient.post(AppConstants.clientAddAnnualContractURL, annualContract);
  }

  updateAnnaualContract(annualContract) {
    return this._httpClient.put(`${AppConstants.clientEditAnnualContractURL}`, annualContract);
  }

  deleteAnnaualContract(contractId) {
    let contractDetails = {
      "contractId": contractId,
    };
    return this._httpClient.put<any>(`${AppConstants.clientDeleteAnnualContractURL}${contractId}`, contractDetails);
  }

  //Client Tasks

  getClientTaskList(clientOrgId: number) {
    return this._httpClient.get<any>(`${AppConstants.clientGetAllTasksURL}${clientOrgId}`, this.httpOptions);
  }

  postNewClientTask(task) {
    return this._httpClient.post<any>(AppConstants.clientCreateNewTaskURL, task);
  }

  postCommentOnTask(comment) {
    return this._httpClient.post<any>(AppConstants.clientPostCommentOnTaskURL, comment);
  }

  updateClientTask(task) {
    return this._httpClient.put<any>(`${AppConstants.clientUpdateTaskURL}`, task);
  }

  deleteClientTask(taskId, clientUserId) {
    let taskDetails = {
      "id": taskId,
      "clientUserId": clientUserId
    };
    return this._httpClient.put<any>(`${AppConstants.clientDeleteTaskURL}${taskDetails}`, taskDetails);
  }

  createBuildingRepo(repoDetails) {
    return this._httpClient.post<any>(AppConstants.clientCreateBuildingRepoURL, repoDetails);
  }

  updateBuildingRepo(repoDetails) {
    return this._httpClient.put<any>(`${AppConstants.clientUpdateBuildingRepoURL}`, repoDetails);
  }

  deleteBuildingRepo(repoId, clientUserId) {
    let repoDetails = {
      "id": repoId,
      "clientUserId": clientUserId
    };
    return this._httpClient.put<any>(`${AppConstants.clientDeleteBuildingRepoURL}${repoDetails}`, repoDetails);
  }

  getBuildingRepoList(clientOrgId: number) {
    return this._httpClient.get<any>(`${AppConstants.clientGetBuildingRepoListURL}${clientOrgId}`, this.httpOptions);
  }


  updatePreferredVendorStatus(preferredDetails: any) {
    return this._httpClient.post<any>(AppConstants.updatePreferredVendorStatusURL, preferredDetails, this.httpOptions);
  }

  // Client Project

  getClientCurrentProjects(id: string) {
    return this._httpClient.get<any>(`${AppConstants.clientCurrentProjectsURL}${id}`, this.httpOptions);
  }

  getClientProjectsHistory(id: string) {
    return this._httpClient.get<any>(`${AppConstants.clientProjectsHistoryURL}${id}`, this.httpOptions);
  }

  createProject(projectDeatils) {
    return this._httpClient.post(AppConstants.clientCreateProjectURL, projectDeatils);
  }

  updateProject(projectDetails) {
    return this._httpClient.put<any>(AppConstants.clientUpdateProjectURL, projectDetails);
  }

  publishProject(projectID) {
    let publishProjectUrl = AppConstants.clientPublishProjectURL + projectID;
    return this._httpClient.put<any>(publishProjectUrl, this.httpOptions);
  }

  cancelProject(projectID, clientUserId) {
    let cancelProjectUrl = AppConstants.clientCancelProjectURL + projectID + '/' + clientUserId;
    return this._httpClient.put<any>(cancelProjectUrl, this.httpOptions);
  }


  getProjectById(projectID) {
    return this._httpClient.get<any>(`${AppConstants.getProjectDetailsByIdURL}${projectID}`, this.httpOptions);
  }

  postClientBidViewLog(bidLog) {
    return this._httpClient.post<any>(AppConstants.clientPostBidViewLogURL, bidLog);
  }


  //Vendor

  getVendorOrgAccountDetails(vendorId: string) {
    return this._httpClient.get<any>(`${AppConstants.vendorOrgAccountDetailsURL}${vendorId}`, this.httpOptions);
  }

  getVendorOrgProfileDetails(vendorId: string) {
    return this._httpClient.get<any>(`${AppConstants.vendorOrgProfileDetailsURL}${vendorId}`, this.httpOptions);
  }

  getvendorUnclaimedOrgProfile(vendorOrgId: string) {
    return this._httpClient.get<any>(`${AppConstants.vendorUnclaimedOrgProfileURL}${vendorOrgId}`, this.httpOptions);
  }

  registerVendorOrganisation(registrationDetails: any, hash: string) {
    let params = new HttpParams().set('hash', hash);
    return this._httpClient.post(AppConstants.vendorOrgRegisterationURL, registrationDetails, { params: params });
  }

  updateVendorUserInfo(userDetails: any) {
    return this._httpClient.put<any>(AppConstants.vendorUpdateUserDetailsURL, userDetails);
  }

  inviteNewVendorUser(userDetails: any) {
    return this._httpClient.post<any>(AppConstants.vendorNewUserCreationURL, userDetails, this.httpOptions);
  }

  accpetVendorInvitation(hash: string) {
    let params = {
      "hash": hash
    };
    return this._httpClient.post<any>(AppConstants.vendorInvitationAcceptanceURL, params, this.httpOptions);
  }

  updateVendorUserDetails(userDetails: any) {
    return this._httpClient.put<any>(AppConstants.vendorUserDetailsUpdateURL, userDetails);
  }

  deleteVendorUser(userId: string, modifiedByUserId: string) {
    let userDetails = {
      "vendorId": userId,
      "modifiedByUserId": modifiedByUserId
    };
    return this._httpClient.put<any>(AppConstants.vendorUserDeleteURL, userDetails);
  }

  getUnclaimedVendorOrgList() {
    return this._httpClient.get<any>(`${AppConstants.vendorGetUnclaimedOrgProfilesURL}`, this.httpOptions);
  }

  updateVendorFavorites(projectId: string, vendorId: string, interested: string, orgId: string) {
    let params = {
      "projectId": projectId,
      "vendorId": vendorId,
      "interestStatus": interested,
      "vendorOrganisationId": orgId
    };
    return this._httpClient.post<any>(AppConstants.vendorProjectFavoriteURL, params, this.httpOptions);
  }

  getVendorFavoriteProjectList(vendorId: string) {
    return this._httpClient.get<any>(`${AppConstants.vendorGetFavoriteProjectListURL}${vendorId}`, this.httpOptions);
  }

  getVendorCurrentProjectList(orgId: string) {
    return this._httpClient.get<any>(`${AppConstants.vendorGetCurrentProjectListURL}${orgId}`, this.httpOptions);
  }

  getVendorHistoryProjectList(orgId: string) {
    return this._httpClient.get<any>(`${AppConstants.vendorGetHistoryProjectListURL}${orgId}`, this.httpOptions);
  }

  getMarketplaceProjectsForVendor(vendorId: string) {
    return this._httpClient.get<any>(`${AppConstants.vendorMarketplaceProjectListURL}${vendorId}`, this.httpOptions);
  }

  getProjectDetailsForVendor(vendorId: string, projectId: string) {
    let urlPrefix = AppConstants.vendorProjectDetailsURL + projectId + '/vendor/'
    return this._httpClient.get<any>(`${urlPrefix}${vendorId}`, this.httpOptions);
  }

  postProjectQuestion(projectId: number, vendorUserId: number, question: string) {
    let params = {
      "projectId": projectId,
      "question": question,
      "vendorUserId": vendorUserId
    };

    return this._httpClient.post<any>(AppConstants.postQuestionToProjectURL, params, this.httpOptions);
  }

  updateVendorProfileCompanyDetails(companyDetails: any) {
    return this._httpClient.put<any>(AppConstants.vendorProfileUpdateCompanyInfoURL, companyDetails);
  }

  updateVendorProfileSaleDetails(saleDetails: any) {
    return this._httpClient.put<any>(AppConstants.vendorProfileUpdateSaleInfoURL, saleDetails);
  }

  updateVendorProfileContactDetails(contactDetails: any) {
    return this._httpClient.put<any>(AppConstants.vendorProfileUpdateContactInfoURL, contactDetails);
  }

  updateVendorProfileProductDetails(productDetails: any) {
    return this._httpClient.put<any>(AppConstants.vendorProfileUpdateProductsInfoURL, productDetails);
  }

  vendorCreatePortfolio(params: any) {
    return this._httpClient.post<any>(AppConstants.vendorCreateNewPortfolioURL, params, this.httpOptions);
  }

  vendorDeletePortfolio(portfolioId: any) {
    let deletePortfolioUrl = AppConstants.vendorDeletePortfolioURL + portfolioId
    return this._httpClient.put<any>(deletePortfolioUrl, this.httpOptions);
  }

  updateVendorPortfolio(params: any) {
    return this._httpClient.put<any>(AppConstants.vendorUpdatePortfolioURL, params);
  }

  updateVendorOtherDetails(params: any) {
    return this._httpClient.put<any>(AppConstants.updateVendorInsuranceAndOtherDetailsURL, params);
  }


  //Messages

  getInternalMessageList(clientOrgId: number, userType: number, userId: number) {
    let urlPrefix = AppConstants.internalMsgListURL + userType + '/' + clientOrgId + '/'
    return this._httpClient.get<any>(`${urlPrefix}${userId}`, this.httpOptions);
  }

  postNewInternalMessage(messageDetails: any) {
    return this._httpClient.post<any>(AppConstants.internalMsgCreateNewURL, messageDetails, this.httpOptions);
  }

  postInternalMessageComment(commentDetails: any) {
    return this._httpClient.post<any>(AppConstants.internalPostCommentForMsgURL, commentDetails, this.httpOptions);
  }


  getExternalMessageList(clientOrgId: number, userType: number, userId: number) {
    let urlPrefix = AppConstants.externalMsgListURL + userType + '/' + clientOrgId + '/'
    return this._httpClient.get<any>(`${urlPrefix}${userId}`, this.httpOptions);
  }

  getSupportExternalMessages(clientOrgId: number, userType: number) {
    let urlPrefix = AppConstants.getClientAllExtrnlMessagesURL + userType + '/'
    return this._httpClient.get<any>(`${urlPrefix}${clientOrgId}`, this.httpOptions);
  }

  postNewExternalMessage(messageDetails: any) {
    return this._httpClient.post<any>(AppConstants.externalMsgCreateNewURL, messageDetails, this.httpOptions);
  }

  postExternalMessageComment(commentDetails: any) {
    return this._httpClient.post<any>(AppConstants.externalPostCommentForMsgURL, commentDetails, this.httpOptions);
  }

  getInternalMessageDetailsByID(messageId: number, userType: number, userId: number) {
    let urlPrefix = AppConstants.getInternalMessageDetailsByIDURL + userType + '/' + userId + '/'
    return this._httpClient.get<any>(`${urlPrefix}${messageId}`, this.httpOptions);
  }

  getExternalMessageDetailsByID(messageId: number, userType: number, userId: number) {
    let urlPrefix = AppConstants.getExternalMessageDetailsByIDURL + userType + '/' + userId + '/'
    return this._httpClient.get<any>(`${urlPrefix}${messageId}`, this.httpOptions);
  }

  //Nofifications

  getClientNotifications(clientOrgId: number, userId: number) {
    let urlPrefix = AppConstants.clientNotificationsURL + userId + '/';
    return this._httpClient.get<any>(`${urlPrefix}${clientOrgId}`, this.httpOptions);
  }

  resetClientNotifications(clientOrgId: number, userId: number) {
    let urlPrefix = AppConstants.clientResetNotificationCountURL + userId + '/';
    return this._httpClient.get<any>(`${urlPrefix}${clientOrgId}`, this.httpOptions);
  }

  getVendorNotifications(vendorOrgId: number, userId: number) {
    let urlPrefix = AppConstants.vendorNotificationsURL + userId + '/';
    return this._httpClient.get<any>(`${urlPrefix}${vendorOrgId}`, this.httpOptions);
  }

  resetVendorNotifications(vendorOrgId: number, userId: number) {
    let urlPrefix = AppConstants.vendorResetNotificationCountURL + userId + '/';
    return this._httpClient.get<any>(`${urlPrefix}${vendorOrgId}`, this.httpOptions);
  }

  // Global Search

  triggerClientSearch(searchDetails) {
    return this._httpClient.post<any>(AppConstants.clientGlobalSearchURL, searchDetails, this.httpOptions);
  }

  triggerVendorSearch(searchDetails) {
    return this._httpClient.post<any>(AppConstants.vendorGlobalSearchURL, searchDetails, this.httpOptions);
  }


  //Common

  getVendorOrganizationListForClient(clientOrgId: number) {
    return this._httpClient.get<any>(`${AppConstants.vendorGetAllOrgListURLForClient}${clientOrgId}`, this.httpOptions);
  }

  getVendorOrganizationList() {
    return this._httpClient.get<any>(`${AppConstants.vendorGetAllOrgListURLForVendor}`, this.httpOptions);
  }

  getClientOrganizationList(vendorOrgId) {
    return this._httpClient.get<any>(`${AppConstants.clientGetAllOrgListURL}`, this.httpOptions);
  }



  getProjectTagList() {
    return this._httpClient.get<any>(`${AppConstants.getProjectTagsURL}`, this.httpOptions);
  }

  getSupportedCitiesList() {
    return this._httpClient.get<any>(`${AppConstants.getSupportedCityListURL}`, this.httpOptions);
  }

  getMarketplaceProjects() {
    return this._httpClient.get<any>(`${AppConstants.getMarketplaceURL}`, this.httpOptions);
  }



  resetExistingPassword(resetPasswordDetails: any) {
    let params = {
      "userId": resetPasswordDetails.userId,
      "userType": resetPasswordDetails.userType,
      "password": resetPasswordDetails.password
    };

    return this._httpClient.post<any>(AppConstants.resetExistingPasswordURL, params, this.httpOptions);
  }


  //Project Bids
  createNewProjectBid(bidDetails: any) {
    return this._httpClient.post<any>(AppConstants.vendorCreateProjectBidURL, bidDetails, this.httpOptions);
  }

  updateProjectBid(bidDetails: any) {
    return this._httpClient.put<any>(AppConstants.vendorUpdateProjectBidURL, bidDetails);
  }


  postProjectBid(projectBidId: string) {
    let bidPublishUrl = AppConstants.vendorSubmitProjectBidURL + projectBidId;
    return this._httpClient.put<any>(bidPublishUrl, this.httpOptions);
  }

  awardProjectBid(bidAwardDetails: any) {
    return this._httpClient.post<any>(AppConstants.awardProjectBidURL, bidAwardDetails, this.httpOptions);
  }

  //Support User

  getUnapprovedOrgList() {
    return this._httpClient.get<any>(`${AppConstants.getUnapprovedOrgListURL}`, this.httpOptions);
  }

  updateAppUserProfileDetails(profileDetails: any) {
    return this._httpClient.put<any>(AppConstants.updateAppUserDetailsURL, profileDetails);
  }

  updateAppUserAccountDetails(userAccount: any) {
    return this._httpClient.put<any>(AppConstants.updateUserAccountStatusURL, userAccount);
  }

  updateOrgStatus(orgDetails: any) {
    return this._httpClient.put<any>(AppConstants.updateUserOrgStatusURL, orgDetails);
  }

  approveNewOrgRegistration(orgDetails: any) {
    return this._httpClient.put<any>(AppConstants.approveOrgURL, orgDetails);
  }

  searchUser(userDetails: any) {
    return this._httpClient.post<any>(AppConstants.searchUserURL, userDetails, this.httpOptions);
  }


  hideUserReview(reviewDetails: any) {
    return this._httpClient.put<any>(AppConstants.hideUserReviewURL, reviewDetails);
  }

  updateOrgDetails(orgDetails: any) {
    return this._httpClient.put<any>(AppConstants.updateClientOrgDetailsURL, orgDetails);
  }

  hideProject(projectDetails: any) {
    return this._httpClient.put<any>(AppConstants.hideProjectURL, projectDetails);
  }

  hideExternalMessage(msgDetails: any) {
    return this._httpClient.put<any>(AppConstants.hideExternalMessage, msgDetails);
  }

  createNewUser(userDetails: any) {
    return this._httpClient.post<any>(AppConstants.createNewUserURL, userDetails, this.httpOptions);
  }

  getAppClientOrgList() {
    return this._httpClient.get<any>(`${AppConstants.getAppClientOrgListURL}`, this.httpOptions);
  }

  getAppVendorOrgList() {
    return this._httpClient.get<any>(`${AppConstants.getAppVendorOrgListURL}`, this.httpOptions);
  }

  getVendorAllReviews(orgId: number) {
    return this._httpClient.get<any>(`${AppConstants.getVendorAllReviewsURL}${orgId}`, this.httpOptions);
  }

  searchOrganization(searchDetails: any) {
    return this._httpClient.post<any>(AppConstants.searchOrgURL, searchDetails, this.httpOptions);
  }

  searchNewOrganization(searchDetails: any) {
    return this._httpClient.post<any>(AppConstants.searchNewOrgRegistrationURL, searchDetails, this.httpOptions);
  }

  getAllProjectsForSupport() {
    return this._httpClient.get<any>(`${AppConstants.getAllProjectsURL}`, this.httpOptions);
  }

  updateAppUserDetails(userDetails: any) {
    return this._httpClient.put<any>(AppConstants.updateAppUserDetailsURL, userDetails);
  }


  //File Delete

  deleteProjectFile(fileIds) {
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      body: fileIds
    };
    return this._httpClient.delete<any>(AppConstants.deleteProjectFilesURL, options);
  }

  deletePortfolioFiles(fileIds) {
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      body: fileIds
    };
    return this._httpClient.delete<any>(AppConstants.deletePortfolioFilesURL, options);
  }


  deleteClientRegFiles(fileIds) {
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      body: fileIds
    };
    return this._httpClient.delete<any>(AppConstants.deleteClientRegFilesURL, options);
  }

  deleteVendorRegFiles(fileIds) {
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      body: fileIds
    };
    return this._httpClient.delete<any>(AppConstants.deleteVendorRegFilesURL, options);
  }


  deleteProjectAwardFiles(fileIds) {
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      body: fileIds
    };
    return this._httpClient.delete<any>(AppConstants.deleteProjectAwardFiles, options);
  }


  //File Uploads

  uploadVendorOrgProfileImage(imageFile: File, vendorOrgId: number) {
    let fileUploadUrl = AppConstants.vendorOrgImageUploadURL + vendorOrgId;
    const formData: FormData = new FormData();
    formData.append('multipartFile', imageFile, imageFile.name);
    return this._httpClient
      .post(fileUploadUrl, formData);
  }

  uploadClientOrgProfileImage(imageFile: File, clientOrgId: number) {
    let fileUploadUrl = AppConstants.clientOrgImageUploadURL + clientOrgId;
    const formData: FormData = new FormData();
    formData.append('multipartFile', imageFile, imageFile.name);
    return this._httpClient
      .post(fileUploadUrl, formData);
  }

  uploadUserProfileImage(imageFile: File, userId: number, userType: number) {
    let fileUploadUrl = AppConstants.userProfileImageUploadURL + userId + '/' + userType;
    const formData: FormData = new FormData();
    formData.append('multipartFile', imageFile, imageFile.name);
    return this._httpClient
      .post(fileUploadUrl, formData);
  }

  uploadClientOrgRegistrationSupportFiles(imageFile: File, clientOrgId: number, clientId: number) {
    let fileUploadUrl = AppConstants.clientOrgSupportFileUploadURL + clientOrgId + '/' + clientId
    const formData: FormData = new FormData();
    formData.append('multipartFiles', imageFile, imageFile.name);
    return this._httpClient
      .post(fileUploadUrl, formData);
  }

  uploadVendorOrgRegistrationSupportFiles(imageFile: File, vendorOrgId: number, vendorId: number) {
    let fileUploadUrl = AppConstants.vendorOrgSupportFileUploadURL + vendorOrgId + '/' + vendorId;
    const formData: FormData = new FormData();
    formData.append('multipartFiles', imageFile, imageFile.name);
    return this._httpClient
      .post(fileUploadUrl, formData);
  }


  supportUseruploadUserRegFiles(regFile: File, userType: number, orgId: number, supportUserId: number) {
    let fileUploadUrl = AppConstants.supportUserUploadUserRegFilesURL + orgId + '/' + userType + '/' + supportUserId;
    const formData: FormData = new FormData();
    formData.append('multipartFiles', regFile, regFile.name);
    return this._httpClient
      .post(fileUploadUrl, formData);
  }


  uploadFileForProject(fileToUpload: File, projectId: number) {
    let fileUploadUrl = AppConstants.uploadProjectFilesURL + projectId;
    const formData: FormData = new FormData();
    formData.append('multipartFiles', fileToUpload, fileToUpload.name);
    return this._httpClient
      .post(fileUploadUrl, formData);
  }

  uploadFileForBid(fileToUpload: File, bidId: number) {
    let fileUploadUrl = AppConstants.uploadBidFilesURL + bidId;
    const formData: FormData = new FormData();
    formData.append('multipartFiles', fileToUpload, fileToUpload.name);
    return this._httpClient
      .post(fileUploadUrl, formData);
  }


  uploadFileForBidAwarding(fileToUpload: File, awardId: number) {
    let fileUploadUrl = AppConstants.uploadFilesForProjectAwardURL + awardId;
    const formData: FormData = new FormData();
    formData.append('multipartFiles', fileToUpload, fileToUpload.name);
    return this._httpClient
      .post(fileUploadUrl, formData);
  }

  uploadFileForInternalMessage(fileToUpload: File, messageId: number) {
    let fileUploadUrl = AppConstants.internalMsgPostAttachmentURL + messageId;
    const formData: FormData = new FormData();
    formData.append('multipartFiles', fileToUpload, fileToUpload.name);
    return this._httpClient
      .post(fileUploadUrl, formData);
  }

  uploadFileForInternalMessageComment(fileToUpload: File, commentId: number) {
    let fileUploadUrl = AppConstants.internalMsgCommentPostAttachmentURL + commentId;
    const formData: FormData = new FormData();
    formData.append('multipartFiles', fileToUpload, fileToUpload.name);
    return this._httpClient
      .post(fileUploadUrl, formData);
  }

  uploadFileForExternalMessage(fileToUpload: File, messageId: number) {
    let fileUploadUrl = AppConstants.externalMsgPostAttachmentURL + messageId;
    const formData: FormData = new FormData();
    formData.append('multipartFiles', fileToUpload, fileToUpload.name);
    return this._httpClient
      .post(fileUploadUrl, formData);
  }

  uploadFileForExternalMessageComment(fileToUpload: File, commentId: number) {
    let fileUploadUrl = AppConstants.externalMsgCommentPostAttachmentURL + commentId;
    const formData: FormData = new FormData();
    formData.append('multipartFiles', fileToUpload, fileToUpload.name);
    return this._httpClient
      .post(fileUploadUrl, formData);
  }


  uploadFileForVendorPortfolio(fileToUpload: File, portfolioId: number) {
    let fileUploadUrl = AppConstants.vendorPortfolioUploadAttachmentURL + portfolioId;
    const formData: FormData = new FormData();
    formData.append('multipartFiles', fileToUpload, fileToUpload.name);
    return this._httpClient
      .post(fileUploadUrl, formData);
  }



  uploadFile(fileToUpload: File, projectId: number) {
    let fileUploadUrl = AppConstants.uploadProjectFilesURL + projectId
    const formData: FormData = new FormData();
    formData.append('multipartFiles', fileToUpload, fileToUpload.name);
    return this._httpClient
      .post(fileUploadUrl, formData);
  }

  getFileFromUrl(url) {
    return this._httpClient.get(url, { responseType: 'blob' });
  }

  updateInsuranceServicesDetails(InsuranceDetails: any) {
    return this._httpClient.put<any>(AppConstants.vendorInsuarnceServiceupdate, InsuranceDetails);
  }
}
