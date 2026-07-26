import React, { useRef, useState, useEffect, useContext } from 'react'
import assets from '../assets/assets'
import { AuthContext } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom';


const ProfilePage = () => {
  const fileInputRef = useRef(null)
  const { authUser, updateProfile } = useContext(AuthContext)
  const [formData, setFormData] = useState({
    fullName: authUser.fullName,
    bio: authUser.bio,
    profilePic: null,
    previewUrl: ''
  })
  const [error, setError] = useState('')
  const navigate = useNavigate();

  useEffect(() => {
    if (!authUser) return
    setFormData((prev) => ({
      ...prev,
      fullName: authUser.fullName || '',
      bio: authUser.bio || '',
      previewUrl: authUser.profilePic || prev.previewUrl,
      profilePic: null
    }))
  }, [authUser])
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg']
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a PNG or JPG image.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result
      setError('')
      setFormData((prev) => ({
        ...prev,
        profilePic: dataUrl,
        previewUrl: dataUrl
      }))
    }
    reader.onerror = () => setError('Failed to read file')
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const payload = {
      fullName: formData.fullName,
      bio: formData.bio,
      profilePic: formData.profilePic || null
    }

    try {
      await updateProfile(payload)
      console.log('Profile saved:', payload)
      navigate('/')
      return;
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div
      className='min-h-screen flex items-center justify-center px-4 py-8 bg-cover bg-center bg-no-repeat'
      style={{ backgroundImage: `url(${assets.bgImage})` }}
    >
      <div className='w-full max-w-2xl backdrop-blur-2xl text-gray-300 border-2 border-gray-600 rounded-2xl flex items-center justify-between gap-6 p-6 max-sm:flex-col-reverse'>
        <form onSubmit={handleSubmit} className='flex-1 space-y-4'>
          <h3 className='text-xl font-medium'>Profile details</h3>
          <div className='space-y-2'>
            <label className='block text-sm'>Full Name</label>
            <input
              name='fullName'
              value={formData.fullName}
              onChange={handleChange}
              className='w-full rounded-md border border-gray-500 bg-white/10 px-3 py-2 outline-none'
              placeholder='Your name'
            />
          </div>
          <div className='space-y-2'>
            <label className='block text-sm'>Bio</label>
            <textarea
              name='bio'
              value={formData.bio}
              onChange={handleChange}
              className='w-full rounded-md border border-gray-500 bg-white/10 px-3 py-2 outline-none'
              rows='4'
              placeholder='Tell us about yourself'
            />
          </div>
          <button type='submit' className='rounded-full bg-violet-600 px-5 py-2 text-sm font-medium text-white'>Save</button>
        </form>

        <div className='flex flex-col items-center gap-3'>
          <img
            src={formData.previewUrl || assets.avatar_icon}
            alt='Profile avatar'
            className='h-24 w-24 rounded-full border border-gray-500 object-cover'
          />
          <input
            ref={fileInputRef}
            type='file'
            accept='.png,.jpg,.jpeg'
            onChange={handleFileChange}
            className='hidden'
          />
          <button
            type='button'
            onClick={() => fileInputRef.current?.click()}
            className='rounded-full border border-gray-500 px-4 py-2 text-sm text-white'
          >
            Upload photo
          </button>
          {error && <p className='text-xs text-red-400'>{error}</p>}
        </div>
      </div>
    </div>
  )
}

export default ProfilePage