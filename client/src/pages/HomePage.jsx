import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  Divider,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Trans, useTranslation } from "react-i18next";

const HomePage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <Container maxWidth="md" sx={{ mt: 8, mb: 8, textAlign: "center" }}>
      {/* Introduction Section */}
      <Box sx={{ mb: 6 }}>
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{ fontWeight: "bold" }}
        >
          {t("page.home.title")}
        </Typography>

        <Typography variant="body1" sx={{ maxWidth: "480px", mx: "auto" }}>
          <Trans
            i18nKey="page.home.intro"
            components={{
              strong: <Box component="span" sx={{ fontWeight: 700 }} />,
            }}
          />
        </Typography>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Features Section */}
      <Box sx={{ mb: 6 }}>
        <Typography
          variant="h4"
          component="h2"
          gutterBottom
          sx={{ fontWeight: "bold" }}
        >
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
          {/* Todo Feature */}
          <Paper elevation={3} sx={{ p: 4, flex: 1, height: "100%" }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
              {t("page.home.features.todos.title")}
            </Typography>
            <Typography
              height="150px" variant="body2" color="text.secondary">
              {t("page.home.features.todos.desc")}
            </Typography>
            <Button
              variant="outlined"
              size="small"
              sx={{ mt: 2, px: 1, py: 0.5 }}
              onClick={() => navigate("/todos")}
            >
              {t("page.home.features.todos.cta")}
            </Button>
          </Paper>

          {/* Discover Feature */}
          <Paper elevation={3} sx={{ p: 4, flex: 1, height: "100%" }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
              {t("page.home.features.discover.title")}
            </Typography>
            <Typography
              height="150px"
              variant="body2"
              color="text.secondary"
            >
              {t("page.home.features.discover.desc")}
            </Typography>
            <Button
              variant="outlined"
              size="small"
              sx={{ mt: 2, px: 1, py: 0.5 }}
              onClick={() => navigate("/discover")}
            >
              {t("page.home.features.discover.cta")}
            </Button>
          </Paper>

          {/* Discuss Feature */}
          <Paper elevation={3} sx={{ p: 4, flex: 1, height: "100%" }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
              {t("page.home.features.discuss.title")}
            </Typography>
            <Typography
              height="150px" variant="body2" color="text.secondary">
              {t("page.home.features.discuss.desc")}
            </Typography>
            <Button
              variant="outlined"
              size="small"
              sx={{ mt: 2, px: 1, py: 0.5 }}
              onClick={() => navigate("/blog")}
            >
              {t("page.home.features.discuss.cta")}
            </Button>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
};

export default HomePage;
