import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { ChatContext } from '../../context/ChatContext';
import assets from '../assets/assets';

const RightSidebar = () => {
    const { authUser, logout, onlineUsers } = useContext(AuthContext);
    const { selectedUser, messages } = useContext(ChatContext);

    // Displays selected user if chat is active, otherwise displays logged-in user (yourself)
    const userToDisplay = selectedUser || authUser;

    if (!userToDisplay) return null;

    const isOnline = selectedUser ? onlineUsers.includes(selectedUser._id) : true;

    // Extract image URLs from active conversation messages
    const mediaImages = selectedUser
        ? messages.filter((msg) => msg.image).map((msg) => msg.image)
        : [];

    return (
        <div className={`bg-[#8185B2]/10 text-white w-full relative overflow-y-scroll max-md:hidden`}>
            <div className='pt-16 flex flex-col items-center gap-2 text-xs font-light mx-auto'>
                <img src={userToDisplay?.profilePic || assets.avatar_icon} className='w-20 h-20 rounded-full object-cover' alt="" />
                <h1 className='px-10 text-xl font-medium mx-auto flex items-center gap-2 text-center'>
                    <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                    {userToDisplay?.fullName}
                </h1>
                <p className='px-10 mx-auto text-gray-300 text-center'>{userToDisplay?.bio || 'Hey there! I am using ChatApp.'}</p>
            </div>

            <hr className="border-[#ffffff50] my-4" />

            {/* Media Section */}
            <div className='px-5 text-xs'>
                <p className="font-semibold text-gray-300">Shared Media</p>
                <div className='mt-2 max-h-48 overflow-y-auto grid grid-cols-2 gap-3 p-1 scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-transparent scrollbar-rounded-full'>
                    {mediaImages.length > 0 ? (
                        mediaImages.map((url, index) => (
                            <div key={index} onClick={() => window.open(url, '_blank')} className='cursor-pointer rounded overflow-hidden border border-gray-700 h-20'>
                                <img src={url} alt="Shared media" className='w-full h-full object-cover' />
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 text-xs col-span-2 py-2">
                            {selectedUser ? "No media shared yet" : "Select a chat to view media"}
                        </p>
                    )}
                </div>
            </div>

            <button
                onClick={logout}
                className='absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-400 to-violet-600 text-white border-none text-sm font-light py-2 px-20 rounded-full cursor-pointer hover:opacity-90 transition-opacity'
            >
                Logout
            </button>
        </div>
    );
};

export default RightSidebar;