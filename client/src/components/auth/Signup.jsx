import { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import GoogleLoginButton from './GoogleLogin';

import './Signup.Styles.css';
import Input from '../Input/Input';
import { FaEye } from 'react-icons/fa';
import Button from '../Button/Button';

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false)

  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const { success, error } = await register(formData);

    if (success) {
      setSuccess('Registration successful! Please check your email to verify your account. You should receive the verification email shortly.');
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: ''
      });
    } else {
      setError(error.message || 'Registration failed');
    }
  };

  return (
    <div className='signup-container'>
      <h2 className='heading'>Start to Style</h2>
      <p className='sub-heading'>Please Fill Your Details To SignUp</p>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}

      <form onSubmit={handleSubmit}>
        <Input
          name="firstName"
          label="First Name"
          value={formData.firstName}
          onChange={handleChange}
          placeholder='First Name'
          required
        />
        <Input
          name="lastName"
          label="Last Name"
          value={formData.lastName}
          onChange={handleChange}
          placeholder='Last Name'
          required
        />
        <Input
          name="email"
          label="Email"
          value={formData.email}
          onChange={handleChange}
          placeholder='Email'
          required
        />
        <Input
          name="password"
          label="Password"
          type={passwordVisible ? "text" :"password"}
          icon={<FaEye onClick={() => setPasswordVisible(prev => !prev)} />}
          iconPosition='right'
          value={formData.password}
          onChange={handleChange}
          placeholder='Password'
          required
        />
        <Input
          name="phone"
          label="Phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder='Phone Number'
          required
        />
        <Button type="submit">Register</Button>
      </form>

      <div className='or'>
        <hr />
        <span>Or</span>
      </div>
      
      <GoogleLoginButton />
      <p className='others text'>
        <Link to='/auth/register'>Sign Up</Link>
        <Link to='/pages/termsandconditions'>Terms</Link>
      </p>
    </div>
  );
};

export default Signup;