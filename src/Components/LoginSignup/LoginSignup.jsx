import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser, loginUser } from "../../services/authService";
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Alert from '@mui/material/Alert';
import Slide from '@mui/material/Slide';

// Icons
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

// Styled components - matching HomePage.jsx style
const PageWrapper = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #6930c3 0%, #5e60ce 50%, #6930c3 100%)',
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(2),
}));

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(3),
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
  maxWidth: 450,
  width: '100%',
  overflow: 'visible',
  position: 'relative',
}));

const CardHeader = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(90deg, #5e60ce 0%, #6930c3 100%)',
  borderRadius: '24px 24px 0 0',
  padding: theme.spacing(4, 3, 3),
  color: 'white',
  textAlign: 'center',
}));

const MainHeading = styled(Typography)(({ theme }) => ({
  fontSize: '2.5rem',
  fontWeight: 'bold',
  marginBottom: theme.spacing(1),
}));

const SubHeading = styled(Typography)(({ theme }) => ({
  fontSize: '1rem',
  opacity: 0.8,
}));

const FormSection = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(4, 3),
}));

const ActionButton = styled(Button)(({ theme, color }) => ({
  backgroundColor: color || '#ff9f1c',
  color: 'white',
  borderRadius: theme.spacing(5),
  padding: theme.spacing(1.5, 4),
  textTransform: 'none',
  fontWeight: 'bold',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  '&:hover': {
    backgroundColor: color ? color : '#f2a365',
    boxShadow: '0 6px 25px rgba(0, 0, 0, 0.15)',
  },
}));

const ToggleButton = styled(Button)(({ theme, active }) => ({
  backgroundColor: active ? '#6930c3' : 'transparent',
  color: active ? 'white' : '#6930c3',
  border: active ? 'none' : '2px solid #6930c3',
  borderRadius: theme.spacing(5),
  padding: theme.spacing(1, 3),
  textTransform: 'none',
  fontWeight: 'bold',
  flex: 1,
  '&:hover': {
    backgroundColor: active ? '#5e60ce' : 'rgba(105, 48, 195, 0.1)',
  },
}));

const InputWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(3),
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.spacing(2),
    '&.Mui-focused fieldset': {
      borderColor: '#6930c3',
    },
  },
}));

const ForgotPasswordText = styled(Typography)(({ theme }) => ({
  color: '#6930c3',
  fontSize: '0.9rem',
  textAlign: 'right',
  marginTop: theme.spacing(-1),
  marginBottom: theme.spacing(3),
  cursor: 'pointer',
  '&:hover': {
    textDecoration: 'underline',
  },
}));

const ToggleButtonGroup = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  marginTop: theme.spacing(3),
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 40,
  height: 40,
  borderRadius: '50%',
  backgroundColor: 'rgba(105, 48, 195, 0.1)',
  color: '#6930c3',
}));

const LoginSignup = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      if (isLogin) {
        const response = await loginUser(email, password);
        localStorage.setItem("user_id", response.user_id);
        localStorage.setItem("token", response.token);
        setMessage("Login successful!");
        setMessageType("success");
        console.log("Token:", response.token);
        console.log("User ID:", response.user_id);
        navigate("/home");
      } else {
        const response = await registerUser(email, password);
        setMessage("Registration successful!");
        setMessageType("success");
        if (response.user_id) {
          localStorage.setItem("user_id", response.user_id);
        }
      }

      setEmail("");
      setPassword("");
    } catch (err) {
      setMessage(err.error || "Something went wrong.");
      setMessageType("error");
    }

    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 4000);
  };

  return (
    <PageWrapper>
      <Container maxWidth="sm">
        <StyledCard>
          <CardHeader>
            <MainHeading variant="h1">
              {isLogin ? "Welcome Back" : "Create Account"}
            </MainHeading>
            <SubHeading variant="body1">
              {isLogin 
                ? "Login to access your pool game simulations" 
                : "Sign up to get started with our pool game analyser"}
            </SubHeading>
          </CardHeader>
          
          <FormSection>
            <form onSubmit={handleSubmit}>
              <InputWrapper>
                <IconWrapper>
                  <EmailIcon />
                </IconWrapper>
                <StyledTextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  variant="outlined"
                />
              </InputWrapper>
              
              <InputWrapper>
                <IconWrapper>
                  <LockIcon />
                </IconWrapper>
                <StyledTextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  variant="outlined"
                />
              </InputWrapper>
              

              
              <ActionButton
                type="submit"
                fullWidth
                startIcon={isLogin ? <LoginIcon /> : <PersonAddIcon />}
              >
                {isLogin ? "Login" : "Sign Up"}
              </ActionButton>
            </form>
            
            <ToggleButtonGroup>
              <ToggleButton 
                active={isLogin} 
                onClick={() => setIsLogin(true)}
              >
                Login
              </ToggleButton>
              <ToggleButton 
                active={!isLogin} 
                onClick={() => setIsLogin(false)}
              >
                Sign Up
              </ToggleButton>
            </ToggleButtonGroup>
          </FormSection>
        </StyledCard>
        
        {/* Notification Message */}
        <Slide direction="up" in={!!message} mountOnEnter unmountOnExit>
          <Alert 
            severity={messageType === "success" ? "success" : "error"}
            sx={{
              position: 'fixed',
              bottom: 24,
              left: '50%',
              transform: 'translateX(-50%)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
              borderRadius: 3,
              minWidth: 300
            }}
          >
            {message}
          </Alert>
        </Slide>
      </Container>
    </PageWrapper>
  );
};

export default LoginSignup;