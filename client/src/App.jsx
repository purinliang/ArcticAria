import { Routes, Route, useNavigate } from "react-router-dom";
import {
  Button,
  Typography,
  Box,
  Divider,
  useTheme,
  useMediaQuery,
  Tooltip,
} from "@mui/material";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import TodoPage from "./pages/TodoPage";
import TodoDetailPage from "./pages/TodoDetailPage";
import BlogPage from "./pages/BlogPage";
import PostEditPage from "./pages/PostEditPage";
import PostDetailPage from "./pages/PostDetailPage";
import DiscoverPage from "./pages/DiscoverPage";
import { AuthProvider } from "./AuthContext";
import { useState, useEffect } from "react";
import HomePage from "./pages/HomePage";
import { useTranslation } from "react-i18next";
import NavBar from "./components/NavBar";

function AppLayout() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { i18n, t } = useTranslation();

  useEffect(() => {
    const h = (lng) => console.log("i18n language changed ->", lng);
    i18n.on("languageChanged", h);
    return () => i18n.off("languageChanged", h);
  }, [i18n]);

  const emailAddress = "purinliang@gmail.com";
  // State to manage the special "copied" tooltip and its text
  const [copiedTooltipOpen, setCopiedTooltipOpen] = useState(false);
  const [tooltipText, setTooltipText] = useState(
    `Click to copy: ${emailAddress}`,
  );

  const handleEmailClick = async () => {
    try {
      // Use document.execCommand for better cross-browser compatibility in iframes
      const textarea = document.createElement("textarea");
      textarea.value = emailAddress;
      textarea.style.position = "fixed"; // Avoid scrolling to the bottom of the page
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);

      // On success, set tooltip text and open state
      setTooltipText("Copied to clipboard!");
      setCopiedTooltipOpen(true);
    } catch (err) {
      console.error("Failed to copy text:", err);
      setTooltipText("Failed to copy!");
      setCopiedTooltipOpen(true);
    } finally {
      // Hide the tooltip and revert text after 2 seconds
      setTimeout(() => {
        setCopiedTooltipOpen(false);
      }, 2000);
      setTimeout(() => {
        setTooltipText(`Click to copy: ${emailAddress}`);
      }, 2500);
    }
  };

  const handleHoverOpen = () => {
    // Only open the tooltip on hover if it's not currently in the "copied" state
    if (!copiedTooltipOpen) {
      setCopiedTooltipOpen(true);
    }
  };

  const handleHoverClose = () => {
    // Only close the tooltip on hover if it's not currently in the "copied" state
    if (!copiedTooltipOpen) {
      setCopiedTooltipOpen(false);
    }
  };

  return (
    <Box>
      <NavBar />
      <Box
        component="main"
        sx={{ p: isMobile ? 0.5 : 2, maxWidth: "960px", mx: "auto" }}
      >
        <Box
          component="main"
          sx={{ p: isMobile ? 0.5 : 2, maxWidth: "960px", mx: "auto" }}
        >
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/todos" element={<TodoPage />} />
            <Route path="/todos/new" element={<TodoDetailPage />} />
            <Route path="/todos/:id" element={<TodoDetailPage />} />
            <Route path="/discover" element={<DiscoverPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/new" element={<PostEditPage />} />
            <Route path="/blog/edit/:id" element={<PostEditPage />} />
            <Route path="/blog/:id" element={<PostDetailPage />} />
          </Routes>
        </Box>

        {/* Footer */}
        <Divider sx={{ mt: 4, mb: 1 }} />
        <Box
          component="footer"
          sx={{
            mb: 4,
            p: 2,
            maxWidth: "1120px",
            mx: "auto",
            textAlign: "center",
          }}
        >
          <Typography variant="body2" color="text.secondary" gutterBottom>
            &copy; {new Date().getFullYear()} ArcticAria. All rights reserved.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Contact me:{" "}
            <a
              href="https://github.com/purinliang"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "inherit",
                textDecoration: "none",
                marginRight: "8px",
              }}
            >
              GitHub
            </a>
            |
            <Box
              component="span"
              sx={{ position: "relative", display: "inline-block" }}
            >
              <Tooltip
                title={tooltipText}
                open={copiedTooltipOpen}
                onOpen={handleHoverOpen}
                onClose={handleHoverClose}
                disableFocusListener
                disableTouchListener
              >
                <a
                  onClick={handleEmailClick}
                  style={{
                    color: "inherit",
                    textDecoration: "none",
                    marginLeft: "8px",
                    cursor: "pointer",
                  }}
                >
                  Email
                </a>
              </Tooltip>
            </Box>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppLayout />
    </AuthProvider>
  );
}

export default App;
