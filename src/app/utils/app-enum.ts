
export enum APIResponse {
    Success = 0,
    Failed = 1
}

export enum LoginResponse {
    Success = 0,
    Failed = 1,
    ServerError = 2,
    BadRequest = 3,
    UserAccountNotFound = 4,
    InvalidCredentials = 5,
    UserAccountInactive = 7,
    UserRegistrationInComplete = 8,
    NotInAnyOrganization = 9,
    UserAccountUnderReview = 10
}

export enum UserType {
    Client = 1,
    Vendor = 2,
    SupportUser = 3
}

export enum UserRole {
    Admin = 1,
    NormalUser = 2,
    SupportUser = 3
}

export enum InsuranceConfirmation {
    Yes = 1,
    No = 2
}

export enum ProjectStatus {
    Unpublished = 1,
    Published = 2,
    Completed = 3,
    Cancelled = 4
}

export enum BidStatus {
    NotSubmitted = 1,
    Submitted = 2,
    Awarded = 3,
    Pulled = 4
}

export enum ContractType {
    FixedCost = 2,
    TimeAndMaterial = 3,
    AnnualContract = 1
}

export enum AlertType {
    Success = 1,
    Error = 2,
    Warning = 3
}

export enum AmenityType {
    IndoorPool = 1,
    OutdoorPool = 2,
    UndergroundParking = 3,
    GroundlevelParking = 4
}

export enum ClientUserRole {
    Manager = 1,
    AssistantManager = 2,
    BoardMember = 3
}

export enum VendorUserRole {
    Manager = 1,
    User = 2
}

export enum UserEnrollmentStatus {
    InviteSentSuccessfully = 0,
    RequestFailed = 1,
    ServerError = 2,
    BadRequest = 3,
    ResourceNotfount = 4,
    AlreadyExist = 6,
    ReachedMaxiumCount = 7
}

export enum UserProfileViewMode {
    NewRegistration = 0,
    AccountStatusChange = 1,
    Others = 2
}

export enum AccountStatus {
    Active = 0,
    InActive = 1
}

export enum MaxFileSize {
    TWOMB = 0,
    FIVEMB = 1
}

export enum AppDateFormat {
    DisplayFormat = 'MM/DD/YYYY',
    ServiceFormat = 'YYYY-MM-DD',
    DisplayFormatWithTime = 'MM/DD/YYYY hh:mm a'
}

export enum SearchBarPageIndex {
    CURRENT_PROJECTS = 1,
    HISTORY_PROJECTS = 2,
    FAVOURITE_PROJECTS = 3,
    MARKETPLACE_PROJECTS = 4,
    BROWSE_VENDORS = 5,
    BROWSE_CONDOS = 6,
    INTERNAL_MESSAGES = 7,
    EXTERNAL_MESSAGES = 8,
    REVIEWS = 9,
    TASKS = 10,
    CONTRACTS = 11,
    BUILDING_REPOSITORY = 12,
    OTHERS = 13
}


export enum MessageType {
    InternalMessage = 1,
    ExternalMessage = 2
}


export enum AmenityID {
    PartyRoom = 1,
    Gym = 2,
    PoolIndoor = 3,
    PoolOutdoor = 4,
    SecurityDesk = 5,
    SecurityCamera = 6,
    BusinessCenter = 7,
    GuestRoom = 8,
    MediaRoom = 9,
    TennisCourt = 10,
    ValleyBallCourt = 11,
    OutdoorBBQ = 12,
    RooftopDeck = 13,
    GardenPatio = 14,
    BasketCourt = 15,
    SquashCourt = 16,
    Jacuzzi = 17,
    Sauna = 18,
    ParkingIndoor = 19,
    ParkingOutdoor = 20,
    Elevator = 21,
    Other = 22
}
