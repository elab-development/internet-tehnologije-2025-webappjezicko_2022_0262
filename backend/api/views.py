from django.shortcuts import render
from users.models import *
from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import *
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from .permissions import IsAdminUser
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from django.shortcuts import get_object_or_404
from django.db.models import Sum
from rest_framework import serializers
from users.services.answer_service import check_answer
from users.services.xp_service import calculate_lesson_xp
from rest_framework import status

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

class LessonUserView(generics.RetrieveAPIView):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = [IsAuthenticated]

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
    

class TaskListView(generics.ListAPIView):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        lesson_id = self.kwargs["pk"]
        return Task.objects.filter(lesson=lesson_id)
    


class TaskListCreateView(generics.ListCreateAPIView):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get_queryset(self):
        lesson_id = self.kwargs["pk"]
        return Task.objects.filter(lesson=lesson_id)
    
    def perform_create(self, serializer):
        lesson_id = self.kwargs["pk"]
        lesson = Lesson.objects.get(id=lesson_id)

        # Trenutni broj taskova
        task_count = Task.objects.filter(lesson=lesson).count()

        if task_count >= lesson.exercise_num:
            raise serializers.ValidationError(
                "Cannot add more tasks than lesson.exercise_num"
            )

        # XP validacija
        new_xp = serializer.validated_data.get("xp_amount", 0)

        current_xp = Task.objects.filter(
            lesson=lesson
        ).aggregate(total=Sum("xp_amount"))["total"] or 0

        if current_xp + new_xp > lesson.total_XP:
            raise serializers.ValidationError(
                "Total XP of tasks cannot exceed lesson.total_XP"
            )
        last_task = Task.objects.filter(
            lesson=lesson
        ).order_by("-sequence_number").first()

        next_sequence = 1 if not last_task else last_task.sequence_number + 1

        serializer.save(
            lesson=lesson,
            sequence_number=next_sequence
        )

class TaskUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get_queryset(self):
        lesson_id = self.kwargs["lesson_pk"]
        return Task.objects.filter(lesson=lesson_id)

    def perform_update(self, serializer):
        task = self.get_object()
        lesson = task.lesson

        new_xp = serializer.validated_data.get("xp_amount", task.xp_amount)

        other_tasks_xp = Task.objects.filter(
            lesson=lesson
        ).exclude(id=task.id).aggregate(
            total=Sum("xp_amount")
        )["total"] or 0

        if other_tasks_xp + new_xp > lesson.total_XP:
            raise serializers.ValidationError(
                "Total XP of tasks cannot exceed lesson.total_XP"
            )

        serializer.save()
    
class TaskTypeListView(generics.ListAPIView):
    queryset = TaskType.objects.all()
    serializer_class = TaskTypeSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

class TaskCorrectAnswerView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        task_id = self.kwargs["task_id"] 
        answer = Answer.objects.get(task_id=task_id)
        serializer = AnswerSerializer(answer)
        return Response(serializer.data)
    

class TaskAnswersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        task_id = self.kwargs["task_id"]  
        answers = Answer.objects.filter(task_id=task_id)
        serializer = AnswerSerializer(answers, many=True)
        return Response(serializer.data)
    
class DeleteAnswerView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def delete(self, request, answer_id):
        try:
            answer = Answer.objects.get(id=answer_id)
            answer.delete()
            return Response({"status": "deleted"})
        except Answer.DoesNotExist:
            return Response(status=404)


class AddAnswersView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]  

    def post(self, request, task_id):

        try:
            task = Task.objects.get(id=task_id)
        except Task.DoesNotExist:
            return Response(
                {"error": "Task ne postoji"},
                status=status.HTTP_404_NOT_FOUND
            )

        answers = request.data.get("answers", [])

        if not isinstance(answers, list):
            return Response(
                {"error": "Answers mora biti lista"},
                status=status.HTTP_400_BAD_REQUEST
            )

        created_answers = []

        for a in answers:
            answer = Answer.objects.create(
                task=task,
                text=a.get("text"),
                is_correct=a.get("is_correct", False),
                match_key=a.get("match_key"),
                match_value=a.get("match_value")
            )

            created_answers.append(answer.id)

        return Response({
            "status": "ok",
            "created_ids": created_answers
        }, status=status.HTTP_201_CREATED)


class SubmitAnswerView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, task_id):

        try:
            task = Task.objects.get(id=task_id)
        except Task.DoesNotExist:
            return Response({"error": "Task ne postoji"}, status=404)

        user_answer, created = UserAnswer.objects.get_or_create(
            user=request.user,
            task=task
        )

        task_type = task.task_type.name.lower()

        # MULTIPLE CHOICE
        if task_type == "multiple_choice":
            answer_id = request.data.get("answer_id")

            try:
                answer = Answer.objects.get(id=answer_id)
                user_answer.selected_answer = answer
            except Answer.DoesNotExist:
                return Response({"error": "Answer ne postoji"}, status=400)

        # TEXT
        elif task_type == "text":
            user_answer.text_answer = request.data.get("text")

        # MATCHING
        elif task_type == "matching":
            incoming_pairs = request.data.get("pairs")
            print("=== DJANGO RECEIVED MATCHING PAYLOAD ===")
            print("Received pairs:", incoming_pairs)
            user_answer.matching_answer = incoming_pairs

        else:
            return Response(
                {"error": "Nepoznat tip zadatka"},
                status=400
            )

        user_answer.is_correct = check_answer(task, user_answer)
        user_answer.save()

        return Response({
            "correct": user_answer.is_correct
        })


class FinishLessonView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, lesson_id):

        try:
            lesson = Lesson.objects.get(id=lesson_id)
        except Lesson.DoesNotExist:
            return Response(
                {"error": "Lesson ne postoji"},
                status=404
            )

        xp = calculate_lesson_xp(request.user, lesson)

        return Response({
            "xp": xp
        })
