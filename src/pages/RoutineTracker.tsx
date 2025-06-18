// 📁 components/RoutineTracker.tsx
import { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, Button, Checkbox, List, ListItem, ListItemText } from '@mui/material';
import {routineData} from '../data/routine.ts';

interface RoutineItem {
    id: string;
    title: string;
    description?: string;
    completed: boolean;
}

export default function RoutineTracker() {
    const [routine, setRoutine] = useState<RoutineItem[]>([]);

    useEffect(() => {
        // Симуляция запроса
        const fetchRoutine = async () => {
            const response = await new Promise<RoutineItem[]>((resolve) => {
                setTimeout(() => resolve(routineData), 500);
            });
            setRoutine(response);
        };
        fetchRoutine();
    }, []);

    const toggleComplete = (id: string) => {
        setRoutine((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, completed: !item.completed } : item
            )
        );
    };

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h5" gutterBottom>
                Трекер Рутины
            </Typography>
            <List>
                {routine.map((item) => (
                    <Card key={item.id} sx={{ mb: 2 }}>
                        <CardContent>
                            <ListItem disablePadding>
                                <Checkbox
                                    checked={item.completed}
                                    onChange={() => toggleComplete(item.id)}
                                />
                                <ListItemText
                                    primary={item.title}
                                    secondary={item.description}
                                    sx={{ textDecoration: item.completed ? 'line-through' : 'none' }}
                                />
                            </ListItem>
                        </CardContent>
                    </Card>
                ))}
            </List>
            <Button
                variant="contained"
                onClick={() => console.log('Save clicked', routine)}
            >
                Сохранить (заглушка)
            </Button>
        </Box>
    );
}
