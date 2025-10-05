import { useState, useEffect } from "react";
import { socket, connectSocket } from "../lib/socket";
import { EVENTS } from "../lib/constants";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useToast } from "../hooks/use-toast";
import { ArrowLeft, Send, BarChart3, History, Users, UserX } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PollResults from "../components/PollResults";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";

const Teacher = () => {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctOptionIndex, setCorrectOptionIndex] = useState(null);
  const [poll, setPoll] = useState(null);
  const [results, setResults] = useState(null);
  const [isPollActive, setIsPollActive] = useState(false);
  const [pollHistory, setPollHistory] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
  const [openParticipantsDialog, setOpenParticipantsDialog] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    connectSocket();
    socket.emit(EVENTS.USER_JOIN, { name: "Teacher", role: "teacher" });

    // Central listener setup
    socket.on(EVENTS.POLL_QUESTION, (activePoll) => {
      setPoll(activePoll);
      setResults(null);
      setIsPollActive(true);
    });
    socket.on(EVENTS.POLL_RESULTS, (pollResults) => {
      setResults(pollResults);
      setIsPollActive(false);
      setPoll({ question: pollResults.question, options: pollResults.options });
    });
    socket.on(EVENTS.POLL_HISTORY, (history) => setPollHistory(history));
    socket.on(EVENTS.PARTICIPANTS_LIST, (list) => setParticipants(list));
    socket.on(EVENTS.USER_KICKED_SUCCESS, (data) => toast({ title: "Success", description: data.message }));
    socket.on(EVENTS.ERROR, (error) => toast({ title: "Error", description: error.message, variant: "destructive" }));

    return () => {
      socket.off(EVENTS.POLL_QUESTION);
      socket.off(EVENTS.POLL_RESULTS);
      socket.off(EVENTS.POLL_HISTORY);
      socket.off(EVENTS.PARTICIPANTS_LIST);
      socket.off(EVENTS.USER_KICKED_SUCCESS);
      socket.off(EVENTS.ERROR);
    };
  }, [toast]);

  const handleCreatePoll = () => {
    const validOptions = options.filter((opt) => opt.trim() !== "");
    if (!question.trim() || validOptions.length < 2 || correctOptionIndex === null) {
      toast({ title: "Error", description: "Please fill the question, at least two options, and select a correct answer.", variant: "destructive" });
      return;
    }
    socket.emit(EVENTS.TEACHER_ASK_QUESTION, { question, options: validOptions, correctOptionIndex });
    setQuestion("");
    setOptions(["", "", "", ""]);
    setCorrectOptionIndex(null);
    toast({ title: "Success", description: "Poll created successfully!" });
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleGetPollHistory = () => {
    socket.emit(EVENTS.POLL_GET_HISTORY);
    setOpenHistoryDialog(true);
  };

  const handleGetParticipants = () => {
    socket.emit(EVENTS.PARTICIPANTS_GET);
    setOpenParticipantsDialog(true);
  };

  const handleKickUser = (socketId) => {
    socket.emit(EVENTS.USER_KICK, { socketId });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => navigate("/")} className="gap-2"> <ArrowLeft className="w-4 h-4" /> Back </Button>
          <h1 className="text-4xl font-bold text-foreground">Teacher Dashboard</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleGetPollHistory} className="gap-2"> <History className="w-4 h-4" /> History </Button>
            <Button variant="outline" onClick={handleGetParticipants} className="gap-2"> <Users className="w-4 h-4" /> Participants </Button>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6"> <Send className="w-5 h-5 text-primary" /> <h2 className="text-2xl font-bold text-foreground">Create Poll</h2> </div>
            {isPollActive && <div className="mb-4 p-3 bg-muted rounded-lg text-sm text-muted-foreground"> A poll is currently active. Please wait for it to end. </div>}
            <div className="space-y-4">
              <div> <Label htmlFor="question">Question</Label> <Input id="question" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Enter your question" className="mt-1" disabled={isPollActive} /> </div>
              {options.map((option, index) => (
                <div key={index}>
                  <Label htmlFor={`option-${index}`}>Option {index + 1}</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input id={`option-${index}`} value={option} onChange={(e) => handleOptionChange(index, e.target.value)} placeholder={`Enter option ${index + 1}`} className="flex-grow" disabled={isPollActive} />
                    <input type="radio" name="correctOption" id={`radio-${index}`} checked={correctOptionIndex === index} onChange={() => setCorrectOptionIndex(index)} className="h-4 w-4" disabled={isPollActive} />
                  </div>
                </div>
              ))}
              <Button onClick={handleCreatePoll} disabled={isPollActive} className="w-full mt-4"> Create Poll </Button>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6"> <BarChart3 className="w-5 h-5 text-secondary" /> <h2 className="text-2xl font-bold text-foreground">Live Results</h2> </div>
            {poll ? ( <div> <h3 className="text-lg font-semibold mb-4 text-foreground">{poll.question}</h3> {results ? <PollResults results={results} /> : <p className="text-muted-foreground text-center py-8">Waiting for responses...</p>} </div> ) : ( <p className="text-muted-foreground text-center py-8">No active poll. Create one to get started!</p> )}
          </Card>
        </div>
        <Dialog open={openHistoryDialog} onOpenChange={setOpenHistoryDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader> <DialogTitle className="flex items-center gap-2"> <History className="w-5 h-5 text-primary" /> Poll History </DialogTitle> </DialogHeader>
            {pollHistory.length > 0 ? ( <div className="space-y-4"> {pollHistory.map((pollItem) => ( <Card key={pollItem.id} className="p-4 bg-muted/30"> <div className="flex items-center justify-between mb-2"> <h3 className="font-semibold text-foreground">{pollItem.question}</h3> <span className="text-sm text-muted-foreground"> {new Date(pollItem.timestamp).toLocaleString()} </span> </div> <div className="text-sm text-muted-foreground mb-2"> Total Responses: {pollItem.totalSubmissions} </div> <PollResults results={pollItem} /> </Card> ))} </div> ) : ( <p className="text-muted-foreground text-center py-8">No poll history available.</p> )}
          </DialogContent>
        </Dialog>
        <Dialog open={openParticipantsDialog} onOpenChange={setOpenParticipantsDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader> <DialogTitle className="flex items-center gap-2"> <Users className="w-5 h-5 text-primary" /> Participants </DialogTitle> </DialogHeader>
            {participants.length > 0 ? ( <div className="space-y-2"> {participants.map((p) => ( <div key={p.socketId} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"> <div className="flex items-center gap-2"> <span className="font-medium text-foreground">{p.name}</span> {p.role === 'teacher' && <span className="text-xs font-bold text-primary">(Host)</span>} </div> {p.role === 'student' && ( <Button variant="destructive" size="sm" onClick={() => handleKickUser(p.socketId)} className="gap-1"> <UserX className="w-3 h-3" /> Kick </Button> )} </div> ))} </div> ) : ( <p className="text-muted-foreground text-center py-8">No participants found.</p> )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Teacher;