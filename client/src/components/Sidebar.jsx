import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ChatContext } from '../../context/ChatContext';
import assets from '../assets/assets';

const Sidebar = () => {
    const { authUser, logout, onlineUsers } = useContext(AuthContext);
    const { users, selectedUser, setSelectedUser, getMessages, unseenMessages, isUsersLoading } = useContext(ChatContext);
    const [search, setSearch] = useState('');
    const navigate = useNavigate();

    // Filter users based on search text and exclude logged in user
    const filteredUsers = users.filter((u) =>
        u._id !== authUser?._id && u.fullName?.toLowerCase().includes(search.toLowerCase())
    );

    // Handle user selection
    const handleSelectUser = (user) => {
        setSelectedUser(user);
        getMessages(user._id); // Fetch message history & clear unseen badge
    };

    return (
        <div className={`bg-[#8185B2]/10 h-full p-5 rounded-r-xl overflow-y-scroll overflow-x-hidden text-white ${selectedUser ? "max-md:hidden" : ''}`}>
            <div className="pb-5">
                {/* Top bar with logo and menu */}
                <div className="flex justify-between items-center">
                    <img src={assets.logo} alt="Logo" className="max-w-40" />
                    <div className="relative py-2 group">
                        <img src={assets.menu_icon} alt="menu" className="max-h-5 cursor-pointer" />
                        <div className='absolute top-full right-0 z-20 w-32 p-5 rounded-md bg-[#282142] border border-gray-600 text-gray-100 hidden group-hover:block'>
                            <p onClick={() => navigate('/profile')} className='cursor-pointer text-sm'>Edit Profile</p>
                            <hr className="my-2 border-t border-gray-500" />
                            <p onClick={() => logout()} className='cursor-pointer text-sm'>Logout</p>
                        </div>
                    </div>
                </div>

                {/* Search box */}
                <div className='bg-[#282142] rounded-full flex items-center gap-2 py-3 px-4 mt-5'>
                    <img src={assets.search_icon} alt="Search" className="w-3" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className='bg-transparent border-none outline-none text-white text-xs placeholder-[#c8c8c8] flex-1'
                        placeholder="Search User.."
                    />
                </div>

                {/* User list */}
                <div className="flex flex-col mt-3">
                    {isUsersLoading ? (
                        <p className="text-gray-400 text-xs text-center py-4">Loading users...</p>
                    ) : filteredUsers.length === 0 ? (
                        <p className="text-gray-400 text-xs text-center py-4">No users found</p>
                    ) : (
                        filteredUsers.map((user) => {
                            const isOnline = onlineUsers.includes(user._id);
                            const unseenCount = unseenMessages[user._id] || 0;

                            return (
                                <div
                                    key={user._id}
                                    onClick={() => handleSelectUser(user)}
                                    className={`relative flex items-center gap-2 p-2 pl-4 rounded cursor-pointer max-sm:text-sm ${selectedUser?._id === user._id ? 'bg-[#282142]/50' : ''}`}
                                >
                                    <img src={user?.profilePic || assets.avatar_icon} alt={user.fullName} className="w-9 h-9 rounded-full object-cover" />
                                    <div className="flex flex-col leading-5">
                                        <p className="font-medium text-sm">{user?.fullName}</p>
                                        <span className={`text-xs ${isOnline ? 'text-green-500' : 'text-neutral-500'}`}>
                                            {isOnline ? 'Online' : 'Offline'}
                                        </span>
                                    </div>

                                    {/* Unseen count badge */}
                                    {unseenCount > 0 && (
                                        <p className='absolute top-4 right-4 text-xs h-5 w-5 flex justify-center items-center rounded-full bg-violet-500 text-white font-bold'>
                                            {unseenCount}
                                        </p>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default Sidebar;