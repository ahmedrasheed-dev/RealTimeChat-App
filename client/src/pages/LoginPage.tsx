import { type ChangeEvent, type FC, type FormEvent, useContext, useState } from 'react'
import assets from '../assets/assets.js'
import { AuthContext } from '../../context/AuthContext.js'

const LoginPage: FC = () => {
    const [currState, setCurrState] = useState('Sign up')
    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [bio, setBio] = useState('')
    const [isDataSubmitted, setIsDataSubmitted] = useState(false)

    const authContext = useContext(AuthContext)
    if (!authContext) {
        throw new Error('AuthContext must be used within AuthProvider')
    }

    const { login } = authContext

    const onSubmitHandler = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (currState === 'Sign up' && !isDataSubmitted) {
            setIsDataSubmitted(true)
            return
        }

        login(currState === 'Sign up' ? 'signup' : 'login', {
            fullName,
            email,
            password,
            bio,
        })
    }

    return (
        <div>
            <div className='min-h-screen bg-cover bg-center flex items-center justify-center gap-8 sm:justify-evenly max-sm:flex-col backdrop-blur-2xl'>
                <img src={assets.logo_big} alt='' className='w-[min(10vw,200px)] h-20' />

                <form
                    onSubmit={onSubmitHandler}
                    className='border-2 bg-white/8 text-white border-gray-500 p-6 flex flex-col gap-6 rounded-lg shadow-lg'
                >
                    <h2 className='font-medium text-2xl flex justify-between items-center'>
                        {currState}
                        {isDataSubmitted && (
                            <img
                                src={assets.arrow_icon}
                                alt=''
                                onClick={() => setIsDataSubmitted(false)}
                                className='w-5 cursor-pointer'
                            />
                        )}
                    </h2>

                    {currState === 'Sign up' && !isDataSubmitted && (
                        <input
                            type='text'
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setFullName(e.target.value)}
                            className='p-2 border border-gray-500 rounded-md focus:outline-none'
                            placeholder='Full Name'
                            required
                        />
                    )}

                    {!isDataSubmitted && (
                        <>
                            <input
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                                value={email}
                                type='email'
                                placeholder='Email Address'
                                required
                                className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
                            />

                            <input
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                                value={password}
                                type='password'
                                placeholder='Password'
                                required
                                className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
                            />
                        </>
                    )}

                    {currState === 'Sign up' && isDataSubmitted && (
                        <textarea
                            rows={4}
                            className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
                            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setBio(e.target.value)}
                            value={bio}
                            placeholder='provide a short bio ... '
                            required
                        />
                    )}

                    <button type='submit' className='py-3 bg-gradient-to-r from-purple-400 to-violet-600 text-white rounded-md cursor-pointer'>
                        {currState === 'Sign up' ? 'Create Account' : 'Login Now'}
                    </button>
                    <div className='flex items-center gap-2 text-sm text-gray-500'>
                        <input type='checkbox' />
                        <p>Agree to the terms of use & privacy policy.</p>
                    </div>

                    <div className='flex flex-col gap-2'>
                        {currState === 'Sign up' ? (
                            <p className='text-sm text-gray-600' onClick={() => { setCurrState('Login'); setIsDataSubmitted(false) }}>
                                Already have an account?
                                <span className='font-medium text-violet-500 cursor-pointer'> Login here</span>
                            </p>
                        ) : (
                            <p className='text-sm text-gray-600' onClick={() => setCurrState('Sign up')}>
                                Create an account
                                <span className='font-medium text-violet-500 cursor-pointer'> Click here</span>
                            </p>
                        )}
                    </div>
                </form>
            </div>
        </div>
    )
}

export default LoginPage