from django.shortcuts import render
from users.models import User, Lesson, LessonEnrollement
from rest_framework import generics, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import *
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from .permissions import IsAdminUser
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from django.shortcuts import get_object_or_404
from django.contrib.auth import authenticate

class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

class EmailTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer

class CookieObtainView(EmailTokenObtainPairView):

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)

        access = response.data.get("access")
        refresh = response.data.get("refresh")

        response.set_cookie(
            key="access",
            value=access,
            httponly=True,
            secure=False,
            samesite="Lax"
        )

        response.set_cookie(
            key="refresh",
            value=refresh,
            httponly=True,
            secure=False,
            samesite="Lax"
        )

        return response

class CookieTokenRefreshView(APIView):
    def post(self, request):
        refresh = request.COOKIES.get("refresh")

        if not refresh:
            return Response({"error": "No refresh token"}, status=401)

        try:
            refresh = RefreshToken(refresh)
            access = str(refresh.access_token)

            response = Response({"message": "Token refreshed"})

            response.set_cookie(
                key="access",
                value=access,
                httponly=True,
                secure=False,
                samesite="Lax"
            )

            return response

        except TokenError:
            return Response({"error": "Invalid refresh"}, status=401)

class LogoutView(APIView):
    def post(self, request):
        response = Response({"message": "Logged out"})

        response.delete_cookie("access")
        response.delete_cookie("refresh")

        return response

class LessonListView(generics.ListAPIView):
    serializer_class = LessonSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        enrolled_lessons = LessonEnrollement.objects.filter(
            user = user
        ).values_list("lesson_id", flat=True)

        return Lesson.objects.exclude(id__in=enrolled_lessons)

class EnrollLessonView(generics.CreateAPIView):
    serializer_class = CreateEnrollmentSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        lesson_id = request.data.get("id")

        if not lesson_id:
            return Response(
                {"error": "lesson_id is required"},
                status=400
            )

        lesson = get_object_or_404(Lesson, id=lesson_id)

        enrollment, created = LessonEnrollement.objects.get_or_create(
            user=request.user,
            lesson=lesson
        )

        if not created:
            return Response(
                {"error": "Already enrolled"},
                status=400
            )

        serializer = self.get_serializer(enrollment)
        return Response(serializer.data, status=201)

class LessonListCreateView(generics.ListCreateAPIView):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    
class LessonDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

class LessonEnrollmentView(generics.ListAPIView):
    serializer_class = LessonEnrollmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return LessonEnrollement.objects.filter(user=self.request.user)
    

class TaskListCreateView(generics.ListCreateAPIView):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get_queryset(self):
        lesson_id = self.kwargs["pk"]
        return Task.objects.filter(lesson=lesson_id)
    
    def perform_create(self, serializer):
        lesson_id = self.kwargs["pk"]
        lesson = Lesson.objects.get(id=lesson_id)
        serializer.save(lesson=lesson)

class TaskUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get_queryset(self):
        lesson_id = self.kwargs["lesson_pk"]
        return Task.objects.filter(lesson=lesson_id)
    
