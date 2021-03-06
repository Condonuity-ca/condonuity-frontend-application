import { environment } from '../../environments/environment'
// import {APIResponse, UserType,InsuranceConfirmation,ContractType} from './app-constants'

export * from './app-enum'
export * from './app-literals'

// export {APIResponse, UserType,InsuranceConfirmation,ContractType}


export class AppConstants {

    public static get verifyEmailURL(): string {
        return `${environment.domainName}${environment.verifyEmailURL}`;
    }

    public static get loginURL(): string {
        return `${environment.domainName}${environment.loginURL}`;
    }

    public static get authTokenURL(): string {
        return `${environment.domainName}${environment.authTokenURL}`;
    }

    public static get resetPasswordURL(): string {
        return `${environment.domainName}${environment.resetPasswordURL}`;
    }

    public static get forgotPasswordURL(): string {
        return `${environment.domainName}${environment.forgotPasswordURL}`;
    }

    public static get validteRegistrationLinkURL(): string {
        return `${environment.domainName}${environment.validteRegistrationLinkURL}`;
    }

    public static get validteUserInviteLinkURL(): string {
        return `${environment.domainName}${environment.validteUserInviteLinkURL}`;
    }


    public static get setPasswordWithDynamicLinkURL(): string {
        return `${environment.domainName}${environment.setPasswordWithDynamicLinkURL}`;
    }

    public static get getAppDataURL(): string {
        return `${environment.domainName}${environment.getAppDataURL}`;
    }

    public static get getAmenityListURL(): string {
        return `${environment.domainName}${environment.getAmenityListURL}`;
    }

    public static get resendClientRegisterMailURL(): string {
        return `${environment.domainName}${environment.resendClientRegisterMailURL}`;
    }

    public static get resendVendorRegisterMailURL(): string {
        return `${environment.domainName}${environment.resendVendorRegisterMailURL}`;
    }

    //CLIENT

    public static get clientUserRegisterationURL(): string {
        return `${environment.domainName}${environment.clientUserRegisterationURL}`;
    }

    public static get clientOrgRegisterationURL(): string {
        return `${environment.domainName}${environment.clientOrgRegisterationURL}`;
    }

    public static get clientRegisterNewOrgURL(): string {
        return `${environment.domainName}${environment.clientRegisterNewOrgURL}`;
    }


    public static get clientOrgImageUploadURL(): string {
        return `${environment.domainName}${environment.clientOrgImageUploadURL}`;
    }

    public static get clientOrgUpdateAmenityListURL(): string {
        return `${environment.domainName}${environment.clientOrgUpdateAmenityListURL}`;
    }

    public static get clientOrgSupportFileUploadURL(): string {
        return `${environment.domainName}${environment.clientOrgSupportFileUploadURL}`;
    }

    public static get clientCurrentProjectsURL(): string {
        return `${environment.domainName}${environment.clientCurrentProjectsURL}`;
    }

    public static get clientProjectsHistoryURL(): string {
        return `${environment.domainName}${environment.clientProjectsHistoryURL}`;
    }

    public static get clientCreateProjectURL(): string {
        return `${environment.domainName}${environment.clientCreateProjectURL}`;
    }

    public static get clientUpdateProjectURL(): string {
        return `${environment.domainName}${environment.clientUpdateProjectURL}`;
    }


    public static get clientPublishProjectURL(): string {
        return `${environment.domainName}${environment.clientPublishProjectURL}`;
    }

    public static get clientCancelProjectURL(): string {
        return `${environment.domainName}${environment.clientCancelProjectURL}`;
    }


    public static get clientNewUserInvitationURL(): string {
        return `${environment.domainName}${environment.clientNewUserInvitationURL}`;
    }

    public static get clientUserDetailsUpdateURL(): string {
        return `${environment.domainName}${environment.clientUserUpdateURL}`;
    }

    public static get clientUserDeleteURL(): string {
        return `${environment.domainName}${environment.clientUserDeleteURL}`;
    }


    public static get clientInvitationAcceptanceURL(): string {
        return `${environment.domainName}${environment.clientInvitationAcceptanceURL}`;
    }

    public static get clientUserOrgListURL(): string {
        return `${environment.domainName}${environment.clientUserOrgListURL}`;
    }

    public static get clientSetDefaultOrgURL(): string {
        return `${environment.domainName}${environment.clientSetDefaultOrgURL}`;
    }

    public static get getVendorOrgDetailURL(): string {
        return `${environment.domainName}${environment.getVendorOrgDetailsURL}`;
    }

    public static get clientUpdateUserDetailsURL(): string {
        return `${environment.domainName}${environment.clientUpdateUserDetailsURL}`;
    }

    public static get clientOrgAccountDetailsURL(): string {
        return `${environment.domainName}${environment.clientOrgAccountDetailsURL}`;
    }

    public static get clientOrgProfileDetailsURL(): string {
        return `${environment.domainName}${environment.clientOrgProfileDetailsURL}`;
    }


    public static get clientGetUserListForOrgURL(): string {
        return `${environment.domainName}${environment.clientGetUserListForOrgURL}`;
    }


    public static get clientGetProjectsListForOrgIdURL(): string {
        return `${environment.domainName}${environment.clientGetProjectsListForOrgIdURL}`;
    }

    public static get clientUpdateOrgDetailsURL(): string {
        return `${environment.domainName}${environment.clientUpdateOrgDetailsURL}`;
    }

    public static get clientUpdateOrgAminityDetailsURL(): string {
        return `${environment.domainName}${environment.clientUpdateOrgAminityDetailsURL}`;
    }

    public static get clientGetAllOrgListURL(): string {
        return `${environment.domainName}${environment.clientGetAllOrgListURL}`;
    }

    public static get clientGetMyReviewsURL(): string {
        return `${environment.domainName}${environment.clientGetMyReviewsURL}`;
    }

    public static get clientSubmitVendorRatingURL(): string {
        return `${environment.domainName}${environment.clientSubmitVendorRatingURL}`;
    }


    public static get clientAnswerToProjectQuestionURL(): string {
        return `${environment.domainName}${environment.clientAnswerToProjectQuestionURL}`;
    }


    public static get clientGetAnnualContractListURL(): string {
        return `${environment.domainName}${environment.clientGetAnnualContractListURL}`;
    }

    public static get clientAddAnnualContractURL(): string {
        return `${environment.domainName}${environment.clientAddAnnualContractURL}`;
    }

    public static get clientEditAnnualContractURL(): string {
        return `${environment.domainName}${environment.clientEditAnnualContractURL}`;
    }

    public static get clientDeleteAnnualContractURL(): string {
        return `${environment.domainName}${environment.clientDeleteAnnualContractURL}`;
    }

    public static get clientCreateNewTaskURL(): string {
        return `${environment.domainName}${environment.clientCreateNewTaskURL}`;
    }

    public static get clientPostCommentOnTaskURL(): string {
        return `${environment.domainName}${environment.clientPostCommentOnTaskURL}`;
    }

    public static get clientUpdateTaskURL(): string {
        return `${environment.domainName}${environment.clientUpdateTaskURL}`;
    }

    public static get clientGetAllTasksURL(): string {
        return `${environment.domainName}${environment.clientGetAllTasksURL}`;
    }

    public static get clientDeleteTaskURL(): string {
        return `${environment.domainName}${environment.clientDeleteTaskURL}`;
    }


    public static get clientCreateBuildingRepoURL(): string {
        return `${environment.domainName}${environment.clientCreateBuildingRepoURL}`;
    }

    public static get clientUpdateBuildingRepoURL(): string {
        return `${environment.domainName}${environment.clientUpdateBuildingRepoURL}`;
    }

    public static get clientDeleteBuildingRepoURL(): string {
        return `${environment.domainName}${environment.clientDeleteBuildingRepoURL}`;
    }

    public static get clientGetBuildingRepoListURL(): string {
        return `${environment.domainName}${environment.clientGetBuildingRepoListURL}`;
    }

    public static get updatePreferredVendorStatusURL(): string {
        return `${environment.domainName}${environment.updatePreferredVendorStatus}`;
    }

    public static get cloneProjectURL(): string {
        return `${environment.domainName}${environment.cloneProjectURL}`;
    }

    public static get clientPostBidViewLogURL(): string {
        return `${environment.domainName}${environment.clientPostBidViewLogURL}`;
    }


    //VENDOR

    public static get vendorUserRegisterationURL(): string {
        return `${environment.domainName}${environment.vendorUserRegisterationURL}`;
    }

    public static get vendorOrgRegisterationURL(): string {
        return `${environment.domainName}${environment.vendorOrgRegisterationURL}`;
    }

    public static get vendorOrgImageUploadURL(): string {
        return `${environment.domainName}${environment.vendorOrgImageUploadURL}`;
    }

    public static get vendorOrgSupportFileUploadURL(): string {
        return `${environment.domainName}${environment.vendorOrgSupportFileUploadURL}`;
    }

    public static get vendorGetUnclaimedOrgProfilesURL(): string {
        return `${environment.domainName}${environment.vendorGetUnclaimedOrgProfilesURL}`;
    }


    public static get vendorNewUserCreationURL(): string {
        return `${environment.domainName}${environment.vendorNewUserCreationURL}`;
    }

    public static get vendorInvitationAcceptanceURL(): string {
        return `${environment.domainName}${environment.vendorInvitationAcceptanceURL}`;
    }

    public static get vendorUserDetailsUpdateURL(): string {
        return `${environment.domainName}${environment.vendorUserUpdateURL}`;
    }

    public static get vendorUserDeleteURL(): string {
        return `${environment.domainName}${environment.vendorUserDeleteURL}`;
    }


    public static get vendorUserDetailsByIdURL(): string {
        return `${environment.domainName}${environment.vendorUserDetailsByIdURL}`;
    }

    public static get vendorUpdateUserDetailsURL(): string {
        return `${environment.domainName}${environment.vendorUpdateUserDetailsURL}`;
    }

    public static get vendorOrgAccountDetailsURL(): string {
        return `${environment.domainName}${environment.vendorOrgAccountDetailsURL}`;
    }

    public static get vendorOrgProfileDetailsURL(): string {
        return `${environment.domainName}${environment.vendorOrgProfileDetailsURL}`;
    }

    public static get vendorUnclaimedOrgProfileURL(): string {
        return `${environment.domainName}${environment.vendorUnclaimedOrgProfileURL}`;
    }

    public static get vendorUpdateOrgDetailsURL(): string {
        return `${environment.domainName}${environment.vendorUpdateOrgDetailsURL}`;
    }


    public static get vendorGetAllOrgListURLForClient(): string {
        return `${environment.domainName}${environment.vendorGetAllOrgListURLForClient}`;
    }

    public static get vendorGetAllOrgListURLForVendor(): string {
        return `${environment.domainName}${environment.vendorGetAllOrgListURLForVendor}`;
    }

    public static get vendorCreateProjectBidURL(): string {
        return `${environment.domainName}${environment.vendorCreateProjectBidURL}`;
    }

    public static get vendorUpdateProjectBidURL(): string {
        return `${environment.domainName}${environment.vendorUpdateProjectBidURL}`;
    }

    public static get vendorPullProjectBidURL(): string {
        return `${environment.domainName}${environment.vendorPullProjectBidURL}`;
    }


    public static get vendorSubmitProjectBidURL(): string {
        return `${environment.domainName}${environment.vendorSubmitProjectBidURL}`;
    }

    public static get awardProjectBidURL(): string {
        return `${environment.domainName}${environment.awardProjectBid}`;
    }

    public static get uploadFilesForProjectAwardURL(): string {
        return `${environment.domainName}${environment.uploadFilesForProjectAward}`;
    }

    public static get deleteProjectAwardFiles(): string {
        return `${environment.domainName}${environment.deleteProjectAwardFiles}`;
    }

    public static get vendorProjectFavoriteURL(): string {
        return `${environment.domainName}${environment.vendorUpdatedProjectFavouriteURL}`;
    }

    public static get vendorGetFavoriteProjectListURL(): string {
        return `${environment.domainName}${environment.vendorFavoriteProjectListURL}`;
    }

    public static get vendorGetCurrentProjectListURL(): string {
        return `${environment.domainName}${environment.vendorCurrentProjectListURL}`;
    }

    public static get vendorGetHistoryProjectListURL(): string {
        return `${environment.domainName}${environment.vendorHistoryProjectListURL}`;
    }

    public static get vendorProjectDetailsURL(): string {
        return `${environment.domainName}${environment.vendorGetProjectDetailsURL}`;
    }

    public static get vendorMarketplaceProjectListURL(): string {
        return `${environment.domainName}${environment.vendorGetMarketProjectsURL}`;
    }

    public static get vendorPostProjectQuestionURL(): string {
        return `${environment.domainName}${environment.vendorPostProjectQuestionURL}`;
    }

    public static get vendorProfileUpdateCompanyInfoURL(): string {
        return `${environment.domainName}${environment.vendorProfileUpdateCompanyInfoURL}`;
    }

    public static get vendorProfileUpdateSaleInfoURL(): string {
        return `${environment.domainName}${environment.vendorProfileUpdateSaleInfoURL}`;
    }

    public static get vendorProfileUpdateContactInfoURL(): string {
        return `${environment.domainName}${environment.vendorProfileUpdateContactInfoURL}`;
    }

    public static get vendorProfileUpdateProductsInfoURL(): string {
        return `${environment.domainName}${environment.vendorProfileUpdateProductsInfoURL}`;
    }

    public static get vendorCreateNewPortfolioURL(): string {
        return `${environment.domainName}${environment.vendorCreateNewPortfolioURL}`;
    }

    public static get vendorDeletePortfolioURL(): string {
        return `${environment.domainName}${environment.vendorDeletePortfolioURL}`;
    }

    public static get vendorUpdatePortfolioURL(): string {
        return `${environment.domainName}${environment.vendorUpdatePortfolioURL}`;
    }

    public static get vendorPortfolioUploadAttachmentURL(): string {
        return `${environment.domainName}${environment.vendorPortfolioUploadAttachmentURL}`;
    }

    public static get updateVendorInsuranceAndOtherDetailsURL(): string {
        return `${environment.domainName}${environment.updateVendorInsuranceAndOtherDetailsURL}`;
    }


    //NOTIFICATIONS

    public static get clientNotificationsURL(): string {
        return `${environment.domainName}${environment.clientNotificationsURL}`;
    }

    public static get vendorNotificationsURL(): string {
        return `${environment.domainName}${environment.vendorNotificationsURL}`;
    }

    public static get clientResetNotificationCountURL(): string {
        return `${environment.domainName}${environment.clientResetNotificationCountURL}`;
    }

    public static get vendorResetNotificationCountURL(): string {
        return `${environment.domainName}${environment.vendorResetNotificationCountURL}`;
    }


    //Global Search

    public static get vendorGlobalSearchURL(): string {
        return `${environment.domainName}${environment.vendorGlobalSearchURL}`;
    }

    public static get clientGlobalSearchURL(): string {
        return `${environment.domainName}${environment.clientGlobalSearchURL}`;
    }


    //COMMON

    public static get getProjectDetailsByIdURL(): string {
        return `${environment.domainName}${environment.getProjectDetailsByIdURL}`;
    }

    public static get postQuestionToProjectURL(): string {
        return `${environment.domainName}${environment.postQuestionToProjectURL}`;
    }

    public static get postAnswerToProjectQuestionURL(): string {
        return `${environment.domainName}${environment.postAnswerToProjectQuestionURL}`;
    }

    public static get getProjectTagsURL(): string {
        return `${environment.domainName}${environment.projectTagsURL}`;
    }

    public static get getMarketplaceURL(): string {
        return `${environment.domainName}${environment.marketplaceURL}`;
    }

    public static get getSupportedCityListURL(): string {
        return `${environment.domainName}${environment.supportCitiesURL}`;
    }

    public static get resetExistingPasswordURL(): string {
        return `${environment.domainName}${environment.resetExistingPasswordURL}`;
    }

    //File Upload

    public static get uploadProjectFilesURL(): string {
        return `${environment.domainName}${environment.uploadProjectFilesURL}`;
    }

    public static get supportUserUploadUserRegFilesURL(): string {
        return `${environment.domainName}${environment.supportUserUploadUserRegFilesURL}`;
    }


    public static get deleteProjectFilesURL(): string {
        return `${environment.domainName}${environment.deleteProjectFilesURL}`;
    }

    public static get deletePortfolioFilesURL(): string {
        return `${environment.domainName}${environment.deletePortfolioFilesURL}`;
    }

    public static get deleteClientRegFilesURL(): string {
        return `${environment.domainName}${environment.deleteClientRegFilesURL}`;
    }

    public static get deleteVendorRegFilesURL(): string {
        return `${environment.domainName}${environment.deleteVendorRegFilesURL}`;
    }


    public static get downloadFileURL(): string {
        return `${environment.domainName}${environment.downloadFileURL}`;
    }

    public static get uploadBidFilesURL(): string {
        return `${environment.domainName}${environment.uploadBidFilesURL}`;
    }

    public static get deleteBidFilesURL(): string {
        return `${environment.domainName}${environment.deleteBidFilesURL}`;
    }

    public static get userProfileImageUploadURL(): string {
        return `${environment.domainName}${environment.userProfileImageUploadURL}`;
    }

    //Messages
    public static get internalMsgCreateNewURL(): string {
        return `${environment.domainName}${environment.internalMsgCreateNewURL}`;
    }

    public static get internalMsgListURL(): string {
        return `${environment.domainName}${environment.internalMsgListURL}`;
    }
    public static get internalPostCommentForMsgURL(): string {
        return `${environment.domainName}${environment.internalPostCommentForMsgURL}`;
    }

    public static get externalMsgCreateNewURL(): string {
        return `${environment.domainName}${environment.externalMsgCreateNewURL}`;
    }

    public static get externalMsgListURL(): string {
        return `${environment.domainName}${environment.externalMsgListURL}`;
    }
    public static get externalPostCommentForMsgURL(): string {
        return `${environment.domainName}${environment.externalPostCommentForMsgURL}`;
    }

    public static get internalMsgPostAttachmentURL(): string {
        return `${environment.domainName}${environment.internalMsgPostAttachmentURL}`;
    }

    public static get internalMsgCommentPostAttachmentURL(): string {
        return `${environment.domainName}${environment.internalMsgCommentPostAttachmentURL}`;
    }

    public static get externalMsgPostAttachmentURL(): string {
        return `${environment.domainName}${environment.externalMsgPostAttachmentURL}`;
    }

    public static get externalMsgCommentPostAttachmentURL(): string {
        return `${environment.domainName}${environment.externalMsgCommentPostAttachmentURL}`;
    }

    public static get getInternalMessageDetailsByIDURL(): string {
        return `${environment.domainName}${environment.getInternalMessageDetailsByIDURL}`;
    }

    public static get getExternalMessageDetailsByIDURL(): string {
        return `${environment.domainName}${environment.getExternalMessageDetailsByIDURL}`;
    }

    // Support User

    public static get getUnapprovedOrgListURL(): string {
        return `${environment.domainName}${environment.getUnapprovedOrgListURL}`;
    }

    public static get updateAppUserDetailsURL(): string {
        return `${environment.domainName}${environment.updateAppUserDetailsURL}`;
    }

    public static get updateUserAccountStatusURL(): string {
        return `${environment.domainName}${environment.updateUserAccountStatusURL}`;
    }

    public static get updateUserOrgStatusURL(): string {
        return `${environment.domainName}${environment.updateUserOrgStatusURL}`;
    }

    public static get approveOrgURL(): string {
        return `${environment.domainName}${environment.approveOrgURL}`;
    }

    public static get hideUserReviewURL(): string {
        return `${environment.domainName}${environment.hideUserReviewURL}`;
    }

    public static get clientUpdateReviewURL(): string {
        return `${environment.domainName}${environment.clientUpdateReviewURL}`;
    }

    public static get clientDeleteReviewURL(): string {
        return `${environment.domainName}${environment.clientDeleteReviewURL}`;
    }

    public static get vendorReplyReviewURL(): string {
        return `${environment.domainName}${environment.vendorReplyReviewURL}`;
    }

    public static get searchUserURL(): string {
        return `${environment.domainName}${environment.searchUserURL}`;
    }

    public static get updateClientOrgDetailsURL(): string {
        return `${environment.domainName}${environment.updateClientOrgDetailsURL}`;
    }

    public static get hideProjectURL(): string {
        return `${environment.domainName}${environment.hideProjectURL}`;
    }

    public static get hideExternalMessage(): string {
        return `${environment.domainName}${environment.hideExternalMessage}`;
    }

    public static get createNewUserURL(): string {
        return `${environment.domainName}${environment.createNewUserURL}`;
    }

    public static get getAppClientOrgListURL(): string {
        return `${environment.domainName}${environment.getAppClientOrgListURL}`;
    }

    public static get getAppVendorOrgListURL(): string {
        return `${environment.domainName}${environment.getAppVendorOrgListURL}`;
    }

    public static get getVendorAllReviewsURL(): string {
        return `${environment.domainName}${environment.getVendorAllReviewsURL}`;
    }

    public static get getClientAllExtrnlMessagesURL(): string {
        return `${environment.domainName}${environment.getClientAllExtrnlMessagesURL}`;
    }

    public static get vendorInsuarnceServiceupdate(): string {
        return `${environment.domainName}${environment.vendorInsuarnceServiceupdate}`;
    }

    public static get searchOrgURL(): string {
        return `${environment.domainName}${environment.searchOrgURL}`;
    }

    public static get searchNewOrgRegistrationURL(): string {
        return `${environment.domainName}${environment.searchNewOrgRegistrationURL}`;
    }

    public static get getAllProjectsURL(): string {
        return `${environment.domainName}${environment.getAllProjectsURL}`;
    }

}







