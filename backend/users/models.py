from django.db import models
from datetime import date 
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.core.exceptions import ValidationError

class CustomUserManager(BaseUserManager):
    
    def create_superuser(self, name, surname, birth_date, email, user_name, user_type, password, **other_fields):
        
        other_fields.setdefault('is_staff',  True)
        other_fields.setdefault('is_superuser', True)
        other_fields.setdefault('is_active', True)

        if other_fields.get('is_staff') is not True:
            raise ValueError('Superuser mora da ima postavljeno is_staff=True')
        if other_fields.get('is_superuser') is not True:
            raise ValueError('Superuser mora da ima postavljeno is_superuser=True')

        return self.create_user(name, surname, birth_date, email, user_name, user_type, password, **other_fields)

    def create_user(self, name, surname, birth_date, email, user_name, user_type, password, **other_fields):
        
        if not email:
            raise ValueError('Morate uneti email adresu')
        if not user_name:
            raise ValueError('Morate uneti korisnicko ime')
        email = self.normalize_email(email)
        user = self.model(email=email, name=name, surname=surname, birth_date=birth_date, user_name=user_name, user_type=user_type,**other_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

class User(AbstractBaseUser, PermissionsMixin):
    USER_TYPE_CHOICES = (
        ('regular', 'Regular User'),
        ('premium', 'Premium User'),
        ('admin', 'Admin User'),
    )

    name = models.CharField(max_length=150)
    surname = models.CharField(max_length=150)
    birth_date = models.DateField(default=date.today)
    email = models.EmailField(max_length=150, unique=True)
    user_name = models.CharField(max_length=150, unique=True)
    user_type = models.CharField(max_length=10, choices=USER_TYPE_CHOICES)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['user_name', 'name', 'surname', 'birth_date', 'user_type']

    def __str__(self):
        return self.user_name
    
    def save(self, *args, **kwargs):
        
        if self.user_type not in dict(self.USER_TYPE_CHOICES):
            raise ValidationError('Nevazeci tip korisnika')
        super().save(*args, **kwargs)

class RegularUser(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
    daily_limit = models.IntegerField(default=10)

    def __str__(self):
        return f"Regular user: {self.user.user_name}"

class PremiumUser(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
    subscription_fee = models.FloatField(default=20)

    def __str__(self):
        return f"Premium user: {self.user.user_name}"

class AdminUser(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
    description = models.TextField(max_length=355)

    def __str__(self):
        return f"Admin user: {self.user.user_name}"