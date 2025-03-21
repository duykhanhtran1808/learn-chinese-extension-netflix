import { SubtitleEntry } from "./types";

export const parseWebVTT = (content: string): SubtitleEntry[] => {
    const lines = content.split('\n');
    const entries: SubtitleEntry[] = [];
    let currentEntry: Partial<SubtitleEntry> = {};  // To store the current subtitle's timing and text
    let currentText = '';  // Accumulated subtitle text for multi-line entries

    const timeToMs = (timeStr: string): number => {
        const [hours, minutes, seconds] = timeStr.split(':');
        const [secs, ms] = seconds.split('.');
        return (parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(secs)) * 1000 + parseInt(ms);
    };

    for (const line of lines) {
        // Check if the line contains a timestamp (a new subtitle entry)
        if (line.includes('-->')) {
            // If there's already a subtitle, push the previous one to the entries
            if (currentEntry.start !== undefined && currentEntry.end !== undefined) {
                entries.push({
                    start: currentEntry.start,
                    end: currentEntry.end,
                    text: currentText.trim()  // Store the accumulated text for this subtitle
                });
            }

            // Start a new subtitle entry by parsing the timestamp
            const [start, end] = line.split('-->').map(t => timeToMs(t.trim()));
            currentEntry = { start, end };
            currentText = '';  // Reset the accumulated text for the new subtitle
        } else if (line.includes('<c.simplifiedchinese>') || line.includes('<c.bg_transparent>')) {
            // Extract the subtitle text between the tags, clean it up and accumulate it
            let text = line.replace(/<[^>]+>/g, '').trim();  // Remove all HTML tags
            text = text.replace(/&lrm;/g, '').trim();  // Remove the left-to-right mark (&lrm;)

            if (text) {
                currentText += text + '\n';  // Accumulate the subtitle text (with a space)
            }
        }
    }

    // After the loop, push the last subtitle entry if it's valid
    if (currentEntry.start !== undefined && currentEntry.end !== undefined) {
        entries.push({
            start: currentEntry.start,
            end: currentEntry.end,
            text: currentText.trim()  // Accumulated text for the final subtitle
        });
    }

    return entries;
};
