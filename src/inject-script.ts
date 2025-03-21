const originalStringify = window.JSON.stringify;
const originalParse = window.JSON.parse;

window.JSON.stringify = function(value) {
    let orig = originalStringify.apply(this, arguments as any);
    if (value === undefined) return orig;

    try {
        let data = JSON.parse(orig);
        if (data && data.params && data.params.profiles) {
            data.params.profiles.unshift("webvtt-lssdh-ios8");
            return originalStringify(data);
        }
    } catch (e) {
        console.error("Error in stringify:", e);
    }
    return originalStringify.apply(this, arguments as any);
};

window.JSON.parse = function() {
    const value = originalParse.apply(this, arguments as any);
    try {
        if (value?.result?.movieId && value?.result?.timedtexttracks) {
            for (const track of value.result.timedtexttracks) {
                if (!track.ttDownloadables || track.isForcedNarrative || track.isNoneTrack) {
                    continue;
                }

                const webvttDL = track.ttDownloadables["webvtt-lssdh-ios8"];
                if (!webvttDL || !webvttDL.urls) continue;

                const foundURL = Object.values(webvttDL.urls)[0] as { url: string };
                if (foundURL && track.language == "zh-Hans") {
                    // Send message to our components
                    window.postMessage({
                        type: 'NETFLIX_SUBTITLE_URL',
                        payload: {
                            url: foundURL.url,
                        }
                    }, '*');
                }
            }
        }
    } catch (e) {
        console.error("Error in parse:", e);
    }
    return value;
};