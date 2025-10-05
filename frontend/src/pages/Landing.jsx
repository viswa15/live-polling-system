import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { GraduationCap, Users } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl font-bold text-foreground mb-4">
            Live Polling System
          </h1>
          <p className="text-xl text-muted-foreground">
            Real-time interactive polling for teachers and students
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* UPDATED: This card now navigates to /login */}
          <Card 
            className="p-8 hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer border-2 hover:border-primary"
            onClick={() => navigate("/login")}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-primary/10 rounded-full">
                <GraduationCap className="w-16 h-16 text-primary" />
              </div>
              <h2 className="text-3xl font-bold text-foreground">Teacher</h2>
              <p className="text-muted-foreground">
                Create polls, ask questions, and view live results
              </p>
              <Button 
                size="lg" 
                className="w-full mt-4"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/login");
                }}
              >
                Continue as Teacher
              </Button>
            </div>
          </Card>

          {/* This card remains the same */}
          <Card 
            className="p-8 hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer border-2 hover:border-secondary"
            onClick={() => navigate("/student")}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-secondary/10 rounded-full">
                <Users className="w-16 h-16 text-secondary" />
              </div>
              <h2 className="text-3xl font-bold text-foreground">Student</h2>
              <p className="text-muted-foreground">
                Join the poll, answer questions, and see results
              </p>
              <Button 
                size="lg" 
                variant="secondary"
                className="w-full mt-4"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/student");
                }}
              >
                Continue as Student
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Landing;