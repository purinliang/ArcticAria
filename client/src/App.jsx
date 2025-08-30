import { Routes, Route, useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Button,
  Typography,
  Box,
  Divider,
  useTheme,
  useMediaQuery,
  Tooltip,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import TodoPage from "./pages/TodoPage";
import TodoDetailPage from "./pages/TodoDetailPage";
import BlogPage from "./pages/BlogPage";
import PostEditPage from "./pages/PostEditPage";
import PostDetailPage from "./pages/PostDetailPage";
import DiscoverPage from "./pages/DiscoverPage";
import { AuthProvider, useAuth } from "./AuthContext";
import { useState } from "react";
import HomePage from "./pages/HomePage";

function App() {
  const { isLoggedIn, username, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  // Use a media query to check for screen size. 'md' is a good breakpoint for tablets/desktops.
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = (open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setDrawerOpen(open);
  };

  /**
   * Handles the logout action.
   * Clears the JWT token from local storage and navigates to the login page.
   */
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleNavigation = (path) => {
    navigate(path);
    setDrawerOpen(false); // Close the drawer after navigation
  };

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

  // Render navigation buttons for desktop layout
  const renderNavButtons = () => (
    <Box
      sx={{
        flexGrow: 1,
        display: "flex",
        alignItems: "center",
        gap: 2,
        ml: 2,
      }}
    >
      <Button
        onClick={() => handleNavigation("/todos")}
        color="inherit"
        sx={{
          fontWeight: "bold",
          textTransform: "none",
        }}
      >
        Todos
      </Button>
      <Button
        onClick={() => handleNavigation("/discover")}
        color="inherit"
        sx={{
          fontWeight: "bold",
          textTransform: "none",
        }}
      >
        Discover
      </Button>
      <Button
        onClick={() => handleNavigation("/blog")}
        color="inherit"
        sx={{
          fontWeight: "bold",
          textTransform: "none",
        }}
      >
        Discuss
      </Button>
    </Box>
  );

  // Render authentication buttons
  const renderAuthButtons = () => (
    <Box
      sx={{
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        gap: 1,
      }}
    >
      {isLoggedIn ? (
        <>
          <Typography
            variant="body1"
            component="span"
            sx={{ mr: 1, fontWeight: "medium" }}
          >
            {username}
          </Typography>
          <Button
            variant="contained"
            color="error"
            onClick={handleLogout}
            sx={{
              fontSize: "1rem",
              textTransform: "none",
            }}
          >
            Sign out
          </Button>
        </>
      ) : (
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/login")}
          sx={{
            fontSize: "1rem",
            textTransform: "none",
          }}
        >
          Sign in
        </Button>
      )}
    </Box>
  );

  return (
    <AuthProvider>
      <Box>
        <AppBar
          position="static"
          sx={{
            bgcolor: "white",
            color: "black",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <Toolbar
            sx={{
              maxWidth: "1120px",
              width: "90%",
              mx: "auto",
              justifyContent: "space-between",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
              }}
            >
              {isMobile && (
                <IconButton
                  size="large"
                  edge="start"
                  color="inherit"
                  aria-label="menu"
                  onClick={toggleDrawer(true)}
                  sx={{ mr: 1 }}
                >
                  <MenuIcon />
                </IconButton>
              )}
              {/* Logo and App Name - Always show for better branding on all screens */}
              <Button
                onClick={() => navigate("/")}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  fontWeight: "bold",
                  fontSize: "1.5rem",
                  textTransform: "none",
                }}
              >
                {/* Logo icon as a Typography component */}
                <img
                  src="/arctic_aria.svg"
                  alt="Arctic Aria Logo"
                  style={{ height: "32px" }}
                />
                <img
                  src="/arctic_aria_title.svg"
                  alt="Arctic Aria Title"
                  style={{ height: "32px", marginLeft: "4px" }}
                />
              </Button>
            </Box>

            {/* Navigation links (desktop only) */}
            {!isMobile && renderNavButtons()}

            {/* Auth buttons (desktop only) */}
            {!isMobile && renderAuthButtons()}
          </Toolbar>
        </AppBar>

        <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
          <Box
            sx={{ width: 250 }}
            role="presentation"
            onClick={toggleDrawer(false)}
            onKeyDown={toggleDrawer(false)}
          >
            <List>
              <ListItem button onClick={() => handleNavigation("/todos")}>
                <ListItemText
                  primary="Todos"
                  primaryTypographyProps={{ sx: { fontWeight: "bold" } }}
                />
              </ListItem>
              <ListItem button onClick={() => handleNavigation("/discover")}>
                <ListItemText
                  primary="Discover"
                  primaryTypographyProps={{ sx: { fontWeight: "bold" } }}
                />
              </ListItem>
              <ListItem button onClick={() => handleNavigation("/blog")}>
                <ListItemText
                  primary="Discuss"
                  primaryTypographyProps={{ sx: { fontWeight: "bold" } }}
                />
              </ListItem>
              <Divider sx={{ my: 1 }} />
              {isLoggedIn ? (
                <>
                  <ListItem>
                    <ListItemText primary={`${username}`} />
                  </ListItem>
                  {/* Sign out button with error color */}
                  <ListItem button onClick={handleLogout}>
                    <ListItemText
                      primary="Sign out"
                      primaryTypographyProps={{
                        sx: { fontWeight: "bold", color: "error.main" },
                      }}
                    />
                  </ListItem>
                </>
              ) : (
                <>
                  {/* Sign in button with primary color */}
                  <ListItem button onClick={() => handleNavigation("/login")}>
                    <ListItemText
                      primary="Sign in"
                      primaryTypographyProps={{
                        sx: { fontWeight: "bold", color: "primary.main" },
                      }}
                    />
                  </ListItem>
                </>
              )}
            </List>
          </Box>
        </Drawer>

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
    </AuthProvider>
  );
}

export default App;
