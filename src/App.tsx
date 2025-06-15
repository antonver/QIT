import Nav from "./components/Navigation.tsx";
import { BrowserRouter} from 'react-router-dom';

function App() {

  return (
    <>        <BrowserRouter>
      <Nav></Nav>
    </BrowserRouter>
    </>
  )
}

export default App
