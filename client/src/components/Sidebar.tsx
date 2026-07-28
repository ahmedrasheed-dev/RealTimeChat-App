import { type ChangeEvent, type FC, useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext.js'
import { ChatContext } from '../../context/ChatContext.js'
import type { IUser } from '../types/user.types.js'
import assets from '../assets/assets.js'

const Sidebar: FC = () => {
    const authContext = useContext(AuthContext)
    if (!authContext) {
        throw new Error('AuthContext must be used within AuthProvider')
    }

    const chatContext = useContext(ChatContext)
    if (!chatContext) {
        throw new Error('ChatContext must be used within ChatProvider')
    }

    const { authUser, logout, onlineUsers } = authContext
    const { users, selectedUser, setSelectedUser, getMessages, unseenMessages, isUsersLoading } = chatContext
    const [search, setSearch] = useState('')
    const navigate = useNavigate()

    const filteredUsers = users.filter(
        (u) => u._id !== authUser?._id && u.fullName?.toLowerCase().includes(search.toLowerCase()),
    )

    const handleSelectUser = (user: IUser) => {
        setSelectedUser(user)
        getMessages(user._id)
    }

    return (
        <div
            className={`bg-[#120e26]/80 backdrop-blur-xl h-full min-h-0 flex flex-col border-r border-white/10 text-white overflow-hidden ${selectedUser ? 'max-md:hidden' : ''}`}
        >
            <div className='shrink-0 p-5 border-b border-white/5 flex flex-col gap-4'>
                <div className='flex justify-between items-center'>
                    <div className='flex items-center gap-3'>
                        <img src={assets.logo} alt='Snapit Logo' className='h-7 w-auto object-contain' />
                        <span className='text-[10px] uppercase tracking-widest font-semibold px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30'>
                            Live
                        </span>
                    </div>

                    <div className='relative group'>
                        <div className='flex items-center gap-2 p-1 rounded-full hover:bg-white/10 cursor-pointer transition-colors'>
                            <img
                                src={authUser?.profilePic || assets.avatar_icon}
                                alt='User Profile'
                                className='w-8 h-8 rounded-full object-cover ring-2 ring-violet-500/50'
                            />
                        </div>
                        <div className='absolute top-full right-0 mt-2 z-30 w-44 p-2 rounded-2xl bg-[#1d1736] border border-white/15 shadow-2xl backdrop-blur-2xl hidden group-hover:block animate-fade-in'>
                            <div className='px-3 py-2 border-b border-white/10 mb-1'>
                                <p className='text-xs font-semibold text-white truncate'>{authUser?.fullName}</p>
                                <p className='text-[11px] text-gray-400 truncate'>{authUser?.email}</p>
                            </div>
                            <p
                                onClick={() => navigate('/profile')}
                                className='cursor-pointer text-xs px-3 py-2 rounded-xl hover:bg-violet-500/20 hover:text-violet-300 transition-colors flex items-center gap-2'
                            >
                                👤 Edit Profile
                            </p>
                            <div className='my-1 border-t border-white/10' />
                            <p
                                onClick={() => logout()}
                                className='cursor-pointer text-xs px-3 py-2 rounded-xl hover:bg-red-500/20 hover:text-red-300 transition-colors flex items-center gap-2 text-red-400'
                            >
                                🚪 Logout
                            </p>
                        </div>
                    </div>
                </div>

                <div className='bg-white/6 focus-within:bg-white/10 focus-within:ring-2 focus-within:ring-violet-500/50 border border-white/10 rounded-2xl flex items-center gap-2 py-2.5 px-3.5 transition-all duration-200'>
                    <img src={assets.search_icon} alt='Search' className='w-3.5 h-3.5 opacity-60' />
                    <input
                        type='text'
                        value={search}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                        className='bg-transparent border-none outline-none text-white text-xs placeholder-gray-400 flex-1'
                        placeholder='Search conversations...'
                    />
                    {search && (
                        <button onClick={() => setSearch('')} className='text-xs text-gray-400 hover:text-white'>✕</button>
                    )}
                </div>
            </div>

            <div className='flex-1 min-h-0 overflow-y-auto p-3 space-y-1.5 scrollbar-thin'>
                <div className='px-2 py-1 flex items-center justify-between text-[11px] font-semibold tracking-wider text-gray-400 uppercase'>
                    <span>Messages</span>
                    <span className='bg-white/10 px-2 py-0.5 rounded-full text-white/80'>{filteredUsers.length}</span>
                </div>

                {isUsersLoading ? (
                    <div className='flex flex-col gap-2 pt-4'>
                        {[1, 2, 3, 4].map((n) => (
                            <div key={n} className='flex items-center gap-3 p-3 rounded-2xl bg-white/3 animate-pulse'>
                                <div className='w-10 h-10 rounded-full bg-white/10' />
                                <div className='flex-1 space-y-2'>
                                    <div className='h-3 bg-white/10 rounded w-2/3' />
                                    <div className='h-2 bg-white/5 rounded w-1/3' />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className='text-center py-10 text-gray-400 text-xs flex flex-col items-center gap-2'>
                        <span className='text-2xl'>🔍</span>
                        <p>No conversations found</p>
                    </div>
                ) : (
                    filteredUsers.map((user) => {
                        const isOnline = !!onlineUsers?.includes(user._id)
                        const unseenCount = unseenMessages[user._id] || 0
                        const isSelected = selectedUser?._id === user._id

                        return (
                            <div
                                key={user._id}
                                onClick={() => handleSelectUser(user)}
                                className={`relative flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all duration-200 border ${isSelected
                                    ? 'bg-gradient-to-r from-violet-600/30 to-indigo-600/20 border-violet-500/40 shadow-lg shadow-violet-950/40'
                                    : 'bg-transparent border-transparent hover:bg-white/5 hover:border-white/5'
                                    }`}
                            >
                                <div className='relative shrink-0'>
                                    <img
                                        src={user?.profilePic || assets.avatar_icon}
                                        alt={user.fullName}
                                        className={`w-11 h-11 rounded-full object-cover ring-2 ${isSelected ? 'ring-violet-400' : 'ring-white/10'
                                            }`}
                                    />
                                    {isOnline && <span className='absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#120e26] rounded-full shadow-[0_0_8px_#10b981]' />}
                                </div>

                                <div className='flex-1 min-w-0'>
                                    <div className='flex justify-between items-baseline mb-0.5'>
                                        <h3 className={`text-sm font-semibold truncate ${isSelected ? 'text-white' : 'text-gray-200'}`}>
                                            {user?.fullName}
                                        </h3>
                                    </div>
                                    <p className='text-xs text-gray-400 truncate flex items-center gap-1.5'>
                                        <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-gray-500'}`} />
                                        {isOnline ? 'Active now' : 'Offline'}
                                    </p>
                                </div>

                                {unseenCount > 0 && (
                                    <div className='shrink-0 min-w-5 h-5 px-1.5 flex justify-center items-center rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 text-white text-[11px] font-bold shadow-md shadow-violet-500/40 animate-pulse'>
                                        {unseenCount}
                                    </div>
                                )}
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}

export default Sidebar