import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase";
import { query, where, onSnapshot, collection } from "firebase/firestore";
import { addDoc, doc, getDoc } from "firebase/firestore";
import { IconButton, Typography } from "@material-ui/core";
import { PlayArrow, Pause } from "@material-ui/icons";
import VideoComment from "./VideoComment";
import VolumeOffIcon from "@material-ui/icons/VolumeOff";
import VolumeUpIcon from "@material-ui/icons/VolumeUp";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import "../styles/SharedVideos.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { faExpand } from "@fortawesome/free-solid-svg-icons";
import "../styles.css";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const formatTimecode = (time) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
};

const SharedVideos = () => {
  const { id } = useParams();
  const [videoLinks, setVideoLinks] = useState([]);
  const [comments, setComments] = useState([]);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDurations, setVideoDurations] = useState([]);
  const videoRefs = useRef([]);
  const [videoNames, setVideoNames] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [videoDescriptions, setVideoDescriptions] = useState("");
  const drawerWidth = drawerOpen ? 3 : 0; // set the width of the drawer in grid columns
  const mainWidth = 12 - drawerWidth;
  const [videoRatios, setVideoRatios] = useState([]);

  useEffect(() => {
    videoRefs.current.forEach((videoRef) => {
      videoRef.addEventListener("timeupdate", () => {
        setCurrentTime(videoRef.currentTime);
      });
    });
  }, [videoRefs, setCurrentTime]);

  useEffect(() => {
    const fetchVideoNames = async () => {
      const docRef = doc(db, "videoNames", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setVideoNames(docSnap.data().names);
      }
    };
    fetchVideoNames();
  }, [id]);

  useEffect(() => {
    const fetchVideoDescriptions = async () => {
      const docRef = doc(db, "videoLinks", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setVideoDescriptions(docSnap.data().descriptions);
      }
    };
    fetchVideoDescriptions();
  }, [id]);

  useEffect(() => {
    const fetchVideoLinks = async () => {
      const docRef = doc(db, "videoLinks", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setVideoLinks(docSnap.data().links);
      }
    };

    fetchVideoLinks();
  }, [id]);

  useEffect(() => {
    const fetchData = async () => {
      const docRef = doc(db, "videoLinks", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setProjectName(docSnap.data().projectName);
      } else {
        console.log("No such document!");
      }
      if (docSnap.exists()) {
        setProjectDescription(docSnap.data().projectDescription);
      } else {
        console.log("No such document!");
      }
    };
    fetchData();
  }, [id]);

  const [unmutedVideo, setUnmutedVideo] = useState(0); // Default the first video to be unmuted

  const toggleFullscreen = (index) => {
    setExpandedIndex(index === expandedIndex ? null : index);
  };

  const handlePlayPause = () => {
    setPlaying((prevPlaying) => {
      videoRefs.current.forEach((video) => {
        prevPlaying ? video.pause() : video.play();
      });
      return !prevPlaying;
    });
  };

  const handleScrubberChange = (value) => {
    setCurrentTime(value);
    videoRefs.current.forEach((video) => {
      video.currentTime = value;
    });
  };

  const handleVideoRatio = (index, ratio) => {
    setVideoRatios((oldRatios) => {
      let newRatios = [...oldRatios];
      newRatios[index] = ratio;
      return newRatios;
    });
  };

  const handleVideoDuration = (index, duration) => {
    setVideoDurations((prevDurations) => {
      const newDurations = [...prevDurations];
      newDurations[index] = duration;
      return newDurations;
    });
    if (index !== 0) {
      // Mute all videos except the first one
      videoRefs.current[index].muted = true;
    }
  };

  useEffect(() => {
    const setVideoTime = (event) => {
      setCurrentTime(event.target.currentTime);
    };

    const updateTime = (videoRef) => {
      setCurrentTime(videoRef.currentTime);
    };

    videoRefs.current.forEach((videoRef) => {
      videoRef.addEventListener("play", () => updateTime(videoRef));
      videoRef.addEventListener("pause", () => updateTime(videoRef));
    });

    // Don't forget to clean up your listeners when component unmounts or changes
    return () => {
      videoRefs.current.forEach((videoRef) => {
        if (videoRef) {
          videoRef.removeEventListener("timeupdate", updateTime);
          videoRef.removeEventListener("play", updateTime);
          videoRef.removeEventListener("pause", updateTime);
        }
      });
    };
  }, [videoRefs, setCurrentTime]);

  useEffect(() => {
    const fetchComments = async () => {
      const q = query(collection(db, "comments"), where("videoId", "==", id));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const loadedComments = [];
        querySnapshot.forEach((doc) => {
          loadedComments.push(doc.data());
        });
        setComments(loadedComments);
      });
      return unsubscribe; // returning the unsubscribe function will ensure the listener is detached when the component unmounts
    };
    fetchComments();
  }, [id, db]);

  const handleCommentSubmit = (text) => {
    const newComment = {
      text,
      user: "User 1",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      }),
      videoTimestamp: formatTimecode(currentTime),
      videoId: id
    };

    try {
      const commentsCollection = collection(db, "comments");
      async function addNewComment() {
        await addDoc(commentsCollection, newComment);
      }
      addNewComment();
    } catch (e) {
      console.error("Error adding document: ", e);
    }

    setComments((prevComments) => {
      const updatedComments = [...prevComments, newComment];
      return updatedComments.sort((a, b) =>
        a.videoTimestamp.localeCompare(b.videoTimestamp)
      );
    });
  };

  const handleCommentClick = (videoTimestamp) => {
    const [minutes, seconds] = videoTimestamp.split(":").map(Number);
    videoRefs.current.forEach((videoRef) => {
      if (videoRef) {
        videoRef.currentTime = minutes * 60 + seconds;
      }
    });
  };

  const handleOnDragEnd = (result) => {
    if (!result.destination) return; // dropped outside the list

    const items = Array.from(videoLinks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setVideoLinks(items); // update the state with the new order
  };

  const groupCommentsByTimestamp = (comments) => {
    return comments.reduce((groupedComments, comment) => {
      (groupedComments[comment.videoTimestamp] =
        groupedComments[comment.videoTimestamp] || []).push(comment);
      return groupedComments;
    }, {});
  };

  const groupedComments = groupCommentsByTimestamp(comments);

  const longestDuration = Math.max(...videoDurations);

  const [isDragging, setIsDragging] = useState(false);

  return (
    <DragDropContext onDragEnd={handleOnDragEnd}>
      <div className={`video-section ${drawerOpen ? "shrink" : "expand"}`}>
        {/* Video section */}
        <div
          style={{
            paddingTop: "80px",
            paddingBottom: "40px",
            paddingInline: "200px"
          }}
        >
          <h2
            style={{
              paddingBottom: "10px",
              color: "#F4F5F6",
              fontSize: "24px",
              fontFamily: "NYTKarnak",
              fontWeight: "medium",
              letterSpacing: ".05rem"
            }}
          >
            {projectName}
          </h2>
          <h2
            style={{
              color: "#A0A3A8",
              fontSize: "16px",
              fontFamily: "Arial",
              fontWeight: "light"
            }}
          >
            {projectDescription ||
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."}
          </h2>
        </div>
        <Droppable droppableId="droppable">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="video-container"
              style={{ marginBottom: "auto" }}
            >
              {videoLinks.map((videoLink, index) => (
                <Draggable
                  key={index}
                  draggableId={String(index)}
                  index={index}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      key={index}
                      className={`video-card ${
                        expandedIndex === index ? "expanded" : ""
                      }`}
                      style={{ position: "relative" }}
                    >
                      <div className="video-wrapper">
                        <div
                          {...provided.dragHandleProps}
                          className="drag-handle"
                        >
                          <FontAwesomeIcon icon={faBars} />{" "}
                          {/* using font awesome bars as a drag icon */}
                        </div>
                        <video
                          ref={(el) => (videoRefs.current[index] = el)}
                          title={`video-${index}`}
                          src={videoLink} // directly use the videoLink as the src
                          style={{
                            borderRadius: "7px"
                          }}
                          onLoadedMetadata={(e) =>
                            handleVideoDuration(index, e.target.duration)
                          }
                        />
                        <p
                          style={{
                            position: "absolute",
                            bottom: "-1%",
                            left: "10px",
                            color: "white",
                            letterSpacing: ".05rem",
                            fontSize: "20px",
                            fontWeight: "bold",
                            fontKerning: "none",
                            textShadow: "0px 0px 10px rgba( 0, 0, 0, .4)",
                            padding: "10px 10px"
                          }}
                        >
                          {videoDescriptions[index]}
                        </p>
                        <FontAwesomeIcon
                          icon={faExpand}
                          className="fullscreen-icon"
                          onClick={() => toggleFullscreen(index)}
                        />
                        <IconButton
                          onClick={(e) => {
                            videoRefs.current[index].muted = !videoRefs.current[
                              index
                            ].muted;
                            if (!videoRefs.current[index].muted) {
                              // If the video is unmuted, update the unmutedVideo state
                              setUnmutedVideo(index);
                            }
                            e.stopPropagation();
                          }}
                          style={{
                            position: "absolute",
                            top: "10px",
                            right: "10px",
                            backgroundColor:
                              index === unmutedVideo
                                ? "rgba(255,255,255,1)"
                                : "rgba(255,255,255,0.2)",
                            color: index === unmutedVideo ? "black" : "white",
                            scale: "70%"
                          }}
                        >
                          {index === unmutedVideo ? (
                            <VolumeUpIcon />
                          ) : (
                            <VolumeOffIcon />
                          )}
                        </IconButton>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
            </div>
          )}
        </Droppable>

        {/* Controls section */}
        <div
          className="controls-section full-width"
          style={{
            borderTop: "1px solid #424242",
            padding: "20px 10px",
            marginLeft: "-8px",
            marginRight: "-8px",
            boxSizing: "border-box",
            borderRadius: "0px",
            backgroundColor: "#2C2F35",
            backdropFilter: "blur(20px)"
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: "-5px"
            }}
          >
            <Typography variant="body1" color="#E4E8F0" letterSpacing=".15rem">
              {formatTimecode(currentTime)}
            </Typography>
            <IconButton
              onClick={handlePlayPause}
              style={{
                backgroundColor: "#ff5f14",
                color: "white",
                marginInline: "20px"
              }}
            >
              {playing ? (
                <Pause fontSize="medium" />
              ) : (
                <PlayArrow fontSize="medium" />
              )}
            </IconButton>
            <Typography variant="body1" color="#E4E8F0" letterSpacing=".15rem">
              {formatTimecode(longestDuration)}
            </Typography>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "20px 150px"
            }}
          >
            <Slider
              min={0}
              max={longestDuration}
              value={currentTime}
              onChange={handleScrubberChange}
              onBeforeChange={() => setIsDragging(true)} // set isDragging to true when handle is grabbed
              onAfterChange={() => setIsDragging(false)}
              trackStyle={{ backgroundColor: "#ff5f14", height: 6 }}
              railStyle={{ backgroundColor: "#585A5E", height: 6 }} // Gray color
              handleStyle={{
                borderColor: isDragging ? "#E4E8F0" : "transparent",
                height: 16,
                width: 16,
                marginLeft: -3,
                marginTop: -5,
                boxShadow: "#2a2a2a",
                backgroundColor: "#ff5f14"
              }}
              step=".03"
            />
          </div>
        </div>

        {drawerOpen && (
          <div className="comment-section">
            {/* Drawer */}
            <div
              className={`drawer-container ${drawerOpen ? "open" : ""}`}
              style={{
                display: "flex",
                flexDirection: "column",
                height: "100vh",
                maxHeight: "100vh"
              }}
            >
              <div
                style={{ paddingTop: "70px", overflowY: "auto", flexGrow: 1 }}
              >
                {Object.entries(groupedComments).map(
                  ([timestamp, commentsAtTimestamp], index) => (
                    <div
                      key={index}
                      onClick={() => handleCommentClick(timestamp)}
                      style={{
                        border:
                          formatTimecode(currentTime) === timestamp
                            ? "1px solid #ff5f14"
                            : "1px solid #585A5E",
                        borderRadius: "5px",
                        padding: "10px",
                        marginBottom: "10px",
                        backgroundColor:
                          formatTimecode(currentTime) === timestamp
                            ? "#1C1E21"
                            : "#414449"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "left" }}>
                        <Typography
                          variant="body1"
                          style={{
                            fontFamily: "courier",
                            fontWeight: "bold",
                            color:
                              formatTimecode(currentTime) === timestamp
                                ? "#ff5f14"
                                : "#E4E8F0"
                          }}
                        >
                          {timestamp}
                        </Typography>
                      </div>
                      {commentsAtTimestamp.map((comment, commentIndex) => (
                        <div
                          key={commentIndex}
                          style={{
                            marginBottom:
                              commentIndex < commentsAtTimestamp.length - 1
                                ? "10px"
                                : undefined,
                            paddingTop: commentIndex > 0 ? "10px" : undefined,
                            borderTop:
                              commentIndex > 0 ? "1px solid #2C2F35" : undefined
                          }}
                        >
                          <div style={{ display: "flex", marginTop: "-6px" }}>
                            <Typography
                              variant="body2"
                              className="comment-info-text"
                              style={{ fontWeight: "bold" }}
                            >
                              {comment.user}
                            </Typography>
                            <Typography
                              variant="body2"
                              className="comment-info-text"
                              paddingLeft="5px"
                            >
                              | {comment.timestamp}
                            </Typography>
                          </div>
                          <Typography variant="body1" color="#E4E4EA">
                            {comment.text}
                          </Typography>
                        </div>
                      ))}
                    </div>
                  )
                )}
              </div>

              <div>
                <VideoComment onSubmit={handleCommentSubmit} />
              </div>
            </div>
          </div>
        )}

        <button
          className="drawer-toggle"
          onClick={() => setDrawerOpen(!drawerOpen)}
        >
          {drawerOpen ? "Hide Comments" : "Show Comments"}
        </button>
      </div>
    </DragDropContext>
  );
};

export default SharedVideos;
