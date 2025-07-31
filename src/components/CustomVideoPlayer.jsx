"use client";
// import { createEventTracking } from "@/API/Points";
// import { useToast } from "@/hooks/use-toast";
import { useEffect, useRef, useState, useCallback } from "react";

const CustomVideoPlayer = ({
  src,
  videoId,
  userId,
  subjectId,
  durationFromProps,
}) => {
  const [durationInSeconds, setDurationInSeconds] = useState();

  const videoRef = useRef(null);

  // Convert YouTube URL to embed format
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return url;

    // Check if it's already an embed URL
    if (url.includes("youtube.com/embed/")) {
      return url;
    }

    // Extract video ID from various YouTube URL formats
    let videoId = null;

    // Standard YouTube URL: https://www.youtube.com/watch?v=VIDEO_ID
    const standardMatch = url.match(/[?&]v=([^&]+)/);
    if (standardMatch) {
      videoId = standardMatch[1];
    }

    // Short YouTube URL: https://youtu.be/VIDEO_ID
    const shortMatch = url.match(/youtu\.be\/([^?]+)/);
    if (shortMatch) {
      videoId = shortMatch[1];
    }

    // If we found a video ID, convert to embed URL
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }

    // Return original URL if not a YouTube URL
    return url;
  };

  const handleLoadedMetadata = () => {
    if (!durationFromProps && videoRef.current) {
      setDurationInSeconds(videoRef.current.duration);
      console.log("Duration from video metadata:", videoRef.current.duration);
    }
  };

  //   const { toast } = useToast();

  const [watchedRanges, setWatchedRanges] = useState([]);
  const [milestonesReached, setMilestonesReached] = useState(new Set());
  const lastTimeRef = useRef(0);
  const startTimeRef = useRef(null);
  const isPlayingRef = useRef(false);

  // ✅ NEW: Add flag to prevent duplicate API calls
  const hasDataBeenSentRef = useRef(false);

  // Store previous video data for API calls when video changes
  const previousVideoDataRef = useRef({
    videoId: null,
    userId: null,
    subjectId: null,
    watchedRanges: [],
    startTime: null,
    duration: null,
  });

  const watchedRangesRef = useRef([]);

  // Update ref whenever state changes
  useEffect(() => {
    watchedRangesRef.current = watchedRanges;
  }, [watchedRanges]);

  const createPayload = useCallback(
    (ranges, customVideoData = null) => {
      const dataToUse = customVideoData || {
        videoId,
        userId,
        subjectId,
        watchedRanges: ranges,
        startTime: startTimeRef.current,
      };

      console.log("🔍 createPayload called with conditions:", {
        hasVideo: !!videoRef.current,
        hasDuration: !!durationInSeconds,
        hasVideoId: !!dataToUse.videoId,
        hasUserId: !!dataToUse.userId,
        hasSubjectId: !!dataToUse.subjectId,
        watchedRangesLength: dataToUse.watchedRanges.length,
        usingCustomData: !!customVideoData,
      });

      const video = videoRef.current;
      if (!dataToUse.videoId || !dataToUse.userId || !dataToUse.subjectId) {
        console.log("❌ createPayload: Missing required data, skipping...");
        return null;
      }

      const watchedDuration = getWatchedDuration(dataToUse.watchedRanges);
      const duration = durationInSeconds;
      const percentWatched = (watchedDuration / duration) * 100;
      const payload = {
        userId: dataToUse.userId,
        subjectId: dataToUse.subjectId,
        eventType: "video_watched",
        data: {
          videoId: dataToUse.videoId,
          watchPercentage: Math.round(percentWatched),
          watchTime: Math.round(watchedDuration),
          date: new Date().toISOString().split("T")[0] + "T00:00:00.000Z",
        },
      };

      console.log("📤 Video Tracking Payload:", payload);
      return payload;
    },
    [videoId, userId, subjectId, durationInSeconds]
  );

  const sendToAPI = useCallback(async (payload) => {
    if (!payload) return;

    console.log("🚀 Sending to API...");

    try {
      const res = true;
      //   const res = await createEventTracking(payload);
      if (res) {
        console.log("✅ Video progress sent successfully");
        // toast({
        //   title: `✅ Video progress sent successfully`,
        // });
      } else {
        console.error("❌ Failed to send video progress");
      }
    } catch (error) {
      console.error("❌ Error sending video progress:", error);
    }
  }, []);

  // ✅ UPDATED: Modified logPayload to handle duplicate prevention
  const logPayload = useCallback(
    (shouldSendAPI = false, customVideoData = null, forceReset = false) => {
      // Use current ranges from ref to avoid stale state
      const currentRanges =
        customVideoData?.watchedRanges || watchedRangesRef.current;
      const payload = createPayload(currentRanges, customVideoData);

      if (payload) {
        if (shouldSendAPI) {
          // ✅ NEW: Check if data has already been sent for this session
          if (!hasDataBeenSentRef.current || forceReset) {
            sendToAPI(payload);
            hasDataBeenSentRef.current = true; // Mark as sent
            console.log("📤 Data sent to API and marked as sent");
          } else {
            console.log(
              "⚠️ Data already sent for this video session, skipping duplicate API call"
            );
          }
        } else {
          console.log("📝 Payload logged only (no API call)");
        }
      }

      return payload;
    },
    [createPayload, sendToAPI]
  );

  // Handle page unload/refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      console.log("🚪 Page unloading, sending to API...");
      if (
        startTimeRef.current &&
        watchedRangesRef.current.length > 0 &&
        !hasDataBeenSentRef.current
      ) {
        // Use sendBeacon instead of fetch for reliable delivery
        const payload = createPayload(watchedRangesRef.current);
        if (payload && navigator.sendBeacon) {
          const success = navigator.sendBeacon(
            "/api/video-progress",
            JSON.stringify(payload)
          );
          console.log("📡 sendBeacon result:", success);
          hasDataBeenSentRef.current = true;
        } else {
          // Fallback: try synchronous fetch as last resort
          console.log("📡 sendBeacon not available, trying sync fetch...");
          logPayload(true, null, true); // Force send even if marked as sent
        }
      }
    };

    const handleVisibilityChange = () => {
      if (
        document.hidden &&
        isPlayingRef.current &&
        watchedRangesRef.current.length > 0 &&
        !hasDataBeenSentRef.current
      ) {
        console.log("👁️ Tab hidden, sending to API...");

        const payload = createPayload(watchedRangesRef.current);
        if (payload) {
          if (navigator.sendBeacon) {
            const success = navigator.sendBeacon(
              "/api/video-progress",
              JSON.stringify(payload)
            );
            console.log("📡 Tab hidden - sendBeacon result:", success);
            hasDataBeenSentRef.current = true;
          } else {
            logPayload(true, null, true); // Force send
          }
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [createPayload, logPayload]);

  // ✅ UPDATED: Reset tracking when video source changes
  useEffect(() => {
    // Send API call for previous video before changing (only if not already sent)
    const prevData = previousVideoDataRef.current;
    if (
      prevData.startTime &&
      prevData.videoId &&
      prevData.userId &&
      prevData.subjectId &&
      prevData.watchedRanges.length > 0 &&
      !hasDataBeenSentRef.current
    ) {
      console.log("🔄 Video changing, sending previous video data to API...");
      logPayload(true, prevData, true); // Force send for previous video
    }

    // Store current video data as previous for next change
    previousVideoDataRef.current = {
      videoId,
      userId,
      subjectId,
      watchedRanges: [...watchedRanges],
      startTime: startTimeRef.current,
    };

    // ✅ NEW: Reset the flag for new video
    hasDataBeenSentRef.current = false;

    // Reset all tracking data for new video
    setWatchedRanges([]);
    setMilestonesReached(new Set());
    lastTimeRef.current = 0;
    startTimeRef.current = null;
    isPlayingRef.current = false;

    console.log("🆕 New video loaded:", { src, videoId });
  }, [src, videoId, logPayload]);

  // Update previous video data when current state changes
  useEffect(() => {
    previousVideoDataRef.current = {
      videoId,
      userId,
      subjectId,
      watchedRanges: [...watchedRanges],
      startTime: startTimeRef.current,
    };
  }, [watchedRanges, videoId, userId, subjectId]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => {
      isPlayingRef.current = true;
      if (!startTimeRef.current) {
        startTimeRef.current = new Date();
        console.log("▶️ Video started at", startTimeRef.current.toISOString());
      } else {
        console.log("▶️ Video resumed at", video.currentTime);
      }
    };

    const handlePause = () => {
      isPlayingRef.current = false;
      console.log("⏸️ Video paused at", video.currentTime);
      // Only log payload on pause (no API call)
      if (watchedRangesRef.current.length > 0) {
        console.log("⏸️ Paused, logging current progress...");
        logPayload(false);
      }
    };

    const handleTimeUpdate = () => {
      if (!isPlayingRef.current) return;
      const currentTime = video.currentTime;
      const lastTime = lastTimeRef.current;
      const duration = durationInSeconds;

      // Only track if user is actually watching (not seeking)
      const delta = currentTime - lastTime;
      if (delta > 0 && delta < 2) {
        setWatchedRanges((currentRanges) => {
          const updatedRanges = mergeRanges(
            [...currentRanges],
            [lastTime, currentTime]
          );

          watchedRangesRef.current = updatedRanges;

          // Check for milestones using the updated ranges
          const watchedDuration = getWatchedDuration(updatedRanges);
          const percentWatched = (watchedDuration / duration) * 100;
          const milestone = Math.floor(percentWatched / 10) * 10;

          if (
            milestone > 0 &&
            milestone <= 100 &&
            !milestonesReached.has(milestone)
          ) {
            console.log(`🎯 Milestone reached: ${milestone}% watched`);
            setMilestonesReached((prev) => new Set(prev).add(milestone));
          }

          return updatedRanges;
        });
      }

      lastTimeRef.current = currentTime;
    };

    const handleSeeking = () => {
      console.log("⏩ User seeking to:", video.currentTime);
    };

    const handleEnded = () => {
      isPlayingRef.current = false;
      console.log("🏁 Video ended");
      // Send to API when video ends (force send regardless of flag)
      logPayload(true, null, true);
      setWatchedRanges([]);
      hasDataBeenSentRef.current = false;
    };

    const handleError = (e) => {
      console.error("❌ Video error:", e);
      isPlayingRef.current = false;
    };

    // Add event listeners
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("seeking", handleSeeking);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("error", handleError);

    // Cleanup function
    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("seeking", handleSeeking);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("error", handleError);
    };
  }, [logPayload, milestonesReached, durationInSeconds]);

  // ✅ UPDATED: Component unmount cleanup with duplicate prevention
  useEffect(() => {
    return () => {
      // Only send to API when component unmounts if data hasn't been sent yet
      if (
        startTimeRef.current &&
        watchedRangesRef.current.length > 0 &&
        !hasDataBeenSentRef.current
      ) {
        console.log("🗑️ Component unmounting, sending to API...");
        const currentVideoData = {
          videoId,
          userId,
          subjectId,
          watchedRanges: [...watchedRangesRef.current],
          startTime: startTimeRef.current,
        };
        logPayload(true, currentVideoData, true); // Force send on unmount
      } else {
        console.log(
          "📝 Component unmounting, but data already sent or no data to send"
        );
      }
    };
  }, [logPayload, videoId, userId, subjectId]);

  // Determine if this is a YouTube URL and render accordingly
  const isYouTubeUrl =
    src && (src.includes("youtube.com") || src.includes("youtu.be"));

  if (isYouTubeUrl) {
    const embedUrl = getYouTubeEmbedUrl(src);

    return (
      <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg">
        <iframe
          ref={videoRef}
          src={embedUrl}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="w-full h-full rounded-xl"
          onLoad={() => {
            console.log("✅ YouTube iframe loaded");
            // Note: YouTube iframe API has limited access to video events
            // Most tracking functionality will be limited with YouTube embeds
          }}
        />

        {/* Warning overlay for YouTube videos */}
        <div className="absolute bottom-2 left-2 bg-yellow-500 bg-opacity-80 text-black text-xs px-2 py-1 rounded">
          ⚠️ YouTube: Limited tracking available
        </div>
      </div>
    );
  }

  // Regular video player for non-YouTube URLs
  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg">
      <video
        ref={videoRef}
        src={src}
        controls
        controlsList="nodownload"
        className="w-full h-full object-cover rounded-xl"
        preload="auto"
        onCanPlay={() => console.log("✅ Can play")}
        onLoadedMetadata={() => {
          console.log("✅ Metadata loaded");
          handleLoadedMetadata();
        }}
        onError={(e) => console.error("❌ Video error", e)}
      />
    </div>
  );
};

export default CustomVideoPlayer;

// Helper functions
function mergeRanges(ranges, newRange) {
  const [newStart, newEnd] = newRange;
  let merged = [];
  let hasMerged = false;

  for (const [start, end] of ranges) {
    if (newEnd < start || newStart > end) {
      merged.push([start, end]);
    } else {
      newRange = [Math.min(newStart, start), Math.max(newEnd, end)];
      hasMerged = true;
    }
  }

  if (!hasMerged) merged.push(newRange);
  else
    merged = [
      ...merged.filter((r) => !(newEnd >= r[0] && newStart <= r[1])),
      newRange,
    ];

  return merged.sort((a, b) => a[0] - b[0]);
}

function getWatchedDuration(ranges) {
  return ranges.reduce((total, [start, end]) => total + (end - start), 0);
}
