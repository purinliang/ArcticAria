import { Box, Typography, Button, Container, Paper, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';

// A simple and clean homepage component
const HomePage = () => {
    const navigate = useNavigate();

    return (
        <Container maxWidth="md" sx={{ mt: 8, mb: 8, textAlign: 'center' }}>
            {/* Introduction Section */}
            <Box sx={{ mb: 6 }}>
                <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Welcome to ArcticAria
                </Typography>
                <Typography variant="h5" component="p" color="text.secondary" sx={{ mb: 4 }}>
                    Your personal assistant for managing daily life.
                </Typography>
                <Typography variant="body1" sx={{ maxWidth: '720px', mx: 'auto' }}>
                    ArcticAria is designed to be your small life assistant, helping you plan your daily progress with <strong>Todos</strong> for work, study, and essential tasks. In your free time, it will offer <strong>Discover</strong> for food, entertainment, and shopping to help you decide.
                </Typography>
            </Box>

            <Divider sx={{ my: 4 }} />

            {/* Features Section */}
            <Box sx={{ mb: 6 }}>
                <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Key Features
                </Typography>
                {/* Using Flexbox for a robust and responsive layout */}
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        gap: 4,
                        mt: 2,
                        alignItems: 'stretch',
                    }}
                >
                    {/* Todo Feature */}
                    <Paper
                        elevation={3}
                        sx={{
                            p: 4,
                            flex: 1, // Makes this item take up equal space
                            height: '100%',
                        }}
                    >
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                            Todos
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Easily create, track, and manage all your tasks. Ensure every task is completed on time.
                        </Typography>
                        <Button
                            variant="outlined"
                            size="small"
                            sx={{ mt: 2, px: 1, py: 0.5 }}
                            onClick={() => navigate('/todos')}
                        >
                            Go to Todos
                        </Button>
                    </Paper>
                    {/* Discover Feature */}
                    <Paper
                        elevation={3}
                        sx={{
                            p: 4,
                            flex: 1, // Makes this item take up equal space
                            height: '100%',
                        }}
                    >
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                            Discover
                        </Typography>
                        <Typography variant="body2" color="text.secondary" fontStyle="italic">
                            Coming Soon! We plan to offer personalized recommendations for food, places to visit, and things to do to help you make decisions effortlessly.
                        </Typography>
                        <Button
                            variant="outlined"
                            size="small"
                            sx={{ mt: 2, px: 1, py: 0.5 }}
                            onClick={() => navigate('/discover')}
                        >
                            Go to Discover
                        </Button>
                    </Paper>
                    {/* Discuss Feature */}
                    <Paper
                        elevation={3}
                        sx={{
                            p: 4,
                            flex: 1, // Makes this item take up equal space
                            height: '100%',
                        }}
                    >
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                            Discuss
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            A public discussion area for everyone. If you have ideas for new daily life tools, feel free to leave a message here!
                        </Typography>
                        <Button
                            variant="outlined"
                            size="small"
                            sx={{ mt: 2, px: 1, py: 0.5 }}
                            onClick={() => navigate('/blog')}
                        >
                            Go to Discuss
                        </Button>
                    </Paper>
                </Box>
            </Box>
        </Container>
    );
};

export default HomePage;
