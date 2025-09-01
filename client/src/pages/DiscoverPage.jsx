import { Box, Typography, Button, Container, Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const DiscoverPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <Container maxWidth="md" sx={{ mt: 10, mb: 10, textAlign: "center" }}>
      <Box
        sx={{
          p: 4,
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 3
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ fontWeight: "bold" }}
        >
          {t("page.discover.title")}
        </Typography>

        <Typography
          variant="h6"
          component="p"
          color="text.secondary"
          sx={{ mb: 4 }}
        >
          {t("page.discover.subtitle")}
        </Typography>

        <Typography variant="body1" sx={{ mb: 4 }}>
          {t("page.discover.description")}
        </Typography>

        <Grid container spacing={2} justifyContent="center">
          <Grid item>
            <Button variant="contained" onClick={() => navigate("/todos")}>
              {t("page.discover.buttons.todos")}
            </Button>
          </Grid>
          <Grid item>
            <Button variant="outlined" onClick={() => navigate("/blog")}>
              {t("page.discover.buttons.discussion")}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default DiscoverPage;
