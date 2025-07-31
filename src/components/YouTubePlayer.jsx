"use client";

import React, { useEffect, useRef, useState } from "react";

const YouTubePlayer = ({
  videoUrl = "https://www.youtube.com/watch?v=TZW6D9jhgb4",
  videoId: trackingVideoId,
  userId,
  subjectId,
}) => {
  const playerRef = useRef(null);
  const containerRef = useRef(null);
  const [player, setPlayer] = useState(null);
  const [playerState, setPlayerState] = useState("unstarted");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [watchedRanges, setWatchedRanges] = useState([]);
  const [apiReady, setApiReady] = useState(false);

  // Extract YouTube video ID from URL
  const extractVideoId = (url) => {
    const match = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
    );
    return match ? match[1] : null;
  };

  const youtubeVideoId = extractVideoId(videoUrl);

  // Load YouTube IFrame API
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      setApiReady(true);
      return;
    }

    // Load the YouTube IFrame API script
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    // The API will call this function when the video player is ready
    window.onYouTubeIframeAPIReady = () => {
      console.log("✅ YouTube IFrame API Ready");
      setApiReady(true);
    };

    return () => {
      // Cleanup
      delete window.onYouTubeIframeAPIReady;
    };
  }, []);

  // Initialize player when API is ready
  useEffect(() => {
    if (!apiReady || !youtubeVideoId || !containerRef.current) return;

    const initPlayer = () => {
      const newPlayer = new window.YT.Player(containerRef.current, {
        height: "100%",
        width: "100%",
        videoId: youtubeVideoId,
        playerVars: {
          autoplay: 0,
          controls: 1,
          disablekb: 0,
          enablejsapi: 1,
          fs: 1,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
        },
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
        },
      });

      setPlayer(newPlayer);
      playerRef.current = newPlayer;
    };

    initPlayer();

    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (error) {
          console.log("Error destroying player:", error);
        }
      }
    };
  }, [apiReady, youtubeVideoId]);

  const onPlayerReady = (event) => {
    console.log("🎬 YouTube Player Ready");
    const videoDuration = event.target.getDuration();
    setDuration(videoDuration);
    console.log("📏 Video Duration:", videoDuration, "seconds");

    // Start tracking time updates
    startTimeTracking();
  };

  const onPlayerStateChange = (event) => {
    const states = {
      [-1]: "unstarted",
      [0]: "ended",
      [1]: "playing",
      [2]: "paused",
      [3]: "buffering",
      [5]: "cued",
    };

    const stateName = states[event.data] || "unknown";
    setPlayerState(stateName);
    console.log("🎮 Player State Changed:", stateName);

    switch (event.data) {
      case window.YT.PlayerState.PLAYING:
        console.log("▶️ Video Started/Resumed");
        break;
      case window.YT.PlayerState.PAUSED:
        console.log("⏸️ Video Paused");
        logCurrentProgress();
        break;
      case window.YT.PlayerState.ENDED:
        console.log("🏁 Video Ended");
        logCurrentProgress();
        break;
    }
  };

  const startTimeTracking = () => {
    const trackTime = () => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        try {
          const time = playerRef.current.getCurrentTime();
          setCurrentTime(time);

          // Track watched ranges (simplified version)
          if (playerState === "playing") {
            setWatchedRanges((prev) => {
              const lastRange = prev[prev.length - 1];
              const newTime = Math.floor(time);

              if (!lastRange || newTime > lastRange[1] + 2) {
                // Start new range
                return [...prev, [newTime, newTime + 1]];
              } else {
                // Extend current range
                const updated = [...prev];
                updated[updated.length - 1][1] = newTime + 1;
                return updated;
              }
            });
          }
        } catch (error) {
          console.log("Time tracking error:", error);
        }
      }
    };

    // Update every second
    const interval = setInterval(trackTime, 1000);

    return () => clearInterval(interval);
  };

  const logCurrentProgress = () => {
    const totalWatched = watchedRanges.reduce(
      (total, [start, end]) => total + (end - start),
      0
    );
    const percentWatched = duration > 0 ? (totalWatched / duration) * 100 : 0;

    const payload = {
      userId: userId || "demo-user",
      subjectId: subjectId || "demo-subject",
      eventType: "video_watched",
      data: {
        videoId: trackingVideoId || youtubeVideoId,
        watchPercentage: Math.round(percentWatched),
        watchTime: Math.round(totalWatched),
        date: new Date().toISOString().split("T")[0] + "T00:00:00.000Z",
      },
    };

    console.log("📊 Video Progress Payload:", payload);
    console.log("📈 Watched Ranges:", watchedRanges);
    console.log("⏱️ Total Watched:", Math.round(totalWatched), "seconds");
    console.log("📊 Percent Watched:", Math.round(percentWatched), "%");
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const controlPlayer = (action) => {
    if (!playerRef.current) return;

    switch (action) {
      case "play":
        playerRef.current.playVideo();
        break;
      case "pause":
        playerRef.current.pauseVideo();
        break;
      case "seek":
        const seekTime = currentTime + 10;
        playerRef.current.seekTo(seekTime, true);
        break;
      case "volume":
        const currentVolume = playerRef.current.getVolume();
        playerRef.current.setVolume(currentVolume === 0 ? 50 : 0);
        break;
    }
  };

  if (!youtubeVideoId) {
    return (
      <div className="w-full aspect-video bg-red-100 rounded-xl flex items-center justify-center">
        <p className="text-red-600">❌ Invalid YouTube URL</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto bg-gray-900 rounded-xl overflow-hidden shadow-2xl">
      {/* Video Player */}
      <div className="relative aspect-video bg-black">
        <div ref={containerRef} className="w-full h-full" />

        {!apiReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <div className="text-white text-center">
              <div className="animate-spin w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              <p>Loading YouTube Player...</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls & Info Panel */}
      <div className="bg-gray-800 text-white p-4 space-y-4">
        {/* Custom Controls */}
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => controlPlayer("play")}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
            disabled={!player}
          >
            ▶️ Play
          </button>
          <button
            onClick={() => controlPlayer("pause")}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg transition-colors"
            disabled={!player}
          >
            ⏸️ Pause
          </button>
          <button
            onClick={() => controlPlayer("seek")}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            disabled={!player}
          >
            ⏭️ +10s
          </button>
          <button
            onClick={() => controlPlayer("volume")}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
            disabled={!player}
          >
            🔊 Toggle
          </button>
          <button
            onClick={logCurrentProgress}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors"
            disabled={!player}
          >
            📊 Log Progress
          </button>
        </div>

        {/* Status Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="bg-gray-700 p-3 rounded-lg">
            <div className="text-gray-400">Status</div>
            <div className="font-semibold capitalize">{playerState}</div>
          </div>
          <div className="bg-gray-700 p-3 rounded-lg">
            <div className="text-gray-400">Current Time</div>
            <div className="font-semibold">{formatTime(currentTime)}</div>
          </div>
          <div className="bg-gray-700 p-3 rounded-lg">
            <div className="text-gray-400">Duration</div>
            <div className="font-semibold">{formatTime(duration)}</div>
          </div>
          <div className="bg-gray-700 p-3 rounded-lg">
            <div className="text-gray-400">Progress</div>
            <div className="font-semibold">
              {duration > 0 ? Math.round((currentTime / duration) * 100) : 0}%
            </div>
          </div>
        </div>

        {/* Tracking Info */}
        <div className="bg-gray-700 p-3 rounded-lg">
          <div className="text-gray-400 mb-2">Watched Segments</div>
          <div className="text-xs">
            {watchedRanges.length > 0 ? (
              <div className="space-y-1">
                {watchedRanges.map((range, i) => (
                  <div key={i} className="bg-gray-600 px-2 py-1 rounded">
                    {formatTime(range[0])} - {formatTime(range[1])}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500">No segments tracked yet</div>
            )}
          </div>
        </div>

        {/* Video Info */}
        <div className="text-center text-sm text-gray-400">
          <p>🎬 Video ID: {youtubeVideoId}</p>
          <p>🔗 Using Official YouTube IFrame Player API</p>
          <p>💰 Completely FREE - No API key required</p>
        </div>
      </div>
    </div>
  );
};

export default YouTubePlayer;
