import { type FC, useContext } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage.js'
import LoginPage from './pages/LoginPage.js'
import ProfilePage from './pages/ProfilePage.js'
import { Toaster } from 'react-hot-toast'
import { AuthContext } from '../context/AuthContext.js'

const App: FC = () => {
    const authContext = useContext(AuthContext)
    if (!authContext) {
        throw new Error('AuthContext must be used within AuthProvider')
    }

    const { authUser } = authContext

    return (
        <div className='bg-[url("./src/assets/bgImage.svg")] bg-contain'>
            <Toaster />
            <Routes>
                <Route path='/' element={authUser ? <HomePage /> : <Navigate to='/login' />} />
                <Route path='/login' element={!authUser ? <LoginPage /> : <Navigate to='/' />} />
                <Route path='/profile' element={authUser ? <ProfilePage /> : <Navigate to='/login' />} />
            </Routes>
        </div>
    )
}

export default App