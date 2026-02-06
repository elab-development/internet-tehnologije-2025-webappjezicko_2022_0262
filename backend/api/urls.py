from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenObtainPairView

urlpatterns = [
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("adminpanel/lessons/", views.LessonListCreateView.as_view(), name="lesson-list"),
    path("adminpanel/lessons/<int:pk>/", views.LessonDetailView.as_view(), name="lesson-detail"),
    path("api/user/my-lessons/", views.LessonEnrollmentView.as_view(), name="my-lessons"),
    path("api/user/lessons/", views.LessonListView.as_view(), name="available-lessons"),
    path("api/user/new-enrollement/", views.EnrollLessonView.as_view(), name="new-enrollment")
]