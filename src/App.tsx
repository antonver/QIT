import Nav from "./components/Navigation.tsx";
import { BrowserRouter} from 'react-router-dom';
import {ThemeProvider} from "@mui/material/styles";
import baseTheme from "./themes/baseTheme.tsx";
import { useTelegram } from "./hooks/useTelegram.ts";

function App() {
  // Инициализируем Telegram
  useTelegram();

  return (
    <>       <ThemeProvider theme={baseTheme}> <BrowserRouter>
      <Nav></Nav>
    </BrowserRouter>
    </ThemeProvider>
    </>
  )
}

export default App
