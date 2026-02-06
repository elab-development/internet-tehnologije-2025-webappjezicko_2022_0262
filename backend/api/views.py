from django.shortcuts import render
from users.models import User, Lesson, LessonEnrollement
from rest_framework import generics, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import *
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from .permissions import IsAdminUser
from django.shortcuts import get_object_or_404

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
    