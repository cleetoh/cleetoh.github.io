import logo from './logo.svg';
import './App.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import LoginPage from './views/LoginPage';
import SignUpPage from './views/SignupPage';
import HomePage from './views/HomePage';
import AddChore from './views/AddChore';
import YourChores from './views/YourChores';
import Scoreboard from './views/Scoreboard';

function App() {

  const router = createBrowserRouter([
    {path: "/", element: <HomePage />},
    {path: "/login", element: <LoginPage />},
    {path: "/signup", element: <SignUpPage />},
    {path: "/addchore", element: <AddChore />},
    {path: "/yourchores", element: <YourChores />},
    {path: "/scoreboard", element: <Scoreboard />},
  ])

  return (
    <RouterProvider router={router} />
  );
}

export default App;
