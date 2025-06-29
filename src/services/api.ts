import axios from 'axios';
import type {
  Test,
  SubmitAnswersRequest,
  SubmitAnswersResponse,
  GetResultResponse,
  Session,
  Stats,
  AdminStats,
  Candidate,
  GlyphData,
  AeonQuestion,
  AeonSummary,
  AeonTask
} from '../types/api';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://aeon-hr-25586f51bf65.herokuapp.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('aeon_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - let useAuth handle this
      const currentToken = localStorage.getItem('aeon_token');
      if (currentToken) {
        localStorage.removeItem('aeon_token');
      }
      // Don't reload page, let the auth hook handle it
    } else if (error.response?.status === 404) {
      // Only clear token for session-specific 404 errors
      const isSessionError = error.response?.data?.detail === 'Сессия не найдена' ||
                           error.config?.url?.includes('/session/');
      if (isSessionError) {
        const currentToken = localStorage.getItem('aeon_token');
        if (currentToken) {
          localStorage.removeItem('aeon_token');
        }
      }
    }
    return Promise.reject(error);
  }
);

// Session API
export const createSession = async (): Promise<Session> => {
  const response = await api.post<Session>('/session');
  return response.data;
};

export const getSession = async (token: string): Promise<Session> => {
  const response = await api.get<Session>(`/session/${token}`);
  return response.data;
};

export const saveAnswer = async (token: string, answer: any): Promise<any> => {
  const response = await api.post(`/session/${token}/answer`, answer);
  return response.data;
};

export const completeSession = async (token: string): Promise<any> => {
  const response = await api.post(`/session/${token}/complete`);
  return response.data;
};

// Test API
export const getTest = async (testId: number, lang: 'ru' | 'en' = 'ru'): Promise<Test> => {
  const response = await api.get<Test>(`/test/${testId}?lang=${lang}`);
  return response.data;
};

export const submitTestAnswer = async (testId: number, answers: any[]): Promise<SubmitAnswersResponse> => {
  const request: SubmitAnswersRequest = { answers };
  const response = await api.post<SubmitAnswersResponse>(`/test/${testId}/submit`, request);
  return response.data;
};

export const autosaveTest = async (testId: number, answers: any[]): Promise<void> => {
  const request: SubmitAnswersRequest = { answers };
  await api.post(`/test/${testId}/autosave`, request);
};

export const getTestResult = async (resultId: number): Promise<GetResultResponse> => {
  const response = await api.get<GetResultResponse>(`/result/${resultId}`);
  return response.data;
};

// Glyph API
export const generateGlyph = async (data: any): Promise<GlyphData> => {
  const response = await api.post<GlyphData>('/aeon/glyph', data);
  return response.data;
};

// Aeon API - Updated with proper types and error handling
export const aeonNextQuestion = async (data: {
  session_token: string;
  current_answers?: { [key: string]: string };
}): Promise<AeonQuestion> => {
  try {
    const response = await api.post<AeonQuestion>('/aeon/question', data);
    return response.data;
  } catch (error) {
    console.error('ÆON question error:', error);
    // Return a mock question if the endpoint is not available
    return {
      question: "Tell us about your approach to problem-solving and how you handle challenges in your work."
    };
  }
};

export const aeonSummary = async (data: {
  session_token: string;
  answers: { [key: string]: string };
}): Promise<AeonSummary> => {
  try {
    const response = await api.post<AeonSummary>('/aeon/summary', data);
    return response.data;
  } catch (error) {
    console.error('ÆON summary error:', error);
    // Return a mock summary if the endpoint is not available
    return {
      summary: `Based on your responses, you've completed the ÆON assessment. You answered ${Object.keys(data.answers).length} questions thoughtfully. Your unique profile has been analyzed and your ÆON glyph is ready to be generated.`
    };
  }
};

export const aeonTask = async (data: {
  session_token: string;
}): Promise<AeonTask> => {
  try {
    const response = await api.post<AeonTask>('/aeon/task', data);
    return response.data;
  } catch (error) {
    console.error('ÆON task error:', error);
    // Return a mock task if the endpoint is not available
    return {
      task: "Complete the assessment by answering questions thoughtfully and honestly."
    };
  }
};

// Stats API
export const getStats = async (): Promise<Stats> => {
  const response = await api.get<Stats>('/stats');
  return response.data;
};

// Admin API
export const getAdminStats = async (): Promise<AdminStats> => {
  const response = await api.get<AdminStats>('/admin/stats');
  return response.data;
};

export const getAdminSessions = async (): Promise<Candidate[]> => {
  const response = await api.get<Candidate[]>('/admin');
  return response.data;
};

export const getAdminSessionDetail = async (token: string): Promise<any> => {
  const response = await api.get(`/admin/session/${token}`);
  return response.data;
};

export const deleteAdminSession = async (token: string): Promise<any> => {
  const response = await api.post(`/admin/session/${token}/delete`);
  return response.data;
};

export const getAdminLog = async (): Promise<any> => {
  const response = await api.get('/admin/log');
  return response.data;
};

export const exportSessions = async (): Promise<any> => {
  const response = await api.get('/admin/export/sessions');
  return response.data;
};

export const exportLog = async (): Promise<any> => {
  const response = await api.get('/admin/export/log');
  return response.data;
};

// Export UI to Figma helper
export const exportUIToFigma = async (elementId: string, filename: string = 'hrbot-ui.png') => {
  try {
    // This would require html-to-image library
    // For now, we'll create a placeholder implementation
    const node = document.getElementById(elementId);
    if (!node) {
      throw new Error('Element not found');
    }

    // Create a canvas and draw the element
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Canvas context not available');
    }

    // Get element dimensions
    const rect = node.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Convert element to image (simplified version)
    const data = `<svg xmlns="http://www.w3.org/2000/svg" width="${rect.width}" height="${rect.height}">
      <foreignObject width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml">
          ${node.outerHTML}
        </div>
      </foreignObject>
    </svg>`;

    const img = new Image();
    const svgBlob = new Blob([data], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    return new Promise((resolve, reject) => {
      img.onload = () => {
        context.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const downloadUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(downloadUrl);
            resolve(true);
          } else {
            reject(new Error('Failed to create blob'));
          }
        });
      };
      img.onerror = reject;
      img.src = url;
    });
  } catch (error) {
    console.error('Export failed:', error);
    throw error;
  }
};

// Design tokens export
export const exportDesignTokens = () => {
  const tokens = {
    colors: {
      primary: '#40C4FF',
      secondary: '#2196F3',
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#F44336',
      background: '#181c24',
      paper: '#1e2a44'
    },
    typography: {
      fontFamily: 'Arial, sans-serif',
      fontSize: {
        small: '0.875rem',
        medium: '1rem',
        large: '1.25rem',
        xlarge: '1.5rem'
      }
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem'
    }
  };

  const blob = new Blob([JSON.stringify(tokens, null, 2)], { 
    type: 'application/json' 
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'design-tokens.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export default api; 