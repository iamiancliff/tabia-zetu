// src/pages/Signup.jsx

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    school: "",
    county: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const testBackendConnection = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      console.log("🧪 Testing backend connection to:", apiUrl);
      
      const response = await fetch(`${apiUrl}/health`);
      const data = await response.json();
      console.log("✅ Backend connection successful:", data);
      alert("✅ Backend connection successful!");
    } catch (error) {
      console.error("❌ Backend connection failed:", error);
      alert("❌ Backend connection failed: " + error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match");
    }

    if (formData.password.length < 6) {
      return setError("Password must be at least 6 characters long");
    }

    setLoading(true);
    const { success, error: signupError } = await signup(formData);
    setLoading(false);

    if (!success) {
      return setError(signupError);
    }
    setError("");
    // Redirect to login after successful signup
    navigate("/login");
  };

  return (
    <div className="w-full max-w-md mx-auto mt-10 p-6 border rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-4">Sign Up</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <Button 
        type="button" 
        onClick={testBackendConnection} 
        className="w-full mb-4 bg-blue-500 hover:bg-blue-600"
      >
        Test Backend Connection
      </Button>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="password">Password *</Label>
          <Input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleInputChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="confirmPassword">Confirm Password *</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="school">School Name *</Label>
          <Input
            id="school"
            name="school"
            value={formData.school}
            onChange={handleInputChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="county">County *</Label>
          <Input
            id="county"
            name="county"
            value={formData.county}
            onChange={handleInputChange}
            required
          />
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Signing up..." : "Sign Up"}
        </Button>
      </form>
    </div>
  );
}
