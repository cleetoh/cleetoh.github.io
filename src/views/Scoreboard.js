import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase"; 
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase"; 
import Navigation from "./navibar";

export default function Scoreboard() {
  const [users, setUsers] = useState([]);
  const [user] = useAuthState(auth);

  useEffect(() => {
    const fetchUserScores = async () => {
      const querySnapshot = await getDocs(collection(db, "users"));
      const usersData = await Promise.all(querySnapshot.docs.map(async (doc) => {
        const userData = doc.data();
        // Find the display name for the current user
        const userDisplayName = userData.displayUsername; // or whatever your field is called
        const userPoints = userData.points || 0;

        return {
          id: doc.id,
          displayUsername: userDisplayName,
          points: userPoints,
        };
      }));

      // Filter users to include only those with display names
      const filteredUsers = usersData.filter(user => user.displayUsername);
      setUsers(filteredUsers);
    };

    if (user) {
      fetchUserScores();
    }
  }, [user]);

  return (
    <>
      <Navigation />
      <Container style={{ backgroundColor: "#f0f8ff", minHeight: "100vh", padding: "20px" }}>
        <h1 className="text-center mb-4">User Scores</h1>
        <Row>
          {users.map(({ id, displayUsername, points }) => (
            <Col key={id} sm={12} md={6} lg={4}>
              <Card className="mb-4">
                <Card.Body>
                  <Card.Title>{displayUsername}</Card.Title>
                  <Card.Text>
                    <strong>Points:</strong> {points}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
}
