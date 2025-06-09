import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [mensaje, setMensaje] = useState('');

    useEffect(() => {
      fetch('http://localhost:8081/api/hello')
        .then(res => res.text())
        .then(data => setMensaje(data))
        .catch(err => console.error('Error al llamar al backend:', err));
    }, []);

    return (
      <div>
        <h1>Frontend React</h1>
        <p>{mensaje}</p>
      </div>
    );
  }


export default App
