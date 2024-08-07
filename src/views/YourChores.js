import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { collection, query, where, getDocs, updateDoc, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase"; // Ensure this imports your Firestore setup
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase"; // Ensure this imports your Firebase authentication setup
import Navigation from "./navibar";
import { Badge } from "react-bootstrap";

export default function YourChores() {
  const [chores, setChores] = useState([]);
  const [user] = useAuthState(auth); // Get the currently authenticated user
  const [displayName, setDisplayName] = useState("");

  const fetchUserChores = async () => {
    if (user) {
      console.log("Fetching chores for:", displayName);
      const choresRef = collection(db, "chores");
      const q = query(choresRef, where("assignedto", "==", displayName));
      const querySnapshot = await getDocs(q);
      const userChores = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log("User's Chores:", userChores);
      setChores(userChores);
    } else {
      console.error("No user is authenticated.");
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        // Fetch the user's display name
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          setDisplayName(userDoc.data().displayUsername); // Assuming 'displayUsername' is the field in Firestore
        } else {
          console.error("No such document!");
        }
      }
    };

    fetchUserData();
  }, [user]);

  useEffect(() => {
    fetchUserChores();
  }, [user, displayName]); // Include displayName in the dependency array

  const handleCompleteChore = async (choreId, points) => {
    // Mark the chore as completed
    const choreRef = doc(db, "chores", choreId);
    await updateDoc(choreRef, { status: "Completed" });

    // Update user points in the users collection
    if (user) {
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);
      const currentPoints = userDoc.data().points || 0; // Ensure to default to 0 if points do not exist
      await updateDoc(userRef, {
        points: currentPoints + points // Add points to existing points
      });
    }

    // Fetch updated chores
    fetchUserChores(); // Re-fetch to get updated data
  };

  const renderChores = () => {
    return chores.map(chore => (
      <Col key={chore.id} sm={12} md={6} lg={4}>
        <ChoreCard 
          chore={chore} 
          onCompleteChore={handleCompleteChore} 
        />
      </Col>
    ));
  };

  return (
    <>
      <Navigation />
      <Container style={{ backgroundColor: "#f0f8ff", minHeight: "100vh", padding: "20px" }}>
        <h1 className="text-center mb-4">Your Assigned Chores</h1>
        {chores.length === 0 ? (
          <h2 className="text-center">No assigned chores found.</h2>
        ) : (
          <Row>
            {renderChores()}
          </Row>
        )}
      </Container>
    </>
  );
}

function ChoreCard({ chore, onCompleteChore }) {
  const { chorename, choredescription, assignedto, duedate, status, priority, points } = chore;

  const handleCompleteChore = () => {
    onCompleteChore(chore.id, points);
  };

  const chorePriority = priority || "medium"; 

  let priorityColor;
  switch (chorePriority.toLowerCase()) {
    case 'high':
      priorityColor = 'danger'; 
      break;
    case 'medium':
      priorityColor = 'warning'; 
      break;
    case 'low':
      priorityColor = 'success'; 
      break;
    default:
      priorityColor = 'secondary'; 
  }

  return (
    <Card style={{
      width: "18rem",
      margin: "1rem",
      border: "3px solid black",
      borderRadius: "20px",
      backgroundColor: status.toLowerCase() === "completed" ? "#d4edda" : "#EFE0CD",
    }}>
      <Card.Body>
        <Card.Title>{chorename}</Card.Title>
        <Card.Text>
          <strong>Description:</strong> {choredescription} <br />
          <strong>Assigned To:</strong> {assignedto} <br />
          <strong>Due Date:</strong> {duedate} <br />
          <strong>Status:</strong> {status} <br />
          <strong>Priority:</strong> <Badge pill bg={priorityColor}>{chorePriority.charAt(0).toUpperCase() + chorePriority.slice(1)}</Badge> <br />
          <strong>Points:</strong> <Badge pill bg="dark">{points}</Badge> 
        </Card.Text>
        {status.toLowerCase() !== "completed" && (
          <Button variant="success" onClick={handleCompleteChore}>
            Mark as Completed
          </Button>
        )}
      </Card.Body>
    </Card>
  );
}
