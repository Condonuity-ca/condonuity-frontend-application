// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
    apiUrl: '',
    // domainName: 'http://condonuityappdev.eastus2.cloudapp.azure.com:8762/',
    // domainName: 'http://condonuityuat.canadacentral.cloudapp.azure.com:8762/',
    domainName: 'http://condonuitytest.eastus.cloudapp.azure.com:8762/', //UAT1

    // domainName: 'condonuity-app-production.eastus.cloudapp.azure.com:8762',

    landingSiteUrl: 'https://condonuitystaticdev.z13.web.core.windows.net',


    //Security
    verifyEmailURL: 'security/api/user/verify/',
    loginURL: 'security/api/user/login',
    authTokenURL: 'auth',
    resetPasswordURL: 'security/api/user/resetPassword',
    //** */
    resetExistingPasswordURL: 'users/api/user/changePassword',
    forgotPasswordURL: 'security/api/user/forgotpwd/',
    setPasswordWithDynamicLinkURL: 'security/api/secure/decrypt',

    resendClientRegisterMailURL: 'security/api/client/user/registration/email',
    resendVendorRegisterMailURL: 'security/api/vendor/user/registration/email',

    validteRegistrationLinkURL: 'security/api/user/org/register/hash',
    validteUserInviteLinkURL: 'security/api/user/invite/hash',


    //Client
    clientUserRegisterationURL: 'security/api/client/user/register',
    clientOrgRegisterationURL: 'security/api/client/org/register/',
    clientRegisterNewOrgURL: 'security/api/client/org/multiple/register/',
    clientNewUserInvitationURL: 'security/api/client/user/create',
    clientUserUpdateURL: 'users/api/client/user/role',
    clientUserDeleteURL: 'users/api/client/user/inactive',
    clientInvitationAcceptanceURL: 'security/api/client/user/invite/accept',
    clientOrgImageUploadURL: 'files/api/upload/client/organisation/profile/',
    clientOrgSupportFileUploadURL: 'files/api/uploads/client/registration/',
    clientOrgUpdateAmenityListURL: 'users/api/client/org/amenity/',

    clientCurrentProjectsURL: 'projects/api/projects/current/client/organisation/',
    clientProjectsHistoryURL: 'projects/api/projects/history/client/organisation/',
    clientCreateProjectURL: 'projects/api/client/project/create',
    clientUpdateProjectURL: 'projects/api/client/project',
    clientPublishProjectURL: 'projects/api/client/project/publish/',
    clientCancelProjectURL: 'projects/api/client/project/cancel/',
    clientPostBidViewLogURL: 'projects/api/project/bids/client/views',


    updatePreferredVendorStatus: 'users/api/client/org/preference/add',

    // clientUpdateProjectURL: 'users/api/client/project',
    clientGetProjectsListForOrgIdURL: 'projects/api/projects/all/client/organisation/',

    clientUserOrgListURL: 'users/api/client/user/',
    clientUpdateUserDetailsURL: 'users/api/client/user',
    clientOrgAccountDetailsURL: 'users/api/client/org/account/',
    clientOrgProfileDetailsURL: 'users/api/client/org/',
    clientUpdateOrgDetailsURL: 'users/api/client/org',
    clientUpdateOrgAminityDetailsURL: 'users/api/client/org/amenity',
    clientGetAllOrgListURL: 'users/api/client/orgs/',
    clientSetDefaultOrgURL: 'users/api/client/',

    clientGetUserListForOrgURL: 'users/api/client/org/users/',

    clientGetMyReviewsURL: 'users/api/client/reviews/',
    clientSubmitVendorRatingURL: 'users/api/client/rate/vendor',
    clientUpdateReviewURL: 'clients/api/client/review/update',
    clientDeleteReviewURL: 'clients/api/client/review/inactive/',
    vendorReplyReviewURL: 'projects/api/projects/review/reply',


    clientAnswerToProjectQuestionURL: 'projects/api/projects/question/answer',

    clientGetAnnualContractListURL: 'users/api/client/org/contracts/',
    clientAddAnnualContractURL: 'users/api/client/org/contract/add',
    clientEditAnnualContractURL: 'users/api/client/org/contract',
    clientDeleteAnnualContractURL: 'users/api/client/org/contract/inactive/',

    clientCreateNewTaskURL: 'users/api/client/org/task/add',
    clientPostCommentOnTaskURL: 'users/api/client/org/task/comment/add',
    clientUpdateTaskURL: 'users/api/client/org/task',
    clientGetAllTasksURL: 'users/api/client/org/tasks/',
    clientDeleteTaskURL: 'users/api/client/org/task/inactive',

    clientCreateBuildingRepoURL: 'users/api/client/org/building/repo/add',
    clientUpdateBuildingRepoURL: 'users/api/client/org/building/repo',
    clientDeleteBuildingRepoURL: 'users/api/client/org/building/repo/inactive',
    clientGetBuildingRepoListURL: 'users/api/client/org/building/repo/',
    cloneProjectURL: 'projects/api/client/project/clone/',
    clientResetNotificationCountURL: 'clients/api/client/notifications/read/',


    //Project Bid Awarding
    awardProjectBid: 'projects/api/projects/award',
    uploadFilesForProjectAward: 'files/api/uploads/project/awards/',
    deleteProjectAwardFiles: 'files/api/delete/project/award/files',

    //Vendor
    getAllVendorOrgListURL: 'vendor/api/vendors',
    getVendorOrgDetailsURL: 'vendor/',

    vendorUserRegisterationURL: 'security/api/vendor/user/register',
    vendorOrgRegisterationURL: 'security/api/vendor/organisation/register',
    vendorNewUserCreationURL: 'security/api/vendor/user/invite/register',
    vendorInvitationAcceptanceURL: 'security/api/vendor/user/invite/accept',
    vendorUserUpdateURL: 'users/api/vendor/user/role',
    vendorUserDeleteURL: 'users/api/vendor/user/inactive',
    vendorOrgImageUploadURL: 'files/api/upload/vendor/organisation/profile/', //  {organisationId}
    vendorOrgSupportFileUploadURL: 'files/api/uploads/vendor/registration/',
    vendorGetUnclaimedOrgProfilesURL: 'security/api/vendor/available/profiles',

    createVendorInsuranceURL: 'users/api/vendor/org/insurance/create',
    updateVendorInsuarnceURL: 'users/api/vendor/org/insurance',
    updateVendorInsuranceAndOtherDetailsURL: 'users/api/vendor/org/update/company/services',

    vendorUserDetailsByIdURL: 'users/api/vendor/user/',
    vendorUpdateUserDetailsURL: 'users/api/vendor/user',
    vendorOrgAccountDetailsURL: 'users/api/vendor/org/account/',
    vendorOrgProfileDetailsURL: 'users/api/vendor/org/',
    vendorUnclaimedOrgProfileURL: 'users/api/vendor/unclaimed/org/',
    vendorUpdateOrgDetailsURL: 'users/api/vendor/org',
    vendorGetAllOrgListURLForClient: 'users/api/vendor/orgs/',
    vendorGetAllOrgListURLForVendor: 'users/api/vendor/orgs',
    vendorCreateProjectBidURL: 'projects/api/vendor/project/bid/create',
    vendorUpdateProjectBidURL: 'projects/api/vendor/project/bid',
    vendorSubmitProjectBidURL: 'projects/api/vendor/bid/publish/',
    vendorPullProjectBidURL: 'projects/api/vendor/bid/pull/',
    vendorUpdatedProjectFavouriteURL: 'projects/api/project/interest',
    vendorFavoriteProjectListURL: 'projects/api/projects/favorite/vendor/organisation/',
    vendorCurrentProjectListURL: 'projects/api/projects/current/vendor/organisation/',
    vendorHistoryProjectListURL: 'projects/api/projects/history/vendor/organisation/',
    vendorGetProjectDetailsURL: 'projects/api/projects/',
    vendorGetMarketProjectsURL: 'projects/api/projects/marketplace/',
    vendorPostProjectQuestionURL: 'projects/api/projects/question/create',

    vendorCreateNewPortfolioURL: 'users/api/vendor/org/portfolio/create',
    vendorDeletePortfolioURL: 'users/api/vendor/org/portfolio/inactive/',
    vendorUpdatePortfolioURL: 'users/api/vendor/org/portfolio',
    vendorPortfolioUploadAttachmentURL: 'files/api/uploads/vendor/portfolio/',


    vendorProfileUpdateCompanyInfoURL: 'users/api/vendor/org/update/company',
    vendorProfileUpdateSaleInfoURL: 'users/api/vendor/org/update/company/sale',
    vendorProfileUpdateContactInfoURL: 'users/api/vendor/org/update/company/contact',
    vendorProfileUpdateProductsInfoURL: 'users/api/vendor/org/update/company/services',
    vendorInsuarnceServiceupdate: '',
    vendorResetNotificationCountURL: 'users/api/vendor/notifications/read/',

    //Internal Messages
    internalMsgCreateNewURL: 'messages/api/internal/message/create',
    internalMsgListURL: 'messages/api/internal/messages/',
    internalPostCommentForMsgURL: 'messages/api/internal/message/comment/create',
    internalMsgPostAttachmentURL: 'files/api/uploads/internal/thread/',
    internalMsgCommentPostAttachmentURL: 'files/api/uploads/internal/thread/comment/',
    getInternalMessageDetailsByIDURL: 'messages/api/internal/message/',


    //External Messages
    externalMsgCreateNewURL: 'messages/api/external/message/create',
    externalMsgListURL: 'messages/api/external/messages/',
    externalPostCommentForMsgURL: 'messages/api/external/message/comment/create',
    externalMsgPostAttachmentURL: 'files/api/uploads/external/thread/',
    externalMsgCommentPostAttachmentURL: 'files/api/uploads/external/thread/comment/',
    getExternalMessageDetailsByIDURL: 'messages/api/external/message/',


    //Notifications
    clientNotificationsURL: 'clients/api/client/notifications/',
    vendorNotificationsURL: 'users/api/vendor/notifications/',



    //Common
    getProjectDetailsByIdURL: 'projects/api/projects/',
    postQuestionToProjectURL: 'projects/api/projects/question/create',
    postAnswerToProjectQuestionURL: 'projects/api/projects/question/answer',
    projectTagsURL: 'projects/api/projects/tags',
    supportCitiesURL: 'security/api/service/cities',
    marketplaceURL: 'projects/api/projects',
    downloadFileURL: 'files/api/download/container/',
    userProfileImageUploadURL: 'files/api/upload/user/profile/',

    //Global search
    vendorGlobalSearchURL: 'users/api/vendor/search',
    clientGlobalSearchURL: 'users/api/client/search',

    //File Upload
    uploadProjectFilesURL: 'files/api/uploads/project/',
    supportUserUploadUserRegFilesURL: 'files/api/uploads/organisation/registration/files/',

    deleteProjectFilesURL: 'files/api/delete/project/files',
    deletePortfolioFilesURL: 'files/api/delete/portfolio/files',
    deleteClientRegFilesURL: 'files/api/delete/client/registration/files',
    deleteVendorRegFilesURL: 'files/api/delete/vendor/registration/files',

    uploadUserProfileImageURL: '/files/api/upload/user/profile/',

    getAppDataURL: 'security/api/app/data',
    getAmenityListURL: 'security/api/client/amenities',

    uploadBidFilesURL: 'files/api/uploads/bid/',
    deleteBidFilesURL: 'files/api/delete/bid/files',



    //Support User
    getUnapprovedOrgListURL: 'users/api/support/unapproved/organisations',
    updateAppUserDetailsURL: 'users/api/support/user/profile/update',
    updateUserAccountStatusURL: 'users/api/support/user/status',
    updateUserOrgStatusURL: 'users/api/support/organisation/status',
    approveOrgURL: 'users/api/support/organisation/approval/status',
    hideUserReviewURL: 'users/api/support/review/status',
    updateClientOrgDetailsURL: 'users/api/support/client/corporation/update',
    hideProjectURL: 'users/api/support/client/project/status',
    hideExternalMessage: 'users/api/support/external/message/status',
    createNewUserURL: 'users/api/support/user/profile/add',
    getAppClientOrgListURL: 'users/api/client/support/orgs',
    getAppVendorOrgListURL: 'users/api/vendor/support/orgs',
    searchUserURL: 'users/api/support/users/search',
    searchOrgURL: 'users/api/support/orgs/search',
    searchNewOrgRegistrationURL: 'users/api/support/unapprove/orgs/search',
    getAllProjectsURL: 'projects/api/support/projects',

    getVendorAllReviewsURL: 'users/api/support/reviews/vendor/',
    getClientAllExtrnlMessagesURL: 'messages/api/support/messages/external/',

    production: false,
    hmr: false
};

