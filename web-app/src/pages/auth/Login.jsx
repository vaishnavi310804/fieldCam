import React from 'react'
import LoginForm from "../../components/auth/LoginForm"


const Login = () => {
  return (
    <div className="min-h-screen bg-[#F8F7FF] flex">

      <div className="hidden lg:flex w-1/2 bg-[#8B5CF6] relative overflow-hidden">

      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-10">
        <LoginForm />
      </div>
    </div>
  );
}

export default Login
