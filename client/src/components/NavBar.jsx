import { useState } from "react";
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
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { useTranslation } from "react-i18next";
import ArcticAriaLogo from "../assets/arctic-aria-logo.png";
import ArcticAriaTitle from "./ArcticAriaTitle";
import LangSwitchBar from "./LangSwitchBar";

export default function NavBar() {
    const { isLoggedIn, username, logout } = useAuth();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const isMediumScreen = useMediaQuery(theme.breakpoints.between("md", "lg"));
    const [drawerOpen, setDrawerOpen] = useState(false);
    const { t } = useTranslation();

    const toggleDrawer = (open) => (event) => {
        if (
            event.type === "keydown" &&
            (event.key === "Tab" || event.key === "Shift")
        ) {
            return;
        }
        setDrawerOpen(open);
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
        <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center", gap: 2, ml: 4 }}>
            <Button onClick={() => handleNavigation("/todos")} color="inherit" sx={{ fontWeight: "bold", textTransform: "none" }}>
                {t("nav.todos")}
            </Button>
            <Button onClick={() => handleNavigation("/discover")} color="inherit" sx={{ fontWeight: "bold", textTransform: "none" }}>
                {t("nav.discover")}
            </Button>
            <Button onClick={() => handleNavigation("/blog")} color="inherit" sx={{ fontWeight: "bold", textTransform: "none" }}>
                {t("nav.discuss")}
            </Button>
        </Box>
    );

    const renderAuthButtons = () => (
        <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 1 }}>
            <LangSwitchBar />
            {isLoggedIn ? (
                <>
                    <Typography variant="body1" component="span" sx={{ mr: 1, fontWeight: "medium" }}>
                        {username}
                    </Typography>
                    {isMediumScreen ? (
                        <Tooltip title={t("auth.signOut")}>
                            <IconButton
                                color="error"
                                onClick={handleLogout}
                                sx={{
                                    border: "1px solid",
                                    borderColor: "error.main",
                                    borderRadius: "8px",
                                    "&:hover": { bgcolor: "error.lighter" },
                                }}
                            >
                                <LogoutIcon />
                            </IconButton>
                        </Tooltip>
                    ) : (
                        <Button variant="outlined" color="error" onClick={handleLogout} sx={{ textTransform: "none", borderRadius: "8px" }}>
                            {t("auth.signOut")}
                        </Button>
                    )}
                </>
            ) : (
                <Button variant="contained" color="primary" onClick={() => navigate("/login")} sx={{ textTransform: "none", borderRadius: "8px" }}>
                    {t("auth.signIn")}
                </Button>
            )}
        </Box>
    );

    const drawerContent = (
        <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)} onKeyDown={toggleDrawer(false)}>
            <List>
                <ListItem button onClick={() => handleNavigation("/todos")}>
                    <ListItemText primary={t("nav.todos")} primaryTypographyProps={{ sx: { fontWeight: "bold" } }} />
                </ListItem>
                <ListItem button onClick={() => handleNavigation("/discover")}>
                    <ListItemText primary={t("nav.discover")} primaryTypographyProps={{ sx: { fontWeight: "bold" } }} />
                </ListItem>
                <ListItem button onClick={() => handleNavigation("/blog")}>
                    <ListItemText primary={t("nav.discuss")} primaryTypographyProps={{ sx: { fontWeight: "bold" } }} />
                </ListItem>
                <Divider sx={{ my: 1 }} />
                <LangSwitchBar isMobile={true} />
                {isLoggedIn ? (
                    <>
                        <ListItem>
                            <ListItemText primary={`${username}`} />
                        </ListItem>
                        <ListItem button onClick={handleLogout}>
                            <ListItemText primary={t("auth.signOut")} primaryTypographyProps={{ sx: { fontWeight: "bold", color: "error.main" } }} />
                        </ListItem>
                    </>
                ) : (
                    <ListItem button onClick={() => handleNavigation("/login")}>
                        <ListItemText primary={t("auth.signIn")} primaryTypographyProps={{ sx: { fontWeight: "bold", color: "primary.main" } }} />
                    </ListItem>
                )}
            </List>
        </Box>
    );

    return (
        <>
            <AppBar position="static" sx={{ bgcolor: "white", color: "black", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
                <Toolbar sx={{ maxWidth: "1120px", width: "90%", mx: "auto", justifyContent: "space-between" }}>
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
                            <img src={ArcticAriaLogo} alt="Arctic Aria Logo" style={{ height: "32px" }} />
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