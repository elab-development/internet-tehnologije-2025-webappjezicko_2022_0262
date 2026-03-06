from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenObtainPairView

urlpatterns = [
    path("user/me/", views.CurrentUserView.as_view(), name="current-user"),
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"), #Ovo je bezveze duplirano ne znam zasto je uopste pravljeno. ??
    path("adminpanel/lessons/", views.LessonListCreateView.as_view(), name="lesson-list"),
    path("adminpanel/task-types/", views.TaskTypeListView.as_view(), name="task-types"),
    path("adminpanel/lessons/<int:pk>/", views.LessonDetailView.as_view(), name="lesson-detail"),
    path("adminpanel/lessons/<int:pk>/tasks", views.TaskListCreateView.as_view(), name="lesson-tasks"),
    path("tasks/<int:task_id>/answers/", views.TaskAnswersView.as_view()),
    path("answers/<int:answer_id>/delete/", views.DeleteAnswerView.as_view()),
    path("tasks/<int:task_id>/answers/add/", views.AddAnswersView.as_view()),
    path("tasks/<int:task_id>/submit/", views.SubmitAnswerView.as_view(), name="submit-answer"),
    path("lessons/<int:lesson_id>/finish/", views.FinishLessonView.as_view(), name="finish-lesson"),
    path("adminpanel/lessons/<int:lesson_pk>/tasks/<int:pk>/change", views.TaskUpdateDeleteView.as_view(), name="lesson-task-change"),
    path("user/my-lessons/", views.LessonEnrollmentView.as_view(), name="my-lessons"),
    path("user/lesson/<int:pk>/", views.LessonUserView.as_view(), name="user-lesson"),
    path("user/lesson/<int:pk>/tasks/", views.TaskListView.as_view(), name="user-lesson-tasks"),
    path("user/lessons/", views.LessonListView.as_view(), name="available-lessons"),
    path("user/new-enrollement/", views.EnrollLessonView.as_view(), name="new-enrollment")
]