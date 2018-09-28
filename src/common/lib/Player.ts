export interface PlayerData {
    uniqId?: string;
    [others: string]: any;
}

export interface PlayerDataDictionnary {
    [uniqId: string]: PlayerData;
}