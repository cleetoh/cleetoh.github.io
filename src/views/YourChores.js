import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Dropdown, Badge } from "react-bootstrap";
import { collection, query, where, getDocs, updateDoc, doc, getDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";
import Navigation from "./navibar";
import { formatDate } from "./HomePage";
import { useNavigate } from "react-router-dom";

export default function YourChores() {
  const [chores, setChores] = useState([]);
  const [user] = useAuthState(auth);
  const [displayName, setDisplayName] = useState("");
  const [sortBy, setSortBy] = useState("priority"); 
  const navigate = useNavigate(); 

  const fetchUserChores = async () => {
    if (user) {
      const choresRef = collection(db, "chores"); //chores collection in firebase
      const q = query(choresRef, where("assignedto", "==", displayName)); //get chores assigned to __
      const querySnapshot = await getDocs(q);
      const userChores = querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data() //map data to array
      })); 
      setChores(userChores);
    } else {
      console.error("No user is authenticated.");
    }
  };

  useEffect(() => { //display name
    const fetchUserData = async () => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          setDisplayName(userDoc.data().displayUsername);
        } else {
          console.error("No such document!");
        }
      }
    };

    fetchUserData();
  }, [user]); //run effect when user changes

  useEffect(() => {
    fetchUserChores();
  }, [user, displayName]); 

  const handleCompleteChore = async (choreId, points) => { //mark chore as complete; update points
    const choreRef = doc(db, "chores", choreId);
    await updateDoc(choreRef, { status: "Completed" });

    if (user) {
      const userRef = doc(db, "users", user.uid); //ref userdoc
      const userDoc = await getDoc(userRef); //fetch user doc
      const currentPoints = userDoc.data().points || 0; //fetch user pts
      await updateDoc(userRef, {
        points: currentPoints + points
      });
    }

    fetchUserChores(); //refresh on the spot
  };

  const handleDeleteChore = async (choreId) => { //delete
    await deleteDoc(doc(db, "chores", choreId));
    fetchUserChores(); 
  };

  const handleUpdateChore = (choreId) => { //navigate to updatechore
    navigate(`/updatechore/${choreId}`); 
  };

  const sortChores = (choresToSort) => {
    if (sortBy === "priority") {
      return choresToSort.sort((a, b) => {
        const priorityOrder = { high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority.toLowerCase()] - priorityOrder[b.priority.toLowerCase()];
      });
    } else if (sortBy === "date") {
      return choresToSort.sort((a, b) => new Date(a.duedate) - new Date(b.duedate));
    } else if (sortBy === "status") {
      return choresToSort.sort((a, b) => {
        const statusOrder = { completed: 1, pending: 2 }; 
        return statusOrder[a.status.toLowerCase()] - statusOrder[b.status.toLowerCase()];
      });
    }
    return choresToSort; //no valid criteria
  };

  const renderChores = () => { //list of chores
    const sortedChores = sortChores([...chores]);
    return sortedChores.map(chore => (
      <Col key={chore.id} sm={12} md={6} lg={4}>
        <ChoreCard 
          chore={chore} 
          onCompleteChore={handleCompleteChore} 
          onDeleteChore={handleDeleteChore} 
          onUpdateChore={handleUpdateChore}
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
          <div className="text-center mb-4">
            <Dropdown>
              <Dropdown.Toggle variant="success" id="dropdown-basic">
                Sort By: {sortBy === "priority" ? "Priority" : sortBy === "date" ? "Due Date" : "Status"}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => setSortBy("priority")}>Priority</Dropdown.Item>
                <Dropdown.Item onClick={() => setSortBy("date")}>Due Date (Most Upcoming to Least)</Dropdown.Item>
                <Dropdown.Item onClick={() => setSortBy("status")}>Status</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>

            <Row>
              {renderChores()}
            </Row>
          </div>
        )}
      </Container>
    </>
  );
}

function ChoreCard({ chore, onCompleteChore, onDeleteChore, onUpdateChore }) {
  const { chorename, choredescription, assignedto, duedate, status, priority, points } = chore;

  const handleCompleteChore = () => {
    onCompleteChore(chore.id, points);
  };

  const choreDueDate = new Date(duedate);
  const today = new Date();
  const isDueToday = choreDueDate.toDateString() === today.toDateString();

  const chorePriority = priority || "medium"; //default medium

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
      border: isDueToday ? "7px solid red" : "3px solid black", 
      borderRadius: "20px",
      backgroundColor: isDueToday ? "coral": status.toLowerCase() === "completed" ? "#d4edda" : "#EFE0CD",
    }}>
      <Card.Body>
        <Card.Title>{chorename}</Card.Title>
        <Card.Text>
          <strong>Description:</strong> {choredescription} <br />
          <strong>Assigned To:</strong> {assignedto} <br />
          <strong>Due Date:</strong> {formatDate(duedate)} <br />
          <strong>Status:</strong> {status} <br />
          <strong>Priority:</strong> <Badge pill bg={priorityColor}>{chorePriority.charAt(0).toUpperCase() + chorePriority.slice(1)}</Badge> <br />
          <strong>Points:</strong> <Badge pill bg="dark">{points}</Badge> 
        </Card.Text>
        {status.toLowerCase() !== "completed" && (
          <>
            <Button className="my-3" variant="success" onClick={handleCompleteChore}>Mark as Completed</Button> <br />
            <Button variant="primary" onClick={() => onUpdateChore(chore.id)} style={{ marginLeft: "0px" }}>Update</Button>
            <Button variant="danger" onClick={() => onDeleteChore(chore.id)} style={{ marginLeft: "10px" }}>Delete</Button>
          </>
        )}
      </Card.Body>
    </Card>
  );
}
