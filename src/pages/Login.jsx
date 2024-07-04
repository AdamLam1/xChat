import { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { Input, Button, Card, CardBody, CardHeader, Divider } from "@nextui-org/react";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full p-4 overflow-hidden">
      <Card className="w-full max-w-md">
        <CardHeader className="flex gap-3">
          <h1 className="text-2xl font-bold">{isLogin ? 'Login' : 'Sign Up'}</h1>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleAuth} className="space-y-4">
            <Input
              type="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button color="primary" type="submit" className="w-full">
              {isLogin ? 'Login' : 'Sign Up'}
            </Button>
          </form>
          
          <Divider className="my-4" />
          
          <Button 
            color="secondary" 
            variant="flat" 
            onClick={handleGoogleSignIn}
            className="w-full"
          >
            Sign in with Google
          </Button>
          
          <p className="mt-4 text-center">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <Button
              color="primary" 
              variant="light"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? 'Sign Up' : 'Login'}
            </Button>
          </p>
        </CardBody>
      </Card>
    </div>
  );
};

export default Login;