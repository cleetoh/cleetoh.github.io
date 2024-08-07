import React, { useState } from "react";
import { Container, Form, Button } from "react-bootstrap";
import { useAuthState } from "react-firebase-hooks/auth";
import { db } from "../firebase"; 
import { auth } from "../firebase"; 
import { collection, addDoc } from "firebase/firestore"; 
import { useNavigate } from "react-router-dom"; 
import Navigation from "./navibar";

export default function AddChorePage() {
  const [chorename, setChorename] = useState("");
  const [choredescription, setChoreDescription] = useState("");
  const [assignedto, setAssignedTo] = useState("");
  const [duedate, setDueDate] = useState("");
  const [status, setStatus] = useState("Pending");
  const [priority, setPriority] = useState("Medium");
  const [points, setPoints] = useState(0); 
  const [error, setError] = useState("");

  const [user] = useAuthState(auth); 
  const navigate = useNavigate(); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!chorename || !choredescription || !assignedto || !duedate || points <= 0) {
      setError("Please fill in all fields and assign a positive point value.");
    }

    try {
      await addDoc(collection(db, "chores"), {
        chorename,
        choredescription,
        assignedto,
        duedate,
        status,
        priority,
        points, 
        createdBy: user.email, 
      });

      navigate("/");
    } catch (error) {
      setError("Error adding chore: " + error.message);
    }
  };

  return (
    <>
    <Navigation />
    <Container style={{ backgroundColor: "#f0f8ff", minHeight: "100vh", padding: "20px" }}>
      <h1 className="mb-4">Add a New Chore</h1>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="formChoreName">
          <Form.Label>Chore Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter chore name"
            value={chorename}
            onChange={(e) => setChorename(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formChoreDescription">
          <Form.Label>Chore Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="Enter chore description"
            value={choredescription}
            onChange={(e) => setChoreDescription(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formAssignedTo">
          <Form.Label>Assigned To</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter the person assigned"
            value={assignedto}
            onChange={(e) => setAssignedTo(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formDueDate">
          <Form.Label>Due Date</Form.Label>
          <Form.Control
            type="date"
            placeholder="Enter due date"
            value={duedate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formStatus">
          <Form.Label>Status</Form.Label>
          <Form.Control
            as="select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            required
          >
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
          </Form.Control>
        </Form.Group>

        <Form.Group className="mb-3" controlId="formPriority">
          <Form.Label>Priority</Form.Label>
          <Form.Control
            as="select"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            required
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </Form.Control>
        </Form.Group>

        <Form.Group className="mb-3" controlId="formPoints">
          <Form.Label>Points</Form.Label>
          <Form.Control
            type="number"
            placeholder="Enter points for this chore"
            value={points}
            onChange={(e) => setPoints(Number(e.target.value))} 
            required
          />
        </Form.Group>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <Button variant="primary" type="submit">
          Add Chore
        </Button>
      </Form>
    </Container>
    </>
  );
}
