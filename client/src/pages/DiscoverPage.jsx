import { Box, Typography, Button, Container, Grid, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const DiscoverPage = () => {
    const navigate = useNavigate();

    return (
        <Container maxWidth="md" sx={{ mt: 10, mb: 10, textAlign: 'center' }}>
            <Box sx={{ p: 4, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 3 }}>
                <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Discover
                </Typography>
                <Typography variant="h6" component="p" color="text.secondary" sx={{ mb: 4 }}>
                    This feature is coming soon!
                </Typography>
                <Typography variant="body1" sx={{ mb: 4 }}>
                    We are currently working hard to bring you personalized recommendations for your daily life.
                    In the meantime, feel free to explore our other features.
                </Typography>
                <Grid container spacing={2} justifyContent="center">
                    <Grid item>
                        <Button
                            variant="contained"
                            onClick={() => navigate('/todos')}
                        >
                            Go to Todos
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button
                            variant="outlined"
                            onClick={() => navigate('/blog')}
                        >
                            Join the Discussion
                        </Button>
                    </Grid>
                </Grid>
            </Box>
        </Container>
    );
};

export default DiscoverPage;
