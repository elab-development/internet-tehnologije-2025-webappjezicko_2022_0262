from django.urls import path
from . import views

urlpatterns = [
    # view za registrovanje korisnika
    path('user/register/', views.CreateUserView.as_view(), name="register"),

    # view-ovi za login, logout i refresh
    path('token/', views.CookieObtainView.as_view(), name="get_token"),
    path("token/refresh/", views.CookieTokenRefreshView.as_view(), name="token_refresh"),
    path('logout/', views.LogoutView.as_view(), name="logout"),

    # view-ovi za vracanje trenutnog korisnika i lekcija koje pohadja
    path("user/me/", views.CurrentUserView.as_view(), name="current-user"),
    path("user/my-lessons/", views.LessonEnrollmentView.as_view(), name="my-lessons"),

    # view-ovi za vracanje dostupnih lekcija korisnika i biranje nove lekcije
    path("user/lessons/", views.LessonListView.as_view(), name="available-lessons"),
    path("user/new-enrollement/", views.EnrollLessonView.as_view(), name="new-enrollment"),
    
    # view-ovi za vracanje lekcije, task-ova lekcije i odgovora na taskove lekcije
    path("user/lesson/<int:pk>/", views.LessonUserView.as_view(), name="user-lesson"),
    path("user/lesson/<int:pk>/tasks/", views.TaskListView.as_view(), name="user-lesson-tasks"),
    path("user/lesson/task/<int:task_id>/answer/", views.TaskCorrectAnswerView.as_view(), name="task-answers"),

    # view-ovi za korisnikovo davanje odgovora i zavrsavanje lekcije 
    path("tasks/<int:task_id>/submit/", views.SubmitAnswerView.as_view(), name="submit-answer"),
    path("lessons/<int:lesson_id>/finish/", views.FinishLessonView.as_view(), name="finish-lesson"),

    #view-ovi za vracanje lekcija i taskova na adminpanel-u
    path("adminpanel/lessons/", views.LessonListCreateView.as_view(), name="lesson-list"),
    path("adminpanel/task-types/", views.TaskTypeListView.as_view(), name="task-types"),

    #view-ovi za vracanje specificne lekcije i njenih zadataka na adminpanel-u
    path("adminpanel/lessons/<int:pk>/", views.LessonDetailView.as_view(), name="lesson-detail"),
    path("adminpanel/lessons/<int:pk>/tasks", views.TaskListCreateView.as_view(), name="lesson-tasks"),

    # view za brisanje i menjanje task-a na adminpanel-u
    path("adminpanel/lessons/<int:lesson_pk>/tasks/<int:pk>/change", views.TaskUpdateDeleteView.as_view(), name="lesson-task-change"),    

    # view-ovi za vracanje odgovora task-a, brisanje i dodavanje odgovora na adminpanel-u
    path("tasks/<int:task_id>/answers/", views.TaskAnswersView.as_view()),
    path("answers/<int:answer_id>/delete", views.DeleteAnswerView.as_view()),
    path("tasks/<int:task_id>/answers/add/", views.AddAnswersView.as_view()),

    
    path("user/lessons/", views.LessonListView.as_view(), name="available-lessons"),
    path("user/new-enrollement/", views.EnrollLessonView.as_view(), name="new-enrollment"),
    path("user/analytics/enrollments/", views.EnrollmentAnalyticsView.as_view(), name="analytics-enrollments"),
]