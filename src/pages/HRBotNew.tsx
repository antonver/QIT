import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Stepper,
  Step,
  StepLabel,
  TextField,
  Chip,
  Alert,
  CircularProgress,
  Paper,
  Avatar,
  Divider,
  LinearProgress,
  IconButton,
  Tooltip,
  Fade,
  Slide
} from '@mui/material';
import {
  Work as WorkIcon,
  QuestionAnswer as QuestionIcon,
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
  Timer as TimerIcon
} from '@mui/icons-material';
import { getHrPositions, createInterview, submitAnswer, completeInterview } from '../services/aeonMessengerApi';
import { keyframes } from '@mui/system';

// Интерфейсы для типизации данных
interface Quality {
  id: number;
  name: string;
}

interface Position {
  id: number;
  title: string;
  qualities?: Quality[];
  is_active?: boolean;
  created_at?: string;
}

interface Question {
  id: number;
  text: string;
  type?: 'scale' | 'text' | 'choice';
  category?: string;
  scale?: {
    min: number;
    max: number;
  };
}

interface Interview {
  id: number;
  position_id: number;
  questions: Question[];
  answers?: Record<string, string>;
  status?: 'in_progress' | 'completed';
  score?: number;
  max_score: number;
  percentage?: number;
}

interface AnalysisResult {
  glyph: string;
  title: string;
  status: string;
  description: string;
  score: number;
  max_score: number;
  recommendations: string[];
}

// Circular glyph component for branding
const CircularGlyph: React.FC<{ size?: number }> = ({ size = 80 }) => (
  <Box
    sx={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #7B42F6 0%, #20F6D2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        width: size * 0.6,
        height: size * 0.6,
        borderRadius: '50%',
        border: '2px solid rgba(255, 255, 255, 0.3)',
      },
      '&::after': {
        content: '""',
        position: 'absolute',
        width: size * 0.3,
        height: size * 0.3,
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.8)',
      }
    }}
  />
);

// Floating animation for background elements
const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
`;

// Glow animation
const glow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(123, 66, 246, 0.3); }
  50% { box-shadow: 0 0 40px rgba(32, 246, 210, 0.5), 0 0 60px rgba(123, 66, 246, 0.3); }
`;

// Background decoration component
const BackgroundDecoration: React.FC = () => (
  <Box
    sx={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      pointerEvents: 'none',
      zIndex: 0,
      overflow: 'hidden',
    }}
  >
    {[...Array(8)].map((_, i) => (
      <Box
        key={i}
        sx={{
          position: 'absolute',
          width: 4,
          height: 4,
          borderRadius: '50%',
          background: i % 2 === 0 ? '#7B42F6' : '#20F6D2',
          opacity: 0.4,
          animation: `${float} ${3 + i}s ease-in-out infinite`,
          left: `${20 + i * 12}%`,
          top: `${10 + i * 8}%`,
        }}
      />
    ))}
  </Box>
);

const HRBotNew: React.FC = () => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [currentInterview, setCurrentInterview] = useState<Interview | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(90);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const handleFetchPositions = async () => {
    setLoading(true);
    try {
      const fetchedPositions = await getHrPositions();
      setPositions(fetchedPositions);
      setError(null);
    } catch (error) {
      console.error(error);
      setError('Failed to fetch positions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch positions on mount
    handleFetchPositions();
  }, []);

  const handleAnswerSubmit = useCallback(async () => {
    if (!currentInterview || !currentInterview.questions[currentQuestionIndex]) return;

    setLoading(true);
    try {
      await submitAnswer(currentInterview.id, currentInterview.questions[currentQuestionIndex].id, answer);
      setAnswer('');
      setCurrentQuestionIndex((prev) => prev + 1);
      setError(null);

      // If last question, complete interview
      if (currentQuestionIndex === currentInterview.questions.length - 1) {
        const apiResult = await completeInterview(currentInterview.id);

        // Преобразуем результат API в формат AnalysisResult
        const formattedResult: AnalysisResult = {
          glyph: "🎯",
          title: "Interview Analysis",
          status: apiResult.percentage >= 70 ? "Excellent" : apiResult.percentage >= 50 ? "Good" : "Needs Improvement",
          description: `You have completed the interview for ${selectedPosition?.title || 'this position'}. Your performance shows ${apiResult.percentage >= 70 ? 'strong understanding' : apiResult.percentage >= 50 ? 'moderate understanding' : 'areas that need more focus'} of the required skills.`,
          score: apiResult.score,
          max_score: apiResult.max_score,
          recommendations: [
            "Continue practicing communication skills",
            "Study more about industry best practices",
            "Focus on problem-solving scenarios"
          ]
        };

        setAnalysisResult(formattedResult);
        setActiveStep(2);
      }
    } catch (error) {
      console.error(error);
      setError('Failed to submit answer');
    } finally {
      setLoading(false);
    }
  }, [currentInterview, currentQuestionIndex, answer, selectedPosition]);

  useEffect(() => {
    // Timer for interview question
    let timer: NodeJS.Timeout;
    if (activeStep === 1 && currentInterview) {
      setTimeLeft(90);
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleAnswerSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeStep, currentInterview, handleAnswerSubmit]);

  const handlePositionSelect = async (position: Position) => {
    setSelectedPosition(position);
    setActiveStep(1);
    setLoading(true);
    try {
      // Создаем объект с нужной структурой для API
      const interview = await createInterview({ position_id: position.id });
      setCurrentInterview(interview);
      setCurrentQuestionIndex(0);
      setError(null);
    } catch (error) {
      console.error(error);
      setError('Failed to start interview');
    } finally {
      setLoading(false);
    }
  };

  const handleRestart = () => {
    setSelectedPosition(null);
    setCurrentInterview(null);
    setActiveStep(0);
    setError(null);
    setAnswer('');
    setCurrentQuestionIndex(0);
    setTimeLeft(90);
    setAnalysisResult(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const steps = ['Choose Position', 'Interview', 'Results'];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#000000',
        position: 'relative',
      }}
    >
      <BackgroundDecoration />

      <Container maxWidth="lg" sx={{ py: 4, position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <Fade in timeout={800}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <CircularGlyph size={100} />
            <Typography
              variant="h3"
              sx={{
                color: 'white',
                fontWeight: 700,
                mt: 3,
                mb: 1,
                background: 'linear-gradient(135deg, #FFFFFF 0%, #20F6D2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.02em',
              }}
            >
              Smart HR Interview
            </Typography>
            <Typography sx={{ color: '#AAA', fontSize: '1.1rem' }}>
              AI-Powered Candidate Assessment System
            </Typography>
          </Box>
        </Fade>

        {/* Progress Stepper */}
        <Paper
          sx={{
            bgcolor: 'rgba(15, 15, 15, 0.95)',
            border: '1px solid rgba(123, 66, 246, 0.2)',
            borderRadius: '16px',
            mb: 4,
            p: 3,
          }}
        >
          <Stepper
            activeStep={activeStep}
            sx={{
              '& .MuiStepLabel-root .Mui-completed': {
                color: '#20F6D2',
              },
              '& .MuiStepLabel-root .Mui-active': {
                color: '#7B42F6',
              },
              '& .MuiStepLabel-label': {
                color: '#AAA',
                '&.Mui-active': {
                  color: '#20F6D2',
                },
                '&.Mui-completed': {
                  color: '#20F6D2',
                },
              },
              '& .MuiStepIcon-root': {
                color: 'rgba(255, 255, 255, 0.2)',
                '&.Mui-active': {
                  color: '#7B42F6',
                },
                '&.Mui-completed': {
                  color: '#20F6D2',
                },
              },
            }}
          >
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
              bgcolor: 'rgba(239, 68, 68, 0.1)',
              color: '#FF6B6B',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '12px',
            }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        {/* Step 1: Position Selection */}
        {activeStep === 0 && (
          <Fade in timeout={600}>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography
                  variant="h4"
                  sx={{
                    color: 'white',
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, #FFFFFF 0%, #7B42F6 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Choose Your Position
                </Typography>
                <Tooltip title="Refresh positions">
                  <IconButton
                    onClick={handleFetchPositions}
                    disabled={loading}
                    sx={{
                      color: '#20F6D2',
                      '&:hover': {
                        bgcolor: 'rgba(32, 246, 210, 0.1)',
                      }
                    }}
                  >
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              </Box>

              {loading ? (
                <Box display="flex" justifyContent="center" sx={{ py: 8 }}>
                  <CircularProgress sx={{ color: '#7B42F6' }} size={60} />
                </Box>
              ) : positions.length === 0 ? (
                <Paper
                  sx={{
                    p: 6,
                    textAlign: 'center',
                    bgcolor: 'rgba(15, 15, 15, 0.95)',
                    border: '1px solid rgba(123, 66, 246, 0.2)',
                    borderRadius: '20px',
                  }}
                >
                  <Typography variant="h5" sx={{ color: '#7B42F6', mb: 2, fontWeight: 600 }}>
                    No Available Positions
                  </Typography>
                  <Typography sx={{ color: '#AAA' }}>
                    Please contact the administrator to add positions
                  </Typography>
                </Paper>
              ) : (
                <Box sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
                  gap: 3
                }}>
                  {positions.map((position, index) => (
                    <Slide key={position.id} direction="up" in timeout={600 + index * 100}>
                      <Card
                        sx={{
                          height: '100%',
                          cursor: 'pointer',
                          bgcolor: 'rgba(15, 15, 15, 0.95)',
                          border: '1px solid rgba(123, 66, 246, 0.2)',
                          borderRadius: '20px',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': {
                            transform: 'translateY(-8px) scale(1.02)',
                            borderColor: 'rgba(32, 246, 210, 0.5)',
                            animation: `${glow} 2s ease-in-out infinite`,
                          }
                        }}
                        onClick={() => handlePositionSelect(position)}
                      >
                        <CardContent sx={{ p: 4, textAlign: 'center' }}>
                          <Avatar
                            sx={{
                              width: 80,
                              height: 80,
                              mx: 'auto',
                              mb: 3,
                              background: 'linear-gradient(135deg, #7B42F6 0%, #20F6D2 100%)',
                              fontSize: 40
                            }}
                          >
                            <WorkIcon />
                          </Avatar>

                          <Typography
                            variant="h5"
                            sx={{
                              color: 'white',
                              fontWeight: 700,
                              mb: 2,
                              letterSpacing: '-0.01em',
                            }}
                          >
                            {position.title}
                          </Typography>

                          {position.qualities && position.qualities.length > 0 && (
                            <Box sx={{ mb: 3 }}>
                              <Typography variant="body2" sx={{ color: '#AAA', mb: 2 }}>
                                Key Skills:
                              </Typography>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                                {position.qualities.map((quality) => (
                                  <Chip
                                    key={quality.id}
                                    label={quality.name}
                                    size="small"
                                    sx={{
                                      bgcolor: 'rgba(123, 66, 246, 0.2)',
                                      color: '#7B42F6',
                                      border: '1px solid rgba(123, 66, 246, 0.3)',
                                      fontWeight: 500,
                                      fontSize: '0.75rem',
                                    }}
                                  />
                                ))}
                              </Box>
                            </Box>
                          )}

                          <Button
                            variant="contained"
                            fullWidth
                            startIcon={<QuestionIcon />}
                            sx={{
                              background: 'linear-gradient(135deg, #7B42F6 0%, #20F6D2 100%)',
                              color: 'white',
                              fontWeight: 600,
                              fontSize: '1.1rem',
                              borderRadius: '16px',
                              py: 2,
                              textTransform: 'none',
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 12px 24px rgba(123, 66, 246, 0.4)',
                              }
                            }}
                          >
                            Start Interview
                          </Button>
                        </CardContent>
                      </Card>
                    </Slide>
                  ))}
                </Box>
              )}
            </Box>
          </Fade>
        )}

        {/* Step 2: Interview */}
        {activeStep === 1 && currentInterview && selectedPosition && (
          <Slide direction="left" in timeout={500}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <IconButton
                  onClick={() => setActiveStep(0)}
                  sx={{
                    mr: 2,
                    color: '#20F6D2',
                    '&:hover': {
                      bgcolor: 'rgba(32, 246, 210, 0.1)',
                    }
                  }}
                >
                  <ArrowBackIcon />
                </IconButton>
                <Typography
                  variant="h4"
                  sx={{
                    color: 'white',
                    fontWeight: 600,
                  }}
                >
                  Interview: {selectedPosition.title}
                </Typography>
              </Box>

              <Paper
                sx={{
                  p: 4,
                  bgcolor: 'rgba(15, 15, 15, 0.95)',
                  border: '1px solid rgba(123, 66, 246, 0.2)',
                  borderRadius: '20px',
                }}
              >
                {/* Progress and Timer */}
                <Box sx={{ mb: 4 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Typography sx={{ color: '#20F6D2', fontWeight: 500, fontSize: '1.1rem' }}>
                      Question {currentQuestionIndex + 1} of {currentInterview.questions.length}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      <TimerIcon sx={{ color: timeLeft < 30 ? '#FF6B6B' : '#7B42F6' }} />
                      <Typography
                        variant="h6"
                        sx={{
                          color: timeLeft < 30 ? '#FF6B6B' : '#7B42F6',
                          fontWeight: 600,
                        }}
                      >
                        {formatTime(timeLeft)}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Question Progress */}
                  <LinearProgress
                    variant="determinate"
                    value={((currentQuestionIndex + 1) / currentInterview.questions.length) * 100}
                    sx={{
                      mb: 2,
                      height: 8,
                      borderRadius: 4,
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        background: 'linear-gradient(90deg, #7B42F6 0%, #20F6D2 100%)',
                        borderRadius: 4,
                      }
                    }}
                  />

                  {/* Timer Progress */}
                  <LinearProgress
                    variant="determinate"
                    value={(timeLeft / 90) * 100}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: timeLeft < 30 ? '#FF6B6B' : '#20F6D2',
                        borderRadius: 3,
                      }
                    }}
                  />
                </Box>

                <Typography
                  variant="h5"
                  sx={{
                    color: 'white',
                    mb: 4,
                    fontWeight: 500,
                    lineHeight: 1.5,
                  }}
                >
                  {currentInterview.questions[currentQuestionIndex]?.text}
                </Typography>

                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  variant="outlined"
                  placeholder="Type your answer here..."
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  sx={{
                    mb: 4,
                    '& .MuiOutlinedInput-root': {
                      bgcolor: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '16px',
                      color: 'white',
                      fontSize: '1.1rem',
                      '& fieldset': {
                        borderColor: 'rgba(123, 66, 246, 0.3)',
                        borderWidth: 2,
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(32, 246, 210, 0.5)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#20F6D2',
                        borderWidth: 2,
                      },
                    },
                    '& .MuiOutlinedInput-input': {
                      color: 'white',
                      '&::placeholder': {
                        color: '#AAA',
                        opacity: 1,
                      },
                    },
                  }}
                />

                <Box display="flex" justifyContent="space-between">
                  <Button
                    variant="outlined"
                    onClick={() => setActiveStep(0)}
                    disabled={loading}
                    startIcon={<ArrowBackIcon />}
                    sx={{
                      color: '#20F6D2',
                      borderColor: 'rgba(32, 246, 210, 0.3)',
                      borderRadius: '12px',
                      px: 3,
                      py: 1.5,
                      fontWeight: 600,
                      '&:hover': {
                        borderColor: 'rgba(32, 246, 210, 0.5)',
                        bgcolor: 'rgba(32, 246, 210, 0.1)',
                      }
                    }}
                  >
                    Back
                  </Button>

                  <Button
                    variant="contained"
                    onClick={handleAnswerSubmit}
                    disabled={!answer.trim() || loading}
                    endIcon={loading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : null}
                    sx={{
                      background: answer.trim()
                        ? 'linear-gradient(135deg, #7B42F6 0%, #20F6D2 100%)'
                        : 'rgba(255, 255, 255, 0.1)',
                      color: answer.trim() ? 'white' : '#666',
                      fontWeight: 600,
                      fontSize: '1.1rem',
                      borderRadius: '12px',
                      px: 4,
                      py: 1.5,
                      textTransform: 'none',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: answer.trim() ? 'translateY(-2px)' : 'none',
                        boxShadow: answer.trim() ? '0 8px 20px rgba(123, 66, 246, 0.4)' : 'none',
                      },
                      '&:disabled': {
                        color: '#666',
                      }
                    }}
                  >
                    {currentQuestionIndex === currentInterview.questions.length - 1 ? 'Complete' : 'Next Question'}
                  </Button>
                </Box>
              </Paper>
            </Box>
          </Slide>
        )}

        {/* Step 3: Results */}
        {activeStep === 2 && analysisResult && (
          <Fade in timeout={800}>
            <Box>
              <Typography
                variant="h4"
                sx={{
                  color: 'white',
                  fontWeight: 600,
                  textAlign: 'center',
                  mb: 4,
                  background: 'linear-gradient(135deg, #FFFFFF 0%, #20F6D2 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                🎯 Interview Results
              </Typography>

              <Paper
                sx={{
                  p: 5,
                  bgcolor: 'rgba(15, 15, 15, 0.95)',
                  border: '1px solid rgba(32, 246, 210, 0.3)',
                  borderRadius: '20px',
                  mb: 4,
                }}
              >
                <Box display="flex" alignItems="center" sx={{ mb: 4 }}>
                  <Avatar sx={{
                    width: 80,
                    height: 80,
                    fontSize: '2.5rem',
                    mr: 3,
                    background: 'linear-gradient(135deg, #7B42F6 0%, #20F6D2 100%)',
                  }}>
                    {analysisResult.glyph}
                  </Avatar>
                  <Box>
                    <Typography variant="h5" sx={{ color: 'white', fontWeight: 600, mb: 1 }}>
                      {analysisResult.title}
                    </Typography>
                    <Chip
                      label={analysisResult.status}
                      sx={{
                        bgcolor: 'rgba(32, 246, 210, 0.2)',
                        color: '#20F6D2',
                        fontWeight: 600,
                      }}
                    />
                  </Box>
                </Box>

                <Divider sx={{ bgcolor: 'rgba(123, 66, 246, 0.2)', my: 3 }} />

                <Typography variant="h6" sx={{ color: '#AAA', mb: 4, lineHeight: 1.6 }}>
                  {analysisResult.description}
                </Typography>

                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" sx={{ color: 'white', mb: 2, fontWeight: 600 }}>
                    📊 Score: {analysisResult.score}/{analysisResult.max_score}
                    ({Math.round((analysisResult.score / analysisResult.max_score) * 100)}%)
                  </Typography>

                  <Box sx={{
                    width: '100%',
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: 2,
                    overflow: 'hidden',
                    height: 12,
                  }}>
                    <Box
                      sx={{
                        width: `${(analysisResult.score / analysisResult.max_score) * 100}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #7B42F6 0%, #20F6D2 100%)',
                        transition: 'width 1s ease-in-out',
                        borderRadius: 2,
                      }}
                    />
                  </Box>
                </Box>

                {analysisResult.recommendations.length > 0 && (
                  <Box>
                    <Typography variant="h6" sx={{ color: '#20F6D2', mb: 3, fontWeight: 600 }}>
                      💡 Recommendations:
                    </Typography>
                    <Box component="ul" sx={{ pl: 0 }}>
                      {analysisResult.recommendations.map((rec, index) => (
                        <Box
                          key={index}
                          component="li"
                          sx={{
                            color: '#AAA',
                            mb: 2,
                            p: 2,
                            bgcolor: 'rgba(123, 66, 246, 0.1)',
                            borderRadius: '12px',
                            border: '1px solid rgba(123, 66, 246, 0.2)',
                            listStyle: 'none',
                            position: 'relative',
                            '&::before': {
                              content: '"•"',
                              color: '#20F6D2',
                              fontWeight: 'bold',
                              position: 'absolute',
                              left: '8px',
                            },
                            pl: 4,
                          }}
                        >
                          {rec}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
              </Paper>

              <Box display="flex" justifyContent="center">
                <Button
                  variant="contained"
                  onClick={handleRestart}
                  startIcon={<WorkIcon />}
                  sx={{
                    background: 'linear-gradient(135deg, #7B42F6 0%, #20F6D2 100%)',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '1.2rem',
                    borderRadius: '16px',
                    px: 6,
                    py: 2.5,
                    textTransform: 'none',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: '0 12px 24px rgba(123, 66, 246, 0.4)',
                    }
                  }}
                >
                  Take Another Interview
                </Button>
              </Box>

              {/* Footer Branding */}
              <Box sx={{ textAlign: 'center', mt: 6 }}>
                <Typography sx={{ color: '#666', fontSize: '0.875rem' }}>
                  powered by Quantum Insight Ecosystem
                </Typography>
              </Box>
            </Box>
          </Fade>
        )}
      </Container>
    </Box>
  );
};

export default HRBotNew;
