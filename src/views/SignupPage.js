import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore"; 
import React, { useState } from "react";
import { Button, Container, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase"; 

export default function SignUpPage() {
  const [email, setEmail] = useState(""); 
  const [displayUsername, setDisplayUsername] = useState(""); 
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  return (
    <Container style={{ 
      backgroundColor: "#f0f8ff",
      minHeight: "100vh", 
      padding: "20px",
    }}>      
      <h1 className="my-3">Sign up for an account</h1>
      <Form>
        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Label>Email address</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter email"
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
          />
          <Form.Text className="text-muted">
            We'll never share your email with anyone else.
          </Form.Text>
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicDisplayUsername">
          <Form.Label>Display Username</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter your display username"
            value={displayUsername}
            onChange={(e) => setDisplayUsername(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="my-3" controlId="formConfirmPassword">
          <Form.Label>Confirm Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </Form.Group>

        <a href="/login">Have an existing account? Login here.</a>

        <Button 
          variant="primary"
          onClick={async (e) => {
            e.preventDefault();
            setError("");

            const canSignup = email && displayUsername && password && password === confirmPassword;
            if (canSignup) {
              try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                await setDoc(doc(db, "users", user.uid), {
                  displayUsername: displayUsername,
                  email: email
                });

                navigate("/");
              } catch (error) {
                setError(error.message);
              }
            } else {
              setError("Please fill in all fields and ensure passwords match.");
            }
          }}
        > 
          Sign Up
        </Button>
      </Form>
      <p className="text-danger">{error}</p> 
    </Container>
  );
}
