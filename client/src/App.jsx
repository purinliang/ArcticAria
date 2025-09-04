import { Routes, Route } from "react-router-dom";
import {
  Typography,
  Box,
  Divider,
  useTheme,
  useMediaQuery,
  Tooltip,
  Stack,
  IconButton,
  createSvgIcon,
} from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import EmailIcon from "@mui/icons-material/Email";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import TodoPage from "./pages/TodoPage";
import TodoDetailPage from "./pages/TodoDetailPage";
import BlogPage from "./pages/BlogPage";
import PostEditPage from "./pages/PostEditPage";
import PostDetailPage from "./pages/PostDetailPage";
import { AuthProvider } from "./AuthContext";
import { useState, useEffect } from "react";
import HomePage from "./pages/HomePage";
import { useTranslation } from "react-i18next";
import NavBar from "./components/NavBar";

const WeChatIcon = createSvgIcon(
  <path d="M21.2,3H2.8A1.8,1.8,0,0,0,1,4.8V16.2A1.8,1.8,0,0,0,2.8,18H8l3,3,3-3h5.2A1.8,1.8,0,0,0,23,16.2V4.8A1.8,1.8,0,0,0,21.2,3ZM8.3,12.9a3.8,3.8,0,0,1-2.1-.8,3.1,3.1,0,0,1-1-2.3,1.6,1.6,0,0,1,.4-1.2,1.1,1.1,0,0,1,.8-.3,1.4,1.4,0,0,1,.6.1,1.1,1.1,0,0,1,.6.4c.1.2.6,1,.6,1.1s0,.2-.1.3a.6.6,0,0,1-.3.2.9.9,0,0,1-.4.2,1.1,1.1,0,0,0-.1.4,2.9,2.9,0,0,0,1,1.2,2.1,2.1,0,0,0,1.3.5.6.6,0,0,0,.4-.1.8.8,0,0,0,.4-.6c.1-.2.2-.3.4-.3a.6.6,0,0,1,.6.1.3.3,0,0,1,.2.3c0,.1,0,.4-.1.6A2.1,2.1,0,0,1,8.3,12.9Zm7.4,0a3.8,3.8,0,0,1-2.1-.8,3.1,3.1,0,0,1-1-2.3,1.6,1.6,0,0,1,.4-1.2,1.1,1.1,0,0,1,.8-.3,1.4,1.4,0,0,1,.6.1,1.1,1.1,0,0,1,.6.4c.1.2.6,1,.6,1.1s0,.2-.1.3a.6.6,0,0,1-.3.2.9.9,0,0,1-.4.2,1.1,1.1,0,0,0-.1.4,2.9,2.9,0,0,0,1,1.2,2.1,2.1,0,0,0,1.3.5.6.6,0,0,0,.4-.1.8.8,0,0,0,.4-.6c.1-.2.2-.3.4-.3a.6.6,0,0,1,.6.1.3.3,0,0,1,.2.3c0,.1,0,.4-.1.6A2.1,2.1,0,0,1,15.7,12.9Z" />,
  'WeChat',
);

function AppLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const h = (lng) => console.log("i18n language changed ->", lng);
    i18n.on("languageChanged", h);
    return () => i18n.off("languageChanged", h);
  }, [i18n]);

  const emailAddress = "purinliang@gmail.com";
  const wechatId = "purinliang";

  const [emailTooltipText, setEmailTooltipText] = useState(t("footer.copyEmail"));
  const [wechatTooltipText, setWechatTooltipText] = useState(
    t("footer.copyWeChat"),
  );

  const copyToClipboard = async (textToCopy, setText) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        // Fallback for insecure contexts or older browsers
        const textarea = document.createElement("textarea");
        textarea.value = textToCopy;
        textarea.style.position = "fixed"; // Avoids scrolling to bottom
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setText(t("footer.copied"));
    } catch (err) {
      console.error("Failed to copy text:", err);
      setText(t("footer.copyFailed"));
    }
  };

  const handleEmailClick = () => {
    copyToClipboard(emailAddress, setEmailTooltipText);
  };

  const handleWeChatClick = () => {
    copyToClipboard(wechatId, setWechatTooltipText);
  };

  return (
    <Box>
      <NavBar />
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
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/new" element={<PostEditPage />} />
          <Route path="/blog/edit/:id" element={<PostEditPage />} />
          <Route path="/blog/:id" element={<PostDetailPage />} />
        </Routes>
        {/* Footer */}
        <Divider sx={{ mt: 4, mb: 1 }} />
        <Box
          component="footer"
          sx={{
            mb: 2,
            p: 2,
            maxWidth: "1120px",
            mx: "auto",
            textAlign: "center",
          }}
        >
          <Typography variant="body2" color="text.secondary" gutterBottom>
            &copy; {new Date().getFullYear()} ArcticAria. {t("footer.rights")}
          </Typography>
          <Stack
            direction="row"
            spacing={1}
            justifyContent="center"
            alignItems="center"
            sx={{ mt: 1 }}
          >
            <Tooltip title={t("footer.sourceCode")}>
              <IconButton
                component="a"
                href="https://github.com/purinliang/ArcticAria"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ color: "text.secondary" }}
              >
                <GitHubIcon />
              </IconButton>
            </Tooltip>
            <Tooltip
              title={emailTooltipText}
              onClose={() => setEmailTooltipText(t("footer.copyEmail"))}
            >
              <IconButton onClick={handleEmailClick} sx={{ color: "text.secondary" }}>
                <EmailIcon />
              </IconButton>
            </Tooltip>
            <Tooltip
              title={wechatTooltipText}
              onClose={() => setWechatTooltipText(t("footer.copyWeChat"))}
            >
              <IconButton onClick={handleWeChatClick} sx={{ color: "text.secondary" }}>
                <WeChatIcon />
              </IconButton>
            </Tooltip>
          </Stack>
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
