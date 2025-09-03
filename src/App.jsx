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
import IntroPages from './pages/IntroPages'

function App() {
	// === Состояния ===
	const [user, setUser] = useState(null)
	const [loading, setLoading] = useState(true)
	const [showIntro, setShowIntro] = useState(false)

	// Инициализируем с определенными значениями, а не пустыми строками
	const [activeTab, setActiveTab] = useState('login')
	const [showPassword, setShowPassword] = useState(false)
	const [error, setError] = useState('')
	const [success, setSuccess] = useState('')
	const [fieldErrors, setFieldErrors] = useState({})
	const [isVisible, setIsVisible] = useState(false)

	// Убеждаемся, что все поля имеют определенные значения
	const [loginData, setLoginData] = useState({
		email: '',
		password: '',
	})

	const [registerData, setRegisterData] = useState({
		firstName: '',
		lastName: '',
		username: '',
		email: '',
		password: '',
	})

	const URL = 'https://kiymeshek.uz/'

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

	// Функция получения и сохранения данных пользователя
	const fetchAndSetUser = async token => {
		try {
			const response = await axios.get(`${URL}testa2/profile`, {
				headers: { Authorization: `Bearer ${token}` },
			})
			const fullUserData = response.data.user

			// 1. Сохраняем полные данные в state
			setUser(fullUserData)
			// 2. Сохраняем полные данные в localStorage
			localStorage.setItem('user', JSON.stringify(fullUserData))

			return true
		} catch (err) {
			console.error('Failed to fetch profile:', err)
			// Если проблема с токеном, очищаем все данные
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
				// Получаем полные данные и обновляем localStorage
				await fetchAndSetUser(token)
			}
			setLoading(false)
		}

		checkAuth()
		setIsVisible(true)
	}, [])

	// Функция выхода
	const handleLogout = async () => {
		try {
			const token = localStorage?.getItem?.('token')
			if (token) {
				await axios.post(`${URL}testa2/logout`, null, {
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
			// Сбрасываем формы к начальным значениям
			setLoginData({ email: '', password: '' })
			setRegisterData({
				firstName: '',
				lastName: '',
				username: '',
				email: '',
				password: '',
			})
		}
	}

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
			const loginResponse = await axios.post(`${URL}testa2/login`, loginData)
			const token = loginResponse.data.token
			localStorage.setItem('token', token)

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
			await axios.post(`${URL}testa2/register`, {
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

			setRegisterData({
				firstName: '',
				lastName: '',
				username: '',
				email: '',
				password: '',
			})
		} catch (err) {
			setError(err.response?.data?.message || "Ro'yxatdan o'tishda xatolik.")
		} finally {
			setLoading(false)
		}
	}

	const validateEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

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
					<Route path='/' element={<HomePage handleLogout={handleLogout} url={URL} />} />
					<Route
						path='/profile'
						element={<ProfilePage user={user} handleLogout={handleLogout} />}
					/>
					<Route path='/store' element={<StorePage />} />
					<Route path='/positions' element={<PositionsPage url={URL} />} />
					<Route path='/quiz' element={<QuizPage url={URL} />} />
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
