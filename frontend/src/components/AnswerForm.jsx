import MultipleChoiceForm from "./MultipleChoiceForm";
import TextAnswerForm from "./TextAnswerForm";
import MatchingForm from "./MatchingForm";

function AnswerForm({ taskType, taskId }) {

    if (taskType === "multiple_choice") {
        return <MultipleChoiceForm taskId={taskId} />
    }

    if (taskType === "text") {
        return <TextAnswerForm taskId={taskId} />
    }

    if (taskType === "matching") {
        return <MatchingForm taskId={taskId} />
    }

    return <div>Nepoznat tip zadatka</div>
}

export default AnswerForm;