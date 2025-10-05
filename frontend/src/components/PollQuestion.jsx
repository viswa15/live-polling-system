import { Button } from "./ui/button"; // Assuming 'ui' is a subfolder
import { Card } from "./ui/card";

const PollQuestion = ({ poll, onAnswer }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2 text-foreground">
          Answer the Question
        </h2>
        <p className="text-lg text-foreground mb-6">{poll.question}</p>
      </div>

      <div className="grid gap-3">
        {poll.options.map((option, index) => (
          <Card
            key={index}
            className="p-4 hover:shadow-lg transition-all cursor-pointer hover:scale-[1.02] border-2 hover:border-primary"
            onClick={() => onAnswer(index)}
          >
            <Button
              variant="ghost"
              className="w-full justify-start text-left h-auto py-3 px-4 text-base"
              onClick={(e) => {
                e.preventDefault();
                onAnswer(index);
              }}
            >
              <span className="font-semibold text-primary mr-3">
                {String.fromCharCode(65 + index)}.
              </span>
              {option.text || option}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PollQuestion;