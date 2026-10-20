import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store/store.ts'
import './index.css'
import App from './App.tsx'
import SearchPage from './pages/SearchPage.tsx'
import ContactUs from './pages/ContactUs.tsx'
import LoginPage from './pages/loginPage.tsx'
import RegisterPage from './pages/registerPage.tsx'
import FindAgents from './pages/FindAgents.tsx'
import MyOpenHouses from './pages/MyOpenHouses.tsx'
import SavedProperties from './pages/SavedProperties.tsx'
import ProtectedRoute from './components/ProtectedRoute.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />}>
            <Route
              index
              element={
                <ProtectedRoute>
                  <SearchPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="agents"
              element={
                <ProtectedRoute>
                  <FindAgents />
                </ProtectedRoute>
              }
            />
            <Route
              path="my-open-houses"
              element={
                <ProtectedRoute>
                  <MyOpenHouses />
                </ProtectedRoute>
              }
            />
            <Route
              path="saved-properties"
              element={
                <ProtectedRoute>
                  <SavedProperties />
                </ProtectedRoute>
              }
            />
            <Route path="contact-us" element={<ContactUs />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)