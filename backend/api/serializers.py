from users.models import User, RegularUser, PremiumUser, Lesson, LessonEnrollement
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

#Mora da se doradi malo
class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = ["id", "lesson_name", "exercise_num", "date_created", "total_XP"]

class LessonEnrollmentSerializer(serializers.ModelSerializer):
    lesson_name = serializers.CharField(source="lesson.lesson_name")
    earned_XP = serializers.FloatField()
    
    class Meta:
        model = LessonEnrollement
        fields = ["lesson_name", "earned_XP"] 

class CreateEnrollmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = LessonEnrollement
        fields = ["id", "lesson", "status", "start_date"]
        read_only_fields = ["status", "start_date"]