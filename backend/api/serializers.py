from users.models import User, RegularUser, PremiumUser
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