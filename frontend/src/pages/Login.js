import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');   
  const [password, setPassword] = useState('');
  const navigate = useNavigate();  

  const handleLogin = (e) => {   
    e.preventDefault();  
    if (email === 'Admin@gmail.com' && password === 'Admin@123') {     
      alert('Login Successful!');
        navigate('/company'); ;
    } else {
      alert('wrong email or password');
    } 
  };    
    
  return (
    // d-flex, justify-content-center, vh-100: Ye Login box ko screen ke bilkul center me rakhte hain (mobile ho ya desktop).
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      
      <div className="card p-4 shadow-sm" style={{ width: '100%', maxWidth: '400px' }}>
        
        <h3 className="text-center mb-4">Login</h3>
        
        <form onSubmit={handleLogin}>
          
          <div className="mb-3">          
            <input 
              type="email" 
              className="form-control" 
              placeholder="ID" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          
          <div className="mb-3">
            <input 
              type="password" 
              className="form-control" 
              placeholder="Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            /> 
          </div>
          
          {/* btn-primary: Blue button. w-100: Button ko puri width dene ke liye (mobile par click karna aasan hota hai). */}
          <button type="submit" className="btn btn-primary w-100">Login</button>
          
        </form>
      </div>
    </div> 
  );
}

export default Login;