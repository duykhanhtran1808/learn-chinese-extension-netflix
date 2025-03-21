export interface SubtitleEntry {
    start: number;  // time in milliseconds
    end: number;    // time in milliseconds
    text: string;
}

export interface SubtitleData {
    url: string;
    entries: SubtitleEntry[];
}