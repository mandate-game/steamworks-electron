export declare function init(appId?: number | undefined | null): void

export interface PlayerSteamId {
  steamId64: bigint
  steamId32: string
  accountId: number
}

export declare function restartAppIfNecessary(appId: number): boolean

export declare function runCallbacks(): void

export declare namespace achievement {
  export function activate(achievement: string): boolean
  export function clear(achievement: string): boolean
  export function isActivated(achievement: string): boolean
  export function names(): Array<string>
}

export declare namespace apps {
  export function appBuildId(): number
  export function appInstallDir(appId: number): string
  export function appOwner(): PlayerSteamId
  export function availableGameLanguages(): Array<string>
  export function currentBetaName(): string | null
  export function currentGameLanguage(): string
  export function isAppInstalled(appId: number): boolean
  export function isCybercafe(): boolean
  export function isDlcInstalled(appId: number): boolean
  export function isLowViolence(): boolean
  export function isSubscribed(): boolean
  export function isSubscribedApp(appId: number): boolean
  export function isSubscribedFromFreeWeekend(): boolean
  export function isVacBanned(): boolean
}

export declare namespace auth {
  export class Ticket {
    cancel(): void
    getBytes(): Buffer
  }
  export function getAuthTicketForWebApi(identity: string, timeoutSeconds?: number | undefined | null): Promise<auth.Ticket>
  /**
   * @param ip - The string of IPv4 or IPv6 address. Use as NetworkIdentity of the remote system that will authenticate the ticket.
   * @param timeoutSeconds - The number of seconds to wait for the ticket to be validated. Default value is 10 seconds.
   */
  export function getSessionTicketWithIp(ip: string, timeoutSeconds?: number | undefined | null): Promise<auth.Ticket>
  /**
   * @param steamId64 - The user steam id or game server steam id. Use as NetworkIdentity of the remote system that will authenticate the ticket. If it is peer-to-peer then the user steam ID. If it is a game server, then the game server steam ID may be used if it was obtained from a trusted 3rd party
   * @param timeoutSeconds - The number of seconds to wait for the ticket to be validated. Default value is 10 seconds.
   */
  export function getSessionTicketWithSteamId(steamId64: bigint, timeoutSeconds?: number | undefined | null): Promise<auth.Ticket>
}

export declare namespace callback {
  export class Handle {
    disconnect(): void
  }
  export function register<C extends keyof import('./callbacks').CallbackReturns>(steamCallback: C, handler: (value: import('./callbacks').CallbackReturns[C]) => void): callback.Handle
  export const enum SteamCallback {
    PersonaStateChange = 0,
    SteamServersConnected = 1,
    SteamServersDisconnected = 2,
    SteamServerConnectFailure = 3,
    LobbyDataUpdate = 4,
    LobbyChatUpdate = 5,
    P2PSessionRequest = 6,
    P2PSessionConnectFail = 7,
    GameLobbyJoinRequested = 8,
    MicroTxnAuthorizationResponse = 9,
  }
}

export declare namespace cloud {
  export class FileInfo {
    name: string
    get size(): bigint
  }
  export function deleteFile(name: string): boolean
  export function fileExists(name: string): boolean
  export function isEnabledForAccount(): boolean
  export function isEnabledForApp(): boolean
  export function listFiles(): Array<cloud.FileInfo>
  export function readFile(name: string): string
  export function setEnabledForApp(enabled: boolean): void
  export function writeFile(name: string, content: string): boolean
}

export declare namespace input {
  export class Controller {
    activateActionSet(actionSetHandle: bigint): void
    isDigitalActionPressed(actionHandle: bigint): boolean
    getAnalogActionVector(actionHandle: bigint): AnalogActionVector
    getType(): input.InputType
    getHandle(): bigint
  }
  export interface AnalogActionVector {
    x: number
    y: number
  }
  export function getActionSet(actionSetName: string): bigint
  export function getAnalogAction(actionName: string): bigint
  export function getControllers(): Array<input.Controller>
  export function getDigitalAction(actionName: string): bigint
  export function init(): void
  export const enum InputType {
    Unknown = 'Unknown',
    SteamController = 'SteamController',
    XBox360Controller = 'XBox360Controller',
    XBoxOneController = 'XBoxOneController',
    GenericGamepad = 'GenericGamepad',
    PS4Controller = 'PS4Controller',
    AppleMFiController = 'AppleMFiController',
    AndroidController = 'AndroidController',
    SwitchJoyConPair = 'SwitchJoyConPair',
    SwitchJoyConSingle = 'SwitchJoyConSingle',
    SwitchProController = 'SwitchProController',
    MobileTouch = 'MobileTouch',
    PS3Controller = 'PS3Controller',
    PS5Controller = 'PS5Controller',
    SteamDeckController = 'SteamDeckController',
  }
  export function shutdown(): void
}

export declare namespace localplayer {
  /** @returns the 2 digit ISO 3166-1-alpha-2 format country code which client is running in, e.g. "US" or "UK". */
  export function getIpCountry(): string
  export function getLevel(): number
  export function getName(): string
  export function getSteamId(): PlayerSteamId
  export function setRichPresence(key: string, value?: string | undefined | null): void
}

export declare namespace matchmaking {
  export class Lobby {
    get id(): bigint
    join(): Promise<matchmaking.Lobby>
    leave(): void
    openInviteDialog(): void
    getMemberCount(): bigint
    getMemberLimit(): bigint | null
    getMembers(): Array<PlayerSteamId>
    getOwner(): PlayerSteamId
    setJoinable(joinable: boolean): boolean
    getData(key: string): string | null
    setData(key: string, value: string): boolean
    deleteData(key: string): boolean
    /** Get an object containing all the lobby data */
    getFullData(): Record<string, string>
    /**
     * Merge current lobby data with provided data in a single batch
     * @returns true if all data was set successfully
     */
    mergeFullData(data: Record<string, string>): boolean
  }
  export function createLobby(lobbyType: matchmaking.LobbyType, maxMembers: number): Promise<matchmaking.Lobby>
  export function getLobbies(): Promise<Array<matchmaking.Lobby>>
  export function joinLobby(lobbyId: bigint): Promise<matchmaking.Lobby>
  export const enum LobbyType {
    Private = 0,
    FriendsOnly = 1,
    Public = 2,
    Invisible = 3,
  }
}

export declare namespace networking {
  export function acceptP2PSession(steamId64: bigint): void
  export function isP2PPacketAvailable(): number
  export interface P2PPacket {
    data: Buffer
    size: number
    steamId: PlayerSteamId
  }
  export function readP2PPacket(size: number): networking.P2PPacket
  export function sendP2PPacket(steamId64: bigint, sendType: networking.SendType, data: Buffer): boolean
  /** The method used to send a packet */
  export const enum SendType {
    /**
     * Send the packet directly over udp.
     *
     * Can't be larger than 1200 bytes
     */
    Unreliable = 0,
    /**
     * Like `Unreliable` but doesn't buffer packets
     * sent before the connection has started.
     */
    UnreliableNoDelay = 1,
    /**
     * Reliable packet sending.
     *
     * Can't be larger than 1 megabyte.
     */
    Reliable = 2,
    /**
     * Like `Reliable` but applies the nagle
     * algorithm to packets being sent
     */
    ReliableWithBuffering = 3,
  }
}

export declare namespace overlay {
  export function activateDialog(dialog: overlay.Dialog): void
  export function activateDialogToUser(dialog: overlay.Dialog, steamId64: bigint): void
  export function activateInviteDialog(lobbyId: bigint): void
  export function activateToStore(appId: number, flag: overlay.StoreFlag): void
  export function activateToWebPage(url: string): void
  export const enum Dialog {
    Friends = 0,
    Community = 1,
    Players = 2,
    Settings = 3,
    OfficialGameGroup = 4,
    Stats = 5,
    Achievements = 6,
  }
  export const enum StoreFlag {
    None = 0,
    AddToCart = 1,
    AddToCartAndShow = 2,
  }
}

export declare namespace stats {
  export function getInt(name: string): number | null
  export function resetAll(achievementsToo: boolean): boolean
  export function setInt(name: string, value: number): boolean
  export function store(): boolean
}

export declare namespace utils {
  export const enum FloatingGamepadTextInputMode {
    SingleLine = 0,
    MultipleLines = 1,
    Email = 2,
    Numeric = 3,
  }
  export const enum GamepadTextInputLineMode {
    SingleLine = 0,
    MultipleLines = 1,
  }
  export const enum GamepadTextInputMode {
    Normal = 0,
    Password = 1,
  }
  export function getAppId(): number
  export function getServerRealTime(): number
  export function isSteamRunningOnSteamDeck(): boolean
  /** @returns true if the floating keyboard was shown, otherwise, false */
  export function showFloatingGamepadTextInput(keyboardMode: utils.FloatingGamepadTextInputMode, x: number, y: number, width: number, height: number): Promise<boolean>
  /** @returns the entered text, or null if cancelled or could not show the input */
  export function showGamepadTextInput(inputMode: utils.GamepadTextInputMode, inputLineMode: utils.GamepadTextInputLineMode, description: string, maxCharacters: number, existingText?: string | undefined | null): Promise<string | null>
}

export declare namespace workshop {
  export interface AppIDs {
    creator?: number
    consumer?: number
  }
  export function createItem(appId?: number | undefined | null): Promise<workshop.UgcResult>
  export function deleteItem(itemId: bigint): Promise<void>
  /**
   * Download or update a workshop item.
   *
   * @param highPriority - If high priority is true, start the download in high priority mode, pausing any existing in-progress Steam downloads and immediately begin downloading this workshop item.
   * @returns true or false
   *
   * {@link https://partner.steamgames.com/doc/api/ISteamUGC#DownloadItem}
   */
  export function download(itemId: bigint, highPriority: boolean): boolean
  /**
   * Get info about a pending download of a workshop item.
   *
   * @returns an object with the properties {current, total}
   *
   * {@link https://partner.steamgames.com/doc/api/ISteamUGC#GetItemDownloadInfo}
   */
  export function downloadInfo(itemId: bigint): workshop.DownloadInfo | null
  export interface DownloadInfo {
    current: bigint
    total: bigint
  }
  export function getAllItems(page: number, queryType: workshop.UGCQueryType, itemType: workshop.UGCType, creatorAppId: number, consumerAppId: number, queryConfig?: workshop.WorkshopItemQueryConfig | undefined | null): Promise<workshop.WorkshopPaginatedResult>
  export function getItem(item: bigint, queryConfig?: workshop.WorkshopItemQueryConfig | undefined | null): Promise<workshop.WorkshopItem | null>
  export function getItems(items: Array<bigint>, queryConfig?: workshop.WorkshopItemQueryConfig | undefined | null): Promise<workshop.WorkshopItemsResult>
  /**
   * Get all subscribed workshop items.
   * @returns an array of subscribed workshop item ids
   */
  export function getSubscribedItems(): Array<bigint>
  export function getUserItems(page: number, accountId: number, listType: workshop.UserListType, itemType: workshop.UGCType, sortOrder: workshop.UserListOrder, appIds: workshop.AppIDs, queryConfig?: workshop.WorkshopItemQueryConfig | undefined | null): Promise<workshop.WorkshopPaginatedResult>
  /**
   * Gets info about currently installed content on the disc for workshop item.
   *
   * @returns an object with the the properties {folder, size_on_disk, timestamp}
   *
   * {@link https://partner.steamgames.com/doc/api/ISteamUGC#GetItemInstallInfo}
   */
  export function installInfo(itemId: bigint): workshop.InstallInfo | null
  export interface InstallInfo {
    folder: string
    sizeOnDisk: bigint
    timestamp: number
  }
  /**
   * Gets the current state of a workshop item on this client. States can be combined.
   *
   * @returns a number with the current item state, e.g. 9
   * 9 = 1 (The current user is subscribed to this item) + 8 (The item needs an update)
   *
   * {@link https://partner.steamgames.com/doc/api/ISteamUGC#GetItemState}
   * {@link https://partner.steamgames.com/doc/api/ISteamUGC#EItemState}
   */
  export function state(itemId: bigint): number
  /**
   * Subscribe to a workshop item. It will be downloaded and installed as soon as possible.
   *
   * {@link https://partner.steamgames.com/doc/api/ISteamUGC#SubscribeItem}
   */
  export function subscribe(itemId: bigint): Promise<void>
  export const enum UgcItemVisibility {
    Public = 0,
    FriendsOnly = 1,
    Private = 2,
    Unlisted = 3,
  }
  export const enum UGCQueryType {
    RankedByVote = 0,
    RankedByPublicationDate = 1,
    AcceptedForGameRankedByAcceptanceDate = 2,
    RankedByTrend = 3,
    FavoritedByFriendsRankedByPublicationDate = 4,
    CreatedByFriendsRankedByPublicationDate = 5,
    RankedByNumTimesReported = 6,
    CreatedByFollowedUsersRankedByPublicationDate = 7,
    NotYetRated = 8,
    RankedByTotalVotesAsc = 9,
    RankedByVotesUp = 10,
    RankedByTextSearch = 11,
    RankedByTotalUniqueSubscriptions = 12,
    RankedByPlaytimeTrend = 13,
    RankedByTotalPlaytime = 14,
    RankedByAveragePlaytimeTrend = 15,
    RankedByLifetimeAveragePlaytime = 16,
    RankedByPlaytimeSessionsTrend = 17,
    RankedByLifetimePlaytimeSessions = 18,
    RankedByLastUpdatedDate = 19,
  }
  export interface UgcResult {
    itemId: bigint
    needsToAcceptAgreement: boolean
  }
  export const enum UGCType {
    Items = 0,
    ItemsMtx = 1,
    ItemsReadyToUse = 2,
    Collections = 3,
    Artwork = 4,
    Videos = 5,
    Screenshots = 6,
    AllGuides = 7,
    WebGuides = 8,
    IntegratedGuides = 9,
    UsableInGame = 10,
    ControllerBindings = 11,
    GameManagedItems = 12,
    All = 13,
  }
  export interface UgcUpdate {
    title?: string
    description?: string
    changeNote?: string
    previewPath?: string
    contentPath?: string
    tags?: Array<string>
    visibility?: workshop.UgcItemVisibility
  }
  /**
   * Unsubscribe from a workshop item. This will result in the item being removed after the game quits.
   *
   * {@link https://partner.steamgames.com/doc/api/ISteamUGC#UnsubscribeItem}
   */
  export function unsubscribe(itemId: bigint): Promise<void>
  export function updateItem(itemId: bigint, updateDetails: workshop.UgcUpdate, appId?: number | undefined | null): Promise<workshop.UgcResult>
  export function updateItemWithCallback(itemId: bigint, updateDetails: workshop.UgcUpdate, appId: number | undefined | null, successCallback: (data: UgcResult) => void, errorCallback: (err: any) => void, progressCallback?: (data: UpdateProgress) => void, progressCallbackIntervalMs?: number | undefined | null): void
  export interface UpdateProgress {
    status: workshop.UpdateStatus
    progress: bigint
    total: bigint
  }
  export const enum UpdateStatus {
    Invalid = 0,
    PreparingConfig = 1,
    PreparingContent = 2,
    UploadingContent = 3,
    UploadingPreviewFile = 4,
    CommittingChanges = 5,
  }
  export const enum UserListOrder {
    CreationOrderAsc = 0,
    CreationOrderDesc = 1,
    TitleAsc = 2,
    LastUpdatedDesc = 3,
    SubscriptionDateDesc = 4,
    VoteScoreDesc = 5,
    ForModeration = 6,
  }
  export const enum UserListType {
    Published = 0,
    VotedOn = 1,
    VotedUp = 2,
    VotedDown = 3,
    Favorited = 4,
    Subscribed = 5,
    UsedOrPlayed = 6,
    Followed = 7,
  }
  export interface WorkshopItem {
    publishedFileId: bigint
    creatorAppId?: number
    consumerAppId?: number
    title: string
    description: string
    owner: PlayerSteamId
    /** Time created in unix epoch seconds format */
    timeCreated: number
    /** Time updated in unix epoch seconds format */
    timeUpdated: number
    /** Time when the user added the published item to their list (not always applicable), provided in Unix epoch format (time since Jan 1st, 1970). */
    timeAddedToUserList: number
    visibility: workshop.UgcItemVisibility
    banned: boolean
    acceptedForUse: boolean
    tags: Array<string>
    tagsTruncated: boolean
    url: string
    numUpvotes: number
    numDownvotes: number
    numChildren: number
    previewUrl?: string
    statistics: workshop.WorkshopItemStatistic
  }
  export interface WorkshopItemQueryConfig {
    cachedResponseMaxAge?: number
    includeMetadata?: boolean
    includeLongDescription?: boolean
    includeAdditionalPreviews?: boolean
    onlyIds?: boolean
    onlyTotal?: boolean
    language?: string
    matchAnyTag?: boolean
    requiredTags?: Array<string>
    excludedTags?: Array<string>
    searchText?: string
    rankedByTrendDays?: number
  }
  export interface WorkshopItemsResult {
    items: Array<workshop.WorkshopItem | undefined | null>
    wasCached: boolean
  }
  export interface WorkshopItemStatistic {
    numSubscriptions?: bigint
    numFavorites?: bigint
    numFollowers?: bigint
    numUniqueSubscriptions?: bigint
    numUniqueFavorites?: bigint
    numUniqueFollowers?: bigint
    numUniqueWebsiteViews?: bigint
    reportScore?: bigint
    numSecondsPlayed?: bigint
    numPlaytimeSessions?: bigint
    numComments?: bigint
    numSecondsPlayedDuringTimePeriod?: bigint
    numPlaytimeSessionsDuringTimePeriod?: bigint
  }
  export interface WorkshopPaginatedResult {
    items: Array<workshop.WorkshopItem | undefined | null>
    returnedResults: number
    totalResults: number
    wasCached: boolean
  }
}
