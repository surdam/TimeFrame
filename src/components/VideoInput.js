import React, { useState } from "react";
import { Box, IconButton, Input, Typography, Button } from "@material-ui/core";
import { useDropzone } from "react-dropzone";
import HighlightOffIcon from "@material-ui/icons/HighlightOff";
import { SvgIcon } from "@material-ui/core";
import { CloudUpload } from "@material-ui/icons";

const VideoInput = ({
  input,
  index,
  handleFileChange,
  handleFileNameChange,
  handleFileDescriptionChange,
  handleRemove
}) => {
  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop: (acceptedFiles) => handleFileChange(acceptedFiles, index),
    accept: "video/*", // Accept only video files
    noClick: true,
    noKeyboard: true
  });

  const handleDescriptionChange = (event) => {
    const newDescription = event.target.value;
    handleFileDescriptionChange(index, newDescription);
  };

  return (
    <Box
      {...getRootProps()}
      style={{
        borderRadius: "10px",
        position: "relative",
        backgroundColor: "#2C2F35",
        border: "1px solid #646464",
        paddingBottom: "60%", // Aspect ratio of 16:9
        boxSizing: "border-box",
        overflow: "hidden"
      }}
    >
      <input {...getInputProps()} />
      <Box
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          display: input.file ? "flex" : "block",
          flexDirection: "column",
          justifyContent: "space-between",
          height: "100%"
        }}
      >
        {input.file ? (
          <>
            <VideoPlayer
              file={input.file}
              handleRemove={() => handleRemove(input.id)}
            />
            <DescriptionInput
              description={input.description}
              handleDescriptionChange={(desc) =>
                handleFileDescriptionChange(index, desc)
              }
            />
          </>
        ) : (
          <Box
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
              textAlign: "center"
            }}
          >
            <SvgIcon
              component={CloudUpload}
              fontSize="large"
              style={{ color: "#A0A3A8", position: "relative", bottom: "5px" }}
            />
            <Typography
              variant="subtitle1"
              style={{ textAlign: "center", color: "#E4E8F0" }}
            >
              Drag & Drop your Video File
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={open}
              style={{ color: "#1C1E21", marginTop: "20px" }}
            >
              Or Select a File
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
};

const VideoPlayer = React.memo(({ file, handleRemove }) => {
  const url = React.useMemo(() => URL.createObjectURL(file), [file]);

  return (
    <>
      <video
        src={url}
        style={{
          maxHeight: "90%",
          objectFit: "contain",
          backgroundColor: "black"
        }}
        controls
      />
      <IconButton
        color="inherit"
        style={{
          color: "white",
          position: "absolute",
          right: "3%",
          top: "3%"
        }}
        onClick={handleRemove}
      >
        <HighlightOffIcon />
      </IconButton>
    </>
  );
});

const DescriptionInput = ({ description, handleDescriptionChange }) => {
  return (
    <Input
      placeholder="Video Description"
      value={description}
      onChange={(e) => handleDescriptionChange(e.target.value)}
      style={{
        marginTop: "1%",
        marginBottom: "0px",
        marginLeft: "2%",
        maxWidth: "96%",
        color: "white"
      }}
    />
  );
};

export default VideoInput;
