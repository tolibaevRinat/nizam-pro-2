import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'

import Header from './components/Header'
import Footer from './components/Footer'
import AuthPage from './pages/AuthPage'
import HomePage from './pages/HomePage'
import ProfilePage from './pages/ProfilePage'
import StorePage from './pages/StorePage'
import ProtectedRoute from './components/ProtectedRoute'
import Loader from './components/Loader'
import PositionsPage from './pages/PositionsPage'
import QuizPage from './pages/QuizPage'
import IntroPages from './pages/IntroPages' // Новый компонент

function App() {
	// === Состояния ===
	const [user, setUser] = useState(null)
	const [loading, setLoading] = useState(true)
	const [showIntro, setShowIntro] = useState(false) // Новое состояние

	// ... (остальные state'ы остаются без изменений)
	const [activeTab, setActiveTab] = useState('login')
	const [showPassword, setShowPassword] = useState(false)
	const [error, setError] = useState('')
	const [success, setSuccess] = useState('')
	const [fieldErrors, setFieldErrors] = useState({})
	const [isVisible, setIsVisible] = useState(false)
	const [loginData, setLoginData] = useState({ email: '', password: '' })
	const [registerData, setRegisterData] = useState({
		firstName: '',
		lastName: '',
		username: '',
		email: '',
		password: '',
	})

	const navigate = useNavigate()

	// Функция для проверки первого визита
	const checkFirstVisit = () => {
		const hasVisited = localStorage.getItem('hasVisitedBefore')
		const token = localStorage.getItem('token')

		// Показываем intro только если пользователь впервые заходит и не авторизован
		if (!hasVisited && !token) {
			setShowIntro(true)
		}
	}

	// Функция завершения intro
	const handleIntroComplete = () => {
		setShowIntro(false)
		localStorage.setItem('hasVisitedBefore', 'true')
		navigate('/auth')
	}

	// Фoydalanuvчining to'liq ma'lumotini olish va saqlash uchun yordamchi funksiya
	const fetchAndSetUser = async token => {
		try {
			const response = await axios.get('https://kiymeshek.uz/testa2/profile', {
				headers: { Authorization: `Bearer ${token}` },
			})
			const fullUserData = response.data.user

			// 1. To'liq ma'lumotni state'ga o'rnatish
			setUser(fullUserData)
			// 2. To'liq ma'lumotni localStorage'ga saqlash
			localStorage.setItem('user', JSON.stringify(fullUserData))

			return true
		} catch (err) {
			console.error('Failed to fetch profile:', err)
			// Agar tokenda muammo bo'lsa, barcha ma'lumotlarni tozalash
			localStorage.removeItem('token')
			localStorage.removeItem('user')
			setUser(null)
			return false
		}
	}

	useEffect(() => {
		const checkAuth = async () => {
			// Сначала проверяем первый визит
			checkFirstVisit()

			const token = localStorage.getItem('token')
			if (token) {
				// To'liq ma'lumotni olib, localStorage'ni yangilaymiz
				await fetchAndSetUser(token)
			}
			setLoading(false)
		}

		checkAuth()
		setIsVisible(true)
	}, []) // Bir marta ishlaydi

	// Logout funksiyasi (o'zgarishsiz)
	const handleLogout = async () => {
		try {
			const token = localStorage?.getItem?.('token')
			if (token) {
				await axios.post('https://kiymeshek.uz/testa2/logout', null, {
					headers: {
						Authorization: `Bearer ${token}`,
						'Content-Type': 'application/json',
					},
				})
			}
		} catch (err) {
			console.error('Logout error:', err)
		} finally {
			localStorage.removeItem('token')
			localStorage.removeItem('user')
			setUser(null)
			setRegisterData({ username: '', firstname: '', lastname: '', email: '', password: '' })
		}
	}

	// ### ASOSIY O'ZGARISH: `handleLogin` FUNKSIYASI ###
	const handleLogin = async e => {
		e.preventDefault()
		setLoading(true)
		setError('')
		setSuccess('')
		setFieldErrors({})

		if (!validateEmail(loginData.email)) {
			setFieldErrors({ email: "Email formati noto'g'ri" })
			setLoading(false)
			return
		}

		try {
			// 1. Login qilib, tokenni olamiz
			const loginResponse = await axios.post('https://kiymeshek.uz/testa2/login', loginData)
			const token = loginResponse.data.token
			localStorage.setItem('token', token)

			// 2. Olingan token bilan to'liq foydalanuvchi ma'lumotini (/profile'dan) olamiz
			const success = await fetchAndSetUser(token)

			if (success) {
				setSuccess('Muvaffaqiyatli kirdingiz!')
				setTimeout(() => setLoginData({ email: '', password: '' }), 1000)
			} else {
				setError("Kirish muvaffaqiyatli, lekin profilni yuklab bo'lmadi.")
			}
		} catch (err) {
			setError(err.response?.data?.message || "Kirish xatoligi. Ma'lumotlarni tekshiring.")
		} finally {
			setLoading(false)
		}
	}

	// Register funksiyasi (o'zgarishsiz)
	const handleRegister = async e => {
		e.preventDefault()
		setLoading(true)
		setError('')
		setSuccess('')
		setFieldErrors({})

		const errors = {}
		if (registerData.firstName.length < 2) errors.firstName = 'Ism juda qisqa'
		if (registerData.lastName.length < 2) errors.lastName = 'Familiya juda qisqa'
		if (!validateEmail(registerData.email)) errors.email = "Email formati noto'g'ri"
		if (registerData.password.length < 6)
			errors.password = "Parol kamida 6 ta belgidan iborat bo'lishi kerak"

		if (Object.keys(errors).length > 0) {
			setFieldErrors(errors)
			setLoading(false)
			return
		}

		try {
			await axios.post('https://kiymeshek.uz/testa2/register', {
				username: registerData.username,
				email: registerData.email,
				password: registerData.password,
			})
			const tempUserData = {
				firstName: registerData.firstName,
				lastName: registerData.lastName,
			}
			localStorage.setItem('tempUser', JSON.stringify(tempUserData))

			setSuccess("Ro'yxatdan o'tdingiz! Endi kirishingiz mumkin.")
			setTimeout(() => {
				setActiveTab('login')
				setSuccess('')
			}, 2000)

			setRegisterData({ firstName: '', lastName: '', username: '', email: '', password: '' })
		} catch (err) {
			setError(err.response?.data?.message || "Ro'yxatdan o'tishda xatolik.")
		} finally {
			setLoading(false)
		}
	}

	const validateEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

	// Показываем intro страницы если нужно
	if (showIntro) {
		return <IntroPages onComplete={handleIntroComplete} />
	}

	if (loading && !user) {
		return <Loader />
	}

	return (
		<>
			{user && <Header handleLogout={handleLogout} />}

			<Routes>
				<Route element={<ProtectedRoute user={user} />}>
					<Route path='/' element={<HomePage handleLogout={handleLogout} />} />
					<Route
						path='/profile'
						element={<ProfilePage user={user} handleLogout={handleLogout} />}
					/>
					<Route path='/store' element={<StorePage />} />
					<Route path='/positions' element={<PositionsPage />} />
					<Route path='/quiz' element={<QuizPage />} />
				</Route>

				<Route
					path='/auth'
					element={
						user ? (
							<Navigate to='/' replace />
						) : (
							<AuthPage
								activeTab={activeTab}
								setActiveTab={setActiveTab}
								showPassword={showPassword}
								setShowPassword={setShowPassword}
								loading={loading}
								error={error}
								success={success}
								fieldErrors={fieldErrors}
								setFieldErrors={setFieldErrors}
								loginData={loginData}
								setLoginData={setLoginData}
								registerData={registerData}
								setRegisterData={setRegisterData}
								isVisible={isVisible}
								handleLogin={handleLogin}
								handleRegister={handleRegister}
								validateEmail={validateEmail}
							/>
						)
					}
				/>
			</Routes>

			{user && <Footer />}
		</>
	)
}

export default App
