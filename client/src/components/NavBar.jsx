import { useState } from "react";
import {
  AppBar,
  Toolbar,
  Button,
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
  Menu,
  MenuItem,
  ListItemIcon,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LanguageIcon from "@mui/icons-material/Language";
import ChecklistRtlIcon from "@mui/icons-material/ChecklistRtl";
import ForumIcon from "@mui/icons-material/Forum";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { useTranslation } from "react-i18next";
import ArcticAriaLogo from "../assets/arctic-aria-logo.png";
import ArcticAriaTitle from "./ArcticAriaTitle";
import { useLanguageSwitcher } from "../hooks/useLanguageSwitcher";

export default function NavBar() {
  const { isLoggedIn, username, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);
  const { toggleLanguage, switchLanguageText } = useLanguageSwitcher();

  const toggleDrawer = (open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setDrawerOpen(open);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleNavigation = (path) => {
    navigate(path);
    setDrawerOpen(false);
  };

  const renderNavButtons = () => (
    <Box
      sx={{ flexGrow: 1, display: "flex", alignItems: "center", gap: 2, ml: 4 }}
    >
      <Button
        onClick={() => handleNavigation("/todos")}
        color="inherit"
        sx={{ fontWeight: "bold", textTransform: "none" }}
      >
        {t("nav.todos")}
      </Button>
      <Button
        onClick={() => handleNavigation("/blog")}
        color="inherit"
        sx={{ fontWeight: "bold", textTransform: "none" }}
      >
        {t("nav.discuss")}
      </Button>
    </Box>
  );

  const renderAuthButtons = () => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Button
        variant="outlined"
        color="primary.main"
        onClick={toggleLanguage}
        startIcon={<LanguageIcon />}
        sx={{ textTransform: "none", borderRadius: "8px" }}
      >
        {switchLanguageText}
      </Button>
      {isLoggedIn ? (
        <>
          <Button
            color="inherit"
            onClick={handleMenuOpen}
            aria-controls={menuOpen ? "account-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={menuOpen ? "true" : undefined}
            sx={{ textTransform: "none", borderRadius: "8px" }}
            startIcon={<AccountCircleIcon sx={{ width: 32, height: 32 }} />}
          >
            {username}
          </Button>
          <Menu
            anchorEl={anchorEl}
            id="account-menu"
            open={menuOpen}
            onClose={handleMenuClose}
            onClick={handleMenuClose}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" color="error" />
              </ListItemIcon>
              {t("auth.signOut")}
            </MenuItem>
          </Menu>
        </>
      ) : (
        <>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/login")}
            startIcon={<LoginIcon />}
            sx={{ textTransform: "none", borderRadius: "8px" }}
          >
            {t("auth.signIn")}
          </Button>
        </>
      )}
    </Box>
  );

  const drawerContent = (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List>
        <ListItem button onClick={() => handleNavigation("/todos")}>
          <ListItemIcon sx={{ minWidth: "36px", color: "black" }}>
            <ChecklistRtlIcon />
          </ListItemIcon>
          <ListItemText
            primary={t("nav.todos")}
            primaryTypographyProps={{ sx: { fontWeight: "bold" } }}
          />
        </ListItem>
        <ListItem button onClick={() => handleNavigation("/blog")}>
          <ListItemIcon sx={{ minWidth: "36px", color: "black" }}>
            <ForumIcon />
          </ListItemIcon>
          <ListItemText
            primary={t("nav.discuss")}
            primaryTypographyProps={{ sx: { fontWeight: "bold" } }}
          />
        </ListItem>
        <Divider sx={{ my: 1 }} />
        <ListItem button onClick={toggleLanguage}>
          <ListItemIcon sx={{ minWidth: "36px" }}>
            <LanguageIcon />
          </ListItemIcon>
          <ListItemText primary={switchLanguageText} />
        </ListItem>
        {isLoggedIn ? (
          <>
            <ListItem>
              <ListItemIcon sx={{ minWidth: "36px" }}>
                <AccountCircleIcon />
              </ListItemIcon>
              <ListItemText primary={`${username}`} />
            </ListItem>
            <ListItem
              button
              onClick={handleLogout}
              sx={{ color: "error.main" }}
            >
              <ListItemIcon sx={{ minWidth: "36px", color: "error.main" }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText
                primary={t("auth.signOut")}
                primaryTypographyProps={{ sx: { fontWeight: "bold" } }}
              />
            </ListItem>
          </>
        ) : (
          <ListItem button onClick={() => handleNavigation("/login")}>
            <ListItemIcon sx={{ minWidth: "36px", color: "primary.main" }}>
              <LoginIcon />
            </ListItemIcon>
            <ListItemText
              primary={t("auth.signIn")}
              primaryTypographyProps={{
                sx: { fontWeight: "bold", color: "primary.main" },
              }}
            />
          </ListItem>
        )}
      </List>
    </Box>
  );

  return (
    <>
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
          <Box sx={{ display: "flex", alignItems: "center" }}>
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
            <Button
              onClick={() => navigate("/")}
              sx={{
                display: "flex",
                alignItems: "center",
                fontWeight: "bold",
                fontSize: "1.5rem",
                textTransform: "none",
                borderRadius: "8px",
                p: 1,
              }}
            >
              <img
                src={ArcticAriaLogo}
                alt="Arctic Aria Logo"
                style={{ height: "32px" }}
              />
              <ArcticAriaTitle
                width="auto"
                height="24px"
                fill="#000000"
                stroke="#000000"
                style={{ marginLeft: "6px" }}
              />
            </Button>
          </Box>

          {!isMobile && renderNavButtons()}
          {!isMobile && renderAuthButtons()}
        </Toolbar>
      </AppBar>

      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        {drawerContent}
      </Drawer>
    </>
  );
}
