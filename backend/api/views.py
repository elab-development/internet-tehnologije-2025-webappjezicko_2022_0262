from django.shortcuts import render
from users.models import User, Lesson, LessonEnrollement
from rest_framework import generics
from .serializers import UserSerializer, EmailTokenObtainPairSerializer,  LessonSerializer, LessonEnrollmentSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView



class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

class EmailTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer

class LessonListCreateView(generics.ListCreateAPIView):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = [AllowAny]
    
class LessonDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = [AllowAny]

class LessonEnrollmentView(generics.ListAPIView):
    serializer_class = LessonEnrollmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return LessonEnrollement.objects.filter(user=self.request.user)
    