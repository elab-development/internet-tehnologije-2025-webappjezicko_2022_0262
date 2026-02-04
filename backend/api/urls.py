from django.urls import path
from . import views
urlpatterns = [
    path("adminpanel/lessons/", views.LessonListCreateView.as_view(), name="lesson-list"),
    path("adminpanel/lessons/<int:pk>/", views.LessonDetailView.as_view(), name="lesson-detail"),
    path("my-lessons/", views.LessonEnrollmentView.as_view(), name="my-lessons")
]