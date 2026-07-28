import type { FC } from 'react'
import Sidebar from '../components/Sidebar'
import RightSidebar from '../components/RightSidebar'
import ChatContainer from '../components/ChatContainer'

const HomePage: FC = () => {
    return (
        <div className='relative w-full h-screen bg-[#0b0819] flex items-center justify-center p-0 sm:p-4 lg:p-6 overflow-hidden selection:bg-violet-500 selection:text-white'>
            <div className='absolute top-[-10%] left-[-5%] w-[450px] h-[450px] rounded-full bg-gradient-to-br from-violet-600/30 to-indigo-600/20 blur-[120px] pointer-events-none animate-float-glow' />
            <div
                className='absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-gradient-to-tl from-purple-600/25 to-pink-600/15 blur-[140px] pointer-events-none animate-float-glow'
                style={{ animationDelay: '-6s' }}
            />
            <div className='absolute top-[40%] right-[30%] w-[300px] h-[300px] rounded-full bg-blue-600/15 blur-[100px] pointer-events-none' />

            <div className='relative z-10 w-full h-full sm:h-[90vh] sm:max-h-[900px] max-w-[1440px] text-white backdrop-blur-2xl bg-[#141026]/75 border border-white/10 sm:rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] overflow-hidden grid grid-cols-1 md:grid-cols-[300px_1fr_280px] lg:grid-cols-[340px_1fr_320px]'>
                <Sidebar />
                <ChatContainer />
                <RightSidebar />
            </div>
        </div>
    )
}

export default HomePage