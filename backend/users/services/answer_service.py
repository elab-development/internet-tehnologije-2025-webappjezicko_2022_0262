def check_answer(task, user_answer):

    task_type = task.task_type.name.lower()

    if task_type == "multiple_choice":
        return user_answer.selected_answer.is_correct

    elif task_type == "text":
        correct = task.answers.filter(is_correct=True).first()
        return (
            correct.text.lower().strip()
            == user_answer.text_answer.lower().strip()
        )

    elif task_type == "matching":
        correct_pairs = task.answers.all()

        correct_dict = {
            a.match_key: a.match_value
            for a in correct_pairs
            if a.match_key and a.match_value
        }

        submitted_pairs = user_answer.matching_answer

        if not isinstance(submitted_pairs, list):
            return False

        submitted_dict = {
            pair.get("key"): pair.get("value")
            for pair in submitted_pairs
            if isinstance(pair, dict)
        }

        return correct_dict == submitted_dict

    return False