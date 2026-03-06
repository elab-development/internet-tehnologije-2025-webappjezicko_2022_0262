from users.models import *
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "name", "surname", "email", "password","user_name","birth_date", "user_type"]
        extra_kwargs = {"password":{"write_only": True}}

    def create(self, validated_data):
        user_type = validated_data.get('user_type')
        user = User.objects.create_user(**validated_data)

        if user_type == 'regular':
            RegularUser.objects.create(user = user)
        elif user_type == 'premium':
            PremiumUser.objects.create(user = user)

        return user
    
class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'email'

    def validate(self, attrs):
        data = super().validate(attrs)

        data["user_type"] = self.user.user_type

        return data
    

class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = ["id", "lesson_name", "exercise_num", "date_created", "total_XP"]

class LessonEnrollmentSerializer(serializers.ModelSerializer):
    lesson_name = serializers.CharField(source="lesson.lesson_name")
    lesson_id = serializers.IntegerField(source="lesson.id")
    earned_XP = serializers.FloatField()
    
    class Meta:
        model = LessonEnrollement
        fields = ["id", "lesson_name", "earned_XP", "lesson_id"] 

class CreateEnrollmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = LessonEnrollement
        fields = ["id", "lesson", "status", "start_date"]
        read_only_fields = ["status", "start_date"]

class TaskSerializer(serializers.ModelSerializer):
    task_type_name = serializers.CharField(source="task_type.name", read_only=True)

    class Meta:
        model = Task
        fields = ["id","sequence_number","task_description","xp_amount","audio","task_type","task_type_name"]

class TaskTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskType
        fields = ["id", "name", "description"]

class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = ["id", "text", "is_correct", "match_key", "match_value"]

# class TaskSerializer(serializers.ModelSerializer):
#     task_type_name = serializers.CharField(source="task_type.name", read_only=True)

#     class Meta:
#         model = Task

#         fields = [
#             "id", 
#             "sequence_number", 
#             "task_description", 
#             "xp_amount", 
#             "audio", 
#             "task_type", 
#             "task_type_name"
#         ]        