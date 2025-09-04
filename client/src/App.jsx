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
} from "@mui/material";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub, faWeixin } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
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

function AppLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const h = (lng) => console.log("i18n language changed ->", lng);
    i18n.on("languageChanged", h);
    return () => i18n.off("languageChanged", h);
  }, [i18n]);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = '//busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js';
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);

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
          
          <Typography variant="body2" color="text.secondary">
            {t("footer.site_views")} <span id="busuanzi_value_site_pv"></span> {t("footer.times")}
          </Typography>
          
          <Stack
            direction="row"
            spacing={2}
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
                sx={{ color: "text.secondary", width: 32, height: 32 }}
              >
                <FontAwesomeIcon icon={faGithub} />
              </IconButton>
            </Tooltip>
            <Tooltip
              title={emailTooltipText}
              onClose={() => setEmailTooltipText(t("footer.copyEmail"))}
            >
              <IconButton onClick={handleEmailClick} sx={{ color: "text.secondary", width: 32, height: 32 }}>
                <FontAwesomeIcon icon={faEnvelope} />
              </IconButton>
            </Tooltip>
            <Tooltip
              title={wechatTooltipText}
              onClose={() => setWechatTooltipText(t("footer.copyWeChat"))}
            >
              <IconButton onClick={handleWeChatClick} sx={{ color: "text.secondary", width: 32, height: 32 }}>
                <FontAwesomeIcon icon={faWeixin} />
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
