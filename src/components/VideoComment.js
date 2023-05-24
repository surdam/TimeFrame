import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import SendIcon from "@mui/icons-material/Send";
import { styled } from "@mui/system";
import "../styles/SharedVideos.css";

const VideoCommentForm = styled("form")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  backgroundColor: "none",
  position: "relative",
  marginBottom: "35px",
  padding: theme.spacing(1),
  borderTop: "1px solid #585A5E"
}));

const CommentTextField = styled(TextField)(({ theme }) => ({
  flex: 1,
  margin: theme.spacing(1),
  marginRight: "0px",
  backgroundColor: "#1C1E21", // change the background color
  fontSize: "18px", // change the font size
  color: "#E4E8F0",
  borderRadius: "27px", // add border radius
  "& .MuiOutlinedInput-root": {
    // targeting the root of the input
    "& fieldset": {
      borderColor: "#414449",
      borderRadius: "27px" // change border color
    },
    "&:hover fieldset": {
      borderColor: "#A0A3A8" // change border color on hover
    },
    "&.Mui-focused fieldset": {
      borderColor: "#585A5" // change border color when input is focused
    }
  },
  "& .MuiOutlinedInput-input": {
    // targeting the actual input
    color: "white" // change the font color of the input
  }
}));

const SendButton = styled(IconButton)(({ theme }) => ({
  padding: 10,
  color: "#E4E8F0",
  position: "absolute", // make button position absolute
  right: "15px", // adjust as needed
  top: "50%", // center vertically
  transform: "translateY(-50%)" // center vertically
}));

const Comment = ({ comment, onClick }) => (
  <div onClick={onClick}>{/* ...display the comment... */}</div>
);

const VideoComment = ({ onSubmit }) => {
  const [text, setText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(text);
    setText("");
  };

  return (
    <VideoCommentForm onSubmit={handleSubmit}>
      <CommentTextField
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Leave a comment"
        multiline
        rowsMax={4}
      />
      <SendButton type="submit">
        <SendIcon />
      </SendButton>
    </VideoCommentForm>
  );
};

export default VideoComment;
