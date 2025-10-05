import { useState, useEffect } from "react";
import { socket, connectSocket } from "../lib/socket";
import { EVENTS } from "../lib/constants";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useToast } from "../hooks/use-toast";
import { ArrowLeft, User, Clock, History } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PollQuestion from "../components/PollQuestion";
import PollResults from "../components/PollResults";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";

const Student = () => {
  const [studentName, setStudentName] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);
  const [currentPoll, setCurrentPoll] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [pollResults, setPollResults] = useState(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [pollHistory, setPollHistory] = useState([]);
  const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const savedName = sessionStorage.getItem("studentName");
    if (savedName) {
      setStudentName(savedName);
      setIsRegistered(true);
      connectSocket();
      socket.emit(EVENTS.USER_JOIN, { name: savedName, role: "student" });
    }
  }, []);

  useEffect(() => {
    if (!isRegistered) return;

    socket.on(EVENTS.POLL_QUESTION, (poll) => {
      setCurrentPoll(poll);
      setHasAnswered(false);
      setPollResults(null);
    });
    socket.on(EVENTS.POLL_RESULTS, (results) => {
      setPollResults(results);
      setHasAnswered(true);
    });
    socket.on(EVENTS.TIME_UPDATE, (time) => setTimeLeft(time));
    socket.on('student:answer_confirmed', () => setHasAnswered(true));
    socket.on(EVENTS.POLL_HISTORY, (history) => setPollHistory(history));
    socket.on(EVENTS.USER_KICKED, (data) => {
      toast({ title: "Removed", description: data.message, variant: "destructive" });
      setTimeout(() => navigate("/"), 2000);
    });

    return () => {
      socket.off(EVENTS.POLL_QUESTION);
      socket.off(EVENTS.POLL_RESULTS);
      socket.off(EVENTS.TIME_UPDATE);
      socket.off('student:answer_confirmed');
      socket.off(EVENTS.POLL_HISTORY);
      socket.off(EVENTS.USER_KICKED);
    };
  }, [isRegistered, navigate, toast]);

  const handleRegister = () => {
    if (!studentName.trim()) {
      toast({ title: "Error", description: "Please enter your name", variant: "destructive" });
      return;
    }
    sessionStorage.setItem("studentName", studentName);
    setIsRegistered(true);
    connectSocket();
    socket.emit(EVENTS.USER_JOIN, { name: studentName, role: "student" });
    toast({ title: "Welcome!", description: `Registered as ${studentName}` });
  };

  const handleAnswer = (optionIndex) => {
    if (!currentPoll || !currentPoll.options[optionIndex]) return;
    const optionId = currentPoll.options[optionIndex].id;
    socket.emit(EVENTS.STUDENT_SUBMIT_ANSWER, { optionId });
  };

  const handleGetPollHistory = () => {
    socket.emit(EVENTS.POLL_GET_HISTORY);
    setOpenHistoryDialog(true);
  };

  if (!isRegistered) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8">
          <div className="flex items-center justify-center mb-6"> <div className="p-4 bg-secondary/10 rounded-full"> <User className="w-12 h-12 text-secondary" /> </div> </div>
          <h2 className="text-3xl font-bold text-center mb-2 text-foreground"> Welcome Student! </h2>
          <p className="text-center text-muted-foreground mb-6"> Enter your name to join the poll </p>
          <div className="space-y-4">
            <div> <Label htmlFor="name">Your Name</Label> <Input id="name" value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="Enter your name" className="mt-1" onKeyPress={(e) => e.key === "Enter" && handleRegister()} /> </div>
            <Button onClick={handleRegister} className="w-full" size="lg"> Join Poll </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => navigate("/")} className="gap-2"> <ArrowLeft className="w-4 h-4" /> Back </Button>
          <div className="flex items-center gap-2"> <User className="w-5 h-5 text-secondary" /> <span className="font-semibold text-foreground">{studentName}</span> </div>
          <Button variant="outline" onClick={handleGetPollHistory} className="gap-2"> <History className="w-4 h-4" /> History </Button>
        </div>
        {currentPoll && !hasAnswered && <Card className="mb-4 p-4 bg-primary/10 border-primary"> <div className="flex items-center justify-center gap-2 text-primary"> <Clock className="w-5 h-5" /> <span className="font-bold text-lg"> Time Left: {timeLeft}s </span> </div> </Card>}
        <Card className="p-8">
          {pollResults ? ( <div> <h2 className="text-2xl font-bold mb-6 text-foreground"> Poll Results </h2> <h3 className="text-lg mb-4 text-foreground"> {pollResults.question} </h3> <PollResults results={pollResults} /> </div> ) : hasAnswered ? ( <div className="text-center py-12"> <p className="text-xl text-muted-foreground mb-2">Answer Submitted!</p> <p className="text-sm text-muted-foreground">Waiting for the results...</p> </div> ) : currentPoll ? ( <PollQuestion poll={currentPoll} onAnswer={handleAnswer} /> ) : ( <div className="text-center py-12"> <p className="text-xl text-muted-foreground mb-2">Waiting for the poll to start...</p> <p className="text-sm text-muted-foreground">Your teacher will create a poll soon</p> </div> )}
        </Card>
        <Dialog open={openHistoryDialog} onOpenChange={setOpenHistoryDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader> <DialogTitle className="flex items-center gap-2"> <History className="w-5 h-5 text-primary" /> Poll History </DialogTitle> </DialogHeader>
            {pollHistory.length > 0 ? ( <div className="space-y-4"> {pollHistory.map((pollItem) => ( <Card key={pollItem.id} className="p-4 bg-muted/30"> <div className="flex items-center justify-between mb-2"> <h3 className="font-semibold text-foreground">{pollItem.question}</h3> <span className="text-sm text-muted-foreground"> {new Date(pollItem.timestamp).toLocaleString()} </span> </div> <div className="text-sm text-muted-foreground mb-2"> Total Responses: {pollItem.totalSubmissions} </div> <PollResults results={pollItem} /> </Card> ))} </div> ) : ( <p className="text-muted-foreground text-center py-8">No poll history available.</p> )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Student;