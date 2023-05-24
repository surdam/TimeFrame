import React, { useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  Box,
  Button,
  AppBar,
  Toolbar,
  TextField,
  Divider
} from "@material-ui/core";
import VideoInput from "./VideoInput";

import { getFirestore, doc, setDoc } from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL
} from "firebase/storage";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyAzrk_gSTVwpVDwxQAn04BoJIVj-33mADI",
  authDomain: "timestamp-45f41.firebaseapp.com",
  projectId: "timestamp-45f41",
  storageBucket: "timestamp-45f41.appspot.com",
  messagingSenderId: "685693403155",
  appId: "1:685693403155:web:d3a919c6149bf2dbd4bfe6",
  measurementId: "G-WPY90DQG7F"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

const VideoForm = () => {
  const [fileInputs, setFileInputs] = useState([
    { file: null, name: "", id: uuidv4() },
    { file: null, name: "", id: uuidv4() }
  ]);

  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");

  const handleFileChange = useCallback((acceptedFiles, index) => {
    setFileInputs((prevFileInputs) => {
      const newFileInputs = [...prevFileInputs];
      newFileInputs[index].file = acceptedFiles[0];

      if (index === prevFileInputs.length - 1 && prevFileInputs.length < 4) {
        newFileInputs.push({ file: null, name: "", id: uuidv4() });
      }

      return newFileInputs;
    });
  }, []);

  const handleFileDescriptionChange = useCallback((index, description) => {
    setFileInputs((fileInputs) =>
      fileInputs.map((input, i) => {
        if (i === index) {
          return { ...input, description: description };
        }
        return input;
      })
    );
  }, []); // no dependencies

  const handleRemove = useCallback((id) => {
    setFileInputs((prevFileInputs) =>
      prevFileInputs.filter((input) => input.id !== id)
    );
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const id = uuidv4();
    const uploadedFiles = fileInputs.filter((input) => input.file);
    const promises = uploadedFiles.map((input, index) => {
      const uniqueID = uuidv4();
      const storageRef = ref(storage, `videos/${id}/${uniqueID}`);
      const uploadTask = uploadBytesResumable(storageRef, input.file);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {},
          (error) => {
            console.error(
              `Failed to upload file and get download link - ${error}`
            );
            reject(error);
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              console.log(
                `Successfully uploaded file and got download link - ${downloadURL}`
              );
              resolve({ url: downloadURL, description: input.description });
            });
          }
        );
      });
    });

    Promise.all(promises)
      .then((files) => {
        const downloadURLs = files.map((file) => file.url);
        const descriptions = files.map((file) => file.description);
        return setDoc(doc(db, "videoLinks", id), {
          links: downloadURLs,
          descriptions: descriptions,
          projectName,
          projectDescription
        });
      })
      .then(() => {
        window.location.href = `/share/${id}`;
      })
      .catch((error) => {
        console.error("Failed to create document:", error);
      });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Box
        sx={{
          paddingTop: "80px",
          paddingBottom: "120px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-around",
          boxSizing: "border-box"
        }}
      >
        <Box
          sx={{
            backgroundColor: "#2C2F35",
            border: "0px solid #646464",
            borderRadius: "10px",
            color: "white",
            marginBottom: "20px",
            width: "60%",
            padding: "10px",
            boxSizing: "border-box"
          }}
        >
          <TextField
            placeholder="Project Name"
            fullWidth
            InputProps={{
              disableUnderline: true,
              style: {
                fontFamily: "NYTKarnak, Arial",
                fontWeight: "medium",
                letterSpacing: ".1rem",
                color: "white",
                fontSize: "30px",
                textAlign: "center",
                padding: "0px 0 0px",
                marginTop: "-10px",
                marginBottom: "-10px"
              }
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "transparent"
                },
                "&:hover fieldset": {
                  borderColor: "transparent"
                },
                "&.Mui-focused fieldset": {
                  borderColor: "transparent"
                }
              }
            }}
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
          />

          <Divider sx={{ margin: "0px 10px", backgroundColor: "#646464" }} />

          <TextField
            placeholder="Project Description"
            fullWidth
            multiline
            InputProps={{
              disableUnderline: true,
              style: {
                fontFamily: "Arial",
                color: "white",
                fontSize: "20px",
                textAlign: "left",
                padding: "10px 0 10px 13px"
              }
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "transparent"
                },
                "&:hover fieldset": {
                  borderColor: "transparent"
                },
                "&.Mui-focused fieldset": {
                  borderColor: "transparent"
                }
              }
            }}
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
          />
        </Box>
        {fileInputs.map((input, index) => (
          <Box
            style={{ width: "50%", padding: "20px", boxSizing: "border-box" }}
            key={input.id}
          >
            <VideoInput
              input={input}
              index={index}
              handleFileChange={handleFileChange}
              handleFileDescriptionChange={handleFileDescriptionChange}
              handleRemove={handleRemove}
            />
          </Box>
        ))}

        <AppBar
          position="fixed"
          color="primary"
          style={{ top: "auto", bottom: 0, width: "100%" }}
        >
          <Toolbar
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100px", // Update this value to increase the height of the bar
              backgroundColor: "#2C2F35", // Semi-transparent white color
              backdropFilter: "blur(10px)",
              borderTop: "1px solid #646464"
            }}
          >
            <Button
              type="submit"
              variant="contained"
              color="secondary"
              style={{
                backgroundColor: "#ff5f14", // Set the color of the button
                color: "#ffffff", // Set the text color
                padding: "8px 16px", // Increase the size of the button by increasing padding
                fontSize: "15px",
                borderRadius: "5px" // Increase the font size
              }}
            >
              Generate Preview
            </Button>
          </Toolbar>
        </AppBar>
      </Box>
    </form>
  );
};

export default VideoForm;
