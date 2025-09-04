import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  Grid,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ScheduleIcon from "@mui/icons-material/Schedule";
import ExploreIcon from "@mui/icons-material/Explore";
import CodeIcon from "@mui/icons-material/Code";
import BuildIcon from "@mui/icons-material/Build";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";

const HomePage = () => {
  const { t } = useTranslation();

  const solveItems = [
    {
      icon: <CheckCircleOutlineIcon fontSize="large" color="primary" />,
      title: t("page.home.solve.items.0.title"),
      desc: t("page.home.solve.items.0.desc"),
    },
    {
      icon: <ScheduleIcon fontSize="large" color="primary" />,
      title: t("page.home.solve.items.1.title"),
      desc: t("page.home.solve.items.1.desc"),
    },
    {
      icon: <ExploreIcon fontSize="large" color="primary" />,
      title: t("page.home.solve.items.2.title"),
      desc: t("page.home.solve.items.2.desc"),
    },
  ];

  const visionItems = [
    {
      icon: <BuildIcon fontSize="large" color="secondary" />,
      title: t("page.home.vision.items.0.title"),
      desc: t("page.home.vision.items.0.desc"),
    },
    {
      icon: <RocketLaunchIcon fontSize="large" color="secondary" />,
      title: t("page.home.vision.items.1.title"),
      desc: t("page.home.vision.items.1.desc"),
    },
  ];

  return (
    <Container maxWidth="lg">
      {/* Hero Section */}
      <Box sx={{ textAlign: "center", my: 8 }}>
        <Typography variant="h2" component="h1" gutterBottom>
          {t("page.home.title")}
        </Typography>
        <Typography variant="h5" color="text.secondary" sx={{ mt: 2 }}>
          {t("page.home.subtitle")}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2, maxWidth: "700px", mx: "auto" }}>
          {t("page.home.summary")}
        </Typography>
      </Box>

      {/* What We Solve Section */}
      <Box sx={{ my: 8 }}>
        <Typography variant="h4" component="h2" gutterBottom align="center">
          {t("page.home.solve.title")}
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 4,
            mt: 2,
            alignItems: "stretch",
          }}
        >
          {solveItems.map((item, index) => (
            <Paper key={index} elevation={2} sx={{ flex: 1, textAlign: "center", p: 3 }}>
              {item.icon}
              <Typography variant="h6" component="div" sx={{ mt: 2 }}>{item.title}</Typography>
              <Typography sx={{ mt: 1.5 }} color="text.secondary">{item.desc}</Typography>
            </Paper>
          ))}
        </Box>
      </Box>

      {/* Current Features Section */}
      <Box sx={{ my: 8, textAlign: "center" }}>
        <Typography variant="h4" component="h2" gutterBottom>
          {t("page.home.features.title")}
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 4,
            mt: 2,
            alignItems: "stretch",
          }}
        >
          <Paper elevation={3} sx={{ p: 3, flex: 1 }}>
            <Typography variant="h5">{t("page.home.features.todos.title")}</Typography>
            <Typography sx={{ mt: 1 }} color="text.secondary">{t("page.home.features.todos.desc")}</Typography>
            <Button component={RouterLink} to="/todos" variant="outlined" sx={{ mt: 2 }}>{t("page.home.features.todos.cta")}</Button>
          </Paper>
          <Paper elevation={3} sx={{ p: 3, flex: 1 }}>
            <Typography variant="h5">{t("page.home.features.discuss.title")}</Typography>
            <Typography sx={{ mt: 1 }} color="text.secondary">{t("page.home.features.discuss.desc")}</Typography>
            <Button component={RouterLink} to="/blog" variant="outlined" sx={{ mt: 2 }}>{t("page.home.features.discuss.cta")}</Button>
          </Paper>
        </Box>
      </Box>

      {/* Future Vision Section */}
      <Box sx={{ my: 8, textAlign: "center" }}>
        <Typography variant="h4" component="h2" gutterBottom>
          {t("page.home.vision.title")}
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 4,
            mt: 2,
            alignItems: "stretch",
          }}
        >
          {visionItems.map((item, index) => (
            <Paper key={index} elevation={2} sx={{ p: 3, flex: 1 }}>
              <Typography variant="h6">{item.title}</Typography>
              <Typography sx={{ mt: 1 }} color="text.secondary">{item.desc}</Typography>
            </Paper>
          ))}
        </Box>
      </Box>

      {/* Join Us Section */}
      <Box sx={{ my: 8, textAlign: "center" }}>
        <Typography variant="h4" component="h2" gutterBottom>
          {t("page.home.join.title")}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2, maxWidth: "700px", mx: "auto" }}>
          {t("page.home.join.summary")}
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 4,
            mt: 3,
            alignItems: "stretch",
          }}
        >
          <Paper sx={{ p: 3, textAlign: "left", flex: 1 }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}><CodeIcon sx={{ mr: 1 }} />{t("page.home.join.core_dev_title")}</Typography>
            <Typography sx={{ mt: 1 }}>{t("page.home.join.core_dev_desc")}</Typography>
          </Paper>
          <Paper sx={{ p: 3, textAlign: "left", flex: 1 }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}><CodeIcon sx={{ mr: 1 }} />{t("page.home.join.entry_dev_title")}</Typography>
            <Typography sx={{ mt: 1 }}>{t("page.home.join.entry_dev_desc")}</Typography>
          </Paper>
        </Box>
        <Button
          variant="outlined"
          sx={{ mt: 4 }}
          href="https://github.com/purinliang/ArcticAria#we-are-looking-for-contributors"
          target="_blank"
        >
          {t("page.home.join.cta")}
        </Button>
      </Box>
    </Container>
  );
};

export default HomePage;
