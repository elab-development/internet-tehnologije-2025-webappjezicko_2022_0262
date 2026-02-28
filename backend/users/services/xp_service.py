from django.db.models import Sum
from users.models import Task, LessonEnrollement

def calculate_lesson_xp(user, lesson):

    xp = Task.objects.filter(
        lesson=lesson,
        useranswer__user=user,
        useranswer__is_correct=True
    ).aggregate(
        total=Sum("xp_amount")
    )["total"] or 0

    enrollment = LessonEnrollement.objects.get(
        user=user,
        lesson=lesson
    )

    enrollment.earned_XP = xp
    enrollment.status = "completed"
    enrollment.save()

    return xp