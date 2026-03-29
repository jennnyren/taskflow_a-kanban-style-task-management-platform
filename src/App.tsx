import { Header } from './components/Layout/Header'
import { Board }  from './components/Board/Board'

function App() {
  return (
    <div
      className="flex flex-col h-screen overflow-hidden"
      style={{ backgroundColor: '#0e0e14' }}
    >
      <Header />
      <Board />
    </div>
  )
}

export default App
