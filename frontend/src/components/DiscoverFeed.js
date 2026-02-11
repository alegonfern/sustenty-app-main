import { Card, CardContent, Typography, Stack, Chip } from '@mui/material';
import { Star, Lightbulb, TrendingUp } from '@mui/icons-material';

export default function DiscoverFeed({ feed }) {
  if (!feed || feed.length === 0) {
    return <Typography color="text.secondary">No hay contenido disponible.</Typography>;
  }
  return (
    <Stack spacing={3}>
      {feed.map(item => (
        <Card key={item.id} variant="outlined" sx={{ boxShadow: 0 }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2} mb={1}>
              {item.type === 'highlight' && <Star color="warning" fontSize="large" />}
              {item.type === 'suggestion' && <Lightbulb color="info" fontSize="large" />}
              {item.type === 'recommendation' && <TrendingUp color="success" fontSize="large" />}
              <Typography variant="h6">{item.title}</Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary" mb={2}>{item.description}</Typography>
            <Stack direction="row" spacing={1}>
              {item.tags.map(tag => (
                <Chip key={tag} label={tag} size="small" color="primary" variant="outlined" />
              ))}
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}
