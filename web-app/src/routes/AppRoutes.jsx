import React from 'react'
import { Routes, Route, Navigate } from "react-router-dom";
import Login from '../pages/auth/Login';

const AppRoutes = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Login />} />
      </Routes>
    </div>
  )
}

export default AppRoutes
