import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase"; 
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase"; 
import Navigation from "./navibar";
import { FaCrown } from 'react-icons/fa'; 

export default function Scoreboard() {
  const [users, setUsers] = useState([]);
  const [user] = useAuthState(auth);

  useEffect(() => {
    const fetchUserScores = async () => {
      const querySnapshot = await getDocs(collection(db, "users"));
      const usersData = [];

      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        const userDisplayName = userData.displayUsername;
        const userPoints = userData.points || 0;

        if (userDisplayName) {
          usersData.push({
            id: doc.id,
            displayUsername: userDisplayName,
            points: userPoints,
          });
        }
      });

      usersData.sort((a, b) => b.points - a.points);

      setUsers(usersData); 
    };

    if (user) {
      fetchUserScores();
    }
  }, [user]);

  const topUser = users.length > 0 ? users[0] : null;

  return (
    <>
      <Navigation />
      <Container style={{ backgroundColor: "#d9be66", minHeight: "100vh", padding: "20px" }}>
        <h1 className="text-center mb-4" style={{fontFamily: "fantasy", outline: "5px solid #d966be"}}>Rankings</h1>
        <Row>
          {users.map(({ id, displayUsername, points }) => (
            <Col key={id} xs={12} className="mb-4"> 
              <Card 
                className="w-100" 
                style={{
                  backgroundColor: topUser && topUser.id === id ? "#4d6fa3" : "#a1a2f0", 
                  border: topUser && topUser.id === id ? "3px solid #e1f533" : "none", 
                  position: "relative" 
                }}
              >
                <Card.Body>
                  <Card.Title>{displayUsername}</Card.Title>
                  <Card.Text>
                    <strong>Points:</strong> {points}
                  </Card.Text>
                  {topUser && topUser.id === id && (
                    <FaCrown style={{
                      position: "absolute", 
                      top: "10px", 
                      right: "10px", 
                      fontSize: "24px", 
                      color: "#ffd700" 
                    }} />
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
}
