import { createContext, useContext, useState } from "react"

const AuthContext = createContext(null)

function AuthProvider({ children }) {
  const [token, setToken] = useState(
    () => localStorage.getItem("hostelops_token")
  )

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("hostelops_user")

    return savedUser ? JSON.parse(savedUser) : null
  })

  const login = (accessToken, userData) => {
    localStorage.setItem("hostelops_token", accessToken)
    localStorage.setItem("hostelops_user", JSON.stringify(userData))

    setToken(accessToken)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem("hostelops_token")
    localStorage.removeItem("hostelops_user")

    setToken(null)
    setUser(null)
  }

  const isAuthenticated = Boolean(token)

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider")
  }

  return context
}

export { AuthProvider, useAuth }