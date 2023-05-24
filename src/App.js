import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import VideoForm from "./components/VideoForm";
import SharedVideos from "./components/SharedVideos";
import Header from "./components/Header";
import "./styles.css";
import { createTheme, ThemeProvider } from "@material-ui/core/styles";

const theme = createTheme({
  typography: {
    h1: {
      fontFamily: "NYTKarnak, Arial"
    },
    h2: {
      fontFamily: "NYTKarnak, Georgia, Arial"
    },
    h3: {
      fontFamily: "Helvetica, Arial"
    }
  },
  palette: {
    primary: {
      main: "#F5F5F5"
    }
  }
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <div className="App container">
        <BrowserRouter>
          <Header />
          <Routes>
            <Route path="/" element={<VideoForm />} />
            <Route
              path="/share/:id"
              element={<SharedVideos />}
              children={({ match }) => <SharedVideos id={match.params.id} />}
            />
          </Routes>
        </BrowserRouter>
      </div>
    </ThemeProvider>
  );
}

export default App;
