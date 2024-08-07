import React, { useEffect, useState } from "react";
import { Navbar, Nav, Container } from "react-bootstrap";
import { useAuthState } from "react-firebase-hooks/auth";
import { signOut } from "firebase/auth";
import { auth } from "../firebase"; 
import { doc, getDoc } from "firebase/firestore"; 
import { db } from "../firebase"; 

const Navigation = () => {
  const [user] = useAuthState(auth);
  const [displayUsername, setDisplayUsername] = useState(""); 

  const handleSignOut = async () => {
    await signOut(auth);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const userDoc = doc(db, "users", user.uid); 
        const userData = await getDoc(userDoc);

        if (userData.exists()) {
          setDisplayUsername(userData.data().displayUsername); 
        } else {
          console.error("No such document!");
        }
      }
    };

    fetchUserData(); 
  }, [user]);

  return (
    <Navbar variant="light" bg="light">
      <Container style={{ backgroundColor: "lightblue" }}>
        <Navbar.Brand href="/" style={{ color: "black", fontFamily: "garamond" }}>
          Aashley's Chore Hub
        </Navbar.Brand>
        <Nav>
          {user && (
            <Nav.Link disabled style={{ color: "blue" }}>
              {displayUsername || "User"}
            </Nav.Link>
          )}
          {user && <Nav.Link onClick={handleSignOut}>Sign Out🚪</Nav.Link>}
        </Nav>
      </Container>
    </Navbar>
  );
};

export default Navigation;
