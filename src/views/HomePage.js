import { useEffect, useState } from "react";
import { Container, Row, Card, Badge, Button, ProgressBar } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { collection, getDocs, updateDoc, doc, getDoc, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";
import Navigation from "./navibar";
import { Timestamp } from "firebase/firestore";

function formatDate(timestamp) {
  if (timestamp instanceof Timestamp) {
    return new Date(timestamp.seconds * 1000).toLocaleDateString();
  }
  return timestamp;
}

export default function ChorePageHome() {
  const [chores, setChores] = useState([]);
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const [userPoints, setUserPoints] = useState(0);
  const [displayUsername, setDisplayUsername] = useState("");

  async function getAllChores() {
    const query = await getDocs(collection(db, "chores"));
    const chores = query.docs.map((doc) => {
      return { id: doc.id, ...doc.data() };
    });
    setChores(chores);
  }

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

  const calculatePoints = () => {
    const totalPoints = chores.reduce((acc, chore) => {
      if (chore.status.toLowerCase() === "completed") {
        return acc + chore.points;
      }
      return acc;
    }, 0);
    setUserPoints(totalPoints);
  };

  const calculateCompletionPercentage = () => {
    const totalChores = chores.length;
    const completedChores = chores.filter(chore => chore.status.toLowerCase() === "completed").length;
    return totalChores > 0 ? (completedChores / totalChores) * 100 : 0;
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else {
      getAllChores();
      fetchUserData();
    }
  }, [user, navigate]);

  useEffect(() => {
    calculatePoints();
  }, [chores]);

  const ChoresRow = () => {
    return chores.map((chore) => (
      <ChoreCard key={chore.id} chore={chore} onUpdatePoints={calculatePoints} onRefreshChores={getAllChores} />
    ));
  };

  const completionPercentage = calculateCompletionPercentage();

  return (
    <>
      <Navigation />
      <Container style={{
        backgroundColor: "#f0f8ff",
        minHeight: "100vh",
        padding: "20px",
      }}>
        <h1 className="text-center mb-4">Aashley's Chore Hub</h1>
        <h2 className="text-center mb-4">{`Welcome ${displayUsername || "User"}`}</h2>

        <div className="text-center" style={{ marginBottom: "20px" }}>
          <Button 
            variant="primary" 
            style={{ margin: "5px" }} 
            as={Link} 
            to="/addchore"
          >
            Add New Chore
          </Button>
          <Button 
            variant="info" 
            style={{ margin: "5px" }} 
            as={Link} 
            to="/yourchores"
          >
            View Your Chores
          </Button>
          <Button 
            variant="dark" 
            style={{ margin: "5px" }} 
            as={Link} 
            to="/scoreboard"
          >
            View Scoreboard
          </Button>
        </div>

        <Row>
          <ChoresRow />
        </Row>

        <h4 className="text-center mb-2">Chore Completion Progress</h4>
        <ProgressBar now={completionPercentage} label={`${completionPercentage.toFixed(0)}%`} />
        <div className="text-center mb-4">
          <p>{`${chores.filter(chore => chore.status.toLowerCase() === "completed").length} out of ${chores.length} chores completed`}</p>
        </div>
      </Container>
    </>
  );
}

function ChoreCard({ chore, onUpdatePoints, onRefreshChores }) {
  const { chorename, choredescription, assignedto, duedate, status, priority, points } = chore;

  const handleCompleteChore = async () => {
    const choreRef = doc(db, "chores", chore.id);
    await updateDoc(choreRef, { status: "Completed" });
    
    // Update user points based on display name
    await updateUserPoints(assignedto, points); // Use assignedto (display name)

    onUpdatePoints(); 
    await onRefreshChores();
  };

  const updateUserPoints = async (displayUsername, points) => {
    // Get the user document based on display name
    const userQuery = query(collection(db, "users"), where("displayUsername", "==", displayUsername));
    const userDocs = await getDocs(userQuery);

    if (!userDocs.empty) {
      const userDoc = userDocs.docs[0]; // Get the first matching user
      const userRef = doc(db, "users", userDoc.id);
      const userData = await getDoc(userRef);
      
      if (userData.exists()) {
        const currentPoints = userData.data().points || 0;
        await updateDoc(userRef, {
          points: currentPoints + points // Update points
        });
      }
    } else {
      console.error("No user found with the display name:", displayUsername);
    }
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
          <strong>Due Date:</strong> {formatDate(duedate)} <br />
          <strong>Status:</strong> {status.toLowerCase() === "completed" ? "Completed" : "Pending"} <br />
          <strong>Priority:</strong> <Badge pill bg={priorityColor}>{chorePriority.charAt(0).toUpperCase() + chorePriority.slice(1)}</Badge> <br />
          <strong>Points:</strong> <Badge pill bg="dark">{points}</Badge> 
        </Card.Text>
        {status.toLowerCase() !== "completed" && (
          <Button variant="success" onClick={handleCompleteChore}>Mark as Completed</Button>
        )}
      </Card.Body>
    </Card>
  );
}
